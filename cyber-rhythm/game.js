/**
 * Cyber Rhythm: Beat Matrix — 4-Lane Rhythm Music Game Engine
 */

class RhythmAudioEngine {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.isBGMPlaying = false;
    this.bgmTimer = null;
    this.step = 0;
    this.tempo = 130;

    // High-Energy Cyber EDM Chords: Fm, Db, Ab, Eb
    this.chords = [
      [174.61, 207.65, 261.63], // Fm
      [138.59, 174.61, 207.65], // Db
      [207.65, 261.63, 311.13], // Ab
      [155.56, 196.00, 233.08]  // Eb
    ];
    this.bassNotes = [87.31, 69.30, 103.83, 77.78];
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

  startBGM(onBeatCallback) {
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
      if (onBeatCallback) onBeatCallback(this.step);
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

    // Kick / Sub Bass
    if (step % 4 === 0) {
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(bass * 1.5, now);
        osc.frequency.exponentialRampToValueAtTime(30, now + 0.15);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
        osc.connect(gain);
        gain.connect(this.masterGain || this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.18);
      } catch(e) {}
    }

    // High Synths
    if (step % 2 === 0) {
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        const note = chord[(step / 2) % 3];
        osc.frequency.setValueAtTime(note * 2, now);
        gain.gain.setValueAtTime(0.03, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc.connect(gain);
        gain.connect(this.masterGain || this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.12);
      } catch(e) {}
    }
  }

  playHitSound(lane) {
    if (!this.enabled || !this.ctx) return;
    try {
      const freqs = [523.25, 659.25, 783.99, 1046.50];
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freqs[lane % 4], now);
      gain.gain.setValueAtTime(0.09, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.connect(gain);
      gain.connect(this.masterGain || this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.12);
    } catch(e) {}
  }
}

class CyberRhythm {
  constructor() {
    this.canvas = document.getElementById('rhythmCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.w = this.canvas.width;
    this.h = this.canvas.height;

    this.audio = new RhythmAudioEngine();

    this.lanes = 4;
    this.laneWidth = this.w / this.lanes;
    this.strikeY = this.h - 70;

    this.notes = []; // { lane, y, hit, missed }
    this.laneColors = ['#00f3ff', '#ec4899', '#f59e0b', '#10b981'];
    this.laneSymbols = ['◀', '▲', '▼', '▶'];

    this.score = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.groove = 100; // Health bar 0-100%
    this.accuracyTexts = []; // { text, color, x, y, life }
    this.particles = [];
    this.gameOver = false;

    this.initUI();
    this.startMusic();
    this.loop();
  }

  initUI() {
    window.focus();
    window.addEventListener('click', () => window.focus());

    const keyLaneMap = {
      'ArrowLeft': 0, 'KeyA': 0,
      'ArrowUp': 1, 'KeyW': 1,
      'ArrowDown': 2, 'KeyS': 2,
      'ArrowRight': 3, 'KeyD': 3,
      // Legacy fallback bindings
      'KeyF': 1, 'KeyJ': 2, 'KeyK': 3
    };

    window.addEventListener('keydown', (e) => {
      if (this.gameOver) return;
      if (keyLaneMap[e.code] !== undefined) {
        e.preventDefault();
        this.hitLane(keyLaneMap[e.code]);
        this.highlightPad(keyLaneMap[e.code]);
      }
    });

    // Touch Buttons
    document.querySelectorAll('.lane-pad-btn').forEach(btn => {
      const lane = parseInt(btn.dataset.lane, 10);
      btn.addEventListener('mousedown', () => this.hitLane(lane));
      btn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        this.hitLane(lane);
        btn.classList.add('pressed');
      }, { passive: false });
      btn.addEventListener('touchend', () => btn.classList.remove('pressed'));
    });

    const soundBtn = document.getElementById('btn-sound');
    soundBtn.addEventListener('click', () => {
      this.audio.enabled = !this.audio.enabled;
      if (this.audio.enabled) {
        this.startMusic();
        soundBtn.innerHTML = `<span>🔊</span>`;
      } else {
        this.audio.stopBGM();
        soundBtn.innerHTML = `<span>🔇</span>`;
      }
    });

    document.getElementById('modal-btn-restart').addEventListener('click', () => this.restart());
    this.updateHUD();
  }

  startMusic() {
    this.audio.startBGM((step) => {
      if (this.gameOver) return;
      // Chart generator based on sequencer steps
      if (step % 4 === 0 || step % 8 === 2 || (step % 16 === 14 && Math.random() < 0.5)) {
        const lane = Math.floor(Math.random() * 4);
        this.notes.push({
          lane: lane,
          y: -20,
          speed: 4.8,
          hit: false,
          missed: false
        });
      }
    });
  }

  highlightPad(lane) {
    const pad = document.querySelector(`.pad-${lane}`);
    if (pad) {
      pad.classList.add('pressed');
      setTimeout(() => pad.classList.remove('pressed'), 120);
    }
  }

  hitLane(lane) {
    if (this.gameOver) return;

    // Find closest note in this lane near strike line
    let closestNote = null;
    let closestDist = 999;

    for (let note of this.notes) {
      if (note.lane === lane && !note.hit && !note.missed) {
        const dist = Math.abs(note.y - this.strikeY);
        if (dist < closestDist && dist < 75) {
          closestDist = dist;
          closestNote = note;
        }
      }
    }

    if (closestNote) {
      closestNote.hit = true;
      let text = 'GOOD';
      let pts = 50;
      let color = '#38bdf8';

      if (closestDist <= 20) {
        text = 'PERFECT!';
        pts = 300;
        color = '#00f3ff';
      } else if (closestDist <= 45) {
        text = 'GREAT!';
        pts = 150;
        color = '#10b981';
      }

      this.combo++;
      if (this.combo > this.maxCombo) this.maxCombo = this.combo;
      const multiplier = Math.min(8, 1 + Math.floor(this.combo / 10));
      this.score += pts * multiplier;
      this.groove = Math.min(100, this.groove + 4);

      this.audio.playHitSound(lane);

      // Hit effect text
      this.accuracyTexts.push({
        text,
        color,
        x: lane * this.laneWidth + this.laneWidth / 2,
        y: this.strikeY - 20,
        life: 1.0
      });

      // Sparks
      for (let p = 0; p < 12; p++) {
        this.particles.push({
          x: lane * this.laneWidth + this.laneWidth / 2,
          y: this.strikeY,
          vx: (Math.random() - 0.5) * 8,
          vy: (Math.random() - 0.5) * 8,
          color: this.laneColors[lane],
          life: 1.0
        });
      }
    } else {
      // Empty tap penalty
      this.combo = 0;
      this.groove = Math.max(0, this.groove - 2);
    }

    this.updateHUD();
  }

  restart() {
    this.score = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.groove = 100;
    this.notes = [];
    this.particles = [];
    this.accuracyTexts = [];
    this.gameOver = false;

    document.getElementById('modal-overlay').classList.add('hidden');
    this.startMusic();
    this.updateHUD();
  }

  updateHUD() {
    document.getElementById('score-val').textContent = this.score.toLocaleString();
    document.getElementById('combo-val').textContent = `${this.combo}x`;
    document.getElementById('groove-bar').style.width = `${Math.max(0, this.groove)}%`;
  }

  loop() {
    this.update();
    this.render();
    requestAnimationFrame(() => this.loop());
  }

  update() {
    if (this.gameOver) return;

    // Update Notes
    for (let i = this.notes.length - 1; i >= 0; i--) {
      const n = this.notes[i];
      n.y += n.speed;

      // Missed note
      if (!n.hit && !n.missed && n.y > this.strikeY + 50) {
        n.missed = true;
        this.combo = 0;
        this.groove = Math.max(0, this.groove - 8);

        this.accuracyTexts.push({
          text: 'MISS',
          color: '#ef4444',
          x: n.lane * this.laneWidth + this.laneWidth / 2,
          y: this.strikeY + 10,
          life: 1.0
        });

        if (this.groove <= 0) {
          this.onGameOver();
          return;
        }
        this.updateHUD();
      }

      if (n.y > this.h + 50 || n.hit) {
        this.notes.splice(i, 1);
      }
    }

    // Update Accuracy Texts
    for (let i = this.accuracyTexts.length - 1; i >= 0; i--) {
      const at = this.accuracyTexts[i];
      at.y -= 0.8;
      at.life -= 0.04;
      if (at.life <= 0) this.accuracyTexts.splice(i, 1);
    }

    // Update Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.04;
      if (p.life <= 0) this.particles.splice(i, 1);
    }
  }

  onGameOver() {
    this.gameOver = true;
    this.audio.stopBGM();

    document.getElementById('modal-final-score').textContent = this.score.toLocaleString();
    document.getElementById('modal-max-combo').textContent = `${this.maxCombo}x`;
    document.getElementById('modal-overlay').classList.remove('hidden');

    if (window.parent && window.parent !== window) {
      try {
        window.parent.postMessage({
          game: 'cyber-rhythm',
          score: this.score
        }, '*');
      } catch (e) {}
    }
  }

  render() {
    this.ctx.fillStyle = '#02040a';
    this.ctx.fillRect(0, 0, this.w, this.h);

    // Lane Dividers
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    this.ctx.lineWidth = 1;
    for (let l = 1; l < this.lanes; l++) {
      this.ctx.beginPath();
      this.ctx.moveTo(l * this.laneWidth, 0);
      this.ctx.lineTo(l * this.laneWidth, this.h);
      this.ctx.stroke();
    }

    // Strike Zone Line
    this.ctx.strokeStyle = 'rgba(0, 243, 255, 0.4)';
    this.ctx.lineWidth = 3;
    this.ctx.beginPath();
    this.ctx.moveTo(0, this.strikeY);
    this.ctx.lineTo(this.w, this.strikeY);
    this.ctx.stroke();

    // Strike Target Rings with Arrows
    for (let l = 0; l < this.lanes; l++) {
      const cx = l * this.laneWidth + this.laneWidth / 2;
      this.ctx.strokeStyle = this.laneColors[l];
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.arc(cx, this.strikeY, 22, 0, Math.PI * 2);
      this.ctx.stroke();

      // Inner Arrow Indicator
      this.ctx.font = '700 16px "Orbitron", sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillStyle = this.laneColors[l];
      this.ctx.fillText(this.laneSymbols[l], cx, this.strikeY);
    }

    // Notes (Glowing Arrow Blocks)
    this.notes.forEach(n => {
      const cx = n.lane * this.laneWidth + this.laneWidth / 2;
      const nx = n.lane * this.laneWidth + 8;
      const nw = this.laneWidth - 16;
      const color = this.laneColors[n.lane];

      this.ctx.fillStyle = color;
      this.ctx.shadowColor = color;
      this.ctx.shadowBlur = 12;
      this.ctx.beginPath();
      this.ctx.roundRect(nx, n.y - 12, nw, 24, 6);
      this.ctx.fill();
      this.ctx.shadowBlur = 0;

      // Arrow Icon on Note
      this.ctx.font = '900 15px "Orbitron", sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillStyle = '#020617';
      this.ctx.fillText(this.laneSymbols[n.lane], cx, n.y);
    });

    // Accuracy Floating Texts
    this.accuracyTexts.forEach(at => {
      this.ctx.font = '900 16px "Orbitron", sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.fillStyle = at.color;
      this.ctx.globalAlpha = Math.max(0, at.life);
      this.ctx.fillText(at.text, at.x, at.y);
      this.ctx.globalAlpha = 1.0;
    });

    // Particles
    this.particles.forEach(p => {
      this.ctx.fillStyle = p.color;
      this.ctx.globalAlpha = Math.max(0, p.life);
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.globalAlpha = 1.0;
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.rhythmGame = new CyberRhythm();
});
