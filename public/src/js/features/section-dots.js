/**
 * [FEATURE 8] Section Dot Indicator Sync (Desktop Right-Side)
 */
export function initSectionDots() {
  const dotsNav = document.getElementById('section-dots');
  if (!dotsNav) return;

  const syncVisibility = () => { dotsNav.hidden = window.innerWidth < 768; };
  syncVisibility();
  window.addEventListener('resize', syncVisibility, { passive: true });

  const dots = dotsNav.querySelectorAll('.section-dot');
  const sections = document.querySelectorAll('main section[id], header[id]');

  if (!dots.length || !sections.length || !('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const id = entry.target.id;
      dots.forEach((dot) => {
        const isActive = dot.getAttribute('data-section') === id || dot.getAttribute('href') === `#${id}`;
        dot.classList.toggle('active', isActive);
      });
    });
  }, { rootMargin: '-35% 0px -45% 0px' });

  sections.forEach((sec) => observer.observe(sec));

  dots.forEach((dot) => {
    dot.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = dot.getAttribute('href')?.replace('#', '');
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        dots.forEach((d) => d.classList.remove('active'));
        dot.classList.add('active');
      }
    });
  });
}
