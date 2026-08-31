/**
 * Quantum Core: Singularity Clicker — Sci-Fi Idle Incremental Engine
 */

// --- 1. PROCEDURAL WEB AUDIO SYNTHESIZER & COSMIC BGM ENGINE ---
class QuantumAudioEngine {
  constructor() {
    this.ctx = null;
    this.isPlayingBGM = false;
    this.bgmTimer = null;
    this.step = 0;
    this.tempo = 120;

    // Cosmic Space Synthesizer Scale: Cm9, Abmaj7, Ebmaj7, Bbadd9
    this.chords = [
      [130.81, 196.00, 233.08, 311.13, 392.00, 523.25], // C minor 9
      [103.83, 155.56, 207.65, 261.63, 329.63, 415.30], // Ab maj7
      [155.56, 233.08, 311.13, 392.00, 466.16, 622.25], // Eb maj7
      [116.54, 174.61, 233.08, 293.66, 349.23, 466.16]  // Bb add9
    ];

    this.initOnUserGesture();
  }

  initOnUserGesture() {
    const unlock = () => {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) this.ctx = new AudioCtx();
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      if (!this.isPlayingBGM) {
        this.startBGM();
      }
    };
    ['click', 'keydown', 'touchstart', 'pointerdown'].forEach(evt => {
      window.addEventListener(evt, unlock, { passive: true });
    });
  }

  ensureCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  startBGM() {
    const actx = this.ensureCtx();
    if (!actx) return;
    this.stopBGM();
    this.isPlayingBGM = true;
    this.step = 0;
    const stepMs = (60 / this.tempo / 2) * 1000;

    this.bgmTimer = setInterval(() => {
      if (!this.isPlayingBGM || !this.ctx) return;
      if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
      this.playCosmicStep(this.step);
      this.step = (this.step + 1) % 32;
    }, stepMs);
  }

  stopBGM() {
    this.isPlayingBGM = false;
    if (this.bgmTimer) {
      clearInterval(this.bgmTimer);
      this.bgmTimer = null;
    }
  }

  playCosmicStep(step) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const chordIndex = Math.floor(step / 8);
    const chord = this.chords[chordIndex];

    // Deep cosmic sub bass on chord downbeats (0, 8, 16, 24)
    if (step % 8 === 0) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(chord[0] / 2, now);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 1.8);
    }

    // Shimmering Arpeggiator note
    const notePattern = [0, 2, 4, 3, 5, 4, 2, 1];
    const note = chord[notePattern[step % 8]];

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(note, now);
    gain.gain.setValueAtTime(0.035, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1400, now);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.35);
  }

  playSound(type) {
    const actx = this.ensureCtx();
    if (!actx) return;
    const now = actx.currentTime;

    if (type === 'click') {
      const osc = actx.createOscillator();
      const gain = actx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440 + Math.random() * 200, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.08);
      osc.connect(gain);
      gain.connect(actx.destination);
      osc.start(now);
      osc.stop(now + 0.08);
    } else if (type === 'buy') {
      [523, 659, 784].forEach((f, i) => {
        const o = actx.createOscillator();
        const g = actx.createGain();
        o.type = 'triangle';
        o.frequency.setValueAtTime(f, now + i * 0.04);
        g.gain.setValueAtTime(0.1, now + i * 0.04);
        g.gain.linearRampToValueAtTime(0, now + i * 0.04 + 0.08);
        o.connect(g);
        g.connect(actx.destination);
        o.start(now + i * 0.04);
        o.stop(now + i * 0.04 + 0.08);
      });
    } else if (type === 'prestige') {
      const osc = actx.createOscillator();
      const gain = actx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(100, now);
      osc.frequency.exponentialRampToValueAtTime(800, now + 0.6);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.7);
      osc.connect(gain);
      gain.connect(actx.destination);
      osc.start(now);
      osc.stop(now + 0.7);
    }
  }
}

const quantumAudio = new QuantumAudioEngine();

function initAudio() {
  quantumAudio.ensureCtx();
}

function playQuantumSound(type) {
  quantumAudio.playSound(type);
}

// --- 2. GAME DATA & BUILDINGS ---
const BUILDINGS = [
  { id: 'tunnel', name: 'Micro Quantum Tunnel', icon: '🌀', baseCost: 15, baseEPS: 0.5, desc: 'Tunnels micro-qubits from subatomic foam.' },
  { id: 'antimatter', name: 'Antimatter Collector', icon: '⚡', baseCost: 100, baseEPS: 4, desc: 'Traps positrons and generates stable plasma.' },
  { id: 'dyson', name: 'Orbital Dyson Ring', icon: '🪐', baseCost: 1100, baseEPS: 24, desc: 'Harnesses cosmic stellar radiation arrays.' },
  { id: 'dark_synth', name: 'Dark Matter Synthesizer', icon: '🔮', baseCost: 12000, baseEPS: 130, desc: 'Synthesizes non-baryonic matter energy.' },
  { id: 'chrono', name: 'Chrono Time-Warp Reactor', icon: '⏳', baseCost: 130000, baseEPS: 800, desc: 'Bends space-time to extract future flux.' },
  { id: 'multiverse', name: 'Multiverse Flux Relay', icon: '🌌', baseCost: 1400000, baseEPS: 4500, desc: 'Channels unlimited energy from parallel realities.' }
];

const UPGRADES = [
  { id: 'click_1', name: 'Particle Accelerator', icon: '💥', cost: 100, desc: 'Doubles base click extraction power.', bought: false, apply: (s) => s.clickMult *= 2 },
  { id: 'click_2', name: 'Plasma Overdrive', icon: '🔥', cost: 500, desc: 'Singularity clicks harvest +5% of current EPS.', bought: false, apply: (s) => s.clickEpsBonus += 0.05 },
  { id: 'tunnel_boost', name: 'Resonant Frequencies', icon: '📡', cost: 1000, desc: 'Quantum Tunnels generate 2x more energy.', bought: false, apply: (s) => s.buildingMults.tunnel = (s.buildingMults.tunnel || 1) * 2 },
  { id: 'antimatter_boost', name: 'Positron Super-Charger', icon: '⚡', cost: 5000, desc: 'Antimatter Collectors produce 2x energy.', bought: false, apply: (s) => s.buildingMults.antimatter = (s.buildingMults.antimatter || 1) * 2 },
  { id: 'click_3', name: 'Quantum Critical Spark', icon: '✨', cost: 25000, desc: 'Clicks have a 20% chance to deal 5x Critical Harvest.', bought: false, apply: (s) => s.critChance += 0.2 },
  { id: 'dyson_boost', name: 'Photonic Mirrors', icon: '🪞', cost: 100000, desc: 'Dyson Rings produce 2x energy.', bought: false, apply: (s) => s.buildingMults.dyson = (s.buildingMults.dyson || 1) * 2 },
  { id: 'global_boost', name: 'Singularity Overclock', icon: '⚛️', cost: 500000, desc: 'All energy generation is permanently boosted by +50%.', bought: false, apply: (s) => s.globalMult *= 1.5 },
  { id: 'dark_boost', name: 'Void Core Convergence', icon: '🌌', cost: 2000000, desc: 'Dark Matter Synthesizers produce 3x energy.', bought: false, apply: (s) => s.buildingMults.dark_synth = (s.buildingMults.dark_synth || 1) * 3 }
];

// --- 3. STATE ---
let state = {
  energy: 0,
  totalEarned: 0,
  darkMatter: 0,
  prestigeMultiplier: 1.0,
  clickMult: 1,
  clickEpsBonus: 0,
  critChance: 0,
  globalMult: 1.0,
  buildings: {
    tunnel: 0,
    antimatter: 0,
    dyson: 0,
    dark_synth: 0,
    chrono: 0,
    multiverse: 0
  },
  buildingMults: {},
  boughtUpgrades: []
};

function formatNumber(num) {
  if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T';
  if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
  return Math.floor(num).toLocaleString();
}

function calculateEPS() {
  let eps = 0;
  BUILDINGS.forEach(b => {
    const count = state.buildings[b.id] || 0;
    const mult = state.buildingMults[b.id] || 1;
    eps += count * b.baseEPS * mult;
  });
  return eps * state.globalMult * state.prestigeMultiplier;
}

function getBuildingCost(building) {
  const count = state.buildings[building.id] || 0;
  return Math.floor(building.baseCost * Math.pow(1.15, count));
}

// --- 4. CLICK HARVEST ---
function harvestSingularity(e) {
  initAudio();
  playQuantumSound('click');

  const eps = calculateEPS();
  let harvest = (1 * state.clickMult + eps * state.clickEpsBonus) * state.prestigeMultiplier;
  let isCrit = false;

  if (Math.random() < state.critChance) {
    harvest *= 5;
    isCrit = true;
  }

  state.energy += harvest;
  state.totalEarned += harvest;

  // Visual Particle
  spawnClickParticle(e ? e.clientX : window.innerWidth / 2, e ? e.clientY : window.innerHeight / 2, `+${formatNumber(harvest)}`, isCrit);
  updateUI();
}

function spawnClickParticle(x, y, text, isCrit) {
  const layer = document.getElementById('click-particles-layer');
  const p = document.createElement('div');
  p.className = 'floating-text';
  if (isCrit) {
    p.style.color = '#facc15';
    p.style.fontSize = '22px';
    p.textContent = `CRIT! ${text}`;
  } else {
    p.textContent = text;
  }
  p.style.left = `${x - 20}px`;
  p.style.top = `${y - 20}px`;
  layer.appendChild(p);

  setTimeout(() => p.remove(), 800);
}

// --- 5. BUY BUILDINGS & UPGRADES ---
function buyBuilding(building) {
  const cost = getBuildingCost(building);
  if (state.energy < cost) return;

  initAudio();
  playQuantumSound('buy');
  state.energy -= cost;
  state.buildings[building.id] = (state.buildings[building.id] || 0) + 1;

  updateUI();
  renderBuildings();
}

function buyUpgrade(upgrade) {
  if (state.energy < upgrade.cost || state.boughtUpgrades.includes(upgrade.id)) return;

  initAudio();
  playQuantumSound('buy');
  state.energy -= upgrade.cost;
  state.boughtUpgrades.push(upgrade.id);
  upgrade.apply(state);

  updateUI();
  renderUpgrades();
}

// --- 6. PRESTIGE SYSTEM ---
function calculatePrestigeGain() {
  if (state.totalEarned < 100000) return 0;
  return Math.floor(Math.sqrt(state.totalEarned / 10000));
}

function triggerBigBangPrestige() {
  const gain = calculatePrestigeGain();
  if (gain <= 0) return;

  initAudio();
  playQuantumSound('prestige');

  state.darkMatter += gain;
  state.prestigeMultiplier = 1.0 + (state.darkMatter * 0.1); // +10% per Dark Matter

  // Reset production
  state.energy = 0;
  state.totalEarned = 0;
  state.clickMult = 1;
  state.clickEpsBonus = 0;
  state.critChance = 0;
  state.globalMult = 1.0;
  BUILDINGS.forEach(b => state.buildings[b.id] = 0);
  state.buildingMults = {};
  state.boughtUpgrades = [];

  updateUI();
  renderBuildings();
  renderUpgrades();
}

// --- 7. RENDERING UI ---
function renderBuildings() {
  const container = document.getElementById('generators-list');
  container.innerHTML = '';

  let totalBuilt = 0;
  BUILDINGS.forEach(b => {
    const cost = getBuildingCost(b);
    const count = state.buildings[b.id] || 0;
    totalBuilt += count;
    const canAfford = state.energy >= cost;

    const card = document.createElement('div');
    card.className = `item-card ${canAfford ? '' : 'disabled'}`;
    card.innerHTML = `
      <div class="info">
        <div class="icon-box">${b.icon}</div>
        <div class="details">
          <h4>${b.name}</h4>
          <p>+${(b.baseEPS * (state.buildingMults[b.id] || 1) * state.globalMult * state.prestigeMultiplier).toFixed(1)}/s</p>
        </div>
      </div>
      <div class="buy-info">
        <span class="cost">${formatNumber(cost)} ⚛️</span>
        <div class="owned-count">${count}</div>
      </div>
    `;

    card.addEventListener('click', () => buyBuilding(b));
    container.appendChild(card);
  });

  document.getElementById('total-buildings-count').textContent = `${totalBuilt} Built`;
}

function renderUpgrades() {
  const container = document.getElementById('upgrades-list');
  container.innerHTML = '';

  let boughtCount = 0;
  UPGRADES.forEach(u => {
    const isBought = state.boughtUpgrades.includes(u.id);
    if (isBought) boughtCount++;
    const canAfford = state.energy >= u.cost;

    const card = document.createElement('div');
    card.className = `item-card ${isBought ? 'disabled' : (canAfford ? '' : 'disabled')}`;
    card.innerHTML = `
      <div class="info">
        <div class="icon-box">${u.icon}</div>
        <div class="details">
          <h4>${u.name}</h4>
          <p>${u.desc}</p>
        </div>
      </div>
      <div class="buy-info">
        <span class="cost">${isBought ? 'RESEARCHED' : `${formatNumber(u.cost)} ⚛️`}</span>
      </div>
    `;

    if (!isBought) {
      card.addEventListener('click', () => buyUpgrade(u));
    }
    container.appendChild(card);
  });

  document.getElementById('upgrades-count').textContent = `${boughtCount} / ${UPGRADES.length} Researched`;
}

function updateUI() {
  document.getElementById('energy-counter').textContent = formatNumber(state.energy);
  document.getElementById('eps-counter').textContent = `${formatNumber(calculateEPS())} /sec`;
  document.getElementById('prestige-counter').textContent = `${state.darkMatter} (${state.prestigeMultiplier.toFixed(1)}x)`;

  const eps = calculateEPS();
  const clickPower = (1 * state.clickMult + eps * state.clickEpsBonus) * state.prestigeMultiplier;
  document.getElementById('click-power-val').textContent = `+${formatNumber(clickPower)} Qubit`;

  const pGain = calculatePrestigeGain();
  document.getElementById('prestige-gain-text').textContent = `+${pGain} Dark Matter (+${(pGain * 10)}% Boost)`;
}

// --- 8. GAME LOOP ---
let lastTime = Date.now();
function gameLoop() {
  const now = Date.now();
  const dt = (now - lastTime) / 1000;
  lastTime = now;

  const eps = calculateEPS();
  state.energy += eps * dt;
  state.totalEarned += eps * dt;

  updateUI();
  requestAnimationFrame(gameLoop);
}

// --- 9. INITIALIZATION ---
document.getElementById('btn-singularity-core').addEventListener('click', (e) => harvestSingularity(e));
document.getElementById('btn-prestige').addEventListener('click', triggerBigBangPrestige);

window.addEventListener('keydown', (e) => {
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', ' '].includes(e.key) || ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
    e.preventDefault();
  }
  if (e.code === 'Space') {
    const btn = document.getElementById('btn-singularity-core');
    if (btn) btn.click();
  }
});

renderBuildings();
renderUpgrades();
updateUI();
gameLoop();
