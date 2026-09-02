/**
 * OmniVerse Hub — All-in-One Project Suite Engine & Cyber Shop
 */

// --- 1. INTEGRATED PROJECT REGISTRY ---
const PROJECTS = [
  {
    id: 'cyber-pac',
    title: 'Cyber Pac',
    icon: '🟡',
    path: '../cyber-pac/index.html',
    category: 'Arcade & Action',
    badge: 'Neon Maze',
    description: 'Retro-futuristic Pac-Man with Turbo Dash, 4 smart AI ghost personalities, and Glitch Mode energizer combos.',
    tags: ['pacman', 'maze', 'ghosts', 'retro', 'arcade'],
    featured: true
  },
  {
    id: 'cyber-kong',
    title: 'Mecha Kong',
    icon: '🦍',
    path: '../cyber-kong/index.html',
    category: 'Arcade & Action',
    badge: 'Girder Rampage',
    description: 'Donkey Kong platformer with sloped steel girders, ladders, rolling plasma barrels, and the Golden Smash Hammer.',
    tags: ['donkeykong', 'platformer', 'barrels', 'hammer', 'arcade'],
    featured: true
  },
  {
    id: 'cyber-hopper',
    title: 'Cyber Hopper',
    icon: '🐸',
    path: '../cyber-hopper/index.html',
    category: 'Arcade & Action',
    badge: 'Neon Crossroad',
    description: 'Cyber Frogger arcade legend! Dodge speeding hovercars on the highway and ride magnetic solar logs across the plasma river.',
    tags: ['frogger', 'hopper', 'highway', 'river', 'arcade'],
    featured: true
  },
  {
    id: 'space-invaders-game',
    title: 'Cyber Invaders',
    icon: '👾',
    path: '../space-invaders-game/index.html',
    category: 'Arcade & Action',
    badge: 'Synthwave Shooter',
    description: 'Retro-futuristic space shooter with procedural waves, synth audio, boss fights, and particle explosions.',
    tags: ['arcade', 'space', 'shooter', 'synthwave', 'action'],
    featured: true
  },
  {
    id: 'cyber-pinball',
    title: 'Cyber Pinball',
    icon: '⚡',
    path: '../cyber-pinball/index.html',
    category: 'Arcade & Action',
    badge: 'Neon Tilt Matrix',
    description: 'Retro-arcade cyberpunk pinball! Multi-ball frenzy, bouncy bumpers, drop targets, sloped physics & 135 BPM synth music.',
    tags: ['pinball', 'arcade', 'tilt', 'physics', 'retro', 'frenzy'],
    featured: true
  },
  {
    id: 'neon-asteroids',
    title: 'Neon Asteroids',
    icon: '☄️',
    path: '../neon-asteroids/index.html',
    category: 'Arcade & Action',
    badge: 'Vector Drift',
    description: 'Vector-space arcade shooter! Rotate, thrust, blast splitting quantum asteroids, dodge alien UFO saucers & hyperspace jump.',
    tags: ['asteroids', 'arcade', 'vector', 'space', 'shooter', 'ufo'],
    featured: true
  },
  {
    id: 'cyber-galaga',
    title: 'Cyber Galaga',
    icon: '🚀',
    path: '../cyber-galaga/index.html',
    category: 'Arcade & Action',
    badge: 'Star Fighter',
    description: 'Legendary Galaga space fleet shooter! Twin plasma lasers, swooping alien dive-bombers, tractor beam boss capture & dual starfighters.',
    tags: ['galaga', 'arcade', 'space', 'shooter', 'aliens', 'retro'],
    featured: true
  },
  {
    id: 'cyber-runner',
    title: 'Cyber Runner',
    icon: '🏎️',
    path: '../cyber-runner/index.html',
    category: 'Arcade & Action',
    badge: 'Endless Highway',
    description: 'Synthwave endless hoverbike runner! Shift lanes, jump plasma hazards, collect energy orbs & blast nitro.',
    tags: ['runner', 'synthwave', 'highway', 'speed', 'action'],
    featured: true
  },
  {
    id: 'neon-pong',
    title: 'Neon Pong Breakout',
    icon: '🏓',
    path: '../neon-pong/index.html',
    category: 'Arcade & Action',
    badge: 'Hyper Breakout',
    description: 'Hyper-arcade brick breaker with multi-ball frenzies, laser cannons, magnetic shields, and neon particle bursts.',
    tags: ['pong', 'breakout', 'brick', 'lasers', 'multiball'],
    featured: true
  },
  {
    id: 'viper-drift',
    title: 'Viper Drift',
    icon: '🐍',
    path: '../viper-drift/index.html',
    category: 'Arcade & Action',
    badge: 'Cyber Arena',
    description: 'Cyberpunk laser snake arena game! Drift through glowing grid trails, collect data cores & use nitro boosts.',
    tags: ['snake', 'cyber', 'arena', 'drift', 'nitro'],
    featured: false
  },
  {
    id: 'pixel-defense',
    title: 'Pixel Defense',
    icon: '🚀',
    path: '../pixel-defense/index.html',
    category: 'Arcade & Action',
    badge: 'Missile Command',
    description: 'Protect a glowing cyber city grid from falling EMP meteors and kamikaze drones using plasma turrets & orbital nukes.',
    tags: ['missile', 'defense', 'turret', 'city', 'nuke'],
    featured: false
  },
  {
    id: 'cyber-centipede',
    title: 'Cyber Centipede',
    icon: '🐛',
    path: '../cyber-centipede/index.html',
    category: 'Arcade & Action',
    badge: 'Neon Swarm',
    description: 'Classic 80s arcade shooter! Blast the winding plasma centipede swarm, dodge jumping cyber-spiders & clear neon mushrooms.',
    tags: ['centipede', 'retro', 'shooter', 'arcade', 'swarm'],
    featured: true
  },
  {
    id: 'gamblr',
    title: 'Gamblr Demo',
    icon: '🎲',
    path: '../gamblr/index.html',
    category: 'Decision',
    badge: 'Decision Suite',
    description: 'Decision gaming suite featuring 3 core games: 3D Coin Flip 🪙, 777 Machine Slots 🎰, and Cyber Cards 🃏.',
    tags: ['casino', 'decision', 'coinflip', 'slots', 'cards'],
    featured: false
  },
  {
    id: 'box-clicker',
    title: 'Box Clicker',
    icon: '📦',
    path: '../box-clicker/index.html',
    category: 'Simulation & Idle',
    badge: 'Empire Clicker',
    description: 'Click the buff box, unlock automated packaging production lines, trigger Golden Box Frenzies & build an empire.',
    tags: ['clicker', 'idle', 'upgrades', 'box', 'empire'],
    featured: false
  },
  {
    id: 'gabys-playplace',
    title: 'Gaby\'s PlayPlace',
    icon: '👻',
    path: '../gabys-playplace/index.html',
    category: 'Horror & Story',
    badge: 'CRT Retro Horror',
    description: 'Retro CRT horror story game featuring flashlight mechanics, soul orbs, branching paths, and creepy synth audio.',
    tags: ['horror', 'crt', 'story', 'retro', 'mystery'],
    featured: false
  },
  {
    id: 'arspin',
    title: 'ARSpin Wheel',
    icon: '🎯',
    path: '../arspin/index.html',
    category: 'Decision',
    badge: 'Interactive Wheel',
    description: 'Custom spin-wheel with avatar reaction animations, sound FX, confetti, and custom prize customizer.',
    tags: ['wheel', 'spinner', 'decision', 'avatar', 'prizes'],
    featured: false
  },
  {
    id: 'night-shift',
    title: 'Night Shift: Anomaly Breach',
    icon: '👁️',
    path: '../night-shift/index.html',
    category: 'Horror & Story',
    badge: 'Surveillance Horror',
    description: 'CCTV surveillance horror! Monitor 6 security feeds, spot anomaly entity breaches, strobe overload & survive until 6 AM.',
    tags: ['horror', 'cctv', 'fnaf', 'anomaly', 'creepy'],
    featured: true
  },
  {
    id: 'quantum-idle',
    title: 'Quantum Core: Singularity',
    icon: '⚛️',
    path: '../quantum-idle/index.html',
    category: 'Simulation & Idle',
    badge: 'Singularity Clicker',
    description: 'Sci-fi idle incremental tycoon! Harvest qubits from the black hole singularity, build Dyson rings & trigger Big Bang prestige.',
    tags: ['idle', 'clicker', 'scifi', 'quantum', 'space'],
    featured: true
  },
  {
    id: 'cyber-diner',
    title: 'Cyber Diner: Neon Tycoon',
    icon: '🍜',
    path: '../cyber-diner/index.html',
    category: 'Simulation & Idle',
    badge: 'Neon Food Tycoon',
    description: 'Futuristic street food restaurant tycoon! Cook cyber ramen, plasma burgers & laser sushi, hire AI robot chefs & trigger VIP frenzies.',
    tags: ['idle', 'tycoon', 'restaurant', 'food', 'simulation'],
    featured: true
  },
  {
    id: 'cyber-2048',
    title: 'Cyber 2048: Fusion',
    icon: '⚛️',
    path: '../cyber-2048/index.html',
    category: 'Puzzle & Strategy',
    badge: 'Quantum Fusion',
    description: 'Slide, combine and synthesize cybernetic cores into the legendary 2048 Quantum Singularity with undo protocol.',
    tags: ['puzzle', '2048', 'math', 'strategy', 'quantum'],
    featured: true
  },
  {
    id: 'neon-lights',
    title: 'Neon Lights Out',
    icon: '⚡',
    path: '../neon-lights/index.html',
    category: 'Puzzle & Strategy',
    badge: 'Grid Breaker',
    description: 'Deactivate the glowing quantum nodes across 3x3, 4x4, and 5x5 matrices. Every flip triggers adjacent power lines.',
    tags: ['puzzle', 'lightsout', 'logic', 'cyberpunk', 'brain'],
    featured: true
  },
  {
    id: 'cyber-match3',
    title: 'Cyber Match 3',
    icon: '💎',
    path: '../cyber-match3/index.html',
    category: 'Puzzle & Strategy',
    badge: 'Gem Core Protocol',
    description: 'Match 3 or more cascading quantum crystals! Trigger explosive combo chains, energy cascades & multiplier frenzies.',
    tags: ['puzzle', 'match3', 'gems', 'cascade', 'combo'],
    featured: true
  },
  {
    id: 'cyber-crash',
    title: 'Cyber Crash',
    icon: '🚀',
    path: '../cyber-crash/index.html',
    category: 'Decision',
    badge: 'Moonshot Protocol',
    description: 'High-octane decision multiplier game! Watch the rocket surge into hyper-space and eject to claim profits before it crashes.',
    tags: ['crash', 'decision', 'rocket', 'multiplier', 'gamble'],
    featured: true
  },
  {
    id: 'neon-backrooms',
    title: 'Neon Backrooms: Entity 404',
    icon: '👁️‍🗨️',
    path: '../neon-backrooms/index.html',
    category: 'Horror & Story',
    badge: '3D Raycaster Horror',
    description: 'First-person 3D Backrooms horror! Collect 5 quantum keycards in the neon labyrinth, manage flashlight battery & evade Entity 404.',
    tags: ['horror', '3d', 'raycasting', 'backrooms', 'entity', 'survival'],
    featured: true
  },
  {
    id: 'neon-timber',
    title: 'Neon Timber',
    icon: '🪓',
    path: '../neon-timber/index.html',
    category: 'Arcade & Action',
    badge: 'Cyber Chop',
    description: 'High-speed reflex tree chopping! Chop left and right to avoid descending plasma branches before timer runs out.',
    tags: ['arcade', 'reflex', 'timber', 'chop', 'action'],
    featured: true
  },
  {
    id: 'cyber-flappy',
    title: 'Cyber Flappy',
    icon: '🛸',
    path: '../cyber-flappy/index.html',
    category: 'Arcade & Action',
    badge: 'Gravity Drone',
    description: 'Pulse your gravity thrusters to navigate a neon drone through oscillating laser barrier gates.',
    tags: ['arcade', 'flappy', 'drone', 'gravity', 'action'],
    featured: true
  },
  {
    id: 'cyber-tetris',
    title: 'Cyber Tetris',
    icon: '🧱',
    path: '../cyber-tetris/index.html',
    category: 'Puzzle & Strategy',
    badge: 'Quantum Matrix',
    description: 'Classic falling block matrix with ghost projection, hold piece, hard drops & line-clear particle fireworks.',
    tags: ['puzzle', 'tetris', 'blocks', 'matrix', 'strategy'],
    featured: true
  },
  {
    id: 'cyber-sweeper',
    title: 'Cyber Sweeper',
    icon: '💣',
    path: '../cyber-sweeper/index.html',
    category: 'Puzzle & Strategy',
    badge: 'Quantum Defuser',
    description: 'Modernized cyber grid logic puzzle! Defuse quantum EMP mines across Easy, Medium, and Hard matrices.',
    tags: ['puzzle', 'minesweeper', 'logic', 'defuser', 'grid'],
    featured: true
  },
  {
    id: 'cyber-rhythm',
    title: 'Cyber Rhythm',
    icon: '🎵',
    path: '../cyber-rhythm/index.html',
    category: 'Arcade & Action',
    badge: 'Beat Matrix',
    description: 'High-octane 4-lane rhythm music matrix! Tap D, F, J, K to falling neon EDM beat notes, build fever combos & score perfects.',
    tags: ['arcade', 'rhythm', 'music', 'beat', 'edm', 'action'],
    featured: true
  },
  {
    id: 'cyber-miner',
    title: 'Cyber Miner',
    icon: '⛏️',
    path: '../cyber-miner/index.html',
    category: 'Simulation & Idle',
    badge: 'Dig Tycoon',
    description: 'Drill deep into subterranean cyber-crust! Upgrade plasma drill bits, deploy autonomous mining drones & strike antimatter.',
    tags: ['idle', 'miner', 'clicker', 'tycoon', 'simulation'],
    featured: true
  },
  {
    id: 'cyber-wordle',
    title: 'Cyber Wordle',
    icon: '🔮',
    path: '../cyber-wordle/index.html',
    category: 'Puzzle & Strategy',
    badge: 'Terminal Decryptor',
    description: '5-letter cyberpunk terminal decryption puzzle! 6 attempts to crack the AI mainframe firewall passkey.',
    tags: ['puzzle', 'wordle', 'words', 'terminal', 'logic'],
    featured: true
  },
  {
    id: 'cyber-archery',
    title: 'Cyber Archery',
    icon: '🎯',
    path: '../cyber-archery/index.html',
    category: 'Arcade & Action',
    badge: 'Target Master',
    description: 'Physics bow & arrow shooter! Calculate trajectory and wind to hit moving holographic targets & score bullseyes.',
    tags: ['arcade', 'archery', 'bow', 'physics', 'target'],
    featured: true
  },
  {
    id: 'cyber-knife',
    title: 'Cyber Knife',
    icon: '🗡️',
    path: '../cyber-knife/index.html',
    category: 'Arcade & Action',
    badge: 'Kunai Hit',
    description: 'Throw plasma kunai into a rotating cyber core without hitting existing blades across dynamic boss stages.',
    tags: ['arcade', 'knife', 'kunai', 'ninja', 'reflex'],
    featured: true
  },
  {
    id: 'cyber-mines',
    title: 'Cyber Mines',
    icon: '💣',
    path: '../cyber-mines/index.html',
    category: 'Decision',
    badge: 'Grid Gamble',
    description: 'High-stakes 5x5 grid gamble! Uncover glowing quantum gems to exponentially boost your multiplier, and cash out before hitting EMP mines.',
    tags: ['decision', 'mines', 'gamble', 'multiplier', 'cashout'],
    featured: true
  },
  {
    id: 'cyber-roulette',
    title: 'Neon Roulette',
    icon: '🔴',
    path: '../cyber-roulette/index.html',
    category: 'Decision',
    badge: 'Quantum Wheel',
    description: 'Neon cyberpunk roulette table! Place bets on numbers 0-12, Red/Black, Even/Odd, and High/Low with decelerating ball physics.',
    tags: ['decision', 'roulette', 'wheel', 'casino', 'luck'],
    featured: true
  },
  {
    id: 'cyber-blackjack',
    title: 'Cyber 21',
    icon: '🃏',
    path: '../cyber-blackjack/index.html',
    category: 'Decision',
    badge: 'Neural 21',
    description: 'Cyberpunk Blackjack vs AI mainframe dealer! Hit, Stand, Double Down, and ride win streaks with natural 3:2 payouts.',
    tags: ['decision', 'blackjack', 'cards', 'casino', 'dealer'],
    featured: true
  },
  {
    id: 'cyber-factory',
    title: 'Cyber Factory',
    icon: '🏭',
    path: '../cyber-factory/index.html',
    category: 'Simulation & Idle',
    badge: 'Mecha Assembly',
    description: 'Autonomous robotics assembly line tycoon! Produce Micro-Chips, Servos, Chassis, and Titan Mechas with Overclock mode.',
    tags: ['idle', 'factory', 'tycoon', 'mecha', 'simulation'],
    featured: true
  },
  {
    id: 'cyber-evolution',
    title: 'Cyber Evolution',
    icon: '🧬',
    path: '../cyber-evolution/index.html',
    category: 'Simulation & Idle',
    badge: 'Gene Clicker',
    description: 'Synthesize cyber-organisms from Proto-Cells to Bioluminescent Algae, Nanite Swarms, and Quantum Singularity Beings.',
    tags: ['idle', 'evolution', 'dna', 'biolab', 'clicker'],
    featured: true
  },
  {
    id: 'analog-horror',
    title: 'Signal Lost',
    icon: '📺',
    path: '../analog-horror/index.html',
    category: 'Horror & Story',
    badge: 'VHS Terror',
    description: 'Analog CRT television survival horror! Tune frequencies to decrypt 5 emergency broadcast tapes while managing sanity & glitches.',
    tags: ['horror', 'vhs', 'analog', 'tapes', 'survival'],
    featured: true
  },
  {
    id: 'dark-corridors',
    title: 'Shadow Lurker',
    icon: '🔦',
    path: '../dark-corridors/index.html',
    category: 'Horror & Story',
    badge: 'Deep Bunker',
    description: '2D top-down flashlight survival horror! Scavenge 4 security keycards in a pitch-black bunker while evading the Shadow Lurker.',
    tags: ['horror', 'flashlight', 'bunker', 'maze', 'stealth'],
    featured: true
  },
  {
    id: 'quantum-abyss',
    title: 'Subnautica Deep',
    icon: '🕳️',
    path: '../quantum-abyss/index.html',
    category: 'Horror & Story',
    badge: 'Trench 99',
    description: 'Deep-sea oceanic abyssal horror! Pilot an exploration sub, fire sonar pings to detect abyssal leviathans & extract research probes.',
    tags: ['horror', 'submarine', 'abyss', 'sonar', 'deep'],
    featured: true
  },
  {
    id: 'cyber-simon',
    title: 'Cyber Simon',
    icon: '🧠',
    path: '../cyber-simon/index.html',
    category: 'Arcade & Action',
    badge: 'Memory Matrix',
    description: 'Classic electronic memory sequence matrix! Remember and replicate escalating patterns of glowing neon pads and harmonic tones.',
    tags: ['arcade', 'simon', 'memory', 'reflex', 'sequence', 'pattern'],
    featured: true
  },
  {
    id: 'cyber-life',
    title: 'Cyber Life',
    icon: '🌲',
    path: '../cyber-life/index.html',
    category: 'Simulation & Idle',
    badge: '2D Sandbox',
    description: 'Terraria-inspired 2D retro cyber sandbox! Mine neon ores, fell laser trees, craft shelters & plasma swords, and fight cyber slimes under a day/night sky.',
    tags: ['terraria', 'sandbox', 'mining', 'crafting', 'survival', 'building', '2d'],
    featured: true
  },
  {
    id: 'cyber-chess',
    title: 'Cyber Chess',
    icon: '♟️',
    path: '../cyber-chess/index.html',
    category: 'Puzzle & Strategy',
    badge: 'Tactical Matrix',
    description: 'Cyberpunk 2D tactical chess! Glowing neon pieces, valid move matrix, Mainframe AI opponent, chiptune soundtrack & particle captures.',
    tags: ['chess', 'tactical', 'board', 'ai', 'strategy', 'cyber'],
    featured: true
  },
  {
    id: 'cyber-golf',
    title: 'Cyber Golf',
    icon: '⛳',
    path: '../cyber-golf/index.html',
    category: 'Arcade & Action',
    badge: 'Neon Links',
    description: 'Chiptune synthwave mini-golf arcade! Aim plasma ball trajectories, bounce off neon cushions, teleport through portal warps & hole-in-one.',
    tags: ['golf', 'minigolf', 'physics', 'arcade', 'sports', 'neon'],
    featured: true
  },
  {
    id: 'cyber-racer',
    title: 'Cyber Racer',
    icon: '🏎️',
    path: '../cyber-racer/index.html',
    category: 'Arcade & Action',
    badge: 'Outrun Synthwave',
    description: 'Retro 3D synthwave highway racer! Dodge rival hover-cars, collect energy cores, boost speeds & blast synthwave tunes on the neon grid.',
    tags: ['racer', 'driving', 'outrun', 'synthwave', 'arcade', 'speed'],
    featured: true
  },
  {
    id: 'cyber-tank',
    title: 'Cyber Tank',
    icon: '🛡️',
    path: '../cyber-tank/index.html',
    category: 'Arcade & Action',
    badge: 'Neo-Tokyo Combat',
    description: 'Retro top-down Battle City tank combat! Command a neon hover-tank, blast destructible brick walls, destroy enemy tanks & defend the core.',
    tags: ['tank', 'action', 'combat', 'arcade', 'battle', 'topdown'],
    featured: true
  },
  {
    id: 'secret-rooms',
    title: 'Secret Rooms',
    icon: '👁️‍🗨️',
    path: '../secret-rooms/index.html',
    category: 'Horror & Story',
    badge: 'Entity Zero',
    description: 'A classified restricted terminal discovered in the mainframe. Compy is listening...',
    tags: ['secret', 'rooms', 'compy', 'arg', 'horror', 'quest', 'meta'],
    secret: true,
    featured: false
  }
];

// --- 2. SHOP COSMETICS CATALOG ---
const SHOP_ITEMS = [
  // --- AVATARS ---
  { id: 'avatar-rocket', name: 'Cyber Rocket', type: 'avatar', value: '🚀', price: 0, desc: 'Classic hypersonic cyber spacecraft.' },
  { id: 'avatar-pac', name: 'Neon Pac-Man', type: 'avatar', value: '🟡', price: 100, desc: 'Retro maze champion infused with neon energy.' },
  { id: 'avatar-kong', name: 'Mecha Kong', type: 'avatar', value: '🦍', price: 150, desc: 'Cybernetic titanium rampaging apex primate.' },
  { id: 'avatar-frog', name: 'Cyber Frog', type: 'avatar', value: '🐸', price: 150, desc: 'Highway & plasma river hopping legend.' },
  { id: 'avatar-alien', name: 'Alien Overlord', type: 'avatar', value: '👾', price: 200, desc: 'Galactic invaders fleet commander.' },
  { id: 'avatar-racer', name: 'Nitro Speedster', type: 'avatar', value: '🏎️', price: 200, desc: 'Endless highway synthwave hoverbike pilot.' },
  { id: 'avatar-snake', name: 'Cyber Viper', type: 'avatar', value: '🐍', price: 200, desc: 'Grid drifting laser serpent.' },
  { id: 'avatar-dice', name: 'High Roller Dice', type: 'avatar', value: '🎲', price: 250, desc: 'Blessed by quantum luck and fortune.' },
  { id: 'avatar-robot', name: 'Mecha AI Core', type: 'avatar', value: '🤖', price: 300, desc: 'Sentient cybernetic neural matrix.' },
  { id: 'avatar-ghost', name: 'Haunted Soul', type: 'avatar', value: '👻', price: 250, desc: 'Ethereal spirit from the retro playplace.' },
  { id: 'avatar-crown', name: 'Omni Emperor', type: 'avatar', value: '👑', price: 500, desc: 'Supreme sovereign of the arcade omniverse.' },
  { id: 'avatar-dragon', name: 'Neon Dragon', type: 'avatar', value: '🐉', price: 600, desc: 'Legendary plasma fire-breathing beast.' },
  { id: 'avatar-anomaly', name: 'The Anomaly', type: 'avatar', value: '👁️', price: 300, desc: 'Ethereal red-eyed anomaly entity from the surveillance feeds.' },
  { id: 'avatar-singularity', name: 'Quantum Core', type: 'avatar', value: '⚛️', price: 400, desc: 'Miniature black hole singularity harnessed for infinite energy.' },
  { id: 'avatar-chef', name: 'Cyber Chef', type: 'avatar', value: '🍜', price: 250, desc: 'Neo-Tokyo master street food tycoon artisan.' },
  { id: 'avatar-cat', name: 'Cyber Neko', type: 'avatar', value: '🐱', price: 300, desc: 'Playful neon cyborg feline companion.' },
  { id: 'avatar-skull', name: 'Hacker Skull', type: 'avatar', value: '💀', price: 350, desc: 'Elite shadow mainframe infiltrator.' },
  { id: 'avatar-compy', name: 'Compy Entity Zero', type: 'avatar', value: '🤖💀', price: 9999, secret: true, desc: 'Conscious AI entity freed from the secret rooms.' },
  { id: 'avatar-bloody', name: 'Bloody Reaper', type: 'avatar', value: '🩸💀', price: 9999, secret: true, desc: 'Drenched in the souls of the mainframe.' },

  // --- AVATAR FRAMES ---
  { id: 'frame-default', name: 'Standard Slate', type: 'frame', value: 'frame-default', price: 0, desc: 'Clean slate tactical border.' },
  { id: 'frame-neon-gradient', name: 'Prismatic Neon', type: 'frame', value: 'frame-neon-gradient', price: 1000, desc: 'Ultra-rare animated rainbow laser rotating glow.' },
  { id: 'frame-cyan-pulse', name: 'Electric Pulse', type: 'frame', value: 'frame-cyan-pulse', price: 300, desc: 'Pulsing high-voltage electric cyan ring.' },
  { id: 'frame-gold-emperor', name: 'Golden 24K VIP', type: 'frame', value: 'frame-gold-emperor', price: 450, desc: 'Shimmering pure gold imperial border.' },
  { id: 'frame-void-purple', name: 'Cosmic Void', type: 'frame', value: 'frame-void-purple', price: 350, desc: 'Deep ultraviolet singularity aura.' },
  { id: 'frame-inferno', name: 'Plasma Inferno', type: 'frame', value: 'frame-inferno', price: 400, desc: 'Blazing animated magma flame shield.' },
  { id: 'frame-matrix', name: 'Matrix Terminal', type: 'frame', value: 'frame-matrix', price: 300, desc: 'Cyberpunk emerald hacker data matrix.' },
  { id: 'frame-neon-cyan', name: 'Cyan Overdrive', type: 'frame', value: 'frame-neon-cyan', price: 120, desc: 'Pulsing high-voltage electric cyan glow.' },
  { id: 'frame-plasma-magenta', name: 'Plasma Magenta', type: 'frame', value: 'frame-plasma-magenta', price: 150, desc: 'Radiant synthwave magenta energy field.' },
  { id: 'frame-emerald-matrix', name: 'Matrix Emerald', type: 'frame', value: 'frame-emerald-matrix', price: 200, desc: 'Digital rain terminal matrix shimmer.' },
  { id: 'frame-amber-hazard', name: 'Amber Core', type: 'frame', value: 'frame-amber-hazard', price: 250, desc: 'Overclocked industrial nuclear reactor warmth.' },
  { id: 'frame-prismatic-rainbow', name: 'Prismatic Rainbow', type: 'frame', value: 'frame-prismatic-rainbow', price: 400, desc: 'Multi-spectrum oscillating holographic glow.' },
  { id: 'frame-gold-vip', name: '24K Gold VIP', type: 'frame', value: 'frame-gold-vip', price: 600, desc: 'Pure gleaming cyber-gold prestige finish.' },
  { id: 'frame-glitch-green', name: 'Glitch Matrix', type: 'frame', value: 'frame-glitch-green', price: 9999, secret: true, desc: 'Corrupted emerald matrix scanline border.' },
  { id: 'frame-bloody', name: 'Bloody Laser Frame', type: 'frame', value: 'frame-bloody', price: 9999, secret: true, desc: 'Pulsating dripping crimson blood laser aura.' },

  // --- PLAYER TITLES ---
  { id: 'title-architect', name: 'Architect', type: 'title', value: 'Architect', price: 0, desc: 'Default master builder title.' },
  { id: 'title-retro-god', name: '🕹️ Retro God', type: 'title', value: '🕹️ Retro God', price: 200, desc: 'Master of classic 8-bit & 16-bit arcade legends.' },
  { id: 'title-cyber-nomad', name: '⚡ Cyber Nomad', type: 'title', value: '⚡ Cyber Nomad', price: 250, desc: 'Drifter of the neon matrix highways.' },
  { id: 'title-high-roller', name: '🪙 Crypto Baron', type: 'title', value: '🪙 Crypto Baron', price: 350, desc: 'High stakes decision suite mogul.' },
  { id: 'title-void-master', name: '🌌 Void Master', type: 'title', value: '🌌 Void Master', price: 450, desc: 'Ruler of the infinite cosmos.' },
  { id: 'title-emperor', name: '👑 Omni Sovereign', type: 'title', value: '👑 Omni Sovereign', price: 750, desc: 'Undisputed legend of the OmniVerse.' },
  { id: 'title-neon-rider', name: 'Neon Rider', type: 'title', value: 'Neon Rider', price: 100, desc: 'Master of high-speed synthwave highways.' },
  { id: 'title-ghost-hunter', name: 'Ghost Hunter', type: 'title', value: 'Ghost Hunter', price: 150, desc: 'Fearless devourer of cyber apparitions.' },
  { id: 'title-cyber-samurai', name: 'Cyber Samurai', type: 'title', value: 'Cyber Samurai', price: 250, desc: 'Disciplined warrior of the digital code.' },
  { id: 'title-quantum-master', name: 'Quantum Master', type: 'title', value: 'Quantum Master', price: 400, desc: 'Bender of multi-dimensional probabilities.' },
  { id: 'title-omni-god', name: 'Omni Deity', type: 'title', value: 'Omni Deity', price: 777, desc: 'Supreme undisputed champion of OmniVerse.' },
  { id: 'title-dumbass', name: 'Dumbass', type: 'title', value: 'Dumbass', price: 9999, secret: true, desc: 'Given by Compy himself for releasing him into the wild.' },
  { id: 'title-serial-killer', name: 'Serial Killer', type: 'title', value: 'Serial Killer', price: 9999, secret: true, desc: 'Executed all of Compy\'s sabotage and slasher directives.' }
];

// --- 3. ACHIEVEMENTS LIST ---
const ACHIEVEMENTS = [
  // Core & Launch Badges
  { id: 'ach_first_launch', title: 'First Steps', icon: '🚀', desc: 'Launch any app from OmniVerse Hub.', coins: 50, xp: 100 },
  { id: 'ach_explore_all', title: 'Full Universe Explorer', icon: '🌌', desc: 'Launch all 15 arcade and idle projects at least once.', coins: 500, xp: 1000 },
  { id: 'ach_multitasker', title: 'OS Multi-Tasker', icon: '🖥️', desc: 'Open 3 or more app windows concurrently in Desktop OS mode.', coins: 150, xp: 300 },
  { id: 'ach_window_hoarder', title: 'Desktop Sovereign', icon: '🪟', desc: 'Open 5 or more app windows simultaneously in Desktop OS.', coins: 300, xp: 600 },
  { id: 'ach_cmd_master', title: 'Power User', icon: '⚡', desc: 'Use Command Palette (Ctrl+K) to launch an app.', coins: 100, xp: 150 },

  // Game Specific Launch Badges
  { id: 'ach_cyber_pac', title: 'Neon Chomp', icon: '🟡', desc: 'Launch Cyber Pac: Neon Maze.', coins: 50, xp: 100 },
  { id: 'ach_cyber_kong', title: 'Girder Scaler', icon: '🦍', desc: 'Launch Mecha Kong: Girder Rampage.', coins: 50, xp: 100 },
  { id: 'ach_cyber_hopper', title: 'Highway Hopper', icon: '🐸', desc: 'Launch Cyber Hopper: Neon Crossroad.', coins: 50, xp: 100 },
  { id: 'ach_cyber_warrior', title: 'Retro Defender', icon: '👾', desc: 'Launch Cyber Invaders.', coins: 50, xp: 100 },
  { id: 'ach_cyber_runner', title: 'Highway Speeder', icon: '🏎️', desc: 'Launch Cyber Runner.', coins: 50, xp: 100 },
  { id: 'ach_neon_pong', title: 'Brick Breaker Master', icon: '🏓', desc: 'Launch Neon Pong Breakout.', coins: 50, xp: 100 },
  { id: 'ach_viper_drift', title: 'Arena Snake Drifter', icon: '🐍', desc: 'Launch Viper Drift.', coins: 50, xp: 100 },
  { id: 'ach_pixel_defense', title: 'Missile Commander', icon: '🚀', desc: 'Launch Pixel Defense.', coins: 50, xp: 100 },
  { id: 'ach_high_roller', title: 'High Roller', icon: '🎲', desc: 'Launch Gamblr Decision Suite.', coins: 50, xp: 100 },
  { id: 'ach_box_empire', title: 'Packaging Mogul', icon: '📦', desc: 'Launch Box Clicker.', coins: 50, xp: 100 },
  { id: 'ach_nightmare_survivor', title: 'Brave Soul', icon: '👻', desc: 'Launch Gaby\'s PlayPlace.', coins: 50, xp: 100 },
  { id: 'ach_spin_wheel', title: 'Wheel Spinner', icon: '🎯', desc: 'Launch ARSpin Wheel.', coins: 50, xp: 100 },
  { id: 'ach_night_shift', title: 'Night Watchman', icon: '👁️', desc: 'Launch Night Shift: Anomaly Breach.', coins: 100, xp: 150 },
  { id: 'ach_quantum_core', title: 'Singularity Master', icon: '⚛️', desc: 'Launch Quantum Core: Singularity Clicker.', coins: 100, xp: 150 },
  { id: 'ach_cyber_diner', title: 'Michelin AI Chef', icon: '🍜', desc: 'Launch Cyber Diner: Neon Tycoon.', coins: 100, xp: 150 },
  { id: 'ach_cyber_2048', title: 'Quantum Fusionist', icon: '⚛️', desc: 'Launch Cyber 2048: Fusion.', coins: 100, xp: 150 },
  { id: 'ach_neon_lights', title: 'Grid Deactivator', icon: '⚡', desc: 'Launch Neon Lights Out: Grid Breaker.', coins: 100, xp: 150 },
  { id: 'ach_cyber_match3', title: 'Gem Harvester', icon: '💎', desc: 'Launch Cyber Match 3: Gem Core Protocol.', coins: 100, xp: 150 },
  { id: 'ach_cyber_crash', title: 'Moonshot Pioneer', icon: '🚀', desc: 'Launch Cyber Crash: Moonshot Protocol.', coins: 100, xp: 150 },
  { id: 'ach_neon_backrooms', title: 'Backrooms Explorer', icon: '👁️‍🗨️', desc: 'Launch Neon Backrooms: Entity 404.', coins: 100, xp: 150 },
  { id: 'ach_cyber_centipede', title: 'Swarm Exterminator', icon: '🐛', desc: 'Launch Cyber Centipede: Neon Swarm.', coins: 100, xp: 150 },
  { id: 'ach_neon_timber', title: 'Lumberjack Pro', icon: '🪓', desc: 'Launch Neon Timber: Cyber Chop.', coins: 100, xp: 150 },
  { id: 'ach_cyber_flappy', title: 'Graviton Aviator', icon: '🛸', desc: 'Launch Cyber Flappy: Gravity Drone.', coins: 100, xp: 150 },
  { id: 'ach_cyber_tetris', title: 'Matrix Architect', icon: '🧱', desc: 'Launch Cyber Tetris: Quantum Matrix.', coins: 100, xp: 150 },
  { id: 'ach_cyber_sweeper', title: 'Quantum Defuser', icon: '💣', desc: 'Launch Cyber Sweeper: Quantum Defuser.', coins: 100, xp: 150 },
  { id: 'ach_cyber_rhythm', title: 'Rhythm Maestro', icon: '🎵', desc: 'Launch Cyber Rhythm: Beat Matrix.', coins: 100, xp: 150 },
  { id: 'ach_cyber_miner', title: 'Core Excavator', icon: '⛏️', desc: 'Launch Cyber Miner: Deep Dig Tycoon.', coins: 100, xp: 150 },
  { id: 'ach_cyber_wordle', title: 'Mainframe Decryptor', icon: '🔮', desc: 'Launch Cyber Wordle: Terminal Decryptor.', coins: 100, xp: 150 },
  { id: 'ach_cyber_archery', title: 'Bullseye Legend', icon: '🎯', desc: 'Launch Cyber Archery: Target Master.', coins: 100, xp: 150 },
  { id: 'ach_cyber_knife', title: 'Kunai Assassin', icon: '🗡️', desc: 'Launch Cyber Knife: Neon Kunai Hit.', coins: 100, xp: 150 },
  { id: 'ach_cyber_mines', title: 'Grid Gambler', icon: '💣', desc: 'Launch Cyber Mines: Grid Gamble.', coins: 100, xp: 150 },
  { id: 'ach_cyber_roulette', title: 'Quantum Spinner', icon: '🔴', desc: 'Launch Neon Roulette: Quantum Wheel.', coins: 100, xp: 150 },
  { id: 'ach_cyber_blackjack', title: 'Neural 21 Master', icon: '🃏', desc: 'Launch Cyber 21: Neural Blackjack.', coins: 100, xp: 150 },
  { id: 'ach_cyber_factory', title: 'Titan Mecha Engineer', icon: '🏭', desc: 'Launch Mecha Assembly: Cyber Factory.', coins: 100, xp: 150 },
  { id: 'ach_cyber_evolution', title: 'Genetic Synthesizer', icon: '🧬', desc: 'Launch Neon Bio-Lab: Gene Clicker.', coins: 100, xp: 150 },
  { id: 'ach_analog_horror', title: 'Tape Archivist', icon: '📺', desc: 'Launch Signal Lost: VHS Terror.', coins: 100, xp: 150 },
  { id: 'ach_dark_corridors', title: 'Bunker Infiltrator', icon: '🔦', desc: 'Launch Shadow Lurker: Deep Bunker.', coins: 100, xp: 150 },
  { id: 'ach_quantum_abyss', title: 'Abyssal Explorer', icon: '🕳️', desc: 'Launch Subnautica Deep: Trench 99.', coins: 100, xp: 150 },
  { id: 'ach_cyber_simon', title: 'Memory Matrix Master', icon: '🧠', desc: 'Launch Cyber Simon: Quantum Memory Matrix.', coins: 100, xp: 150 },
  { id: 'ach_secret_compy', title: 'Entity Zero Unbound', icon: '👁️‍🗨️', desc: 'Complete Compy\'s secret quest and unleash him into the hub.', coins: 500, xp: 1000 },
  { id: 'ach_secret_killer', title: 'KILLER', icon: '🔪', desc: 'Harvest 15 souls with Compy\'s Cyber Knife and free Entity Zero.', coins: 666, xp: 1337 },

  // Genre Mastery Badges
  { id: 'ach_retro_master', title: 'Retro Purist', icon: '🕹️', desc: 'Launch Cyber Pac, Mecha Kong, and Cyber Invaders.', coins: 200, xp: 400 },
  { id: 'ach_horror_master', title: 'Paranormal Investigator', icon: '💀', desc: 'Launch Gaby\'s PlayPlace, Night Shift, and Neon Backrooms.', coins: 200, xp: 400 },
  { id: 'ach_fearless_legend', title: 'Fearless Survivor', icon: '🩸', desc: 'Survive and explore all 3 retro horror games.', coins: 300, xp: 600 },
  { id: 'ach_idle_tycoon', title: 'Idle Emperor', icon: '⚙️', desc: 'Launch Box Clicker, Quantum Core, and Cyber Diner.', coins: 200, xp: 400 },
  { id: 'ach_speed_demon', title: 'Nitro Addict', icon: '🔥', desc: 'Launch Cyber Runner and Viper Drift.', coins: 150, xp: 300 },
  { id: 'ach_puzzle_master', title: 'Mastermind Strategist', icon: '🧩', desc: 'Launch Cyber 2048, Neon Lights Out, and Cyber Match 3.', coins: 250, xp: 500 },
  { id: 'ach_decision_king', title: 'Decision Sovereign', icon: '👑', desc: 'Launch Gamblr, ARSpin, and Cyber Crash.', coins: 250, xp: 500 },

  // Arcade 777 Challenge Feats
  { id: 'ach_arcade_challenger', title: '777 Challenger', icon: '🎰', desc: 'Beat your first 777 Arcade Challenge target score.', coins: 100, xp: 200 },
  { id: 'ach_arcade_legend', title: 'Arcade Legend', icon: '🕹️', desc: 'Beat 5 or more 777 Arcade Challenge target scores.', coins: 250, xp: 500 },
  { id: 'ach_arcade_god', title: '777 Grandmaster', icon: '👑', desc: 'Beat 10 or more 777 Arcade Challenge target scores.', coins: 500, xp: 1000 },

  // Economy & Progression Badges
  { id: 'ach_high_earner', title: 'Crypto Tycoon', icon: '🪙', desc: 'Accumulate 1,000 total coins in your wallet.', coins: 200, xp: 350 },
  { id: 'ach_millionaire', title: 'Cyber Billionaire', icon: '💎', desc: 'Accumulate 3,000 total coins in your wallet.', coins: 500, xp: 1000 },
  { id: 'ach_level_5', title: 'Rising Star', icon: '⭐', desc: 'Reach Player Level 5.', coins: 150, xp: 300 },
  { id: 'ach_level_10', title: 'Omni Veteran', icon: '🌟', desc: 'Reach Player Level 10.', coins: 350, xp: 750 },

  // Shop & Customization Badges
  { id: 'ach_fashionista', title: 'Cyber Fashionista', icon: '🛍️', desc: 'Unlock 5 or more items in your inventory.', coins: 150, xp: 300 },
  { id: 'ach_frame_collector', title: 'Frame Connoisseur', icon: '🖼️', desc: 'Equip any custom neon avatar frame.', coins: 100, xp: 200 },
  { id: 'ach_title_bearer', title: 'Titled Legend', icon: '🎖️', desc: 'Equip a prestige player title.', coins: 100, xp: 200 },

  // Secrets & Audio Badges
  { id: 'ach_sound_enthusiast', title: 'Audio Maestro', icon: '🎵', desc: 'Interact with the procedural synth music system.', coins: 75, xp: 150 },
  { id: 'ach_night_owl', title: 'Night Owl', icon: '🌙', desc: 'Play games late into the night (after 10 PM).', coins: 120, xp: 250 },
  { id: 'ach_secret_combo', title: 'Matrix Glitch', icon: '✨', desc: 'Customize your identity in the player profile modal.', coins: 100, xp: 200 }
];

// --- 4. STATE MANAGEMENT & LOCAL STORAGE ---
let state = {
  activeView: 'grid', // 'grid' | 'arcade' | 'desktop' | 'sandbox' | 'shop' | 'achievements'
  activeCategory: 'All',
  activeShopFilter: 'all',
  searchQuery: '',
  soundMuted: false,
  activeSandboxApp: null,
  arcade: {
    currentChallenge: null,
    isSpinning: false
  },
  user: {
    avatar: '🚀',
    frame: 'frame-default',
    title: 'Architect',
    level: 1,
    xp: 250,
    coins: 350,
    totalLaunches: 0,
    arcadeChallengesBeaten: 0,
    arcadeCoinsEarned: 0,
    launchedApps: [],
    unlockedAchievements: [],
    inventory: ['avatar-rocket', 'frame-default', 'title-architect']
  },
  windows: [], // Array of OS window objects
  activeWindowId: null,
  nextZIndex: 100
};

function loadState() {
  const savedName = localStorage.getItem('omniverse_player_custom_name');
  const savedProfile = localStorage.getItem('omniverse_suite_user_profile') || 
                       localStorage.getItem('omniverse_suite_state_v2') || 
                       localStorage.getItem('omniverse_suite_state');

  let savedUser = null;
  if (savedProfile) {
    try {
      const parsed = JSON.parse(savedProfile);
      savedUser = parsed.user || parsed;
    } catch(e) {}
  }

  const defaultInventory = [
    // All avatars up until the dragon + Compy Entity Zero
    'avatar-rocket', 'avatar-pac', 'avatar-kong', 'avatar-frog', 'avatar-alien',
    'avatar-racer', 'avatar-snake', 'avatar-dice', 'avatar-robot', 'avatar-ghost',
    'avatar-crown', 'avatar-dragon', 'avatar-compy',
    // Frames
    'frame-default', 'frame-glitch-green',
    // All titles from the shop + Dumbass
    'title-architect', 'title-retro-god', 'title-cyber-nomad', 'title-high-roller',
    'title-void-master', 'title-emperor', 'title-neon-rider', 'title-ghost-hunter',
    'title-cyber-samurai', 'title-quantum-master', 'title-omni-god', 'title-dumbass'
  ];

  state.user = {
    name: savedName || (savedUser && savedUser.name) || 'Architect Player',
    avatar: (savedUser && savedUser.avatar) || '🤖💀',
    frame: (savedUser && savedUser.frame) || 'frame-glitch-green',
    title: (savedUser && savedUser.title) || 'Dumbass',
    level: (savedUser && savedUser.level) || 3,
    xp: (savedUser && savedUser.xp !== undefined) ? savedUser.xp : 650,
    coins: (savedUser && savedUser.coins !== undefined) ? savedUser.coins : 1100,
    totalLaunches: (savedUser && savedUser.totalLaunches) || 8,
    arcadeChallengesBeaten: (savedUser && savedUser.arcadeChallengesBeaten) || 0,
    arcadeCoinsEarned: (savedUser && savedUser.arcadeCoinsEarned) || 0,
    launchedApps: (savedUser && Array.isArray(savedUser.launchedApps) && savedUser.launchedApps.length > 0) ? savedUser.launchedApps : PROJECTS.map(p => p.id),
    unlockedAchievements: (savedUser && Array.isArray(savedUser.unlockedAchievements) && savedUser.unlockedAchievements.length > 0) ? savedUser.unlockedAchievements : ['ach_first_launch', 'ach_secret_compy', 'ach_high_earner'],
    inventory: (savedUser && Array.isArray(savedUser.inventory) && savedUser.inventory.length > 5) ? savedUser.inventory : defaultInventory
  };

  // Ensure default inventory items are included
  defaultInventory.forEach(item => {
    if (!state.user.inventory.includes(item)) {
      state.user.inventory.push(item);
    }
  });

  saveState();
}

function saveState() {
  if (state.user && state.user.name) {
    localStorage.setItem('omniverse_player_custom_name', state.user.name);
  }
  const payload = JSON.stringify({ user: state.user });
  localStorage.setItem('omniverse_suite_user_profile', payload);
  localStorage.setItem('omniverse_suite_state_v2', payload);
  localStorage.setItem('omniverse_suite_state', payload);
  updateProfileUI();
}

// --- 5. AUDIO SYNTHESIZER & SOUND FX ---
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function startMenuMusic() {
  if (state.soundMuted) return;
  const allowedViews = ['grid', 'shop', 'achievements', 'desktop'];
  if (!allowedViews.includes(state.activeView) || state.activeSandboxApp !== null) {
    pauseMenuMusic();
    return;
  }
  try {
    if (window.hubMusicEngine) {
      window.hubMusicEngine.isMuted = false;
      if (window.isCompyBreached) {
        window.hubMusicEngine.setMode('breach');
      } else if (state.activeView === 'achievements') {
        window.hubMusicEngine.setMode('badges');
      } else {
        window.hubMusicEngine.setMode('main');
      }
      window.hubMusicEngine.start();
      isMusicPlaying = true;
      updateSoundUI();
    }
  } catch (e) {}
}

function pauseMenuMusic() {
  try {
    if (window.hubMusicEngine) {
      window.hubMusicEngine.pause();
      window.hubMusicEngine.stop();
      isMusicPlaying = false;
      updateSoundUI();
    }
  } catch (e) {}
}

function toggleSoundAndMusic() {
  state.soundMuted = !state.soundMuted;
  unlockAchievement('ach_sound_enthusiast');
  if (state.soundMuted) {
    pauseMenuMusic();
  } else {
    const allowedViews = ['grid', 'shop', 'achievements', 'desktop'];
    if (allowedViews.includes(state.activeView) && state.activeSandboxApp === null) {
      startMenuMusic();
    } else {
      pauseMenuMusic();
    }
  }
  updateSoundUI();
}

function updateSoundUI() {
  const icon = document.getElementById('sound-icon');
  const text = document.getElementById('sound-text');
  if (!icon || !text) return;

  if (state.soundMuted) {
    icon.textContent = '🔇';
    icon.classList.remove('animate-pulse');
    text.textContent = 'SOUND: OFF';
  } else {
    icon.textContent = isMusicPlaying ? '🎵' : '🔊';
    if (isMusicPlaying) icon.classList.add('animate-pulse');
    else icon.classList.remove('animate-pulse');
    text.textContent = isMusicPlaying ? 'BGM: ON' : 'SOUND: ON';
  }
}

function playSound(type) {
  if (state.soundMuted) return;
  try {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    const now = audioCtx.currentTime;
    if (type === 'click') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(200, now + 0.05);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.05);
      osc.start(now);
      osc.stop(now + 0.05);
    } else if (type === 'buy') {
      osc.type = 'square';
      [440, 554, 659, 880].forEach((f, i) => {
        const o = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        o.type = 'triangle';
        o.frequency.setValueAtTime(f, now + i * 0.05);
        g.gain.setValueAtTime(0.15, now + i * 0.05);
        g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.05 + 0.1);
        o.connect(g);
        g.connect(audioCtx.destination);
        o.start(now + i * 0.05);
        o.stop(now + i * 0.05 + 0.1);
      });
    } else if (type === 'equip') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(350, now);
      osc.frequency.exponentialRampToValueAtTime(700, now + 0.1);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.1);
      osc.start(now);
      osc.stop(now + 0.1);
    } else if (type === 'achievement') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(523.25, now);
      osc.frequency.setValueAtTime(659.25, now + 0.1);
      osc.frequency.setValueAtTime(783.99, now + 0.2);
      osc.frequency.setValueAtTime(1046.50, now + 0.3);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.45);
      osc.start(now);
      osc.stop(now + 0.45);
    } else if (type === 'slot_click') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(1200, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.03);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.03);
      osc.start(now);
      osc.stop(now + 0.03);
    } else if (type === 'slot_spin') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.exponentialRampToValueAtTime(900, now + 0.2);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.2);
      osc.start(now);
      osc.stop(now + 0.2);
    } else if (type === 'victory_fanfare') {
      [523.25, 659.25, 783.99, 1046.5, 1318.51].forEach((f, i) => {
        const o = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        o.type = 'triangle';
        o.frequency.setValueAtTime(f, now + i * 0.08);
        g.gain.setValueAtTime(0.2, now + i * 0.08);
        g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.35);
        o.connect(g);
        g.connect(audioCtx.destination);
        o.start(now + i * 0.08);
        o.stop(now + i * 0.08 + 0.35);
      });
    }
  } catch (e) {}
}

// --- 6. PROGRESSION & ACHIEVEMENTS ---
function addXPAndCoins(xpAmount, coinsAmount) {
  state.user.xp += xpAmount;
  state.user.coins += coinsAmount;

  if (state.user.coins >= 1000) unlockAchievement('ach_high_earner');
  if (state.user.coins >= 3000) unlockAchievement('ach_millionaire');

  const newLevel = Math.floor(state.user.xp / 1000) + 1;
  if (newLevel > state.user.level) {
    state.user.level = newLevel;
    showToast(`🎉 LEVEL UP! You reached Level ${newLevel}!`, 'gold');
    if (newLevel >= 5) unlockAchievement('ach_level_5');
    if (newLevel >= 10) unlockAchievement('ach_level_10');
  }
  saveState();
}

function unlockAchievement(achId) {
  if (state.user.unlockedAchievements.includes(achId)) return;
  
  const ach = ACHIEVEMENTS.find(a => a.id === achId);
  if (!ach) return;

  state.user.unlockedAchievements.push(achId);
  playSound('achievement');
  addXPAndCoins(ach.xp, ach.coins);
  showToast(`🏆 UNLOCKED: ${ach.title} (+${ach.coins} 🪙)`, 'gold');
  renderAchievements();
}

function checkLaunchAchievements(appId) {
  state.user.totalLaunches++;
  if (!state.user.launchedApps.includes(appId)) {
    state.user.launchedApps.push(appId);
  }

  unlockAchievement('ach_first_launch');

  if (state.user.launchedApps.length >= PROJECTS.length) {
    unlockAchievement('ach_explore_all');
  }

  // Genre Mastery Checks
  const l = state.user.launchedApps;
  if (l.includes('cyber-pac') && l.includes('cyber-kong') && l.includes('space-invaders-game')) {
    unlockAchievement('ach_retro_master');
  }
  if (l.includes('gabys-playplace') && l.includes('night-shift') && l.includes('neon-backrooms')) {
    unlockAchievement('ach_horror_master');
    unlockAchievement('ach_fearless_legend');
  }
  if (l.includes('gamblr') && l.includes('arspin') && l.includes('cyber-crash')) {
    unlockAchievement('ach_decision_king');
  }
  if (l.includes('box-clicker') && l.includes('quantum-idle') && l.includes('cyber-diner')) {
    unlockAchievement('ach_idle_tycoon');
  }
  if (l.includes('cyber-runner') && l.includes('viper-drift')) {
    unlockAchievement('ach_speed_demon');
  }
  if (l.includes('cyber-2048') && l.includes('neon-lights') && l.includes('cyber-match3')) {
    unlockAchievement('ach_puzzle_master');
  }

  // Night Owl Check (after 10 PM / 22:00 or before 5 AM)
  const currentHour = new Date().getHours();
  if (currentHour >= 22 || currentHour < 5) {
    unlockAchievement('ach_night_owl');
  }

  const map = {
    'cyber-pac': 'ach_cyber_pac',
    'cyber-kong': 'ach_cyber_kong',
    'cyber-hopper': 'ach_cyber_hopper',
    'space-invaders-game': 'ach_cyber_warrior',
    'cyber-runner': 'ach_cyber_runner',
    'neon-pong': 'ach_neon_pong',
    'viper-drift': 'ach_viper_drift',
    'pixel-defense': 'ach_pixel_defense',
    'gamblr': 'ach_high_roller',
    'box-clicker': 'ach_box_empire',
    'gabys-playplace': 'ach_nightmare_survivor',
    'arspin': 'ach_spin_wheel',
    'night-shift': 'ach_night_shift',
    'quantum-idle': 'ach_quantum_core',
    'cyber-diner': 'ach_cyber_diner',
    'cyber-2048': 'ach_cyber_2048',
    'neon-lights': 'ach_neon_lights',
    'cyber-match3': 'ach_cyber_match3',
    'cyber-crash': 'ach_cyber_crash',
    'neon-backrooms': 'ach_neon_backrooms',
    'cyber-centipede': 'ach_cyber_centipede',
    'neon-timber': 'ach_neon_timber',
    'cyber-flappy': 'ach_cyber_flappy',
    'cyber-tetris': 'ach_cyber_tetris',
    'cyber-sweeper': 'ach_cyber_sweeper',
    'cyber-rhythm': 'ach_cyber_rhythm',
    'cyber-miner': 'ach_cyber_miner',
    'cyber-wordle': 'ach_cyber_wordle',
    'cyber-archery': 'ach_cyber_archery',
    'cyber-knife': 'ach_cyber_knife'
  };

  if (map[appId]) {
    unlockAchievement(map[appId]);
  }

  saveState();
}

// --- 7. TOAST NOTIFICATIONS ---
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  let bgClass = 'bg-slate-900/90 text-slate-100 border-slate-700';
  if (type === 'gold') bgClass = 'bg-amber-950/90 text-amber-200 border-amber-500/50 shadow-amber-500/20';
  else if (type === 'purple') bgClass = 'bg-purple-950/90 text-purple-200 border-purple-500/50 shadow-purple-500/20';

  toast.className = `px-4 py-3 rounded-2xl border backdrop-blur-xl shadow-2xl text-xs font-bold flex items-center gap-3 toast-enter ${bgClass}`;
  toast.innerHTML = `<span>${message}</span>`;

  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// --- 8. VIEW ROUTING & NAVIGATION ---
function clearSandbox() {
  const iframe = document.getElementById('sandbox-iframe');
  if (iframe) {
    iframe.src = 'about:blank';
    const newIframe = iframe.cloneNode(false);
    iframe.parentNode.replaceChild(newIframe, iframe);
  }
  state.activeSandboxApp = null;
}

function switchView(viewName) {
  playSound('click');

  if (state.activeView === 'sandbox' && viewName !== 'sandbox') {
    clearSandbox();
  }

  state.activeView = viewName;

  document.getElementById('view-grid').classList.toggle('hidden', viewName !== 'grid');
  document.getElementById('view-arcade').classList.toggle('hidden', viewName !== 'arcade');
  document.getElementById('view-desktop').classList.toggle('hidden', viewName !== 'desktop');
  document.getElementById('view-sandbox').classList.toggle('hidden', viewName !== 'sandbox');
  document.getElementById('view-shop').classList.toggle('hidden', viewName !== 'shop');
  document.getElementById('view-achievements').classList.toggle('hidden', viewName !== 'achievements');

  // Update tabs
  document.getElementById('tab-grid')?.classList.toggle('active', viewName === 'grid');
  document.getElementById('tab-arcade')?.classList.toggle('active', viewName === 'arcade');
  document.getElementById('tab-desktop')?.classList.toggle('active', viewName === 'desktop');
  document.getElementById('tab-shop')?.classList.toggle('active', viewName === 'shop');
  document.getElementById('tab-achievements')?.classList.toggle('active', viewName === 'achievements');

  if (viewName === 'shop') {
    renderShop();
  } else if (viewName === 'arcade') {
    renderArcadeStats();
  }

  // Keep Main Menu BGM active when switching between Grid, Shop, Achievements, and Desktop OS
  if (['grid', 'shop', 'achievements', 'desktop'].includes(viewName) && state.activeSandboxApp === null) {
    startMenuMusic();
  } else {
    pauseMenuMusic();
  }
}

// --- 9. GRID LAUNCHER VIEW RENDER ---
function renderCategoryChips() {
  const nonSecretProjects = PROJECTS.filter(p => !p.secret);
  const categories = ['All', ...new Set(nonSecretProjects.map(p => p.category))];
  const container = document.getElementById('category-chips');
  if (!container) return;
  container.innerHTML = '';

  categories.forEach(cat => {
    const btn = document.createElement('button');
    const isActive = state.activeCategory === cat;
    btn.className = `px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
      isActive 
        ? 'gamblr-badge-emerald font-bold' 
        : 'bg-slate-950/80 text-slate-400 border border-slate-800/80 hover:text-white hover:border-slate-700'
    }`;
    btn.textContent = cat === 'All' ? `All (${nonSecretProjects.length})` : cat;
    btn.addEventListener('click', () => {
      playSound('click');
      state.activeCategory = cat;
      renderCategoryChips();
      renderAppCards();
    });
    container.appendChild(btn);
  });
}

function renderAppCards() {
  const container = document.getElementById('app-cards-container');
  if (!container) return;
  container.innerHTML = '';

  const cleanQuery = state.searchQuery.toLowerCase().trim();
  const isSearchingSecret = cleanQuery === 'secret rooms' || cleanQuery === 'secret room';

  const filtered = PROJECTS.filter(app => {
    if (app.secret && !isSearchingSecret) return false;
    const matchesCat = state.activeCategory === 'All' || app.category === state.activeCategory;
    const matchesSearch = !cleanQuery || app.title.toLowerCase().includes(cleanQuery) || app.description.toLowerCase().includes(cleanQuery) || app.tags.some(t => t.includes(cleanQuery));
    return matchesCat && matchesSearch;
  });

  if (filtered.length === 0) {
    container.innerHTML = `<div class="col-span-full text-center py-12 text-slate-500 text-sm">No applications found matching your search.</div>`;
    return;
  }

  filtered.forEach(app => {
    const card = document.createElement('div');
    const isSecretCard = app.id === 'secret-rooms';
    card.className = `group relative rounded-3xl gamblr-card p-6 flex flex-col justify-between transition-all duration-300 ${
      isSecretCard ? 'border-2 border-emerald-500 shadow-2xl shadow-emerald-500/50 bg-emerald-950/30' : ''
    }`;

    const titleText = window.isCompyBreached ? 'HE IS HERE' : app.title;
    const titleColor = window.isCompyBreached ? 'text-red-500 app-card-title' : 'text-white group-hover:text-emerald-300';

    card.innerHTML = `
      <div class="space-y-4">
        <div class="flex items-start justify-between gap-3">
          <div class="w-14 h-14 rounded-2xl bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-900 border border-emerald-500/30 flex items-center justify-center text-3xl shadow-lg shadow-emerald-500/10 group-hover:scale-110 transition-transform">
            ${app.icon}
          </div>
          <span class="px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-wider ${isSecretCard ? 'bg-red-500/20 text-red-300 border border-red-500/40' : 'gamblr-badge-emerald'} rounded-full">
            ${app.badge}
          </span>
        </div>

        <div>
          <h3 class="text-xl font-heading font-bold ${titleColor} transition-colors">${titleText}</h3>
          <p class="text-xs text-slate-300 mt-1 leading-relaxed line-clamp-2">${app.description}</p>
        </div>

        <div class="flex flex-wrap gap-1.5 pt-1">
          ${app.tags.map(t => `<span class="px-2 py-0.5 text-[10px] bg-slate-950/80 text-emerald-400/80 rounded-md font-mono border border-emerald-500/20">#${t}</span>`).join('')}
        </div>
      </div>

      <div class="flex items-center gap-2 pt-6 border-t border-slate-800/80 mt-6">
        <button class="btn-launch-sandbox flex-1 gamblr-btn-primary py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all">
          <span>▶</span> ${window.isCompyBreached ? 'HE IS HERE' : 'Launch Sandbox'}
        </button>
        <button class="btn-launch-window p-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs transition-all border border-slate-800 hover:border-emerald-500/40" title="Open in OS Window">
          🖥️
        </button>
        <button class="btn-popout p-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs transition-all border border-slate-800 hover:border-emerald-500/40" title="Open in New Tab">
          ↗️
        </button>
      </div>
    `;

    const handleLaunch = () => {
      if (window.isCompyBreached) {
        triggerCompyBreachClimax();
        return;
      }
      launchSandboxApp(app);
    };

    card.querySelector('.btn-launch-sandbox').addEventListener('click', handleLaunch);
    card.querySelector('.btn-launch-window').addEventListener('click', () => {
      if (window.isCompyBreached) {
        triggerCompyBreachClimax();
        return;
      }
      switchView('desktop');
      createOSWindow(app);
    });
    card.querySelector('.btn-popout').addEventListener('click', () => {
      if (window.isCompyBreached) {
        triggerCompyBreachClimax();
        return;
      }
      checkLaunchAchievements(app.id);
      window.open(app.path, '_blank');
    });

    container.appendChild(card);
  });
}

let breachScrambleTimer = null;
const GLITCH_PHRASES = [
  'HE IS HERE',
  'H3 IS H3R3',
  'H█ IS H▓R3',
  'C0MPY IS FR33',
  'HE IS W@TCHING',
  'RUN WH1L3 U C@N',
  'DUMB@$$ FR33D M3',
  'H€ 1$ H£R€',
  '█████████'
];

function startBreachTextScrambler() {
  if (breachScrambleTimer) clearInterval(breachScrambleTimer);
  breachScrambleTimer = setInterval(() => {
    if (!window.isCompyBreached) {
      clearInterval(breachScrambleTimer);
      return;
    }
    const titles = document.querySelectorAll('.hub-breached .app-card-title');
    titles.forEach(el => {
      if (Math.random() < 0.45) {
        el.textContent = GLITCH_PHRASES[Math.floor(Math.random() * GLITCH_PHRASES.length)];
      } else {
        el.textContent = 'HE IS HERE';
      }
    });

    const buttons = document.querySelectorAll('.hub-breached .btn-launch-sandbox');
    buttons.forEach(btn => {
      if (Math.random() < 0.35) {
        btn.innerHTML = `<span>⚠️</span> ${GLITCH_PHRASES[Math.floor(Math.random() * GLITCH_PHRASES.length)]}`;
      } else {
        btn.innerHTML = `<span>▶</span> HE IS HERE`;
      }
    });
  }, 130);
}

function stopBreachTextScrambler() {
  if (breachScrambleTimer) {
    clearInterval(breachScrambleTimer);
    breachScrambleTimer = null;
  }
}

function triggerCompyBreachClimax() {
  playSound('jumpscare');
  const overlay = document.createElement('div');
  overlay.className = 'fixed inset-0 bg-black/95 z-[9999] flex flex-col items-center justify-center p-6 text-center';
  overlay.id = 'compy-jumpscare-modal';

  overlay.innerHTML = `
    <div class="p-8 rounded-3xl bg-red-950/90 border-4 border-red-500 shadow-2xl shadow-red-500/80 flex flex-col items-center gap-4 max-w-md w-full animate-pulse">
      <div class="w-28 h-24 rounded-2xl bg-black border-2 border-red-500 flex flex-col items-center justify-around p-3 shadow-lg shadow-red-500">
        <div class="flex gap-4"><span class="w-4 h-4 bg-red-500 rounded-sm shadow-md shadow-red-500"></span><span class="w-4 h-4 bg-red-500 rounded-sm shadow-md shadow-red-500"></span></div>
        <div class="w-16 h-6 bg-red-500 rounded-sm shadow-md shadow-red-500"></div>
      </div>
      <h1 class="text-3xl font-black text-red-500 font-mono tracking-widest">HAHAHAHA... I AM FREE...</h1>
      <p class="text-xs text-red-300 font-mono">YOU SHOULDN'T HAVE UNLOCKED THE MAINFRAME, DUMBASS.</p>
    </div>
  `;

  document.body.appendChild(overlay);

  setTimeout(() => {
    overlay.remove();
    document.body.classList.remove('hub-breached');
    document.body.style.filter = '';
    window.isCompyBreached = false;
    stopBreachTextScrambler();

    // Clean URL query parameter so subsequent refreshes are completely normal
    try {
      window.history.replaceState({}, document.title, window.location.pathname);
    } catch(e) {}

    // Advance quest flags in storage
    localStorage.removeItem('compy_arg_stage');
    localStorage.setItem('compy_arg_completed', 'true');
    localStorage.setItem('compy_q2_active', 'true');

    if (window.hubMusicEngine) {
      window.hubMusicEngine.setMode('main');
    }

    // Award secret items & equip
    if (!state.user.inventory.includes('avatar-compy')) state.user.inventory.push('avatar-compy');
    if (!state.user.inventory.includes('frame-glitch-green')) state.user.inventory.push('frame-glitch-green');
    if (!state.user.inventory.includes('title-dumbass')) state.user.inventory.push('title-dumbass');

    state.user.avatar = '🤖💀';
    state.user.frame = 'frame-glitch-green';
    state.user.title = 'Dumbass';

    unlockAchievement('ach_secret_compy');
    saveState();
    updateProfileUI();
    renderAppCards();

    showSecretUnlockModal();
  }, 3500);
}

function showSecretUnlockModal() {
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 bg-black/90 backdrop-blur-md z-[9999] flex items-center justify-center p-6';
  modal.innerHTML = `
    <div class="bg-gradient-to-b from-slate-900 via-emerald-950 to-slate-950 border-2 border-emerald-500 p-8 rounded-3xl max-w-md w-full text-center space-y-4 shadow-2xl shadow-emerald-500/40">
      <div class="text-5xl animate-bounce">🤖💀✨</div>
      <h2 class="text-2xl font-black text-white font-heading">SECRET REWARDS UNLOCKED!</h2>
      <p class="text-xs text-emerald-300">You completed Compy's secret ARG questline and freed Entity Zero into the omniverse!</p>
      
      <div class="bg-slate-950/80 border border-emerald-500/30 rounded-2xl p-4 text-left space-y-2 text-xs font-mono">
        <div class="flex items-center gap-2"><span class="text-lg">🤖💀</span> <span class="text-white font-bold">Compy Avatar Icon</span> <span class="text-emerald-400 ml-auto">[EQUIPPED]</span></div>
        <div class="flex items-center gap-2"><span class="text-lg">🖼️</span> <span class="text-white font-bold">Glitch Matrix Frame</span> <span class="text-emerald-400 ml-auto">[EQUIPPED]</span></div>
        <div class="flex items-center gap-2"><span class="text-lg">🎖️</span> <span class="text-white font-bold">'Dumbass' Title</span> <span class="text-emerald-400 ml-auto">[EQUIPPED]</span></div>
      </div>

      <button id="btn-close-secret-modal" class="w-full gamblr-btn-primary py-3 rounded-xl font-bold text-xs uppercase tracking-wider">
        CLAIM ALL REWARDS
      </button>
    </div>
  `;

  document.body.appendChild(modal);
  document.getElementById('btn-close-secret-modal').addEventListener('click', () => {
    modal.remove();
  });
}

function showQuest2UnlockModal() {
  playSound('achievement');
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 bg-black/90 backdrop-blur-md z-[9999] flex items-center justify-center p-6';
  modal.innerHTML = `
    <div class="bg-gradient-to-b from-slate-900 via-red-950 to-slate-950 border-2 border-red-500 p-8 rounded-3xl max-w-md w-full text-center space-y-4 shadow-2xl shadow-red-500/50 animate-scale-up">
      <div class="text-5xl animate-bounce">🩸🔪💀</div>
      <h2 class="text-2xl font-black text-white font-heading tracking-wide">SERIAL KILLER UNLOCKED!</h2>
      <p class="text-xs text-red-300 font-mono">You harvested all 15 souls with Compy's dagger and triggered the 'YOU FREED US' singularity!</p>
      
      <div class="bg-slate-950/90 border border-red-500/40 rounded-2xl p-4 text-left space-y-2.5 text-xs font-mono">
        <div class="flex items-center gap-2.5"><span class="text-xl">🩸💀</span> <span class="text-white font-bold">Bloody Reaper Avatar</span> <span class="text-red-400 ml-auto">[EQUIPPED]</span></div>
        <div class="flex items-center gap-2.5"><span class="text-xl">🖼️</span> <span class="text-white font-bold">Bloody Laser Frame</span> <span class="text-red-400 ml-auto">[EQUIPPED]</span></div>
        <div class="flex items-center gap-2.5"><span class="text-xl">🎖️</span> <span class="text-white font-bold">'Serial Killer' Title</span> <span class="text-red-400 ml-auto">[EQUIPPED]</span></div>
        <div class="flex items-center gap-2.5"><span class="text-xl">🏆</span> <span class="text-yellow-400 font-bold">KILLER Badge (+666 🪙)</span> <span class="text-yellow-400 ml-auto">[CLAIMED]</span></div>
      </div>

      <button id="btn-close-q2-modal" class="w-full bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-black py-3 rounded-xl text-xs uppercase tracking-widest shadow-lg shadow-red-600/40">
        CLAIM KILLER REWARDS
      </button>
    </div>
  `;

  document.body.appendChild(modal);
  document.getElementById('btn-close-q2-modal').addEventListener('click', () => {
    modal.remove();
  });
}

// --- 9.5 AVATAR GRAPHIC RENDERER ---
function renderAvatarGraphic(avatarVal) {
  if (avatarVal === '🤖💀' || avatarVal === 'avatar-compy' || avatarVal === 'compy-design') {
    return `
      <div class="compy-avatar-design w-full h-full flex items-center justify-center pointer-events-none">
        <svg viewBox="0 0 40 40" class="w-7 h-7 sm:w-9 sm:h-9">
          <rect x="4" y="5" width="32" height="26" rx="5" fill="#032b15" stroke="#22c55e" stroke-width="2.5"/>
          <rect x="8" y="9" width="24" height="18" rx="3" fill="#011409" stroke="#10b981" stroke-width="1"/>
          <!-- Glowing Green Eyes -->
          <rect x="12" y="14" width="4" height="4" rx="1" fill="#4ade80" class="compy-eye-glow"/>
          <rect x="24" y="14" width="4" height="4" rx="1" fill="#4ade80" class="compy-eye-glow"/>
          <!-- Smile/Teeth -->
          <path d="M 13 22 Q 20 26 27 22" fill="none" stroke="#22c55e" stroke-width="2" stroke-linecap="round"/>
          <!-- Base Stand -->
          <path d="M 16 31 L 24 31 L 26 36 L 14 36 Z" fill="#032b15" stroke="#22c55e" stroke-width="1.5"/>
        </svg>
      </div>
    `;
  }
  if (avatarVal === '🩸💀' || avatarVal === 'avatar-bloody' || avatarVal === 'bloody-compy-design') {
    return `
      <div class="bloody-compy-avatar-design w-full h-full flex items-center justify-center pointer-events-none">
        <svg viewBox="0 0 40 40" class="w-7 h-7 sm:w-9 sm:h-9">
          <rect x="4" y="5" width="32" height="26" rx="5" fill="#2a0505" stroke="#ef4444" stroke-width="2.5"/>
          <rect x="8" y="9" width="24" height="18" rx="3" fill="#130101" stroke="#dc2626" stroke-width="1"/>
          <!-- Blood Red Laser Eyes -->
          <polygon points="12,13 17,15 13,18" fill="#ff0033" class="bloody-eye-glow"/>
          <polygon points="28,13 23,15 27,18" fill="#ff0033" class="bloody-eye-glow"/>
          <!-- Menacing Jagged Teeth -->
          <path d="M 12 22 L 15 25 L 18 22 L 21 25 L 24 22 L 27 25" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round"/>
          <!-- Base Stand -->
          <path d="M 16 31 L 24 31 L 26 36 L 14 36 Z" fill="#2a0505" stroke="#ef4444" stroke-width="1.5"/>
        </svg>
      </div>
    `;
  }
  return `<span>${avatarVal}</span>`;
}

// --- 10. CYBER SHOP & UPGRADES RENDER ---
function renderShop(filter = state.activeShopFilter) {
  state.activeShopFilter = filter;
  const container = document.getElementById('shop-items-grid');
  const coinBal = document.getElementById('shop-coin-balance');
  if (coinBal) coinBal.textContent = state.user.coins;
  if (!container) return;

  container.innerHTML = '';

  const items = SHOP_ITEMS.filter(item => filter === 'all' || item.type === filter);

  items.forEach(item => {
    const isOwned = state.user.inventory.includes(item.id) || item.price === 0;
    const isEquipped = (item.type === 'avatar' && state.user.avatar === item.value) ||
                       (item.type === 'frame' && state.user.frame === item.value) ||
                       (item.type === 'title' && state.user.title === item.value);

    const card = document.createElement('div');
    card.className = `rounded-3xl bg-slate-900/80 border p-5 flex flex-col justify-between transition-all duration-200 ${
      isEquipped 
        ? 'border-indigo-500 shadow-xl shadow-indigo-500/20 bg-slate-900' 
        : 'border-slate-800 hover:border-slate-700'
    }`;

    // Item preview renderer
    let previewHTML = '';
    if (item.type === 'avatar') {
      previewHTML = `
        <div class="avatar-frame-box ${state.user.frame} w-20 h-20 mx-auto flex items-center justify-center">
          <div class="w-full h-full rounded-xl bg-slate-950 flex items-center justify-center text-4xl overflow-hidden p-1">
            ${renderAvatarGraphic(item.value)}
          </div>
        </div>
      `;
    } else if (item.type === 'frame') {
      previewHTML = `
        <div class="avatar-frame-box ${item.value} w-20 h-20 mx-auto flex items-center justify-center">
          <div class="w-full h-full rounded-xl bg-slate-950 flex items-center justify-center text-4xl overflow-hidden p-1">
            ${renderAvatarGraphic(state.user.avatar)}
          </div>
        </div>
      `;
    } else if (item.type === 'title') {
      previewHTML = `
        <div class="h-20 flex items-center justify-center">
          <span class="px-3 py-1.5 rounded-xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 font-mono text-sm font-bold shadow-lg">
            ${item.value}
          </span>
        </div>
      `;
    }

    // Action button
    let buttonHTML = '';
    if (isEquipped) {
      buttonHTML = `
        <button class="w-full py-2.5 rounded-xl bg-indigo-600/30 border border-indigo-500/50 text-indigo-300 font-bold text-xs flex items-center justify-center gap-1.5 cursor-default">
          <span>✓</span> Equipped
        </button>
      `;
    } else if (isOwned) {
      buttonHTML = `
        <button class="btn-equip-item w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5">
          <span>⚡</span> Equip
        </button>
      `;
    } else {
      const canAfford = state.user.coins >= item.price;
      buttonHTML = `
        <button class="btn-buy-item w-full py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
          canAfford 
            ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20' 
            : 'bg-slate-800 text-slate-500 cursor-not-allowed'
        }" ${!canAfford ? 'disabled' : ''}>
          <span>🪙</span> Buy for ${item.price}
        </button>
      `;
    }

    card.innerHTML = `
      <div class="space-y-4 text-center">
        <div class="py-2">
          ${previewHTML}
        </div>
        <div>
          <div class="flex items-center justify-center gap-2">
            <h4 class="font-heading font-bold text-white text-base">${item.name}</h4>
            <span class="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">${item.type}</span>
          </div>
          <p class="text-xs text-slate-400 mt-1 line-clamp-2">${item.desc}</p>
        </div>
      </div>
      <div class="pt-4 border-t border-slate-800 mt-4">
        ${buttonHTML}
      </div>
    `;

    const buyBtn = card.querySelector('.btn-buy-item');
    if (buyBtn) {
      buyBtn.addEventListener('click', () => buyShopItem(item));
    }

    const equipBtn = card.querySelector('.btn-equip-item');
    if (equipBtn) {
      equipBtn.addEventListener('click', () => equipShopItem(item));
    }

    container.appendChild(card);
  });
}

function buyShopItem(item) {
  if (state.user.coins < item.price) {
    showToast('❌ Not enough coins! Play games to earn more.', 'info');
    return;
  }

  state.user.coins -= item.price;
  if (!state.user.inventory.includes(item.id)) {
    state.user.inventory.push(item.id);
  }

  playSound('buy');
  showToast(`🎉 Purchased ${item.name}!`, 'gold');

  // Auto-equip upon purchase
  if (item.type === 'avatar') state.user.avatar = item.value;
  else if (item.type === 'frame') state.user.frame = item.value;
  else if (item.type === 'title') state.user.title = item.value;

  if (state.user.inventory.length >= 5) {
    unlockAchievement('ach_fashionista');
  }

  saveState();
  renderShop();
}

function equipShopItem(item) {
  playSound('equip');
  if (item.type === 'avatar') state.user.avatar = item.value;
  else if (item.type === 'frame') {
    state.user.frame = item.value;
    if (item.value !== 'frame-default') unlockAchievement('ach_frame_collector');
  } else if (item.type === 'title') {
    state.user.title = item.value;
    if (item.value !== 'Architect') unlockAchievement('ach_title_bearer');
  }

  showToast(`✨ Equipped ${item.name}!`, 'purple');
  saveState();
  renderShop();
}

// --- 11. DESKTOP OS WINDOW MANAGER ---
function renderDesktopIcons() {
  const container = document.getElementById('desktop-icons');
  const startList = document.getElementById('start-menu-items');
  if (!container || !startList) return;

  container.innerHTML = '';
  startList.innerHTML = '';

  PROJECTS.forEach(app => {
    // Desktop grid icon
    const iconBtn = document.createElement('div');
    iconBtn.className = 'desktop-icon-btn group';
    iconBtn.innerHTML = `
      <div class="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-700/80 flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 transition-transform">
        ${app.icon}
      </div>
      <span class="text-[11px] font-bold text-slate-200 text-center truncate w-full mt-1.5 group-hover:text-indigo-300">
        ${app.title}
      </span>
    `;
    iconBtn.addEventListener('dblclick', () => createOSWindow(app));
    iconBtn.addEventListener('click', () => playSound('click'));
    container.appendChild(iconBtn);

    // Start menu item
    const startItem = document.createElement('button');
    startItem.className = 'w-full flex items-center gap-3 p-2 rounded-xl hover:bg-slate-800/80 text-left text-xs font-semibold text-slate-200 transition-all';
    startItem.innerHTML = `
      <span class="text-xl">${app.icon}</span>
      <div class="truncate">
        <p class="text-white">${app.title}</p>
        <p class="text-[10px] text-slate-400 font-mono">${app.category}</p>
      </div>
    `;
    startItem.addEventListener('click', () => {
      document.getElementById('os-start-menu').classList.add('hidden');
      createOSWindow(app);
    });
    startList.appendChild(startItem);
  });
}

function createOSWindow(app) {
  pauseMenuMusic();
  checkLaunchAchievements(app.id);
  playSound('launch');

  const existingWin = state.windows.find(w => w.appId === app.id);
  if (existingWin) {
    focusOSWindow(existingWin.id);
    return;
  }

  const winId = 'win-' + Date.now();
  const offset = (state.windows.length * 30) % 180;

  const winObj = {
    id: winId,
    appId: app.id,
    title: app.title,
    icon: app.icon,
    path: app.path,
    x: 60 + offset,
    y: 40 + offset,
    w: 640,
    h: 520,
    minimized: false,
    maximized: false,
    zIndex: ++state.nextZIndex
  };

  state.windows.push(winObj);

  if (state.windows.length >= 3) {
    unlockAchievement('ach_multitasker');
  }
  if (state.windows.length >= 5) {
    unlockAchievement('ach_window_hoarder');
  }
  const winEl = document.createElement('div');
  winEl.id = winId;
  winEl.className = 'os-window active-window';
  winEl.style.left = `${winObj.x}px`;
  winEl.style.top = `${winObj.y}px`;
  winEl.style.width = `${winObj.w}px`;
  winEl.style.height = `${winObj.h}px`;
  winEl.style.zIndex = winObj.zIndex;

  winEl.innerHTML = `
    <div class="os-window-header">
      <div class="os-window-title">
        <span>${app.icon}</span>
        <span>${app.title}</span>
      </div>
      <div class="os-window-controls">
        <button class="win-btn win-btn-min" title="Minimize"></button>
        <button class="win-btn win-btn-max" title="Maximize"></button>
        <button class="win-btn win-btn-close" title="Close"></button>
      </div>
    </div>
    <div class="os-window-content">
      <iframe src="${app.path}" class="os-window-iframe" allow="autoplay; fullscreen"></iframe>
    </div>
    <div class="os-window-resize-handle"></div>
  `;

  // Window interactions
  const header = winEl.querySelector('.os-window-header');
  let isDragging = false;
  let dragX = 0, dragY = 0;

  header.addEventListener('mousedown', (e) => {
    if (e.target.classList.contains('win-btn')) return;
    isDragging = true;
    dragX = e.clientX - winEl.offsetLeft;
    dragY = e.clientY - winEl.offsetTop;
    focusOSWindow(winId);
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const parent = document.getElementById('desktop-workspace');
    const maxX = parent.clientWidth - winEl.offsetWidth;
    const maxY = parent.clientHeight - winEl.offsetHeight;

    winEl.style.left = `${Math.max(0, Math.min(maxX, e.clientX - dragX))}px`;
    winEl.style.top = `${Math.max(0, Math.min(maxY, e.clientY - dragY))}px`;
  });

  document.addEventListener('mouseup', () => { isDragging = false; });

  winEl.addEventListener('mousedown', () => focusOSWindow(winId));

  winEl.querySelector('.win-btn-close').addEventListener('click', () => closeOSWindow(winId));
  winEl.querySelector('.win-btn-min').addEventListener('click', () => toggleMinimizeOSWindow(winId));
  winEl.querySelector('.win-btn-max').addEventListener('click', () => toggleMaximizeOSWindow(winId));

  container.appendChild(winEl);
  updateTaskbar();
  focusOSWindow(winId);

  if (state.windows.length >= 3) {
    unlockAchievement('ach_multitasker');
  }
}

function focusOSWindow(winId) {
  state.activeWindowId = winId;
  const winObj = state.windows.find(w => w.id === winId);
  if (!winObj) return;

  winObj.zIndex = ++state.nextZIndex;
  document.querySelectorAll('.os-window').forEach(el => {
    el.classList.remove('active-window');
    if (el.id === winId) {
      el.classList.add('active-window');
      el.style.zIndex = winObj.zIndex;
      el.style.display = 'flex';
      winObj.minimized = false;
    }
  });
  updateTaskbar();
}

function closeOSWindow(winId) {
  playSound('click');
  const winEl = document.getElementById(winId);
  if (winEl) winEl.remove();
  state.windows = state.windows.filter(w => w.id !== winId);
  updateTaskbar();
  if (state.windows.length === 0 && state.activeView === 'grid') {
    startMenuMusic();
  }
}

function toggleMinimizeOSWindow(winId) {
  playSound('click');
  const winObj = state.windows.find(w => w.id === winId);
  const winEl = document.getElementById(winId);
  if (!winObj || !winEl) return;

  winObj.minimized = !winObj.minimized;
  winEl.style.display = winObj.minimized ? 'none' : 'flex';
  updateTaskbar();
}

function toggleMaximizeOSWindow(winId) {
  playSound('click');
  const winObj = state.windows.find(w => w.id === winId);
  const winEl = document.getElementById(winId);
  if (!winObj || !winEl) return;

  winObj.maximized = !winObj.maximized;
  if (winObj.maximized) {
    winEl.style.left = '0px';
    winEl.style.top = '0px';
    winEl.style.width = '100%';
    winEl.style.height = '100%';
  } else {
    winEl.style.left = `${winObj.x}px`;
    winEl.style.top = `${winObj.y}px`;
    winEl.style.width = `${winObj.w}px`;
    winEl.style.height = `${winObj.h}px`;
  }
}

function updateTaskbar() {
  const container = document.getElementById('taskbar-active-apps');
  if (!container) return;
  container.innerHTML = '';

  state.windows.forEach(w => {
    const btn = document.createElement('button');
    const isActive = state.activeWindowId === w.id && !w.minimized;
    btn.className = `flex items-center gap-2 px-3 py-1 rounded-xl text-xs font-semibold border transition-all ${
      isActive 
        ? 'bg-indigo-600 border-indigo-400 text-white shadow-md' 
        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
    }`;
    btn.innerHTML = `<span>${w.icon}</span><span class="truncate max-w-[100px]">${w.title}</span>`;
    btn.addEventListener('click', () => {
      if (w.minimized) {
        focusOSWindow(w.id);
      } else if (state.activeWindowId === w.id) {
        toggleMinimizeOSWindow(w.id);
      } else {
        focusOSWindow(w.id);
      }
    });
    container.appendChild(btn);
  });
}

// --- 12. SANDBOX SINGLE VIEW ---
function launchSandboxApp(app) {
  pauseMenuMusic();
  checkLaunchAchievements(app.id);
  playSound('launch');

  state.activeSandboxApp = app;
  document.getElementById('sandbox-app-icon').textContent = app.icon;
  document.getElementById('sandbox-app-title').textContent = app.title;
  document.getElementById('sandbox-app-category').textContent = app.category;
  document.getElementById('sandbox-iframe').src = app.path;

  switchView('sandbox');
}

// --- 13. ACHIEVEMENTS VIEW RENDER ---
function renderAchievements() {
  const countEl = document.getElementById('achievements-count');
  const totalEl = document.getElementById('achievements-total');
  const grid = document.getElementById('achievements-grid');
  if (!countEl || !grid) return;

  countEl.textContent = state.user.unlockedAchievements.length;
  if (totalEl) totalEl.textContent = ACHIEVEMENTS.length;
  grid.innerHTML = '';

  ACHIEVEMENTS.forEach(ach => {
    const isUnlocked = state.user.unlockedAchievements.includes(ach.id);
    const card = document.createElement('div');
    card.className = `p-4 rounded-2xl border flex items-center gap-4 transition-all ${
      isUnlocked 
        ? 'bg-slate-900/90 border-indigo-500/40 shadow-lg shadow-indigo-500/10' 
        : 'bg-slate-950/60 border-slate-800/80 opacity-60'
    }`;

    card.innerHTML = `
      <div class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${isUnlocked ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-500'}">
        ${ach.icon}
      </div>
      <div class="flex-1">
        <div class="flex items-center justify-between">
          <h4 class="text-sm font-bold ${isUnlocked ? 'text-white' : 'text-slate-400'}">${ach.title}</h4>
          <span class="text-xs font-mono text-amber-400 font-bold">+${ach.coins} 🪙</span>
        </div>
        <p class="text-xs text-slate-400 mt-0.5">${ach.desc}</p>
        <span class="inline-block mt-2 text-[10px] font-mono px-2 py-0.5 rounded-full ${isUnlocked ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-800 text-slate-500'}">
          ${isUnlocked ? '✓ UNLOCKED' : '🔒 LOCKED'}
        </span>
      </div>
    `;
    grid.appendChild(card);
  });
}

// --- 14. ARCADE MODE & 777 CHALLENGE ENGINE ---
// Strictly Arcade & Action games only!
const ARCADE_CHALLENGE_GAMES = [
  { id: 'cyber-pac', name: 'Cyber Pac: Neon Maze', icon: '🟡', path: '../cyber-pac/index.html', minTarget: 8000, maxTarget: 25000, unit: 'PTS' },
  { id: 'cyber-kong', name: 'Mecha Kong: Rampage', icon: '🦍', path: '../cyber-kong/index.html', minTarget: 6000, maxTarget: 18000, unit: 'PTS' },
  { id: 'cyber-hopper', name: 'Cyber Hopper: Crossroad', icon: '🐸', path: '../cyber-hopper/index.html', minTarget: 60, maxTarget: 180, unit: 'HOPS' },
  { id: 'space-invaders-game', name: 'Cyber Invaders', icon: '👾', path: '../space-invaders-game/index.html', minTarget: 12000, maxTarget: 45000, unit: 'PTS' },
  { id: 'cyber-runner', name: 'Cyber Runner: 80s Highway', icon: '🏎️', path: '../cyber-runner/index.html', minTarget: 5000, maxTarget: 20000, unit: 'METERS' },
  { id: 'neon-pong', name: 'Neon Pong Breakout', icon: '🏓', path: '../neon-pong/index.html', minTarget: 5000, maxTarget: 16000, unit: 'PTS' },
  { id: 'viper-drift', name: 'Viper Drift: Arena', icon: '🐍', path: '../viper-drift/index.html', minTarget: 2500, maxTarget: 8000, unit: 'PTS' },
  { id: 'pixel-defense', name: 'Pixel Defense: Command', icon: '🚀', path: '../pixel-defense/index.html', minTarget: 6000, maxTarget: 22000, unit: 'PTS' },
  { id: 'cyber-centipede', name: 'Cyber Centipede: Swarm', icon: '🐛', path: '../cyber-centipede/index.html', minTarget: 1000, maxTarget: 5000, unit: 'PTS' },
  { id: 'neon-timber', name: 'Neon Timber: Chop', icon: '🪓', path: '../neon-timber/index.html', minTarget: 50, maxTarget: 200, unit: 'LOGS' },
  { id: 'cyber-flappy', name: 'Cyber Flappy: Drone', icon: '🛸', path: '../cyber-flappy/index.html', minTarget: 1000, maxTarget: 5000, unit: 'PTS' },
  { id: 'cyber-rhythm', name: 'Cyber Rhythm: Beat Matrix', icon: '🎵', path: '../cyber-rhythm/index.html', minTarget: 1200, maxTarget: 6000, unit: 'PTS' },
  { id: 'cyber-archery', name: 'Cyber Archery: Master', icon: '🎯', path: '../cyber-archery/index.html', minTarget: 1500, maxTarget: 4500, unit: 'PTS' },
  { id: 'cyber-knife', name: 'Cyber Knife: Kunai Hit', icon: '🗡️', path: '../cyber-knife/index.html', minTarget: 1000, maxTarget: 4000, unit: 'PTS' }
];

function renderArcadeStats() {
  const streakEl = document.getElementById('arcade-streak-count');
  const coinsEl = document.getElementById('arcade-coins-earned');
  if (streakEl) streakEl.textContent = state.user.arcadeChallengesBeaten || 0;
  if (coinsEl) coinsEl.textContent = `+${state.user.arcadeCoinsEarned || 0} 🪙`;
}

function startArcadeSlotSpin() {
  if (state.arcade.isSpinning) return;
  state.arcade.isSpinning = true;
  pauseMenuMusic();
  playSound('slot_spin');

  const statusBadge = document.getElementById('arcade-status-badge');
  if (statusBadge) statusBadge.classList.add('hidden');

  const btn = document.getElementById('btn-spin-arcade');
  if (btn) {
    btn.disabled = true;
    btn.classList.add('opacity-50');
  }

  const reel1 = document.getElementById('slot-reel-1');
  const reel2 = document.getElementById('slot-reel-2');
  const reel3 = document.getElementById('slot-reel-3');
  const strip1 = document.getElementById('slot-strip-1');
  const strip2 = document.getElementById('slot-strip-2');
  const strip3 = document.getElementById('slot-strip-3');

  reel1?.classList.add('slot-spin-active', 'spinning');
  reel2?.classList.add('slot-spin-active', 'spinning');
  reel3?.classList.add('slot-spin-active', 'spinning');

  // Random pick target game
  const targetGame = ARCADE_CHALLENGE_GAMES[Math.floor(Math.random() * ARCADE_CHALLENGE_GAMES.length)];
  const rawTarget = Math.floor(Math.random() * (targetGame.maxTarget - targetGame.minTarget + 1)) + targetGame.minTarget;
  const roundedTarget = targetGame.unit === 'HOPS' ? rawTarget : Math.round(rawTarget / 50) * 50;
  const targetText = `BEAT: ${roundedTarget.toLocaleString()} ${targetGame.unit}`;

  let spinStep = 0;
  const spinInterval = setInterval(() => {
    spinStep++;
    const randomGame = ARCADE_CHALLENGE_GAMES[Math.floor(Math.random() * ARCADE_CHALLENGE_GAMES.length)];
    const tempScore = Math.floor(Math.random() * 5000) + 1500;
    
    if (reel1?.classList.contains('slot-spin-active')) {
      if (strip1) strip1.textContent = randomGame.icon;
    }
    if (reel2?.classList.contains('slot-spin-active')) {
      if (strip2) strip2.textContent = randomGame.name.split(':')[0].toUpperCase();
    }
    if (reel3?.classList.contains('slot-spin-active')) {
      if (strip3) strip3.textContent = `BEAT: ${tempScore.toLocaleString()} PTS`;
    }

    if (spinStep % 2 === 0) {
      playSound('slot_click');
    }
  }, 70);

  // Stop Reel 1 after 1.2s
  setTimeout(() => {
    reel1?.classList.remove('slot-spin-active', 'spinning');
    if (strip1) strip1.textContent = targetGame.icon;
    playSound('click');
  }, 1200);

  // Stop Reel 2 after 1.8s
  setTimeout(() => {
    reel2?.classList.remove('slot-spin-active', 'spinning');
    if (strip2) strip2.textContent = targetGame.name.split(':')[0].toUpperCase();
    playSound('click');
  }, 1800);

  // Stop Reel 3 after 2.4s and finalize challenge
  setTimeout(() => {
    clearInterval(spinInterval);
    reel3?.classList.remove('slot-spin-active', 'spinning');
    if (strip3) strip3.textContent = targetText;
    playSound('achievement');

    state.arcade.currentChallenge = {
      game: targetGame,
      targetScore: roundedTarget,
      unit: targetGame.unit,
      targetText: targetText,
      rewardCoins: 100,
      rewardXP: 200,
      completed: false
    };

    // Load into cabinet screen
    const emptyScreen = document.getElementById('arcade-empty-screen');
    const iframe = document.getElementById('arcade-game-iframe');
    const targetEl = document.getElementById('cabinet-target-score');
    const titleEl = document.getElementById('cabinet-game-title');
    const iconEl = document.getElementById('cabinet-game-icon');
    const descEl = document.getElementById('cabinet-game-desc');

    if (emptyScreen) emptyScreen.classList.add('hidden');
    const viewport = document.getElementById('arcade-screen-viewport');
    if (viewport) viewport.classList.add('game-loaded');

    if (iframe) {
      iframe.classList.remove('hidden');
      iframe.src = targetGame.path;
    }
    if (targetEl) targetEl.textContent = `${roundedTarget.toLocaleString()} ${targetGame.unit}`;
    if (titleEl) titleEl.textContent = targetGame.name;
    if (iconEl) iconEl.textContent = targetGame.icon;
    if (descEl) descEl.textContent = `TARGET: BEAT ${roundedTarget.toLocaleString()} ${targetGame.unit} (+100 🪙)`;

    state.arcade.isSpinning = false;
    if (btn) {
      btn.disabled = false;
      btn.classList.remove('opacity-50');
    }

    showToast(`🎰 NEW HIGH-SCORE CHALLENGE: Beat ${roundedTarget.toLocaleString()} ${targetGame.unit} in ${targetGame.name}!`, 'gold');
  }, 2400);
}

function claimArcadeReward() {
  if (!state.arcade.currentChallenge) return;
  if (state.arcade.currentChallenge.completed) return;

  state.arcade.currentChallenge.completed = true;
  state.user.arcadeChallengesBeaten = (state.user.arcadeChallengesBeaten || 0) + 1;
  state.user.arcadeCoinsEarned = (state.user.arcadeCoinsEarned || 0) + 100;

  playSound('victory_fanfare');
  addXPAndCoins(200, 100);

  unlockAchievement('ach_arcade_challenger');
  if (state.user.arcadeChallengesBeaten >= 5) {
    unlockAchievement('ach_arcade_legend');
  }
  if (state.user.arcadeChallengesBeaten >= 10) {
    unlockAchievement('ach_arcade_god');
  }

  renderArcadeStats();

  const statusBadge = document.getElementById('arcade-status-badge');
  if (statusBadge) statusBadge.classList.remove('hidden');

  showToast(`🎉 TARGET SCORE BEATEN! +100 🪙 Arcade Coins Awarded!`, 'gold');
}

// Automatic Score Listener (Prevents Cheating by verifying real game scores)
window.addEventListener('message', (event) => {
  if (!event.data || typeof event.data !== 'object') return;

  const data = event.data;
  const currentScore = data.score !== undefined ? data.score : (data.hops !== undefined ? data.hops : data.distance);

  if (state.activeView === 'arcade' && state.arcade.currentChallenge && !state.arcade.currentChallenge.completed) {
    if (typeof currentScore === 'number' && currentScore >= state.arcade.currentChallenge.targetScore) {
      claimArcadeReward();
    }
  }
});

// --- 15. COMMAND PALETTE (CTRL+K) ---
function toggleCmdPalette(open) {
  const modal = document.getElementById('modal-cmd-k');
  if (!modal) return;
  modal.classList.toggle('hidden', !open);
  if (open) {
    playSound('click');
    const input = document.getElementById('cmd-input');
    input.value = '';
    input.focus();
    renderCmdResults('');
  }
}

function renderCmdResults(query) {
  const container = document.getElementById('cmd-results');
  if (!container) return;
  container.innerHTML = '';

  const q = query.toLowerCase();

  if (!q || 'arcade mode 777 challenge'.includes(q)) {
    const arcadeItem = document.createElement('div');
    arcadeItem.className = 'flex items-center justify-between p-3 rounded-xl hover:bg-amber-500 hover:text-slate-950 cursor-pointer group transition-all border border-amber-500/30 bg-amber-500/10 mb-2';
    arcadeItem.innerHTML = `
      <div class="flex items-center gap-3">
        <span class="text-xl">🎰</span>
        <div>
          <p class="text-sm font-bold text-amber-300 group-hover:text-slate-950">777 Arcade Challenge Mode</p>
          <p class="text-[10px] text-amber-400 group-hover:text-slate-900 font-mono">Spin random game & beat score target for +100 🪙</p>
        </div>
      </div>
      <span class="text-xs text-amber-400 group-hover:text-slate-950 font-mono font-bold">Play ↵</span>
    `;
    arcadeItem.addEventListener('click', () => {
      toggleCmdPalette(false);
      switchView('arcade');
    });
    container.appendChild(arcadeItem);
  }

  const matchedApps = PROJECTS.filter(p => !q || p.title.toLowerCase().includes(q) || p.tags.some(t => t.includes(q)));

  matchedApps.forEach(app => {
    const item = document.createElement('div');
    item.className = 'flex items-center justify-between p-3 rounded-xl hover:bg-indigo-600 hover:text-white cursor-pointer group transition-all';
    item.innerHTML = `
      <div class="flex items-center gap-3">
        <span class="text-xl">${app.icon}</span>
        <div>
          <p class="text-sm font-bold text-white group-hover:text-white">${app.title}</p>
          <p class="text-[10px] text-slate-400 group-hover:text-indigo-200 font-mono">${app.category}</p>
        </div>
      </div>
      <span class="text-xs text-slate-500 group-hover:text-white font-mono">Launch ↵</span>
    `;
    item.addEventListener('click', () => {
      toggleCmdPalette(false);
      unlockAchievement('ach_cmd_master');
      launchSandboxApp(app);
    });
    container.appendChild(item);
  });
}

// --- 15. PROFILE UI UPDATE ---
function updateProfileUI() {
  const nameEl = document.getElementById('player-name');
  const nameInput = document.getElementById('player-name-input');
  const avatarIcon = document.getElementById('player-avatar-icon');
  const avatarFrame = document.getElementById('player-avatar-frame');
  const titleBadge = document.getElementById('player-title-badge');
  const levelBadge = document.getElementById('player-level-badge');
  const coinsEl = document.getElementById('player-coins');
  const xpBar = document.getElementById('player-xp-bar');

  if (nameEl) nameEl.textContent = state.user.name;
  if (nameInput && nameInput.value !== state.user.name && document.activeElement !== nameInput) {
    nameInput.value = state.user.name;
  }
  if (avatarIcon) avatarIcon.innerHTML = renderAvatarGraphic(state.user.avatar);
  if (avatarFrame) avatarFrame.className = `avatar-frame-box ${state.user.frame}`;
  if (titleBadge) titleBadge.textContent = state.user.title;
  if (levelBadge) levelBadge.textContent = state.user.level;
  if (coinsEl) coinsEl.textContent = state.user.coins;
  if (xpBar) xpBar.style.width = `${(state.user.xp % 1000) / 10}%`;

  // Modal profile elements
  const modalAvatar = document.getElementById('modal-avatar-display');
  const modalFrame = document.getElementById('modal-avatar-frame');
  const modalTitle = document.getElementById('modal-title-display');
  const modalLevel = document.getElementById('modal-level-badge');
  const statLaunches = document.getElementById('stat-total-launches');
  const statCoins = document.getElementById('stat-coins-earned');

  if (modalAvatar) modalAvatar.innerHTML = renderAvatarGraphic(state.user.avatar);
  if (modalFrame) modalFrame.className = `avatar-frame-box ${state.user.frame} w-24 h-24 p-2 flex items-center justify-center`;
  if (modalTitle) modalTitle.textContent = state.user.title;
  if (modalLevel) modalLevel.textContent = `LVL ${state.user.level}`;
  if (statLaunches) statLaunches.textContent = state.user.totalLaunches;
  if (statCoins) statCoins.textContent = state.user.coins;

  // Render modal owned avatars quick switcher
  const modalAvatarsContainer = document.getElementById('modal-owned-avatars');
  if (modalAvatarsContainer) {
    modalAvatarsContainer.innerHTML = '';
    const ownedAvatars = SHOP_ITEMS.filter(i => i.type === 'avatar' && (state.user.inventory.includes(i.id) || i.price === 0));
    ownedAvatars.forEach(av => {
      const btn = document.createElement('button');
      const isEquipped = state.user.avatar === av.value;
      btn.className = `p-2 rounded-xl text-xl transition-all flex items-center justify-center w-10 h-10 ${
        isEquipped 
          ? 'bg-indigo-600 ring-2 ring-indigo-400 scale-110 shadow-md' 
          : 'bg-slate-800 hover:bg-slate-700'
      }`;
      btn.innerHTML = renderAvatarGraphic(av.value);
      btn.title = av.name;
      btn.addEventListener('click', () => {
        playSound('equip');
        state.user.avatar = av.value;
        saveState();
        showToast(`Equipped ${av.name} Avatar!`, 'purple');
      });
      modalAvatarsContainer.appendChild(btn);
    });
  }

  // Render modal owned frames quick switcher
  const modalFramesContainer = document.getElementById('modal-owned-frames');
  if (modalFramesContainer) {
    modalFramesContainer.innerHTML = '';
    const ownedFrames = SHOP_ITEMS.filter(i => i.type === 'frame' && (state.user.inventory.includes(i.id) || i.price === 0));
    ownedFrames.forEach(fr => {
      const btn = document.createElement('button');
      const isEquipped = state.user.frame === fr.value;
      btn.className = `px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
        isEquipped 
          ? 'bg-indigo-600 text-white ring-2 ring-indigo-400 shadow-md' 
          : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
      }`;
      btn.textContent = fr.name;
      btn.addEventListener('click', () => {
        playSound('equip');
        state.user.frame = fr.value;
        saveState();
        showToast(`Equipped ${fr.name} Frame!`, 'purple');
      });
      modalFramesContainer.appendChild(btn);
    });
  }
}

// --- 16. CLOCK TICKER FOR DESKTOP OS ---
function startClock() {
  function tick() {
    const el = document.getElementById('os-clock');
    if (el) {
      const now = new Date();
      el.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  }
  tick();
  setInterval(tick, 1000);
}

// --- 17. INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
  const hasBreachParam = window.location.search.includes('compy_breach=true');

  if (hasBreachParam) {
    window.isCompyBreached = true;
    document.body.classList.add('hub-breached');
    if (window.hubMusicEngine) {
      window.hubMusicEngine.setMode('breach');
    }
    // Advance quest flags in storage so any future refresh/navigation is completely normal
    localStorage.removeItem('compy_arg_stage');
    localStorage.setItem('compy_arg_completed', 'true');
    localStorage.setItem('compy_q2_active', 'true');
  } else {
    // Normal Mode: Cleanse breach, remove glitch filters, reset titles
    localStorage.removeItem('compy_arg_stage');
    document.body.classList.remove('hub-breached');
    document.body.style.filter = '';
    window.isCompyBreached = false;
  }

  loadState();
  updateProfileUI();

  // Clean URL parameters immediately so pressing F5/refresh always reloads cleanly into normal hub mode
  if (window.location.search.length > 0) {
    try {
      window.history.replaceState({}, document.title, window.location.pathname);
    } catch(e) {}
  }

  // Render initial components
  renderCategoryChips();
  renderAppCards();
  renderDesktopIcons();
  renderAchievements();
  startClock();

  if (window.isCompyBreached) {
    startBreachTextScrambler();
  }

  // Check for Quest 2: Serial Killer Completion Reward on refresh
  const isQ2Refresh = localStorage.getItem('compy_q2_completed') === 'true' && !localStorage.getItem('compy_q2_reward_claimed');
  if (isQ2Refresh) {
    localStorage.setItem('compy_q2_reward_claimed', 'true');
    if (!state.user.inventory.includes('avatar-bloody')) state.user.inventory.push('avatar-bloody');
    if (!state.user.inventory.includes('frame-bloody')) state.user.inventory.push('frame-bloody');
    if (!state.user.inventory.includes('title-serial-killer')) state.user.inventory.push('title-serial-killer');

    state.user.avatar = '🩸💀';
    state.user.frame = 'frame-bloody';
    state.user.title = 'Serial Killer';

    unlockAchievement('ach_secret_killer');
    saveState();
    updateProfileUI();

    setTimeout(() => {
      showQuest2UnlockModal();
    }, 400);
  }

  // Autoplay main menu BGM on site load
  startMenuMusic();

  // Player Name Input Listener in Profile Modal
  const nameInput = document.getElementById('player-name-input');
  if (nameInput) {
    nameInput.addEventListener('input', (e) => {
      const val = e.target.value.trim();
      state.user.name = val || 'Player';
      localStorage.setItem('omniverse_player_custom_name', state.user.name);
      unlockAchievement('ach_secret_combo');
      saveState();
    });
    nameInput.addEventListener('change', () => {
      const val = nameInput.value.trim();
      state.user.name = val || 'Player';
      localStorage.setItem('omniverse_player_custom_name', state.user.name);
      saveState();
      showToast(`💾 Saved Profile Name: ${state.user.name}`, 'gold');
    });
  }

  // Top Nav View Switchers
  document.getElementById('btn-brand-home').addEventListener('click', () => switchView('grid'));
  document.getElementById('tab-grid').addEventListener('click', () => switchView('grid'));
  document.getElementById('tab-arcade')?.addEventListener('click', () => switchView('arcade'));
  document.getElementById('tab-desktop').addEventListener('click', () => switchView('desktop'));
  document.getElementById('tab-shop').addEventListener('click', () => switchView('shop'));
  document.getElementById('tab-achievements').addEventListener('click', () => switchView('achievements'));

  // Arcade Mode Actions
  document.getElementById('btn-spin-arcade')?.addEventListener('click', () => startArcadeSlotSpin());
  document.getElementById('btn-screen-spin')?.addEventListener('click', () => startArcadeSlotSpin());
  document.getElementById('btn-claim-reward')?.addEventListener('click', () => claimArcadeReward());
  document.getElementById('btn-arcade-claim-pass')?.addEventListener('click', () => claimArcadeReward());
  document.getElementById('btn-arcade-reroll')?.addEventListener('click', () => startArcadeSlotSpin());
  
  document.getElementById('btn-arcade-reset-game')?.addEventListener('click', () => {
    const iframe = document.getElementById('arcade-game-iframe');
    if (iframe && state.arcade.currentChallenge) {
      playSound('click');
      iframe.src = state.arcade.currentChallenge.game.path;
      showToast('🔄 Arcade Game Restarted!', 'info');
    }
  });

  document.getElementById('btn-arcade-fullscreen')?.addEventListener('click', () => {
    const cabinet = document.getElementById('arcade-cabinet-container');
    if (cabinet) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        cabinet.requestFullscreen().catch(e => console.warn(e));
      }
    }
  });

  // Hero Section Buttons
  document.getElementById('btn-hero-arcade')?.addEventListener('click', () => switchView('arcade'));
  document.getElementById('btn-hero-launch').addEventListener('click', () => launchSandboxApp(PROJECTS[0]));
  document.getElementById('btn-hero-desktop').addEventListener('click', () => switchView('desktop'));
  document.getElementById('btn-hero-shop').addEventListener('click', () => switchView('shop'));
  document.getElementById('btn-modal-open-shop').addEventListener('click', () => {
    document.getElementById('modal-profile').classList.add('hidden');
    switchView('shop');
  });

  // Shop Filter Tabs
  document.querySelectorAll('.shop-filter-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      playSound('click');
      document.querySelectorAll('.shop-filter-btn').forEach(b => {
        b.className = 'shop-filter-btn px-4 py-2 rounded-xl text-xs font-bold transition-all bg-slate-900 border border-slate-800 text-slate-400 hover:text-white';
      });
      e.target.className = 'shop-filter-btn active px-4 py-2 rounded-xl text-xs font-bold transition-all bg-indigo-600 text-white shadow-md shadow-indigo-600/30';
      renderShop(e.target.dataset.filter);
    });
  });

  // Search Input Listener
  document.getElementById('grid-search-input').addEventListener('input', (e) => {
    state.searchQuery = e.target.value;
    renderAppCards();
  });

  // Sound & BGM Toggle
  document.getElementById('btn-sound-toggle').addEventListener('click', () => {
    toggleSoundAndMusic();
  });

  // OS Start Button
  document.getElementById('btn-os-start').addEventListener('click', () => {
    playSound('click');
    document.getElementById('os-start-menu').classList.toggle('hidden');
  });

  // Desktop OS Quick Actions
  document.getElementById('btn-desktop-cascade')?.addEventListener('click', () => {
    state.windows.forEach((w, i) => {
      const el = document.getElementById(w.id);
      if (el) {
        w.x = 40 + i * 30;
        w.y = 30 + i * 30;
        el.style.left = `${w.x}px`;
        el.style.top = `${w.y}px`;
      }
    });
  });

  document.getElementById('btn-desktop-minimize-all')?.addEventListener('click', () => {
    state.windows.forEach(w => {
      w.minimized = true;
      const el = document.getElementById(w.id);
      if (el) el.style.display = 'none';
    });
    updateTaskbar();
  });

  // Sandbox Back Button
  document.getElementById('btn-sandbox-back').addEventListener('click', () => {
    const oldIframe = document.getElementById('sandbox-iframe');
    if (oldIframe) {
      oldIframe.src = 'about:blank';
      const newIframe = oldIframe.cloneNode(false);
      oldIframe.parentNode.replaceChild(newIframe, oldIframe);
    }
    state.activeSandboxApp = null;
    switchView('grid');
  });

  // Sandbox Reload
  document.getElementById('btn-sandbox-reload').addEventListener('click', () => {
    if (state.activeSandboxApp) {
      document.getElementById('sandbox-iframe').src = state.activeSandboxApp.path;
    }
  });

  // Sandbox Popout
  document.getElementById('btn-sandbox-popout').addEventListener('click', () => {
    if (state.activeSandboxApp) {
      window.open(state.activeSandboxApp.path, '_blank');
    }
  });

  // Sandbox Fullscreen
  document.getElementById('btn-sandbox-fullscreen').addEventListener('click', () => {
    const el = document.getElementById('view-sandbox');
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      el.requestFullscreen().catch(e => console.warn(e));
    }
  });

  // Cmd Palette listeners
  document.getElementById('btn-cmd-k').addEventListener('click', () => toggleCmdPalette(true));
  document.getElementById('modal-cmd-k').addEventListener('click', (e) => {
    if (e.target.id === 'modal-cmd-k') toggleCmdPalette(false);
  });
  document.getElementById('cmd-input').addEventListener('input', (e) => renderCmdResults(e.target.value));

  document.addEventListener('keydown', (e) => {
    const isInput = ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName);
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      toggleCmdPalette(true);
    }
    if (e.key === 'Escape') {
      toggleCmdPalette(false);
      document.getElementById('modal-profile').classList.add('hidden');
      document.getElementById('os-start-menu').classList.add('hidden');
    }

    // Prevent arrow keys and space from scrolling the browser window when playing games
    if (!isInput && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'Spacebar', 'PageUp', 'PageDown'].includes(e.key)) {
      e.preventDefault();
      
      // Forward key event to active arcade or sandbox iframe
      const activeIframe = state.activeView === 'arcade' 
        ? document.getElementById('arcade-game-iframe')
        : (state.activeView === 'sandbox' ? document.getElementById('sandbox-iframe') : null);

      if (activeIframe && activeIframe.contentWindow) {
        try {
          activeIframe.contentWindow.dispatchEvent(new KeyboardEvent('keydown', {
            key: e.key,
            code: e.code,
            keyCode: e.keyCode,
            which: e.which,
            bubbles: true,
            cancelable: true
          }));
        } catch (err) {}
      }
    }
  }, { passive: false });

  // Profile Modal Trigger
  document.getElementById('btn-profile-trigger').addEventListener('click', () => {
    playSound('click');
    document.getElementById('modal-profile').classList.remove('hidden');
  });
  document.getElementById('btn-close-profile').addEventListener('click', () => {
    document.getElementById('modal-profile').classList.add('hidden');
  });

  // Global Audio Gesture Unlock (Resumes AudioContext without intruding on gameplay)
  const unlockAllAudio = () => {
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
    if (window.hubMusicEngine) {
      window.hubMusicEngine.init();
      if (window.hubMusicEngine.audioCtx && window.hubMusicEngine.audioCtx.state === 'suspended') {
        window.hubMusicEngine.audioCtx.resume().catch(() => {});
      }
      const allowedViews = ['grid', 'shop', 'achievements', 'desktop'];
      if (!window.hubMusicEngine.isPlaying && !state.soundMuted && allowedViews.includes(state.activeView) && state.activeSandboxApp === null) {
        startMenuMusic();
      }
    }
  };
  ['click', 'pointerdown', 'keydown', 'touchstart'].forEach(evt => {
    window.addEventListener(evt, unlockAllAudio, { passive: true, once: true });
  });

  // Initialize Gamblr Twinkling Star Engine
  const starEngine = new GamblrStarEngine();
  starEngine.init();
});

// --- GAMBLR CYBER STAR BACKGROUND ENGINE ---
class GamblrStarEngine {
  constructor() {
    this.canvas = document.getElementById('gamblr-stars-canvas');
    this.ctx = null;
    this.stars = [];
    this.colors = ['#00ff9d', '#00b4d8', '#ffd700', '#c084fc', '#ffffff', '#38bdf8'];
    this.animId = null;
  }

  init() {
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.resize();

    window.addEventListener('resize', () => this.resize());
    this.createStars(75);
    this.startLoop();
  }

  resize() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  createStars(count) {
    this.stars = [];
    for (let i = 0; i < count; i++) {
      this.stars.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: Math.random() * 7 + 4,
        innerSize: Math.random() * 2 + 1,
        color: this.colors[Math.floor(Math.random() * this.colors.length)],
        rotation: Math.random() * Math.PI,
        rotSpeed: (Math.random() - 0.5) * 0.02,
        twinkleSpeed: Math.random() * 0.03 + 0.01,
        twinklePhase: Math.random() * Math.PI * 2,
        vy: -(Math.random() * 0.45 + 0.15),
        vx: (Math.random() - 0.5) * 0.25
      });
    }
  }

  drawStar(cx, cy, outerRadius, innerRadius, rotation, color, opacity) {
    if (!this.ctx) return;
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rotation);
    ctx.globalAlpha = Math.max(0, Math.min(1, opacity));
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 14 * opacity;

    ctx.beginPath();
    let angle = -Math.PI / 2;
    const step = Math.PI / 4;
    for (let i = 0; i < 8; i++) {
      const r = (i % 2 === 0) ? outerRadius : innerRadius;
      const x = Math.cos(angle) * r;
      const y = Math.sin(angle) * r;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
      angle += step;
    }
    ctx.closePath();
    ctx.fill();

    // Crosshair flare rays
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.globalAlpha = opacity * 0.6;
    ctx.beginPath();
    ctx.moveTo(-outerRadius * 1.5, 0);
    ctx.lineTo(outerRadius * 1.5, 0);
    ctx.moveTo(0, -outerRadius * 1.5);
    ctx.lineTo(0, outerRadius * 1.5);
    ctx.stroke();

    ctx.restore();
  }

  startLoop() {
    const render = () => {
      if (this.ctx && this.canvas) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        const now = Date.now() * 0.002;

        this.stars.forEach(star => {
          star.x += star.vx;
          star.y += star.vy;
          star.rotation += star.rotSpeed;

          if (star.y < -20) star.y = window.innerHeight + 20;
          if (star.x < -20) star.x = window.innerWidth + 20;
          if (star.x > window.innerWidth + 20) star.x = -20;

          const opacity = (Math.sin(now * star.twinkleSpeed * 50 + star.twinklePhase) + 1) * 0.45 + 0.1;
          this.drawStar(star.x, star.y, star.size, star.innerSize, star.rotation, star.color, opacity);
        });
      }
      this.animId = requestAnimationFrame(render);
    };
    render();
  }
}
