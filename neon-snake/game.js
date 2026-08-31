/**
 * Neon Snake: Cyber Helix — Arcade Grid Engine
 */

class SnakeAudioEngine {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.isBGMPlaying = false;
    this.bgmTimer = null;
    this.step = 0;
    this.tempo = 122;

    // Dark Electro Acid Chords: Gm, Eb, F, Dm
    this.chords = [
      [196.00, 233.08, 293.66], // Gm
      [155.56, 196.00, 233.08], // Eb
      [174.61, 220.00, 261.63], // F
      [146.83, 174.61, 220.00]  // Dm
    ];
    this.bassNotes = [98.00, 77.78, 87.31, 73.42];
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
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(bass, now);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.connect(gain);
        gain.connect(this.masterGain || this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.2);
      } catch(e) {}
    }

    if (step % 2 === 0) {
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        const chord = this.chords[bar % this.chords.length];
        const note = chord[(step / 2) % 3];
        osc.frequency.setValueAtTime(note * 2, now);
        gain.gain.setValueAtTime(0.025, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc.connect(gain);
        gain.connect(this.masterGain || this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.12);
      } catch(e) {}
    }
  }

  playEat() {
    if (!this.enabled || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.1);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      osc.connect(gain);
      gain.connect(this.masterGain || this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.1);
    } catch(e) {}
  }

  playCrash() {
    if (!this.enabled || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(35, now + 0.4);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      osc.connect(gain);
      gain.connect(this.masterGain || this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.45);
    } catch(e) {}
  }
}

class NeonSnake {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.w = this.canvas.width;
    this.h = this.canvas.height;

    this.gridSize = 20;
    this.cols = this.w / this.gridSize;
    this.rows = this.h / this.gridSize;

    this.audio = new SnakeAudioEngine();

    this.snake = [
      { x: 10, y: 10 },
      { x: 9, y: 10 },
      { x: 8, y: 10 }
    ];
    this.dir = { x: 1, y: 0 };
    this.nextDir = { x: 1, y: 0 };

    this.food = { x: 15, y: 10, type: 'core' };
    this.score = 0;
    this.highScore = parseInt(localStorage.getItem('neon_snake_high') || '0', 10);
    this.gameOver = false;

    this.stepTimer = 0;
    this.stepInterval = 110;
    this.lastTime = 0;
    this.particles = [];

    this.initUI();
    this.loop();
  }

  initUI() {
    window.focus();
    window.addEventListener('click', () => window.focus());
    document.getElementById('high-score-val').textContent = this.highScore.toLocaleString();

    window.addEventListener('keydown', (e) => {
      if (this.gameOver) return;
      if ((e.code === 'KeyW' || e.code === 'ArrowUp') && this.dir.y === 0) {
        this.nextDir = { x: 0, y: -1 };
      } else if ((e.code === 'KeyS' || e.code === 'ArrowDown') && this.dir.y === 0) {
        this.nextDir = { x: 0, y: 1 };
      } else if ((e.code === 'KeyA' || e.code === 'ArrowLeft') && this.dir.x === 0) {
        this.nextDir = { x: -1, y: 0 };
      } else if ((e.code === 'KeyD' || e.code === 'ArrowRight') && this.dir.x === 0) {
        this.nextDir = { x: 1, y: 0 };
      }
    });

    document.querySelectorAll('.dpad-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const dir = e.currentTarget.dataset.dir;
        if (dir === 'up' && this.dir.y === 0) this.nextDir = { x: 0, y: -1 };
        if (dir === 'down' && this.dir.y === 0) this.nextDir = { x: 0, y: 1 };
        if (dir === 'left' && this.dir.x === 0) this.nextDir = { x: -1, y: 0 };
        if (dir === 'right' && this.dir.x === 0) this.nextDir = { x: 1, y: 0 };
      });
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

    document.getElementById('modal-btn-restart').addEventListener('click', () => this.restart());
    this.updateHUD();
  }

  spawnFood() {
    let valid = false;
    let fx, fy;
    while (!valid) {
      fx = Math.floor(Math.random() * this.cols);
      fy = Math.floor(Math.random() * this.rows);
      valid = !this.snake.some(seg => seg.x === fx && seg.y === fy);
    }
    const isSpecial = Math.random() < 0.25;
    this.food = { x: fx, y: fy, type: isSpecial ? 'gem' : 'core' };
  }

  restart() {
    this.snake = [
      { x: 10, y: 10 },
      { x: 9, y: 10 },
      { x: 8, y: 10 }
    ];
    this.dir = { x: 1, y: 0 };
    this.nextDir = { x: 1, y: 0 };
    this.score = 0;
    this.gameOver = false;
    this.particles = [];
    this.spawnFood();

    document.getElementById('modal-overlay').classList.add('hidden');
    this.updateHUD();
  }

  updateHUD() {
    document.getElementById('score-val').textContent = this.score.toLocaleString();
    document.getElementById('high-score-val').textContent = this.highScore.toLocaleString();
    document.getElementById('length-val').textContent = this.snake.length;
  }

  loop(time = 0) {
    const dt = time - this.lastTime;
    this.lastTime = time;

    this.stepTimer += dt;
    if (this.stepTimer > this.stepInterval && !this.gameOver) {
      this.step();
      this.stepTimer = 0;
    }

    this.render();
    requestAnimationFrame((t) => this.loop(t));
  }

  step() {
    this.dir = this.nextDir;
    const head = { x: this.snake[0].x + this.dir.x, y: this.snake[0].y + this.dir.y };

    // Wall Collision
    if (head.x < 0 || head.x >= this.cols || head.y < 0 || head.y >= this.rows) {
      this.onCrash();
      return;
    }

    // Self Collision
    if (this.snake.some(seg => seg.x === head.x && seg.y === head.y)) {
      this.onCrash();
      return;
    }

    this.snake.unshift(head);

    // Eat Food
    if (head.x === this.food.x && head.y === this.food.y) {
      const pts = this.food.type === 'gem' ? 300 : 100;
      this.score += pts;
      this.audio.playEat();
      if (this.score > this.highScore) {
        this.highScore = this.score;
        localStorage.setItem('neon_snake_high', this.highScore.toString());
      }

      // Spark particles
      for (let i = 0; i < 12; i++) {
        this.particles.push({
          x: head.x * this.gridSize + this.gridSize / 2,
          y: head.y * this.gridSize + this.gridSize / 2,
          vx: (Math.random() - 0.5) * 6,
          vy: (Math.random() - 0.5) * 6,
          color: this.food.type === 'gem' ? '#ec4899' : '#00f3ff',
          life: 1.0
        });
      }

      this.spawnFood();
      this.updateHUD();

      if (window.parent && window.parent !== window) {
        try {
          window.parent.postMessage({
            game: 'neon-snake',
            score: this.score
          }, '*');
        } catch (e) {}
      }
    } else {
      this.snake.pop();
    }
  }

  onCrash() {
    this.gameOver = true;
    this.audio.playCrash();

    const head = this.snake[0];
    for (let i = 0; i < 25; i++) {
      this.particles.push({
        x: head.x * this.gridSize + this.gridSize / 2,
        y: head.y * this.gridSize + this.gridSize / 2,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8,
        color: '#ef4444',
        life: 1.0
      });
    }

    document.getElementById('modal-final-score').textContent = this.score.toLocaleString();
    document.getElementById('modal-overlay').classList.remove('hidden');
  }

  render() {
    this.ctx.fillStyle = '#02040a';
    this.ctx.fillRect(0, 0, this.w, this.h);

    // Subtle Grid
    this.ctx.strokeStyle = 'rgba(0, 243, 255, 0.05)';
    this.ctx.lineWidth = 1;
    for (let x = 0; x < this.w; x += this.gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.h);
      this.ctx.stroke();
    }
    for (let y = 0; y < this.h; y += this.gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.w, y);
      this.ctx.stroke();
    }

    // Food
    const fx = this.food.x * this.gridSize + this.gridSize / 2;
    const fy = this.food.y * this.gridSize + this.gridSize / 2;
    const foodColor = this.food.type === 'gem' ? '#ec4899' : '#facc15';
    this.ctx.fillStyle = foodColor;
    this.ctx.shadowColor = foodColor;
    this.ctx.shadowBlur = 12;
    this.ctx.beginPath();
    this.ctx.arc(fx, fy, 7, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.shadowBlur = 0;

    // Snake Body
    this.snake.forEach((seg, idx) => {
      const sx = seg.x * this.gridSize + 2;
      const sy = seg.y * this.gridSize + 2;
      const color = idx === 0 ? '#00f3ff' : '#10b981';

      this.ctx.fillStyle = color;
      this.ctx.shadowColor = color;
      this.ctx.shadowBlur = idx === 0 ? 12 : 6;
      this.ctx.fillRect(sx, sy, this.gridSize - 4, this.gridSize - 4);
      this.ctx.shadowBlur = 0;
    });

    // Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.04;

      this.ctx.fillStyle = p.color;
      this.ctx.globalAlpha = Math.max(0, p.life);
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.globalAlpha = 1.0;

      if (p.life <= 0) this.particles.splice(i, 1);
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.snakeGame = new NeonSnake();
});
