/**
 * Cyber Chess: Tactical Matrix — Retro Synth Cyberpunk Chess Engine
 */

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const turnIndicator = document.getElementById('turn-indicator');
const gameStatus = document.getElementById('game-status');
const startOverlay = document.getElementById('start-overlay');
const btnVsAi = document.getElementById('btn-vs-ai');
const btn2p = document.getElementById('btn-2p');
const btnReset = document.getElementById('btn-reset');
const btnModeToggle = document.getElementById('btn-mode-toggle');

const BOARD_SIZE = 8;
const TILE_SIZE = 500 / BOARD_SIZE;

// --- 1. PROCEDURAL CHIPTUNE AUDIO ---
class ChessAudio {
  constructor() {
    this.ctx = null;
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
    };
    ['click', 'keydown', 'touchstart', 'pointerdown', 'mousedown'].forEach(evt => {
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

  playMove() {
    const actx = this.ensureCtx();
    if (!actx || actx.state === 'suspended') return;
    try {
      const osc = actx.createOscillator();
      const gain = actx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, actx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, actx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.12, actx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, actx.currentTime + 0.09);
      osc.connect(gain);
      gain.connect(actx.destination);
      osc.start();
      osc.stop(actx.currentTime + 0.1);
    } catch(e) {}
  }

  playCapture() {
    const actx = this.ensureCtx();
    if (!actx || actx.state === 'suspended') return;
    try {
      const osc = actx.createOscillator();
      const gain = actx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(600, actx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(150, actx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.18, actx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, actx.currentTime + 0.16);
      osc.connect(gain);
      gain.connect(actx.destination);
      osc.start();
      osc.stop(actx.currentTime + 0.18);
    } catch(e) {}
  }
}

const audio = new ChessAudio();

// --- 2. CHESS BOARD & PIECE UNICODE ---
const UNICODE_PIECES = {
  wP: '♙', wR: '♖', wN: '♘', wB: '♗', wQ: '♕', wK: '♔',
  bP: '♟', bR: '♜', bN: '♞', bB: '♝', bQ: '♛', bK: '♚'
};

let board = [];
let turn = 'w'; // 'w' or 'b'
let vsAi = true;
let selectedSquare = null; // { r, c }
let validMoves = []; // array of { r, c }
let particles = [];
let gameState = 'PLAYING';

function initBoard() {
  board = [
    ['bR', 'bN', 'bB', 'bQ', 'bK', 'bB', 'bN', 'bR'],
    ['bP', 'bP', 'bP', 'bP', 'bP', 'bP', 'bP', 'bP'],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    ['wP', 'wP', 'wP', 'wP', 'wP', 'wP', 'wP', 'wP'],
    ['wR', 'wN', 'wB', 'wQ', 'wK', 'wB', 'wN', 'wR']
  ];
  turn = 'w';
  selectedSquare = null;
  validMoves = [];
  particles = [];
  gameState = 'PLAYING';
  if (startOverlay) startOverlay.classList.add('hidden');
  updateHUD();
}

function updateHUD() {
  turnIndicator.textContent = turn === 'w' ? "WHITE'S TURN" : "BLACK'S TURN";
  turnIndicator.className = turn === 'w' ? "px-3 py-1 bg-cyan-500/20 border border-cyan-500/50 rounded-lg text-cyan-300 font-bold" : "px-3 py-1 bg-pink-500/20 border border-pink-500/50 rounded-lg text-pink-300 font-bold";
  gameStatus.textContent = vsAi ? "VS MAINFRAME AI" : "2-PLAYER MODE";
  if (btnModeToggle) btnModeToggle.textContent = vsAi ? "🤖 VS AI" : "👥 2-PLAYER";
}

btnVsAi.addEventListener('click', () => {
  vsAi = true;
  startGame();
});

btn2p.addEventListener('click', () => {
  vsAi = false;
  startGame();
});

btnReset.addEventListener('click', initBoard);

if (btnModeToggle) {
  btnModeToggle.addEventListener('click', () => {
    vsAi = !vsAi;
    updateHUD();
  });
}

function startGame() {
  initBoard();
  gameState = 'PLAYING';
  if (startOverlay) startOverlay.classList.add('hidden');
}

// --- 3. LEGAL MOVE GENERATION ---
function getLegalMoves(r, c) {
  if (!board[r] || !board[r][c]) return [];
  const piece = board[r][c];
  const color = piece[0];
  const type = piece[1];
  const moves = [];

  const addMove = (nr, nc) => {
    if (nr < 0 || nr >= 8 || nc < 0 || nc >= 8) return false;
    const target = board[nr][nc];
    if (!target) {
      moves.push({ r: nr, c: nc });
      return true;
    }
    if (target[0] !== color) {
      moves.push({ r: nr, c: nc });
    }
    return false; // Stopped by piece
  };

  // Pawns
  if (type === 'P') {
    const dir = color === 'w' ? -1 : 1;
    const startRow = color === 'w' ? 6 : 1;
    // Move 1
    if (r + dir >= 0 && r + dir < 8 && !board[r + dir][c]) {
      moves.push({ r: r + dir, c });
      // Move 2 from start
      if (r === startRow && !board[r + 2 * dir][c]) {
        moves.push({ r: r + 2 * dir, c });
      }
    }
    // Captures
    [-1, 1].forEach(dc => {
      const nr = r + dir, nc = c + dc;
      if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
        const target = board[nr][nc];
        if (target && target[0] !== color) moves.push({ r: nr, c: nc });
      }
    });
  }

  // Knights
  if (type === 'N') {
    [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]].forEach(([dr, dc]) => {
      addMove(r + dr, c + dc);
    });
  }

  // Kings
  if (type === 'K') {
    [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]].forEach(([dr, dc]) => {
      addMove(r + dr, c + dc);
    });
  }

  // Rooks / Queens (Orthogonal)
  if (type === 'R' || type === 'Q') {
    [[-1,0],[1,0],[0,-1],[0,1]].forEach(([dr, dc]) => {
      let step = 1;
      while (addMove(r + dr * step, c + dc * step)) step++;
    });
  }

  // Bishops / Queens (Diagonal)
  if (type === 'B' || type === 'Q') {
    [[-1,-1],[-1,1],[1,-1],[1,1]].forEach(([dr, dc]) => {
      let step = 1;
      while (addMove(r + dr * step, c + dc * step)) step++;
    });
  }

  return moves;
}

// --- 4. BOARD INTERACTION & AI ---
canvas.addEventListener('click', (e) => {
  if (gameState !== 'PLAYING') return;

  const rect = canvas.getBoundingClientRect();
  const c = Math.floor((e.clientX - rect.left) / TILE_SIZE);
  const r = Math.floor((e.clientY - rect.top) / TILE_SIZE);

  if (selectedSquare) {
    // Check if clicked square is valid move
    const move = validMoves.find(m => m.r === r && m.c === c);
    if (move) {
      makeMove(selectedSquare.r, selectedSquare.c, r, c);
      selectedSquare = null;
      validMoves = [];

      // AI Response Turn
      if (vsAi && turn === 'b' && gameState === 'PLAYING') {
        setTimeout(makeAiMove, 350);
      }
      return;
    }
  }

  // Select piece of current turn color
  const piece = board[r] ? board[r][c] : null;
  if (piece && piece[0] === turn) {
    selectedSquare = { r, c };
    validMoves = getLegalMoves(r, c);
  } else {
    selectedSquare = null;
    validMoves = [];
  }
});

function makeMove(fromR, fromC, toR, toC) {
  const piece = board[fromR][fromC];
  const target = board[toR][toC];

  board[toR][toC] = piece;
  board[fromR][fromC] = null;

  if (target) {
    audio.playCapture();
    addSparks(toC * TILE_SIZE + TILE_SIZE / 2, toR * TILE_SIZE + TILE_SIZE / 2, '#ec4899', 20);
  } else {
    audio.playMove();
  }

  // Check King Capture / Victory
  if (target === 'wK' || target === 'bK') {
    gameState = 'GAMEOVER';
    startOverlay.innerHTML = `
      <div class="text-6xl mb-2 animate-bounce">👑🏆</div>
      <h2 class="font-orbitron font-black text-2xl tracking-wider text-cyan-400 mb-2">${turn === 'w' ? 'WHITE' : 'BLACK'} VICTORIOUS!</h2>
      <button id="btn-restart" class="font-orbitron font-bold px-8 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 text-slate-950 rounded-lg shadow-lg">
        PLAY AGAIN
      </button>
    `;
    startOverlay.classList.remove('hidden');
    document.getElementById('btn-restart').addEventListener('click', startGame);
    return;
  }

  turn = turn === 'w' ? 'b' : 'w';
  updateHUD();
}

// Tactical AI Engine
function makeAiMove() {
  const allMoves = [];
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (board[r] && board[r][c] && board[r][c][0] === 'b') {
        const moves = getLegalMoves(r, c);
        moves.forEach(m => {
          const target = board[m.r][m.c];
          let score = 0;
          if (target) {
            score = target[1] === 'Q' ? 90 : (target[1] === 'R' ? 50 : 30);
          }
          allMoves.push({ fromR: r, fromC: c, toR: m.r, toC: m.c, score });
        });
      }
    }
  }

  if (allMoves.length > 0) {
    allMoves.sort((a, b) => b.score - a.score);
    const bestMove = allMoves[0];
    makeMove(bestMove.fromR, bestMove.fromC, bestMove.toR, bestMove.toC);
  }
}

function addSparks(x, y, color, count = 15) {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 1 + Math.random() * 4;
    particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1,
      decay: 0.04,
      color: color || '#38bdf8'
    });
  }
}

// --- 5. RENDER LOOP ---
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw 8x8 Board
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const isDark = (r + c) % 2 === 1;
      ctx.fillStyle = isDark ? '#0f172a' : '#1e293b';
      ctx.fillRect(c * TILE_SIZE, r * TILE_SIZE, TILE_SIZE, TILE_SIZE);

      // Selected Square Highlight
      if (selectedSquare && selectedSquare.r === r && selectedSquare.c === c) {
        ctx.fillStyle = 'rgba(6, 182, 212, 0.4)';
        ctx.fillRect(c * TILE_SIZE, r * TILE_SIZE, TILE_SIZE, TILE_SIZE);
      }

      // Valid Moves Highlight
      if (validMoves.some(m => m.r === r && m.c === c)) {
        ctx.save();
        const hasPiece = board[r] && board[r][c];
        ctx.fillStyle = hasPiece ? 'rgba(236, 72, 153, 0.5)' : 'rgba(6, 182, 212, 0.5)';
        ctx.beginPath();
        ctx.arc(c * TILE_SIZE + TILE_SIZE / 2, r * TILE_SIZE + TILE_SIZE / 2, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Render Piece
      const piece = board[r] ? board[r][c] : null;
      if (piece) {
        ctx.save();
        ctx.font = '36px JetBrains Mono';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = piece[0] === 'w' ? '#38bdf8' : '#ec4899';
        ctx.shadowColor = piece[0] === 'w' ? '#38bdf8' : '#ec4899';
        ctx.shadowBlur = 12;
        ctx.fillText(UNICODE_PIECES[piece], c * TILE_SIZE + TILE_SIZE / 2, r * TILE_SIZE + TILE_SIZE / 2);
        ctx.restore();
      }
    }
  }

  // Draw Particles
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.life -= p.decay;
    if (p.life <= 0) {
      particles.splice(i, 1);
    } else {
      ctx.save();
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, 3, 3);
      ctx.restore();
    }
  }
}

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

function update() {}

// Auto-initialize board immediately on load!
initBoard();
requestAnimationFrame(gameLoop);
