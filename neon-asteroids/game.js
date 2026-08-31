/**
 * Neon Asteroids: Vector Drift — Vector Physics Arcade Engine & Synthesizer
 */

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const hudScore = document.getElementById('hud-score');
const hudHighscore = document.getElementById('hud-highscore');
const hudLives = document.getElementById('hud-lives');
const hudLevel = document.getElementById('hud-level');
const startOverlay = document.getElementById('start-overlay');
const btnStart = document.getElementById('btn-start');

const btnRotLeft = document.getElementById('btn-rot-left');
const btnRotRight = document.getElementById('btn-rot-right');
const btnThrustFwd = document.getElementById('btn-thrust-fwd');
const btnThrustRev = document.getElementById('btn-thrust-rev');
const btnFire = document.getElementById('btn-fire');
const btnHyper = document.getElementById('btn-hyper');

// --- 1. PROCEDURAL SPACE SYNTHWAVE AUDIO ENGINE ---
class AsteroidAudioEngine {
  constructor() {
    this.ctx = null;
    this.isPlayingBGM = false;
    this.bgmTimer = null;
    this.step = 0;
    this.tempo = 124;
    this.bassNotes = [73.42, 73.42, 87.31, 98.00, 73.42, 73.42, 110.00, 98.00];
    this.arpNotes = [
      293.66, 349.23, 440.00, 523.25, 440.00, 349.23, 293.66, 440.00,
      329.63, 392.00, 493.88, 587.33, 493.88, 392.00, 329.63, 493.88
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
      if (!this.isPlayingBGM || !this.ctx || this.ctx.state === 'suspended') return;
      this.playStep(this.step);
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

  playStep(step) {
    if (!this.ctx || this.ctx.state === 'suspended') return;
    try {
      const now = this.ctx.currentTime;
      if (step % 2 === 0) {
        const bFreq = this.bassNotes[Math.floor(step / 4) % this.bassNotes.length];
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(bFreq, now);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.15);
      }
      const aFreq = this.arpNotes[step % this.arpNotes.length];
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(aFreq, now);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.13);
    } catch(e) {}
  }

  playLaser() {
    const actx = this.ensureCtx();
    if (!actx || actx.state === 'suspended') return;
    try {
      const osc = actx.createOscillator();
      const gain = actx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(900, actx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, actx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.12, actx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, actx.currentTime + 0.13);
      osc.connect(gain);
      gain.connect(actx.destination);
      osc.start();
      osc.stop(actx.currentTime + 0.14);
    } catch(e) {}
  }

  playExplosion(isLarge) {
    const actx = this.ensureCtx();
    if (!actx || actx.state === 'suspended') return;
    try {
      const osc = actx.createOscillator();
      const gain = actx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(isLarge ? 120 : 260, actx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(30, actx.currentTime + (isLarge ? 0.35 : 0.2));
      gain.gain.setValueAtTime(0.25, actx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, actx.currentTime + (isLarge ? 0.38 : 0.22));
      osc.connect(gain);
      gain.connect(actx.destination);
      osc.start();
      osc.stop(actx.currentTime + (isLarge ? 0.4 : 0.25));
    } catch(e) {}
  }
}

const audio = new AsteroidAudioEngine();

// --- 2. GAME STATE & ENTITIES ---
let score = 0;
let highScore = parseInt(localStorage.getItem('neon_asteroids_high') || '0', 10);
let lives = 3;
let stage = 1;
let gameState = 'START'; // START, PLAYING, GAMEOVER

hudHighscore.textContent = String(highScore).padStart(6, '0');

// Vector Ship
const ship = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  vx: 0,
  vy: 0,
  radius: 12,
  angle: -Math.PI / 2,
  rotation: 0,
  thrustingFwd: false,
  thrustingRev: false,
  invulnerableTimer: 0,
  shootCooldown: 0
};

let bullets = [];
let asteroids = [];
let particles = [];
let popups = [];
let ufo = null;
let ufoTimer = 600;

// Input Keys
const keys = {
  left: false,
  right: false,
  up: false,
  down: false,
  space: false
};

window.addEventListener('keydown', (e) => {
  if (gameState !== 'PLAYING') return;

  if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') keys.left = true;
  if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') keys.right = true;
  if (e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp') keys.up = true;
  if (e.key === 's' || e.key === 'S' || e.key === 'ArrowDown') keys.down = true;
  if (e.key === ' ') {
    keys.space = true;
    e.preventDefault();
  }
  if (e.key === 'Shift' || e.key === 'Enter' || e.key === 'h' || e.key === 'H') {
    hyperspaceJump();
  }
});

window.addEventListener('keyup', (e) => {
  if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') keys.left = false;
  if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') keys.right = false;
  if (e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp') keys.up = false;
  if (e.key === 's' || e.key === 'S' || e.key === 'ArrowDown') keys.down = false;
  if (e.key === ' ') keys.space = false;
});

// On-Screen Buttons
const bindBtn = (btn, keyProp) => {
  if (!btn) return;
  btn.addEventListener('pointerdown', (e) => { e.preventDefault(); keys[keyProp] = true; });
  btn.addEventListener('pointerup', (e) => { e.preventDefault(); keys[keyProp] = false; });
  btn.addEventListener('pointerleave', (e) => { e.preventDefault(); keys[keyProp] = false; });
};

bindBtn(btnRotLeft, 'left');
bindBtn(btnRotRight, 'right');
bindBtn(btnThrustFwd, 'up');
bindBtn(btnThrustRev, 'down');
bindBtn(btnFire, 'space');

btnHyper.addEventListener('click', (e) => {
  e.preventDefault();
  if (gameState === 'PLAYING') hyperspaceJump();
});

function hyperspaceJump() {
  ship.x = 40 + Math.random() * (canvas.width - 80);
  ship.y = 40 + Math.random() * (canvas.height - 80);
  ship.vx = 0;
  ship.vy = 0;
  ship.invulnerableTimer = 60;
  addSparks(ship.x, ship.y, '#a855f7', 25);
}

btnStart.addEventListener('click', startGame);

function startGame() {
  score = 0;
  lives = 3;
  stage = 1;
  gameState = 'PLAYING';
  bullets = [];
  asteroids = [];
  particles = [];
  popups = [];
  ufo = null;
  ufoTimer = 600;

  resetShip();
  spawnAsteroids(4);
  
  hudScore.textContent = '000000';
  hudLevel.textContent = `STAGE ${stage}`;
  updateLivesHUD();
  startOverlay.classList.add('hidden');
  audio.startBGM();
}

function resetShip() {
  ship.x = canvas.width / 2;
  ship.y = canvas.height / 2;
  ship.vx = 0;
  ship.vy = 0;
  ship.angle = -Math.PI / 2;
  ship.invulnerableTimer = 120;
}

function updateLivesHUD() {
  hudLives.innerHTML = '';
  for (let i = 0; i < lives; i++) {
    hudLives.innerHTML += '<span class="text-cyan-400">🚀</span> ';
  }
}

function createAsteroid(x, y, tier) {
  const radius = tier === 3 ? 38 : (tier === 2 ? 22 : 12);
  const vertexCount = 8 + Math.floor(Math.random() * 4);
  const offsets = [];
  for (let i = 0; i < vertexCount; i++) {
    offsets.push(0.75 + Math.random() * 0.5);
  }

  const speed = (4 - tier) * 0.75 + Math.random() * 0.6;
  const angle = Math.random() * Math.PI * 2;

  return {
    x, y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    radius,
    tier,
    vertexCount,
    offsets,
    rot: 0,
    rotSpeed: (Math.random() - 0.5) * 0.04,
    color: tier === 3 ? '#ec4899' : (tier === 2 ? '#a855f7' : '#06b6d4')
  };
}

function spawnAsteroids(count) {
  for (let i = 0; i < count; i++) {
    let x, y, dist;
    do {
      x = Math.random() * canvas.width;
      y = Math.random() * canvas.height;
      dist = Math.hypot(x - ship.x, y - ship.y);
    } while (dist < 120);

    asteroids.push(createAsteroid(x, y, 3));
  }
}

function addSparks(x, y, color, count = 15) {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 1 + Math.random() * 4.5;
    particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1,
      decay: 0.025 + Math.random() * 0.03,
      color: color || '#38bdf8'
    });
  }
}

function addScorePopup(x, y, text, color) {
  popups.push({ x, y, text: `+${text}`, color: color || '#38bdf8', life: 1 });
}

function gameOver() {
  gameState = 'GAMEOVER';
  audio.stopBGM();
  if (score > highScore) {
    highScore = score;
    localStorage.setItem('neon_asteroids_high', highScore);
    hudHighscore.textContent = String(highScore).padStart(6, '0');
  }

  startOverlay.innerHTML = `
    <div class="text-5xl mb-2 animate-pulse">💥💀💥</div>
    <h2 class="font-orbitron font-black text-2xl tracking-wider text-pink-500 mb-1">FLEET DESTROYED</h2>
    <p class="text-xs text-slate-300 mb-2">FINAL SCORE: <span class="text-cyan-400 font-bold font-orbitron">${score}</span></p>
    <p class="text-xs text-slate-400 mb-5">STAGE REACHED: <span class="text-yellow-400 font-bold font-orbitron">SECTOR ${stage}</span></p>
    <button id="btn-restart" class="font-orbitron font-bold px-8 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 text-slate-950 rounded-lg shadow-lg shadow-purple-500/30 tracking-widest text-sm transition-all transform hover:scale-105 active:scale-95">
      ENGAGE THRUSTERS
    </button>
  `;
  startOverlay.classList.remove('hidden');
  document.getElementById('btn-restart').addEventListener('click', startGame);
}

// --- 3. PHYSICS & GAME LOOP ---
function update() {
  if (gameState !== 'PLAYING') return;

  // Ship Rotation
  if (keys.left) ship.angle -= 0.075;
  if (keys.right) ship.angle += 0.075;

  // Forward Thrusters
  ship.thrustingFwd = keys.up;
  if (ship.thrustingFwd) {
    ship.vx += Math.cos(ship.angle) * 0.16;
    ship.vy += Math.sin(ship.angle) * 0.16;

    const tailX = ship.x - Math.cos(ship.angle) * 14;
    const tailY = ship.y - Math.sin(ship.angle) * 14;
    particles.push({
      x: tailX,
      y: tailY,
      vx: -Math.cos(ship.angle) * 3 + (Math.random() - 0.5) * 1.5,
      vy: -Math.sin(ship.angle) * 3 + (Math.random() - 0.5) * 1.5,
      life: 1,
      decay: 0.08,
      color: Math.random() > 0.5 ? '#06b6d4' : '#ec4899'
    });
  }

  // Reverse Thrusters (Go Backwards!)
  ship.thrustingRev = keys.down;
  if (ship.thrustingRev) {
    ship.vx -= Math.cos(ship.angle) * 0.14;
    ship.vy -= Math.sin(ship.angle) * 0.14;

    const noseX = ship.x + Math.cos(ship.angle) * 14;
    const noseY = ship.y + Math.sin(ship.angle) * 14;
    particles.push({
      x: noseX,
      y: noseY,
      vx: Math.cos(ship.angle) * 2.5 + (Math.random() - 0.5) * 1.5,
      vy: Math.sin(ship.angle) * 2.5 + (Math.random() - 0.5) * 1.5,
      life: 1,
      decay: 0.08,
      color: '#a855f7'
    });
  }

  // Ship Friction & Velocity
  ship.vx *= 0.985;
  ship.vy *= 0.985;
  ship.x += ship.vx;
  ship.y += ship.vy;

  // Wrap Ship Bounds
  if (ship.x < 0) ship.x = canvas.width;
  if (ship.x > canvas.width) ship.x = 0;
  if (ship.y < 0) ship.y = canvas.height;
  if (ship.y > canvas.height) ship.y = 0;

  if (ship.invulnerableTimer > 0) ship.invulnerableTimer--;

  // Ship Shooting
  if (ship.shootCooldown > 0) ship.shootCooldown--;
  if (keys.space && ship.shootCooldown <= 0) {
    bullets.push({
      x: ship.x + Math.cos(ship.angle) * 14,
      y: ship.y + Math.sin(ship.angle) * 14,
      vx: Math.cos(ship.angle) * 9.5 + ship.vx * 0.5,
      vy: Math.sin(ship.angle) * 9.5 + ship.vy * 0.5,
      life: 55,
      color: '#38bdf8'
    });
    audio.playLaser();
    ship.shootCooldown = 10;
  }

  // Update Bullets
  for (let i = bullets.length - 1; i >= 0; i--) {
    const b = bullets[i];
    b.x += b.vx;
    b.y += b.vy;
    b.life--;

    if (b.x < 0) b.x = canvas.width;
    if (b.x > canvas.width) b.x = 0;
    if (b.y < 0) b.y = canvas.height;
    if (b.y > canvas.height) b.y = 0;

    if (b.life <= 0) {
      bullets.splice(i, 1);
    }
  }

  // Update Asteroids
  asteroids.forEach(ast => {
    ast.x += ast.vx;
    ast.y += ast.vy;
    ast.rot += ast.rotSpeed;

    if (ast.x < -ast.radius) ast.x = canvas.width + ast.radius;
    if (ast.x > canvas.width + ast.radius) ast.x = -ast.radius;
    if (ast.y < -ast.radius) ast.y = canvas.height + ast.radius;
    if (ast.y > canvas.height + ast.radius) ast.y = -ast.radius;
  });

  // Spawn UFO Saucer
  ufoTimer--;
  if (ufoTimer <= 0 && !ufo) {
    ufo = {
      x: 0,
      y: 80 + Math.random() * (canvas.height - 160),
      vx: 2.2,
      vy: Math.sin(Date.now() * 0.002) * 1.5,
      radius: 16,
      shootTimer: 90
    };
    ufoTimer = 800 + Math.floor(Math.random() * 400);
  }

  // Update UFO
  if (ufo) {
    ufo.x += ufo.vx;
    ufo.y += Math.sin(Date.now() * 0.005) * 1.2;
    ufo.shootTimer--;
    if (ufo.shootTimer <= 0) {
      const angleToShip = Math.atan2(ship.y - ufo.y, ship.x - ufo.x);
      bullets.push({
        x: ufo.x,
        y: ufo.y,
        vx: Math.cos(angleToShip) * 5.5,
        vy: Math.sin(angleToShip) * 5.5,
        life: 70,
        color: '#f43f5e',
        isEnemy: true
      });
      ufo.shootTimer = 110;
    }
    if (ufo.x > canvas.width + 40) ufo = null;
  }

  // Bullet vs Asteroid Collisions
  for (let bIdx = bullets.length - 1; bIdx >= 0; bIdx--) {
    const b = bullets[bIdx];
    if (b.isEnemy) continue;

    for (let aIdx = asteroids.length - 1; aIdx >= 0; aIdx--) {
      const ast = asteroids[aIdx];
      const dist = Math.hypot(b.x - ast.x, b.y - ast.y);
      if (dist < ast.radius + 4) {
        bullets.splice(bIdx, 1);
        const pts = ast.tier === 3 ? 100 : (ast.tier === 2 ? 250 : 500);
        score += pts;
        hudScore.textContent = String(score).padStart(6, '0');
        addScorePopup(ast.x, ast.y, pts, ast.color);
        addSparks(ast.x, ast.y, ast.color, 18);
        audio.playExplosion(ast.tier === 3);

        if (ast.tier > 1) {
          asteroids.push(createAsteroid(ast.x, ast.y, ast.tier - 1));
          asteroids.push(createAsteroid(ast.x, ast.y, ast.tier - 1));
        }
        asteroids.splice(aIdx, 1);
        break;
      }
    }
  }

  // Bullet vs UFO Collision
  if (ufo) {
    for (let bIdx = bullets.length - 1; bIdx >= 0; bIdx--) {
      const b = bullets[bIdx];
      if (b.isEnemy) continue;
      const dist = Math.hypot(b.x - ufo.x, b.y - ufo.y);
      if (dist < ufo.radius + 6) {
        bullets.splice(bIdx, 1);
        score += 1000;
        hudScore.textContent = String(score).padStart(6, '0');
        addScorePopup(ufo.x, ufo.y, 1000, '#eab308');
        addSparks(ufo.x, ufo.y, '#eab308', 30);
        audio.playExplosion(true);
        ufo = null;
        break;
      }
    }
  }

  // Ship vs Asteroid / Enemy Bullet Collisions
  if (ship.invulnerableTimer <= 0) {
    for (let aIdx = 0; aIdx < asteroids.length; aIdx++) {
      const ast = asteroids[aIdx];
      const dist = Math.hypot(ship.x - ast.x, ship.y - ast.y);
      if (dist < ship.radius + ast.radius * 0.75) {
        hitShip();
        break;
      }
    }
    for (let bIdx = bullets.length - 1; bIdx >= 0; bIdx--) {
      const b = bullets[bIdx];
      if (b.isEnemy) {
        const dist = Math.hypot(ship.x - b.x, ship.y - b.y);
        if (dist < ship.radius + 5) {
          bullets.splice(bIdx, 1);
          hitShip();
          break;
        }
      }
    }
  }

  // Next Stage Check
  if (asteroids.length === 0) {
    stage++;
    hudLevel.textContent = `STAGE ${stage}`;
    addScorePopup(canvas.width / 2 - 30, canvas.height / 2, `SECTOR CLEARED!`, '#a855f7');
    spawnAsteroids(3 + stage);
    ship.invulnerableTimer = 90;
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
    pop.y -= 0.8;
    pop.life -= 0.02;
    if (pop.life <= 0) popups.splice(i, 1);
  }
}

function hitShip() {
  audio.playExplosion(true);
  addSparks(ship.x, ship.y, '#f43f5e', 35);
  lives--;
  updateLivesHUD();
  if (lives > 0) {
    resetShip();
  } else {
    gameOver();
  }
}

// --- 4. RENDER LOOP ---
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Deep Space Starfield
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  for (let i = 0; i < 30; i++) {
    const sx = (i * 137.5) % canvas.width;
    const sy = (i * 224.3) % canvas.height;
    ctx.fillRect(sx, sy, 1.2, 1.2);
  }

  // Draw Asteroids
  asteroids.forEach(ast => {
    ctx.save();
    ctx.translate(ast.x, ast.y);
    ctx.rotate(ast.rot);
    ctx.beginPath();
    for (let i = 0; i < ast.vertexCount; i++) {
      const a = (i / ast.vertexCount) * Math.PI * 2;
      const r = ast.radius * ast.offsets[i];
      const px = Math.cos(a) * r;
      const py = Math.sin(a) * r;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.strokeStyle = ast.color;
    ctx.shadowColor = ast.color;
    ctx.shadowBlur = 10;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
  });

  // Draw UFO Saucer
  if (ufo) {
    ctx.save();
    ctx.translate(ufo.x, ufo.y);
    ctx.strokeStyle = '#eab308';
    ctx.shadowColor = '#eab308';
    ctx.shadowBlur = 12;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(0, 0, 16, 7, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, -3, 7, Math.PI, 0);
    ctx.stroke();
    ctx.restore();
  }

  // Draw Bullets
  bullets.forEach(b => {
    ctx.save();
    ctx.fillStyle = b.color;
    ctx.shadowColor = b.color;
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(b.x, b.y, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });

  // Draw Particles
  particles.forEach(p => {
    ctx.save();
    ctx.globalAlpha = p.life;
    ctx.fillStyle = p.color;
    ctx.shadowColor = p.color;
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });

  // Draw Ship
  if (lives > 0 && gameState === 'PLAYING') {
    ctx.save();
    ctx.translate(ship.x, ship.y);
    ctx.rotate(ship.angle);

    if (ship.invulnerableTimer % 6 < 3) {
      ctx.strokeStyle = '#38bdf8';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 14;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(14, 0);
      ctx.lineTo(-12, -9);
      ctx.lineTo(-6, 0);
      ctx.lineTo(-12, 9);
      ctx.closePath();
      ctx.stroke();

      if (ship.invulnerableTimer > 0) {
        ctx.beginPath();
        ctx.arc(0, 0, 18, 0, Math.PI * 2);
        ctx.strokeStyle = '#a855f7';
        ctx.shadowColor = '#a855f7';
        ctx.shadowBlur = 10;
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  // Draw Popups
  popups.forEach(pop => {
    ctx.save();
    ctx.globalAlpha = pop.life;
    ctx.font = 'bold 12px Orbitron';
    ctx.fillStyle = pop.color;
    ctx.shadowColor = pop.color;
    ctx.shadowBlur = 6;
    ctx.fillText(pop.text, pop.x, pop.y);
    ctx.restore();
  });
}

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
