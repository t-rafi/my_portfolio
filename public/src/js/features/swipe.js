/**
 * [FEATURE 5] Swipe Gesture — Project Cards
 */
import { triggerHaptic } from './haptic.js';

export function initProjectSwipe() {
  const grid = document.querySelector('.projects-grid');
  const dots = document.querySelector('.projects-dots');
  const hint = document.querySelector('.projects-swipe-hint');
  if (!grid || !dots) return;

  const getVisibleCards = () => [...grid.querySelectorAll('.project-card')].filter((c) => !c.classList.contains('is-hidden'));

  const renderDots = () => {
    dots.innerHTML = '';
    const cards = getVisibleCards();
    cards.forEach((card, index) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = `projects-dots__dot${index === 0 ? ' active' : ''}`;
      dot.setAttribute('aria-label', `Go to project ${index + 1}`);
      dot.addEventListener('click', () => {
        card.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
      });
      dots.appendChild(dot);
    });
  };

  const updateDots = () => {
    const cards = getVisibleCards();
    if (!cards.length) return;
    const cardWidth = cards[0].offsetWidth + 16;
    const activeIndex = Math.min(cards.length - 1, Math.max(0, Math.round(grid.scrollLeft / cardWidth)));
    dots.querySelectorAll('.projects-dots__dot').forEach((dot, index) => {
      dot.classList.toggle('active', index === activeIndex);
    });
  };

  renderDots();
  grid.addEventListener('scroll', updateDots, { passive: true });

  // Project Category Filters
  const filters = document.querySelectorAll('.filter-btn');
  filters.forEach((filter) => {
    filter.addEventListener('click', () => {
      const category = filter.dataset.filter;
      filters.forEach((b) => {
        const isActive = b === filter;
        b.classList.toggle('active', isActive);
        b.setAttribute('aria-pressed', String(isActive));
      });

      document.querySelectorAll('.project-card[data-category]').forEach((proj) => {
        const cats = proj.dataset.category.split(' ');
        proj.classList.toggle('is-hidden', category !== 'all' && !cats.includes(category));
      });

      window.setTimeout(() => {
        renderDots();
        updateDots();
      }, 50);
    });
  });

  // Touch Swipe (threshold: 60px)
  let startX = 0, startY = 0;
  grid.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
  }, { passive: true });

  grid.addEventListener('touchend', (e) => {
    const deltaX = e.changedTouches[0].clientX - startX;
    const deltaY = e.changedTouches[0].clientY - startY;

    if (Math.abs(deltaX) >= 60 && Math.abs(deltaX) > Math.abs(deltaY)) {
      const cards = getVisibleCards();
      if (!cards.length) return;
      const cardWidth = cards[0].offsetWidth + 16;
      const currentIndex = Math.round(grid.scrollLeft / cardWidth);
      const nextIndex = deltaX < 0 ? Math.min(cards.length - 1, currentIndex + 1) : Math.max(0, currentIndex - 1);

      if (nextIndex !== currentIndex && cards[nextIndex]) {
        cards[nextIndex].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
        triggerHaptic(10);
      }
    }
  }, { passive: true });

  window.setTimeout(() => hint?.classList.add('is-hidden'), 3000);
}
