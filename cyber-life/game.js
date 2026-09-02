/**
 * Cyber Life: 2D Sandbox Survival — Terraria Knockoff Engine & Chiptune Audio
 */

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const hpBar = document.getElementById('hp-bar');
const hpText = document.getElementById('hp-text');
const timeIcon = document.getElementById('time-icon');
const timeText = document.getElementById('time-text');
const startOverlay = document.getElementById('start-overlay');
const btnStart = document.getElementById('btn-start');
const hotbarContainer = document.getElementById('hotbar');

const btnMoveLeft = document.getElementById('btn-move-left');
const btnMoveRight = document.getElementById('btn-move-right');
const btnJump = document.getElementById('btn-jump');

// --- 1. PROCEDURAL CHIPTUNE SOUNDTRACK & FX SYNTHESIZER ---
class CyberLifeAudio {
  constructor() {
    this.ctx = null;
    this.isPlayingBGM = false;
    this.bgmTimer = null;
    this.step = 0;
    this.tempo = 120;
    this.bassNotes = [110, 110, 146.83, 130.81, 110, 110, 164.81, 146.83];
    this.melody = [
      440, 523.25, 659.25, 523.25, 440, 523.25, 659.25, 783.99,
      659.25, 523.25, 440, 392, 440, 523.25, 659.25, 523.25
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
      this.step = (this.step + 1) % 16;
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
      if (step % 2 === 0) {
        const bFreq = this.bassNotes[Math.floor(step / 2) % this.bassNotes.length];
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
      }
      const mFreq = this.melody[step];
      if (mFreq > 0) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(mFreq, now);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.2);
      }
    } catch(e) {}
  }

  playMine() {
    const actx = this.ensureCtx();
    if (!actx || actx.state === 'suspended') return;
    try {
      const osc = actx.createOscillator();
      const gain = actx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, actx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(40, actx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.15, actx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, actx.currentTime + 0.09);
      osc.connect(gain);
      gain.connect(actx.destination);
      osc.start();
      osc.stop(actx.currentTime + 0.1);
    } catch(e) {}
  }

  playPlace() {
    const actx = this.ensureCtx();
    if (!actx || actx.state === 'suspended') return;
    try {
      const osc = actx.createOscillator();
      const gain = actx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, actx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(600, actx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.12, actx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, actx.currentTime + 0.09);
      osc.connect(gain);
      gain.connect(actx.destination);
      osc.start();
      osc.stop(actx.currentTime + 0.1);
    } catch(e) {}
  }

  playSword() {
    const actx = this.ensureCtx();
    if (!actx || actx.state === 'suspended') return;
    try {
      const osc = actx.createOscillator();
      const gain = actx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(800, actx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(200, actx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.15, actx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, actx.currentTime + 0.13);
      osc.connect(gain);
      gain.connect(actx.destination);
      osc.start();
      osc.stop(actx.currentTime + 0.14);
    } catch(e) {}
  }

  playHurt() {
    const actx = this.ensureCtx();
    if (!actx || actx.state === 'suspended') return;
    try {
      const osc = actx.createOscillator();
      const gain = actx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(150, actx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(60, actx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.2, actx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, actx.currentTime + 0.22);
      osc.connect(gain);
      gain.connect(actx.destination);
      osc.start();
      osc.stop(actx.currentTime + 0.25);
    } catch(e) {}
  }
}

const audio = new CyberLifeAudio();

// --- 2. WORLD GRID & TILE TYPES ---
const TILE_SIZE = 16;
const COLS = 120; // 1920px wide world
const ROWS = 60;  // 960px deep world

const TILES = {
  AIR: 0,
  GRASS: 1,
  DIRT: 2,
  STONE: 3,
  NEON_ORE: 4,
  PLATINUM: 5,
  WOOD: 6,
  LEAVES: 7,
  TORCH: 8,
  WALL: 9
};

const TILE_COLORS = {
  [TILES.GRASS]: '#10b981',
  [TILES.DIRT]: '#78350f',
  [TILES.STONE]: '#475569',
  [TILES.NEON_ORE]: '#ec4899',
  [TILES.PLATINUM]: '#06b6d4',
  [TILES.WOOD]: '#b45309',
  [TILES.LEAVES]: '#059669',
  [TILES.TORCH]: '#f59e0b',
  [TILES.WALL]: '#334155'
};

let world = [];
let clouds = [];

function generateWorld() {
  world = [];
  const surfaceRow = 22;

  for (let r = 0; r < ROWS; r++) {
    const row = [];
    for (let c = 0; c < COLS; c++) {
      if (r < surfaceRow) {
        row.push(TILES.AIR);
      } else if (r === surfaceRow) {
        row.push(TILES.GRASS);
      } else if (r < surfaceRow + 7) {
        row.push(TILES.DIRT);
      } else {
        const rand = Math.random();
        if (rand < 0.07) row.push(TILES.NEON_ORE);
        else if (rand < 0.12) row.push(TILES.PLATINUM);
        else row.push(TILES.STONE);
      }
    }
    world.push(row);
  }

  // Plant trees on grass
  for (let c = 4; c < COLS - 4; c += 5 + Math.floor(Math.random() * 5)) {
    const treeHeight = 4 + Math.floor(Math.random() * 3);
    for (let h = 1; h <= treeHeight; h++) {
      world[surfaceRow - h][c] = TILES.WOOD;
    }
    // Canopy
    const topR = surfaceRow - treeHeight;
    for (let dr = -2; dr <= 0; dr++) {
      for (let dc = -2; dc <= 2; dc++) {
        if (world[topR + dr] && world[topR + dr][c + dc] === TILES.AIR) {
          world[topR + dr][c + dc] = TILES.LEAVES;
        }
      }
    }
  }

  // Generate Clouds
  clouds = [];
  for (let i = 0; i < 12; i++) {
    clouds.push({
      x: Math.random() * (COLS * TILE_SIZE),
      y: 20 + Math.random() * 140,
      w: 60 + Math.random() * 80,
      h: 20 + Math.random() * 15,
      speed: 0.2 + Math.random() * 0.4
    });
  }
}

// --- 3. HOTBAR & INVENTORY ---
const HOTBAR_SLOTS = [
  { id: 'pickaxe', name: 'Neon Pickaxe', icon: '⛏️', type: 'tool', count: 1 },
  { id: 'sword', name: 'Plasma Sword', icon: '🗡️', type: 'weapon', count: 1 },
  { id: 'dirt', name: 'Dirt Block', icon: '🟩', type: 'block', tile: TILES.DIRT, count: 64 },
  { id: 'stone', name: 'Stone Block', icon: '🪨', type: 'block', tile: TILES.STONE, count: 64 },
  { id: 'neon', name: 'Neon Ore', icon: '💎', type: 'block', tile: TILES.NEON_ORE, count: 20 },
  { id: 'torch', name: 'Laser Torch', icon: '💡', type: 'block', tile: TILES.TORCH, count: 30 }
];

let selectedHotbarIndex = 0;

function renderHotbarUI() {
  hotbarContainer.innerHTML = '';
  HOTBAR_SLOTS.forEach((slot, idx) => {
    const div = document.createElement('div');
    div.className = `hotbar-slot px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg flex items-center gap-1.5 cursor-pointer text-xs font-semibold ${idx === selectedHotbarIndex ? 'active' : ''}`;
    div.innerHTML = `
      <span class="text-xs text-slate-500 font-mono">${idx + 1}</span>
      <span class="text-base">${slot.icon}</span>
      <span class="text-slate-200 hidden sm:inline">${slot.name}</span>
      ${slot.count > 1 ? `<span class="text-[10px] text-emerald-400 font-mono font-bold">x${slot.count}</span>` : ''}
    `;
    div.addEventListener('click', () => {
      selectedHotbarIndex = idx;
      renderHotbarUI();
    });
    hotbarContainer.appendChild(div);
  });
}

// --- 4. PLAYER & GAME ENTITIES ---
let gameState = 'PLAYING';
let player = {
  x: 400,
  y: 300,
  vx: 0,
  vy: 0,
  w: 14,
  h: 26,
  hp: 100,
  maxHp: 100,
  onGround: false,
  facing: 'right',
  swingAngle: 0,
  isSwinging: false
};

let camera = { x: 0, y: 0 };
let enemies = [];
let particles = [];
let popups = [];
let timeOfDay = 0; // 0 to 1200

function resetPlayer() {
  player.x = 400;
  player.y = 300;
  player.vx = 0;
  player.vy = 0;
  player.hp = 100;
  updateHpUI();
}

function updateHpUI() {
  const pct = Math.max(0, (player.hp / player.maxHp) * 100);
  hpBar.style.width = `${pct}%`;
  hpText.textContent = `${Math.ceil(player.hp)}/${player.maxHp}`;
}

function spawnSlime() {
  const x = player.x + (Math.random() > 0.5 ? 260 : -260);
  enemies.push({
    x,
    y: 300,
    vx: (Math.random() - 0.5) * 1.5,
    vy: 0,
    w: 16,
    h: 12,
    hp: 30,
    color: Math.random() > 0.5 ? '#10b981' : '#a855f7',
    jumpTimer: 60 + Math.random() * 60
  });
}

// --- 5. INPUT LISTENERS ---
const keys = { left: false, right: false, up: false };

window.addEventListener('keydown', (e) => {
  if (gameState !== 'PLAYING') return;

  if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') keys.left = true;
  if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') keys.right = true;
  if (e.key === 'w' || e.key === 'W' || e.key === ' ' || e.key === 'ArrowUp') {
    if (player.onGround) {
      player.vy = -6.8;
      player.onGround = false;
    }
  }

  const num = parseInt(e.key, 10);
  if (num >= 1 && num <= 6) {
    selectedHotbarIndex = num - 1;
    renderHotbarUI();
  }
});

window.addEventListener('keyup', (e) => {
  if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') keys.left = false;
  if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') keys.right = false;
});

// On-screen buttons
const bindHoldBtn = (btn, keyProp) => {
  if (!btn) return;
  btn.addEventListener('pointerdown', (e) => { e.preventDefault(); keys[keyProp] = true; });
  btn.addEventListener('pointerup', (e) => { e.preventDefault(); keys[keyProp] = false; });
  btn.addEventListener('pointerleave', (e) => { e.preventDefault(); keys[keyProp] = false; });
};

bindHoldBtn(btnMoveLeft, 'left');
bindHoldBtn(btnMoveRight, 'right');
btnJump.addEventListener('pointerdown', (e) => {
  e.preventDefault();
  if (player.onGround) {
    player.vy = -6.8;
    player.onGround = false;
  }
});

// Mouse Action (Mine / Attack / Place)
window.addEventListener('contextmenu', (e) => e.preventDefault());

canvas.addEventListener('mousedown', (e) => {
  if (gameState !== 'PLAYING') return;

  const rect = canvas.getBoundingClientRect();
  const mouseWorldX = (e.clientX - rect.left) + camera.x;
  const mouseWorldY = (e.clientY - rect.top) + camera.y;

  const col = Math.floor(mouseWorldX / TILE_SIZE);
  const row = Math.floor(mouseWorldY / TILE_SIZE);

  const activeSlot = HOTBAR_SLOTS[selectedHotbarIndex];

  player.isSwinging = true;
  player.swingAngle = -Math.PI / 3;
  setTimeout(() => { player.isSwinging = false; }, 180);

  if (e.button === 0) { // Left Click: Mine / Attack
    if (activeSlot.id === 'sword') {
      audio.playSword();
      enemies.forEach((enemy, idx) => {
        const dist = Math.hypot(enemy.x - mouseWorldX, enemy.y - mouseWorldY);
        if (dist < 45) {
          enemy.hp -= 15;
          enemy.vy = -3;
          enemy.vx = player.facing === 'right' ? 4 : -4;
          audio.playMine();
          addSparks(enemy.x, enemy.y, '#ec4899', 15);
          addPopup(enemy.x, enemy.y, '-15', '#ec4899');
          if (enemy.hp <= 0) enemies.splice(idx, 1);
        }
      });
    } else { // Mine Block
      if (world[row] && world[row][col] !== undefined && world[row][col] !== TILES.AIR) {
        const tileType = world[row][col];
        world[row][col] = TILES.AIR;
        audio.playMine();
        addSparks(col * TILE_SIZE + 8, row * TILE_SIZE + 8, TILE_COLORS[tileType] || '#10b981', 12);
        
        const matchingSlot = HOTBAR_SLOTS.find(s => s.tile === tileType);
        if (matchingSlot) {
          matchingSlot.count++;
          renderHotbarUI();
        }
      }
    }
  } else if (e.button === 2) { // Right Click: Place Block
    if (activeSlot.type === 'block' && activeSlot.count > 0) {
      if (world[row] && world[row][col] === TILES.AIR) {
        world[row][col] = activeSlot.tile;
        activeSlot.count--;
        audio.playPlace();
        addSparks(col * TILE_SIZE + 8, row * TILE_SIZE + 8, TILE_COLORS[activeSlot.tile] || '#10b981', 8);
        renderHotbarUI();
      }
    }
  }
});

btnStart.addEventListener('click', startGame);

function startGame() {
  generateWorld();
  resetPlayer();
  gameState = 'PLAYING';
  enemies = [];
  particles = [];
  popups = [];
  timeOfDay = 0;
  startOverlay.classList.add('hidden');
  renderHotbarUI();
  audio.startBGM();
}

function addSparks(x, y, color, count = 10) {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 1 + Math.random() * 3.5;
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

function addPopup(x, y, text, color) {
  popups.push({ x, y, text, color: color || '#ec4899', life: 1 });
}

// --- 6. PHYSICS & UPDATE LOOP ---
function update() {
  if (gameState !== 'PLAYING') return;

  // Day / Night Cycle
  timeOfDay = (timeOfDay + 0.25) % 1200;
  const isNight = timeOfDay > 600;
  timeIcon.textContent = isNight ? '🌙' : '☀️';
  timeText.textContent = isNight ? 'NIGHT TIME' : 'DAYTIME';
  timeText.className = isNight ? 'text-indigo-400 font-bold' : 'text-amber-300 font-bold';

  // Move Clouds
  clouds.forEach(c => {
    c.x += c.speed;
    if (c.x > COLS * TILE_SIZE) c.x = -c.w;
  });

  // Night Slime Spawner
  if (isNight && Math.random() < 0.015 && enemies.length < 6) {
    spawnSlime();
  }

  // Player Movement
  if (keys.left) {
    player.vx = -2.8;
    player.facing = 'left';
  } else if (keys.right) {
    player.vx = 2.8;
    player.facing = 'right';
  } else {
    player.vx *= 0.7;
  }

  // Gravity
  player.vy += 0.28;
  player.x += player.vx;
  collideWorld(player, 'x');
  player.y += player.vy;
  player.onGround = false;
  collideWorld(player, 'y');

  // Camera Follow Player
  camera.x = player.x - canvas.width / 2;
  camera.y = player.y - canvas.height / 2;
  camera.x = Math.max(0, Math.min(COLS * TILE_SIZE - canvas.width, camera.x));
  camera.y = Math.max(0, Math.min(ROWS * TILE_SIZE - canvas.height, camera.y));

  // Update Enemies
  for (let i = enemies.length - 1; i >= 0; i--) {
    const e = enemies[i];
    e.jumpTimer--;
    if (e.jumpTimer <= 0) {
      e.vy = -4.5;
      e.vx = (player.x > e.x ? 1.5 : -1.5);
      e.jumpTimer = 80 + Math.random() * 40;
    }
    e.vy += 0.25;
    e.x += e.vx;
    e.y += e.vy;
    collideWorld(e, 'y');

    const dist = Math.hypot(e.x - player.x, e.y - player.y);
    if (dist < 18) {
      player.hp -= 0.5;
      updateHpUI();
      audio.playHurt();
      if (player.hp <= 0) {
        gameState = 'GAMEOVER';
        audio.stopBGM();
        startOverlay.innerHTML = `
          <div class="text-6xl mb-2 animate-pulse">💀</div>
          <h2 class="font-orbitron font-black text-3xl tracking-wider text-red-500 mb-2">YOU DIED</h2>
          <button id="btn-restart" class="font-orbitron font-bold px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 text-slate-950 rounded-lg shadow-lg">
            RESPAWN MATRIX
          </button>
        `;
        startOverlay.classList.remove('hidden');
        document.getElementById('btn-restart').addEventListener('click', startGame);
      }
    }
  }

  // Update Particles & Popups
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.life -= p.decay;
    if (p.life <= 0) particles.splice(i, 1);
  }

  for (let i = popups.length - 1; i >= 0; i--) {
    const pop = popups[i];
    pop.y -= 0.6;
    pop.life -= 0.03;
    if (pop.life <= 0) popups.splice(i, 1);
  }
}

function collideWorld(entity, axis) {
  const startCol = Math.floor((entity.x - entity.w / 2) / TILE_SIZE);
  const endCol = Math.floor((entity.x + entity.w / 2) / TILE_SIZE);
  const startRow = Math.floor((entity.y - entity.h / 2) / TILE_SIZE);
  const endRow = Math.floor((entity.y + entity.h / 2) / TILE_SIZE);

  for (let r = startRow; r <= endRow; r++) {
    for (let c = startCol; c <= endCol; c++) {
      if (world[r] && world[r][c] && world[r][c] !== TILES.AIR && world[r][c] !== TILES.TORCH) {
        if (axis === 'x') {
          if (entity.vx > 0) entity.x = c * TILE_SIZE - entity.w / 2;
          else if (entity.vx < 0) entity.x = (c + 1) * TILE_SIZE + entity.w / 2;
          entity.vx = 0;
        } else if (axis === 'y') {
          if (entity.vy > 0) {
            entity.y = r * TILE_SIZE - entity.h / 2;
            entity.onGround = true;
          } else if (entity.vy < 0) {
            entity.y = (r + 1) * TILE_SIZE + entity.h / 2;
          }
          entity.vy = 0;
        }
      }
    }
  }
}

// --- 7. RENDER LOOP ---
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Dynamic Day / Night Sky Gradient
  const isNight = timeOfDay > 600;
  const skyGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  if (isNight) {
    skyGrad.addColorStop(0, '#030712');
    skyGrad.addColorStop(1, '#0f172a');
  } else {
    skyGrad.addColorStop(0, '#0f172a');
    skyGrad.addColorStop(0.5, '#1e293b');
    skyGrad.addColorStop(1, '#0f2942');
  }
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw Sun / Moon
  ctx.save();
  const sunX = (timeOfDay / 1200) * canvas.width;
  const sunY = 50 + Math.sin((timeOfDay / 1200) * Math.PI) * -30;
  ctx.fillStyle = isNight ? '#e2e8f0' : '#f59e0b';
  ctx.shadowColor = isNight ? '#e2e8f0' : '#f59e0b';
  ctx.shadowBlur = 20;
  ctx.beginPath();
  ctx.arc(sunX, sunY, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Draw Floating Pixel Clouds
  clouds.forEach(c => {
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.fillRect(c.x - camera.x, c.y - camera.y, c.w, c.h);
    ctx.restore();
  });

  ctx.save();
  ctx.translate(-camera.x, -camera.y);

  // Draw World Grid Tiles
  const startCol = Math.max(0, Math.floor(camera.x / TILE_SIZE));
  const endCol = Math.min(COLS - 1, Math.ceil((camera.x + canvas.width) / TILE_SIZE));
  const startRow = Math.max(0, Math.floor(camera.y / TILE_SIZE));
  const endRow = Math.min(ROWS - 1, Math.ceil((camera.y + canvas.height) / TILE_SIZE));

  for (let r = startRow; r <= endRow; r++) {
    for (let c = startCol; c <= endCol; c++) {
      const tile = world[r][c];
      if (tile !== TILES.AIR) {
        const tx = c * TILE_SIZE;
        const ty = r * TILE_SIZE;

        ctx.fillStyle = TILE_COLORS[tile] || '#10b981';
        ctx.fillRect(tx, ty, TILE_SIZE, TILE_SIZE);

        // Tile Highlights / Textures
        if (tile === TILES.GRASS) {
          ctx.fillStyle = '#34d399';
          ctx.fillRect(tx, ty, TILE_SIZE, 3);
        } else if (tile === TILES.DIRT) {
          ctx.fillStyle = '#92400e';
          ctx.fillRect(tx + 3, ty + 3, 2, 2);
          ctx.fillRect(tx + 9, ty + 8, 3, 2);
        } else if (tile === TILES.STONE) {
          ctx.fillStyle = '#334155';
          ctx.fillRect(tx + 2, ty + 2, 4, 3);
          ctx.fillRect(tx + 8, ty + 9, 5, 2);
        } else if (tile === TILES.NEON_ORE) {
          ctx.fillStyle = '#f472b6';
          ctx.shadowColor = '#ec4899';
          ctx.shadowBlur = 8;
          ctx.fillRect(tx + 4, ty + 4, 4, 4);
          ctx.fillRect(tx + 9, ty + 9, 3, 3);
          ctx.shadowBlur = 0;
        } else if (tile === TILES.PLATINUM) {
          ctx.fillStyle = '#38bdf8';
          ctx.shadowColor = '#06b6d4';
          ctx.shadowBlur = 8;
          ctx.fillRect(tx + 3, ty + 3, 5, 5);
          ctx.shadowBlur = 0;
        } else if (tile === TILES.TORCH) {
          ctx.save();
          ctx.fillStyle = 'rgba(245, 158, 11, 0.3)';
          ctx.beginPath();
          ctx.arc(tx + 8, ty + 8, 35, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }

        ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.lineWidth = 0.5;
        ctx.strokeRect(tx, ty, TILE_SIZE, TILE_SIZE);
      }
    }
  }

  // Draw Enemies (Cyber Slimes)
  enemies.forEach(e => {
    ctx.save();
    ctx.fillStyle = e.color;
    ctx.shadowColor = e.color;
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.roundRect(e.x - e.w / 2, e.y - e.h / 2, e.w, e.h, 6);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(e.x - 4, e.y - 3, 2, 2);
    ctx.fillRect(e.x + 2, e.y - 3, 2, 2);
    ctx.restore();
  });

  // Draw Particles
  particles.forEach(p => {
    ctx.save();
    ctx.globalAlpha = p.life;
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x, p.y, 3, 3);
    ctx.restore();
  });

  // Draw Popups
  popups.forEach(pop => {
    ctx.save();
    ctx.globalAlpha = pop.life;
    ctx.font = 'bold 12px Orbitron';
    ctx.fillStyle = pop.color;
    ctx.fillText(pop.text, pop.x, pop.y);
    ctx.restore();
  });

  // Draw Player Character
  if (gameState === 'PLAYING') {
    ctx.save();
    ctx.translate(player.x, player.y);

    // Character Body
    ctx.fillStyle = '#10b981';
    ctx.shadowColor = '#10b981';
    ctx.shadowBlur = 12;
    ctx.fillRect(-player.w / 2, -player.h / 2, player.w, player.h);

    // Head Visor
    ctx.fillStyle = '#06b6d4';
    ctx.fillRect(player.facing === 'right' ? 0 : -player.w / 2, -player.h / 2 + 3, 7, 5);

    // Weapon Swing Animation
    if (player.isSwinging) {
      ctx.save();
      ctx.rotate(player.facing === 'right' ? player.swingAngle : -player.swingAngle);
      ctx.fillStyle = '#ec4899';
      ctx.shadowColor = '#ec4899';
      ctx.shadowBlur = 15;
      ctx.fillRect(0, -3, 22, 5);
      ctx.restore();
    }

    ctx.restore();
  }

  ctx.restore();
}

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

// Auto-initialize on load!
generateWorld();
resetPlayer();
renderHotbarUI();
gameState = 'PLAYING';

requestAnimationFrame(gameLoop);
