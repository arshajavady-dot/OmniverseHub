/**
 * Cyber Factory: Node Grid Automation — Pipeline & Circuit Routing Engine
 */

class FactoryAudioEngine {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.isBGMPlaying = false;
    this.bgmTimer = null;
    this.step = 0;
    this.tempo = 118;

    this.chords = [
      [164.81, 196.00, 246.94], // Em
      [196.00, 246.94, 293.66], // G
      [220.00, 261.63, 329.63], // Am
      [123.47, 155.56, 185.00, 220.00] // B7
    ];
    this.bassNotes = [82.41, 98.00, 110.00, 61.74];
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
        osc.frequency.setValueAtTime(bass, now);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
        osc.connect(gain);
        gain.connect(this.masterGain || this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.22);
      } catch(e) {}
    }

    if (step % 2 === 0) {
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        const chord = this.chords[bar % this.chords.length];
        const note = chord[(step / 2) % 3];
        osc.frequency.setValueAtTime(note, now);
        gain.gain.setValueAtTime(0.025, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc.connect(gain);
        gain.connect(this.masterGain || this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.12);
      } catch(e) {}
    }
  }

  playPlace() {
    if (!this.enabled || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(640, now + 0.1);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.connect(gain);
      gain.connect(this.masterGain || this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.12);
    } catch(e) {}
  }

  playCrank() {
    if (!this.enabled || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.exponentialRampToValueAtTime(260, now + 0.08);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.connect(gain);
      gain.connect(this.masterGain || this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.08);
    } catch(e) {}
  }
}

const MODULE_DEFS = {
  miner: { name: 'Extractor', icon: '⛏️', baseCost: 25, baseRate: 4, desc: 'Extracts raw titanium ore.' },
  smelter: { name: 'Smelter', icon: '🔥', baseCost: 60, baseRate: 14, desc: 'Smelts adjacent ores into high-grade alloy (+2.5x synergy).' },
  conveyor: { name: 'Conveyor', icon: '⏩', baseCost: 15, baseRate: 2, desc: 'Accelerates adjacent node flow (+20% speed).' },
  turbine: { name: 'Turbine', icon: '⚡', baseCost: 150, baseRate: 35, desc: 'Supercharges all 4 orthogonal adjacent nodes (+100% output).' },
  arm: { name: 'Robo-Arm', icon: '🦾', baseCost: 350, baseRate: 110, desc: 'Automates advanced mecha circuit loops.' },
  demolish: { name: 'Recycle', icon: '🗑️', baseCost: 0, baseRate: 0, desc: 'Demolish and refund 50% credits.' }
};

class NodeGridFactory {
  constructor() {
    this.audio = new FactoryAudioEngine();

    this.credits = parseInt(localStorage.getItem('cyber_factory_node_credits') || '100', 10);
    this.selectedTool = 'miner';
    this.isOverclocked = false;
    this.overclockTimer = null;

    // 4x4 Grid Matrix (16 nodes)
    const savedGrid = localStorage.getItem('cyber_factory_node_grid');
    if (savedGrid) {
      try {
        this.grid = JSON.parse(savedGrid);
      } catch(e) {
        this.initEmptyGrid();
      }
    } else {
      this.initEmptyGrid();
    }

    this.initUI();
    this.recalculateSynergy();
    this.startProductionLoop();
  }

  initEmptyGrid() {
    this.grid = [];
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        this.grid.push({
          row: r,
          col: c,
          module: null, // 'miner' | 'smelter' | 'conveyor' | 'turbine' | 'arm'
          level: 1,
          synergyMultiplier: 1.0,
          outputRate: 0
        });
      }
    }
  }

  initUI() {
    window.focus();
    window.addEventListener('click', () => window.focus());

    // Tool selector buttons
    document.querySelectorAll('.module-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.module-btn').forEach(b => b.classList.remove('active'));
        const target = e.currentTarget;
        target.classList.add('active');
        this.selectedTool = target.dataset.type;
      });
    });

    document.getElementById('btn-manual-crank').addEventListener('click', () => this.manualCrank());
    document.getElementById('btn-pulse-overclock').addEventListener('click', () => this.triggerOverclock());

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

    this.renderGrid();
    this.updateHUD();
  }

  manualCrank() {
    const gain = 5 * (this.isOverclocked ? 3 : 1);
    this.credits += gain;
    this.audio.playCrank();
    this.updateHUD();
    this.save();
  }

  triggerOverclock() {
    if (this.isOverclocked) return;
    this.isOverclocked = true;
    document.getElementById('btn-pulse-overclock').disabled = true;

    if (this.overclockTimer) clearTimeout(this.overclockTimer);
    this.overclockTimer = setTimeout(() => {
      this.isOverclocked = false;
      document.getElementById('btn-pulse-overclock').disabled = false;
      this.recalculateSynergy();
      this.updateHUD();
    }, 8000);

    this.recalculateSynergy();
    this.updateHUD();
  }

  handleNodeClick(node) {
    if (this.selectedTool === 'demolish') {
      if (node.module) {
        const refund = Math.floor(MODULE_DEFS[node.module].baseCost * 0.5 * node.level);
        this.credits += refund;
        node.module = null;
        node.level = 1;
        this.audio.playPlace();
        this.recalculateSynergy();
        this.renderGrid();
        this.updateHUD();
        this.save();
      }
      return;
    }

    const def = MODULE_DEFS[this.selectedTool];
    if (!def) return;

    if (!node.module) {
      // Build New Module
      if (this.credits >= def.baseCost) {
        this.credits -= def.baseCost;
        node.module = this.selectedTool;
        node.level = 1;
        this.audio.playPlace();
        this.recalculateSynergy();
        this.renderGrid();
        this.updateHUD();
        this.save();
      }
    } else if (node.module === this.selectedTool) {
      // Upgrade Existing Module
      const upgradeCost = Math.floor(def.baseCost * Math.pow(1.5, node.level));
      if (this.credits >= upgradeCost) {
        this.credits -= upgradeCost;
        node.level++;
        this.audio.playPlace();
        this.recalculateSynergy();
        this.renderGrid();
        this.updateHUD();
        this.save();
      }
    } else {
      // Replace with another module
      if (this.credits >= def.baseCost) {
        this.credits -= def.baseCost;
        node.module = this.selectedTool;
        node.level = 1;
        this.audio.playPlace();
        this.recalculateSynergy();
        this.renderGrid();
        this.updateHUD();
        this.save();
      }
    }
  }

  getAdjacentNodes(r, c) {
    const neighbors = [];
    const deltas = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    deltas.forEach(([dr, dc]) => {
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nr < 4 && nc >= 0 && nc < 4) {
        const neighbor = this.grid.find(n => n.row === nr && n.col === nc);
        if (neighbor) neighbors.push(neighbor);
      }
    });
    return neighbors;
  }

  recalculateSynergy() {
    let totalGridRate = 0;
    let globalSynergySum = 0;
    let occupiedCount = 0;

    this.grid.forEach(node => {
      if (!node.module) {
        node.outputRate = 0;
        node.synergyMultiplier = 1.0;
        return;
      }

      occupiedCount++;
      const def = MODULE_DEFS[node.module];
      let mult = 1.0;

      const neighbors = this.getAdjacentNodes(node.row, node.col);
      neighbors.forEach(adj => {
        if (!adj.module) return;
        // Turbine synergy: boosts adjacent nodes by +100%
        if (adj.module === 'turbine') mult += 1.0 * adj.level;
        // Smelter + Miner synergy: boosts by +150%
        if (node.module === 'smelter' && adj.module === 'miner') mult += 1.5;
        // Conveyor synergy: +30%
        if (adj.module === 'conveyor') mult += 0.3 * adj.level;
      });

      if (this.isOverclocked) mult *= 3.0;

      node.synergyMultiplier = mult;
      node.outputRate = Math.floor(def.baseRate * node.level * mult);
      totalGridRate += node.outputRate;
      globalSynergySum += mult;
    });

    this.totalRate = totalGridRate;
    this.avgSynergy = occupiedCount > 0 ? (globalSynergySum / occupiedCount) : 1.0;
  }

  renderGrid() {
    const gridEl = document.getElementById('factory-grid');
    gridEl.innerHTML = '';

    this.grid.forEach(node => {
      const el = document.createElement('div');
      el.className = 'grid-node';

      if (node.module) {
        const def = MODULE_DEFS[node.module];
        el.classList.add('occupied');
        if (node.synergyMultiplier > 1.8) el.classList.add('boosted');

        el.innerHTML = `
          <span class="node-icon">${def.icon}</span>
          <span class="node-title">${def.name}</span>
          <span class="node-rate">+${node.outputRate}/s</span>
          <span class="node-lvl-badge">Lv.${node.level}</span>
        `;
      } else {
        el.innerHTML = `
          <span class="node-icon" style="opacity: 0.3;">➕</span>
          <span class="node-title" style="color: #64748b;">Empty</span>
        `;
      }

      el.addEventListener('click', () => this.handleNodeClick(node));
      gridEl.appendChild(el);
    });
  }

  startProductionLoop() {
    setInterval(() => {
      if (this.totalRate > 0) {
        this.credits += this.totalRate;
        this.updateHUD();
        this.save();
      }
    }, 1000);
  }

  save() {
    localStorage.setItem('cyber_factory_node_credits', this.credits.toString());
    localStorage.setItem('cyber_factory_node_grid', JSON.stringify(this.grid));

    if (window.parent && window.parent !== window) {
      try {
        window.parent.postMessage({
          game: 'cyber-factory',
          score: this.credits
        }, '*');
      } catch (e) {}
    }
  }

  updateHUD() {
    document.getElementById('credits-val').textContent = `${this.credits.toLocaleString()} 🪙`;
    document.getElementById('rate-val').textContent = `+${this.totalRate.toLocaleString()} /sec`;
    document.getElementById('grid-synergy-badge').textContent = `SYNERGY: ${this.avgSynergy.toFixed(1)}x`;

    const heat = this.isOverclocked ? '🔥 88°C (HOT)' : '❄️ 24°C';
    document.getElementById('power-val').textContent = `⚡ 100% | ${heat}`;

    // Update blueprint costs
    Object.keys(MODULE_DEFS).forEach(k => {
      const el = document.getElementById(`cost-${k}`);
      if (el) el.textContent = `${MODULE_DEFS[k].baseCost} 🪙`;
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.factoryGridGame = new NodeGridFactory();
});
