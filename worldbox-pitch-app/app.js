/* --------------------------------------------------
   WorldBox Pitch Deck - Bulletproof Application Engine
   -------------------------------------------------- */

// Global slide navigation functions so inline handlers always work
window.currentSlide = 1;
window.totalSlides = 6;

window.goToSlide = function(n) {
    if (n >= 1 && n <= window.totalSlides && n !== window.currentSlide) {
        window.currentSlide = n;
        if (typeof window.playSound === 'function') window.playSound('slide');
        if (typeof window.updateSlideUI === 'function') window.updateSlideUI();
    }
};

window.nextSlide = function() {
    if (window.currentSlide < window.totalSlides) {
        window.currentSlide++;
        if (typeof window.playSound === 'function') window.playSound('slide');
        if (typeof window.updateSlideUI === 'function') window.updateSlideUI();
    }
};

window.prevSlide = function() {
    if (window.currentSlide > 1) {
        window.currentSlide--;
        if (typeof window.playSound === 'function') window.playSound('slide');
        if (typeof window.updateSlideUI === 'function') window.updateSlideUI();
    }
};

document.addEventListener('DOMContentLoaded', () => {
    let soundEnabled = true;

    // DOM Elements
    const slideIndicator = document.getElementById('slideIndicator');
    const progressBar = document.getElementById('progressBar');
    const slideDots = document.getElementById('slideDots');
    const soundToggleBtn = document.getElementById('soundToggleBtn');
    const soundIcon = document.getElementById('soundIcon');

    /* --------------------------------------------------
       Web Audio Synthesizer (Bulletproof Web Audio API)
       -------------------------------------------------- */
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    let audioCtx = null;

    function initAudio() {
        if (!audioCtx) {
            audioCtx = new AudioContext();
        }
        if (audioCtx && audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
    }

    window.playSound = function(type) {
        if (!soundEnabled) return;
        try {
            initAudio();
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.connect(gain);
            gain.connect(audioCtx.destination);

            if (type === 'click') {
                osc.type = 'sine';
                osc.frequency.setValueAtTime(400, audioCtx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(800, audioCtx.currentTime + 0.05);
                gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.05);
                osc.start();
                osc.stop(audioCtx.currentTime + 0.05);
            } else if (type === 'slide') {
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(300, audioCtx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(150, audioCtx.currentTime + 0.1);
                gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
                osc.start();
                osc.stop(audioCtx.currentTime + 0.1);
            } else if (type === 'fanfare') {
                const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
                notes.forEach((freq, idx) => {
                    const noteOsc = audioCtx.createOscillator();
                    const noteGain = audioCtx.createGain();
                    noteOsc.connect(noteGain);
                    noteGain.connect(audioCtx.destination);
                    noteOsc.type = 'sine';
                    noteOsc.frequency.setValueAtTime(freq, audioCtx.currentTime + idx * 0.12);
                    noteGain.gain.setValueAtTime(0.15, audioCtx.currentTime + idx * 0.12);
                    noteGain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + idx * 0.12 + 0.3);
                    noteOsc.start(audioCtx.currentTime + idx * 0.12);
                    noteOsc.stop(audioCtx.currentTime + idx * 0.12 + 0.3);
                });
            }
        } catch (e) {
            console.log('Audio playback prevented or unsupported');
        }
    };

    if (soundToggleBtn) {
        soundToggleBtn.addEventListener('click', () => {
            soundEnabled = !soundEnabled;
            if (soundEnabled) {
                soundIcon.className = 'fa-solid fa-volume-high';
                soundToggleBtn.style.color = 'var(--accent-green)';
            } else {
                soundIcon.className = 'fa-solid fa-volume-xmark';
                soundToggleBtn.style.color = 'var(--text-dim)';
            }
        });
    }

    /* --------------------------------------------------
       Slide Engine & Navigation
       -------------------------------------------------- */
    function renderDots() {
        if (!slideDots) return;
        slideDots.innerHTML = '';
        for (let i = 1; i <= window.totalSlides; i++) {
            const dot = document.createElement('div');
            dot.className = `dot ${i === window.currentSlide ? 'active' : ''}`;
            dot.title = `Jump to Slide ${i}`;
            dot.addEventListener('click', () => window.goToSlide(i));
            slideDots.appendChild(dot);
        }
    }

    window.updateSlideUI = function() {
        document.querySelectorAll('.slide').forEach(slide => {
            slide.classList.remove('active');
        });

        const activeSlideEl = document.getElementById(`slide-${window.currentSlide}`);
        if (activeSlideEl) {
            activeSlideEl.classList.add('active');
        }

        if (slideIndicator) {
            slideIndicator.textContent = `Slide ${window.currentSlide} of ${window.totalSlides}`;
        }
        
        if (progressBar) {
            const progressPercent = (window.currentSlide / window.totalSlides) * 100;
            progressBar.style.width = `${progressPercent}%`;
        }

        renderDots();

        // Button opacity states
        const prevBtn = document.getElementById('prevSlideBtn');
        const nextBtn = document.getElementById('nextSlideBtn');
        if (prevBtn) prevBtn.style.opacity = window.currentSlide === 1 ? '0.4' : '1';
        if (nextBtn) nextBtn.style.opacity = window.currentSlide === window.totalSlides ? '0.4' : '1';
    };

    // Direct Event Listeners for Nav Buttons
    const startBriefingBtn = document.getElementById('startBriefingBtn');
    if (startBriefingBtn) {
        startBriefingBtn.addEventListener('click', () => window.nextSlide());
    }

    const prevSlideBtn = document.getElementById('prevSlideBtn');
    if (prevSlideBtn) {
        prevSlideBtn.addEventListener('click', () => window.prevSlide());
    }

    const nextSlideBtn = document.getElementById('nextSlideBtn');
    if (nextSlideBtn) {
        nextSlideBtn.addEventListener('click', () => window.nextSlide());
    }

    // Keyboard Shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        if (e.key === 'ArrowRight' || e.key === 'Space') {
            e.preventDefault();
            window.nextSlide();
        } else if (e.key === 'ArrowLeft') {
            e.preventDefault();
            window.prevSlide();
        }
    });

    /* --------------------------------------------------
       Slide 4 (Chore Contract Generator)
       -------------------------------------------------- */
    const choreCheckboxes = document.querySelectorAll('.chore-cb');
    const contractText = document.getElementById('contractText');
    const customChoreInput = document.getElementById('customChoreInput');
    const addChoreBtn = document.getElementById('addChoreBtn');

    function updateContractText() {
        if (!contractText) return;
        const selectedChores = [];
        document.querySelectorAll('.chore-cb:checked').forEach(cb => {
            selectedChores.push(cb.value);
        });

        const todayDate = new Date().toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric'
        });

        let choresHTML = '';
        if (selectedChores.length === 0) {
            choresHTML = '<em>(No chores selected yet. Please select at least one promise!)</em>';
        } else {
            choresHTML = '<ul>' + selectedChores.map(c => `<li><i class="fa-solid fa-check text-green"></i> ${c}</li>`).join('') + '</ul>';
        }

        contractText.innerHTML = `
            <p><strong>OFFICIAL INVESTMENT OBLIGATION CONTRACT</strong></p>
            <p style="margin-top: 8px;"><strong>Date:</strong> ${todayDate}</p>
            <p style="margin-top: 8px;">In consideration of <strong>Dad</strong> investing <strong>$15.00 USD</strong> for the purchase of <em>WorldBox God Simulator</em> on Steam, the Child hereby commits to fulfilling the following obligations in full:</p>
            <div style="margin: 12px 0;">${choresHTML}</div>
            <p style="font-size: 12px; color: var(--text-muted);">Signed with full commitment and appreciation.</p>
        `;
    }

    choreCheckboxes.forEach(cb => {
        cb.addEventListener('change', () => {
            window.playSound('click');
            updateContractText();
        });
    });

    if (addChoreBtn && customChoreInput) {
        addChoreBtn.addEventListener('click', () => {
            const text = customChoreInput.value.trim();
            if (text) {
                const label = document.createElement('label');
                label.className = 'checkbox-item';
                label.innerHTML = `
                    <input type="checkbox" class="chore-cb" value="${text}" checked>
                    <span class="custom-cb"></span>
                    <span><i class="fa-solid fa-star text-gold"></i> ${text}</span>
                `;
                const choreSec = document.querySelector('.chore-selection');
                const inputGrp = document.querySelector('.custom-input-group');
                if (choreSec && inputGrp) {
                    choreSec.insertBefore(label, inputGrp);
                }
                customChoreInput.value = '';
                
                label.querySelector('input').addEventListener('change', () => {
                    window.playSound('click');
                    updateContractText();
                });
                
                window.playSound('click');
                updateContractText();
            }
        });
    }

    updateContractText();

    /* --------------------------------------------------
       Slide 5 (Dad FAQ Accordion)
       -------------------------------------------------- */
    document.querySelectorAll('.faq-question').forEach(qBtn => {
        qBtn.addEventListener('click', () => {
            const item = qBtn.parentElement;
            const isOpen = item.classList.contains('active');
            
            document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));
            
            if (!isOpen) {
                item.classList.add('active');
                window.playSound('click');
            }
        });
    });

    /* --------------------------------------------------
       Built-in Canvas Confetti Generator (100% Reliable, Zero-Dependency)
       -------------------------------------------------- */
    function triggerConfetti() {
        if (typeof window.confetti === 'function') {
            try {
                window.confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
                return;
            } catch (e) {
                console.log('CDN confetti error, using fallback canvas confetti');
            }
        }

        // Fallback custom canvas confetti
        let confettiCanvas = document.getElementById('builtinConfettiCanvas');
        if (!confettiCanvas) {
            confettiCanvas = document.createElement('canvas');
            confettiCanvas.id = 'builtinConfettiCanvas';
            confettiCanvas.style.position = 'fixed';
            confettiCanvas.style.top = '0';
            confettiCanvas.style.left = '0';
            confettiCanvas.style.width = '100vw';
            confettiCanvas.style.height = '100vh';
            confettiCanvas.style.pointerEvents = 'none';
            confettiCanvas.style.zIndex = '3000';
            document.body.appendChild(confettiCanvas);
        }

        confettiCanvas.width = window.innerWidth;
        confettiCanvas.height = window.innerHeight;
        const cCtx = confettiCanvas.getContext('2d');

        const particles = [];
        const colors = ['#fbbf24', '#38bdf8', '#10b981', '#f97316', '#a855f7', '#ef4444'];

        for (let i = 0; i < 150; i++) {
            particles.push({
                x: window.innerWidth / 2,
                y: window.innerHeight / 2,
                vx: (Math.random() - 0.5) * 16,
                vy: (Math.random() - 0.8) * 16,
                size: Math.random() * 8 + 4,
                color: colors[Math.floor(Math.random() * colors.length)],
                rotation: Math.random() * 360,
                rSpeed: (Math.random() - 0.5) * 10
            });
        }

        let frame = 0;
        function animateConfetti() {
            cCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
            particles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;
                p.vy += 0.3; // Gravity
                p.rotation += p.rSpeed;

                cCtx.save();
                cCtx.translate(p.x, p.y);
                cCtx.rotate((p.rotation * Math.PI) / 180);
                cCtx.fillStyle = p.color;
                cCtx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
                cCtx.restore();
            });

            frame++;
            if (frame < 120) {
                requestAnimationFrame(animateConfetti);
            } else {
                cCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
            }
        }
        animateConfetti();
    }

    /* --------------------------------------------------
       Slide 6 (Approval & Certificate Engine)
       -------------------------------------------------- */
    const approveBtn = document.getElementById('approveBtn');
    const viewContractBtn = document.getElementById('viewContractBtn');
    const certificateModal = document.getElementById('certificateModal');
    const closeCertBtn = document.getElementById('closeCertBtn');
    const closeCertModalBtn = document.getElementById('closeCertModalBtn');
    const certDate = document.getElementById('certDate');
    const certChoresList = document.getElementById('certChoresList');

    function openCertificate() {
        if (!certificateModal) return;
        const todayDate = new Date().toLocaleDateString('en-US', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });
        if (certDate) certDate.textContent = todayDate;

        const selectedChores = [];
        document.querySelectorAll('.chore-cb:checked').forEach(cb => {
            selectedChores.push(cb.value);
        });

        if (certChoresList) {
            if (selectedChores.length === 0) {
                certChoresList.innerHTML = '<p>• Full household support & appreciation</p>';
            } else {
                certChoresList.innerHTML = '<ul>' + selectedChores.map(c => `<li>• ${c}</li>`).join('') + '</ul>';
            }
        }

        certificateModal.classList.add('active');
    }

    if (approveBtn) {
        approveBtn.addEventListener('click', () => {
            window.playSound('fanfare');
            triggerConfetti();
            openCertificate();
        });
    }

    if (viewContractBtn) {
        viewContractBtn.addEventListener('click', () => {
            window.playSound('click');
            openCertificate();
        });
    }

    if (closeCertBtn) closeCertBtn.addEventListener('click', () => certificateModal.classList.remove('active'));
    if (closeCertModalBtn) closeCertModalBtn.addEventListener('click', () => certificateModal.classList.remove('active'));

    if (certificateModal) {
        certificateModal.addEventListener('click', (e) => {
            if (e.target === certificateModal) certificateModal.classList.remove('active');
        });
    }

    // Initialize UI on load
    window.updateSlideUI();
});
