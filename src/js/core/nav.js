/**
 * Navigation, Mobile Menu & Bottom Tab Bar
 */
export function initNav() {
  const toggle = document.getElementById('nav-toggle');
  const menu = document.getElementById('mobile-menu');
  const overlay = document.getElementById('nav-overlay');

  if (toggle && menu && overlay) {
    const closeMenu = () => {
      toggle.setAttribute('aria-expanded', 'false');
      menu.classList.remove('open');
      overlay.hidden = true;
      document.body.classList.remove('menu-open');
    };

    const openMenu = () => {
      toggle.setAttribute('aria-expanded', 'true');
      menu.classList.add('open');
      overlay.hidden = false;
      document.body.classList.add('menu-open');
    };

    toggle.addEventListener('click', () => {
      toggle.getAttribute('aria-expanded') === 'true' ? closeMenu() : openMenu();
    });

    overlay.addEventListener('click', closeMenu);
    menu.addEventListener('click', (e) => { if (e.target.closest('a')) closeMenu(); });
    window.addEventListener('resize', () => { if (window.innerWidth >= 768) closeMenu(); });
  }

  // Active Nav Links Sync
  const links = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('main section[id]');
  if (links.length && sections.length && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const selector = `#${entry.target.id}`;
        links.forEach((link) => link.classList.toggle('active', link.getAttribute('href') === selector));
      });
    }, { rootMargin: '-40% 0px -50% 0px' });
    sections.forEach((section) => observer.observe(section));
  }

  // Mobile Bottom Tabs
  const tabs = document.querySelectorAll('.bottom-tabs__tab');
  const indicator = document.querySelector('.tab-indicator');
  if (tabs.length && 'IntersectionObserver' in window) {
    const setActive = (tab) => {
      tabs.forEach((item) => {
        const active = item === tab;
        item.classList.toggle('active', active);
        item.setAttribute('aria-selected', String(active));
      });
      if (indicator) {
        indicator.style.transform = `translateX(${tab.offsetLeft + (tab.offsetWidth - indicator.offsetWidth) / 2}px)`;
      }
    };

    const tabObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const tab = [...tabs].find((item) => item.getAttribute('href') === `#${entry.target.id}`);
        if (tab) setActive(tab);
      });
    }, { rootMargin: '-35% 0px -55% 0px' });

    sections.forEach((sec) => tabObserver.observe(sec));
    tabs.forEach((tab) => tab.addEventListener('click', () => setActive(tab)));
    window.addEventListener('resize', () => setActive(document.querySelector('.bottom-tabs__tab.active') || tabs[0]));
    setActive(document.querySelector('.bottom-tabs__tab.active') || tabs[0]);
  }
}
