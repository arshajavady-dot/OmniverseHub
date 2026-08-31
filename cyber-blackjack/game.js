/**
 * Cyber 21: Neural Blackjack — Decision Risk Engine
 */

class BlackjackAudioEngine {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.isBGMPlaying = false;
    this.bgmTimer = null;
    this.step = 0;
    this.tempo = 120;

    // Smooth Neon Jazz-Hop Chords: Dm9, G13, Cmaj9, A7alt
    this.chords = [
      [146.83, 174.61, 220.00, 261.63], // Dm9
      [98.00, 123.47, 164.81, 220.00],  // G13
      [130.81, 164.81, 196.00, 246.94], // Cmaj9
      [110.00, 138.59, 174.61, 207.65]  // A7alt
    ];
    this.bassNotes = [73.42, 49.00, 65.41, 55.00];
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
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(bass * 1.5, now);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
        osc.connect(gain);
        gain.connect(this.masterGain || this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.22);
      } catch(e) {}
    }

    if (step % 4 === 2) {
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        const chord = this.chords[bar % this.chords.length];
        osc.frequency.setValueAtTime(chord[2], now);
        gain.gain.setValueAtTime(0.03, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.connect(gain);
        gain.connect(this.masterGain || this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.25);
      } catch(e) {}
    }
  }

  playCard() {
    if (!this.enabled || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(200, now + 0.06);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
      osc.connect(gain);
      gain.connect(this.masterGain || this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.06);
    } catch(e) {}
  }

  playWin() {
    if (!this.enabled || !this.ctx) return;
    try {
      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((f, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const now = this.ctx.currentTime + i * 0.07;
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, now);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.connect(gain);
        gain.connect(this.masterGain || this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.25);
      });
    } catch(e) {}
  }

  playBust() {
    if (!this.enabled || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(200, now);
      osc.frequency.exponentialRampToValueAtTime(50, now + 0.3);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.connect(gain);
      gain.connect(this.masterGain || this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.35);
    } catch(e) {}
  }
}

const SUITS = ['♠', '♥', '♦', '♣'];
const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

class CyberBlackjack {
  constructor() {
    this.audio = new BlackjackAudioEngine();

    this.credits = parseInt(localStorage.getItem('omniverse_coins') || '1000', 10);
    this.currentBet = 50;
    this.streak = 0;
    this.inRound = false;

    this.deck = [];
    this.playerHand = [];
    this.dealerHand = [];
    this.dealerHoleCardHidden = true;

    this.initUI();
    this.resetTable();
  }

  initUI() {
    window.focus();
    window.addEventListener('click', () => window.focus());

    // Chip buttons
    document.querySelectorAll('.chip-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        if (this.inRound) return;
        const add = parseInt(e.target.dataset.val, 10);
        if (this.currentBet + add <= this.credits) {
          this.currentBet += add;
          this.updateHUD();
        }
      });
    });

    document.getElementById('btn-clear-wager').addEventListener('click', () => {
      if (this.inRound) return;
      this.currentBet = 10;
      this.updateHUD();
    });

    // Action buttons
    document.getElementById('btn-deal').addEventListener('click', () => this.deal());
    document.getElementById('btn-hit').addEventListener('click', () => this.hit());
    document.getElementById('btn-stand').addEventListener('click', () => this.stand());
    document.getElementById('btn-double').addEventListener('click', () => this.doubleDown());

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

    this.updateHUD();
  }

  buildDeck() {
    this.deck = [];
    for (let s of SUITS) {
      for (let r of RANKS) {
        let val = parseInt(r, 10);
        if (['J', 'Q', 'K'].includes(r)) val = 10;
        if (r === 'A') val = 11;
        this.deck.push({ rank: r, suit: s, val });
      }
    }
    // Shuffle
    for (let i = this.deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
    }
  }

  drawCard() {
    if (this.deck.length < 10) this.buildDeck();
    return this.deck.pop();
  }

  getHandScore(hand) {
    let score = 0;
    let aces = 0;
    hand.forEach(c => {
      score += c.val;
      if (c.rank === 'A') aces++;
    });
    while (score > 21 && aces > 0) {
      score -= 10;
      aces--;
    }
    return score;
  }

  resetTable() {
    this.inRound = false;
    this.playerHand = [];
    this.dealerHand = [];
    this.dealerHoleCardHidden = true;

    document.getElementById('btn-deal').disabled = false;
    document.getElementById('btn-hit').disabled = true;
    document.getElementById('btn-stand').disabled = true;
    document.getElementById('btn-double').disabled = true;

    this.renderHands();
  }

  deal() {
    if (this.currentBet > this.credits) {
      alert('Insufficient credits!');
      return;
    }

    this.credits -= this.currentBet;
    this.inRound = true;
    this.buildDeck();
    this.playerHand = [this.drawCard(), this.drawCard()];
    this.dealerHand = [this.drawCard(), this.drawCard()];
    this.dealerHoleCardHidden = true;
    this.audio.playCard();

    document.getElementById('btn-deal').disabled = true;
    document.getElementById('btn-hit').disabled = false;
    document.getElementById('btn-stand').disabled = false;
    document.getElementById('btn-double').disabled = this.credits < this.currentBet;

    document.getElementById('status-banner').textContent = 'HIT, STAND, OR DOUBLE DOWN';

    const pScore = this.getHandScore(this.playerHand);
    if (pScore === 21) {
      // Natural Blackjack
      this.dealerHoleCardHidden = false;
      this.finishRound();
    }

    this.renderHands();
    this.updateHUD();
    this.save();
  }

  hit() {
    if (!this.inRound) return;
    this.playerHand.push(this.drawCard());
    this.audio.playCard();
    document.getElementById('btn-double').disabled = true;

    const score = this.getHandScore(this.playerHand);
    if (score > 21) {
      // Bust
      this.audio.playBust();
      this.dealerHoleCardHidden = false;
      this.streak = 0;
      document.getElementById('status-banner').textContent = 'NEURAL BUST! (-' + this.currentBet + ' 🪙)';
      this.endGame();
    } else if (score === 21) {
      this.stand();
    }

    this.renderHands();
    this.updateHUD();
  }

  doubleDown() {
    if (!this.inRound || this.credits < this.currentBet) return;
    this.credits -= this.currentBet;
    this.currentBet *= 2;
    this.playerHand.push(this.drawCard());
    this.audio.playCard();

    this.dealerHoleCardHidden = false;
    const score = this.getHandScore(this.playerHand);
    if (score > 21) {
      this.audio.playBust();
      this.streak = 0;
      document.getElementById('status-banner').textContent = 'BUSTED ON DOUBLE DOWN! (-' + this.currentBet + ' 🪙)';
      this.endGame();
    } else {
      this.dealerPlay();
    }

    this.renderHands();
    this.updateHUD();
    this.save();
  }

  stand() {
    if (!this.inRound) return;
    this.dealerHoleCardHidden = false;
    this.dealerPlay();
  }

  dealerPlay() {
    while (this.getHandScore(this.dealerHand) < 17) {
      this.dealerHand.push(this.drawCard());
      this.audio.playCard();
    }
    this.finishRound();
  }

  finishRound() {
    const pScore = this.getHandScore(this.playerHand);
    const dScore = this.getHandScore(this.dealerHand);

    let result = '';
    let payout = 0;

    const isPlayerBJ = pScore === 21 && this.playerHand.length === 2;
    const isDealerBJ = dScore === 21 && this.dealerHand.length === 2;

    if (isPlayerBJ && !isDealerBJ) {
      payout = Math.floor(this.currentBet * 2.5); // 3:2 payout
      result = `NATURAL BLACKJACK! (+${payout - this.currentBet} 🪙)`;
      this.streak++;
      this.audio.playWin();
    } else if (pScore > 21) {
      result = `BUST! (-${this.currentBet} 🪙)`;
      this.streak = 0;
      this.audio.playBust();
    } else if (dScore > 21) {
      payout = this.currentBet * 2;
      result = `DEALER BUST! PLAYER WINS (+${this.currentBet} 🪙)`;
      this.streak++;
      this.audio.playWin();
    } else if (pScore > dScore) {
      payout = this.currentBet * 2;
      result = `PLAYER WINS ${pScore} vs ${dScore}! (+${this.currentBet} 🪙)`;
      this.streak++;
      this.audio.playWin();
    } else if (pScore < dScore) {
      result = `DEALER WINS ${dScore} vs ${pScore}! (-${this.currentBet} 🪙)`;
      this.streak = 0;
      this.audio.playBust();
    } else {
      payout = this.currentBet; // Push
      result = `PUSH! WAGER RETURNED (${pScore} vs ${dScore})`;
    }

    this.credits += payout;
    document.getElementById('status-banner').textContent = result;
    this.endGame();
  }

  endGame() {
    this.inRound = false;
    document.getElementById('btn-deal').disabled = false;
    document.getElementById('btn-hit').disabled = true;
    document.getElementById('btn-stand').disabled = true;
    document.getElementById('btn-double').disabled = true;

    this.renderHands();
    this.updateHUD();
    this.save();
  }

  renderHands() {
    const dCardsEl = document.getElementById('dealer-cards');
    const pCardsEl = document.getElementById('player-cards');
    dCardsEl.innerHTML = '';
    pCardsEl.innerHTML = '';

    // Dealer Cards
    this.dealerHand.forEach((c, idx) => {
      const cardEl = document.createElement('div');
      if (idx === 1 && this.dealerHoleCardHidden) {
        cardEl.className = 'cyber-card hidden-card';
        cardEl.innerHTML = `<span class="card-val">?</span><span class="card-suit">🤖</span><span class="card-val">?</span>`;
      } else {
        const isRed = ['♥', '♦'].includes(c.suit);
        cardEl.className = 'cyber-card';
        cardEl.innerHTML = `
          <span class="card-val ${isRed ? 'card-red' : 'card-cyan'}">${c.rank}</span>
          <span class="card-suit ${isRed ? 'card-red' : 'card-cyan'}">${c.suit}</span>
          <span class="card-val ${isRed ? 'card-red' : 'card-cyan'}">${c.rank}</span>
        `;
      }
      dCardsEl.appendChild(cardEl);
    });

    // Player Cards
    this.playerHand.forEach(c => {
      const cardEl = document.createElement('div');
      const isRed = ['♥', '♦'].includes(c.suit);
      cardEl.className = 'cyber-card';
      cardEl.innerHTML = `
        <span class="card-val ${isRed ? 'card-red' : 'card-cyan'}">${c.rank}</span>
        <span class="card-suit ${isRed ? 'card-red' : 'card-cyan'}">${c.suit}</span>
        <span class="card-val ${isRed ? 'card-red' : 'card-cyan'}">${c.rank}</span>
      `;
      pCardsEl.appendChild(cardEl);
    });

    const pScore = this.getHandScore(this.playerHand);
    document.getElementById('player-score-lbl').textContent = pScore;

    if (this.dealerHoleCardHidden && this.dealerHand.length > 0) {
      document.getElementById('dealer-score-lbl').textContent = `${this.dealerHand[0].val}+?`;
    } else {
      document.getElementById('dealer-score-lbl').textContent = this.getHandScore(this.dealerHand);
    }
  }

  save() {
    localStorage.setItem('omniverse_coins', this.credits.toString());

    if (window.parent && window.parent !== window) {
      try {
        window.parent.postMessage({
          game: 'cyber-blackjack',
          score: this.credits
        }, '*');
      } catch (e) {}
    }
  }

  updateHUD() {
    document.getElementById('credits-val').textContent = `${this.credits.toLocaleString()} 🪙`;
    document.getElementById('bet-val').textContent = `${this.currentBet.toLocaleString()} 🪙`;
    document.getElementById('streak-val').textContent = `${this.streak} 🔥`;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.blackjackGame = new CyberBlackjack();
});
