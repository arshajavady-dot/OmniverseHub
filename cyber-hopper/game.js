/**
 * Cyber Hopper: Neon Crossroad — Retro Cyber Arcade Engine
 */

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const TILE_SIZE = 40;
const COLS = 14;
const ROWS = 13;
const W = COLS * TILE_SIZE; // 560
const H = ROWS * TILE_SIZE; // 520

canvas.width = W;
canvas.height = H;

// --- 1. WEB AUDIO SYNTHESIZER & BGM ENGINE ---
class HopperAudioEngine {
  constructor() {
    this.ctx = null;
    this.isPlayingBGM = false;
    this.bgmTimer = null;
    this.step = 0;
    this.tempo = 128;

    this.bassNotes = [82.41, 65.41, 73.42, 61.74]; // Em, C, D, Bm
    this.melodyNotes = [
      329.63, 392.00, 493.88, 587.33, 493.88, 392.00, 329.63, 392.00,
      261.63, 329.63, 392.00, 523.25, 392.00, 329.63, 261.63, 329.63,
      293.66, 369.99, 440.00, 587.33, 440.00, 369.99, 293.66, 369.99,
      246.94, 293.66, 369.99, 493.88, 369.99, 293.66, 246.94, 293.66
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
    const stepMs = (60 / this.tempo / 4) * 1000;

    this.bgmTimer = setInterval(() => {
      if (!this.isPlayingBGM || !this.ctx) return;
      if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
      this.playBGMStep(this.step);
      this.step = (this.step + 1) % 32;
    }, stepMs);
  }

  stopBGM() {
    this.isPlayingBGM = false;
    if (this.bgmTimer) {
      clearInterval(this.bgmTimer);
      this.bgmTimer = null;
    }
    this.step = 0;
  }

  playBGMStep(step) {
    if (!this.ctx || this.ctx.state === 'suspended') return;
    try {
      const now = this.ctx.currentTime;
      const bar = Math.floor(step / 8);
      const bass = this.bassNotes[bar % this.bassNotes.length];
      const melody = this.melodyNotes[step % this.melodyNotes.length];

      if (step % 2 === 0) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(bass, now);
        gain.gain.setValueAtTime(0.09, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.14);
      }

      if (step % 2 === 1 || step % 4 === 0) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(melody, now);
        gain.gain.setValueAtTime(0.045, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.08);
      }

      if (step % 8 === 0) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(130, now);
        osc.frequency.exponentialRampToValueAtTime(32, now + 0.1);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.1);
      }
    } catch(e) {}
  }

  playHop() {
    const actx = this.ensureCtx();
    if (!actx) return;
    try {
      const now = actx.currentTime;
      const osc = actx.createOscillator();
      const gain = actx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(250, now);
      osc.frequency.exponentialRampToValueAtTime(500, now + 0.08);

      gain.gain.setValueAtTime(0.09, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(actx.destination);
      osc.start(now);
      osc.stop(now + 0.08);
    } catch(e) {}
  }

  playDock() {
    const actx = this.ensureCtx();
    if (!actx) return;
    try {
      const now = actx.currentTime;
      [440, 554, 659, 880].forEach((f, i) => {
        const osc = actx.createOscillator();
        const gain = actx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, now + i * 0.06);
        gain.gain.setValueAtTime(0.1, now + i * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.12);

        osc.connect(gain);
        gain.connect(actx.destination);
        osc.start(now + i * 0.06);
        osc.stop(now + i * 0.06 + 0.12);
      });
    } catch(e) {}
  }

  playZap() {
    const actx = this.ensureCtx();
    if (!actx) return;
    try {
      const now = actx.currentTime;
      const osc = actx.createOscillator();
      const gain = actx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.4);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      osc.connect(gain);
      gain.connect(actx.destination);
      osc.start(now);
      osc.stop(now + 0.4);
    } catch(e) {}
  }

  playVictory() {
    const actx = this.ensureCtx();
    if (!actx) return;
    try {
      const now = actx.currentTime;
      [523, 659, 784, 1046, 1318].forEach((f, i) => {
        const osc = actx.createOscillator();
        const gain = actx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(f, now + i * 0.08);
        gain.gain.setValueAtTime(0.12, now + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.18);

        osc.connect(gain);
        gain.connect(actx.destination);
        osc.start(now + i * 0.08);
        osc.stop(now + i * 0.08 + 0.18);
      });
    } catch(e) {}
  }
}

const audio = new HopperAudioEngine();

// --- 2. GAME STATE & LANES ---
let isPlaying = false;
let score = 0;
let level = 1;
let lives = 3;
const MAX_TIME = 1800; // 30 seconds
let timeLimit = MAX_TIME;

// Docking Bays (Row 0): 5 bays at columns 1, 4, 7, 10, 12
const DOCK_BAYS = [
  { col: 1, filled: false },
  { col: 4, filled: false },
  { col: 7, filled: false },
  { col: 10, filled: false },
  { col: 12, filled: false }
];

let trafficLanes = [];
let riverLanes = [];
let particles = [];
let floatingTexts = [];

// Cyber Hopper Player
const player = {
  row: 12,
  x: 6.5 * TILE_SIZE,
  y: 12 * TILE_SIZE,
  targetX: 6.5 * TILE_SIZE,
  targetY: 12 * TILE_SIZE,
  facing: 'up',

  resetPos() {
    this.row = 12;
    this.x = 6.5 * TILE_SIZE;
    this.y = 12 * TILE_SIZE;
    this.targetX = this.x;
    this.targetY = this.y;
    this.facing = 'up';
    timeLimit = MAX_TIME;
  }
};

function initLanes() {
  const hasTruckQuest = localStorage.getItem('compy_stage_truck_unlocked') === 'true' || localStorage.getItem('compy_has_chip') === 'true';

  trafficLanes = [
    { row: 11, speed: 2.0 + level * 0.18, dir: 1, type: 'bike', width: 38, height: 22, color: '#facc15', items: [{ x: 50 }, { x: 240 }, { x: 430 }] },
    { 
      row: 10, 
      speed: 1.2 + level * 0.15, 
      dir: -1, 
      type: 'truck', 
      width: 75, 
      height: 24, 
      color: '#ef4444', 
      items: hasTruckQuest ? [{ x: 90, isBlackTruck: true }, { x: 360 }] : [{ x: 90 }, { x: 360 }] 
    },
    { row: 9, speed: 1.7 + level * 0.16, dir: 1, type: 'sedan', width: 48, height: 22, color: '#38bdf8', items: [{ x: 70 }, { x: 260 }, { x: 450 }] },
    { row: 8, speed: 2.8 + level * 0.22, dir: -1, type: 'racer', width: 42, height: 20, color: '#ec4899', items: [{ x: 130 }, { x: 380 }] },
    { row: 7, speed: 1.4 + level * 0.14, dir: 1, type: 'van', width: 58, height: 24, color: '#a855f7', items: [{ x: 60 }, { x: 290 }, { x: 480 }] }
  ];

  // High visibility neon river platforms with explicit dimensions and continuous wrapping
  riverLanes = [
    { row: 5, speed: 1.4 + level * 0.12, dir: -1, type: 'log', width: 120, height: 28, color: '#10b981', items: [{ x: 30 }, { x: 230 }, { x: 430 }] },
    { row: 4, speed: 1.7 + level * 0.15, dir: 1, type: 'drone', width: 95, height: 26, color: '#00f0ff', items: [{ x: 50, submerge: 0 }, { x: 240, submerge: 80 }, { x: 430, submerge: 160 }] },
    { row: 3, speed: 1.2 + level * 0.10, dir: -1, type: 'barge', width: 150, height: 28, color: '#c084fc', items: [{ x: 40 }, { x: 240 }, { x: 440 }] },
    { row: 2, speed: 1.9 + level * 0.16, dir: 1, type: 'log', width: 110, height: 28, color: '#10b981', items: [{ x: 50 }, { x: 240 }, { x: 430 }] },
    { row: 1, speed: 1.5 + level * 0.14, dir: -1, type: 'drone', width: 95, height: 26, color: '#00f0ff', items: [{ x: 60, submerge: 40 }, { x: 260, submerge: 120 }, { x: 450, submerge: 200 }] }
  ];
}

// --- 3. GAME UPDATE LOGIC ---
function update() {
  if (!isPlaying) return;

  if (window.parent && window.parent !== window) {
    window.parent.postMessage({ type: 'SCORE_UPDATE', score: score, hops: score }, '*');
  }

  // 1. Time Limit (Only runs down when in hazard highway/river zones; safe in Launchpad row 12 & Median row 6!)
  const isSafeZone = (player.row === 12 || player.row === 6);
  if (!isSafeZone) {
    timeLimit--;
    if (timeLimit <= 0) {
      onPlayerDeath('TIME EXPIRED');
      return;
    }
  } else {
    // In safe zones, timer is paused and slowly recharges
    if (timeLimit < MAX_TIME) {
      timeLimit = Math.min(MAX_TIME, timeLimit + 2);
    }
  }

  // 2. Smooth Hop Transition
  player.x += (player.targetX - player.x) * 0.45;
  player.y += (player.targetY - player.y) * 0.45;

  const isMidHop = Math.abs(player.y - player.targetY) > 8;

  // 3. Traffic Lanes Update
  trafficLanes.forEach(lane => {
    lane.items.forEach(veh => {
      veh.x += lane.speed * lane.dir;
      if (lane.dir === 1 && veh.x > W + 40) veh.x = -lane.width - 20;
      else if (lane.dir === -1 && veh.x < -lane.width - 40) veh.x = W + 20;

      if (player.row === lane.row && !isMidHop) {
        const pCenterX = player.x + TILE_SIZE / 2;
        if (pCenterX > veh.x + 3 && pCenterX < veh.x + lane.width - 3) {
          if (veh.isBlackTruck) {
            localStorage.setItem('compy_has_black_box', 'true');
            localStorage.setItem('compy_arg_stage', '2');
            onPlayerDeath('💥 SECRET BLACK TRUCK INTERCEPTED! DATA DUMP RECOVERED. RETURN TO COMPY!');
          } else {
            onPlayerDeath('TRAFFIC COLLISION');
          }
        }
      }
    });
  });

  // 4. River Lanes Update & Floating Platform Support
  let onRiverVehicle = false;
  let riverDrift = 0;

  riverLanes.forEach(lane => {
    lane.items.forEach(item => {
      item.x += lane.speed * lane.dir;

      // FIXED: Use lane.width to avoid NaN
      if (lane.dir === 1 && item.x > W + 80) item.x = -lane.width - 40;
      else if (lane.dir === -1 && item.x < -lane.width - 80) item.x = W + 40;

      if (lane.type === 'drone') {
        item.submerge = (item.submerge + 1) % 240;
      }

      // Check if Player is riding this log / barge
      if (player.row === lane.row) {
        const pCenterX = player.x + TILE_SIZE / 2;
        if (pCenterX >= item.x - 16 && pCenterX <= item.x + lane.width + 16) {
          const isUnderwater = lane.type === 'drone' && item.submerge > 190;
          if (!isUnderwater) {
            onRiverVehicle = true;
            riverDrift = lane.speed * lane.dir;
          }
        }
      }
    });
  });

  // River survival & drifting logic
  if (player.row >= 1 && player.row <= 5) {
    if (onRiverVehicle) {
      player.x += riverDrift;
      player.targetX += riverDrift;

      if (player.x < -20 || player.x > W - TILE_SIZE + 20) {
        onPlayerDeath('DRIFTED OFF GRID');
        return;
      }
    } else if (!isMidHop) {
      onPlayerDeath('PLASMA RIVER DROWN');
      return;
    }
  }

  // 5. Docking Bays Zone (Row 0)
  if (player.row === 0 && !isMidHop) {
    const pCenterX = player.x + TILE_SIZE / 2;
    const targetBay = DOCK_BAYS.find(b => Math.abs((b.col * TILE_SIZE + TILE_SIZE / 2) - pCenterX) <= 28);

    if (targetBay && !targetBay.filled) {
      targetBay.filled = true;
      const rushBonus = Math.floor(timeLimit / 10);
      score += 200 + rushBonus;
      audio.playDock();
      spawnFloatingText(targetBay.col * TILE_SIZE + 20, 20, `+${200 + rushBonus} DOCKED!`, '#4ade80');
      spawnParticles(targetBay.col * TILE_SIZE + 20, 20, '#4ade80', 20);

      const filledCount = DOCK_BAYS.filter(b => b.filled).length;
      if (filledCount >= 5) {
        score += 1000;
        level++;
        audio.playVictory();
        spawnFloatingText(W / 2, H / 2, 'STAGE CLEARED! +1000', '#22c55e');
        DOCK_BAYS.forEach(b => b.filled = false);
        initLanes();
      }

      player.resetPos();
    } else {
      onPlayerDeath('DOCK BARRIER CRASH');
      return;
    }
  }

  // 6. Floating Text & Particles
  for (let i = floatingTexts.length - 1; i >= 0; i--) {
    const ft = floatingTexts[i];
    ft.y -= 1;
    ft.life -= 0.025;
    if (ft.life <= 0) floatingTexts.splice(i, 1);
  }

  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.life -= 0.04;
    if (p.life <= 0) particles.splice(i, 1);
  }

  // Update HUD
  document.getElementById('score').textContent = score.toString().padStart(5, '0');
  const timePct = (timeLimit / MAX_TIME) * 100;
  document.getElementById('time-bar').style.width = `${timePct}%`;
  const filledCount = DOCK_BAYS.filter(b => b.filled).length;
  document.getElementById('bays-filled').textContent = `${filledCount} / 5`;

  const livesContainer = document.getElementById('lives-container');
  livesContainer.innerHTML = '';
  for (let i = 0; i < lives; i++) {
    const span = document.createElement('span');
    span.className = 'life-icon';
    span.textContent = '🐸';
    livesContainer.appendChild(span);
  }
}

function onPlayerDeath(reason) {
  lives--;
  audio.playZap();
  spawnParticles(player.x + TILE_SIZE / 2, player.y + TILE_SIZE / 2, '#ef4444', 28);
  if (lives <= 0) {
    gameOver();
  } else {
    player.resetPos();
  }
}

function gameOver() {
  isPlaying = false;
  audio.stopBGM();
  document.getElementById('final-score-val').textContent = score;
  document.getElementById('game-over-info').classList.remove('hidden');
  document.getElementById('overlay').classList.remove('hidden');
}

function spawnParticles(x, y, color, count = 10) {
  for (let i = 0; i < count; i++) {
    particles.push({
      x: x,
      y: y,
      vx: (Math.random() - 0.5) * 5,
      vy: (Math.random() - 0.5) * 5,
      color: color,
      life: 1
    });
  }
}

function spawnFloatingText(x, y, text, color) {
  floatingTexts.push({ x: x, y: y, text: text, color: color, life: 1 });
}

// --- 4. RENDER ENGINE ---
function render() {
  ctx.clearRect(0, 0, W, H);

  // 1. Docking Bays Zone (Row 0)
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, W, TILE_SIZE);

  for (let c = 0; c < COLS; c++) {
    const bay = DOCK_BAYS.find(b => b.col === c);
    const bx = c * TILE_SIZE;
    if (bay) {
      if (bay.filled) {
        ctx.fillStyle = 'rgba(34, 197, 94, 0.3)';
        ctx.fillRect(bx + 4, 4, TILE_SIZE - 8, TILE_SIZE - 8);
        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 2;
        ctx.strokeRect(bx + 4, 4, TILE_SIZE - 8, TILE_SIZE - 8);
        ctx.fillStyle = '#4ade80';
        ctx.font = '18px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('🐸', bx + TILE_SIZE / 2, 28);
      } else {
        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 2;
        ctx.shadowColor = '#22c55e';
        ctx.shadowBlur = 12;
        ctx.strokeRect(bx + 4, 4, TILE_SIZE - 8, TILE_SIZE - 8);
        ctx.shadowBlur = 0;
      }
    } else {
      ctx.fillStyle = '#1e1b4b';
      ctx.fillRect(bx, 0, TILE_SIZE, TILE_SIZE);
      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(bx + 1, 1, TILE_SIZE - 2, TILE_SIZE - 2);
    }
  }

  // 2. Plasma River Background (Rows 1-5)
  ctx.fillStyle = '#031525';
  ctx.fillRect(0, TILE_SIZE, W, TILE_SIZE * 5);

  ctx.strokeStyle = 'rgba(0, 240, 255, 0.2)';
  ctx.lineWidth = 1;
  for (let r = 1; r <= 5; r++) {
    ctx.beginPath();
    ctx.moveTo(0, r * TILE_SIZE);
    ctx.lineTo(W, r * TILE_SIZE);
    ctx.stroke();
  }

  // Draw River Floating Platforms (Bright High Contrast Neon)
  riverLanes.forEach(lane => {
    const ry = lane.row * TILE_SIZE;
    lane.items.forEach(item => {
      if (lane.type === 'drone') {
        const isWarning = item.submerge >= 150 && item.submerge <= 190;
        const isSubmerged = item.submerge > 190;

        if (isSubmerged) {
          ctx.fillStyle = 'rgba(0, 240, 255, 0.15)';
          ctx.strokeStyle = 'rgba(0, 240, 255, 0.3)';
          ctx.shadowBlur = 0;
        } else if (isWarning) {
          ctx.fillStyle = (Math.floor(item.submerge / 4) % 2 === 0) ? '#facc15' : '#00f0ff';
          ctx.strokeStyle = '#ffffff';
          ctx.shadowColor = '#facc15';
          ctx.shadowBlur = 16;
        } else {
          ctx.fillStyle = '#00f0ff';
          ctx.strokeStyle = '#ffffff';
          ctx.shadowColor = '#00f0ff';
          ctx.shadowBlur = 14;
        }

        ctx.lineWidth = 2;
        ctx.fillRect(item.x, ry + 6, lane.width, lane.height);
        ctx.strokeRect(item.x, ry + 6, lane.width, lane.height);

        // Drone Thruster Lights
        if (!isSubmerged) {
          ctx.fillStyle = '#facc15';
          ctx.fillRect(item.x + 8, ry + 12, 6, 6);
          ctx.fillRect(item.x + lane.width - 14, ry + 12, 6, 6);
        }
        ctx.shadowBlur = 0;
      } else if (lane.type === 'barge') {
        // High-Tech Cyber Barge (Purple / Violet)
        ctx.fillStyle = '#a855f7';
        ctx.strokeStyle = '#f472b6';
        ctx.lineWidth = 2.5;
        ctx.shadowColor = '#c084fc';
        ctx.shadowBlur = 14;
        ctx.fillRect(item.x, ry + 5, lane.width, lane.height);
        ctx.strokeRect(item.x, ry + 5, lane.width, lane.height);

        ctx.fillStyle = '#7e22ce';
        for (let cellX = item.x + 12; cellX < item.x + lane.width - 12; cellX += 20) {
          ctx.fillRect(cellX, ry + 9, 12, lane.height - 8);
        }
        ctx.shadowBlur = 0;
      } else {
        // Glowing Neon Emerald Solar Log
        ctx.fillStyle = '#10b981';
        ctx.strokeStyle = '#6ee7b7';
        ctx.lineWidth = 2.5;
        ctx.shadowColor = '#34d399';
        ctx.shadowBlur = 14;
        ctx.fillRect(item.x, ry + 5, lane.width, lane.height);
        ctx.strokeRect(item.x, ry + 5, lane.width, lane.height);

        ctx.fillStyle = '#047857';
        for (let cellX = item.x + 10; cellX < item.x + lane.width - 10; cellX += 18) {
          ctx.fillRect(cellX, ry + 9, 10, lane.height - 8);
        }
        ctx.shadowBlur = 0;
      }
    });
  });

  // 3. Median Strip (Row 6)
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(0, 6 * TILE_SIZE, W, TILE_SIZE);
  ctx.fillStyle = '#94a3b8';
  ctx.font = 'bold 9px Orbitron, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('⚡ MEDIAN RECHARGE STRIP (SAFE) ⚡', W / 2, 6 * TILE_SIZE + 24);

  // 4. Highway (Rows 7-11)
  ctx.fillStyle = '#030712';
  ctx.fillRect(0, 7 * TILE_SIZE, W, TILE_SIZE * 5);

  ctx.strokeStyle = 'rgba(250, 204, 21, 0.3)';
  ctx.setLineDash([12, 12]);
  ctx.lineWidth = 1.5;
  for (let r = 8; r <= 11; r++) {
    ctx.beginPath();
    ctx.moveTo(0, r * TILE_SIZE);
    ctx.lineTo(W, r * TILE_SIZE);
    ctx.stroke();
  }
  ctx.setLineDash([]);

  trafficLanes.forEach(lane => {
    const vy = lane.row * TILE_SIZE + 8;
    lane.items.forEach(veh => {
      if (veh.isBlackTruck) {
        ctx.fillStyle = '#050505';
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2.5;
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 18;
        ctx.fillRect(veh.x, vy, lane.width, lane.height);
        ctx.strokeRect(veh.x, vy, lane.width, lane.height);
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(veh.x + 4, vy + 4, lane.width - 8, 4);
        ctx.shadowBlur = 0;
      } else {
        ctx.fillStyle = lane.color;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.shadowColor = lane.color;
        ctx.shadowBlur = 12;
        ctx.fillRect(veh.x, vy, lane.width, lane.height);
        ctx.strokeRect(veh.x, vy, lane.width, lane.height);
        ctx.shadowBlur = 0;
      }

      const lightX = lane.dir === 1 ? veh.x + lane.width - 4 : veh.x + 2;
      ctx.fillStyle = veh.isBlackTruck ? '#ef4444' : '#ffffff';
      ctx.fillRect(lightX, vy + 4, 3, 4);
      ctx.fillRect(lightX, vy + lane.height - 8, 3, 4);
    });
  });

  // 5. Safe Launchpad (Row 12)
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 12 * TILE_SIZE, W, TILE_SIZE);
  ctx.strokeStyle = '#22c55e';
  ctx.lineWidth = 2;
  ctx.strokeRect(2, 12 * TILE_SIZE + 2, W - 4, TILE_SIZE - 4);
  ctx.fillStyle = '#4ade80';
  ctx.font = 'bold 9px Orbitron, sans-serif';
  ctx.fillText('🚀 CYBER LAUNCHPAD', W / 2, 12 * TILE_SIZE + 24);

  // 6. Cyber Hopper Frog
  ctx.save();
  ctx.translate(player.x + TILE_SIZE / 2, player.y + TILE_SIZE / 2);

  if (player.facing === 'up') ctx.rotate(0);
  else if (player.facing === 'down') ctx.rotate(Math.PI);
  else if (player.facing === 'left') ctx.rotate(-Math.PI / 2);
  else if (player.facing === 'right') ctx.rotate(Math.PI / 2);

  ctx.fillStyle = '#22c55e';
  ctx.strokeStyle = '#86efac';
  ctx.lineWidth = 2;
  ctx.shadowColor = '#22c55e';
  ctx.shadowBlur = 14;

  ctx.beginPath();
  ctx.arc(0, 0, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#facc15';
  ctx.beginPath();
  ctx.arc(-6, -8, 3.5, 0, Math.PI * 2);
  ctx.arc(6, -8, 3.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#16a34a';
  ctx.fillRect(-12, 2, 5, 8);
  ctx.fillRect(7, 2, 5, 8);

  ctx.shadowBlur = 0;
  ctx.restore();

  // 7. Floating Text & Particles
  floatingTexts.forEach(ft => {
    ctx.fillStyle = ft.color;
    ctx.font = 'bold 12px Orbitron, sans-serif';
    ctx.shadowColor = ft.color;
    ctx.shadowBlur = 10;
    ctx.textAlign = 'center';
    ctx.fillText(ft.text, ft.x, ft.y);
    ctx.shadowBlur = 0;
  });

  particles.forEach(p => {
    ctx.fillStyle = p.color;
    ctx.globalAlpha = p.life;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalAlpha = 1;
}

function loop() {
  update();
  render();
  requestAnimationFrame(loop);
}

// --- 5. CONTROLS & EVENT LISTENERS ---
window.addEventListener('keydown', (e) => {
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', ' '].includes(e.key) || ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
    e.preventDefault();
  }

  if (!isPlaying && (e.code === 'Space' || e.code === 'Enter')) {
    startGame();
    return;
  }

  if (!isPlaying) return;

  if (e.code === 'ArrowUp' || e.code === 'KeyW') {
    if (player.row > 0) {
      player.row--;
      player.targetY = player.row * TILE_SIZE;
      player.targetX = player.x;
      player.facing = 'up';
      score += 10;
      audio.playHop();
    }
  } else if (e.code === 'ArrowDown' || e.code === 'KeyS') {
    if (player.row < 12) {
      player.row++;
      player.targetY = player.row * TILE_SIZE;
      player.targetX = player.x;
      player.facing = 'down';
      audio.playHop();
    }
  } else if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
    player.targetX = Math.max(10, player.x - TILE_SIZE);
    player.x = player.targetX;
    player.facing = 'left';
    audio.playHop();
  } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
    player.targetX = Math.min(W - TILE_SIZE - 10, player.x + TILE_SIZE);
    player.x = player.targetX;
    player.facing = 'right';
    audio.playHop();
  }
});

function startGame() {
  score = 0;
  level = 1;
  lives = 3;
  DOCK_BAYS.forEach(b => b.filled = false);
  initLanes();
  player.resetPos();
  document.getElementById('overlay').classList.add('hidden');
  document.getElementById('game-over-info').classList.add('hidden');
  isPlaying = true;
  audio.startBGM();
}

document.getElementById('start-btn').addEventListener('click', startGame);

initLanes();
loop();
