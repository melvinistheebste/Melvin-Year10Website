    const navTabs = document.querySelector('.nav-tabs');
    const scrollToTopButton = document.getElementById('scroll-to-top');
    const navLinks = Array.from(document.querySelectorAll('.nav-tabs a'));
    const topicCards = Array.from(document.querySelectorAll('.topic-card'));
    const fadeElements = document.querySelectorAll('.topic-title, .topic-card');

    if (!navTabs || !navLinks.length) {
        return;
    }

    let lastScroll = window.scrollY;
    let scrollTicking = false;
    let tabNavigationActive = false;
    let tabNavigationTimeout;

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

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    if (scrollToTopButton) {
        scrollToTopButton.addEventListener('click', scrollToTop);
    }
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

    const addRippleEffect = (element) => {
        element.addEventListener('click', (event) => createRipple(element, event));
    };

    const handleNavClick = (event) => {
        if (event.target.closest('a')) {
            keepNavigationVisible();
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
                updateActiveTab();
                scrollTicking = false;
            });
            scrollTicking = true;
        }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', updateActiveTab);
    navTabs.addEventListener('click', handleNavClick);
    navLinks.forEach(addRippleEffect);
    topicCards.forEach(addRippleEffect);
    observeFadeElements();
    toggleScrollToTop();
    updateActiveTab();
