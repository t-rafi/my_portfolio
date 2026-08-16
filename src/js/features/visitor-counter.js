/**
 * [FEATURE 7] Live Visitor Counter (localStorage-based daily count)
 */
export function initVisitorCounter() {
  const counterEl = document.getElementById('visitors-today-count');
  if (!counterEl) return;

  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const dailyKey = `portfolio_visits_${year}-${month}-${day}`;

  let count = 1;
  try {
    const stored = localStorage.getItem(dailyKey);
    count = stored ? parseInt(stored, 10) + 1 : 1;
    localStorage.setItem(dailyKey, String(count));
  } catch (_) {
    count = 1;
  }

  counterEl.dataset.count = String(count);
  counterEl.innerHTML = `0<span>+</span>`;
}
