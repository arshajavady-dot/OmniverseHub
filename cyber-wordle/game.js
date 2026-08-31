/**
 * Cyber Wordle: Terminal Decryptor — Word Logic Engine
 */

class WordleAudioEngine {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.isBGMPlaying = false;
    this.bgmTimer = null;
    this.step = 0;
    this.tempo = 110;

    // Lo-Fi Synthwave Chillhop Chords: Cmaj7, Am7, Dm7, G7
    this.chords = [
      [130.81, 164.81, 196.00, 246.94], // Cmaj7
      [110.00, 130.81, 164.81, 196.00], // Am7
      [146.83, 174.61, 220.00, 261.63], // Dm7
      [98.00, 123.47, 146.83, 174.61]   // G7
    ];
    this.bassNotes = [65.41, 55.00, 73.42, 49.00];
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
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.connect(gain);
        gain.connect(this.masterGain || this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.3);
      } catch(e) {}
    }

    if (step % 8 === 2) {
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(chord[2] * 2, now);
        gain.gain.setValueAtTime(0.03, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        osc.connect(gain);
        gain.connect(this.masterGain || this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.4);
      } catch(e) {}
    }
  }

  playKey() {
    if (!this.enabled || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      gain.gain.setValueAtTime(0.03, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      osc.connect(gain);
      gain.connect(this.masterGain || this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.04);
    } catch(e) {}
  }

  playReveal(isCorrect) {
    if (!this.enabled || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(isCorrect ? 659.25 : 329.63, now);
      gain.gain.setValueAtTime(0.07, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.connect(gain);
      gain.connect(this.masterGain || this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.12);
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

const CYBER_WORDS = [
  'CYBER', 'ROBOT', 'LASER', 'PULSE', 'NEXUS',
  'RADAR', 'GHOST', 'CHIPS', 'LOGIC', 'DRONE',
  'PROXY', 'POWER', 'FIBER', 'MATRIX', 'SOLAR',
  'TURBO', 'VIRUS', 'MODEM', 'NODES', 'BLOCK'
];

class CyberWordle {
  constructor() {
    this.audio = new WordleAudioEngine();

    this.secretWord = '';
    this.currentRow = 0;
    this.currentCol = 0;
    this.grid = []; // 6 rows of 5 tiles
    this.currentGuess = '';
    this.gameOver = false;
    this.solvedCount = parseInt(localStorage.getItem('cyber_wordle_solved') || '0', 10);
    this.streak = parseInt(localStorage.getItem('cyber_wordle_streak') || '0', 10);

    this.initUI();
    this.restart();
  }

  initUI() {
    window.focus();
    window.addEventListener('click', () => window.focus());

    // Physical Keyboard listener
    window.addEventListener('keydown', (e) => {
      if (this.gameOver) return;
      if (e.key === 'Enter') {
        this.submitGuess();
      } else if (e.key === 'Backspace') {
        this.deleteLetter();
      } else if (/^[a-zA-Z]$/.test(e.key)) {
        this.addLetter(e.key.toUpperCase());
      }
    });

    // Virtual Keyboard
    this.buildVirtualKeyboard();

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

  buildVirtualKeyboard() {
    const layout = [
      ['Q','W','E','R','T','Y','U','I','O','P'],
      ['A','S','D','F','G','H','J','K','L'],
      ['ENTER','Z','X','C','V','B','N','M','⌫']
    ];

    const wrap = document.getElementById('keyboard-container');
    wrap.innerHTML = '';

    layout.forEach(row => {
      const rowEl = document.createElement('div');
      rowEl.className = 'kb-row';
      row.forEach(key => {
        const btn = document.createElement('button');
        btn.className = `kb-key ${key.length > 1 ? 'wide' : ''}`;
        btn.textContent = key;
        btn.dataset.key = key;

        btn.addEventListener('click', () => {
          if (this.gameOver) return;
          if (key === 'ENTER') this.submitGuess();
          else if (key === '⌫') this.deleteLetter();
          else this.addLetter(key);
        });

        rowEl.appendChild(btn);
      });
      wrap.appendChild(rowEl);
    });
  }

  restart() {
    this.secretWord = CYBER_WORDS[Math.floor(Math.random() * CYBER_WORDS.length)];
    this.currentRow = 0;
    this.currentCol = 0;
    this.currentGuess = '';
    this.gameOver = false;

    // Reset grid
    const gridEl = document.getElementById('wordle-grid');
    gridEl.innerHTML = '';
    this.grid = [];

    for (let r = 0; r < 6; r++) {
      const rowEl = document.createElement('div');
      rowEl.className = 'wordle-row';
      const rowTiles = [];

      for (let c = 0; c < 5; c++) {
        const tile = document.createElement('div');
        tile.className = 'tile';
        rowEl.appendChild(tile);
        rowTiles.push(tile);
      }
      gridEl.appendChild(rowEl);
      this.grid.push(rowTiles);
    }

    // Reset virtual keyboard keys
    document.querySelectorAll('.kb-key').forEach(k => {
      k.classList.remove('correct', 'present', 'absent');
    });

    document.getElementById('modal-overlay').classList.add('hidden');
    this.updateHUD();
  }

  addLetter(letter) {
    if (this.currentCol < 5) {
      this.grid[this.currentRow][this.currentCol].textContent = letter;
      this.grid[this.currentRow][this.currentCol].classList.add('filled');
      this.currentGuess += letter;
      this.currentCol++;
      this.audio.playKey();
    }
  }

  deleteLetter() {
    if (this.currentCol > 0) {
      this.currentCol--;
      this.grid[this.currentRow][this.currentCol].textContent = '';
      this.grid[this.currentRow][this.currentCol].classList.remove('filled');
      this.currentGuess = this.currentGuess.slice(0, -1);
      this.audio.playKey();
    }
  }

  submitGuess() {
    if (this.currentCol !== 5) {
      alert('Enter a full 5-letter cyber password!');
      return;
    }

    const guess = this.currentGuess;
    const secret = this.secretWord;

    const secretLetterCounts = {};
    for (let char of secret) {
      secretLetterCounts[char] = (secretLetterCounts[char] || 0) + 1;
    }

    const statuses = Array(5).fill('absent');

    // First pass: Correct letters
    for (let i = 0; i < 5; i++) {
      if (guess[i] === secret[i]) {
        statuses[i] = 'correct';
        secretLetterCounts[guess[i]]--;
      }
    }

    // Second pass: Present letters
    for (let i = 0; i < 5; i++) {
      if (statuses[i] !== 'correct' && secretLetterCounts[guess[i]] > 0) {
        statuses[i] = 'present';
        secretLetterCounts[guess[i]]--;
      }
    }

    // Apply styles to tiles and virtual keyboard
    for (let i = 0; i < 5; i++) {
      const tile = this.grid[this.currentRow][i];
      const status = statuses[i];
      tile.classList.add(status);

      const kbKey = document.querySelector(`.kb-key[data-key="${guess[i]}"]`);
      if (kbKey) {
        if (status === 'correct') {
          kbKey.className = 'kb-key correct';
        } else if (status === 'present' && !kbKey.classList.contains('correct')) {
          kbKey.className = 'kb-key present';
        } else if (status === 'absent' && !kbKey.classList.contains('correct') && !kbKey.classList.contains('present')) {
          kbKey.className = 'kb-key absent';
        }
      }
    }

    this.audio.playReveal(guess === secret);

    if (guess === secret) {
      // Won!
      this.gameOver = true;
      this.solvedCount++;
      this.streak++;
      localStorage.setItem('cyber_wordle_solved', this.solvedCount.toString());
      localStorage.setItem('cyber_wordle_streak', this.streak.toString());
      this.audio.playWin();

      document.getElementById('modal-icon').textContent = '🔓';
      document.getElementById('modal-title').textContent = 'FIREWALL DECRYPTED!';
      document.getElementById('modal-desc').textContent = `Mainframe cracked in ${this.currentRow + 1} attempt(s)!`;
      document.getElementById('modal-secret-word').textContent = secret;
      document.getElementById('modal-overlay').classList.remove('hidden');

      if (window.parent && window.parent !== window) {
        try {
          window.parent.postMessage({
            game: 'cyber-wordle',
            score: (7 - (this.currentRow + 1)) * 500
          }, '*');
        } catch (e) {}
      }
    } else if (this.currentRow === 5) {
      // Lost
      this.gameOver = true;
      this.streak = 0;
      localStorage.setItem('cyber_wordle_streak', '0');

      document.getElementById('modal-icon').textContent = '🔒';
      document.getElementById('modal-title').textContent = 'ACCESS DENIED';
      document.getElementById('modal-desc').textContent = 'Security lockout triggered.';
      document.getElementById('modal-secret-word').textContent = secret;
      document.getElementById('modal-overlay').classList.remove('hidden');
    } else {
      this.currentRow++;
      this.currentCol = 0;
      this.currentGuess = '';
    }

    this.updateHUD();
  }

  updateHUD() {
    document.getElementById('solved-val').textContent = this.solvedCount;
    document.getElementById('streak-val').textContent = `${this.streak} 🔥`;
    document.getElementById('attempt-val').textContent = `${Math.min(6, this.currentRow + 1)} / 6`;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.wordleGame = new CyberWordle();
});
