/**
 * Neon Roulette: Quantum Wheel — Decision Risk Engine
 */

class RouletteAudioEngine {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.isBGMPlaying = false;
    this.bgmTimer = null;
    this.step = 0;
    this.tempo = 124;

    // Sleek Lounge Synthwave Chords: Dm9, Gm7, C7, Fmaj7
    this.chords = [
      [146.83, 174.61, 220.00, 261.63], // Dm9
      [98.00, 116.54, 146.83, 174.61],  // Gm7
      [130.81, 164.81, 196.00, 233.08], // C7
      [174.61, 220.00, 261.63, 329.63]  // Fmaj7
    ];
    this.bassNotes = [73.42, 49.00, 65.41, 87.31];
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
        osc.type = 'sine';
        osc.frequency.setValueAtTime(bass * 1.5, now);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.connect(gain);
        gain.connect(this.masterGain || this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.2);
      } catch(e) {}
    }

    if (step % 4 === 2) {
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        const chord = this.chords[bar % this.chords.length];
        osc.frequency.setValueAtTime(chord[2], now);
        gain.gain.setValueAtTime(0.025, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.connect(gain);
        gain.connect(this.masterGain || this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.2);
      } catch(e) {}
    }
  }

  playBallTick() {
    if (!this.enabled || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800 + Math.random() * 200, now);
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
      osc.connect(gain);
      gain.connect(this.masterGain || this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.03);
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

const ROULETTE_NUMBERS = [
  { num: 0, color: 'green' },
  { num: 1, color: 'red' },
  { num: 2, color: 'black' },
  { num: 3, color: 'red' },
  { num: 4, color: 'black' },
  { num: 5, color: 'red' },
  { num: 6, color: 'black' },
  { num: 7, color: 'red' },
  { num: 8, color: 'black' },
  { num: 9, color: 'red' },
  { num: 10, color: 'black' },
  { num: 11, color: 'black' },
  { num: 12, color: 'red' }
];

class CyberRoulette {
  constructor() {
    this.canvas = document.getElementById('rouletteCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.w = this.canvas.width;
    this.h = this.canvas.height;

    this.audio = new RouletteAudioEngine();

    this.credits = parseInt(localStorage.getItem('omniverse_coins') || '1000', 10);
    this.selectedChip = 10;
    this.bets = {}; // key: betKey, val: amount
    this.totalBet = 0;
    this.lastWin = 0;

    this.wheelAngle = 0;
    this.wheelSpeed = 0;
    this.ballAngle = 0;
    this.ballSpeed = 0;
    this.ballRadius = 90;
    this.isSpinning = false;
    this.winningPocket = null;

    this.initUI();
    this.loop();
  }

  initUI() {
    window.focus();
    window.addEventListener('click', () => window.focus());

    // Chip selection
    document.querySelectorAll('.chip-val-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.chip-val-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        this.selectedChip = parseInt(e.target.dataset.chip, 10);
      });
    });

    // Populate Numbers 1-12 grid
    const numGrid = document.getElementById('numbers-grid');
    numGrid.innerHTML = '';
    for (let i = 1; i <= 12; i++) {
      const isRed = ROULETTE_NUMBERS.find(n => n.num === i).color === 'red';
      const btn = document.createElement('button');
      btn.className = `num-spot-btn ${isRed ? 'num-red' : 'num-black'}`;
      btn.textContent = i;
      btn.dataset.type = 'num';
      btn.dataset.val = i;
      btn.addEventListener('click', () => this.placeBet(`num_${i}`));
      numGrid.appendChild(btn);
    }

    // Outside Bets
    document.querySelectorAll('.bet-spot-btn, .num-spot-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const type = e.currentTarget.dataset.type;
        const val = e.currentTarget.dataset.val;
        const key = type === 'num' ? `num_${val}` : type;
        this.placeBet(key);
      });
    });

    document.getElementById('btn-clear-bets').addEventListener('click', () => this.clearBets());
    document.getElementById('btn-spin-wheel').addEventListener('click', () => this.spin());

    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        this.spin();
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

    document.getElementById('modal-btn-restart').addEventListener('click', () => {
      document.getElementById('modal-overlay').classList.add('hidden');
    });

    this.updateHUD();
  }

  placeBet(key) {
    if (this.isSpinning) return;
    if (this.credits < this.selectedChip) {
      alert('Insufficient credits for this chip!');
      return;
    }

    this.credits -= this.selectedChip;
    this.bets[key] = (this.bets[key] || 0) + this.selectedChip;
    this.totalBet += this.selectedChip;

    this.renderBetBadges();
    this.updateHUD();
    this.save();
  }

  clearBets() {
    if (this.isSpinning) return;
    this.credits += this.totalBet;
    this.bets = {};
    this.totalBet = 0;
    this.renderBetBadges();
    this.updateHUD();
    this.save();
  }

  renderBetBadges() {
    document.querySelectorAll('.bet-badge').forEach(el => el.remove());

    Object.keys(this.bets).forEach(key => {
      const amt = this.bets[key];
      if (amt <= 0) return;

      let targetBtn = null;
      if (key.startsWith('num_')) {
        const num = key.replace('num_', '');
        targetBtn = document.querySelector(`.num-spot-btn[data-val="${num}"]`);
      } else {
        targetBtn = document.querySelector(`.bet-spot-btn[data-type="${key}"]`);
      }

      if (targetBtn) {
        const badge = document.createElement('span');
        badge.className = 'bet-badge';
        badge.textContent = `${amt}`;
        targetBtn.appendChild(badge);
      }
    });
  }

  spin() {
    if (this.isSpinning || this.totalBet === 0) {
      if (this.totalBet === 0) alert('Place a bet on the table first!');
      return;
    }

    this.isSpinning = true;
    this.wheelSpeed = 0.18 + Math.random() * 0.05;
    this.ballSpeed = -0.28 - Math.random() * 0.06;
    this.ballRadius = 105;

    document.getElementById('btn-spin-wheel').disabled = true;
    document.getElementById('btn-clear-bets').disabled = true;
  }

  loop() {
    this.update();
    this.render();
    requestAnimationFrame(() => this.loop());
  }

  update() {
    if (this.isSpinning) {
      this.wheelAngle += this.wheelSpeed;
      this.ballAngle += this.ballSpeed;

      // Friction
      this.wheelSpeed *= 0.992;
      this.ballSpeed *= 0.988;

      if (Math.abs(this.ballSpeed) < 0.12 && this.ballRadius > 78) {
        this.ballRadius -= 0.3;
        this.audio.playBallTick();
      }

      if (Math.abs(this.ballSpeed) < 0.005) {
        this.onSpinEnd();
      }
    }
  }

  onSpinEnd() {
    this.isSpinning = false;
    this.wheelSpeed = 0;
    this.ballSpeed = 0;

    // Calculate Winning Pocket
    const sliceAngle = (Math.PI * 2) / ROULETTE_NUMBERS.length;
    // Relative angle of ball on the rotating wheel
    let relAngle = (this.ballAngle - this.wheelAngle) % (Math.PI * 2);
    if (relAngle < 0) relAngle += Math.PI * 2;

    const pocketIdx = Math.floor(relAngle / sliceAngle) % ROULETTE_NUMBERS.length;
    this.winningPocket = ROULETTE_NUMBERS[pocketIdx];

    // Calculate Payout
    let totalPayout = 0;
    const winNum = this.winningPocket.num;
    const winColor = this.winningPocket.color;

    // Number Bet (14x)
    if (this.bets[`num_${winNum}`]) {
      totalPayout += this.bets[`num_${winNum}`] * 14;
    }
    // Red / Black (2x)
    if (winColor === 'red' && this.bets['red']) totalPayout += this.bets['red'] * 2;
    if (winColor === 'black' && this.bets['black']) totalPayout += this.bets['black'] * 2;
    // Even / Odd (2x)
    if (winNum > 0) {
      if (winNum % 2 === 0 && this.bets['even']) totalPayout += this.bets['even'] * 2;
      if (winNum % 2 !== 0 && this.bets['odd']) totalPayout += this.bets['odd'] * 2;
      if (winNum <= 6 && this.bets['low']) totalPayout += this.bets['low'] * 2;
      if (winNum > 6 && this.bets['high']) totalPayout += this.bets['high'] * 2;
    }

    this.credits += totalPayout;
    this.lastWin = totalPayout;
    if (totalPayout > 0) this.audio.playWin();

    this.bets = {};
    this.totalBet = 0;
    this.renderBetBadges();

    document.getElementById('btn-spin-wheel').disabled = false;
    document.getElementById('btn-clear-bets').disabled = false;

    // Modal
    document.getElementById('modal-title').textContent = totalPayout > 0 ? 'WINNING SPIN!' : 'NO WIN';
    document.getElementById('modal-desc').textContent = `Ball landed on #${winNum} ${winColor.toUpperCase()}`;
    document.getElementById('modal-payout').textContent = `+${totalPayout.toLocaleString()} 🪙`;
    document.getElementById('modal-overlay').classList.remove('hidden');

    this.updateHUD();
    this.save();
  }

  save() {
    localStorage.setItem('omniverse_coins', this.credits.toString());

    if (window.parent && window.parent !== window) {
      try {
        window.parent.postMessage({
          game: 'cyber-roulette',
          score: this.credits
        }, '*');
      } catch (e) {}
    }
  }

  updateHUD() {
    document.getElementById('credits-val').textContent = `${this.credits.toLocaleString()} 🪙`;
    document.getElementById('total-bet-val').textContent = `${this.totalBet.toLocaleString()} 🪙`;
    document.getElementById('last-win-val').textContent = `+${this.lastWin.toLocaleString()} 🪙`;
  }

  render() {
    this.ctx.fillStyle = '#02040a';
    this.ctx.fillRect(0, 0, this.w, this.h);

    const cx = this.w / 2;
    const cy = this.h / 2;
    const radius = 100;
    const sliceAngle = (Math.PI * 2) / ROULETTE_NUMBERS.length;

    // Wheel
    this.ctx.save();
    this.ctx.translate(cx, cy);
    this.ctx.rotate(this.wheelAngle);

    // Rim
    this.ctx.strokeStyle = '#38bdf8';
    this.ctx.lineWidth = 4;
    this.ctx.shadowColor = '#00f3ff';
    this.ctx.shadowBlur = 15;
    this.ctx.beginPath();
    this.ctx.arc(0, 0, radius + 15, 0, Math.PI * 2);
    this.ctx.stroke();
    this.ctx.shadowBlur = 0;

    // Pockets
    ROULETTE_NUMBERS.forEach((p, idx) => {
      const a1 = idx * sliceAngle;
      const a2 = (idx + 1) * sliceAngle;

      this.ctx.fillStyle = p.color === 'green' ? '#047857' : (p.color === 'red' ? '#b91c1c' : '#0f172a');
      this.ctx.beginPath();
      this.ctx.moveTo(0, 0);
      this.ctx.arc(0, 0, radius, a1, a2);
      this.ctx.closePath();
      this.ctx.fill();

      this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      this.ctx.stroke();

      // Number Label
      this.ctx.save();
      const midA = a1 + sliceAngle / 2;
      this.ctx.rotate(midA);
      this.ctx.font = '900 11px "Orbitron", sans-serif';
      this.ctx.fillStyle = '#ffffff';
      this.ctx.textAlign = 'right';
      this.ctx.fillText(`${p.num}`, radius - 8, 4);
      this.ctx.restore();
    });

    // Center Hub
    this.ctx.fillStyle = '#1e293b';
    this.ctx.beginPath();
    this.ctx.arc(0, 0, 24, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.restore();

    // Ball
    const bx = cx + Math.cos(this.ballAngle) * this.ballRadius;
    const by = cy + Math.sin(this.ballAngle) * this.ballRadius;

    this.ctx.fillStyle = '#ffffff';
    this.ctx.shadowColor = '#00f3ff';
    this.ctx.shadowBlur = 10;
    this.ctx.beginPath();
    this.ctx.arc(bx, by, 5, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.shadowBlur = 0;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.rouletteGame = new CyberRoulette();
});
