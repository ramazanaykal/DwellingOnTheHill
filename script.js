document.addEventListener('DOMContentLoaded', () => {
    
    // --- Custom Cursor Logic ---
    const cursorGlow = document.getElementById('cursor-glow');
    
    document.addEventListener('mousemove', (e) => {
        // Move the glow to mouse position
        cursorGlow.style.left = e.clientX + 'px';
        cursorGlow.style.top = e.clientY + 'px';
    });

    // Enlarge cursor glow when hovering over clickable elements
    const clickables = document.querySelectorAll('a, button, .card');
    clickables.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursorGlow.style.width = '600px';
            cursorGlow.style.height = '600px';
            cursorGlow.style.background = 'radial-gradient(circle, rgba(139,0,0,0.05) 0%, rgba(0,0,0,0) 70%)';
        });
        el.addEventListener('mouseleave', () => {
            cursorGlow.style.width = '400px';
            cursorGlow.style.height = '400px';
            cursorGlow.style.background = 'radial-gradient(circle, rgba(255,255,255,0.03) 0%, rgba(0,0,0,0) 70%)';
        });
    });

    // --- Scroll Reveal Animation ---
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // Run once
            }
        });
    }, observerOptions);

    const fadeElements = document.querySelectorAll('.fade-up');
    fadeElements.forEach(el => {
        observer.observe(el);
    });

    // Trigger hero animations immediately
    setTimeout(() => {
        document.querySelectorAll('.hero-content').forEach(el => {
            el.style.opacity = '1';
        });
    }, 100);
});
