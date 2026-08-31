/* ==========================================================================
   BOX CLICKER - GAME ENGINE (app.js)
   Features: Game Loop, Audio Synthesizer, Dynamic Eye-Blinking, Golden Box,
             Shop & Scaling Costs, Achievements, News Ticker, Save & Offline
   QA Fixes Applied: 
     - Fixed bouncing class removal timer for smooth idle float resumption
     - Fixed Ascension prestige infinite exploit
     - Decoupled shop DOM rendering from 60 FPS game loop for ultra performance
     - Keyboard accessibility (Enter/Space on big box)
     - Accurate BPS bonus calculations on building cards
     - Sound icon desync fix on load
     - Safe clipboard fallback on export
   ========================================================================== */

(function () {
    'use strict';

    // --- GAME CONSTANTS & DATA SCHEMAS ---
    const BUILDINGS = [
        { id: 'b0', name: 'Pixel Box Helper', iconImg: 'assets/mini_box.png', icon: '📦', baseCost: 50, baseBps: 0.5, desc: 'A mini pixelated box helper that automatically folds boxes for you.' },
        { id: 'b1', name: 'Bubble Wrap Popper', icon: '🔨', baseCost: 15, baseBps: 0.1, desc: 'Pops bubbles frantically to fold small boxes.' },
        { id: 'b2', name: 'Cardboard Folding Robot', icon: '🤖', baseCost: 100, baseBps: 1.0, desc: 'Automated mechanical arm that creases cardboard in milliseconds.' },
        { id: 'b3', name: 'Delivery Truck', icon: '🚚', baseCost: 1100, baseBps: 8.0, desc: 'Drives around delivering pre-folded parcel boxes.' },
        { id: 'b4', name: 'Amazonian Warehouse', icon: '🏭', baseCost: 12000, baseBps: 47.0, desc: 'Massive automated distribution center dedicated to box output.' },
        { id: 'b5', name: 'Quantum Cargo Rocket', icon: '🚀', baseCost: 130000, baseBps: 260.0, desc: 'Launches boxes into orbit at near-light speeds.' },
        { id: 'b6', name: 'Box Dimension Portal', icon: '🌌', baseCost: 1400000, baseBps: 1400.0, desc: 'Opens wormholes to parallel box-shaped dimensions.' },
        { id: 'b7', name: 'Buff Box Cloning Lab', icon: '💪', baseCost: 20000000, baseBps: 7800.0, desc: 'Clones thousands of buff cardboard boxes to flex and pack!' },
        { id: 'b8', name: 'Time-Traveling Parcel Ship', icon: '⏳', baseCost: 330000000, baseBps: 44000.0, desc: 'Retrieves boxes from the future before they are manufactured.' },
        { id: 'b9', name: 'Dyson Swarm Box Factory', icon: '🪐', baseCost: 5000000000, baseBps: 260000.0, desc: 'Constructs stellar solar panels to power sun-harvesting cardboard folding machines.' },
        { id: 'b10', name: 'Galactic Parcel Matrix', icon: '🌌', baseCost: 75000000000, baseBps: 1800000.0, desc: 'Interlinks entire star systems to produce trillions of shipping parcels per second.' },
        { id: 'b11', name: 'Multiverse Shipping Hub', icon: '🌀', baseCost: 1000000000000, baseBps: 12500000.0, desc: 'Funnels unlimited cardboard boxes from infinite parallel dimensions directly to your stock.' },
        { id: 'b12', name: 'Big Bang Box Generator', icon: '💥', baseCost: 10000000000000, baseBps: 95000000.0, desc: 'Ignites primordial cosmic big bangs that expand purely as dense, pre-folded cardboard boxes!' }
    ];

    const UPGRADES = [
        { id: 'u1', name: 'Stronger Cardboard', icon: '📐', cost: 100, type: 'click_mult', val: 2, desc: 'Manual clicks pack 2x as many boxes.' },
        { id: 'u2', name: 'Heavy Duty Tape', icon: '🎗️', cost: 500, type: 'bps_mult', val: 1.1, desc: 'Reinforces all packaging. Increases overall BPS by +10%.' },
        { id: 'u3', name: 'Muscle Powder for Arms', icon: '🏋️', cost: 2500, type: 'click_bps_pct', val: 0.01, desc: 'Manual clicks gain +1% of your total BPS.' },
        { id: 'u4', name: 'Golden Flaps', icon: '✨', cost: 10000, type: 'golden_buff', val: 1.5, desc: 'Golden Boxes appear 50% more frequently and last 50% longer.' },
        { id: 'u5', name: 'Automated Tape Dispenser', icon: '⚙️', cost: 50000, type: 'building_mult', val: 2, desc: 'Doubles the efficiency of all Buildings.' },
        { id: 'u6', name: 'Hyper-Squeezed Flaps', icon: '⚡', cost: 250000, type: 'click_mult', val: 5, desc: 'Manual clicks pack 5x as many boxes!' },
        { id: 'u7', name: 'Quantum Box Stringing', icon: '🧵', cost: 1000000, type: 'bps_mult', val: 1.25, desc: 'Ties boxes together seamlessly. Increases overall BPS by +25%.' },
        { id: 'u8', name: 'Infinite Packing Bubble', icon: '🫧', cost: 5000000, type: 'click_bps_pct', val: 0.05, desc: 'Manual clicks gain an extra +5% of total BPS.' },
        { id: 'u9', name: 'Super-Conductive Packing Tape', icon: '⚡', cost: 25000000, type: 'bps_mult', val: 1.5, desc: 'Super-conductive adhesive speeds up all automated box assembly lines by +50%!' },
        { id: 'u10', name: 'Titanium Arm Glands', icon: '🦾', cost: 100000000, type: 'click_mult', val: 10, desc: 'Gives the Buff Box character titanium-alloy arms that pack 10x more boxes per click!' },
        { id: 'u11', name: 'Solar Box Rays', icon: '☀️', cost: 500000000, type: 'click_bps_pct', val: 0.10, desc: 'Channel stellar energy into manual clicks to gain +10% of total BPS per click!' },
        { id: 'u12', name: 'Golden Box Supernova', icon: '💥', cost: 2500000000, type: 'golden_buff', val: 2.0, desc: 'Golden Boxes spawn 2x as fast and trigger double frenzy rewards!' },
        { id: 'u13', name: 'Dyson Swarm Overclock', icon: '🪐', cost: 15000000000, type: 'building_mult', val: 2.5, desc: 'Overclocks all buildings and interstellar packing hubs by 2.5x!' },
        { id: 'u14', name: 'Dark Matter Cardboard', icon: '🌑', cost: 75000000000, type: 'bps_mult', val: 2.0, desc: 'Infuses all boxes with dense dark matter to instantly double total BPS output!' },
        { id: 'u15', name: 'Singularity Tape Engine', icon: '🕳️', cost: 300000000000, type: 'click_mult', val: 25, desc: 'Harnesses gravitational singularities to multiply click power by 25x!' },
        { id: 'u16', name: 'Multiverse Parcel Overload', icon: '🌀', cost: 1500000000000, type: 'bps_mult', val: 3.0, desc: 'Pulls infinite boxes from 100,000 alternative universes to triple BPS!' },
        { id: 'u17', name: 'God-Tier Arm Flex', icon: '🔱', cost: 5000000000000, type: 'click_bps_pct', val: 0.25, desc: 'Flexes divine muscle power! Each manual click adds +25% of your total BPS directly into stock!' },
        { id: 'u18', name: 'Cosmic Cardboard Genesis', icon: '🌌', cost: 10000000000000, type: 'building_mult', val: 5.0, desc: 'Rewrites the laws of physics. Multiplies the output of ALL buildings by 5x!' }
    ];

    const ACHIEVEMENTS = [
        { id: 'a1', title: 'Unboxed', icon: '📦', desc: 'Pack your very first box.', check: s => s.totalBoxes >= 1 },
        { id: 'a2', title: 'Clicking Novice', icon: '👆', desc: 'Click the Buff Box 100 times.', check: s => s.totalClicks >= 100 },
        { id: 'a3', title: 'Cardboard Crafter', icon: '🏭', desc: 'Accumulate 1,000 total boxes.', check: s => s.totalBoxes >= 1000 },
        { id: 'a4', title: 'Packing Tycoon', icon: '💼', desc: 'Accumulate 100,000 total boxes.', check: s => s.totalBoxes >= 100000 },
        { id: 'a5', title: 'Box Billionaire', icon: '💰', desc: 'Accumulate 1,000,000,000 total boxes.', check: s => s.totalBoxes >= 1000000000 },
        { id: 'a6', title: 'Flexing Muscles', icon: '💪', desc: 'Own at least 1 Buff Box Cloning Lab.', check: s => (s.buildings['b7'] || 0) >= 1 },
        { id: 'a7', title: 'Golden Touch', icon: '🌟', desc: 'Click a sparkling Golden Box.', check: s => s.goldenClicks >= 1 },
        { id: 'a8', title: 'Golden Chaser', icon: '✨', desc: 'Click 10 Golden Boxes.', check: s => s.goldenClicks >= 10 },
        { id: 'a9', title: 'Building Mogul', icon: '🏗️', desc: 'Own 50 total buildings.', check: s => getTotalBuildingsCount() >= 50 },
        { id: 'a10', title: 'Warehouse Overlord', icon: '🏬', desc: 'Own 20 Amazonian Warehouses.', check: s => (s.buildings['b4'] || 0) >= 20 },
        { id: 'a11', title: 'Click Master', icon: '⚡', desc: 'Click 1,000 times manually.', check: s => s.totalClicks >= 1000 },
        { id: 'a12', title: 'Fully Upgraded', icon: '🛠️', desc: 'Purchase 5 upgrades.', check: s => s.upgrades.length >= 5 },
        { id: 'a13', title: 'Re-Box Ascension', icon: '✨', desc: 'Ascend your empire for the first time.', check: s => s.prestigePoints > 0 },
        { id: 'a14', title: 'Speedy Taper', icon: '💨', desc: 'Reach 10,000 Boxes Per Second.', check: s => s.bps >= 10000 },
        { id: 'a15', title: 'Time Traveler', icon: '⏳', desc: 'Own a Time-Traveling Parcel Ship.', check: s => (s.buildings['b8'] || 0) >= 1 },
        { id: 'a16', title: 'Cardboard Deity', icon: '👑', desc: 'Reach 1,000,000 Boxes Per Second.', check: s => s.bps >= 1000000 },
        { id: 'a17', title: 'Interstellar Packager', icon: '🪐', desc: 'Accumulate 10,000,000,000 total boxes.', check: s => s.totalBoxes >= 10000000000 },
        { id: 'a18', title: 'Parcel Trillionaire', icon: '💎', desc: 'Accumulate 1,000,000,000,000 total boxes.', check: s => s.totalBoxes >= 1000000000000 },
        { id: 'a19', title: 'Dyson Swarm Commander', icon: '☀️', desc: 'Own a Dyson Swarm Box Factory.', check: s => (s.buildings['b9'] || 0) >= 1 },
        { id: 'a20', title: 'Multiverse Master', icon: '🌀', desc: 'Own a Multiverse Shipping Hub.', check: s => (s.buildings['b11'] || 0) >= 1 },
        { id: 'a21', title: 'Cosmic Creator', icon: '💥', desc: 'Own the 10 Trillion Big Bang Box Generator.', check: s => (s.buildings['b12'] || 0) >= 1 },
        { id: 'a22', title: 'Endgame Overlord', icon: '🏆', desc: 'Reach 100,000,000 Boxes Per Second.', check: s => s.bps >= 100000000 }
    ];

    const CUSTOMER_UPGRADES = [
        { id: 'c3', name: 'Freddy Pizza Jumpscare', icon: '🍕', cost: 1500000, desc: 'Every 2 minutes, there is a 50% chance Freddy jumpscares you, but awards a FREE random auto clicker building!' },
        { id: 'c2', name: 'Subscriber Bonus', icon: '🔔', cost: 3500000, desc: 'Every 1 minute, there is a 10% chance to gain +50% of the boxes you currently have!' },
        { id: 'c6', name: 'Box Overload Drop', icon: '📦', cost: 8000000, desc: 'Triggers an instant massive Box Rain! Grants +30 minutes worth of current BPS box output instantly.' },
        { id: 'c5', name: 'Frog Sign Blessing', icon: '🐸', cost: 20000000, desc: 'The ancient frog sign blesses your empire! Doubles your overall BPS output (2x BPS multiplier forever).' },
        { id: 'c1', name: 'STRONGBOX Skin & 2x BPS', icon: '🏋️', cost: 50000000, desc: 'Transforms your Box into the 3D Buff Box skin (without background) and doubles your total Boxes Per Second (2x BPS forever)!' },
        { id: 'c4', name: 'Mega Slap Clicker', icon: '⚡', cost: 150000000, desc: 'Boosts manual click power by +500% (6x) and makes Golden Boxes appear 2x more frequently!' },
        { id: 'c7', name: 'Chroma Box Rainbow Aura', icon: '🌈', cost: 400000000, desc: 'Unlocks a sparkling animated RGB Rainbow Aura around your main Box character and triples Golden Box rewards (3x).' },
        { id: 'c8', name: 'Time Warp Machine', icon: '⏳', cost: 1000000000, desc: 'Distorts space-time! Automatically clicks the main box character 10 times per second in the background forever.' }
    ];

    const NEWS_HEADLINES = [
        "Local buff box achieves 100 BPS; packing tape stocks soar worldwide!",
        "Scientists confirm: Cardboard is 99% muscle and 1% cellulose.",
        "Amazon requests partnership with local box clicker empire.",
        "Breaking: Delivery driver sets world record after receiving 50,000 parcels.",
        "Bubble wrap shortage reported as clicking frenzy intensifies!",
        "Ancient scrolls reveal: The universe is shaped like a giant shipping box.",
        "Buff Box seen flex-testing structural durability against sledgehammers.",
        "Quantum physicists open box portal; outcome unexpectedly neat and tidy.",
        "Mysterious guy near frog sign spotted offering exclusive box trades!"
    ];

    // --- GAME STATE ---
    let state = {
        boxes: 0,
        totalBoxes: 0,
        totalClicks: 0,
        boxesFromClicks: 0,
        goldenClicks: 0,
        boxName: "Buff Box",
        prestigePoints: 0,
        soundMuted: false,
        musicMuted: false, // Default ON as requested!
        lastTimestamp: Date.now(),
        timePlayed: 0,
        buildings: {},
        upgrades: [],
        customerUpgrades: [], // Purchased special customer upgrades
        customerActive: false, // Persisted Special Customer active visit state
        customerPurchasedThisVisit: false, // 1 trade per visit rule!
        freddyChance: 0.50, // Starts at 50% chance
        subscriberChance: 0.10, // Starts at 10% chance
        freddyBonusLevel: 1, // 1 free building per jumpscare
        equippedSkin: 'default', // 'default' or 'strongbox'
        companyBuyouts: 0, // Number of accepted corporate buyouts
        companyBuyoutMult: 1.0, // 1.2x multiplier per buyout
        companyBuyoutActive: false, // Buyout investor popup active
        rgbSettings: {
            sunburst: true,
            aura: true,
            falling: true
        },
        achievements: [],
        activeBuffs: {
            frenzy: 0,      // seconds remaining
            megaClick: 0,  // seconds remaining
            tongueSlap: 0  // seconds remaining
        }
    };

    let bulkBuyAmount = 1;
    let audioCtx = null;
    let nextGoldenSpawnTime = Date.now() + getRandomInt(45000, 90000);
    let bounceTimeout = null;
    let musicInterval = null;
    let musicStep = 0;
    let bpsBoxSpawnAcc = 0;
    let customerActive = false;
    let customerDespawnTimer = null;

    // --- INITIALIZATION ---
    document.addEventListener('DOMContentLoaded', () => {
        loadGame();
        initAudio();
        initEventListeners();

        startHeadlineTicker();
        startBackgroundMusicLoop();
        renderShopBuildings();
        renderShopUpgrades();
        renderBuildingDisplayRows();
        updateBoxSkin();
        gameLoop();
        setInterval(saveGame, 5000);
        setInterval(checkGoldenBoxSpawn, 1000);
        setTimeout(checkCustomerSpawn, 120000); // Initial spawn check 2 mins after start!
        setInterval(checkCustomerSpawn, 300000); // Rare check every 5 mins with 20% chance!
        setInterval(checkSubscriberBonus, 60000); // Every 1 minute: 10% chance for +50% box balance
        setInterval(checkFreddyJumpscare, 120000); // Every 2 minutes: 50% chance for Freddy jumpscare + free building

        // Resume AudioContext on any user interaction so music starts automatically
        const resumeOnUserInteract = () => {
            resumeAudioCtx();
            startBackgroundMusicLoop();
            window.removeEventListener('click', resumeOnUserInteract);
            window.removeEventListener('keydown', resumeOnUserInteract);
            window.removeEventListener('touchstart', resumeOnUserInteract);
        };
        window.addEventListener('click', resumeOnUserInteract);
        window.addEventListener('keydown', resumeOnUserInteract);
        window.addEventListener('touchstart', resumeOnUserInteract);
    });

    // --- WEB AUDIO SYNTHESIZER & BG MUSIC ---
    function initAudio() {
        try {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (AudioContextClass) {
                audioCtx = new AudioContextClass();
            }
        } catch (e) {
            console.log('Web Audio API not supported', e);
        }
    }

    function resumeAudioCtx() {
        if (audioCtx && audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
    }

    // LO-FI / 8-BIT PROCEDURAL BACKGROUND MUSIC LOOP (DYNAMIC SPEED & EVENT TEMPO)
    const BG_MELODY = [
        261.63, 329.63, 392.00, 523.25, 440.00, 392.00, 329.63, 261.63,
        293.66, 349.23, 440.00, 523.25, 493.88, 392.00, 329.63, 293.66
    ];
    const BG_BASS = [
        130.81, null, 130.81, null, 146.83, null, 174.61, null,
        130.81, null, 130.81, null, 146.83, null, 196.00, null
    ];

    let musicTimeout = null;

    function startBackgroundMusicLoop() {
        if (musicTimeout) clearTimeout(musicTimeout);
        scheduleNextMusicStep();
    }

    function scheduleNextMusicStep() {
        const isEventActive = state.activeBuffs.frenzy > 0 || state.activeBuffs.megaClick > 0 || state.activeBuffs.tongueSlap > 0;
        const stepDelay = isEventActive ? 125 : 240; // 125ms fast energetic tempo during events!

        if (!state.musicMuted && audioCtx) {
            resumeAudioCtx();

            const note = BG_MELODY[musicStep % BG_MELODY.length];
            const bass = BG_BASS[musicStep % BG_BASS.length];

            if (note) {
                playTone(isEventActive ? note * 1.06 : note, isEventActive ? 0.14 : 0.22, 'sine', isEventActive ? 0.14 : 0.12);
            }
            if (bass) {
                playTone(bass, isEventActive ? 0.18 : 0.28, 'triangle', isEventActive ? 0.16 : 0.14);
            }

            musicStep++;
        }

        musicTimeout = setTimeout(scheduleNextMusicStep, stepDelay);
    }

    function playTone(freq, duration, type = 'sine', gainVal = 0.1) {
        if (state.soundMuted || !audioCtx) return;
        resumeAudioCtx();

        try {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();

            osc.type = type;
            osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

            gain.gain.setValueAtTime(gainVal, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);

            osc.connect(gain);
            gain.connect(audioCtx.destination);

            osc.start();
            osc.stop(audioCtx.currentTime + duration);
        } catch (e) {}
    }

    function playClickSound() {
        if (state.soundMuted) return;
        const pitch = 220 + Math.random() * 80;
        playTone(pitch, 0.08, 'triangle', 0.15);
    }

    function playBuySound() {
        if (state.soundMuted) return;
        playTone(523.25, 0.1, 'sine', 0.12); // C5
        setTimeout(() => playTone(659.25, 0.15, 'sine', 0.12), 80); // E5
    }

    function playAchievementSound() {
        if (state.soundMuted) return;
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        notes.forEach((note, i) => {
            setTimeout(() => playTone(note, 0.2, 'sine', 0.15), i * 100);
        });
    }

    function playGoldenBoxSound() {
        if (state.soundMuted) return;
        playTone(1318.51, 0.15, 'sine', 0.2); // E6
        setTimeout(() => playTone(1567.98, 0.25, 'sine', 0.2), 100); // G6
    }




    // --- CLICK HANDLER & PARTICLES ---
    function onBigBoxClick(e) {
        resumeAudioCtx();
        playClickSound();

        const clickPower = getClickPower();
        addBoxes(clickPower);
        state.totalClicks++;
        state.boxesFromClicks += clickPower;

        // Visual click bounce, falling side boxes & particle effects
        spawnClickParticle(e, clickPower);
        triggerBoxClickPulse();
        spawnSideFallingBox();
        if (clickPower > 10) {
            spawnSideFallingBox(); // Extra falling box for high click power!
        }

        updateUI();
        checkAchievements();
    }

    function spawnSideFallingBox(side = null) {
        const container = document.getElementById('falling-boxes-container');
        if (!container) return;

        // Cap maximum active falling items for smooth 60 FPS performance
        if (container.children.length > 40) return;

        // Check owned buildings to spawn matching auto-clicker icons alongside mini boxes!
        const ownedBuildings = BUILDINGS.filter(b => (state.buildings[b.id] || 0) > 0);
        const useBuildingIcon = ownedBuildings.length > 0 && Math.random() < 0.6;

        let el;
        if (useBuildingIcon) {
            const b = ownedBuildings[getRandomInt(0, ownedBuildings.length - 1)];
            el = document.createElement('div');
            el.className = 'falling-mini-icon';
            el.textContent = b.icon;
        } else {
            el = document.createElement('img');
            el.src = 'assets/mini_box.png';
            el.alt = 'Falling Box';
            el.className = 'falling-mini-box';
        }

        // Pick side: left margin (1% to 18%) or right margin (82% to 98%)
        const isLeft = side !== null ? side === 'left' : Math.random() < 0.5;
        const leftPercent = isLeft ? getRandomInt(1, 18) : getRandomInt(82, 98);
        const size = getRandomInt(28, 48);
        const duration = (getRandomInt(22, 42) / 10).toFixed(1); // 2.2s - 4.2s

        el.style.left = `${leftPercent}%`;
        if (!useBuildingIcon) {
            el.style.width = `${size}px`;
            el.style.height = `${size}px`;
        } else {
            el.style.fontSize = `${(size * 0.9).toFixed(0)}px`;
        }
        el.style.animationDuration = `${duration}s`;

        container.appendChild(el);

        setTimeout(() => {
            if (el.parentNode) {
                el.parentNode.removeChild(el);
            }
        }, duration * 1000);
    }

    function triggerBoxClickPulse() {
        const wrapper = document.getElementById('big-box-wrapper');
        if (!wrapper) return;

        if (bounceTimeout) {
            clearTimeout(bounceTimeout);
        }

        wrapper.classList.remove('bouncing');
        void wrapper.offsetWidth; // trigger reflow to restart keyframe
        wrapper.classList.add('bouncing');

        bounceTimeout = setTimeout(() => {
            wrapper.classList.remove('bouncing');
        }, 450);
    }

    function spawnClickParticle(e, amount) {
        const container = document.getElementById('particles-container');
        if (!container) return;

        const rect = container.getBoundingClientRect();
        let x, y;

        if (e && e.clientX) {
            x = e.clientX - rect.left;
            y = e.clientY - rect.top;
        } else {
            x = rect.width / 2 + getRandomInt(-40, 40);
            y = rect.height / 2 + getRandomInt(-40, 40);
        }

        const particle = document.createElement('div');
        particle.className = 'click-particle';
        particle.textContent = `+${formatNumber(amount)}`;
        particle.style.left = `${x}px`;
        particle.style.top = `${y}px`;

        container.appendChild(particle);

        setTimeout(() => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
        }, 1000);
    }

    // --- GAME MATH & FORMULAS ---
    function getClickPower() {
        let power = 1;

        // Upgrades
        if (state.upgrades.includes('u1')) power *= 2;
        if (state.upgrades.includes('u6')) power *= 5;

        // Add % of BPS from upgrades
        let bpsPct = 0;
        if (state.upgrades.includes('u3')) bpsPct += 0.01;
        if (state.upgrades.includes('u8')) bpsPct += 0.05;
        if (bpsPct > 0) {
            power += getBps() * bpsPct;
        }

        // Customer Upgrades
        if (state.customerUpgrades.includes('c4')) {
            power *= 6.0; // Mega Slap Clicker +500% (6x)
        }

        // Active Buffs
        if (state.activeBuffs.megaClick > 0) {
            power *= 777;
        }
        if (state.activeBuffs.tongueSlap > 0) {
            power *= 5;
        }

        // Corporate Buyout Multiplier
        power *= (state.companyBuyoutMult || 1.0);

        return Math.max(1, Math.floor(power));
    }

    function getBps() {
        let totalBps = 0;

        let buildingMultiplier = 1;
        if (state.upgrades.includes('u5')) buildingMultiplier *= 2;
        if (state.upgrades.includes('u13')) buildingMultiplier *= 2.5;
        if (state.upgrades.includes('u18')) buildingMultiplier *= 5.0;

        BUILDINGS.forEach(b => {
            const count = state.buildings[b.id] || 0;
            totalBps += count * b.baseBps * buildingMultiplier;
        });

        // Global BPS Upgrades
        if (state.upgrades.includes('u2')) totalBps *= 1.1;
        if (state.upgrades.includes('u7')) totalBps *= 1.25;
        if (state.upgrades.includes('u9')) totalBps *= 1.5;
        if (state.upgrades.includes('u14')) totalBps *= 2.0;
        if (state.upgrades.includes('u16')) totalBps *= 3.0;

        // Special Customer Upgrades
        if (state.customerUpgrades.includes('c1')) totalBps *= 2.0; // STRONGBOX 2x BPS Boost!
        if (state.customerUpgrades.includes('c5')) totalBps *= 2.0; // Frog Sign Blessing 2x BPS Boost!

        // Active Buffs
        if (state.activeBuffs.frenzy > 0) {
            totalBps *= 7;
        }

        // Prestige multiplier (+2% per Golden Tape)
        totalBps *= (1 + state.prestigePoints * 0.02);

        // Corporate Buyout Multiplier
        totalBps *= (state.companyBuyoutMult || 1.0);

        return totalBps;
    }

    function getBuildingCost(building, amount = 1) {
        const owned = state.buildings[building.id] || 0;
        let totalCost = 0;

        for (let i = 0; i < amount; i++) {
            totalCost += Math.floor(building.baseCost * Math.pow(1.15, owned + i));
        }

        return totalCost;
    }

    function getPendingPrestigePoints() {
        const totalEarnedPrestige = Math.floor(Math.pow(state.totalBoxes / 1000000, 0.5));
        return Math.max(0, totalEarnedPrestige - state.prestigePoints);
    }

    function addBoxes(amount) {
        state.boxes += amount;
        state.totalBoxes += amount;
    }

    function getTotalBuildingsCount() {
        let count = 0;
        Object.values(state.buildings).forEach(c => count += c);
        return count;
    }

    // --- GOLDEN BOX RANDOM EVENT SYSTEM ---
    function checkGoldenBoxSpawn() {
        if (Date.now() >= nextGoldenSpawnTime) {
            spawnGoldenBox();
            let freqMult = state.upgrades.includes('u4') ? 0.65 : 1.0;
            if (state.customerUpgrades.includes('c4')) freqMult *= 0.5; // Mega Slap 2x Golden frequency
            nextGoldenSpawnTime = Date.now() + getRandomInt(60000 * freqMult, 120000 * freqMult);
        }
    }

    function spawnGoldenBox() {
        const container = document.getElementById('golden-box-container');
        if (!container || container.children.length > 0) return;

        const gBox = document.createElement('div');
        gBox.className = 'golden-box';
        gBox.innerHTML = '📦✨';

        const left = getRandomInt(10, 80);
        const top = getRandomInt(10, 70);
        gBox.style.left = `${left}%`;
        gBox.style.top = `${top}%`;

        gBox.addEventListener('click', (e) => {
            e.stopPropagation();
            clickGoldenBox(gBox);
        });

        container.appendChild(gBox);
        playGoldenBoxSound();

        // Auto despawn after 12s
        const dur = state.upgrades.includes('u4') ? 18000 : 12000;
        setTimeout(() => {
            if (gBox.parentNode) {
                gBox.parentNode.removeChild(gBox);
            }
        }, dur);
    }

    function clickGoldenBox(element) {
        state.goldenClicks++;
        playGoldenBoxSound();

        if (element.parentNode) {
            element.parentNode.removeChild(element);
        }

        // Trigger Random Event
        const roll = Math.random();
        let durMult = state.upgrades.includes('u4') ? 1.5 : 1.0;
        let rewardMult = state.customerUpgrades.includes('c7') ? 3.0 : 1.0; // Chroma Box 3x Golden rewards

        if (roll < 0.45) {
            // Box Frenzy (7x BPS for 15s)
            state.activeBuffs.frenzy = Math.floor(15 * durMult);
            showToast('🔥 GOLDEN BOX FRENZY!', '7x BPS for 15 seconds!');
        } else if (roll < 0.85) {
            // Mega Click (777x Click Power for 10s)
            state.activeBuffs.megaClick = Math.floor(10 * durMult);
            showToast('⚡ MEGA CLICK FRENZY!', '777x Click Power for 10 seconds!');
        } else {
            // Box Shower (Instant 15 mins BPS reward)
            const reward = Math.max(1337, Math.floor(getBps() * 900 * rewardMult));
            addBoxes(reward);
            showToast('🎁 BOX SHOWER!', `Instant +${formatNumber(reward)} Boxes!`);
        }

        renderShopBuildings(); // Refresh bonuses on frenzy
        updateUI();
        checkAchievements();
    }

    // --- MAIN GAME LOOP (100ms TICK & RAF) ---
    let lastTick = Date.now();

    function gameLoop() {
        const now = Date.now();
        const delta = (now - lastTick) / 1000;
        lastTick = now;

        state.timePlayed += delta;

        // Customer Upgrade c8: Time Warp Machine (Auto-clicks main box 10x per second!)
        if (state.customerUpgrades.includes('c8')) {
            addBoxes(getClickPower() * 10 * delta);
        }

        // Accumulate BPS
        const currentBps = getBps();
        state.bps = currentBps;
        if (currentBps > 0) {
            addBoxes(currentBps * delta);
            bpsBoxSpawnAcc += currentBps * delta;
            const threshold = Math.max(1, 15 / Math.log10(currentBps + 10));
            if (bpsBoxSpawnAcc >= threshold) {
                bpsBoxSpawnAcc = 0;
                spawnSideFallingBox();
            }
        }

        // Update Active Buff Timers
        if (state.activeBuffs.frenzy > 0) {
            state.activeBuffs.frenzy = Math.max(0, state.activeBuffs.frenzy - delta);
            if (state.activeBuffs.frenzy === 0) renderShopBuildings();
        }
        if (state.activeBuffs.megaClick > 0) {
            state.activeBuffs.megaClick = Math.max(0, state.activeBuffs.megaClick - delta);
        }
        if (state.activeBuffs.tongueSlap > 0) {
            state.activeBuffs.tongueSlap = Math.max(0, state.activeBuffs.tongueSlap - delta);
        }

        updateUI();
        checkAchievements();

        requestAnimationFrame(gameLoop);
    }

    // SPECIAL CUSTOMER SPAWNER & TRADES ENGINE (EVERY 5 MINS, 60% CHANCE)
    let lastCustomerSpawnTime = 0;

    function checkCustomerSpawn() {
        if (customerActive || state.customerActive) return;

        const now = Date.now();
        // Every 5 minutes (300,000ms), 60% chance of appearing!
        if (Math.random() < 0.60) {
            spawnCustomer();
        }
    }

    function spawnCustomer() {
        customerActive = true;
        state.customerActive = true;
        state.customerPurchasedThisVisit = false;
        lastCustomerSpawnTime = Date.now();

        const popup = document.getElementById('customer-popup');
        if (popup) {
            popup.classList.remove('hidden');
        }
        playGoldenBoxSound();
        showToast('🐸 SPECIAL CUSTOMER ARRIVED!', 'Click the popup in the bottom corner for 1 exclusive trade!');
        saveGame();

        // Stay for 3 minutes (180s) if not traded
        if (customerDespawnTimer) clearTimeout(customerDespawnTimer);
        customerDespawnTimer = setTimeout(() => {
            despawnCustomer();
        }, 180000);
    }

    function despawnCustomer() {
        customerActive = false;
        state.customerActive = false;
        const popup = document.getElementById('customer-popup');
        if (popup) {
            popup.classList.add('hidden');
        }
        saveGame();
    }

    function updateBoxSkin() {
        const bigBoxImg = document.getElementById('big-box-img');
        const bigBoxWrapper = document.getElementById('big-box-wrapper');
        const eyelidsOverlay = document.getElementById('eyelids-overlay');
        const sunburstBg = document.getElementById('sunburst-bg') || document.querySelector('.sunburst-bg');
        const fallingContainer = document.getElementById('falling-boxes-container');
        const leftPane = document.querySelector('.left-pane');

        const is3DSkin = (state.equippedSkin === 'strongbox');
        const isBoxV2Skin = (state.equippedSkin === 'boxv2');
        const hasChromaRainbow = state.customerUpgrades.includes('c7');
        const rgbSettings = state.rgbSettings || { sunburst: true, aura: true, falling: true, bluepurple: false };

        if (bigBoxImg) {
            if (is3DSkin) {
                bigBoxImg.src = 'assets/strongbox_skin.png';
            } else if (isBoxV2Skin) {
                bigBoxImg.src = 'assets/box_v2_skin.png';
            } else {
                bigBoxImg.src = 'assets/box_clean.png';
            }
        }


        // Rainbow aura for main box character
        if (bigBoxWrapper) {
            if (hasChromaRainbow && rgbSettings.aura) {
                bigBoxWrapper.classList.add('rainbow-aura');
            } else {
                bigBoxWrapper.classList.remove('rainbow-aura');
            }
        }

        // Sunburst lights behind box character
        if (sunburstBg) {
            sunburstBg.classList.remove('rainbow-sunburst', 'bluepurple-sunburst');
            if (rgbSettings.bluepurple) {
                sunburstBg.classList.add('bluepurple-sunburst');
            } else if (rgbSettings.sunburst) {
                sunburstBg.classList.add('rainbow-sunburst');
            }
        }

        // Rainbow falling side buildings and mini boxes
        if (fallingContainer) {
            if (rgbSettings.falling) {
                fallingContainer.classList.add('rainbow-falling');
            } else {
                fallingContainer.classList.remove('rainbow-falling');
            }
        }

        // Rainbow glowing border for left pane
        if (leftPane) {
            if (hasChromaRainbow && rgbSettings.aura) {
                leftPane.classList.add('rainbow-pane');
            } else {
                leftPane.classList.remove('rainbow-pane');
            }
        }
    }

    function checkSubscriberBonus() {
        if (!state.customerUpgrades.includes('c2')) return;
        const chance = state.subscriberChance || 0.10;
        const mult = state.subscriberBonusLevel || 0.50;

        if (Math.random() < chance) { // Dynamic Subscriber chance!
            const bonus = Math.max(1, Math.floor(state.boxes * mult));
            addBoxes(bonus);
            playAchievementSound();
            showToast('🔔 SUBSCRIBER BONUS!', `Gained +${Math.round(mult * 100)}% bonus boxes! (+${formatNumber(bonus)} Boxes)`);
        }
    }

    function checkFreddyJumpscare() {
        if (!state.customerUpgrades.includes('c3')) return;
        const chance = state.freddyChance || 0.50;

        if (Math.random() < chance) { // Dynamic Freddy chance!
            triggerFreddyJumpscare();
        }
    }

    function triggerFreddyJumpscare() {
        const overlay = document.getElementById('freddy-jumpscare-overlay');
        if (overlay) {
            overlay.classList.remove('hidden');
            playTone(80, 0.4, 'sawtooth', 0.4);
            setTimeout(() => {
                overlay.classList.add('hidden');
            }, 1200);
        }

        const bonusAmount = state.freddyBonusLevel || 1;
        const affordable = BUILDINGS.filter(b => state.boxes >= getBuildingCost(b, 1));
        const pool = affordable.length > 0 ? affordable : BUILDINGS;
        const randomB = pool[getRandomInt(0, pool.length - 1)];

        state.buildings[randomB.id] = (state.buildings[randomB.id] || 0) + bonusAmount;
        renderShopBuildings();
        renderBuildingDisplayRows();
        updateUI();
        showToast('🍕 FREDDY JUMPSCARE!', `BOO! Freddy dropped FREE +${bonusAmount} ${randomB.name}!`);
    }

    function renderCustomerUpgrades() {
        const container = document.getElementById('customer-upgrades-list');
        if (!container) return;

        container.innerHTML = '';

        CUSTOMER_UPGRADES.forEach(u => {
            const isOwned = state.customerUpgrades.includes(u.id);
            const canAfford = state.boxes >= u.cost;
            const alreadyBoughtThisVisit = state.customerPurchasedThisVisit;

            const card = document.createElement('div');
            card.className = `building-card ${isOwned || alreadyBoughtThisVisit ? 'disabled' : (canAfford ? '' : 'disabled')}`;
            card.style.marginBottom = '8px';

            let statusText = '';
            if (isOwned) {
                statusText = '✅ (TRADED)';
            } else if (alreadyBoughtThisVisit) {
                statusText = '🔒 (1 TRADE PER VISIT)';
            }

            card.innerHTML = `
                <div class="item-left">
                    <div class="item-icon">${u.icon}</div>
                    <div class="item-info">
                        <div class="item-name">${u.name} ${statusText}</div>
                        <div class="item-price">📦 ${formatNumber(u.cost)}</div>
                        <div class="item-desc" style="font-size: 0.8rem; color: var(--text-muted); margin-top: 4px; line-height: 1.3;">${u.desc}</div>
                    </div>
                </div>
            `;

            card.addEventListener('click', () => {
                if (!isOwned && !state.customerPurchasedThisVisit && state.boxes >= u.cost) {
                    state.boxes -= u.cost;
                    state.customerUpgrades.push(u.id);
                    state.customerPurchasedThisVisit = true;

                    // Immediate Buff Triggers
                    if (u.id === 'c1') {
                        state.equippedSkin = 'strongbox';
                        updateBoxSkin();
                    } else if (u.id === 'c7') {
                        updateBoxSkin();
                    } else if (u.id === 'c6') {
                        const reward = Math.max(10000, Math.floor(getBps() * 1800));
                        addBoxes(reward);
                        showToast('📦 OVERLOAD DROP!', `Gained +${formatNumber(reward)} Boxes!`);
                    }

                    playBuySound();
                    showToast('🐸 TRADE COMPLETE!', `Traded boxes for ${u.name}! Customer departs satisfied.`);
                    renderCustomerUpgrades();
                    renderShopBuildings();
                    updateUI();
                    checkAchievements();
                    saveGame();

                    // Depart after 1.2s
                    setTimeout(() => {
                        const modalCustomer = document.getElementById('modal-customer');
                        if (modalCustomer) modalCustomer.classList.add('hidden');
                        despawnCustomer();
                    }, 1200);
                }
            });

            container.appendChild(card);
        });

        // ENDGAME UPGRADES (Available when all 8 base secret items are owned!)
        if (state.customerUpgrades.length >= 8) {
            const endgameHeader = document.createElement('h3');
            endgameHeader.style.marginTop = '20px';
            endgameHeader.style.marginBottom = '12px';
            endgameHeader.style.color = 'var(--primary-gold)';
            endgameHeader.innerHTML = '⚡ MAXED SECRET ENDGAME UPGRADES';
            container.appendChild(endgameHeader);

            // 1. Freddy Upgrade (Boost chance +10% until 100%, then upgrade building drop multiplier!)
            const isFreddyMaxed = ((state.freddyChance || 0.50) >= 1.0);
            const freddyCost = isFreddyMaxed ? (5000000 * (state.freddyBonusLevel || 1)) : 2000000;
            const canAffordFreddy = state.boxes >= freddyCost;
            const alreadyBoughtThisVisit = state.customerPurchasedThisVisit;

            const freddyCard = document.createElement('div');
            freddyCard.className = `building-card ${alreadyBoughtThisVisit ? 'disabled' : (canAffordFreddy ? '' : 'disabled')}`;
            freddyCard.style.marginBottom = '8px';

            const currentFreddyPct = Math.round((state.freddyChance || 0.50) * 100);
            const freddyName = isFreddyMaxed 
                ? `🍕 Freddy Drop Multiplier (Level ${ (state.freddyBonusLevel || 1) + 1 })`
                : `🍕 Freddy Chance Boost (${currentFreddyPct}% ➔ ${Math.min(100, currentFreddyPct + 10)}%)`;
            const freddyDesc = isFreddyMaxed
                ? `Freddy Jumpscare Chance is MAXED at 100%! Upgrades free building reward to +${ (state.freddyBonusLevel || 1) + 1 } buildings per jumpscare!`
                : `Increases Freddy's jumpscare trigger chance by +10% (currently ${currentFreddyPct}%)!`;

            freddyCard.innerHTML = `
                <div class="item-left">
                    <div class="item-icon">🍕⚡</div>
                    <div class="item-info">
                        <div class="item-name">${freddyName} ${alreadyBoughtThisVisit ? '🔒 (1 TRADE PER VISIT)' : ''}</div>
                        <div class="item-price">📦 ${formatNumber(freddyCost)}</div>
                        <div class="item-desc" style="font-size: 0.8rem; color: var(--text-muted); margin-top: 4px; line-height: 1.3;">${freddyDesc}</div>
                    </div>
                </div>
            `;

            freddyCard.addEventListener('click', () => {
                if (!state.customerPurchasedThisVisit && state.boxes >= freddyCost) {
                    state.boxes -= freddyCost;
                    state.customerPurchasedThisVisit = true;

                    if (!isFreddyMaxed) {
                        state.freddyChance = Math.min(1.0, (state.freddyChance || 0.50) + 0.10);
                        showToast('🍕 CHANCE UPGRADED!', `Freddy Jumpscare chance boosted to ${Math.round(state.freddyChance * 100)}%!`);
                    } else {
                        state.freddyBonusLevel = (state.freddyBonusLevel || 1) + 1;
                        showToast('🍕 MULTIPLIER UPGRADED!', `Freddy now drops +${state.freddyBonusLevel} FREE buildings per jumpscare!`);
                    }

                    playBuySound();
                    renderCustomerUpgrades();
                    updateUI();
                    saveGame();

                    setTimeout(() => {
                        const modalCustomer = document.getElementById('modal-customer');
                        if (modalCustomer) modalCustomer.classList.add('hidden');
                        despawnCustomer();
                    }, 1200);
                }
            });

            container.appendChild(freddyCard);

            // 2. Subscriber Upgrade (Boost chance +10% until 100%, then upgrade box payout multiplier!)
            const isSubMaxed = ((state.subscriberChance || 0.10) >= 1.0);
            const subCost = isSubMaxed ? (10000000 * Math.round((state.subscriberBonusLevel || 0.5) * 2)) : 5000000;
            const canAffordSub = state.boxes >= subCost;

            const subCard = document.createElement('div');
            subCard.className = `building-card ${alreadyBoughtThisVisit ? 'disabled' : (canAffordSub ? '' : 'disabled')}`;
            subCard.style.marginBottom = '8px';

            const currentSubPct = Math.round((state.subscriberChance || 0.10) * 100);
            const currentSubMultPct = Math.round((state.subscriberBonusLevel || 0.50) * 100);
            const subName = isSubMaxed 
                ? `🔔 Subscriber Payout Boost (+${currentSubMultPct + 50}% Bonus)`
                : `🔔 Subscriber Chance Boost (${currentSubPct}% ➔ ${Math.min(100, currentSubPct + 10)}%)`;
            const subDesc = isSubMaxed
                ? `Subscriber Chance is MAXED at 100%! Increases box balance payout to +${currentSubMultPct + 50}% bonus boxes!`
                : `Increases Subscriber bonus trigger chance by +10% (currently ${currentSubPct}%)!`;

            subCard.innerHTML = `
                <div class="item-left">
                    <div class="item-icon">🔔⚡</div>
                    <div class="item-info">
                        <div class="item-name">${subName} ${alreadyBoughtThisVisit ? '🔒 (1 TRADE PER VISIT)' : ''}</div>
                        <div class="item-price">📦 ${formatNumber(subCost)}</div>
                        <div class="item-desc" style="font-size: 0.8rem; color: var(--text-muted); margin-top: 4px; line-height: 1.3;">${subDesc}</div>
                    </div>
                </div>
            `;

            subCard.addEventListener('click', () => {
                if (!state.customerPurchasedThisVisit && state.boxes >= subCost) {
                    state.boxes -= subCost;
                    state.customerPurchasedThisVisit = true;

                    if (!isSubMaxed) {
                        state.subscriberChance = Math.min(1.0, (state.subscriberChance || 0.10) + 0.10);
                        showToast('🔔 CHANCE UPGRADED!', `Subscriber bonus chance boosted to ${Math.round(state.subscriberChance * 100)}%!`);
                    } else {
                        state.subscriberBonusLevel = (state.subscriberBonusLevel || 0.50) + 0.50;
                        showToast('🔔 PAYOUT UPGRADED!', `Subscriber bonus now awards +${Math.round(state.subscriberBonusLevel * 100)}% bonus boxes!`);
                    }

                    playBuySound();
                    renderCustomerUpgrades();
                    updateUI();
                    saveGame();

                    setTimeout(() => {
                        const modalCustomer = document.getElementById('modal-customer');
                        if (modalCustomer) modalCustomer.classList.add('hidden');
                        despawnCustomer();
                    }, 1200);
                }
            });

            container.appendChild(subCard);
        }
    }

    // --- SKINS & FX RENDERER ---
    function renderSkinsAndFx() {
        const container = document.getElementById('skins-list');
        if (!container) return;

        container.innerHTML = '';

        // Section 1: Character Skins
        const skinsHeader = document.createElement('h3');
        skinsHeader.style.color = 'var(--primary-gold)';
        skinsHeader.style.marginBottom = '12px';
        skinsHeader.style.fontSize = '1.05rem';
        skinsHeader.innerHTML = '📦 Box Character Skins';
        container.appendChild(skinsHeader);

        const currentSkin = state.equippedSkin || 'default';
        const has3DSkin = state.customerUpgrades.includes('c1');

        // Skin 1: Default Cardboard Box
        const isDefaultEquipped = (currentSkin === 'default');
        const defaultCard = document.createElement('div');
        defaultCard.className = `building-card ${isDefaultEquipped ? 'disabled' : ''}`;
        defaultCard.style.marginBottom = '10px';
        defaultCard.innerHTML = `
            <div class="item-left">
                <div class="item-icon"><img src="assets/box_clean.png" style="width:34px;height:34px;object-fit:contain;"></div>
                <div class="item-info">
                    <div class="item-name">Classic Cardboard Box ${isDefaultEquipped ? '✅ (EQUIPPED)' : ''}</div>
                    <div class="item-desc" style="font-size: 0.8rem; color: var(--text-muted); margin-top: 4px;">Original clean cardboard box character with eye blinking!</div>
                </div>
            </div>
            <button class="action-btn-secondary" style="font-size: 0.8rem;" ${isDefaultEquipped ? 'disabled' : ''}>
                ${isDefaultEquipped ? 'Equipped' : 'Equip Skin'}
            </button>
        `;
        defaultCard.addEventListener('click', () => {
            if (!isDefaultEquipped) {
                state.equippedSkin = 'default';
                updateBoxSkin();
                saveGame();
                renderSkinsAndFx();
                showToast('📦 SKIN EQUIPPED!', 'Equipped Classic Cardboard Box skin!');
            }
        });
        container.appendChild(defaultCard);

        // Skin 2: 3D STRONGBOX Muscle Box
        const isStrongboxEquipped = (currentSkin === 'strongbox');
        const strongboxCard = document.createElement('div');
        strongboxCard.className = `building-card ${!has3DSkin || isStrongboxEquipped ? 'disabled' : ''}`;
        strongboxCard.style.marginBottom = '20px';

        let strongboxBadge = '';
        if (isStrongboxEquipped) {
            strongboxBadge = '✅ (EQUIPPED)';
        } else if (!has3DSkin) {
            strongboxBadge = '🔒 (UNLOCKED IN SECRET SHOP)';
        }

        strongboxCard.innerHTML = `
            <div class="item-left">
                <div class="item-icon"><img src="assets/strongbox_skin.png" style="width:34px;height:34px;object-fit:contain;"></div>
                <div class="item-info">
                    <div class="item-name">🏋️ 3D STRONGBOX Muscle Box ${strongboxBadge}</div>
                    <div class="item-desc" style="font-size: 0.8rem; color: var(--text-muted); margin-top: 4px;">Transparent 3D Muscle Box skin with doubled BPS!</div>
                </div>
            </div>
            <button class="action-btn-secondary" style="font-size: 0.8rem;" ${!has3DSkin || isStrongboxEquipped ? 'disabled' : ''}>
                ${isStrongboxEquipped ? 'Equipped' : (has3DSkin ? 'Equip Skin' : 'Locked')}
            </button>
        `;
        strongboxCard.addEventListener('click', () => {
            if (has3DSkin && !isStrongboxEquipped) {
                state.equippedSkin = 'strongbox';
                updateBoxSkin();
                saveGame();
                renderSkinsAndFx();
                showToast('🏋️ SKIN EQUIPPED!', 'Equipped 3D STRONGBOX Muscle Box skin!');
            }
        });
        container.appendChild(strongboxCard);

        // Skin 3: Box 2.0 (Unlocked via Corporate Buyout)
        const hasBoxV2 = (state.companyBuyouts || 0) >= 1;
        const isBoxV2Equipped = (currentSkin === 'boxv2');
        const boxV2Card = document.createElement('div');
        boxV2Card.className = `building-card ${!hasBoxV2 || isBoxV2Equipped ? 'disabled' : ''}`;
        boxV2Card.style.marginBottom = '20px';

        let boxV2Badge = '';
        if (isBoxV2Equipped) {
            boxV2Badge = '✅ (EQUIPPED)';
        } else if (!hasBoxV2) {
            boxV2Badge = '🔒 (ACCEPT A CORPORATE BUYOUT TO UNLOCK)';
        }

        boxV2Card.innerHTML = `
            <div class="item-left">
                <div class="item-icon"><img src="assets/box_v2_skin.png" style="width:34px;height:34px;object-fit:contain;border-radius:4px;"></div>
                <div class="item-info">
                    <div class="item-name">📦 Box 2.0 ${boxV2Badge}</div>
                    <div class="item-desc" style="font-size: 0.8rem; color: var(--text-muted); margin-top: 4px;">Dark muscle box with glowing cyan smile. Unlocked after first Corporate Buyout!</div>
                </div>
            </div>
            <button class="action-btn-secondary" style="font-size: 0.8rem;" ${!hasBoxV2 || isBoxV2Equipped ? 'disabled' : ''}>
                ${isBoxV2Equipped ? 'Equipped' : (hasBoxV2 ? 'Equip Skin' : 'Locked')}
            </button>
        `;
        boxV2Card.addEventListener('click', () => {
            if (hasBoxV2 && !isBoxV2Equipped) {
                state.equippedSkin = 'boxv2';
                updateBoxSkin();
                saveGame();
                renderSkinsAndFx();
                showToast('📦 BOX 2.0 EQUIPPED!', 'Your box got a serious upgrade!');
            }
        });
        container.appendChild(boxV2Card);

        // Section 2: Visual Effects & RGB Toggles
        const fxHeader = document.createElement('h3');
        fxHeader.style.color = 'var(--primary-gold)';
        fxHeader.style.marginBottom = '12px';
        fxHeader.style.fontSize = '1.05rem';
        fxHeader.innerHTML = '🌈 Visual Effects & RGB Toggles';
        container.appendChild(fxHeader);

        if (!state.rgbSettings) state.rgbSettings = { sunburst: true, aura: true, falling: true };
        const rgbSettings = state.rgbSettings;

        // Toggle 1: Sunburst Triangle Rays RGB
        const sunburstCard = document.createElement('div');
        sunburstCard.className = 'building-card';
        sunburstCard.style.marginBottom = '10px';
        sunburstCard.style.cursor = 'pointer';
        sunburstCard.innerHTML = `
            <div class="item-left">
                <div class="item-icon">☀️</div>
                <div class="item-info">
                    <div class="item-name">RGB Sunburst Triangle Rays</div>
                    <div class="item-desc" style="font-size: 0.8rem; color: var(--text-muted); margin-top: 4px;">Multi-color RGB rainbow rays spinning behind main box.</div>
                </div>
            </div>
            <button class="${rgbSettings.sunburst ? 'action-btn-primary' : 'action-btn-secondary'}" style="font-size: 0.8rem;">
                ${rgbSettings.sunburst ? 'RGB: ON 🌈' : 'RGB: OFF ⚪'}
            </button>
        `;
        sunburstCard.addEventListener('click', () => {
            if (!state.rgbSettings) state.rgbSettings = { sunburst: true, aura: true, falling: true };
            state.rgbSettings.sunburst = !state.rgbSettings.sunburst;
            updateBoxSkin();
            saveGame();
            renderSkinsAndFx();
            showToast('🌈 EFFECT TOGGLED!', `RGB Sunburst Rays are now ${state.rgbSettings.sunburst ? 'ON' : 'OFF'}!`);
        });
        container.appendChild(sunburstCard);

        // Toggle 2: Chroma Box Rainbow Aura
        const hasChroma = state.customerUpgrades.includes('c7');
        const auraCard = document.createElement('div');
        auraCard.className = `building-card ${!hasChroma ? 'disabled' : ''}`;
        auraCard.style.marginBottom = '10px';
        auraCard.style.cursor = hasChroma ? 'pointer' : 'not-allowed';
        auraCard.innerHTML = `
            <div class="item-left">
                <div class="item-icon">🌈</div>
                <div class="item-info">
                    <div class="item-name">Chroma Box Character Rainbow Aura ${!hasChroma ? '🔒 (REQUIRES CHROMA UNLOCK)' : ''}</div>
                    <div class="item-desc" style="font-size: 0.8rem; color: var(--text-muted); margin-top: 4px;">Animated RGB rainbow aura around main box & left border.</div>
                </div>
            </div>
            <button class="${rgbSettings.aura && hasChroma ? 'action-btn-primary' : 'action-btn-secondary'}" style="font-size: 0.8rem;" ${!hasChroma ? 'disabled' : ''}>
                ${rgbSettings.aura && hasChroma ? 'RGB: ON 🌈' : 'RGB: OFF ⚪'}
            </button>
        `;
        auraCard.addEventListener('click', () => {
            if (hasChroma) {
                if (!state.rgbSettings) state.rgbSettings = { sunburst: true, aura: true, falling: true };
                state.rgbSettings.aura = !state.rgbSettings.aura;
                updateBoxSkin();
                saveGame();
                renderSkinsAndFx();
                showToast('🌈 EFFECT TOGGLED!', `Chroma Character Aura is now ${state.rgbSettings.aura ? 'ON' : 'OFF'}!`);
            }
        });
        container.appendChild(auraCard);

        // Toggle 3: Falling Side Buildings RGB Rain
        const fallingCard = document.createElement('div');
        fallingCard.className = 'building-card';
        fallingCard.style.marginBottom = '10px';
        fallingCard.style.cursor = 'pointer';
        fallingCard.innerHTML = `
            <div class="item-left">
                <div class="item-icon">🌧️</div>
                <div class="item-info">
                    <div class="item-name">RGB Side Falling Buildings & Rain</div>
                    <div class="item-desc" style="font-size: 0.8rem; color: var(--text-muted); margin-top: 4px;">Cycles side margin falling building icons through RGB colors.</div>
                </div>
            </div>
            <button class="${rgbSettings.falling ? 'action-btn-primary' : 'action-btn-secondary'}" style="font-size: 0.8rem;">
                ${rgbSettings.falling ? 'RGB: ON 🌈' : 'RGB: OFF ⚪'}
            </button>
        `;
        fallingCard.addEventListener('click', () => {
            if (!state.rgbSettings) state.rgbSettings = { sunburst: true, aura: true, falling: true };
            state.rgbSettings.falling = !state.rgbSettings.falling;
            updateBoxSkin();
            saveGame();
            renderSkinsAndFx();
            showToast('🌈 EFFECT TOGGLED!', `RGB Side Falling Rain is now ${state.rgbSettings.falling ? 'ON' : 'OFF'}!`);
        });
        container.appendChild(fallingCard);

        // Toggle 4: Blue & Purple Sunburst (unlocked via Corporate Buyout)
        const hasBluePurple = (state.companyBuyouts || 0) >= 1;
        if (!state.rgbSettings) state.rgbSettings = { sunburst: true, aura: true, falling: true, bluepurple: false };
        if (state.rgbSettings.bluepurple === undefined) state.rgbSettings.bluepurple = false;
        const bpOn = rgbSettings.bluepurple;

        const bluepurpleCard = document.createElement('div');
        bluepurpleCard.className = `building-card ${!hasBluePurple ? 'disabled' : ''}`;
        bluepurpleCard.style.marginBottom = '10px';
        bluepurpleCard.style.cursor = hasBluePurple ? 'pointer' : 'not-allowed';
        bluepurpleCard.innerHTML = `
            <div class="item-left">
                <div class="item-icon">💜</div>
                <div class="item-info">
                    <div class="item-name">Blue & Purple Sunburst ${!hasBluePurple ? '🔒 (ACCEPT A CORPORATE BUYOUT)' : ''}</div>
                    <div class="item-desc" style="font-size: 0.8rem; color: var(--text-muted); margin-top: 4px;">Replaces the rainbow sunburst with a deep blue & purple galaxy effect!</div>
                </div>
            </div>
            <button class="${bpOn && hasBluePurple ? 'action-btn-primary' : 'action-btn-secondary'}" style="font-size: 0.8rem;" ${!hasBluePurple ? 'disabled' : ''}>
                ${bpOn && hasBluePurple ? '💜 ON' : '💜 OFF'}
            </button>
        `;
        bluepurpleCard.addEventListener('click', () => {
            if (!hasBluePurple) return;
            if (!state.rgbSettings) state.rgbSettings = { sunburst: true, aura: true, falling: true, bluepurple: false };
            state.rgbSettings.bluepurple = !state.rgbSettings.bluepurple;
            // If turning on blue/purple, disable regular sunburst
            if (state.rgbSettings.bluepurple) state.rgbSettings.sunburst = false;
            updateBoxSkin();
            saveGame();
            renderSkinsAndFx();
            showToast('💜 EFFECT TOGGLED!', `Blue & Purple Sunburst is now ${state.rgbSettings.bluepurple ? 'ON' : 'OFF'}!`);
        });
        container.appendChild(bluepurpleCard);
    }

    // --- CORPORATE BUYOUT SPAWNER ---
    function checkBuyoutCondition() {
        // Condition: Player owns at least 1 of EVERY building AND purchased all UPGRADES!
        const hasAllBuildings = BUILDINGS.every(b => (state.buildings[b.id] || 0) >= 1);
        const hasAllUpgrades = UPGRADES.every(u => state.upgrades.includes(u.id));

        const buyoutPopup = document.getElementById('buyout-popup');

        if (hasAllBuildings && hasAllUpgrades) {
            state.companyBuyoutActive = true;
            if (buyoutPopup) buyoutPopup.classList.remove('hidden');
        } else {
            state.companyBuyoutActive = false;
            if (buyoutPopup) buyoutPopup.classList.add('hidden');
        }
    }

    // --- UI RENDER & UPDATES ---
    function updateUI() {
        checkBuyoutCondition();

        // Counts
        document.getElementById('box-count').textContent = formatNumber(Math.floor(state.boxes));
        document.getElementById('bps-value').textContent = formatNumber(state.bps, 1);

        // Time Played under Big Box
        const timeValEl = document.getElementById('time-played-value');
        if (timeValEl) {
            timeValEl.textContent = formatTime(state.timePlayed);
        }

        // Toggle Yellowish Tint & Glowing Aura during active events (Frenzy, Mega Click, Tongue Slap)
        const isEventActive = state.activeBuffs.frenzy > 0 || state.activeBuffs.megaClick > 0 || state.activeBuffs.tongueSlap > 0;
        const bigBoxWrapper = document.getElementById('big-box-wrapper');
        if (bigBoxWrapper) {
            if (isEventActive) {
                bigBoxWrapper.classList.add('event-active');
            } else {
                bigBoxWrapper.classList.remove('event-active');
            }
        }

        // Quick Stats
        document.getElementById('qs-click-power').textContent = formatNumber(getClickPower());
        document.getElementById('qs-total-buildings').textContent = getTotalBuildingsCount();
        document.getElementById('qs-tape-mult').textContent = (1 + state.prestigePoints * 0.02).toFixed(2) + 'x';
        document.getElementById('qs-prestige-points').textContent = state.prestigePoints + ' 🌟';

        // Buff Badges UI
        const buffsContainer = document.getElementById('active-buffs');
        buffsContainer.innerHTML = '';
        if (state.activeBuffs.frenzy > 0) {
            const b = document.createElement('div');
            b.className = 'buff-badge';
            b.textContent = `🔥 Frenzy 7x BPS (${Math.ceil(state.activeBuffs.frenzy)}s)`;
            buffsContainer.appendChild(b);
        }
        if (state.activeBuffs.megaClick > 0) {
            const b = document.createElement('div');
            b.className = 'buff-badge';
            b.textContent = `⚡ Mega Click 777x (${Math.ceil(state.activeBuffs.megaClick)}s)`;
            buffsContainer.appendChild(b);
        }
        if (state.activeBuffs.tongueSlap > 0) {
            const b = document.createElement('div');
            b.className = 'buff-badge';
            b.textContent = `👅 Tongue Slap 5x Clicks (${Math.ceil(state.activeBuffs.tongueSlap)}s)`;
            buffsContainer.appendChild(b);
        }

        // Ascension pending calculation (Fixed Exploit!)
        const pendingPrestige = getPendingPrestigePoints();
        document.getElementById('pending-prestige-pts').textContent = pendingPrestige + ' 🌟';
        const btnAscend = document.getElementById('btn-do-prestige');
        if (btnAscend) {
            btnAscend.disabled = pendingPrestige <= 0;
        }

        // Fast Affordability State Refresh (High Performance, No DOM rebuilds per frame)
        updateAffordabilityClasses();

        // Update Stats Modal if open
        const statsModal = document.getElementById('modal-stats');
        if (statsModal && !statsModal.classList.contains('hidden')) {
            updateStatsModal();
        }
    }

    function updateAffordabilityClasses() {
        // Buildings
        BUILDINGS.forEach(b => {
            const el = document.getElementById(`b-card-${b.id}`);
            if (el) {
                const cost = getBuildingCost(b, bulkBuyAmount);
                if (state.boxes >= cost) {
                    el.classList.remove('disabled');
                } else {
                    el.classList.add('disabled');
                }
            }
        });

        // Upgrades
        let affordableCount = 0;
        UPGRADES.forEach(u => {
            if (state.upgrades.includes(u.id)) return;
            const el = document.getElementById(`u-card-${u.id}`);
            if (el) {
                if (state.boxes >= u.cost) {
                    el.classList.remove('disabled');
                    affordableCount++;
                } else {
                    el.classList.add('disabled');
                }
            }
        });

        const badgeCountTag = document.getElementById('upgrades-available-count');
        if (badgeCountTag) {
            if (affordableCount > 0) {
                badgeCountTag.classList.remove('hidden');
                badgeCountTag.textContent = affordableCount;
            } else {
                badgeCountTag.classList.add('hidden');
            }
        }
    }

    function updateStatsModal() {
        const boxesCur = document.getElementById('st-boxes-current');
        const boxesTot = document.getElementById('st-boxes-total');
        const clicksTot = document.getElementById('st-total-clicks');
        const clickBoxes = document.getElementById('st-boxes-from-clicks');
        const bpsCur = document.getElementById('st-bps-current');
        const goldClicks = document.getElementById('st-golden-clicks');
        const bOwned = document.getElementById('st-buildings-owned');
        const uOwned = document.getElementById('st-upgrades-owned');
        const prestPts = document.getElementById('st-prestige-points');
        const buyoutsCnt = document.getElementById('st-buyouts-count');
        const buyoutMult = document.getElementById('st-buyout-mult');
        const timePlayed = document.getElementById('st-time-played');

        if (boxesCur) boxesCur.textContent = formatNumber(Math.floor(state.boxes));
        if (boxesTot) boxesTot.textContent = formatNumber(Math.floor(state.totalBoxes));
        if (clicksTot) clicksTot.textContent = formatNumber(state.totalClicks);
        if (clickBoxes) clickBoxes.textContent = formatNumber(Math.floor(state.boxesFromClicks));
        if (bpsCur) bpsCur.textContent = formatNumber(state.bps, 1);
        if (goldClicks) goldClicks.textContent = state.goldenClicks;
        if (bOwned) bOwned.textContent = getTotalBuildingsCount();
        if (uOwned) uOwned.textContent = `${state.upgrades.length} / ${UPGRADES.length}`;
        if (prestPts) prestPts.textContent = `${state.prestigePoints} Golden Tape (+${state.prestigePoints * 2}%)`;
        if (buyoutsCnt) buyoutsCnt.textContent = state.companyBuyouts || 0;
        if (buyoutMult) buyoutMult.textContent = `${(state.companyBuyoutMult || 1.0).toFixed(2)}x`;
        if (timePlayed) timePlayed.textContent = formatTime(state.timePlayed);
    }

    function renderShopBuildings() {
        const container = document.getElementById('buildings-list');
        if (!container) return;

        container.innerHTML = '';

        // Effective BPS multiplier per building type
        let bMult = 1;
        if (state.upgrades.includes('u5')) bMult *= 2;
        let globalBpsMult = 1;
        if (state.upgrades.includes('u2')) globalBpsMult *= 1.1;
        if (state.upgrades.includes('u7')) globalBpsMult *= 1.25;
        if (state.activeBuffs.frenzy > 0) globalBpsMult *= 7;
        globalBpsMult *= (1 + state.prestigePoints * 0.02);

        BUILDINGS.forEach(b => {
            const owned = state.buildings[b.id] || 0;
            const cost = getBuildingCost(b, bulkBuyAmount);
            const canAfford = state.boxes >= cost;
            const singleUnitBps = b.baseBps * bMult * globalBpsMult;

            const card = document.createElement('div');
            card.id = `b-card-${b.id}`;
            card.className = `building-card ${canAfford ? '' : 'disabled'}`;

            const iconMarkup = b.iconImg 
                ? `<img src="${b.iconImg}" class="shop-building-img" alt="${b.name}">`
                : b.icon;

            card.innerHTML = `
                <div class="item-left">
                    <div class="item-icon">${iconMarkup}</div>
                    <div class="item-info">
                        <div class="item-name">${b.name}</div>
                        <div class="item-bonus">+${formatNumber(singleUnitBps * bulkBuyAmount, 1)} BPS</div>
                        <div class="item-price">📦 ${formatNumber(cost)}</div>
                    </div>
                </div>
                <div class="item-count">${owned}</div>
            `;

            card.addEventListener('click', () => {
                const currentCost = getBuildingCost(b, bulkBuyAmount);
                if (state.boxes >= currentCost) {
                    state.boxes -= currentCost;
                    state.buildings[b.id] = (state.buildings[b.id] || 0) + bulkBuyAmount;
                    playBuySound();
                    renderShopBuildings(); // Refresh building costs and counts
                    renderBuildingDisplayRows(); // Refresh visual building tracks!
                    updateUI();
                    checkAchievements();
                }
            });

            container.appendChild(card);
        });

        renderBuildingDisplayRows();
    }

    // VISUAL BUILDING DISPLAY TRACK ROWS (COOKIE CLICKER STYLE)
    function renderBuildingDisplayRows() {
        const container = document.getElementById('building-display-rows');
        if (!container) return;

        const ownedBuildings = BUILDINGS.filter(b => (state.buildings[b.id] || 0) > 0);

        if (ownedBuildings.length === 0) {
            container.innerHTML = '<div class="empty-rows-msg">Buy buildings in the shop to see your packing machinery in action!</div>';
            return;
        }

        container.innerHTML = '';

        ownedBuildings.forEach(b => {
            const count = state.buildings[b.id] || 0;
            const row = document.createElement('div');
            row.className = 'building-track-row';

            const header = document.createElement('div');
            header.className = 'track-header';

            const iconMarkup = b.iconImg 
                ? `<img src="${b.iconImg}" class="track-header-img" alt="${b.name}">`
                : b.icon;

            header.innerHTML = `
                <div class="track-name-group">
                    <span>${iconMarkup}</span>
                    <span>${b.name}</span>
                </div>
                <span class="track-count-badge">x${count}</span>
            `;

            const iconsFlex = document.createElement('div');
            iconsFlex.className = 'track-icons-flex';

            const displayCount = Math.min(30, count);
            for (let i = 0; i < displayCount; i++) {
                if (b.iconImg) {
                    const img = document.createElement('img');
                    img.src = b.iconImg;
                    img.alt = b.name;
                    img.className = 'track-unit-img';
                    img.style.animationDelay = `${(i * 0.15) % 2}s`;
                    iconsFlex.appendChild(img);
                } else {
                    const div = document.createElement('div');
                    div.className = 'track-unit-icon';
                    div.textContent = b.icon;
                    div.style.animationDelay = `${(i * 0.15) % 2}s`;
                    iconsFlex.appendChild(div);
                }
            }

            row.appendChild(header);
            row.appendChild(iconsFlex);
            container.appendChild(row);
        });
    }

    function renderShopUpgrades() {
        const container = document.getElementById('upgrades-list');
        if (!container) return;

        container.innerHTML = '';

        UPGRADES.forEach(u => {
            if (state.upgrades.includes(u.id)) return; // Already purchased

            const canAfford = state.boxes >= u.cost;

            const card = document.createElement('div');
            card.id = `u-card-${u.id}`;
            card.className = `upgrade-card ${canAfford ? '' : 'disabled'}`;

            card.innerHTML = `
                <div class="item-left">
                    <div class="item-icon">${u.icon}</div>
                    <div class="item-info">
                        <div class="item-name">${u.name}</div>
                        <div class="item-price">📦 ${formatNumber(u.cost)}</div>
                    </div>
                </div>
                <div class="upgrade-desc">${u.desc}</div>
            `;

            card.addEventListener('click', () => {
                if (state.boxes >= u.cost) {
                    state.boxes -= u.cost;
                    state.upgrades.push(u.id);
                    playBuySound();
                    showToast('⚡ UPGRADE UNLOCKED!', u.name);
                    renderShopBuildings(); // Refresh building bonuses on upgrade buy
                    renderShopUpgrades();  // Remove bought upgrade card
                    updateUI();
                    checkAchievements();
                }
            });

            container.appendChild(card);
        });

        updateAffordabilityClasses();
    }

    // --- ACHIEVEMENTS SYSTEM ---
    function checkAchievements() {
        ACHIEVEMENTS.forEach(a => {
            if (!state.achievements.includes(a.id) && a.check(state)) {
                state.achievements.push(a.id);
                playAchievementSound();
                showToast(`🏆 UNLOCKED: ${a.title}`, a.desc);
                renderAchievementsModal();
                updateRecentBadgesPreview();
            }
        });

        document.getElementById('badge-count-tag').textContent = `${state.achievements.length}/${ACHIEVEMENTS.length}`;
        document.getElementById('achievements-ratio').textContent = `${state.achievements.length}/${ACHIEVEMENTS.length}`;
    }

    function renderAchievementsModal() {
        const grid = document.getElementById('achievements-full-grid');
        if (!grid) return;

        grid.innerHTML = '';

        ACHIEVEMENTS.forEach(a => {
            const isUnlocked = state.achievements.includes(a.id);
            const card = document.createElement('div');
            card.className = `achieve-card ${isUnlocked ? 'unlocked' : ''}`;

            card.innerHTML = `
                <div class="achieve-icon">${a.icon}</div>
                <div>
                    <div class="achieve-title">${a.title}</div>
                    <div class="achieve-desc">${a.desc}</div>
                </div>
            `;

            grid.appendChild(card);
        });
    }

    function updateRecentBadgesPreview() {
        const container = document.getElementById('recent-badges-list');
        if (!container) return;

        container.innerHTML = '';

        const unlockedList = ACHIEVEMENTS.filter(a => state.achievements.includes(a.id)).slice(-3);

        if (unlockedList.length === 0) {
            container.innerHTML = '<div class="empty-badges-msg">No badges unlocked yet. Start clicking!</div>';
            return;
        }

        unlockedList.forEach(a => {
            const b = document.createElement('div');
            b.className = 'badge-item';
            b.innerHTML = `<span class="badge-icon">${a.icon}</span> <span>${a.title}</span>`;
            container.appendChild(b);
        });
    }

    // --- NEWS TICKER ENGINE ---
    function startHeadlineTicker() {
        let index = 0;
        const ticker = document.getElementById('news-ticker');
        if (!ticker) return;

        setInterval(() => {
            index = (index + 1) % NEWS_HEADLINES.length;
            ticker.style.opacity = 0;
            setTimeout(() => {
                ticker.textContent = NEWS_HEADLINES[index];
                ticker.style.opacity = 1;
            }, 300);
        }, 10000);
    }

    // --- TOAST NOTIFICATIONS ---
    function showToast(title, desc) {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = `
            <div class="toast-icon">✨</div>
            <div>
                <div class="toast-title">${title}</div>
                <div class="toast-desc">${desc}</div>
            </div>
        `;

        container.appendChild(toast);

        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 4000);
    }

    // --- EVENT LISTENERS & MODALS ---
    function initEventListeners() {
        // Big Box Click & Keyboard Accessibility
        const bigBox = document.getElementById('big-box-wrapper');
        if (bigBox) {
            bigBox.addEventListener('click', onBigBoxClick);
            bigBox.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onBigBoxClick(e);
                }
            });
        }

        // Special Customer Popup Click Handler
        const customerPopup = document.getElementById('customer-popup');
        const modalCustomer = document.getElementById('modal-customer');
        if (customerPopup && modalCustomer) {
            customerPopup.addEventListener('click', () => {
                modalCustomer.classList.remove('hidden');
                renderCustomerUpgrades();
            });
        }

        // Corporate Buyout Popup Click Handler
        const buyoutPopup = document.getElementById('buyout-popup');
        const modalBuyout = document.getElementById('modal-buyout');
        if (buyoutPopup && modalBuyout) {
            buyoutPopup.addEventListener('click', () => {
                const rewardMultEl = document.getElementById('buyout-reward-mult');
                const currentMult = state.companyBuyoutMult || 1.0;
                const nextMult = (currentMult * 1.2).toFixed(2);
                if (rewardMultEl) {
                    rewardMultEl.textContent = `+1.2x Boost (Total: ${nextMult}x)`;
                }
                modalBuyout.classList.remove('hidden');
            });
        }

        // Accept Buyout Action
        const btnAcceptBuyout = document.getElementById('btn-accept-buyout');
        if (btnAcceptBuyout) {
            btnAcceptBuyout.addEventListener('click', () => {
                state.companyBuyouts = (state.companyBuyouts || 0) + 1;
                state.companyBuyoutMult = (state.companyBuyoutMult || 1.0) * 1.2;
                state.boxes = 200; // 200 boxes headstart!
                state.totalBoxes += 200;
                state.buildings = {};
                state.upgrades = [];
                state.companyBuyoutActive = false;

                playAchievementSound();
                showToast('💼 COMPANY SOLD!', `Accepted corporate buyout! Reset empire with 200 Boxes headstart & +1.2x permanent multiplier (${state.companyBuyoutMult.toFixed(2)}x total)!`);

                if (modalBuyout) modalBuyout.classList.add('hidden');
                if (buyoutPopup) buyoutPopup.classList.add('hidden');

                renderShopBuildings();
                renderShopUpgrades();
                renderCustomerUpgrades();
                updateUI();
                saveGame();
            });
        }

        // Decline Buyout Action
        const btnDeclineBuyout = document.getElementById('btn-decline-buyout');
        if (btnDeclineBuyout) {
            btnDeclineBuyout.addEventListener('click', () => {
                if (modalBuyout) modalBuyout.classList.add('hidden');
                showToast('💼 OFFER DECLINED', 'You kept your cardboard empire!');
            });
        }

        // Custom Rename Box Modal UI Handler
        const nameEl = document.getElementById('box-name');
        const modalRename = document.getElementById('modal-rename');
        const renameInput = document.getElementById('rename-box-input');
        const btnSaveName = document.getElementById('btn-save-box-name');

        function openRenameModal() {
            if (modalRename && renameInput) {
                renameInput.value = state.boxName;
                modalRename.classList.remove('hidden');
                setTimeout(() => renameInput.focus(), 100);
            }
        }

        function saveBoxName() {
            if (renameInput) {
                const newName = renameInput.value.trim();
                if (newName.length > 0) {
                    state.boxName = newName;
                    if (nameEl) nameEl.textContent = state.boxName;
                    saveGame();

                    // SECRET EASTER EGG: Renaming to "strongbox" forces the Special Customer to appear!
                    if (newName.toLowerCase() === 'strongbox') {
                        spawnCustomer();
                        showToast('🐸 SECRET UNLOCKED!', 'The Special Customer was summoned by the secret name "strongbox"!');
                    } else {
                        showToast('✨ BOX RENAMED!', `Character is now named "${state.boxName}"!`);
                    }

                    if (modalRename) modalRename.classList.add('hidden');
                }
            }
        }

        if (nameEl) {
            nameEl.addEventListener('click', openRenameModal);
        }

        if (btnSaveName) {
            btnSaveName.addEventListener('click', saveBoxName);
        }

        if (renameInput) {
            renameInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    saveBoxName();
                }
            });
        }

        // Name Suggestion Buttons
        const suggestionBtns = document.querySelectorAll('.suggestion-tag');
        suggestionBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                if (renameInput && btn.dataset.name) {
                    renameInput.value = btn.dataset.name;
                    renameInput.focus();
                }
            });
        });

        // Sound Toggle
        const btnSound = document.getElementById('btn-sound');
        const soundIcon = document.getElementById('sound-icon');
        if (btnSound) {
            btnSound.addEventListener('click', () => {
                state.soundMuted = !state.soundMuted;
                soundIcon.textContent = state.soundMuted ? '🔇' : '🔊';
            });
        }

        // Music Toggle
        const btnMusic = document.getElementById('btn-music');
        const musicIcon = document.getElementById('music-icon');
        if (btnMusic) {
            btnMusic.addEventListener('click', () => {
                resumeAudioCtx();
                state.musicMuted = !state.musicMuted;
                if (musicIcon) musicIcon.textContent = state.musicMuted ? '🔇' : '🎵';
                btnMusic.classList.toggle('muted', state.musicMuted);
                saveGame();
            });
        }

        // Shop Tabs (Buildings, Upgrades, Skins & FX)
        const tabBuildings = document.getElementById('tab-buildings');
        const tabUpgrades = document.getElementById('tab-upgrades');
        const tabSkins = document.getElementById('tab-skins');
        const panelBuildings = document.getElementById('shop-buildings-panel');
        const panelUpgrades = document.getElementById('shop-upgrades-panel');
        const panelSkins = document.getElementById('shop-skins-panel');

        if (tabBuildings && tabUpgrades && tabSkins) {
            tabBuildings.addEventListener('click', () => {
                tabBuildings.classList.add('active');
                tabUpgrades.classList.remove('active');
                tabSkins.classList.remove('active');
                panelBuildings.classList.add('active');
                panelUpgrades.classList.remove('active');
                panelSkins.classList.remove('active');
            });
            tabUpgrades.addEventListener('click', () => {
                tabUpgrades.classList.add('active');
                tabBuildings.classList.remove('active');
                tabSkins.classList.remove('active');
                panelUpgrades.classList.add('active');
                panelBuildings.classList.remove('active');
                panelSkins.classList.remove('active');
                renderShopUpgrades();
            });
            tabSkins.addEventListener('click', () => {
                tabSkins.classList.add('active');
                tabBuildings.classList.remove('active');
                tabUpgrades.classList.remove('active');
                panelSkins.classList.add('active');
                panelBuildings.classList.remove('active');
                panelUpgrades.classList.remove('active');
                renderSkinsAndFx();
            });
        }

        // Bulk Buy Buttons
        const bulkBtns = document.querySelectorAll('.bulk-btn');
        bulkBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                bulkBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                bulkBuyAmount = parseInt(btn.dataset.amount, 10) || 1;
                renderShopBuildings();
            });
        });

        // Modals Open/Close
        setupModal('btn-stats', 'modal-stats');
        setupModal('btn-achievements', 'modal-achievements', () => renderAchievementsModal());
        setupModal('btn-save', 'modal-save', () => prepareSaveModal());

        // Universal Close Listeners for ALL Modals (Close button 'x', Backdrop click, Escape key)
        document.querySelectorAll('.modal-backdrop').forEach(modal => {
            const closeBtns = modal.querySelectorAll('.modal-close');
            closeBtns.forEach(cb => {
                cb.addEventListener('click', () => modal.classList.add('hidden'));
            });
            modal.addEventListener('click', (e) => {
                if (e.target === modal) modal.classList.add('hidden');
            });
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeAllModals();
            }
        });

        // Ascension / Prestige Action (Fixed Exploit!)
        const btnDoPrestige = document.getElementById('btn-do-prestige');
        if (btnDoPrestige) {
            btnDoPrestige.addEventListener('click', () => {
                const pendingPrestige = getPendingPrestigePoints();
                if (pendingPrestige > 0 && confirm(`Ascend your empire now? You will reset your current boxes and buildings, but gain +${pendingPrestige} Golden Packing Tape (+${pendingPrestige * 2}% permanent boost)!`)) {
                    state.prestigePoints += pendingPrestige;
                    state.boxes = 0;
                    state.buildings = {};
                    state.upgrades = [];
                    playAchievementSound();
                    showToast('✨ ASCENSION COMPLETE!', `Gained +${pendingPrestige} Golden Tape!`);
                    renderShopBuildings();
                    renderShopUpgrades();
                    saveGame();
                    updateUI();
                    checkAchievements();
                }
            });
        }

        // Save Modal Actions
        const btnManualSave = document.getElementById('btn-manual-save');
        if (btnManualSave) {
            btnManualSave.addEventListener('click', () => {
                saveGame();
                showToast('💾 GAME SAVED', 'Progress saved to local browser storage.');
            });
        }

        const btnExport = document.getElementById('btn-export-code');
        if (btnExport) {
            btnExport.addEventListener('click', () => {
                const box = document.getElementById('save-code-box');
                box.select();
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(box.value).then(() => {
                        showToast('📋 COPIED!', 'Save code copied to clipboard.');
                    }).catch(() => {
                        showToast('📋 CODE SELECTED', 'Press Ctrl+C to copy your save code.');
                    });
                } else {
                    showToast('📋 CODE SELECTED', 'Press Ctrl+C to copy your save code.');
                }
            });
        }

        const btnImport = document.getElementById('btn-import-code');
        if (btnImport) {
            btnImport.addEventListener('click', () => {
                const code = document.getElementById('save-code-box').value.trim();
                if (code && importSaveCode(code)) {
                    showToast('📥 SUCCESS!', 'Save data imported successfully!');
                    closeAllModals();
                    renderShopBuildings();
                    renderShopUpgrades();
                    updateUI();
                } else {
                    alert('Invalid save code!');
                }
            });
        }

        const btnReset = document.getElementById('btn-reset-game');
        if (btnReset) {
            btnReset.addEventListener('click', () => {
                if (confirm('Are you sure you want to hard reset your entire cardboard empire? All progress will be lost forever!')) {
                    localStorage.removeItem('box_clicker_save_v1');
                    location.reload();
                }
            });
        }

        // Offline Modal Claim
        const btnClaimOffline = document.getElementById('btn-claim-offline');
        if (btnClaimOffline) {
            btnClaimOffline.addEventListener('click', () => {
                document.getElementById('modal-offline').classList.add('hidden');
            });
        }
    }

    function setupModal(btnId, modalId, onOpenCallback) {
        const btn = document.getElementById(btnId);
        const modal = document.getElementById(modalId);
        if (!btn || !modal) return;

        btn.addEventListener('click', () => {
            modal.classList.remove('hidden');
            if (onOpenCallback) onOpenCallback();
        });

        const closeBtns = modal.querySelectorAll('.modal-close');
        closeBtns.forEach(cb => {
            cb.addEventListener('click', () => modal.classList.add('hidden'));
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.classList.add('hidden');
        });
    }

    function closeAllModals() {
        document.querySelectorAll('.modal-backdrop').forEach(m => m.classList.add('hidden'));
    }

    function updateStatsModal() {
        document.getElementById('st-boxes-current').textContent = formatNumber(Math.floor(state.boxes));
        document.getElementById('st-boxes-total').textContent = formatNumber(Math.floor(state.totalBoxes));
        document.getElementById('st-total-clicks').textContent = formatNumber(state.totalClicks);
        document.getElementById('st-boxes-from-clicks').textContent = formatNumber(Math.floor(state.boxesFromClicks));
        document.getElementById('st-bps-current').textContent = formatNumber(state.bps, 1);
        document.getElementById('st-golden-clicks').textContent = state.goldenClicks;
        document.getElementById('st-buildings-owned').textContent = getTotalBuildingsCount();
        document.getElementById('st-upgrades-owned').textContent = state.upgrades.length;
        document.getElementById('st-prestige-points').textContent = state.prestigePoints;
        document.getElementById('st-time-played').textContent = formatTime(state.timePlayed);
    }

    function prepareSaveModal() {
        const box = document.getElementById('save-code-box');
        if (box) {
            box.value = btoa(JSON.stringify(state));
        }
    }

    // --- SAVE & LOAD & OFFLINE EARNINGS ---
    function saveGame() {
        state.lastTimestamp = Date.now();
        localStorage.setItem('box_clicker_save_v1', JSON.stringify(state));
    }

    function loadGame() {
        const raw = localStorage.getItem('box_clicker_save_v1');
        if (!raw) return;

        try {
            const parsed = JSON.parse(raw);
            state = { ...state, ...parsed };

            // Sync Box Name & Sound / Music UI
            const nameEl = document.getElementById('box-name');
            if (nameEl) nameEl.textContent = state.boxName;

            const soundIcon = document.getElementById('sound-icon');
            if (soundIcon) soundIcon.textContent = state.soundMuted ? '🔇' : '🔊';

            const musicIcon = document.getElementById('music-icon');
            const btnMusic = document.getElementById('btn-music');
            if (musicIcon) musicIcon.textContent = state.musicMuted ? '🔇' : '🎵';
            if (btnMusic) btnMusic.classList.toggle('muted', state.musicMuted);

            // Offline Earnings
            const now = Date.now();
            const elapsedSeconds = (now - (state.lastTimestamp || now)) / 1000;
            if (elapsedSeconds > 10) {
                const currentBps = getBps();
                const offlineBoxes = Math.floor(currentBps * elapsedSeconds * 0.5); // 50% offline efficiency
                if (offlineBoxes > 0) {
                    addBoxes(offlineBoxes);
                    showOfflineModal(elapsedSeconds, offlineBoxes);
                }
            }
        } catch (e) {
            console.error('Failed to load save', e);
        }

        if (!state.equippedSkin) state.equippedSkin = 'default';
        if (!state.rgbSettings) state.rgbSettings = { sunburst: true, aura: true, falling: true };

        updateBoxSkin();
        updateRecentBadgesPreview();

        // Restore active saved Special Customer if player did not buy anything yet
        if (state.customerActive && !state.customerPurchasedThisVisit) {
            spawnCustomer();
        }
    }

    function showOfflineModal(seconds, earnedBoxes) {
        const modal = document.getElementById('modal-offline');
        if (!modal) return;

        document.getElementById('offline-time-str').textContent = formatTime(seconds);
        document.getElementById('offline-earned-boxes').textContent = `+${formatNumber(earnedBoxes)} Boxes`;
        modal.classList.remove('hidden');
    }

    function importSaveCode(str) {
        try {
            const parsed = JSON.parse(atob(str));
            if (parsed && typeof parsed.boxes === 'number') {
                state = { ...state, ...parsed };

                const nameEl = document.getElementById('box-name');
                if (nameEl) nameEl.textContent = state.boxName;

                const soundIcon = document.getElementById('sound-icon');
                if (soundIcon) soundIcon.textContent = state.soundMuted ? '🔇' : '🔊';

                const musicIcon = document.getElementById('music-icon');
                const btnMusic = document.getElementById('btn-music');
                if (musicIcon) musicIcon.textContent = state.musicMuted ? '🔇' : '🎵';
                if (btnMusic) btnMusic.classList.toggle('muted', state.musicMuted);

                saveGame();
                return true;
            }
        } catch (e) {}
        return false;
    }

    // --- UTILITY HELPERS ---
    function formatNumber(num, decimals = 0) {
        if (num === null || num === undefined || isNaN(num)) return '0';
        if (num < 1000) return num.toFixed(decimals);

        const suffixes = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc'];
        const i = Math.floor(Math.log10(num) / 3);
        if (i >= suffixes.length) return num.toExponential(2);

        const formatted = (num / Math.pow(10, i * 3)).toFixed(2);
        return `${formatted} ${suffixes[i]}`;
    }

    function formatTime(seconds) {
        const s = Math.floor(seconds);
        const hrs = Math.floor(s / 3600);
        const mins = Math.floor((s % 3600) / 60);
        const secs = s % 60;

        if (hrs > 0) return `${hrs}h ${mins}m ${secs}s`;
        if (mins > 0) return `${mins}m ${secs}s`;
        return `${secs}s`;
    }

    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

})();
