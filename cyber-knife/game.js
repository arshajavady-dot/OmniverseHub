/**
 * Cyber Knife: Neon Kunai Hit — Arcade Reflex Engine
 */

class KnifeAudioEngine {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.isBGMPlaying = false;
    this.bgmTimer = null;
    this.step = 0;
    this.tempo = 132;

    // Cyber Ninja Synth Chords: Dm, Bb, C, Am
    this.chords = [
      [146.83, 174.61, 220.00], // Dm
      [116.54, 146.83, 174.61], // Bb
      [130.81, 164.81, 196.00], // C
      [110.00, 130.81, 164.81]  // Am
    ];
    this.bassNotes = [73.42, 58.27, 65.41, 55.00];
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
    const stepIntervalMs = (60 / this.tempo / 4) * 1000;

    if (this.bgmTimer) clearInterval(this.bgmTimer);
    this.bgmTimer = setInterval(() => {
      if (!this.isBGMPlaying || !this.enabled || !this.ctx) return;
      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      this.playBGMStep(this.step);
      this.step = (this.step + 1) % 64;
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
    const bar = Math.floor(step / 16);
    const bass = this.bassNotes[bar % this.bassNotes.length];

    if (step % 4 === 0) {
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(bass, now);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
        osc.connect(gain);
        gain.connect(this.masterGain || this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.18);
      } catch(e) {}
    }

    if (step % 2 === 0) {
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        const chord = this.chords[bar % this.chords.length];
        const note = chord[(step / 2) % 3];
        osc.frequency.setValueAtTime(note * 2, now);
        gain.gain.setValueAtTime(0.025, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        osc.connect(gain);
        gain.connect(this.masterGain || this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.1);
      } catch(e) {}
    }
  }

  playThrow() {
    if (!this.enabled || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(700, now);
      osc.frequency.exponentialRampToValueAtTime(160, now + 0.08);
      gain.gain.setValueAtTime(0.09, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.connect(gain);
      gain.connect(this.masterGain || this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.08);
    } catch(e) {}
  }

  playHit() {
    if (!this.enabled || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;
      osc.type = 'square';
      osc.frequency.setValueAtTime(480, now);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
      osc.connect(gain);
      gain.connect(this.masterGain || this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.09);
    } catch(e) {}
  }

  playDeflect() {
    if (!this.enabled || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(260, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.4);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      osc.connect(gain);
      gain.connect(this.masterGain || this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.45);
    } catch(e) {}
  }

  playStageClear() {
    if (!this.enabled || !this.ctx) return;
    try {
      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((f, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const now = this.ctx.currentTime + i * 0.07;
        osc.type = 'triangle';
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
}

class CyberKnife {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.w = this.canvas.width;
    this.h = this.canvas.height;

    this.audio = new KnifeAudioEngine();

    this.wheel = {
      x: this.w / 2,
      y: 170,
      radius: 72,
      angle: 0,
      speed: 0.035
    };

    this.score = 0;
    this.stage = 1;
    this.knivesLeft = 7;
    this.knivesInWheel = []; // Angles in radians
    this.flyingKnife = null;
    this.deflectedKnife = null;
    this.fallingKnives = []; // Stage clear falling physics
    this.wheelShockwave = null;
    this.stageClearBanner = null;
    this.gameOver = false;
    this.particles = [];

    this.initUI();
    this.initStage();
    this.loop();
  }

  initUI() {
    window.focus();
    window.addEventListener('click', () => window.focus());

    const doThrow = (e) => {
      if (e) e.preventDefault();
      if (this.gameOver || this.flyingKnife || this.knivesLeft <= 0) return;
      this.throwKnife();
    };

    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
        doThrow(e);
      }
    });

    this.canvas.addEventListener('mousedown', doThrow);
    document.getElementById('btn-throw-knife').addEventListener('click', doThrow);

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

    document.getElementById('modal-btn-restart').addEventListener('click', () => this.restart());
    this.updateHUD();
  }

  initStage() {
    this.knivesLeft = 6 + Math.min(this.stage, 4);
    this.knivesInWheel = [];
    // Pre-place obstacle knives for higher stages
    if (this.stage > 1) {
      const obstacleCount = Math.min(this.stage - 1, 3);
      for (let i = 0; i < obstacleCount; i++) {
        this.knivesInWheel.push((i * Math.PI * 2) / obstacleCount);
      }
    }
    this.wheel.speed = (0.03 + this.stage * 0.005) * (Math.random() < 0.5 ? 1 : -1);
    this.updateHUD();
  }

  throwKnife() {
    if (this.flyingKnife || this.knivesLeft <= 0) return;
    this.knivesLeft--;
    this.audio.playThrow();
    this.flyingKnife = {
      x: this.w / 2,
      y: this.h - 90,
      vy: -24
    };
    this.updateHUD();
  }

  restart() {
    this.score = 0;
    this.stage = 1;
    this.gameOver = false;
    this.flyingKnife = null;
    this.deflectedKnife = null;
    this.particles = [];

    this.initStage();
    document.getElementById('modal-overlay').classList.add('hidden');
    this.updateHUD();
  }

  updateHUD() {
    document.getElementById('score-val').textContent = this.score.toLocaleString();
    document.getElementById('stage-val').textContent = this.stage;
    document.getElementById('knives-val').textContent = this.knivesLeft;
  }

  loop() {
    this.update();
    this.render();
    requestAnimationFrame(() => this.loop());
  }

  update() {
    if (this.gameOver) {
      if (this.deflectedKnife) {
        this.deflectedKnife.x += this.deflectedKnife.vx;
        this.deflectedKnife.y += this.deflectedKnife.vy;
        this.deflectedKnife.vy += 0.8;
        this.deflectedKnife.rot += 0.25;
      }
      return;
    }

    // Rotate Wheel
    this.wheel.angle += this.wheel.speed;

    // Update Flying Knife
    if (this.flyingKnife) {
      this.flyingKnife.y += this.flyingKnife.vy;

      // Hit Target Wheel Rim (tip is at y - 25)
      if (this.flyingKnife.y <= this.wheel.y + this.wheel.radius + 25) {
        // Calculate local angle on the rotating wheel (0 is straight down at 6 o'clock)
        const hitAngle = -this.wheel.angle;
        const normHit = ((hitAngle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);

        // Check collision with existing knives in wheel
        let collision = false;
        for (let a of this.knivesInWheel) {
          const normA = ((a % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
          let diff = Math.abs(normHit - normA);
          if (diff > Math.PI) diff = Math.PI * 2 - diff;

          if (diff < 0.28) { // Collision threshold angle (approx 16 degrees)
            collision = true;
            break;
          }
        }

        if (collision) {
          this.onDeflect();
        } else {
          this.knivesInWheel.push(normHit);
          this.score += 100;
          this.audio.playHit();

          // Spark particles
          for (let p = 0; p < 15; p++) {
            this.particles.push({
              x: this.w / 2,
              y: this.wheel.y + this.wheel.radius,
              vx: (Math.random() - 0.5) * 7,
              vy: (Math.random() - 0.5) * 7,
              color: '#00f3ff',
              life: 1.0
            });
          }

          this.flyingKnife = null;
          this.updateHUD();

          if (window.parent && window.parent !== window) {
            try {
              window.parent.postMessage({
                game: 'cyber-knife',
                score: this.score
              }, '*');
            } catch (e) {}
          }

          // Stage Cleared — Trigger Cool Falling Knives Animation
          if (this.knivesLeft === 0) {
            this.score += 500;
            this.audio.playStageClear();

            // Trigger Shockwave & Banner
            this.wheelShockwave = { r: this.wheel.radius, maxR: this.wheel.radius + 65, alpha: 1.0 };
            this.stageClearBanner = { text: `STAGE ${this.stage} CLEARED!`, sub: '+500 PTS', life: 1.0 };

            // Detach all knives and make them fall down with physics
            this.knivesInWheel.forEach(a => {
              const theta = this.wheel.angle + a;
              const kx = this.wheel.x - this.wheel.radius * Math.sin(theta);
              const ky = this.wheel.y + this.wheel.radius * Math.cos(theta);

              this.fallingKnives.push({
                x: kx,
                y: ky,
                vx: -Math.sin(theta) * (4 + Math.random() * 4) + (Math.random() - 0.5) * 3,
                vy: Math.cos(theta) * (3 + Math.random() * 3) - 5,
                rot: theta,
                rotSpeed: (Math.random() < 0.5 ? -1 : 1) * (0.15 + Math.random() * 0.2)
              });
            });

            // Burst particles
            for (let p = 0; p < 30; p++) {
              this.particles.push({
                x: this.wheel.x + (Math.random() - 0.5) * this.wheel.radius * 2,
                y: this.wheel.y + (Math.random() - 0.5) * this.wheel.radius * 2,
                vx: (Math.random() - 0.5) * 10,
                vy: (Math.random() - 0.5) * 10,
                color: Math.random() < 0.5 ? '#facc15' : '#00f3ff',
                life: 1.0
              });
            }

            this.knivesInWheel = [];

            // Delay loading next stage until knives fall
            setTimeout(() => {
              if (!this.gameOver) {
                this.stage++;
                this.initStage();
              }
            }, 950);
          }
        }
      }
    }

    // Update Falling Knives Physics (Stage Clear Animation)
    for (let i = this.fallingKnives.length - 1; i >= 0; i--) {
      const fk = this.fallingKnives[i];
      fk.x += fk.vx;
      fk.y += fk.vy;
      fk.vy += 0.75; // Gravity
      fk.rot += fk.rotSpeed;

      if (fk.y > this.h + 80) {
        this.fallingKnives.splice(i, 1);
      }
    }

    // Update Shockwave
    if (this.wheelShockwave) {
      this.wheelShockwave.r += 2.5;
      this.wheelShockwave.alpha -= 0.035;
      if (this.wheelShockwave.alpha <= 0) {
        this.wheelShockwave = null;
      }
    }

    // Update Banner
    if (this.stageClearBanner) {
      this.stageClearBanner.life -= 0.02;
      if (this.stageClearBanner.life <= 0) {
        this.stageClearBanner = null;
      }
    }

    // Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.04;
      if (p.life <= 0) this.particles.splice(i, 1);
    }
  }

  onDeflect() {
    this.gameOver = true;
    this.audio.playDeflect();
    this.deflectedKnife = {
      x: this.flyingKnife.x,
      y: this.flyingKnife.y,
      vx: (Math.random() < 0.5 ? -1 : 1) * 7,
      vy: 6,
      rot: 0
    };
    this.flyingKnife = null;

    document.getElementById('modal-final-score').textContent = this.score.toLocaleString();
    document.getElementById('modal-overlay').classList.remove('hidden');
  }

  drawKunai(x, y, angle, isGlow = true, isDeflected = false) {
    this.ctx.save();
    this.ctx.translate(x, y);
    this.ctx.rotate(angle);

    const bladeColor = isDeflected ? '#ef4444' : '#00f3ff';
    const coreColor = isDeflected ? '#f87171' : '#ffffff';

    if (isGlow) {
      this.ctx.shadowColor = bladeColor;
      this.ctx.shadowBlur = 10;
    }

    // Handle / Grip
    this.ctx.fillStyle = '#334155';
    this.ctx.fillRect(-3, 10, 6, 22);

    // Grip Wrappings
    this.ctx.strokeStyle = '#64748b';
    this.ctx.lineWidth = 1.2;
    for (let gy = 14; gy <= 28; gy += 4) {
      this.ctx.beginPath();
      this.ctx.moveTo(-3, gy);
      this.ctx.lineTo(3, gy);
      this.ctx.stroke();
    }

    // Pommel Ring
    this.ctx.strokeStyle = bladeColor;
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.arc(0, 36, 4, 0, Math.PI * 2);
    this.ctx.stroke();

    // Guard Cross
    this.ctx.fillStyle = bladeColor;
    this.ctx.fillRect(-8, 8, 16, 3);

    // Diamond Plasma Blade
    this.ctx.fillStyle = bladeColor;
    this.ctx.beginPath();
    this.ctx.moveTo(0, -25); // Tip
    this.ctx.lineTo(7, 8);   // Right base
    this.ctx.lineTo(-7, 8);  // Left base
    this.ctx.closePath();
    this.ctx.fill();

    // Center Plasma Core Light
    this.ctx.fillStyle = coreColor;
    this.ctx.beginPath();
    this.ctx.moveTo(0, -20);
    this.ctx.lineTo(2.5, 6);
    this.ctx.lineTo(-2.5, 6);
    this.ctx.closePath();
    this.ctx.fill();

    this.ctx.shadowBlur = 0;
    this.ctx.restore();
  }

  render() {
    this.ctx.fillStyle = '#02040a';
    this.ctx.fillRect(0, 0, this.w, this.h);

    // Rotating Wheel Target
    this.ctx.save();
    this.ctx.translate(this.wheel.x, this.wheel.y);
    this.ctx.rotate(this.wheel.angle);

    // Outer Target Rim
    this.ctx.fillStyle = 'rgba(236, 72, 153, 0.2)';
    this.ctx.strokeStyle = '#ec4899';
    this.ctx.lineWidth = 4;
    this.ctx.shadowColor = '#ec4899';
    this.ctx.shadowBlur = 16;
    this.ctx.beginPath();
    this.ctx.arc(0, 0, this.wheel.radius, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.stroke();

    // Inner Core Shield
    this.ctx.fillStyle = '#0f172a';
    this.ctx.beginPath();
    this.ctx.arc(0, 0, this.wheel.radius * 0.5, 0, Math.PI * 2);
    this.ctx.fill();

    // Core Tech Decal
    this.ctx.strokeStyle = 'rgba(0, 243, 255, 0.5)';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.arc(0, 0, this.wheel.radius * 0.3, 0, Math.PI * 2);
    this.ctx.stroke();
    this.ctx.shadowBlur = 0;

    // Embedded Knives on the rotating wheel (Blade tip embedded in wheel rim, handle pointing outward)
    this.knivesInWheel.forEach(a => {
      this.ctx.save();
      this.ctx.rotate(a);
      this.drawKunai(0, this.wheel.radius, 0, true, false);
      this.ctx.restore();
    });

    this.ctx.restore();

    // Flying / Current Knife
    if (this.flyingKnife) {
      this.drawKunai(this.flyingKnife.x, this.flyingKnife.y, 0, true, false);
    } else if (!this.gameOver && this.knivesLeft > 0) {
      // Ready knife at bottom
      this.drawKunai(this.w / 2, this.h - 80, 0, true, false);
    }

    // Deflected Knife
    if (this.deflectedKnife) {
      this.drawKunai(this.deflectedKnife.x, this.deflectedKnife.y, this.deflectedKnife.rot, true, true);
    }

    // Shockwave Ring (Stage Clear)
    if (this.wheelShockwave) {
      this.ctx.strokeStyle = `rgba(0, 243, 255, ${this.wheelShockwave.alpha})`;
      this.ctx.lineWidth = 4;
      this.ctx.shadowColor = '#00f3ff';
      this.ctx.shadowBlur = 20;
      this.ctx.beginPath();
      this.ctx.arc(this.wheel.x, this.wheel.y, this.wheelShockwave.r, 0, Math.PI * 2);
      this.ctx.stroke();
      this.ctx.shadowBlur = 0;
    }

    // Falling Detached Knives (Stage Clear Physics)
    this.fallingKnives.forEach(fk => {
      this.drawKunai(fk.x, fk.y, fk.rot, true, false);
    });

    // Stage Clear Floating Banner
    if (this.stageClearBanner) {
      this.ctx.save();
      this.ctx.font = '900 24px "Orbitron", sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.fillStyle = '#facc15';
      this.ctx.shadowColor = '#facc15';
      this.ctx.shadowBlur = 18;
      this.ctx.globalAlpha = Math.max(0, this.stageClearBanner.life);
      this.ctx.fillText(this.stageClearBanner.text, this.w / 2, this.h / 2 + 30);

      this.ctx.font = '700 15px "Orbitron", sans-serif';
      this.ctx.fillStyle = '#00f3ff';
      this.ctx.shadowColor = '#00f3ff';
      this.ctx.fillText(this.stageClearBanner.sub, this.w / 2, this.h / 2 + 60);
      this.ctx.restore();
    }

    // Particles
    this.particles.forEach(p => {
      this.ctx.fillStyle = p.color;
      this.ctx.globalAlpha = Math.max(0, p.life);
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.globalAlpha = 1.0;
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.knifeGame = new CyberKnife();
});
