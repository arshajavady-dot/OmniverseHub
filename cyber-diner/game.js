/**
 * Cyber Diner: Neon Tycoon — Futuristic Restaurant Simulator Engine
 */

// --- 1. PROCEDURAL WEB AUDIO SYNTHESIZER & NEO-TOKYO BGM ENGINE ---
class DinerAudioEngine {
  constructor() {
    this.ctx = null;
    this.isPlayingBGM = false;
    this.bgmTimer = null;
    this.step = 0;
    this.tempo = 128;

    // Upbeat Pentatonic Street Food Melody Notes
    this.bassNotes = [110.00, 130.81, 146.83, 98.00]; // A2, C3, D3, G2
    this.melodyNotes = [
      440.00, 523.25, 587.33, 659.25, 783.99, 880.00, 783.99, 659.25,
      523.25, 587.33, 659.25, 880.00, 783.99, 659.25, 587.33, 523.25,
      587.33, 659.25, 783.99, 880.00, 1046.50, 880.00, 783.99, 659.25,
      392.00, 440.00, 523.25, 587.33, 659.25, 587.33, 523.25, 440.00
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
    const stepMs = (60 / this.tempo / 4) * 1000;

    this.bgmTimer = setInterval(() => {
      if (!this.isPlayingBGM || !this.ctx) return;
      if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
      this.playDinerStep(this.step);
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

  playDinerStep(step) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const isFrenzy = state && state.frenzyActive;

    // Funky Slap Bass on 16th notes (0, 4, 8, 12, 16, 20, 24, 28)
    if (step % 4 === 0) {
      const bassIndex = Math.floor(step / 8);
      const freq = this.bassNotes[bassIndex] * (isFrenzy ? 1.5 : 1.0);

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.18);
    }

    // Playful Marimba / Pluck Lead Note
    if (step % 2 === 0) {
      const note = this.melodyNotes[step] * (isFrenzy ? 1.5 : 1.0);
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(note, now);
      gain.gain.setValueAtTime(0.035, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.12);
    }

    // Hi-hat groove on off-beats
    if (step % 4 === 2) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(6000, now);
      gain.gain.setValueAtTime(0.015, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.04);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.04);
    }
  }

  playSound(type) {
    const actx = this.ensureCtx();
    if (!actx) return;
    const now = actx.currentTime;

    if (type === 'serve') {
      const osc = actx.createOscillator();
      const gain = actx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523, now);
      osc.frequency.exponentialRampToValueAtTime(783, now + 0.1);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.1);
      osc.connect(gain);
      gain.connect(actx.destination);
      osc.start(now);
      osc.stop(now + 0.1);
    } else if (type === 'buy') {
      [440, 554, 659, 880].forEach((f, i) => {
        const o = actx.createOscillator();
        const g = actx.createGain();
        o.type = 'sine';
        o.frequency.setValueAtTime(f, now + i * 0.04);
        g.gain.setValueAtTime(0.1, now + i * 0.04);
        g.gain.linearRampToValueAtTime(0, now + i * 0.04 + 0.08);
        o.connect(g);
        g.connect(actx.destination);
        o.start(now + i * 0.04);
        o.stop(now + i * 0.04 + 0.08);
      });
    } else if (type === 'frenzy') {
      [300, 400, 600, 900, 1200].forEach((f, i) => {
        const o = actx.createOscillator();
        const g = actx.createGain();
        o.type = 'square';
        o.frequency.setValueAtTime(f, now + i * 0.05);
        g.gain.setValueAtTime(0.12, now + i * 0.05);
        g.gain.linearRampToValueAtTime(0, now + i * 0.05 + 0.1);
        o.connect(g);
        g.connect(actx.destination);
        o.start(now + i * 0.05);
        o.stop(now + i * 0.05 + 0.1);
      });
    }
  }
}

const dinerAudio = new DinerAudioEngine();

function initAudio() {
  dinerAudio.ensureCtx();
}

function playDinerSound(type) {
  dinerAudio.playSound(type);
}

// --- 2. GAME DATA ---
const STATIONS = [
  { id: 'ramen', name: 'Cyber Ramen Bar', icon: '🍜', baseCost: 10, baseIncome: 1, desc: 'Hot synthesized broth with glowing cyber noodles.' },
  { id: 'burger', name: 'Plasma Smash Burger', icon: '🍔', baseCost: 80, baseIncome: 8, desc: 'Sizzling bio-protein patty grilled with plasma heat.' },
  { id: 'sushi', name: 'Laser Cyber Sushi', icon: '🍣', baseCost: 650, baseIncome: 45, desc: 'Precision-sliced holographic salmon & unagi rolls.' },
  { id: 'boba', name: 'Quantum Boba Tea', icon: '🧋', baseCost: 4500, baseIncome: 240, desc: 'Bubbling energetic tapioca orbs with galaxy cream.' },
  { id: 'pizza', name: 'Mech Synth Pizza', icon: '🍕', baseCost: 35000, baseIncome: 1350, desc: 'Laser-baked golden crust loaded with synth-pepperoni.' },
  { id: 'bento', name: 'Galaxy Bento Station', icon: '🍱', baseCost: 280000, baseIncome: 8000, desc: 'Premium multi-tier luxury meal for interstellar elites.' }
];

const MANAGERS = [
  { id: 'mgr_frybot', name: 'Fry-Bot 9000', icon: '🤖', cost: 150, station: 'ramen', mult: 2, desc: 'Doubles Cyber Ramen production speed.', hired: false },
  { id: 'mgr_sushiya', name: 'Robo-Sushiya MK-II', icon: '🦾', cost: 1200, station: 'burger', mult: 2, desc: 'Doubles Plasma Burger production rate.', hired: false },
  { id: 'mgr_barista', name: 'Turbo Android Barista', icon: '🥷', cost: 8000, station: 'sushi', mult: 2, desc: 'Doubles Laser Sushi revenue.', hired: false },
  { id: 'mgr_drones', name: 'Drone Delivery Fleet', icon: '🛸', cost: 50000, station: 'boba', mult: 2, desc: 'Doubles Quantum Boba Tea income.', hired: false },
  { id: 'mgr_chef_ai', name: '3-Star Michelin AI Core', icon: '👑', cost: 350000, station: 'pizza', mult: 3, desc: 'Triples Mech Synth Pizza revenue.', hired: false }
];

const CUSTOMER_ICONS = ['🐱', '🤖', '🥷', '👾', '👨‍🚀', '🦊', '⚡', '👑'];

// --- 3. STATE ---
let state = {
  credits: 0,
  customersServed: 0,
  frenzyActive: false,
  frenzyTimer: 0,
  frenzyReadyTimer: 0,
  stations: {
    ramen: 0,
    burger: 0,
    sushi: 0,
    boba: 0,
    pizza: 0,
    bento: 0
  },
  stationMults: {},
  hiredManagers: [],
  customerQueue: ['🐱', '🤖', '🥷']
};

function formatNumber(num) {
  if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T';
  if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
  return Math.floor(num).toLocaleString();
}

function calculateIncome() {
  let income = 0;
  STATIONS.forEach(s => {
    const level = state.stations[s.id] || 0;
    const mult = state.stationMults[s.id] || 1;
    income += level * s.baseIncome * mult;
  });
  return income * (state.frenzyActive ? 3 : 1);
}

function getStationCost(station) {
  const level = state.stations[station.id] || 0;
  return Math.floor(station.baseCost * Math.pow(1.14, level));
}

// --- 4. COUNTER CLICKER ---
function serveCustomer(e) {
  initAudio();
  playDinerSound('serve');

  const income = calculateIncome();
  const tapReward = Math.max(5, Math.floor(income * 0.15) + 5) * (state.frenzyActive ? 3 : 1);

  state.credits += tapReward;
  state.customersServed++;

  // Rotate customers in queue
  state.customerQueue.shift();
  state.customerQueue.push(CUSTOMER_ICONS[Math.floor(Math.random() * CUSTOMER_ICONS.length)]);
  renderQueue();

  // Floating cash animation
  spawnCashParticle(e ? e.clientX : window.innerWidth / 2, e ? e.clientY : window.innerHeight / 2, `+¥${formatNumber(tapReward)}`);
  updateUI();
}

function spawnCashParticle(x, y, text) {
  const layer = document.getElementById('floating-cash-layer');
  const p = document.createElement('div');
  p.className = 'cash-particle';
  p.textContent = text;
  p.style.left = `${x - 25}px`;
  p.style.top = `${y - 25}px`;
  layer.appendChild(p);

  setTimeout(() => p.remove(), 800);
}

// --- 5. BUY STATIONS & MANAGERS ---
function buyStation(station) {
  const cost = getStationCost(station);
  if (state.credits < cost) return;

  initAudio();
  playDinerSound('buy');
  state.credits -= cost;
  state.stations[station.id] = (state.stations[station.id] || 0) + 1;

  updateUI();
  renderStations();
}

function hireManager(mgr) {
  if (state.credits < mgr.cost || state.hiredManagers.includes(mgr.id)) return;

  initAudio();
  playDinerSound('buy');
  state.credits -= mgr.cost;
  state.hiredManagers.push(mgr.id);
  state.stationMults[mgr.station] = (state.stationMults[mgr.station] || 1) * mgr.mult;

  updateUI();
  renderManagers();
  renderStations();
}

// --- 6. FRENZY EVENT ---
function triggerFrenzy() {
  if (state.frenzyActive) return;
  initAudio();
  playDinerSound('frenzy');

  state.frenzyActive = true;
  state.frenzyTimer = 15; // 15 seconds 3x multiplier
  updateUI();
}

// --- 7. RENDERING UI ---
function renderQueue() {
  const container = document.getElementById('customers-queue');
  container.innerHTML = '';
  state.customerQueue.forEach(icon => {
    const avatar = document.createElement('div');
    avatar.className = 'customer-avatar';
    avatar.textContent = icon;
    container.appendChild(avatar);
  });
}

function renderStations() {
  const container = document.getElementById('stations-list');
  container.innerHTML = '';

  STATIONS.forEach(s => {
    const cost = getStationCost(s);
    const level = state.stations[s.id] || 0;
    const canAfford = state.credits >= cost;
    const mult = state.stationMults[s.id] || 1;

    const card = document.createElement('div');
    card.className = `station-card ${canAfford ? '' : 'disabled'}`;
    card.innerHTML = `
      <div class="card-info">
        <div class="card-icon">${s.icon}</div>
        <div class="card-details">
          <h4>${s.name}</h4>
          <p>+¥${formatNumber(s.baseIncome * mult * (state.frenzyActive ? 3 : 1))}/s</p>
        </div>
      </div>
      <div class="card-price">
        <span class="price-text">¥ ${formatNumber(cost)}</span>
        <div class="level-text">LVL ${level}</div>
      </div>
    `;

    card.addEventListener('click', () => buyStation(s));
    container.appendChild(card);
  });
}

function renderManagers() {
  const container = document.getElementById('managers-list');
  container.innerHTML = '';

  MANAGERS.forEach(m => {
    const isHired = state.hiredManagers.includes(m.id);
    const canAfford = state.credits >= m.cost;

    const card = document.createElement('div');
    card.className = `manager-card ${isHired ? 'disabled' : (canAfford ? '' : 'disabled')}`;
    card.innerHTML = `
      <div class="card-info">
        <div class="card-icon">${m.icon}</div>
        <div class="card-details">
          <h4>${m.name}</h4>
          <p>${m.desc}</p>
        </div>
      </div>
      <div class="card-price">
        <span class="price-text">${isHired ? 'HIRED ✓' : `¥ ${formatNumber(m.cost)}`}</span>
      </div>
    `;

    if (!isHired) {
      card.addEventListener('click', () => hireManager(m));
    }
    container.appendChild(card);
  });
}

function updateUI() {
  document.getElementById('credits-val').textContent = `¥ ${formatNumber(state.credits)}`;
  document.getElementById('income-val').textContent = `¥ ${formatNumber(calculateIncome())} /s`;
  document.getElementById('customers-val').textContent = `${state.customersServed} 🤖`;

  const tapReward = Math.max(5, Math.floor(calculateIncome() * 0.15) + 5) * (state.frenzyActive ? 3 : 1);
  document.getElementById('tap-reward-text').textContent = `+¥ ${formatNumber(tapReward)}`;

  const frenzyBtn = document.getElementById('btn-frenzy');
  if (state.frenzyActive) {
    frenzyBtn.classList.remove('disabled');
    frenzyBtn.innerHTML = `<span>🔥 FRENZY ACTIVE! (${Math.ceil(state.frenzyTimer)}s remaining)</span>`;
  } else {
    frenzyBtn.classList.remove('disabled');
    frenzyBtn.innerHTML = `<span>🔥 VIP FOOD CRITIC FRENZY (3X REVENUE)</span>`;
  }
}

// --- 8. GAME LOOP ---
let lastTime = Date.now();
function gameLoop() {
  const now = Date.now();
  const dt = (now - lastTime) / 1000;
  lastTime = now;

  const income = calculateIncome();
  state.credits += income * dt;

  if (state.frenzyActive) {
    state.frenzyTimer -= dt;
    if (state.frenzyTimer <= 0) {
      state.frenzyActive = false;
    }
  }

  updateUI();
  requestAnimationFrame(gameLoop);
}

// --- 9. INITIALIZATION ---
document.getElementById('btn-serve-order').addEventListener('click', (e) => serveCustomer(e));
document.getElementById('btn-frenzy').addEventListener('click', triggerFrenzy);

window.addEventListener('keydown', (e) => {
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', ' '].includes(e.key) || ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
    e.preventDefault();
  }
  if (e.code === 'Space') {
    const btn = document.getElementById('btn-serve-order');
    if (btn) btn.click();
  }
});

renderQueue();
renderStations();
renderManagers();
updateUI();
gameLoop();
