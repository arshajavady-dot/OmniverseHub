/**
 * Cyber 2048: Quantum Fusion — Complete Standalone Engine with Smooth Animations & Synth Music
 */

// --- 1. PROCEDURAL WEB AUDIO & CHILL SYNTH ENGINE ---
class Cyber2048Audio {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.isBGMPlaying = false;
    this.bgmTimer = null;
    this.step = 0;
    this.tempo = 112;

    // Chords: Em7, Cmaj7, G, D
    this.chords = [
      [164.81, 196.00, 246.94, 293.66], // Em7
      [130.81, 164.81, 196.00, 246.94], // Cmaj7
      [146.83, 196.00, 246.94, 293.66], // G
      [146.83, 185.00, 220.00, 293.66]  // D
    ];
    this.bassNotes = [82.41, 65.41, 98.00, 73.42];
    this.arpOffsets = [0, 7, 12, 16, 12, 7, 4, 7];

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
    ['click', 'pointerdown', 'keydown', 'touchstart'].forEach(evt => {
      window.addEventListener(evt, unlock, { passive: true, once: true });
    });
  }

  startBGM() {
    this.init();
    if (!this.ctx || !this.enabled) return;
    if (this.isBGMPlaying) return;

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

    // 1. Sub Bass on 8th beats
    if (step % 4 === 0) {
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(bass, now);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.connect(gain);
        gain.connect(this.masterGain || this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.35);
      } catch(e) {}
    }

    // 2. Quantum Arpeggio Lead
    if (step % 2 === 0) {
      try {
        const arpIdx = (step / 2) % this.arpOffsets.length;
        const freq = chord[0] * Math.pow(2, this.arpOffsets[arpIdx] / 12);
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(0.035, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
        osc.connect(gain);
        gain.connect(this.masterGain || this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.18);
      } catch(e) {}
    }

    // 3. Ambient Pad on Bar Start
    if (step % 16 === 0) {
      chord.forEach(f => {
        try {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(f, now);
          gain.gain.setValueAtTime(0.001, now);
          gain.gain.linearRampToValueAtTime(0.025, now + 0.5);
          gain.gain.linearRampToValueAtTime(0.001, now + 3.2);
          osc.connect(gain);
          gain.connect(this.masterGain || this.ctx.destination);
          osc.start(now);
          osc.stop(now + 3.2);
        } catch(e) {}
      });
    }
  }

  playMove() {
    if (!this.enabled || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(160, now + 0.06);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.06);
      osc.connect(gain);
      gain.connect(this.masterGain || this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.06);
    } catch(e) {}
  }

  playMerge(val) {
    if (!this.enabled || !this.ctx) return;
    try {
      const baseFreq = 220 * Math.pow(1.09, Math.min(Math.log2(val), 14));
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, now + 0.12);
      gain.gain.setValueAtTime(0.09, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc.connect(gain);
      gain.connect(this.masterGain || this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.15);
    } catch(e) {}
  }

  playWin() {
    if (!this.enabled || !this.ctx) return;
    try {
      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((f, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const now = this.ctx.currentTime + i * 0.1;
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(f, now);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
        osc.connect(gain);
        gain.connect(this.masterGain || this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.28);
      });
    } catch(e) {}
  }
}

// --- 2. 2048 QUANTUM GAME ENGINE WITH SMOOTH TILE ANIMATIONS ---
class Tile {
  constructor(r, c, value) {
    this.id = Tile.nextId++;
    this.r = r;
    this.c = c;
    this.value = value;
    this.previousPosition = null;
    this.mergedFrom = null;
    this.isNew = true;
    this.isMerged = false;
  }

  savePosition() {
    this.previousPosition = { r: this.r, c: this.c };
  }

  updatePosition(r, c) {
    this.r = r;
    this.c = c;
  }
}
Tile.nextId = 1;

class Cyber2048 {
  constructor() {
    this.size = 4;
    this.grid = [];
    this.score = 0;
    this.bestScore = parseInt(localStorage.getItem('cyber2048_best') || '0', 10);
    this.undoStack = [];
    this.maxUndos = 3;
    this.undosRemaining = this.maxUndos;
    this.won = false;
    this.keepPlaying = false;
    this.gameOver = false;
    this.isAnimating = false;

    this.audio = new Cyber2048Audio();
    this.tileContainer = document.getElementById('tile-container');
    this.scoreEl = document.getElementById('current-score');
    this.bestScoreEl = document.getElementById('best-score');
    this.undoBtn = document.getElementById('btn-undo');
    this.undoCountEl = document.getElementById('undo-count');
    this.soundBtn = document.getElementById('btn-sound');

    this.init();
  }

  init() {
    window.focus();
    this.bestScoreEl.textContent = this.bestScore.toLocaleString();
    this.setupListeners();
    this.restart();
  }

  restart() {
    this.grid = Array(this.size).fill(null).map(() => Array(this.size).fill(null));
    this.score = 0;
    this.undoStack = [];
    this.undosRemaining = this.maxUndos;
    this.won = false;
    this.keepPlaying = false;
    this.gameOver = false;
    this.isAnimating = false;

    this.updateScore(0);
    this.updateUndoUI();
    this.hideModal();

    this.addRandomTile();
    this.addRandomTile();
    this.render();
  }

  saveState() {
    const gridState = this.grid.map(row => row.map(tile => tile ? { value: tile.value } : null));
    this.undoStack.push({ gridState, score: this.score });
    if (this.undoStack.length > 6) this.undoStack.shift();
    this.updateUndoUI();
  }

  undo() {
    if (this.undosRemaining <= 0 || this.undoStack.length === 0 || this.isAnimating) return;
    const prev = this.undoStack.pop();
    this.grid = prev.gridState.map((row, r) => 
      row.map((item, c) => item ? new Tile(r, c, item.value) : null)
    );
    this.score = prev.score;
    this.undosRemaining--;
    this.updateScore(this.score);
    this.updateUndoUI();
    this.render();
  }

  updateUndoUI() {
    if (this.undoCountEl) this.undoCountEl.textContent = this.undosRemaining;
    if (this.undoBtn) this.undoBtn.disabled = this.undosRemaining <= 0 || this.undoStack.length === 0;
  }

  addRandomTile() {
    const emptyCells = [];
    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        if (!this.grid[r][c]) {
          emptyCells.push({ r, c });
        }
      }
    }
    if (emptyCells.length === 0) return;
    const { r, c } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    const val = Math.random() < 0.88 ? 2 : 4;
    const tile = new Tile(r, c, val);
    this.grid[r][c] = tile;
  }

  updateScore(newScore) {
    this.score = newScore;
    if (this.scoreEl) this.scoreEl.textContent = this.score.toLocaleString();
    if (this.score > this.bestScore) {
      this.bestScore = this.score;
      if (this.bestScoreEl) this.bestScoreEl.textContent = this.bestScore.toLocaleString();
      localStorage.setItem('cyber2048_best', this.bestScore.toString());
    }

    if (window.parent && window.parent !== window) {
      try {
        window.parent.postMessage({ game: 'cyber-2048', score: this.score }, '*');
      } catch (e) {}
    }
  }

  prepareTiles() {
    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        const tile = this.grid[r][c];
        if (tile) {
          tile.isMerged = false;
          tile.isNew = false;
          tile.savePosition();
        }
      }
    }
  }

  move(direction) {
    if (this.gameOver || this.isAnimating) return false;

    // Vector mapping
    const vectors = {
      up: { r: -1, c: 0 },
      right: { r: 0, c: 1 },
      down: { r: 1, c: 0 },
      left: { r: 0, c: -1 }
    };
    const vector = vectors[direction];
    if (!vector) return false;

    this.prepareTiles();

    const traversals = {
      r: Array.from({ length: this.size }, (_, i) => i),
      c: Array.from({ length: this.size }, (_, i) => i)
    };
    if (vector.r === 1) traversals.r.reverse();
    if (vector.c === 1) traversals.c.reverse();

    let moved = false;
    let addedScore = 0;
    let highestMerged = 0;

    // Record undo state before movement
    const preMoveState = this.grid.map(row => row.map(tile => tile ? { value: tile.value } : null));
    const preMoveScore = this.score;

    traversals.r.forEach(r => {
      traversals.c.forEach(c => {
        const tile = this.grid[r][c];
        if (tile) {
          const positions = this.findFarthestPosition(r, c, vector);
          const next = positions.next;

          if (next && next.tile && next.tile.value === tile.value && !next.tile.isMerged) {
            const mergedVal = tile.value * 2;
            const mergedTile = new Tile(next.r, next.c, mergedVal);
            mergedTile.isMerged = true;
            mergedTile.mergedFrom = [tile, next.tile];

            this.grid[r][c] = null;
            this.grid[next.r][next.c] = mergedTile;

            tile.updatePosition(next.r, next.c);
            addedScore += mergedVal;
            if (mergedVal > highestMerged) highestMerged = mergedVal;
            if (mergedVal === 2048 && !this.won && !this.keepPlaying) {
              this.won = true;
            }
            moved = true;
          } else {
            this.grid[r][c] = null;
            this.grid[positions.farthest.r][positions.farthest.c] = tile;
            tile.updatePosition(positions.farthest.r, positions.farthest.c);
            if (positions.farthest.r !== r || positions.farthest.c !== c) {
              moved = true;
            }
          }
        }
      });
    });

    if (moved) {
      this.undoStack.push({ gridState: preMoveState, score: preMoveScore });
      if (this.undoStack.length > 6) this.undoStack.shift();
      this.updateUndoUI();

      this.updateScore(this.score + addedScore);
      if (highestMerged > 0) {
        this.audio.playMerge(highestMerged);
      } else {
        this.audio.playMove();
      }

      this.addRandomTile();
      this.render();

      if (this.won && !this.keepPlaying) {
        this.audio.playWin();
        setTimeout(() => this.showWinModal(), 300);
      } else if (this.checkGameOver()) {
        this.gameOver = true;
        setTimeout(() => this.showGameOverModal(), 300);
      }
      return true;
    }
    return false;
  }

  findFarthestPosition(r, c, vector) {
    let prev;
    do {
      prev = { r, c };
      r += vector.r;
      c += vector.c;
    } while (r >= 0 && r < this.size && c >= 0 && c < this.size && !this.grid[r][c]);

    return {
      farthest: prev,
      next: (r >= 0 && r < this.size && c >= 0 && c < this.size) ? { r, c, tile: this.grid[r][c] } : null
    };
  }

  checkGameOver() {
    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        if (!this.grid[r][c]) return false;
        if (c < this.size - 1 && this.grid[r][c].value === this.grid[r][c + 1]?.value) return false;
        if (r < this.size - 1 && this.grid[r][c].value === this.grid[r + 1][c]?.value) return false;
      }
    }
    return true;
  }

  render() {
    this.tileContainer.innerHTML = '';

    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        const tile = this.grid[r][c];
        if (tile) {
          if (tile.mergedFrom) {
            tile.mergedFrom.forEach(mTile => this.renderTile(mTile, true));
          }
          this.renderTile(tile);
        }
      }
    }
  }

  renderTile(tile, isGhost = false) {
    const el = document.createElement('div');
    const valClass = tile.value <= 2048 ? `tile-${tile.value}` : 'tile-super';
    const animClass = tile.isMerged ? 'tile-merged' : (tile.isNew ? 'tile-new' : '');

    el.className = `tile ${valClass} ${animClass}`;
    if (isGhost) el.style.zIndex = '5';

    // Smooth percentage positioning
    const leftPct = (tile.c * 25) + '%';
    const topPct = (tile.r * 25) + '%';
    el.style.left = leftPct;
    el.style.top = topPct;

    el.innerHTML = `<div class="tile-inner">${tile.value}</div>`;
    this.tileContainer.appendChild(el);
  }

  showWinModal() {
    document.getElementById('modal-icon').textContent = '🏆';
    document.getElementById('modal-title').textContent = 'QUANTUM SINGULARITY ACHIEVED!';
    document.getElementById('modal-desc').textContent = 'You synthesized the 2048 Quantum Fusion Core!';
    document.getElementById('modal-final-score').textContent = this.score.toLocaleString();
    document.getElementById('modal-btn-continue').classList.remove('hidden');
    document.getElementById('modal-overlay').classList.remove('hidden');
  }

  showGameOverModal() {
    document.getElementById('modal-icon').textContent = '💀';
    document.getElementById('modal-title').textContent = 'MATRIX OVERLOAD — NO MOVES';
    document.getElementById('modal-desc').textContent = 'The quantum grid has collapsed without valid fusion pathways.';
    document.getElementById('modal-final-score').textContent = this.score.toLocaleString();
    document.getElementById('modal-btn-continue').classList.add('hidden');
    document.getElementById('modal-overlay').classList.remove('hidden');
  }

  hideModal() {
    document.getElementById('modal-overlay').classList.add('hidden');
  }

  setupListeners() {
    // Robust Keydown Listener (Supports e.key, e.code, and e.keyCode thoroughly)
    window.addEventListener('keydown', (e) => {
      const isInput = ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName);
      if (isInput) return;

      let dir = null;
      const k = e.key ? e.key.toLowerCase() : '';
      const c = e.code || '';
      const kc = e.keyCode || 0;

      if (k === 'arrowup' || c === 'ArrowUp' || k === 'w' || c === 'KeyW' || kc === 38 || kc === 87) dir = 'up';
      else if (k === 'arrowdown' || c === 'ArrowDown' || k === 's' || c === 'KeyS' || kc === 40 || kc === 83) dir = 'down';
      else if (k === 'arrowleft' || c === 'ArrowLeft' || k === 'a' || c === 'KeyA' || kc === 37 || kc === 65) dir = 'left';
      else if (k === 'arrowright' || c === 'ArrowRight' || k === 'd' || c === 'KeyD' || kc === 39 || kc === 68) dir = 'right';

      if (dir) {
        e.preventDefault();
        this.move(dir);
      }
    }, { passive: false });

    // Focus on window touch/click
    window.addEventListener('click', () => window.focus());
    window.addEventListener('touchstart', () => window.focus(), { passive: true });

    // Touch / Swipe
    let touchStartX = 0, touchStartY = 0;
    const boardEl = document.getElementById('grid-board');
    boardEl.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    }, { passive: true });

    boardEl.addEventListener('touchend', (e) => {
      if (!touchStartX || !touchStartY) return;
      const dx = e.changedTouches[0].clientX - touchStartX;
      const dy = e.changedTouches[0].clientY - touchStartY;
      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);

      if (Math.max(absDx, absDy) > 20) {
        if (absDx > absDy) {
          this.move(dx > 0 ? 'right' : 'left');
        } else {
          this.move(dy > 0 ? 'down' : 'up');
        }
      }
      touchStartX = 0;
      touchStartY = 0;
    }, { passive: true });

    // Action buttons
    document.getElementById('btn-restart').addEventListener('click', () => this.restart());
    this.undoBtn.addEventListener('click', () => this.undo());
    document.getElementById('modal-btn-restart').addEventListener('click', () => this.restart());
    document.getElementById('modal-btn-continue').addEventListener('click', () => {
      this.keepPlaying = true;
      this.hideModal();
    });

    // Sound toggle
    this.soundBtn.addEventListener('click', () => {
      this.audio.enabled = !this.audio.enabled;
      if (this.audio.enabled) {
        this.audio.startBGM();
        this.soundBtn.innerHTML = `<span>🔊</span> AUDIO`;
      } else {
        this.audio.stopBGM();
        this.soundBtn.innerHTML = `<span>🔇</span> MUTED`;
      }
    });

    // D-Pad buttons
    document.querySelectorAll('.dpad-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const dir = e.currentTarget.dataset.dir;
        if (dir) this.move(dir);
      });
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.game2048 = new Cyber2048();
});
