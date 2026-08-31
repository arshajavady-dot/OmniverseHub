/**
 * Cyber Centipede: Neon Swarm — Classic 80s Arcade Shooter Engine
 */

class CentipedeAudioEngine {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.isBGMPlaying = false;
    this.bgmTimer = null;
    this.step = 0;
    this.tempo = 135;

    // Fast 80s Chiptune Arcade Chords: Dm, F, C, G
    this.chords = [
      [146.83, 174.61, 220.00], // Dm
      [174.61, 220.00, 261.63], // F
      [130.81, 164.81, 196.00], // C
      [196.00, 246.94, 293.66]  // G
    ];
    this.bassNotes = [73.42, 87.31, 65.41, 98.00];
    this.arpOffsets = [0, 3, 7, 12, 15, 12, 7, 3];

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

    // 1. Arcade Bass
    if (step % 4 === 0) {
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(bass, now);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
        osc.connect(gain);
        gain.connect(this.masterGain || this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.18);
      } catch(e) {}
    }

    // 2. High 8-Bit Chiptune Lead
    if (step % 2 === 0) {
      try {
        const arpIdx = (step / 2) % this.arpOffsets.length;
        const freq = chord[0] * Math.pow(2, this.arpOffsets[arpIdx] / 12) * 2;
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

  playLaser() {
    if (!this.enabled || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;
      osc.type = 'square';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.08);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.connect(gain);
      gain.connect(this.masterGain || this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.08);
    } catch(e) {}
  }

  playPop() {
    if (!this.enabled || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(640, now + 0.06);
      gain.gain.setValueAtTime(0.07, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
      osc.connect(gain);
      gain.connect(this.masterGain || this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.07);
    } catch(e) {}
  }

  playHit() {
    if (!this.enabled || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(200, now);
      osc.frequency.exponentialRampToValueAtTime(50, now + 0.3);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.connect(gain);
      gain.connect(this.masterGain || this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.3);
    } catch(e) {}
  }
}

class CyberCentipede {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.w = this.canvas.width;
    this.h = this.canvas.height;

    this.cellSize = 20;
    this.cols = this.w / this.cellSize;
    this.rows = this.h / this.cellSize;

    this.audio = new CentipedeAudioEngine();

    this.score = 0;
    this.highScore = parseInt(localStorage.getItem('cyber_centipede_high') || '0', 10);
    this.lives = 3;
    this.wave = 1;
    this.gameOver = false;

    // Player Blaster
    this.player = {
      x: this.w / 2,
      y: this.h - 30,
      speed: 4.5,
      radius: 9,
      minY: this.h - 120, // Player zone limit
      maxY: this.h - 15
    };

    this.lasers = [];
    this.lastFireTime = 0;
    this.mushrooms = []; // { c, r, hp }
    this.centipedes = []; // Array of segment chains
    this.spiders = []; // Jumping spiders
    this.particles = [];
    this.input = {};

    this.initMushrooms();
    this.spawnCentipede();
    this.initUI();
    this.loop();
  }

  initUI() {
    window.focus();
    window.addEventListener('click', () => window.focus());
    document.getElementById('high-score-val').textContent = this.highScore.toLocaleString();

    // Keyboard
    window.addEventListener('keydown', (e) => {
      this.input[e.code] = true;
      if (e.code === 'Space') {
        e.preventDefault();
        this.fireLaser();
      }
    });
    window.addEventListener('keyup', (e) => {
      this.input[e.code] = false;
    });

    // Mouse movement aim inside canvas
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.w / rect.width;
      const scaleY = this.h / rect.height;
      const mx = (e.clientX - rect.left) * scaleX;
      const my = (e.clientY - rect.top) * scaleY;

      this.player.x = Math.max(15, Math.min(this.w - 15, mx));
      this.player.y = Math.max(this.player.minY, Math.min(this.player.maxY, my));
    });

    this.canvas.addEventListener('mousedown', () => this.fireLaser());

    // Touch D-Pad & Fire button
    document.querySelectorAll('.dpad-btn').forEach(btn => {
      const dir = btn.dataset.dir;
      const start = (e) => { e.preventDefault(); this.input[dir] = true; };
      const end = (e) => { e.preventDefault(); this.input[dir] = false; };
      btn.addEventListener('mousedown', start);
      btn.addEventListener('mouseup', end);
      btn.addEventListener('touchstart', start, { passive: false });
      btn.addEventListener('touchend', end, { passive: false });
    });

    document.getElementById('btn-fire').addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.fireLaser();
    }, { passive: false });
    document.getElementById('btn-fire').addEventListener('click', () => this.fireLaser());

    // Sound toggle
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

  initMushrooms() {
    this.mushrooms = [];
    for (let r = 2; r < this.rows - 5; r++) {
      for (let c = 1; c < this.cols - 1; c++) {
        if (Math.random() < 0.08) {
          this.mushrooms.push({ c, r, hp: 4 });
        }
      }
    }
  }

  spawnCentipede() {
    const length = 10 + Math.min(this.wave * 2, 8);
    const segments = [];
    for (let i = 0; i < length; i++) {
      segments.push({
        x: (this.cols / 2 - i) * this.cellSize + this.cellSize / 2,
        y: 1 * this.cellSize + this.cellSize / 2,
        dir: 1, // 1 = right, -1 = left
        isHead: i === 0,
        radius: 8
      });
    }
    this.centipedes.push(segments);
  }

  fireLaser() {
    if (this.gameOver) return;
    const now = performance.now();
    if (now - this.lastFireTime < 130) return; // Fire rate limiter
    this.lastFireTime = now;

    this.lasers.push({
      x: this.player.x,
      y: this.player.y - 12,
      speed: 12,
      radius: 3
    });
    this.audio.playLaser();
  }

  restart() {
    this.score = 0;
    this.lives = 3;
    this.wave = 1;
    this.gameOver = false;
    this.lasers = [];
    this.centipedes = [];
    this.spiders = [];
    this.particles = [];

    this.player.x = this.w / 2;
    this.player.y = this.h - 30;

    this.initMushrooms();
    this.spawnCentipede();

    document.getElementById('modal-overlay').classList.add('hidden');
    this.updateHUD();
  }

  updateHUD() {
    document.getElementById('score-val').textContent = this.score.toLocaleString();
    document.getElementById('high-score-val').textContent = this.highScore.toLocaleString();
    document.getElementById('wave-val').textContent = this.wave;
    document.getElementById('lives-val').textContent = '❤️'.repeat(Math.max(0, this.lives));
  }

  addScore(pts) {
    this.score += pts;
    if (this.score > this.highScore) {
      this.highScore = this.score;
      localStorage.setItem('cyber_centipede_high', this.highScore.toString());
    }
    this.updateHUD();

    if (window.parent && window.parent !== window) {
      try {
        window.parent.postMessage({
          game: 'cyber-centipede',
          score: this.score
        }, '*');
      } catch (e) {}
    }
  }

  loop() {
    this.update();
    this.render();
    requestAnimationFrame(() => this.loop());
  }

  update() {
    if (this.gameOver) return;

    // Keyboard Player Movement
    if (this.input['KeyA'] || this.input['ArrowLeft'] || this.input['left']) {
      this.player.x = Math.max(15, this.player.x - this.player.speed);
    }
    if (this.input['KeyD'] || this.input['ArrowRight'] || this.input['right']) {
      this.player.x = Math.min(this.w - 15, this.player.x + this.player.speed);
    }
    if (this.input['KeyW'] || this.input['ArrowUp'] || this.input['up']) {
      this.player.y = Math.max(this.player.minY, this.player.y - this.player.speed);
    }
    if (this.input['KeyS'] || this.input['ArrowDown'] || this.input['down']) {
      this.player.y = Math.min(this.player.maxY, this.player.y + this.player.speed);
    }

    // Update Lasers
    for (let i = this.lasers.length - 1; i >= 0; i--) {
      const l = this.lasers[i];
      l.y -= l.speed;

      // Laser vs Mushroom
      let laserHit = false;
      for (let m = this.mushrooms.length - 1; m >= 0; m--) {
        const shroom = this.mushrooms[m];
        const mx = shroom.c * this.cellSize + this.cellSize / 2;
        const my = shroom.r * this.cellSize + this.cellSize / 2;

        if (Math.hypot(l.x - mx, l.y - my) < 12) {
          laserHit = true;
          shroom.hp--;
          this.audio.playPop();
          this.spawnSparks(mx, my, '#22c55e', 4);

          if (shroom.hp <= 0) {
            this.mushrooms.splice(m, 1);
            this.addScore(5);
          }
          break;
        }
      }

      // Laser vs Centipede
      if (!laserHit) {
        for (let c = this.centipedes.length - 1; c >= 0; c--) {
          const chain = this.centipedes[c];
          for (let s = 0; s < chain.length; s++) {
            const seg = chain[s];
            if (Math.hypot(l.x - seg.x, l.y - seg.y) < seg.radius + l.radius) {
              laserHit = true;
              this.audio.playPop();
              this.addScore(seg.isHead ? 100 : 25);
              this.spawnSparks(seg.x, seg.y, '#ec4899', 8);

              // Spawn mushroom at destroyed segment position
              const sc = Math.floor(seg.x / this.cellSize);
              const sr = Math.floor(seg.y / this.cellSize);
              if (sr < this.rows - 2 && !this.mushrooms.some(m => m.c === sc && m.r === sr)) {
                this.mushrooms.push({ c: sc, r: sr, hp: 4 });
              }

              // Split centipede chain
              const leftChain = chain.slice(0, s);
              const rightChain = chain.slice(s + 1);

              this.centipedes.splice(c, 1);
              if (leftChain.length > 0) {
                leftChain[leftChain.length - 1].isHead = true;
                this.centipedes.push(leftChain);
              }
              if (rightChain.length > 0) {
                rightChain[0].isHead = true;
                this.centipedes.push(rightChain);
              }
              break;
            }
          }
          if (laserHit) break;
        }
      }

      // Laser vs Spider
      if (!laserHit) {
        for (let sp = this.spiders.length - 1; sp >= 0; sp--) {
          const spider = this.spiders[sp];
          if (Math.hypot(l.x - spider.x, l.y - spider.y) < spider.radius + l.radius) {
            laserHit = true;
            this.audio.playPop();
            this.addScore(300);
            this.spawnSparks(spider.x, spider.y, '#f59e0b', 12);
            this.spiders.splice(sp, 1);
            break;
          }
        }
      }

      if (laserHit || l.y < 0) {
        this.lasers.splice(i, 1);
      }
    }

    // Update Centipede Movement
    const centipedeSpeed = 1.8 + this.wave * 0.2;
    for (let c = this.centipedes.length - 1; c >= 0; c--) {
      const chain = this.centipedes[c];
      if (chain.length === 0) {
        this.centipedes.splice(c, 1);
        continue;
      }

      const head = chain[0];
      head.x += head.dir * centipedeSpeed;

      // Check wall collision or mushroom ahead
      const nextCol = Math.floor((head.x + head.dir * head.radius) / this.cellSize);
      const curRow = Math.floor(head.y / this.cellSize);

      const hitWall = head.x <= head.radius || head.x >= this.w - head.radius;
      const hitShroom = this.mushrooms.some(m => m.c === nextCol && m.r === curRow);

      if (hitWall || hitShroom) {
        head.dir *= -1;
        head.y += this.cellSize;
        if (head.y > this.h - 15) {
          head.y = this.player.minY; // Loop back into player zone
        }
      }

      // Follower segments track previous positions
      for (let s = 1; s < chain.length; s++) {
        const seg = chain[s];
        const prev = chain[s - 1];
        const dx = prev.x - seg.x;
        const dy = prev.y - seg.y;
        const dist = Math.hypot(dx, dy);

        if (dist > this.cellSize * 0.85) {
          seg.x += (dx / dist) * centipedeSpeed;
          seg.y += (dy / dist) * centipedeSpeed;
        }
      }

      // Player Collision with Centipede
      for (let s = 0; s < chain.length; s++) {
        const seg = chain[s];
        if (Math.hypot(this.player.x - seg.x, this.player.y - seg.y) < this.player.radius + seg.radius) {
          this.onPlayerHit();
          return;
        }
      }
    }

    // Spawn Random Cyber Spider
    if (this.spiders.length === 0 && Math.random() < 0.008) {
      this.spiders.push({
        x: Math.random() < 0.5 ? 10 : this.w - 10,
        y: this.player.minY + 20,
        vx: (Math.random() < 0.5 ? 1 : -1) * 2.2,
        vy: 2.0,
        radius: 12
      });
    }

    // Update Spiders
    for (let sp = this.spiders.length - 1; sp >= 0; sp--) {
      const spider = this.spiders[sp];
      spider.x += spider.vx;
      spider.y += spider.vy;

      if (spider.y < this.player.minY || spider.y > this.player.maxY) {
        spider.vy *= -1;
      }
      if (spider.x < 0 || spider.x > this.w) {
        this.spiders.splice(sp, 1);
        continue;
      }

      // Player vs Spider
      if (Math.hypot(this.player.x - spider.x, this.player.y - spider.y) < this.player.radius + spider.radius) {
        this.onPlayerHit();
        return;
      }
    }

    // Next Wave Condition
    if (this.centipedes.length === 0) {
      this.wave++;
      this.audio.playPop();
      this.spawnCentipede();
      this.updateHUD();
    }

    // Update Particles
    for (let p = this.particles.length - 1; p >= 0; p--) {
      const pt = this.particles[p];
      pt.x += pt.vx;
      pt.y += pt.vy;
      pt.life -= 0.04;
      if (pt.life <= 0) this.particles.splice(p, 1);
    }
  }

  onPlayerHit() {
    this.lives--;
    this.audio.playHit();
    this.spawnSparks(this.player.x, this.player.y, '#ef4444', 20);
    this.updateHUD();

    if (this.lives <= 0) {
      this.gameOver = true;
      document.getElementById('modal-final-score').textContent = this.score.toLocaleString();
      document.getElementById('modal-overlay').classList.remove('hidden');
    } else {
      this.player.x = this.w / 2;
      this.player.y = this.h - 30;
      this.centipedes = [];
      this.spawnCentipede();
    }
  }

  spawnSparks(x, y, color, count) {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x, y,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        color,
        life: 1.0
      });
    }
  }

  render() {
    this.ctx.fillStyle = '#02040a';
    this.ctx.fillRect(0, 0, this.w, this.h);

    // Draw Player Zone Guide Line
    this.ctx.strokeStyle = 'rgba(0, 243, 255, 0.15)';
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.moveTo(0, this.player.minY);
    this.ctx.lineTo(this.w, this.player.minY);
    this.ctx.stroke();

    // 1. Render Mushrooms (Neon Cyber Fungi)
    this.mushrooms.forEach(m => {
      const mx = m.c * this.cellSize + this.cellSize / 2;
      const my = m.r * this.cellSize + this.cellSize / 2;
      const colors = ['#10b981', '#059669', '#047857', '#065f46'];
      this.ctx.fillStyle = colors[4 - m.hp] || '#10b981';
      this.ctx.shadowColor = '#10b981';
      this.ctx.shadowBlur = 8;
      this.ctx.beginPath();
      this.ctx.arc(mx, my, 7, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.shadowBlur = 0;
    });

    // 2. Render Centipedes
    this.centipedes.forEach(chain => {
      chain.forEach(seg => {
        this.ctx.fillStyle = seg.isHead ? '#ec4899' : '#00f3ff';
        this.ctx.shadowColor = seg.isHead ? '#ec4899' : '#00f3ff';
        this.ctx.shadowBlur = 12;
        this.ctx.beginPath();
        this.ctx.arc(seg.x, seg.y, seg.radius, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.shadowBlur = 0;

        // Eyes on Head
        if (seg.isHead) {
          this.ctx.fillStyle = '#ffffff';
          this.ctx.beginPath();
          this.ctx.arc(seg.x + seg.dir * 4, seg.y - 2, 2.5, 0, Math.PI * 2);
          this.ctx.fill();
        }
      });
    });

    // 3. Render Spiders
    this.spiders.forEach(spider => {
      this.ctx.fillStyle = '#f59e0b';
      this.ctx.shadowColor = '#f59e0b';
      this.ctx.shadowBlur = 14;
      this.ctx.beginPath();
      this.ctx.arc(spider.x, spider.y, spider.radius, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.shadowBlur = 0;
    });

    // 4. Render Lasers
    this.ctx.fillStyle = '#fbbf24';
    this.ctx.shadowColor = '#f59e0b';
    this.ctx.shadowBlur = 10;
    this.lasers.forEach(l => {
      this.ctx.beginPath();
      this.ctx.arc(l.x, l.y, l.radius, 0, Math.PI * 2);
      this.ctx.fill();
    });
    this.ctx.shadowBlur = 0;

    // 5. Render Player Plasma Blaster
    this.ctx.fillStyle = '#00f3ff';
    this.ctx.shadowColor = '#00f3ff';
    this.ctx.shadowBlur = 15;

    // Blaster cannon
    this.ctx.fillRect(this.player.x - 3, this.player.y - 14, 6, 12);
    // Blaster base
    this.ctx.beginPath();
    this.ctx.arc(this.player.x, this.player.y, this.player.radius, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.shadowBlur = 0;

    // 6. Render Particles
    this.particles.forEach(p => {
      this.ctx.fillStyle = p.color;
      this.ctx.globalAlpha = Math.max(0, p.life);
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.globalAlpha = 1.0;
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.centipedeGame = new CyberCentipede();
});
