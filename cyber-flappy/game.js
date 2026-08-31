/**
 * Cyber Flappy: Gravity Drone — Arcade Reflex Engine
 */

class FlappyAudioEngine {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.isBGMPlaying = false;
    this.bgmTimer = null;
    this.step = 0;
    this.tempo = 125;

    // Upbeat Electro-Pop Chords: F, G, Em, Am
    this.chords = [
      [174.61, 220.00, 261.63], // F
      [196.00, 246.94, 293.66], // G
      [164.81, 196.00, 246.94], // Em
      [220.00, 261.63, 329.63]  // Am
    ];
    this.bassNotes = [87.31, 98.00, 82.41, 110.00];
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
    const chord = this.chords[bar % this.chords.length];
    const bass = this.bassNotes[bar % this.bassNotes.length];

    if (step % 4 === 0) {
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(bass, now);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.connect(gain);
        gain.connect(this.masterGain || this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.2);
      } catch(e) {}
    }

    if (step % 2 === 0) {
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
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

  playFlap() {
    if (!this.enabled || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(200, now);
      osc.frequency.exponentialRampToValueAtTime(480, now + 0.1);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      osc.connect(gain);
      gain.connect(this.masterGain || this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.1);
    } catch(e) {}
  }

  playPass() {
    if (!this.enabled || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(659.25, now);
      osc.frequency.setValueAtTime(880.00, now + 0.06);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
      osc.connect(gain);
      gain.connect(this.masterGain || this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.16);
    } catch(e) {}
  }

  playCrash() {
    if (!this.enabled || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(280, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.4);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      osc.connect(gain);
      gain.connect(this.masterGain || this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.45);
    } catch(e) {}
  }
}

class CyberFlappy {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.w = this.canvas.width;
    this.h = this.canvas.height;

    this.audio = new FlappyAudioEngine();

    this.drone = {
      x: 80,
      y: this.h / 2,
      vy: 0,
      radius: 14,
      gravity: 0.38,
      jump: -6.5
    };

    this.score = 0;
    this.highScore = parseInt(localStorage.getItem('cyber_flappy_high') || '0', 10);
    this.gatesPassed = 0;
    this.gameOver = false;
    this.started = false;

    this.pipes = [];
    this.particles = [];
    this.spawnTimer = 0;

    this.initUI();
    this.loop();
  }

  initUI() {
    window.focus();
    window.addEventListener('click', () => window.focus());
    document.getElementById('high-score-val').textContent = this.highScore.toLocaleString();

    const doFlap = (e) => {
      if (e) e.preventDefault();
      if (this.gameOver) return;
      this.started = true;
      this.drone.vy = this.drone.jump;
      this.audio.playFlap();

      // Exhaust particles
      for (let i = 0; i < 6; i++) {
        this.particles.push({
          x: this.drone.x - 10,
          y: this.drone.y + 6,
          vx: -3 - Math.random() * 2,
          vy: (Math.random() - 0.5) * 3,
          color: '#00f3ff',
          life: 1.0
        });
      }
    };

    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') doFlap(e);
    });

    this.canvas.addEventListener('mousedown', doFlap);
    this.canvas.addEventListener('touchstart', (e) => { e.preventDefault(); doFlap(); }, { passive: false });

    document.getElementById('btn-flap').addEventListener('click', doFlap);

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

  restart() {
    this.drone.y = this.h / 2;
    this.drone.vy = 0;
    this.score = 0;
    this.gatesPassed = 0;
    this.pipes = [];
    this.particles = [];
    this.gameOver = false;
    this.started = false;

    document.getElementById('modal-overlay').classList.add('hidden');
    this.updateHUD();
  }

  updateHUD() {
    document.getElementById('score-val').textContent = this.score.toLocaleString();
    document.getElementById('high-score-val').textContent = this.highScore.toLocaleString();
    document.getElementById('gates-val').textContent = this.gatesPassed;
  }

  loop() {
    this.update();
    this.render();
    requestAnimationFrame(() => this.loop());
  }

  update() {
    if (this.gameOver) return;

    if (this.started) {
      this.drone.vy += this.drone.gravity;
      this.drone.y += this.drone.vy;

      // Floor & Ceiling Collision
      if (this.drone.y > this.h - this.drone.radius || this.drone.y < this.drone.radius) {
        this.onCrash();
        return;
      }

      // Spawn Laser Gate Pipes
      this.spawnTimer++;
      if (this.spawnTimer > 100) {
        this.spawnTimer = 0;
        const gap = 135;
        const topH = Math.floor(Math.random() * (this.h - gap - 120)) + 60;
        this.pipes.push({
          x: this.w,
          topH: topH,
          bottomY: topH + gap,
          width: 55,
          passed: false
        });
      }

      // Update Pipes
      for (let i = this.pipes.length - 1; i >= 0; i--) {
        const p = this.pipes[i];
        p.x -= 2.6;

        // Collision Check
        const inX = this.drone.x + this.drone.radius > p.x && this.drone.x - this.drone.radius < p.x + p.width;
        const inTop = this.drone.y - this.drone.radius < p.topH;
        const inBottom = this.drone.y + this.drone.radius > p.bottomY;

        if (inX && (inTop || inBottom)) {
          this.onCrash();
          return;
        }

        // Passed Gate
        if (!p.passed && p.x + p.width < this.drone.x) {
          p.passed = true;
          this.gatesPassed++;
          this.score += 100;
          this.audio.playPass();
          if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('cyber_flappy_high', this.highScore.toString());
          }
          this.updateHUD();

          if (window.parent && window.parent !== window) {
            try {
              window.parent.postMessage({
                game: 'cyber-flappy',
                score: this.score
              }, '*');
            } catch (e) {}
          }
        }

        if (p.x < -p.width) this.pipes.splice(i, 1);
      }
    }

    // Update Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const pt = this.particles[i];
      pt.x += pt.vx;
      pt.y += pt.vy;
      pt.life -= 0.04;
      if (pt.life <= 0) this.particles.splice(i, 1);
    }
  }

  onCrash() {
    this.gameOver = true;
    this.audio.playCrash();

    // Explosion particles
    for (let i = 0; i < 20; i++) {
      this.particles.push({
        x: this.drone.x,
        y: this.drone.y,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8,
        color: '#ef4444',
        life: 1.0
      });
    }

    document.getElementById('modal-final-score').textContent = this.score.toLocaleString();
    document.getElementById('modal-overlay').classList.remove('hidden');
  }

  render() {
    this.ctx.fillStyle = '#02040a';
    this.ctx.fillRect(0, 0, this.w, this.h);

    // Laser Gates
    this.pipes.forEach(p => {
      // Top Gate
      this.ctx.fillStyle = 'rgba(236, 72, 153, 0.2)';
      this.ctx.strokeStyle = '#ec4899';
      this.ctx.lineWidth = 2;
      this.ctx.shadowColor = '#ec4899';
      this.ctx.shadowBlur = 12;
      this.ctx.fillRect(p.x, 0, p.width, p.topH);
      this.ctx.strokeRect(p.x, 0, p.width, p.topH);

      // Bottom Gate
      this.ctx.fillRect(p.x, p.bottomY, p.width, this.h - p.bottomY);
      this.ctx.strokeRect(p.x, p.bottomY, p.width, this.h - p.bottomY);
      this.ctx.shadowBlur = 0;
    });

    // Particles
    this.particles.forEach(pt => {
      this.ctx.fillStyle = pt.color;
      this.ctx.globalAlpha = Math.max(0, pt.life);
      this.ctx.beginPath();
      this.ctx.arc(pt.x, pt.y, 3, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.globalAlpha = 1.0;
    });

    // Custom Vector-Rendered Cyber UFO / Gravity Drone
    this.ctx.save();
    this.ctx.translate(this.drone.x, this.drone.y);
    const angle = Math.min(Math.PI / 4, Math.max(-Math.PI / 4, this.drone.vy * 0.07));
    this.ctx.rotate(angle);

    const now = performance.now() * 0.005;

    // 1. Underbelly Ionic Thruster Flame (Pulsing Plasma Exhaust)
    const flameLen = 10 + Math.abs(this.drone.vy) * 2 + Math.sin(now * 8) * 3;
    const flameGrad = this.ctx.createLinearGradient(0, 4, -flameLen - 12, 6);
    flameGrad.addColorStop(0, 'rgba(0, 243, 255, 0.9)');
    flameGrad.addColorStop(0.5, 'rgba(56, 189, 248, 0.6)');
    flameGrad.addColorStop(1, 'rgba(0, 243, 255, 0)');

    this.ctx.fillStyle = flameGrad;
    this.ctx.beginPath();
    this.ctx.moveTo(-6, 2);
    this.ctx.lineTo(-flameLen - 14, 4);
    this.ctx.lineTo(-6, 7);
    this.ctx.closePath();
    this.ctx.fill();

    // 2. Main Saucer Hull (Sleek Metallic Disc)
    const hullGrad = this.ctx.createLinearGradient(-18, -4, 18, 10);
    hullGrad.addColorStop(0, '#334155');
    hullGrad.addColorStop(0.5, '#0f172a');
    hullGrad.addColorStop(1, '#020617');

    this.ctx.fillStyle = hullGrad;
    this.ctx.strokeStyle = '#00f3ff';
    this.ctx.lineWidth = 1.5;
    this.ctx.shadowColor = '#00f3ff';
    this.ctx.shadowBlur = 10;

    // Elliptical Saucer Body
    this.ctx.beginPath();
    this.ctx.ellipse(0, 4, 19, 7, 0, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.stroke();

    // 3. Cyber Glass Cockpit Dome
    const domeGrad = this.ctx.createRadialGradient(-2, -3, 1, 0, -2, 9);
    domeGrad.addColorStop(0, 'rgba(0, 243, 255, 0.95)');
    domeGrad.addColorStop(0.6, 'rgba(2, 132, 199, 0.7)');
    domeGrad.addColorStop(1, 'rgba(15, 23, 42, 0.85)');

    this.ctx.fillStyle = domeGrad;
    this.ctx.strokeStyle = '#38bdf8';
    this.ctx.lineWidth = 1.2;
    this.ctx.shadowColor = '#00f3ff';
    this.ctx.shadowBlur = 8;

    this.ctx.beginPath();
    this.ctx.arc(0, 1, 9, Math.PI, 0); // Upper semicircle dome
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.stroke();

    // 4. Pilot Visor Glint
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    this.ctx.beginPath();
    this.ctx.arc(-3, -3, 2.5, 0, Math.PI * 2);
    this.ctx.fill();

    // 5. Rotating Rim Beacons / LED Node Lights
    this.ctx.shadowBlur = 6;
    for (let i = -2; i <= 2; i++) {
      const bx = i * 7;
      const by = 5;
      const isLit = Math.sin(now * 5 + i) > 0;
      this.ctx.fillStyle = isLit ? '#facc15' : '#00f3ff';
      this.ctx.shadowColor = this.ctx.fillStyle;

      this.ctx.beginPath();
      this.ctx.arc(bx, by, 1.8, 0, Math.PI * 2);
      this.ctx.fill();
    }

    this.ctx.shadowBlur = 0;
    this.ctx.restore();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.flappyGame = new CyberFlappy();
});
