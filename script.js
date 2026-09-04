    const navTabs = document.querySelector('.nav-tabs');
    const main = document.querySelector('main');
    const scrollToTopButton = document.getElementById('scroll-to-top');
    const navLinks = Array.from(document.querySelectorAll('.nav-tabs a'));
    const fadeElements = document.querySelectorAll('.topic-title, .topic-card');
    const scrollProgress = document.getElementById('scroll-progress');
    const themeToggle = document.getElementById('theme-toggle');

    let lastScroll = window.scrollY;
    let scrollTicking = false;
    let tabNavigationActive = false;
    let tabNavigationTimeout;

    const toggleTheme = () => {
        const lightMode = document.body.classList.toggle('light-mode');
        themeToggle.setAttribute('aria-label', lightMode ? 'Switch to dark mode' : 'Switch to light mode');
        themeToggle.firstElementChild.textContent = lightMode ? '\u263e' : '\u2609';
        window.localStorage.setItem('melvin-theme', lightMode ? 'light' : 'dark');
        document.dispatchEvent(new Event('themechange'));
    };

    const restoreTheme = () => {
        if (window.localStorage.getItem('melvin-theme') === 'light') {
            themeToggle.click();
        }
    };

    const addCardHandles = () => {
        document.querySelectorAll('.topic-card').forEach((card) => {
            const handle = document.createElement('button');
            handle.className = 'card-resize-handle';
            handle.type = 'button';
            handle.setAttribute('aria-label', 'Drag to resize and rotate this card');
            handle.innerHTML = '<span aria-hidden="true"></span>';
            card.appendChild(handle);

            handle.addEventListener('pointerdown', (event) => {
                event.preventDefault();
                event.stopPropagation();

                const bounds = card.getBoundingClientRect();
                const startAngle = Math.atan2(event.clientY - bounds.top - bounds.height / 2, event.clientX - bounds.left - bounds.width / 2);
                const startWidth = bounds.width;
                const startHeight = bounds.height;
                const startRotation = Number(card.dataset.rotation || 0);

                card.classList.add('is-manipulating');
                handle.setPointerCapture(event.pointerId);

                const moveCard = (moveEvent) => {
                    const distanceX = moveEvent.clientX - event.clientX;
                    const distanceY = moveEvent.clientY - event.clientY;
                    const angle = Math.atan2(moveEvent.clientY - bounds.top - bounds.height / 2, moveEvent.clientX - bounds.left - bounds.width / 2);
                    const rotation = startRotation + ((angle - startAngle) * 180) / Math.PI;
                    const width = Math.max(180, startWidth + distanceX * 2);
                    const height = Math.max(130, startHeight + distanceY * 2);

                    card.style.width = `${width}px`;
                    card.style.height = `${height}px`;
                    card.style.transform = `rotate(${rotation}deg)`;
                    card.dataset.rotation = rotation;
                };

                const stopMovingCard = () => {
                    card.classList.remove('is-manipulating');
                    if (handle.hasPointerCapture(event.pointerId)) {
                        handle.releasePointerCapture(event.pointerId);
                    }
                    handle.removeEventListener('pointermove', moveCard);
                    handle.removeEventListener('pointerup', stopMovingCard);
                    handle.removeEventListener('pointercancel', stopMovingCard);
                };

                handle.addEventListener('pointermove', moveCard);
                handle.addEventListener('pointerup', stopMovingCard);
                handle.addEventListener('pointercancel', stopMovingCard);
            });
        });
    };

    const finishTabNavigation = () => {
        tabNavigationActive = false;
        lastScroll = window.scrollY;
    };

    const keepNavigationVisible = () => {
        tabNavigationActive = true;
        navTabs.classList.remove('hidden');
        clearTimeout(tabNavigationTimeout);
        tabNavigationTimeout = setTimeout(finishTabNavigation, 500);
    };

    const toggleScrollToTop = () => {
        if (!scrollToTopButton) {
            return;
        }

        if (window.scrollY > 300) {
            scrollToTopButton.classList.add('visible');
        } else {
            scrollToTopButton.classList.remove('visible');
        }
    };

    const updateScrollProgress = () => {
        if (!scrollProgress) {
            return;
        }

        const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = scrollableHeight > 0 ? (window.scrollY / scrollableHeight) * 100 : 0;
        scrollProgress.style.width = `${progress}%`;
    };

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
        });
    };

    if (scrollToTopButton) {
        scrollToTopButton.addEventListener('click', scrollToTop);
    }
    themeToggle.addEventListener('click', toggleTheme);
    const updateScrollControls = () => {
        const currentScroll = window.scrollY;
        const scrollDifference = currentScroll - lastScroll;

        if (tabNavigationActive || currentScroll <= 20 || scrollDifference > 6) {
            navTabs.classList.remove('hidden');
        } else if (scrollDifference < -6) {
            navTabs.classList.add('hidden');
        }

        if (Math.abs(scrollDifference) > 6) {
            lastScroll = currentScroll;
        }

        scrollTicking = false;
    };

    const createRipple = (element, event) => {
        const ripple = document.createElement('span');
        ripple.className = 'ripple';
        element.appendChild(ripple);

        const size = Math.max(element.clientWidth, element.clientHeight);
        ripple.style.width = `${size}px`;
        ripple.style.height = `${size}px`;

        const rect = element.getBoundingClientRect();
        ripple.style.left = `${event.clientX - rect.left - size / 2}px`;
        ripple.style.top = `${event.clientY - rect.top - size / 2}px`;

        window.setTimeout(() => ripple.remove(), 700);
    };

    const handleNavClick = (event) => {
        const link = event.target.closest('a');

        if (link) {
            keepNavigationVisible();
            createRipple(link, event);
        }
    };

    const handleMainClick = (event) => {
        const card = event.target.closest('.topic-card');

        if (card) {
            createRipple(card, event);
        }
    };

    const preventSpaceScroll = (event) => {
        if (event.code !== 'Space') {
            return;
        }

        const target = event.target;
        const isFormControl = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement;

        if (!isFormControl) {
            event.preventDefault();
        }
    };

    const observeFadeElements = () => {
        if (!('IntersectionObserver' in window)) {
            fadeElements.forEach((element) => element.classList.add('visible'));
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.15 }
        );

        fadeElements.forEach((element) => {
            element.classList.add('fade-in');
            observer.observe(element);
        });
    };

    const sections = navLinks
        .map((link) => document.querySelector(link.getAttribute('href')))
        .filter(Boolean);

    const updateActiveTab = () => {
        if (!sections.length) {
            return;
        }

        const marker = window.scrollY + Math.min(window.innerHeight * 0.35, 260);
        let activeSection = sections[0];

        sections.forEach((section) => {
            if (section.offsetTop <= marker) {
                activeSection = section;
            }
        });

        navLinks.forEach((link) => {
            const isActive = link.getAttribute('href') === `#${activeSection.id}`;
            link.classList.toggle('active', isActive);

            if (isActive) {
                link.setAttribute('aria-current', 'page');
            } else {
                link.removeAttribute('aria-current');
            }
        });
    };

    const handleScroll = () => {
        if (tabNavigationActive) {
            clearTimeout(tabNavigationTimeout);
            tabNavigationTimeout = setTimeout(finishTabNavigation, 180);
        }

        if (!scrollTicking) {
            window.requestAnimationFrame(() => {
                updateScrollControls();
                toggleScrollToTop();
                updateScrollProgress();
                updateActiveTab();
                scrollTicking = false;
            });
            scrollTicking = true;
        }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('keydown', preventSpaceScroll);
    window.addEventListener('resize', updateActiveTab);
    navTabs.addEventListener('click', handleNavClick);
    main.addEventListener('click', handleMainClick);
    observeFadeElements();
    addCardHandles();
    toggleScrollToTop();
    updateScrollProgress();
    updateActiveTab();
    restoreTheme();
