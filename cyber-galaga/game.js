/**
 * Cyber Galaga: Neon Swarm — Retro Cyber Arcade Space Shooter
 */

// --- 1. PROCEDURAL WEB AUDIO SYNTHESIZER & BGM ENGINE ---
class GalagaAudioEngine {
  constructor() {
    this.ctx = null;
    this.isPlaying = false;
    this.bgmTimer = null;
    this.step = 0;
    this.tempo = 136;
    this.isMuted = false;

    // Driving Synthwave Space Combat Scale (D Dorian / F Lydian)
    this.bassNotes = [146.83, 146.83, 174.61, 196.00, 220.00, 196.00, 174.61, 164.81]; // D3, D3, F3, G3, A3, G3, F3, E3
    this.leadNotes = [
      587.33, 659.25, 698.46, 880.00, 783.99, 698.46, 659.25, 587.33,
      880.00, 1046.50, 1174.66, 1046.50, 880.00, 783.99, 698.46, 783.99
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
    if (!actx || this.isPlaying) return;
    this.stopBGM();
    this.isPlaying = true;
    this.step = 0;
    const stepMs = (60 / this.tempo / 4) * 1000;

    this.bgmTimer = setInterval(() => {
      if (!this.isPlaying || !this.ctx || this.isMuted) return;
      this.playBGMStep(this.step);
      this.step = (this.step + 1) % 32;
    }, stepMs);
  }

  stopBGM() {
    this.isPlaying = false;
    if (this.bgmTimer) {
      clearInterval(this.bgmTimer);
      this.bgmTimer = null;
    }
    this.step = 0;
  }

  playBGMStep(step) {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;

    // 1. Driving Cyber Bassline
    if (step % 2 === 0) {
      const bassIdx = Math.floor(step / 4) % this.bassNotes.length;
      const freq = this.bassNotes[bassIdx];
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq / 2, now);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.13);
    }

    // 2. Space Lead Arpeggio
    if (step % 2 === 1) {
      const leadIdx = step % this.leadNotes.length;
      const freq = this.leadNotes[leadIdx];
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.10);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.11);
    }
  }

  playLaser(isDual = false) {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(isDual ? 980 : 840, now);
    osc.frequency.exponentialRampToValueAtTime(220, now + 0.08);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.09);
  }

  playExplosion(isBoss = false) {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(isBoss ? 160 : 260, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + (isBoss ? 0.4 : 0.2));

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + (isBoss ? 0.45 : 0.22));

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + (isBoss ? 0.46 : 0.23));
  }

  playTractorBeam() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.linearRampToValueAtTime(600, now + 0.15);
    osc.frequency.linearRampToValueAtTime(300, now + 0.3);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.31);
  }

  playUpgrade() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    [440, 554.37, 659.25, 880].forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, now + i * 0.08);
      gain.gain.setValueAtTime(0.09, now + i * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + (i + 1) * 0.08);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + i * 0.08);
      osc.stop(now + (i + 1) * 0.08);
    });
  }
}

// --- 2. GAME SETUP & ENGINE ---
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 450;
canvas.height = 600;

const audio = new GalagaAudioEngine();

// Starfield Background
const stars = [];
for (let i = 0; i < 80; i++) {
  stars.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    speed: 0.5 + Math.random() * 2.5,
    size: Math.random() * 2,
    color: ['#06b6d4', '#ec4899', '#ffffff', '#eab308'][Math.floor(Math.random() * 4)]
  });
}

// Game State
const state = {
  score: 0,
  stage: 1,
  lives: 3,
  running: false,
  gameOver: false,
  isDualFighter: false,
  capturedFighter: null, // If an enemy holds a captured ship
  keys: {}
};

// Player Fighter Ship
const player = {
  x: canvas.width / 2,
  y: canvas.height - 50,
  width: 28,
  height: 24,
  speed: 5.5,
  lastShot: 0,
  fireRate: 180, // ms between shots
  invulnerableTimer: 0
};

// Arrays for entities
let bullets = [];
let enemyBullets = [];
let enemies = [];
let particles = [];
let tractorBeams = [];

// Input Listeners
window.addEventListener('keydown', e => {
  state.keys[e.code] = true;
  state.keys[e.key] = true;
});
window.addEventListener('keyup', e => {
  state.keys[e.code] = false;
  state.keys[e.key] = false;
});

// UI Elements
const hudScore = document.getElementById('hud-score');
const hudStage = document.getElementById('hud-stage');
const hudLives = document.getElementById('hud-lives');
const fighterStatus = document.getElementById('fighter-status');
const overlayScreen = document.getElementById('overlay-screen');
const overlayTitle = document.getElementById('overlay-title');
const overlayDesc = document.getElementById('overlay-desc');
const btnStart = document.getElementById('btn-start');
const btnAudioToggle = document.getElementById('btn-audio-toggle');

btnAudioToggle.addEventListener('click', () => {
  audio.isMuted = !audio.isMuted;
  btnAudioToggle.textContent = audio.isMuted ? '🔇 AUDIO: OFF' : '🔊 AUDIO: ON';
});

btnStart.addEventListener('click', startGame);

function startGame() {
  overlayScreen.classList.add('hidden');
  state.score = 0;
  state.stage = 1;
  state.lives = 3;
  state.running = true;
  state.gameOver = false;
  state.isDualFighter = false;
  player.x = canvas.width / 2;
  player.invulnerableTimer = 120;

  bullets = [];
  enemyBullets = [];
  enemies = [];
  particles = [];
  tractorBeams = [];

  updateHUD();
  audio.startBGM();
  spawnSwarm(state.stage);
}

// Enemy Types:
// 1. 'bee' (Yellow scout)
// 2. 'butterfly' (Pink dive-bomber)
// 3. 'boss' (Cyan Boss Galaga with tractor beam)
function spawnSwarm(stage) {
  enemies = [];
  const rows = 4;
  const cols = 8;
  const startX = 60;
  const startY = 60;
  const spacingX = 42;
  const spacingY = 32;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      let type = 'bee';
      let hp = 1;
      let scoreVal = 100;
      let color = '#facc15';

      if (r === 0) {
        type = 'boss';
        hp = 2;
        scoreVal = 400;
        color = '#06b6d4';
      } else if (r === 1) {
        type = 'butterfly';
        hp = 1;
        scoreVal = 200;
        color = '#ec4899';
      }

      enemies.push({
        type: type,
        gridX: startX + c * spacingX,
        gridY: startY + r * spacingY,
        x: startX + c * spacingX,
        y: -50 - (r * cols + c) * 15, // fly in from top
        vx: 0,
        vy: 0,
        hp: hp,
        maxHp: hp,
        scoreVal: scoreVal,
        color: color,
        state: 'flying_in', // flying_in, in_grid, diving, tractor
        diveAngle: 0,
        diveSpeed: 2.5 + stage * 0.4,
        shootCooldown: Math.random() * 200 + 100
      });
    }
  }
}

// --- 3. MAIN GAME UPDATE & RENDER ---
function update() {
  if (!state.running) return;

  // 1. Move Stars
  stars.forEach(s => {
    s.y += s.speed;
    if (s.y > canvas.height) {
      s.y = 0;
      s.x = Math.random() * canvas.width;
    }
  });

  // 2. Player Controls
  const width = state.isDualFighter ? player.width * 2 : player.width;
  if ((state.keys['ArrowLeft'] || state.keys['KeyA']) && player.x - width / 2 > 10) {
    player.x -= player.speed;
  }
  if ((state.keys['ArrowRight'] || state.keys['KeyD']) && player.x + width / 2 < canvas.width - 10) {
    player.x += player.speed;
  }

  // Shooting
  const now = Date.now();
  if ((state.keys['Space'] || state.keys['ShiftLeft'] || state.keys['ShiftRight']) && now - player.lastShot > player.fireRate) {
    player.lastShot = now;
    if (state.isDualFighter) {
      bullets.push({ x: player.x - 14, y: player.y - 12, vx: 0, vy: -9, color: '#38bdf8' });
      bullets.push({ x: player.x + 14, y: player.y - 12, vx: 0, vy: -9, color: '#38bdf8' });
      audio.playLaser(true);
    } else {
      bullets.push({ x: player.x, y: player.y - 12, vx: 0, vy: -9, color: '#fde047' });
      audio.playLaser(false);
    }
  }

  if (player.invulnerableTimer > 0) player.invulnerableTimer--;

  // 3. Update Bullets
  bullets.forEach((b, i) => {
    b.y += b.vy;
    if (b.y < -10) bullets.splice(i, 1);
  });

  enemyBullets.forEach((eb, i) => {
    eb.x += eb.vx;
    eb.y += eb.vy;

    // Check hit on player
    const pWidth = state.isDualFighter ? player.width * 2 : player.width;
    if (player.invulnerableTimer <= 0 &&
        Math.abs(eb.x - player.x) < pWidth / 2 &&
        Math.abs(eb.y - player.y) < player.height / 2) {
      enemyBullets.splice(i, 1);
      hitPlayer();
    }

    if (eb.y > canvas.height + 10 || eb.x < -10 || eb.x > canvas.width + 10) {
      enemyBullets.splice(i, 1);
    }
  });

  // 4. Update Enemies
  const gridWobble = Math.sin(Date.now() / 400) * 15;
  let activeDivingCount = enemies.filter(e => e.state === 'diving').length;

  enemies.forEach((enemy, idx) => {
    if (enemy.state === 'flying_in') {
      const targetX = enemy.gridX + gridWobble;
      const targetY = enemy.gridY;
      enemy.x += (targetX - enemy.x) * 0.05;
      enemy.y += (targetY - enemy.y) * 0.05;
      if (Math.hypot(targetX - enemy.x, targetY - enemy.y) < 2) {
        enemy.state = 'in_grid';
      }
    } else if (enemy.state === 'in_grid') {
      enemy.x = enemy.gridX + gridWobble;
      enemy.y = enemy.gridY;

      // Random dive decision
      if (activeDivingCount < 2 && Math.random() < 0.003) {
        enemy.state = 'diving';
        enemy.diveAngle = Math.atan2(player.y - enemy.y, player.x - enemy.x);
        activeDivingCount++;
      }
    } else if (enemy.state === 'diving') {
      enemy.x += Math.cos(enemy.diveAngle) * enemy.diveSpeed;
      enemy.y += Math.sin(enemy.diveAngle) * enemy.diveSpeed + 1.2;

      // Enemy shooting while diving
      enemy.shootCooldown--;
      if (enemy.shootCooldown <= 0) {
        enemy.shootCooldown = 120;
        enemyBullets.push({
          x: enemy.x,
          y: enemy.y,
          vx: (player.x - enemy.x) * 0.015,
          vy: 4.5,
          color: '#f43f5e'
        });
      }

      // Loop around screen if missed
      if (enemy.y > canvas.height + 20) {
        enemy.y = -20;
        enemy.x = enemy.gridX + gridWobble;
        enemy.state = 'flying_in';
      }
    }

    // Check collision with player
    const pWidth = state.isDualFighter ? player.width * 2 : player.width;
    if (player.invulnerableTimer <= 0 &&
        Math.abs(enemy.x - player.x) < (pWidth + 18) / 2 &&
        Math.abs(enemy.y - player.y) < (player.height + 18) / 2) {
      hitPlayer();
      createExplosion(enemy.x, enemy.y, enemy.color, 15);
      enemies.splice(idx, 1);
    }

    // Check collision with player bullets
    bullets.forEach((bullet, bIdx) => {
      if (Math.abs(bullet.x - enemy.x) < 16 && Math.abs(bullet.y - enemy.y) < 14) {
        bullets.splice(bIdx, 1);
        enemy.hp--;
        createExplosion(enemy.x, enemy.y, '#ffffff', 4);

        if (enemy.hp <= 0) {
          state.score += enemy.scoreVal * (enemy.state === 'diving' ? 2 : 1);
          audio.playExplosion(enemy.type === 'boss');
          createExplosion(enemy.x, enemy.y, enemy.color, enemy.type === 'boss' ? 25 : 12);
          enemies.splice(idx, 1);
          updateHUD();
        }
      }
    });
  });

  // 5. Update Particles
  particles.forEach((p, i) => {
    p.x += p.vx;
    p.y += p.vy;
    p.life -= 0.03;
    if (p.life <= 0) particles.splice(i, 1);
  });

  // 6. Check Wave Clear
  if (enemies.length === 0) {
    state.stage++;
    audio.playUpgrade();
    // Grant Dual Fighter reward on Stage 3+
    if (state.stage % 2 === 0 && !state.isDualFighter) {
      state.isDualFighter = true;
      fighterStatus.textContent = '⚡ DUAL FIGHTER MODE (2X FIREPOWER)';
      fighterStatus.className = 'text-yellow-400 font-bold font-["Orbitron"] animate-pulse';
    }
    updateHUD();
    spawnSwarm(state.stage);
  }
}

function hitPlayer() {
  if (state.isDualFighter) {
    state.isDualFighter = false;
    fighterStatus.textContent = 'SINGLE FIGHTER';
    fighterStatus.className = 'text-emerald-400 font-bold font-["Orbitron"]';
    createExplosion(player.x + 15, player.y, '#38bdf8', 20);
    audio.playExplosion(false);
    player.invulnerableTimer = 90;
    return;
  }

  state.lives--;
  createExplosion(player.x, player.y, '#06b6d4', 30);
  audio.playExplosion(true);
  player.invulnerableTimer = 120;
  player.x = canvas.width / 2;
  updateHUD();

  if (state.lives <= 0) {
    gameOver();
  }
}

function gameOver() {
  state.running = false;
  state.gameOver = true;
  audio.stopBGM();
  overlayTitle.textContent = 'FIGHTER DESTROYED';
  overlayTitle.className = 'text-2xl font-black font-["Orbitron"] text-pink-500 tracking-widest mb-2 glow-pink';
  overlayDesc.innerHTML = `FINAL SCORE: <span class="text-yellow-400 font-bold text-base">${state.score}</span><br>STAGE REACHED: <span class="text-cyan-400 font-bold">${state.stage}</span>`;
  btnStart.textContent = 'RETRY MISSION';
  overlayScreen.classList.remove('hidden');
}

function createExplosion(x, y, color, count = 12) {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 1 + Math.random() * 4;
    particles.push({
      x: x,
      y: y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      color: color,
      life: 1.0,
      size: 2 + Math.random() * 2
    });
  }
}

function updateHUD() {
  hudScore.textContent = String(state.score).padStart(5, '0');
  hudStage.textContent = state.stage;
  hudLives.textContent = '🚀'.repeat(Math.max(0, state.lives));
}

// --- 4. RENDER LOOP ---
function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 1. Draw Starfield
  stars.forEach(s => {
    ctx.fillStyle = s.color;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
    ctx.fill();
  });

  // 2. Draw Bullets
  bullets.forEach(b => {
    ctx.fillStyle = b.color;
    ctx.shadowColor = b.color;
    ctx.shadowBlur = 8;
    ctx.fillRect(b.x - 2, b.y - 6, 4, 12);
    ctx.shadowBlur = 0;
  });

  enemyBullets.forEach(eb => {
    ctx.fillStyle = eb.color;
    ctx.shadowColor = eb.color;
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(eb.x, eb.y, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  });

  // 3. Draw Enemies
  enemies.forEach(e => {
    ctx.save();
    ctx.translate(e.x, e.y);
    if (e.state === 'diving') {
      ctx.rotate(e.diveAngle - Math.PI / 2);
    }

    ctx.fillStyle = e.color;
    ctx.shadowColor = e.color;
    ctx.shadowBlur = 10;

    if (e.type === 'boss') {
      // Boss Galaga
      ctx.beginPath();
      ctx.moveTo(0, 10);
      ctx.lineTo(12, -4);
      ctx.lineTo(8, -10);
      ctx.lineTo(0, -6);
      ctx.lineTo(-8, -10);
      ctx.lineTo(-12, -4);
      ctx.closePath();
      ctx.fill();
      // Boss Wings & Eye
      ctx.fillStyle = '#f43f5e';
      ctx.beginPath();
      ctx.arc(0, -2, 3, 0, Math.PI * 2);
      ctx.fill();
    } else if (e.type === 'butterfly') {
      // Butterfly
      ctx.beginPath();
      ctx.moveTo(0, 8);
      ctx.lineTo(10, 4);
      ctx.lineTo(10, -8);
      ctx.lineTo(0, -4);
      ctx.lineTo(-10, -8);
      ctx.lineTo(-10, 4);
      ctx.closePath();
      ctx.fill();
    } else {
      // Bee
      ctx.beginPath();
      ctx.moveTo(0, 8);
      ctx.lineTo(8, -2);
      ctx.lineTo(5, -8);
      ctx.lineTo(0, -5);
      ctx.lineTo(-5, -8);
      ctx.lineTo(-8, -2);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  });

  // 4. Draw Player Fighter
  if (state.running && (player.invulnerableTimer % 6 < 3)) {
    const drawShip = (offsetX) => {
      ctx.save();
      ctx.translate(player.x + offsetX, player.y);
      ctx.fillStyle = '#06b6d4';
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = 12;

      // Fuselage & Wings
      ctx.beginPath();
      ctx.moveTo(0, -14);
      ctx.lineTo(12, 10);
      ctx.lineTo(6, 6);
      ctx.lineTo(0, 10);
      ctx.lineTo(-6, 6);
      ctx.lineTo(-12, 10);
      ctx.closePath();
      ctx.fill();

      // Red cockpit
      ctx.fillStyle = '#f43f5e';
      ctx.beginPath();
      ctx.arc(0, -2, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Engine Thruster Flame
      ctx.fillStyle = '#fde047';
      ctx.shadowColor = '#fde047';
      ctx.beginPath();
      ctx.moveTo(-3, 8);
      ctx.lineTo(0, 14 + Math.random() * 4);
      ctx.lineTo(3, 8);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    };

    if (state.isDualFighter) {
      drawShip(-12);
      drawShip(12);
    } else {
      drawShip(0);
    }
  }

  // 5. Draw Particles
  particles.forEach(p => {
    ctx.fillStyle = p.color;
    ctx.globalAlpha = p.life;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalAlpha = 1.0;
}

function gameLoop() {
  update();
  render();
  requestAnimationFrame(gameLoop);
}

gameLoop();