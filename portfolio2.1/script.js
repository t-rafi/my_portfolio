/* === UTILITY FUNCTIONS === */
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

const setButtonsState = (buttons, activeButton) => {
  buttons.forEach((button) => {
    const isActive = button === activeButton;
    button.classList.toggle('active', isActive);
    button.setAttribute('aria-pressed', String(isActive));
  });
};

const storage = {
  get(key) {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch {
      return false;
    }

    return true;
  }
};

/* === THEME SYSTEM === */
(() => {
  const toggles = document.querySelectorAll('.theme-toggle');
  if (!toggles.length) return;

  const applyTheme = (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    storage.set('theme', theme);

    toggles.forEach((toggle) => {
      const nextLabel = theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme';
      toggle.textContent = theme === 'dark' ? '☀️' : '🌙';
      toggle.setAttribute('aria-label', nextLabel);
      toggle.setAttribute('aria-pressed', String(theme === 'light'));
    });
  };

  applyTheme(storage.get('theme') || 'dark');

  toggles.forEach((toggle) => {
    toggle.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') || 'dark';
      applyTheme(current === 'dark' ? 'light' : 'dark');
    });
  });
})();

/* === SCROLL BEHAVIOR === */
(() => {
  const nav = document.getElementById('nav');
  const scrollTopButton = document.getElementById('scroll-top');

  if (!nav || !scrollTopButton) return;

  const updateScrollState = () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
    scrollTopButton.classList.toggle('visible', window.scrollY > 400);
  };

  window.addEventListener('scroll', updateScrollState, { passive: true });
  updateScrollState();

  scrollTopButton.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion.matches ? 'auto' : 'smooth' });
  });
})();

/* === MOBILE MENU === */
(() => {
  const toggle = document.getElementById('nav-toggle');
  const menu = document.getElementById('mobile-menu');
  const overlay = document.getElementById('nav-overlay');
  if (!toggle || !menu || !overlay) return;

  const closeMenu = ({ focusToggle = false } = {}) => {
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open mobile menu');
    menu.classList.remove('open');
    menu.setAttribute('aria-hidden', 'true');
    overlay.hidden = true;
    document.body.classList.remove('menu-open');

    if (focusToggle) toggle.focus();
  };

  const openMenu = () => {
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Close mobile menu');
    menu.classList.add('open');
    menu.setAttribute('aria-hidden', 'false');
    overlay.hidden = false;
    document.body.classList.add('menu-open');
  };

  toggle.addEventListener('click', () => {
    toggle.getAttribute('aria-expanded') === 'true' ? closeMenu() : openMenu();
  });

  overlay.addEventListener('click', () => closeMenu());

  menu.addEventListener('click', (event) => {
    if (event.target.closest('a')) closeMenu();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
      closeMenu({ focusToggle: true });
    }
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth >= 768) closeMenu();
  });
})();

/* === ANIMATIONS === */
(() => {
  const elements = document.querySelectorAll('.reveal, .erp-card, .project-card, .tech-card, .stat-card, .section-header');
  if (!elements.length) return;

  if (prefersReducedMotion.matches || !('IntersectionObserver' in window)) {
    elements.forEach((element) => element.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver((entries, activeObserver) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('visible');
      activeObserver.unobserve(entry.target);
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -24px 0px' });

  elements.forEach((element) => observer.observe(element));
})();

/* === STAT COUNTERS === */
(() => {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  const updateCounter = (counter) => {
    const target = Number(counter.dataset.count);
    const suffix = counter.querySelector('span')?.outerHTML || '';
    const duration = prefersReducedMotion.matches ? 1 : 900;
    const start = performance.now();

    const tick = (time) => {
      const progress = Math.min((time - start) / duration, 1);
      const value = Math.floor(progress * target);
      counter.innerHTML = `${value}${suffix}`;

      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  };

  if (prefersReducedMotion.matches || !('IntersectionObserver' in window)) {
    counters.forEach(updateCounter);
    return;
  }

  const observer = new IntersectionObserver((entries, activeObserver) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      updateCounter(entry.target);
      activeObserver.unobserve(entry.target);
    });
  }, { threshold: 0.5 });

  counters.forEach((counter) => observer.observe(counter));
})();

/* === PROJECT FILTERS === */
(() => {
  const filters = document.querySelectorAll('.filter-btn');
  const projects = document.querySelectorAll('.project-card[data-category]');
  if (!filters.length || !projects.length) return;

  filters.forEach((filter) => {
    filter.addEventListener('click', () => {
      const category = filter.dataset.filter;
      setButtonsState(filters, filter);

      projects.forEach((project) => {
        const categories = project.dataset.category.split(' ');
        project.classList.toggle('is-hidden', category !== 'all' && !categories.includes(category));
      });
    });
  });
})();

/* === ACTIVE NAVIGATION === */
(() => {
  const links = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('main section[id]');
  if (!links.length || !sections.length || !('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const selector = `#${entry.target.id}`;
      links.forEach((link) => link.classList.toggle('active', link.getAttribute('href') === selector));
    });
  }, { rootMargin: '-40% 0px -50% 0px' });

  sections.forEach((section) => observer.observe(section));
})();

/* === PROFILE IMAGE FALLBACK === */
(() => {
  document.querySelectorAll('.profile-photo').forEach((image) => {
    const showFallback = () => image.parentElement?.classList.add('is-fallback');

    if (image.complete && !image.naturalWidth) showFallback();
    image.addEventListener('error', showFallback, { once: true });
  });
})();

/* === CONTACT FORM === */
function handleFormSubmit(event) {
  event.preventDefault();

  const form = event.currentTarget;
  const status = document.getElementById('form-status');
  const submitButton = form.querySelector('.form-submit');
  const name = document.getElementById('contact-name').value.trim();
  const email = document.getElementById('contact-email').value.trim();
  const message = document.getElementById('contact-message').value.trim();

  status.classList.remove('is-error', 'is-success');

  if (!name || !email || !message) {
    status.textContent = 'Please fill in all required fields.';
    status.classList.add('is-error');
    return;
  }

  const subject = document.getElementById('contact-subject').value || 'Portfolio Contact';
  const body = `Name: ${name}\nEmail: ${email}\n\n${message}`;

  submitButton.textContent = 'Opening email client...';
  submitButton.disabled = true;
  window.location.href = `mailto:tirafi29@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  window.setTimeout(() => {
    submitButton.textContent = 'Send Message';
    submitButton.disabled = false;
    status.textContent = 'Email client opened. Please send the email to complete.';
    status.classList.add('is-success');
  }, 1500);
}

document.querySelector('.contact-form')?.addEventListener('submit', handleFormSubmit);
