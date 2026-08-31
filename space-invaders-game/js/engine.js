/* ==========================================================================
   CYBER INVADERS - MAIN RENDERING & COLLISION ENGINE
   ========================================================================== */

class GameEngine {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    
    this.width = 1280;
    this.height = 800;
    this.setupCanvasSize();

    // Input States
    this.keys = {};
    this.touchX = null;
    this.isTouchActive = false;

    // Game Entities
    this.player = new Player(this.width, this.height);
    this.waveManager = new WaveManager(this.width, this.height);
    
    this.playerBullets = [];
    this.enemyBullets = [];
    this.particles = [];
    this.shockwaves = [];
    this.powerups = [];
    this.bunkers = [];

    // Starfield Background Stars
    this.stars = [];
    this.initStarfield();

    // Screen Shake Parameters
    this.shakeIntensity = 0;

    // Time Tracking
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
      this.keys[e.code] = true;

      // Quick Keybind Triggers
      if (e.code === 'KeyE' && gameState.isRunning && !gameState.isPaused) {
        this.triggerEMPNuke();
      }
      if ((e.code === 'Escape' || e.code === 'KeyP') && gameState.isRunning) {
        uiManager.togglePause();
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
    });

    // Touch & Mouse Drag Controls
    this.canvas.addEventListener('mousemove', (e) => {
      if (!gameState.isRunning || gameState.isPaused) return;
      const rect = this.canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      this.player.x = mouseX - this.player.width / 2;
    });

    this.canvas.addEventListener('mousedown', (e) => {
      if (e.button === 0 && gameState.isRunning && !gameState.isPaused) {
        this.firePlayerWeapon();
      }
      if (e.button === 2 && gameState.isRunning && !gameState.isPaused) {
        e.preventDefault();
        this.triggerEMPNuke();
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
      this.player.x = touchX - this.player.width / 2;
      this.firePlayerWeapon();
    }
  }

  firePlayerWeapon() {
    const newBullets = this.player.shoot();
    if (newBullets) {
      this.playerBullets.push(...newBullets);
    }
  }

  triggerEMPNuke() {
    if (!gameState.bombReady || !gameState.isRunning || gameState.isPaused) return;
    
    gameState.bombReady = false;
    this.addScreenShake(20);
    soundEngine.playBombNuke();
    this.shockwaves.push(new Shockwave(this.player.x + this.player.width / 2, this.player.y, this.width * 1.2, '#ff0055'));

    // Wipe all active enemy projectiles
    this.enemyBullets = [];

    // Damage all invaders on screen
    if (this.waveManager.boss) {
      this.waveManager.boss.hp -= 150;
      this.createExplosion(this.waveManager.boss.x + this.waveManager.boss.width / 2, this.waveManager.boss.y + 40, '#ff0055', 30);
    } else {
      this.waveManager.invaders.forEach(inv => {
        inv.hp -= 40;
        if (inv.hp <= 0) {
          gameState.addScore(150);
          gameState.kills++;
          this.createExplosion(inv.x + inv.width / 2, inv.y + inv.height / 2, inv.color, 12);
        }
      });
      this.waveManager.invaders = this.waveManager.invaders.filter(inv => inv.hp > 0);
    }

    uiManager.updateHUD();
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

  /* ------------------------------------------------------------------------
     UPDATE LOOP
     ------------------------------------------------------------------------ */
  update(dt) {
    if (!gameState.isRunning || gameState.isPaused) return;

    gameState.updateCombo(dt);

    // Continuous Firing when Space is held down
    if (this.keys['Space']) {
      this.firePlayerWeapon();
    }

    // 1. Update Player
    this.player.update(dt, this.keys, this.width);

    // 2. Update Starfield
    const starSpeedMultiplier = this.player.isDashing ? 3 : 1;
    this.stars.forEach(star => {
      star.y += star.speed * starSpeedMultiplier * dt;
      if (star.y > this.height) {
        star.y = 0;
        star.x = Math.random() * this.width;
      }
    });

    // 3. Update Wave Manager (Invaders & Boss)
    this.waveManager.update(dt, this.player, this.enemyBullets);

    // Check for Wave Clear
    if (!this.waveManager.boss && this.waveManager.invaders.length === 0) {
      gameState.wave++;
      gameState.addScore(500); // Wave Clear Bonus
      this.waveManager.generateWave(gameState.wave);
      this.shockwaves.push(new Shockwave(this.width / 2, this.height / 2, 400, '#00f3ff'));
      soundEngine.playPowerup();
      uiManager.updateHUD();
    }

    // 4. Update Bullets
    this.playerBullets.forEach(b => b.update(dt, this.waveManager.invaders));
    this.enemyBullets.forEach(b => b.update(dt));

    // Remove Out-of-Bounds Bullets
    this.playerBullets = this.playerBullets.filter(b => b.y > -30);
    this.enemyBullets = this.enemyBullets.filter(b => b.y < this.height + 30);

    // 5. Update Power-ups
    this.powerups.forEach(p => p.update(dt));
    this.powerups = this.powerups.filter(p => p.y < this.height + 20);

    // 6. Update Particles & Shockwaves
    this.particles.forEach(p => p.update(dt));
    this.particles = this.particles.filter(p => p.life > 0);

    this.shockwaves.forEach(s => s.update(dt));
    this.shockwaves = this.shockwaves.filter(s => s.alpha > 0);

    // 7. Update Screen Shake decay
    if (this.shakeIntensity > 0) {
      this.shakeIntensity -= dt * 40;
      if (this.shakeIntensity < 0) this.shakeIntensity = 0;
    }

    // 8. Handle Spatial Collisions
    this.checkCollisions();
  }

  /* ------------------------------------------------------------------------
     COLLISION SYSTEM
     ------------------------------------------------------------------------ */
  checkCollisions() {
    // Player Bullets vs Invaders / Boss
    this.playerBullets.forEach((bullet, bIdx) => {
      // Boss Collision
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
          uiManager.updateHUD();
          return;
        }
      }

      // Standard Invaders Collision
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

            // Chance to drop Tactical Power-up
            if (Math.random() < 0.15) {
              const types = ['spread', 'beam', 'rocket', 'shield', 'slow'];
              const type = types[Math.floor(Math.random() * types.length)];
              this.powerups.push(new PowerUp(invader.x + invader.width / 2, invader.y, type));
            }

            this.waveManager.invaders.splice(iIdx, 1);
          }
          uiManager.updateHUD();
        }
      });

      // Player Bullets vs Bunkers
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

    // Enemy Bullets vs Player & Bunkers
    this.enemyBullets.forEach((bullet, bIdx) => {
      // Enemy Bullets vs Player
      if (this.player.invulnerableTimer <= 0) {
        const px = this.player.x + this.player.width / 2;
        const py = this.player.y + this.player.height / 2;
        if (Math.hypot(bullet.x - px, bullet.y - py) < this.player.width / 2) {
          this.enemyBullets.splice(bIdx, 1);
          this.onPlayerHit();
          return;
        }
      }

      // Enemy Bullets vs Bunkers
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

    // Player vs Power-ups
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
          this.player.weaponTimer = 10.0; // 10 seconds duration
        }

        this.powerups.splice(pIdx, 1);
        uiManager.updateHUD();
      }
    });

    // Check Invader Breach (Invaders reaching bottom line)
    this.waveManager.invaders.forEach(inv => {
      if (inv.y + inv.height >= this.player.y) {
        this.onPlayerHit(true); // Direct breach fatal hit
      }
    });
  }

  onPlayerHit(instantKill = false) {
    this.addScreenShake(25);
    
    if (gameState.shield > 0 && !instantKill) {
      gameState.shield -= 35;
      soundEngine.playShieldHit();
      if (gameState.shield < 0) gameState.shield = 0;
      this.player.invulnerableTimer = 1.0;
    } else {
      soundEngine.playExplosion('heavy');
      this.createExplosion(this.player.x + this.player.width / 2, this.player.y + this.player.height / 2, '#ff0055', 40);
      gameState.lives--;
      gameState.shield = 100;
      this.player.invulnerableTimer = 2.0;

      if (gameState.lives <= 0) {
        uiManager.triggerGameOver();
      }
    }
    uiManager.updateHUD();
  }

  /* ------------------------------------------------------------------------
     RENDER LOOP
     ------------------------------------------------------------------------ */
  render() {
    this.ctx.save();

    // Screen Shake Offset
    if (this.shakeIntensity > 0) {
      const dx = (Math.random() - 0.5) * this.shakeIntensity;
      const dy = (Math.random() - 0.5) * this.shakeIntensity;
      this.ctx.translate(dx, dy);
    }

    // Clear Canvas with Space Dark Gradient
    const bgGrad = this.ctx.createLinearGradient(0, 0, 0, this.height);
    bgGrad.addColorStop(0, '#040714');
    bgGrad.addColorStop(1, '#02030a');
    this.ctx.fillStyle = bgGrad;
    this.ctx.fillRect(0, 0, this.width, this.height);

    // 1. Draw Starfield
    this.stars.forEach(star => {
      this.ctx.fillStyle = star.color;
      this.ctx.fillRect(star.x, star.y, star.size, star.size);
    });

    // 2. Draw Bunkers
    this.bunkers.forEach(b => b.draw(this.ctx));

    // 3. Draw Player
    if (gameState.isRunning) {
      this.player.draw(this.ctx, this.particles);
    }

    // 4. Draw Wave Manager (Invaders & Boss)
    this.waveManager.draw(this.ctx);

    // 5. Draw Bullets & Powerups
    this.playerBullets.forEach(b => b.draw(this.ctx));
    this.enemyBullets.forEach(b => b.draw(this.ctx));
    this.powerups.forEach(p => p.draw(this.ctx));

    // 6. Draw Particles & Shockwaves
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
