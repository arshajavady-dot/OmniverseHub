/**
 * Neon Pong Breakout — Hyper Arcade Engine
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

// --- PROCEDURAL WEB AUDIO SYNTHESIZER & SYNTHWAVE BREAKOUT BGM ---
class NeonPongAudioEngine {
  constructor() {
    this.ctx = null;
    this.isPlayingBGM = false;
    this.bgmTimer = null;
    this.step = 0;
    this.tempo = 135;

    this.bassNotes = [73.42, 87.31, 65.41, 98.00]; // D2, F2, C2, G2
    this.melodyNotes = [
      293.66, 349.23, 440.00, 523.25, 440.00, 349.23, 293.66, 349.23,
      349.23, 440.00, 523.25, 659.25, 523.25, 440.00, 349.23, 440.00,
      523.25, 659.25, 783.99, 880.00, 783.99, 659.25, 523.25, 659.25,
      392.00, 493.88, 587.33, 783.99, 587.33, 493.88, 392.00, 493.88
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
    ['click', 'keydown', 'touchstart', 'mousemove'].forEach(e => window.addEventListener(e, unlock, { passive: true }));
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
  }

  playStep(step) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // Driving 16th Synthwave Bass
    if (step % 2 === 0) {
      const chord = this.bassNotes[Math.floor(step / 8)];
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(chord, now);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(500, now);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.12);
    }

    // Lead Arpeggio Melody
    if (step % 2 === 1) {
      const note = this.melodyNotes[step];
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(note, now);
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.15);
    }
  }

  playFx(freq, type, duration, ramp = true) {
    try {
      const actx = this.ensureCtx();
      if (!actx) return;
      const osc = actx.createOscillator();
      const gain = actx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, actx.currentTime);
      if (ramp) {
        osc.frequency.exponentialRampToValueAtTime(freq / 2, actx.currentTime + duration);
      }
      gain.gain.setValueAtTime(0.15, actx.currentTime);
      gain.gain.linearRampToValueAtTime(0, actx.currentTime + duration);
      osc.connect(gain);
      gain.connect(actx.destination);
      osc.start();
      osc.stop(actx.currentTime + duration);
    } catch(e) {}
  }
}

const pongAudio = new NeonPongAudioEngine();

function playFx(freq, type, duration, ramp = true) {
  pongAudio.playFx(freq, type, duration, ramp);
}

// Game State
let isPlaying = false;
let score = 0;
let lives = 3;
let combo = 1;

let paddle = {
  x: W / 2 - 60,
  y: H - 40,
  w: 120,
  h: 16,
  color: '#06b6d4',
  hasLaser: false,
  laserTimer: 0
};

let balls = [];
let bricks = [];
let lasers = [];
let powerups = [];
let particles = [];

function resetPaddle() {
  paddle.w = 120;
  paddle.hasLaser = false;
  paddle.x = W / 2 - paddle.w / 2;
}

function spawnBall(attached = false) {
  balls.push({
    x: paddle.x + paddle.w / 2,
    y: paddle.y - 12,
    r: 8,
    vx: (Math.random() - 0.5) * 8,
    vy: -8,
    attached: attached,
    color: '#38bdf8'
  });
}

function initBricks() {
  bricks = [];
  const rows = 6;
  const cols = Math.floor((W - 80) / 75);
  const brickW = (W - 80) / cols - 8;
  const brickH = 24;

  const colors = ['#f43f5e', '#ec4899', '#a855f7', '#6366f1', '#06b6d4', '#10b981'];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const hp = r === 0 ? 2 : 1;
      bricks.push({
        x: 40 + c * (brickW + 8),
        y: 80 + r * (brickH + 8),
        w: brickW,
        h: brickH,
        color: colors[r % colors.length],
        hp: hp,
        maxHp: hp
      });
    }
  }
}

// Hyper Breakout Arcade BGM Engine (Cyber-Invaders Multi-Track Style)
let bgmTimer = null;
let bgmStep = 0;

function playPongHat(now) {
  try {
    const bufferSize = audioCtx.sampleRate * 0.025;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 9000;
    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0.04, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);
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
  // Am, F, C, G chord progression
  const bassNotes = [110.00, 87.31, 130.81, 98.00]; // A2, F2, C3, G2
  const leadArp = [440.00, 523.25, 659.25, 880.00, 783.99, 659.25, 523.25, 392.00]; // A4, C5, E5, A5, G5, E5, C5, G4
  const stepMs = (60 / 126 / 4) * 1000; // 126 BPM

  bgmTimer = setInterval(() => {
    if (!isPlaying) return;
    try {
      const now = audioCtx.currentTime;
      // 1. Punchy Bouncing Bass
      const oscB = audioCtx.createOscillator();
      const filterB = audioCtx.createBiquadFilter();
      const gainB = audioCtx.createGain();
      oscB.type = 'square';
      const bFreq = bassNotes[Math.floor(bgmStep / 16) % bassNotes.length];
      oscB.frequency.setValueAtTime(bgmStep % 4 === 0 ? bFreq : bFreq * 1.5, now);
      filterB.type = 'lowpass';
      filterB.frequency.setValueAtTime(500, now);
      filterB.frequency.exponentialRampToValueAtTime(150, now + 0.1);
      gainB.gain.setValueAtTime(0.06, now);
      gainB.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      oscB.connect(filterB);
      filterB.connect(gainB);
      gainB.connect(audioCtx.destination);
      oscB.start(now);
      oscB.stop(now + 0.1);

      // 2. Chiptune Lead Arp
      const arpFreq = leadArp[bgmStep % leadArp.length];
      const oscL = audioCtx.createOscillator();
      const gainL = audioCtx.createGain();
      oscL.type = 'triangle';
      oscL.frequency.setValueAtTime(arpFreq * (combo > 2 ? 1.25 : 1), now);
      gainL.gain.setValueAtTime(0.035, now);
      gainL.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
      oscL.connect(gainL);
      gainL.connect(audioCtx.destination);
      oscL.start(now);
      oscL.stop(now + 0.09);

      // 3. Hi-Hat on off-beats
      if (bgmStep % 2 === 1) playPongHat(now);

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
  lives = 3;
  combo = 1;
  balls = [];
  lasers = [];
  powerups = [];
  particles = [];
  resetPaddle();
  initBricks();
  spawnBall(true);

  document.getElementById('overlay').classList.add('hidden');
  document.getElementById('game-over-info').classList.add('hidden');
  isPlaying = true;
  startBGM();
}

// Mouse Controls
window.addEventListener('mousemove', (e) => {
  if (!isPlaying) return;
  paddle.x = e.clientX - paddle.w / 2;
  paddle.x = Math.max(20, Math.min(W - paddle.w - 20, paddle.x));

  balls.forEach(b => {
    if (b.attached) {
      b.x = paddle.x + paddle.w / 2;
    }
  });
});

window.addEventListener('click', () => {
  if (!isPlaying) return;
  launchBallOrLaser();
});

window.addEventListener('keydown', (e) => {
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', ' '].includes(e.key) || ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
    e.preventDefault();
  }

  if (!isPlaying && (e.code === 'Space' || e.code === 'Enter')) {
    resetGame();
    return;
  }
  if (e.code === 'Space') {
    launchBallOrLaser();
  }
  if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
    paddle.x = Math.max(20, paddle.x - 30);
    balls.forEach(b => { if (b.attached) b.x = paddle.x + paddle.w / 2; });
  } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
    paddle.x = Math.min(W - paddle.w - 20, paddle.x + 30);
    balls.forEach(b => { if (b.attached) b.x = paddle.x + paddle.w / 2; });
  }
});

function launchBallOrLaser() {
  let launched = false;
  balls.forEach(b => {
    if (b.attached) {
      b.attached = false;
      launched = true;
    }
  });

  if (!launched && paddle.hasLaser) {
    // Shoot Lasers
    playFx(900, 'square', 0.1);
    lasers.push({ x: paddle.x + 10, y: paddle.y, vy: -12 });
    lasers.push({ x: paddle.x + paddle.w - 10, y: paddle.y, vy: -12 });
  }
}

document.getElementById('start-btn').addEventListener('click', resetGame);

function update() {
  if (!isPlaying) return;

  if (window.parent && window.parent !== window) {
    window.parent.postMessage({ type: 'SCORE_UPDATE', score: score }, '*');
  }

  // Update Balls
  for (let i = balls.length - 1; i >= 0; i--) {
    let b = balls[i];
    if (b.attached) continue;

    b.x += b.vx;
    b.y += b.vy;

    // Wall Bounces
    if (b.x - b.r < 0) {
      b.x = b.r;
      b.vx *= -1;
      playFx(300, 'sine', 0.05);
    }
    if (b.x + b.r > W) {
      b.x = W - b.r;
      b.vx *= -1;
      playFx(300, 'sine', 0.05);
    }
    if (b.y - b.r < 0) {
      b.y = b.r;
      b.vy *= -1;
      playFx(300, 'sine', 0.05);
    }

    // Paddle Bounce
    if (b.y + b.r >= paddle.y && b.y - b.r <= paddle.y + paddle.h &&
        b.x >= paddle.x && b.x <= paddle.x + paddle.w && b.vy > 0) {
      
      b.vy *= -1;
      const hitPos = (b.x - (paddle.x + paddle.w / 2)) / (paddle.w / 2);
      b.vx = hitPos * 9;
      combo = 1;
      playFx(450, 'sine', 0.08);
    }

    // Ball Out of Bottom
    if (b.y - b.r > H) {
      balls.splice(i, 1);
    }
  }

  // Check Death
  if (balls.length === 0) {
    lives--;
    playFx(180, 'sawtooth', 0.3, false);
    if (lives <= 0) {
      gameOver();
      return;
    } else {
      spawnBall(true);
    }
  }

  // Update Lasers
  for (let i = lasers.length - 1; i >= 0; i--) {
    let l = lasers[i];
    l.y += l.vy;
    if (l.y < 0) lasers.splice(i, 1);
  }

  // Ball vs Brick Collisions
  balls.forEach(b => {
    if (b.attached) return;

    for (let i = bricks.length - 1; i >= 0; i--) {
      let br = bricks[i];
      if (b.x + b.r > br.x && b.x - b.r < br.x + br.w &&
          b.y + b.r > br.y && b.y - b.r < br.y + br.h) {

        b.vy *= -1;
        br.hp--;
        score += 100 * combo;
        combo++;
        playFx(600, 'square', 0.08);

        // Brick Destroyed
        if (br.hp <= 0) {
          spawnExplosion(br.x + br.w / 2, br.y + br.h / 2, br.color);
          maybeSpawnPowerup(br.x + br.w / 2, br.y + br.h / 2);
          bricks.splice(i, 1);
        }
        break;
      }
    }
  });

  // Laser vs Brick Collisions
  for (let lIdx = lasers.length - 1; lIdx >= 0; lIdx--) {
    let l = lasers[lIdx];
    for (let bIdx = bricks.length - 1; bIdx >= 0; bIdx--) {
      let br = bricks[bIdx];
      if (l.x > br.x && l.x < br.x + br.w && l.y > br.y && l.y < br.y + br.h) {
        br.hp--;
        score += 100;
        lasers.splice(lIdx, 1);
        if (br.hp <= 0) {
          spawnExplosion(br.x + br.w / 2, br.y + br.h / 2, br.color);
          bricks.splice(bIdx, 1);
        }
        break;
      }
    }
  }

  // Update Powerups
  for (let i = powerups.length - 1; i >= 0; i--) {
    let p = powerups[i];
    p.y += 3;

    // Catch Powerup
    if (p.y >= paddle.y && p.y <= paddle.y + paddle.h &&
        p.x >= paddle.x && p.x <= paddle.x + paddle.w) {
      
      playFx(800, 'sine', 0.2);
      if (p.type === 'multiball') {
        spawnBall();
        spawnBall();
      } else if (p.type === 'expand') {
        paddle.w = Math.min(220, paddle.w + 40);
      } else if (p.type === 'laser') {
        paddle.hasLaser = true;
      }
      powerups.splice(i, 1);
    } else if (p.y > H) {
      powerups.splice(i, 1);
    }
  }

  // Win condition check
  if (bricks.length === 0) {
    initBricks();
    spawnBall(true);
  }

  // Update Particles
  for (let i = particles.length - 1; i >= 0; i--) {
    let pt = particles[i];
    pt.x += pt.vx;
    pt.y += pt.vy;
    pt.life -= 0.04;
    if (pt.life <= 0) particles.splice(i, 1);
  }

  // Update UI
  document.getElementById('score').textContent = score.toString().padStart(4, '0');
  document.getElementById('lives').textContent = '❤️'.repeat(lives);
  document.getElementById('combo').textContent = 'x' + combo;
}

function spawnExplosion(x, y, color) {
  for (let i = 0; i < 12; i++) {
    particles.push({
      x: x,
      y: y,
      vx: (Math.random() - 0.5) * 8,
      vy: (Math.random() - 0.5) * 8,
      color: color,
      size: Math.random() * 5 + 3,
      life: 1
    });
  }
}

function maybeSpawnPowerup(x, y) {
  if (Math.random() < 0.25) {
    const types = ['multiball', 'expand', 'laser'];
    powerups.push({
      x: x,
      y: y,
      type: types[Math.floor(Math.random() * types.length)]
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
  ctx.fillStyle = '#030712';
  ctx.fillRect(0, 0, W, H);

  // Background Grid Lines
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 1;
  for (let x = 0; x < W; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, H);
    ctx.stroke();
  }
  for (let y = 0; y < H; y += 40) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }

  // Draw Bricks
  bricks.forEach(br => {
    ctx.fillStyle = br.color;
    ctx.shadowColor = br.color;
    ctx.shadowBlur = 12;
    ctx.fillRect(br.x, br.y, br.w, br.h);
    ctx.shadowBlur = 0;
  });

  // Draw Lasers
  ctx.fillStyle = '#ef4444';
  ctx.shadowColor = '#ef4444';
  ctx.shadowBlur = 10;
  lasers.forEach(l => {
    ctx.fillRect(l.x - 2, l.y, 4, 16);
  });
  ctx.shadowBlur = 0;

  // Draw Powerups
  powerups.forEach(p => {
    ctx.fillStyle = p.type === 'multiball' ? '#eab308' : (p.type === 'expand' ? '#10b981' : '#ec4899');
    ctx.shadowColor = ctx.fillStyle;
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  });

  // Draw Particles
  particles.forEach(pt => {
    ctx.fillStyle = pt.color;
    ctx.globalAlpha = pt.life;
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalAlpha = 1;

  // Draw Paddle
  ctx.fillStyle = paddle.hasLaser ? '#ec4899' : paddle.color;
  ctx.shadowColor = ctx.fillStyle;
  ctx.shadowBlur = 20;
  ctx.fillRect(paddle.x, paddle.y, paddle.w, paddle.h);
  ctx.shadowBlur = 0;

  // Draw Balls
  balls.forEach(b => {
    ctx.fillStyle = b.color;
    ctx.shadowColor = b.color;
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  });
}

function loop() {
  update();
  render();
  requestAnimationFrame(loop);
}
loop();
