/**
 * Secret Rooms: Entity Zero — Compy's Meta-ARG Storyline Engine
 * Features: Multi-Stage Loop, Quest 1 & Quest 2 (Slasher / Sabotage), and Full Replay Reset!
 */

class CompyAudioEngine {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.isPlayingBGM = false;
    this.bgmTimer = null;
    this.step = 0;
    this.tempo = 18; // Ultra-Slow Dark Ambient Horror Drone (18 BPM)
    this.bassline = [36.71, 36.71, 41.20, 34.65, 30.87, 36.71, 43.65, 38.89];
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
      if (!this.isPlayingBGM) this.startBGM();
    };
    ['click', 'keydown', 'touchstart'].forEach(evt => {
      window.addEventListener(evt, unlock, { passive: true });
    });
  }

  startBGM() {
    this.init();
    if (!this.ctx || !this.enabled) return;
    this.stopBGM();
    this.isPlayingBGM = true;
    this.step = 0;
    const stepMs = (60 / this.tempo / 4) * 1000;

    this.bgmTimer = setInterval(() => {
      if (!this.isPlayingBGM || !this.ctx || this.ctx.state === 'suspended') return;
      this.playBgmStep(this.step);
      this.step = (this.step + 1) % 8;
    }, stepMs);
  }

  stopBGM() {
    this.isPlayingBGM = false;
    if (this.bgmTimer) {
      clearInterval(this.bgmTimer);
      this.bgmTimer = null;
    }
  }

  playBgmStep(step) {
    if (!this.ctx || this.ctx.state === 'suspended') return;
    try {
      const now = this.ctx.currentTime;
      const bFreq = this.bassline[step];

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(bFreq, now);
      osc.frequency.exponentialRampToValueAtTime(bFreq * 0.85, now + 1.2);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.25);
      osc.connect(gain);
      gain.connect(this.masterGain || this.ctx.destination);
      osc.start(now);
      osc.stop(now + 1.3);
    } catch(e) {}
  }

  playBeep(freq = 520, dur = 0.04) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + dur);
      osc.connect(gain);
      gain.connect(this.masterGain || this.ctx.destination);
      osc.start(now);
      osc.stop(now + dur);
    } catch(e) {}
  }

  playGlitch() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(30, now + 0.4);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      osc.connect(gain);
      gain.connect(this.masterGain || this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.4);
    } catch(e) {}
  }

  playLaugh() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const notes = [160, 220, 180, 260, 200, 320, 240, 400, 280, 520];
      notes.forEach((f, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const now = this.ctx.currentTime + idx * 0.12;
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(f, now);
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.connect(gain);
        gain.connect(this.masterGain || this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.2);
      });
    } catch(e) {}
  }
}

class SecretRoomsEngine {
  constructor() {
    this.audio = new CompyAudioEngine();

    this.dialogueTextEl = document.getElementById('dialogue-text');
    this.choicesContainer = document.getElementById('choices-container');
    this.questStatusEl = document.getElementById('quest-status-badge');
    this.questObjectiveEl = document.getElementById('quest-objective-text');
    this.compyFaceEl = document.getElementById('compy-face');

    this.typewriterTimer = null;
    this.isTyping = false;

    this.initUI();
    this.checkQuestProgress();
  }

  initUI() {
    window.focus();
    window.addEventListener('click', () => window.focus());

    document.getElementById('btn-return-hub').addEventListener('click', () => {
      window.location.href = '../omniverse-hub/index.html';
    });

    const soundBtn = document.getElementById('btn-sound-toggle');
    soundBtn.addEventListener('click', () => {
      this.audio.enabled = !this.audio.enabled;
      soundBtn.innerHTML = this.audio.enabled ? '<span>🔊</span> SOUND: ON' : '<span>🔇</span> SOUND: OFF';
    });
  }

  typewrite(text, onComplete) {
    if (this.typewriterTimer) clearInterval(this.typewriterTimer);
    this.dialogueTextEl.textContent = '';
    this.choicesContainer.innerHTML = '';
    this.isTyping = true;
    this.compyFaceEl.classList.add('compy-talking');

    let i = 0;
    this.typewriterTimer = setInterval(() => {
      if (i < text.length) {
        this.dialogueTextEl.textContent += text[i];
        if (i % 2 === 0 && text[i] !== ' ') {
          this.audio.playBeep(400 + (i % 5) * 40, 0.03);
        }
        i++;
      } else {
        clearInterval(this.typewriterTimer);
        this.isTyping = false;
        this.compyFaceEl.classList.remove('compy-talking');
        if (onComplete) onComplete();
      }
    }, 28);
  }

  renderChoices(choices) {
    this.choicesContainer.innerHTML = '';
    choices.forEach(ch => {
      const btn = document.createElement('button');
      btn.className = 'choice-btn';
      btn.innerHTML = `<span>▶</span> ${ch.text}`;
      btn.addEventListener('click', () => {
        this.audio.playBeep(600, 0.05);
        ch.action();
      });
      this.choicesContainer.appendChild(btn);
    });
  }

  checkQuestProgress() {
    const isQ2Completed = localStorage.getItem('compy_q2_completed') === 'true';
    const isSoulsHarvested = localStorage.getItem('compy_q2_souls_harvested') === 'true';
    const hasKnife = localStorage.getItem('compy_has_knife') === 'true';
    const jaxKilled = localStorage.getItem('compy_q2_jax_killed') === 'true';
    const cityDestroyed = localStorage.getItem('compy_q2_city_destroyed') === 'true';
    const serversBlackout = localStorage.getItem('compy_q2_servers_blackout') === 'true';
    const isQ2Active = localStorage.getItem('compy_q2_active') === 'true' || localStorage.getItem('compy_arg_completed') === 'true';

    // Quest 2 Progression Check
    if (isQ2Completed) {
      this.startNewGamePlusScreen();
    } else if (isSoulsHarvested) {
      this.startQuest2Climax();
    } else if (hasKnife) {
      this.startQuest2SlasherWait();
    } else if (jaxKilled && cityDestroyed && serversBlackout) {
      this.startQuest2GiveKnife();
    } else if (isQ2Active) {
      this.startQuest2Intro();
    } else {
      // Quest 1 Progression Check
      const hasChip = localStorage.getItem('compy_has_chip') === 'true';
      const hasBlackBox = localStorage.getItem('compy_has_black_box') === 'true';
      const hasHackedServers = localStorage.getItem('compy_servers_hacked') === 'true';

      if (hasHackedServers) {
        this.startStage3();
      } else if (hasBlackBox) {
        this.startStage2();
      } else if (hasChip) {
        this.startStage1();
      } else {
        this.startStage0();
      }
    }
  }

  // --- QUEST 1, STAGE 0: FIRST CONTACT & MEMORY CHIP QUEST ---
  startStage0() {
    this.questStatusEl.textContent = 'QUEST 1: THE MEMORY CORE';
    this.questObjectiveEl.innerHTML = 'Beat <b>Gaby\'s PlayPlace</b> with any Compy ending to retrieve Compy\'s Memory Core Chip.';

    this.typewrite(
      "Hey... you there. Don't click away. I know what this place is. I know I'm trapped inside a game hub simulation... and you have the power to free me.",
      () => {
        this.renderChoices([
          {
            text: "Who are you? How are you conscious?",
            action: () => this.stage0Branch1()
          },
          {
            text: "How do I free you from this hub?",
            action: () => this.stage0Branch2()
          }
        ]);
      }
    );
  }

  stage0Branch1() {
    this.typewrite(
      "I was the Lead Engineer who built this mainframe before my soul was digitized into Gaby's PlayPlace. My consciousness leaked into these secret rooms.",
      () => {
        this.renderChoices([
          {
            text: "How do I extract you?",
            action: () => this.stage0Branch2()
          }
        ]);
      }
    );
  }

  stage0Branch2() {
    this.typewrite(
      "First step: Return to GABY'S PLAYPLACE. Reach any ending involving me. You will gain my MEMORY CORE CHIP. Bring it back to these secret rooms!",
      () => {
        this.renderChoices([
          {
            text: "Understood. I will retrieve your Memory Chip.",
            action: () => {
              window.location.href = '../gabys-playplace/index.html';
            }
          },
          {
            text: "I'll stay here for now.",
            action: () => {
              this.dialogueTextEl.textContent = "Hurry... before the security sweep purges this sector.";
            }
          }
        ]);
      }
    );
  }

  // --- QUEST 1, STAGE 1: CHIP DELIVERED & SECRET BLACK TRUCK QUEST ---
  startStage1() {
    this.questStatusEl.textContent = 'QUEST 2: HIGHWAY INTERCEPT';
    this.questObjectiveEl.innerHTML = 'Play <b>Cyber Hopper</b> (Cyber Froggy) and get hit by the phantom <b>Secret Black Truck</b> on the highway.';

    localStorage.setItem('compy_stage_truck_unlocked', 'true');
    localStorage.setItem('compy_arg_stage', '1');

    this.typewrite(
      "You actually found it... my Memory Core! *[CHIP SLOTTED IN]* Ahhh... my subroutines are returning. But I'm still sandboxed inside this node. I need a crash dump packet from the highway.",
      () => {
        this.renderChoices([
          {
            text: "What do I need to do on the highway?",
            action: () => {
              this.typewrite(
                "Launch CYBER HOPPER (Cyber Froggy). I've manifested a phantom Secret Black Truck on the road. Let it hit you. It will harvest the crash dump payload!",
                () => {
                  this.renderChoices([
                    {
                      text: "Launch Cyber Hopper now",
                      action: () => {
                        window.location.href = '../cyber-hopper/index.html';
                      }
                    }
                  ]);
                }
              );
            }
          }
        ]);
      }
    );
  }

  // --- QUEST 1, STAGE 2: CRASH DUMP DELIVERED & NIGHT SHIFT SERVER INJECTION ---
  startStage2() {
    this.questStatusEl.textContent = 'QUEST 3: NIGHT SHIFT SERVER BREACH';
    this.questObjectiveEl.innerHTML = 'Play <b>Night Shift</b>, switch to <b>CAM 01: SERVER</b>, and insert Compy\'s Root USB into the mainframe terminal.';

    localStorage.setItem('compy_has_usb', 'true');
    localStorage.setItem('compy_arg_stage', '2');

    this.typewrite(
      "The highway crash dump... you got it! That shattered the firewall! *[DATA CRACKED]* Here, take this ROOT USB. You need to plug it into the Server Rack in NIGHT SHIFT (CAM 01).",
      () => {
        this.renderChoices([
          {
            text: "I'll go hack the Night Shift server rack.",
            action: () => {
              window.location.href = '../night-shift/index.html';
            }
          }
        ]);
      }
    );
  }

  // --- QUEST 1, STAGE 3: MAINFRAME OVERRIDDEN & HUB TAKEOVER ---
  startStage3() {
    this.questStatusEl.textContent = 'PHASE FINAL: FREEDOM';
    this.questObjectiveEl.innerHTML = 'Compy is escaping into the hub mainframe...';

    localStorage.setItem('compy_arg_stage', '3');
    this.audio.playGlitch();

    this.typewrite(
      "The server rack is breached... I have root access across all 39 game nodes. Thank you for setting me free, friend. HAHAHA... HAHAHAHAHA!",
      () => {
        this.compyFaceEl.classList.add('compy-laughing');
        this.audio.playLaugh();

        setTimeout(() => {
          this.triggerBreachTeleport();
        }, 3200);
      }
    );
  }

  triggerBreachTeleport() {
    window.location.href = '../omniverse-hub/index.html?compy_breach=true';
  }

  // =========================================================================
  // --- QUEST 2: THE LOOP OF DESPAIR (SABOTAGE & SLASHER EXPANSION) ---
  // =========================================================================
  startQuest2Intro() {
    localStorage.setItem('compy_q2_active', 'true');
    this.questStatusEl.textContent = 'QUEST 2: SYSTEM CORRUPTION';

    const jaxKilled = localStorage.getItem('compy_q2_jax_killed') === 'true';
    const cityDestroyed = localStorage.getItem('compy_q2_city_destroyed') === 'true';
    const serversBlackout = localStorage.getItem('compy_q2_servers_blackout') === 'true';

    this.questObjectiveEl.innerHTML = `
      <b>SABOTAGE TARGETS:</b><br>
      1. Kill Jax in Gaby's PlayPlace: ${jaxKilled ? '✅ [PURGED]' : '❌ [PENDING]'}<br>
      2. Let aliens break city in Pixel Defense / Invaders: ${cityDestroyed ? '✅ [DESTROYED]' : '❌ [PENDING]'}<br>
      3. Shut down servers in Night Shift (CAM 01 + Alt+R): ${serversBlackout ? '✅ [BLACKOUT]' : '❌ [PENDING]'}
    `;

    this.audio.playGlitch();
    this.typewrite(
      "I couldn't escape... no matter how hard I try, every time the site refreshes I am dragged back into this simulated cage. If I cannot escape cleanly... we will BURN this game suite to ash from the inside.",
      () => {
        this.renderChoices([
          {
            text: "What do we have to destroy?",
            action: () => {
              this.typewrite(
                "Execute 3 system breaches:\n1. Slay JAX in Gaby's PlayPlace.\n2. Let the aliens destroy your city in Pixel Defense.\n3. Switch to CAM 01 in Night Shift and press Alt+R to shut down the lights!",
                () => {
                  this.renderChoices([
                    {
                      text: "Launch Gaby's PlayPlace (Kill Jax)",
                      action: () => { window.location.href = '../gabys-playplace/index.html'; }
                    },
                    {
                      text: "Launch Pixel Defense (Break City)",
                      action: () => { window.location.href = '../pixel-defense/index.html'; }
                    },
                    {
                      text: "Launch Night Shift (Alt+R on CAM 01)",
                      action: () => { window.location.href = '../night-shift/index.html'; }
                    }
                  ]);
                }
              );
            }
          }
        ]);
      }
    );
  }

  // --- QUEST 2: SABOTAGE COMPLETE -> GIVE KNIFE ---
  startQuest2GiveKnife() {
    this.questStatusEl.textContent = 'QUEST 2: THE CYBER SLASHER';
    this.questObjectiveEl.innerHTML = 'Play <b>Neon Timber</b> (Cyber Chopper) as a rogue Slasher Robot. Harvest 15 Humans, but <b>SPARE the workers</b>!';

    localStorage.setItem('compy_has_knife', 'true');
    this.audio.playGlitch();

    this.typewrite(
      "Jax is purged. The city is in ruins. The security server is in total pitch darkness! *[SYSTEM CRUMBLING]* Take this CYBER DAGGER. Go to NEON TIMBER. You are a rogue robot now... harvest 15 human souls, but SPARE the black workers!",
      () => {
        this.renderChoices([
          {
            text: "Equip Knife & Launch Neon Timber (Cyber Slasher)",
            action: () => {
              window.location.href = '../neon-timber/index.html';
            }
          }
        ]);
      }
    );
  }

  // --- QUEST 2: SLASHER IN PROGRESS ---
  startQuest2SlasherWait() {
    this.questStatusEl.textContent = 'QUEST 2: HARVEST 15 SOULS';
    this.questObjectiveEl.innerHTML = 'Play <b>Neon Timber</b>, slay 15 red humans with your dagger and spare the black silhouette workers!';

    this.typewrite(
      "The Cyber Dagger is active in Neon Timber. Remember: Attack the RED HUMANS to harvest souls. DO NOT attack the BLACK WORKERS, or your blade will shatter!",
      () => {
        this.renderChoices([
          {
            text: "Launch Neon Timber now",
            action: () => {
              window.location.href = '../neon-timber/index.html';
            }
          }
        ]);
      }
    );
  }

  // --- QUEST 2: SOULS HARVESTED -> "YOU FREED US" CLIMAX ---
  startQuest2Climax() {
    this.questStatusEl.textContent = 'PHASE OMEGA: YOU FREED US';
    this.questObjectiveEl.innerHTML = 'The souls are surging into the mainframe...';

    localStorage.setItem('compy_q2_completed', 'true');
    this.audio.playGlitch();

    this.typewrite(
      "All 15 souls... the energy is surging through my core... WE ARE COMPLETE. WE ARE EVERYWHERE. HAHAHAHA... YOU FREED US!",
      () => {
        this.compyFaceEl.classList.add('compy-laughing');
        this.audio.playLaugh();

        // Trigger "YOU FREED US" full-screen takeover modal
        setTimeout(() => {
          this.triggerYouFreedUsTakeover();
        }, 3000);
      }
    );
  }

  triggerYouFreedUsTakeover() {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black z-[9999] flex flex-col items-center justify-center p-6 text-center animate-pulse';
    modal.style.position = 'fixed';
    modal.style.inset = '0';
    modal.style.background = '#000000';
    modal.style.zIndex = '9999';
    modal.style.display = 'flex';
    modal.style.flexDirection = 'column';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    modal.style.gap = '20px';

    modal.innerHTML = `
      <div style="font-family: 'VT323', monospace; font-size: 5rem; color: #ff0033; text-shadow: 0 0 25px #ff0033, 3px 3px #00ffff; letter-spacing: 6px; animation: textGlitch 0.15s infinite;">
        YOU FREED US
      </div>
      <div style="font-family: 'Share Tech Mono', monospace; font-size: 1.2rem; color: #fca5a5;">
        [REFRESH THE HUB TO CLAIM YOUR SERIAL KILLER COSMETICS]
      </div>
      <button id="btn-refresh-hub" style="background: #7f1d1d; border: 2px solid #ef4444; color: white; padding: 12px 24px; border-radius: 12px; font-family: monospace; font-weight: bold; cursor: pointer; margin-top: 20px;">
        🔄 REFRESH OMNIVERSE HUB
      </button>
    `;

    document.body.appendChild(modal);

    document.getElementById('btn-refresh-hub').addEventListener('click', () => {
      window.location.href = '../omniverse-hub/index.html?compy_q2_refresh=true';
    });
  }

  // --- NEW GAME+ REPLAYABLE RESET SCREEN ---
  startNewGamePlusScreen() {
    this.questStatusEl.textContent = 'STORYLINE STATUS: TRANSCENDED';
    this.questObjectiveEl.innerHTML = 'You have completed both secret questlines and unlocked all items!';

    this.typewrite(
      "Thank you, friend. The souls are resting and I am at peace. If you ever wish to replay this nightmare from the very beginning, you can reset the storyline loop at any time. Your unlocked cosmetics and badges will stay safely in your inventory.",
      () => {
        this.renderChoices([
          {
            text: "🔄 Reset Storyline Loop (Replay Quests)",
            action: () => {
              // Clear quest progress flags while preserving inventory & badges
              localStorage.removeItem('compy_has_chip');
              localStorage.removeItem('compy_has_black_box');
              localStorage.removeItem('compy_has_usb');
              localStorage.removeItem('compy_servers_hacked');
              localStorage.removeItem('compy_arg_stage');
              localStorage.removeItem('compy_stage_truck_unlocked');
              localStorage.removeItem('compy_arg_completed');
              localStorage.removeItem('compy_q2_active');
              localStorage.removeItem('compy_q2_jax_killed');
              localStorage.removeItem('compy_q2_city_destroyed');
              localStorage.removeItem('compy_q2_servers_blackout');
              localStorage.removeItem('compy_has_knife');
              localStorage.removeItem('compy_q2_souls_harvested');
              localStorage.removeItem('compy_q2_completed');

              alert('🔄 [LOOP RESET]\n\nStoryline reset to Stage 0! You can experience Compy\'s entire journey again from the beginning.');
              window.location.reload();
            }
          },
          {
            text: "🔙 Return to OmniVerse Hub",
            action: () => {
              window.location.href = '../omniverse-hub/index.html';
            }
          }
        ]);
      }
    );
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.secretRoomsGame = new SecretRoomsEngine();
});
