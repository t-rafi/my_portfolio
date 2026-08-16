/**
 * [FEATURE 2] Haptic Feedback Engine
 */
export function triggerHaptic(pattern = 10) {
  if ('vibrate' in navigator) {
    try { navigator.vibrate(pattern); } catch (_) {}
  }
}

export function initHaptic() {
  document.querySelectorAll('.bottom-tabs__tab').forEach((tab) => tab.addEventListener('click', () => triggerHaptic(10)));
  document.querySelectorAll('.theme-toggle').forEach((btn) => btn.addEventListener('click', () => triggerHaptic(10)));
  document.querySelectorAll('.filter-btn').forEach((btn) => btn.addEventListener('click', () => triggerHaptic(10)));
  document.querySelector('.contact-form')?.addEventListener('submit', () => triggerHaptic(10));
}
