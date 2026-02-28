document.addEventListener('DOMContentLoaded', () => {
    // Splash Screen & Typewriter Logic
    const splashScreen = document.getElementById('splashScreen');
    const type1 = document.getElementById('splash-typewriter-1');
    const type2 = document.getElementById('splash-typewriter-2');
    const type3 = document.getElementById('splash-typewriter-3');

    if (splashScreen && type1 && type2 && type3) {

        // Check if splash screen has been shown in this session
        if (!sessionStorage.getItem('splashShown')) {
            sessionStorage.setItem('splashShown', 'true');
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
                                            // Dispatch event to trigger drop animation when ready
                                            window.dispatchEvent(new CustomEvent('splashFinished', { detail: { isRefresh: false } }));
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

        } else {
            // Already shown in this session, hide instantly and trigger drop
            splashScreen.style.display = 'none';
            document.body.classList.remove('no-scroll');
            // Dispatch event to trigger drop animation immediately
            setTimeout(() => {
                window.dispatchEvent(new CustomEvent('splashFinished', { detail: { isRefresh: true } }));
            }, 100);
        }
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

        // Wait for splash screen to finish or skip before dropping badge
        window.addEventListener('splashFinished', (e) => {
            const isRefresh = e.detail && e.detail.isRefresh;

            // Give browser a frame to ensure CSS initial rotation is applied
            requestAnimationFrame(() => {
                // Initialize physics for a natural drop
                if (isRefresh) {
                    angle = 0;              // Start straight
                    stretchY = 0;           // Start at resting position
                    angularVelocity = (Math.random() > 0.5 ? 1 : -1) * (1 + Math.random() * 1.5); // Very gentle swing
                    stretchVelocity = 0;
                } else {
                    angle = 0;              // Drop straight down
                    stretchY = -150;        // Start slightly up, less chaotic bounce
                    angularVelocity = (Math.random() - 0.5) * 3; // Very slight random twist
                    stretchVelocity = 0;    // Starts with 0 velocity, gravity pulls it down
                }

                // Remove transition to let JS physics engine handle every frame flawlessly
                pendulum.style.transition = 'none';
                if (lanyard) lanyard.style.transition = 'none';
                if (badgeWrapper) badgeWrapper.style.transition = 'none';

                // Initial layout update so JS physics starts from the right place
                pendulum.style.transform = `rotate(${angle}deg)`;

                // Start physics simulation
                requestAnimationFrame(simulatePendulum);
            });
        });
    }
});
