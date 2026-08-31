/**
 * Cyber Archery: Target Master — Physics Bow & Arrow Engine
 */

class ArcheryAudioEngine {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.isBGMPlaying = false;
    this.bgmTimer = null;
    this.step = 0;
    this.tempo = 120;

    // Epic Combat Synth Chords: Em, C, D, Bm
    this.chords = [
      [164.81, 196.00, 246.94], // Em
      [130.81, 164.81, 196.00], // C
      [146.83, 185.00, 220.00], // D
      [123.47, 146.83, 185.00]  // Bm
    ];
    this.bassNotes = [82.41, 65.41, 73.42, 61.74];
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
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
        osc.connect(gain);
        gain.connect(this.masterGain || this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.22);
      } catch(e) {}
    }

    if (step % 2 === 0) {
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        const chord = this.chords[bar % this.chords.length];
        const note = chord[(step / 2) % 3];
        osc.frequency.setValueAtTime(note * 2, now);
        gain.gain.setValueAtTime(0.025, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc.connect(gain);
        gain.connect(this.masterGain || this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.12);
      } catch(e) {}
    }
  }

  playDraw() {
    if (!this.enabled || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(200, now);
      osc.frequency.linearRampToValueAtTime(500, now + 0.2);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      osc.connect(gain);
      gain.connect(this.masterGain || this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.22);
    } catch(e) {}
  }

  playRelease() {
    if (!this.enabled || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(150, now + 0.1);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      osc.connect(gain);
      gain.connect(this.masterGain || this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.1);
    } catch(e) {}
  }

  playHit(isBullseye) {
    if (!this.enabled || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(isBullseye ? 880 : 440, now);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      osc.connect(gain);
      gain.connect(this.masterGain || this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.2);
    } catch(e) {}
  }
}

class CyberArchery {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.w = this.canvas.width;
    this.h = this.canvas.height;

    this.audio = new ArcheryAudioEngine();

    this.bow = { x: 50, y: this.h / 2, angle: 0, power: 0, maxPower: 18 };
    this.isAiming = false;
    this.arrows = 10;
    this.score = 0;
    this.bullseyes = 0;
    this.gameOver = false;

    this.flyingArrows = [];
    this.targets = [
      { x: this.w - 80, y: 120, vy: 1.8, radius: 35 },
      { x: this.w - 140, y: 280, vy: -1.2, radius: 25 }
    ];
    this.particles = [];

    this.initUI();
    this.loop();
  }

  initUI() {
    window.focus();
    window.addEventListener('click', () => window.focus());

    const onPointerDown = (e) => {
      if (this.gameOver || this.arrows <= 0) return;
      this.isAiming = true;
      this.audio.playDraw();
      this.updateAim(e);
    };

    const onPointerMove = (e) => {
      if (this.isAiming) this.updateAim(e);
    };

    const onPointerUp = () => {
      if (this.isAiming) {
        this.isAiming = false;
        this.shootArrow();
      }
    };

    this.canvas.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);

    this.canvas.addEventListener('touchstart', (e) => { e.preventDefault(); onPointerDown(e.touches[0]); }, { passive: false });
    window.addEventListener('touchmove', (e) => { if (this.isAiming) onPointerMove(e.touches[0]); }, { passive: false });
    window.addEventListener('touchend', onPointerUp);

    document.getElementById('btn-shoot-arrow').addEventListener('click', () => {
      if (!this.gameOver && this.arrows > 0) {
        this.bow.angle = 0;
        this.bow.power = 14;
        this.shootArrow();
      }
    });

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

  updateAim(e) {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.w / rect.width;
    const scaleY = this.h / rect.height;
    const mx = (e.clientX - rect.left) * scaleX;
    const my = (e.clientY - rect.top) * scaleY;

    const dx = mx - this.bow.x;
    const dy = my - this.bow.y;
    this.bow.angle = Math.atan2(dy, dx);
    const dist = Math.hypot(dx, dy);
    this.bow.power = Math.min(this.bow.maxPower, Math.max(6, dist * 0.12));
  }

  shootArrow() {
    if (this.arrows <= 0) return;
    this.arrows--;
    this.audio.playRelease();

    this.flyingArrows.push({
      x: this.bow.x,
      y: this.bow.y,
      vx: Math.cos(this.bow.angle) * this.bow.power,
      vy: Math.sin(this.bow.angle) * this.bow.power,
      angle: this.bow.angle,
      hit: false
    });

    this.updateHUD();
  }

  restart() {
    this.arrows = 10;
    this.score = 0;
    this.bullseyes = 0;
    this.flyingArrows = [];
    this.particles = [];
    this.gameOver = false;

    document.getElementById('modal-overlay').classList.add('hidden');
    this.updateHUD();
  }

  updateHUD() {
    document.getElementById('score-val').textContent = this.score.toLocaleString();
    document.getElementById('arrows-val').textContent = this.arrows;
    document.getElementById('bullseyes-val').textContent = this.bullseyes;
  }

  loop() {
    this.update();
    this.render();
    requestAnimationFrame(() => this.loop());
  }

  update() {
    // Update Moving Targets
    this.targets.forEach(t => {
      t.y += t.vy;
      if (t.y < t.radius + 20 || t.y > this.h - t.radius - 20) {
        t.vy *= -1;
      }
    });

    // Update Flying Arrows
    for (let i = this.flyingArrows.length - 1; i >= 0; i--) {
      const a = this.flyingArrows[i];
      if (!a.hit) {
        a.x += a.vx;
        a.y += a.vy;
        a.vy += 0.18; // Gravity
        a.angle = Math.atan2(a.vy, a.vx);

        // Check Target Collisions
        for (let t of this.targets) {
          const dist = Math.hypot(a.x - t.x, a.y - t.y);
          if (dist < t.radius) {
            a.hit = true;
            const isBullseye = dist < t.radius * 0.3;
            const pts = isBullseye ? 500 : (dist < t.radius * 0.6 ? 250 : 100);

            if (isBullseye) this.bullseyes++;
            this.score += pts;
            this.audio.playHit(isBullseye);

            // Spark particles
            for (let p = 0; p < 15; p++) {
              this.particles.push({
                x: a.x, y: a.y,
                vx: (Math.random() - 0.5) * 6,
                vy: (Math.random() - 0.5) * 6,
                color: isBullseye ? '#facc15' : '#00f3ff',
                life: 1.0
              });
            }

            this.updateHUD();

            if (window.parent && window.parent !== window) {
              try {
                window.parent.postMessage({
                  game: 'cyber-archery',
                  score: this.score
                }, '*');
              } catch (e) {}
            }
            break;
          }
        }

        if (a.x > this.w || a.y > this.h || a.hit) {
          this.flyingArrows.splice(i, 1);
        }
      }
    }

    // Check game over when out of arrows
    if (this.arrows === 0 && this.flyingArrows.length === 0 && !this.gameOver) {
      this.gameOver = true;
      document.getElementById('modal-final-score').textContent = this.score.toLocaleString();
      document.getElementById('modal-overlay').classList.remove('hidden');
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

  render() {
    this.ctx.fillStyle = '#02040a';
    this.ctx.fillRect(0, 0, this.w, this.h);

    // Targets
    this.targets.forEach(t => {
      // Outer Ring
      this.ctx.fillStyle = 'rgba(239, 68, 68, 0.2)';
      this.ctx.strokeStyle = '#ef4444';
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.arc(t.x, t.y, t.radius, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.stroke();

      // Middle Ring
      this.ctx.fillStyle = 'rgba(0, 243, 255, 0.3)';
      this.ctx.strokeStyle = '#00f3ff';
      this.ctx.beginPath();
      this.ctx.arc(t.x, t.y, t.radius * 0.6, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.stroke();

      // Bullseye
      this.ctx.fillStyle = '#facc15';
      this.ctx.beginPath();
      this.ctx.arc(t.x, t.y, t.radius * 0.3, 0, Math.PI * 2);
      this.ctx.fill();
    });

    // Bow & Trajectory Guide
    this.ctx.save();
    this.ctx.translate(this.bow.x, this.bow.y);
    this.ctx.rotate(this.bow.angle);

    this.ctx.strokeStyle = '#38bdf8';
    this.ctx.lineWidth = 3;
    this.ctx.beginPath();
    this.ctx.arc(0, 0, 25, -Math.PI / 2, Math.PI / 2);
    this.ctx.stroke();

    // Bowstring
    this.ctx.strokeStyle = '#ffffff';
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.moveTo(0, -25);
    this.ctx.lineTo(this.isAiming ? -this.bow.power : 0, 0);
    this.ctx.lineTo(0, 25);
    this.ctx.stroke();
    this.ctx.restore();

    // Arrows
    this.flyingArrows.forEach(a => {
      this.ctx.save();
      this.ctx.translate(a.x, a.y);
      this.ctx.rotate(a.angle);
      this.ctx.fillStyle = '#facc15';
      this.ctx.fillRect(-15, -2, 30, 4);
      this.ctx.restore();
    });

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
  window.archeryGame = new CyberArchery();
});
