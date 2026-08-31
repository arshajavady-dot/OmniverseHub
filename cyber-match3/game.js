/**
 * Cyber Match 3: Gem Core Protocol — Smooth Cascading Match-3 Engine with Electro Soundtrack
 */

const GEM_TYPES = [
  { id: 'ruby', icon: '🔴', color: '#ff0055' },
  { id: 'sapphire', icon: '🔷', color: '#00f3ff' },
  { id: 'emerald', icon: '🟢', color: '#00ff66' },
  { id: 'amethyst', icon: '🟣', color: '#a800ff' },
  { id: 'topaz', icon: '🟡', color: '#ffe600' },
  { id: 'diamond', icon: '💎', color: '#ffffff' }
];

// --- 1. PROCEDURAL ELECTRO MATCH SYNTH SOUNDTRACK ENGINE ---
class MatchAudioEngine {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.isBGMPlaying = false;
    this.bgmTimer = null;
    this.step = 0;
    this.tempo = 126;

    // Upbeat Cyber-Pop chords: Fmaj7, G, Am7, Em7
    this.chords = [
      [174.61, 220.00, 261.63, 329.63], // Fmaj7
      [196.00, 246.94, 293.66, 392.00], // G
      [220.00, 261.63, 329.63, 392.00], // Am7
      [164.81, 196.00, 246.94, 329.63]  // Em7
    ];
    this.bassNotes = [87.31, 98.00, 110.00, 82.41];
    this.arpOffsets = [0, 4, 7, 12, 16, 12, 7, 4];

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

    // 1. Funky Octave Bass (Quarter notes)
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

    // 2. High Shimmer Lead Arpeggios (16th notes)
    if (step % 2 === 0) {
      try {
        const arpIdx = (step / 2) % this.arpOffsets.length;
        const freq = chord[0] * Math.pow(2, this.arpOffsets[arpIdx] / 12) * 1.5;
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

  playSelect() {
    if (!this.enabled || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(520, now);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.connect(gain);
      gain.connect(this.masterGain || this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.05);
    } catch(e) {}
  }

  playMatch(combo = 1) {
    if (!this.enabled || !this.ctx) return;
    try {
      const baseF = 350 * Math.pow(1.15, Math.min(combo, 8));
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(baseF, now);
      osc.frequency.exponentialRampToValueAtTime(baseF * 1.6, now + 0.12);
      gain.gain.setValueAtTime(0.09, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc.connect(gain);
      gain.connect(this.masterGain || this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.15);
    } catch(e) {}
  }

  playGameOver() {
    if (!this.enabled || !this.ctx) return;
    try {
      const freqs = [440, 415, 392, 370];
      freqs.forEach((f, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const now = this.ctx.currentTime + i * 0.12;
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(f, now);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.connect(gain);
        gain.connect(this.masterGain || this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.3);
      });
    } catch(e) {}
  }
}

// --- 2. MATCH 3 GAME LOGIC WITH SMOOTH VISUAL TRANSITIONS ---
class CyberMatch3 {
  constructor() {
    this.rows = 8;
    this.cols = 8;
    this.grid = [];
    this.selectedGem = null;
    this.isProcessing = false;
    this.score = 0;
    this.combo = 1;
    this.timeLeft = 60;
    this.timerInterval = null;
    this.gameOver = false;

    this.audio = new MatchAudioEngine();
    this.gridEl = document.getElementById('match-grid');
    this.scoreEl = document.getElementById('score-display');
    this.timeEl = document.getElementById('time-display');
    this.comboEl = document.getElementById('combo-display');
    this.modalEl = document.getElementById('modal-gameover');

    this.initUI();
    this.startNewGame();
  }

  initUI() {
    window.focus();
    window.addEventListener('click', () => window.focus());

    document.getElementById('btn-restart').addEventListener('click', () => this.startNewGame());
    document.getElementById('modal-btn-restart').addEventListener('click', () => {
      this.modalEl.classList.add('hidden');
      this.startNewGame();
    });

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
  }

  startNewGame() {
    this.score = 0;
    this.combo = 1;
    this.timeLeft = 60;
    this.gameOver = false;
    this.selectedGem = null;
    this.isProcessing = false;

    this.updateStatsUI();
    this.modalEl.classList.add('hidden');

    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      this.timeLeft--;
      this.updateStatsUI();
      if (this.timeLeft <= 0) {
        clearInterval(this.timerInterval);
        this.onGameOver();
      }
    }, 1000);

    this.generateValidBoard();
    this.render();
  }

  generateValidBoard() {
    do {
      this.grid = [];
      for (let r = 0; r < this.rows; r++) {
        const row = [];
        for (let c = 0; c < this.cols; c++) {
          row.push(this.getRandomGem());
        }
        this.grid.push(row);
      }
    } while (this.findMatches().length > 0 || !this.hasPossibleMoves());
  }

  getRandomGem() {
    return Math.floor(Math.random() * GEM_TYPES.length);
  }

  onGemClick(r, c) {
    if (this.isProcessing || this.gameOver) return;

    if (!this.selectedGem) {
      this.selectedGem = { r, c };
      this.audio.playSelect();
      this.render();
    } else {
      const { r: sr, c: sc } = this.selectedGem;
      const isAdjacent = (Math.abs(r - sr) === 1 && c === sc) || (Math.abs(c - sc) === 1 && r === sr);

      if (isAdjacent) {
        this.trySwap(sr, sc, r, c);
      } else {
        this.selectedGem = { r, c };
        this.audio.playSelect();
        this.render();
      }
    }
  }

  async trySwap(r1, c1, r2, c2) {
    this.isProcessing = true;
    this.selectedGem = null;

    // Visual smooth swap
    const cell1 = document.querySelector(`.gem-cell[data-r="${r1}"][data-c="${c1}"] .gem-inner`);
    const cell2 = document.querySelector(`.gem-cell[data-r="${r2}"][data-c="${c2}"] .gem-inner`);

    if (cell1 && cell2) {
      const dx = (c2 - c1) * 100;
      const dy = (r2 - r1) * 100;
      cell1.style.transform = `translate(${dx}%, ${dy}%)`;
      cell2.style.transform = `translate(${-dx}%, ${-dy}%)`;
    }

    await this.delay(180);

    // Swap data values
    const temp = this.grid[r1][c1];
    this.grid[r1][c1] = this.grid[r2][c2];
    this.grid[r2][c2] = temp;
    this.render();

    const matches = this.findMatches();
    if (matches.length > 0) {
      this.combo = 1;
      await this.processMatches();
    } else {
      // Revert animation
      await this.delay(120);
      const revertTemp = this.grid[r1][c1];
      this.grid[r1][c1] = this.grid[r2][c2];
      this.grid[r2][c2] = revertTemp;
      this.render();
      this.isProcessing = false;
    }
  }

  findMatches() {
    const matchedCoords = new Set();

    // Check horizontal
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols - 2; c++) {
        const type = this.grid[r][c];
        if (type !== null && type === this.grid[r][c + 1] && type === this.grid[r][c + 2]) {
          matchedCoords.add(`${r},${c}`);
          matchedCoords.add(`${r},${c + 1}`);
          matchedCoords.add(`${r},${c + 2}`);
        }
      }
    }

    // Check vertical
    for (let c = 0; c < this.cols; c++) {
      for (let r = 0; r < this.rows - 2; r++) {
        const type = this.grid[r][c];
        if (type !== null && type === this.grid[r + 1][c] && type === this.grid[r + 2][c]) {
          matchedCoords.add(`${r},${c}`);
          matchedCoords.add(`${r + 1},${c}`);
          matchedCoords.add(`${r + 2},${c}`);
        }
      }
    }

    return Array.from(matchedCoords).map(str => str.split(',').map(Number));
  }

  async processMatches() {
    let matches = this.findMatches();

    while (matches.length > 0 && !this.gameOver) {
      this.audio.playMatch(this.combo);
      const points = matches.length * 100 * this.combo;
      this.score += points;
      this.updateStatsUI();

      if (window.parent && window.parent !== window) {
        try {
          window.parent.postMessage({
            game: 'cyber-match3',
            score: this.score
          }, '*');
        } catch (e) {}
      }

      // Trigger matched animation
      matches.forEach(([r, c]) => {
        const cell = document.querySelector(`.gem-cell[data-r="${r}"][data-c="${c}"]`);
        if (cell) {
          cell.classList.add('gem-matched');
        }
        this.grid[r][c] = null;
      });

      await this.delay(260);

      // Drop falling gems
      for (let c = 0; c < this.cols; c++) {
        let emptyRow = this.rows - 1;
        for (let r = this.rows - 1; r >= 0; r--) {
          if (this.grid[r][c] !== null) {
            if (r !== emptyRow) {
              this.grid[emptyRow][c] = this.grid[r][c];
              this.grid[r][c] = null;
            }
            emptyRow--;
          }
        }
        for (let r = emptyRow; r >= 0; r--) {
          this.grid[r][c] = this.getRandomGem();
        }
      }

      this.combo++;
      this.render();
      await this.delay(220);

      matches = this.findMatches();
    }

    if (!this.hasPossibleMoves()) {
      this.generateValidBoard();
      this.render();
    }

    this.combo = 1;
    this.updateStatsUI();
    this.isProcessing = false;
  }

  hasPossibleMoves() {
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        if (c < this.cols - 1) {
          this.swapValues(r, c, r, c + 1);
          const m = this.findMatches().length > 0;
          this.swapValues(r, c, r, c + 1);
          if (m) return true;
        }
        if (r < this.rows - 1) {
          this.swapValues(r, c, r + 1, c);
          const m = this.findMatches().length > 0;
          this.swapValues(r, c, r + 1, c);
          if (m) return true;
        }
      }
    }
    return false;
  }

  swapValues(r1, c1, r2, c2) {
    const temp = this.grid[r1][c1];
    this.grid[r1][c1] = this.grid[r2][c2];
    this.grid[r2][c2] = temp;
  }

  updateStatsUI() {
    this.scoreEl.textContent = this.score.toLocaleString();
    this.timeEl.textContent = `${this.timeLeft}s`;
    this.comboEl.textContent = `x${this.combo}`;
  }

  onGameOver() {
    this.gameOver = true;
    this.audio.playGameOver();
    document.getElementById('modal-final-score').textContent = this.score.toLocaleString();
    this.modalEl.classList.remove('hidden');
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  render() {
    this.gridEl.innerHTML = '';
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const gemTypeIdx = this.grid[r][c];
        const cell = document.createElement('div');
        const isSelected = this.selectedGem && this.selectedGem.r === r && this.selectedGem.c === c;
        cell.className = `gem-cell ${isSelected ? 'selected' : ''}`;
        cell.dataset.r = r;
        cell.dataset.c = c;

        if (gemTypeIdx !== null && GEM_TYPES[gemTypeIdx]) {
          const gem = GEM_TYPES[gemTypeIdx];
          cell.innerHTML = `<div class="gem-inner gem-drop" style="transition: transform 0.18s cubic-bezier(0.25, 1, 0.5, 1);">${gem.icon}</div>`;
        }

        cell.addEventListener('click', () => this.onGemClick(r, c));
        this.gridEl.appendChild(cell);
      }
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.match3 = new CyberMatch3();
});
