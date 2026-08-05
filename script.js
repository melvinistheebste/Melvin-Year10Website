const navTabs = document.querySelector('.nav-tabs');
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

window.addEventListener('scroll', () => {
    if (tabNavigationActive) {
        clearTimeout(tabNavigationTimeout);
        tabNavigationTimeout = setTimeout(finishTabNavigation, 180);
    }

    if (!scrollTicking) {
        window.requestAnimationFrame(updateScrollControls);
        scrollTicking = true;
    }
}, { passive: true });

navTabs.addEventListener('click', (event) => {
    if (event.target.closest('a')) {
        keepNavigationVisible();
    }
});

const fadeEls = document.querySelectorAll('.topic-title, .topic-card');
const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, { threshold: 0.15 });

fadeEls.forEach((element) => {
    element.classList.add('fade-in');
    observer.observe(element);
});

const navLinks = [...document.querySelectorAll('.nav-tabs a')];
const sections = navLinks
    .map((link) => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

const updateActiveTab = () => {
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

window.addEventListener('scroll', updateActiveTab, { passive: true });
window.addEventListener('resize', updateActiveTab);
updateActiveTab();
