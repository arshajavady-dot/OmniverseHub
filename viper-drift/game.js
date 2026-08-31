/**
 * Viper Drift — Cyber Snake Arena Game Engine
 */

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let W, H;
function resize() {
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

// Audio Synth
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function resumeAudio() {
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}
['click', 'keydown', 'touchstart'].forEach(e => window.addEventListener(e, resumeAudio, { passive: true }));

function playFx(freq, type, duration, ramp = true) {
  try {
    resumeAudio();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    if (ramp) {
      osc.frequency.exponentialRampToValueAtTime(freq / 2, audioCtx.currentTime + duration);
    }
    gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + duration);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch(e) {}
}

// Game State
let isPlaying = false;
let score = 0;
let boost = 100;
let isBoosting = false;

const GRID_SIZE = 28;
const ARENA_COLS = 22; // Compact, high-difficulty cyber arena
const ARENA_ROWS = 18;

let arenaOffsetX = 0;
let arenaOffsetY = 0;

function updateArenaBounds() {
  arenaOffsetX = Math.max(10, Math.floor((W - ARENA_COLS * GRID_SIZE) / 2));
  arenaOffsetY = Math.max(50, Math.floor((H - ARENA_ROWS * GRID_SIZE) / 2));
}

let viper = [];
let dir = { x: 1, y: 0 };
let nextDir = { x: 1, y: 0 };
let speedTimer = 0;
let speedDelay = 6; // Faster base speed for high challenge

let food = { x: 0, y: 0 };
let enemyVipers = [];
let particles = [];

// Dark Cyber Snake Arena BGM Engine (Cyber-Invaders Multi-Track Style)
let bgmTimer = null;
let bgmStep = 0;

function playTechnoKick(now) {
  try {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(38, now + 0.1);
    gain.gain.setValueAtTime(0.14, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.12);
  } catch(e) {}
}

function playTechnoHat(now) {
  try {
    const bufferSize = audioCtx.sampleRate * 0.02;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 10000;
    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0.03, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);
    noise.start(now);
  } catch(e) {}
}

function startBGM() {
  resumeAudio();
  if (bgmTimer) clearInterval(bgmTimer);
  bgmStep = 0;
  // Fm -> Db -> Eb -> C
  const bassNotes = [87.31, 69.30, 77.78, 65.41]; // F2, Db2, Eb2, C2
  const leadArp = [349.23, 415.30, 523.25, 698.46, 523.25, 415.30, 349.23, 523.25]; // F4, Ab4, C5, F5, C5, Ab4, F4, C5
  const stepMs = (60 / 120 / 4) * 1000; // 120 BPM

  bgmTimer = setInterval(() => {
    if (!isPlaying) return;
    try {
      const now = audioCtx.currentTime;
      // 1. Acid Saw Bassline with Resonant Filter
      const oscB = audioCtx.createOscillator();
      const filterB = audioCtx.createBiquadFilter();
      const gainB = audioCtx.createGain();
      oscB.type = 'sawtooth';
      const bFreq = bassNotes[Math.floor(bgmStep / 16) % bassNotes.length];
      oscB.frequency.setValueAtTime(bgmStep % 2 === 0 ? bFreq : bFreq * 1.5, now);
      filterB.type = 'lowpass';
      filterB.Q.value = 6;
      filterB.frequency.setValueAtTime(isBoosting ? 900 : 450, now);
      filterB.frequency.exponentialRampToValueAtTime(100, now + 0.12);
      gainB.gain.setValueAtTime(0.07, now);
      gainB.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      oscB.connect(filterB);
      filterB.connect(gainB);
      gainB.connect(audioCtx.destination);
      oscB.start(now);
      oscB.stop(now + 0.12);

      // 2. Syncopated Cyber Lead
      const arpFreq = leadArp[bgmStep % leadArp.length];
      const oscL = audioCtx.createOscillator();
      const gainL = audioCtx.createGain();
      oscL.type = 'sawtooth';
      oscL.frequency.setValueAtTime(arpFreq * (isBoosting ? 1.5 : 1), now);
      gainL.gain.setValueAtTime(0.025, now);
      gainL.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      oscL.connect(gainL);
      gainL.connect(audioCtx.destination);
      oscL.start(now);
      oscL.stop(now + 0.08);

      // 3. Techno Kick & Hi-Hat
      if (bgmStep % 4 === 0) playTechnoKick(now);
      if (bgmStep % 4 === 2) playTechnoHat(now);

      bgmStep = (bgmStep + 1) % 64;
    } catch(e) {}
  }, stepMs);
}

function stopBGM() {
  if (bgmTimer) {
    clearInterval(bgmTimer);
    bgmTimer = null;
  }
}

function resetGame() {
  score = 0;
  boost = 100;
  dir = { x: 1, y: 0 };
  nextDir = { x: 1, y: 0 };
  speedDelay = 6;

  updateArenaBounds();

  const startX = Math.floor(ARENA_COLS / 2);
  const startY = Math.floor(ARENA_ROWS / 2);

  viper = [
    { x: startX, y: startY },
    { x: startX - 1, y: startY },
    { x: startX - 2, y: startY },
    { x: startX - 3, y: startY }
  ];

  spawnFood();
  particles = [];

  document.getElementById('overlay').classList.add('hidden');
  document.getElementById('game-over-info').classList.add('hidden');
  isPlaying = true;
  startBGM();
}

function spawnFood() {
  food = {
    x: Math.floor(Math.random() * (ARENA_COLS - 2)) + 1,
    y: Math.floor(Math.random() * (ARENA_ROWS - 2)) + 1
  };
}

// Controls
window.addEventListener('keydown', (e) => {
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', ' '].includes(e.key) || ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
    e.preventDefault();
  }
  if (!isPlaying && (e.code === 'Space' || e.code === 'Enter')) {
    resetGame();
    return;
  }
  if (!isPlaying) return;

  if ((e.code === 'ArrowUp' || e.code === 'KeyW') && dir.y !== 1) {
    nextDir = { x: 0, y: -1 };
  } else if ((e.code === 'ArrowDown' || e.code === 'KeyS') && dir.y !== -1) {
    nextDir = { x: 0, y: 1 };
  } else if ((e.code === 'ArrowLeft' || e.code === 'KeyA') && dir.x !== 1) {
    nextDir = { x: -1, y: 0 };
  } else if ((e.code === 'ArrowRight' || e.code === 'KeyD') && dir.x !== -1) {
    nextDir = { x: 1, y: 0 };
  } else if (e.code === 'ShiftLeft' || e.code === 'Space') {
    if (boost > 10) {
      isBoosting = true;
    }
  }
});

window.addEventListener('keyup', (e) => {
  if (e.code === 'ShiftLeft' || e.code === 'Space') {
    isBoosting = false;
  }
});

document.getElementById('start-btn').addEventListener('click', resetGame);

function update() {
  if (!isPlaying) return;

  if (window.parent && window.parent !== window) {
    window.parent.postMessage({ type: 'SCORE_UPDATE', score: score }, '*');
  }

  // Boost mechanics
  let currentDelay = speedDelay;
  if (isBoosting && boost > 0) {
    currentDelay = Math.max(2, Math.floor(speedDelay / 2));
    boost -= 1.5;
    if (boost <= 0) {
      boost = 0;
      isBoosting = false;
    }
  } else {
    boost = Math.min(100, boost + 0.35);
  }

  speedTimer++;
  if (speedTimer < currentDelay) return;
  speedTimer = 0;

  dir = nextDir;
  const head = { x: viper[0].x + dir.x, y: viper[0].y + dir.y };

  // Perimeter Laser Wall Collisions (Tight Compact Arena)
  if (head.x < 0 || head.x >= ARENA_COLS || head.y < 0 || head.y >= ARENA_ROWS) {
    playFx(150, 'sawtooth', 0.4);
    gameOver();
    return;
  }

  // Self Collision
  for (let i = 0; i < viper.length; i++) {
    if (viper[i].x === head.x && viper[i].y === head.y) {
      playFx(150, 'sawtooth', 0.4);
      gameOver();
      return;
    }
  }

  viper.unshift(head);

  // Food Collision
  if (head.x === food.x && head.y === food.y) {
    score += 250;
    playFx(750, 'sine', 0.15);
    spawnFood();
    spawnParticles(
      arenaOffsetX + head.x * GRID_SIZE + GRID_SIZE / 2, 
      arenaOffsetY + head.y * GRID_SIZE + GRID_SIZE / 2, 
      '#22c55e'
    );
  } else {
    viper.pop();
  }

  // Update Particles
  for (let i = particles.length - 1; i >= 0; i--) {
    let pt = particles[i];
    pt.x += pt.vx;
    pt.y += pt.vy;
    pt.life -= 0.05;
    if (pt.life <= 0) particles.splice(i, 1);
  }

  // Update UI
  document.getElementById('score').textContent = score;
  document.getElementById('length').textContent = viper.length;
  document.getElementById('boost-bar').style.width = boost + '%';
}

function spawnParticles(x, y, color) {
  for (let i = 0; i < 15; i++) {
    particles.push({
      x: x,
      y: y,
      vx: (Math.random() - 0.5) * 6,
      vy: (Math.random() - 0.5) * 6,
      color: color,
      size: Math.random() * 4 + 2,
      life: 1
    });
  }
}

function gameOver() {
  isPlaying = false;
  stopBGM();
  document.getElementById('final-score-val').textContent = score;
  document.getElementById('game-over-info').classList.remove('hidden');
  document.getElementById('overlay').classList.remove('hidden');
}

function render() {
  updateArenaBounds();

  const arenaW = ARENA_COLS * GRID_SIZE;
  const arenaH = ARENA_ROWS * GRID_SIZE;

  // Darkened Outer Void
  ctx.fillStyle = '#020617';
  ctx.fillRect(0, 0, W, H);

  // Inner Active Cyber Arena Floor
  ctx.fillStyle = '#090d16';
  ctx.fillRect(arenaOffsetX, arenaOffsetY, arenaW, arenaH);

  // Arena Grid Lines
  ctx.strokeStyle = 'rgba(34, 197, 94, 0.09)';
  ctx.lineWidth = 1;
  for (let c = 0; c <= ARENA_COLS; c++) {
    const x = arenaOffsetX + c * GRID_SIZE;
    ctx.beginPath();
    ctx.moveTo(x, arenaOffsetY);
    ctx.lineTo(x, arenaOffsetY + arenaH);
    ctx.stroke();
  }
  for (let r = 0; r <= ARENA_ROWS; r++) {
    const y = arenaOffsetY + r * GRID_SIZE;
    ctx.beginPath();
    ctx.moveTo(arenaOffsetX, y);
    ctx.lineTo(arenaOffsetX + arenaW, y);
    ctx.stroke();
  }

  // Glowing Electric Perimeter Laser Wall
  ctx.strokeStyle = '#22c55e';
  ctx.shadowColor = '#22c55e';
  ctx.shadowBlur = 18;
  ctx.lineWidth = 4;
  ctx.strokeRect(arenaOffsetX, arenaOffsetY, arenaW, arenaH);
  ctx.shadowBlur = 0;

  // Corner Hazard Accents
  ctx.strokeStyle = '#ef4444';
  ctx.lineWidth = 3;
  const cornerSize = 16;
  ctx.strokeRect(arenaOffsetX - 3, arenaOffsetY - 3, cornerSize, cornerSize);
  ctx.strokeRect(arenaOffsetX + arenaW - cornerSize + 3, arenaOffsetY - 3, cornerSize, cornerSize);
  ctx.strokeRect(arenaOffsetX - 3, arenaOffsetY + arenaH - cornerSize + 3, cornerSize, cornerSize);
  ctx.strokeRect(arenaOffsetX + arenaW - cornerSize + 3, arenaOffsetY + arenaH - cornerSize + 3, cornerSize, cornerSize);

  // Draw Food (Glowing Data Core)
  const fx = arenaOffsetX + food.x * GRID_SIZE;
  const fy = arenaOffsetY + food.y * GRID_SIZE;
  ctx.fillStyle = '#22c55e';
  ctx.shadowColor = '#22c55e';
  ctx.shadowBlur = 22;
  ctx.fillRect(fx + 4, fy + 4, GRID_SIZE - 8, GRID_SIZE - 8);
  ctx.shadowBlur = 0;

  // Draw Particles
  particles.forEach(pt => {
    ctx.fillStyle = pt.color;
    ctx.globalAlpha = pt.life;
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalAlpha = 1;

  // Draw Viper Segments
  viper.forEach((seg, i) => {
    const sx = arenaOffsetX + seg.x * GRID_SIZE;
    const sy = arenaOffsetY + seg.y * GRID_SIZE;
    ctx.fillStyle = i === 0 ? (isBoosting ? '#38bdf8' : '#4ade80') : '#16a34a';
    ctx.shadowColor = ctx.fillStyle;
    ctx.shadowBlur = i === 0 ? 25 : 8;
    ctx.fillRect(sx + 2, sy + 2, GRID_SIZE - 4, GRID_SIZE - 4);
    ctx.shadowBlur = 0;
  });
}

function loop() {
  update();
  render();
  requestAnimationFrame(loop);
}
loop();
