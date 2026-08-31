/**
 * Cyber Pac: Neon Maze — Retro Cyber Arcade Engine
 */

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const TILE_SIZE = 18;
const COLS = 28;
const ROWS = 31;

canvas.width = COLS * TILE_SIZE;
canvas.height = ROWS * TILE_SIZE;

// --- 1. WEB AUDIO SYNTHESIZER & BGM ENGINE ---
class PacAudioEngine {
  constructor() {
    this.ctx = null;
    this.wakaToggle = false;
    this.isPlayingBGM = false;
    this.bgmTimer = null;
    this.step = 0;
    this.tempo = 132;
    this.bassNotes = [110.00, 87.31, 130.81, 98.00]; // Am, F, C, G
    this.melodyNotes = [
      440, 523.25, 659.25, 523.25, 783.99, 659.25, 523.25, 659.25,
      349.23, 440, 523.25, 440, 659.25, 523.25, 440, 523.25,
      523.25, 659.25, 783.99, 659.25, 1046.50, 783.99, 659.25, 783.99,
      392.00, 493.88, 587.33, 493.88, 783.99, 587.33, 493.88, 587.33
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
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(bass, now);
        gain.gain.setValueAtTime(0.08, now);
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
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.09);
      }

      if (step % 8 === 0) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.exponentialRampToValueAtTime(36, now + 0.11);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.11);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.11);
      }
    } catch(e) {}
  }

  playWaka() {
    const actx = this.ensureCtx();
    if (!actx) return;
    try {
      const now = actx.currentTime;
      const osc = actx.createOscillator();
      const gain = actx.createGain();
      osc.type = 'triangle';
      const freq = this.wakaToggle ? 440 : 330;
      this.wakaToggle = !this.wakaToggle;
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq - 100, now + 0.08);

      gain.gain.setValueAtTime(0.09, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(actx.destination);
      osc.start(now);
      osc.stop(now + 0.08);
    } catch(e) {}
  }

  playEatGhost() {
    const actx = this.ensureCtx();
    if (!actx) return;
    try {
      const now = actx.currentTime;
      const osc = actx.createOscillator();
      const gain = actx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.exponentialRampToValueAtTime(1200, now + 0.25);

      gain.gain.setValueAtTime(0.14, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gain);
      gain.connect(actx.destination);
      osc.start(now);
      osc.stop(now + 0.25);
    } catch(e) {}
  }

  playPowerup() {
    const actx = this.ensureCtx();
    if (!actx) return;
    try {
      const now = actx.currentTime;
      [392, 523, 659, 784].forEach((freq, i) => {
        const osc = actx.createOscillator();
        const gain = actx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now + i * 0.06);
        gain.gain.setValueAtTime(0.1, now + i * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.1);

        osc.connect(gain);
        gain.connect(actx.destination);
        osc.start(now + i * 0.06);
        osc.stop(now + i * 0.06 + 0.1);
      });
    } catch(e) {}
  }

  playDeath() {
    const actx = this.ensureCtx();
    if (!actx) return;
    try {
      const now = actx.currentTime;
      const osc = actx.createOscillator();
      const gain = actx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.6);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

      osc.connect(gain);
      gain.connect(actx.destination);
      osc.start(now);
      osc.stop(now + 0.6);
    } catch(e) {}
  }

  playDash() {
    const actx = this.ensureCtx();
    if (!actx) return;
    try {
      const now = actx.currentTime;
      const osc = actx.createOscillator();
      const gain = actx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(1400, now + 0.18);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      osc.connect(gain);
      gain.connect(actx.destination);
      osc.start(now);
      osc.stop(now + 0.18);
    } catch(e) {}
  }
}

const audio = new PacAudioEngine();

// --- 2. CLASSIC NEON MAZE MAP MATRIX (28x31) ---
// 1 = Wall, 0 = Dot, 2 = Empty, 3 = Energizer, 4 = Ghost Door, 5 = Ghost House
const BASE_MAP = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,1,1,0,1,1,1,1,1,0,1,1,0,1,1,1,1,1,0,1,1,1,1,0,1],
  [1,3,1,1,1,1,0,1,1,1,1,1,0,1,1,0,1,1,1,1,1,0,1,1,1,1,3,1],
  [1,0,1,1,1,1,0,1,1,1,1,1,0,1,1,0,1,1,1,1,1,0,1,1,1,1,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,1,1,0,1,1,0,1,1,1,1,1,1,1,1,0,1,1,0,1,1,1,1,0,1],
  [1,0,1,1,1,1,0,1,1,0,1,1,1,1,1,1,1,1,0,1,1,0,1,1,1,1,0,1],
  [1,0,0,0,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0,0,0,1],
  [1,1,1,1,1,1,0,1,1,1,1,1,2,1,1,2,1,1,1,1,1,0,1,1,1,1,1,1],
  [2,2,2,2,2,1,0,1,1,1,1,1,2,1,1,2,1,1,1,1,1,0,1,2,2,2,2,2],
  [2,2,2,2,2,1,0,1,1,2,2,2,2,2,2,2,2,2,2,1,1,0,1,2,2,2,2,2],
  [2,2,2,2,2,1,0,1,1,2,1,1,1,4,4,1,1,1,2,1,1,0,1,2,2,2,2,2],
  [1,1,1,1,1,1,0,1,1,2,1,5,5,5,5,5,5,1,2,1,1,0,1,1,1,1,1,1],
  [2,2,2,2,2,2,0,2,2,2,1,5,5,5,5,5,5,1,2,2,2,0,2,2,2,2,2,2],
  [1,1,1,1,1,1,0,1,1,2,1,5,5,5,5,5,5,1,2,1,1,0,1,1,1,1,1,1],
  [2,2,2,2,2,1,0,1,1,2,1,1,1,1,1,1,1,1,2,1,1,0,1,2,2,2,2,2],
  [2,2,2,2,2,1,0,1,1,2,2,2,2,2,2,2,2,2,2,1,1,0,1,2,2,2,2,2],
  [2,2,2,2,2,1,0,1,1,2,1,1,1,1,1,1,1,1,2,1,1,0,1,2,2,2,2,2],
  [1,1,1,1,1,1,0,1,1,2,1,1,1,1,1,1,1,1,2,1,1,0,1,1,1,1,1,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,1,1,0,1,1,1,1,1,0,1,1,0,1,1,1,1,1,0,1,1,1,1,0,1],
  [1,0,1,1,1,1,0,1,1,1,1,1,0,1,1,0,1,1,1,1,1,0,1,1,1,1,0,1],
  [1,3,0,0,1,1,0,0,0,0,0,0,0,2,2,0,0,0,0,0,0,0,1,1,0,0,3,1],
  [1,1,1,0,1,1,0,1,1,0,1,1,1,1,1,1,1,1,0,1,1,0,1,1,0,1,1,1],
  [1,1,1,0,1,1,0,1,1,0,1,1,1,1,1,1,1,1,0,1,1,0,1,1,0,1,1,1],
  [1,0,0,0,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0,0,0,1],
  [1,0,1,1,1,1,1,1,1,1,1,1,0,1,1,0,1,1,1,1,1,1,1,1,1,1,0,1],
  [1,0,1,1,1,1,1,1,1,1,1,1,0,1,1,0,1,1,1,1,1,1,1,1,1,1,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

let map = [];
let totalPellets = 0;
let pelletsEaten = 0;
let score = 0;
let stage = 1;
let highScore = parseInt(localStorage.getItem('cyber_pac_highscore') || '0', 10);
let lives = 3;
let isPlaying = false;
let frightTimer = 0;
let ghostsEatenInStreak = 0;
let fruit = null;
let fruitSpawnedCount = 0;
let particles = [];

// --- 3. PAC-MAN ENTITY ---
const pacman = {
  x: 13.5 * TILE_SIZE,
  y: 23.5 * TILE_SIZE,
  dirX: 0,
  dirY: 0,
  nextDirX: 0,
  nextDirY: 0,
  speed: 2.0,
  baseSpeed: 2.0,
  radius: 8,
  mouthAngle: 0.2,
  mouthSpeed: 0.08,
  mouthDir: 1,
  dashCooldown: 0,
  maxDashCooldown: 180,
  isDashing: false,
  dashDuration: 0,

  resetPos() {
    this.x = 13.5 * TILE_SIZE;
    this.y = 23.5 * TILE_SIZE;
    this.dirX = 0;
    this.dirY = 0;
    this.nextDirX = 0;
    this.nextDirY = 0;
    this.isDashing = false;
  }
};

// --- 4. GHOSTS CONFIGURATION ---
const GHOST_DEFS = [
  { id: 'vortex', name: 'VORTEX', color: '#ef4444', scatterX: 25, scatterY: 0, spawnX: 13.5, spawnY: 11.5, homeX: 13.5, homeY: 14.5 },
  { id: 'glitch', name: 'GLITCH', color: '#f472b6', scatterX: 2, scatterY: 0, spawnX: 13.5, spawnY: 14.5, homeX: 13.5, homeY: 14.5 },
  { id: 'pulse', name: 'PULSE', color: '#06b6d4', scatterX: 27, scatterY: 30, spawnX: 11.5, spawnY: 14.5, homeX: 11.5, homeY: 14.5 },
  { id: 'echo', name: 'ECHO', color: '#f59e0b', scatterX: 0, scatterY: 30, spawnX: 15.5, spawnY: 14.5, homeX: 15.5, homeY: 14.5 }
];

let ghosts = [];

function initGhosts() {
  const gSpeed = 1.75 + Math.min(1.0, (stage - 1) * 0.12);
  ghosts = GHOST_DEFS.map((def, idx) => ({
    ...def,
    x: def.spawnX * TILE_SIZE,
    y: def.spawnY * TILE_SIZE,
    dirX: idx === 0 ? -1 : 0,
    dirY: idx === 0 ? 0 : -1,
    speed: gSpeed,
    isEaten: false,
    inHouse: idx > 0,
    houseTimer: idx * 80,
    lastTileX: -1,
    lastTileY: -1
  }));
}

function resetLevel() {
  map = BASE_MAP.map(row => [...row]);
  totalPellets = 0;
  pelletsEaten = 0;
  fruit = null;
  fruitSpawnedCount = 0;

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (map[r][c] === 0 || map[r][c] === 3) {
        totalPellets++;
      }
    }
  }

  pacman.baseSpeed = 2.0 + Math.min(0.6, (stage - 1) * 0.08);
  pacman.speed = pacman.baseSpeed;
  pacman.resetPos();
  initGhosts();
}

// Tile Collision Rules
function isTileWall(col, row, isGhost = false, isEaten = false) {
  if (col < 0 || col >= COLS) return false; // Tunnel wrap
  if (row < 0 || row >= ROWS) return true;
  const tile = map[row][col];
  if (tile === 1) return true; // Wall
  if (tile === 4) {
    // Ghost House Door: Only passable for eaten ghost eyes returning, NEVER for roaming living ghosts!
    return !isEaten;
  }
  if (tile === 5) {
    // Ghost House Interior: Only passable for eaten ghost eyes returning!
    return !isEaten;
  }
  return false;
}

// --- 5. GAME UPDATE LOOP ---
function update() {
  if (!isPlaying) return;

  if (window.parent && window.parent !== window) {
    window.parent.postMessage({ type: 'SCORE_UPDATE', score: score }, '*');
  }

  // 1. Dash Cooldown & Duration
  if (pacman.dashCooldown > 0) pacman.dashCooldown--;
  if (pacman.isDashing) {
    pacman.dashDuration--;
    if (pacman.dashDuration <= 0) {
      pacman.isDashing = false;
      pacman.speed = pacman.baseSpeed;
    }
  }

  // 2. Pacman Movement & Tile Grid Navigation
  const curCol = Math.floor(pacman.x / TILE_SIZE);
  const curRow = Math.floor(pacman.y / TILE_SIZE);
  const centerX = curCol * TILE_SIZE + TILE_SIZE / 2;
  const centerY = curRow * TILE_SIZE + TILE_SIZE / 2;

  // Check turning inputs
  if (pacman.nextDirX !== 0 || pacman.nextDirY !== 0) {
    if (pacman.nextDirX === -pacman.dirX && pacman.nextDirY === -pacman.dirY) {
      pacman.dirX = pacman.nextDirX;
      pacman.dirY = pacman.nextDirY;
      pacman.nextDirX = 0;
      pacman.nextDirY = 0;
    } else if (pacman.dirX === 0 && pacman.dirY === 0) {
      const nextCol = curCol + pacman.nextDirX;
      const nextRow = curRow + pacman.nextDirY;
      if (!isTileWall(nextCol, nextRow, false, false)) {
        pacman.dirX = pacman.nextDirX;
        pacman.dirY = pacman.nextDirY;
        pacman.nextDirX = 0;
        pacman.nextDirY = 0;
      }
    } else {
      const distToCenter = Math.hypot(pacman.x - centerX, pacman.y - centerY);
      if (distToCenter <= pacman.speed * 1.8) {
        const nextCol = curCol + pacman.nextDirX;
        const nextRow = curRow + pacman.nextDirY;
        if (!isTileWall(nextCol, nextRow, false, false)) {
          pacman.x = centerX;
          pacman.y = centerY;
          pacman.dirX = pacman.nextDirX;
          pacman.dirY = pacman.nextDirY;
          pacman.nextDirX = 0;
          pacman.nextDirY = 0;
        }
      }
    }
  }

  // Continuous movement
  if (pacman.dirX !== 0 || pacman.dirY !== 0) {
    const nextCol = curCol + pacman.dirX;
    const nextRow = curRow + pacman.dirY;

    if (!isTileWall(nextCol, nextRow, false, false)) {
      pacman.x += pacman.dirX * pacman.speed;
      pacman.y += pacman.dirY * pacman.speed;
    } else {
      if (pacman.dirX === 1 && pacman.x < centerX) pacman.x = Math.min(centerX, pacman.x + pacman.speed);
      else if (pacman.dirX === -1 && pacman.x > centerX) pacman.x = Math.max(centerX, pacman.x - pacman.speed);
      else if (pacman.dirY === 1 && pacman.y < centerY) pacman.y = Math.min(centerY, pacman.y + pacman.speed);
      else if (pacman.dirY === -1 && pacman.y > centerY) pacman.y = Math.max(centerY, pacman.y - pacman.speed);
      else {
        pacman.x = centerX;
        pacman.y = centerY;
        pacman.dirX = 0;
        pacman.dirY = 0;
      }
    }
  }

  // Tunnel wrap
  if (pacman.x < 0) pacman.x = COLS * TILE_SIZE - 2;
  if (pacman.x > COLS * TILE_SIZE) pacman.x = 2;

  // Mouth animation
  pacman.mouthAngle += pacman.mouthSpeed * pacman.mouthDir;
  if (pacman.mouthAngle > 0.4 || pacman.mouthAngle < 0.05) {
    pacman.mouthDir *= -1;
  }

  // 3. Eating Pellets & Energizers
  const tileX = Math.floor(pacman.x / TILE_SIZE);
  const tileY = Math.floor(pacman.y / TILE_SIZE);

  if (tileX >= 0 && tileX < COLS && tileY >= 0 && tileY < ROWS) {
    const tileVal = map[tileY][tileX];
    if (tileVal === 0) {
      map[tileY][tileX] = 2;
      score += 10;
      pelletsEaten++;
      audio.playWaka();
      spawnSparkles(pacman.x, pacman.y, '#facc15');
      checkFruitSpawn();
    } else if (tileVal === 3) {
      map[tileY][tileX] = 2;
      score += 50;
      pelletsEaten++;
      frightTimer = 550;
      ghostsEatenInStreak = 0;
      audio.playPowerup();
      spawnSparkles(pacman.x, pacman.y, '#38bdf8', 16);
      checkFruitSpawn();
    }
  }

  // 4. Quantum Microchip Bonus
  if (fruit) {
    fruit.life--;
    if (Math.hypot(pacman.x - fruit.x, pacman.y - fruit.y) < TILE_SIZE) {
      score += fruit.points;
      audio.playEatGhost();
      spawnSparkles(fruit.x, fruit.y, '#10b981', 20);
      fruit = null;
    } else if (fruit.life <= 0) {
      fruit = null;
    }
  }

  // 5. Level Clear
  if (pelletsEaten >= totalPellets && totalPellets > 0) {
    score += 1000 * stage;
    stage++;
    audio.playPowerup();
    resetLevel();
    spawnSparkles(pacman.x, pacman.y, '#facc15', 30);
    return;
  }

  // 6. Fright Timer
  if (frightTimer > 0) frightTimer--;

  // 7. Update AI Ghosts
  ghosts.forEach(ghost => {
    // Step 1: Ghost house release sequence
    if (ghost.inHouse) {
      ghost.houseTimer--;
      if (ghost.houseTimer <= 0) {
        // Move towards center door X
        if (Math.abs(ghost.x - 13.5 * TILE_SIZE) > 1) {
          ghost.x += (13.5 * TILE_SIZE > ghost.x ? 1 : -1) * 1.2;
        } else {
          ghost.x = 13.5 * TILE_SIZE;
          ghost.y -= 1.2;
          if (ghost.y <= 11.5 * TILE_SIZE) {
            ghost.inHouse = false;
            ghost.x = 13.5 * TILE_SIZE;
            ghost.y = 11.5 * TILE_SIZE;
            ghost.dirX = (Math.random() > 0.5 ? 1 : -1);
            ghost.dirY = 0;
            ghost.lastTileX = 13;
            ghost.lastTileY = 11;
          }
        }
      }
      return;
    }

    let gSpeed = ghost.speed;
    if (ghost.isEaten) gSpeed = 3.5;
    else if (frightTimer > 0) gSpeed = 1.15;
    else if (pacman.isDashing) gSpeed = 1.75;

    const gCol = Math.floor(ghost.x / TILE_SIZE);
    const gRow = Math.floor(ghost.y / TILE_SIZE);
    const gCenterX = gCol * TILE_SIZE + TILE_SIZE / 2;
    const gCenterY = gRow * TILE_SIZE + TILE_SIZE / 2;

    const distToCenter = Math.hypot(ghost.x - gCenterX, ghost.y - gCenterY);

    // AI Turn Decisions at corridor intersections
    if (distToCenter <= gSpeed && (gCol !== ghost.lastTileX || gRow !== ghost.lastTileY)) {
      ghost.lastTileX = gCol;
      ghost.lastTileY = gRow;
      ghost.x = gCenterX;
      ghost.y = gCenterY;

      let targetX = pacman.x / TILE_SIZE;
      let targetY = pacman.y / TILE_SIZE;

      if (ghost.isEaten) {
        targetX = 13.5;
        targetY = 14.5;
        // When eyes reach the ghost house, regenerate body and start exit sequence!
        if (Math.hypot(ghost.x - 13.5 * TILE_SIZE, ghost.y - 14.5 * TILE_SIZE) < TILE_SIZE * 1.2) {
          ghost.isEaten = false;
          ghost.inHouse = true;
          ghost.houseTimer = 30; // Half second to reform before exiting
          return;
        }
      } else if (frightTimer > 0) {
        targetX = Math.random() * COLS;
        targetY = Math.random() * ROWS;
      } else {
        if (ghost.id === 'vortex') {
          targetX = pacman.x / TILE_SIZE;
          targetY = pacman.y / TILE_SIZE;
        } else if (ghost.id === 'glitch') {
          targetX = (pacman.x / TILE_SIZE) + pacman.dirX * 4;
          targetY = (pacman.y / TILE_SIZE) + pacman.dirY * 4;
        } else if (ghost.id === 'pulse') {
          const b = ghosts[0];
          const midX = (pacman.x / TILE_SIZE) + pacman.dirX * 2;
          const midY = (pacman.y / TILE_SIZE) + pacman.dirY * 2;
          targetX = midX + (midX - b.x / TILE_SIZE);
          targetY = midY + (midY - b.y / TILE_SIZE);
        } else if (ghost.id === 'echo') {
          const distToPac = Math.hypot(ghost.x - pacman.x, ghost.y - pacman.y) / TILE_SIZE;
          if (distToPac < 8) {
            targetX = ghost.scatterX;
            targetY = ghost.scatterY;
          } else {
            targetX = pacman.x / TILE_SIZE;
            targetY = pacman.y / TILE_SIZE;
          }
        }
      }

      // Valid open turns (cannot 180 reverse unless blocked)
      const possibleDirs = [
        { dx: 0, dy: -1 },
        { dx: -1, dy: 0 },
        { dx: 0, dy: 1 },
        { dx: 1, dy: 0 }
      ].filter(d => !(d.dx === -ghost.dirX && d.dy === -ghost.dirY));

      let validDirs = possibleDirs.filter(d => !isTileWall(gCol + d.dx, gRow + d.dy, true, ghost.isEaten));

      if (validDirs.length === 0) {
        validDirs = [{ dx: -ghost.dirX, dy: -ghost.dirY }];
      }

      let bestDir = validDirs[0];
      let bestDist = 999999;

      validDirs.forEach(d => {
        const nextC = gCol + d.dx;
        const nextR = gRow + d.dy;
        const dist = Math.hypot(nextC - targetX, nextR - targetY);
        if (dist < bestDist) {
          bestDist = dist;
          bestDir = d;
        }
      });

      if (bestDir) {
        ghost.dirX = bestDir.dx;
        ghost.dirY = bestDir.dy;
      }
    }

    ghost.x += ghost.dirX * gSpeed;
    ghost.y += ghost.dirY * gSpeed;

    // Tunnel wrap
    if (ghost.x < 0) ghost.x = COLS * TILE_SIZE - 2;
    if (ghost.x > COLS * TILE_SIZE) ghost.x = 2;

    // Player & Ghost Collisions
    const distToPac = Math.hypot(ghost.x - pacman.x, ghost.y - pacman.y);
    if (distToPac < TILE_SIZE * 0.75) {
      if (frightTimer > 0 && !ghost.isEaten) {
        ghost.isEaten = true;
        ghostsEatenInStreak++;
        const pts = Math.pow(2, ghostsEatenInStreak) * 100;
        score += pts;
        audio.playEatGhost();
        spawnSparkles(ghost.x, ghost.y, '#38bdf8', 24);
      } else if (!ghost.isEaten) {
        lives--;
        audio.playDeath();
        spawnSparkles(pacman.x, pacman.y, '#facc15', 30);
        if (lives <= 0) {
          gameOver();
        } else {
          pacman.resetPos();
          initGhosts();
        }
      }
    }
  });

  // 8. Update Particles
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.life -= 0.035;
    if (p.life <= 0) particles.splice(i, 1);
  }

  // Update UI HUD
  document.getElementById('score').textContent = score.toString().padStart(5, '0');
  document.getElementById('stage-val').textContent = `STAGE ${stage}`;
  if (score > highScore) {
    highScore = score;
    localStorage.setItem('cyber_pac_highscore', highScore.toString());
  }
  document.getElementById('high-score').textContent = highScore.toString().padStart(5, '0');

  const dashPct = 100 - (pacman.dashCooldown / pacman.maxDashCooldown) * 100;
  document.getElementById('dash-bar').style.width = `${dashPct}%`;

  const livesContainer = document.getElementById('lives-container');
  livesContainer.innerHTML = '';
  for (let i = 0; i < lives; i++) {
    const span = document.createElement('span');
    span.className = 'life-icon';
    span.textContent = '🟡';
    livesContainer.appendChild(span);
  }
}

function checkFruitSpawn() {
  if (pelletsEaten === 60 || pelletsEaten === 150) {
    fruit = {
      x: 13.5 * TILE_SIZE,
      y: 17.5 * TILE_SIZE,
      points: 300 + fruitSpawnedCount * 200,
      life: 500
    };
    fruitSpawnedCount++;
  }
}

function spawnSparkles(x, y, color, count = 8) {
  for (let i = 0; i < count; i++) {
    particles.push({
      x: x,
      y: y,
      vx: (Math.random() - 0.5) * 4,
      vy: (Math.random() - 0.5) * 4,
      color: color,
      life: 1
    });
  }
}

function gameOver() {
  isPlaying = false;
  audio.stopBGM();
  document.getElementById('final-stage-val').textContent = `STAGE ${stage}`;
  document.getElementById('final-score-val').textContent = score;
  document.getElementById('game-over-info').classList.remove('hidden');
  document.getElementById('overlay').classList.remove('hidden');
}

// --- 6. RENDER ENGINE ---
function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 1. Draw Walls & Pellets
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const tile = map[r][c];
      const px = c * TILE_SIZE;
      const py = r * TILE_SIZE;

      if (tile === 1) {
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
        ctx.strokeStyle = '#2563eb';
        ctx.lineWidth = 1.5;
        ctx.shadowColor = '#3b82f6';
        ctx.shadowBlur = 8;
        ctx.strokeRect(px + 1, py + 1, TILE_SIZE - 2, TILE_SIZE - 2);
        ctx.shadowBlur = 0;
      } else if (tile === 4) {
        ctx.fillStyle = '#f43f5e';
        ctx.fillRect(px, py + TILE_SIZE / 2 - 2, TILE_SIZE, 4);
      } else if (tile === 0) {
        ctx.fillStyle = '#fef08a';
        ctx.shadowColor = '#facc15';
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(px + TILE_SIZE / 2, py + TILE_SIZE / 2, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      } else if (tile === 3) {
        const pulse = Math.sin(Date.now() * 0.008) * 1.5 + 4.5;
        ctx.fillStyle = '#38bdf8';
        ctx.shadowColor = '#06b6d4';
        ctx.shadowBlur = 14;
        ctx.beginPath();
        ctx.arc(px + TILE_SIZE / 2, py + TILE_SIZE / 2, pulse, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }
  }

  // 2. Fruit Microchip
  if (fruit) {
    ctx.fillStyle = '#10b981';
    ctx.shadowColor = '#34d399';
    ctx.shadowBlur = 15;
    ctx.fillRect(fruit.x - 7, fruit.y - 7, 14, 14);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 8px Orbitron, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('CHIP', fruit.x, fruit.y + 3);
    ctx.shadowBlur = 0;
  }

  // 3. Draw Pac-Man
  ctx.save();
  ctx.translate(pacman.x, pacman.y);

  let rot = 0;
  if (pacman.dirX === 1) rot = 0;
  else if (pacman.dirX === -1) rot = Math.PI;
  else if (pacman.dirY === 1) rot = Math.PI / 2;
  else if (pacman.dirY === -1) rot = -Math.PI / 2;

  ctx.rotate(rot);

  ctx.fillStyle = pacman.isDashing ? '#38bdf8' : '#facc15';
  ctx.shadowColor = pacman.isDashing ? '#06b6d4' : '#eab308';
  ctx.shadowBlur = pacman.isDashing ? 22 : 14;

  ctx.beginPath();
  ctx.arc(0, 0, pacman.radius, pacman.mouthAngle * Math.PI, (2 - pacman.mouthAngle) * Math.PI);
  ctx.lineTo(0, 0);
  ctx.closePath();
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.restore();

  // 4. Draw AI Ghosts
  ghosts.forEach(ghost => {
    ctx.save();
    ctx.translate(ghost.x, ghost.y);

    let gColor = ghost.color;
    if (ghost.isEaten) {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(-3, -2, 3, 0, Math.PI * 2);
      ctx.arc(3, -2, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.arc(-3 + ghost.dirX, -2 + ghost.dirY, 1.5, 0, Math.PI * 2);
      ctx.arc(3 + ghost.dirX, -2 + ghost.dirY, 1.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      return;
    } else if (frightTimer > 0) {
      gColor = (frightTimer < 120 && Math.floor(frightTimer / 10) % 2 === 0) ? '#ffffff' : '#2563eb';
    }

    ctx.fillStyle = gColor;
    ctx.shadowColor = gColor;
    ctx.shadowBlur = 12;

    ctx.beginPath();
    ctx.arc(0, -2, 7, Math.PI, 0, false);
    ctx.lineTo(7, 6);
    ctx.lineTo(4, 3);
    ctx.lineTo(1, 6);
    ctx.lineTo(-2, 3);
    ctx.lineTo(-5, 6);
    ctx.lineTo(-7, 6);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;

    // Eyes
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(-3, -2, 2.5, 0, Math.PI * 2);
    ctx.arc(3, -2, 2.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = frightTimer > 0 ? '#f43f5e' : '#0f172a';
    ctx.beginPath();
    ctx.arc(-3 + ghost.dirX, -2 + ghost.dirY, 1.2, 0, Math.PI * 2);
    ctx.arc(3 + ghost.dirX, -2 + ghost.dirY, 1.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  });

  // 5. Draw Particles
  particles.forEach(p => {
    ctx.fillStyle = p.color;
    ctx.globalAlpha = p.life;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalAlpha = 1;
}

function loop() {
  update();
  render();
  requestAnimationFrame(loop);
}

window.addEventListener('keydown', (e) => {
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', ' '].includes(e.key) || ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
    e.preventDefault();
  }

  if (!isPlaying && (e.code === 'Space' || e.code === 'Enter')) {
    startGame();
    return;
  }

  if (e.code === 'ArrowUp' || e.code === 'KeyW') {
    pacman.nextDirX = 0;
    pacman.nextDirY = -1;
  } else if (e.code === 'ArrowDown' || e.code === 'KeyS') {
    pacman.nextDirX = 0;
    pacman.nextDirY = 1;
  } else if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
    pacman.nextDirX = -1;
    pacman.nextDirY = 0;
  } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
    pacman.nextDirX = 1;
    pacman.nextDirY = 0;
  }

  if (e.code === 'ShiftLeft' || e.code === 'ShiftRight' || e.code === 'Space') {
    if (pacman.dashCooldown <= 0) {
      pacman.isDashing = true;
      pacman.speed = pacman.baseSpeed * 2.2;
      pacman.dashDuration = 70;
      pacman.dashCooldown = pacman.maxDashCooldown;
      audio.playDash();
      spawnSparkles(pacman.x, pacman.y, '#38bdf8', 18);
    }
  }
});

let touchStartX = 0;
let touchStartY = 0;

window.addEventListener('touchstart', (e) => {
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
}, { passive: true });

window.addEventListener('touchend', (e) => {
  const dx = e.changedTouches[0].clientX - touchStartX;
  const dy = e.changedTouches[0].clientY - touchStartY;

  if (Math.abs(dx) > Math.abs(dy)) {
    if (dx > 25) { pacman.nextDirX = 1; pacman.nextDirY = 0; }
    else if (dx < -25) { pacman.nextDirX = -1; pacman.nextDirY = 0; }
  } else {
    if (dy > 25) { pacman.nextDirX = 0; pacman.nextDirY = 1; }
    else if (dy < -25) { pacman.nextDirX = 0; pacman.nextDirY = -1; }
  }
}, { passive: true });

function startGame() {
  score = 0;
  stage = 1;
  lives = 3;
  resetLevel();
  document.getElementById('overlay').classList.add('hidden');
  document.getElementById('game-over-info').classList.add('hidden');
  isPlaying = true;
  audio.startBGM();
}

document.getElementById('start-btn').addEventListener('click', startGame);

resetLevel();
loop();
