/* ==========================================================================
   CYBER INVADERS - WAVE MANAGEMENT & FORMATION GENERATOR
   ========================================================================== */

class WaveManager {
  constructor(canvasWidth, canvasHeight) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.invaders = [];
    this.boss = null;
    
    // Grid Movement State
    this.gridDx = 35; // base horizontal grid speed
    this.gridDir = 1;
    this.descentStep = 18;
    this.fireTimer = 0;
  }

  generateWave(waveNum) {
    this.invaders = [];
    this.boss = null;
    this.gridDir = 1;

    // Check for Boss Wave (Every 5th Wave)
    if (waveNum % 5 === 0) {
      gameState.isBossWave = true;
      this.boss = new Boss(this.canvasWidth);
      return;
    }

    gameState.isBossWave = false;

    // Wave Grid Configuration
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

    // Accelerate base grid speed as waves progress
    this.gridDx = 40 + (waveNum * 6);
  }

  update(dt, player, enemyBullets) {
    // ------------------------------------------------------------------------
    // BOSS WAVE UPDATE ROUTINE
    // ------------------------------------------------------------------------
    if (this.boss) {
      this.boss.update(dt, this.canvasWidth);
      
      // Boss Fire Logic
      this.fireTimer += dt;
      const fireInterval = this.boss.phase === 2 ? 0.4 : 0.8;
      if (this.fireTimer > fireInterval) {
        this.fireTimer = 0;
        const bx = this.boss.x + this.boss.width / 2;
        const by = this.boss.y + this.boss.height;

        if (this.boss.phase === 2) {
          // Spread barrage
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

    // ------------------------------------------------------------------------
    // STANDARD INVADER GRID UPDATE ROUTINE
    // ------------------------------------------------------------------------
    if (this.invaders.length === 0) return;

    // Traditional Speed-up: Dynamic speed based on remaining invader ratio
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

    // Invader Firing Logic
    this.fireTimer += dt;
    const fireInterval = Math.max(0.4, 1.8 - (gameState.wave * 0.15));
    if (this.fireTimer > fireInterval) {
      this.fireTimer = 0;
      
      // Select random bottom-most invaders to shoot
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
