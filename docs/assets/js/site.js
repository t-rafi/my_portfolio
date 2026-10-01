const themeButton = document.querySelector('[data-theme-toggle]');
const scheme = window.matchMedia('(prefers-color-scheme: dark)');
const currentTheme = () => document.documentElement.dataset.theme || (scheme.matches ? 'dark' : 'light');
const labelTheme = () => {
  if (themeButton) themeButton.setAttribute('aria-label', `Switch to ${currentTheme() === 'dark' ? 'light' : 'dark'} theme`);
};
if (themeButton) {
  themeButton.hidden = false;
  labelTheme();
  themeButton.addEventListener('click', () => {
    const next = currentTheme() === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem('rafi-theme', next); } catch { /* A theme still works without storage. */ }
    labelTheme();
  });
  scheme.addEventListener('change', labelTheme);
}

// Content is visible before JavaScript and stays visible if observers are unavailable.
if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('reveal-enter');
      observer.unobserve(entry.target);
    }
  }, { threshold: 0.1 });
  document.querySelectorAll('[data-reveal]').forEach(el => observer.observe(el));
}

const phoneLayout = matchMedia('(max-width: 640px)');
const projectDetails = [...document.querySelectorAll('.project-details')];
const fitDetails = () => projectDetails.forEach(details => { details.open = !phoneLayout.matches; });
fitDetails();
phoneLayout.addEventListener('change', fitDetails);

const navigationGroups = ['.mobile-dock', '.work-navigation', '.case-navigation'].map(selector => {
  return [...document.querySelectorAll(`${selector} a[href^="#"]`)].map(link => ({
    link, section: document.querySelector(link.getAttribute('href'))
  })).filter(item => item.section);
});
let scrollQueued = false;
const updateNavigation = () => {
  for (const group of navigationGroups) {
    if (!group.length) continue;
    let active = group[0];
    for (const item of group) {
      if (item.section.getBoundingClientRect().top <= innerHeight * 0.38) active = item;
    }
    for (const item of group) {
      if (item === active) item.link.setAttribute('aria-current', 'location');
      else item.link.removeAttribute('aria-current');
    }
  }
  scrollQueued = false;
};
const queueNavigation = () => {
  if (!scrollQueued) { scrollQueued = true; requestAnimationFrame(updateNavigation); }
};
addEventListener('scroll', queueNavigation, { passive: true });
addEventListener('resize', queueNavigation);
updateNavigation();

const visualDialog = document.querySelector('.visual-dialog');
if (visualDialog?.showModal) {
  const preview = visualDialog.querySelector('img');
  const viewport = visualDialog.querySelector('.visual-viewport');
  const zoomButton = visualDialog.querySelector('[data-zoom-visual]');
  document.querySelectorAll('[data-visual-title]').forEach(link => {
    link.addEventListener('click', event => {
      event.preventDefault();
      const title = link.dataset.visualTitle;
      visualDialog.querySelector('h2').textContent = title;
      visualDialog.querySelector('[data-visual-caption]').textContent = link.dataset.visualCaption;
      preview.alt = link.closest('figure, .project-visual').querySelector('picture img').alt;
      preview.src = link.href;
      visualDialog.showModal();
      visualDialog.querySelector('[data-close-visual]').focus();
    });
  });
  visualDialog.querySelector('[data-close-visual]').addEventListener('click', () => visualDialog.close());
  visualDialog.addEventListener('click', event => { if (event.target === visualDialog) visualDialog.close(); });
  zoomButton.addEventListener('click', () => {
    const zoomed = viewport.classList.toggle('is-zoomed');
    zoomButton.setAttribute('aria-pressed', String(zoomed));
    zoomButton.textContent = zoomed ? 'Fit to screen' : 'Zoom in';
  });
  visualDialog.addEventListener('close', () => {
    viewport.classList.remove('is-zoomed');
    zoomButton.setAttribute('aria-pressed', 'false');
    zoomButton.textContent = 'Zoom in';
    viewport.scrollTo(0, 0);
  });
}

const copyEmail = document.querySelector('[data-copy-email]');
if (copyEmail && navigator.clipboard?.writeText) {
  copyEmail.hidden = false;
  copyEmail.addEventListener('click', async () => {
    const status = document.querySelector('[data-copy-status]');
    try {
      await navigator.clipboard.writeText('tirafi29@gmail.com');
      status.textContent = 'Copied';
    } catch { status.textContent = 'Please use the email link.'; }
  });
}

const form = document.querySelector('[data-contact-form]');
if (form) {
  form.hidden = false;
  const status = form.querySelector('[role="status"]');
  const button = form.querySelector('button[type="submit"]');
  button.disabled = false;
  let firstInteraction = 0;
  let lastAttempt = 0;
  let sending = false;
  form.addEventListener('focusin', () => { firstInteraction ||= Date.now(); });
  const showStatus = (message, state) => {
    status.textContent = message;
    status.dataset.state = state;
  };
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (sending || !form.reportValidity()) return;
    const data = new FormData(form);
    if (data.get('website')) {
      showStatus('Your message could not be sent. Please use the email link.', 'error');
      return;
    }
    const now = Date.now();
    if (!firstInteraction || now - firstInteraction < 2000 || now - lastAttempt < 10000) {
      showStatus('Please wait a few seconds before sending.', 'error');
      return;
    }
    const name = String(data.get('name') || '').trim();
    const email = String(data.get('email') || '').trim();
    const message = String(data.get('message') || '').trim();
    if (!name || !message) {
      showStatus('Please enter your name and message.', 'error');
      return;
    }
    sending = true;
    lastAttempt = now;
    button.disabled = true;
    button.textContent = 'Sending…';
    showStatus('Sending your message…', 'pending');
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);
    try {
      const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          service_id: 'service_41k41v6', template_id: 'template_portfolio', user_id: 'M5BLJwobTG7DtFnWI',
          template_params: { from_name: name, from_email: email, reply_to: email, subject: 'Portfolio contact', message, to_name: 'Towhidul Islam Rafi' }
        })
      });
      if (!response.ok) throw new Error('Message delivery failed');
      showStatus('Message sent. Thank you for getting in touch.', 'success');
      form.reset();
      firstInteraction = 0;
    } catch {
      showStatus('Message not sent. Your text is still here. Please retry or email tirafi29@gmail.com.', 'error');
    } finally {
      clearTimeout(timeout);
      sending = false;
      button.disabled = false;
      button.textContent = 'Send message';
    }
  });
}

// Retire any service worker installed by the previous portfolio.
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    const scope = new URL('.', document.querySelector('link[rel="canonical"]').href).pathname;
    for (const registration of registrations) {
      if (new URL(registration.scope).pathname === scope || new URL(registration.scope).pathname === '/my_portfolio/') registration.unregister();
    }
  }).catch(() => {});
}
