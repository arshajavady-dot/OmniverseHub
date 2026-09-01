/**
 * Cyber Pinball: Neon Tilt — Retro Arcade Pinball Physics & Synthesizer
 */

const canvas = document.getElementById('pinballCanvas');
const ctx = canvas.getContext('2d');

const hudScore = document.getElementById('hud-score');
const hudHighscore = document.getElementById('hud-highscore');
const hudBalls = document.getElementById('hud-balls');
const startOverlay = document.getElementById('start-overlay');
const btnStart = document.getElementById('btn-start');

const btnFlipperLeft = document.getElementById('btn-flipper-left');
const btnFlipperRight = document.getElementById('btn-flipper-right');
const btnLaunchBall = document.getElementById('btn-launch-ball');

// --- 1. PROCEDURAL CHIPTUNE / ARCADE SYNTHESIZER ---
class PinballAudioEngine {
  constructor() {
    this.ctx = null;
    this.isPlayingBGM = false;
    this.bgmTimer = null;
    this.step = 0;
    this.tempo = 135;
    this.bassline = [110, 110, 130.81, 146.83, 110, 110, 164.81, 146.83];
    this.melody = [
      440, 0, 523.25, 659.25, 0, 523.25, 440, 0,
      392, 0, 493.88, 587.33, 0, 493.88, 392, 0,
      349.23, 0, 440, 523.25, 0, 440, 349.23, 0,
      329.63, 0, 392, 493.88, 0, 587.33, 659.25, 0
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
        const bIdx = Math.floor(step / 4) % this.bassline.length;
        const bFreq = this.bassline[bIdx];
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(bFreq, now);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.14);
      }
      const mFreq = this.melody[step];
      if (mFreq > 0) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(mFreq, now);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.2);
      }
    } catch(e) {}
  }

  playBeep(freq = 600) {
    const actx = this.ensureCtx();
    if (!actx || actx.state === 'suspended') return;
    try {
      const osc = actx.createOscillator();
      const gain = actx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, actx.currentTime);
      gain.gain.setValueAtTime(0.15, actx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, actx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(actx.destination);
      osc.start();
      osc.stop(actx.currentTime + 0.14);
    } catch(e) {}
  }

  playFlipper() {
    const actx = this.ensureCtx();
    if (!actx || actx.state === 'suspended') return;
    try {
      const osc = actx.createOscillator();
      const gain = actx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, actx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, actx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.12, actx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, actx.currentTime + 0.09);
      osc.connect(gain);
      gain.connect(actx.destination);
      osc.start();
      osc.stop(actx.currentTime + 0.1);
    } catch(e) {}
  }

  playBumper() {
    const actx = this.ensureCtx();
    if (!actx || actx.state === 'suspended') return;
    try {
      const osc = actx.createOscillator();
      const gain = actx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587, actx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1174, actx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.18, actx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, actx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(actx.destination);
      osc.start();
      osc.stop(actx.currentTime + 0.16);
    } catch(e) {}
  }

  playPlunger() {
    const actx = this.ensureCtx();
    if (!actx || actx.state === 'suspended') return;
    try {
      const osc = actx.createOscillator();
      const gain = actx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(300, actx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(750, actx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.2, actx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, actx.currentTime + 0.22);
      osc.connect(gain);
      gain.connect(actx.destination);
      osc.start();
      osc.stop(actx.currentTime + 0.25);
    } catch(e) {}
  }
}

const audio = new PinballAudioEngine();

// --- 2. GAME STATE & PHYSICS ---
let score = 0;
let highScore = parseInt(localStorage.getItem('cyber_pinball_high') || '0', 10);
let ballsLeft = 3;
let gameState = 'START'; // START, PLAYING, GAMEOVER
let countdownTimer = 0; // Countdown in frames (180 = 3s)
let countdownText = '';
let plungerFlashTimer = 0; // Visual flash timer when plunger hitbox is clicked

hudHighscore.textContent = String(highScore).padStart(6, '0');

// Physics constants
const GRAVITY = 0.22;
const DAMPING = 0.985;
const RESTITUTION = 0.72;

// Plunger Hitbox Bounds (Bottom Right Launch Channel)
const plungerHitbox = {
  x: 410,
  y: 460,
  w: 45,
  h: 115
};

// Ball object
let balls = [];
function spawnBall() {
  balls.push({
    x: 430,
    y: 515,
    vx: 0,
    vy: 0,
    radius: 7.5,
    inPlungerLane: true,
    color: '#06b6d4'
  });
  startCountdown();
}

function startCountdown() {
  countdownTimer = 180; // 3 seconds @ 60fps
  countdownText = '3';
  audio.playBeep(600);
}

// Flippers with Clear Center Gap Space (Pivot x: 105px & 305px, length: 60px -> 88px Center Gap!)
const leftFlipper = {
  x: 105,
  y: 515,
  length: 60,
  angle: 0.45,
  restAngle: 0.45,
  upAngle: -0.55,
  angularVelocity: 0,
  isPressed: false
};

const rightFlipper = {
  x: 305,
  y: 515,
  length: 60,
  angle: Math.PI - 0.45,
  restAngle: Math.PI - 0.45,
  upAngle: Math.PI + 0.55,
  angularVelocity: 0,
  isPressed: false
};

// Bumpers (Circular bouncy nodes)
const bumpers = [
  { x: 150, y: 170, radius: 24, color: '#ec4899', score: 250, lit: 0 },
  { x: 260, y: 170, radius: 24, color: '#06b6d4', score: 250, lit: 0 },
  { x: 205, y: 245, radius: 28, color: '#a855f7', score: 500, lit: 0 },
  { x: 90, y: 310, radius: 18, color: '#eab308', score: 150, lit: 0 },
  { x: 320, y: 310, radius: 18, color: '#eab308', score: 150, lit: 0 }
];

// Drop Targets
const dropTargets = [
  { x: 60, y: 110, w: 12, h: 28, hit: false, score: 300 },
  { x: 60, y: 150, w: 12, h: 28, hit: false, score: 300 },
  { x: 60, y: 190, w: 12, h: 28, hit: false, score: 300 },
  { x: 340, y: 110, w: 12, h: 28, hit: false, score: 300 },
  { x: 340, y: 160, w: 12, h: 28, hit: false, score: 300 },
  { x: 340, y: 190, w: 12, h: 28, hit: false, score: 300 }
];

// Static boundary walls & sloped guides (With widened flipper gap & solid launcher gate)
const walls = [
  { x1: 20, y1: 560, x2: 20, y2: 120 },
  { x1: 20, y1: 120, x2: 100, y2: 30 },
  { x1: 100, y1: 30, x2: 230, y2: 20 },
  { x1: 230, y1: 20, x2: 360, y2: 30 },
  { x1: 360, y1: 30, x2: 445, y2: 100 },
  { x1: 445, y1: 100, x2: 445, y2: 560 },
  
  // Plunger lane separator wall (Solid left boundary for plunger lane)
  { x1: 410, y1: 130, x2: 410, y2: 560 },
  
  // Slingshot guide walls above widened flippers
  { x1: 25, y1: 420, x2: 95, y2: 495 },
  { x1: 385, y1: 420, x2: 315, y2: 495 },
  
  // Outer drain gutters
  { x1: 25, y1: 420, x2: 25, y2: 540 },
  { x1: 385, y1: 420, x2: 385, y2: 540 }
];

// Particle Sparks
let particles = [];
function addSparks(x, y, color, count = 12) {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 1.5 + Math.random() * 4.5;
    particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1,
      decay: 0.03 + Math.random() * 0.04,
      color: color || '#06b6d4',
      size: 1.5 + Math.random() * 2
    });
  }
}

// Floating Score Popups
let popups = [];
function addScorePopup(x, y, text, color) {
  popups.push({ x, y, text: `+${text}`, color: color || '#38bdf8', life: 1 });
}

// --- 3. INPUT LISTENERS & MOUSE CLICKS ---

// Prevent right-click context menu
window.addEventListener('contextmenu', (e) => e.preventDefault());
canvas.addEventListener('contextmenu', (e) => e.preventDefault());

// Canvas Pointer/Click Handler (Detects Plunger Hitbox Click vs Flipper Clicks)
canvas.addEventListener('pointerdown', (e) => {
  if (gameState !== 'PLAYING') return;

  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  const mouseX = (e.clientX - rect.left) * scaleX;
  const mouseY = (e.clientY - rect.top) * scaleY;

  // Check if click is inside Plunger Hitbox
  if (mouseX >= plungerHitbox.x && mouseX <= plungerHitbox.x + plungerHitbox.w &&
      mouseY >= plungerHitbox.y && mouseY <= plungerHitbox.y + plungerHitbox.h) {
    plungerFlashTimer = 15;
    triggerLaunch();
    return;
  }

  // Left vs Right Flipper Click
  if (e.button === 2 || mouseX > canvas.width / 2) {
    rightFlipper.isPressed = true;
    audio.playFlipper();
  } else {
    leftFlipper.isPressed = true;
    audio.playFlipper();
  }
});

canvas.addEventListener('pointerup', (e) => {
  if (e.button === 2) {
    rightFlipper.isPressed = false;
  } else {
    leftFlipper.isPressed = false;
  }
});

// Global Mouse Down for Left/Right Flipper outside Canvas
window.addEventListener('mousedown', (e) => {
  if (gameState !== 'PLAYING') return;
  if (e.target === canvas) return; // Handled by canvas pointerdown

  if (e.button === 0) {
    leftFlipper.isPressed = true;
    audio.playFlipper();
  } else if (e.button === 2) {
    rightFlipper.isPressed = true;
    audio.playFlipper();
  }
});

window.addEventListener('mouseup', (e) => {
  if (e.target === canvas) return;
  if (e.button === 0) leftFlipper.isPressed = false;
  if (e.button === 2) rightFlipper.isPressed = false;
});

// Keyboard Controls
window.addEventListener('keydown', (e) => {
  if (gameState !== 'PLAYING') return;

  if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') {
    leftFlipper.isPressed = true;
    audio.playFlipper();
  }
  if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') {
    rightFlipper.isPressed = true;
    audio.playFlipper();
  }
  if (e.key === ' ' || e.key === 'ArrowDown' || e.key === 'Enter' || e.key === 'ArrowUp') {
    e.preventDefault();
    plungerFlashTimer = 15;
    triggerLaunch();
  }
});

window.addEventListener('keyup', (e) => {
  if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') leftFlipper.isPressed = false;
  if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') rightFlipper.isPressed = false;
});

// On-Screen Buttons
btnFlipperLeft.addEventListener('pointerdown', (e) => {
  e.preventDefault();
  leftFlipper.isPressed = true;
  audio.playFlipper();
});
btnFlipperLeft.addEventListener('pointerup', (e) => {
  e.preventDefault();
  leftFlipper.isPressed = false;
});

btnFlipperRight.addEventListener('pointerdown', (e) => {
  e.preventDefault();
  rightFlipper.isPressed = true;
  audio.playFlipper();
});
btnFlipperRight.addEventListener('pointerup', (e) => {
  e.preventDefault();
  rightFlipper.isPressed = false;
});

btnLaunchBall.addEventListener('click', (e) => {
  e.preventDefault();
  plungerFlashTimer = 15;
  triggerLaunch();
});

function triggerLaunch() {
  countdownTimer = 0;
  balls.forEach(ball => {
    if (ball.x > 400 || ball.y > 480) {
      ball.vy = -18.5;
      ball.vx = -1.8;
      ball.inPlungerLane = false;
      audio.playPlunger();
      addSparks(ball.x, ball.y, '#eab308', 25);
    }
  });
}

btnStart.addEventListener('click', startGame);

function startGame() {
  score = 0;
  ballsLeft = 3;
  gameState = 'PLAYING';
  balls = [];
  particles = [];
  popups = [];
  dropTargets.forEach(t => t.hit = false);
  
  hudScore.textContent = '000000';
  updateBallsHUD();
  startOverlay.classList.add('hidden');
  spawnBall();
  audio.startBGM();
}

function updateBallsHUD() {
  hudBalls.innerHTML = '';
  for (let i = 0; i < ballsLeft; i++) {
    hudBalls.innerHTML += '<span class="text-cyan-400">🟢</span> ';
  }
}

function gameOver() {
  gameState = 'GAMEOVER';
  audio.stopBGM();
  if (score > highScore) {
    highScore = score;
    localStorage.setItem('cyber_pinball_high', highScore);
    hudHighscore.textContent = String(highScore).padStart(6, '0');
  }

  startOverlay.innerHTML = `
    <div class="text-5xl mb-2 animate-pulse">💀</div>
    <h2 class="font-orbitron font-black text-2xl tracking-wider text-pink-500 mb-1">MATRIX DRAINED</h2>
    <p class="text-xs text-slate-300 mb-2">FINAL SCORE: <span class="text-cyan-400 font-bold font-orbitron">${score}</span></p>
    <p class="text-xs text-slate-400 mb-5">High Score: <span class="text-pink-400 font-bold font-orbitron">${highScore}</span></p>
    <button id="btn-restart" class="font-orbitron font-bold px-8 py-3 bg-gradient-to-r from-cyan-500 to-pink-500 hover:from-cyan-400 hover:to-pink-400 text-slate-950 rounded-lg shadow-lg shadow-pink-500/30 tracking-widest text-sm transition-all transform hover:scale-105 active:scale-95">
      RESTART MATRIX
    </button>
  `;
  startOverlay.classList.remove('hidden');
  document.getElementById('btn-restart').addEventListener('click', startGame);
}

// --- 4. PHYSICS & UPDATE LOOP ---
function update() {
  if (gameState !== 'PLAYING') return;

  // Countdown Auto-Launch
  if (countdownTimer > 0) {
    countdownTimer--;
    if (countdownTimer === 120) {
      countdownText = '2';
      audio.playBeep(700);
    } else if (countdownTimer === 60) {
      countdownText = '1';
      audio.playBeep(850);
    } else if (countdownTimer === 0) {
      countdownText = 'LAUNCH!';
      audio.playBeep(1200);
      plungerFlashTimer = 15;
      triggerLaunch();
      setTimeout(() => { countdownText = ''; }, 600);
    }
  }

  if (plungerFlashTimer > 0) plungerFlashTimer--;

  // Update flipper angles
  const flipSpeed = 0.38;
  if (leftFlipper.isPressed) {
    leftFlipper.angle = Math.max(leftFlipper.upAngle, leftFlipper.angle - flipSpeed);
  } else {
    leftFlipper.angle = Math.min(leftFlipper.restAngle, leftFlipper.angle + flipSpeed * 0.7);
  }

  if (rightFlipper.isPressed) {
    rightFlipper.angle = Math.min(rightFlipper.upAngle, rightFlipper.angle + flipSpeed);
  } else {
    rightFlipper.angle = Math.max(rightFlipper.restAngle, rightFlipper.angle - flipSpeed * 0.7);
  }

  // Update Bumpers light decay
  bumpers.forEach(b => {
    if (b.lit > 0) b.lit -= 0.05;
  });

  // Update Particles
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.life -= p.decay;
    if (p.life <= 0) particles.splice(i, 1);
  }

  // Update Popups
  for (let i = popups.length - 1; i >= 0; i--) {
    const pop = popups[i];
    pop.y -= 0.8;
    pop.life -= 0.02;
    if (pop.life <= 0) popups.splice(i, 1);
  }

  // Update Balls with 4 CCD Sub-Steps
  const SUB_STEPS = 4;
  for (let bIdx = balls.length - 1; bIdx >= 0; bIdx--) {
    const b = balls[bIdx];

    b.vy += GRAVITY / SUB_STEPS;
    b.vx *= Math.pow(DAMPING, 1 / SUB_STEPS);
    b.vy *= Math.pow(DAMPING, 1 / SUB_STEPS);

    for (let step = 0; step < SUB_STEPS; step++) {
      b.x += b.vx / SUB_STEPS;
      b.y += b.vy / SUB_STEPS;

      // Track Plunger Lane State
      if (b.x > 410 && b.y > 130) {
        b.inPlungerLane = true;
      } else if (b.x < 410) {
        b.inPlungerLane = false;
      }

      // SOLID PLUNGER BASE PLATFORM (Ball rests solidly at y = 520, never sinks or phases through bottom)
      if (b.inPlungerLane && b.y + b.radius > 525) {
        b.y = 525 - b.radius;
        if (b.vy > 0) b.vy = -b.vy * 0.2; // Solid resting bounce
        b.vx = 0;
      }

      // SOLID ONE-WAY PLUNGER GATE & SEPARATOR (Balls in main table can NEVER re-enter plunger lane)
      if (!b.inPlungerLane && b.x + b.radius > 410 && b.y > 130) {
        b.x = 410 - b.radius;
        b.vx = -Math.abs(b.vx) * RESTITUTION;
        addSparks(b.x, b.y, '#06b6d4', 4);
      }

      // HARD CEILING & ROOF ARCH BOUNDARY CHECKS
      if (b.y - b.radius < 22) {
        b.y = 22 + b.radius;
        b.vy = Math.abs(b.vy) * 0.6;
        b.vx *= 0.8;
        addSparks(b.x, b.y, '#06b6d4', 6);
      }
      if (b.x + b.radius > 444) {
        b.x = 444 - b.radius;
        b.vx = -Math.abs(b.vx) * 0.65;
      }
      if (b.x - b.radius < 20) {
        b.x = 20 + b.radius;
        b.vx = Math.abs(b.vx) * 0.65;
      }

      if (b.x > 360 && b.y < 80) {
        b.vx = -6;
        if (b.vy < -4) b.vy = -4;
      }

      // 2. Wall Collisions
      walls.forEach(w => {
        collideBallSegment(b, w.x1, w.y1, w.x2, w.y2);
      });

      // 3. Flipper Collisions
      const leftTipX = leftFlipper.x + Math.cos(leftFlipper.angle) * leftFlipper.length;
      const leftTipY = leftFlipper.y + Math.sin(leftFlipper.angle) * leftFlipper.length;
      const hitLeft = collideBallSegment(b, leftFlipper.x, leftFlipper.y, leftTipX, leftTipY, true);
      if (hitLeft && leftFlipper.isPressed) {
        b.vy -= 9;
        b.vx += (leftTipX - leftFlipper.x) * 0.1;
        addSparks(b.x, b.y, '#ec4899', 15);
      }

      const rightTipX = rightFlipper.x + Math.cos(rightFlipper.angle) * rightFlipper.length;
      const rightTipY = rightFlipper.y + Math.sin(rightFlipper.angle) * rightFlipper.length;
      const hitRight = collideBallSegment(b, rightFlipper.x, rightFlipper.y, rightTipX, rightTipY, true);
      if (hitRight && rightFlipper.isPressed) {
        b.vy -= 9;
        b.vx += (rightTipX - rightFlipper.x) * 0.1;
        addSparks(b.x, b.y, '#06b6d4', 15);
      }

      // 4. Bumper Collisions
      bumpers.forEach(bump => {
        const dx = b.x - bump.x;
        const dy = b.y - bump.y;
        const dist = Math.hypot(dx, dy);
        if (dist < b.radius + bump.radius) {
          const nx = dx / dist;
          const ny = dy / dist;
          b.x = bump.x + nx * (b.radius + bump.radius);
          b.y = bump.y + ny * (b.radius + bump.radius);
          
          const speed = Math.max(9, Math.hypot(b.vx, b.vy) * 1.3);
          b.vx = nx * speed;
          b.vy = ny * speed;

          bump.lit = 1;
          score += bump.score;
          hudScore.textContent = String(score).padStart(6, '0');
          addScorePopup(bump.x, bump.y - 15, bump.score, bump.color);
          addSparks(bump.x, bump.y, bump.color, 16);
          audio.playBumper();
        }
      });

      // 5. Drop Target Collisions
      dropTargets.forEach(dt => {
        if (!dt.hit) {
          if (b.x + b.radius > dt.x && b.x - b.radius < dt.x + dt.w &&
              b.y + b.radius > dt.y && b.y - b.radius < dt.y + dt.h) {
            dt.hit = true;
            b.vx = -b.vx * 1.1;
            score += dt.score;
            hudScore.textContent = String(score).padStart(6, '0');
            addScorePopup(dt.x, dt.y, dt.score, '#eab308');
            addSparks(dt.x + dt.w / 2, dt.y + dt.h / 2, '#eab308', 14);
            audio.playBumper();

            if (dropTargets.every(t => t.hit)) {
              score += 2500;
              addScorePopup(200, 280, 2500, '#a855f7');
              setTimeout(() => dropTargets.forEach(t => t.hit = false), 600);
            }
          }
        }
      });
    }

    // Drain Out of Bottom Center Gap
    if (b.y > canvas.height + 20) {
      balls.splice(bIdx, 1);
      if (balls.length === 0) {
        ballsLeft--;
        updateBallsHUD();
        if (ballsLeft > 0) {
          spawnBall();
        } else {
          gameOver();
        }
      }
    }
  }
}

// Segment collision helper
function collideBallSegment(ball, x1, y1, x2, y2, isFlipper = false) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return false;

  let t = ((ball.x - x1) * dx + (ball.y - y1) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));

  const nearX = x1 + t * dx;
  const nearY = y1 + t * dy;

  const distX = ball.x - nearX;
  const distY = ball.y - nearY;
  const dist = Math.hypot(distX, distY);

  if (dist < ball.radius) {
    let nx = dist > 0 ? distX / dist : 0;
    let ny = dist > 0 ? distY / dist : -1;

    ball.x = nearX + nx * ball.radius;
    ball.y = nearY + ny * ball.radius;

    const dot = ball.vx * nx + ball.vy * ny;
    if (dot < 0) {
      ball.vx = (ball.vx - 2 * dot * nx) * RESTITUTION;
      ball.vy = (ball.vy - 2 * dot * ny) * RESTITUTION;
      return true;
    }
  }
  return false;
}

// --- 5. RENDER LOOP ---
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Background Grid Lines
  ctx.strokeStyle = 'rgba(6, 182, 212, 0.08)';
  ctx.lineWidth = 1;
  for (let x = 0; x < canvas.width; x += 30) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  for (let y = 0; y < canvas.height; y += 30) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }

  // Draw Drain Warning Zone under widened Flipper Gap
  ctx.save();
  ctx.fillStyle = 'rgba(239, 68, 68, 0.12)';
  ctx.beginPath();
  ctx.moveTo(165, 520);
  ctx.lineTo(245, 520);
  ctx.lineTo(205, 570);
  ctx.closePath();
  ctx.fill();
  ctx.font = 'bold 9px Orbitron';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ef4444';
  ctx.fillText('DRAIN', 205, 545);
  ctx.restore();

  // Draw Walls
  ctx.strokeStyle = '#06b6d4';
  ctx.lineWidth = 4;
  ctx.shadowColor = '#06b6d4';
  ctx.shadowBlur = 10;
  walls.forEach(w => {
    ctx.beginPath();
    ctx.moveTo(w.x1, w.y1);
    ctx.lineTo(w.x2, w.y2);
    ctx.stroke();
  });
  ctx.shadowBlur = 0;

  // Draw Drop Targets
  dropTargets.forEach(dt => {
    if (!dt.hit) {
      ctx.fillStyle = '#eab308';
      ctx.shadowColor = '#eab308';
      ctx.shadowBlur = 8;
      ctx.fillRect(dt.x, dt.y, dt.w, dt.h);
      ctx.shadowBlur = 0;
    } else {
      ctx.strokeStyle = 'rgba(234, 179, 8, 0.2)';
      ctx.strokeRect(dt.x, dt.y, dt.w, dt.h);
    }
  });

  // Draw Bumpers
  bumpers.forEach(b => {
    ctx.save();
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
    ctx.fillStyle = b.lit > 0 ? '#ffffff' : b.color;
    ctx.shadowColor = b.color;
    ctx.shadowBlur = b.lit > 0 ? 25 : 12;
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(b.x, b.y, b.radius * 0.45, 0, Math.PI * 2);
    ctx.fillStyle = '#060813';
    ctx.fill();
    ctx.restore();
  });

  // Draw Flippers
  const drawFlipper = (flipper, color) => {
    ctx.save();
    ctx.translate(flipper.x, flipper.y);
    ctx.rotate(flipper.angle);
    ctx.beginPath();
    ctx.roundRect(0, -6, flipper.length, 12, 6);
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 12;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#0f172a';
    ctx.fill();
    ctx.restore();
  };

  drawFlipper(leftFlipper, '#ec4899');
  drawFlipper(rightFlipper, '#06b6d4');

  // Draw Solid Plunger Piston & Glowing Interactive Plunger Hitbox
  ctx.save();
  const isFlashing = plungerFlashTimer > 0;
  ctx.fillStyle = isFlashing ? '#ffffff' : '#eab308';
  ctx.shadowColor = '#eab308';
  ctx.shadowBlur = isFlashing ? 25 : 12;
  ctx.strokeStyle = '#fef08a';
  ctx.lineWidth = 2;
  
  // Plunger Hitbox Frame
  ctx.strokeRect(plungerHitbox.x, plungerHitbox.y, plungerHitbox.w, plungerHitbox.h);
  ctx.fillRect(422, 525, 18, 50); // Solid Piston Platform

  // Plunger Handle Spring
  ctx.strokeStyle = '#eab308';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(431, 545);
  ctx.lineTo(431, 570);
  ctx.stroke();

  // Rotated "⚡ LAUNCH" text inside plunger channel
  ctx.save();
  ctx.translate(432, 490);
  ctx.rotate(-Math.PI / 2);
  ctx.font = 'black 11px Orbitron';
  ctx.textAlign = 'center';
  ctx.fillStyle = isFlashing ? '#ffffff' : '#eab308';
  ctx.shadowColor = '#eab308';
  ctx.shadowBlur = 10;
  ctx.fillText('⚡ LAUNCH', 0, 0);
  ctx.restore();

  ctx.restore();

  // Draw Particles
  particles.forEach(p => {
    ctx.save();
    ctx.globalAlpha = p.life;
    ctx.fillStyle = p.color;
    ctx.shadowColor = p.color;
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });

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

  // Draw Balls
  balls.forEach(b => {
    ctx.save();
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = b.color;
    ctx.shadowBlur = 16;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = b.color;
    ctx.stroke();
    ctx.restore();
  });

  // Draw Visual Auto-Launch Countdown Banner
  if (countdownText) {
    ctx.save();
    ctx.font = 'black 36px Orbitron';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#eab308';
    ctx.shadowColor = '#eab308';
    ctx.shadowBlur = 20;
    ctx.fillText(countdownText, canvas.width / 2, 290);
    ctx.font = 'bold 12px Orbitron';
    ctx.fillStyle = '#38bdf8';
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 10;
    ctx.fillText('AUTO-LAUNCH IN PROGRESS', canvas.width / 2, 320);
    ctx.restore();
  }
}

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
