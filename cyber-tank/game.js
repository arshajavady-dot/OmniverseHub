/**
 * Cyber Tank: Neo-Tokyo Combat — Retro Arcade Tank Engine & Audio
 */

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const hudStage = document.getElementById('hud-stage');
const hudEnemies = document.getElementById('hud-enemies');
const hudScore = document.getElementById('hud-score');
const startOverlay = document.getElementById('start-overlay');
const btnStart = document.getElementById('btn-start');
const overlayTitle = document.getElementById('overlay-title');
const overlayDesc = document.getElementById('overlay-desc');
const finalScoreText = document.getElementById('final-score');

const btnLeft = document.getElementById('btn-left');
const btnRight = document.getElementById('btn-right');
const btnUp = document.getElementById('btn-up');
const btnDown = document.getElementById('btn-down');
const btnFire = document.getElementById('btn-fire');

// --- 1. PROCEDURAL CHIPTUNE AUDIO ---
class TankAudio {
  constructor() {
    this.ctx = null;
    this.isPlayingBGM = false;
    this.bgmTimer = null;
    this.step = 0;
    this.tempo = 120;
    this.bassline = [110, 110, 146.83, 130.81, 110, 110, 164.81, 146.83];
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
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(bFreq, now);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.16);
    } catch(e) {}
  }

  playCannon() {
    const actx = this.ensureCtx();
    if (!actx || actx.state === 'suspended') return;
    try {
      const osc = actx.createOscillator();
      const gain = actx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(300, actx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(50, actx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.2, actx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, actx.currentTime + 0.14);
      osc.connect(gain);
      gain.connect(actx.destination);
      osc.start();
      osc.stop(actx.currentTime + 0.15);
    } catch(e) {}
  }

  playExplode() {
    const actx = this.ensureCtx();
    if (!actx || actx.state === 'suspended') return;
    try {
      const osc = actx.createOscillator();
      const gain = actx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(120, actx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(25, actx.currentTime + 0.25);
      gain.gain.setValueAtTime(0.25, actx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, actx.currentTime + 0.28);
      osc.connect(gain);
      gain.connect(actx.destination);
      osc.start();
      osc.stop(actx.currentTime + 0.3);
    } catch(e) {}
  }
}

const audio = new TankAudio();

// --- 2. GAME STATE & ENTITIES ---
const TILE_SIZE = 30;
const COLS = 21; // 21 * 30 = 630px
const ROWS = 14; // 14 * 30 = 420px

let currentStage = 1;
let score = 0;
let gameState = 'PLAYING';

let playerTank = {
  x: 100,
  y: 350,
  w: 24,
  h: 24,
  angle: 0,
  turretAngle: 0,
  speed: 2.4,
  hp: 100,
  maxHp: 100,
  reloadTimer: 0
};

let map = [];
let shells = [];
let enemyTanks = [];
let particles = [];
let mouseWorld = { x: 400, y: 200 };

function generateMap(stage) {
  map = [];
  for (let r = 0; r < ROWS; r++) {
    const row = [];
    for (let c = 0; c < COLS; c++) {
      if (r === 0 || r === ROWS - 1 || c === 0 || c === COLS - 1) {
        row.push(2); // Indestructible Wall
      } else {
        const rand = Math.random();
        if (rand < 0.15 && r > 2 && r < ROWS - 3) row.push(1); // Destructible Brick Wall
        else row.push(0); // Empty Ground
      }
    }
    map.push(row);
  }
}

function spawnEnemies(count) {
  enemyTanks = [];
  for (let i = 0; i < count; i++) {
    enemyTanks.push({
      x: 100 + i * 120,
      y: 60 + (i % 2) * 50,
      w: 24,
      h: 24,
      angle: Math.PI / 2,
      speed: 1.2 + Math.random() * 0.8,
      hp: 30,
      reloadTimer: 0,
      color: Math.random() > 0.5 ? '#ec4899' : '#a855f7'
    });
  }
}

function loadStage(stage) {
  currentStage = stage;
  generateMap(stage);
  spawnEnemies(3 + stage * 2);
  playerTank.x = 315;
  playerTank.y = 360;
  playerTank.hp = 100;
  hudStage.textContent = `${currentStage} / 5`;
  hudEnemies.textContent = String(enemyTanks.length);
  hudScore.textContent = String(score);
}

// Input Handlers
const keys = { left: false, right: false, up: false, down: false };

window.addEventListener('keydown', (e) => {
  if (gameState !== 'PLAYING') return;
  if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') keys.left = true;
  if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') keys.right = true;
  if (e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp') keys.up = true;
  if (e.key === 's' || e.key === 'S' || e.key === 'ArrowDown') keys.down = true;
  if (e.key === ' ' || e.code === 'Space') fireShell(playerTank, true);
});

window.addEventListener('keyup', (e) => {
  if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') keys.left = false;
  if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') keys.right = false;
  if (e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp') keys.up = false;
  if (e.key === 's' || e.key === 'S' || e.key === 'ArrowDown') keys.down = false;
});

canvas.addEventListener('mousemove', (e) => {
  const rect = canvas.getBoundingClientRect();
  mouseWorld.x = e.clientX - rect.left;
  mouseWorld.y = e.clientY - rect.top;
});

canvas.addEventListener('mousedown', (e) => {
  if (gameState !== 'PLAYING') return;
  if (e.button === 0) fireShell(playerTank, true);
});

const bindHoldBtn = (btn, prop) => {
  if (!btn) return;
  btn.addEventListener('pointerdown', (e) => { e.preventDefault(); keys[prop] = true; });
  btn.addEventListener('pointerup', (e) => { e.preventDefault(); keys[prop] = false; });
  btn.addEventListener('pointerleave', (e) => { e.preventDefault(); keys[prop] = false; });
};

bindHoldBtn(btnLeft, 'left');
bindHoldBtn(btnRight, 'right');
bindHoldBtn(btnUp, 'up');
bindHoldBtn(btnDown, 'down');
btnFire.addEventListener('pointerdown', (e) => { e.preventDefault(); fireShell(playerTank, true); });

btnStart.addEventListener('click', startGame);

function startGame() {
  score = 0;
  loadStage(1);
  gameState = 'PLAYING';
  shells = [];
  particles = [];
  startOverlay.classList.add('hidden');
  audio.startBGM();
}

function fireShell(tank, isPlayer) {
  if (tank.reloadTimer > 0) return;
  tank.reloadTimer = isPlayer ? 12 : 60;
  audio.playCannon();

  const angle = isPlayer ? tank.turretAngle : tank.angle;
  shells.push({
    x: tank.x + Math.cos(angle) * 16,
    y: tank.y + Math.sin(angle) * 16,
    vx: Math.cos(angle) * 7,
    vy: Math.sin(angle) * 7,
    isPlayer
  });
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
      color: color || '#10b981'
    });
  }
}

// --- 3. PHYSICS & UPDATE LOOP ---
function update() {
  if (gameState !== 'PLAYING') return;

  if (playerTank.reloadTimer > 0) playerTank.reloadTimer--;

  // Player Movement & Aiming
  let dx = 0, dy = 0;
  if (keys.left) dx -= 1;
  if (keys.right) dx += 1;
  if (keys.up) dy -= 1;
  if (keys.down) dy += 1;

  if (dx !== 0 || dy !== 0) {
    playerTank.angle = Math.atan2(dy, dx);
    const newX = playerTank.x + dx * playerTank.speed;
    const newY = playerTank.y + dy * playerTank.speed;
    if (!checkWallTile(newX, playerTank.y, playerTank.w)) playerTank.x = newX;
    if (!checkWallTile(playerTank.x, newY, playerTank.h)) playerTank.y = newY;
  }

  // Aim Turret at Mouse
  playerTank.turretAngle = Math.atan2(mouseWorld.y - playerTank.y, mouseWorld.x - playerTank.x);

  // Enemy Tank AI
  enemyTanks.forEach(e => {
    if (e.reloadTimer > 0) e.reloadTimer--;
    const distToPlayer = Math.hypot(playerTank.x - e.x, playerTank.y - e.y);

    if (distToPlayer < 250) {
      e.angle = Math.atan2(playerTank.y - e.y, playerTank.x - e.x);
      if (Math.random() < 0.02) fireShell(e, false);
    } else {
      if (Math.random() < 0.01) e.angle = Math.random() * Math.PI * 2;
    }

    const ex = e.x + Math.cos(e.angle) * e.speed;
    const ey = e.y + Math.sin(e.angle) * e.speed;
    if (!checkWallTile(ex, e.y, e.w)) e.x = ex;
    if (!checkWallTile(e.x, ey, e.h)) e.y = ey;
  });

  // Update Shells
  for (let i = shells.length - 1; i >= 0; i--) {
    const s = shells[i];
    s.x += s.vx;
    s.y += s.vy;

    // Check Wall Collisions
    const col = Math.floor(s.x / TILE_SIZE);
    const row = Math.floor(s.y / TILE_SIZE);

    if (map[row] && map[row][col] > 0) {
      if (map[row][col] === 1) { // Destructible Brick Wall
        map[row][col] = 0;
        addSparks(s.x, s.y, '#78350f', 10);
      } else {
        addSparks(s.x, s.y, '#06b6d4', 8);
      }
      shells.splice(i, 1);
      continue;
    }

    // Check Player / Enemy Hits
    if (s.isPlayer) {
      for (let j = enemyTanks.length - 1; j >= 0; j--) {
        const e = enemyTanks[j];
        if (Math.hypot(s.x - e.x, s.y - e.y) < 18) {
          e.hp -= 30;
          addSparks(e.x, e.y, e.color, 15);
          shells.splice(i, 1);
          if (e.hp <= 0) {
            audio.playExplode();
            addSparks(e.x, e.y, e.color, 30);
            enemyTanks.splice(j, 1);
            score += 200;
            hudEnemies.textContent = String(enemyTanks.length);
            hudScore.textContent = String(score);

            if (enemyTanks.length === 0) {
              if (currentStage + 1 <= 5) {
                loadStage(currentStage + 1);
              } else {
                gameState = 'GAMEOVER';
                audio.stopBGM();
                overlayTitle.textContent = 'NEO-TOKYO LIBERATED!';
                finalScoreText.textContent = String(score);
                startOverlay.classList.remove('hidden');
              }
            }
          }
          break;
        }
      }
    } else {
      if (Math.hypot(s.x - playerTank.x, s.y - playerTank.y) < 18) {
        playerTank.hp -= 15;
        audio.playExplode();
        addSparks(playerTank.x, playerTank.y, '#ef4444', 20);
        shells.splice(i, 1);

        if (playerTank.hp <= 0) {
          gameState = 'GAMEOVER';
          audio.stopBGM();
          overlayTitle.textContent = 'TANK DESTROYED!';
          finalScoreText.textContent = String(score);
          startOverlay.classList.remove('hidden');
        }
      }
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

function checkWallTile(x, y, size) {
  const col = Math.floor(x / TILE_SIZE);
  const row = Math.floor(y / TILE_SIZE);
  return map[row] && map[row][col] > 0;
}

// --- 4. RENDER LOOP ---
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw Grid Map Walls
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const tile = map[r][c];
      const tx = c * TILE_SIZE;
      const ty = r * TILE_SIZE;

      if (tile === 1) { // Brick Wall
        ctx.fillStyle = '#78350f';
        ctx.fillRect(tx, ty, TILE_SIZE, TILE_SIZE);
        ctx.strokeStyle = '#92400e';
        ctx.strokeRect(tx, ty, TILE_SIZE, TILE_SIZE);
      } else if (tile === 2) { // Indestructible Wall
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(tx, ty, TILE_SIZE, TILE_SIZE);
        ctx.strokeStyle = '#06b6d4';
        ctx.shadowColor = '#06b6d4';
        ctx.shadowBlur = 6;
        ctx.strokeRect(tx, ty, TILE_SIZE, TILE_SIZE);
        ctx.shadowBlur = 0;
      }
    }
  }

  // Draw Enemy Tanks
  enemyTanks.forEach(e => {
    ctx.save();
    ctx.translate(e.x, e.y);
    ctx.rotate(e.angle);

    ctx.fillStyle = e.color;
    ctx.shadowColor = e.color;
    ctx.shadowBlur = 10;
    ctx.fillRect(-e.w / 2, -e.h / 2, e.w, e.h);

    // Barrel
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, -3, 14, 6);
    ctx.restore();
  });

  // Draw Shells
  shells.forEach(s => {
    ctx.save();
    ctx.fillStyle = s.isPlayer ? '#38bdf8' : '#ef4444';
    ctx.shadowColor = s.isPlayer ? '#38bdf8' : '#ef4444';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(s.x, s.y, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });

  // Draw Particles
  particles.forEach(pt => {
    ctx.save();
    ctx.globalAlpha = pt.life;
    ctx.fillStyle = pt.color;
    ctx.fillRect(pt.x, pt.y, 3, 3);
    ctx.restore();
  });

  // Draw Player Tank
  if (gameState === 'PLAYING') {
    ctx.save();
    ctx.translate(playerTank.x, playerTank.y);

    // Base Chassis
    ctx.save();
    ctx.rotate(playerTank.angle);
    ctx.fillStyle = '#10b981';
    ctx.shadowColor = '#10b981';
    ctx.shadowBlur = 14;
    ctx.fillRect(-playerTank.w / 2, -playerTank.h / 2, playerTank.w, playerTank.h);
    ctx.restore();

    // Turret Barrel
    ctx.save();
    ctx.rotate(playerTank.turretAngle);
    ctx.fillStyle = '#06b6d4';
    ctx.shadowColor = '#06b6d4';
    ctx.shadowBlur = 12;
    ctx.fillRect(0, -3, 16, 6);
    ctx.restore();

    ctx.restore();
  }
}

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

// Auto-start on load!
loadStage(1);
requestAnimationFrame(gameLoop);
