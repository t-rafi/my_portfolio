
  const SUPABASE_URL = 'https://uvjsrhbtzgrggjuucdyo.supabase.co';
  const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV2anNyaGJ0emdyZ2dqdXVjZHlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY3NzU5NDIsImV4cCI6MjEwMjM1MTk0Mn0.pph1uARdG-Wk0gSyTzbUsSpcZDrboj7Ka1nNH1Dxn-E';
  const db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

  let currentUser = null;

  // ── AUTH ────────────────────────────────────────────────
  async function signIn(provider) {
    const { error } = await db.auth.signInWithOAuth({
      provider,
      options: { redirectTo: 'https://t-rafi.github.io/my_portfolio/guestbook.html' }
    });
    if (error) alert('Sign in failed: ' + error.message);
  }

  async function signOut() {
    await db.auth.signOut();
    currentUser = null;
    showAuth();
  }

  function showAuth() {
    document.getElementById('auth-section').style.display = 'block';
    document.getElementById('user-bar').style.display = 'none';
    document.getElementById('write-form').style.display = 'none';
  }

  function showUser(user) {
    document.getElementById('auth-section').style.display = 'none';
    document.getElementById('user-bar').style.display = 'flex';
    document.getElementById('write-form').style.display = 'block';

    const meta = user.user_metadata || {};
    const name = String(meta.full_name || meta.name || user.email?.split('@')[0] || 'User');
    const email = user.email || '';
    const avatar = meta.avatar_url || meta.picture || null;

    document.getElementById('user-name').textContent = name;
    document.getElementById('user-email').textContent = email;

    const avatarEl = document.getElementById('user-avatar');
    const initial = name.charAt(0).toUpperCase();
    avatarEl.textContent = initial;
    if (typeof avatar === 'string' && avatar.startsWith('https:')) {
      const image = document.createElement('img');
      image.alt = `Profile photo of ${name}`;
      image.addEventListener('error', () => { avatarEl.textContent = initial; }, { once: true });
      image.src = avatar;
      avatarEl.replaceChildren(image);
    }
  }

  // ── MESSAGE FORM ────────────────────────────────────────
  function updateCount() {
    const len = document.getElementById('msg-input').value.length;
    const el = document.getElementById('char-count');
    el.textContent = `${len} / 500`;
    el.classList.toggle('warn', len > 450);
  }

  async function submitMessage() {
    const text = document.getElementById('msg-input').value.trim();
    if (!text) return;
    if (!currentUser) return;

    const btn = document.getElementById('submit-btn');
    btn.disabled = true;
    btn.textContent = 'Sending...';

    const meta = currentUser.user_metadata || {};
    const name = meta.full_name || meta.name || currentUser.email?.split('@')[0] || 'Anonymous';
    const email = currentUser.email || '';
    const avatar = meta.avatar_url || meta.picture || null;
    const provider = currentUser.app_metadata?.provider || 'unknown';

    let error;
    try {
      ({ error } = await db.from('guestbook').insert({
        name,
        email,
        message: text,
        avatar_url: avatar,
        provider
      }));
    } catch (caught) {
      error = caught;
    }

    btn.disabled = false;
    btn.textContent = 'Send Message';

    const msgEl = document.getElementById('form-msg');
    if (error) {
      msgEl.textContent = 'Failed to send. Try again.';
      msgEl.className = 'error';
    } else {
      document.getElementById('msg-input').value = '';
      updateCount();
      document.getElementById('pending-note').style.display = 'block';
      msgEl.textContent = '';
    }
  }

  // ── LOAD MESSAGES ───────────────────────────────────────
  function relTime(iso) {
    const diff = Math.floor((Date.now() - new Date(iso)) / 1000);
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff/86400)}d ago`;
    return new Date(iso).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' });
  }

  function providerBadge(p) {
    const map = { google: 'Google', linkedin_oidc: 'LinkedIn', facebook: 'Facebook' };
    const cls = { google: 'provider-google', linkedin_oidc: 'provider-linkedin', facebook: 'provider-facebook' };
    const badge = document.createElement('span');
    badge.className = `msg-provider ${cls[p] || ''}`;
    badge.textContent = map[p] || p || '';
    return badge;
  }

  async function loadMessages() {
    const { data, error } = await db
      .from('guestbook_public')
      .select('id,name,message,avatar_url,provider,created_at')
      .order('created_at', { ascending: false });

    const list = document.getElementById('messages-list');
    const countEl = document.getElementById('msg-count');

    if (error || !data) {
      const empty = document.createElement('div');
      empty.className = 'empty-state';
      empty.textContent = 'Could not load messages.';
      list.replaceChildren(empty);
      return;
    }

    countEl.textContent = data.length;

    if (!data.length) {
      const empty = document.createElement('div');
      empty.className = 'empty-state';
      empty.textContent = 'No messages yet. Be the first! 👋';
      list.replaceChildren(empty);
      return;
    }

    const cards = data.map((m) => {
      const name = String(m.name || 'Anonymous');
      const initial = name.charAt(0).toUpperCase() || '?';
      const card = document.createElement('div');
      card.className = 'msg-card';
      const header = document.createElement('div');
      header.className = 'msg-header';
      const avatar = document.createElement('div');
      avatar.className = 'msg-avatar';
      avatar.textContent = initial;
      if (typeof m.avatar_url === 'string' && m.avatar_url.startsWith('https:')) {
        const image = document.createElement('img');
        image.alt = `Profile photo of ${name}`;
        image.addEventListener('error', () => { avatar.textContent = initial; }, { once: true });
        image.src = m.avatar_url;
        avatar.replaceChildren(image);
      }
      const identity = document.createElement('div');
      const nameEl = document.createElement('div');
      nameEl.className = 'msg-name';
      nameEl.textContent = name;
      const time = document.createElement('div');
      time.className = 'msg-meta';
      time.textContent = relTime(m.created_at);
      identity.append(nameEl, time);
      header.append(avatar, identity, providerBadge(m.provider));
      const message = document.createElement('div');
      message.className = 'msg-text';
      message.textContent = m.message || '';
      card.append(header, message);
      return card;
    });
    list.replaceChildren(...cards);
  }

  // ── INIT ────────────────────────────────────────────────
  async function init() {
    const { data: { session } } = await db.auth.getSession();
    if (session?.user) {
      currentUser = session.user;
      showUser(currentUser);
    } else {
      showAuth();
    }

    db.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        currentUser = session.user;
        showUser(currentUser);
      } else {
        currentUser = null;
        showAuth();
      }
    });

    loadMessages();
  }

  init();
