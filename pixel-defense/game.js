/**
 * Pixel Defense — Cyber Missile Command Engine
 */

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let W = window.innerWidth;
let H = window.innerHeight;
let groundY = H - 65;

// Game State
let isPlaying = false;
let score = 0;
let wave = 1;
let enemiesToSpawn = 8;
let isWaveIntermission = false;
let waveIntermissionTimer = 0;
let waveBannerText = '';
let cityHealth = 100;
let isShieldActive = false;
let shieldEnergy = 100;
const SHIELD_RADIUS = 62;
let mousePos = { x: W / 2, y: H / 2 };

let enemyMissiles = [];
let playerMissiles = [];
let explosions = [];
let particles = [];
let turrets = [];
let enemyGunships = [];

function initEnemyGunships() {
  enemyGunships = [];
  if (wave === 1) {
    enemyGunships.push(
      { id: 1, name: 'DREADNOUGHT A', x: W * 0.32, y: 135, vx: 1.2, width: 92, height: 40, health: 3, maxHealth: 3, charge: 15, recoil: 0, targetX: W * 0.30, isDead: false },
      { id: 2, name: 'DREADNOUGHT B', x: W * 0.68, y: 155, vx: -1.2, width: 92, height: 40, health: 3, maxHealth: 3, charge: 55, recoil: 0, targetX: W * 0.70, isDead: false }
    );
  } else if (wave === 2) {
    enemyGunships.push(
      { id: 1, name: 'DREADNOUGHT A', x: W * 0.22, y: 135, vx: 1.3, width: 92, height: 40, health: 3, maxHealth: 3, charge: 0, recoil: 0, targetX: W * 0.25, isDead: false },
      { id: 2, name: 'COMMAND CARRIER', x: W * 0.50, y: 165, vx: -0.9, width: 116, height: 48, health: 5, maxHealth: 5, charge: 30, recoil: 0, targetX: W * 0.50, isDead: false },
      { id: 3, name: 'DREADNOUGHT B', x: W * 0.78, y: 140, vx: -1.3, width: 92, height: 40, health: 3, maxHealth: 3, charge: 60, recoil: 0, targetX: W * 0.75, isDead: false }
    );
  } else {
    enemyGunships.push(
      { id: 1, name: 'DREADNOUGHT A', x: W * 0.18, y: 135, vx: 1.4, width: 92, height: 40, health: 4, maxHealth: 4, charge: 0, recoil: 0, targetX: W * 0.20, isDead: false },
      { id: 2, name: 'COMMAND CARRIER', x: W * 0.42, y: 170, vx: -1.0, width: 116, height: 48, health: 6, maxHealth: 6, charge: 25, recoil: 0, targetX: W * 0.45, isDead: false },
      { id: 3, name: 'WAR CRUISER', x: W * 0.65, y: 140, vx: 1.2, width: 98, height: 44, health: 4, maxHealth: 4, charge: 50, recoil: 0, targetX: W * 0.65, isDead: false },
      { id: 4, name: 'DREADNOUGHT B', x: W * 0.85, y: 155, vx: -1.4, width: 92, height: 40, health: 4, maxHealth: 4, charge: 75, recoil: 0, targetX: W * 0.85, isDead: false }
    );
  }
}

function updateTurrets() {
  groundY = H - 65;
  if (!turrets || turrets.length === 0) {
    turrets = [
      { id: 'left', name: 'LEFT CANNON', relX: 0.16, x: W * 0.16, y: groundY - 5, ammo: 30, maxAmmo: 30, color: '#38bdf8', recoil: 0 },
      { id: 'center', name: 'MAIN CANNON', relX: 0.50, x: W * 0.50, y: groundY - 5, ammo: 50, maxAmmo: 50, color: '#06b6d4', recoil: 0 },
      { id: 'right', name: 'RIGHT CANNON', relX: 0.84, x: W * 0.84, y: groundY - 5, ammo: 30, maxAmmo: 30, color: '#38bdf8', recoil: 0 }
    ];
  } else {
    turrets[0].x = W * 0.16;
    turrets[0].y = groundY - 5;
    turrets[1].x = W * 0.50;
    turrets[1].y = groundY - 5;
    turrets[2].x = W * 0.84;
    turrets[2].y = groundY - 5;
  }
}

function resize() {
  const container = document.getElementById('game-container');
  W = canvas.width = container ? (container.clientWidth || window.innerWidth || 1000) : (window.innerWidth || 1000);
  H = canvas.height = container ? (container.clientHeight || window.innerHeight || 650) : (window.innerHeight || 650);
  updateTurrets();
  if (enemyGunships.length === 0) initEnemyGunships();
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
['click', 'keydown', 'touchstart', 'mousemove'].forEach(e => window.addEventListener(e, resumeAudio, { passive: true }));

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

// Tense Missile Command Defense BGM Engine (Cyber-Invaders Multi-Track Style)
let bgmTimer = null;
let bgmStep = 0;

function playWarDrum(now) {
  try {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(110, now);
    osc.frequency.exponentialRampToValueAtTime(32, now + 0.18);
    gain.gain.setValueAtTime(0.16, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.18);
  } catch(e) {}
}

function playDefenseHat(now) {
  try {
    const bufferSize = audioCtx.sampleRate * 0.025;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 7500;
    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0.035, now);
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
  // Gm -> Eb -> F -> D (Heavy Tension Defense March)
  const bassNotes = [98.00, 77.78, 87.31, 73.42]; // G2, Eb2, F2, D2
  const leadArp = [392.00, 466.16, 587.33, 783.99, 587.33, 466.16, 392.00, 783.99]; // G4, Bb4, D5, G5, D5, Bb4, G4, G5
  const stepMs = (60 / 112 / 4) * 1000; // 112 BPM

  bgmTimer = setInterval(() => {
    if (!isPlaying) return;
    try {
      const now = audioCtx.currentTime;
      // 1. Heavy Industrial March Bass
      const oscB = audioCtx.createOscillator();
      const filterB = audioCtx.createBiquadFilter();
      const gainB = audioCtx.createGain();
      oscB.type = 'sawtooth';
      const bFreq = bassNotes[Math.floor(bgmStep / 16) % bassNotes.length];
      oscB.frequency.setValueAtTime(bgmStep % 4 === 0 || bgmStep % 4 === 3 ? bFreq : bFreq * 0.5, now);
      filterB.type = 'lowpass';
      filterB.frequency.setValueAtTime(cityHealth < 40 ? 700 : 380, now);
      filterB.frequency.exponentialRampToValueAtTime(80, now + 0.14);
      gainB.gain.setValueAtTime(0.075, now);
      gainB.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
      oscB.connect(filterB);
      filterB.connect(gainB);
      gainB.connect(audioCtx.destination);
      oscB.start(now);
      oscB.stop(now + 0.14);

      // 2. Alarm Tension Arpeggios
      const arpFreq = leadArp[bgmStep % leadArp.length];
      const oscL = audioCtx.createOscillator();
      const gainL = audioCtx.createGain();
      oscL.type = 'sawtooth';
      oscL.frequency.setValueAtTime(arpFreq * (cityHealth < 40 ? 1.2 : 1), now);
      gainL.gain.setValueAtTime(0.028, now);
      gainL.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      oscL.connect(gainL);
      gainL.connect(audioCtx.destination);
      oscL.start(now);
      oscL.stop(now + 0.08);

      // 3. War Drum & Percussion
      if (bgmStep % 4 === 0) playWarDrum(now);
      if (bgmStep % 2 === 1) playDefenseHat(now);

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
  wave = 1;
  enemiesToSpawn = 8;
  isWaveIntermission = false;
  waveIntermissionTimer = 0;
  waveBannerText = '';
  cityHealth = 100;
  isShieldActive = false;
  shieldEnergy = 100;
  enemyMissiles = [];
  playerMissiles = [];
  explosions = [];
  particles = [];

  initEnemyGunships();
  updateTurrets();
  turrets[0].ammo = 30;
  turrets[1].ammo = 50;
  turrets[2].ammo = 30;

  document.getElementById('overlay').classList.add('hidden');
  document.getElementById('game-over-info').classList.add('hidden');
  isPlaying = true;
  startBGM();
}

window.addEventListener('contextmenu', (e) => {
  e.preventDefault();
});

window.addEventListener('mousemove', (e) => {
  mousePos.x = e.clientX;
  mousePos.y = e.clientY;
});

window.addEventListener('mousedown', (e) => {
  if (e.button === 2) {
    e.preventDefault();
    if (isPlaying && shieldEnergy > 10) {
      isShieldActive = true;
      playFx(450, 'sine', 0.1, false);
    }
  } else if (e.button === 0 && isPlaying) {
    fireMissile(e.clientX, e.clientY);
  }
});

window.addEventListener('mouseup', (e) => {
  if (e.button === 2) {
    e.preventDefault();
    isShieldActive = false;
  }
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
    fireMissile(mousePos.x, mousePos.y);
  } else if (e.code === 'KeyE') {
    triggerNuke();
  }
});

function triggerNuke() {
  if (score >= 500) {
    score -= 500;
    playFx(120, 'sawtooth', 0.8, false);
    explosions.push({
      x: W / 2,
      y: H / 2,
      r: 0,
      maxR: W * 0.6,
      color: '#eab308'
    });
  }
}

function fireMissile(tx, ty) {
  // Find closest turret with ammo
  let bestTurret = null;
  let minDist = Infinity;

  turrets.forEach(t => {
    if (t.ammo > 0) {
      const d = Math.hypot(t.x - tx, t.y - ty);
      if (d < minDist) {
        minDist = d;
        bestTurret = t;
      }
    }
  });

  if (bestTurret) {
    bestTurret.ammo--;
    bestTurret.recoil = 8;
    playFx(600, 'triangle', 0.12);
    playerMissiles.push({
      sx: bestTurret.x,
      sy: bestTurret.y - 12,
      x: bestTurret.x,
      y: bestTurret.y - 12,
      tx: tx,
      ty: ty,
      speed: 14
    });
  }
}

document.getElementById('start-btn').addEventListener('click', resetGame);

let spawnTimer = 0;
function spawnEnemyMissiles() {
  spawnTimer++;
  if (spawnTimer > Math.max(30, 90 - wave * 5)) {
    spawnTimer = 0;
    const sx = Math.random() * W;
    const tx = Math.random() * W;
    enemyMissiles.push({
      sx: sx,
      sy: 0,
      x: sx,
      y: 0,
      tx: tx,
      ty: H - 30,
      speed: 1.5 + wave * 0.2,
      color: '#ef4444'
    });
  }
}

function update() {
  if (!isPlaying) return;

  if (window.parent && window.parent !== window) {
    window.parent.postMessage({ type: 'SCORE_UPDATE', score: score }, '*');
  }

  // 1. Intermission / Wave Break Processing
  if (isWaveIntermission) {
    waveIntermissionTimer--;
    if (waveIntermissionTimer <= 0) {
      isWaveIntermission = false;
      waveBannerText = '';
      enemiesToSpawn = 6 + wave * 3;
      initEnemyGunships();
    }
    return;
  }

  // 2. Update Bad Guy Orbital Gunships & Downward Cannons
  enemyGunships.forEach(ship => {
    if (ship.isDead) return;

    ship.x += ship.vx;
    if (ship.x < 80) {
      ship.x = 80;
      ship.vx = Math.abs(ship.vx);
    } else if (ship.x > W - 80) {
      ship.x = W - 80;
      ship.vx = -Math.abs(ship.vx);
    }

    // Charge & Fire Heavy Plasma Cannon if wave quota remains
    if (enemiesToSpawn > 0) {
      ship.charge += (0.65 + wave * 0.12);
      if (ship.charge >= 100) {
        ship.charge = 0;
        ship.recoil = 12;
        enemiesToSpawn--;
        const tx = Math.random() * (W - 120) + 60;
        ship.targetX = tx;
        enemyMissiles.push({
          sx: ship.x,
          sy: ship.y + ship.height / 2 + 6,
          x: ship.x,
          y: ship.y + ship.height / 2 + 6,
          tx: tx,
          ty: H - 35,
          speed: 1.5 + wave * 0.18,
          color: '#ef4444'
        });
        playFx(200, 'sawtooth', 0.18);
      }
    }
  });

  // 3. Wave Completion Check: ONLY when ALL gunships are destroyed OR wave quota finished & zero in-flight missiles
  const livingGunships = enemyGunships.filter(s => !s.isDead);
  if ((livingGunships.length === 0 || enemiesToSpawn <= 0) && enemyMissiles.length === 0) {
    isWaveIntermission = true;
    waveIntermissionTimer = 160;
    waveBannerText = `WAVE ${wave} CLEARED!`;
    score += 500 + wave * 150;
    playFx(880, 'sine', 0.45);
    wave++;
    turrets.forEach(t => {
      t.ammo = Math.min(t.maxAmmo, t.ammo + 20);
    });
    return;
  }

  // Update Aegis Forcefield Shield
  if (isShieldActive && shieldEnergy > 0) {
    shieldEnergy = Math.max(0, shieldEnergy - 0.55);
    if (shieldEnergy <= 0) {
      isShieldActive = false;
      playFx(180, 'sawtooth', 0.2);
    }
  } else {
    shieldEnergy = Math.min(100, shieldEnergy + 0.35);
  }

  // Update Player Missiles
  for (let i = playerMissiles.length - 1; i >= 0; i--) {
    let m = playerMissiles[i];
    const dx = m.tx - m.x;
    const dy = m.ty - m.y;
    const dist = Math.hypot(dx, dy);

    if (dist < m.speed) {
      // Reached Target: Explode!
      explosions.push({
        x: m.tx,
        y: m.ty,
        r: 0,
        maxR: 45,
        color: '#06b6d4'
      });
      playFx(300, 'square', 0.2);
      playerMissiles.splice(i, 1);
    } else {
      m.x += (dx / dist) * m.speed;
      m.y += (dy / dist) * m.speed;
    }
  }

  // Update Enemy Missiles
  for (let i = enemyMissiles.length - 1; i >= 0; i--) {
    let m = enemyMissiles[i];

    // Check Shield Deflection Collision
    if (isShieldActive && shieldEnergy > 5) {
      const distToShield = Math.hypot(m.x - mousePos.x, m.y - mousePos.y);
      if (distToShield < SHIELD_RADIUS) {
        shieldEnergy = Math.max(0, shieldEnergy - 10);
        score += 35;
        playFx(520, 'sine', 0.12);
        spawnParticles(m.x, m.y, '#38bdf8');
        explosions.push({
          x: m.x,
          y: m.y,
          r: 0,
          maxR: 28,
          color: '#38bdf8'
        });
        enemyMissiles.splice(i, 1);
        continue;
      }
    }

    const dx = m.tx - m.x;
    const dy = m.ty - m.y;
    const dist = Math.hypot(dx, dy);

    if (dist < m.speed || m.y >= H - 40) {
      // Impact City!
      cityHealth -= 10;
      playFx(100, 'sawtooth', 0.3, false);
      explosions.push({
        x: m.x,
        y: m.y,
        r: 0,
        maxR: 35,
        color: '#ef4444'
      });
      enemyMissiles.splice(i, 1);

      if (cityHealth <= 0) {
        cityHealth = 0;
        gameOver();
        return;
      }
    } else {
      m.x += (dx / dist) * m.speed;
      m.y += (dy / dist) * m.speed;
    }
  }

  // Update Explosions & Collisions
  for (let eIdx = explosions.length - 1; eIdx >= 0; eIdx--) {
    let exp = explosions[eIdx];
    exp.r += 2;

    // Check Enemy Missile Collisions inside explosion radius
    for (let mIdx = enemyMissiles.length - 1; mIdx >= 0; mIdx--) {
      let em = enemyMissiles[mIdx];
      const d = Math.hypot(em.x - exp.x, em.y - exp.y);
      if (d < exp.r) {
        score += 50;
        spawnParticles(em.x, em.y, '#eab308');
        enemyMissiles.splice(mIdx, 1);
      }
    }

    // Check Bad Guy Gunship Collisions inside explosion radius
    enemyGunships.forEach(ship => {
      if (ship.isDead) return;
      const d = Math.hypot(ship.x - exp.x, ship.y - exp.y);
      if (d < exp.r + 28 && ship.health > 0) {
        ship.health--;
        spawnParticles(ship.x, ship.y, '#f59e0b');
        if (ship.health <= 0) {
          ship.isDead = true;
          score += 150;
          playFx(90, 'sawtooth', 0.5, false);
          explosions.push({
            x: ship.x,
            y: ship.y,
            r: 0,
            maxR: 60,
            color: '#ef4444'
          });
        }
      }
    });

    if (exp.r >= exp.maxR) {
      explosions.splice(eIdx, 1);
    }
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
  document.getElementById('wave').textContent = 'WAVE ' + wave;
  document.getElementById('city-bar').style.width = cityHealth + '%';
  const shieldBar = document.getElementById('shield-bar');
  if (shieldBar) shieldBar.style.width = shieldEnergy + '%';
}

function spawnParticles(x, y, color) {
  for (let i = 0; i < 10; i++) {
    particles.push({
      x: x,
      y: y,
      vx: (Math.random() - 0.5) * 5,
      vy: (Math.random() - 0.5) * 5,
      color: color,
      size: Math.random() * 4 + 2,
      life: 1
    });
  }
}

function gameOver() {
  isPlaying = false;
  stopBGM();
  if (localStorage.getItem('compy_q2_active') === 'true') {
    localStorage.setItem('compy_q2_city_destroyed', 'true');
    const desc = document.querySelector('.game-over-text');
    if (desc) desc.textContent = '💥 CITY DESTROYED! [COMPY DIRECTIVE COMPLETE]';
  }
  document.getElementById('final-score-val').textContent = score;
  document.getElementById('game-over-info').classList.remove('hidden');
  document.getElementById('overlay').classList.remove('hidden');
}

function render() {
  ctx.fillStyle = '#030712';
  ctx.fillRect(0, 0, W, H);

  // Neon City Skyline Background
  ctx.fillStyle = '#0f172a';
  for (let i = 0; i < W; i += 40) {
    const h = 40 + (Math.sin(i) * 0.5 + 0.5) * 60;
    ctx.fillRect(i, groundY - h, 36, h);
  }

  // Draw Ground Defense Platform
  ctx.fillStyle = '#0a0f1d';
  ctx.fillRect(0, groundY, W, H - groundY);

  ctx.strokeStyle = '#eab308';
  ctx.lineWidth = 3;
  ctx.shadowColor = '#eab308';
  ctx.shadowBlur = 12;
  ctx.beginPath();
  ctx.moveTo(0, groundY);
  ctx.lineTo(W, groundY);
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Draw High-Visibility Plasma Cannons
  turrets.forEach(t => {
    const hasAmmo = t.ammo > 0;
    const baseColor = hasAmmo ? (t.color || '#38bdf8') : '#ef4444';

    // Calculate angle towards mouse cursor
    const angle = Math.atan2(mousePos.y - t.y, mousePos.x - t.x);

    // 1. Armored Bunker Base (Trapezoid)
    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = baseColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(t.x - 38, groundY + 35);
    ctx.lineTo(t.x - 26, t.y - 2);
    ctx.lineTo(t.x + 26, t.y - 2);
    ctx.lineTo(t.x + 38, groundY + 35);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // 2. Heavy Dome Turret Head
    ctx.fillStyle = hasAmmo ? '#0284c7' : '#991b1b';
    ctx.strokeStyle = baseColor;
    ctx.lineWidth = 2;
    ctx.shadowColor = baseColor;
    ctx.shadowBlur = hasAmmo ? 14 : 4;
    ctx.beginPath();
    ctx.arc(t.x, t.y, 22, Math.PI, 0);
    ctx.fill();
    ctx.stroke();
    ctx.shadowBlur = 0;

    // 3. Aiming Dual Plasma Cannon Barrels (Rotating toward mouse cursor)
    ctx.save();
    ctx.translate(t.x, t.y - 5);
    ctx.rotate(angle);

    ctx.fillStyle = hasAmmo ? '#e0f2fe' : '#7f1d1d';
    ctx.strokeStyle = baseColor;
    ctx.lineWidth = 2;
    const recoilOffset = t.recoil || 0;

    // Barrel 1 & Barrel 2
    ctx.fillRect(8 - recoilOffset, -6, 26, 5);
    ctx.fillRect(8 - recoilOffset, 1, 26, 5);
    ctx.strokeRect(8 - recoilOffset, -6, 26, 5);
    ctx.strokeRect(8 - recoilOffset, 1, 26, 5);

    // Muzzle Flash
    if (t.recoil > 0) {
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 20;
      ctx.beginPath();
      ctx.arc(36 - recoilOffset, 0, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      t.recoil = Math.max(0, t.recoil - 1);
    }
    ctx.restore();

    // 4. Central Reactor Core Light
    ctx.fillStyle = hasAmmo ? '#38bdf8' : '#ef4444';
    ctx.shadowColor = ctx.fillStyle;
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(t.x, t.y - 4, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // 5. Holographic Ammo & Label Badge
    ctx.fillStyle = hasAmmo ? '#38bdf8' : '#ef4444';
    ctx.font = 'bold 12px Orbitron, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${t.ammo} / ${t.maxAmmo}`, t.x, groundY + 22);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '9px Orbitron, sans-serif';
    ctx.fillText(t.name, t.x, groundY + 36);
  });

  // --- DRAW BAD GUYS' ORBITAL ATTACK CANNONS & DREADNOUGHTS ---
  enemyGunships.forEach(ship => {
    if (ship.isDead) return;

    // 1. Plasma Engine Exhaust Flames (Top of Ship)
    const flameH = 8 + Math.random() * 8;
    ctx.fillStyle = '#f97316';
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.moveTo(ship.x - 22, ship.y - 12);
    ctx.lineTo(ship.x - 14, ship.y - 12 - flameH);
    ctx.lineTo(ship.x - 6, ship.y - 12);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(ship.x + 6, ship.y - 12);
    ctx.lineTo(ship.x + 14, ship.y - 12 - flameH);
    ctx.lineTo(ship.x + 22, ship.y - 12);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;

    // 2. Red Target Lock-on Laser
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.35)';
    ctx.setLineDash([6, 6]);
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(ship.x, ship.y + 12);
    ctx.lineTo(ship.targetX, H - 35);
    ctx.stroke();
    ctx.setLineDash([]);

    // Calculate angle towards target
    const angle = Math.atan2((H - 35) - (ship.y + 12), ship.targetX - ship.x);

    // 3. Heavy Crimson Armored Hull (Stealth Warship)
    ctx.fillStyle = '#7f1d1d';
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 16;
    
    // Main Cruiser Winged Body
    ctx.beginPath();
    ctx.moveTo(ship.x - ship.width / 2, ship.y - 6);
    ctx.lineTo(ship.x - ship.width / 3, ship.y + ship.height / 2);
    ctx.lineTo(ship.x + ship.width / 3, ship.y + ship.height / 2);
    ctx.lineTo(ship.x + ship.width / 2, ship.y - 6);
    ctx.lineTo(ship.x, ship.y - 14);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Wing Titanium Panels
    ctx.fillStyle = '#18181b';
    ctx.fillRect(ship.x - ship.width / 2 + 6, ship.y - 4, ship.width * 0.22, 10);
    ctx.fillRect(ship.x + ship.width / 2 - ship.width * 0.22 - 6, ship.y - 4, ship.width * 0.22, 10);

    // 4. Heavy Downward Plasma Cannon Turret
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(ship.x, ship.y + 8, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Aiming Dual Plasma Cannon Barrels
    ctx.save();
    ctx.translate(ship.x, ship.y + 8);
    ctx.rotate(angle);

    const recoil = ship.recoil || 0;
    ctx.fillStyle = '#dc2626';
    ctx.strokeStyle = '#fca5a5';
    ctx.lineWidth = 1.5;

    // Dual Heavy Barrels
    ctx.fillRect(6 - recoil, -5, 24, 4);
    ctx.fillRect(6 - recoil, 1, 24, 4);
    ctx.strokeRect(6 - recoil, -5, 24, 4);
    ctx.strokeRect(6 - recoil, 1, 24, 4);

    // Cannon Muzzle Flash on Fire
    if (ship.recoil > 0) {
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#f97316';
      ctx.shadowBlur = 22;
      ctx.beginPath();
      ctx.arc(32 - recoil, 0, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ship.recoil = Math.max(0, ship.recoil - 1);
    }
    ctx.restore();

    // 5. Central Glowing Eye / Power Core
    const chargePct = Math.min(1, ship.charge / 100);
    ctx.fillStyle = chargePct > 0.75 ? '#f43f5e' : '#b91c1c';
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 18 * chargePct;
    ctx.beginPath();
    ctx.arc(ship.x, ship.y + 4, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // 6. Enemy Health Bar & Dreadnought Label
    const barW = 56;
    const barH = 5;
    const hpPct = Math.max(0, ship.health / ship.maxHealth);
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(ship.x - barW / 2, ship.y - 24, barW, barH);
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(ship.x - barW / 2, ship.y - 24, barW * hpPct, barH);
    ctx.strokeStyle = '#f87171';
    ctx.lineWidth = 1;
    ctx.strokeRect(ship.x - barW / 2, ship.y - 24, barW, barH);

    ctx.fillStyle = '#fecaca';
    ctx.font = 'bold 9px Orbitron, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`⚠️ ${ship.name}`, ship.x, ship.y - 28);
  });

  // Draw Enemy Missiles with Visible Warheads
  enemyMissiles.forEach(m => {
    // Red Plasma Vapor Trail
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.6)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(m.sx, m.sy);
    ctx.lineTo(m.x, m.y);
    ctx.stroke();

    // Glowing Warhead Rocket Tip
    ctx.fillStyle = '#f87171';
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 14;
    ctx.beginPath();
    ctx.arc(m.x, m.y, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  });

  // Draw Player Missiles
  ctx.strokeStyle = '#06b6d4';
  ctx.lineWidth = 2;
  ctx.shadowColor = '#06b6d4';
  ctx.shadowBlur = 10;
  playerMissiles.forEach(m => {
    ctx.beginPath();
    ctx.moveTo(m.sx, m.sy);
    ctx.lineTo(m.x, m.y);
    ctx.stroke();
  });
  ctx.shadowBlur = 0;

  // Draw Explosions
  explosions.forEach(exp => {
    ctx.fillStyle = exp.color;
    ctx.shadowColor = exp.color;
    ctx.shadowBlur = 20;
    ctx.globalAlpha = 0.6;
    ctx.beginPath();
    ctx.arc(exp.x, exp.y, exp.r, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalAlpha = 1;
  ctx.shadowBlur = 0;

  // Draw Particles
  particles.forEach(pt => {
    ctx.fillStyle = pt.color;
    ctx.globalAlpha = pt.life;
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalAlpha = 1;

  // Draw Wave Cleared Intermission Banner
  if (isWaveIntermission && waveBannerText) {
    const bannerW = Math.min(420, W * 0.85);
    const bannerH = 100;
    const bx = (W - bannerW) / 2;
    const by = H * 0.4;

    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = '#22c55e';
    ctx.shadowBlur = 20;
    ctx.fillRect(bx, by, bannerW, bannerH);
    ctx.strokeRect(bx, by, bannerW, bannerH);
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#4ade80';
    ctx.font = 'bold 22px Orbitron, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(waveBannerText, W / 2, by + 38);

    ctx.fillStyle = '#38bdf8';
    ctx.font = '11px Orbitron, sans-serif';
    ctx.fillText('+400 CLEAR BONUS • AMMO RESUPPLIED', W / 2, by + 64);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px Rajdhani, sans-serif';
    ctx.fillText(`NEXT ASSAULT STARTING IN ${Math.ceil(waveIntermissionTimer / 60)}S...`, W / 2, by + 84);
  }

  // Draw Aegis Energy Forcefield Shield Barrier (Right-Click Hold)
  if (isShieldActive && shieldEnergy > 0) {
    const time = Date.now() * 0.003;

    // 1. Outer Glowing Forcefield Bubble
    ctx.fillStyle = 'rgba(56, 189, 248, 0.15)';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 24;
    ctx.beginPath();
    ctx.arc(mousePos.x, mousePos.y, SHIELD_RADIUS, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.shadowBlur = 0;

    // 2. Rotating Hexagonal Honeycomb Energy Matrix
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.5)';
    ctx.lineWidth = 1.5;
    for (let a = 0; a < 6; a++) {
      const angle = (a / 6) * Math.PI * 2 + time;
      const x1 = mousePos.x + Math.cos(angle) * (SHIELD_RADIUS - 8);
      const y1 = mousePos.y + Math.sin(angle) * (SHIELD_RADIUS - 8);
      const x2 = mousePos.x + Math.cos(angle + Math.PI / 3) * (SHIELD_RADIUS - 8);
      const y2 = mousePos.y + Math.sin(angle + Math.PI / 3) * (SHIELD_RADIUS - 8);
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.lineTo(mousePos.x, mousePos.y);
      ctx.stroke();
    }

    // 3. Floating Shield Energy Status
    ctx.fillStyle = '#e0f2fe';
    ctx.font = 'bold 11px Orbitron, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`SHIELD ${Math.round(shieldEnergy)}%`, mousePos.x, mousePos.y - SHIELD_RADIUS - 8);
  }

  // Crosshair
  ctx.strokeStyle = isShieldActive ? '#38bdf8' : '#eab308';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(mousePos.x, mousePos.y, 10, 0, Math.PI * 2);
  ctx.moveTo(mousePos.x - 15, mousePos.y);
  ctx.lineTo(mousePos.x + 15, mousePos.y);
  ctx.moveTo(mousePos.x, mousePos.y - 15);
  ctx.lineTo(mousePos.x, mousePos.y + 15);
  ctx.stroke();
}

function loop() {
  update();
  render();
  requestAnimationFrame(loop);
}
loop();
