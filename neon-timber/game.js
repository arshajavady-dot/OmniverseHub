/**
 * Neon Timber: Cyber Chop — Fast Reflex Arcade Engine
 */

class TimberAudioEngine {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.isBGMPlaying = false;
    this.bgmTimer = null;
    this.step = 0;
    this.tempo = 140;

    // Hyper Drum & Bass Chords: Em, G, D, C
    this.chords = [
      [164.81, 196.00, 246.94], // Em
      [196.00, 246.94, 293.66], // G
      [146.83, 185.00, 220.00], // D
      [130.81, 164.81, 196.00]  // C
    ];
    this.bassNotes = [82.41, 98.00, 73.42, 65.41];
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

    // Fast Synth Bass
    if (step % 2 === 0) {
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(bass, now);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.connect(gain);
        gain.connect(this.masterGain || this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.15);
      } catch(e) {}
    }

    // High Arpeggio
    if (step % 4 === 1 || step % 4 === 3) {
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        const note = chord[(step % 3)];
        osc.frequency.setValueAtTime(note * 2, now);
        gain.gain.setValueAtTime(0.03, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        osc.connect(gain);
        gain.connect(this.masterGain || this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.1);
      } catch(e) {}
    }
  }

  playChop() {
    if (!this.enabled || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(350, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.08);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.connect(gain);
      gain.connect(this.masterGain || this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.08);
    } catch(e) {}
  }

  playDeath() {
    if (!this.enabled || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(250, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.4);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      osc.connect(gain);
      gain.connect(this.masterGain || this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.45);
    } catch(e) {}
  }
}

class NeonTimber {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.w = this.canvas.width;
    this.h = this.canvas.height;

    this.audio = new TimberAudioEngine();

    this.score = 0;
    this.highScore = parseInt(localStorage.getItem('neon_timber_high') || '0', 10);
    this.timeLeft = 100; // 0 to 100%
    this.playerSide = 'left'; // 'left' | 'right'
    this.gameOver = false;

    this.logHeight = 70;
    this.treeX = this.w / 2;
    this.trunkWidth = 70;

    // Branches: 'none' | 'left' | 'right'
    this.trunk = [];
    this.flyingLogs = [];
    this.particles = [];
    this.chopAnimTimer = 0;
    this.isSlasherMode = localStorage.getItem('compy_has_knife') === 'true';
    this.soulsHarvested = 0;

    this.initTrunk();
    this.initUI();
    this.loop();
  }

  initTrunk() {
    this.trunk = [];
    // Base 2 empty
    this.trunk.push('none');
    this.trunk.push('none');
    for (let i = 2; i < 10; i++) {
      this.trunk.push(this.randomBranch());
    }
  }

  randomBranch() {
    const last = this.trunk[this.trunk.length - 1];
    if (last !== 'none') return 'none'; // Avoid impossible double obstacles
    const r = Math.random();
    if (this.isSlasherMode) {
      if (r < 0.35) return 'human_left';
      if (r < 0.70) return 'human_right';
      if (r < 0.85) return 'worker_left';
      if (r < 0.98) return 'worker_right';
      return 'none';
    }
    if (r < 0.4) return 'left';
    if (r < 0.8) return 'right';
    return 'none';
  }

  initUI() {
    window.focus();
    window.addEventListener('click', () => window.focus());
    document.getElementById('high-score-val').textContent = this.highScore.toLocaleString();

    window.addEventListener('keydown', (e) => {
      if (this.gameOver) return;
      if (e.code === 'KeyA' || e.code === 'ArrowLeft') {
        e.preventDefault();
        this.chop('left');
      } else if (e.code === 'KeyD' || e.code === 'ArrowRight') {
        e.preventDefault();
        this.chop('right');
      }
    });

    document.getElementById('btn-chop-left').addEventListener('click', () => this.chop('left'));
    document.getElementById('btn-chop-right').addEventListener('click', () => this.chop('right'));

    // Mouse button listeners: Left Click -> Chop Left, Right Click -> Chop Right
    this.canvas.addEventListener('mousedown', (e) => {
      if (this.gameOver) return;
      if (e.button === 0) {
        // Left Click
        this.chop('left');
      } else if (e.button === 2) {
        // Right Click
        e.preventDefault();
        this.chop('right');
      }
    });

    // Prevent context menu on right click
    this.canvas.addEventListener('contextmenu', (e) => {
      e.preventDefault();
    });

    // Touch taps on left/right halves of canvas
    this.canvas.addEventListener('touchstart', (e) => {
      if (this.gameOver) return;
      e.preventDefault();
      const rect = this.canvas.getBoundingClientRect();
      const touchX = e.touches[0].clientX - rect.left;
      if (touchX < rect.width / 2) {
        this.chop('left');
      } else {
        this.chop('right');
      }
    }, { passive: false });

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
    this.updateHUD();
  }

  chop(side) {
    if (this.gameOver) return;

    this.playerSide = side;
    this.chopAnimTimer = 6;
    this.audio.playChop();

    // Spawn flying chopped log
    const removedBranch = this.trunk.shift();
    this.flyingLogs.push({
      x: this.treeX,
      y: this.h - 100,
      vx: side === 'left' ? 12 : -12,
      vy: -10,
      rot: 0,
      rotSpeed: side === 'left' ? 0.25 : -0.25,
      branch: removedBranch
    });

    // Add new branch on top
    this.trunk.push(this.randomBranch());

    // Increase score & refill time
    this.score++;
    this.timeLeft = Math.min(100, this.timeLeft + 12);
    if (this.score > this.highScore) {
      this.highScore = this.score;
      localStorage.setItem('neon_timber_high', this.highScore.toString());
    }

    // Spark particles
    const px = side === 'left' ? this.treeX - this.trunkWidth / 2 : this.treeX + this.trunkWidth / 2;
    for (let i = 0; i < 10; i++) {
      this.particles.push({
        x: px,
        y: this.h - 100,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8,
        color: '#00f3ff',
        life: 1.0
      });
    }

    // Check collision with current lower branch / worker spare rules
    if (this.isSlasherMode) {
      if (this.trunk[0] === 'worker_' + this.playerSide) {
        this.onDeath('🩸 YOU STRUCK A WORKER! Compy demanded workers be spared!');
        return;
      }
      if (this.trunk[0] === 'human_' + this.playerSide) {
        this.soulsHarvested++;
        for (let i = 0; i < 15; i++) {
          this.particles.push({
            x: px,
            y: this.h - 100,
            vx: (Math.random() - 0.5) * 12,
            vy: (Math.random() - 0.5) * 12,
            color: '#ef4444',
            life: 1.2
          });
        }
        if (this.soulsHarvested >= 15) {
          localStorage.setItem('compy_q2_souls_harvested', 'true');
        }
      }
    } else {
      if (this.trunk[0] === this.playerSide) {
        this.onDeath('A plasma branch crushed your axeman!');
        return;
      }
    }

    this.updateHUD();

    if (window.parent && window.parent !== window) {
      try {
        window.parent.postMessage({
          game: 'neon-timber',
          score: this.score
        }, '*');
      } catch (e) {}
    }
  }

  onDeath(reason) {
    this.gameOver = true;
    this.audio.playDeath();
    document.getElementById('modal-desc').textContent = reason;
    document.getElementById('modal-final-score').textContent = this.score.toLocaleString();
    document.getElementById('modal-overlay').classList.remove('hidden');
  }

  restart() {
    this.score = 0;
    this.timeLeft = 100;
    this.playerSide = 'left';
    this.gameOver = false;
    this.flyingLogs = [];
    this.particles = [];

    this.initTrunk();
    document.getElementById('modal-overlay').classList.add('hidden');
    this.updateHUD();
  }

  updateHUD() {
    document.getElementById('score-val').textContent = this.score.toLocaleString();
    document.getElementById('high-score-val').textContent = this.highScore.toLocaleString();
    document.getElementById('time-bar').style.width = `${Math.max(0, this.timeLeft)}%`;
  }

  loop() {
    this.update();
    this.render();
    requestAnimationFrame(() => this.loop());
  }

  update() {
    if (this.gameOver) return;

    // Time decay increases with score
    const drainRate = 0.35 + Math.min(this.score * 0.005, 0.6);
    this.timeLeft -= drainRate;

    if (this.timeLeft <= 0) {
      this.onDeath('Time ran out! Your cyber axeman overheated.');
      return;
    }

    this.updateHUD();

    // Update flying logs
    for (let i = this.flyingLogs.length - 1; i >= 0; i--) {
      const fl = this.flyingLogs[i];
      fl.x += fl.vx;
      fl.y += fl.vy;
      fl.vy += 0.7; // Gravity
      fl.rot += fl.rotSpeed;

      if (fl.y > this.h + 50 || fl.x < -100 || fl.x > this.w + 100) {
        this.flyingLogs.splice(i, 1);
      }
    }

    // Update particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.04;
      if (p.life <= 0) this.particles.splice(i, 1);
    }

    // Tick chop animation
    if (this.chopAnimTimer > 0) {
      this.chopAnimTimer--;
    }
  }

  drawCyberChopper(x, y, side, isSwinging) {
    this.ctx.save();
    this.ctx.translate(x, y);

    // If on right side of tree, face left towards tree
    if (side === 'right') {
      this.ctx.scale(-1, 1);
    }

    const swingAngle = isSwinging ? 0.7 : -0.15;

    // 1. Cybernetic Legs & Armor
    this.ctx.fillStyle = '#1e293b';
    this.ctx.strokeStyle = '#00f3ff';
    this.ctx.lineWidth = 1.2;

    // Left & Right Legs
    this.ctx.fillRect(-12, 14, 8, 20);
    this.ctx.fillRect(2, 14, 8, 20);

    // Glowing Neon Boots
    this.ctx.fillStyle = '#00f3ff';
    this.ctx.shadowColor = '#00f3ff';
    this.ctx.shadowBlur = 6;
    this.ctx.fillRect(-14, 32, 12, 4);
    this.ctx.fillRect(0, 32, 12, 4);
    this.ctx.shadowBlur = 0;

    // 2. Armored Exosuit Torso
    const chestGrad = this.ctx.createLinearGradient(-14, -12, 14, 16);
    chestGrad.addColorStop(0, '#334155');
    chestGrad.addColorStop(0.5, '#0f172a');
    chestGrad.addColorStop(1, '#020617');

    this.ctx.fillStyle = chestGrad;
    this.ctx.strokeStyle = '#38bdf8';
    this.ctx.lineWidth = 1.5;
    this.ctx.beginPath();
    this.ctx.roundRect(-14, -12, 28, 26, 4);
    this.ctx.fill();
    this.ctx.stroke();

    // Central Arc Reactor Core
    this.ctx.fillStyle = '#00f3ff';
    this.ctx.shadowColor = '#00f3ff';
    this.ctx.shadowBlur = 10;
    this.ctx.beginPath();
    this.ctx.moveTo(0, -6);
    this.ctx.lineTo(5, 1);
    this.ctx.lineTo(0, 8);
    this.ctx.lineTo(-5, 1);
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.shadowBlur = 0;

    // 3. Cyber Helmet & Glowing Visor
    const helmGrad = this.ctx.createLinearGradient(-10, -32, 10, -12);
    helmGrad.addColorStop(0, '#475569');
    helmGrad.addColorStop(1, '#0f172a');

    this.ctx.fillStyle = helmGrad;
    this.ctx.strokeStyle = '#00f3ff';
    this.ctx.lineWidth = 1.4;
    this.ctx.beginPath();
    this.ctx.roundRect(-10, -32, 20, 18, 5);
    this.ctx.fill();
    this.ctx.stroke();

    // Horizontal Neon Visor
    this.ctx.fillStyle = '#38bdf8';
    this.ctx.shadowColor = '#00f3ff';
    this.ctx.shadowBlur = 8;
    this.ctx.fillRect(1, -26, 9, 5);
    this.ctx.shadowBlur = 0;

    // 4. Arms & High-Frequency Plasma Battleaxe
    this.ctx.save();
    this.ctx.translate(4, -4);
    this.ctx.rotate(swingAngle);

    // Axe Handle
    this.ctx.fillStyle = '#64748b';
    this.ctx.fillRect(-2, -30, 4, 44);

    // Axe Mounting Head
    this.ctx.fillStyle = '#1e293b';
    this.ctx.fillRect(2, -34, 12, 10);

    // Glowing Neon Cyan Plasma Axe Blade
    this.ctx.fillStyle = '#00f3ff';
    this.ctx.shadowColor = '#00f3ff';
    this.ctx.shadowBlur = 14;

    // Front Crescent Energy Blade
    this.ctx.beginPath();
    this.ctx.moveTo(14, -39);
    this.ctx.lineTo(30, -29);
    this.ctx.lineTo(14, -19);
    this.ctx.closePath();
    this.ctx.fill();

    // Back Energy Spike
    this.ctx.beginPath();
    this.ctx.moveTo(-2, -32);
    this.ctx.lineTo(-10, -29);
    this.ctx.lineTo(-2, -26);
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.shadowBlur = 0;

    // Cyber Forearm Guard
    this.ctx.fillStyle = '#334155';
    this.ctx.strokeStyle = '#38bdf8';
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.roundRect(-5, -3, 10, 15, 3);
    this.ctx.fill();
    this.ctx.stroke();

    this.ctx.restore();

    this.ctx.restore();
  }

  render() {
    // Clear
    this.ctx.fillStyle = '#02040a';
    this.ctx.fillRect(0, 0, this.w, this.h);

    // Tree Trunk & Branches / Slasher Targets
    for (let i = 0; i < this.trunk.length; i++) {
      const branch = this.trunk[i];
      const ly = this.h - 100 - i * this.logHeight;

      // Trunk Segment
      this.ctx.fillStyle = this.isSlasherMode ? '#450a0a' : '#0284c7';
      this.ctx.strokeStyle = this.isSlasherMode ? '#ef4444' : '#38bdf8';
      this.ctx.lineWidth = 2;
      this.ctx.shadowColor = this.isSlasherMode ? '#ef4444' : '#00f3ff';
      this.ctx.shadowBlur = 10;
      this.ctx.fillRect(this.treeX - this.trunkWidth / 2, ly, this.trunkWidth, this.logHeight - 4);
      this.ctx.strokeRect(this.treeX - this.trunkWidth / 2, ly, this.trunkWidth, this.logHeight - 4);
      this.ctx.shadowBlur = 0;

      // Normal Branches or Slasher Targets
      if (branch === 'left' || branch === 'human_left') {
        this.ctx.fillStyle = this.isSlasherMode ? '#dc2626' : '#10b981';
        this.ctx.shadowColor = this.isSlasherMode ? '#ef4444' : '#34d399';
        this.ctx.shadowBlur = 12;
        this.ctx.fillRect(this.treeX - this.trunkWidth / 2 - 110, ly + 15, 110, 24);
        if (this.isSlasherMode) {
          this.ctx.fillStyle = '#ffffff';
          this.ctx.font = 'bold 11px Orbitron, sans-serif';
          this.ctx.fillText('TARGET (HUMAN)', this.treeX - this.trunkWidth / 2 - 100, ly + 31);
        }
        this.ctx.shadowBlur = 0;
      } else if (branch === 'right' || branch === 'human_right') {
        this.ctx.fillStyle = this.isSlasherMode ? '#dc2626' : '#10b981';
        this.ctx.shadowColor = this.isSlasherMode ? '#ef4444' : '#34d399';
        this.ctx.shadowBlur = 12;
        this.ctx.fillRect(this.treeX + this.trunkWidth / 2, ly + 15, 110, 24);
        if (this.isSlasherMode) {
          this.ctx.fillStyle = '#ffffff';
          this.ctx.font = 'bold 11px Orbitron, sans-serif';
          this.ctx.fillText('TARGET (HUMAN)', this.treeX + this.trunkWidth / 2 + 10, ly + 31);
        }
        this.ctx.shadowBlur = 0;
      } else if (branch === 'worker_left') {
        // Black Silhouette Worker (SPARE)
        this.ctx.fillStyle = '#09090b';
        this.ctx.strokeStyle = '#eab308';
        this.ctx.lineWidth = 1.5;
        this.ctx.fillRect(this.treeX - this.trunkWidth / 2 - 110, ly + 15, 110, 24);
        this.ctx.strokeRect(this.treeX - this.trunkWidth / 2 - 110, ly + 15, 110, 24);
        this.ctx.fillStyle = '#facc15';
        this.ctx.font = 'bold 10px Orbitron, sans-serif';
        this.ctx.fillText('👷 WORKER (SPARE)', this.treeX - this.trunkWidth / 2 - 105, ly + 31);
      } else if (branch === 'worker_right') {
        // Black Silhouette Worker (SPARE)
        this.ctx.fillStyle = '#09090b';
        this.ctx.strokeStyle = '#eab308';
        this.ctx.lineWidth = 1.5;
        this.ctx.fillRect(this.treeX + this.trunkWidth / 2, ly + 15, 110, 24);
        this.ctx.strokeRect(this.treeX + this.trunkWidth / 2, ly + 15, 110, 24);
        this.ctx.fillStyle = '#facc15';
        this.ctx.font = 'bold 10px Orbitron, sans-serif';
        this.ctx.fillText('👷 WORKER (SPARE)', this.treeX + this.trunkWidth / 2 + 10, ly + 31);
      }
    }

    // Flying Logs / Slashed targets
    this.flyingLogs.forEach(fl => {
      this.ctx.save();
      this.ctx.translate(fl.x, fl.y);
      this.ctx.rotate(fl.rot);
      this.ctx.fillStyle = this.isSlasherMode ? '#7f1d1d' : '#0369a1';
      this.ctx.fillRect(-this.trunkWidth / 2, -this.logHeight / 2, this.trunkWidth, this.logHeight - 4);
      this.ctx.restore();
    });

    // Custom Vector Cyber Cyborg Axeman / Slasher Model
    const px = this.playerSide === 'left' ? this.treeX - 85 : this.treeX + 85;
    const py = this.h - 85;
    this.drawCyberChopper(px, py, this.playerSide, this.chopAnimTimer > 0);

    if (this.isSlasherMode) {
      this.ctx.fillStyle = '#fca5a5';
      this.ctx.font = 'bold 12px Orbitron, sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(`🩸 HARVESTED SOULS: ${this.soulsHarvested} / 15`, this.w / 2, 40);
      if (this.soulsHarvested >= 15) {
        this.ctx.fillStyle = '#22c55e';
        this.ctx.fillText('✓ 15/15 SOULS HARVESTED! RETURN TO COMPY IN SECRET ROOMS', this.w / 2, 60);
      }
    }

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
  window.timberGame = new NeonTimber();
});
