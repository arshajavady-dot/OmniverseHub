/**
 * Neon Bio-Lab: Gene Alchemy Sequencer — Living Organism & Codon Splicing Engine
 */

class EvolutionAudioEngine {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.isBGMPlaying = false;
    this.bgmTimer = null;
    this.step = 0;
    this.tempo = 114;

    this.chords = [
      [110.00, 130.81, 164.81, 220.00], // Am
      [87.31, 110.00, 130.81, 174.61],  // Fmaj7
      [130.81, 164.81, 196.00, 261.63], // C
      [82.41, 98.00, 123.47, 164.81]    // Em
    ];
    this.bassNotes = [55.00, 43.65, 65.41, 41.20];
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
    const chord = this.chords[bar % this.chords.length];
    const bass = this.bassNotes[bar % this.bassNotes.length];

    if (step % 4 === 0) {
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(bass * 2, now);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.connect(gain);
        gain.connect(this.masterGain || this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.3);
      } catch(e) {}
    }

    if (step % 4 === 2) {
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(chord[2] * 2, now);
        gain.gain.setValueAtTime(0.025, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.connect(gain);
        gain.connect(this.masterGain || this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.35);
      } catch(e) {}
    }
  }

  playSpliceSuccess() {
    if (!this.enabled || !this.ctx) return;
    try {
      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((f, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const now = this.ctx.currentTime + i * 0.06;
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, now);
        gain.gain.setValueAtTime(0.09, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.connect(gain);
        gain.connect(this.masterGain || this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.25);
      });
    } catch(e) {}
  }

  playFeed() {
    if (!this.enabled || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.connect(gain);
      gain.connect(this.masterGain || this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.08);
    } catch(e) {}
  }
}

// Genetic Codon Combination Recipes
const CODON_RECIPES = {
  'AT': { name: 'Mitochondria Arc Reactor', icon: '⚡', rate: 12, desc: 'Metabolic energy surge.' },
  'CG': { name: 'Titanium Chitin Carapace', icon: '🛡️', rate: 24, desc: 'Crystalline armor plating.' },
  'GA': { name: 'Neural Tendrils', icon: '🧠', rate: 45, desc: 'Undulating psionic sensory limbs.' },
  'TC': { name: 'Bioluminescent Fins', icon: '✨', rate: 80, desc: 'Photonic light emitters.' },
  'AA': { name: 'CRISPR Auto-Replicator', icon: '🧬', rate: 150, desc: 'Autonomous cellular cloning.' },
  'CC': { name: 'Quantum Chloroplast', icon: '🌿', rate: 280, desc: 'Zero-point solar synthesis.' },
  'GG': { name: 'Cybernetic Hive Antenna', icon: '📡', rate: 550, desc: 'Synchronized swarm intelligence.' },
  'TT': { name: 'Singularity Photon Wings', icon: '🪽', rate: 1200, desc: 'Dimensional flight appendages.' }
};

class GeneAlchemyEvolution {
  constructor() {
    this.canvas = document.getElementById('organismCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.w = this.canvas.width;
    this.h = this.canvas.height;

    this.audio = new EvolutionAudioEngine();

    this.dna = parseInt(localStorage.getItem('cyber_evo_biomass_dna') || '100', 10);
    this.selectedBases = []; // up to 2: ['A', 'T']
    this.activeTraits = JSON.parse(localStorage.getItem('cyber_evo_traits') || '{}');

    this.baseCosts = { A: 15, C: 25, G: 40, T: 60 };

    this.speciesStages = [
      'PROTO-CELL (LV.1)',
      'BIOLUMINESCENT JELLY (LV.2)',
      'CHITIN BIO-BEAST (LV.3)',
      'NEURAL HIVE MIND (LV.4)',
      'QUANTUM ARCHITECT BEING (LV.5)'
    ];

    this.animTimer = 0;
    this.initUI();
    this.recalculateRates();
    this.startLoop();
    this.renderCanvasLoop();
  }

  initUI() {
    window.focus();
    window.addEventListener('click', () => window.focus());

    // 4 Nucleic Base Buttons
    document.querySelectorAll('.base-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const base = e.currentTarget.dataset.base;
        this.addBase(base);
      });
    });

    document.getElementById('btn-splice-codon').addEventListener('click', () => this.spliceCodon());
    document.getElementById('btn-feed-nutrients').addEventListener('click', () => this.feedNutrients());

    // Slot click resets selection
    document.getElementById('slot-1').addEventListener('click', () => this.clearSelection());
    document.getElementById('slot-2').addEventListener('click', () => this.clearSelection());

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

    this.renderTraitsList();
    this.updateHUD();
  }

  addBase(base) {
    if (this.selectedBases.length < 2) {
      this.selectedBases.push(base);
      this.updateSlotUI();
    }
  }

  clearSelection() {
    this.selectedBases = [];
    this.updateSlotUI();
  }

  updateSlotUI() {
    const s1 = document.getElementById('slot-1');
    const s2 = document.getElementById('slot-2');
    const spliceBtn = document.getElementById('btn-splice-codon');

    if (this.selectedBases[0]) {
      s1.textContent = this.selectedBases[0];
      s1.classList.remove('empty');
    } else {
      s1.textContent = '_';
      s1.classList.add('empty');
    }

    if (this.selectedBases[1]) {
      s2.textContent = this.selectedBases[1];
      s2.classList.remove('empty');
    } else {
      s2.textContent = '_';
      s2.classList.add('empty');
    }

    spliceBtn.disabled = this.selectedBases.length !== 2;
  }

  spliceCodon() {
    if (this.selectedBases.length !== 2) return;

    const b1 = this.selectedBases[0];
    const b2 = this.selectedBases[1];
    const totalCost = this.baseCosts[b1] + this.baseCosts[b2];

    if (this.dna < totalCost) {
      alert('Insufficient Biomass Energy for this codon synthesis!');
      return;
    }

    this.dna -= totalCost;

    // Determine recipe key (sorted if commutative or direct pair)
    let key = b1 + b2;
    if (!CODON_RECIPES[key]) {
      key = b2 + b1;
    }
    if (!CODON_RECIPES[key]) {
      key = 'AT'; // Fallback
    }

    const recipe = CODON_RECIPES[key];
    this.activeTraits[key] = (this.activeTraits[key] || 0) + 1;

    this.audio.playSpliceSuccess();
    this.clearSelection();
    this.recalculateRates();
    this.renderTraitsList();
    this.updateHUD();
    this.save();
  }

  feedNutrients() {
    this.dna += 10;
    this.audio.playFeed();
    this.updateHUD();
    this.save();
  }

  recalculateRates() {
    let rate = 0;
    Object.keys(this.activeTraits).forEach(k => {
      const recipe = CODON_RECIPES[k];
      if (recipe) {
        rate += recipe.rate * this.activeTraits[k];
      }
    });
    this.idleRate = rate;
  }

  renderTraitsList() {
    const list = document.getElementById('traits-list');
    list.innerHTML = '';

    const keys = Object.keys(this.activeTraits);
    if (keys.length === 0) {
      list.innerHTML = '<span style="font-size: 10px; color: #64748b;">No active genome mutations spliced yet. Pair bases above to mutate!</span>';
      return;
    }

    keys.forEach(k => {
      const recipe = CODON_RECIPES[k];
      const count = this.activeTraits[k];
      const pill = document.createElement('div');
      pill.className = 'trait-pill';
      pill.innerHTML = `
        <span>${recipe.icon}</span>
        <span>${recipe.name} (x${count})</span>
        <span class="trait-val">+${recipe.rate * count}/s</span>
      `;
      list.appendChild(pill);
    });
  }

  startLoop() {
    setInterval(() => {
      if (this.idleRate > 0) {
        this.dna += this.idleRate;
        this.updateHUD();
        this.save();
      }
    }, 1000);
  }

  save() {
    localStorage.setItem('cyber_evo_biomass_dna', this.dna.toString());
    localStorage.setItem('cyber_evo_traits', JSON.stringify(this.activeTraits));

    if (window.parent && window.parent !== window) {
      try {
        window.parent.postMessage({
          game: 'cyber-evolution',
          score: this.dna
        }, '*');
      } catch (e) {}
    }
  }

  updateHUD() {
    document.getElementById('dna-val').textContent = `${this.dna.toLocaleString()} 🧬`;
    document.getElementById('rate-val').textContent = `+${this.idleRate.toLocaleString()} /sec`;

    const totalMutations = Object.values(this.activeTraits).reduce((a, b) => a + b, 0);
    document.getElementById('mutation-count-badge').textContent = `MUTATIONS: ${totalMutations}`;

    const stageIdx = Math.min(this.speciesStages.length - 1, Math.floor(totalMutations / 3));
    document.getElementById('species-val').textContent = this.speciesStages[stageIdx];
  }

  renderCanvasLoop() {
    this.animTimer += 0.04;
    this.renderOrganism();
    requestAnimationFrame(() => this.renderCanvasLoop());
  }

  renderOrganism() {
    this.ctx.fillStyle = '#010408';
    this.ctx.fillRect(0, 0, this.w, this.h);

    const cx = this.w / 2;
    const cy = this.h / 2;

    // Ambient Petri Dish Nutrient Glow
    const bgGrad = this.ctx.createRadialGradient(cx, cy, 10, cx, cy, 100);
    bgGrad.addColorStop(0, 'rgba(16, 185, 129, 0.15)');
    bgGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    this.ctx.fillStyle = bgGrad;
    this.ctx.beginPath();
    this.ctx.arc(cx, cy, 100, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.save();
    this.ctx.translate(cx, cy);

    const breathe = Math.sin(this.animTimer * 1.5) * 4;
    const coreRadius = 32 + breathe;

    // 1. Wings (TT trait)
    if (this.activeTraits['TT']) {
      this.ctx.fillStyle = 'rgba(236, 72, 153, 0.4)';
      this.ctx.strokeStyle = '#ec4899';
      this.ctx.lineWidth = 1.5;
      const wingFlap = Math.sin(this.animTimer * 4) * 15;

      // Left Wing
      this.ctx.beginPath();
      this.ctx.moveTo(-coreRadius, 0);
      this.ctx.bezierCurveTo(-coreRadius - 50, -40 + wingFlap, -coreRadius - 70, 20 + wingFlap, -coreRadius + 10, 20);
      this.ctx.fill();
      this.ctx.stroke();

      // Right Wing
      this.ctx.beginPath();
      this.ctx.moveTo(coreRadius, 0);
      this.ctx.bezierCurveTo(coreRadius + 50, -40 + wingFlap, coreRadius + 70, 20 + wingFlap, coreRadius - 10, 20);
      this.ctx.fill();
      this.ctx.stroke();
    }

    // 2. Undulating Neural Tendrils (GA trait)
    if (this.activeTraits['GA']) {
      this.ctx.strokeStyle = '#00f3ff';
      this.ctx.lineWidth = 3;
      this.ctx.shadowColor = '#00f3ff';
      this.ctx.shadowBlur = 10;

      for (let i = 0; i < 6; i++) {
        const baseAngle = (i * Math.PI * 2) / 6;
        const wave = Math.sin(this.animTimer * 2 + i) * 10;
        const tx = Math.cos(baseAngle) * (coreRadius + 28 + wave);
        const ty = Math.sin(baseAngle) * (coreRadius + 28 + wave);

        this.ctx.beginPath();
        this.ctx.moveTo(Math.cos(baseAngle) * coreRadius, Math.sin(baseAngle) * coreRadius);
        this.ctx.lineTo(tx, ty);
        this.ctx.stroke();

        // Glowing Bioluminescent Pod tip
        this.ctx.fillStyle = '#ffffff';
        this.ctx.beginPath();
        this.ctx.arc(tx, ty, 3, 0, Math.PI * 2);
        this.ctx.fill();
      }
      this.ctx.shadowBlur = 0;
    }

    // 3. Crystalline Chitin Carapace Shell (CG trait)
    if (this.activeTraits['CG']) {
      this.ctx.fillStyle = 'rgba(16, 185, 129, 0.3)';
      this.ctx.strokeStyle = '#10b981';
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
        const r = coreRadius + 12;
        const px = Math.cos(a) * r;
        const py = Math.sin(a) * r;
        if (a === 0) this.ctx.moveTo(px, py);
        else this.ctx.lineTo(px, py);
      }
      this.ctx.closePath();
      this.ctx.fill();
      this.ctx.stroke();
    }

    // 4. Cellular Core Body (Living blob)
    const coreGrad = this.ctx.createRadialGradient(0, 0, 5, 0, 0, coreRadius);
    coreGrad.addColorStop(0, '#00f3ff');
    coreGrad.addColorStop(0.6, '#0284c7');
    coreGrad.addColorStop(1, '#0f172a');

    this.ctx.fillStyle = coreGrad;
    this.ctx.strokeStyle = '#38bdf8';
    this.ctx.lineWidth = 2.5;
    this.ctx.shadowColor = '#00f3ff';
    this.ctx.shadowBlur = 15;
    this.ctx.beginPath();
    this.ctx.arc(0, 0, coreRadius, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.stroke();
    this.ctx.shadowBlur = 0;

    // 5. Pulsing Arc Reactor Heart (AT trait)
    if (this.activeTraits['AT']) {
      const pulse = (Math.sin(this.animTimer * 4) + 1) * 4;
      this.ctx.fillStyle = '#facc15';
      this.ctx.shadowColor = '#facc15';
      this.ctx.shadowBlur = 12;
      this.ctx.beginPath();
      this.ctx.arc(0, 0, 10 + pulse, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.shadowBlur = 0;
    }

    this.ctx.restore();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.evolutionAlchemyGame = new GeneAlchemyEvolution();
});
