/**
 * Cyber Crash: Moonshot Protocol — Real-Time Multiplier Decision Game Engine
 */

class CrashAudioEngine {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.isBGMPlaying = false;
    this.bgmTimer = null;
    this.step = 0;
    this.tempo = 128;

    // Driving Synthwave Space Chords: Am, F, C, G
    this.chords = [
      [220.00, 261.63, 329.63], // Am
      [174.61, 220.00, 261.63], // F
      [130.81, 164.81, 196.00], // C
      [196.00, 246.94, 293.66]  // G
    ];
    this.bassNotes = [110.00, 87.31, 65.41, 98.00];
    this.arpOffsets = [0, 7, 12, 15, 12, 7, 12, 19];

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

    // 1. Driving Synthwave Bass
    if (step % 4 === 0) {
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(bass, now);
        gain.gain.setValueAtTime(0.065, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
        osc.connect(gain);
        gain.connect(this.masterGain || this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.22);
      } catch(e) {}
    }

    // 2. High Rocket Warp Arpeggiator
    if (step % 2 === 0) {
      try {
        const arpIdx = (step / 2) % this.arpOffsets.length;
        const freq = chord[0] * Math.pow(2, this.arpOffsets[arpIdx] / 12);
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(0.03, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
        osc.connect(gain);
        gain.connect(this.masterGain || this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.14);
      } catch(e) {}
    }
  }

  playLaunch() {
    if (!this.enabled || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(100, now);
      osc.frequency.exponentialRampToValueAtTime(600, now + 0.4);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      osc.connect(gain);
      gain.connect(this.masterGain || this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.45);
    } catch(e) {}
  }

  playCashout() {
    if (!this.enabled || !this.ctx) return;
    try {
      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((f, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const now = this.ctx.currentTime + i * 0.07;
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, now);
        gain.gain.setValueAtTime(0.09, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.connect(gain);
        gain.connect(this.masterGain || this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.25);
      });
    } catch(e) {}
  }

  playExplosion() {
    if (!this.enabled || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.5);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
      osc.connect(gain);
      gain.connect(this.masterGain || this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.55);
    } catch(e) {}
  }
}

class CyberCrash {
  constructor() {
    this.canvas = document.getElementById('crashCanvas');
    this.ctx = this.canvas.getContext('2d');

    this.credits = parseInt(localStorage.getItem('cyber_crash_credits') || '1000', 10);
    this.bet = 50;
    this.multiplier = 1.00;
    this.crashPoint = 1.00;
    this.state = 'idle'; // 'idle' | 'flying' | 'crashed' | 'cashed'
    this.history = [2.45, 1.18, 5.80, 1.05, 14.20, 3.12];
    this.particles = [];
    this.stars = [];
    this.flightStartTime = 0;
    this.lastProfit = 0;

    this.audio = new CrashAudioEngine();
    this.multEl = document.getElementById('multiplier-display');
    this.statusEl = document.getElementById('crash-status-lbl');
    this.actionBtn = document.getElementById('btn-main-action');

    this.initStars();
    this.initUI();
    this.render();
  }

  initStars() {
    this.stars = [];
    for (let i = 0; i < 45; i++) {
      this.stars.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        size: Math.random() * 2 + 0.5,
        speed: Math.random() * 1.5 + 0.5
      });
    }
  }

  initUI() {
    window.focus();
    window.addEventListener('click', () => window.focus());

    // Bet chips
    document.querySelectorAll('.chip-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        if (this.state === 'flying') return;
        document.querySelectorAll('.chip-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        this.bet = parseInt(e.target.dataset.bet, 10);
        this.updateStatsUI();
      });
    });

    // Action button (Launch / Eject)
    this.actionBtn.addEventListener('click', () => this.handleActionClick());

    // Audio toggle
    const soundBtn = document.getElementById('btn-sound');
    soundBtn.addEventListener('click', () => {
      this.audio.enabled = !this.audio.enabled;
      if (this.audio.enabled) {
        this.audio.startBGM();
        soundBtn.innerHTML = `<span>🔊</span> AUDIO`;
      } else {
        this.audio.stopBGM();
        soundBtn.innerHTML = `<span>🔇</span> MUTED`;
      }
    });

    this.updateStatsUI();
    this.renderHistory();
  }

  handleActionClick() {
    if (this.state === 'idle' || this.state === 'crashed' || this.state === 'cashed') {
      this.startFlight();
    } else if (this.state === 'flying') {
      this.ejectAndCashOut();
    }
  }

  startFlight() {
    if (this.credits < this.bet) {
      alert('Insufficient credits! Recharging credits to 500.');
      this.credits = 500;
      this.updateStatsUI();
      return;
    }

    this.credits -= this.bet;
    this.multiplier = 1.00;
    this.state = 'flying';
    this.particles = [];
    this.flightStartTime = performance.now();

    // Provably balanced crash point algorithm
    // 97% RTP, range: 1.00x up to 100.00x+
    const e = 2 ** 32;
    const r = Math.floor(Math.random() * e);
    if (r % 25 === 0) {
      this.crashPoint = 1.00; // Instant bust
    } else {
      this.crashPoint = Math.max(1.01, parseFloat((0.97 * e / (e - r)).toFixed(2)));
    }

    this.audio.playLaunch();
    this.multEl.className = 'multiplier-text';
    this.statusEl.textContent = 'ROCKET ASCENDING...';

    this.actionBtn.className = 'launch-btn eject-btn';
    this.actionBtn.innerHTML = `💥 EJECT & CASHOUT (${Math.round(this.bet * this.multiplier)} 🪙)`;

    this.updateStatsUI();
  }

  ejectAndCashOut() {
    if (this.state !== 'flying') return;

    this.state = 'cashed';
    const wonCredits = Math.round(this.bet * this.multiplier);
    this.credits += wonCredits;
    this.lastProfit = wonCredits - this.bet;

    this.audio.playCashout();
    this.multEl.className = 'multiplier-text cashed';
    this.statusEl.textContent = `CASHOUT AT ${this.multiplier.toFixed(2)}x (+${this.lastProfit} 🪙)`;

    this.actionBtn.className = 'launch-btn';
    this.actionBtn.innerHTML = `🚀 LAUNCH NEXT MOONSHOT (${this.bet} 🪙)`;

    localStorage.setItem('cyber_crash_credits', this.credits.toString());

    // Post to arcade parent
    if (window.parent && window.parent !== window) {
      try {
        window.parent.postMessage({
          game: 'cyber-crash',
          score: wonCredits
        }, '*');
      } catch (e) {}
    }

    this.updateStatsUI();
  }

  onCrash() {
    this.state = 'crashed';
    this.audio.playExplosion();

    this.history.unshift(this.crashPoint);
    if (this.history.length > 8) this.history.pop();
    this.renderHistory();

    this.multEl.className = 'multiplier-text crashed';
    this.multEl.textContent = `${this.crashPoint.toFixed(2)}x`;
    this.statusEl.textContent = 'CRASHED! ROCKET DETONATED';

    this.actionBtn.className = 'launch-btn';
    this.actionBtn.innerHTML = `🚀 LAUNCH NEXT MOONSHOT (${this.bet} 🪙)`;

    // Spawn explosion particles
    for (let i = 0; i < 30; i++) {
      this.particles.push({
        x: this.canvas.width * 0.75,
        y: this.canvas.height * 0.35,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8,
        life: 1.0,
        color: Math.random() < 0.5 ? '#ef4444' : '#f59e0b'
      });
    }

    this.updateStatsUI();
  }

  updateStatsUI() {
    document.getElementById('credits-val').textContent = this.credits.toLocaleString();
    document.getElementById('profit-val').textContent = `+${this.lastProfit.toLocaleString()}`;

    if (this.state === 'idle' || this.state === 'crashed' || this.state === 'cashed') {
      this.actionBtn.innerHTML = `🚀 LAUNCH MOONSHOT (${this.bet} 🪙)`;
    }
  }

  renderHistory() {
    const container = document.getElementById('history-pills');
    container.innerHTML = '';
    this.history.forEach(val => {
      const pill = document.createElement('span');
      const isWin = val >= 2.0;
      pill.className = `history-pill ${isWin ? 'pill-win' : 'pill-bust'}`;
      pill.textContent = `${val.toFixed(2)}x`;
      container.appendChild(pill);
    });
  }

  render() {
    const w = this.canvas.width;
    const h = this.canvas.height;

    // Clear
    this.ctx.fillStyle = '#02040a';
    this.ctx.fillRect(0, 0, w, h);

    // Stars
    this.ctx.fillStyle = '#ffffff';
    this.stars.forEach(s => {
      if (this.state === 'flying') {
        s.x -= s.speed * (1 + this.multiplier * 0.2);
        if (s.x < 0) s.x = w;
      }
      this.ctx.beginPath();
      this.ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
      this.ctx.fill();
    });

    // Grid Lines
    this.ctx.strokeStyle = 'rgba(0, 243, 255, 0.08)';
    this.ctx.lineWidth = 1;
    for (let x = 40; x < w; x += 60) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, h);
      this.ctx.stroke();
    }
    for (let y = 30; y < h; y += 45) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(w, y);
      this.ctx.stroke();
    }

    if (this.state === 'flying') {
      const elapsed = (performance.now() - this.flightStartTime) / 1000;
      // Exponential curve: 1.00 * e^(0.12 * t)
      this.multiplier = Math.max(1.00, parseFloat(Math.pow(Math.E, 0.14 * elapsed).toFixed(2)));

      this.multEl.textContent = `${this.multiplier.toFixed(2)}x`;
      this.actionBtn.innerHTML = `💥 EJECT & CASHOUT (${Math.round(this.bet * this.multiplier)} 🪙)`;

      if (this.multiplier >= this.crashPoint) {
        this.onCrash();
      }
    }

    // Draw Multiplier Curve Line
    if (this.state === 'flying' || this.state === 'cashed' || this.state === 'crashed') {
      const startX = 30;
      const startY = h - 30;
      const progress = Math.min(1.0, (this.multiplier - 1.0) / 10.0);

      const targetX = startX + progress * (w - 100);
      const targetY = startY - progress * (h - 70);

      // Trajectory curve
      this.ctx.strokeStyle = this.state === 'crashed' ? '#ef4444' : '#00f3ff';
      this.ctx.lineWidth = 4;
      this.ctx.shadowBlur = 15;
      this.ctx.shadowColor = this.state === 'crashed' ? '#ef4444' : '#00f3ff';

      this.ctx.beginPath();
      this.ctx.moveTo(startX, startY);
      this.ctx.quadraticCurveTo(startX + (targetX - startX) * 0.4, startY, targetX, targetY);
      this.ctx.stroke();
      this.ctx.shadowBlur = 0;

      // Rocket / Probe icon
      if (this.state === 'flying' || this.state === 'cashed') {
        this.ctx.font = '24px sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('🚀', targetX + 12, targetY - 12);

        // Rocket exhaust particles
        if (Math.random() < 0.6) {
          this.particles.push({
            x: targetX,
            y: targetY,
            vx: (Math.random() - 0.8) * 3,
            vy: (Math.random() + 0.5) * 2,
            life: 1.0,
            color: Math.random() < 0.5 ? '#00f3ff' : '#f59e0b'
          });
        }
      }
    }

    // Render Particles
    this.particles.forEach((p, idx) => {
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.035;

      this.ctx.fillStyle = p.color;
      this.ctx.globalAlpha = Math.max(0, p.life);
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.globalAlpha = 1.0;

      if (p.life <= 0) this.particles.splice(idx, 1);
    });

    requestAnimationFrame(() => this.render());
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.crashGame = new CyberCrash();
});
