// ARSpin - Wheel Physics, Audio & Interactive Logic

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const canvas = document.getElementById('wheelCanvas');
  const ctx = canvas.getContext('2d');
  const spinBtn = document.getElementById('spinBtn');
  const centerSpinBtn = document.getElementById('centerSpinBtn');
  const shuffleBtn = document.getElementById('shuffleBtn');
  const updateItemsBtn = document.getElementById('updateItemsBtn');
  const resetWheelBtn = document.getElementById('resetWheelBtn');
  const soundToggleBtn = document.getElementById('soundToggleBtn');
  const soundIcon = document.getElementById('soundIcon');
  const soundLabel = document.getElementById('soundLabel');
  const itemsInput = document.getElementById('itemsInput');
  const removeOnWinToggle = document.getElementById('removeOnWinToggle');
  const speechText = document.getElementById('speechText');
  const hostAvatar = document.getElementById('hostAvatar');
  const modalHostAvatar = document.getElementById('modalHostAvatar');
  const spinCountBadge = document.getElementById('spinCountBadge');
  const lastWinnerBadge = document.getElementById('lastWinnerBadge');
  const activeItemsBadge = document.getElementById('activeItemsBadge');
  const historyContainer = document.getElementById('historyContainer');
  const clearHistoryBtn = document.getElementById('clearHistoryBtn');
  const winnerModal = document.getElementById('winnerModal');
  const winnerText = document.getElementById('winnerText');
  const winnerHostComment = document.getElementById('winnerHostComment');
  const spinAgainModalBtn = document.getElementById('spinAgainModalBtn');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const presetBtns = document.querySelectorAll('.preset-btn');

  // Avatar Images
  const AVATAR_DEFAULT = window.AVATAR_DEFAULT_SRC || 'avatar.png';
  const AVATAR_WINNER = window.AVATAR_WINNER_SRC || 'avatar_winner.png';

  function setAvatar(mode) {
    const src = (mode === 'winner') ? AVATAR_WINNER : AVATAR_DEFAULT;
    if (hostAvatar) {
      hostAvatar.src = src;
    }
    if (modalHostAvatar) {
      modalHostAvatar.src = AVATAR_WINNER;
    }
  }

  // Presets Data
  const PRESETS = {
    food: ['Pizza 🍕', 'Burger 🍔', 'Sushi 🍣', 'Tacos 🌮', 'Pasta 🍝', 'Salad 🥗', 'Ramen 🍜', 'Ice Cream 🍦'],
    yesno: ['YES! 🟢', 'NO 🔴', 'Definitely ✨', 'Maybe 🤔', 'Ask Again ❓', 'Absolutely 🔥'],
    numbers: ['Number 1 🥇', 'Number 2 🥈', 'Number 3 🥉', 'Number 4 🎯', 'Number 5 ⭐', 'Number 6 🎲'],
    prizes: ['🎁 Mystery Box', '☕ Free Coffee', '💳 $10 Gift Card', '🫂 Big Hug', '🏆 Grand Prize!', '🔄 Spin Again']
  };

  // Wheel Color Palette
  const SLICE_COLORS = [
    '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', 
    '#6366f1', '#f43f5e', '#06b6d4', '#84cc16', '#a855f7',
    '#d97706', '#059669', '#2563eb', '#c026d3', '#e11d48'
  ];

  // State Variables
  let items = [...PRESETS.food];
  let currentAngle = 0; // in radians
  let isSpinning = false;
  let soundEnabled = true;
  let spinCount = 0;
  let history = [];
  let audioCtx = null;
  let lastSliceIndex = -1;

  // Initialize Canvas DPI scaling
  function setupCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const size = rect.width || 460;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);
  }

  // Web Audio Synthesizer
  function initAudio() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) audioCtx = new AudioContext();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    if (soundEnabled && !bgmTimer) {
      startBGM();
    }
  }
  ['click', 'keydown', 'touchstart'].forEach(e => window.addEventListener(e, initAudio, { passive: true }));

  // Upbeat Arcade Wheel BGM Engine (Cyber-Invaders Multi-Track Style)
  let bgmTimer = null;
  let bgmStep = 0;

  function playCarnivalHat(now) {
    try {
      const bufferSize = audioCtx.sampleRate * 0.02;
      const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
      const noise = audioCtx.createBufferSource();
      noise.buffer = buffer;
      const filter = audioCtx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.value = 8500;
      const gain = audioCtx.createGain();
      gain.gain.setValueAtTime(0.03, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(audioCtx.destination);
      noise.start(now);
    } catch(e) {}
  }

  function startBGM() {
    if (!soundEnabled) return;
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) audioCtx = new AudioContext();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    if (!audioCtx) return;
    if (bgmTimer) clearInterval(bgmTimer);
    bgmStep = 0;
    // C -> G -> Am -> F
    const bassNotes = [130.81, 98.00, 110.00, 87.31]; // C3, G2, A2, F2
    const leadNotes = [523.25, 659.25, 783.99, 1046.50, 783.99, 659.25, 523.25, 880.00]; // C5, E5, G5, C6, G5, E5, C5, A5
    const stepMs = (60 / 128 / 4) * 1000; // 128 BPM

    bgmTimer = setInterval(() => {
      if (!soundEnabled || !audioCtx) return;
      try {
        const now = audioCtx.currentTime;
        // 1. Bouncy Walking Bass
        const oscB = audioCtx.createOscillator();
        const gainB = audioCtx.createGain();
        oscB.type = 'triangle';
        const bFreq = bassNotes[Math.floor(bgmStep / 16) % bassNotes.length];
        oscB.frequency.setValueAtTime(bgmStep % 2 === 0 ? bFreq : bFreq * 1.25, now);
        gainB.gain.setValueAtTime(0.05, now);
        gainB.gain.exponentialRampToValueAtTime(0.001, now + 0.11);
        oscB.connect(gainB);
        gainB.connect(audioCtx.destination);
        oscB.start(now);
        oscB.stop(now + 0.11);

        // 2. Sparkly Carnival Lead Melody
        const oscL = audioCtx.createOscillator();
        const gainL = audioCtx.createGain();
        oscL.type = 'sine';
        oscL.frequency.setValueAtTime(leadNotes[bgmStep % leadNotes.length] * (isSpinning ? 1.5 : 1), now);
        gainL.gain.setValueAtTime(isSpinning ? 0.04 : 0.02, now);
        gainL.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
        oscL.connect(gainL);
        gainL.connect(audioCtx.destination);
        oscL.start(now);
        oscL.stop(now + 0.09);

        // 3. Tambourine / Hi-Hat
        if (bgmStep % 2 === 1) playCarnivalHat(now);

        bgmStep = (bgmStep + 1) % 64;
      } catch(e) {}
    }, stepMs);
  }

  function stopBGM() {
    if (bgmTimer) {
      clearInterval(bgmTimer);
      bgmTimer = null;
    }
  }

  function playTickSound() {
    if (!soundEnabled || !audioCtx) return;
    try {
      if (audioCtx.state === 'suspended') audioCtx.resume();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(600, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, audioCtx.currentTime + 0.04);
      
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.04);
      
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      
      osc.start();
      osc.stop(audioCtx.currentTime + 0.04);
    } catch(e){}
  }

  function playFanfareSound() {
    if (!soundEnabled || !audioCtx) return;
    try {
      if (audioCtx.state === 'suspended') audioCtx.resume();
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, index) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        const startTime = audioCtx.currentTime + index * 0.08;
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);
        
        gain.gain.setValueAtTime(0.2, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.3);
        
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        
        osc.start(startTime);
        osc.stop(startTime + 0.3);
      });
    } catch(e){}
  }

  // Speech bubble helper
  function setSpeech(text) {
    speechText.innerHTML = text;
  }

  // Draw Spin Wheel
  function drawWheel() {
    const dpr = window.devicePixelRatio || 1;
    const width = canvas.width / dpr;
    const height = canvas.height / dpr;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(centerX, centerY) - 10;

    ctx.clearRect(0, 0, width, height);

    if (items.length === 0) {
      ctx.fillStyle = '#475569';
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Please add items to spin!', centerX, centerY);
      return;
    }

    const sliceAngle = (Math.PI * 2) / items.length;

    // Draw Slices
    for (let i = 0; i < items.length; i++) {
      const startAngle = currentAngle + i * sliceAngle;
      const endAngle = startAngle + sliceAngle;
      const color = SLICE_COLORS[i % SLICE_COLORS.length];

      // Slice sector
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.closePath();

      ctx.fillStyle = color;
      ctx.fill();

      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Slice Text
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(startAngle + sliceAngle / 2);
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = 'rgba(0,0,0,0.6)';
      ctx.shadowBlur = 4;
      ctx.font = items.length > 12 ? 'bold 12px sans-serif' : 'bold 14px sans-serif';

      // Truncate long text
      let text = items[i];
      if (text.length > 16) text = text.substring(0, 14) + '…';

      ctx.fillText(text, radius - 20, 0);
      ctx.restore();
    }

    // Outer Rim Glow / Border
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.lineWidth = 6;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.stroke();

    // Determine current top slice for audio tick feedback
    // Pointer is at top (12 o'clock = -PI/2)
    const pointerAngle = -Math.PI / 2;
    let normalized = (pointerAngle - currentAngle) % (Math.PI * 2);
    if (normalized < 0) normalized += Math.PI * 2;
    const currentSlice = Math.floor(normalized / sliceAngle);

    if (isSpinning && currentSlice !== lastSliceIndex) {
      lastSliceIndex = currentSlice;
      playTickSound();
    }
  }

  // Get Winner Item under 12 o'clock pointer
  function getWinner() {
    if (items.length === 0) return null;
    const sliceAngle = (Math.PI * 2) / items.length;
    const pointerAngle = -Math.PI / 2;
    let normalized = (pointerAngle - currentAngle) % (Math.PI * 2);
    if (normalized < 0) normalized += Math.PI * 2;
    const winningIndex = Math.floor(normalized / sliceAngle);
    return { index: winningIndex, item: items[winningIndex] };
  }

  // Spin Logic
  function spin() {
    if (isSpinning) return;
    if (items.length < 1) {
      setSpeech("Add at least one option before spinning!");
      return;
    }

    initAudio();
    startBGM();
    isSpinning = true;
    setAvatar('default');
    spinBtn.disabled = true;
    centerSpinBtn.disabled = true;
    spinBtn.classList.add('opacity-50', 'cursor-not-allowed');

    setSpeech("Here we go! Who will be the lucky winner? 🎰");

    // Randomize spin rotations (between 5 and 9 full turns plus random slice offset)
    const extraTurns = 5 + Math.random() * 4;
    const totalRotation = extraTurns * Math.PI * 2;
    const startAngle = currentAngle;
    const finalTargetAngle = startAngle + totalRotation;

    const duration = 4500; // 4.5 seconds
    const startTime = performance.now();

    // Ease-out cubic formula
    function easeOutCubic(t) {
      return 1 - Math.pow(1 - t, 3);
    }

    function animate(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutCubic(progress);

      currentAngle = startAngle + totalRotation * easedProgress;
      drawWheel();

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        onSpinComplete();
      }
    }

    requestAnimationFrame(animate);
  }

  // On Spin Complete
  function onSpinComplete() {
    isSpinning = false;
    spinBtn.disabled = false;
    centerSpinBtn.disabled = false;
    spinBtn.classList.remove('opacity-50', 'cursor-not-allowed');

    const result = getWinner();
    if (!result) return;

    spinCount++;
    spinCountBadge.innerText = spinCount;
    lastWinnerBadge.innerText = result.item;

    // Log history
    history.unshift(result.item);
    renderHistory();

    // Victory audio & confetti
    setAvatar('winner');
    playFanfareSound();
    triggerConfetti();

    // Update speech
    setSpeech(`Woohoo! 🎉 <span class="text-amber-300 font-bold">${escapeHtml(result.item)}</span> is chosen!`);

    // Show Winner Modal
    if (winnerText) winnerText.innerText = `${result.item} is chosen`;
    if (winnerHostComment) winnerHostComment.innerText = `"Congratulations! ${result.item} is chosen"`;
    winnerModal.classList.remove('hidden');

    // Auto-remove feature if checked
    if (removeOnWinToggle.checked && items.length > 1) {
      items.splice(result.index, 1);
      updateItemsTextarea();
      activeItemsBadge.innerText = items.length;
      drawWheel();
    }
  }

  // Confetti Particle Effect
  function triggerConfetti() {
    if (typeof confetti === 'function') {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }

  // Helpers
  function updateItemsTextarea() {
    itemsInput.value = items.join('\n');
    activeItemsBadge.innerText = items.length;
  }

  function renderHistory() {
    if (history.length === 0) {
      historyContainer.innerHTML = '<span class="text-xs text-slate-500 italic">No spins recorded yet.</span>';
      return;
    }
    historyContainer.innerHTML = history.map((item, idx) => 
      `<span class="bg-purple-900/40 text-purple-200 border border-purple-500/30 text-xs px-2.5 py-1 rounded-lg">
        #${history.length - idx}: <strong>${escapeHtml(item)}</strong>
       </span>`
    ).join('');
  }

  function escapeHtml(str) {
    return str.replace(/[&<>"']/g, function(m) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m];
    });
  }

  // Event Listeners
  spinBtn.addEventListener('click', spin);
  centerSpinBtn.addEventListener('click', spin);
  canvas.addEventListener('click', spin);

  shuffleBtn.addEventListener('click', () => {
    if (isSpinning) return;
    setAvatar('default');
    for (let i = items.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [items[i], items[j]] = [items[j], items[i]];
    }
    updateItemsTextarea();
    drawWheel();
    setSpeech("Items shuffled! Feeling lucky now?");
  });

  updateItemsBtn.addEventListener('click', () => {
    if (isSpinning) return;
    const lines = itemsInput.value
      .split('\n')
      .map(s => s.trim())
      .filter(s => s.length > 0);
    
    if (lines.length === 0) {
      alert('Please enter at least one slice item.');
      return;
    }
    setAvatar('default');
    items = lines;
    activeItemsBadge.innerText = items.length;
    drawWheel();
    setSpeech("Wheel updated with your custom choices! Hit SPIN when ready.");
  });

  resetWheelBtn.addEventListener('click', () => {
    if (isSpinning) return;
    setAvatar('default');
    items = [...PRESETS.food];
    updateItemsTextarea();
    currentAngle = 0;
    spinCount = 0;
    history = [];
    spinCountBadge.innerText = '0';
    lastWinnerBadge.innerText = 'None yet';
    renderHistory();
    drawWheel();
    setSpeech("Reset to default! What would you like to spin for?");
  });

  soundToggleBtn.addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    soundIcon.innerText = soundEnabled ? '🔊' : '🔇';
    soundLabel.innerText = soundEnabled ? 'Sound On' : 'Sound Off';
    if (soundEnabled) {
      initAudio();
      startBGM();
    } else {
      stopBGM();
    }
  });

  presetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (isSpinning) return;
      setAvatar('default');
      const key = btn.getAttribute('data-preset');
      if (PRESETS[key]) {
        items = [...PRESETS[key]];
        updateItemsTextarea();
        drawWheel();
        setSpeech(`Loaded preset: <span class="text-amber-300 font-bold">${btn.innerText}</span>. Ready to spin!`);
      }
    });
  });

  clearHistoryBtn.addEventListener('click', () => {
    history = [];
    renderHistory();
  });

  closeModalBtn.addEventListener('click', () => {
    winnerModal.classList.add('hidden');
  });

  spinAgainModalBtn.addEventListener('click', () => {
    winnerModal.classList.add('hidden');
    setTimeout(spin, 300);
  });

  // Window Resize Handle
  window.addEventListener('resize', () => {
    setupCanvas();
    drawWheel();
  });

  // Initial Setup
  setupCanvas();
  updateItemsTextarea();
  drawWheel();
});
