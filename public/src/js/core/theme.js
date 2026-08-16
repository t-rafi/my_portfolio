/**
 * Theme System (Dark / Light mode)
 */
export function initTheme() {
  const toggles = document.querySelectorAll('.theme-toggle');
  if (!toggles.length) return;

  const storage = {
    get(key) {
      try { return localStorage.getItem(key); } catch { return null; }
    },
    set(key, val) {
      try { localStorage.setItem(key, val); return true; } catch { return false; }
    }
  };

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
}
