/**
 * Lead Capture System (Exit Intent + CV Download Gate)
 */
export function initLeadCapture() {
  const SUPABASE_URL = 'https://uvjsrhbtzgrggjuucdyo.supabase.co';
  const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV2anNyaGJ0emdyZ2dqdXVjZHlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY3NzU5NDIsImV4cCI6MjEwMjM1MTk0Mn0.pph1uARdG-Wk0gSyTzbUsSpcZDrboj7Ka1nNH1Dxn-E';

  const exitModal = document.getElementById('exit-intent-modal');
  const cvModal = document.getElementById('cv-lead-modal');
  let pendingDownloadHref = 'Towhidul-Islam-Rafi-CV.pdf';
  let pendingDownloadName = 'Towhidul-Islam-Rafi-CV.pdf';
  let exitIntentTriggered = false;

  const hasLeadBeenCollected = () => Boolean(localStorage.getItem('rafi_lead_collected'));

  const submitLeadToSupabase = async ({ name, email, company = '', source = 'exit_intent' }) => {
    const sessionId = sessionStorage.getItem('_sid') || crypto.randomUUID();
    sessionStorage.setItem('_sid', sessionId);

    if (window.supabase) {
      try {
        const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
        await client.from('leads').insert({
          session_id: sessionId,
          name,
          email,
          company: company || null,
          source,
          page_url: location.href
        });
        await client.from('visits').update({ lead_name: name, lead_email: email }).eq('session_id', sessionId);
      } catch (err) {
        console.warn('Lead sync skipped:', err);
      }
    }
    localStorage.setItem('rafi_lead_collected', '1');
  };

  window.closeExitIntentModal = () => { if (exitModal) exitModal.style.display = 'none'; };
  window.openExitIntentModal = () => {
    if (hasLeadBeenCollected() || exitIntentTriggered || !exitModal) return;
    exitIntentTriggered = true;
    exitModal.style.display = 'flex';
  };

  window.closeCvLeadModal = () => { if (cvModal) cvModal.style.display = 'none'; };
  window.openCvLeadModal = (href, downloadName) => {
    if (cvModal) {
      pendingDownloadHref = href || pendingDownloadHref;
      pendingDownloadName = downloadName || pendingDownloadName;
      cvModal.style.display = 'flex';
    }
  };

  window.handleExitIntentSubmit = async (e) => {
    e.preventDefault();
    const name = document.getElementById('exit-name').value.trim();
    const email = document.getElementById('exit-email').value.trim();
    if (!name || !email) return;

    await submitLeadToSupabase({ name, email, source: 'exit_intent' });
    const status = document.getElementById('exit-status');
    if (status) { status.textContent = `Thanks ${name}! I'll reach out soon 🙌`; status.className = 'lead-status is-success'; }
    window.setTimeout(() => window.closeExitIntentModal(), 1500);
  };

  window.handleCvLeadSubmit = async (e) => {
    e.preventDefault();
    const name = document.getElementById('cv-lead-name').value.trim();
    const email = document.getElementById('cv-lead-email').value.trim();
    const company = document.getElementById('cv-lead-company')?.value.trim() || '';
    if (!name || !email) return;

    await submitLeadToSupabase({ name, email, company, source: 'cv_download' });
    const status = document.getElementById('cv-lead-status');
    if (status) { status.textContent = `✓ Thanks ${name}! Downloading your CV now...`; status.className = 'lead-status is-success'; }

    const link = document.createElement('a');
    link.href = pendingDownloadHref;
    link.download = pendingDownloadName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => window.closeCvLeadModal(), 1500);
  };

  document.querySelectorAll('a[href*="-CV."], a[download*="-CV"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      if (hasLeadBeenCollected()) return;
      e.preventDefault();
      window.openCvLeadModal(link.href, link.getAttribute('download') || 'Towhidul-Islam-Rafi-CV.pdf');
    });
  });

  document.documentElement.addEventListener('mouseleave', (e) => {
    if (e.clientY <= 10 && !hasLeadBeenCollected()) window.openExitIntentModal();
  });

  let dwellMet = false;
  window.setTimeout(() => { dwellMet = true; }, 30000);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden' && dwellMet && !hasLeadBeenCollected()) {
      window.openExitIntentModal();
    }
  });

  [exitModal, cvModal].forEach((m) => {
    if (!m) return;
    m.addEventListener('click', (e) => { if (e.target === m) m.style.display = 'none'; });
  });
}
