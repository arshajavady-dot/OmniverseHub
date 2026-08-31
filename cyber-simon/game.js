/**
 * Cyber Simon: Quantum Memory Matrix — Arcade Sequence Engine
 */

class SimonAudioEngine {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.isBGMPlaying = false;
    this.bgmTimer = null;
    this.step = 0;
    this.tempo = 126;

    // Upbeat Cyber Memory Chords: Am, F, C, G
    this.chords = [
      [220.00, 261.63, 329.63], // Am
      [174.61, 220.00, 261.63], // F
      [130.81, 164.81, 196.00], // C
      [196.00, 246.94, 293.66]  // G
    ];
    this.bassNotes = [55.00, 43.65, 65.41, 49.00];

    // Classic Simon Tones tuned to futuristic pure harmonics
    this.frequencies = [
      329.63, // 0: Green (E4)
      440.00, // 1: Red (A4)
      277.18, // 2: Yellow (C#4)
      220.00  // 3: Blue (A3)
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

    // Pulsing Sub-Bass
    if (step % 4 === 0) {
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(bass * 2, now);
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
        osc.connect(gain);
        gain.connect(this.masterGain || this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.18);
      } catch(e) {}
    }

    // Melodic Arpeggio
    if (step % 2 === 0) {
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        const chord = this.chords[bar % this.chords.length];
        const note = chord[(step / 2) % 3];
        osc.frequency.setValueAtTime(note * 2, now);
        gain.gain.setValueAtTime(0.02, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        osc.connect(gain);
        gain.connect(this.masterGain || this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.1);
      } catch(e) {}
    }
  }

  playPad(padIndex, durationMs = 300) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      const freq = this.frequencies[padIndex];
      const now = this.ctx.currentTime;
      const dur = durationMs / 1000;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

      osc.connect(gain);
      gain.connect(this.masterGain || this.ctx.destination);

      osc.start(now);
      osc.stop(now + dur);
    } catch(e) {}
  }

  playError() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(80, now);
      osc.frequency.exponentialRampToValueAtTime(35, now + 0.5);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

      osc.connect(gain);
      gain.connect(this.masterGain || this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.55);
    } catch(e) {}
  }

  playRoundSuccess() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      const notes = [440.00, 554.37, 659.25, 880.00];
      notes.forEach((f, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const now = this.ctx.currentTime + i * 0.06;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now);
        gain.gain.setValueAtTime(0.09, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.connect(gain);
        gain.connect(this.masterGain || this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.2);
      });
    } catch(e) {}
  }
}

class CyberSimon {
  constructor() {
    this.audio = new SimonAudioEngine();

    this.sequence = [];
    this.playerStep = 0;
    this.score = 0;
    this.round = 1;
    this.highScore = parseInt(localStorage.getItem('cyber_simon_best') || '0', 10);

    this.isPlayingSequence = false;
    this.isGameActive = false;

    this.pads = [
      document.querySelector('.pad-green'),
      document.querySelector('.pad-red'),
      document.querySelector('.pad-yellow'),
      document.querySelector('.pad-blue')
    ];

    this.initUI();
  }

  initUI() {
    window.focus();
    window.addEventListener('click', () => window.focus());

    // Pad Click Handlers
    this.pads.forEach((pad, index) => {
      pad.addEventListener('click', () => {
        if (!this.isGameActive || this.isPlayingSequence) return;
        this.handlePlayerInput(index);
      });
    });

    // Keyboard Keybindings
    window.addEventListener('keydown', (e) => {
      if (!this.isGameActive || this.isPlayingSequence) return;

      const key = e.code;
      if (key === 'KeyQ' || key === 'ArrowLeft' || key === 'Numpad7') {
        this.handlePlayerInput(0);
      } else if (key === 'KeyW' || key === 'ArrowUp' || key === 'Numpad9') {
        this.handlePlayerInput(1);
      } else if (key === 'KeyA' || key === 'ArrowDown' || key === 'Numpad1') {
        this.handlePlayerInput(2);
      } else if (key === 'KeyS' || key === 'ArrowRight' || key === 'Numpad3') {
        this.handlePlayerInput(3);
      }
    });

    document.getElementById('btn-start').addEventListener('click', () => this.startGame());
    document.getElementById('modal-btn-restart').addEventListener('click', () => {
      document.getElementById('modal-overlay').classList.add('hidden');
      this.startGame();
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

    this.updateHUD();
  }

  startGame() {
    this.sequence = [];
    this.playerStep = 0;
    this.score = 0;
    this.round = 1;
    this.isGameActive = true;

    document.getElementById('btn-start').style.display = 'none';
    this.updateHUD();
    this.nextRound();
  }

  nextRound() {
    this.playerStep = 0;
    this.isPlayingSequence = true;
    document.getElementById('status-text').textContent = 'WATCH MATRIX';

    // Add random new step to sequence (0-3)
    const nextPad = Math.floor(Math.random() * 4);
    this.sequence.push(nextPad);

    // Playback sequence after short delay
    setTimeout(() => {
      this.playSequence();
    }, 600);
  }

  playSequence() {
    let i = 0;
    // Speed increases as sequence grows
    const speedMs = Math.max(220, 500 - this.round * 18);
    const flashDurMs = Math.floor(speedMs * 0.65);

    const interval = setInterval(() => {
      if (!this.isGameActive) {
        clearInterval(interval);
        return;
      }

      const padIndex = this.sequence[i];
      this.flashPad(padIndex, flashDurMs);
      i++;

      if (i >= this.sequence.length) {
        clearInterval(interval);
        setTimeout(() => {
          this.isPlayingSequence = false;
          document.getElementById('status-text').textContent = 'YOUR TURN';
        }, flashDurMs + 100);
      }
    }, speedMs);
  }

  flashPad(padIndex, durationMs) {
    const pad = this.pads[padIndex];
    if (!pad) return;

    pad.classList.add('active');
    this.audio.playPad(padIndex, durationMs);

    setTimeout(() => {
      pad.classList.remove('active');
    }, durationMs);
  }

  handlePlayerInput(padIndex) {
    // Flash pad on player press
    this.flashPad(padIndex, 200);

    // Check if correct
    if (padIndex === this.sequence[this.playerStep]) {
      // Correct step
      this.playerStep++;
      this.score += 50 * this.round;
      this.updateHUD();

      // Completed full sequence for current round
      if (this.playerStep === this.sequence.length) {
        this.isPlayingSequence = true;
        this.score += 200 * this.round;
        this.round++;
        this.audio.playRoundSuccess();
        document.getElementById('status-text').textContent = 'PERFECT!';

        if (this.sequence.length > this.highScore) {
          this.highScore = this.sequence.length;
          localStorage.setItem('cyber_simon_best', this.highScore.toString());
        }

        setTimeout(() => {
          this.nextRound();
        }, 900);
      }
    } else {
      // Wrong step — Game Over!
      this.onGameOver();
    }
  }

  onGameOver() {
    this.isGameActive = false;
    this.audio.playError();
    document.getElementById('status-text').textContent = 'FAILED';
    document.getElementById('btn-start').style.display = 'block';

    document.getElementById('modal-score').textContent = this.score.toLocaleString();
    document.getElementById('modal-sequence').textContent = `${this.sequence.length} STEPS`;
    document.getElementById('modal-overlay').classList.remove('hidden');

    if (window.parent && window.parent !== window) {
      try {
        window.parent.postMessage({
          game: 'cyber-simon',
          score: this.score
        }, '*');
      } catch (e) {}
    }
  }

  updateHUD() {
    document.getElementById('score-val').textContent = this.score.toLocaleString();
    document.getElementById('round-val').textContent = this.round;
    document.getElementById('high-score-val').textContent = `${this.highScore} STEPS`;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.simonGame = new CyberSimon();
});
