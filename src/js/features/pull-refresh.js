/**
 * [FEATURE 3] Pull-to-Refresh Hero Animation
 */
import { triggerHaptic } from './haptic.js';

export function initPullRefresh() {
  const hero = document.getElementById('hero');
  const ptr = document.getElementById('hero-ptr');
  if (!hero || !ptr) return;

  const circle = ptr.querySelector('.hero-ptr__ring circle');
  let startY = 0, currentY = 0, isPulling = false, isRefreshing = false;

  hero.addEventListener('touchstart', (e) => {
    if (window.scrollY > 10 || isRefreshing) return;
    startY = e.touches[0].clientY;
    currentY = startY;
    isPulling = true;
    ptr.style.transition = 'none';
  }, { passive: true });

  hero.addEventListener('touchmove', (e) => {
    if (!isPulling || isRefreshing) return;
    currentY = e.touches[0].clientY;
    const deltaY = currentY - startY;

    if (deltaY > 0 && window.scrollY <= 10) {
      const pullDistance = Math.min(deltaY * 0.45, 95);
      ptr.classList.add('is-visible');
      ptr.style.transform = `translate(-50%, ${pullDistance - 60}px)`;

      if (circle) {
        const progress = Math.min(deltaY / 80, 1);
        circle.style.strokeDashoffset = String(100 - progress * 75);
      }
    }
  }, { passive: true });

  const resetPTR = () => {
    isPulling = false;
    ptr.style.transition = '';
    ptr.classList.remove('is-visible');
    ptr.style.transform = '';
  };

  hero.addEventListener('touchend', () => {
    if (!isPulling || isRefreshing) return;
    const deltaY = currentY - startY;

    if (deltaY >= 80 && window.scrollY <= 10) {
      isRefreshing = true;
      isPulling = false;
      ptr.style.transition = '';
      ptr.classList.add('is-refreshing');
      triggerHaptic([10, 30, 10]);

      window.setTimeout(() => {
        ptr.classList.remove('is-refreshing');
        resetPTR();
        isRefreshing = false;
      }, 1200);
    } else {
      resetPTR();
    }
  }, { passive: true });
}
