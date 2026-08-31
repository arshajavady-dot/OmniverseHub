/* ==========================================================================
   CYBER INVADERS - UI CONTROLLER & OVERLAY MANAGER
   ========================================================================== */

class UIManager {
  constructor() {
    // Overlays
    this.menuOverlay = document.getElementById('menu-overlay');
    this.controlsOverlay = document.getElementById('controls-overlay');
    this.leaderboardOverlay = document.getElementById('leaderboard-overlay');
    this.settingsOverlay = document.getElementById('settings-overlay');
    this.pauseOverlay = document.getElementById('pause-overlay');
    this.gameoverOverlay = document.getElementById('gameover-overlay');
    this.hudOverlay = document.getElementById('hud-overlay');

    // HUD Elements
    this.hudScore = document.getElementById('hud-score');
    this.hudWave = document.getElementById('hud-wave');
    this.hudCombo = document.getElementById('hud-combo');
    this.hudHighScore = document.getElementById('hud-highscore');
    this.shieldBar = document.getElementById('shield-bar-fill');
    this.shieldVal = document.getElementById('shield-val');
    this.activeWeaponBadge = document.getElementById('active-weapon-badge');
    this.livesContainer = document.getElementById('lives-container');

    // Boss Bar
    this.bossHealthContainer = document.getElementById('boss-health-container');
    this.bossHpFill = document.getElementById('boss-hp-fill');
    this.bossHpPct = document.getElementById('boss-hp-pct');

    // Gameover Stats Elements
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
    // Start Game
    document.getElementById('btn-start-game').addEventListener('click', () => {
      this.showScreen(null);
      this.hudOverlay.classList.remove('hidden');
      gameEngine.initBunkers();
      gameState.reset();
      gameEngine.waveManager.generateWave(1);
      soundEngine.startBGM();
      this.updateHUD();
    });

    // Modals Navigation
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

    // Quick Pause
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

    // Game Over Actions
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

    // Save CallSign Highscore
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

    // Shield Bar
    const sPct = Math.max(0, gameState.shield);
    this.shieldBar.style.width = `${sPct}%`;
    this.shieldVal.textContent = `${Math.round(sPct)}%`;

    // Weapon Badge
    const wType = gameEngine.player.activeWeapon.toUpperCase();
    if (wType === 'STANDARD') {
      this.activeWeaponBadge.textContent = 'WEAPON: PLASMA';
    } else {
      const timeLeft = Math.ceil(gameEngine.player.weaponTimer);
      this.activeWeaponBadge.textContent = `WEAPON: ${wType} [${timeLeft}s]`;
    }

    // Lives Icons
    this.livesContainer.innerHTML = '';
    for (let i = 0; i < gameState.lives; i++) {
      const icon = document.createElement('span');
      icon.className = 'life-icon';
      icon.textContent = '▲';
      this.livesContainer.appendChild(icon);
    }

    // Boss Health Bar
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

    this.goScore.textContent = gameState.score.toLocaleString('en-US');
    this.goWaves.textContent = gameState.wave;
    this.goKills.textContent = gameState.kills;
    this.goAccuracy.textContent = `${gameState.getAccuracy()}%`;
    this.goCombo.textContent = `x${gameState.maxCombo.toFixed(1)}`;

    // Show Highscore entry box if qualified
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

// Global UI Instance
const uiManager = new UIManager();
