/**
 * Neon Backrooms: Entity 404 — 3D Raycasting Horror with Realistic Stealth, EMP Stun & FPS Mouse Lock
 */

// --- 1. PROCEDURAL HORROR AUDIO ENGINE ---
class HorrorAudioEngine {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.isBGMPlaying = false;
    this.droneGain = null;
    this.droneOsc = null;
    this.heartbeatTimer = null;
    this.dangerLevel = 0;

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

    // 1. Dark Subterranean Drone (45 Hz)
    try {
      this.droneOsc = this.ctx.createOscillator();
      this.droneGain = this.ctx.createGain();
      this.droneOsc.type = 'sawtooth';
      this.droneOsc.frequency.setValueAtTime(46.25, this.ctx.currentTime);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(140, this.ctx.currentTime);

      this.droneGain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      this.droneOsc.connect(filter);
      filter.connect(this.droneGain);
      this.droneGain.connect(this.masterGain || this.ctx.destination);
      this.droneOsc.start();
    } catch(e) {}

    // 2. Creepy Dissonant Pulses
    this.pulseTimer = setInterval(() => {
      if (!this.isBGMPlaying || !this.enabled || !this.ctx) return;
      this.playDissonantPulse();
    }, 4500);

    this.startHeartbeatLoop();
  }

  stopBGM() {
    this.isBGMPlaying = false;
    if (this.droneOsc) {
      try { this.droneOsc.stop(); } catch(e) {}
      this.droneOsc = null;
    }
    if (this.pulseTimer) clearInterval(this.pulseTimer);
    if (this.heartbeatTimer) clearTimeout(this.heartbeatTimer);
  }

  playDissonantPulse() {
    if (!this.ctx || this.ctx.state === 'suspended') return;
    const dissonantNotes = [277.18, 293.66, 311.13, 554.37];
    dissonantNotes.forEach((f, i) => {
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const now = this.ctx.currentTime + i * 0.2;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now);
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.025, now + 0.4);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.5);
        osc.connect(gain);
        gain.connect(this.masterGain || this.ctx.destination);
        osc.start(now);
        osc.stop(now + 2.5);
      } catch(e) {}
    });
  }

  startHeartbeatLoop() {
    const beat = () => {
      if (!this.isBGMPlaying || !this.enabled) return;
      this.playHeartbeat();
      const interval = Math.max(280, 1100 - this.dangerLevel * 800);
      this.heartbeatTimer = setTimeout(beat, interval);
    };
    beat();
  }

  playHeartbeat() {
    if (!this.ctx || this.ctx.state === 'suspended') return;
    const now = this.ctx.currentTime;
    [0, 0.12].forEach((offset, idx) => {
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(idx === 0 ? 65 : 50, now + offset);
        osc.frequency.exponentialRampToValueAtTime(30, now + offset + 0.08);
        const vol = 0.04 + this.dangerLevel * 0.14;
        gain.gain.setValueAtTime(vol, now + offset);
        gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.09);
        osc.connect(gain);
        gain.connect(this.masterGain || this.ctx.destination);
        osc.start(now + offset);
        osc.stop(now + offset + 0.09);
      } catch(e) {}
    });
  }

  playKeyPickup() {
    if (!this.enabled || !this.ctx) return;
    try {
      const notes = [440, 554.37, 659.25, 880];
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

  playEMP() {
    if (!this.enabled || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(60, now + 0.4);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      osc.connect(gain);
      gain.connect(this.masterGain || this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.45);
    } catch(e) {}
  }

  playScreech() {
    if (!this.enabled || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(900, now);
      osc.frequency.linearRampToValueAtTime(200, now + 0.6);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
      osc.connect(gain);
      gain.connect(this.masterGain || this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.7);
    } catch(e) {}
  }
}

// --- 2. 3D RAYCASTING HORROR GAME ENGINE ---
const MAZE_MAP = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,0,0,0,1,0,0,0,0,0,1,0,0,0,0,1],
  [1,0,1,0,1,0,1,1,1,0,1,0,1,1,0,1],
  [1,0,1,0,0,0,0,0,1,0,0,0,1,0,0,1],
  [1,0,1,1,1,1,0,0,1,1,1,0,1,0,1,1],
  [1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],
  [1,1,1,0,0,1,1,0,1,0,1,1,1,1,0,1],
  [1,0,0,0,0,0,0,0,1,0,0,0,0,1,0,1],
  [1,0,1,1,1,0,1,1,1,1,1,0,0,1,0,1],
  [1,0,1,0,0,0,0,0,0,0,1,0,0,0,0,1],
  [1,0,1,0,1,1,1,0,1,0,1,1,1,1,0,1],
  [1,0,0,0,1,0,0,0,1,0,0,0,0,1,0,1],
  [1,1,1,0,1,0,1,1,1,1,1,1,0,1,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1],
  [1,0,1,1,1,1,1,1,1,0,0,0,0,3,0,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

class NeonBackrooms {
  constructor() {
    this.canvas = document.getElementById('viewCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.radarCanvas = document.getElementById('radarCanvas');
    this.radarCtx = this.radarCanvas.getContext('2d');

    this.audio = new HorrorAudioEngine();

    // Player state
    this.player = {
      x: 1.5,
      y: 1.5,
      dirX: 1,
      dirY: 0,
      planeX: 0,
      planeY: 0.66,
      rotSpeed: 0.045,
      moveSpeed: 0.056,
      battery: 100,
      stamina: 100,
      flashlight: true,
      sprinting: false
    };

    // EMP Defense System
    this.empCooldown = 0; // Cooldown timer (seconds)
    this.empMaxCooldown = 12;

    // Keys to collect
    this.keycards = [
      { x: 4.5, y: 3.5, collected: false },
      { x: 7.5, y: 7.5, collected: false },
      { x: 13.5, y: 1.5, collected: false },
      { x: 1.5, y: 13.5, collected: false },
      { x: 10.5, y: 13.5, collected: false }
    ];

    // Entity 404 state
    this.entity = {
      x: 9.5,
      y: 9.5,
      baseSpeed: 0.035,
      stunTimer: 0, // Stunned seconds remaining
      patrolTarget: { x: 9.5, y: 9.5 },
      lastSeenPlayer: null,
      isChasing: false
    };

    this.keysCollected = 0;
    this.gameOver = false;
    this.escaped = false;
    this.input = {};

    this.initUI();
    this.loop();
  }

  initUI() {
    window.focus();
    window.addEventListener('click', () => window.focus());

    // Pointer Lock on Canvas Click
    this.canvas.addEventListener('click', () => {
      if (this.canvas.requestPointerLock) {
        this.canvas.requestPointerLock().catch(() => {});
      }
    });

    document.addEventListener('pointerlockchange', () => {
      const lockOverlay = document.getElementById('lock-overlay');
      if (document.pointerLockElement === this.canvas) {
        if (lockOverlay) lockOverlay.classList.add('hidden');
      } else {
        if (lockOverlay && !this.gameOver && !this.escaped) lockOverlay.classList.remove('hidden');
      }
    });

    this.canvas.addEventListener('mousedown', (e) => {
      this.isMouseDown = true;
      this.lastMouseX = e.clientX;
    });

    window.addEventListener('mouseup', () => {
      this.isMouseDown = false;
    });

    // Mouse movement listener (1:1 FPS sensitivity)
    window.addEventListener('mousemove', (e) => {
      if (this.gameOver || this.escaped) return;

      if (document.pointerLockElement === this.canvas) {
        const movementX = e.movementX || e.mozMovementX || e.webkitMovementX || 0;
        this.rotate(-movementX * 0.0028);
        return;
      }

      if (this.isMouseDown && this.lastMouseX !== undefined) {
        const dx = e.clientX - this.lastMouseX;
        this.rotate(-dx * 0.005);
        this.lastMouseX = e.clientX;
      }
    });

    // Keyboard listeners
    window.addEventListener('keydown', (e) => {
      this.input[e.code] = true;
      if (e.code === 'KeyF') this.toggleFlashlight();
      if (e.code === 'Space') {
        e.preventDefault();
        this.triggerEMP();
      }
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') this.player.sprinting = true;
    });

    window.addEventListener('keyup', (e) => {
      this.input[e.code] = false;
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') this.player.sprinting = false;
    });

    // Buttons
    document.getElementById('btn-emp').addEventListener('click', () => this.triggerEMP());
    document.getElementById('btn-flashlight').addEventListener('click', () => this.toggleFlashlight());
    
    const sprintBtn = document.getElementById('btn-sprint');
    sprintBtn.addEventListener('click', () => {
      this.player.sprinting = !this.player.sprinting;
      sprintBtn.classList.toggle('active', this.player.sprinting);
    });

    // Sound toggle
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

    // D-Pad buttons
    document.querySelectorAll('.dpad-btn').forEach(btn => {
      const act = btn.dataset.action;
      const start = (e) => { e.preventDefault(); this.input[act] = true; };
      const end = (e) => { e.preventDefault(); this.input[act] = false; };
      btn.addEventListener('mousedown', start);
      btn.addEventListener('mouseup', end);
      btn.addEventListener('touchstart', start, { passive: false });
      btn.addEventListener('touchend', end, { passive: false });
    });

    document.getElementById('modal-btn-action').addEventListener('click', () => this.restart());
  }

  restart() {
    this.player.x = 1.5;
    this.player.y = 1.5;
    this.player.dirX = 1;
    this.player.dirY = 0;
    this.player.planeX = 0;
    this.player.planeY = 0.66;
    this.player.battery = 100;
    this.player.stamina = 100;
    this.player.flashlight = true;
    this.player.sprinting = false;

    this.empCooldown = 0;

    this.keycards.forEach(k => k.collected = false);
    this.keysCollected = 0;

    this.entity.x = 9.5;
    this.entity.y = 9.5;
    this.entity.stunTimer = 0;
    this.entity.isChasing = false;

    this.gameOver = false;
    this.escaped = false;

    document.getElementById('modal-screen').classList.add('hidden');
    document.getElementById('jumpscare-overlay').classList.add('hidden');
    document.getElementById('vignette').className = 'vignette';

    this.updateHUD();
  }

  toggleFlashlight() {
    if (this.player.battery <= 0) return;
    this.player.flashlight = !this.player.flashlight;
    document.getElementById('btn-flashlight').classList.toggle('active', this.player.flashlight);
  }

  triggerEMP() {
    if (this.empCooldown > 0 || this.gameOver || this.escaped) return;

    this.audio.playEMP();
    this.empCooldown = this.empMaxCooldown;

    const dist = Math.hypot(this.player.x - this.entity.x, this.player.y - this.entity.y);
    if (dist < 6.0) {
      // Stun entity for 4.5 seconds
      this.entity.stunTimer = 4.5;
      this.entity.isChasing = false;

      // Flash screen yellow/cyan
      const vignette = document.getElementById('vignette');
      vignette.style.boxShadow = 'inset 0 0 100px rgba(0, 243, 255, 0.9)';
      setTimeout(() => { vignette.style.boxShadow = ''; }, 300);

      document.getElementById('status-text').textContent = '⚡ ENTITY 404 STUNNED FOR 4.5s! RUN AND SNEAK AWAY!';
    }
  }

  updateHUD() {
    document.getElementById('keys-count').textContent = `${this.keysCollected} / ${this.keycards.length}`;
    document.getElementById('battery-bar').style.width = `${Math.max(0, this.player.battery)}%`;
    document.getElementById('stamina-bar').style.width = `${Math.max(0, this.player.stamina)}%`;

    // EMP button status
    const empBtn = document.getElementById('btn-emp');
    if (this.empCooldown > 0) {
      empBtn.disabled = true;
      empBtn.innerHTML = `<span>⏳</span> EMP COOLDOWN (${Math.ceil(this.empCooldown)}s)`;
    } else {
      empBtn.disabled = false;
      empBtn.innerHTML = `<span>⚡</span> EMP STUN (SPACE)`;
    }
  }

  loop() {
    this.update();
    this.render();
    requestAnimationFrame(() => this.loop());
  }

  update() {
    if (this.gameOver || this.escaped) return;

    // EMP Cooldown countdown
    if (this.empCooldown > 0) {
      this.empCooldown = Math.max(0, this.empCooldown - 1 / 60);
    }

    // Entity stun countdown
    if (this.entity.stunTimer > 0) {
      this.entity.stunTimer = Math.max(0, this.entity.stunTimer - 1 / 60);
    }

    // Movement speeds (Sprint gives you a fast escape velocity)
    const isSprinting = this.player.sprinting && this.player.stamina > 5;
    const currentSpeed = isSprinting ? this.player.moveSpeed * 1.65 : this.player.moveSpeed;

    if (isSprinting) {
      this.player.stamina = Math.max(0, this.player.stamina - 0.45);
    } else {
      this.player.stamina = Math.min(100, this.player.stamina + 0.25);
    }

    // Battery drain
    if (this.player.flashlight) {
      this.player.battery = Math.max(0, this.player.battery - 0.08);
      if (this.player.battery <= 0) {
        this.player.flashlight = false;
        document.getElementById('btn-flashlight').classList.remove('active');
      }
    } else {
      this.player.battery = Math.min(100, this.player.battery + 0.05);
    }

    // Movement inputs with wall collision
    if (this.input['KeyW'] || this.input['ArrowUp'] || this.input['fwd']) {
      const nx = this.player.x + this.player.dirX * currentSpeed;
      const ny = this.player.y + this.player.dirY * currentSpeed;
      if (MAZE_MAP[Math.floor(ny)][Math.floor(this.player.x)] === 0) this.player.y = ny;
      if (MAZE_MAP[Math.floor(this.player.y)][Math.floor(nx)] === 0) this.player.x = nx;
    }
    if (this.input['KeyS'] || this.input['ArrowDown'] || this.input['back']) {
      const nx = this.player.x - this.player.dirX * (currentSpeed * 0.75);
      const ny = this.player.y - this.player.dirY * (currentSpeed * 0.75);
      if (MAZE_MAP[Math.floor(ny)][Math.floor(this.player.x)] === 0) this.player.y = ny;
      if (MAZE_MAP[Math.floor(this.player.y)][Math.floor(nx)] === 0) this.player.x = nx;
    }

    // Rotation inputs
    if (this.input['KeyA'] || this.input['ArrowLeft'] || this.input['rot-left']) {
      this.rotate(this.player.rotSpeed);
    }
    if (this.input['KeyD'] || this.input['ArrowRight'] || this.input['rot-right']) {
      this.rotate(-this.player.rotSpeed);
    }

    // Keycard collection
    this.keycards.forEach(k => {
      if (!k.collected) {
        const dist = Math.hypot(this.player.x - k.x, this.player.y - k.y);
        if (dist < 0.6) {
          k.collected = true;
          this.keysCollected++;
          this.audio.playKeyPickup();
          if (this.keysCollected === this.keycards.length) {
            document.getElementById('status-text').textContent = '⚡ ALL 5 KEYCARDS ACTIVE! Run to the glowing Cyan Exit Elevator to escape!';
          }
        }
      }
    });

    // Check exit elevator
    if (this.keysCollected === this.keycards.length) {
      const exitDist = Math.hypot(this.player.x - 13.5, this.player.y - 14.5);
      if (exitDist < 0.8) {
        this.onEscape();
      }
    }

    // --- ENTITY 404 BALANCED STEALTH & CHASE AI ---
    const edx = this.player.x - this.entity.x;
    const edy = this.player.y - this.entity.y;
    const entityDist = Math.hypot(edx, edy);

    // Line of sight check
    const hasLOS = this.checkLineOfSight(this.entity.x, this.entity.y, this.player.x, this.player.y);
    const detectionRange = this.player.flashlight ? 8.0 : 3.0; // Turning flashlight OFF lets you stealth!

    if (this.entity.stunTimer <= 0) {
      if (hasLOS && entityDist < detectionRange) {
        this.entity.isChasing = true;
        this.entity.lastSeenPlayer = { x: this.player.x, y: this.player.y };
      } else if (entityDist > 7.0) {
        this.entity.isChasing = false;
      }

      // Move entity towards target with corridor wall collision
      let targetX = this.entity.isChasing ? this.player.x : (this.entity.lastSeenPlayer ? this.entity.lastSeenPlayer.x : this.entity.patrolTarget.x);
      let targetY = this.entity.isChasing ? this.player.y : (this.entity.lastSeenPlayer ? this.entity.lastSeenPlayer.y : this.entity.patrolTarget.y);

      const tdx = targetX - this.entity.x;
      const tdy = targetY - this.entity.y;
      const tDist = Math.hypot(tdx, tdy);

      if (tDist > 0.3) {
        const speed = this.entity.isChasing ? this.entity.baseSpeed * 1.15 : this.entity.baseSpeed * 0.7;
        const moveX = (tdx / tDist) * speed;
        const moveY = (tdy / tDist) * speed;

        const nex = this.entity.x + moveX;
        const ney = this.entity.y + moveY;

        // Respect maze walls
        if (MAZE_MAP[Math.floor(ney)][Math.floor(this.entity.x)] === 0) this.entity.y = ney;
        if (MAZE_MAP[Math.floor(this.entity.y)][Math.floor(nex)] === 0) this.entity.x = nex;
      } else if (!this.entity.isChasing) {
        // Pick new random patrol corridor waypoint
        this.pickNewPatrolWaypoint();
      }
    }

    // Proximity danger audio
    const danger = Math.max(0, 1 - (entityDist / 6.0));
    this.audio.dangerLevel = danger;
    const vignette = document.getElementById('vignette');
    if (danger > 0.4 && this.entity.stunTimer <= 0) {
      vignette.className = 'vignette danger';
    } else {
      vignette.className = 'vignette';
    }

    // Jumpscare hit
    if (entityDist < 0.52 && this.entity.stunTimer <= 0 && !this.gameOver) {
      this.onJumpscare();
    }

    this.updateHUD();
  }

  checkLineOfSight(x0, y0, x1, y1) {
    const dist = Math.hypot(x1 - x0, y1 - y0);
    const steps = Math.ceil(dist * 6);
    for (let i = 1; i < steps; i++) {
      const t = i / steps;
      const cx = x0 + (x1 - x0) * t;
      const cy = y0 + (y1 - y0) * t;
      if (MAZE_MAP[Math.floor(cy)][Math.floor(cx)] > 0) return false;
    }
    return true;
  }

  pickNewPatrolWaypoint() {
    const emptyCells = [];
    for (let r = 1; r < MAZE_MAP.length - 1; r++) {
      for (let c = 1; c < MAZE_MAP[0].length - 1; c++) {
        if (MAZE_MAP[r][c] === 0) emptyCells.push({ x: c + 0.5, y: r + 0.5 });
      }
    }
    if (emptyCells.length > 0) {
      this.entity.patrolTarget = emptyCells[Math.floor(Math.random() * emptyCells.length)];
      this.entity.lastSeenPlayer = null;
    }
  }

  rotate(rot) {
    const oldDirX = this.player.dirX;
    this.player.dirX = this.player.dirX * Math.cos(rot) - this.player.dirY * Math.sin(rot);
    this.player.dirY = oldDirX * Math.sin(rot) + this.player.dirY * Math.cos(rot);
    const oldPlaneX = this.player.planeX;
    this.player.planeX = this.player.planeX * Math.cos(rot) - this.player.planeY * Math.sin(rot);
    this.player.planeY = oldPlaneX * Math.sin(rot) + this.player.planeY * Math.cos(rot);
  }

  onJumpscare() {
    this.gameOver = true;
    this.audio.playScreech();
    document.getElementById('jumpscare-overlay').classList.remove('hidden');

    setTimeout(() => {
      document.getElementById('modal-icon').textContent = '💀';
      document.getElementById('modal-title').textContent = 'SIGNAL TERMINATED';
      document.getElementById('modal-desc').textContent = 'Entity 404 caught you. Turn OFF your flashlight to sneak past, sprint away around corners, or use EMP STUN (Space) to stop it!';
      document.getElementById('modal-screen').classList.remove('hidden');
    }, 1200);
  }

  onEscape() {
    this.escaped = true;
    this.audio.playKeyPickup();

    const score = 5000 + this.keysCollected * 1000;
    if (window.parent && window.parent !== window) {
      try {
        window.parent.postMessage({
          game: 'neon-backrooms',
          score: score
        }, '*');
      } catch (e) {}
    }

    document.getElementById('modal-icon').textContent = '🏆';
    document.getElementById('modal-title').textContent = 'LEVEL 0 ESCAPED!';
    document.getElementById('modal-desc').textContent = 'You powered up the exit elevator matrix and outsmarted Entity 404!';
    document.getElementById('modal-screen').classList.remove('hidden');
  }

  render() {
    const w = this.canvas.width;
    const h = this.canvas.height;

    // Floor & Ceiling
    this.ctx.fillStyle = '#0a0905';
    this.ctx.fillRect(0, 0, w, h / 2);
    this.ctx.fillStyle = '#141108';
    this.ctx.fillRect(0, h / 2, w, h / 2);

    const zBuffer = [];

    // Raycast Wall Slices
    for (let x = 0; x < w; x++) {
      const cameraX = (2 * x) / w - 1;
      const rayDirX = this.player.dirX + this.player.planeX * cameraX;
      const rayDirY = this.player.dirY + this.player.planeY * cameraX;

      let mapX = Math.floor(this.player.x);
      let mapY = Math.floor(this.player.y);

      let sideDistX, sideDistY;
      const deltaDistX = Math.abs(1 / rayDirX);
      const deltaDistY = Math.abs(1 / rayDirY);
      let perpWallDist;

      let stepX, stepY;
      let hit = 0;
      let side = 0;

      if (rayDirX < 0) {
        stepX = -1;
        sideDistX = (this.player.x - mapX) * deltaDistX;
      } else {
        stepX = 1;
        sideDistX = (mapX + 1.0 - this.player.x) * deltaDistX;
      }
      if (rayDirY < 0) {
        stepY = -1;
        sideDistY = (this.player.y - mapY) * deltaDistY;
      } else {
        stepY = 1;
        sideDistY = (mapY + 1.0 - this.player.y) * deltaDistY;
      }

      while (hit === 0) {
        if (sideDistX < sideDistY) {
          sideDistX += deltaDistX;
          mapX += stepX;
          side = 0;
        } else {
          sideDistY += deltaDistY;
          mapY += stepY;
          side = 1;
        }
        if (MAZE_MAP[mapY][mapX] > 0) hit = 1;
      }

      if (side === 0) perpWallDist = (mapX - this.player.x + (1 - stepX) / 2) / rayDirX;
      else perpWallDist = (mapY - this.player.y + (1 - stepY) / 2) / rayDirY;

      zBuffer[x] = perpWallDist;

      const lineHeight = Math.floor(h / perpWallDist);
      const drawStart = Math.max(0, -lineHeight / 2 + h / 2);
      const drawEnd = Math.min(h - 1, lineHeight / 2 + h / 2);

      // Backrooms Yellow / Grunge Wall color with Flashlight Falloff
      const wallType = MAZE_MAP[mapY][mapX];
      let brightness = Math.max(0.04, 1 - perpWallDist / (this.player.flashlight ? 7.5 : 2.8));
      if (side === 1) brightness *= 0.75;

      let r = Math.floor(200 * brightness);
      let g = Math.floor(180 * brightness);
      let b = Math.floor(60 * brightness);

      if (wallType === 3) {
        r = Math.floor(0 * brightness);
        g = Math.floor(255 * brightness);
        b = Math.floor(255 * brightness);
      }

      this.ctx.fillStyle = `rgb(${r},${g},${b})`;
      this.ctx.fillRect(x, drawStart, 1, drawEnd - drawStart);
    }

    // Render 3D Sprites
    this.renderSprites(w, h, zBuffer);
    this.renderRadar();
  }

  renderSprites(w, h, zBuffer) {
    const sprites = [];

    // Collectible Keycards
    this.keycards.forEach(k => {
      if (!k.collected) {
        sprites.push({ x: k.x, y: k.y, type: 'key', icon: '🔑', color: '#00f3ff' });
      }
    });

    // Entity 404 (Flashes yellow if stunned)
    const isStunned = this.entity.stunTimer > 0;
    const entityIcon = isStunned ? '⚡👁️⚡' : '👁️‍🗨️';
    sprites.push({ x: this.entity.x, y: this.entity.y, type: 'entity', icon: entityIcon, isStunned });

    sprites.forEach(s => {
      s.dist = Math.hypot(this.player.x - s.x, this.player.y - s.y);
    });
    sprites.sort((a, b) => b.dist - a.dist);

    sprites.forEach(s => {
      const spriteX = s.x - this.player.x;
      const spriteY = s.y - this.player.y;

      const invDet = 1.0 / (this.player.planeX * this.player.dirY - this.player.dirX * this.player.planeY);
      const transformX = invDet * (this.player.dirY * spriteX - this.player.dirX * spriteY);
      const transformY = invDet * (-this.player.planeY * spriteX + this.player.planeX * spriteY);

      if (transformY > 0.2) {
        const spriteScreenX = Math.floor((w / 2) * (1 + transformX / transformY));
        const spriteHeight = Math.abs(Math.floor(h / transformY));
        const spriteWidth = spriteHeight;

        if (spriteScreenX > 0 && spriteScreenX < w && transformY < zBuffer[spriteScreenX]) {
          const fontSize = Math.max(14, Math.min(110, spriteWidth * 0.85));

          // Render Menacing Red Aura around Entity 404
          if (s.type === 'entity') {
            const auraColor = s.isStunned ? 'rgba(250, 204, 21, 0.4)' : 'rgba(239, 68, 68, 0.5)';
            const auraGrad = this.ctx.createRadialGradient(
              spriteScreenX, h / 2, fontSize * 0.2,
              spriteScreenX, h / 2, fontSize * 0.9
            );
            auraGrad.addColorStop(0, auraColor);
            auraGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

            this.ctx.fillStyle = auraGrad;
            this.ctx.beginPath();
            this.ctx.arc(spriteScreenX, h / 2, fontSize * 0.9, 0, Math.PI * 2);
            this.ctx.fill();

            this.ctx.shadowColor = s.isStunned ? '#facc15' : '#ef4444';
            this.ctx.shadowBlur = 25;
          }

          this.ctx.font = `${fontSize}px sans-serif`;
          this.ctx.textAlign = 'center';
          this.ctx.textBaseline = 'middle';
          this.ctx.fillText(s.icon, spriteScreenX, h / 2);
          this.ctx.shadowBlur = 0;
        }
      }
    });
  }

  renderRadar() {
    const rc = this.radarCtx;
    const rw = this.radarCanvas.width;
    const rh = this.radarCanvas.height;
    const cx = rw / 2;
    const cy = rh / 2;
    const scale = 5.5; // Minimap zoom scale

    // Background
    rc.fillStyle = '#020604';
    rc.fillRect(0, 0, rw, rh);

    // 1. Draw Nearby Corridor Walls on Minimap
    rc.fillStyle = 'rgba(16, 185, 129, 0.22)';
    rc.strokeStyle = 'rgba(16, 185, 129, 0.45)';
    rc.lineWidth = 1;

    for (let r = 0; r < MAZE_MAP.length; r++) {
      for (let c = 0; c < MAZE_MAP[0].length; c++) {
        if (MAZE_MAP[r][c] > 0) {
          const wx = cx + (c - this.player.x) * scale;
          const wy = cy + (r - this.player.y) * scale;
          if (wx > -scale && wx < rw + scale && wy > -scale && wy < rh + scale) {
            rc.fillRect(wx, wy, scale, scale);
            rc.strokeRect(wx, wy, scale, scale);
          }
        }
      }
    }

    // 2. Draw Exit Elevator Icon
    const exitX = cx + (13.5 - this.player.x) * scale;
    const exitY = cy + (14.5 - this.player.y) * scale;
    rc.fillStyle = '#00f3ff';
    rc.font = '10px sans-serif';
    rc.textAlign = 'center';
    rc.textBaseline = 'middle';
    rc.fillText('🚪', exitX, exitY);

    // 3. Draw Entity 404 & Red Vision / Detection Aura
    const edx = (this.entity.x - this.player.x) * scale;
    const edy = (this.entity.y - this.player.y) * scale;
    const eScreenX = cx + edx;
    const eScreenY = cy + edy;

    const isStunned = this.entity.stunTimer > 0;
    const detectionRadius = (this.player.flashlight ? 7.5 : 3.0) * scale;

    // Red Vision / Detection Circle
    rc.fillStyle = isStunned ? 'rgba(250, 204, 21, 0.12)' : 'rgba(239, 68, 68, 0.18)';
    rc.strokeStyle = isStunned ? 'rgba(250, 204, 21, 0.4)' : 'rgba(239, 68, 68, 0.55)';
    rc.lineWidth = 1.5;

    rc.beginPath();
    rc.arc(eScreenX, eScreenY, detectionRadius, 0, Math.PI * 2);
    rc.fill();
    rc.stroke();

    // Entity Blip
    rc.fillStyle = isStunned ? '#facc15' : '#ef4444';
    rc.shadowColor = isStunned ? '#facc15' : '#ef4444';
    rc.shadowBlur = 8;
    rc.beginPath();
    rc.arc(eScreenX, eScreenY, 4, 0, Math.PI * 2);
    rc.fill();
    rc.shadowBlur = 0;

    // 4. Draw Keycards Blips
    this.keycards.forEach(k => {
      if (!k.collected) {
        const kx = cx + (k.x - this.player.x) * scale;
        const ky = cy + (k.y - this.player.y) * scale;
        rc.fillStyle = '#facc15';
        rc.shadowColor = '#facc15';
        rc.shadowBlur = 6;
        rc.beginPath();
        rc.arc(kx, ky, 3, 0, Math.PI * 2);
        rc.fill();
        rc.shadowBlur = 0;
      }
    });

    // 5. Draw Player Vision Cone (Flashlight Beam in Cyan)
    const playerAngle = Math.atan2(this.player.dirY, this.player.dirX);
    const coneAngle = Math.PI / 4;
    const coneDist = (this.player.flashlight ? 6.5 : 2.5) * scale;

    rc.fillStyle = 'rgba(0, 243, 255, 0.15)';
    rc.beginPath();
    rc.moveTo(cx, cy);
    rc.arc(cx, cy, coneDist, playerAngle - coneAngle / 2, playerAngle + coneAngle / 2);
    rc.closePath();
    rc.fill();

    // Player Center Blip
    rc.fillStyle = '#00f3ff';
    rc.shadowColor = '#00f3ff';
    rc.shadowBlur = 8;
    rc.beginPath();
    rc.arc(cx, cy, 3.5, 0, Math.PI * 2);
    rc.fill();
    rc.shadowBlur = 0;

    // Radar HUD Bezel ring
    rc.strokeStyle = 'rgba(16, 185, 129, 0.4)';
    rc.lineWidth = 2;
    rc.strokeRect(1, 1, rw - 2, rh - 2);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.backroomsGame = new NeonBackrooms();
});
