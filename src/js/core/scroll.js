/**
 * Scroll Behavior & Reveal Animations
 */
export function initScroll() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const nav = document.getElementById('nav');
  const scrollTopButton = document.getElementById('scroll-top');
  const progress = document.querySelector('.read-progress');
  const fab = document.querySelector('.contact-fab');
  const hero = document.getElementById('hero');

  const updateScrollState = () => {
    const scrollY = window.scrollY;
    if (nav) nav.classList.toggle('scrolled', scrollY > 40);
    if (scrollTopButton) scrollTopButton.classList.toggle('visible', scrollY > 400);

    if (progress) {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = `${max ? (scrollY / max) * 100 : 0}%`;
    }

    if (fab && hero) {
      fab.classList.toggle('visible', scrollY > hero.offsetHeight * 0.7);
    }
  };

  window.addEventListener('scroll', updateScrollState, { passive: true });
  updateScrollState();

  if (scrollTopButton) {
    scrollTopButton.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion.matches ? 'auto' : 'smooth' });
    });
  }

  // Scroll Reveals
  const elements = document.querySelectorAll('.reveal, .erp-card, .project-card, .tech-card, .stat-card, .section-header');
  if (elements.length) {
    if (prefersReducedMotion.matches || !('IntersectionObserver' in window)) {
      elements.forEach((el) => el.classList.add('visible'));
    } else {
      const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('visible');
          obs.unobserve(entry.target);
        });
      }, { threshold: 0.15, rootMargin: '0px 0px -24px 0px' });
      elements.forEach((el) => observer.observe(el));
    }
  }

  // Custom Cursor
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    const ring = document.createElement('div');
    const dot = document.createElement('div');
    ring.className = 'cursor-ring';
    dot.className = 'cursor-dot';
    document.body.append(ring, dot);

    let targetX = -100, targetY = -100, ringX = -100, ringY = -100;
    document.addEventListener('mousemove', (e) => {
      targetX = e.clientX;
      targetY = e.clientY;
      dot.style.left = `${targetX}px`;
      dot.style.top = `${targetY}px`;
    });

    document.querySelectorAll('a, button, input, textarea').forEach((el) => {
      el.dataset.cursor = 'link';
      el.addEventListener('mouseenter', () => ring.classList.add('is-hover'));
      el.addEventListener('mouseleave', () => ring.classList.remove('is-hover'));
    });

    const renderCursor = () => {
      ringX += (targetX - ringX) * 0.12;
      ringY += (targetY - ringY) * 0.12;
      ring.style.left = `${ringX}px`;
      ring.style.top = `${ringY}px`;
      requestAnimationFrame(renderCursor);
    };
    renderCursor();
  }
}
