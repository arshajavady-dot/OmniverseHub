/**
 * Mecha Kong: Girder Rampage — Retro Cyber Platformer Engine
 */

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const W = 560;
const H = 680;
canvas.width = W;
canvas.height = H;

// --- 1. WEB AUDIO SYNTHESIZER & BGM ENGINE ---
class KongAudioEngine {
  constructor() {
    this.ctx = null;
    this.isPlayingBGM = false;
    this.bgmTimer = null;
    this.step = 0;
    this.tempo = 126;

    this.bassNotes = [73.42, 98.00, 116.54, 110.00]; // D2, G2, Bb2, A2
    this.melodyNotes = [
      293.66, 349.23, 440, 523.25, 440, 349.23, 293.66, 349.23,
      392.00, 440, 523.25, 587.33, 523.25, 440, 392.00, 440,
      466.16, 523.25, 587.33, 659.25, 587.33, 523.25, 466.16, 523.25,
      440.00, 392.00, 349.23, 329.63, 293.66, 329.63, 349.23, 440.00
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
        gain.gain.setValueAtTime(0.085, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.14);
      }

      if (step % 2 === 1) {
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
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(120, now);
        osc.frequency.exponentialRampToValueAtTime(32, now + 0.12);
        gain.gain.setValueAtTime(0.14, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.12);
      }
    } catch(e) {}
  }

  playJump() {
    const actx = this.ensureCtx();
    if (!actx) return;
    try {
      const now = actx.currentTime;
      const osc = actx.createOscillator();
      const gain = actx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(600, now + 0.15);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      osc.connect(gain);
      gain.connect(actx.destination);
      osc.start(now);
      osc.stop(now + 0.15);
    } catch(e) {}
  }

  playSmash() {
    const actx = this.ensureCtx();
    if (!actx) return;
    try {
      const now = actx.currentTime;
      const osc = actx.createOscillator();
      const gain = actx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.exponentialRampToValueAtTime(60, now + 0.3);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      osc.connect(gain);
      gain.connect(actx.destination);
      osc.start(now);
      osc.stop(now + 0.3);
    } catch(e) {}
  }

  playIgnite() {
    const actx = this.ensureCtx();
    if (!actx) return;
    try {
      const now = actx.currentTime;
      const osc = actx.createOscillator();
      const gain = actx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(900, now + 0.25);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.connect(gain);
      gain.connect(actx.destination);
      osc.start(now);
      osc.stop(now + 0.25);
    } catch(e) {}
  }

  playStep() {
    const actx = this.ensureCtx();
    if (!actx) return;
    try {
      const now = actx.currentTime;
      const osc = actx.createOscillator();
      const gain = actx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(120, now);
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(gain);
      gain.connect(actx.destination);
      osc.start(now);
      osc.stop(now + 0.05);
    } catch(e) {}
  }

  playVictory() {
    const actx = this.ensureCtx();
    if (!actx) return;
    try {
      const now = actx.currentTime;
      [523, 659, 784, 1046].forEach((f, i) => {
        const osc = actx.createOscillator();
        const gain = actx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(f, now + i * 0.08);
        gain.gain.setValueAtTime(0.12, now + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.15);

        osc.connect(gain);
        gain.connect(actx.destination);
        osc.start(now + i * 0.08);
        osc.stop(now + i * 0.08 + 0.15);
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
      osc.frequency.setValueAtTime(500, now);
      osc.frequency.exponentialRampToValueAtTime(60, now + 0.5);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

      osc.connect(gain);
      gain.connect(actx.destination);
      osc.start(now);
      osc.stop(now + 0.5);
    } catch(e) {}
  }
}

const audio = new KongAudioEngine();

// --- 2. GAME STATE & ZIGZAG GIRDERS ---
let isPlaying = false;
let score = 0;
let level = 1;
let lives = 3;
let barrels = [];
let fireballs = [];
let particles = [];
let floatingTexts = [];
let kongTimer = 0;
let blueBarrelCycle = 0;

// Girders: Tier 6 (Top) to Tier 1 (Bottom floor)
const GIRDERS = [
  { x1: 15, y1: 640, x2: 545, y2: 640, tier: 1 }, // Tier 1: Bottom floor (Flat)
  { x1: 20, y1: 520, x2: 530, y2: 542, tier: 2 }, // Tier 2: Slopes right down (y2 > y1)
  { x1: 30, y1: 442, x2: 540, y2: 420, tier: 3 }, // Tier 3: Slopes left down (y1 > y2)
  { x1: 20, y1: 320, x2: 530, y2: 342, tier: 4 }, // Tier 4: Slopes right down (y2 > y1)
  { x1: 30, y1: 242, x2: 540, y2: 220, tier: 5 }, // Tier 5: Slopes left down (y1 > y2)
  { x1: 20, y1: 135, x2: 260, y2: 135, tier: 6 }, // Tier 6: Kong top spawn platform (Flat)
  { x1: 220, y1: 85, x2: 340, y2: 85, tier: 7 }   // VIP Summit platform
];

const LADDERS = [
  { x: 480, yBottom: 640, yTop: 540 },
  { x: 80,  yBottom: 524, yTop: 440 },
  { x: 280, yBottom: 532, yTop: 430 },
  { x: 480, yBottom: 424, yTop: 340 },
  { x: 80,  yBottom: 324, yTop: 240 },
  { x: 280, yBottom: 332, yTop: 230 },
  { x: 480, yBottom: 224, yTop: 135 },
  { x: 240, yBottom: 135, yTop: 85 }
];

let hammers = [];
function initHammers() {
  hammers = [
    { x: 80, y: 500, collected: false },
    { x: 480, y: 300, collected: false }
  ];
}

const player = {
  x: 60,
  y: 600,
  width: 22,
  height: 28,
  vx: 0,
  vy: 0,
  speed: 3.2,
  climbSpeed: 2.2,
  isGrounded: false,
  isClimbing: false,
  facing: 1,
  hammerTimer: 0,
  maxHammerTimer: 480,

  resetPos() {
    this.x = 60;
    this.y = 600;
    this.vx = 0;
    this.vy = 0;
    this.isClimbing = false;
    this.hammerTimer = 0;
  }
};

const keys = {};

window.addEventListener('keydown', (e) => {
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', ' '].includes(e.key) || ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
    e.preventDefault();
  }
  keys[e.code] = true;
  if (!isPlaying && (e.code === 'Space' || e.code === 'Enter')) {
    startGame();
  }
});

window.addEventListener('keyup', (e) => {
  keys[e.code] = false;
});

// --- 4. GAME UPDATE LOGIC ---
function update() {
  if (!isPlaying) return;

  if (window.parent && window.parent !== window) {
    window.parent.postMessage({ type: 'SCORE_UPDATE', score: score }, '*');
  }

  // 1. Player Movement & Ladder Climbing
  let onLadder = null;
  for (const lad of LADDERS) {
    if (Math.abs(player.x + player.width / 2 - lad.x) < 14 &&
        player.y + player.height >= lad.yTop - 6 &&
        player.y <= lad.yBottom + 6) {
      onLadder = lad;
      break;
    }
  }

  if (onLadder && (keys['KeyW'] || keys['ArrowUp'] || keys['KeyS'] || keys['ArrowDown'])) {
    player.isClimbing = true;
    player.vx = 0;
  }

  if (player.isClimbing && onLadder) {
    player.x = onLadder.x - player.width / 2;
    player.vy = 0;
    if (keys['KeyW'] || keys['ArrowUp']) {
      player.y -= player.climbSpeed;
      if (Math.random() < 0.2) audio.playStep();
    } else if (keys['KeyS'] || keys['ArrowDown']) {
      player.y += player.climbSpeed;
      if (Math.random() < 0.2) audio.playStep();
    }
    if (player.y + player.height < onLadder.yTop) {
      player.y = onLadder.yTop - player.height;
      player.isClimbing = false;
    } else if (player.y + player.height > onLadder.yBottom) {
      player.y = onLadder.yBottom - player.height;
      player.isClimbing = false;
    }
  } else {
    player.isClimbing = false;

    // Horizontal Movement
    player.vx = 0;
    if (keys['KeyA'] || keys['ArrowLeft']) {
      player.vx = -player.speed;
      player.facing = -1;
      if (player.isGrounded && Math.random() < 0.15) audio.playStep();
    }
    if (keys['KeyD'] || keys['ArrowRight']) {
      player.vx = player.speed;
      player.facing = 1;
      if (player.isGrounded && Math.random() < 0.15) audio.playStep();
    }

    // Jumping
    if ((keys['Space'] || keys['KeyW'] || keys['ArrowUp']) && player.isGrounded) {
      player.vy = -7.5;
      player.isGrounded = false;
      audio.playJump();
    }

    // Gravity
    player.vy += 0.38;
    player.x += player.vx;
    player.y += player.vy;

    // Girder Platform Collision for Player
    player.isGrounded = false;
    const feetX = player.x + player.width / 2;
    const feetY = player.y + player.height;

    for (const g of GIRDERS) {
      if (feetX >= g.x1 - 10 && feetX <= g.x2 + 10) {
        const progress = (feetX - g.x1) / (g.x2 - g.x1);
        const surfaceY = g.y1 + progress * (g.y2 - g.y1);
        if (feetY >= surfaceY - 8 && feetY <= surfaceY + 12 && player.vy >= 0) {
          player.y = surfaceY - player.height;
          player.vy = 0;
          player.isGrounded = true;
          break;
        }
      }
    }
  }

  player.x = Math.max(10, Math.min(W - player.width - 10, player.x));
  if (player.y > H) {
    onPlayerDeath();
  }

  // Hammer Power-up
  if (player.hammerTimer > 0) {
    player.hammerTimer--;
    if (Math.random() < 0.25) {
      spawnParticles(player.x + player.width / 2, player.y + player.height / 2, '#fbbf24', 2);
    }
  }

  hammers.forEach(h => {
    if (!h.collected && Math.hypot(player.x - h.x, player.y - h.y) < 28) {
      h.collected = true;
      player.hammerTimer = player.maxHammerTimer;
      audio.playSmash();
      spawnFloatingText(h.x, h.y, 'HAMMER POWER!', '#fbbf24');
    }
  });

  // 2. Mecha Kong Boss Barrel Spawner AI
  kongTimer++;
  if (kongTimer > Math.max(80, 160 - level * 15)) {
    kongTimer = 0;
    blueBarrelCycle++;

    const isBlueBarrel = (blueBarrelCycle % 3 === 0);

    barrels.push({
      x: isBlueBarrel ? 80 : 180,
      y: 135,
      r: 10,
      vx: isBlueBarrel ? -2.2 : 2.4,
      vy: 0,
      isBlue: isBlueBarrel,
      jumpAwarded: false
    });

    if (isBlueBarrel) {
      spawnFloatingText(100, 100, 'BLUE OIL BARREL!', '#38bdf8');
    }
  }

    // 3. Update Barrels (Guaranteed Zigzag Platform Navigation)
    for (let i = barrels.length - 1; i >= 0; i--) {
      const b = barrels[i];
      b.vy += 0.35;
      b.x += b.vx;
      b.y += b.vy;

      let landed = false;

      // Platform collision for barrels
      for (const g of GIRDERS) {
        if (b.x >= g.x1 - 4 && b.x <= g.x2 + 4) {
          const progress = Math.max(0, Math.min(1, (b.x - g.x1) / (g.x2 - g.x1)));
          const surfaceY = g.y1 + progress * (g.y2 - g.y1);

          if (b.y + b.r >= surfaceY - 8 && b.y + b.r <= surfaceY + 14 && b.vy >= 0) {
            b.y = surfaceY - b.r;
            b.vy = 0;
            landed = true;

            if (b.isBlue) {
              b.vx = -(2.2 + level * 0.15);
            } else {
              if (g.tier === 6) {
                b.vx = 2.4 + level * 0.15;
              } else if (g.tier === 1) {
                b.vx = -(2.2 + level * 0.15);
              } else if (g.y2 > g.y1) {
                b.vx = 2.4 + level * 0.15;
              } else if (g.y1 > g.y2) {
                b.vx = -(2.4 + level * 0.15);
              }
            }
            break;
          }
        }
      }

      // Freefall drop between tiers:
      if (!landed) {
        b.vx *= 0.7; // Damp horizontal velocity during vertical descent
        b.x = Math.max(12, Math.min(W - 12, b.x));
      }

    // Blue barrel incinerator ignition at bottom-left oil drum (x: 40, y: 618)
    if (b.isBlue && b.x <= 55 && b.y >= 580) {
      audio.playIgnite();
      spawnParticles(40, 615, '#38bdf8', 24);
      spawnParticles(40, 615, '#f97316', 30);
      spawnFloatingText(40, 580, '🔥 FIREBALL SPAWNED!', '#ef4444');

      fireballs.push({
        x: 40,
        y: 605,
        vx: 1.4 + level * 0.15,
        vy: -2.5,
        isClimbing: false,
        climbLadder: null,
        climbDir: -1,
        ladderCooldown: 40
      });

      barrels.splice(i, 1);
      continue;
    }

    // Jump bonus check (+100 pts)
    if (!b.jumpAwarded &&
        Math.abs(player.x + player.width / 2 - b.x) < 20 &&
        player.y + player.height < b.y - 4 &&
        player.y + player.height > b.y - 50) {
      b.jumpAwarded = true;
      score += 100;
      spawnFloatingText(b.x, b.y - 15, '+100', b.isBlue ? '#38bdf8' : '#f97316');
    }

    // Player collision with barrel
    const distToPlayer = Math.hypot(player.x + player.width / 2 - b.x, player.y + player.height / 2 - b.y);
    if (distToPlayer < b.r + player.width / 2) {
      if (player.hammerTimer > 0) {
        score += 500;
        audio.playSmash();
        spawnParticles(b.x, b.y, b.isBlue ? '#38bdf8' : '#fbbf24', 18);
        spawnFloatingText(b.x, b.y - 15, '+500 SMASH!', '#fbbf24');
        barrels.splice(i, 1);
        continue;
      } else {
        onPlayerDeath();
        return;
      }
    }

    // Remove if off bottom floor
    if (b.y > H + 20) {
      barrels.splice(i, 1);
    }
  }

  // 4. Update Flaming Fireballs (With Ladder Climbing AI)
  for (let i = fireballs.length - 1; i >= 0; i--) {
    const fb = fireballs[i];

    if (fb.isClimbing && fb.climbLadder) {
      // Climbing vertical ladder
      fb.x = fb.climbLadder.x;
      fb.y += fb.climbDir * (1.5 + level * 0.12);

      if (Math.random() < 0.25) {
        spawnParticles(fb.x, fb.y, '#f97316', 1);
      }

      if (fb.climbDir === -1 && fb.y <= fb.climbLadder.yTop) {
        // Reached top of ladder
        fb.y = fb.climbLadder.yTop;
        fb.isClimbing = false;
        fb.ladderCooldown = 120;
        fb.vx = (player.x >= fb.x ? 1 : -1) * (1.3 + level * 0.15);
      } else if (fb.climbDir === 1 && fb.y >= fb.climbLadder.yBottom) {
        // Reached bottom of ladder
        fb.y = fb.climbLadder.yBottom;
        fb.isClimbing = false;
        fb.ladderCooldown = 120;
        fb.vx = (player.x >= fb.x ? 1 : -1) * (1.3 + level * 0.15);
      }
    } else {
      // Wandering across girders
      if (fb.ladderCooldown > 0) fb.ladderCooldown--;

      fb.vy = (fb.vy || 0) + 0.35;
      fb.x += fb.vx;
      fb.y += fb.vy;

      // Platform collision
      for (const g of GIRDERS) {
        if (fb.x >= g.x1 - 6 && fb.x <= g.x2 + 6) {
          const progress = Math.max(0, Math.min(1, (fb.x - g.x1) / (g.x2 - g.x1)));
          const surfaceY = g.y1 + progress * (g.y2 - g.y1);

          if (fb.y >= surfaceY - 8 && fb.y <= surfaceY + 12 && fb.vy >= 0) {
            fb.y = surfaceY - 4;
            fb.vy = 0;
            break;
          }
        }
      }

      // Screen edge bounces
      if (fb.x < 25) { fb.x = 25; fb.vx = Math.abs(fb.vx); }
      if (fb.x > W - 25) { fb.x = W - 25; fb.vx = -Math.abs(fb.vx); }

      // Occasional random patrol turn
      if (Math.random() < 0.006) fb.vx *= -1;

      // Check ladder climb opportunities
      if (fb.ladderCooldown <= 0) {
        for (const lad of LADDERS) {
          if (Math.abs(fb.x - lad.x) < 8) {
            // Near bottom of ladder -> chance to climb UP
            if (Math.abs(fb.y - lad.yBottom) < 12) {
              const shouldClimb = (player.y < fb.y) ? Math.random() < 0.45 : Math.random() < 0.20;
              if (shouldClimb) {
                fb.isClimbing = true;
                fb.climbLadder = lad;
                fb.climbDir = -1;
                fb.x = lad.x;
                fb.vx = 0;
                fb.vy = 0;
                break;
              }
            }
            // Near top of ladder -> chance to climb DOWN
            else if (Math.abs(fb.y - lad.yTop) < 12) {
              const shouldClimb = (player.y > fb.y) ? Math.random() < 0.45 : Math.random() < 0.20;
              if (shouldClimb) {
                fb.isClimbing = true;
                fb.climbLadder = lad;
                fb.climbDir = 1;
                fb.x = lad.x;
                fb.vx = 0;
                fb.vy = 0;
                break;
              }
            }
          }
        }
      }
    }

    // Player collision with Fireball
    const distToPlayer = Math.hypot(player.x + player.width / 2 - fb.x, player.y + player.height / 2 - fb.y);
    if (distToPlayer < 18) {
      if (player.hammerTimer > 0) {
        score += 500;
        audio.playSmash();
        spawnParticles(fb.x, fb.y, '#ef4444', 20);
        spawnFloatingText(fb.x, fb.y - 15, '+500 SMASH!', '#ef4444');
        fireballs.splice(i, 1);
        continue;
      } else {
        onPlayerDeath();
        return;
      }
    }
  }

  // 5. Summit VIP Rescue Goal
  if (player.y <= 95 && player.x >= 220 && player.x <= 340) {
    score += 1500;
    level++;
    audio.playVictory();
    spawnFloatingText(W / 2, H / 2, 'VIP RESCUED! +1500', '#4ade80');
    barrels = [];
    fireballs = [];
    initHammers();
    player.resetPos();
  }

  // 6. Floating Text & Particles
  for (let i = floatingTexts.length - 1; i >= 0; i--) {
    const ft = floatingTexts[i];
    ft.y -= 1;
    ft.life -= 0.025;
    if (ft.life <= 0) floatingTexts.splice(i, 1);
  }

  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.life -= 0.04;
    if (p.life <= 0) particles.splice(i, 1);
  }

  // Update HUD
  document.getElementById('score').textContent = score.toString().padStart(5, '0');
  document.getElementById('level').textContent = `STAGE ${level}`;
  const hammerPct = (player.hammerTimer / player.maxHammerTimer) * 100;
  document.getElementById('hammer-bar').style.width = `${hammerPct}%`;

  const livesContainer = document.getElementById('lives-container');
  livesContainer.innerHTML = '';
  for (let i = 0; i < lives; i++) {
    const span = document.createElement('span');
    span.className = 'life-icon';
    span.textContent = '🤖';
    livesContainer.appendChild(span);
  }
}

function onPlayerDeath() {
  lives--;
  audio.playDeath();
  spawnParticles(player.x + player.width / 2, player.y + player.height / 2, '#ef4444', 30);
  if (lives <= 0) {
    gameOver();
  } else {
    player.resetPos();
    barrels = [];
  }
}

function gameOver() {
  isPlaying = false;
  audio.stopBGM();
  document.getElementById('final-score-val').textContent = score;
  document.getElementById('game-over-info').classList.remove('hidden');
  document.getElementById('overlay').classList.remove('hidden');
}

function spawnParticles(x, y, color, count = 10) {
  for (let i = 0; i < count; i++) {
    particles.push({
      x: x,
      y: y,
      vx: (Math.random() - 0.5) * 5,
      vy: (Math.random() - 0.5) * 5,
      color: color,
      life: 1
    });
  }
}

function spawnFloatingText(x, y, text, color) {
  floatingTexts.push({ x: x, y: y, text: text, color: color, life: 1 });
}

// --- 5. RENDER ENGINE ---
function render() {
  ctx.clearRect(0, 0, W, H);

  // 1. Draw Girders
  GIRDERS.forEach(g => {
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 8;
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.moveTo(g.x1, g.y1);
    ctx.lineTo(g.x2, g.y2);
    ctx.stroke();

    ctx.strokeStyle = '#991b1b';
    ctx.lineWidth = 2;
    ctx.shadowBlur = 0;
    const len = Math.hypot(g.x2 - g.x1, g.y2 - g.y1);
    const steps = Math.floor(len / 16);
    for (let s = 0; s < steps; s++) {
      const p1 = s / steps;
      const p2 = (s + 1) / steps;
      const xA = g.x1 + p1 * (g.x2 - g.x1);
      const yA = g.y1 + p1 * (g.y2 - g.y1);
      const xB = g.x1 + p2 * (g.x2 - g.x1);
      const yB = g.y1 + p2 * (g.y2 - g.y1);
      ctx.beginPath();
      ctx.moveTo(xA, yA - 3);
      ctx.lineTo(xB, yB + 3);
      ctx.stroke();
    }
  });

  // 2. Draw Ladders
  LADDERS.forEach(lad => {
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;
    ctx.shadowColor = '#06b6d4';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.moveTo(lad.x - 7, lad.yTop);
    ctx.lineTo(lad.x - 7, lad.yBottom);
    ctx.moveTo(lad.x + 7, lad.yTop);
    ctx.lineTo(lad.x + 7, lad.yBottom);
    ctx.stroke();

    ctx.lineWidth = 2;
    for (let ry = lad.yTop; ry <= lad.yBottom; ry += 12) {
      ctx.beginPath();
      ctx.moveTo(lad.x - 7, ry);
      ctx.lineTo(lad.x + 7, ry);
      ctx.stroke();
    }
    ctx.shadowBlur = 0;
  });

  // 3. Draw Flaming Oil Drum Incinerator (x: 40, y: 618)
  const drumX = 40;
  const drumY = 618;
  ctx.fillStyle = '#1e293b';
  ctx.strokeStyle = '#0284c7';
  ctx.lineWidth = 2;
  ctx.fillRect(drumX - 16, drumY - 20, 32, 28);
  ctx.strokeRect(drumX - 16, drumY - 20, 32, 28);

  const flameH = Math.sin(Date.now() * 0.015) * 6 + 14;
  ctx.fillStyle = '#f97316';
  ctx.shadowColor = '#ef4444';
  ctx.shadowBlur = 14;
  ctx.beginPath();
  ctx.moveTo(drumX - 12, drumY - 20);
  ctx.lineTo(drumX, drumY - 20 - flameH);
  ctx.lineTo(drumX + 12, drumY - 20);
  ctx.closePath();
  ctx.fill();
  ctx.shadowBlur = 0;

  // 4. Draw Hammers
  hammers.forEach(h => {
    if (!h.collected) {
      ctx.fillStyle = '#fbbf24';
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 14;
      ctx.fillRect(h.x - 6, h.y - 12, 12, 6);
      ctx.fillStyle = '#78350f';
      ctx.fillRect(h.x - 2, h.y - 6, 4, 12);
      ctx.shadowBlur = 0;
    }
  });

  // 5. Draw Mecha Kong Boss
  const kongX = 90;
  const kongY = 85;
  const kongBeat = Math.sin(Date.now() * 0.008) * 4;

  ctx.fillStyle = '#450a0a';
  ctx.strokeStyle = '#ef4444';
  ctx.lineWidth = 3;
  ctx.shadowColor = '#ef4444';
  ctx.shadowBlur = 18;

  ctx.fillRect(kongX - 28, kongY - 20, 56, 48);
  ctx.strokeRect(kongX - 28, kongY - 20, 56, 48);

  ctx.fillRect(kongX - 44, kongY - 10 + kongBeat, 16, 32);
  ctx.fillRect(kongX + 28, kongY - 10 - kongBeat, 16, 32);

  ctx.fillStyle = '#facc15';
  ctx.fillRect(kongX - 16, kongY - 12, 32, 6);

  ctx.fillStyle = '#ef4444';
  ctx.font = 'bold 9px Orbitron, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('MECHA KONG', kongX, kongY - 28);
  ctx.shadowBlur = 0;

  // 6. Draw VIP Hologram
  const vipX = 280;
  const vipY = 65;
  ctx.fillStyle = '#38bdf8';
  ctx.shadowColor = '#06b6d4';
  ctx.shadowBlur = 16;
  ctx.beginPath();
  ctx.arc(vipX, vipY - 6, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(vipX - 6, vipY, 12, 16);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 8px Orbitron, sans-serif';
  ctx.fillText('HELP! VIP', vipX, vipY - 16);
  ctx.shadowBlur = 0;

  // 7. Draw Barrels
  barrels.forEach(b => {
    ctx.fillStyle = b.isBlue ? '#0284c7' : '#ea580c';
    ctx.strokeStyle = b.isBlue ? '#38bdf8' : '#fed7aa';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = b.isBlue ? '#38bdf8' : '#f97316';
    ctx.shadowBlur = 16;
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    const spoke = (b.x * 0.2);
    ctx.beginPath();
    ctx.moveTo(b.x + Math.cos(spoke) * b.r, b.y + Math.sin(spoke) * b.r);
    ctx.lineTo(b.x - Math.cos(spoke) * b.r, b.y - Math.sin(spoke) * b.r);
    ctx.stroke();
    ctx.shadowBlur = 0;
  });

  // 8. Draw Flaming Fireballs (Red Plasma Fire with Climbing Tendrils)
  fireballs.forEach(fb => {
    const pulse = Math.sin(Date.now() * 0.015 + fb.x * 0.1) * 2;

    ctx.save();
    ctx.translate(fb.x, fb.y);

    // Outer fire glow aura
    ctx.fillStyle = '#ef4444';
    ctx.shadowColor = '#f97316';
    ctx.shadowBlur = 22;
    ctx.beginPath();
    ctx.arc(0, 0, 9 + pulse, 0, Math.PI * 2);
    ctx.fill();

    // Secondary orange flame core
    ctx.fillStyle = '#f97316';
    ctx.beginPath();
    ctx.arc(0, 0, 6 + pulse * 0.5, 0, Math.PI * 2);
    ctx.fill();

    // Hot yellow center
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(0, 0, 3, 0, Math.PI * 2);
    ctx.fill();

    // Flame climbing tendrils
    if (fb.isClimbing) {
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(-2, fb.climbDir === -1 ? 6 : -10, 4, 6);
    }

    ctx.shadowBlur = 0;
    ctx.restore();
  });

  // 9. Draw Player
  ctx.save();
  ctx.translate(player.x + player.width / 2, player.y + player.height / 2);
  ctx.scale(player.facing, 1);

  ctx.fillStyle = player.hammerTimer > 0 ? '#fbbf24' : '#06b6d4';
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1.5;
  ctx.shadowColor = ctx.fillStyle;
  ctx.shadowBlur = 14;

  ctx.beginPath();
  ctx.arc(0, -8, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillRect(-7, -2, 14, 12);
  ctx.strokeRect(-7, -2, 14, 12);

  ctx.fillRect(-6, 10, 4, 6);
  ctx.fillRect(2, 10, 4, 6);

  if (player.hammerTimer > 0) {
    const swing = Math.sin(Date.now() * 0.02) * 15;
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(8, -14 + swing, 14, 8);
    ctx.fillStyle = '#78350f';
    ctx.fillRect(4, -8 + swing, 10, 4);
  }

  ctx.shadowBlur = 0;
  ctx.restore();

  // 10. Floating Text & Particles
  floatingTexts.forEach(ft => {
    ctx.fillStyle = ft.color;
    ctx.font = 'bold 12px Orbitron, sans-serif';
    ctx.shadowColor = ft.color;
    ctx.shadowBlur = 10;
    ctx.textAlign = 'center';
    ctx.fillText(ft.text, ft.x, ft.y);
    ctx.shadowBlur = 0;
  });

  particles.forEach(p => {
    ctx.fillStyle = p.color;
    ctx.globalAlpha = p.life;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalAlpha = 1;
}

function loop() {
  update();
  render();
  requestAnimationFrame(loop);
}

function startGame() {
  score = 0;
  level = 1;
  lives = 3;
  barrels = [];
  fireballs = [];
  initHammers();
  player.resetPos();
  document.getElementById('overlay').classList.add('hidden');
  document.getElementById('game-over-info').classList.add('hidden');
  isPlaying = true;
  audio.startBGM();
}

document.getElementById('start-btn').addEventListener('click', startGame);

initHammers();
loop();
