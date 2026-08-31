/**
 * Night Shift: Anomaly Breach — Psychological CRT Surveillance Horror
 */

const canvas = document.getElementById('cctvCanvas');
const ctx = canvas.getContext('2d');

// --- 1. PROCEDURAL WEB AUDIO SYNTHESIZER & HORROR BGM ENGINE ---
class NightShiftAudioEngine {
  constructor() {
    this.ctx = null;
    this.isPlayingBGM = false;
    this.bgmTimer = null;
    this.droneOsc = null;
    this.droneGain = null;
    this.step = 0;
    this.tempo = 65;

    // Dissonant chromatic horror notes (Tritones, diminished 5ths, low drones)
    this.horrorNotes = [
      48.99, 51.91, 46.25, 43.65, // G1, Ab1, F#1, F1 (Deep Sub-bass)
      185.00, 196.00, 174.61, 155.56, // F#3, G3, F3, Eb3
      369.99, 392.00, 311.13, 277.18, // High eerie chimes
      554.37, 587.33, 466.16, 415.30
    ];

    this.initOnUserGesture();
  }

  initOnUserGesture() {
    const unlock = () => {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) this.ctx = new AudioCtx();
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
    };
    ['click', 'keydown', 'touchstart', 'pointerdown'].forEach(evt => {
      window.addEventListener(evt, unlock, { passive: true });
    });
  }

  ensureCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  startBGM() {
    const actx = this.ensureCtx();
    if (!actx) return;
    this.stopBGM();
    this.isPlayingBGM = true;
    this.step = 0;

    // 1. Continuous Sub-Bass Horror Drone
    try {
      this.droneOsc = actx.createOscillator();
      this.droneGain = actx.createGain();
      this.droneOsc.type = 'sawtooth';
      this.droneOsc.frequency.setValueAtTime(45, actx.currentTime);
      this.droneGain.gain.setValueAtTime(0.06, actx.currentTime);

      const filter = actx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(120, actx.currentTime);

      this.droneOsc.connect(filter);
      filter.connect(this.droneGain);
      this.droneGain.connect(actx.destination);
      this.droneOsc.start();
    } catch(e) {}

    // 2. Procedural Horror Pulse Loop (Step Sequencer)
    const stepMs = (60 / this.tempo / 2) * 1000;
    this.bgmTimer = setInterval(() => {
      if (!this.isPlayingBGM || !this.ctx) return;
      if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
      this.playHorrorStep(this.step);
      this.step = (this.step + 1) % 16;
    }, stepMs);
  }

  stopBGM() {
    this.isPlayingBGM = false;
    if (this.bgmTimer) {
      clearInterval(this.bgmTimer);
      this.bgmTimer = null;
    }
    if (this.droneOsc) {
      try {
        this.droneOsc.stop();
        this.droneOsc.disconnect();
      } catch(e) {}
      this.droneOsc = null;
    }
  }

  playHorrorStep(step) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // Dark heartbeat pulse on beats 0, 4, 8, 12
    if (step % 4 === 0) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(55, now);
      osc.frequency.exponentialRampToValueAtTime(30, now + 0.2);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.25);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.25);
    }

    // Creepy high dissonant chime on random suspense beats
    if (step === 2 || step === 7 || step === 11 || step === 14) {
      const note = this.horrorNotes[8 + (step % 8)];
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(note, now);
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.8);
    }
  }

  playSound(type) {
    const actx = this.ensureCtx();
    if (!actx) return;
    const now = actx.currentTime;

    if (type === 'heartbeat') {
      const osc = actx.createOscillator();
      const gain = actx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(55, now);
      osc.frequency.exponentialRampToValueAtTime(30, now + 0.15);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.2);
      osc.connect(gain);
      gain.connect(actx.destination);
      osc.start(now);
      osc.stop(now + 0.2);
    } else if (type === 'cam_switch') {
      const osc = actx.createOscillator();
      const gain = actx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(200, now);
      osc.frequency.linearRampToValueAtTime(80, now + 0.08);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.08);
      osc.connect(gain);
      gain.connect(actx.destination);
      osc.start(now);
      osc.stop(now + 0.08);
    } else if (type === 'emp') {
      const osc = actx.createOscillator();
      const gain = actx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(120, now);
      osc.frequency.linearRampToValueAtTime(40, now + 0.4);
      gain.gain.setValueAtTime(0.4, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.4);
      osc.connect(gain);
      gain.connect(actx.destination);
      osc.start(now);
      osc.stop(now + 0.4);
    } else if (type === 'strobe') {
      const osc = actx.createOscillator();
      const gain = actx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.linearRampToValueAtTime(1200, now + 0.2);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.25);
      osc.connect(gain);
      gain.connect(actx.destination);
      osc.start(now);
      osc.stop(now + 0.25);
    } else if (type === 'jumpscare') {
      [150, 158, 220, 311, 466].forEach(freq => {
        const osc = actx.createOscillator();
        const gain = actx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.5, now + 0.6);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.8);
        osc.connect(gain);
        gain.connect(actx.destination);
        osc.start(now);
        osc.stop(now + 0.8);
      });
    }
  }
}

const audioEngine = new NightShiftAudioEngine();

function initAudio() {
  audioEngine.ensureCtx();
}

function playHorrorSound(type) {
  audioEngine.playSound(type);
}

// --- 2. GAME STATE & ANOMALIES ---
let state = {
  running: false,
  night: 1,
  timeMinutes: 0, // 0 = 12:00 AM, 360 = 6:00 AM
  sanity: 100,
  power: 100,
  activeCam: 1,
  empActive: false,
  empTimer: 0,
  strobeActive: false,
  strobeTimer: 0,
  anomalyLocation: 4, // Starts in CAM 4: Containment Cell
  anomalyAggression: 1,
  anomalyTimer: 0,
  glitchActive: false,
  glitchTimer: 0,
  staticNoise: 0.1
};

const CAM_NAMES = {
  1: 'CAM 01 — SERVER CORE',
  2: 'CAM 02 — CRYO LAB',
  3: 'CAM 03 — DARK HALLWAY',
  4: 'CAM 04 — CELL B',
  5: 'CAM 05 — VENT DUCT',
  6: 'CAM 06 — OFFICE DOOR'
};

function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * window.devicePixelRatio || 640;
  canvas.height = rect.height * window.devicePixelRatio || 400;
}
window.addEventListener('resize', resizeCanvas);

// --- 3. RENDERING CCTV FEEDS ---
function drawCameraFeed() {
  ctx.fillStyle = '#05070a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const w = canvas.width;
  const h = canvas.height;
  const t = Date.now() * 0.002;

  // Strobe effect
  if (state.strobeActive) {
    ctx.fillStyle = Math.random() > 0.4 ? 'rgba(255, 255, 255, 0.8)' : 'rgba(200, 240, 255, 0.5)';
    ctx.fillRect(0, 0, w, h);
    return;
  }

  // Draw specific camera environment
  switch (state.activeCam) {
    case 1: // SERVER CORE
      drawServerRoom(w, h, t);
      break;
    case 2: // CRYO LAB
      drawCryoLab(w, h, t);
      break;
    case 3: // HALLWAY
      drawHallway(w, h, t);
      break;
    case 4: // CELL B
      drawCellB(w, h, t);
      break;
    case 5: // VENT DUCT
      drawVent(w, h, t);
      break;
    case 6: // OFFICE DOOR
      drawOfficeDoor(w, h, t);
      break;
  }

  // Render Anomaly Entity if present in this camera
  if (state.anomalyLocation === state.activeCam) {
    drawAnomalyEntity(w, h, t);
  }

  // Draw Camera Noise & Static Grain
  drawNoise(w, h);
}

function drawServerRoom(w, h, t) {
  // Server racks
  ctx.fillStyle = '#0a101d';
  for (let i = 0; i < 5; i++) {
    const rx = w * 0.15 + i * (w * 0.16);
    ctx.fillRect(rx, h * 0.2, w * 0.12, h * 0.65);

    // Blinking lights on server racks
    for (let row = 0; row < 6; row++) {
      const isGreen = Math.sin(t * 3 + i * 5 + row) > 0;
      ctx.fillStyle = isGreen ? '#22c55e' : (Math.sin(t * 7 + row) > 0.5 ? '#ef4444' : '#38bdf8');
      ctx.fillRect(rx + 8, h * 0.25 + row * (h * 0.08), 6, 6);
      ctx.fillRect(rx + 20, h * 0.25 + row * (h * 0.08), 6, 6);
    }
  }
}

function drawCryoLab(w, h, t) {
  // Pods
  for (let i = 0; i < 3; i++) {
    const px = w * 0.2 + i * (w * 0.28);
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(px, h * 0.25, w * 0.2, h * 0.55, 20);
    ctx.fill();
    ctx.stroke();

    // Misty vapor inside pod
    ctx.fillStyle = `rgba(56, 189, 248, ${0.15 + Math.sin(t * 2 + i) * 0.05})`;
    ctx.fillRect(px + 10, h * 0.3, w * 0.2 - 20, h * 0.45);
  }
}

function drawHallway(w, h, t) {
  // 3D Perspective corridor
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 2;

  // Floor perspective lines
  ctx.beginPath();
  ctx.moveTo(0, h);
  ctx.lineTo(w * 0.4, h * 0.5);
  ctx.moveTo(w, h);
  ctx.lineTo(w * 0.6, h * 0.5);
  ctx.stroke();

  // Dim end of hall door
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(w * 0.4, h * 0.35, w * 0.2, h * 0.3);

  // Flickering top emergency light
  const light = Math.sin(t * 15) > -0.2;
  if (light) {
    const grad = ctx.createRadialGradient(w * 0.5, h * 0.2, 10, w * 0.5, h * 0.5, w * 0.4);
    grad.addColorStop(0, 'rgba(239, 68, 68, 0.3)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
  }
}

function drawCellB(w, h, t) {
  // Reinforced cell bars
  ctx.fillStyle = '#0b0f19';
  ctx.fillRect(w * 0.2, h * 0.2, w * 0.6, h * 0.65);

  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 6;
  for (let i = 0; i < 8; i++) {
    const bx = w * 0.25 + i * (w * 0.07);
    ctx.beginPath();
    ctx.moveTo(bx, h * 0.2);
    ctx.lineTo(bx, h * 0.85);
    ctx.stroke();
  }
}

function drawVent(w, h, t) {
  // Metallic circular vent
  ctx.fillStyle = '#050b14';
  ctx.beginPath();
  ctx.arc(w * 0.5, h * 0.5, h * 0.35, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 8;
  ctx.stroke();

  // Spinning fan blades
  ctx.save();
  ctx.translate(w * 0.5, h * 0.5);
  ctx.rotate(t * 6);
  ctx.fillStyle = '#1e293b';
  for (let i = 0; i < 4; i++) {
    ctx.rotate(Math.PI / 2);
    ctx.fillRect(-15, -h * 0.32, 30, h * 0.32);
  }
  ctx.restore();
}

function drawOfficeDoor(w, h, t) {
  // View directly outside your security booth
  ctx.fillStyle = '#090d16';
  ctx.fillRect(0, 0, w, h);

  // Doorframe
  ctx.strokeStyle = state.empActive ? '#38bdf8' : '#64748b';
  ctx.lineWidth = 8;
  ctx.strokeRect(w * 0.25, h * 0.15, w * 0.5, h * 0.85);

  if (state.empActive) {
    // Glowing EMP laser barrier
    ctx.fillStyle = 'rgba(56, 189, 248, 0.4)';
    ctx.fillRect(w * 0.26, h * 0.16, w * 0.48, h * 0.83);

    for (let i = 0; i < 6; i++) {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(w * 0.26, h * 0.25 + i * (h * 0.12));
      ctx.lineTo(w * 0.74, h * 0.25 + i * (h * 0.12));
      ctx.stroke();
    }
  }
}

function drawAnomalyEntity(w, h, t) {
  // Shadow silhouette with glowing red eyes
  ctx.save();
  const jitterX = (Math.random() - 0.5) * 4;
  const jitterY = (Math.random() - 0.5) * 4;

  const ex = w * 0.5 + jitterX;
  const ey = h * 0.55 + jitterY;

  // Dark shadowy figure
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.ellipse(ex, ey - 30, 25, 35, 0, 0, Math.PI * 2); // Head
  ctx.ellipse(ex, ey + 40, 45, 70, 0, 0, Math.PI * 2); // Body
  ctx.fill();

  // Pulsing Glowing Red Eyes
  const eyePulse = 0.8 + Math.sin(t * 10) * 0.2;
  ctx.fillStyle = '#ef4444';
  ctx.shadowColor = '#ef4444';
  ctx.shadowBlur = 15;
  ctx.beginPath();
  ctx.arc(ex - 10, ey - 35, 4 * eyePulse, 0, Math.PI * 2);
  ctx.arc(ex + 10, ey - 35, 4 * eyePulse, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  ctx.restore();

  // Sanity drain while looking at entity
  state.sanity = Math.max(0, state.sanity - 0.15);
  if (Math.random() > 0.85) {
    playHorrorSound('heartbeat');
  }
}

function drawNoise(w, h) {
  const imgData = ctx.getImageData(0, 0, w, h);
  const data = imgData.data;
  const noiseAmount = state.glitchActive ? 80 : 25;

  for (let i = 0; i < data.length; i += 16) {
    const val = (Math.random() - 0.5) * noiseAmount;
    data[i] = Math.min(255, Math.max(0, data[i] + val));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + val));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + val));
  }
  ctx.putImageData(imgData, 0, 0);
}

// --- 4. GAME TICK & ANOMALY AI ---
let lastTick = Date.now();

function updateGame() {
  if (!state.running) return;
  const now = Date.now();
  const dt = (now - lastTick) / 1000;
  lastTick = now;

  // Advance Night Shift Time (6 minutes = 360 seconds real time or ~90 seconds game speed)
  state.timeMinutes += dt * 4; // ~90s to reach 6:00 AM
  updateTimeHUD();

  if (state.timeMinutes >= 360) {
    winGame();
    return;
  }

  // EMP and Strobe Timers & Power Drain
  if (state.empActive) {
    state.empTimer -= dt;
    state.power = Math.max(0, state.power - dt * 3.5);
    if (state.empTimer <= 0 || state.power <= 0) {
      state.empActive = false;
      document.getElementById('btn-door-emp').classList.remove('active');
    }
  } else {
    // Passive power recharge slowly
    state.power = Math.min(100, state.power + dt * 0.8);
  }

  if (state.strobeActive) {
    state.strobeTimer -= dt;
    if (state.strobeTimer <= 0) {
      state.strobeActive = false;
    }
  }

  // Update Bars HUD
  document.getElementById('sanity-bar').style.width = `${state.sanity}%`;
  document.getElementById('power-bar').style.width = `${state.power}%`;

  if (state.sanity <= 20) {
    document.getElementById('sanity-bar').style.background = '#ef4444';
  } else {
    document.getElementById('sanity-bar').style.background = 'linear-gradient(90deg, #22c55e, #10b981)';
  }

  if (state.sanity <= 0) {
    gameOver('SANITY COLLAPSED — YOU LOST YOUR MIND IN THE DARK');
    return;
  }

  // Entity Movement AI
  state.anomalyTimer += dt;
  const moveInterval = Math.max(3, 8 - state.anomalyAggression);

  if (state.anomalyTimer >= moveInterval) {
    state.anomalyTimer = 0;
    moveAnomalyEntity();
  }

  // Live Timestamp
  const date = new Date();
  document.getElementById('live-timestamp').textContent = date.toLocaleTimeString() + ' [LIVE FEED]';

  drawCameraFeed();
  requestAnimationFrame(updateGame);
}

function moveAnomalyEntity() {
  const current = state.anomalyLocation;

  // Pathing logic
  // CAM 4 (Cell) -> CAM 2 (Cryo) or CAM 1 (Server) -> CAM 3 (Hallway) or CAM 5 (Vent) -> CAM 6 (Office Door)
  if (current === 4) {
    state.anomalyLocation = Math.random() > 0.5 ? 2 : 1;
  } else if (current === 2 || current === 1) {
    state.anomalyLocation = Math.random() > 0.5 ? 3 : 5;
  } else if (current === 3 || current === 5) {
    state.anomalyLocation = 6; // Arrives at office door!
    playHorrorSound('heartbeat');
  } else if (current === 6) {
    // At Office Door! If EMP is not active, BREACH!
    if (!state.empActive) {
      gameOver('DOOR BREACHED — THE ENTITY ENTERED YOUR BOOTH');
      return;
    } else {
      // Repelled by EMP barrier!
      state.anomalyLocation = 4; // Reset to cell
      playHorrorSound('emp');
    }
  }

  // Trigger slight camera glitch when entity moves
  state.glitchActive = true;
  setTimeout(() => { state.glitchActive = false; }, 400);
}

function updateTimeHUD() {
  const hourIndex = Math.floor(state.timeMinutes / 60);
  const hours = ['12:00 AM', '01:00 AM', '02:00 AM', '03:00 AM', '04:00 AM', '05:00 AM', '06:00 AM'];
  document.getElementById('time-display').textContent = hours[Math.min(6, hourIndex)];
}

function startGame() {
  audioEngine.startBGM();
  state.running = true;
  state.timeMinutes = 0;
  state.sanity = 100;
  state.power = 100;
  state.activeCam = 1;
  state.anomalyLocation = 4;
  state.empActive = false;
  state.strobeActive = false;
  lastTick = Date.now();

  document.getElementById('modal-overlay').classList.add('hidden');
  resizeCanvas();
  updateGame();
}

function winGame() {
  state.running = false;
  audioEngine.stopBGM();
  document.getElementById('death-reason').textContent = '🌅 6:00 AM REACHED — SHIFT SURVIVED!';
  document.getElementById('death-reason').style.color = '#22c55e';
  document.getElementById('survived-time').textContent = '06:00 AM (PROMOTED)';
  document.getElementById('game-over-section').classList.remove('hidden');
  document.getElementById('btn-start').textContent = 'START NEXT SHIFT';
  document.getElementById('modal-overlay').classList.remove('hidden');
}

function gameOver(reason) {
  state.running = false;
  audioEngine.stopBGM();
  playHorrorSound('jumpscare');

  document.getElementById('death-reason').textContent = reason;
  document.getElementById('death-reason').style.color = '#ef4444';
  const hourIndex = Math.floor(state.timeMinutes / 60);
  const hours = ['12:00 AM', '01:00 AM', '02:00 AM', '03:00 AM', '04:00 AM', '05:00 AM'];
  document.getElementById('survived-time').textContent = hours[Math.min(5, hourIndex)];
  document.getElementById('game-over-section').classList.remove('hidden');
  document.getElementById('btn-start').textContent = 'RETRY SHIFT';
  document.getElementById('modal-overlay').classList.remove('hidden');
}

// --- 5. CONTROLS & LISTENERS ---
function updateUsbButtonVisibility() {
  const usbBtn = document.getElementById('btn-compy-usb');
  if (!usbBtn) return;
  const hasUsb = localStorage.getItem('compy_has_usb') === 'true';
  const isHacked = localStorage.getItem('compy_servers_hacked') === 'true';

  if (state.activeCam === 1 && hasUsb && !isHacked) {
    usbBtn.classList.remove('hidden');
  } else {
    usbBtn.classList.add('hidden');
  }
}

document.querySelectorAll('.cam-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    initAudio();
    playHorrorSound('cam_switch');
    document.querySelectorAll('.cam-btn').forEach(b => b.classList.remove('active'));
    e.target.classList.add('active');

    state.activeCam = parseInt(e.target.dataset.cam);
    document.getElementById('active-cam-title').textContent = CAM_NAMES[state.activeCam];
    updateUsbButtonVisibility();
  });
});

// Compy Root USB Injection Button
const usbBtn = document.getElementById('btn-compy-usb');
if (usbBtn) {
  usbBtn.addEventListener('click', () => {
    initAudio();
    playHorrorSound('emp');
    localStorage.setItem('compy_servers_hacked', 'true');
    localStorage.setItem('compy_arg_stage', '3');
    usbBtn.classList.add('hidden');

    state.glitchActive = true;
    setTimeout(() => { state.glitchActive = false; }, 1500);

    alert("💾 [COMPY ROOT USB INJECTED]\n\nMainframe breached and servers overridden! Return to Secret Rooms to complete the extraction.");
  });
}

// Alt + R Keyboard Shortcut: Force Server Shutdown on CAM 01
window.addEventListener('keydown', (e) => {
  if (e.altKey && (e.key.toLowerCase() === 'r' || e.code === 'KeyR')) {
    e.preventDefault();
    if (state.activeCam === 1) {
      initAudio();
      playHorrorSound('jumpscare');
      state.power = 0;
      state.empActive = false;
      state.glitchActive = true;
      localStorage.setItem('compy_q2_servers_blackout', 'true');
      setTimeout(() => { state.glitchActive = false; }, 2000);
      alert('⚠️ [MAINFRAME TERMINATED: SERVER GRID SHUT DOWN VIA ALT+R]\n\nThe facility servers have been thrown into total pitch-black darkness! Return to Compy in Secret Rooms.');
    }
  }
});

// EMP Door Seal Button
document.getElementById('btn-door-emp').addEventListener('click', () => {
  initAudio();
  if (state.power < 10) return;
  state.empActive = !state.empActive;
  state.empTimer = 10;
  playHorrorSound('emp');
  document.getElementById('btn-door-emp').classList.toggle('active', state.empActive);
});

// Strobe Flash Overload
document.getElementById('btn-flash').addEventListener('click', () => {
  initAudio();
  if (state.power < 15) return;
  state.power -= 15;
  state.strobeActive = true;
  state.strobeTimer = 0.4;
  playHorrorSound('strobe');

  // If entity is in current camera, push it back!
  if (state.anomalyLocation === state.activeCam && state.activeCam !== 6) {
    state.anomalyLocation = 4; // Push back to cell!
  }
});

// Frequency Jammer (Clears glitch & recovers sanity slightly)
document.getElementById('btn-reboot').addEventListener('click', () => {
  initAudio();
  state.glitchActive = false;
  state.sanity = Math.min(100, state.sanity + 10);
  playHorrorSound('cam_switch');
});

// Keyboard Shortcuts (1-6 for CAMS, Space for Strobe, E for EMP, Arrow Keys)
window.addEventListener('keydown', (e) => {
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', ' '].includes(e.key) || ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
    e.preventDefault();
  }

  if (['1', '2', '3', '4', '5', '6'].includes(e.key)) {
    const camNum = parseInt(e.key);
    const btn = document.querySelector(`.cam-btn[data-cam="${camNum}"]`);
    if (btn) btn.click();
  } else if (e.code === 'Space') {
    document.getElementById('btn-flash')?.click();
  } else if (e.code === 'KeyE') {
    document.getElementById('btn-door-emp')?.click();
  } else if (e.code === 'ArrowLeft') {
    const prevCam = state.activeCam > 1 ? state.activeCam - 1 : 6;
    document.querySelector(`.cam-btn[data-cam="${prevCam}"]`)?.click();
  } else if (e.code === 'ArrowRight') {
    const nextCam = state.activeCam < 6 ? state.activeCam + 1 : 1;
    document.querySelector(`.cam-btn[data-cam="${nextCam}"]`)?.click();
  }
});

document.getElementById('btn-start').addEventListener('click', startGame);

window.onload = () => {
  resizeCanvas();
  drawCameraFeed();
};
