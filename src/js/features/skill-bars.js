/**
 * [FEATURE 4] Animated Skill Proficiency Bars
 */
export function initSkillBars() {
  const cards = document.querySelectorAll('.tech-card');
  const levels = { Professional: '90%', Intermediate: '65%' };
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  cards.forEach((card) => {
    card.querySelectorAll('.skill-item').forEach((item) => {
      const level = item.querySelector('.skill-level');
      const name = item.querySelector('.skill-name');
      if (!level || !name || item.querySelector('.skill-meter')) return;

      const meter = document.createElement('div');
      meter.className = 'skill-meter';
      meter.setAttribute('aria-hidden', 'true');
      const fill = document.createElement('span');
      fill.dataset.level = level.textContent.trim();
      fill.style.setProperty('--skill-fill', '0%');
      meter.appendChild(fill);

      const meta = document.createElement('div');
      meta.className = 'skill-item__meta';
      meta.append(name, level);

      item.innerHTML = '';
      item.append(meta, meter);
    });
    card.querySelector(':scope > .skill-meter')?.remove();
  });

  const fillBars = (card) => {
    card.querySelectorAll('.skill-meter span[data-level]').forEach((bar) => {
      const targetPercent = levels[bar.dataset.level] || '65%';
      bar.style.setProperty('--skill-fill', targetPercent);
    });
  };

  if (prefersReducedMotion.matches || !('IntersectionObserver' in window)) {
    cards.forEach(fillBars);
    return;
  }

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      fillBars(entry.target);
      obs.unobserve(entry.target);
    });
  }, { threshold: 0.3 });

  cards.forEach((card) => observer.observe(card));
}
