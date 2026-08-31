/**
 * Cyber Sweeper: Quantum Defuser — Grid Logic Engine
 */

class SweeperAudioEngine {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.isBGMPlaying = false;
    this.bgmTimer = null;
    this.step = 0;
    this.tempo = 115;

    // Atmospheric Detective Chords: Dm7, Bbmaj7, Gm7, A7
    this.chords = [
      [146.83, 174.61, 220.00, 261.63], // Dm7
      [116.54, 146.83, 174.61, 220.00], // Bbmaj7
      [98.00, 116.54, 146.83, 174.61],  // Gm7
      [110.00, 138.59, 164.81, 196.00]  // A7
    ];
    this.bassNotes = [73.42, 58.27, 49.00, 55.00];
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
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(bass * 2, now);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.connect(gain);
        gain.connect(this.masterGain || this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.25);
      } catch(e) {}
    }

    if (step % 8 === 2 || step % 8 === 6) {
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(chord[1] * 2, now);
        gain.gain.setValueAtTime(0.03, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.connect(gain);
        gain.connect(this.masterGain || this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.3);
      } catch(e) {}
    }
  }

  playClick() {
    if (!this.enabled || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(520, now);
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      osc.connect(gain);
      gain.connect(this.masterGain || this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.04);
    } catch(e) {}
  }

  playFlag() {
    if (!this.enabled || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(783.99, now);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.connect(gain);
      gain.connect(this.masterGain || this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.08);
    } catch(e) {}
  }

  playExplosion() {
    if (!this.enabled || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(240, now);
      osc.frequency.exponentialRampToValueAtTime(30, now + 0.5);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
      osc.connect(gain);
      gain.connect(this.masterGain || this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.55);
    } catch(e) {}
  }

  playWin() {
    if (!this.enabled || !this.ctx) return;
    try {
      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((f, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const now = this.ctx.currentTime + i * 0.08;
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, now);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.connect(gain);
        gain.connect(this.masterGain || this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.3);
      });
    } catch(e) {}
  }
}

class CyberSweeper {
  constructor() {
    this.diffs = {
      easy: { size: 8, mines: 10 },
      medium: { size: 12, mines: 22 },
      hard: { size: 16, mines: 40 }
    };
    this.currentDiff = 'easy';

    this.audio = new SweeperAudioEngine();

    this.size = 8;
    this.totalMines = 10;
    this.grid = []; // { isMine, isRevealed, isFlagged, count }
    this.firstClick = true;
    this.gameOver = false;
    this.won = false;
    this.mode = 'reveal'; // 'reveal' | 'flag'

    this.seconds = 0;
    this.timerInterval = null;

    this.initUI();
    this.restart();
  }

  initUI() {
    window.focus();
    window.addEventListener('click', () => window.focus());

    // Difficulty buttons
    document.querySelectorAll('.diff-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        this.currentDiff = e.target.dataset.diff;
        this.restart();
      });
    });

    // Tool buttons (Touch Reveal vs Flag Mode)
    const revBtn = document.getElementById('btn-mode-reveal');
    const flagBtn = document.getElementById('btn-mode-flag');
    revBtn.addEventListener('click', () => {
      this.mode = 'reveal';
      revBtn.classList.add('active');
      flagBtn.classList.remove('active');
    });
    flagBtn.addEventListener('click', () => {
      this.mode = 'flag';
      flagBtn.classList.add('active');
      revBtn.classList.remove('active');
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
  }

  restart() {
    const config = this.diffs[this.currentDiff];
    this.size = config.size;
    this.totalMines = config.mines;
    this.firstClick = true;
    this.gameOver = false;
    this.won = false;
    this.seconds = 0;

    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = null;
    document.getElementById('timer-val').textContent = '00:00';

    this.createGrid();
    document.getElementById('modal-overlay').classList.add('hidden');
    this.updateHUD();
  }

  createGrid() {
    const container = document.getElementById('grid-container');
    container.innerHTML = '';
    container.className = `grid-box grid-${this.size}`;

    this.grid = [];
    for (let r = 0; r < this.size; r++) {
      const row = [];
      for (let c = 0; c < this.size; c++) {
        const cell = {
          r, c,
          isMine: false,
          isRevealed: false,
          isFlagged: false,
          count: 0,
          el: document.createElement('div')
        };
        cell.el.className = 'cell';
        cell.el.addEventListener('click', () => this.handleCellClick(cell));
        cell.el.addEventListener('contextmenu', (e) => {
          e.preventDefault();
          this.toggleFlag(cell);
        });

        container.appendChild(cell.el);
        row.push(cell);
      }
      this.grid.push(row);
    }
  }

  startTimer() {
    if (this.timerInterval) return;
    this.timerInterval = setInterval(() => {
      this.seconds++;
      const m = Math.floor(this.seconds / 60).toString().padStart(2, '0');
      const s = (this.seconds % 60).toString().padStart(2, '0');
      document.getElementById('timer-val').textContent = `${m}:${s}`;
    }, 1000);
  }

  generateMines(safeR, safeC) {
    let placed = 0;
    while (placed < this.totalMines) {
      const r = Math.floor(Math.random() * this.size);
      const c = Math.floor(Math.random() * this.size);

      // Safe zone around first click
      if (Math.abs(r - safeR) <= 1 && Math.abs(c - safeC) <= 1) continue;
      if (!this.grid[r][c].isMine) {
        this.grid[r][c].isMine = true;
        placed++;
      }
    }

    // Calculate neighbour counts
    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        if (!this.grid[r][c].isMine) {
          let count = 0;
          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              const nr = r + dr;
              const nc = c + dc;
              if (nr >= 0 && nr < this.size && nc >= 0 && nc < this.size && this.grid[nr][nc].isMine) {
                count++;
              }
            }
          }
          this.grid[r][c].count = count;
        }
      }
    }
  }

  handleCellClick(cell) {
    if (this.gameOver || this.won) return;

    if (this.mode === 'flag') {
      this.toggleFlag(cell);
      return;
    }

    if (cell.isFlagged || cell.isRevealed) return;

    if (this.firstClick) {
      this.firstClick = false;
      this.generateMines(cell.r, cell.c);
      this.startTimer();
    }

    if (cell.isMine) {
      this.onDetonation(cell);
      return;
    }

    this.reveal(cell);
    this.audio.playClick();
    this.checkWin();
    this.updateHUD();
  }

  toggleFlag(cell) {
    if (cell.isRevealed || this.gameOver || this.won) return;
    cell.isFlagged = !cell.isFlagged;
    cell.el.textContent = cell.isFlagged ? '🚩' : '';
    this.audio.playFlag();
    this.updateHUD();
  }

  reveal(cell) {
    if (cell.isRevealed || cell.isFlagged) return;
    cell.isRevealed = true;
    cell.el.classList.add('revealed');

    if (cell.count > 0) {
      cell.el.textContent = cell.count;
      cell.el.classList.add(`c-${cell.count}`);
    } else {
      // Flood fill zero neighbours
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = cell.r + dr;
          const nc = cell.c + dc;
          if (nr >= 0 && nr < this.size && nc >= 0 && nc < this.size) {
            this.reveal(this.grid[nr][nc]);
          }
        }
      }
    }
  }

  checkWin() {
    let nonMineCount = this.size * this.size - this.totalMines;
    let revealedCount = 0;
    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        if (this.grid[r][c].isRevealed && !this.grid[r][c].isMine) {
          revealedCount++;
        }
      }
    }

    if (revealedCount === nonMineCount) {
      this.won = true;
      if (this.timerInterval) clearInterval(this.timerInterval);
      this.audio.playWin();

      // Flag all remaining mines
      for (let r = 0; r < this.size; r++) {
        for (let c = 0; c < this.size; c++) {
          if (this.grid[r][c].isMine) {
            this.grid[r][c].el.textContent = '🚩';
          }
        }
      }

      const m = Math.floor(this.seconds / 60).toString().padStart(2, '0');
      const s = (this.seconds % 60).toString().padStart(2, '0');

      document.getElementById('modal-icon').textContent = '🏆';
      document.getElementById('modal-title').textContent = 'GRID DEFUSED!';
      document.getElementById('modal-desc').textContent = 'All quantum EMP mines successfully bypassed!';
      document.getElementById('modal-final-time').textContent = `${m}:${s}`;
      document.getElementById('modal-overlay').classList.remove('hidden');

      if (window.parent && window.parent !== window) {
        try {
          window.parent.postMessage({
            game: 'cyber-sweeper',
            score: Math.max(100, 3000 - this.seconds * 10)
          }, '*');
        } catch (e) {}
      }
    }
  }

  onDetonation(hitCell) {
    this.gameOver = true;
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.audio.playExplosion();

    // Reveal all mines
    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        if (this.grid[r][c].isMine) {
          this.grid[r][c].el.textContent = '💣';
          this.grid[r][c].el.classList.add('revealed');
        }
      }
    }
    hitCell.el.classList.add('mine-hit');

    const m = Math.floor(this.seconds / 60).toString().padStart(2, '0');
    const s = (this.seconds % 60).toString().padStart(2, '0');

    document.getElementById('modal-icon').textContent = '💥';
    document.getElementById('modal-title').textContent = 'QUANTUM DETONATION';
    document.getElementById('modal-desc').textContent = 'You triggered an unstable quantum EMP mine.';
    document.getElementById('modal-final-time').textContent = `${m}:${s}`;
    document.getElementById('modal-overlay').classList.remove('hidden');
  }

  updateHUD() {
    let flagsPlaced = 0;
    let revealedCount = 0;
    const totalCells = this.size * this.size;
    const nonMineCount = totalCells - this.totalMines;

    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        if (this.grid[r][c].isFlagged) flagsPlaced++;
        if (this.grid[r][c].isRevealed) revealedCount++;
      }
    }

    document.getElementById('mines-val').textContent = Math.max(0, this.totalMines - flagsPlaced);
    const pct = Math.min(100, Math.floor((revealedCount / nonMineCount) * 100));
    document.getElementById('cleared-val').textContent = `${pct}%`;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.sweeperGame = new CyberSweeper();
});
