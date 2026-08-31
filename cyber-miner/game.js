/**
 * Cyber Miner: Deep Dig Tycoon — Idle Mining Engine
 */

class MinerAudioEngine {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.isBGMPlaying = false;
    this.bgmTimer = null;
    this.step = 0;
    this.tempo = 118;

    // Industrial Cyber-Funk Chords: Bm, G, A, F#m
    this.chords = [
      [123.47, 146.83, 185.00], // Bm
      [98.00, 123.47, 146.83],  // G
      [110.00, 138.59, 164.81], // A
      [92.50, 110.00, 138.59]   // F#m
    ];
    this.bassNotes = [61.74, 49.00, 55.00, 46.25];
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
        osc.frequency.setValueAtTime(bass * 2, now);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
        osc.connect(gain);
        gain.connect(this.masterGain || this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.22);
      } catch(e) {}
    }

    if (step % 8 === 4) {
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, now);
        gain.gain.setValueAtTime(0.03, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.connect(gain);
        gain.connect(this.masterGain || this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.15);
      } catch(e) {}
    }
  }

  playDrill() {
    if (!this.enabled || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(60, now + 0.08);
      gain.gain.setValueAtTime(0.09, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.connect(gain);
      gain.connect(this.masterGain || this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.08);
    } catch(e) {}
  }

  playUpgrade() {
    if (!this.enabled || !this.ctx) return;
    try {
      const notes = [329.63, 440.00, 659.25];
      notes.forEach((f, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const now = this.ctx.currentTime + i * 0.06;
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, now);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.connect(gain);
        gain.connect(this.masterGain || this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.2);
      });
    } catch(e) {}
  }
}

class CyberMiner {
  constructor() {
    this.audio = new MinerAudioEngine();

    this.credits = parseInt(localStorage.getItem('cyber_miner_credits') || '0', 10);
    this.depth = parseInt(localStorage.getItem('cyber_miner_depth') || '0', 10);

    this.stratas = [
      { name: 'SURFACE CRUST (COPPER)', hp: 100, reward: 50 },
      { name: 'MANTLE STRATA (TITANIUM)', hp: 300, reward: 200 },
      { name: 'DEEP CRUST (OBSIDIAN)', hp: 800, reward: 600 },
      { name: 'MAGMA VAULT (PLASMA GEMS)', hp: 2000, reward: 1800 },
      { name: 'PLANETARY CORE (ANTIMATTER)', hp: 5000, reward: 5000 }
    ];
    this.strataIdx = 0;
    this.currentLayerHp = 100;

    this.clickPower = 10;
    this.idleRate = 0;

    this.upgrades = [
      { id: 'laser_bit', name: 'Plasma Drill Bit', cost: 50, level: 0, powerAdd: 10, type: 'click', icon: '⚡' },
      { id: 'sub_drone', name: 'Autonomous Sub-Drone', cost: 150, level: 0, rateAdd: 15, type: 'idle', icon: '🤖' },
      { id: 'vibro_hammer', name: 'Vibro Shock Hammer', cost: 500, level: 0, powerAdd: 40, type: 'click', icon: '🔨' },
      { id: 'quantum_harvester', name: 'Quantum Harvester Rig', cost: 1200, level: 0, rateAdd: 100, type: 'idle', icon: '🏭' }
    ];

    this.initUI();
    this.startLoop();
  }

  initUI() {
    window.focus();
    window.addEventListener('click', () => window.focus());

    document.getElementById('btn-mine-drill').addEventListener('click', () => this.drill());

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

    this.renderUpgrades();
    this.updateHUD();
  }

  drill() {
    this.currentLayerHp -= this.clickPower;
    this.credits += this.clickPower;
    this.audio.playDrill();

    if (this.currentLayerHp <= 0) {
      const cur = this.stratas[this.strataIdx % this.stratas.length];
      this.credits += cur.reward;
      this.depth += 25;
      this.strataIdx++;

      const next = this.stratas[this.strataIdx % this.stratas.length];
      this.currentLayerHp = next.hp;
      this.audio.playUpgrade();
    }

    this.updateHUD();
    this.save();
  }

  renderUpgrades() {
    const list = document.getElementById('upgrades-list');
    list.innerHTML = '';
    this.upgrades.forEach(u => {
      const card = document.createElement('div');
      card.className = 'upgrade-card';
      card.innerHTML = `
        <div class="upg-info">
          <span class="upg-icon">${u.icon}</span>
          <div>
            <p class="upg-name">${u.name} (Lv.${u.level})</p>
            <p class="upg-effect">${u.type === 'click' ? `+${u.powerAdd} Drill Power` : `+${u.rateAdd}/s Mining Rate`}</p>
          </div>
        </div>
        <button class="upg-btn" data-id="${u.id}">BUY: ${u.cost.toLocaleString()} 🪙</button>
      `;
      card.querySelector('.upg-btn').addEventListener('click', () => this.buyUpgrade(u));
      list.appendChild(card);
    });
  }

  buyUpgrade(u) {
    if (this.credits >= u.cost) {
      this.credits -= u.cost;
      u.level++;
      if (u.type === 'click') this.clickPower += u.powerAdd;
      if (u.type === 'idle') this.idleRate += u.rateAdd;
      u.cost = Math.floor(u.cost * 1.5);
      this.audio.playUpgrade();
      this.renderUpgrades();
      this.updateHUD();
      this.save();
    }
  }

  startLoop() {
    setInterval(() => {
      if (this.idleRate > 0) {
        this.credits += this.idleRate;
        this.currentLayerHp -= this.idleRate;
        if (this.currentLayerHp <= 0) {
          const cur = this.stratas[this.strataIdx % this.stratas.length];
          this.credits += cur.reward;
          this.depth += 25;
          this.strataIdx++;

          const next = this.stratas[this.strataIdx % this.stratas.length];
          this.currentLayerHp = next.hp;
        }
        this.updateHUD();
        this.save();
      }
    }, 1000);
  }

  save() {
    localStorage.setItem('cyber_miner_credits', this.credits.toString());
    localStorage.setItem('cyber_miner_depth', this.depth.toString());

    if (window.parent && window.parent !== window) {
      try {
        window.parent.postMessage({
          game: 'cyber-miner',
          score: this.credits
        }, '*');
      } catch (e) {}
    }
  }

  updateHUD() {
    const cur = this.stratas[this.strataIdx % this.stratas.length];
    document.getElementById('credits-val').textContent = `${this.credits.toLocaleString()} 🪙`;
    document.getElementById('depth-val').textContent = `${this.depth.toLocaleString()}m`;
    document.getElementById('rate-val').textContent = `+${this.idleRate}/s`;

    document.getElementById('layer-name').textContent = cur.name;
    document.getElementById('layer-hp-text').textContent = `${Math.max(0, Math.ceil(this.currentLayerHp))} / ${cur.hp} HP`;
    document.getElementById('layer-hp-bar').style.width = `${Math.max(0, (this.currentLayerHp / cur.hp) * 100)}%`;
    document.getElementById('click-power-lbl').textContent = `+${this.clickPower} ORE / DRILL`;

    // Update buttons disabled state
    document.querySelectorAll('.upg-btn').forEach(btn => {
      const id = btn.dataset.id;
      const upg = this.upgrades.find(u => u.id === id);
      if (upg) btn.disabled = this.credits < upg.cost;
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.minerGame = new CyberMiner();
});
