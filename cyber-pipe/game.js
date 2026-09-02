/**
 * Cyber Pipe: Energy Grid Hack — Retro Circuit Network Puzzle Engine
 */

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const hudLevel = document.getElementById('hud-level');
const hudTime = document.getElementById('hud-time');
const hudScore = document.getElementById('hud-score');
const startOverlay = document.getElementById('start-overlay');
const btnStart = document.getElementById('btn-start');
const btnResetLevel = document.getElementById('btn-reset-level');
const overlayTitle = document.getElementById('overlay-title');
const overlayDesc = document.getElementById('overlay-desc');

// --- 1. PROCEDURAL AUDIO SYNTHESIZER ---
class PipeAudio {
  constructor() {
    this.ctx = null;
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

  playRotate() {
    const actx = this.ensureCtx();
    if (!actx || actx.state === 'suspended') return;
    try {
      const osc = actx.createOscillator();
      const gain = actx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(400, actx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(700, actx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.12, actx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, actx.currentTime + 0.09);
      osc.connect(gain);
      gain.connect(actx.destination);
      osc.start();
      osc.stop(actx.currentTime + 0.1);
    } catch(e) {}
  }

  playWin() {
    const actx = this.ensureCtx();
    if (!actx || actx.state === 'suspended') return;
    try {
      [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
        const osc = actx.createOscillator();
        const gain = actx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, actx.currentTime + i * 0.08);
        gain.gain.setValueAtTime(0.18, actx.currentTime + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, actx.currentTime + i * 0.08 + 0.25);
        osc.connect(gain);
        gain.connect(actx.destination);
        osc.start(actx.currentTime + i * 0.08);
        osc.stop(actx.currentTime + i * 0.08 + 0.28);
      });
    } catch(e) {}
  }
}

const audio = new PipeAudio();

// --- 2. GAME STATE & PIPE GRID ---
const COLS = 7;
const ROWS = 5;
const TILE_SIZE = 70;
const OFFSET_X = 80;
const OFFSET_Y = 35;

let level = 1;
let score = 0;
let timeLeft = 45;
let timerInterval = null;
let gameState = 'PLAYING';

// Pipe Connections per type & rotation (0: North, 1: East, 2: South, 3: West)
// Type 0: Straight (N-S), Type 1: Elbow (N-E), Type 2: T-Junction (W-N-E), Type 3: Cross (N-E-S-W)
const PIPE_BASE_CONNECTIONS = [
  [true, false, true, false],  // Straight N-S
  [true, true, false, false],  // Elbow N-E
  [true, true, false, true],   // T-Junction W-N-E
  [true, true, true, true]     // Cross
];

let grid = [];
let particles = [];
let animOffset = 0;

function rotateConnections(baseConns, rot) {
  const res = [false, false, false, false];
  for (let i = 0; i < 4; i++) {
    if (baseConns[i]) {
      res[(i + rot) % 4] = true;
    }
  }
  return res;
}

function initGrid() {
  grid = [];
  for (let r = 0; r < ROWS; r++) {
    const row = [];
    for (let c = 0; c < COLS; c++) {
      const type = Math.floor(Math.random() * 3); // 0, 1, 2
      const rot = Math.floor(Math.random() * 4);  // 0, 1, 2, 3
      row.push({
        type,
        rot,
        connected: false
      });
    }
    grid.push(row);
  }

  // Force Start (0,0) and End (COLS-1, ROWS-1) to have open connections
  grid[0][0].type = 1; // Elbow
  grid[ROWS - 1][COLS - 1].type = 1;

  computeConnections();
}

function computeConnections() {
  // Reset all connection flags
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      grid[r][c].connected = false;
    }
  }

  // BFS from Start Node (0,0)
  const queue = [{ r: 0, c: 0 }];
  grid[0][0].connected = true;

  while (queue.length > 0) {
    const curr = queue.shift();
    const cConns = rotateConnections(PIPE_BASE_CONNECTIONS[grid[curr.r][curr.c].type], grid[curr.r][curr.c].rot);

    // Directions: 0: North (-r), 1: East (+c), 2: South (+r), 3: West (-c)
    const dirs = [
      { r: curr.r - 1, c: curr.c, dir: 0, opp: 2 },
      { r: curr.r, c: curr.c + 1, dir: 1, opp: 3 },
      { r: curr.r + 1, c: curr.c, dir: 2, opp: 0 },
      { r: curr.r, c: curr.c - 1, dir: 3, opp: 1 }
    ];

    dirs.forEach(d => {
      if (d.r >= 0 && d.r < ROWS && d.c >= 0 && d.c < COLS) {
        if (!grid[d.r][d.c].connected && cConns[d.dir]) {
          const neighborConns = rotateConnections(PIPE_BASE_CONNECTIONS[grid[d.r][d.c].type], grid[d.r][d.c].rot);
          if (neighborConns[d.opp]) {
            grid[d.r][d.c].connected = true;
            queue.push({ r: d.r, c: d.c });
          }
        }
      }
    });
  }

  // Check Win Condition (Terminal Node connected)
  if (grid[ROWS - 1][COLS - 1].connected) {
    audio.playWin();
    score += timeLeft * 100 + level * 500;
    gameState = 'WIN';
    clearInterval(timerInterval);

    overlayTitle.textContent = `MAINFRAME LEVEL ${level} HACKED!`;
    overlayDesc.textContent = `Plasma energy successfully routed! Score: ${score}`;
    startOverlay.classList.remove('hidden');
  }
}

function loadLevel(lvl) {
  level = lvl;
  timeLeft = Math.max(20, 50 - lvl * 3);
  hudLevel.textContent = `${level} / 10`;
  hudTime.textContent = `${timeLeft} S`;
  hudScore.textContent = String(score);

  initGrid();
  gameState = 'PLAYING';
  if (startOverlay) startOverlay.classList.add('hidden');

  if (timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    if (gameState !== 'PLAYING') return;
    timeLeft--;
    hudTime.textContent = `${timeLeft} S`;

    if (timeLeft <= 0) {
      gameState = 'GAMEOVER';
      clearInterval(timerInterval);
      overlayTitle.textContent = "GRID OVERLOAD!";
      overlayDesc.textContent = "Time expired before plasma grid connection was established!";
      startOverlay.classList.remove('hidden');
    }
  }, 1000);
}

canvas.addEventListener('click', (e) => {
  if (gameState !== 'PLAYING') return;

  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;

  const c = Math.floor((mx - OFFSET_X) / TILE_SIZE);
  const r = Math.floor((my - OFFSET_Y) / TILE_SIZE);

  if (c >= 0 && c < COLS && r >= 0 && r < ROWS) {
    audio.playRotate();
    grid[r][c].rot = (grid[r][c].rot + 1) % 4;
    addSparks(OFFSET_X + c * TILE_SIZE + TILE_SIZE / 2, OFFSET_Y + r * TILE_SIZE + TILE_SIZE / 2, '#10b981', 12);
    computeConnections();
  }
});

btnStart.addEventListener('click', () => {
  if (gameState === 'WIN') {
    loadLevel(level + 1);
  } else {
    score = 0;
    loadLevel(1);
  }
});

btnResetLevel.addEventListener('click', () => {
  loadLevel(level);
});

function addSparks(x, y, color, count = 15) {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 1 + Math.random() * 4;
    particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1,
      decay: 0.04,
      color: color || '#10b981'
    });
  }
}

// --- 3. RENDER LOOP ---
function drawPipeTile(x, y, type, rot, connected) {
  ctx.save();
  ctx.translate(x + TILE_SIZE / 2, y + TILE_SIZE / 2);
  ctx.rotate((rot * Math.PI) / 2);

  // Background Box
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(-TILE_SIZE / 2 + 2, -TILE_SIZE / 2 + 2, TILE_SIZE - 4, TILE_SIZE - 4);
  ctx.strokeStyle = connected ? '#10b981' : '#334155';
  ctx.lineWidth = 2;
  ctx.strokeRect(-TILE_SIZE / 2 + 2, -TILE_SIZE / 2 + 2, TILE_SIZE - 4, TILE_SIZE - 4);

  // Pipe Glow Color
  const pipeColor = connected ? '#10b981' : '#475569';
  ctx.strokeStyle = pipeColor;
  ctx.lineWidth = 14;
  ctx.lineCap = 'round';
  if (connected) {
    ctx.shadowColor = '#10b981';
    ctx.shadowBlur = 12;
  }

  // Draw Pipe Geometry based on Base Type
  ctx.beginPath();
  if (type === 0) { // Straight N-S
    ctx.moveTo(0, -TILE_SIZE / 2 + 6);
    ctx.lineTo(0, TILE_SIZE / 2 - 6);
  } else if (type === 1) { // Elbow N-E
    ctx.moveTo(0, -TILE_SIZE / 2 + 6);
    ctx.lineTo(0, 0);
    ctx.lineTo(TILE_SIZE / 2 - 6, 0);
  } else if (type === 2) { // T-Junction W-N-E
    ctx.moveTo(-TILE_SIZE / 2 + 6, 0);
    ctx.lineTo(TILE_SIZE / 2 - 6, 0);
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -TILE_SIZE / 2 + 6);
  } else if (type === 3) { // Cross
    ctx.moveTo(-TILE_SIZE / 2 + 6, 0);
    ctx.lineTo(TILE_SIZE / 2 - 6, 0);
    ctx.moveTo(0, -TILE_SIZE / 2 + 6);
    ctx.lineTo(0, TILE_SIZE / 2 - 6);
  }
  ctx.stroke();

  // Inner Plasma Core Line
  if (connected) {
    ctx.strokeStyle = '#67e8f9';
    ctx.lineWidth = 4;
    ctx.shadowBlur = 0;
    ctx.stroke();
  }

  ctx.restore();
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  animOffset = (animOffset + 0.05) % 1;

  // Draw Pipe Grid
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const tile = grid[r][c];
      const tx = OFFSET_X + c * TILE_SIZE;
      const ty = OFFSET_Y + r * TILE_SIZE;
      drawPipeTile(tx, ty, tile.type, tile.rot, tile.connected);
    }
  }

  // Draw Source & Terminal Labels
  ctx.save();
  ctx.font = 'bold 12px Orbitron';
  ctx.fillStyle = '#10b981';
  ctx.fillText("⚡ SOURCE CORE", OFFSET_X, OFFSET_Y - 10);
  ctx.fillStyle = '#ec4899';
  ctx.fillText("🔋 TERMINAL NODE 🔋", OFFSET_X + (COLS - 2) * TILE_SIZE, OFFSET_Y + ROWS * TILE_SIZE + 20);
  ctx.restore();

  // Draw Particles
  particles.forEach((pt, i) => {
    pt.x += pt.vx;
    pt.y += pt.vy;
    pt.life -= pt.decay;
    if (pt.life <= 0) {
      particles.splice(i, 1);
    } else {
      ctx.save();
      ctx.globalAlpha = pt.life;
      ctx.fillStyle = pt.color;
      ctx.fillRect(pt.x, pt.y, 3, 3);
      ctx.restore();
    }
  });
}

function gameLoop() {
  draw();
  requestAnimationFrame(gameLoop);
}

// Auto-start on load!
loadLevel(1);
requestAnimationFrame(gameLoop);
