/* ==========================================================================
   CYBER INVADERS - COMBINED GAME SCRIPT FOR GITHUB PAGES
   ========================================================================== */

/* ------------------------------------------------------------------------
   1. PROCEDURAL WEB AUDIO SYNTHESIZER (audio.js)
   ------------------------------------------------------------------------ */
class SoundEngine {
  constructor() {
    this.ctx = null;
    this.sfxVolume = 0.8;
    this.musicVolume = 0.6;
    this.isMuted = false;
    
    this.bgmPlaying = false;
    this.bgmInterval = null;
    this.currentStep = 0;

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

    ['click', 'keydown', 'touchstart'].forEach(evt => {
      window.addEventListener(evt, startAudio, { passive: true });
    });
  }

  setSFXVolume(val) {
    this.sfxVolume = Math.max(0, Math.min(1, val));
  }

  setMusicVolume(val) {
    this.musicVolume = Math.max(0, Math.min(1, val));
  }

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

    const duration = intensity === 'heavy' ? 0.6 : (intensity === 'small' ? 0.15 : 0.35);
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(intensity === 'heavy' ? 400 : 800, now);
    filter.frequency.exponentialRampToValueAtTime(30, now + duration);

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

  startBGM() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    if (!this.ctx) return;
    if (this.bgmInterval) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
    this.bgmPlaying = true;
    this.currentStep = 0;

    const bassNotes = [65.41, 65.41, 73.42, 65.41, 87.31, 87.31, 73.42, 65.41];
    
    this.bgmInterval = setInterval(() => {
      if (!this.bgmPlaying || this.isMuted || this.musicVolume <= 0 || !this.ctx) return;
      if (this.ctx.state === 'suspended') this.ctx.resume();

      const now = this.ctx.currentTime;
      const freq = bassNotes[this.currentStep % bassNotes.length];

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

      if (this.currentStep % 2 === 1) {
        this.playHiHat(now);
      }

      this.currentStep++;
    }, 180);
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

const soundEngine = new SoundEngine();

/* ------------------------------------------------------------------------
   2. GAME STATE (state.js)
   ------------------------------------------------------------------------ */
class GameState {
  constructor() {
    this.score = 0;
    this.highScore = 0;
    this.wave = 1;
    this.lives = 3;
    this.kills = 0;
    this.shotsFired = 0;
    this.shotsHit = 0;

    this.combo = 1.0;
    this.maxCombo = 1.0;
    this.comboTimer = 0;

    this.shield = 100;
    this.maxShield = 100;
    this.energy = 100;
    this.maxEnergy = 100;
    this.bombReady = true;

    this.settings = {
      sfxVolume: 0.8,
      musicVolume: 0.6,
      crtLines: true,
      particles: true,
      screenShake: true
    };

    this.isRunning = false;
    this.isPaused = false;
    this.isGameOver = false;
    this.isBossWave = false;

    this.loadSettings();
    this.loadHighScore();
  }

  reset() {
    this.score = 0;
    this.wave = 1;
    this.lives = 1;
    this.kills = 0;
    this.shotsFired = 0;
    this.shotsHit = 0;
    this.combo = 1.0;
    this.maxCombo = 1.0;
    this.comboTimer = 0;
    this.shield = 100;
    this.energy = 100;
    this.isRunning = true;
    this.isPaused = false;
    this.isGameOver = false;
    this.isBossWave = false;
  }

  addScore(amount) {
    const points = Math.round(amount * this.combo);
    this.score += points;
    if (this.score > this.highScore) {
      this.highScore = this.score;
      this.saveHighScore();
    }
    this.incrementCombo();
  }

  incrementCombo() {
    this.combo = parseFloat((this.combo + 0.1).toFixed(1));
    if (this.combo > this.maxCombo) {
      this.maxCombo = this.combo;
    }
    this.comboTimer = 200;
  }

  updateCombo(deltaTime) {
    if (this.comboTimer > 0) {
      this.comboTimer -= deltaTime * 60;
      if (this.comboTimer <= 0) {
        this.combo = 1.0;
        this.comboTimer = 0;
      }
    }
  }

  getAccuracy() {
    if (this.shotsFired === 0) return 100;
    return Math.min(100, Math.round((this.shotsHit / this.shotsFired) * 100));
  }

  loadHighScore() {
    try {
      const saved = localStorage.getItem('cyber_invaders_highscore');
      if (saved) {
        this.highScore = parseInt(saved, 10) || 0;
      }
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }

  saveHighScore() {
    try {
      localStorage.setItem('cyber_invaders_highscore', this.highScore.toString());
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }

  getLeaderboard() {
    try {
      const saved = localStorage.getItem('cyber_invaders_leaderboard');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
    return [
      { name: 'CYBER_ACE', score: 25000, wave: 8 },
      { name: 'VORTEX', score: 18400, wave: 6 },
      { name: 'NEON_FOX', score: 14200, wave: 5 },
      { name: 'STAR_LORD', score: 9800, wave: 4 },
      { name: 'ROOKIE', score: 5200, wave: 2 }
    ];
  }

  saveLeaderboardEntry(name, score, wave) {
    const list = this.getLeaderboard();
    list.push({ name: name.toUpperCase().slice(0, 10), score: score, wave: wave });
    list.sort((a, b) => b.score - a.score);
    const top5 = list.slice(0, 5);
    try {
      localStorage.setItem('cyber_invaders_leaderboard', JSON.stringify(top5));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
    return top5;
  }

  loadSettings() {
    try {
      const saved = localStorage.getItem('cyber_invaders_settings');
      if (saved) {
        this.settings = Object.assign(this.settings, JSON.parse(saved));
      }
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }

  saveSettings() {
    try {
      localStorage.setItem('cyber_invaders_settings', JSON.stringify(this.settings));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }
}

const gameState = new GameState();

/* ------------------------------------------------------------------------
   3. ENTITIES & PARTICLES (entities.js)
   ------------------------------------------------------------------------ */
class Particle {
  constructor(x, y, color, vx, vy, life, size = 3, shape = 'circle') {
    this.x = x;
    this.y = y;
    this.color = color;
    this.vx = vx;
    this.vy = vy;
    this.life = life;
    this.maxLife = life;
    this.size = size;
    this.shape = shape;
  }

  update(dt) {
    this.x += this.vx * dt * 60;
    this.y += this.vy * dt * 60;
    this.life -= dt;
  }

  draw(ctx) {
    if (this.life <= 0) return;
    const alpha = Math.max(0, this.life / this.maxLife);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = this.color;
    ctx.shadowBlur = 10;
    ctx.shadowColor = this.color;

    ctx.beginPath();
    if (this.shape === 'square') {
      ctx.fillRect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
    } else {
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}

class Shockwave {
  constructor(x, y, maxRadius, color) {
    this.x = x;
    this.y = y;
    this.radius = 5;
    this.maxRadius = maxRadius;
    this.color = color;
    this.alpha = 1.0;
  }

  update(dt) {
    this.radius += (this.maxRadius - this.radius) * 8 * dt;
    this.alpha -= dt * 2;
  }

  draw(ctx) {
    if (this.alpha <= 0) return;
    ctx.save();
    ctx.globalAlpha = Math.max(0, this.alpha);
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 3;
    ctx.shadowBlur = 15;
    ctx.shadowColor = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
}

class Player {
  constructor(canvasWidth, canvasHeight) {
    this.width = 44;
    this.height = 40;
    this.x = canvasWidth / 2 - this.width / 2;
    this.y = canvasHeight - 80;
    this.speed = 460;
    this.vx = 0;
    this.vy = 0;
    this.tilt = 0;
    
    this.activeWeapon = 'standard';
    this.weaponTimer = 0;
    
    this.fireCooldown = 0;
    this.dashCooldown = 0;
    this.isDashing = false;
    this.dashTimer = 0;

    this.invulnerableTimer = 0;
  }

  update(dt, keys, canvasWidth, canvasHeight) {
    if (this.weaponTimer > 0) {
      this.weaponTimer -= dt;
      if (this.weaponTimer <= 0) {
        this.activeWeapon = 'standard';
      }
    }

    if (this.invulnerableTimer > 0) {
      this.invulnerableTimer -= dt;
    }

    if (this.fireCooldown > 0) this.fireCooldown -= dt;
    if (this.dashCooldown > 0) this.dashCooldown -= dt;

    if (this.isDashing) {
      this.dashTimer -= dt;
      if (this.dashTimer <= 0) {
        this.isDashing = false;
      }
    }

    let dirX = 0;
    let dirY = 0;

    if (keys['ArrowLeft'] || keys['KeyA']) dirX -= 1;
    if (keys['ArrowRight'] || keys['KeyD']) dirX += 1;
    if (keys['ArrowUp'] || keys['KeyW']) dirY -= 1;
    if (keys['ArrowDown'] || keys['KeyS']) dirY += 1;

    // Normalize diagonal velocity
    let moveMag = 1;
    if (dirX !== 0 && dirY !== 0) {
      moveMag = 0.7071; // 1 / Math.SQRT2
    }

    if (keys['ShiftLeft'] || keys['ShiftRight']) {
      if (this.dashCooldown <= 0 && (dirX !== 0 || dirY !== 0)) {
        this.isDashing = true;
        this.dashTimer = 0.15;
        this.dashCooldown = 1.2;
        soundEngine.playShieldHit();
      }
    }

    const currentSpeed = this.isDashing ? this.speed * 2.5 : this.speed;
    this.x += dirX * moveMag * currentSpeed * dt;
    this.y += dirY * moveMag * currentSpeed * dt;

    // Dynamic Aerospace Banking Tilt
    this.tilt += (dirX * 0.22 - this.tilt) * 12 * dt;

    const cW = canvasWidth || 800;
    const cH = canvasHeight || 600;

    // Keep player within combat bounds (allowing up to 35% height from top)
    this.x = Math.max(10, Math.min(cW - this.width - 10, this.x));
    this.y = Math.max(cH * 0.35, Math.min(cH - this.height - 15, this.y));
  }

  shoot() {
    if (this.fireCooldown > 0) return null;

    gameState.shotsFired++;

    let cooldown = 0.18;
    if (this.activeWeapon === 'spread') cooldown = 0.22;
    if (this.activeWeapon === 'beam') cooldown = 0.12;
    if (this.activeWeapon === 'rocket') cooldown = 0.35;

    this.fireCooldown = cooldown;
    soundEngine.playLaser(this.activeWeapon);

    const bullets = [];
    const cx = this.x + this.width / 2;
    const topY = this.y - 5;

    if (this.activeWeapon === 'spread') {
      bullets.push(new Projectile(cx - 10, topY, -120, -700, 'player', '#ffe600', 'spread'));
      bullets.push(new Projectile(cx, topY, 0, -750, 'player', '#ffe600', 'spread'));
      bullets.push(new Projectile(cx + 10, topY, 120, -700, 'player', '#ffe600', 'spread'));
    } else if (this.activeWeapon === 'beam') {
      bullets.push(new Projectile(cx - 6, topY, 0, -950, 'player', '#00f3ff', 'beam'));
      bullets.push(new Projectile(cx + 6, topY, 0, -950, 'player', '#00f3ff', 'beam'));
    } else if (this.activeWeapon === 'rocket') {
      bullets.push(new Projectile(cx, topY, 0, -600, 'player', '#ff0055', 'rocket'));
    } else {
      bullets.push(new Projectile(cx, topY, 0, -750, 'player', '#00f3ff', 'standard'));
    }

    return bullets;
  }

  draw(ctx, particles) {
    if (this.invulnerableTimer > 0 && Math.floor(Date.now() / 100) % 2 === 0) {
      return;
    }

    ctx.save();
    ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
    ctx.rotate(this.tilt);

    if (Math.random() < 0.85 && gameState.settings.particles) {
      // Dual Thruster Exhaust Particles
      particles.push(new Particle(
        this.x + this.width * 0.35 + (Math.random() * 4 - 2),
        this.y + this.height - 2,
        '#00f3ff',
        (Math.random() - 0.5) * 2,
        Math.random() * 5 + 4,
        0.25,
        3
      ));
      particles.push(new Particle(
        this.x + this.width * 0.65 + (Math.random() * 4 - 2),
        this.y + this.height - 2,
        '#00f3ff',
        (Math.random() - 0.5) * 2,
        Math.random() * 5 + 4,
        0.25,
        3
      ));
    }

    ctx.shadowBlur = 15;
    ctx.shadowColor = this.isDashing ? '#ff0055' : '#00f3ff';
    ctx.strokeStyle = this.isDashing ? '#ff0055' : '#00f3ff';
    ctx.fillStyle = '#061026';
    ctx.lineWidth = 2.5;

    ctx.beginPath();
    ctx.moveTo(0, -this.height / 2);
    ctx.lineTo(this.width / 2, this.height / 2);
    ctx.lineTo(this.width / 4, this.height / 4);
    ctx.lineTo(0, this.height / 3);
    ctx.lineTo(-this.width / 4, this.height / 4);
    ctx.lineTo(-this.width / 2, this.height / 2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, 0, 4, 0, Math.PI * 2);
    ctx.fill();

    if (gameState.shield > 0) {
      const shieldAlpha = Math.min(1, gameState.shield / 100);
      ctx.strokeStyle = `rgba(0, 255, 102, ${0.4 + shieldAlpha * 0.4})`;
      ctx.fillStyle = `rgba(0, 255, 102, ${0.08 * shieldAlpha})`;
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#00ff66';
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.arc(0, 0, this.width * 0.75, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    ctx.restore();
  }
}

class Projectile {
  constructor(x, y, vx, vy, owner = 'player', color = '#00f3ff', type = 'standard') {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.owner = owner;
    this.color = color;
    this.type = type;
    this.width = type === 'beam' ? 4 : (type === 'rocket' ? 8 : 3);
    this.height = type === 'beam' ? 24 : (type === 'rocket' ? 14 : 12);
    this.damage = type === 'beam' ? 25 : (type === 'rocket' ? 40 : 15);
    this.target = null;
  }

  update(dt, invaders) {
    if (this.type === 'rocket' && invaders && invaders.length > 0) {
      if (!this.target || this.target.hp <= 0) {
        let closest = null;
        let minDist = 9999;
        invaders.forEach(inv => {
          const d = Math.hypot(inv.x - this.x, inv.y - this.y);
          if (d < minDist) {
            minDist = d;
            closest = inv;
          }
        });
        this.target = closest;
      }

      if (this.target) {
        const dx = (this.target.x + this.target.width / 2) - this.x;
        const dy = (this.target.y + this.target.height / 2) - this.y;
        const angle = Math.atan2(dy, dx);
        const speed = 700;
        this.vx += Math.cos(angle) * speed * dt * 3;
        this.vy += Math.sin(angle) * speed * dt * 3;
      }
    }

    this.x += this.vx * dt;
    this.y += this.vy * dt;
  }

  draw(ctx) {
    ctx.save();
    ctx.fillStyle = this.color;
    ctx.shadowBlur = 12;
    ctx.shadowColor = this.color;

    if (this.type === 'rocket') {
      ctx.beginPath();
      ctx.arc(this.x, this.y, 4, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillRect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
    }
    ctx.restore();
  }
}

class Invader {
  constructor(x, y, type = 'drone') {
    this.x = x;
    this.y = y;
    this.type = type;
    
    this.width = type === 'tank' ? 38 : (type === 'scout' ? 26 : 30);
    this.height = type === 'tank' ? 34 : (type === 'scout' ? 26 : 28);
    this.hp = type === 'tank' ? 45 : 15;
    this.maxHp = this.hp;

    this.color = type === 'tank' ? '#ff0055' : (type === 'scout' ? '#ffe600' : (type === 'warp' ? '#a800ff' : '#00f3ff'));
    this.animStep = 0;
    this.animTimer = 0;

    this.isCloaked = false;
    this.cloakTimer = Math.random() * 3;
    this.isDiving = false;
    this.diveSpeed = 350;
  }

  update(dt, canvasHeight) {
    this.animTimer += dt;
    if (this.animTimer > 0.4) {
      this.animStep = 1 - this.animStep;
      this.animTimer = 0;
    }

    if (this.type === 'warp') {
      this.cloakTimer -= dt;
      if (this.cloakTimer <= 0) {
        this.isCloaked = !this.isCloaked;
        this.cloakTimer = this.isCloaked ? 1.5 : 3.0;
      }
    }

    if (this.isDiving) {
      this.y += this.diveSpeed * dt;
    }
  }

  draw(ctx) {
    if (this.isCloaked) return;

    ctx.save();
    ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
    ctx.shadowBlur = 10;
    ctx.shadowColor = this.color;
    ctx.strokeStyle = this.color;
    ctx.fillStyle = '#060a1a';
    ctx.lineWidth = 2;

    const w = this.width / 2;
    const h = this.height / 2;

    ctx.beginPath();
    if (this.type === 'scout') {
      ctx.moveTo(0, -h);
      ctx.lineTo(w, 0);
      ctx.lineTo(0, h);
      ctx.lineTo(-w, 0);
    } else if (this.type === 'tank') {
      ctx.moveTo(-w / 2, -h);
      ctx.lineTo(w / 2, -h);
      ctx.lineTo(w, -h / 2);
      ctx.lineTo(w, h / 2);
      ctx.lineTo(w / 2, h);
      ctx.lineTo(-w / 2, h);
      ctx.lineTo(-w, h / 2);
      ctx.lineTo(-w, -h / 2);
    } else {
      ctx.moveTo(-w, -h / 2);
      ctx.lineTo(-w / 2, -h);
      ctx.lineTo(w / 2, -h);
      ctx.lineTo(w, -h / 2);
      ctx.lineTo(w, h / 2);
      ctx.lineTo(w / 2, h);
      ctx.lineTo(-w / 2, h);
      ctx.lineTo(-w, h / 2);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(-w / 3, -h / 4, 3, 0, Math.PI * 2);
    ctx.arc(w / 3, -h / 4, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}

class Boss {
  constructor(canvasWidth) {
    this.width = 220;
    this.height = 90;
    this.x = canvasWidth / 2 - this.width / 2;
    this.y = 70;
    this.hp = 800;
    this.maxHp = 800;
    this.color = '#ff0055';
    this.dir = 1;
    this.speed = 120;
    this.attackTimer = 0;
    this.phase = 1;
  }

  update(dt, canvasWidth) {
    this.x += this.dir * this.speed * dt;
    if (this.x <= 20 || this.x >= canvasWidth - this.width - 20) {
      this.dir *= -1;
    }

    if (this.hp < this.maxHp * 0.4 && this.phase === 1) {
      this.phase = 2;
      this.speed = 220;
    }
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
    ctx.shadowBlur = 20;
    ctx.shadowColor = this.phase === 2 ? '#ff0055' : '#a800ff';
    ctx.strokeStyle = this.phase === 2 ? '#ff0055' : '#00f3ff';
    ctx.fillStyle = '#0a0414';
    ctx.lineWidth = 3;

    const w = this.width / 2;
    const h = this.height / 2;

    ctx.beginPath();
    ctx.moveTo(0, -h);
    ctx.lineTo(w, -h / 2);
    ctx.lineTo(w * 0.8, h);
    ctx.lineTo(0, h * 0.7);
    ctx.lineTo(-w * 0.8, h);
    ctx.lineTo(-w, -h / 2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = this.phase === 2 ? '#ff0055' : '#ffe600';
    ctx.beginPath();
    ctx.arc(0, 0, 16, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}

class PowerUp {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.vy = 110;
    this.radius = 14;
    
    const colors = {
      spread: '#ffe600',
      beam: '#00f3ff',
      rocket: '#ff0055',
      shield: '#00ff66',
      slow: '#a800ff'
    };
    this.color = colors[type] || '#ffffff';
  }

  update(dt) {
    this.y += this.vy * dt;
  }

  draw(ctx) {
    ctx.save();
    ctx.shadowBlur = 12;
    ctx.shadowColor = this.color;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#000000';
    ctx.font = '800 12px Orbitron';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const label = this.type.charAt(0).toUpperCase();
    ctx.fillText(label, this.x, this.y);
    ctx.restore();
  }
}

class Bunker {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 64;
    this.height = 36;
    this.pixels = [];

    const rows = 6;
    const cols = 10;
    const blockW = this.width / cols;
    const blockH = this.height / rows;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (r >= 4 && c >= 3 && c <= 6) continue;
        this.pixels.push({
          x: x + c * blockW,
          y: y + r * blockH,
          w: blockW,
          h: blockH,
          hp: 3
        });
      }
    }
  }

  draw(ctx) {
    ctx.save();
    ctx.shadowBlur = 6;
    ctx.shadowColor = '#00f3ff';
    this.pixels.forEach(p => {
      if (p.hp <= 0) return;
      const alpha = p.hp / 3;
      ctx.fillStyle = `rgba(0, 243, 255, ${alpha})`;
      ctx.fillRect(p.x, p.y, p.w, p.h);
    });
    ctx.restore();
  }
}

/* ------------------------------------------------------------------------
   4. WAVE MANAGER (waves.js)
   ------------------------------------------------------------------------ */
class WaveManager {
  constructor(canvasWidth, canvasHeight) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.invaders = [];
    this.boss = null;
    
    this.gridDx = 35;
    this.gridDir = 1;
    this.descentStep = 18;
    this.fireTimer = 0;
  }

  generateWave(waveNum) {
    this.invaders = [];
    this.boss = null;
    this.gridDir = 1;

    if (waveNum % 5 === 0) {
      gameState.isBossWave = true;
      this.boss = new Boss(this.canvasWidth);
      return;
    }

    gameState.isBossWave = false;

    const rows = Math.min(6, 4 + Math.floor(waveNum / 2));
    const cols = Math.min(10, 6 + Math.floor(waveNum / 3));
    const spacingX = 52;
    const spacingY = 44;

    const startX = (this.canvasWidth - (cols * spacingX)) / 2;
    const startY = 80;

    for (let r = 0; r < rows; r++) {
      let type = 'drone';
      if (r === 0) type = 'tank';
      else if (r === 1 || r === 2) type = 'scout';
      else if (waveNum >= 3 && Math.random() < 0.25) type = 'warp';

      for (let c = 0; c < cols; c++) {
        const invader = new Invader(
          startX + c * spacingX,
          startY + r * spacingY,
          type
        );
        this.invaders.push(invader);
      }
    }

    this.gridDx = 40 + (waveNum * 6);
  }

  update(dt, player, enemyBullets) {
    if (this.boss) {
      this.boss.update(dt, this.canvasWidth);
      
      this.fireTimer += dt;
      const fireInterval = this.boss.phase === 2 ? 0.4 : 0.8;
      if (this.fireTimer > fireInterval) {
        this.fireTimer = 0;
        const bx = this.boss.x + this.boss.width / 2;
        const by = this.boss.y + this.boss.height;

        if (this.boss.phase === 2) {
          enemyBullets.push(new Projectile(bx - 40, by, -100, 350, 'invader', '#ff0055', 'standard'));
          enemyBullets.push(new Projectile(bx, by, 0, 400, 'invader', '#ff0055', 'standard'));
          enemyBullets.push(new Projectile(bx + 40, by, 100, 350, 'invader', '#ff0055', 'standard'));
        } else {
          enemyBullets.push(new Projectile(bx - 30, by, 0, 350, 'invader', '#a800ff', 'standard'));
          enemyBullets.push(new Projectile(bx + 30, by, 0, 350, 'invader', '#a800ff', 'standard'));
        }
        soundEngine.playInvaderShoot();
      }
      return;
    }

    if (this.invaders.length === 0) return;

    const speedMultiplier = 1 + (1 - (this.invaders.length / 30)) * 1.5;
    const currentDx = this.gridDx * speedMultiplier * this.gridDir * dt;

    let hitEdge = false;
    this.invaders.forEach(invader => {
      invader.update(dt, this.canvasHeight);
      invader.x += currentDx;

      if ((invader.x <= 15 && this.gridDir === -1) || 
          (invader.x + invader.width >= this.canvasWidth - 15 && this.gridDir === 1)) {
        hitEdge = true;
      }
    });

    if (hitEdge) {
      this.gridDir *= -1;
      this.invaders.forEach(invader => {
        invader.y += this.descentStep;
      });
    }

    this.fireTimer += dt;
    const fireInterval = Math.max(0.4, 1.8 - (gameState.wave * 0.15));
    if (this.fireTimer > fireInterval) {
      this.fireTimer = 0;
      
      const shooterCandidates = this.invaders.filter(inv => !inv.isCloaked);
      if (shooterCandidates.length > 0) {
        const shooter = shooterCandidates[Math.floor(Math.random() * shooterCandidates.length)];
        const sx = shooter.x + shooter.width / 2;
        const sy = shooter.y + shooter.height;
        enemyBullets.push(new Projectile(sx, sy, 0, 380, 'invader', shooter.color, 'standard'));
        soundEngine.playInvaderShoot();
      }
    }
  }

  draw(ctx) {
    if (this.boss) {
      this.boss.draw(ctx);
    } else {
      this.invaders.forEach(inv => inv.draw(ctx));
    }
  }
}

/* ------------------------------------------------------------------------
   5. GAME ENGINE (engine.js)
   ------------------------------------------------------------------------ */
class GameEngine {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    
    this.width = 1280;
    this.height = 800;
    this.setupCanvasSize();

    this.keys = {};
    this.touchX = null;
    this.isTouchActive = false;

    this.player = new Player(this.width, this.height);
    this.waveManager = new WaveManager(this.width, this.height);
    
    this.playerBullets = [];
    this.enemyBullets = [];
    this.particles = [];
    this.shockwaves = [];
    this.powerups = [];
    this.bunkers = [];

    this.stars = [];
    this.initStarfield();

    this.shakeIntensity = 0;
    this.lastTime = 0;

    this.bindInputs();
    window.addEventListener('resize', () => this.setupCanvasSize());
  }

  setupCanvasSize() {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;
    this.width = rect.width;
    this.height = rect.height;
  }

  initStarfield() {
    this.stars = [];
    for (let i = 0; i < 140; i++) {
      this.stars.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        size: Math.random() * 2 + 0.5,
        speed: Math.random() * 80 + 20,
        color: Math.random() < 0.3 ? '#00f3ff' : (Math.random() < 0.6 ? '#a800ff' : '#ffffff')
      });
    }
  }

  initBunkers() {
    this.bunkers = [];
    const count = 4;
    const spacing = this.width / (count + 1);
    for (let i = 1; i <= count; i++) {
      this.bunkers.push(new Bunker(spacing * i - 32, this.height - 150));
    }
  }

  bindInputs() {
    window.addEventListener('keydown', (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', ' '].includes(e.key) || ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
        e.preventDefault();
      }
      this.keys[e.code] = true;

      if (e.code === 'KeyE' && gameState.isRunning && !gameState.isPaused) {
        this.triggerEMPNuke();
      }
      if ((e.code === 'Escape' || e.code === 'KeyP') && gameState.isRunning) {
        if (typeof uiManager !== 'undefined') uiManager.togglePause();
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
    });

    this.canvas.addEventListener('mousemove', (e) => {
      if (!gameState.isRunning || gameState.isPaused) return;
      const rect = this.canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      this.player.x = Math.max(10, Math.min(this.width - this.player.width - 10, mouseX - this.player.width / 2));
      this.player.y = Math.max(this.height * 0.35, Math.min(this.height - this.player.height - 15, mouseY - this.player.height / 2));
    });

    this.canvas.addEventListener('mousedown', (e) => {
      if (e.button === 0 && gameState.isRunning && !gameState.isPaused) {
        this.firePlayerWeapon();
      }
    });

    this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());

    this.canvas.addEventListener('touchstart', (e) => {
      this.isTouchActive = true;
      this.handleTouch(e);
    });
    this.canvas.addEventListener('touchmove', (e) => {
      if (this.isTouchActive) this.handleTouch(e);
    });
    this.canvas.addEventListener('touchend', () => {
      this.isTouchActive = false;
    });
  }

  handleTouch(e) {
    if (!gameState.isRunning || gameState.isPaused) return;
    const rect = this.canvas.getBoundingClientRect();
    const touch = e.touches[0];
    if (touch) {
      const touchX = touch.clientX - rect.left;
      const touchY = touch.clientY - rect.top;
      this.player.x = Math.max(10, Math.min(this.width - this.player.width - 10, touchX - this.player.width / 2));
      this.player.y = Math.max(this.height * 0.35, Math.min(this.height - this.player.height - 15, touchY - this.player.height / 2));
      this.firePlayerWeapon();
    }
  }

  firePlayerWeapon() {
    const newBullets = this.player.shoot();
    if (newBullets) {
      this.playerBullets.push(...newBullets);
    }
  }

  addScreenShake(intensity) {
    if (gameState.settings.screenShake) {
      this.shakeIntensity = intensity;
    }
  }

  createExplosion(x, y, color, count = 20) {
    if (!gameState.settings.particles) return;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 250 + 50;
      this.particles.push(new Particle(
        x, y, color,
        Math.cos(angle) * speed * 0.05,
        Math.sin(angle) * speed * 0.05,
        Math.random() * 0.5 + 0.2,
        Math.random() * 4 + 2
      ));
    }
  }

  update(dt) {
    if (!gameState.isRunning || gameState.isPaused) return;

    if (window.parent && window.parent !== window) {
      window.parent.postMessage({ type: 'SCORE_UPDATE', score: gameState.score }, '*');
    }

    gameState.updateCombo(dt);

    if (this.keys['Space']) {
      this.firePlayerWeapon();
    }

    this.player.update(dt, this.keys, this.width, this.height);

    const starSpeedMultiplier = this.player.isDashing ? 3 : 1;
    this.stars.forEach(star => {
      star.y += star.speed * starSpeedMultiplier * dt;
      if (star.y > this.height) {
        star.y = 0;
        star.x = Math.random() * this.width;
      }
    });

    this.waveManager.update(dt, this.player, this.enemyBullets);

    if (!this.waveManager.boss && this.waveManager.invaders.length === 0) {
      gameState.wave++;
      gameState.addScore(500);
      this.waveManager.generateWave(gameState.wave);
      this.shockwaves.push(new Shockwave(this.width / 2, this.height / 2, 400, '#00f3ff'));
      soundEngine.playPowerup();
      if (typeof uiManager !== 'undefined') uiManager.updateHUD();
    }

    this.playerBullets.forEach(b => b.update(dt, this.waveManager.invaders));
    this.enemyBullets.forEach(b => b.update(dt));

    this.playerBullets = this.playerBullets.filter(b => b.y > -30);
    this.enemyBullets = this.enemyBullets.filter(b => b.y < this.height + 30);

    this.powerups.forEach(p => p.update(dt));
    this.powerups = this.powerups.filter(p => p.y < this.height + 20);

    this.particles.forEach(p => p.update(dt));
    this.particles = this.particles.filter(p => p.life > 0);

    this.shockwaves.forEach(s => s.update(dt));
    this.shockwaves = this.shockwaves.filter(s => s.alpha > 0);

    if (this.shakeIntensity > 0) {
      this.shakeIntensity -= dt * 40;
      if (this.shakeIntensity < 0) this.shakeIntensity = 0;
    }

    this.checkCollisions();
  }

  checkCollisions() {
    this.playerBullets.forEach((bullet, bIdx) => {
      if (this.waveManager.boss) {
        const boss = this.waveManager.boss;
        if (bullet.x > boss.x && bullet.x < boss.x + boss.width &&
            bullet.y > boss.y && bullet.y < boss.y + boss.height) {
          boss.hp -= bullet.damage;
          gameState.shotsHit++;
          this.createExplosion(bullet.x, bullet.y, '#00f3ff', 5);
          this.playerBullets.splice(bIdx, 1);
          soundEngine.playExplosion('small');

          if (boss.hp <= 0) {
            gameState.addScore(5000);
            gameState.kills++;
            this.createExplosion(boss.x + boss.width / 2, boss.y + boss.height / 2, '#ff0055', 60);
            this.addScreenShake(30);
            soundEngine.playExplosion('heavy');
            this.waveManager.boss = null;
            gameState.wave++;
            this.waveManager.generateWave(gameState.wave);
          }
          if (typeof uiManager !== 'undefined') uiManager.updateHUD();
          return;
        }
      }

      this.waveManager.invaders.forEach((invader, iIdx) => {
        if (bullet.x > invader.x && bullet.x < invader.x + invader.width &&
            bullet.y > invader.y && bullet.y < invader.y + invader.height) {
          
          invader.hp -= bullet.damage;
          gameState.shotsHit++;
          this.createExplosion(bullet.x, bullet.y, invader.color, 8);
          this.playerBullets.splice(bIdx, 1);

          if (invader.hp <= 0) {
            gameState.addScore(100);
            gameState.kills++;
            soundEngine.playExplosion('small');
            this.createExplosion(invader.x + invader.width / 2, invader.y + invader.height / 2, invader.color, 16);

            if (Math.random() < 0.15) {
              const types = ['spread', 'beam', 'rocket', 'shield', 'slow'];
              const type = types[Math.floor(Math.random() * types.length)];
              this.powerups.push(new PowerUp(invader.x + invader.width / 2, invader.y, type));
            }

            this.waveManager.invaders.splice(iIdx, 1);
          }
          if (typeof uiManager !== 'undefined') uiManager.updateHUD();
        }
      });

      this.bunkers.forEach(bunker => {
        bunker.pixels.forEach(p => {
          if (p.hp > 0 && bullet.x > p.x && bullet.x < p.x + p.w &&
              bullet.y > p.y && bullet.y < p.y + p.h) {
            p.hp--;
            this.playerBullets.splice(bIdx, 1);
          }
        });
      });
    });

    this.enemyBullets.forEach((bullet, bIdx) => {
      if (this.player.invulnerableTimer <= 0) {
        const px = this.player.x + this.player.width / 2;
        const py = this.player.y + this.player.height / 2;
        if (Math.hypot(bullet.x - px, bullet.y - py) < this.player.width / 2) {
          this.enemyBullets.splice(bIdx, 1);
          this.onPlayerHit();
          return;
        }
      }

      this.bunkers.forEach(bunker => {
        bunker.pixels.forEach(p => {
          if (p.hp > 0 && bullet.x > p.x && bullet.x < p.x + p.w &&
              bullet.y > p.y && bullet.y < p.y + p.h) {
            p.hp--;
            this.enemyBullets.splice(bIdx, 1);
          }
        });
      });
    });

    this.powerups.forEach((powerup, pIdx) => {
      const px = this.player.x + this.player.width / 2;
      const py = this.player.y + this.player.height / 2;
      if (Math.hypot(powerup.x - px, powerup.y - py) < this.player.width / 2 + powerup.radius) {
        soundEngine.playPowerup();
        this.shockwaves.push(new Shockwave(powerup.x, powerup.y, 100, powerup.color));

        if (powerup.type === 'shield') {
          gameState.shield = Math.min(100, gameState.shield + 40);
        } else {
          this.player.activeWeapon = powerup.type;
          this.player.weaponTimer = 10.0;
        }

        this.powerups.splice(pIdx, 1);
        if (typeof uiManager !== 'undefined') uiManager.updateHUD();
      }
    });

    this.waveManager.invaders.forEach(inv => {
      if (inv.y + inv.height >= this.player.y && this.player.invulnerableTimer <= 0) {
        this.onPlayerHit(false);
        this.waveManager.invaders.forEach(i => i.y -= 60);
      }
    });
  }

  onPlayerHit(instantKill = false) {
    if (this.player.invulnerableTimer > 0) return;

    this.addScreenShake(30);

    if (gameState.shield > 0 && !instantKill) {
      gameState.shield -= 35;
      soundEngine.playShieldHit();
      if (gameState.shield < 0) gameState.shield = 0;
      this.player.invulnerableTimer = 1.2;
    } else {
      soundEngine.playExplosion('heavy');
      this.createExplosion(this.player.x + this.player.width / 2, this.player.y + this.player.height / 2, '#ff0055', 45);

      gameState.lives--;
      this.player.invulnerableTimer = 2.5;

      if (gameState.lives <= 0) {
        gameState.lives = 0;
        gameState.shield = 0;
        if (typeof uiManager !== 'undefined') uiManager.triggerGameOver();
      } else {
        gameState.shield = 50;
      }
    }
    if (typeof uiManager !== 'undefined') uiManager.updateHUD();
  }

  render() {
    this.ctx.save();

    if (this.shakeIntensity > 0) {
      const dx = (Math.random() - 0.5) * this.shakeIntensity;
      const dy = (Math.random() - 0.5) * this.shakeIntensity;
      this.ctx.translate(dx, dy);
    }

    const bgGrad = this.ctx.createLinearGradient(0, 0, 0, this.height);
    bgGrad.addColorStop(0, '#040714');
    bgGrad.addColorStop(1, '#02030a');
    this.ctx.fillStyle = bgGrad;
    this.ctx.fillRect(0, 0, this.width, this.height);

    this.stars.forEach(star => {
      this.ctx.fillStyle = star.color;
      this.ctx.fillRect(star.x, star.y, star.size, star.size);
    });

    this.bunkers.forEach(b => b.draw(this.ctx));

    if (gameState.isRunning) {
      this.player.draw(this.ctx, this.particles);
    }

    this.waveManager.draw(this.ctx);

    this.playerBullets.forEach(b => b.draw(this.ctx));
    this.enemyBullets.forEach(b => b.draw(this.ctx));
    this.powerups.forEach(p => p.draw(this.ctx));

    this.particles.forEach(p => p.draw(this.ctx));
    this.shockwaves.forEach(s => s.draw(this.ctx));

    this.ctx.restore();
  }

  startLoop() {
    const loop = (timestamp) => {
      if (!this.lastTime) this.lastTime = timestamp;
      const dt = Math.min(0.1, (timestamp - this.lastTime) / 1000);
      this.lastTime = timestamp;

      this.update(dt);
      this.render();

      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }
}

/* ------------------------------------------------------------------------
   6. UI MANAGER (ui.js)
   ------------------------------------------------------------------------ */
class UIManager {
  constructor() {
    this.menuOverlay = document.getElementById('menu-overlay');
    this.controlsOverlay = document.getElementById('controls-overlay');
    this.leaderboardOverlay = document.getElementById('leaderboard-overlay');
    this.settingsOverlay = document.getElementById('settings-overlay');
    this.pauseOverlay = document.getElementById('pause-overlay');
    this.gameoverOverlay = document.getElementById('gameover-overlay');
    this.hudOverlay = document.getElementById('hud-overlay');

    this.hudScore = document.getElementById('hud-score');
    this.hudWave = document.getElementById('hud-wave');
    this.hudCombo = document.getElementById('hud-combo');
    this.hudHighScore = document.getElementById('hud-highscore');
    this.shieldBar = document.getElementById('shield-bar-fill');
    this.shieldVal = document.getElementById('shield-val');
    this.activeWeaponBadge = document.getElementById('active-weapon-badge');
    this.livesContainer = document.getElementById('lives-container');

    this.bossHealthContainer = document.getElementById('boss-health-container');
    this.bossHpFill = document.getElementById('boss-hp-fill');
    this.bossHpPct = document.getElementById('boss-hp-pct');

    this.goScore = document.getElementById('go-score');
    this.goWaves = document.getElementById('go-waves');
    this.goKills = document.getElementById('go-kills');
    this.goAccuracy = document.getElementById('go-accuracy');
    this.goCombo = document.getElementById('go-combo');
    this.newHighscoreBox = document.getElementById('new-highscore-box');
    this.playerNameInput = document.getElementById('player-name-input');

    this.bindButtons();
    this.applySettingsToDOM();
  }

  bindButtons() {
    document.getElementById('btn-start-game').addEventListener('click', () => {
      this.showScreen(null);
      this.hudOverlay.classList.remove('hidden');
      gameEngine.initBunkers();
      gameState.reset();
      gameEngine.waveManager.generateWave(1);
      soundEngine.startBGM();
      this.updateHUD();
    });

    document.getElementById('btn-controls').addEventListener('click', () => this.showScreen(this.controlsOverlay));
    document.getElementById('btn-close-controls').addEventListener('click', () => this.showScreen(this.menuOverlay));

    document.getElementById('btn-leaderboard').addEventListener('click', () => {
      this.renderLeaderboard();
      this.showScreen(this.leaderboardOverlay);
    });
    document.getElementById('btn-close-leaderboard').addEventListener('click', () => this.showScreen(this.menuOverlay));

    document.getElementById('btn-settings').addEventListener('click', () => this.showScreen(this.settingsOverlay));
    document.getElementById('btn-pause-settings').addEventListener('click', () => this.showScreen(this.settingsOverlay));
    document.getElementById('btn-close-settings').addEventListener('click', () => {
      this.saveSettingsFromDOM();
      if (gameState.isPaused) {
        this.showScreen(this.pauseOverlay);
      } else {
        this.showScreen(this.menuOverlay);
      }
    });

    document.getElementById('btn-quick-pause').addEventListener('click', () => this.togglePause());
    document.getElementById('btn-resume-game').addEventListener('click', () => this.togglePause());

    document.getElementById('btn-restart-game').addEventListener('click', () => {
      this.showScreen(null);
      this.hudOverlay.classList.remove('hidden');
      gameEngine.initBunkers();
      gameState.reset();
      gameEngine.waveManager.generateWave(1);
      this.updateHUD();
    });

    document.getElementById('btn-quit-to-menu').addEventListener('click', () => {
      gameState.isRunning = false;
      gameState.isPaused = false;
      soundEngine.stopBGM();
      this.hudOverlay.classList.add('hidden');
      this.showScreen(this.menuOverlay);
    });

    document.getElementById('btn-play-again').addEventListener('click', () => {
      this.showScreen(null);
      this.hudOverlay.classList.remove('hidden');
      gameEngine.initBunkers();
      gameState.reset();
      gameEngine.waveManager.generateWave(1);
      soundEngine.startBGM();
      this.updateHUD();
    });

    document.getElementById('btn-go-main-menu').addEventListener('click', () => {
      soundEngine.stopBGM();
      this.hudOverlay.classList.add('hidden');
      this.showScreen(this.menuOverlay);
    });

    document.getElementById('btn-save-score').addEventListener('click', () => {
      const name = this.playerNameInput.value.trim() || 'ACE';
      gameState.saveLeaderboardEntry(name, gameState.score, gameState.wave);
      this.newHighscoreBox.classList.add('hidden');
    });
  }

  showScreen(targetOverlay) {
    const screens = [
      this.menuOverlay,
      this.controlsOverlay,
      this.leaderboardOverlay,
      this.settingsOverlay,
      this.pauseOverlay,
      this.gameoverOverlay
    ];

    screens.forEach(s => {
      if (s === targetOverlay) {
        s.classList.remove('hidden');
        s.classList.add('active');
      } else {
        s.classList.add('hidden');
        s.classList.remove('active');
      }
    });
  }

  togglePause() {
    if (!gameState.isRunning || gameState.isGameOver) return;

    gameState.isPaused = !gameState.isPaused;
    if (gameState.isPaused) {
      this.showScreen(this.pauseOverlay);
    } else {
      this.showScreen(null);
      this.hudOverlay.classList.remove('hidden');
    }
  }

  updateHUD() {
    this.hudScore.textContent = gameState.score.toLocaleString('en-US').padStart(6, '0');
    this.hudWave.textContent = gameState.wave;
    this.hudCombo.textContent = `x${gameState.combo.toFixed(1)}`;
    this.hudHighScore.textContent = gameState.highScore.toLocaleString('en-US').padStart(6, '0');

    const sPct = Math.max(0, gameState.shield);
    this.shieldBar.style.width = `${sPct}%`;
    this.shieldVal.textContent = `${Math.round(sPct)}%`;

    const wType = gameEngine.player.activeWeapon.toUpperCase();
    if (wType === 'STANDARD') {
      this.activeWeaponBadge.textContent = 'WEAPON: PLASMA';
    } else {
      const timeLeft = Math.ceil(gameEngine.player.weaponTimer);
      this.activeWeaponBadge.textContent = `WEAPON: ${wType} [${timeLeft}s]`;
    }

    this.livesContainer.innerHTML = '';
    for (let i = 0; i < gameState.lives; i++) {
      const icon = document.createElement('span');
      icon.className = 'life-icon';
      icon.textContent = '▲';
      this.livesContainer.appendChild(icon);
    }

    if (gameState.isBossWave && gameEngine.waveManager.boss) {
      this.bossHealthContainer.classList.remove('hidden');
      const bHp = gameEngine.waveManager.boss.hp;
      const bMax = gameEngine.waveManager.boss.maxHp;
      const bPct = Math.max(0, Math.round((bHp / bMax) * 100));
      this.bossHpFill.style.width = `${bPct}%`;
      this.bossHpPct.textContent = `${bPct}%`;
    } else {
      this.bossHealthContainer.classList.add('hidden');
    }
  }

  triggerGameOver() {
    gameState.isRunning = false;
    gameState.isGameOver = true;
    soundEngine.stopBGM();

    if (localStorage.getItem('compy_q2_active') === 'true') {
      localStorage.setItem('compy_q2_city_destroyed', 'true');
    }

    this.goScore.textContent = gameState.score.toLocaleString('en-US');
    this.goWaves.textContent = gameState.wave;
    this.goKills.textContent = gameState.kills;
    this.goAccuracy.textContent = `${gameState.getAccuracy()}%`;
    this.goCombo.textContent = `x${gameState.maxCombo.toFixed(1)}`;

    const topScores = gameState.getLeaderboard();
    const qualifies = topScores.length < 5 || gameState.score > topScores[topScores.length - 1].score;
    
    if (qualifies && gameState.score > 0) {
      this.newHighscoreBox.classList.remove('hidden');
    } else {
      this.newHighscoreBox.classList.add('hidden');
    }

    this.hudOverlay.classList.add('hidden');
    this.showScreen(this.gameoverOverlay);
  }

  renderLeaderboard() {
    const listContainer = document.getElementById('leaderboard-list');
    listContainer.innerHTML = '';

    const entries = gameState.getLeaderboard();
    entries.forEach((item, idx) => {
      const row = document.createElement('div');
      row.className = `lb-row ${idx === 0 ? 'top-rank' : ''}`;
      row.innerHTML = `
        <span class="lb-rank">#${idx + 1}</span>
        <span class="lb-name">${item.name}</span>
        <span class="lb-score">${item.score.toLocaleString()} PTS (WAVE ${item.wave})</span>
      `;
      listContainer.appendChild(row);
    });
  }

  applySettingsToDOM() {
    document.getElementById('setting-sfx').value = gameState.settings.sfxVolume * 100;
    document.getElementById('setting-music').value = gameState.settings.musicVolume * 100;
    document.getElementById('setting-crt').checked = gameState.settings.crtLines;
    document.getElementById('setting-particles').checked = gameState.settings.particles;
    document.getElementById('setting-shake').checked = gameState.settings.screenShake;

    this.updateCRTEffect();
  }

  saveSettingsFromDOM() {
    const sfxVal = parseInt(document.getElementById('setting-sfx').value, 10) / 100;
    const musicVal = parseInt(document.getElementById('setting-music').value, 10) / 100;

    gameState.settings.sfxVolume = sfxVal;
    gameState.settings.musicVolume = musicVal;
    gameState.settings.crtLines = document.getElementById('setting-crt').checked;
    gameState.settings.particles = document.getElementById('setting-particles').checked;
    gameState.settings.screenShake = document.getElementById('setting-shake').checked;

    soundEngine.setSFXVolume(sfxVal);
    soundEngine.setMusicVolume(musicVal);
    gameState.saveSettings();

    this.updateCRTEffect();
  }

  updateCRTEffect() {
    const crtElement = document.getElementById('crt-overlay');
    if (gameState.settings.crtLines) {
      crtElement.classList.remove('disabled');
    } else {
      crtElement.classList.add('disabled');
    }
  }
}

const uiManager = new UIManager();

/* ------------------------------------------------------------------------
   7. INITIALIZATION (main.js)
   ------------------------------------------------------------------------ */
let gameEngine = null;

window.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 Initializing CYBER INVADERS Neon Arcade Engine...');

  gameEngine = new GameEngine();

  soundEngine.setSFXVolume(gameState.settings.sfxVolume);
  soundEngine.setMusicVolume(gameState.settings.musicVolume);
  uiManager.updateCRTEffect();

  gameEngine.startLoop();
});
