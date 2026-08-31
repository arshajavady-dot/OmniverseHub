/* ==========================================================================
   CYBER INVADERS - GAME ENTITIES & PARTICLE PHYSICS
   ========================================================================== */

/* ------------------------------------------------------------------------
   PARTICLE ENGINE
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

/* ------------------------------------------------------------------------
   PLAYER SHIP
   ------------------------------------------------------------------------ */
class Player {
  constructor(canvasWidth, canvasHeight) {
    this.width = 44;
    this.height = 40;
    this.x = canvasWidth / 2 - this.width / 2;
    this.y = canvasHeight - 70;
    this.speed = 450; // px / sec
    this.vx = 0;
    
    // Weapon Types: 'standard', 'spread', 'beam', 'rocket'
    this.activeWeapon = 'standard';
    this.weaponTimer = 0; // Duration for special weapons
    
    this.fireCooldown = 0;
    this.dashCooldown = 0;
    this.isDashing = false;
    this.dashTimer = 0;

    this.invulnerableTimer = 0;
  }

  update(dt, keys, canvasWidth) {
    // Weapon Powerup Countdown
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

    // Hyper-Dash Logic
    if (this.isDashing) {
      this.dashTimer -= dt;
      if (this.dashTimer <= 0) {
        this.isDashing = false;
      }
    }

    // Input Movement
    let dir = 0;
    if (keys['ArrowLeft'] || keys['KeyA']) dir -= 1;
    if (keys['ArrowRight'] || keys['KeyD']) dir += 1;

    // Execute Dash
    if (keys['ShiftLeft'] || keys['ShiftRight']) {
      if (this.dashCooldown <= 0 && dir !== 0) {
        this.isDashing = true;
        this.dashTimer = 0.15;
        this.dashCooldown = 1.2;
        soundEngine.playShieldHit();
      }
    }

    const currentSpeed = this.isDashing ? this.speed * 2.8 : this.speed;
    this.x += dir * currentSpeed * dt;

    // Bounds Constraint
    this.x = Math.max(10, Math.min(canvasWidth - this.width - 10, this.x));
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
      // Standard single laser
      bullets.push(new Projectile(cx, topY, 0, -750, 'player', '#00f3ff', 'standard'));
    }

    return bullets;
  }

  draw(ctx, particles) {
    if (this.invulnerableTimer > 0 && Math.floor(Date.now() / 100) % 2 === 0) {
      return; // Flicker effect on hit
    }

    ctx.save();
    ctx.translate(this.x + this.width / 2, this.y + this.height / 2);

    // Thruster Trail Particles
    if (Math.random() < 0.8 && gameState.settings.particles) {
      particles.push(new Particle(
        this.x + this.width / 2 + (Math.random() * 10 - 5),
        this.y + this.height - 2,
        '#00f3ff',
        (Math.random() - 0.5) * 2,
        Math.random() * 4 + 3,
        0.2,
        3
      ));
    }

    // Ship Vector Graphic
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

    // Inner Glowing Core
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, 0, 4, 0, Math.PI * 2);
    ctx.fill();

    // Shield Aura if active
    if (gameState.shield > 0) {
      ctx.strokeStyle = `rgba(0, 255, 102, ${gameState.shield / 100 * 0.5})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, this.width * 0.7, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();
  }
}

/* ------------------------------------------------------------------------
   PROJECTILES
   ------------------------------------------------------------------------ */
class Projectile {
  constructor(x, y, vx, vy, owner = 'player', color = '#00f3ff', type = 'standard') {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.owner = owner; // 'player' or 'invader'
    this.color = color;
    this.type = type;
    this.width = type === 'beam' ? 4 : (type === 'rocket' ? 8 : 3);
    this.height = type === 'beam' ? 24 : (type === 'rocket' ? 14 : 12);
    this.damage = type === 'beam' ? 25 : (type === 'rocket' ? 40 : 15);
    this.target = null; // Used for homing rockets
  }

  update(dt, invaders) {
    if (this.type === 'rocket' && invaders && invaders.length > 0) {
      // Find closest invader for homing
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

/* ------------------------------------------------------------------------
   INVADERS
   ------------------------------------------------------------------------ */
class Invader {
  constructor(x, y, type = 'drone') {
    this.x = x;
    this.y = y;
    this.type = type; // 'drone', 'scout', 'tank', 'warp', 'kamikaze'
    
    this.width = type === 'tank' ? 38 : (type === 'scout' ? 26 : 30);
    this.height = type === 'tank' ? 34 : (type === 'scout' ? 26 : 28);
    this.hp = type === 'tank' ? 45 : 15;
    this.maxHp = this.hp;

    this.color = type === 'tank' ? '#ff0055' : (type === 'scout' ? '#ffe600' : (type === 'warp' ? '#a800ff' : '#00f3ff'));
    this.animStep = 0;
    this.animTimer = 0;

    // Special behavior parameters
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
      // Diamond / Triangle Shape
      ctx.moveTo(0, -h);
      ctx.lineTo(w, 0);
      ctx.lineTo(0, h);
      ctx.lineTo(-w, 0);
    } else if (this.type === 'tank') {
      // Heavy Shielded Octagon Shape
      ctx.moveTo(-w / 2, -h);
      ctx.lineTo(w / 2, -h);
      ctx.lineTo(w, -h / 2);
      ctx.lineTo(w, h / 2);
      ctx.lineTo(w / 2, h);
      ctx.lineTo(-w / 2, h);
      ctx.lineTo(-w, h / 2);
      ctx.lineTo(-w, -h / 2);
    } else {
      // Classic Invader Alien Antennae Frame
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

    // Eyes / Inner Glow Core
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(-w / 3, -h / 4, 3, 0, Math.PI * 2);
    ctx.arc(w / 3, -h / 4, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}

/* ------------------------------------------------------------------------
   MOTHERSHIP BOSS
   ------------------------------------------------------------------------ */
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
    this.phase = 1; // Phase 1 (Standard Lasers), Phase 2 (Rage Laser Grid)
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

    // Heavy Mothership Core Graphic
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

    // Boss Core Eye
    ctx.fillStyle = this.phase === 2 ? '#ff0055' : '#ffe600';
    ctx.beginPath();
    ctx.arc(0, 0, 16, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}

/* ------------------------------------------------------------------------
   POWER-UPS
   ------------------------------------------------------------------------ */
class PowerUp {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.type = type; // 'spread', 'beam', 'rocket', 'shield', 'slow'
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

/* ------------------------------------------------------------------------
   DESTRUCTIBLE PLANETARY DEFENSE BUNKERS
   ------------------------------------------------------------------------ */
class Bunker {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 64;
    this.height = 36;
    this.pixels = [];

    // Construct 8x5 grid of mini destructible blocks
    const rows = 6;
    const cols = 10;
    const blockW = this.width / cols;
    const blockH = this.height / rows;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        // Leave cutout notch at bottom center of bunker
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
