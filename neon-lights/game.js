/**
 * Neon Lights Out: Grid Breaker — Cyberpunk Logic Puzzle with Ambient Electronic Soundtrack
 */

class SoundFX {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.isBGMPlaying = false;
    this.bgmTimer = null;
    this.step = 0;
    this.tempo = 118;

    // Atmospheric Cyber Chords: Dm, Bb, F, C
    this.chords = [
      [146.83, 174.61, 220.00], // Dm
      [116.54, 146.83, 174.61], // Bb
      [174.61, 220.00, 261.63], // F
      [130.81, 164.81, 196.00]  // C
    ];
    this.bassNotes = [73.42, 58.27, 87.31, 65.41];
    this.arpOffsets = [0, 3, 7, 12, 7, 3, 12, 7];

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

    // 1. Electronic Pulse Bass
    if (step % 4 === 0) {
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(bass, now);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
        osc.connect(gain);
        gain.connect(this.masterGain || this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.28);
      } catch(e) {}
    }

    // 2. High Glockenspiel / Matrix Bells
    if (step % 2 === 0) {
      try {
        const arpIdx = (step / 2) % this.arpOffsets.length;
        const freq = chord[0] * Math.pow(2, this.arpOffsets[arpIdx] / 12) * 2;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(0.03, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
        osc.connect(gain);
        gain.connect(this.masterGain || this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.16);
      } catch(e) {}
    }
  }

  playZap(on) {
    if (!this.enabled || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;
      osc.type = on ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(on ? 440 : 260, now);
      osc.frequency.exponentialRampToValueAtTime(on ? 880 : 130, now + 0.08);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.09);
    } catch(e) {}
  }

  playWin() {
    if (!this.enabled || !this.ctx) return;
    try {
      const chord = [523.25, 659.25, 783.99, 1046.50, 1318.51];
      chord.forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const now = this.ctx.currentTime + i * 0.08;
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.3);
      });
    } catch(e) {}
  }
}

class NeonLightsOut {
  constructor() {
    this.size = 3; // 3, 4, or 5
    this.stage = 1;
    this.maxStages = 25;
    this.grid = [];
    this.initialGrid = [];
    this.solutionMoves = [];
    this.movesCount = 0;
    this.totalScore = 0;
    this.hintsLeft = 3;

    this.sound = new SoundFX();
    this.gridEl = document.getElementById('lights-grid');
    this.stageEl = document.getElementById('stage-val');
    this.movesEl = document.getElementById('moves-val');
    this.scoreEl = document.getElementById('score-val');
    this.hintCountEl = document.getElementById('hint-count');
    this.modalEl = document.getElementById('modal-victory');

    this.initUI();
    this.generateStage();
  }

  initUI() {
    window.focus();
    window.addEventListener('click', () => window.focus());

    document.querySelectorAll('.size-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        this.size = parseInt(e.target.dataset.size, 10);
        this.gridEl.className = `lights-grid grid-${this.size}x${this.size}`;
        this.generateStage();
      });
    });

    document.getElementById('btn-hint').addEventListener('click', () => this.giveHint());
    document.getElementById('btn-restart').addEventListener('click', () => this.resetCurrentStage());
    
    const soundBtn = document.getElementById('btn-sound');
    soundBtn.addEventListener('click', (e) => {
      this.sound.enabled = !this.sound.enabled;
      if (this.sound.enabled) {
        this.sound.startBGM();
        e.currentTarget.innerHTML = `<span>🔊</span>`;
      } else {
        this.sound.stopBGM();
        e.currentTarget.innerHTML = `<span>🔇</span>`;
      }
    });

    document.getElementById('btn-next-stage').addEventListener('click', () => {
      this.modalEl.classList.add('hidden');
      this.stage++;
      this.generateStage();
    });

    document.getElementById('btn-replay-stage').addEventListener('click', () => {
      this.modalEl.classList.add('hidden');
      this.resetCurrentStage();
    });
  }

  generateStage() {
    this.grid = Array(this.size).fill(null).map(() => Array(this.size).fill(false));
    this.movesCount = 0;
    this.solutionMoves = [];
    this.updateStatsUI();

    const numToggles = Math.min(3 + this.stage, this.size * this.size);
    const toggles = [];

    while (toggles.length < numToggles) {
      const r = Math.floor(Math.random() * this.size);
      const c = Math.floor(Math.random() * this.size);
      const key = `${r},${c}`;
      if (!toggles.includes(key)) {
        toggles.push(key);
        this.toggleRaw(r, c);
      }
    }

    if (this.isCleared()) {
      this.toggleRaw(0, 0);
      toggles.push('0,0');
    }

    this.initialGrid = this.grid.map(row => [...row]);
    this.solutionMoves = toggles;
    this.render();
  }

  toggleRaw(r, c) {
    const coords = [[r, c], [r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]];
    coords.forEach(([nr, nc]) => {
      if (nr >= 0 && nr < this.size && nc >= 0 && nc < this.size) {
        this.grid[nr][nc] = !this.grid[nr][nc];
      }
    });
  }

  onNodeClick(r, c) {
    this.movesCount++;
    this.toggleRaw(r, c);
    this.sound.playZap(this.grid[r][c]);
    this.updateStatsUI();
    this.render();

    if (this.isCleared()) {
      this.onVictory();
    }
  }

  isCleared() {
    return this.grid.every(row => row.every(val => !val));
  }

  onVictory() {
    this.sound.playWin();
    const stageBonus = Math.max(500 - this.movesCount * 20, 100) * this.size;
    this.totalScore += stageBonus;
    this.updateStatsUI();

    if (window.parent && window.parent !== window) {
      try {
        window.parent.postMessage({
          game: 'neon-lights',
          score: this.totalScore
        }, '*');
      } catch (e) {}
    }

    document.getElementById('modal-moves').textContent = this.movesCount;
    document.getElementById('modal-bonus').textContent = `+${stageBonus.toLocaleString()} PTS`;
    this.modalEl.classList.remove('hidden');
  }

  resetCurrentStage() {
    this.grid = this.initialGrid.map(row => [...row]);
    this.movesCount = 0;
    this.updateStatsUI();
    this.render();
  }

  giveHint() {
    if (this.hintsLeft <= 0) return;
    this.hintsLeft--;
    this.hintCountEl.textContent = this.hintsLeft;

    const randomKey = this.solutionMoves[Math.floor(Math.random() * this.solutionMoves.length)];
    if (randomKey) {
      const [r, c] = randomKey.split(',').map(Number);
      const btn = document.querySelector(`.node-btn[data-r="${r}"][data-c="${c}"]`);
      if (btn) {
        btn.classList.add('hint-pulse');
        setTimeout(() => btn.classList.remove('hint-pulse'), 1500);
      }
    }
  }

  updateStatsUI() {
    this.stageEl.textContent = `${this.stage} / ${this.maxStages}`;
    this.movesEl.textContent = this.movesCount;
    this.scoreEl.textContent = this.totalScore.toLocaleString();
  }

  render() {
    this.gridEl.innerHTML = '';
    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        const isActive = this.grid[r][c];
        const btn = document.createElement('button');
        btn.className = `node-btn ${isActive ? 'active' : ''}`;
        btn.dataset.r = r;
        btn.dataset.c = c;
        btn.innerHTML = `<span class="node-icon">${isActive ? '⚡' : '○'}</span>`;
        btn.addEventListener('click', () => this.onNodeClick(r, c));
        this.gridEl.appendChild(btn);
      }
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.lightsGame = new NeonLightsOut();
});
