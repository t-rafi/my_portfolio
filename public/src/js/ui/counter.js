/**
 * Stat Counters Animation
 */
export function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

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

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      updateCounter(entry.target);
      obs.unobserve(entry.target);
    });
  }, { threshold: 0.5 });

  counters.forEach((c) => observer.observe(c));
}
