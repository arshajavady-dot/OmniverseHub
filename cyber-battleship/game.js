/**
 * Cyber Battleship: Fleet Command — Tactical Radar Battleship Engine
 */

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const hudUserShips = document.getElementById('hud-user-ships');
const hudAiShips = document.getElementById('hud-ai-ships');
const hudStatus = document.getElementById('hud-status');
const startOverlay = document.getElementById('start-overlay');
const btnStart = document.getElementById('btn-start');
const btnRedeploy = document.getElementById('btn-redeploy');
const overlayTitle = document.getElementById('overlay-title');
const overlayDesc = document.getElementById('overlay-desc');

// --- 1. PROCEDURAL AUDIO SYNTHESIZER ---
class BattleshipAudio {
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

  playSonar() {
    const actx = this.ensureCtx();
    if (!actx || actx.state === 'suspended') return;
    try {
      const osc = actx.createOscillator();
      const gain = actx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, actx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, actx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.15, actx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, actx.currentTime + 0.18);
      osc.connect(gain);
      gain.connect(actx.destination);
      osc.start();
      osc.stop(actx.currentTime + 0.2);
    } catch(e) {}
  }

  playHit() {
    const actx = this.ensureCtx();
    if (!actx || actx.state === 'suspended') return;
    try {
      const osc = actx.createOscillator();
      const gain = actx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(250, actx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(40, actx.currentTime + 0.25);
      gain.gain.setValueAtTime(0.25, actx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, actx.currentTime + 0.28);
      osc.connect(gain);
      gain.connect(actx.destination);
      osc.start();
      osc.stop(actx.currentTime + 0.3);
    } catch(e) {}
  }

  playMiss() {
    const actx = this.ensureCtx();
    if (!actx || actx.state === 'suspended') return;
    try {
      const osc = actx.createOscillator();
      const gain = actx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(300, actx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(100, actx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.08, actx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, actx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(actx.destination);
      osc.start();
      osc.stop(actx.currentTime + 0.14);
    } catch(e) {}
  }
}

const audio = new BattleshipAudio();

// --- 2. GAME STATE & FLEET DATA ---
const GRID_SIZE = 10;
const CELL_SIZE = 26;
const USER_GRID_OFFSET_X = 350;
const AI_GRID_OFFSET_X = 30;
const GRID_OFFSET_Y = 80;

const SHIP_TYPES = [
  { name: 'Carrier', size: 5, color: '#ec4899' },
  { name: 'Battleship', size: 4, color: '#a855f7' },
  { name: 'Cruiser', size: 3, color: '#38bdf8' },
  { name: 'Submarine', size: 3, color: '#10b981' },
  { name: 'Destroyer', size: 2, color: '#f59e0b' }
];

let userBoard = []; // 10x10 null or ship index
let aiBoard = [];
let userShots = []; // 10x10 0 = none, 1 = miss, 2 = hit
let aiShots = [];
let userShips = [];
let aiShips = [];

let gameState = 'PLAYING';
let turn = 'user'; // 'user' or 'ai'
let particles = [];
let radarSweepAngle = 0;

function createEmptyGrid() {
  const g = [];
  for (let r = 0; r < GRID_SIZE; r++) {
    const row = [];
    for (let c = 0; c < GRID_SIZE; c++) row.push(null);
    g.push(row);
  }
  return g;
}

function createEmptyShots() {
  const g = [];
  for (let r = 0; r < GRID_SIZE; r++) {
    const row = [];
    for (let c = 0; c < GRID_SIZE; c++) row.push(0);
    g.push(row);
  }
  return g;
}

function placeFleetRandomly(board, shipsData) {
  const ships = [];
  shipsData.forEach((sInfo, index) => {
    let placed = false;
    while (!placed) {
      const horiz = Math.random() < 0.5;
      const r = Math.floor(Math.random() * (horiz ? GRID_SIZE : GRID_SIZE - sInfo.size + 1));
      const c = Math.floor(Math.random() * (horiz ? GRID_SIZE - sInfo.size + 1 : GRID_SIZE));

      let fits = true;
      for (let i = 0; i < sInfo.size; i++) {
        const nr = horiz ? r : r + i;
        const nc = horiz ? c + i : c;
        if (board[nr][nc] !== null) { fits = false; break; }
      }

      if (fits) {
        const shipObj = { ...sInfo, id: index, hits: 0, coords: [] };
        for (let i = 0; i < sInfo.size; i++) {
          const nr = horiz ? r : r + i;
          const nc = horiz ? c + i : c;
          board[nr][nc] = index;
          shipObj.coords.push({ r: nr, c: nc });
        }
        ships.push(shipObj);
        placed = true;
      }
    }
  });
  return ships;
}

function initGame() {
  userBoard = createEmptyGrid();
  aiBoard = createEmptyGrid();
  userShots = createEmptyShots();
  aiShots = createEmptyShots();

  userShips = placeFleetRandomly(userBoard, SHIP_TYPES);
  aiShips = placeFleetRandomly(aiBoard, SHIP_TYPES);

  turn = 'user';
  gameState = 'PLAYING';
  particles = [];
  if (startOverlay) startOverlay.classList.add('hidden');
  updateHUD();
}

function updateHUD() {
  const userAlive = userShips.filter(s => s.hits < s.size).length;
  const aiAlive = aiShips.filter(s => s.hits < s.size).length;

  hudUserShips.textContent = `${userAlive} / 5`;
  hudAiShips.textContent = `${aiAlive} / 5`;
  hudStatus.textContent = turn === 'user' ? "YOUR TURN: TARGET ENEMY RADAR" : "MAINFRAME RADAR SCANNING...";

  if (aiAlive === 0) {
    gameState = 'GAMEOVER';
    overlayTitle.textContent = "VICTORY! ENEMY FLEET SUNK!";
    overlayDesc.textContent = "You destroyed the entire enemy mainframe navy!";
    startOverlay.classList.remove('hidden');
  } else if (userAlive === 0) {
    gameState = 'GAMEOVER';
    overlayTitle.textContent = "FLEET DESTROYED!";
    overlayDesc.textContent = "Mainframe AI sunk your fleet!";
    startOverlay.classList.remove('hidden');
  }
}

btnStart.addEventListener('click', initGame);
btnRedeploy.addEventListener('click', () => {
  if (gameState === 'PLAYING') {
    userBoard = createEmptyGrid();
    userShips = placeFleetRandomly(userBoard, SHIP_TYPES);
  }
});

canvas.addEventListener('click', (e) => {
  if (gameState !== 'PLAYING' || turn !== 'user') return;

  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;

  const c = Math.floor((mx - AI_GRID_OFFSET_X) / CELL_SIZE);
  const r = Math.floor((my - GRID_OFFSET_Y) / CELL_SIZE);

  if (c >= 0 && c < GRID_SIZE && r >= 0 && r < GRID_SIZE) {
    if (userShots[r][c] !== 0) return; // Already shot

    audio.playSonar();
    const shipId = aiBoard[r][c];

    if (shipId !== null) {
      userShots[r][c] = 2; // Hit
      audio.playHit();
      addSparks(AI_GRID_OFFSET_X + c * CELL_SIZE + CELL_SIZE / 2, GRID_OFFSET_Y + r * CELL_SIZE + CELL_SIZE / 2, '#ec4899', 20);
      aiShips[shipId].hits++;
    } else {
      userShots[r][c] = 1; // Miss
      audio.playMiss();
    }

    turn = 'ai';
    updateHUD();

    if (gameState === 'PLAYING') {
      setTimeout(makeAiShot, 600);
    }
  }
});

function makeAiShot() {
  if (gameState !== 'PLAYING') return;

  let r, c;
  let validShot = false;

  // AI Target Intelligence
  while (!validShot) {
    r = Math.floor(Math.random() * GRID_SIZE);
    c = Math.floor(Math.random() * GRID_SIZE);
    if (aiShots[r][c] === 0) validShot = true;
  }

  const shipId = userBoard[r][c];
  if (shipId !== null) {
    aiShots[r][c] = 2; // Hit
    audio.playHit();
    addSparks(USER_GRID_OFFSET_X + c * CELL_SIZE + CELL_SIZE / 2, GRID_OFFSET_Y + r * CELL_SIZE + CELL_SIZE / 2, '#38bdf8', 20);
    userShips[shipId].hits++;
  } else {
    aiShots[r][c] = 1; // Miss
    audio.playMiss();
  }

  turn = 'user';
  updateHUD();
}

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
      color: color || '#38bdf8'
    });
  }
}

// --- 3. RENDER LOOP ---
function drawGrid(offsetX, offsetY, title, boardData, shotsData, showShips) {
  ctx.save();

  // Grid Header Title
  ctx.font = 'bold 12px Orbitron';
  ctx.fillStyle = '#38bdf8';
  ctx.fillText(title, offsetX, offsetY - 12);

  // Grid Border & Cells
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      const cx = offsetX + c * CELL_SIZE;
      const cy = offsetY + r * CELL_SIZE;

      ctx.fillStyle = '#0f172a';
      ctx.fillRect(cx, cy, CELL_SIZE, CELL_SIZE);
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.2)';
      ctx.strokeRect(cx, cy, CELL_SIZE, CELL_SIZE);

      // Render Ships (If Visible)
      if (showShips && boardData[r][c] !== null) {
        const sId = boardData[r][c];
        ctx.fillStyle = SHIP_TYPES[sId].color;
        ctx.shadowColor = SHIP_TYPES[sId].color;
        ctx.shadowBlur = 6;
        ctx.fillRect(cx + 2, cy + 2, CELL_SIZE - 4, CELL_SIZE - 4);
        ctx.shadowBlur = 0;
      }

      // Render Shots
      const shot = shotsData[r][c];
      if (shot === 1) { // Miss
        ctx.fillStyle = '#64748b';
        ctx.beginPath();
        ctx.arc(cx + CELL_SIZE / 2, cy + CELL_SIZE / 2, 4, 0, Math.PI * 2);
        ctx.fill();
      } else if (shot === 2) { // Hit
        ctx.fillStyle = '#ec4899';
        ctx.shadowColor = '#ec4899';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(cx + CELL_SIZE / 2, cy + CELL_SIZE / 2, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }
  }

  ctx.restore();
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  radarSweepAngle += 0.02;

  // Draw Both 10x10 Tactical Radar Grids
  drawGrid(AI_GRID_OFFSET_X, GRID_OFFSET_Y, "ENEMY TARGET RADAR (CLICK TO STRIKE)", aiBoard, userShots, false);
  drawGrid(USER_GRID_OFFSET_X, GRID_OFFSET_Y, "YOUR STEALTH FLEET GRID", userBoard, aiShots, true);

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
initGame();
requestAnimationFrame(gameLoop);
