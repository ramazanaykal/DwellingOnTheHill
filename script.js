document.addEventListener('DOMContentLoaded', () => {
    
    // --- Custom Cursor ---
    const cursorGlow = document.getElementById('cursor-glow');
    document.addEventListener('mousemove', (e) => {
        cursorGlow.style.left = e.clientX + 'px';
        cursorGlow.style.top = e.clientY + 'px';
        
        // --- Parallax Effect for Hero ---
        const x = (e.clientX / window.innerWidth - 0.5) * 2;
        const y = (e.clientY / window.innerHeight - 0.5) * 2;
        document.getElementById('parallax-container').style.setProperty('--mouseX', x);
        document.getElementById('parallax-container').style.setProperty('--mouseY', y);
    });

    const clickables = document.querySelectorAll('a, button, .card, .door-container');
    clickables.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursorGlow.style.width = '80px';
            cursorGlow.style.height = '80px';
            cursorGlow.style.background = 'rgba(255,255,255,0.1)';
        });
        el.addEventListener('mouseleave', () => {
            cursorGlow.style.width = '30px';
            cursorGlow.style.height = '30px';
            cursorGlow.style.background = 'transparent';
        });
    });

    // --- Generative Web Audio API (AAA Ambient Sound) ---
    const enterBtn = document.getElementById('enter-btn');
    const entryScreen = document.getElementById('entry-screen');
    let audioCtx;

    function startGenerativeAudio() {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        
        // Deep sub-bass drone
        const osc = audioCtx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = 45; 
        
        // Slow breathing modulation for the drone
        const lfo = audioCtx.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.value = 0.08; 
        const lfoGain = audioCtx.createGain();
        lfoGain.gain.value = 15;
        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);
        
        const mainGain = audioCtx.createGain();
        mainGain.gain.value = 0; // Fade in
        mainGain.gain.linearRampToValueAtTime(0.5, audioCtx.currentTime + 5);
        
        osc.connect(mainGain);
        mainGain.connect(audioCtx.destination);
        
        osc.start();
        lfo.start();
        
        // Brown noise (muffled wind)
        const bufferSize = audioCtx.sampleRate * 2;
        const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1; // White noise base
        }
        const noise = audioCtx.createBufferSource();
        noise.buffer = buffer;
        noise.loop = true;
        
        const filter = audioCtx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 300; 
        
        const windLfo = audioCtx.createOscillator();
        windLfo.type = 'sine';
        windLfo.frequency.value = 0.05;
        const windLfoGain = audioCtx.createGain();
        windLfoGain.gain.value = 150;
        windLfo.connect(windLfoGain);
        windLfoGain.connect(filter.frequency);
        
        const noiseGain = audioCtx.createGain();
        noiseGain.gain.value = 0.08;
        
        noise.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(audioCtx.destination);
        
        noise.start();
        windLfo.start();
    }

    // Audio synth for "Thud" when door opens
    function playThud() {
        if(!audioCtx) return;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(150, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
        
        gain.gain.setValueAtTime(1, audioCtx.currentTime);
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

    // --- Interactive "Door" Mechanic ---
    const doorContainer = document.getElementById('door-interactive');
    let holdProgress = 0;
    let holdInterval;
    let isOpened = false;

    doorContainer.addEventListener('mousedown', () => {
        if(isOpened) return;
        holdInterval = setInterval(() => {
            holdProgress += 1.5;
            doorContainer.style.setProperty('--progress', `${holdProgress}%`);
            
            // Random glitch visual while holding
            if(Math.random() > 0.8) {
                doorContainer.style.transform = `translate(${Math.random()*4-2}px, ${Math.random()*4-2}px)`;
            }

            if (holdProgress >= 100) {
                clearInterval(holdInterval);
                isOpened = true;
                doorContainer.style.transform = `translate(0, 0)`;
                doorContainer.classList.add('opened');
                playThud();
                
                // Aggressive vignette change
                document.getElementById('vignette').style.background = 'radial-gradient(circle, transparent 20%, rgba(139,0,0,0.4) 100%)';
            }
        }, 30);
    });

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
});
