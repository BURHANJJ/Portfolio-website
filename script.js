document.addEventListener('DOMContentLoaded', () => {
    // Splash Screen & Typewriter Logic
    const splashScreen = document.getElementById('splashScreen');
    const type1 = document.getElementById('splash-typewriter-1');
    const type2 = document.getElementById('splash-typewriter-2');
    const type3 = document.getElementById('splash-typewriter-3');

    if (splashScreen && type1 && type2 && type3) {
        document.body.classList.add('no-scroll');

        const text1 = type1.textContent.trim();
        const text2 = type2.textContent.trim();
        const text3 = type3.textContent.trim();

        type1.textContent = '';
        type2.textContent = '';
        type3.textContent = '';

        const typingSpeed = 40; // ms per char

        // Start typing first line after the icons animate in (0.8s)
        setTimeout(() => {
            type1.classList.add('typewriter-cursor');
            let i = 0;

            function typeLine1() {
                if (i < text1.length) {
                    type1.textContent += text1.charAt(i);
                    i++;
                    setTimeout(typeLine1, typingSpeed);
                } else {
                    // Start next line
                    type1.classList.remove('typewriter-cursor');
                    type2.classList.add('typewriter-cursor');
                    let j = 0;

                    function typeLine2() {
                        if (j < text2.length) {
                            type2.textContent += text2.charAt(j);
                            j++;
                            setTimeout(typeLine2, typingSpeed);
                        } else {
                            type2.classList.remove('typewriter-cursor');
                            type3.classList.add('typewriter-cursor');
                            let k = 0;

                            function typeLine3() {
                                if (k < text3.length) {
                                    type3.textContent += text3.charAt(k);
                                    k++;
                                    setTimeout(typeLine3, typingSpeed);
                                } else {
                                    type3.classList.remove('typewriter-cursor');
                                    // Finish typing, wait a moment, then hide splash screen
                                    setTimeout(() => {
                                        splashScreen.classList.add('hidden');
                                        document.body.classList.remove('no-scroll');
                                    }, 1200);
                                }
                            }
                            setTimeout(typeLine3, 200);
                        }
                    }
                    setTimeout(typeLine2, 200); // Small pause before second line
                }
            }
            typeLine1();
        }, 1000); // Wait for icon fade in animation (1s)
    }

    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const nav = document.querySelector('.nav');

    mobileMenuBtn.addEventListener('click', () => {
        mobileMenuBtn.classList.toggle('active');
        nav.classList.toggle('active');

        // Prevent scrolling when mobile menu is open
        if (nav.classList.contains('active')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    });

    // Close mobile menu when a link is clicked
    const navLinks = document.querySelectorAll('.nav-link, .btn');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileMenuBtn.classList.remove('active');
            nav.classList.remove('active');
            document.body.style.overflow = '';
        });
    });

    // Pendulum Badge Physics Logic
    const pendulum = document.getElementById('pendulum');
    if (pendulum) {
        let isDragging = false;
        let startX = 0;
        let startY = 0;
        let startAngle = 0;
        let startStretch = 0;

        // Physics variables
        let angle = 0;
        let angularVelocity = 0;
        let angularAcceleration = 0;
        let damping = 0.96; // Air resistance
        let gravity = 0.8; // Pulls down

        // Spring Physics for stretching
        let stretchY = 0;
        let stretchVelocity = 0;
        let stretchDamping = 0.85; // Bounce resistance
        let springConstant = 0.15; // Stiffness

        const lanyard = document.querySelector('.lanyard');
        const badgeWrapper = document.getElementById('badgeWrapper');

        const maxAngle = 60; // Max rotation angle

        pendulum.addEventListener('mousedown', startDrag);
        pendulum.addEventListener('touchstart', startDrag, { passive: false });

        document.addEventListener('mousemove', drag);
        document.addEventListener('touchmove', drag, { passive: false });

        document.addEventListener('mouseup', endDrag);
        document.addEventListener('touchend', endDrag);

        function startDrag(e) {
            isDragging = true;
            pendulum.style.cursor = 'grabbing';
            document.body.classList.add('no-scroll'); // Prevent body drag on mobile

            // Ensure no CSS transitions interfere with drag
            pendulum.style.transition = 'none';
            if (lanyard) lanyard.style.transition = 'none';
            if (badgeWrapper) badgeWrapper.style.transition = 'none';

            startX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
            startY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;
            startAngle = angle;
            startStretch = stretchY;

            // Stop simulation
            angularVelocity = 0;
            stretchVelocity = 0;
        }

        function drag(e) {
            if (!isDragging) return;
            e.preventDefault();

            const currentX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
            const currentY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;

            const diffX = currentX - startX;
            const diffY = currentY - startY;

            // Map horizontal movement to angle (reversed), vertical to stretch
            let newAngle = startAngle - (diffX * 0.15);
            let newStretch = startStretch + diffY;

            if (newAngle > maxAngle) newAngle = maxAngle;
            if (newAngle < -maxAngle) newAngle = -maxAngle;

            // Limit stretching so it doesn't break UI too much
            if (newStretch > 250) newStretch = 250;
            if (newStretch < -50) newStretch = -50;

            angle = newAngle;
            stretchY = newStretch;

            pendulum.style.transform = `rotate(${angle}deg)`;
            if (lanyard && badgeWrapper) {
                lanyard.style.height = `${400 + stretchY}px`;
                badgeWrapper.style.top = `${400 + stretchY}px`;
            }
        }

        function endDrag(e) {
            if (!isDragging) return;
            isDragging = false;
            pendulum.style.cursor = 'grab';
            document.body.classList.remove('no-scroll'); // Re-enable body drag

            // Start simulation to bounce back
            requestAnimationFrame(simulatePendulum);
        }

        function simulatePendulum() {
            if (!isDragging) {
                // 1. Swing Simulation (Pendulum)
                angularAcceleration = -gravity * Math.sin(angle * Math.PI / 180);
                angularVelocity += angularAcceleration;
                angularVelocity *= damping;
                angle += angularVelocity;

                // 2. Stretch Simulation (Spring)
                let stretchForce = -springConstant * stretchY;
                stretchVelocity += stretchForce;
                stretchVelocity *= stretchDamping;
                stretchY += stretchVelocity;

                // Sleep check
                const isSwingResting = Math.abs(angle) < 0.05 && Math.abs(angularVelocity) < 0.05;
                const isStretchResting = Math.abs(stretchY) < 0.5 && Math.abs(stretchVelocity) < 0.5;

                if (isSwingResting) {
                    angle = 0;
                    angularVelocity = 0;
                }
                if (isStretchResting) {
                    stretchY = 0;
                    stretchVelocity = 0;
                }

                pendulum.style.transform = `rotate(${angle}deg)`;
                if (lanyard && badgeWrapper) {
                    lanyard.style.height = `${400 + stretchY}px`;
                    badgeWrapper.style.top = `${400 + stretchY}px`;
                }

                if (!isSwingResting || !isStretchResting) {
                    requestAnimationFrame(simulatePendulum);
                }
            }
        }

        // Delay the drop-in animation until the splash screen is fully gone
        setTimeout(() => {
            // Give browser a frame to ensure CSS initial rotation is applied
            requestAnimationFrame(() => {
                // Apply a CSS transition for the initial drop
                pendulum.style.transition = 'transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)';
                if (lanyard) lanyard.style.transition = 'height 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)';
                if (badgeWrapper) badgeWrapper.style.transition = 'top 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)';

                // Trigger layout recalculation
                void pendulum.offsetWidth;

                // Remove initial CSS transform states to drop it
                pendulum.style.transform = 'rotate(0deg)';
                if (lanyard) lanyard.style.height = '500px';
                if (badgeWrapper) badgeWrapper.style.top = '500px';

                setTimeout(() => {
                    // Remove transitions before JS physics take over completely
                    pendulum.style.transition = 'none';
                    if (lanyard) lanyard.style.transition = 'none';
                    if (badgeWrapper) badgeWrapper.style.transition = 'none';

                    // Ensure Physics values match the new resting state so it doesn't snap back
                    angle = 0;
                    stretchY = 0;
                    angularVelocity = 15; // Give it a swing velocity so it swings when JS takes over
                    stretchVelocity = 10; // Give it a bounce velocity 

                    requestAnimationFrame(simulatePendulum);
                }, 800);
            });
        }, 2500); // Wait 2.5s for splash screen to hide completely
    }
});
