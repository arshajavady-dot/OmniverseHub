/**
 * Cyber Tetris: Quantum Matrix — Classic Falling Block Matrix Engine
 */

class TetrisAudioEngine {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.isBGMPlaying = false;
    this.bgmTimer = null;
    this.step = 0;
    this.tempo = 130;

    // Classic Korobeiniki Melody & Synth Chords: Am, E, Dm, Am
    this.chords = [
      [220.00, 261.63, 329.63], // Am
      [164.81, 207.65, 246.94], // E
      [146.83, 174.61, 220.00], // Dm
      [220.00, 261.63, 329.63]  // Am
    ];
    this.bassNotes = [110.00, 82.41, 73.42, 110.00];
    this.melody = [
      329.63, 246.94, 261.63, 293.66, 261.63, 246.94, 220.00, 220.00,
      261.63, 329.63, 293.66, 261.63, 246.94, 261.63, 293.66, 329.63
    ];
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

    // Synth Bass
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

    // Lead Melody
    if (step % 2 === 0) {
      try {
        const note = this.melody[(step / 2) % this.melody.length];
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(note, now);
        gain.gain.setValueAtTime(0.03, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc.connect(gain);
        gain.connect(this.masterGain || this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.12);
      } catch(e) {}
    }
  }

  playMove() {
    if (!this.enabled || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(300, now);
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.connect(gain);
      gain.connect(this.masterGain || this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.05);
    } catch(e) {}
  }

  playDrop() {
    if (!this.enabled || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.08);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.connect(gain);
      gain.connect(this.masterGain || this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.08);
    } catch(e) {}
  }

  playLineClear() {
    if (!this.enabled || !this.ctx) return;
    try {
      const notes = [440, 554.37, 659.25, 880];
      notes.forEach((f, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const now = this.ctx.currentTime + i * 0.06;
        osc.type = 'square';
        osc.frequency.setValueAtTime(f, now);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.connect(gain);
        gain.connect(this.masterGain || this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.15);
      });
    } catch(e) {}
  }
}

const SHAPES = {
  I: { matrix: [[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]], color: '#00f3ff' },
  O: { matrix: [[1,1],[1,1]], color: '#facc15' },
  T: { matrix: [[0,1,0],[1,1,1],[0,0,0]], color: '#c084fc' },
  S: { matrix: [[0,1,1],[1,1,0],[0,0,0]], color: '#34d399' },
  Z: { matrix: [[1,1,0],[0,1,1],[0,0,0]], color: '#f87171' },
  J: { matrix: [[1,0,0],[1,1,1],[0,0,0]], color: '#38bdf8' },
  L: { matrix: [[0,0,1],[1,1,1],[0,0,0]], color: '#fb923c' }
};
const SHAPE_KEYS = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];

class CyberTetris {
  constructor() {
    this.canvas = document.getElementById('tetrisCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.holdCanvas = document.getElementById('holdCanvas');
    this.holdCtx = this.holdCanvas.getContext('2d');
    this.nextCanvas = document.getElementById('nextCanvas');
    this.nextCtx = this.nextCanvas.getContext('2d');

    this.cols = 10;
    this.rows = 20;
    this.cellSize = 24; // 240x480

    this.audio = new TetrisAudioEngine();

    this.grid = Array.from({ length: this.rows }, () => Array(this.cols).fill(0));
    this.score = 0;
    this.lines = 0;
    this.level = 1;
    this.gameOver = false;

    this.currentPiece = null;
    this.nextPiece = this.randomPiece();
    this.holdPiece = null;
    this.canHold = true;

    this.dropCounter = 0;
    this.lastTime = 0;
    this.particles = [];

    this.spawnPiece();
    this.initUI();
    this.loop();
  }

  randomPiece() {
    const key = SHAPE_KEYS[Math.floor(Math.random() * SHAPE_KEYS.length)];
    return {
      type: key,
      matrix: JSON.parse(JSON.stringify(SHAPES[key].matrix)),
      color: SHAPES[key].color,
      x: 0,
      y: 0
    };
  }

  spawnPiece() {
    this.currentPiece = this.nextPiece;
    this.nextPiece = this.randomPiece();
    this.currentPiece.x = Math.floor((this.cols - this.currentPiece.matrix[0].length) / 2);
    this.currentPiece.y = 0;
    this.canHold = true;

    if (this.collide(this.currentPiece.matrix, this.currentPiece.x, this.currentPiece.y)) {
      this.onGameOver();
    }
    this.renderNextHold();
  }

  collide(matrix, px, py) {
    for (let r = 0; r < matrix.length; r++) {
      for (let c = 0; c < matrix[r].length; c++) {
        if (matrix[r][c]) {
          const nx = px + c;
          const ny = py + r;
          if (nx < 0 || nx >= this.cols || ny >= this.rows || (ny >= 0 && this.grid[ny][nx])) {
            return true;
          }
        }
      }
    }
    return false;
  }

  rotate(matrix) {
    const N = matrix.length;
    const result = Array.from({ length: N }, () => Array(N).fill(0));
    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        result[c][N - 1 - r] = matrix[r][c];
      }
    }
    return result;
  }

  initUI() {
    window.focus();
    window.addEventListener('click', () => window.focus());

    window.addEventListener('keydown', (e) => {
      if (this.gameOver) return;
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        this.move(-1);
      } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        this.move(1);
      } else if (e.code === 'ArrowDown' || e.code === 'KeyS') {
        this.drop();
      } else if (e.code === 'ArrowUp' || e.code === 'KeyW') {
        this.rotateCurrent();
      } else if (e.code === 'Space') {
        e.preventDefault();
        this.hardDrop();
      } else if (e.code === 'KeyC') {
        this.hold();
      }
    });

    // Touch controls
    document.querySelectorAll('.dpad-btn, .act-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        if (this.gameOver) return;
        const act = e.currentTarget.dataset.act;
        if (act === 'left') this.move(-1);
        if (act === 'right') this.move(1);
        if (act === 'drop') this.drop();
        if (act === 'rot') this.rotateCurrent();
        if (act === 'hard') this.hardDrop();
        if (act === 'hold') this.hold();
      });
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

  move(dir) {
    if (!this.collide(this.currentPiece.matrix, this.currentPiece.x + dir, this.currentPiece.y)) {
      this.currentPiece.x += dir;
      this.audio.playMove();
    }
  }

  rotateCurrent() {
    const rot = this.rotate(this.currentPiece.matrix);
    if (!this.collide(rot, this.currentPiece.x, this.currentPiece.y)) {
      this.currentPiece.matrix = rot;
      this.audio.playMove();
    } else if (!this.collide(rot, this.currentPiece.x - 1, this.currentPiece.y)) {
      this.currentPiece.x -= 1;
      this.currentPiece.matrix = rot;
      this.audio.playMove();
    } else if (!this.collide(rot, this.currentPiece.x + 1, this.currentPiece.y)) {
      this.currentPiece.x += 1;
      this.currentPiece.matrix = rot;
      this.audio.playMove();
    }
  }

  drop() {
    if (!this.collide(this.currentPiece.matrix, this.currentPiece.x, this.currentPiece.y + 1)) {
      this.currentPiece.y += 1;
    } else {
      this.lockPiece();
    }
  }

  hardDrop() {
    while (!this.collide(this.currentPiece.matrix, this.currentPiece.x, this.currentPiece.y + 1)) {
      this.currentPiece.y += 1;
      this.score += 2;
    }
    this.audio.playDrop();
    this.lockPiece();
    this.updateHUD();
  }

  hold() {
    if (!this.canHold) return;
    this.canHold = false;
    if (!this.holdPiece) {
      this.holdPiece = { type: this.currentPiece.type, matrix: JSON.parse(JSON.stringify(SHAPES[this.currentPiece.type].matrix)), color: this.currentPiece.color };
      this.spawnPiece();
    } else {
      const temp = this.holdPiece;
      this.holdPiece = { type: this.currentPiece.type, matrix: JSON.parse(JSON.stringify(SHAPES[this.currentPiece.type].matrix)), color: this.currentPiece.color };
      this.currentPiece = {
        type: temp.type,
        matrix: JSON.parse(JSON.stringify(SHAPES[temp.type].matrix)),
        color: temp.color,
        x: Math.floor((this.cols - temp.matrix[0].length) / 2),
        y: 0
      };
    }
    this.audio.playMove();
    this.renderNextHold();
  }

  lockPiece() {
    const mat = this.currentPiece.matrix;
    for (let r = 0; r < mat.length; r++) {
      for (let c = 0; c < mat[r].length; c++) {
        if (mat[r][c]) {
          if (this.currentPiece.y + r >= 0) {
            this.grid[this.currentPiece.y + r][this.currentPiece.x + c] = this.currentPiece.color;
          }
        }
      }
    }
    this.clearLines();
    this.spawnPiece();
  }

  clearLines() {
    let cleared = 0;
    for (let r = this.rows - 1; r >= 0; r--) {
      if (this.grid[r].every(cell => cell !== 0)) {
        this.grid.splice(r, 1);
        this.grid.unshift(Array(this.cols).fill(0));
        cleared++;
        r++; // Check same row index again
      }
    }

    if (cleared > 0) {
      const pts = [0, 100, 300, 500, 800][cleared] * this.level;
      this.score += pts;
      this.lines += cleared;
      this.level = Math.floor(this.lines / 10) + 1;
      this.audio.playLineClear();
      this.updateHUD();

      if (window.parent && window.parent !== window) {
        try {
          window.parent.postMessage({
            game: 'cyber-tetris',
            score: this.score
          }, '*');
        } catch (e) {}
      }
    }
  }

  onGameOver() {
    this.gameOver = true;
    document.getElementById('modal-final-score').textContent = this.score.toLocaleString();
    document.getElementById('modal-overlay').classList.remove('hidden');
  }

  restart() {
    this.grid = Array.from({ length: this.rows }, () => Array(this.cols).fill(0));
    this.score = 0;
    this.lines = 0;
    this.level = 1;
    this.gameOver = false;
    this.holdPiece = null;
    this.nextPiece = this.randomPiece();
    this.spawnPiece();

    document.getElementById('modal-overlay').classList.add('hidden');
    this.updateHUD();
  }

  updateHUD() {
    document.getElementById('score-val').textContent = this.score.toLocaleString();
    document.getElementById('lines-val').textContent = this.lines;
    document.getElementById('level-val').textContent = this.level;
  }

  renderNextHold() {
    // Render Hold
    this.holdCtx.fillStyle = '#02040a';
    this.holdCtx.fillRect(0, 0, 70, 70);
    if (this.holdPiece) this.drawPreview(this.holdCtx, this.holdPiece);

    // Render Next
    this.nextCtx.fillStyle = '#02040a';
    this.nextCtx.fillRect(0, 0, 70, 70);
    if (this.nextPiece) this.drawPreview(this.nextCtx, this.nextPiece);
  }

  drawPreview(ctx, piece) {
    const mat = piece.matrix;
    const size = 14;
    const offX = (70 - mat[0].length * size) / 2;
    const offY = (70 - mat.length * size) / 2;

    ctx.fillStyle = piece.color;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    for (let r = 0; r < mat.length; r++) {
      for (let c = 0; c < mat[r].length; c++) {
        if (mat[r][c]) {
          ctx.fillRect(offX + c * size, offY + r * size, size - 1, size - 1);
          ctx.strokeRect(offX + c * size, offY + r * size, size - 1, size - 1);
        }
      }
    }
  }

  loop(time = 0) {
    const deltaTime = time - this.lastTime;
    this.lastTime = time;

    this.dropCounter += deltaTime;
    const dropInterval = Math.max(100, 800 - (this.level - 1) * 70);
    if (this.dropCounter > dropInterval && !this.gameOver) {
      this.drop();
      this.dropCounter = 0;
    }

    this.render();
    requestAnimationFrame((t) => this.loop(t));
  }

  render() {
    this.ctx.fillStyle = '#02040a';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Grid Background
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    this.ctx.lineWidth = 1;
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        this.ctx.strokeRect(c * this.cellSize, r * this.cellSize, this.cellSize, this.cellSize);
        if (this.grid[r][c]) {
          this.ctx.fillStyle = this.grid[r][c];
          this.ctx.fillRect(c * this.cellSize + 1, r * this.cellSize + 1, this.cellSize - 2, this.cellSize - 2);
        }
      }
    }

    // Ghost Piece Projection
    if (this.currentPiece && !this.gameOver) {
      let ghostY = this.currentPiece.y;
      while (!this.collide(this.currentPiece.matrix, this.currentPiece.x, ghostY + 1)) {
        ghostY++;
      }
      this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
      this.ctx.lineWidth = 1.5;
      const mat = this.currentPiece.matrix;
      for (let r = 0; r < mat.length; r++) {
        for (let c = 0; c < mat[r].length; c++) {
          if (mat[r][c]) {
            this.ctx.strokeRect((this.currentPiece.x + c) * this.cellSize + 2, (ghostY + r) * this.cellSize + 2, this.cellSize - 4, this.cellSize - 4);
          }
        }
      }

      // Current Active Piece
      this.ctx.fillStyle = this.currentPiece.color;
      this.ctx.shadowColor = this.currentPiece.color;
      this.ctx.shadowBlur = 10;
      for (let r = 0; r < mat.length; r++) {
        for (let c = 0; c < mat[r].length; c++) {
          if (mat[r][c]) {
            this.ctx.fillRect((this.currentPiece.x + c) * this.cellSize + 1, (this.currentPiece.y + r) * this.cellSize + 1, this.cellSize - 2, this.cellSize - 2);
          }
        }
      }
      this.ctx.shadowBlur = 0;
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.tetrisGame = new CyberTetris();
});
