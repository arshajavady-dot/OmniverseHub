/**
 * Cyber Racer: Synthwave Outrun — Retro Pseudo-3D Highway Engine
 */

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const hudSpeed = document.getElementById('hud-speed');
const hudScore = document.getElementById('hud-score');
const hudHigh = document.getElementById('hud-high');
const startOverlay = document.getElementById('start-overlay');
const btnStart = document.getElementById('btn-start');
const finalScoreText = document.getElementById('final-score');

const btnLeft = document.getElementById('btn-left');
const btnRight = document.getElementById('btn-right');
const btnAccel = document.getElementById('btn-accel');

// --- 1. SYNTHWAVE AUDIO SYNTHESIZER ---
class RacerAudio {
  constructor() {
    this.ctx = null;
    this.isPlayingBGM = false;
    this.bgmTimer = null;
    this.step = 0;
    this.tempo = 128;
    this.bassline = [110, 110, 146.83, 130.81, 110, 110, 164.81, 146.83];
    this.melody = [220, 261.63, 329.63, 261.63, 220, 261.63, 392.00, 329.63];
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
      if (!this.isPlayingBGM) this.startBGM();
    };
    ['click', 'keydown', 'touchstart', 'pointerdown', 'mousedown'].forEach(evt => {
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
    const stepMs = (60 / this.tempo / 4) * 1000;

    this.bgmTimer = setInterval(() => {
      if (!this.isPlayingBGM || !this.ctx || this.ctx.state === 'suspended') return;
      this.playStep(this.step);
      this.step = (this.step + 1) % 8;
    }, stepMs);
  }

  stopBGM() {
    this.isPlayingBGM = false;
    if (this.bgmTimer) {
      clearInterval(this.bgmTimer);
      this.bgmTimer = null;
    }
  }

  playStep(step) {
    if (!this.ctx || this.ctx.state === 'suspended') return;
    try {
      const now = this.ctx.currentTime;
      const bFreq = this.bassline[step];
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(bFreq, now);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.16);
    } catch(e) {}
  }

  playCrash() {
    const actx = this.ensureCtx();
    if (!actx || actx.state === 'suspended') return;
    try {
      const osc = actx.createOscillator();
      const gain = actx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, actx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(30, actx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.3, actx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, actx.currentTime + 0.32);
      osc.connect(gain);
      gain.connect(actx.destination);
      osc.start();
      osc.stop(actx.currentTime + 0.35);
    } catch(e) {}
  }
}

const audio = new RacerAudio();

// --- 2. GAME STATE & ENTITIES ---
let gameState = 'PLAYING';
let speed = 0; // Current car speed
let maxSpeed = 180;
let score = 0;
let highScore = parseInt(localStorage.getItem('cyber_racer_high') || '0', 10);
hudHigh.textContent = String(highScore);

let playerCar = {
  x: 0, // -1 (left lane), 0 (center), 1 (right lane)
  y: 340,
  w: 45,
  h: 24,
  steering: 0
};

let roadOffset = 0;
let traffic = [];
let powerups = [];
let particles = [];

// Input State
const keys = { left: false, right: false, accel: false };

window.addEventListener('keydown', (e) => {
  if (gameState !== 'PLAYING') return;
  if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') keys.left = true;
  if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') keys.right = true;
  if (e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp') keys.accel = true;
});

window.addEventListener('keyup', (e) => {
  if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') keys.left = false;
  if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') keys.right = false;
  if (e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp') keys.accel = false;
});

const bindHoldBtn = (btn, prop) => {
  if (!btn) return;
  btn.addEventListener('pointerdown', (e) => { e.preventDefault(); keys[prop] = true; });
  btn.addEventListener('pointerup', (e) => { e.preventDefault(); keys[prop] = false; });
  btn.addEventListener('pointerleave', (e) => { e.preventDefault(); keys[prop] = false; });
};

bindHoldBtn(btnLeft, 'left');
bindHoldBtn(btnRight, 'right');
bindHoldBtn(btnAccel, 'accel');

btnStart.addEventListener('click', startGame);

function startGame() {
  gameState = 'PLAYING';
  speed = 0;
  score = 0;
  playerCar.x = 0;
  traffic = [];
  powerups = [];
  particles = [];
  startOverlay.classList.add('hidden');
  audio.startBGM();
}

function spawnTraffic() {
  const lanes = [-1, 0, 1];
  const lane = lanes[Math.floor(Math.random() * lanes.length)];
  traffic.push({
    x: lane,
    z: 1000,
    speed: 40 + Math.random() * 40,
    color: Math.random() > 0.5 ? '#ec4899' : '#a855f7'
  });
}

function spawnPowerup() {
  const lanes = [-1, 0, 1];
  const lane = lanes[Math.floor(Math.random() * lanes.length)];
  powerups.push({
    x: lane,
    z: 1000
  });
}

function addSparks(x, y, color, count = 20) {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const spd = 1 + Math.random() * 5;
    particles.push({
      x, y,
      vx: Math.cos(angle) * spd,
      vy: Math.sin(angle) * spd,
      life: 1,
      decay: 0.04,
      color: color || '#ec4899'
    });
  }
}

// --- 3. PHYSICS & UPDATE LOOP ---
function update() {
  if (gameState !== 'PLAYING') return;

  // Speed Acceleration & Braking
  if (keys.accel) {
    speed = Math.min(maxSpeed, speed + 1.8);
  } else {
    speed = Math.max(30, speed - 0.8);
  }

  // Steering
  if (keys.left) {
    playerCar.x = Math.max(-1.4, playerCar.x - 0.04);
  } else if (keys.right) {
    playerCar.x = Math.min(1.4, playerCar.x + 0.04);
  } else {
    playerCar.x *= 0.92;
  }

  roadOffset += speed * 0.15;
  score += Math.floor(speed * 0.08);

  hudSpeed.textContent = `${Math.floor(speed)} KM/H`;
  hudScore.textContent = String(score);

  if (score > highScore) {
    highScore = score;
    localStorage.setItem('cyber_racer_high', String(highScore));
    hudHigh.textContent = String(highScore);
  }

  // Spawn Traffic & Powerups
  if (Math.random() < 0.025 && traffic.length < 5) spawnTraffic();
  if (Math.random() < 0.015 && powerups.length < 3) spawnPowerup();

  // Update Traffic Vehicles
  for (let i = traffic.length - 1; i >= 0; i--) {
    const t = traffic[i];
    t.z -= (speed - t.speed) * 0.35;

    // Collision Check
    if (t.z < 60 && t.z > -20 && Math.abs(t.x - playerCar.x) < 0.55) {
      audio.playCrash();
      addSparks(canvas.width / 2 + playerCar.x * 120, playerCar.y, '#ec4899', 30);
      gameState = 'GAMEOVER';
      audio.stopBGM();

      finalScoreText.textContent = String(score);
      startOverlay.classList.remove('hidden');
      return;
    }

    if (t.z < -100) traffic.splice(i, 1);
  }

  // Update Powerups
  for (let i = powerups.length - 1; i >= 0; i--) {
    const p = powerups[i];
    p.z -= speed * 0.35;

    if (p.z < 60 && p.z > -20 && Math.abs(p.x - playerCar.x) < 0.55) {
      score += 250;
      addSparks(canvas.width / 2 + playerCar.x * 120, playerCar.y, '#38bdf8', 15);
      powerups.splice(i, 1);
    } else if (p.z < -100) {
      powerups.splice(i, 1);
    }
  }

  // Update Particles
  for (let i = particles.length - 1; i >= 0; i--) {
    const pt = particles[i];
    pt.x += pt.vx;
    pt.y += pt.vy;
    pt.life -= pt.decay;
    if (pt.life <= 0) particles.splice(i, 1);
  }
}

// --- 4. RENDER LOOP ---
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const horizonY = 160;

  // Synthwave Horizon Sun & Sky
  const skyGrad = ctx.createLinearGradient(0, 0, 0, horizonY);
  skyGrad.addColorStop(0, '#030712');
  skyGrad.addColorStop(0.6, '#1e1b4b');
  skyGrad.addColorStop(1, '#831843');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, canvas.width, horizonY);

  // Retro Sun
  ctx.save();
  ctx.fillStyle = '#f43f5e';
  ctx.shadowColor = '#f43f5e';
  ctx.shadowBlur = 25;
  ctx.beginPath();
  ctx.arc(canvas.width / 2, horizonY - 10, 45, Math.PI, 0);
  ctx.fill();
  ctx.restore();

  // Pseudo-3D Perspective Road
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.moveTo(canvas.width / 2 - 20, horizonY);
  ctx.lineTo(canvas.width / 2 + 20, horizonY);
  ctx.lineTo(canvas.width / 2 + 280, canvas.height);
  ctx.lineTo(canvas.width / 2 - 280, canvas.height);
  ctx.closePath();
  ctx.fill();

  // Grid Lines & Margins
  ctx.strokeStyle = '#ec4899';
  ctx.lineWidth = 2;
  ctx.shadowColor = '#ec4899';
  ctx.shadowBlur = 10;

  // Road Borders
  ctx.beginPath();
  ctx.moveTo(canvas.width / 2 - 20, horizonY);
  ctx.lineTo(canvas.width / 2 - 280, canvas.height);
  ctx.moveTo(canvas.width / 2 + 20, horizonY);
  ctx.lineTo(canvas.width / 2 + 280, canvas.height);
  ctx.stroke();

  // Horizontal Grid Lines
  for (let z = 100; z <= 1000; z += 100) {
    const effZ = (z - (roadOffset % 100));
    const scale = 1 / (effZ * 0.002 + 1);
    const lineY = horizonY + (canvas.height - horizonY) * scale;

    ctx.beginPath();
    ctx.moveTo(canvas.width / 2 - 280 * scale, lineY);
    ctx.lineTo(canvas.width / 2 + 280 * scale, lineY);
    ctx.stroke();
  }
  ctx.shadowBlur = 0;

  // Draw Traffic Vehicles
  traffic.sort((a, b) => b.z - a.z).forEach(t => {
    const scale = 1 / (t.z * 0.002 + 1);
    const carY = horizonY + (canvas.height - horizonY) * scale;
    const carX = canvas.width / 2 + (t.x * 160) * scale;
    const w = 45 * scale;
    const h = 24 * scale;

    ctx.save();
    ctx.fillStyle = t.color;
    ctx.shadowColor = t.color;
    ctx.shadowBlur = 12;
    ctx.fillRect(carX - w / 2, carY - h, w, h);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(carX - w / 3, carY - h * 0.8, w * 0.66, h * 0.4);
    ctx.restore();
  });

  // Draw Powerup Cores
  powerups.forEach(p => {
    const scale = 1 / (p.z * 0.002 + 1);
    const pY = horizonY + (canvas.height - horizonY) * scale;
    const pX = canvas.width / 2 + (p.x * 160) * scale;

    ctx.save();
    ctx.fillStyle = '#38bdf8';
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.arc(pX, pY - 10, 10 * scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });

  // Draw Particles
  particles.forEach(pt => {
    ctx.save();
    ctx.globalAlpha = pt.life;
    ctx.fillStyle = pt.color;
    ctx.fillRect(pt.x, pt.y, 4, 4);
    ctx.restore();
  });

  // Draw Player Cyber Car
  if (gameState === 'PLAYING') {
    const pX = canvas.width / 2 + playerCar.x * 140;
    const pY = playerCar.y;

    ctx.save();
    ctx.fillStyle = '#38bdf8';
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 18;
    ctx.fillRect(pX - playerCar.w / 2, pY, playerCar.w, playerCar.h);

    // Windshield & Exhaust Glow
    ctx.fillStyle = '#030712';
    ctx.fillRect(pX - playerCar.w / 3, pY + 4, playerCar.w * 0.66, 8);

    // Tail Lights
    ctx.fillStyle = '#f43f5e';
    ctx.fillRect(pX - playerCar.w / 2 + 3, pY + playerCar.h - 3, 8, 3);
    ctx.fillRect(pX + playerCar.w / 2 - 11, pY + playerCar.h - 3, 8, 3);
    ctx.restore();
  }
}

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

// Auto-start on load!
startGame();
requestAnimationFrame(gameLoop);
