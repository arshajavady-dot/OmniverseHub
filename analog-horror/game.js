/**
 * Signal Lost: VHS Terror — Analog Horror Survival Engine
 */

class HorrorAudioEngine {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.isBGMPlaying = false;
    this.bgmTimer = null;
    this.step = 0;
    this.tempo = 90;

    this.droneFreqs = [45.00, 58.27, 43.65, 51.91];
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
    const bass = this.droneFreqs[bar % this.droneFreqs.length];

    if (step % 8 === 0) {
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(bass, now);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
        osc.connect(gain);
        gain.connect(this.masterGain || this.ctx.destination);
        osc.start(now);
        osc.stop(now + 1.2);
      } catch(e) {}
    }

    if (step % 16 === 8) {
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(bass * 3.5, now);
        gain.gain.setValueAtTime(0.03, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
        osc.connect(gain);
        gain.connect(this.masterGain || this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.6);
      } catch(e) {}
    }
  }

  playStatic() {
    if (!this.enabled || !this.ctx) return;
    try {
      const bufferSize = this.ctx.sampleRate * 0.1;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = buffer;
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.1);
      whiteNoise.connect(gain);
      gain.connect(this.masterGain || this.ctx.destination);
      whiteNoise.start();
    } catch(e) {}
  }

  playPurge() {
    if (!this.enabled || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(60, now + 0.4);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      osc.connect(gain);
      gain.connect(this.masterGain || this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.45);
    } catch(e) {}
  }

  playJumpscare() {
    if (!this.enabled || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.6);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
      osc.connect(gain);
      gain.connect(this.masterGain || this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.7);
    } catch(e) {}
  }
}

class AnalogHorror {
  constructor() {
    this.audio = new HorrorAudioEngine();

    this.tapes = [
      { id: 1, targetFreq: 924, title: 'TAPE 01: COUNTY WEATHER WARNING', msg: 'DO NOT LOOK DIRECTLY AT THE SKY.' },
      { id: 2, targetFreq: 981, title: 'TAPE 02: HIGHWAY SURVEILLANCE', msg: 'VEHICLE FOUND VACANT ON ROUTE 404.' },
      { id: 3, targetFreq: 1015, title: 'TAPE 03: UNDERGROUND FACILITY FEED', msg: 'CONTAINMENT PROTOCOL FAILED AT LEVEL 0.' },
      { id: 4, targetFreq: 1047, title: 'TAPE 04: EMERGENCY BROADCAST TRANSMISSION', msg: 'IF YOU HEAR KNOCKING AT THE ROOF, CEASE MOVEMENT.' },
      { id: 5, targetFreq: 1072, title: 'TAPE 05: FINAL RECOVERY LOG', msg: 'THE BROADCAST HAS AWOKEN.' }
    ];

    this.currentTapeIdx = 0;
    this.currentFreq = 920;
    this.sanity = 100;
    this.signalStrength = 0;
    this.tapesDecrypted = 0;
    this.gameOver = false;
    this.glitchActive = false;

    this.initUI();
    this.startLoop();
  }

  initUI() {
    window.focus();
    window.addEventListener('click', () => window.focus());

    const slider = document.getElementById('freq-slider');
    slider.addEventListener('input', (e) => {
      this.currentFreq = parseInt(e.target.value, 10);
      this.audio.playStatic();
      this.updateSignal();
    });

    document.getElementById('btn-descramble').addEventListener('click', () => this.decryptTape());
    document.getElementById('btn-anti-glitch').addEventListener('click', () => this.degauss());

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
    this.updateSignal();
    this.updateHUD();
  }

  updateSignal() {
    const cur = this.tapes[this.currentTapeIdx];
    const diff = Math.abs(this.currentFreq - cur.targetFreq);
    const maxDiff = 80;

    this.signalStrength = Math.max(0, Math.min(100, Math.floor((1 - diff / maxDiff) * 100)));
    document.getElementById('signal-val').textContent = `${this.signalStrength}%`;

    const freqMhz = (this.currentFreq / 10).toFixed(1);
    if (this.signalStrength > 85) {
      document.getElementById('broadcast-title').textContent = cur.title;
      document.getElementById('broadcast-sub').textContent = cur.msg;
      document.getElementById('btn-descramble').disabled = false;
    } else {
      document.getElementById('broadcast-title').textContent = `SEARCHING FREQUENCY [${freqMhz} MHz]...`;
      document.getElementById('broadcast-sub').textContent = 'ALIGN FREQUENCY DIAL TO LOCK BROADCAST';
      document.getElementById('btn-descramble').disabled = true;
    }
  }

  decryptTape() {
    if (this.signalStrength > 85 && !this.gameOver) {
      this.tapesDecrypted++;
      this.currentTapeIdx++;

      if (this.currentTapeIdx >= this.tapes.length) {
        // Won
        this.onWin();
      } else {
        this.sanity = Math.min(100, this.sanity + 20);
        this.updateSignal();
        this.updateHUD();
      }
    }
  }

  degauss() {
    if (this.gameOver) return;
    this.audio.playPurge();
    this.glitchActive = false;
    this.sanity = Math.min(100, this.sanity + 15);
    document.getElementById('jumpscare-face').classList.add('hidden');
    this.updateHUD();
  }

  startLoop() {
    setInterval(() => {
      if (this.gameOver) return;

      // Random Anomalous Interferences
      if (Math.random() < 0.25) {
        this.glitchActive = true;
        this.audio.playStatic();
        document.getElementById('jumpscare-face').classList.remove('hidden');
        this.sanity -= 8;
      } else {
        this.sanity -= 1.5;
      }

      if (this.sanity <= 0) {
        this.onBreach();
      }

      this.updateHUD();
    }, 1000);
  }

  onBreach() {
    this.gameOver = true;
    this.audio.playJumpscare();
    document.getElementById('jumpscare-face').classList.remove('hidden');

    document.getElementById('modal-title').textContent = 'REALITY BREACHED';
    document.getElementById('modal-desc').textContent = 'The VHS entity breached through your CRT tube.';
    document.getElementById('modal-tapes-count').textContent = `${this.tapesDecrypted} / 5`;
    document.getElementById('modal-overlay').classList.remove('hidden');
  }

  onWin() {
    this.gameOver = true;
    document.getElementById('modal-icon').textContent = '📼🏆';
    document.getElementById('modal-title').textContent = 'ALL TAPES DECRYPTED!';
    document.getElementById('modal-desc').textContent = 'You recorded and decoded all 5 anomalous VHS frequencies.';
    document.getElementById('modal-tapes-count').textContent = `5 / 5 (100%)`;
    document.getElementById('modal-overlay').classList.remove('hidden');

    if (window.parent && window.parent !== window) {
      try {
        window.parent.postMessage({
          game: 'analog-horror',
          score: 5000
        }, '*');
      } catch (e) {}
    }
  }

  restart() {
    this.currentTapeIdx = 0;
    this.sanity = 100;
    this.tapesDecrypted = 0;
    this.gameOver = false;
    this.glitchActive = false;
    document.getElementById('jumpscare-face').classList.add('hidden');
    document.getElementById('modal-overlay').classList.add('hidden');
    this.updateSignal();
    this.updateHUD();
  }

  updateHUD() {
    document.getElementById('sanity-bar').style.width = `${Math.max(0, this.sanity)}%`;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.horrorGame = new AnalogHorror();
});
