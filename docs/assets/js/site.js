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

const form = document.querySelector('[data-contact-form]');
if (form) {
  form.hidden = false;
  const status = form.querySelector('[role="status"]');
  const button = form.querySelector('button[type="submit"]');
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
