/**
 * OmniVerse Hub — Dedicated Procedural Synthwave Main Menu Music Engine
 */

class HubMusicEngine {
  constructor() {
    this.audioCtx = null;
    this.masterGain = null;
    this.isPlaying = false;
    this.isMuted = false;
    this.mode = 'main'; // 'main' | 'badges' | 'breach'
    this.tempo = 115; // BPM
    this.step = 0;
    this.timerId = null;

    // Main Menu Synthwave Chords (in Hz): Cm, Ab, Eb, Bb
    this.chords = [
      [130.81, 155.56, 196.00], // C3, Eb3, G3
      [103.83, 130.81, 155.56], // Ab2, C3, Eb3
      [155.56, 196.00, 233.08], // Eb3, G3, Bb3
      [116.54, 146.83, 174.61]  // Bb2, D3, F3
    ];
    this.bassNotes = [65.41, 51.91, 77.78, 58.27];
    this.arpOffsets = [0, 7, 12, 15, 12, 7, 3, 7];

    // Badges / Hall of Fame Triumphant Heroic Chords: F, G, C, Am
    this.badgeChords = [
      [174.61, 220.00, 261.63, 329.63], // Fmaj7: F3, A3, C4, E4
      [196.00, 246.94, 293.66, 349.23], // G7: G3, B3, D4, F4
      [130.81, 164.81, 196.00, 246.94], // Cmaj7: C3, E3, G3, B3
      [220.00, 261.63, 329.63, 392.00]  // Am7: A3, C4, E4, G4
    ];
    this.badgeBass = [87.31, 98.00, 65.41, 110.00];
    this.badgeArpOffsets = [0, 4, 7, 12, 16, 12, 7, 4];

    // Breached Horror Nightmare Chords (Ultra slowed down & detuned tritones)
    this.breachChords = [
      [65.41, 92.50, 110.00],  // C2, F#2, A2 (Demonic Tritone)
      [58.27, 82.41, 116.54],  // Bb1, E2, Bb2
      [51.91, 73.42, 103.83],  // Ab1, D2, Ab2
      [43.65, 61.74, 87.31]    // F1, B1, F2
    ];
    this.breachBass = [32.70, 29.14, 25.96, 21.83]; // Ultra sub-bass 20-32 Hz rumble
    this.breachArpOffsets = [0, 6, 12, 18, 12, 6, 1, 6];

    // Global User-Gesture Audio Unlock (Resumes AudioContext without forcing playback)
    const unlockUserGesture = () => {
      this.init();
      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        this.audioCtx.resume().catch(() => {});
      }
    };
    ['click', 'pointerdown', 'keydown', 'touchstart'].forEach(evt => {
      window.addEventListener(evt, unlockUserGesture, { passive: true, once: true });
    });
  }

  setMode(newMode) {
    if (this.mode !== newMode) {
      this.mode = newMode;
      if (newMode === 'breach') {
        this.tempo = 38; // Super slow slowed-down nightmare tempo!
      } else if (newMode === 'badges') {
        this.tempo = 124;
      } else {
        this.tempo = 115;
      }
      if (this.isPlaying) {
        this.start(); // restart interval at new slowed tempo
      }
    }
  }

  init() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.audioCtx = new AudioContext();
        this.masterGain = this.audioCtx.createGain();
        this.masterGain.gain.setValueAtTime(1.0, this.audioCtx.currentTime);
        this.masterGain.connect(this.audioCtx.destination);
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
  }

  start() {
    this.init();
    if (!this.audioCtx || this.isMuted) return;
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }

    if (this.masterGain) {
      this.masterGain.gain.setValueAtTime(1.0, this.audioCtx.currentTime);
    }

    if (this.isPlaying && this.timerId) return; // Already running uninterrupted

    this.isPlaying = true;
    const intervalMs = (60 / this.tempo / 4) * 1000;

    if (this.timerId) clearInterval(this.timerId);

    this.timerId = setInterval(() => {
      if (!this.isPlaying || this.isMuted) return;
      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        this.audioCtx.resume().catch(() => {});
      }
      this.playStep(this.step);
      this.step = (this.step + 1) % 64;
    }, intervalMs);
  }

  pause() {
    this.isPlaying = false;
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
    if (this.masterGain && this.audioCtx) {
      try {
        this.masterGain.gain.setValueAtTime(0.0001, this.audioCtx.currentTime);
      } catch(e) {}
    }
  }

  stop() {
    this.pause();
    this.step = 0;
  }

  playStep(step) {
    if (!this.audioCtx || this.audioCtx.state === 'suspended') return;
    const now = this.audioCtx.currentTime;
    const bar = Math.floor(step / 16);

    let activeChords = this.chords;
    let activeBass = this.bassNotes;
    let activeArp = this.arpOffsets;

    if (this.mode === 'badges') {
      activeChords = this.badgeChords;
      activeBass = this.badgeBass;
      activeArp = this.badgeArpOffsets;
    } else if (this.mode === 'breach') {
      activeChords = this.breachChords;
      activeBass = this.breachBass;
      activeArp = this.breachArpOffsets;
    }

    const chord = activeChords[bar % activeChords.length];
    const bassFreq = activeBass[bar % activeBass.length];

    // 1. Synth Bassline (Plays on even 8th notes)
    if (step % 2 === 0) {
      try {
        const osc = this.audioCtx.createOscillator();
        const filter = this.audioCtx.createBiquadFilter();
        const gain = this.audioCtx.createGain();

        osc.type = this.mode === 'breach' ? 'sawtooth' : 'sawtooth';
        osc.frequency.setValueAtTime(bassFreq, now);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(this.mode === 'breach' ? 180 : 450, now);
        filter.frequency.exponentialRampToValueAtTime(this.mode === 'breach' ? 60 : 120, now + (this.mode === 'breach' ? 0.45 : 0.16));

        gain.gain.setValueAtTime(this.mode === 'breach' ? 0.35 : 0.18, now);
        gain.gain.linearRampToValueAtTime(0.001, now + (this.mode === 'breach' ? 0.45 : 0.18));

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain || this.audioCtx.destination);

        osc.start(now);
        osc.stop(now + 0.18);
      } catch (e) {}
    }

    // 2. Arpeggiated Neon Lead (Every 16th note)
    try {
      const arpIdx = step % activeArp.length;
      const arpFreq = chord[0] * Math.pow(2, activeArp[arpIdx] / 12);

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = this.mode === 'badges' ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(arpFreq * 2, now);

      gain.gain.setValueAtTime(0.09, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.13);

      osc.connect(gain);
      gain.connect(this.masterGain || this.audioCtx.destination);

      osc.start(now);
      osc.stop(now + 0.13);
    } catch (e) {}

    // 3. Ambient Pad Chord (Triggered at start of each bar)
    if (step % 16 === 0) {
      chord.forEach(freq => {
        try {
          const osc = this.audioCtx.createOscillator();
          const gain = this.audioCtx.createGain();

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq * 2, now);

          gain.gain.setValueAtTime(0.001, now);
          gain.gain.linearRampToValueAtTime(0.07, now + 0.3);
          gain.gain.linearRampToValueAtTime(0.001, now + 2.4);

          osc.connect(gain);
          gain.connect(this.masterGain || this.audioCtx.destination);

          osc.start(now);
          osc.stop(now + 2.4);
        } catch (e) {}
      });
    }

    // 4. Subtle Hi-Hat Rhythm
    if (step % 4 === 2) {
      try {
        const bufferSize = this.audioCtx.sampleRate * 0.04;
        const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }

        const noise = this.audioCtx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.audioCtx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(6500, now);

        const gain = this.audioCtx.createGain();
        gain.gain.setValueAtTime(0.035, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain || this.audioCtx.destination);

        noise.start(now);
      } catch (e) {}
    }
  }
}

window.hubMusicEngine = new HubMusicEngine();
