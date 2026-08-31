/* ==========================================================================
   CYBER INVADERS - GAME STATE & LOCALSTORAGE MANAGER
   ========================================================================== */

class GameState {
  constructor() {
    this.score = 0;
    this.highScore = 0;
    this.wave = 1;
    this.lives = 3;
    this.kills = 0;
    this.shotsFired = 0;
    this.shotsHit = 0;

    // Combo system
    this.combo = 1.0;
    this.maxCombo = 1.0;
    this.comboTimer = 0;

    // Player Stats & Status
    this.shield = 100;
    this.maxShield = 100;
    this.energy = 100;
    this.maxEnergy = 100;
    this.bombReady = true;

    // Settings
    this.settings = {
      sfxVolume: 0.8,
      musicVolume: 0.6,
      crtLines: true,
      particles: true,
      screenShake: true
    };

    // State flags
    this.isRunning = false;
    this.isPaused = false;
    this.isGameOver = false;
    this.isBossWave = false;

    // Load persisted data
    this.loadSettings();
    this.loadHighScore();
  }

  reset() {
    this.score = 0;
    this.wave = 1;
    this.lives = 3;
    this.kills = 0;
    this.shotsFired = 0;
    this.shotsHit = 0;
    this.combo = 1.0;
    this.maxCombo = 1.0;
    this.comboTimer = 0;
    this.shield = 100;
    this.energy = 100;
    this.bombReady = true;
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
    this.comboTimer = 200; // ~3.3 seconds window to maintain combo
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

  /* ------------------------------------------------------------------------
     LOCAL STORAGE PERSISTENCE
     ------------------------------------------------------------------------ */

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
    // Default mock leaderboard if none exists
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

// Global Game State Instance
const gameState = new GameState();
