/* ==========================================================================
   gamblr (Demo Edition) - Main App Coordinator & View Router
   ========================================================================== */

let currentTabIndex = 0;
let isSwiping = false;
const TAB_ORDER = ['coin', 'slots', 'cards'];

function switchTab(target) {
  const tabs = {
    coin: document.getElementById('tab-coin'),
    slots: document.getElementById('tab-slots'),
    cards: document.getElementById('tab-cards')
  };
  const views = {
    coin: document.getElementById('view-coin'),
    slots: document.getElementById('view-slots'),
    cards: document.getElementById('view-cards'),
    home: document.getElementById('view-home')
  };

  const newIndex = TAB_ORDER.indexOf(target);
  const direction = newIndex >= currentTabIndex ? 'left' : 'right';
  if (newIndex >= 0) currentTabIndex = newIndex;

  Object.values(tabs).forEach(t => {
    if (t) { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); }
  });
  if (tabs[target]) { tabs[target].classList.add('active'); tabs[target].setAttribute('aria-selected', 'true'); }

  // 2-Phase 3D Swipe Animation
  const currentActiveView = document.querySelector('.view-panel.active');
  const targetView = views[target];

  if (currentActiveView && targetView && currentActiveView !== targetView) {
    if (isSwiping) return;
    isSwiping = true;

    const outClass = direction === 'left' ? 'swipe-out-left' : 'swipe-out-right';
    const inClass = direction === 'left' ? 'swipe-in-right' : 'swipe-in-left';

    currentActiveView.classList.add(outClass);

    setTimeout(() => {
      currentActiveView.classList.remove('active', 'swipe-out-left', 'swipe-out-right');

      targetView.classList.remove('swipe-out-left', 'swipe-out-right');
      targetView.classList.add('active', inClass);

      setTimeout(() => {
        targetView.classList.remove('swipe-in-left', 'swipe-in-right');
        isSwiping = false;
      }, 220);
    }, 220);
  } else {
    Object.values(views).forEach(v => {
      if (v) v.classList.remove('active');
    });
    if (targetView) targetView.classList.add('active');
  }

  if (window.soundEngine && window.soundEngine.playTabSwitch) {
    window.soundEngine.playTabSwitch();
  }
}

window.switchTab = switchTab;

document.addEventListener('DOMContentLoaded', () => {
  if (window.soundEngine) window.soundEngine.init();
  if (window.profileManager) window.profileManager.init();
  if (window.coinFlipManager) window.coinFlipManager.init();
  if (window.slotsManager) window.slotsManager.init();
  if (window.cardsManager) window.cardsManager.init();
  if (window.adManager) window.adManager.init();

  const tabCoin = document.getElementById('tab-coin');
  const tabSlots = document.getElementById('tab-slots');
  const tabCards = document.getElementById('tab-cards');

  if (tabCoin) tabCoin.addEventListener('click', () => switchTab('coin'));
  if (tabSlots) tabSlots.addEventListener('click', () => switchTab('slots'));
  if (tabCards) tabCards.addEventListener('click', () => switchTab('cards'));

  const btnSound = document.getElementById('btn-sound');

  const updateDiscState = () => {
    if (!btnSound || !window.soundEngine) return;
    const isMuted = window.soundEngine.isMuted;
    btnSound.classList.toggle('playing', !isMuted);
    btnSound.classList.toggle('muted', isMuted);
  };

  if (btnSound) {
    btnSound.addEventListener('click', () => {
      if (window.soundEngine) {
        window.soundEngine.toggleMute();
        updateDiscState();
      }
    });
    updateDiscState();
  }

  const btnEnterCasino = document.getElementById('btn-enter-casino');
  const splashScreen = document.getElementById('splash-screen');
  const splashProgress = document.getElementById('splash-progress');
  const splashStatusText = document.getElementById('splash-status-text');

  const closeSplashScreen = () => {
    try {
      if (window.soundEngine) {
        if (typeof window.soundEngine.unlockAudioContext === 'function') {
          window.soundEngine.unlockAudioContext();
        } else if (typeof window.soundEngine.init === 'function') {
          window.soundEngine.init();
        }
      }
    } catch (e) {
      console.warn('Audio unlock warning:', e);
    }
    if (splashScreen) {
      splashScreen.style.opacity = '0';
      splashScreen.style.pointerEvents = 'none';
      splashScreen.classList.add('fade-out');
      setTimeout(() => {
        splashScreen.style.display = 'none';
        splashScreen.classList.add('hidden');
      }, 400);
    }
  };

  if (btnEnterCasino) {
    btnEnterCasino.addEventListener('click', closeSplashScreen);
  }

  if (splashProgress && splashStatusText && btnEnterCasino) {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 30) + 20;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        splashProgress.style.width = '100%';
        splashStatusText.textContent = 'QUANTUM CORE READY — CLICK BELOW';
        btnEnterCasino.classList.remove('hidden');
      } else {
        splashProgress.style.width = progress + '%';
        if (progress > 60) splashStatusText.textContent = 'LOADING DEMO ENGINE...';
        else if (progress > 30) splashStatusText.textContent = 'SYNCHRONIZING COIN & 777 SLOTS...';
      }
    }, 60);
  }

  const btnProfile = document.getElementById('btn-profile');
  if (btnProfile && window.profileManager) {
    btnProfile.addEventListener('click', () => {
      window.profileManager.openModal();
    });
  }
});
