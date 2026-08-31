/**
 * Shadow Lurker: Deep Bunker — 2D Flashlight Horror Engine
 */

class BunkerAudioEngine {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.isBGMPlaying = false;
    this.bgmTimer = null;
    this.step = 0;
    this.tempo = 80;

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
      this.step = (this.step + 1) % 32;
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

    // Heartbeat Pulse
    if (step % 8 === 0 || step % 8 === 2) {
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(55, now);
        osc.frequency.exponentialRampToValueAtTime(30, now + 0.12);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.connect(gain);
        gain.connect(this.masterGain || this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.15);
      } catch(e) {}
    }
  }

  playKeycard() {
    if (!this.enabled || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(1760, now + 0.15);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      osc.connect(gain);
      gain.connect(this.masterGain || this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.18);
    } catch(e) {}
  }

  playJumpscare() {
    if (!this.enabled || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.6);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
      osc.connect(gain);
      gain.connect(this.masterGain || this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.7);
    } catch(e) {}
  }
}

class DarkCorridors {
  constructor() {
    this.canvas = document.getElementById('bunkerCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.w = this.canvas.width;
    this.h = this.canvas.height;

    this.audio = new BunkerAudioEngine();

    // 15x15 Bunker Grid (0 = empty, 1 = concrete wall)
    this.tileSize = 30;
    this.map = [
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      [1,0,0,0,1,0,0,0,0,0,1,0,0,0,1],
      [1,0,1,0,1,0,1,1,1,0,1,0,1,0,1],
      [1,0,1,0,0,0,0,0,1,0,0,0,1,0,1],
      [1,0,1,1,1,1,0,0,1,1,1,0,1,0,1],
      [1,0,0,0,0,1,0,0,0,0,1,0,0,0,1],
      [1,1,1,0,0,1,1,0,1,0,1,1,1,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,1,1,1,0,1,1,1,0,1,1,1,0,1],
      [1,0,0,0,1,0,0,0,1,0,0,0,1,0,1],
      [1,0,1,0,1,1,1,0,1,1,1,0,1,0,1],
      [1,0,1,0,0,0,0,0,0,0,0,0,1,0,1],
      [1,0,1,1,1,0,1,1,1,0,1,1,1,0,1],
      [1,0,0,0,0,0,1,0,0,0,0,0,0,0,1],
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
    ];

    this.player = {
      x: 1.5 * this.tileSize,
      y: 1.5 * this.tileSize,
      angle: 0,
      speed: 2.2
    };

    this.monster = {
      x: 13.5 * this.tileSize,
      y: 13.5 * this.tileSize,
      speed: 1.4
    };

    this.keys = [
      { x: 13.5 * this.tileSize, y: 1.5 * this.tileSize, found: false },
      { x: 1.5 * this.tileSize, y: 13.5 * this.tileSize, found: false },
      { x: 7.5 * this.tileSize, y: 7.5 * this.tileSize, found: false },
      { x: 13.5 * this.tileSize, y: 7.5 * this.tileSize, found: false }
    ];

    this.keysFound = 0;
    this.battery = 100;
    this.flashlightOn = true;
    this.gameOver = false;

    // Dedicated offscreen lighting mask canvas
    this.maskCanvas = document.createElement('canvas');
    this.maskCanvas.width = this.w;
    this.maskCanvas.height = this.h;
    this.mctx = this.maskCanvas.getContext('2d');

    this.input = { up: false, down: false, left: false, right: false };

    this.initUI();
    this.loop();
  }

  initUI() {
    window.focus();
    window.addEventListener('click', () => window.focus());

    window.addEventListener('keydown', (e) => {
      if (['KeyW', 'ArrowUp'].includes(e.code)) this.input.up = true;
      if (['KeyS', 'ArrowDown'].includes(e.code)) this.input.down = true;
      if (['KeyA', 'ArrowLeft'].includes(e.code)) this.input.left = true;
      if (['KeyD', 'ArrowRight'].includes(e.code)) this.input.right = true;
      if (e.code === 'KeyF') this.toggleFlashlight();
    });

    window.addEventListener('keyup', (e) => {
      if (['KeyW', 'ArrowUp'].includes(e.code)) this.input.up = false;
      if (['KeyS', 'ArrowDown'].includes(e.code)) this.input.down = false;
      if (['KeyA', 'ArrowLeft'].includes(e.code)) this.input.left = false;
      if (['KeyD', 'ArrowRight'].includes(e.code)) this.input.right = false;
    });

    // Mouse aiming for flashlight beam
    this.canvas.addEventListener('mousemove', (e) => {
      if (this.gameOver) return;
      const rect = this.canvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left) * (this.w / rect.width);
      const my = (e.clientY - rect.top) * (this.h / rect.height);
      this.player.angle = Math.atan2(my - this.player.y, mx - this.player.x);
    });

    document.querySelectorAll('.dpad-btn').forEach(btn => {
      const dir = btn.dataset.dir;
      btn.addEventListener('touchstart', (e) => { e.preventDefault(); this.input[dir] = true; });
      btn.addEventListener('touchend', (e) => { e.preventDefault(); this.input[dir] = false; });
      btn.addEventListener('mousedown', () => { this.input[dir] = true; });
      btn.addEventListener('mouseup', () => { this.input[dir] = false; });
    });

    document.getElementById('btn-toggle-light').addEventListener('click', () => this.toggleFlashlight());
    document.getElementById('modal-btn-restart').addEventListener('click', () => this.restart());
    this.updateHUD();
  }

  toggleFlashlight() {
    this.flashlightOn = !this.flashlightOn;
    document.getElementById('btn-toggle-light').textContent = this.flashlightOn ? '🔦 LIGHT: ON' : '🌑 LIGHT: OFF';
  }

  isWall(x, y) {
    const gx = Math.floor(x / this.tileSize);
    const gy = Math.floor(y / this.tileSize);
    if (gy < 0 || gy >= this.map.length || gx < 0 || gx >= this.map[0].length) return true;
    return this.map[gy][gx] === 1;
  }

  loop() {
    this.update();
    this.render();
    requestAnimationFrame(() => this.loop());
  }

  update() {
    if (this.gameOver) return;

    // Player Movement
    let dx = 0;
    let dy = 0;
    if (this.input.up) dy -= this.player.speed;
    if (this.input.down) dy += this.player.speed;
    if (this.input.left) dx -= this.player.speed;
    if (this.input.right) dx += this.player.speed;

    if (dx !== 0 && dy !== 0) {
      dx *= 0.707;
      dy *= 0.707;
    }

    // Only update angle from movement if no mouse aiming active
    if ((dx !== 0 || dy !== 0) && !this.mouseAiming) {
      this.player.angle = Math.atan2(dy, dx);
    }

    const nextX = this.player.x + dx;
    const nextY = this.player.y + dy;
    const r = 8;

    if (!this.isWall(nextX - r, this.player.y) && !this.isWall(nextX + r, this.player.y)) {
      this.player.x = nextX;
    }
    if (!this.isWall(this.player.x, nextY - r) && !this.isWall(this.player.x, nextY + r)) {
      this.player.y = nextY;
    }

    // Flashlight Battery Drain
    if (this.flashlightOn) {
      this.battery = Math.max(0, this.battery - 0.04);
      if (this.battery <= 0) this.flashlightOn = false;
    }

    // Check Keycards
    this.keys.forEach(k => {
      if (!k.found) {
        const dist = Math.hypot(this.player.x - k.x, this.player.y - k.y);
        if (dist < 18) {
          k.found = true;
          this.keysFound++;
          this.audio.playKeycard();
          this.updateHUD();

          if (this.keysFound === 4) {
            this.onEscape();
          }
        }
      }
    });

    // Monster AI (Stalks player)
    const mdx = this.player.x - this.monster.x;
    const mdy = this.player.y - this.monster.y;
    const mdist = Math.hypot(mdx, mdy);

    if (mdist > 0) {
      const mvx = (mdx / mdist) * this.monster.speed;
      const mvy = (mdy / mdist) * this.monster.speed;

      if (!this.isWall(this.monster.x + mvx, this.monster.y)) this.monster.x += mvx;
      if (!this.isWall(this.monster.x, this.monster.y + mvy)) this.monster.y += mvy;
    }

    // Danger Level & Heartbeat
    if (mdist < 80) {
      document.getElementById('danger-val').textContent = 'CRITICAL 🩸';
      document.getElementById('danger-val').style.color = '#ef4444';
    } else if (mdist < 160) {
      document.getElementById('danger-val').textContent = 'HIGH ⚠️';
      document.getElementById('danger-val').style.color = '#f59e0b';
    } else {
      document.getElementById('danger-val').textContent = 'LOW 🖤';
      document.getElementById('danger-val').style.color = '#64748b';
    }

    // Jumpscare collision
    if (mdist < 18) {
      this.onCaptured();
    }
  }

  onCaptured() {
    this.gameOver = true;
    this.audio.playJumpscare();
    document.getElementById('modal-icon').textContent = '💀🖤';
    document.getElementById('modal-title').textContent = 'CONSUMED BY SHADOWS';
    document.getElementById('modal-desc').textContent = 'The Shadow Lurker cornered you in the dark.';
    document.getElementById('modal-keys').textContent = `${this.keysFound} / 4`;
    document.getElementById('modal-overlay').classList.remove('hidden');
  }

  onEscape() {
    this.gameOver = true;
    document.getElementById('modal-icon').textContent = '🚪🏃';
    document.getElementById('modal-title').textContent = 'BUNKER EVACUATED!';
    document.getElementById('modal-desc').textContent = 'You collected all 4 keycards and unlocked the bunker elevator!';
    document.getElementById('modal-keys').textContent = `4 / 4 (COMPLETE)`;
    document.getElementById('modal-overlay').classList.remove('hidden');

    if (window.parent && window.parent !== window) {
      try {
        window.parent.postMessage({
          game: 'dark-corridors',
          score: 5000
        }, '*');
      } catch (e) {}
    }
  }

  restart() {
    this.player.x = 1.5 * this.tileSize;
    this.player.y = 1.5 * this.tileSize;
    this.monster.x = 13.5 * this.tileSize;
    this.monster.y = 13.5 * this.tileSize;
    this.keys.forEach(k => k.found = false);
    this.keysFound = 0;
    this.battery = 100;
    this.flashlightOn = true;
    this.gameOver = false;
    document.getElementById('modal-overlay').classList.add('hidden');
    this.updateHUD();
  }

  updateHUD() {
    document.getElementById('keys-val').textContent = `${this.keysFound} / 4 💳`;
    document.getElementById('battery-bar').style.width = `${Math.max(0, this.battery)}%`;
  }

  render() {
    this.ctx.fillStyle = '#02040a';
    this.ctx.fillRect(0, 0, this.w, this.h);

    // Draw Map Walls
    for (let r = 0; r < this.map.length; r++) {
      for (let c = 0; c < this.map[r].length; c++) {
        if (this.map[r][c] === 1) {
          this.ctx.fillStyle = '#1e293b';
          this.ctx.fillRect(c * this.tileSize, r * this.tileSize, this.tileSize, this.tileSize);
          this.ctx.strokeStyle = '#334155';
          this.ctx.strokeRect(c * this.tileSize, r * this.tileSize, this.tileSize, this.tileSize);
        }
      }
    }

    // Keycards
    this.keys.forEach(k => {
      if (!k.found) {
        this.ctx.fillStyle = '#00f3ff';
        this.ctx.shadowColor = '#00f3ff';
        this.ctx.shadowBlur = 10;
        this.ctx.fillRect(k.x - 6, k.y - 4, 12, 8);
        this.ctx.shadowBlur = 0;
      }
    });

    // Shadow Lurker Monster (Stalker)
    this.ctx.fillStyle = '#ef4444';
    this.ctx.shadowColor = '#ef4444';
    this.ctx.shadowBlur = 14;
    this.ctx.beginPath();
    this.ctx.arc(this.monster.x, this.monster.y, 8, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.shadowBlur = 0;

    // Player
    this.ctx.fillStyle = '#38bdf8';
    this.ctx.beginPath();
    this.ctx.arc(this.player.x, this.player.y, 7, 0, Math.PI * 2);
    this.ctx.fill();

    // Flashlight & Darkness Composite Mask (destination-out)
    this.mctx.globalCompositeOperation = 'source-over';
    this.mctx.fillStyle = 'rgba(2, 4, 10, 0.97)';
    this.mctx.fillRect(0, 0, this.w, this.h);

    this.mctx.globalCompositeOperation = 'destination-out';

    if (this.flashlightOn) {
      const coneAngle = Math.PI / 2.6; // ~70 degree flashlight cone
      const coneDist = 180;
      const startAngle = this.player.angle - coneAngle / 2;
      const endAngle = this.player.angle + coneAngle / 2;

      // 1. Soft flashlight beam
      const beamGrad = this.mctx.createRadialGradient(
        this.player.x, this.player.y, 10,
        this.player.x, this.player.y, coneDist
      );
      beamGrad.addColorStop(0, 'rgba(0, 0, 0, 1.0)');
      beamGrad.addColorStop(0.75, 'rgba(0, 0, 0, 0.9)');
      beamGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      this.mctx.fillStyle = beamGrad;
      this.mctx.beginPath();
      this.mctx.moveTo(this.player.x, this.player.y);
      this.mctx.arc(this.player.x, this.player.y, coneDist, startAngle, endAngle, false);
      this.mctx.closePath();
      this.mctx.fill();

      // 2. 360-degree ambient body aura around player
      const bodyAura = this.mctx.createRadialGradient(
        this.player.x, this.player.y, 0,
        this.player.x, this.player.y, 45
      );
      bodyAura.addColorStop(0, 'rgba(0, 0, 0, 1.0)');
      bodyAura.addColorStop(1, 'rgba(0, 0, 0, 0)');
      this.mctx.fillStyle = bodyAura;
      this.mctx.beginPath();
      this.mctx.arc(this.player.x, this.player.y, 45, 0, Math.PI * 2);
      this.mctx.fill();
    } else {
      // Dim emergency aura when light is OFF
      const dimAura = this.mctx.createRadialGradient(
        this.player.x, this.player.y, 0,
        this.player.x, this.player.y, 30
      );
      dimAura.addColorStop(0, 'rgba(0, 0, 0, 0.85)');
      dimAura.addColorStop(1, 'rgba(0, 0, 0, 0)');
      this.mctx.fillStyle = dimAura;
      this.mctx.beginPath();
      this.mctx.arc(this.player.x, this.player.y, 30, 0, Math.PI * 2);
      this.mctx.fill();
    }

    // Render darkness mask over world
    this.ctx.drawImage(this.maskCanvas, 0, 0);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.corridorsGame = new DarkCorridors();
});
