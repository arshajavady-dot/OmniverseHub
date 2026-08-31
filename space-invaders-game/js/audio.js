/* ==========================================================================
   CYBER INVADERS - PROCEDURAL WEB AUDIO SYNTHESIZER
   Zero external audio files required! Generates retro SFX & synth soundtrack.
   ========================================================================== */

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.sfxVolume = 0.8;
    this.musicVolume = 0.6;
    this.isMuted = false;
    
    // Background Music State
    this.bgmPlaying = false;
    this.bgmInterval = null;
    this.currentStep = 0;

    // Initialize AudioContext lazily on user interaction
    this.initOnUserGesture();
  }

  initOnUserGesture() {
    const startAudio = () => {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    };

    window.addEventListener('click', startAudio, { once: true });
    window.addEventListener('keydown', startAudio, { once: true });
    window.addEventListener('touchstart', startAudio, { once: true });
  }

  setSFXVolume(val) {
    this.sfxVolume = Math.max(0, Math.min(1, val));
  }

  setMusicVolume(val) {
    this.musicVolume = Math.max(0, Math.min(1, val));
  }

  /* ------------------------------------------------------------------------
     SFX SYNTHESIZERS
     ------------------------------------------------------------------------ */

  playLaser(type = 'default') {
    if (!this.ctx || this.isMuted || this.sfxVolume <= 0) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    if (type === 'spread') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(150, now + 0.12);
      gain.gain.setValueAtTime(0.25 * this.sfxVolume, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
      osc.start(now);
      osc.stop(now + 0.12);
    } else if (type === 'beam') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(1200, now);
      osc.frequency.linearRampToValueAtTime(400, now + 0.18);
      gain.gain.setValueAtTime(0.2 * this.sfxVolume, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);
      osc.start(now);
      osc.stop(now + 0.18);
    } else if (type === 'rocket') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.exponentialRampToValueAtTime(900, now + 0.2);
      gain.gain.setValueAtTime(0.3 * this.sfxVolume, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
      osc.start(now);
      osc.stop(now + 0.2);
    } else {
      // Standard Laser
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(650, now);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.1);
      gain.gain.setValueAtTime(0.2 * this.sfxVolume, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
      osc.start(now);
      osc.stop(now + 0.1);
    }
  }

  playInvaderShoot() {
    if (!this.ctx || this.isMuted || this.sfxVolume <= 0) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.linearRampToValueAtTime(40, now + 0.15);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);

    gain.gain.setValueAtTime(0.15 * this.sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

    osc.start(now);
    osc.stop(now + 0.15);
  }

  playExplosion(intensity = 'medium') {
    if (!this.ctx || this.isMuted || this.sfxVolume <= 0) return;
    const now = this.ctx.currentTime;

    // Generate White Noise Buffer
    const duration = intensity === 'heavy' ? 0.6 : (intensity === 'small' ? 0.15 : 0.35);
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = buffer;

    // Filter
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(intensity === 'heavy' ? 400 : 800, now);
    filter.frequency.exponentialRampToValueAtTime(30, now + duration);

    // Gain
    const gain = this.ctx.createGain();
    const vol = intensity === 'heavy' ? 0.5 : (intensity === 'small' ? 0.2 : 0.35);
    gain.gain.setValueAtTime(vol * this.sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + duration);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    whiteNoise.start(now);
    whiteNoise.stop(now + duration);
  }

  playPowerup() {
    if (!this.ctx || this.isMuted || this.sfxVolume <= 0) return;
    const now = this.ctx.currentTime;
    const notes = [300, 450, 600, 900];
    
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      gain.gain.setValueAtTime(0.2 * this.sfxVolume, now + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.05 + 0.1);

      osc.start(now + idx * 0.05);
      osc.stop(now + idx * 0.05 + 0.1);
    });
  }

  playShieldHit() {
    if (!this.ctx || this.isMuted || this.sfxVolume <= 0) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(250, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.2);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    gain.gain.setValueAtTime(0.3 * this.sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

    osc.start(now);
    osc.stop(now + 0.2);
  }

  playBombNuke() {
    if (!this.ctx || this.isMuted || this.sfxVolume <= 0) return;
    this.playExplosion('heavy');
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(100, now);
    osc.frequency.exponentialRampToValueAtTime(1200, now + 0.5);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    gain.gain.setValueAtTime(0.4 * this.sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.7);

    osc.start(now);
    osc.stop(now + 0.7);
  }

  /* ------------------------------------------------------------------------
     PROCEDURAL SYNTHWAVE BGM TRACKER
     ------------------------------------------------------------------------ */

  startBGM() {
    if (this.bgmPlaying || !this.ctx) return;
    this.bgmPlaying = true;
    this.currentStep = 0;

    const bassNotes = [65.41, 65.41, 73.42, 65.41, 87.31, 87.31, 73.42, 65.41]; // C2, D2, F2 sequence
    
    this.bgmInterval = setInterval(() => {
      if (!this.bgmPlaying || this.isMuted || this.musicVolume <= 0 || !this.ctx) return;

      const now = this.ctx.currentTime;
      const freq = bassNotes[this.currentStep % bassNotes.length];

      // Bass synth node
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(350, now);
      filter.frequency.linearRampToValueAtTime(100, now + 0.15);

      gain.gain.setValueAtTime(0.15 * this.musicVolume, now);
      gain.gain.exponentialRampToValueAtTime(0.005, now + 0.15);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.15);

      // Hi-hat / tick pulse on offbeats
      if (this.currentStep % 2 === 1) {
        this.playHiHat(now);
      }

      this.currentStep++;
    }, 180); // ~133 BPM step pulse
  }

  playHiHat(now) {
    if (!this.ctx) return;
    const bufferSize = this.ctx.sampleRate * 0.03;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const source = this.ctx.createBufferSource();
    source.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 7000;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.04 * this.musicVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    source.start(now);
    source.stop(now + 0.03);
  }

  stopBGM() {
    this.bgmPlaying = false;
    if (this.bgmInterval) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
  }
}

// Global Sound Instance
const soundEngine = new SoundEngine();
