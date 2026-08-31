/**
 * Subnautica Deep: Trench 99 — Multi-Round Abyssal Horror Simulator
 */

class AbyssAudioEngine {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.isBGMPlaying = false;
    this.bgmTimer = null;
    this.step = 0;
    this.tempo = 90;

    this.droneFreqs = [43.65, 38.89, 41.20, 36.71]; // Deep abyssal sub frequencies
    this.initOnGesture();
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  initOnGesture() {
    const unlock = () => {
      this.init();
      if (this.enabled && !this.isBGMPlaying) {
        this.startBGM();
      }
    };
    ['click', 'keydown', 'touchstart'].forEach(evt => {
      window.addEventListener(evt, unlock, { passive: true, once: true });
    });
  }

  startBGM() {
    this.init();
    if (!this.ctx || !this.enabled || this.isBGMPlaying) return;

    this.isBGMPlaying = true;
    const stepIntervalMs = (60 / this.tempo / 2) * 1000;

    if (this.bgmTimer) clearInterval(this.bgmTimer);
    this.bgmTimer = setInterval(() => {
      if (!this.isBGMPlaying || !this.enabled || !this.ctx) return;
      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      this.playBGMStep(this.step);
      this.step = (this.step + 1) % 32;
    }, stepIntervalMs);
  }

  stopBGM() {
    this.isBGMPlaying = false;
    if (this.bgmTimer) {
      clearInterval(this.bgmTimer);
      this.bgmTimer = null;
    }
  }

  playBGMStep(step) {
    if (!this.ctx || this.ctx.state === 'suspended') return;
    const now = this.ctx.currentTime;
    const drone = this.droneFreqs[Math.floor(step / 8) % this.droneFreqs.length];

    if (step % 8 === 0) {
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(drone, now);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);
        osc.connect(gain);
        gain.connect(this.masterGain || this.ctx.destination);
        osc.start(now);
        osc.stop(now + 1.8);
      } catch(e) {}
    }

    if (step % 4 === 2) {
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(160, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.6);
        gain.gain.setValueAtTime(0.03, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
        osc.connect(gain);
        gain.connect(this.masterGain || this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.6);
      } catch(e) {}
    }
  }

  playSonarPing() {
    if (!this.enabled || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1400, now);
      osc.frequency.exponentialRampToValueAtTime(900, now + 0.4);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      osc.connect(gain);
      gain.connect(this.masterGain || this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.6);
    } catch(e) {}
  }

  playProbe() {
    if (!this.enabled || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(587.33, now);
      osc.frequency.exponentialRampToValueAtTime(1174.66, now + 0.15);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      osc.connect(gain);
      gain.connect(this.masterGain || this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.18);
    } catch(e) {}
  }

  playRoundAdvance() {
    if (!this.enabled || !this.ctx) return;
    try {
      const freqs = [523.25, 659.25, 783.99, 1046.50];
      freqs.forEach((f, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const now = this.ctx.currentTime + idx * 0.08;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.connect(gain);
        gain.connect(this.masterGain || this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.25);
      });
    } catch(e) {}
  }

  playCrush() {
    if (!this.enabled || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(90, now);
      osc.frequency.exponentialRampToValueAtTime(30, now + 0.9);
      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.95);
      osc.connect(gain);
      gain.connect(this.masterGain || this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.95);
    } catch(e) {}
  }
}

class QuantumAbyss {
  constructor() {
    this.canvas = document.getElementById('abyssCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.w = this.canvas.width;
    this.h = this.canvas.height;

    this.audio = new AbyssAudioEngine();

    this.round = 1;
    this.lives = 3;
    this.totalProbesExtracted = 0;
    this.gameOver = false;
    this.roundBannerTimer = 0;
    this.roundBannerText = '';

    this.sub = {
      x: this.w / 2,
      y: 70,
      vx: 0,
      vy: 0,
      angle: Math.PI / 2,
      hull: 100
    };

    this.sonarRipples = [];
    this.sonarCooldown = 0;

    this.input = { up: false, down: false, left: false, right: false };

    this.initUI();
    this.initRound(1);
    this.loop();
  }

  initRound(roundNumber) {
    this.round = roundNumber;
    this.depth = 1200 + (this.round - 1) * 600;
    
    // Probes / Yellow Orbs Scaling & Cap:
    // Rounds 1-2: 3 | Rounds 3-4: 4 | Rounds 5-10: 5
    // Rounds 11-14: +1 yellow orb per round until hitting the 8-orb cap at Round 14+
    let probesCount = 3;
    if (this.round <= 2) {
      probesCount = 3;
    } else if (this.round <= 4) {
      probesCount = 4;
    } else if (this.round <= 10) {
      probesCount = 5;
    } else {
      probesCount = Math.min(8, 5 + (this.round - 10));
    }

    this.roundProbesNeeded = probesCount;
    this.roundProbesFound = 0;

    this.sub.x = this.w / 2;
    this.sub.y = 65;
    this.sub.vx = 0;
    this.sub.vy = 0;
    this.sub.hull = 100;

    this.sonarRipples = [];
    this.sonarCooldown = 0;

    this.roundBannerTimer = 130;

    // Display special banner status when speed cap / orb cap are active
    if (this.round > 10 && probesCount === 8) {
      this.roundBannerText = `DEPTH -${this.depth.toLocaleString()}m // MAX ABYSS LOOP (8 ORBS)`;
    } else if (this.round > 10) {
      this.roundBannerText = `DEPTH -${this.depth.toLocaleString()}m // ROUND ${this.round} (+${probesCount} ORBS)`;
    } else if (this.round > 6) {
      this.roundBannerText = `DEPTH -${this.depth.toLocaleString()}m // ROUND ${this.round} (SURGE SPEED)`;
    } else {
      this.roundBannerText = `DEPTH -${this.depth.toLocaleString()}m // ROUND ${this.round}`;
    }

    // Generate Probes safely below spawn zone
    this.probes = [];
    for (let i = 0; i < this.roundProbesNeeded; i++) {
      this.probes.push({
        x: 50 + Math.random() * (this.w - 100),
        y: 150 + Math.random() * (this.h - 200),
        found: false,
        revealTimer: 0
      });
    }

    // Enemy Speed Scaling & Cap:
    // Every round after Round 6 adds speed up to a hard cap at Round 10 (+0.45 max)
    const speedBonus = this.round > 6 ? Math.min(0.45, (this.round - 6) * 0.11) : 0;

    this.enemies = [];

    // 1. Abyssal Serpents: 1 on Round 1, 2 on Round 2+
    const serpentCount = this.round === 1 ? 1 : 2;
    for (let i = 0; i < serpentCount; i++) {
      this.enemies.push({
        type: 'serpent',
        x: 100 + i * 200,
        y: 220 + i * 80,
        vx: (i % 2 === 0 ? 1 : -1) * (0.85 + speedBonus),
        vy: (i % 2 === 0 ? 0.5 : -0.5) * (1 + speedBonus * 0.5),
        radius: 16,
        length: 70,
        revealTimer: 0
      });
    }

    // 2. Dart Squids: 1 on Round 3-4, 2 on Round 5+
    if (this.round >= 3) {
      const squidCount = this.round >= 5 ? 2 : 1;
      for (let i = 0; i < squidCount; i++) {
        this.enemies.push({
          type: 'squid',
          x: 120 + i * 160,
          y: 260 + i * 70,
          vx: (i % 2 === 0 ? 1 : -1) * (1.8 + speedBonus * 1.1),
          vy: 1.2 * (1 + speedBonus * 0.5),
          radius: 9,
          length: 24,
          dartTimer: 0,
          revealTimer: 0
        });
      }
    }

    // 3. Shadow Goliath (Slow Homing Stalker): 1 on Round 4+
    if (this.round >= 4) {
      this.enemies.push({
        type: 'goliath',
        x: this.w / 2,
        y: this.h - 60,
        vx: 0,
        vy: 0,
        speed: 0.55 + speedBonus * 0.5,
        radius: 22,
        length: 100,
        revealTimer: 0
      });
    }

    // 4. Bio-Electric EMP Jelly: 1 on Round 6+
    if (this.round >= 6) {
      this.enemies.push({
        type: 'jelly',
        x: this.w / 2,
        y: 280,
        vx: 0.25 + speedBonus * 0.25,
        vy: 0.25 + speedBonus * 0.25,
        radius: 15,
        length: 28,
        revealTimer: 0
      });
    }

    this.updateHUD();
  }

  initUI() {
    window.focus();
    window.addEventListener('click', () => window.focus());

    window.addEventListener('keydown', (e) => {
      if (['KeyW', 'ArrowUp'].includes(e.code)) this.input.up = true;
      if (['KeyS', 'ArrowDown'].includes(e.code)) this.input.down = true;
      if (['KeyA', 'ArrowLeft'].includes(e.code)) this.input.left = true;
      if (['KeyD', 'ArrowRight'].includes(e.code)) this.input.right = true;
      if (e.code === 'Space') {
        e.preventDefault();
        this.triggerSonar();
      }
    });

    window.addEventListener('keyup', (e) => {
      if (['KeyW', 'ArrowUp'].includes(e.code)) this.input.up = false;
      if (['KeyS', 'ArrowDown'].includes(e.code)) this.input.down = false;
      if (['KeyA', 'ArrowLeft'].includes(e.code)) this.input.left = false;
      if (['KeyD', 'ArrowRight'].includes(e.code)) this.input.right = false;
    });

    document.querySelectorAll('.dpad-btn').forEach(btn => {
      const dir = btn.dataset.dir;
      btn.addEventListener('touchstart', (e) => { e.preventDefault(); this.input[dir] = true; });
      btn.addEventListener('touchend', (e) => { e.preventDefault(); this.input[dir] = false; });
      btn.addEventListener('mousedown', () => { this.input[dir] = true; });
      btn.addEventListener('mouseup', () => { this.input[dir] = false; });
    });

    document.getElementById('btn-sonar').addEventListener('click', () => this.triggerSonar());
    document.getElementById('modal-btn-restart').addEventListener('click', () => this.restart());

    const soundBtn = document.getElementById('btn-sound');
    soundBtn.addEventListener('click', () => {
      this.audio.enabled = !this.audio.enabled;
      if (this.audio.enabled) {
        this.audio.startBGM();
        soundBtn.innerHTML = `<span>🔊</span>`;
      } else {
        this.audio.stopBGM();
        soundBtn.innerHTML = `<span>🔇</span>`;
      }
    });

    this.updateHUD();
  }

  triggerSonar() {
    if (this.sonarCooldown > 0 || this.gameOver) return;
    this.sonarCooldown = 35;
    this.audio.playSonarPing();
    this.sonarRipples.push({
      x: this.sub.x,
      y: this.sub.y,
      r: 10,
      alpha: 1.0
    });
  }

  loop() {
    this.update();
    this.render();
    requestAnimationFrame(() => this.loop());
  }

  update() {
    if (this.gameOver) return;

    if (this.roundBannerTimer > 0) {
      this.roundBannerTimer--;
    }

    // Submarine Thrust & Water Drag
    const accel = 0.26;
    if (this.input.up) {
      this.sub.vy -= accel;
      this.sub.angle = -Math.PI / 2;
    }
    if (this.input.down) {
      this.sub.vy += accel;
      this.sub.angle = Math.PI / 2;
      this.depth += 0.3;
    }
    if (this.input.left) {
      this.sub.vx -= accel;
      this.sub.angle = Math.PI;
    }
    if (this.input.right) {
      this.sub.vx += accel;
      this.sub.angle = 0;
    }

    this.sub.vx *= 0.95;
    this.sub.vy *= 0.95;

    this.sub.x = Math.max(20, Math.min(this.w - 20, this.sub.x + this.sub.vx));
    this.sub.y = Math.max(20, Math.min(this.h - 20, this.sub.y + this.sub.vy));

    // Decrement reveal timers (1.1 seconds visibility window)
    const dt = 1 / 60;
    this.probes.forEach(p => {
      if (p.revealTimer > 0) p.revealTimer -= dt;
    });
    this.enemies.forEach(en => {
      if (en.revealTimer > 0) en.revealTimer -= dt;
    });

    // Sonar Cooldown & Ripples
    if (this.sonarCooldown > 0) this.sonarCooldown--;
    for (let i = this.sonarRipples.length - 1; i >= 0; i--) {
      const rip = this.sonarRipples[i];
      rip.r += 6.5;
      rip.alpha -= 0.018;

      // Reveal enemies and probes when swept by sonar wave
      this.enemies.forEach(en => {
        const d = Math.hypot(rip.x - en.x, rip.y - en.y);
        if (Math.abs(d - rip.r) < 45) {
          en.revealTimer = 1.1; // 1.1s reveal window
        }
      });

      this.probes.forEach(p => {
        const d = Math.hypot(rip.x - p.x, rip.y - p.y);
        if (Math.abs(d - rip.r) < 45) {
          p.revealTimer = 1.1;
        }
      });

      if (rip.alpha <= 0) {
        this.sonarRipples.splice(i, 1);
      }
    }

    // Check Probes Extraction
    this.probes.forEach(p => {
      if (!p.found) {
        const d = Math.hypot(this.sub.x - p.x, this.sub.y - p.y);
        if (d < 24) {
          p.found = true;
          this.roundProbesFound++;
          this.totalProbesExtracted++;
          this.audio.playProbe();
          this.updateHUD();

          // Check Round Completion
          if (this.roundProbesFound === this.roundProbesNeeded) {
            this.audio.playRoundAdvance();
            this.initRound(this.round + 1);
          }
        }
      }
    });

    // AI Logic for Diverse Enemy Species
    this.enemies.forEach(en => {
      if (en.type === 'serpent') {
        // Classic Bouncing Patroller
        en.x += en.vx;
        en.y += en.vy;
        if (en.x < 30 || en.x > this.w - 30) en.vx *= -1;
        if (en.y < 120 || en.y > this.h - 30) en.vy *= -1;
      } else if (en.type === 'squid') {
        // Dart Squid (Fast zig-zag bursts)
        en.dartTimer = (en.dartTimer || 0) + 1;
        if (en.dartTimer % 50 === 0) {
          en.vx = (Math.random() - 0.5) * 5.2;
          en.vy = (Math.random() - 0.5) * 5.2;
        }
        en.x += en.vx;
        en.y += en.vy;
        if (en.x < 25 || en.x > this.w - 25) en.vx *= -1;
        if (en.y < 100 || en.y > this.h - 25) en.vy *= -1;
      } else if (en.type === 'goliath') {
        // Shadow Goliath (Relentlessly tracks / follows player)
        const angle = Math.atan2(this.sub.y - en.y, this.sub.x - en.x);
        en.vx = Math.cos(angle) * en.speed;
        en.vy = Math.sin(angle) * en.speed;
        en.x += en.vx;
        en.y += en.vy;
      } else if (en.type === 'jelly') {
        // Drifting EMP Jelly
        en.x += en.vx;
        en.y += en.vy;
        if (en.x < 40 || en.x > this.w - 40) en.vx *= -1;
        if (en.y < 140 || en.y > this.h - 40) en.vy *= -1;
      }

      // One-Shot Collision With Submarine (Lives System)
      const distToSub = Math.hypot(this.sub.x - en.x, this.sub.y - en.y);
      if (distToSub < en.radius + 14) {
        if (this.lives > 1) {
          this.lives--;
          this.audio.playCrush();
          this.initRound(this.round);
          this.roundBannerText = `⚠️ HULL BREACH! ${this.lives} ${this.lives === 1 ? 'LIFE' : 'LIVES'} REMAINING`;
          this.roundBannerTimer = 140;
          this.updateHUD();
        } else {
          this.lives = 0;
          this.sub.hull = 0;
          this.updateHUD();
          this.onCrush(en.type);
        }
      }
    });
  }

  onCrush(killerType) {
    this.gameOver = true;
    this.audio.playCrush();

    const typeNames = {
      serpent: 'Abyssal Serpent',
      squid: 'Apex Dart Squid',
      goliath: 'Stalking Shadow Goliath',
      jelly: 'Bio-Electric EMP Jelly'
    };

    document.getElementById('modal-icon').textContent = '🌊🕳️';
    document.getElementById('modal-title').textContent = 'SUBMERSIBLE CRUSH FAILURE';
    document.getElementById('modal-desc').textContent = `All 3 hulls consumed. Breached by a ${typeNames[killerType] || 'Abyssal Leviathan'} at Depth -${Math.floor(this.depth)}m.`;
    document.getElementById('modal-depth').textContent = `ROUND ${this.round} (-${Math.floor(this.depth)}m) | TOTAL PROBES: ${this.totalProbesExtracted}`;
    document.getElementById('modal-overlay').classList.remove('hidden');

    if (window.parent && window.parent !== window) {
      try {
        window.parent.postMessage({
          game: 'quantum-abyss',
          score: this.totalProbesExtracted * 1000 + this.depth
        }, '*');
      } catch (e) {}
    }
  }

  restart() {
    this.lives = 3;
    this.round = 1;
    this.totalProbesExtracted = 0;
    this.gameOver = false;
    document.getElementById('modal-overlay').classList.add('hidden');
    this.initRound(1);
  }

  updateHUD() {
    document.getElementById('depth-val').textContent = `-${Math.floor(this.depth).toLocaleString()}m`;
    document.getElementById('round-val').textContent = this.round;
    
    // 3 Lives Heart Display
    const hearts = this.lives === 3 ? '❤️❤️❤️' : (this.lives === 2 ? '❤️❤️🤍' : (this.lives === 1 ? '❤️🤍🤍' : '🤍🤍🤍'));
    const livesEl = document.getElementById('lives-val');
    if (livesEl) livesEl.textContent = hearts;

    document.getElementById('probes-val').textContent = `${this.roundProbesFound} / ${this.roundProbesNeeded} 🔬`;
  }

  render() {
    this.ctx.fillStyle = '#01040a';
    this.ctx.fillRect(0, 0, this.w, this.h);

    // Sonar Ripples
    this.sonarRipples.forEach(rip => {
      this.ctx.strokeStyle = `rgba(0, 243, 255, ${rip.alpha})`;
      this.ctx.lineWidth = 3;
      this.ctx.shadowColor = '#00f3ff';
      this.ctx.shadowBlur = 15;
      this.ctx.beginPath();
      this.ctx.arc(rip.x, rip.y, rip.r, 0, Math.PI * 2);
      this.ctx.stroke();
      this.ctx.shadowBlur = 0;
    });

    // Research Probes (1.1s reveal window or direct spotlight)
    this.probes.forEach(p => {
      if (p.found) return;

      const distToSub = Math.hypot(this.sub.x - p.x, this.sub.y - p.y);
      const angleToSub = Math.atan2(p.y - this.sub.y, p.x - this.sub.x);
      let diffAngle = Math.abs(angleToSub - this.sub.angle);
      if (diffAngle > Math.PI) diffAngle = Math.PI * 2 - diffAngle;
      const inSpotlight = distToSub < 70 && diffAngle < Math.PI / 4;

      let alpha = 0;
      if (inSpotlight) {
        alpha = 1.0;
      } else if (p.revealTimer > 0) {
        alpha = Math.min(1.0, p.revealTimer / 0.3);
      }

      if (alpha > 0) {
        this.ctx.save();
        this.ctx.globalAlpha = alpha;
        this.ctx.fillStyle = '#f59e0b';
        this.ctx.shadowColor = '#f59e0b';
        this.ctx.shadowBlur = 15;
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
        this.ctx.fill();

        // Holographic beacon ring
        this.ctx.strokeStyle = '#00f3ff';
        this.ctx.lineWidth = 1.5;
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, 10, 0, Math.PI * 2);
        this.ctx.stroke();
        this.ctx.restore();
      }
    });

    // Render Enemies by Species (1.1s reveal or spotlight)
    this.enemies.forEach(en => {
      const distToSub = Math.hypot(this.sub.x - en.x, this.sub.y - en.y);
      const angleToSub = Math.atan2(en.y - this.sub.y, en.x - this.sub.x);
      let diffAngle = Math.abs(angleToSub - this.sub.angle);
      if (diffAngle > Math.PI) diffAngle = Math.PI * 2 - diffAngle;
      const inSpotlight = distToSub < 70 && diffAngle < Math.PI / 4;

      let alpha = 0;
      if (inSpotlight) {
        alpha = 0.95;
      } else if (en.revealTimer > 0) {
        alpha = Math.min(1.0, en.revealTimer / 0.3);
      }

      if (alpha > 0) {
        this.ctx.save();
        this.ctx.globalAlpha = alpha;
        this.ctx.translate(en.x, en.y);

        if (en.type === 'serpent') {
          // Magenta Serpent
          this.ctx.fillStyle = '#ec4899';
          this.ctx.shadowColor = '#ec4899';
          this.ctx.shadowBlur = 20;
          this.ctx.beginPath();
          this.ctx.ellipse(0, 0, en.length / 2, 14, 0, 0, Math.PI * 2);
          this.ctx.fill();

          // Glowing predatory eyes
          this.ctx.fillStyle = '#ffffff';
          this.ctx.beginPath();
          this.ctx.arc(en.length / 3, -4, 2.5, 0, Math.PI * 2);
          this.ctx.arc(en.length / 3, 4, 2.5, 0, Math.PI * 2);
          this.ctx.fill();
        } else if (en.type === 'squid') {
          // Fast Dart Squid (Electric Purple / Cyan)
          this.ctx.fillStyle = '#a855f7';
          this.ctx.shadowColor = '#a855f7';
          this.ctx.shadowBlur = 18;
          this.ctx.beginPath();
          this.ctx.moveTo(en.length / 2, 0);
          this.ctx.lineTo(-en.length / 2, -10);
          this.ctx.lineTo(-en.length / 2 + 6, 0);
          this.ctx.lineTo(-en.length / 2, 10);
          this.ctx.closePath();
          this.ctx.fill();

          // Trailing tentacles
          this.ctx.strokeStyle = '#00f3ff';
          this.ctx.lineWidth = 2;
          this.ctx.beginPath();
          this.ctx.moveTo(-en.length / 2, -4);
          this.ctx.lineTo(-en.length / 2 - 12, -6);
          this.ctx.moveTo(-en.length / 2, 4);
          this.ctx.lineTo(-en.length / 2 - 12, 6);
          this.ctx.stroke();
        } else if (en.type === 'goliath') {
          // Colossal Shadow Goliath (Relentless Crimson Homing Stalker)
          this.ctx.fillStyle = '#dc2626';
          this.ctx.shadowColor = '#ef4444';
          this.ctx.shadowBlur = 25;
          this.ctx.beginPath();
          this.ctx.ellipse(0, 0, en.length / 2, 22, 0, 0, Math.PI * 2);
          this.ctx.fill();

          // Multiple Glowing Red Eye Clusters
          this.ctx.fillStyle = '#fef08a';
          this.ctx.beginPath();
          this.ctx.arc(en.length / 3, -8, 3.5, 0, Math.PI * 2);
          this.ctx.arc(en.length / 3, 8, 3.5, 0, Math.PI * 2);
          this.ctx.arc(en.length / 3 + 10, 0, 4, 0, Math.PI * 2);
          this.ctx.fill();
        } else if (en.type === 'jelly') {
          // Bio-Electric EMP Jelly
          this.ctx.fillStyle = 'rgba(245, 158, 11, 0.7)';
          this.ctx.shadowColor = '#f59e0b';
          this.ctx.shadowBlur = 20;
          this.ctx.beginPath();
          this.ctx.arc(0, 0, en.radius, Math.PI, Math.PI * 2);
          this.ctx.fill();

          this.ctx.strokeStyle = '#f59e0b';
          this.ctx.lineWidth = 1.5;
          for (let i = -10; i <= 10; i += 5) {
            this.ctx.beginPath();
            this.ctx.moveTo(i, 0);
            this.ctx.lineTo(i + Math.sin(Date.now() * 0.01 + i) * 6, 18);
            this.ctx.stroke();
          }
        }

        this.ctx.restore();
      }
    });

    // Submersible Craft
    this.ctx.save();
    this.ctx.translate(this.sub.x, this.sub.y);
    this.ctx.rotate(this.sub.angle);

    // Hull
    this.ctx.fillStyle = '#0284c7';
    this.ctx.strokeStyle = '#00f3ff';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.ellipse(0, 0, 16, 10, 0, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.stroke();

    // Spotlight Cone forward
    this.ctx.fillStyle = 'rgba(0, 243, 255, 0.2)';
    this.ctx.beginPath();
    this.ctx.moveTo(14, 0);
    this.ctx.lineTo(70, -30);
    this.ctx.lineTo(70, 30);
    this.ctx.closePath();
    this.ctx.fill();

    this.ctx.restore();

    // Holographic Round Banner Transition
    if (this.roundBannerTimer > 0) {
      const bannerAlpha = Math.min(1.0, this.roundBannerTimer / 30);
      this.ctx.save();
      this.ctx.fillStyle = `rgba(0, 0, 0, ${bannerAlpha * 0.7})`;
      this.ctx.fillRect(20, this.h / 2 - 35, this.w - 40, 70);
      this.ctx.strokeStyle = `rgba(0, 243, 255, ${bannerAlpha})`;
      this.ctx.strokeRect(20, this.h / 2 - 35, this.w - 40, 70);

      this.ctx.font = '900 16px Orbitron, sans-serif';
      this.ctx.fillStyle = `rgba(0, 243, 255, ${bannerAlpha})`;
      this.ctx.textAlign = 'center';
      this.ctx.shadowColor = '#00f3ff';
      this.ctx.shadowBlur = 15;
      this.ctx.fillText(this.roundBannerText, this.w / 2, this.h / 2 + 5);
      this.ctx.restore();
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.abyssGame = new QuantumAbyss();
});
