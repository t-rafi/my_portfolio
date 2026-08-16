/**
 * Hero Typing Animation
 */
export function initTyping() {
  const greeting = document.querySelector('[data-greeting]');
  const name = document.querySelector('.hero-name__typing');
  const reveal = document.querySelectorAll('.hero-reveal');
  if (!greeting || !name) return;

  const hour = new Date().getHours();
  greeting.textContent = `${hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'}, I'm`;
  const fullName = 'Towhidul Islam Rafi';
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  if (prefersReducedMotion.matches) {
    name.textContent = fullName;
    name.classList.add('is-complete');
    reveal.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  let index = 0;
  const type = () => {
    name.textContent = fullName.slice(0, ++index);
    if (index < fullName.length) window.setTimeout(type, 60);
    else {
      name.classList.add('is-complete');
      reveal.forEach((el) => el.classList.add('is-visible'));
    }
  };
  type();
}
