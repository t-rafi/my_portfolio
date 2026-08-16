/** Guestbook modal controls for the portfolio home page. */
export function initGuestbook() {
  const overlay = document.getElementById('gb-overlay');
  if (!overlay) return;

  const supabaseUrl = 'https://uvjsrhbtzgrggjuucdyo.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV2anNyaGJ0emdyZ2dqdXVjZHlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY3NzU5NDIsImV4cCI6MjEwMjM1MTk0Mn0.pph1uARdG-Wk0gSyTzbUsSpcZDrboj7Ka1nNH1Dxn-E';
  let client;
  const db = () => {
    if (!window.supabase?.createClient) throw new Error('Guestbook service is unavailable.');
    client ??= window.supabase.createClient(supabaseUrl, supabaseKey);
    return client;
  };
  const showSignIn = () => {
    document.getElementById('gb-signin-view').style.display = 'block';
    document.getElementById('gb-write-view').style.display = 'none';
  };
  const showWriter = (user) => {
    document.getElementById('gb-signin-view').style.display = 'none';
    document.getElementById('gb-write-view').style.display = 'block';
    const meta = user.user_metadata || {};
    const name = meta.full_name || meta.name || user.email?.split('@')[0] || 'User';
    const avatar = meta.avatar_url || meta.picture;
    const avatarHtml = avatar
      ? `<img src="${avatar}" alt="" style="width:32px;height:32px;border-radius:50%;object-fit:cover;">`
      : `<span style="width:32px;height:32px;border-radius:50%;background:#6c8bff;display:grid;place-items:center;color:#fff;font-weight:700;font-size:.85rem;flex-shrink:0;">${name.charAt(0).toUpperCase()}</span>`;
    document.getElementById('gb-user-bar').innerHTML = `${avatarHtml}<div><div style="color:#e6edf3;font-size:.875rem;font-weight:600;"></div><div style="color:#8b949e;font-size:.75rem;"></div></div>`;
    const labels = document.querySelectorAll('#gb-user-bar div div');
    labels[0].textContent = name;
    labels[1].textContent = user.email || '';
  };
  window.openGuestbookModal = async () => {
    overlay.style.display = 'flex'; document.body.style.overflow = 'hidden';
    try {
      const { data: { session } } = await db().auth.getSession();
      session?.user ? showWriter(session.user) : showSignIn();
    } catch (error) {
      showSignIn(); const status = document.getElementById('gb-status');
      if (status) { status.style.color = '#f85149'; status.textContent = error.message; }
    }
  };
  window.closeGuestbookModal = () => { overlay.style.display = 'none'; document.body.style.overflow = ''; };
  window.gbSignIn = async (provider) => {
    try { await db().auth.signInWithOAuth({ provider, options: { redirectTo: `${location.origin}${location.pathname}?gb=1` } }); }
    catch (error) { const status = document.getElementById('gb-status'); if (status) status.textContent = error.message; }
  };
  window.gbSignOut = async () => { await db().auth.signOut(); showSignIn(); };
  window.gbSend = async () => {
    const input = document.getElementById('gb-msg'), status = document.getElementById('gb-status'), button = document.getElementById('gb-send-btn');
    const message = input.value.trim();
    if (!message) { status.style.color = '#f85149'; status.textContent = 'Please write something.'; return; }
    button.disabled = true; button.textContent = 'Sending...';
    try {
      const { data: { session } } = await db().auth.getSession();
      if (!session?.user) { showSignIn(); return; }
      const user = session.user, meta = user.user_metadata || {};
      const { error } = await db().from('guestbook').insert({ name: meta.full_name || meta.name || user.email?.split('@')[0] || 'Anonymous', email: user.email || '', message, avatar_url: meta.avatar_url || meta.picture || null, provider: user.app_metadata?.provider || 'unknown', approved: false });
      if (error) throw error;
      status.style.color = '#3fb950'; status.textContent = '✓ Sent! It will appear after approval.'; input.value = '';
    } catch { status.style.color = '#f85149'; status.textContent = 'Failed to send. Please try again.'; }
    finally { button.disabled = false; button.textContent = 'Send ✓'; }
  };
  db().auth.onAuthStateChange((_event, session) => { if (session?.user && overlay.style.display === 'flex') showWriter(session.user); });
  if (new URLSearchParams(location.search).get('gb') === '1') window.addEventListener('load', () => window.openGuestbookModal(), { once: true });
}
