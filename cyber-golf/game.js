/**
 * Cyber Golf: Neon Links — Retro Chiptune Mini-Golf Engine
 */

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const hudHole = document.getElementById('hud-hole');
const hudStrokes = document.getElementById('hud-strokes');
const hudPar = document.getElementById('hud-par');
const startOverlay = document.getElementById('start-overlay');
const btnStart = document.getElementById('btn-start');
const btnResetHole = document.getElementById('btn-reset-hole');

// --- 1. PROCEDURAL CHIPTUNE AUDIO ---
class GolfAudio {
  constructor() {
    this.ctx = null;
    this.isPlayingBGM = false;
    this.bgmTimer = null;
    this.step = 0;
    this.tempo = 126;
    this.bassline = [130.81, 130.81, 164.81, 146.83, 130.81, 130.81, 196.00, 164.81];
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

  playPutt() {
    const actx = this.ensureCtx();
    if (!actx || actx.state === 'suspended') return;
    try {
      const osc = actx.createOscillator();
      const gain = actx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(220, actx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(660, actx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.18, actx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, actx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(actx.destination);
      osc.start();
      osc.stop(actx.currentTime + 0.14);
    } catch(e) {}
  }

  playHoleIn() {
    const actx = this.ensureCtx();
    if (!actx || actx.state === 'suspended') return;
    try {
      const osc = actx.createOscillator();
      const gain = actx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(523, actx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1046, actx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.2, actx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, actx.currentTime + 0.32);
      osc.connect(gain);
      gain.connect(actx.destination);
      osc.start();
      osc.stop(actx.currentTime + 0.35);
    } catch(e) {}
  }
}

const audio = new GolfAudio();

// --- 2. COURSE DEFINITIONS & GAME STATE ---
const COURSES = [
  // Course 1: Straight Shot
  {
    par: 3,
    start: { x: 80, y: 210 },
    hole: { x: 520, y: 210, radius: 14 },
    walls: [
      { x1: 40, y1: 40, x2: 560, y2: 40 },
      { x1: 560, y1: 40, x2: 560, y2: 380 },
      { x1: 560, y1: 380, x2: 40, y2: 380 },
      { x1: 40, y1: 380, x2: 40, y2: 40 }
    ],
    portals: []
  },
  // Course 2: Dogleg Right
  {
    par: 3,
    start: { x: 80, y: 100 },
    hole: { x: 500, y: 320, radius: 14 },
    walls: [
      { x1: 40, y1: 40, x2: 320, y2: 40 },
      { x1: 320, y1: 40, x2: 320, y2: 240 },
      { x1: 320, y1: 240, x2: 560, y2: 240 },
      { x1: 560, y1: 240, x2: 560, y2: 380 },
      { x1: 560, y1: 380, x2: 40, y2: 380 },
      { x1: 40, y1: 380, x2: 40, y2: 40 }
    ],
    portals: []
  },
  // Course 3: Quantum Warp Portals
  {
    par: 4,
    start: { x: 80, y: 320 },
    hole: { x: 520, y: 100, radius: 14 },
    walls: [
      { x1: 40, y1: 40, x2: 560, y2: 40 },
      { x1: 560, y1: 40, x2: 560, y2: 380 },
      { x1: 560, y1: 380, x2: 40, y2: 380 },
      { x1: 40, y1: 380, x2: 40, y2: 40 },
      { x1: 280, y1: 40, x2: 280, y2: 260 }
    ],
    portals: [
      { inX: 200, inY: 320, outX: 360, outY: 100, color: '#ec4899' }
    ]
  },
  // Course 4: Slanted Bumper Alley
  {
    par: 4,
    start: { x: 80, y: 210 },
    hole: { x: 520, y: 210, radius: 14 },
    walls: [
      { x1: 40, y1: 40, x2: 560, y2: 40 },
      { x1: 560, y1: 40, x2: 560, y2: 380 },
      { x1: 560, y1: 380, x2: 40, y2: 380 },
      { x1: 40, y1: 380, x2: 40, y2: 40 },
      { x1: 220, y1: 120, x2: 280, y2: 220 },
      { x1: 380, y1: 200, x2: 320, y2: 300 }
    ],
    portals: []
  },
  // Course 5: Master Circuit
  {
    par: 5,
    start: { x: 80, y: 340 },
    hole: { x: 520, y: 80, radius: 14 },
    walls: [
      { x1: 40, y1: 40, x2: 560, y2: 40 },
      { x1: 560, y1: 40, x2: 560, y2: 380 },
      { x1: 560, y1: 380, x2: 40, y2: 380 },
      { x1: 40, y1: 380, x2: 40, y2: 40 },
      { x1: 180, y1: 140, x2: 420, y2: 140 },
      { x1: 180, y1: 260, x2: 420, y2: 260 }
    ],
    portals: [
      { inX: 120, inY: 100, outX: 480, outY: 320, color: '#06b6d4' }
    ]
  }
];

let currentHoleIndex = 0;
let totalStrokes = 0;
let currentStrokes = 0;
let gameState = 'START';

const ball = {
  x: 0,
  y: 0,
  vx: 0,
  vy: 0,
  radius: 7,
  isMoving: false
};

// Drag Aiming Vector
let isDragging = false;
let dragStart = { x: 0, y: 0 };
let dragCurrent = { x: 0, y: 0 };

let particles = [];
let popups = [];

function loadCourse(index) {
  currentHoleIndex = index;
  const course = COURSES[currentHoleIndex];
  ball.x = course.start.x;
  ball.y = course.start.y;
  ball.vx = 0;
  ball.vy = 0;
  ball.isMoving = false;
  currentStrokes = 0;

  hudHole.textContent = `${currentHoleIndex + 1} / ${COURSES.length}`;
  hudStrokes.textContent = String(currentStrokes);
  hudPar.textContent = String(course.par);
}

btnStart.addEventListener('click', startGame);
btnResetHole.addEventListener('click', () => loadCourse(currentHoleIndex));

function startGame() {
  totalStrokes = 0;
  loadCourse(0);
  gameState = 'PLAYING';
  particles = [];
  popups = [];
  startOverlay.classList.add('hidden');
  audio.startBGM();
}

// --- 3. MOUSE DRAG AIM & PUTT ---
canvas.addEventListener('mousedown', (e) => {
  if (gameState !== 'PLAYING' || ball.isMoving) return;

  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  const distToBall = Math.hypot(mouseX - ball.x, mouseY - ball.y);
  if (distToBall < 35) {
    isDragging = true;
    dragStart = { x: ball.x, y: ball.y };
    dragCurrent = { x: mouseX, y: mouseY };
  }
});

canvas.addEventListener('mousemove', (e) => {
  if (!isDragging) return;
  const rect = canvas.getBoundingClientRect();
  dragCurrent.x = e.clientX - rect.left;
  dragCurrent.y = e.clientY - rect.top;
});

canvas.addEventListener('mouseup', () => {
  if (!isDragging) return;
  isDragging = false;

  const dx = dragStart.x - dragCurrent.x;
  const dy = dragStart.y - dragCurrent.y;
  const power = Math.min(Math.hypot(dx, dy) * 0.14, 18);

  if (power > 0.5) {
    const angle = Math.atan2(dy, dx);
    ball.vx = Math.cos(angle) * power;
    ball.vy = Math.sin(angle) * power;
    ball.isMoving = true;
    currentStrokes++;
    totalStrokes++;
    hudStrokes.textContent = String(currentStrokes);
    audio.playPutt();
    addSparks(ball.x, ball.y, '#eab308', 12);
  }
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
      color: color || '#eab308'
    });
  }
}

function addPopup(x, y, text, color) {
  popups.push({ x, y, text, color: color || '#38bdf8', life: 1 });
}

// --- 4. PHYSICS & UPDATE LOOP ---
function update() {
  if (gameState !== 'PLAYING') return;
  const course = COURSES[currentHoleIndex];

  if (ball.isMoving) {
    // Friction
    ball.vx *= 0.985;
    ball.vy *= 0.985;
    ball.x += ball.vx;
    ball.y += ball.vy;

    const speed = Math.hypot(ball.vx, ball.vy);
    if (speed < 0.15) {
      ball.vx = 0;
      ball.vy = 0;
      ball.isMoving = false;
    }

    // Wall Collisions
    course.walls.forEach(w => {
      collideBallSegment(ball, w.x1, w.y1, w.x2, w.y2);
    });

    // Portal Warps
    course.portals.forEach(port => {
      const dist = Math.hypot(ball.x - port.inX, ball.y - port.inY);
      if (dist < 18) {
        ball.x = port.outX;
        ball.y = port.outY;
        addSparks(port.outX, port.outY, port.color, 20);
      }
    });

    // Hole Sink Check
    const distToHole = Math.hypot(ball.x - course.hole.x, ball.y - course.hole.y);
    if (distToHole < course.hole.radius) {
      audio.playHoleIn();
      addSparks(course.hole.x, course.hole.y, '#10b981', 30);
      addPopup(course.hole.x, course.hole.y - 20, currentStrokes === 1 ? 'HOLE IN ONE!' : 'HOLED IN!', '#10b981');
      ball.isMoving = false;

      setTimeout(() => {
        if (currentHoleIndex + 1 < COURSES.length) {
          loadCourse(currentHoleIndex + 1);
        } else {
          gameState = 'GAMEOVER';
          audio.stopBGM();
          startOverlay.innerHTML = `
            <div class="text-6xl mb-2 animate-bounce">⛳🏆</div>
            <h2 class="font-orbitron font-black text-3xl tracking-wider text-yellow-400 mb-2">COURSE COMPLETED!</h2>
            <p class="text-xs text-slate-300 mb-4">TOTAL STROKES: <span class="text-cyan-400 font-bold font-orbitron text-base">${totalStrokes}</span></p>
            <button id="btn-restart" class="font-orbitron font-bold px-8 py-3 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 text-slate-950 rounded-lg shadow-lg">
              PLAY AGAIN
            </button>
          `;
          startOverlay.classList.remove('hidden');
          document.getElementById('btn-restart').addEventListener('click', startGame);
        }
      }, 900);
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

function collideBallSegment(b, x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return;

  let t = ((b.x - x1) * dx + (b.y - y1) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));

  const nearX = x1 + t * dx;
  const nearY = y1 + t * dy;

  const distX = b.x - nearX;
  const distY = b.y - nearY;
  const dist = Math.hypot(distX, distY);

  if (dist < b.radius) {
    let nx = dist > 0 ? distX / dist : 0;
    let ny = dist > 0 ? distY / dist : -1;

    b.x = nearX + nx * b.radius;
    b.y = nearY + ny * b.radius;

    const dot = b.vx * nx + b.vy * ny;
    if (dot < 0) {
      b.vx = (b.vx - 2 * dot * nx) * 0.75;
      b.vy = (b.vy - 2 * dot * ny) * 0.75;
    }
  }
}

// --- 5. RENDER LOOP ---
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const course = COURSES[currentHoleIndex];

  // Draw Course Walls
  ctx.strokeStyle = '#eab308';
  ctx.lineWidth = 4;
  ctx.shadowColor = '#eab308';
  ctx.shadowBlur = 10;
  course.walls.forEach(w => {
    ctx.beginPath();
    ctx.moveTo(w.x1, w.y1);
    ctx.lineTo(w.x2, w.y2);
    ctx.stroke();
  });
  ctx.shadowBlur = 0;

  // Draw Portals
  course.portals.forEach(port => {
    ctx.save();
    ctx.fillStyle = port.color;
    ctx.shadowColor = port.color;
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(port.inX, port.inY, 14, 0, Math.PI * 2);
    ctx.arc(port.outX, port.outY, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });

  // Draw Hole
  ctx.save();
  ctx.fillStyle = '#030712';
  ctx.beginPath();
  ctx.arc(course.hole.x, course.hole.y, course.hole.radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#10b981';
  ctx.shadowColor = '#10b981';
  ctx.shadowBlur = 14;
  ctx.stroke();
  ctx.restore();

  // Draw Aiming Line while Dragging
  if (isDragging) {
    ctx.save();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.moveTo(ball.x, ball.y);
    const targetX = ball.x + (dragStart.x - dragCurrent.x);
    const targetY = ball.y + (dragStart.y - dragCurrent.y);
    ctx.lineTo(targetX, targetY);
    ctx.stroke();
    ctx.restore();
  }

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

  // Draw Ball
  if (gameState === 'PLAYING') {
    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = '#eab308';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
