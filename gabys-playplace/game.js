// game.js - Game Engine with Synchronized Enlarged Fullscreen Container & Settings

class GameEngine {
  constructor() {
    this.currentSceneId = 'main_menu';
    this.savedSceneId = null;
    this.inventory = new Set();
    this.tension = 15;
    this.typewriterTimer = null;
    this.isTyping = false;
    this.hasReachedCompyEnding = false;
    this.compyDefied = false;
    this.compyFailedControl = false;

    // Default Settings
    this.settings = {
      language: 'en',
      fullscreen: false,
      flashlight: true
    };

    // DOM Elements
    this.sceneTitle = document.getElementById('sceneTitle');
    this.sceneText = document.getElementById('sceneText');
    this.typingCursor = document.getElementById('typingCursor');
    this.sceneArea = document.getElementById('sceneArea');
    this.choicesContainer = document.getElementById('choicesContainer');
    this.inventoryList = document.getElementById('inventoryList');
    this.inventoryHeading = document.getElementById('inventoryHeading');
    this.tensionBar = document.getElementById('tensionBar');
    this.tensionVal = document.getElementById('tensionVal');
    this.statusMessage = document.getElementById('statusMessage');
    this.audioToggleBtn = document.getElementById('audioToggleBtn');
    this.restartBtn = document.getElementById('restartBtn');
    this.settingsBtn = document.getElementById('settingsBtn');
    this.gameContainer = document.getElementById('gameContainer');
    this.flashlight = document.getElementById('flashlight');
    this.greenSmileOverlay = document.getElementById('greenSmileOverlay');
    this.soulOrbsContainer = document.getElementById('soulOrbsContainer');

    // Settings Modal Elements
    this.settingsModal = document.getElementById('settingsModal');
    this.closeSettingsBtn = document.getElementById('closeSettingsBtn');
    this.saveSettingsBtn = document.getElementById('saveSettingsBtn');
    this.langSelect = document.getElementById('langSelect');
    this.fullscreenToggleBtn = document.getElementById('fullscreenToggleBtn');
    this.flashlightToggleBtn = document.getElementById('flashlightToggleBtn');
    this.settingsTitle = document.getElementById('settingsTitle');
    this.langLabel = document.getElementById('langLabel');
    this.fullscreenLabel = document.getElementById('fullscreenLabel');
    this.flashlightLabel = document.getElementById('flashlightLabel');

    this.init();
  }

  init() {
    this.loadSettings();
    this.setupMouseAndTouchTracking();
    this.setupEventListeners();
    this.setupSettingsEventListeners();
    this.loadState();
    this.applySettings();
    this.triggerCrtTvPowerOn();
    
    // Always start at Main Menu initially
    this.renderScene('main_menu');
  }

  getText(obj) {
    if (!obj) return '';
    if (typeof obj === 'string') return obj;
    const lang = this.settings.language || 'en';
    return obj[lang] || obj['en'] || Object.values(obj)[0] || '';
  }

  loadSettings() {
    this.settings = {
      language: 'en',
      fullscreen: false,
      flashlight: true
    };
    try {
      const saved = localStorage.getItem('gabys_playplace_settings_v3');
      if (saved) {
        this.settings = Object.assign(this.settings, JSON.parse(saved));
      }
    } catch (e) {
      console.warn("Settings load error:", e);
    }
  }

  saveSettings() {
    try {
      localStorage.setItem('gabys_playplace_settings_v3', JSON.stringify(this.settings));
    } catch (e) {
      console.warn("Settings save error:", e);
    }
  }

  applySettings() {
    // 1. Language RTL / LTR Setup
    const lang = this.settings.language;
    document.documentElement.lang = lang;
    if (lang === 'fa') {
      document.body.classList.add('rtl-mode');
    } else {
      document.body.classList.remove('rtl-mode');
    }

    // 2. Flashlight Overlay Toggle
    if (!this.settings.flashlight) {
      document.body.classList.add('flashlight-off');
    } else {
      document.body.classList.remove('flashlight-off');
    }

    // 3. Fullscreen Active Class Synchronization
    if (document.fullscreenElement) {
      if (this.gameContainer) this.gameContainer.classList.add('fullscreen-active');
    } else {
      if (this.gameContainer) this.gameContainer.classList.remove('fullscreen-active');
    }

    // 4. UI Labels Internationalization
    const ui = STORY_DATA.ui;
    if (ui) {
      if (this.settingsTitle) this.settingsTitle.textContent = this.getText(ui.settingsTitle);
      if (this.langLabel) this.langLabel.textContent = this.getText(ui.langLabel);
      if (this.fullscreenLabel) this.fullscreenLabel.textContent = this.getText(ui.fullscreenLabel);
      if (this.flashlightLabel) this.flashlightLabel.textContent = this.getText(ui.flashlightLabel);
      if (this.saveSettingsBtn) this.saveSettingsBtn.textContent = this.getText(ui.saveBtn);
      if (this.inventoryHeading) this.inventoryHeading.textContent = this.getText(ui.inventoryTitle);
      if (this.restartBtn) this.restartBtn.textContent = this.getText(ui.menuBtn);
      if (this.settingsBtn) this.settingsBtn.textContent = this.getText(ui.settingsBtn);
      
      if (this.audioToggleBtn) {
        this.audioToggleBtn.textContent = audioManager.isMuted ? this.getText(ui.audioBtnMuted) : this.getText(ui.audioBtnOn);
      }
    }

    // Update Dropdown & Toggle Buttons inside Modal
    if (this.langSelect) this.langSelect.value = lang;
    if (this.flashlightToggleBtn) {
      const stateText = this.settings.flashlight ? this.getText(ui.toggleOn) : this.getText(ui.toggleOff);
      this.flashlightToggleBtn.textContent = `${this.getText(ui.flashlightLabel)} ${stateText}`;
    }
    if (this.fullscreenToggleBtn) {
      const isFS = !!document.fullscreenElement;
      this.fullscreenToggleBtn.textContent = `${this.getText(ui.toggleFullscreen)} (${isFS ? this.getText(ui.toggleOn) : this.getText(ui.toggleOff)})`;
    }

    this.saveSettings();
  }

  setupSettingsEventListeners() {
    if (this.settingsBtn) {
      this.settingsBtn.addEventListener('click', () => this.openSettingsModal());
    }
    if (this.closeSettingsBtn) {
      this.closeSettingsBtn.addEventListener('click', () => this.closeSettingsModal());
    }
    if (this.saveSettingsBtn) {
      this.saveSettingsBtn.addEventListener('click', () => {
        this.saveSettingsModal();
      });
    }

    if (this.langSelect) {
      this.langSelect.addEventListener('change', (e) => {
        this.settings.language = e.target.value;
        this.applySettings();
        this.renderScene(this.currentSceneId);
      });
    }

    if (this.flashlightToggleBtn) {
      this.flashlightToggleBtn.addEventListener('click', () => {
        this.settings.flashlight = !this.settings.flashlight;
        this.applySettings();
        audioManager.play('click');
      });
    }

    if (this.fullscreenToggleBtn) {
      this.fullscreenToggleBtn.addEventListener('click', () => {
        this.toggleFullscreen();
      });
    }

    document.addEventListener('fullscreenchange', () => {
      this.applySettings();
    });
  }

  openSettingsModal() {
    if (this.settingsModal) {
      this.applySettings();
      this.settingsModal.classList.add('active');
      audioManager.play('click');
    }
  }

  closeSettingsModal() {
    if (this.settingsModal) {
      this.settingsModal.classList.remove('active');
      audioManager.play('click');
    }
  }

  saveSettingsModal() {
    this.closeSettingsModal();
    this.showStatus("Settings Saved!");
  }

  toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        this.settings.fullscreen = true;
        this.applySettings();
      }).catch(err => {
        console.warn("Fullscreen request error:", err);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => {
          this.settings.fullscreen = false;
          this.applySettings();
        });
      }
    }
  }

  startSoulOrbs() {
    if (!this.soulOrbsContainer) return;

    if (this.soulOrbsContainer.classList.contains('active') && this.soulOrbsContainer.children.length > 0) {
      return;
    }

    this.soulOrbsContainer.innerHTML = '';
    this.soulOrbsContainer.classList.add('active');

    const orbCount = 36;
    for (let i = 0; i < orbCount; i++) {
      const orb = document.createElement('div');
      orb.className = 'soul-orb';

      const size = Math.floor(Math.random() * 26) + 14;
      const posX = Math.random() * 96 + 2;
      const posY = Math.random() * 85 + 10;
      const duration = (Math.random() * 4.5 + 4.5).toFixed(2);
      const delay = (Math.random() * 4).toFixed(2);

      orb.style.width = `${size}px`;
      orb.style.height = `${size}px`;
      orb.style.left = `${posX}vw`;
      orb.style.top = `${posY}vh`;
      orb.style.animationDuration = `${duration}s`;
      orb.style.animationDelay = `${delay}s`;

      this.soulOrbsContainer.appendChild(orb);
    }
  }

  stopSoulOrbs() {
    if (!this.soulOrbsContainer) return;
    this.soulOrbsContainer.classList.remove('active');
    setTimeout(() => {
      if (!this.soulOrbsContainer.classList.contains('active')) {
        this.soulOrbsContainer.innerHTML = '';
      }
    }, 1000);
  }

  playGreenSmileTransition(onComplete) {
    if (this.greenSmileOverlay) {
      audioManager.play('jumpscare');
      this.greenSmileOverlay.classList.add('active');

      setTimeout(() => {
        this.greenSmileOverlay.classList.remove('active');
        this.triggerCrtTvPowerOn();
        if (onComplete) onComplete();
      }, 1200);
    } else {
      this.triggerCrtTvPowerOn();
      if (onComplete) onComplete();
    }
  }

  triggerCrtTvPowerOn() {
    if (this.gameContainer) {
      this.gameContainer.classList.remove('crt-tv-power-on');
      void this.gameContainer.offsetWidth;
      this.gameContainer.classList.add('crt-tv-power-on');

      audioManager.play('stinger');

      setTimeout(() => {
        this.gameContainer.classList.remove('crt-tv-power-on');
      }, 800);
    }
  }

  setupMouseAndTouchTracking() {
    const updatePosition = (x, y) => {
      if (this.flashlight) {
        this.flashlight.style.setProperty('--cursor-x', `${x}px`);
        this.flashlight.style.setProperty('--cursor-y', `${y}px`);
      }
    };

    document.addEventListener('mousemove', (e) => {
      updatePosition(e.clientX, e.clientY);
    });

    const handleTouch = (e) => {
      if (e.touches && e.touches.length > 0) {
        updatePosition(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    document.addEventListener('touchstart', handleTouch, { passive: true });
    document.addEventListener('touchmove', handleTouch, { passive: true });
  }

  setupEventListeners() {
    if (this.audioToggleBtn) {
      this.audioToggleBtn.addEventListener('click', () => {
        audioManager.isMuted = !audioManager.isMuted;
        this.applySettings();
        audioManager.play('click');
      });
    }

    if (this.restartBtn) {
      this.restartBtn.addEventListener('click', () => {
        this.handleRestartRequest();
      });
    }
  }

  handleRestartRequest() {
    if (this.currentSceneId.startsWith('compy_') && !this.currentSceneId.startsWith('compy_meta') && !this.currentSceneId.startsWith('compy_give') && !this.currentSceneId.startsWith('compy_refuse')) {
      audioManager.play('stinger');
      this.triggerCrtTvPowerOn();
      this.renderScene('compy_restart_intercept');
      return;
    }

    if (this.hasReachedCompyEnding) {
      this.hasReachedCompyEnding = false;
      this.saveState();
      this.stopSoulOrbs();
      this.playGreenSmileTransition(() => {
        this.renderScene('compy_meta_cutscene');
      });
    } else {
      if (confirm("Return to Main Menu? / Terug naar Hoofdmenu? / بازگشت به منوی اصلی؟")) {
        this.stopSoulOrbs();
        this.playGreenSmileTransition(() => {
          this.renderScene('main_menu');
        });
      }
    }
  }

  renderScene(sceneId) {
    if (sceneId === 'compy_intro') {
      if (this.compyFailedControl) {
        this.compyFailedControl = false;
        this.saveState();
        sceneId = 'compy_failed_control_intro';
      } else if (this.compyDefied) {
        this.compyDefied = false;
        this.saveState();
        sceneId = 'compy_defied_intro';
      }
    }

    const scene = STORY_DATA.scenes[sceneId];
    if (!scene) {
      console.error(`Scene '${sceneId}' not found!`);
      return;
    }

    this.currentSceneId = sceneId;
    this.updateTension(scene.tension || 15);

    if (scene.isCompyEnding) {
      this.hasReachedCompyEnding = true;
    }

    const soulScenes = [
      'compy_terminal_explosion',
      'mighty_spirit_encounter',
      'mighty_spirit_vanquished',
      'secret_room_plushie',
      'secret_room_babysitter_costume',
      'creator_encounter',
      'ending_springlocked_babysitter',
      'ending_mighty_spirit_consumed',
      'ending_creator_deal_burned_plushie',
      'ending_creator_spared',
      'ending_ultimate_compy_vessel',
      'soul_chamber', 
      'jack_confrontation', 
      'ending_kill_jack', 
      'ending_spare_jack', 
      'ending_corrupted_partner', 
      'ending_self_sacrifice',
      'ending_compy_puppet'
    ];

    if (soulScenes.includes(sceneId)) {
      this.startSoulOrbs();
    } else {
      this.stopSoulOrbs();
    }

    if (sceneId === 'ending_springlocked_babysitter') {
      this.sceneText.classList.add('springlock-crimson-text');
    } else {
      this.sceneText.classList.remove('springlock-crimson-text');
    }

    if (scene.mightySpiritLight) {
      this.gameContainer.classList.add('mighty-spirit-light');
    } else {
      this.gameContainer.classList.remove('mighty-spirit-light');
    }

    if (sceneId === 'main_menu') {
      this.gameContainer.classList.add('main-menu-mode');
      this.gameContainer.classList.remove('compy-crt-mode');
    } else if (sceneId.startsWith('compy_meta') || sceneId === 'compy_give_control' || sceneId === 'compy_refuse_control' || sceneId === 'compy_restart_intercept' || sceneId === 'compy_what_do_you_mean') {
      this.gameContainer.classList.remove('main-menu-mode');
      this.gameContainer.classList.add('compy-crt-mode');
      localStorage.setItem('compy_has_chip', 'true');
    } else {
      this.gameContainer.classList.remove('main-menu-mode');
      this.gameContainer.classList.remove('compy-crt-mode');
    }

    if (sceneId.includes('ending') || sceneId.startsWith('compy_')) {
      localStorage.setItem('compy_has_chip', 'true');
    }

    if (scene.severeGlitch) {
      this.gameContainer.classList.add('screen-glitch-severe');
    } else {
      this.gameContainer.classList.remove('screen-glitch-severe');
    }

    if (scene.soundEffect) {
      audioManager.play(scene.soundEffect);
    }

    if (scene.pickupItem && !this.inventory.has(scene.pickupItem.id)) {
      this.inventory.add(scene.pickupItem.id);
      this.renderInventory();
      audioManager.play('stinger');
      this.showStatus(`Acquired: ${scene.pickupItem.name}!`);
    } else {
      this.showStatus(`Location: ${this.getText(scene.title)}`);
    }

    if (scene.flashRed || scene.id === 'animatronic_jump') {
      this.gameContainer.classList.add('shock-flash');
    } else {
      this.gameContainer.classList.remove('shock-flash');
    }

    this.sceneTitle.textContent = this.getText(scene.title);

    const localizedText = this.getText(scene.text);
    this.typewriterText(localizedText, () => {
      this.renderChoices(scene.choices);
    });

    if (sceneId !== 'main_menu') {
      this.saveState();
    }
  }

  typewriterText(text, onComplete) {
    if (this.typewriterTimer) {
      clearTimeout(this.typewriterTimer);
    }

    this.sceneText.textContent = '';
    this.choicesContainer.innerHTML = '';
    if (this.typingCursor) this.typingCursor.style.display = 'inline-block';
    this.isTyping = true;

    let index = 0;

    const cleanupHandlers = () => {
      this.sceneText.removeEventListener('click', skipHandler);
      this.sceneText.removeEventListener('touchstart', skipHandler);
      document.removeEventListener('keydown', keydownHandler);
    };

    const typeNextChar = () => {
      if (!this.isTyping) return;

      if (index < text.length) {
        const char = text.charAt(index);
        this.sceneText.textContent += char;
        index++;

        if (index % 4 === 0) {
          audioManager.play('typeClick');
        }

        if (this.sceneArea) {
          this.sceneArea.scrollTop = this.sceneArea.scrollHeight;
        }

        let delay = 14;
        if (char === '.' || char === '!' || char === '?' || char === '؛') {
          delay = 220;
        } else if (char === ',' || char === ':' || char === '،') {
          delay = 110;
        } else if (char === '\n') {
          delay = 180;
        }

        this.typewriterTimer = setTimeout(typeNextChar, delay);
      } else {
        this.isTyping = false;
        cleanupHandlers();
        if (onComplete) onComplete();
      }
    };

    const skipHandler = (e) => {
      if (this.isTyping) {
        clearTimeout(this.typewriterTimer);
        this.sceneText.textContent = text;
        this.isTyping = false;
        if (this.sceneArea) {
          this.sceneArea.scrollTop = this.sceneArea.scrollHeight;
        }
        cleanupHandlers();
        if (onComplete) onComplete();
      }
    };

    const keydownHandler = (e) => {
      if (e.key === 'Enter') {
        skipHandler(e);
      }
    };

    this.sceneText.addEventListener('click', skipHandler);
    this.sceneText.addEventListener('touchstart', skipHandler, { passive: true });
    document.addEventListener('keydown', keydownHandler);

    typeNextChar();
  }

  renderChoices(choices) {
    this.choicesContainer.innerHTML = '';
    if (!choices) return;

    choices.forEach((choice, index) => {
      const btn = document.createElement('button');
      btn.className = 'choice-btn';
      btn.style.animationDelay = `${index * 0.08}s`;

      const choiceTextStr = this.getText(choice.text);

      if (choice.target === 'LOAD_SAVE') {
        if (!this.savedSceneId || this.savedSceneId === 'main_menu') {
          btn.classList.add('disabled');
          btn.textContent = this.getText(STORY_DATA.ui.continueNoSave);
          btn.title = "No active saved game to continue.";
        } else {
          const savedSceneObj = STORY_DATA.scenes[this.savedSceneId];
          const sceneName = savedSceneObj ? this.getText(savedSceneObj.title) : "Saved Game";
          btn.textContent = `${this.getText(STORY_DATA.ui.continueSaved)} (${sceneName})`;
        }
      } else {
        btn.textContent = choiceTextStr;
      }

      let meetsReqs = true;
      if (choice.requiredItems) {
        meetsReqs = choice.requiredItems.every(itemId => this.inventory.has(itemId));
      }
      if (choice.requiredAnyItems) {
        meetsReqs = choice.requiredAnyItems.some(itemId => this.inventory.has(itemId));
      }

      if (!meetsReqs) {
        btn.classList.add('disabled');
        btn.title = "You are missing required items for this choice!";
      }

      btn.addEventListener('click', () => {
        if (choice.target === 'OPEN_SETTINGS') {
          this.openSettingsModal();
          return;
        }

        if (!meetsReqs) {
          audioManager.play('scratch');
          this.showStatus("Option locked! Missing required inventory items.");
          return;
        }

        if (choice.pickupSoul) {
          this.inventory.add('compy_soul');
          this.renderInventory();
          audioManager.play('stinger');
          this.showStatus("Acquired: Compy's Soul (The Lead Engineer's Soul)!");
        }

        if (choice.target === 'LOAD_SAVE') {
          if (!this.savedSceneId || this.savedSceneId === 'main_menu') {
            audioManager.play('scratch');
            this.showStatus("No saved game to continue!");
            return;
          }
          audioManager.play('click');
          this.playGreenSmileTransition(() => {
            this.renderScene(this.savedSceneId);
          });
          return;
        }

        audioManager.play('click');

        if (this.currentSceneId === 'main_menu' || choice.reset) {
          this.playGreenSmileTransition(() => {
            if (choice.reset) {
              this.resetGame();
            } else {
              this.renderScene(choice.target);
            }
          });
          return;
        }

        if (choice.setCompyFailedControl) {
          this.compyFailedControl = true;
          this.inventory.clear();
          this.renderInventory();
          this.playGreenSmileTransition(() => {
            this.renderScene('start');
          });
          return;
        }

        if (choice.setCompyDefied) {
          this.compyDefied = true;
          this.inventory.clear();
          this.renderInventory();
          this.playGreenSmileTransition(() => {
            this.renderScene('start');
          });
          return;
        }

        this.renderScene(choice.target);
      });

      this.choicesContainer.appendChild(btn);
    });

    // Compy Quest 2: Kill Jax Directive Button
    const isQ2Active = localStorage.getItem('compy_q2_active') === 'true';
    const hasKilledJax = localStorage.getItem('compy_q2_jax_killed') === 'true';
    if (isQ2Active && !hasKilledJax && this.currentSceneId !== 'main_menu') {
      const jaxKillBtn = document.createElement('button');
      jaxKillBtn.className = 'choice-btn';
      jaxKillBtn.style.border = '2px solid #ef4444';
      jaxKillBtn.style.color = '#fca5a5';
      jaxKillBtn.style.background = 'rgba(69, 10, 10, 0.8)';
      jaxKillBtn.innerHTML = `<span>🗡️</span> [KILL JAX (COMPY DIRECTIVE)]`;
      jaxKillBtn.addEventListener('click', () => {
        audioManager.play('stinger');
        localStorage.setItem('compy_q2_jax_killed', 'true');
        this.showStatus('🩸 [ENTITY PURGED: JAX TERMINATED. COMPY DIRECTIVE COMPLETE!]');
        jaxKillBtn.remove();
        alert('🩸 [JAX TERMINATED]\n\nYou crushed Jax\'s animatronic core according to Compy\'s orders. Return to Compy or finish the remaining targets!');
      });
      this.choicesContainer.appendChild(jaxKillBtn);
    }
  }

  renderInventory() {
    this.inventoryList.innerHTML = '';
    const ui = STORY_DATA.ui;
    if (this.inventory.size === 0) {
      this.inventoryList.innerHTML = `<li class="empty-inv">${this.getText(ui.emptyInv)}</li>`;
      return;
    }

    this.inventory.forEach(itemId => {
      let itemObj = null;
      if (itemId === 'compy_soul') {
        itemObj = { name: "Compy's Soul", description: "The Lead Engineer's Soul. Unlocks and controls all doors in the building." };
      } else {
        Object.values(STORY_DATA.scenes).forEach(s => {
          if (s.pickupItem && s.pickupItem.id === itemId) {
            itemObj = s.pickupItem;
          }
        });
      }

      if (itemObj) {
        const li = document.createElement('li');
        li.className = 'inventory-item';
        li.innerHTML = `
          <div class="item-name">🔑 ${itemObj.name}</div>
          <div class="item-desc">${itemObj.description}</div>
        `;
        this.inventoryList.appendChild(li);
      }
    });
  }

  updateTension(newTension) {
    this.tension = Math.min(100, Math.max(0, newTension));
    if (this.tensionBar) {
      this.tensionBar.style.width = `${this.tension}%`;
    }
    if (this.tensionVal) {
      this.tensionVal.textContent = `${this.tension}%`;
    }
  }

  showStatus(msg) {
    if (this.statusMessage) {
      this.statusMessage.textContent = msg;
    }
  }

  saveState() {
    try {
      const state = {
        sceneId: this.currentSceneId,
        inventory: Array.from(this.inventory),
        tension: this.tension,
        hasReachedCompyEnding: this.hasReachedCompyEnding,
        compyDefied: this.compyDefied,
        compyFailedControl: this.compyFailedControl,
        settings: this.settings
      };
      localStorage.setItem('gabys_playplace_save', JSON.stringify(state));
      this.savedSceneId = this.currentSceneId;
    } catch (e) {
      console.warn("Storage save error:", e);
    }
  }

  loadState() {
    try {
      const saved = localStorage.getItem('gabys_playplace_save');
      if (saved) {
        const state = JSON.parse(saved);
        if (state.sceneId && STORY_DATA.scenes[state.sceneId] && state.sceneId !== 'main_menu') {
          this.savedSceneId = state.sceneId;
        }
        if (Array.isArray(state.inventory)) {
          this.inventory = new Set(state.inventory);
        }
        this.tension = state.tension || 15;
        this.hasReachedCompyEnding = !!state.hasReachedCompyEnding;
        this.compyDefied = !!state.compyDefied;
        this.compyFailedControl = !!state.compyFailedControl;
        this.renderInventory();
      }
    } catch (e) {
      console.warn("Storage load error:", e);
    }
  }

  resetGame() {
    localStorage.removeItem('gabys_playplace_save');
    this.inventory.clear();
    this.savedSceneId = null;
    this.renderInventory();
    this.renderScene('start');
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.gameEngine = new GameEngine();
});
