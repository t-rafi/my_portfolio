/**
 * [FEATURE 10] EmailJS Contact Form Integration with Graceful Fallback
 */
export function initContactForm() {
  const form = document.querySelector('.contact-form');
  if (!form) return;

  const EMAILJS_SERVICE_ID = 'service_41k41v6';
  const EMAILJS_PUBLIC_KEY = 'M5BLJwobTG7DtFnWI';
  const EMAILJS_TEMPLATE_ID = 'template_portfolio';

  if (window.emailjs && typeof window.emailjs.init === 'function') {
    try {
      window.emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
    } catch (_) {}
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const status = document.getElementById('form-status');
    const submitButton = form.querySelector('.form-submit');
    const name = document.getElementById('contact-name')?.value.trim() || '';
    const email = document.getElementById('contact-email')?.value.trim() || '';
    const message = document.getElementById('contact-message')?.value.trim() || '';
    const subject = document.getElementById('contact-subject')?.value || 'Portfolio Contact Inquiry';

    if (status) status.classList.remove('is-error', 'is-success');

    if (!name || !email || !message) {
      if (status) {
        status.textContent = 'Please fill in all required fields.';
        status.classList.add('is-error');
      }
      return;
    }

    if (submitButton) {
      submitButton.textContent = 'Sending message...';
      submitButton.disabled = true;
    }

    let sent = false;

    // Try EmailJS first
    if (window.emailjs && typeof window.emailjs.send === 'function') {
      try {
        const templateParams = {
          from_name: name,
          from_email: email,
          reply_to: email,
          subject: subject,
          message: message,
          to_name: 'Towhidul Islam Rafi'
        };

        const res = await window.emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams);
        if (res && (res.status === 200 || res.text === 'OK')) {
          sent = true;
          if (status) {
            status.textContent = `✓ Thanks ${name}! Your message has been sent successfully.`;
            status.classList.add('is-success');
          }
          form.reset();
        }
      } catch (err) {
        console.warn('EmailJS attempt failed, falling back to mailto:', err);
      }
    }

    // If EmailJS failed or was not configured/reachable, fallback to mailto
    if (!sent) {
      const body = `Name: ${name}\nEmail: ${email}\n\n${message}`;
      window.location.href = `mailto:tirafi29@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

      if (status) {
        status.textContent = 'Opening your email client to complete sending...';
        status.classList.add('is-success');
      }
    }

    window.setTimeout(() => {
      if (submitButton) {
        submitButton.textContent = 'Send Message';
        submitButton.disabled = false;
      }
    }, 1200);
  });
}
