/**
 * Cyber Mines: Grid Gamble — Decision Risk Engine
 */

class MinesAudioEngine {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.isBGMPlaying = false;
    this.bgmTimer = null;
    this.step = 0;
    this.tempo = 126;

    // High-Stakes Cyber Casino Chords: Cm, Ab, Fm, G7
    this.chords = [
      [130.81, 155.56, 196.00], // Cm
      [103.83, 130.81, 155.56], // Ab
      [87.31, 103.83, 130.81],  // Fm
      [98.00, 123.47, 146.83, 174.61] // G7
    ];
    this.bassNotes = [65.41, 51.91, 43.65, 49.00];
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
        osc.frequency.setValueAtTime(bass * 2, now);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.connect(gain);
        gain.connect(this.masterGain || this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.2);
      } catch(e) {}
    }

    if (step % 8 === 2 || step % 8 === 6) {
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        const chord = this.chords[bar % this.chords.length];
        osc.frequency.setValueAtTime(chord[1] * 2, now);
        gain.gain.setValueAtTime(0.025, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.connect(gain);
        gain.connect(this.masterGain || this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.25);
      } catch(e) {}
    }
  }

  playGem() {
    if (!this.enabled || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now);
      osc.frequency.exponentialRampToValueAtTime(1174.66, now + 0.12);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc.connect(gain);
      gain.connect(this.masterGain || this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.15);
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
      osc.frequency.exponentialRampToValueAtTime(30, now + 0.45);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      osc.connect(gain);
      gain.connect(this.masterGain || this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.5);
    } catch(e) {}
  }

  playCashout() {
    if (!this.enabled || !this.ctx) return;
    try {
      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((f, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const now = this.ctx.currentTime + i * 0.08;
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, now);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.connect(gain);
        gain.connect(this.masterGain || this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.3);
      });
    } catch(e) {}
  }
}

class CyberMines {
  constructor() {
    this.audio = new MinesAudioEngine();

    this.credits = parseInt(localStorage.getItem('omniverse_coins') || '1000', 10);
    this.bet = 50;
    this.mineCount = 3;
    this.isPlaying = false;

    this.grid = []; // 25 tiles: { isMine, isRevealed, el }
    this.gemsRevealed = 0;
    this.currentMultiplier = 1.0;

    this.initUI();
    this.renderInitialGrid();
  }

  initUI() {
    window.focus();
    window.addEventListener('click', () => window.focus());

    const betInput = document.getElementById('bet-input');
    betInput.addEventListener('change', (e) => {
      this.bet = Math.max(10, Math.min(this.credits, parseInt(e.target.value || '10', 10)));
      betInput.value = this.bet;
    });

    document.getElementById('btn-bet-half').addEventListener('click', () => {
      this.bet = Math.max(10, Math.floor(this.bet / 2));
      betInput.value = this.bet;
    });
    document.getElementById('btn-bet-double').addEventListener('click', () => {
      this.bet = Math.max(10, Math.min(this.credits, this.bet * 2));
      betInput.value = this.bet;
    });
    document.getElementById('btn-bet-max').addEventListener('click', () => {
      this.bet = this.credits;
      betInput.value = this.bet;
    });

    document.getElementById('mines-select').addEventListener('change', (e) => {
      this.mineCount = parseInt(e.target.value, 10);
      this.updateNextMultiplier();
    });

    document.getElementById('btn-start-game').addEventListener('click', () => this.startRun());
    document.getElementById('btn-cashout').addEventListener('click', () => this.cashout());

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

    document.getElementById('modal-btn-restart').addEventListener('click', () => {
      document.getElementById('modal-overlay').classList.add('hidden');
    });

    this.updateHUD();
  }

  calculateMultiplier(gemsFound) {
    if (gemsFound === 0) return 1.0;
    // Fair casino house edge multiplier formula
    let mult = 0.98;
    const totalTiles = 25;
    const safeTiles = totalTiles - this.mineCount;

    for (let i = 0; i < gemsFound; i++) {
      mult *= (totalTiles - i) / (safeTiles - i);
    }
    return Math.max(1.01, mult);
  }

  updateNextMultiplier() {
    const nextMult = this.calculateMultiplier(this.gemsRevealed + 1);
    document.getElementById('next-mult-val').textContent = `${nextMult.toFixed(2)}x`;
  }

  renderInitialGrid() {
    const gridEl = document.getElementById('mines-grid');
    gridEl.innerHTML = '';
    this.grid = [];

    for (let i = 0; i < 25; i++) {
      const tile = {
        index: i,
        isMine: false,
        isRevealed: false,
        el: document.createElement('div')
      };
      tile.el.className = 'mine-tile disabled';
      tile.el.addEventListener('click', () => this.revealTile(tile));
      gridEl.appendChild(tile.el);
      this.grid.push(tile);
    }
  }

  startRun() {
    if (this.credits < this.bet) {
      alert('Insufficient ore credits for this wager!');
      return;
    }

    this.credits -= this.bet;
    this.isPlaying = true;
    this.gemsRevealed = 0;
    this.currentMultiplier = 1.0;

    // Place mines randomly
    this.grid.forEach(t => {
      t.isMine = false;
      t.isRevealed = false;
      t.el.className = 'mine-tile';
      t.el.textContent = '';
    });

    let placed = 0;
    while (placed < this.mineCount) {
      const idx = Math.floor(Math.random() * 25);
      if (!this.grid[idx].isMine) {
        this.grid[idx].isMine = true;
        placed++;
      }
    }

    document.getElementById('btn-start-game').disabled = true;
    document.getElementById('btn-cashout').disabled = true;
    document.getElementById('bet-input').disabled = true;
    document.getElementById('mines-select').disabled = true;

    this.updateNextMultiplier();
    this.updateHUD();
    this.save();
  }

  revealTile(tile) {
    if (!this.isPlaying || tile.isRevealed) return;
    tile.isRevealed = true;

    if (tile.isMine) {
      // Detonation!
      this.onDetonation(tile);
    } else {
      // Gem Found!
      tile.el.textContent = '💎';
      tile.el.classList.add('revealed-gem');
      this.gemsRevealed++;
      this.currentMultiplier = this.calculateMultiplier(this.gemsRevealed);
      this.audio.playGem();

      document.getElementById('btn-cashout').disabled = false;
      const currentPayout = Math.floor(this.bet * this.currentMultiplier);
      document.getElementById('cashout-amt').textContent = currentPayout.toLocaleString();

      this.updateNextMultiplier();
      this.updateHUD();

      // Check max win (all gems found)
      const maxGems = 25 - this.mineCount;
      if (this.gemsRevealed === maxGems) {
        this.cashout();
      }
    }
  }

  cashout() {
    if (!this.isPlaying) return;
    this.isPlaying = false;
    const payout = Math.floor(this.bet * this.currentMultiplier);
    this.credits += payout;
    this.audio.playCashout();

    // Reveal rest of grid
    this.revealAllMines();

    document.getElementById('btn-start-game').disabled = false;
    document.getElementById('btn-cashout').disabled = true;
    document.getElementById('bet-input').disabled = false;
    document.getElementById('mines-select').disabled = false;

    const profit = payout - this.bet;
    document.getElementById('modal-icon').textContent = '💰';
    document.getElementById('modal-title').textContent = 'CASHOUT SUCCESSFUL!';
    document.getElementById('modal-desc').textContent = `Ejected at ${this.currentMultiplier.toFixed(2)}x multiplier!`;
    document.getElementById('modal-stat-val').textContent = `+${profit.toLocaleString()} 🪙`;
    document.getElementById('modal-overlay').classList.remove('hidden');

    this.updateHUD();
    this.save();
  }

  onDetonation(hitTile) {
    this.isPlaying = false;
    this.audio.playExplosion();
    hitTile.el.classList.add('revealed-mine');
    hitTile.el.textContent = '💣';

    this.revealAllMines();

    document.getElementById('btn-start-game').disabled = false;
    document.getElementById('btn-cashout').disabled = true;
    document.getElementById('bet-input').disabled = false;
    document.getElementById('mines-select').disabled = false;

    document.getElementById('modal-icon').textContent = '💥';
    document.getElementById('modal-title').textContent = 'EMP DETONATION!';
    document.getElementById('modal-desc').textContent = `You triggered a hidden mine and lost your wager.`;
    document.getElementById('modal-stat-val').textContent = `-${this.bet.toLocaleString()} 🪙`;
    document.getElementById('modal-overlay').classList.remove('hidden');

    this.updateHUD();
    this.save();
  }

  revealAllMines() {
    this.grid.forEach(t => {
      if (t.isMine && !t.isRevealed) {
        t.el.textContent = '💣';
        t.el.classList.add('revealed-mine');
      } else if (!t.isMine && !t.isRevealed) {
        t.el.textContent = '💎';
        t.el.classList.add('disabled');
      }
    });
  }

  save() {
    localStorage.setItem('omniverse_coins', this.credits.toString());

    if (window.parent && window.parent !== window) {
      try {
        window.parent.postMessage({
          game: 'cyber-mines',
          score: this.credits
        }, '*');
      } catch (e) {}
    }
  }

  updateHUD() {
    document.getElementById('credits-val').textContent = `${this.credits.toLocaleString()} 🪙`;
    const totalGems = 25 - this.mineCount;
    document.getElementById('gems-val').textContent = `${this.gemsRevealed} / ${totalGems}`;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.minesGame = new CyberMines();
});
