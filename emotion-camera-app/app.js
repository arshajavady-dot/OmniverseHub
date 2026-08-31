import { EmotionDetector } from './emotion-detector.js?v=6.0';
import { ParticleSystem } from './particles.js?v=6.0';

// Global App State
let faceLandmarker = null;
let webcamVideo = null;
let canvas = null;
let ctx = null;
let particleCanvas = null;
let particleSystem = null;
let emotionDetector = new EmotionDetector();

let isCameraRunning = false;
let drawMeshEnabled = true;
let particlesEnabled = true;
let isMirrored = true;
let isSoundEnabled = false;

let frameCount = 0;
let fps = 0;
let lastFpsCheck = Date.now();
let lastTimestampMs = -1;

// Audio Synthesizer State
let audioCtx = null;
let soundOsc = null;
let soundGain = null;

// Snapshots storage
let snapshots = [];

// Emotion Meta Configs
const EMOTION_META = {
  happy: {
    emoji: '😊',
    label: 'Happy',
    themeClass: 'theme-happy',
    color: '#f59e0b',
    desc: 'Radiating joy and positive facial expressions!',
    audioFreq: 523.25
  },
  sad: {
    emoji: '😢',
    label: 'Sad',
    themeClass: 'theme-sad',
    color: '#3b82f6',
    desc: 'Showing gentle melancholic or somber mood.',
    audioFreq: 329.63
  },
  angry: {
    emoji: '😠',
    label: 'Angry',
    themeClass: 'theme-angry',
    color: '#ef4444',
    desc: 'High tension brow and strong intense expression.',
    audioFreq: 220.00
  },
  surprised: {
    emoji: '😮',
    label: 'Surprised',
    themeClass: 'theme-surprised',
    color: '#ec4899',
    desc: 'Awestruck! Open jaw and widened gaze.',
    audioFreq: 659.25
  },
  fearful: {
    emoji: '😨',
    label: 'Fearful',
    themeClass: 'theme-fearful',
    color: '#8b5cf6',
    desc: 'Heightened alertness and anxious tension.',
    audioFreq: 392.00
  },
  disgusted: {
    emoji: '🤢',
    label: 'Disgusted',
    themeClass: 'theme-disgusted',
    color: '#10b981',
    desc: 'Wrinkled nose and averse facial reaction.',
    audioFreq: 293.66
  },
  neutral: {
    emoji: '😐',
    label: 'Neutral',
    themeClass: 'theme-neutral',
    color: '#06b6d4',
    desc: 'Relaxed, calm, and balanced facial expression.',
    audioFreq: 440.00
  }
};

/**
 * Main Initialization Function
 */
async function init() {
  console.log("Initializing E-MOOD AI Application with local MediaPipe Vision...");

  if (window.location.protocol === 'file:') {
    console.warn("App opened via file:// protocol. Camera and modules require HTTP server at http://localhost:3000/");
    const warn = document.getElementById('file-protocol-warning');
    if (warn) warn.classList.remove('hidden');
    updateStatus("HTTP Server Required", "amber");
    return;
  }

  if (window.lucide) {
    window.lucide.createIcons();
  }

  webcamVideo = document.getElementById('webcam-video');
  canvas = document.getElementById('face-canvas');
  ctx = canvas.getContext('2d');

  particleCanvas = document.getElementById('particle-canvas');
  particleSystem = new ParticleSystem(particleCanvas);

  setupEventListeners();

  try {
    updateStatus("Loading AI Vision Engine...", "amber");

    // vision_bundle.js creates window.Vision
    const vision = window.Vision || window.tasksVision;
    if (!vision) {
      throw new Error("MediaPipe Vision library not found on window.Vision");
    }

    const { FaceLandmarker, FilesetResolver } = vision;

    const filesetResolver = await FilesetResolver.forVisionTasks("./");

    faceLandmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
      baseOptions: {
        modelAssetPath: "./face_landmarker.task",
        delegate: "CPU"
      },
      runningMode: "VIDEO",
      numFaces: 1,
      outputFaceBlendshapes: true,
      outputFacialTransformationMatrixes: true
    });

    console.log("MediaPipe FaceLandmarker successfully initialized!");
    updateStatus("AI Ready • Click Enable Webcam", "emerald");
    document.getElementById('camera-overlay').classList.remove('hidden');

    // Auto trigger webcam
    startWebcam();
  } catch (err) {
    console.error("Failed to load MediaPipe model:", err);
    updateStatus("AI Model Error: " + err.message, "red");
  }
}

/**
 * Setup Event Listeners
 */
function setupEventListeners() {
  const btnStartCam = document.getElementById('btn-start-cam');
  if (btnStartCam) {
    btnStartCam.addEventListener('click', startWebcam);
  }

  document.getElementById('btn-snapshot').addEventListener('click', takeSnapshot);

  document.getElementById('btn-mesh').addEventListener('click', () => {
    drawMeshEnabled = !drawMeshEnabled;
    const btn = document.getElementById('btn-mesh');
    btn.classList.toggle('bg-cyan-950/60', drawMeshEnabled);
    btn.classList.toggle('bg-slate-800/80', !drawMeshEnabled);
  });

  document.getElementById('chk-landmarks').addEventListener('change', (e) => {
    drawMeshEnabled = e.target.checked;
  });

  document.getElementById('chk-particles').addEventListener('change', (e) => {
    particlesEnabled = e.target.checked;
  });

  const selSensitivity = document.getElementById('sel-sensitivity');
  if (selSensitivity) {
    selSensitivity.addEventListener('change', (e) => {
      emotionDetector.setSensitivity(e.target.value);
    });
  }

  document.getElementById('btn-flip').addEventListener('click', () => {
    isMirrored = !isMirrored;
    webcamVideo.classList.toggle('-scale-x-100', isMirrored);
  });

  document.getElementById('btn-sound').addEventListener('click', toggleAudio);

  document.getElementById('modal-close').addEventListener('click', closeModal);
  document.getElementById('snapshot-modal').addEventListener('click', (e) => {
    if (e.target.id === 'snapshot-modal') closeModal();
  });
}

/**
 * Start Webcam Stream
 */
async function startWebcam() {
  try {
    updateStatus("Connecting Camera...", "amber");
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        facingMode: "user"
      },
      audio: false
    });

    webcamVideo.srcObject = stream;
    await webcamVideo.play();

    onWebcamReady();
  } catch (err) {
    console.error("Camera access denied or failed:", err);
    updateStatus("Camera Access Denied", "red");
    alert("Camera permission is required to detect emotions. Please click 'Enable Webcam' or check your browser address bar permissions.");
  }
}

/**
 * Callback when Webcam is ready
 */
function onWebcamReady() {
  const width = webcamVideo.videoWidth || 640;
  const height = webcamVideo.videoHeight || 480;

  canvas.width = width;
  canvas.height = height;
  particleSystem.resize(width, height);

  document.getElementById('camera-overlay').classList.add('hidden');
  document.getElementById('cam-status-dot').className = 'w-2 h-2 rounded-full bg-emerald-500 animate-pulse';
  document.getElementById('cam-status-text').textContent = 'CAMERA LIVE';

  updateStatus("AI Emotion Active", "emerald");

  isCameraRunning = true;
  requestAnimationFrame(processLoop);
}

/**
 * Main Render & Detection Animation Loop (60 FPS)
 */
async function processLoop() {
  if (!isCameraRunning) return;

  frameCount++;
  const now = Date.now();
  if (now - lastFpsCheck >= 1000) {
    fps = frameCount;
    frameCount = 0;
    lastFpsCheck = now;
    document.getElementById('fps-counter').textContent = fps;
  }

  // Draw base video frame
  ctx.save();
  if (isMirrored) {
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
  }
  ctx.drawImage(webcamVideo, 0, 0, canvas.width, canvas.height);
  ctx.restore();

  // Run AI Detection if video has active frames
  if (faceLandmarker && webcamVideo.readyState >= 2) {
    let startTimeMs = Math.round(performance.now());
    if (startTimeMs <= lastTimestampMs) {
      startTimeMs = lastTimestampMs + 1;
    }
    lastTimestampMs = startTimeMs;

    try {
      const results = faceLandmarker.detectForVideo(webcamVideo, startTimeMs);

      if (results && results.faceLandmarks && results.faceLandmarks.length > 0) {
        const landmarks = results.faceLandmarks[0];
        const blendshapes = results.faceBlendshapes && results.faceBlendshapes.length > 0
          ? results.faceBlendshapes[0].categories
          : [];

        const emotionData = emotionDetector.process(blendshapes, landmarks);

        if (drawMeshEnabled) {
          drawSciFiFaceMesh(landmarks, emotionData.dominant);
        }

        particleSystem.setEmotion(emotionData.dominant);
        updateDashboard(emotionData);
        updateStatus("AI Emotion Active", "emerald");

        if (isSoundEnabled) {
          updateAudioSynth(emotionData.dominant);
        }
      } else {
        // NO FACE DETECTED
        particleSystem.setEmotion('neutral');
        drawScanningReticle();
        updateNoFaceUI();
      }
    } catch (detectErr) {
      console.error("MediaPipe detectForVideo error:", detectErr);
      updateStatus("AI Detection Error: " + detectErr.message, "red");
    }
  }

  if (particlesEnabled) {
    particleSystem.updateAndDraw();
  }

  requestAnimationFrame(processLoop);
}

/**
 * Sci-Fi Cyberpunk Face Mesh Overlay Renderer
 */
function drawSciFiFaceMesh(landmarks, dominantEmotion) {
  const meta = EMOTION_META[dominantEmotion] || EMOTION_META.neutral;
  const strokeColor = meta.color;

  ctx.save();
  if (isMirrored) {
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
  }

  const w = canvas.width;
  const h = canvas.height;

  const drawContour = (indices, close = false) => {
    ctx.beginPath();
    for (let i = 0; i < indices.length; i++) {
      const pt = landmarks[indices[i]];
      const x = pt.x * w;
      const y = pt.y * h;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    if (close) ctx.closePath();
    ctx.stroke();
  };

  ctx.lineWidth = 1.5;
  ctx.strokeStyle = strokeColor;
  ctx.shadowColor = strokeColor;
  ctx.shadowBlur = 8;

  const lipsOuter = [61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291, 308, 324, 318, 402, 317, 14, 87, 178, 88, 95];
  drawContour(lipsOuter, true);

  const eyeLeft = [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246];
  const eyeRight = [362, 382, 381, 380, 374, 373, 390, 249, 263, 466, 388, 387, 386, 385, 384, 398];
  drawContour(eyeLeft, true);
  drawContour(eyeRight, true);

  const browLeft = [70, 63, 105, 66, 107];
  const browRight = [300, 293, 334, 296, 336];
  drawContour(browLeft, false);
  drawContour(browRight, false);

  const faceOval = [10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109];
  drawContour(faceOval, true);

  ctx.fillStyle = strokeColor;
  for (let i = 0; i < landmarks.length; i += 4) {
    const pt = landmarks[i];
    const x = pt.x * w;
    const y = pt.y * h;
    ctx.fillRect(x - 1, y - 1, 2, 2);
  }

  ctx.restore();
}

/**
 * Draw Futuristic Target Reticle when No Face is Detected
 */
function drawScanningReticle() {
  ctx.save();
  const w = canvas.width;
  const h = canvas.height;
  const cx = w / 2;
  const cy = h / 2;
  const boxSize = Math.min(w, h) * 0.45;

  ctx.strokeStyle = 'rgba(245, 158, 11, 0.6)';
  ctx.lineWidth = 2;
  ctx.shadowColor = '#f59e0b';
  ctx.shadowBlur = 10;

  const half = boxSize / 2;
  const len = 24;

  ctx.beginPath(); ctx.moveTo(cx - half, cy - half + len); ctx.lineTo(cx - half, cy - half); ctx.lineTo(cx - half + len, cy - half); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx + half - len, cy - half); ctx.lineTo(cx + half, cy - half); ctx.lineTo(cx + half, cy - half + len); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx - half, cy + half - len); ctx.lineTo(cx - half, cy + half); ctx.lineTo(cx - half + len, cy + half); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx + half - len, cy + half); ctx.lineTo(cx + half, cy + half); ctx.lineTo(cx + half, cy + half - len); ctx.stroke();

  ctx.fillStyle = '#f59e0b';
  ctx.font = 'bold 14px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('[ NO FACE DETECTED ]', cx, cy + half + 28);

  ctx.restore();
}

/**
 * Update UI when Face is Not Detected
 */
function updateNoFaceUI() {
  document.body.className = document.body.className.replace(/theme-\w+/g, '');
  document.body.classList.add('theme-neutral');

  document.getElementById('floating-emoji').textContent = '🔍';
  document.getElementById('floating-label').textContent = 'NO FACE';
  document.getElementById('floating-pct').textContent = '0%';

  document.getElementById('dominant-name').textContent = 'Face Not Detected';
  document.getElementById('dominant-emoji').textContent = '🔍';
  document.getElementById('dominant-desc').textContent = 'No face detected in camera view. Position your face clearly in front of the camera.';
  document.getElementById('dominant-confidence-pct').textContent = '0%';
  document.getElementById('dominant-bar').style.width = '0%';

  const meters = document.querySelectorAll('.emotion-meter');
  meters.forEach(meter => {
    meter.querySelector('.meter-pct').textContent = '0%';
    meter.querySelector('.meter-bar').style.width = '0%';
  });

  document.getElementById('metric-eyes').textContent = '--';
  document.getElementById('metric-smile').textContent = '--';
  document.getElementById('metric-brow').textContent = '--';

  updateStatus("Face Not Detected", "amber");
}

/**
 * Update UI Dashboard Components when Face IS Detected
 */
function updateDashboard({ scores, dominant, confidence, metrics }) {
  const meta = EMOTION_META[dominant] || EMOTION_META.neutral;
  const pct = Math.round(confidence * 100);

  document.body.className = document.body.className.replace(/theme-\w+/g, '');
  document.body.classList.add(meta.themeClass);

  document.getElementById('floating-emoji').textContent = meta.emoji;
  document.getElementById('floating-label').textContent = meta.label;
  document.getElementById('floating-pct').textContent = `${pct}%`;

  document.getElementById('dominant-name').textContent = meta.label;
  document.getElementById('dominant-emoji').textContent = meta.emoji;
  document.getElementById('dominant-desc').textContent = meta.desc;
  document.getElementById('dominant-confidence-pct').textContent = `${pct}%`;
  document.getElementById('dominant-bar').style.width = `${pct}%`;

  for (const [key, score] of Object.entries(scores)) {
    const meterEl = document.querySelector(`.emotion-meter[data-emotion="${key}"]`);
    if (meterEl) {
      const scorePct = Math.round(score * 100);
      meterEl.querySelector('.meter-pct').textContent = `${scorePct}%`;
      meterEl.querySelector('.meter-bar').style.width = `${scorePct}%`;
    }
  }

  if (metrics) {
    document.getElementById('metric-eyes').textContent = metrics.eyeOpenness;
    document.getElementById('metric-smile').textContent = metrics.smileRatio;
    document.getElementById('metric-brow').textContent = metrics.browTension;
  }

  renderHistoryLog();
}

/**
 * Render Mood History Log
 */
function renderHistoryLog() {
  const historyContainer = document.getElementById('history-container');
  const countEl = document.getElementById('history-count');
  const logs = emotionDetector.history;

  if (logs.length === 0) return;

  countEl.textContent = `${logs.length} entries`;

  historyContainer.innerHTML = logs.slice(-15).reverse().map(item => {
    const meta = EMOTION_META[item.dominant] || EMOTION_META.neutral;
    return `
      <div class="flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
        <span class="text-lg">${meta.emoji}</span>
        <div>
          <div class="font-bold text-slate-200">${meta.label}</div>
          <div class="text-[10px] font-mono text-slate-500">${item.time} • ${item.confidence}%</div>
        </div>
      </div>
    `;
  }).join('');
}

/**
 * Take Mood Snapshot
 */
function takeSnapshot() {
  const flash = document.getElementById('flash-overlay');
  flash.classList.add('flash-active');
  setTimeout(() => flash.classList.remove('flash-active'), 300);

  const snapCanvas = document.createElement('canvas');
  snapCanvas.width = canvas.width;
  snapCanvas.height = canvas.height;
  const sCtx = snapCanvas.getContext('2d');

  sCtx.drawImage(canvas, 0, 0);

  const dominant = emotionDetector.emotions ? Object.keys(emotionDetector.emotions).reduce((a, b) => emotionDetector.emotions[a] > emotionDetector.emotions[b] ? a : b) : 'neutral';
  const meta = EMOTION_META[dominant] || EMOTION_META.neutral;
  const pct = Math.round(emotionDetector.emotions[dominant] * 100);

  sCtx.fillStyle = 'rgba(10, 13, 20, 0.85)';
  sCtx.fillRect(20, snapCanvas.height - 70, 260, 50);
  sCtx.lineWidth = 1;
  sCtx.strokeStyle = meta.color;
  sCtx.strokeRect(20, snapCanvas.height - 70, 260, 50);

  sCtx.font = '24px sans-serif';
  sCtx.fillText(meta.emoji, 32, snapCanvas.height - 36);

  sCtx.fillStyle = '#ffffff';
  sCtx.font = 'bold 16px sans-serif';
  sCtx.fillText(`MOOD: ${meta.label.toUpperCase()} (${pct}%)`, 72, snapCanvas.height - 44);

  sCtx.fillStyle = '#94a3b8';
  sCtx.font = '11px monospace';
  sCtx.fillText(`E-MOOD AI • ${new Date().toLocaleTimeString()}`, 72, snapCanvas.height - 28);

  const dataUrl = snapCanvas.toDataURL('image/png');

  document.getElementById('modal-img').src = dataUrl;
  document.getElementById('modal-download').href = dataUrl;
  document.getElementById('modal-download').download = `mood-${dominant}-${Date.now()}.png`;
  document.getElementById('modal-badge').textContent = `${meta.emoji} ${meta.label.toUpperCase()} ${pct}%`;
  document.getElementById('modal-badge').style.borderColor = meta.color;

  const modal = document.getElementById('snapshot-modal');
  modal.classList.remove('opacity-0', 'pointer-events-none');
  modal.firstElementChild.classList.remove('scale-95');

  snapshots.unshift({ dataUrl, dominant, time: new Date().toLocaleTimeString() });
  renderGallery();
}

function closeModal() {
  const modal = document.getElementById('snapshot-modal');
  modal.classList.add('opacity-0', 'pointer-events-none');
  modal.firstElementChild.classList.add('scale-95');
}

function renderGallery() {
  const gallery = document.getElementById('snapshot-gallery');
  const countEl = document.getElementById('snapshot-count');
  countEl.textContent = `${snapshots.length} photos`;

  if (snapshots.length === 0) return;

  gallery.innerHTML = snapshots.map((s, idx) => `
    <div class="relative group aspect-video rounded-lg overflow-hidden border border-slate-800 cursor-pointer">
      <img src="${s.dataUrl}" class="w-full h-full object-cover" />
      <div class="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
        <a href="${s.dataUrl}" download="mood-${s.dominant}.png" class="p-1 rounded bg-amber-500 text-slate-950 text-xs font-bold">
          Save
        </a>
      </div>
    </div>
  `).join('');
}

function toggleAudio() {
  isSoundEnabled = !isSoundEnabled;
  const btn = document.getElementById('btn-sound');
  const icon = document.getElementById('icon-sound');

  if (isSoundEnabled) {
    btn.classList.add('text-cyan-400', 'border-cyan-500/40');
    icon.setAttribute('data-lucide', 'volume-2');
    initAudioSynth();
  } else {
    btn.classList.remove('text-cyan-400', 'border-cyan-500/40');
    icon.setAttribute('data-lucide', 'volume-x');
    stopAudioSynth();
  }
  if (window.lucide) window.lucide.createIcons();
}

function initAudioSynth() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    soundOsc = audioCtx.createOscillator();
    soundGain = audioCtx.createGain();

    soundOsc.type = 'sine';
    soundOsc.frequency.setValueAtTime(440, audioCtx.currentTime);

    soundGain.gain.setValueAtTime(0.05, audioCtx.currentTime);

    soundOsc.connect(soundGain);
    soundGain.connect(audioCtx.destination);
    soundOsc.start();
  }
}

function updateAudioSynth(dominant) {
  if (!audioCtx || !soundOsc) return;
  const meta = EMOTION_META[dominant] || EMOTION_META.neutral;
  soundOsc.frequency.setTargetAtTime(meta.audioFreq, audioCtx.currentTime, 0.4);
}

function stopAudioSynth() {
  if (audioCtx) {
    audioCtx.close();
    audioCtx = null;
    soundOsc = null;
  }
}

function updateStatus(text, color) {
  const badge = document.getElementById('status-badge');
  const txt = document.getElementById('status-text');
  if (txt) txt.textContent = text;

  if (badge) {
    if (color === 'emerald') {
      badge.className = "flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-xs font-mono text-emerald-300";
    } else if (color === 'amber') {
      badge.className = "flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-950/60 border border-amber-500/40 text-xs font-mono text-amber-300";
    } else if (color === 'red') {
      badge.className = "flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-950/60 border border-red-500/40 text-xs font-mono text-red-300";
    }
  }
}

window.addEventListener('DOMContentLoaded', init);
