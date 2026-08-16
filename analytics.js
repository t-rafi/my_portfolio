(() => {
  'use strict';

  const SUPABASE_URL = 'https://uvjsrhbtzgrggjuucdyo.supabase.co';
  const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV2anNyaGJ0emdyZ2dqdXVjZHlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY3NzU5NDIsImV4cCI6MjEwMjM1MTk0Mn0.pph1uARdG-Wk0gSyTzbUsSpcZDrboj7Ka1nNH1Dxn-E';

  const isDev = () => ['localhost', '127.0.0.1'].includes(location.hostname);

  const getSessionId = () => {
    let id = sessionStorage.getItem('_sid');
    if (!id) { id = crypto.randomUUID(); sessionStorage.setItem('_sid', id); }
    return id;
  };

  const getDevice = () => {
    const ua = navigator.userAgent;
    if (/iPad|Tablet/i.test(ua) || (innerWidth >= 768 && innerWidth <= 1024)) return 'Tablet';
    if (/Mobi|Android|iPhone/i.test(ua) || innerWidth < 768) return 'Mobile';
    return 'Desktop';
  };

  const getBrowser = () => {
    const u = navigator.userAgent;
    if (/Edg\//.test(u)) return 'Edge';
    if (/OPR\//.test(u)) return 'Opera';
    if (/Firefox\//.test(u)) return 'Firefox';
    if (/Chrome\//.test(u)) return 'Chrome';
    if (/Safari\//.test(u)) return 'Safari';
    return 'Other';
  };

  const getOS = () => {
    const u = navigator.userAgent, p = navigator.platform;
    if (/Android/.test(u)) return 'Android';
    if (/iPhone|iPad|iPod/.test(u)) return 'iOS';
    if (/Win/.test(p)) return 'Windows';
    if (/Mac/.test(p)) return 'macOS';
    if (/Linux/.test(p)) return 'Linux';
    return 'Other';
  };

  const getGeo = async () => {
    try {
      const r = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(3500) });
      const d = await r.json();
      return { country: d.country_name || 'Unknown', city: d.city || 'Unknown' };
    } catch {
      return { country: 'Unknown', city: 'Unknown' };
    }
  };

  const insert = async (page) => {
    if (!window.supabase) return;
    try {
      const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
      const place = await getGeo();
      await client.from('visits').insert({
        page,
        referrer: document.referrer || 'Direct',
        country: place.country,
        city: place.city,
        device: getDevice(),
        browser: getBrowser(),
        os: getOS(),
        session_id: getSessionId()
      });
    } catch {}
  };

  const markOnce = (key, page) => {
    if (!sessionStorage.getItem(key)) {
      sessionStorage.setItem(key, '1');
      insert(page);
    }
  };

  const init = () => {
    if (isDev()) return;

    // Track page visit
    markOnce('_visit_tracked', location.pathname || '/');

    // Track section views
    document.querySelectorAll('section[id]').forEach((section) => {
      new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            markOnce(`_section_${section.id}`, section.id);
            observer.unobserve(section);
          }
        });
      }, { threshold: 0.5 }).observe(section);
    });

    // Track CV downloads
    document.querySelectorAll('a[href*=".pdf"], a[href*=".doc"]').forEach((link) => {
      link.addEventListener('click', () => {
        markOnce(`_dl_${link.href}`, `cv_download_${link.href.split('/').pop()}`);
      });
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();