document.addEventListener('DOMContentLoaded', () => {
    
    // --- Custom Cursor & Idle Heartbeat ---
    const cursorGlow = document.getElementById('cursor-glow');
    let idleTimer;
    let heartbeatInterval;

    function startHeartbeat() {
        if(!audioCtx || heartbeatInterval || isMuted) return;
        // User has been idle for 4 seconds. Start heartbeat.
        heartbeatInterval = setInterval(() => {
            playThud(55, 0.15); // Deep, soft thud
            setTimeout(() => playThud(45, 0.08), 250); // Soft echo thud
            
            // Subtle visual heartbeat pulse
            document.getElementById('vignette').style.background = 'radial-gradient(circle, transparent 40%, rgba(20,0,0,0.8) 100%)';
            setTimeout(() => {
                document.getElementById('vignette').style.background = 'radial-gradient(circle, transparent 50%, rgba(0,0,0,0.8) 100%)';
            }, 300);

        }, 1100);
    }

    function stopHeartbeat() {
        if(heartbeatInterval) {
            clearInterval(heartbeatInterval);
            heartbeatInterval = null;
        }
    }

    function resetIdleTimer() {
        clearTimeout(idleTimer);
        stopHeartbeat();
        idleTimer = setTimeout(startHeartbeat, 4000); // 4 seconds of idle triggers paranoia
    }

    function updateCursorPosition(x, y) {
        cursorGlow.style.left = x + 'px';
        cursorGlow.style.top = y + 'px';
        
        // --- Parallax Effect for Hero ---
        const pX = (x / window.innerWidth - 0.5) * 2;
        const pY = (y / window.innerHeight - 0.5) * 2;
        document.getElementById('parallax-container').style.setProperty('--mouseX', pX);
        document.getElementById('parallax-container').style.setProperty('--mouseY', pY);

        resetIdleTimer();
    }

    document.addEventListener('mousemove', (e) => {
        updateCursorPosition(e.clientX, e.clientY);
    });

    document.addEventListener('touchmove', (e) => {
        if(e.touches.length > 0) updateCursorPosition(e.touches[0].clientX, e.touches[0].clientY);
    }, {passive: true});

    // Make the cursor inner dot disappear when hovering clickables to show it's "focused"
    const clickables = document.querySelectorAll('a, button, .card, .door-container');
    
    // Style injected for hiding inner dot
    const styleSheet = document.createElement("style");
    styleSheet.innerText = `
        #cursor-glow.hovering::after { opacity: 0; }
    `;
    document.head.appendChild(styleSheet);

    clickables.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursorGlow.style.width = '70px';
            cursorGlow.style.height = '70px';
            cursorGlow.style.background = 'rgba(255,255,255,0.05)';
            cursorGlow.classList.add('hovering');
        });
        el.addEventListener('mouseleave', () => {
            cursorGlow.style.width = '40px';
            cursorGlow.style.height = '40px';
            cursorGlow.style.background = 'transparent';
            cursorGlow.classList.remove('hovering');
        });
    });

    // --- AAA Flashlight Logic ---
    const flashlightSec = document.getElementById('flashlight-sec');
    const flashlightBg = document.getElementById('flashlight-bg');
    const flashlightRunes = document.getElementById('flashlight-runes');
    
    if (flashlightSec && flashlightBg && flashlightRunes) {
        let targetX = window.innerWidth / 2;
        let targetY = window.innerHeight / 2;
        let currentX = targetX;
        let currentY = targetY;
        let isHoveringSec = false;

        flashlightSec.addEventListener('mouseenter', () => isHoveringSec = true);
        flashlightSec.addEventListener('mouseleave', () => isHoveringSec = false);

        flashlightSec.addEventListener('mousemove', (e) => {
            const rect = flashlightSec.getBoundingClientRect();
            targetX = e.clientX - rect.left;
            targetY = e.clientY - rect.top;
        });

        // Touch support for flashlight
        flashlightSec.addEventListener('touchmove', (e) => {
            if(e.touches.length > 0) {
                isHoveringSec = true;
                const rect = flashlightSec.getBoundingClientRect();
                targetX = e.touches[0].clientX - rect.left;
                targetY = e.touches[0].clientY - rect.top;
            }
        }, {passive: true});
        
        flashlightSec.addEventListener('touchend', () => {
            isHoveringSec = false;
        });

        function animateFlashlight() {
            // AAA smooth lerping for weighty flashlight feel
            currentX += (targetX - currentX) * 0.12;
            currentY += (targetY - currentY) * 0.12;
            
            flashlightBg.style.setProperty('--fx', `${currentX}px`);
            flashlightBg.style.setProperty('--fy', `${currentY}px`);
            flashlightRunes.style.setProperty('--fx', `${currentX}px`);
            flashlightRunes.style.setProperty('--fy', `${currentY}px`);

            // AAA Horror Battery Flickering
            if (isHoveringSec && Math.random() > 0.99) {
                flashlightBg.classList.add('flicker');
                flashlightRunes.classList.add('flicker');
                
                // Subtle electric buzz for the failing flashlight
                try {
                    const aCtx = new (window.AudioContext || window.webkitAudioContext)();
                    const osc = aCtx.createOscillator();
                    const gain = aCtx.createGain();
                    osc.type = 'sawtooth';
                    osc.frequency.value = 50 + Math.random() * 50;
                    gain.gain.setValueAtTime(0.05, aCtx.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.001, aCtx.currentTime + 0.1);
                    osc.connect(gain);
                    gain.connect(aCtx.destination);
                    osc.start();
                    osc.stop(aCtx.currentTime + 0.1);
                } catch(err){}
                
                setTimeout(() => {
                    flashlightBg.classList.remove('flicker');
                    flashlightRunes.classList.remove('flicker');
                }, 50 + Math.random() * 150);
            }
            
            requestAnimationFrame(animateFlashlight);
        }
        animateFlashlight();
    }

    // --- Dynamic Text Corruption ---
    const corruptTexts = document.querySelectorAll('.corruptible');
    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        const maxNoise = 0.2;
        document.getElementById('noise-overlay').style.opacity = Math.min(maxNoise, 0.05 + scrollY / 8000);
        
        corruptTexts.forEach(el => {
            const rect = el.getBoundingClientRect();
            if(rect.top < window.innerHeight * 0.7) {
                if(!el.dataset.corrupted) {
                    el.dataset.corrupted = true;
                    
                    let iterations = 0;
                    const target = el.dataset.alt;
                    const scramble = setInterval(() => {
                        el.innerText = target.split('').map((char, index) => {
                            if(index < iterations) return target[index];
                            return String.fromCharCode(33 + Math.random() * 94);
                        }).join('');
                        
                        if(iterations >= target.length) {
                            clearInterval(scramble);
                            el.innerText = target;
                            el.classList.add('corrupted-state');
                        }
                        iterations += 1;
                    }, 50);
                }
            }
        });
    });

    // --- Generative Web Audio API (NEW: Pressure-free) ---
    const enterBtn = document.getElementById('enter-btn');
    const entryScreen = document.getElementById('entry-screen');
    const muteBtn = document.getElementById('mute-btn');
    let audioCtx;
    let isMuted = false;

    function startGenerativeAudio() {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        
        // 1. Completely removed the sub-bass drone that causes headaches!
        
        // 2. Very gentle, muffled brown noise wind
        const bufferSize = audioCtx.sampleRate * 2;
        const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1; 
        }
        const noise = audioCtx.createBufferSource();
        noise.buffer = buffer;
        noise.loop = true;
        
        const filter = audioCtx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 150; // Heavily muffled
        
        const windLfo = audioCtx.createOscillator();
        windLfo.type = 'sine';
        windLfo.frequency.value = 0.05;
        const windLfoGain = audioCtx.createGain();
        windLfoGain.gain.value = 50;
        windLfo.connect(windLfoGain);
        windLfoGain.connect(filter.frequency);
        
        const noiseGain = audioCtx.createGain();
        noiseGain.gain.value = 0.02; // Barely audible
        
        noise.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(audioCtx.destination);
        
        noise.start();
        windLfo.start();

        // 3. Eerie, sparse high-pitched chimes (No headache, pure tension)
        function playChime() {
            if(!audioCtx || isMuted) return;
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            
            osc.type = 'triangle';
            osc.frequency.value = 250 + Math.random() * 400; // Eerie high note
            
            // Detune for discordance
            const osc2 = audioCtx.createOscillator();
            osc2.type = 'sine';
            osc2.frequency.value = osc.frequency.value * 1.02;
            
            gain.gain.setValueAtTime(0, audioCtx.currentTime);
            gain.gain.linearRampToValueAtTime(0.04, audioCtx.currentTime + 1); // Very soft attack
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 6); // Long eerie fade
            
            osc.connect(gain);
            osc2.connect(gain);
            gain.connect(audioCtx.destination);
            
            osc.start();
            osc2.start();
            osc.stop(audioCtx.currentTime + 6);
            osc2.stop(audioCtx.currentTime + 6);
            
            // Repeat randomly between 6 and 15 seconds
            setTimeout(playChime, 6000 + Math.random() * 9000);
        }
        setTimeout(playChime, 3000); // Start first chime after 3 seconds
        
        resetIdleTimer();
        muteBtn.style.display = 'flex'; // Show mute button
    }

    function playThud(freq = 100, volume = 0.2) {
        if(!audioCtx || isMuted) return;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
        
        gain.gain.setValueAtTime(volume, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
        
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.5);
    }

    enterBtn.addEventListener('click', () => {
        startGenerativeAudio();
        entryScreen.style.opacity = '0';
        setTimeout(() => {
            entryScreen.style.display = 'none';
        }, 2000);
    });

    // --- Mute Logic ---
    muteBtn.addEventListener('click', () => {
        if(!audioCtx) return;
        isMuted = !isMuted;
        if(isMuted) {
            audioCtx.suspend();
            muteBtn.innerText = '🔇';
            muteBtn.classList.add('muted');
        } else {
            audioCtx.resume();
            muteBtn.innerText = '🔊';
            muteBtn.classList.remove('muted');
        }
    });

    // --- Interactive "Door" Mechanic ---
    const doorContainer = document.getElementById('door-interactive');
    let holdProgress = 0;
    let holdInterval;
    let isOpened = false;

    const handleDoorHold = () => {
        if(isOpened) return;
        holdInterval = setInterval(() => {
            holdProgress += 1.5;
            doorContainer.style.setProperty('--progress', `${holdProgress}%`);
            
            if(Math.random() > 0.8) {
                doorContainer.style.transform = `translate(${Math.random()*4-2}px, ${Math.random()*4-2}px)`;
            }

            if (holdProgress >= 100) {
                clearInterval(holdInterval);
                isOpened = true;
                doorContainer.style.transform = `translate(0, 0)`;
                doorContainer.classList.add('opened');
                playThud(120, 0.4); 
                document.getElementById('vignette').style.background = 'radial-gradient(circle, transparent 20%, rgba(139,0,0,0.4) 100%)';
            }
        }, 30);
    };

    doorContainer.addEventListener('mousedown', handleDoorHold);
    doorContainer.addEventListener('touchstart', (e) => {
        // Only prevent default on the door container to allow holding without scrolling
        e.preventDefault(); 
        handleDoorHold();
    }, {passive: false});

    const resetDoor = () => {
        if(!isOpened) {
            clearInterval(holdInterval);
            holdProgress = 0;
            doorContainer.style.setProperty('--progress', `0%`);
            doorContainer.style.transform = `translate(0, 0)`;
        }
    };

    doorContainer.addEventListener('mouseup', resetDoor);
    doorContainer.addEventListener('mouseleave', resetDoor);
    doorContainer.addEventListener('touchend', resetDoor);
    doorContainer.addEventListener('touchcancel', resetDoor);

    // --- Scroll Reveal Animation ---
    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });

    document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));

    // --- Fake Light Mode Scare ---
    const lightToggle = document.getElementById('light-mode-toggle');
    const flashOverlay = document.getElementById('flash-overlay');
    let hasGlitched = false;

    if (lightToggle && flashOverlay) {
        lightToggle.addEventListener('click', () => {
            if (hasGlitched) return;
            hasGlitched = true;

            // Audio Scare (Electric Short-Circuit + Thud)
            try {
                const aCtx = new (window.AudioContext || window.webkitAudioContext)();
                const osc = aCtx.createOscillator();
                const gain = aCtx.createGain();
                osc.type = 'square';
                osc.frequency.setValueAtTime(800, aCtx.currentTime);
                for(let i=0; i<10; i++) {
                    osc.frequency.setValueAtTime(Math.random() * 2000 + 100, aCtx.currentTime + (i*0.15));
                }
                gain.gain.setValueAtTime(0, aCtx.currentTime);
                gain.gain.linearRampToValueAtTime(0.8, aCtx.currentTime + 0.05); 
                gain.gain.exponentialRampToValueAtTime(0.01, aCtx.currentTime + 1.5);
                osc.connect(gain);
                gain.connect(aCtx.destination);
                osc.start();
                osc.stop(aCtx.currentTime + 1.5);
                
                const thud = aCtx.createOscillator();
                const thudGain = aCtx.createGain();
                thud.type = 'triangle';
                thud.frequency.setValueAtTime(60, aCtx.currentTime + 0.1);
                thud.frequency.exponentialRampToValueAtTime(20, aCtx.currentTime + 1.0);
                thudGain.gain.setValueAtTime(2.0, aCtx.currentTime + 0.1);
                thudGain.gain.exponentialRampToValueAtTime(0.01, aCtx.currentTime + 1.0);
                thud.connect(thudGain);
                thudGain.connect(aCtx.destination);
                thud.start(aCtx.currentTime + 0.1);
                thud.stop(aCtx.currentTime + 1.0);
            } catch(err){}

            // Visual Glitch
            flashOverlay.classList.add('glitching');
            
            setTimeout(() => {
                lightToggle.innerText = "NO ESCAPE";
                lightToggle.classList.add('broken');
            }, 100);
            
            setTimeout(() => {
                flashOverlay.classList.remove('glitching');
            }, 1600);
        });
    }

    // --- The Cursed Guestbook Logic ---
    const sigForm = document.getElementById('signature-form');
    const sigList = document.getElementById('signatures-list');
    
    const defaultSignatures = [
        { name: "Father Elias", msg: "I couldn't save them. I locked the door." },
        { name: "Sarah", msg: "It's so cold down here. Please." },
        { name: "pickup_driver35", msg: "I shouldn't have gone back to that hill." }
    ];

    function renderSignatures() {
        if (!sigList) return;
        sigList.innerHTML = '';
        
        let userSigs = JSON.parse(localStorage.getItem('dwelling_signatures')) || [];
        const allSigs = [...userSigs, ...defaultSignatures];
        
        allSigs.forEach(sig => {
            const div = document.createElement('div');
            div.className = 'signature-entry';
            div.innerHTML = `<div class="sig-name">${sig.name}</div><div class="sig-msg">"${sig.msg}"</div>`;
            sigList.appendChild(div);
        });
    }

    if (sigForm) {
        renderSignatures();
        sigForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const nameInput = document.getElementById('sig-name');
            const msgInput = document.getElementById('sig-message');
            
            if(nameInput.value.trim() === '' || msgInput.value.trim() === '') return;
            
            playThud(150, 0.3); // Deep thud for saving
            
            const newSig = {
                name: nameInput.value.trim(),
                msg: msgInput.value.trim()
            };
            
            let userSigs = JSON.parse(localStorage.getItem('dwelling_signatures')) || [];
            userSigs.unshift(newSig); 
            localStorage.setItem('dwelling_signatures', JSON.stringify(userSigs));
            
            nameInput.value = '';
            msgInput.value = '';
            
            sigForm.style.opacity = '0.5';
            sigForm.querySelector('button').innerText = "IT REMEMBERS YOU";
            
            renderSignatures();
        });
    }
});
