/**
 * Cyber Chess: Tactical Matrix — Minimax Alpha-Beta AI & Custom Vector Canvas Geometry
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

// --- 2. GAME STATE & BOARD SETUP ---
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
  gameStatus.textContent = vsAi ? "MAINFRAME AI v2.0" : "2-PLAYER MODE";
  if (btnModeToggle) btnModeToggle.textContent = vsAi ? "VS AI" : "2-PLAYER";
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
function getLegalMoves(r, c, testBoard = board) {
  if (!testBoard[r] || !testBoard[r][c]) return [];
  const piece = testBoard[r][c];
  const color = piece[0];
  const type = piece[1];
  const moves = [];

  const addMove = (nr, nc) => {
    if (nr < 0 || nr >= 8 || nc < 0 || nc >= 8) return false;
    const target = testBoard[nr][nc];
    if (!target) {
      moves.push({ r: nr, c: nc });
      return true;
    }
    if (target[0] !== color) {
      moves.push({ r: nr, c: nc });
    }
    return false;
  };

  // Pawns
  if (type === 'P') {
    const dir = color === 'w' ? -1 : 1;
    const startRow = color === 'w' ? 6 : 1;
    if (r + dir >= 0 && r + dir < 8 && !testBoard[r + dir][c]) {
      moves.push({ r: r + dir, c });
      if (r === startRow && !testBoard[r + 2 * dir][c]) {
        moves.push({ r: r + 2 * dir, c });
      }
    }
    [-1, 1].forEach(dc => {
      const nr = r + dir, nc = c + dc;
      if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
        const target = testBoard[nr][nc];
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

// --- 4. 10X SMARTER MINIMAX ALPHA-BETA CHESS AI ---
const PIECE_VALUES = { P: 100, N: 320, B: 330, R: 500, Q: 900, K: 20000 };

// Piece-Square Positional Tables
const PAWN_PST = [
  [ 0,  0,  0,  0,  0,  0,  0,  0],
  [50, 50, 50, 50, 50, 50, 50, 50],
  [10, 10, 20, 30, 30, 20, 10, 10],
  [ 5,  5, 10, 25, 25, 10,  5,  5],
  [ 0,  0,  0, 20, 20,  0,  0,  0],
  [ 5, -5,-10,  0,  0,-10, -5,  5],
  [ 5, 10, 10,-20,-20, 10, 10,  5],
  [ 0,  0,  0,  0,  0,  0,  0,  0]
];

const KNIGHT_PST = [
  [-50,-40,-30,-30,-30,-30,-40,-50],
  [-40,-20,  0,  0,  0,  0,-20,-40],
  [-30,  0, 10, 15, 15, 10,  0,-30],
  [-30,  5, 15, 20, 20, 15,  5,-30],
  [-30,  0, 15, 20, 20, 15,  0,-30],
  [-30,  5, 10, 15, 15, 10,  5,-30],
  [-40,-20,  0,  5,  5,  0,-20,-40],
  [-50,-40,-30,-30,-30,-30,-40,-50]
];

const BISHOP_PST = [
  [-20,-10,-10,-10,-10,-10,-10,-20],
  [-10,  0,  0,  0,  0,  0,  0,-10],
  [-10,  0,  5, 10, 10,  5,  0,-10],
  [-10,  5,  5, 10, 10,  5,  5,-10],
  [-10,  0, 10, 10, 10, 10,  0,-10],
  [-10, 10, 10, 10, 10, 10, 10,-10],
  [-10,  5,  0,  0,  0,  0,  5,-10],
  [-20,-10,-10,-10,-10,-10,-10,-20]
];

function evaluateBoard(b) {
  let score = 0;
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = b[r][c];
      if (!piece) continue;
      const color = piece[0];
      const type = piece[1];

      let val = PIECE_VALUES[type] || 0;
      let pst = 0;

      if (type === 'P') pst = PAWN_PST[color === 'w' ? r : 7 - r][c];
      else if (type === 'N') pst = KNIGHT_PST[r][c];
      else if (type === 'B') pst = BISHOP_PST[r][c];

      const totalVal = val + pst;
      score += (color === 'b' ? totalVal : -totalVal);
    }
  }
  return score;
}

function getAllMovesForColor(b, color) {
  const allMoves = [];
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (b[r] && b[r][c] && b[r][c][0] === color) {
        const moves = getLegalMoves(r, c, b);
        moves.forEach(m => {
          allMoves.push({ fromR: r, fromC: c, toR: m.r, toC: m.c });
        });
      }
    }
  }
  return allMoves;
}

function minimax(b, depth, alpha, beta, isMaximizing) {
  if (depth === 0) return evaluateBoard(b);

  const moves = getAllMovesForColor(b, isMaximizing ? 'b' : 'w');
  if (moves.length === 0) return evaluateBoard(b);

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const m of moves) {
      const savedTo = b[m.toR][m.toC];
      const savedFrom = b[m.fromR][m.fromC];
      b[m.toR][m.toC] = savedFrom;
      b[m.fromR][m.fromC] = null;

      const evalVal = minimax(b, depth - 1, alpha, beta, false);

      b[m.fromR][m.fromC] = savedFrom;
      b[m.toR][m.toC] = savedTo;

      maxEval = Math.max(maxEval, evalVal);
      alpha = Math.max(alpha, evalVal);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const m of moves) {
      const savedTo = b[m.toR][m.toC];
      const savedFrom = b[m.fromR][m.fromC];
      b[m.toR][m.toC] = savedFrom;
      b[m.fromR][m.fromC] = null;

      const evalVal = minimax(b, depth - 1, alpha, beta, true);

      b[m.fromR][m.fromC] = savedFrom;
      b[m.toR][m.toC] = savedTo;

      minEval = Math.min(minEval, evalVal);
      beta = Math.min(beta, evalVal);
      if (beta <= alpha) break;
    }
    return minEval;
  }
}

function makeAiMove() {
  const moves = getAllMovesForColor(board, 'b');
  if (moves.length === 0) return;

  let bestMove = null;
  let bestScore = -Infinity;

  // Move ordering: evaluate captures first
  moves.sort((a, b) => {
    const targetA = board[a.toR][a.toC] ? (PIECE_VALUES[board[a.toR][a.toC][1]] || 0) : 0;
    const targetB = board[b.toR][b.toC] ? (PIECE_VALUES[board[b.toR][b.toC][1]] || 0) : 0;
    return targetB - targetA;
  });

  for (const m of moves) {
    const savedTo = board[m.toR][m.toC];
    const savedFrom = board[m.fromR][m.fromC];
    board[m.toR][m.toC] = savedFrom;
    board[m.fromR][m.fromC] = null;

    const score = minimax(board, 3, -Infinity, Infinity, false);

    board[m.fromR][m.fromC] = savedFrom;
    board[m.toR][m.toC] = savedTo;

    if (score > bestScore) {
      bestScore = score;
      bestMove = m;
    }
  }

  if (bestMove) {
    makeMove(bestMove.fromR, bestMove.fromC, bestMove.toR, bestMove.toC);
  }
}

// --- 5. BOARD INTERACTION ---
canvas.addEventListener('click', (e) => {
  if (gameState !== 'PLAYING') return;

  const rect = canvas.getBoundingClientRect();
  const c = Math.floor((e.clientX - rect.left) / TILE_SIZE);
  const r = Math.floor((e.clientY - rect.top) / TILE_SIZE);

  if (selectedSquare) {
    const move = validMoves.find(m => m.r === r && m.c === c);
    if (move) {
      makeMove(selectedSquare.r, selectedSquare.c, r, c);
      selectedSquare = null;
      validMoves = [];

      if (vsAi && turn === 'b' && gameState === 'PLAYING') {
        setTimeout(makeAiMove, 300);
      }
      return;
    }
  }

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
      <div class="w-16 h-16 bg-cyan-500/20 border-2 border-cyan-400/60 rounded-2xl flex items-center justify-center text-cyan-400 font-black text-xl mb-3 shadow-[0_0_25px_rgba(56,189,248,0.5)]">
        VICTORY
      </div>
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

// --- 6. CUSTOM VECTOR CANVAS PIECE RENDERER (NO EMOJIS) ---
function drawCustomPiece(ctx, pieceStr, cx, cy) {
  const isWhite = pieceStr[0] === 'w';
  const type = pieceStr[1];

  const mainColor = isWhite ? '#38bdf8' : '#ec4899';
  const glowColor = isWhite ? '#06b6d4' : '#f472b6';
  const darkColor = isWhite ? '#0c4a6e' : '#831843';

  ctx.save();
  ctx.translate(cx, cy);
  ctx.shadowColor = glowColor;
  ctx.shadowBlur = 10;
  ctx.strokeStyle = mainColor;
  ctx.fillStyle = darkColor;
  ctx.lineWidth = 2;

  if (type === 'P') { // Pawn: Cyber Visor Drone
    ctx.beginPath();
    ctx.moveTo(-10, 14);
    ctx.lineTo(10, 14);
    ctx.lineTo(7, 4);
    ctx.lineTo(4, -4);
    ctx.lineTo(6, -10);
    ctx.lineTo(0, -14);
    ctx.lineTo(-6, -10);
    ctx.lineTo(-4, -4);
    ctx.lineTo(-7, 4);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Visor Eye
    ctx.fillStyle = mainColor;
    ctx.fillRect(-4, -9, 8, 3);

  } else if (type === 'R') { // Rook: Heavy Cyber Fortress
    ctx.beginPath();
    ctx.moveTo(-12, 14);
    ctx.lineTo(12, 14);
    ctx.lineTo(9, 4);
    ctx.lineTo(9, -6);
    ctx.lineTo(12, -6);
    ctx.lineTo(12, -14);
    ctx.lineTo(6, -14);
    ctx.lineTo(6, -9);
    ctx.lineTo(2, -9);
    ctx.lineTo(2, -14);
    ctx.lineTo(-2, -14);
    ctx.lineTo(-2, -9);
    ctx.lineTo(-6, -9);
    ctx.lineTo(-6, -14);
    ctx.lineTo(-12, -14);
    ctx.lineTo(-12, -6);
    ctx.lineTo(-9, -6);
    ctx.lineTo(-9, 4);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Energy Core Pillar
    ctx.fillStyle = mainColor;
    ctx.fillRect(-2, -3, 4, 10);

  } else if (type === 'N') { // Knight: Mecha Steed Profile
    ctx.beginPath();
    ctx.moveTo(-10, 14);
    ctx.lineTo(10, 14);
    ctx.lineTo(7, 6);
    ctx.lineTo(9, -2);
    ctx.lineTo(4, -14);
    ctx.lineTo(-2, -14);
    ctx.lineTo(-8, -6);
    ctx.lineTo(-11, -3);
    ctx.lineTo(-6, 1);
    ctx.lineTo(-2, -2);
    ctx.lineTo(-5, 6);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Eye Visor
    ctx.fillStyle = mainColor;
    ctx.fillRect(-3, -10, 4, 3);

  } else if (type === 'B') { // Bishop: Plasma Spire
    ctx.beginPath();
    ctx.moveTo(-10, 14);
    ctx.lineTo(10, 14);
    ctx.lineTo(6, 6);
    ctx.lineTo(7, -4);
    ctx.lineTo(0, -15);
    ctx.lineTo(-7, -4);
    ctx.lineTo(-6, 6);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Laser Slit
    ctx.fillStyle = mainColor;
    ctx.fillRect(-1.5, -9, 3, 16);
    ctx.beginPath();
    ctx.arc(0, -15, 3, 0, Math.PI * 2);
    ctx.fill();

  } else if (type === 'Q') { // Queen: Sovereign Plasma Crown
    ctx.beginPath();
    ctx.moveTo(-12, 14);
    ctx.lineTo(12, 14);
    ctx.lineTo(8, 6);
    ctx.lineTo(12, -12);
    ctx.lineTo(6, -4);
    ctx.lineTo(0, -15);
    ctx.lineTo(-6, -4);
    ctx.lineTo(-12, -12);
    ctx.lineTo(-8, 6);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Crown Orbs
    ctx.fillStyle = mainColor;
    ctx.beginPath();
    ctx.arc(0, -15, 2.5, 0, Math.PI * 2);
    ctx.arc(-12, -12, 2, 0, Math.PI * 2);
    ctx.arc(12, -12, 2, 0, Math.PI * 2);
    ctx.fill();

  } else if (type === 'K') { // King: Cyber Monarch
    ctx.beginPath();
    ctx.moveTo(-12, 14);
    ctx.lineTo(12, 14);
    ctx.lineTo(8, 6);
    ctx.lineTo(10, -6);
    ctx.lineTo(5, -6);
    ctx.lineTo(5, -11);
    ctx.lineTo(2, -11);
    ctx.lineTo(2, -15);
    ctx.lineTo(-2, -15);
    ctx.lineTo(-2, -11);
    ctx.lineTo(-5, -11);
    ctx.lineTo(-5, -6);
    ctx.lineTo(-10, -6);
    ctx.lineTo(-8, 6);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Cross Crest
    ctx.fillStyle = mainColor;
    ctx.fillRect(-1, -15, 2, 8);
    ctx.fillRect(-4, -13, 8, 2);
  }

  ctx.restore();
}

// --- 7. RENDER LOOP ---
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

      // Render Piece with Custom Canvas Vector Renderer (Zero Emojis!)
      const piece = board[r] ? board[r][c] : null;
      if (piece) {
        drawCustomPiece(ctx, piece, c * TILE_SIZE + TILE_SIZE / 2, r * TILE_SIZE + TILE_SIZE / 2);
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
