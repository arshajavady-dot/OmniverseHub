/**
 * Cyber Runner — Synthwave Endless Highway Game Engine
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

// Audio Synth
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function resumeAudio() {
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}
['click', 'keydown', 'touchstart'].forEach(e => window.addEventListener(e, resumeAudio, { passive: true }));

function playFx(freq, type, duration, ramp = true) {
  try {
    resumeAudio();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    if (ramp) {
      osc.frequency.exponentialRampToValueAtTime(freq / 2, audioCtx.currentTime + duration);
    }
    gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + duration);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch(e) {}
}

// Game State
let isPlaying = false;
let distance = 0;
let baseSpeed = 8;
let speed = baseSpeed;
let nitro = 0; // 0 to 100
let isNitroActive = false;
let lane = 1; // 0: left, 1: center, 2: right
let playerYOffset = 0;
let isJumping = false;
let jumpVel = 0;

let obstacles = [];
let pickups = [];
let particles = [];
let horizonY = H * 0.45;
let roadWidthBottom = W * 0.8;
let roadWidthTop = W * 0.15;

function getLaneX(l, zRatio) {
  const currentRoadWidth = roadWidthTop + (roadWidthBottom - roadWidthTop) * zRatio;
  const laneWidth = currentRoadWidth / 3;
  const centerX = W / 2;
  const startX = centerX - currentRoadWidth / 2;
  return startX + laneWidth * (l + 0.5);
}

// High-Speed Synthwave Highway BGM Engine (Cyber-Invaders Multi-Track Style)
let bgmTimer = null;
let bgmStep = 0;

function playHiHat(now) {
  try {
    const bufferSize = audioCtx.sampleRate * 0.03;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 8000;
    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0.04, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);
    noise.start(now);
  } catch(e) {}
}

function playSnare(now) {
  try {
    const bufferSize = audioCtx.sampleRate * 0.08;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 2500;
    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0.07, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
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
  const bassNotes = [73.42, 73.42, 58.27, 58.27, 87.31, 87.31, 65.41, 65.41]; // D2, Bb1, F2, C2
  const leadArp = [293.66, 349.23, 440.00, 587.33, 440.00, 349.23, 293.66, 587.33]; // D4, F4, A4, D5, A4, F4, D4, D5
  const stepMs = (60 / 130 / 4) * 1000; // 130 BPM

  bgmTimer = setInterval(() => {
    if (!isPlaying) return;
    try {
      const now = audioCtx.currentTime;
      // 1. Rolling Bassline
      const oscB = audioCtx.createOscillator();
      const filterB = audioCtx.createBiquadFilter();
      const gainB = audioCtx.createGain();
      oscB.type = 'sawtooth';
      const bFreq = bassNotes[Math.floor(bgmStep / 8) % bassNotes.length];
      oscB.frequency.setValueAtTime(bgmStep % 2 === 0 ? bFreq : bFreq * 2, now);
      filterB.type = 'lowpass';
      filterB.frequency.setValueAtTime(isNitroActive ? 800 : 450, now);
      filterB.frequency.exponentialRampToValueAtTime(120, now + 0.12);
      gainB.gain.setValueAtTime(0.08, now);
      gainB.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      oscB.connect(filterB);
      filterB.connect(gainB);
      gainB.connect(audioCtx.destination);
      oscB.start(now);
      oscB.stop(now + 0.12);

      // 2. Neon Melody Lead
      const arpFreq = leadArp[bgmStep % leadArp.length];
      const oscL = audioCtx.createOscillator();
      const gainL = audioCtx.createGain();
      oscL.type = isNitroActive ? 'sawtooth' : 'sine';
      oscL.frequency.setValueAtTime(arpFreq * (isNitroActive ? 1.5 : 1), now);
      gainL.gain.setValueAtTime(0.035, now);
      gainL.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      oscL.connect(gainL);
      gainL.connect(audioCtx.destination);
      oscL.start(now);
      oscL.stop(now + 0.1);

      // 3. Hi-Hat & Snare rhythm
      if (bgmStep % 2 === 1) playHiHat(now);
      if (bgmStep % 8 === 4) playSnare(now);

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
  distance = 0;
  speed = baseSpeed;
  nitro = 20;
  lane = 1;
  playerYOffset = 0;
  isJumping = false;
  jumpVel = 0;
  obstacles = [];
  pickups = [];
  particles = [];
  document.getElementById('overlay').classList.add('hidden');
  document.getElementById('game-over-info').classList.add('hidden');
  isPlaying = true;
  startBGM();
}

// Controls
window.addEventListener('keydown', (e) => {
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', ' '].includes(e.key) || ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
    e.preventDefault();
  }
  if (!isPlaying && (e.code === 'Space' || e.code === 'Enter')) {
    resetGame();
    return;
  }
  if (!isPlaying) return;

  if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
    if (lane > 0) {
      lane--;
      playFx(400, 'sine', 0.08);
    }
  } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
    if (lane < 2) {
      lane++;
      playFx(400, 'sine', 0.08);
    }
  } else if ((e.code === 'ArrowUp' || e.code === 'KeyW' || e.code === 'Space') && !isJumping) {
    isJumping = true;
    jumpVel = 14;
    playFx(600, 'triangle', 0.15);
  } else if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
    if (nitro >= 20 && !isNitroActive) {
      isNitroActive = true;
      playFx(800, 'sawtooth', 0.4);
    }
  }
});

document.getElementById('start-btn').addEventListener('click', resetGame);

// Spawn Logic
let spawnTimer = 0;
function spawnEntities() {
  spawnTimer += speed;
  if (spawnTimer > 180) {
    spawnTimer = 0;
    const l = Math.floor(Math.random() * 3);
    const rand = Math.random();

    if (rand < 0.65) {
      // Spawn Obstacle
      obstacles.push({ lane: l, z: 0, type: Math.random() < 0.5 ? 'barrier' : 'laser' });
    } else {
      // Spawn Pickup
      pickups.push({ lane: l, z: 0, type: Math.random() < 0.4 ? 'nitro' : 'orb' });
    }
  }
}

let lineOffset = 0;

function update() {
  if (!isPlaying) return;

  if (window.parent && window.parent !== window) {
    window.parent.postMessage({ type: 'SCORE_UPDATE', score: Math.floor(distance), distance: Math.floor(distance) }, '*');
  }

  // Nitro mechanics
  if (isNitroActive) {
    speed = baseSpeed * 2.2;
    nitro -= 0.8;
    if (nitro <= 0) {
      nitro = 0;
      isNitroActive = false;
    }
  } else {
    speed = baseSpeed + (distance / 500);
    nitro = Math.min(100, nitro + 0.05);
  }

  distance += Math.floor(speed / 3);

  // Jump physics
  if (isJumping) {
    playerYOffset += jumpVel;
    jumpVel -= 0.8;
    if (playerYOffset <= 0) {
      playerYOffset = 0;
      isJumping = false;
    }
  }

  // Update Line grid
  lineOffset = (lineOffset + speed * 0.15) % 40;

  spawnEntities();

  // Update Obstacles
  for (let i = obstacles.length - 1; i >= 0; i--) {
    let o = obstacles[i];
    o.z += speed * 0.005;

    // Collision check near player (z ~ 0.9)
    if (o.z >= 0.82 && o.z <= 0.96 && o.lane === lane) {
      if (o.type === 'laser' && isJumping && playerYOffset > 40) {
        // Dodged laser by jumping!
      } else if (!isNitroActive) {
        // Crash!
        playFx(150, 'sawtooth', 0.5, false);
        gameOver();
        return;
      }
    }

    if (o.z > 1.1) obstacles.splice(i, 1);
  }

  // Update Pickups
  for (let i = pickups.length - 1; i >= 0; i--) {
    let p = pickups[i];
    p.z += speed * 0.005;

    if (p.z >= 0.82 && p.z <= 0.96 && p.lane === lane && playerYOffset < 60) {
      if (p.type === 'nitro') {
        nitro = Math.min(100, nitro + 40);
        playFx(900, 'sine', 0.2);
      } else {
        distance += 100;
        playFx(700, 'sine', 0.15);
      }
      pickups.splice(i, 1);
    } else if (p.z > 1.1) {
      pickups.splice(i, 1);
    }
  }

  // Spawn Exhaust Particles
  const pX = getLaneX(lane, 0.9);
  const pY = H * 0.88 - playerYOffset;
  particles.push({
    x: pX + (Math.random() - 0.5) * 10,
    y: pY + 15,
    vx: (Math.random() - 0.5) * 2,
    vy: Math.random() * 3 + 2,
    size: Math.random() * 6 + 4,
    color: isNitroActive ? '#ec4899' : '#38bdf8',
    life: 1
  });

  for (let i = particles.length - 1; i >= 0; i--) {
    let pt = particles[i];
    pt.x += pt.vx;
    pt.y += pt.vy;
    pt.life -= 0.05;
    if (pt.life <= 0) particles.splice(i, 1);
  }

  // Update UI
  document.getElementById('score').textContent = distance + 'm';
  document.getElementById('speed').textContent = Math.floor(speed * 15) + ' KM/H';
  document.getElementById('nitro-bar').style.width = nitro + '%';
}

function gameOver() {
  isPlaying = false;
  stopBGM();
  document.getElementById('final-score-val').textContent = distance + 'm';
  document.getElementById('game-over-info').classList.remove('hidden');
  document.getElementById('overlay').classList.remove('hidden');
}

function render() {
  ctx.fillStyle = '#030712';
  ctx.fillRect(0, 0, W, H);

  // Background Synthwave Sun & Sky
  const grad = ctx.createLinearGradient(0, 0, 0, horizonY);
  grad.addColorStop(0, '#090514');
  grad.addColorStop(1, '#2e1065');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, horizonY);

  // Neon Sun
  ctx.save();
  ctx.beginPath();
  ctx.arc(W / 2, horizonY - 20, 90, 0, Math.PI * 2);
  const sunGrad = ctx.createLinearGradient(0, horizonY - 110, 0, horizonY);
  sunGrad.addColorStop(0, '#f43f5e');
  sunGrad.addColorStop(1, '#eab308');
  ctx.fillStyle = sunGrad;
  ctx.shadowColor = '#f43f5e';
  ctx.shadowBlur = 30;
  ctx.fill();
  ctx.restore();

  // Draw Highway Grid (Perspective)
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.moveTo(W / 2 - roadWidthTop / 2, horizonY);
  ctx.lineTo(W / 2 + roadWidthTop / 2, horizonY);
  ctx.lineTo(W / 2 + roadWidthBottom / 2, H);
  ctx.lineTo(W / 2 - roadWidthBottom / 2, H);
  ctx.closePath();
  ctx.fill();

  // Highway borders
  ctx.strokeStyle = '#a855f7';
  ctx.lineWidth = 4;
  ctx.shadowColor = '#a855f7';
  ctx.shadowBlur = 15;

  ctx.beginPath();
  ctx.moveTo(W / 2 - roadWidthTop / 2, horizonY);
  ctx.lineTo(W / 2 - roadWidthBottom / 2, H);
  ctx.moveTo(W / 2 + roadWidthTop / 2, horizonY);
  ctx.lineTo(W / 2 + roadWidthBottom / 2, H);
  ctx.stroke();

  // Lane dividers
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 2;
  ctx.setLineDash([20, 20]);
  for (let l = 1; l <= 2; l++) {
    ctx.beginPath();
    ctx.moveTo(getLaneX(l - 0.5, 0), horizonY);
    ctx.lineTo(getLaneX(l - 0.5, 1), H);
    ctx.stroke();
  }
  ctx.setLineDash([]);

  // Draw Horizontal Perspective Lines
  ctx.strokeStyle = '#6366f1';
  ctx.lineWidth = 1;
  for (let y = horizonY; y < H; y += (y - horizonY + 10) * 0.1) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }

  // Draw Pickups & Obstacles
  const allEntities = [...obstacles.map(o => ({ ...o, isObs: true })), ...pickups.map(p => ({ ...p, isObs: false }))];
  allEntities.sort((a, b) => a.z - b.z);

  allEntities.forEach(e => {
    const zRatio = e.z;
    const x = getLaneX(e.lane, zRatio);
    const y = horizonY + (H - horizonY) * zRatio;
    const scale = 0.2 + zRatio * 0.8;

    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);

    if (e.isObs) {
      if (e.type === 'barrier') {
        ctx.fillStyle = '#ef4444';
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 15;
        ctx.fillRect(-25, -30, 50, 30);
      } else {
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 6;
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.moveTo(-30, -40);
        ctx.lineTo(30, -40);
        ctx.stroke();
      }
    } else {
      ctx.fillStyle = e.type === 'nitro' ? '#ec4899' : '#eab308';
      ctx.shadowColor = ctx.fillStyle;
      ctx.shadowBlur = 20;
      ctx.beginPath();
      ctx.arc(0, -20, 18, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  });

  // Draw Exhaust Particles
  particles.forEach(pt => {
    ctx.fillStyle = pt.color;
    ctx.globalAlpha = pt.life;
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalAlpha = 1;

  // Draw Player Hoverbike
  const playerX = getLaneX(lane, 0.9);
  const playerY = H * 0.88 - playerYOffset;

  ctx.save();
  ctx.translate(playerX, playerY);

  // Bike Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.beginPath();
  ctx.ellipse(0, playerYOffset + 15, 30, 10, 0, 0, Math.PI * 2);
  ctx.fill();

  // Bike Body
  ctx.fillStyle = isNitroActive ? '#ec4899' : '#6366f1';
  ctx.shadowColor = ctx.fillStyle;
  ctx.shadowBlur = 25;
  ctx.beginPath();
  ctx.moveTo(0, -35);
  ctx.lineTo(20, 15);
  ctx.lineTo(-20, 15);
  ctx.closePath();
  ctx.fill();

  // Cockpit
  ctx.fillStyle = '#38bdf8';
  ctx.beginPath();
  ctx.arc(0, -10, 8, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function loop() {
  update();
  render();
  requestAnimationFrame(loop);
}
loop();
