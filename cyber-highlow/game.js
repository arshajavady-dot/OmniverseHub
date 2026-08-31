/**
 * Cyber High-Low: Neon Stakes — Decision Game Engine with Electro Casino Soundtrack
 */

const SUITS = [
  { icon: '🔷', name: 'diamonds', color: '#00f3ff' },
  { icon: '💖', name: 'hearts', color: '#ff0055' },
  { icon: '🍀', name: 'clubs', color: '#00ff66' },
  { icon: '⚡', name: 'spades', color: '#facc15' }
];

const RANKS = [
  { val: 2, label: '2' },
  { val: 3, label: '3' },
  { val: 4, label: '4' },
  { val: 5, label: '5' },
  { val: 6, label: '6' },
  { val: 7, label: '7' },
  { val: 8, label: '8' },
  { val: 9, label: '9' },
  { val: 10, label: '10' },
  { val: 11, label: 'J' },
  { val: 12, label: 'Q' },
  { val: 13, label: 'K' },
  { val: 14, label: 'A' }
];

class CasinoAudioEngine {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.isBGMPlaying = false;
    this.bgmTimer = null;
    this.step = 0;
    this.tempo = 124;

    // Upbeat Electro-Casino Funk: G#m, E, B, F#
    this.chords = [
      [207.65, 246.94, 311.13], // G#m
      [164.81, 207.65, 246.94], // E
      [246.94, 311.13, 370.00], // B
      [185.00, 233.08, 277.18]  // F#
    ];
    this.bassNotes = [103.83, 82.41, 123.47, 92.50];
    this.arpOffsets = [0, 7, 12, 14, 12, 7, 14, 7];

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

    // 1. Slap Synth Bass
    if (step % 4 === 0) {
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(bass, now);
        gain.gain.setValueAtTime(0.07, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.connect(gain);
        gain.connect(this.masterGain || this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.2);
      } catch(e) {}
    }

    // 2. Neon Arpeggiator
    if (step % 2 === 0) {
      try {
        const arpIdx = (step / 2) % this.arpOffsets.length;
        const freq = chord[0] * Math.pow(2, this.arpOffsets[arpIdx] / 12) * 1.5;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(0.025, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc.connect(gain);
        gain.connect(this.masterGain || this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.12);
      } catch(e) {}
    }
  }

  playCardFlip() {
    if (!this.enabled || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(200, now + 0.08);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.connect(gain);
      gain.connect(this.masterGain || this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.08);
    } catch(e) {}
  }

  playWin() {
    if (!this.enabled || !this.ctx) return;
    try {
      const notes = [587.33, 739.99, 880.00, 1174.66];
      notes.forEach((f, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const now = this.ctx.currentTime + i * 0.08;
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, now);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.connect(gain);
        gain.connect(this.masterGain || this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.25);
      });
    } catch(e) {}
  }

  playLoss() {
    if (!this.enabled || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(60, now + 0.35);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.connect(gain);
      gain.connect(this.masterGain || this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.35);
    } catch(e) {}
  }
}

class CyberHighLow {
  constructor() {
    this.credits = parseInt(localStorage.getItem('cyber_hl_credits') || '1000', 10);
    this.bet = 50;
    this.currentCard = null;
    this.nextCard = null;
    this.streak = 0;
    this.pot = 0;
    this.history = [];
    this.isResolving = false;

    this.audio = new CasinoAudioEngine();
    this.initUI();
    this.dealInitialCard();
  }

  initUI() {
    window.focus();
    window.addEventListener('click', () => window.focus());

    // Bet chips
    document.querySelectorAll('.bet-chip').forEach(btn => {
      btn.addEventListener('click', (e) => {
        if (this.streak > 0) return; // Locked during active round
        document.querySelectorAll('.bet-chip').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        this.bet = parseInt(e.target.dataset.bet, 10);
      });
    });

    // Decision buttons
    document.getElementById('btn-higher').addEventListener('click', () => this.makeDecision('higher'));
    document.getElementById('btn-lower').addEventListener('click', () => this.makeDecision('lower'));
    document.getElementById('btn-cashout').addEventListener('click', () => this.cashOut());

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
  }

  getRandomCard() {
    const rank = RANKS[Math.floor(Math.random() * RANKS.length)];
    const suit = SUITS[Math.floor(Math.random() * SUITS.length)];
    return { rank, suit };
  }

  dealInitialCard() {
    this.currentCard = this.getRandomCard();
    this.renderCard(this.currentCard, 'current-card');
    this.resetMysteryCard();
  }

  resetMysteryCard() {
    const nextEl = document.getElementById('next-card');
    nextEl.className = 'cyber-card card-facedown';
    nextEl.innerHTML = `
      <div class="card-back-pattern">
        <span class="cyber-logo">⚛️</span>
        <span class="back-text">CYBER-DECK</span>
      </div>
    `;
  }

  async makeDecision(choice) {
    if (this.isResolving) return;

    if (this.streak === 0) {
      if (this.credits < this.bet) {
        alert('Insufficient credits! Recharging credits to 500.');
        this.credits = 500;
        this.updateStatsUI();
        return;
      }
      this.credits -= this.bet;
      this.pot = this.bet;
    }

    this.isResolving = true;
    this.audio.playCardFlip();

    // Generate next card (ensure not exactly equal value for cleaner high/low outcome)
    do {
      this.nextCard = this.getRandomCard();
    } while (this.nextCard.rank.val === this.currentCard.rank.val);

    // Render mystery card face up with flip animation
    this.renderCard(this.nextCard, 'next-card');
    const nextEl = document.getElementById('next-card');
    nextEl.classList.add('card-flip');

    await this.delay(350);

    const isHigher = this.nextCard.rank.val > this.currentCard.rank.val;
    const won = (choice === 'higher' && isHigher) || (choice === 'lower' && !isHigher);

    this.history.unshift(this.currentCard);
    if (this.history.length > 8) this.history.pop();
    this.renderHistory();

    if (won) {
      this.streak++;
      this.audio.playWin();

      // Multiplier progression: 1.5x -> 2.2x -> 3.5x -> 5x -> 8x -> 15x
      const mults = [1.5, 2.2, 3.2, 5.0, 8.0, 15.0];
      const mult = mults[Math.min(this.streak - 1, mults.length - 1)];
      this.pot = Math.round(this.bet * mult);

      document.getElementById('multiplier-badge').textContent = `${mult.toFixed(1)}x`;
      this.updateStatsUI();

      await this.delay(600);

      // Advance next card to current card
      this.currentCard = this.nextCard;
      this.renderCard(this.currentCard, 'current-card');
      this.resetMysteryCard();
    } else {
      this.audio.playLoss();
      this.streak = 0;
      this.pot = 0;
      this.updateStatsUI();

      await this.delay(800);
      this.dealInitialCard();
    }

    this.isResolving = false;
  }

  cashOut() {
    if (this.pot <= 0 || this.isResolving) return;

    this.audio.playWin();
    this.credits += this.pot;
    const wonPot = this.pot;
    this.streak = 0;
    this.pot = 0;
    this.updateStatsUI();

    localStorage.setItem('cyber_hl_credits', this.credits.toString());

    // Post to parent arcade suite
    if (window.parent && window.parent !== window) {
      try {
        window.parent.postMessage({
          game: 'cyber-highlow',
          score: wonPot
        }, '*');
      } catch (e) {}
    }

    this.dealInitialCard();
  }

  updateStatsUI() {
    document.getElementById('credits-val').textContent = this.credits.toLocaleString();
    document.getElementById('streak-val').textContent = `x${this.streak}`;
    document.getElementById('pot-val').textContent = this.pot.toLocaleString();
    document.getElementById('cashout-val').textContent = this.pot.toLocaleString();

    const cashoutBtn = document.getElementById('btn-cashout');
    cashoutBtn.disabled = this.pot <= 0;
  }

  renderCard(card, elementId) {
    const el = document.getElementById(elementId);
    el.className = 'cyber-card card-glow-cyan';
    el.innerHTML = `
      <div class="card-corner top-left">
        <span class="card-rank">${card.rank.label}</span>
        <span class="card-suit">${card.suit.icon}</span>
      </div>
      <div class="card-center">
        <span class="card-large-icon">${card.suit.icon}</span>
      </div>
      <div class="card-corner bottom-right">
        <span class="card-rank">${card.rank.label}</span>
        <span class="card-suit">${card.suit.icon}</span>
      </div>
    `;
  }

  renderHistory() {
    const container = document.getElementById('history-pills');
    container.innerHTML = '';
    this.history.forEach(c => {
      const pill = document.createElement('span');
      pill.className = 'history-pill';
      pill.innerHTML = `<span>${c.rank.label}</span><span>${c.suit.icon}</span>`;
      container.appendChild(pill);
    });
  }

  delay(ms) {
    return new Promise(res => setTimeout(res, ms));
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.highLowGame = new CyberHighLow();
});
