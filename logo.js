document.addEventListener('DOMContentLoaded', (event) => {
    const logoContainer = document.querySelector('.logo');
    const orb = document.querySelector('.orb');

    let hoverCount = 0;
    let animationInProgress = false;

    const orbs = [
        { src: 'images/metal-planet.png', width: '60px', alt: 'iron planet logo image' },
        { src: 'images/orb3.png', width: '60px', alt: 'gold orb logo image' },
        { src: 'images/orb4.png', width: '60px', alt: 'copper orb logo image' },
        { src: 'images/orb5.png', width: '60px', alt: 'obsidian orb logo image' },
        { src: 'images/orb.png', width: '60px', alt: 'marble orb logo image' }
    ];

    // Randomly select an orb
    const selectedOrb = orbs[Math.floor(Math.random() * orbs.length)];
    orb.src = selectedOrb.src;
    orb.style.width = selectedOrb.width;
    orb.alt = selectedOrb.alt;

    const bounceAnimation = () => {
        orb.style.animation = 'bounce 0.5s forwards';
        orb.addEventListener('animationend', resetAnimationState, { once: true });
    };

    const wiggleAnimation = () => {
        orb.style.animation = 'wiggle-loose 1s forwards';
        orb.addEventListener('animationend', () => {
            orb.style.animation = 'bounce 0.5s forwards';
            orb.addEventListener('animationend', fallAnimation, { once: true });
        }, { once: true });
    };

    const fallAnimation = () => {
        const randomDirection = Math.random() < 0.5 ? -50 : 50;
        orb.style.animation = 'fall 2s ease-in forwards';
        orb.style.transform = `translate(${randomDirection}px, 100vh) rotate(360deg)`;
        orb.addEventListener('animationend', () => {
            setTimeout(() => {
                orb.style.animation = 'grow-back 1s forwards';
                orb.style.transform = 'scale(1) rotate(0deg)';
                orb.addEventListener('animationend', resetAnimationState, { once: true });
            }, 300); // Delay of 0.3 seconds
        }, { once: true });
    };

    const resetAnimationState = () => {
        animationInProgress = false;
        orb.style.animation = '';
        orb.style.transform = 'none';
    };

    const startAnimations = () => {
        if (animationInProgress) return;
        animationInProgress = true;

        hoverCount++;
        if (hoverCount > 3) hoverCount = 1; // Reset hoverCount after 3 hovers

        if (hoverCount === 3) {
            wiggleAnimation();
        } else {
            bounceAnimation();
        }
    };

    logoContainer.addEventListener('mouseenter', () => {
        startAnimations();
    });

    logoContainer.addEventListener('mouseleave', () => {
        // No specific action needed on mouse leave
    });
});
