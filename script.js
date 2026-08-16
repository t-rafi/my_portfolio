/* === UTILITY FUNCTIONS === */
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

const setButtonsState = (buttons, activeButton) => {
  buttons.forEach((button) => {
    const isActive = button === activeButton;
    button.classList.toggle('active', isActive);
    button.setAttribute('aria-pressed', String(isActive));
  });
};

const storage = {
  get(key) {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch {
      return false;
    }

    return true;
  }
};

/* === THEME SYSTEM === */
(() => {
  const toggles = document.querySelectorAll('.theme-toggle');
  if (!toggles.length) return;

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
})();

/* === SCROLL BEHAVIOR === */
(() => {
  const nav = document.getElementById('nav');
  const scrollTopButton = document.getElementById('scroll-top');

  if (!nav || !scrollTopButton) return;

  const updateScrollState = () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
    scrollTopButton.classList.toggle('visible', window.scrollY > 400);
  };

  window.addEventListener('scroll', updateScrollState, { passive: true });
  updateScrollState();

  scrollTopButton.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion.matches ? 'auto' : 'smooth' });
  });
})();

/* === MOBILE MENU === */
(() => {
  const toggle = document.getElementById('nav-toggle');
  const menu = document.getElementById('mobile-menu');
  const overlay = document.getElementById('nav-overlay');
  if (!toggle || !menu || !overlay) return;

  const closeMenu = ({ focusToggle = false } = {}) => {
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open mobile menu');
    menu.classList.remove('open');
    menu.setAttribute('aria-hidden', 'true');
    overlay.hidden = true;
    document.body.classList.remove('menu-open');

    if (focusToggle) toggle.focus();
  };

  const openMenu = () => {
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Close mobile menu');
    menu.classList.add('open');
    menu.setAttribute('aria-hidden', 'false');
    overlay.hidden = false;
    document.body.classList.add('menu-open');
  };

  toggle.addEventListener('click', () => {
    toggle.getAttribute('aria-expanded') === 'true' ? closeMenu() : openMenu();
  });

  overlay.addEventListener('click', () => closeMenu());

  menu.addEventListener('click', (event) => {
    if (event.target.closest('a')) closeMenu();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
      closeMenu({ focusToggle: true });
    }
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth >= 768) closeMenu();
  });
})();

/* === ANIMATIONS === */
(() => {
  const elements = document.querySelectorAll('.reveal, .erp-card, .project-card, .tech-card, .stat-card, .section-header');
  if (!elements.length) return;

  if (prefersReducedMotion.matches || !('IntersectionObserver' in window)) {
    elements.forEach((element) => element.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver((entries, activeObserver) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('visible');
      activeObserver.unobserve(entry.target);
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -24px 0px' });

  elements.forEach((element) => observer.observe(element));
})();

/* === STAT COUNTERS === */
(() => {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  const updateCounter = (counter) => {
    const target = Number(counter.dataset.count);
    const suffix = counter.querySelector('span')?.outerHTML || '';
    const duration = prefersReducedMotion.matches ? 1 : 900;
    const start = performance.now();

    const tick = (time) => {
      const progress = Math.min((time - start) / duration, 1);
      const value = Math.floor(progress * target);
      counter.innerHTML = `${value}${suffix}`;

      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  };

  if (prefersReducedMotion.matches || !('IntersectionObserver' in window)) {
    counters.forEach(updateCounter);
    return;
  }

  const observer = new IntersectionObserver((entries, activeObserver) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      updateCounter(entry.target);
      activeObserver.unobserve(entry.target);
    });
  }, { threshold: 0.5 });

  counters.forEach((counter) => observer.observe(counter));
})();

/* === PROJECT FILTERS === */
(() => {
  const filters = document.querySelectorAll('.filter-btn');
  const projects = document.querySelectorAll('.project-card[data-category]');
  if (!filters.length || !projects.length) return;

  const indicator = document.createElement('span');
  indicator.className = 'filter-indicator';
  filters[0].parentElement?.append(indicator);
  const moveIndicator = (filter) => {
    const parent = filter.parentElement;
    indicator.style.width = `${filter.offsetWidth}px`;
    indicator.style.height = `${filter.offsetHeight}px`;
    indicator.style.transform = `translate(${filter.offsetLeft - parent.offsetLeft}px, ${filter.offsetTop - parent.offsetTop}px)`;
  };
  moveIndicator(filters[0]);
  window.addEventListener('resize', () => moveIndicator(document.querySelector('.filter-btn.active') || filters[0]));

  filters.forEach((filter) => {
    filter.addEventListener('click', () => {
      const category = filter.dataset.filter;
      setButtonsState(filters, filter);
      moveIndicator(filter);

      projects.forEach((project) => {
        const categories = project.dataset.category.split(' ');
        project.classList.toggle('is-hidden', category !== 'all' && !categories.includes(category));
      });
    });
  });
})();

/* === CUSTOM CURSOR === */
(() => {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  const ring = document.createElement('div'); const dot = document.createElement('div');
  ring.className = 'cursor-ring'; dot.className = 'cursor-dot'; document.body.append(ring, dot);
  let targetX = -100; let targetY = -100; let ringX = -100; let ringY = -100;
  document.addEventListener('mousemove', (event) => { targetX = event.clientX; targetY = event.clientY; dot.style.left = `${targetX}px`; dot.style.top = `${targetY}px`; });
  document.querySelectorAll('a, button, input, textarea').forEach((element) => {
    element.dataset.cursor = 'link';
    element.addEventListener('mouseenter', () => ring.classList.add('is-hover'));
    element.addEventListener('mouseleave', () => ring.classList.remove('is-hover'));
  });
  const render = () => { ringX += (targetX - ringX) * .12; ringY += (targetY - ringY) * .12; ring.style.left = `${ringX}px`; ring.style.top = `${ringY}px`; requestAnimationFrame(render); };
  render();
})();

/* === CONTACT COPY === */
(() => {
  document.querySelectorAll('.copy-contact').forEach((button) => button.addEventListener('click', async () => {
    const original = button.textContent;
    try { await navigator.clipboard.writeText(button.dataset.copy); button.textContent = 'Copied!'; }
    catch { button.textContent = 'Copy failed'; }
    window.setTimeout(() => { button.textContent = original; }, 1500);
  }));
})();

/* === CGPA RING === */
(() => {
  const ring = document.querySelector('.cgpa-ring');
  if (!ring) return;
  if (!('IntersectionObserver' in window)) return ring.classList.add('is-visible');
  new IntersectionObserver((entries, observer) => entries.forEach((entry) => { if (entry.isIntersecting) { ring.classList.add('is-visible'); observer.unobserve(ring); } }), { threshold: .5 }).observe(ring);
})();

/* === SERVICE WORKER === */
(() => {
  if ('serviceWorker' in navigator) window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));
})();

/* === ACTIVE NAVIGATION === */
(() => {
  const links = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('main section[id]');
  if (!links.length || !sections.length || !('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const selector = `#${entry.target.id}`;
      links.forEach((link) => link.classList.toggle('active', link.getAttribute('href') === selector));
    });
  }, { rootMargin: '-40% 0px -50% 0px' });

  sections.forEach((section) => observer.observe(section));
})();

/* === PROFILE IMAGE FALLBACK === */
(() => {
  document.querySelectorAll('.profile-photo').forEach((image) => {
    const showFallback = () => image.parentElement?.classList.add('is-fallback');

    if (image.complete && !image.naturalWidth) showFallback();
    image.addEventListener('error', showFallback, { once: true });
  });
})();

/* === CONTACT FORM === */
function handleFormSubmit(event) {
  event.preventDefault();

  const form = event.currentTarget;
  const status = document.getElementById('form-status');
  const submitButton = form.querySelector('.form-submit');
  const name = document.getElementById('contact-name').value.trim();
  const email = document.getElementById('contact-email').value.trim();
  const message = document.getElementById('contact-message').value.trim();

  status.classList.remove('is-error', 'is-success');

  if (!name || !email || !message) {
    status.textContent = 'Please fill in all required fields.';
    status.classList.add('is-error');
    return;
  }

  const subject = document.getElementById('contact-subject').value || 'Portfolio Contact';
  const body = `Name: ${name}\nEmail: ${email}\n\n${message}`;

  submitButton.textContent = 'Opening email client...';
  submitButton.disabled = true;
  window.location.href = `mailto:tirafi29@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  window.setTimeout(() => {
    submitButton.textContent = 'Send Message';
    submitButton.disabled = false;
    status.textContent = 'Email client opened. Please send the email to complete.';
    status.classList.add('is-success');
  }, 1500);
}

document.querySelector('.contact-form')?.addEventListener('submit', handleFormSubmit);

/* === APP HERO GREETING === */
(() => {
  const greeting = document.querySelector('[data-greeting]');
  const name = document.querySelector('.hero-name__typing');
  const reveal = document.querySelectorAll('.hero-reveal');
  if (!greeting || !name) return;
  const hour = new Date().getHours();
  greeting.textContent = `${hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'}, I'm`;
  const fullName = 'Towhidul Islam Rafi';
  if (prefersReducedMotion.matches) {
    name.textContent = fullName;
    name.classList.add('is-complete');
    reveal.forEach((element) => element.classList.add('is-visible'));
    return;
  }
  let index = 0;
  const type = () => {
    name.textContent = fullName.slice(0, ++index);
    if (index < fullName.length) window.setTimeout(type, 60);
    else {
      name.classList.add('is-complete');
      reveal.forEach((element) => element.classList.add('is-visible'));
    }
  };
  type();
})();

/* === SKILL PROGRESS BARS === */
(() => {
  const cards = document.querySelectorAll('.tech-card');
  const levels = { Professional: 88, Intermediate: 62 };
  cards.forEach((card) => {
    card.querySelectorAll('.skill-item').forEach((item) => {
      const level = item.querySelector('.skill-level');
      const oldMeter = item.parentElement.querySelector(':scope > .skill-meter');
      if (!level || item.querySelector('.skill-meter')) return;
      const meter = oldMeter?.cloneNode(true) || document.createElement('div');
      meter.className = 'skill-meter';
      meter.setAttribute('aria-hidden', 'true');
      meter.innerHTML = `<span data-skill-level="${level.textContent.trim()}"></span>`;
      const meta = document.createElement('div');
      meta.className = 'skill-item__meta';
      meta.append(item.querySelector('.skill-name'), level);
      item.append(meta, meter);
    });
    card.querySelector(':scope > .skill-meter')?.remove();
  });
  const animate = (card) => card.querySelectorAll('[data-skill-level]').forEach((bar) => { bar.style.width = `${levels[bar.dataset.skillLevel] || 62}%`; });
  if (prefersReducedMotion.matches || !('IntersectionObserver' in window)) return cards.forEach(animate);
  const observer = new IntersectionObserver((entries, activeObserver) => entries.forEach((entry) => {
    if (entry.isIntersecting) { animate(entry.target); activeObserver.unobserve(entry.target); }
  }), { threshold: .35 });
  cards.forEach((card) => observer.observe(card));
})();

/* === MOBILE TAB NAVIGATION === */
(() => {
  const tabs = document.querySelectorAll('.bottom-tabs__tab');
  const sections = document.querySelectorAll('main section[id]');
  const indicator = document.querySelector('.tab-indicator');
  if (!tabs.length || !('IntersectionObserver' in window)) return;
  const setActive = (tab) => {
    tabs.forEach((item) => {
      const active = item === tab;
      item.classList.toggle('active', active);
      item.setAttribute('aria-selected', String(active));
    });
    if (indicator) indicator.style.transform = `translateX(${tab.offsetLeft + (tab.offsetWidth - indicator.offsetWidth) / 2}px)`;
  };
  const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const tab = [...tabs].find((item) => item.getAttribute('href') === `#${entry.target.id}`);
    if (tab) setActive(tab);
  }), { rootMargin: '-35% 0px -55% 0px' });
  sections.forEach((section) => observer.observe(section));
  tabs.forEach((tab) => tab.addEventListener('click', () => setActive(tab)));
  window.addEventListener('resize', () => setActive(document.querySelector('.bottom-tabs__tab.active') || tabs[0]));
  setActive(document.querySelector('.bottom-tabs__tab.active') || tabs[0]);
})();

/* === PROJECT MOBILE CAROUSEL === */
(() => {
  const grid = document.querySelector('.projects-grid');
  const dots = document.querySelector('.projects-dots');
  const hint = document.querySelector('.projects-swipe-hint');
  if (!grid || !dots) return;
  const cards = [...grid.querySelectorAll('.project-card')];
  cards.forEach((_, index) => { const dot = document.createElement('span'); dot.className = `projects-dots__dot${index === 0 ? ' active' : ''}`; dots.append(dot); });
  const updateDots = () => {
    const active = Math.round(grid.scrollLeft / Math.max(1, cards[0].offsetWidth + 12));
    dots.querySelectorAll('.projects-dots__dot').forEach((dot, index) => dot.classList.toggle('active', index === active));
  };
  grid.addEventListener('scroll', updateDots, { passive: true });
  window.setTimeout(() => hint?.classList.add('is-hidden'), 2000);
})();

/* === CONTACT FAB & SCROLL PROGRESS === */
(() => {
  const progress = document.querySelector('.read-progress');
  const fab = document.querySelector('.contact-fab');
  const hero = document.getElementById('hero');
  if (!progress || !fab || !hero) return;
  const update = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = `${max ? (window.scrollY / max) * 100 : 0}%`;
    fab.classList.toggle('visible', window.scrollY > hero.offsetHeight * .7);
  };
  window.addEventListener('scroll', update, { passive: true }); update();
  fab.addEventListener('click', () => document.getElementById('contact')?.scrollIntoView({ behavior: prefersReducedMotion.matches ? 'auto' : 'smooth' }));
})();

/* === MOBILE EXPERIENCE ACCORDION === */
(() => {
  const cards = document.querySelectorAll('.exp-item');
  const mobile = window.matchMedia('(max-width: 767px)');
  cards.forEach((card) => {
    const chevron = document.createElement('span'); chevron.className = 'exp-chevron'; chevron.setAttribute('aria-hidden', 'true'); chevron.textContent = '›'; card.append(chevron);
    card.addEventListener('click', (event) => { if (mobile.matches && !event.target.closest('a')) card.classList.toggle('is-expanded'); });
  });
})();

/* === MOBILE SECTION SWIPES === */
(() => {
  const sections = [...document.querySelectorAll('main section[id]')];
  const mobile = window.matchMedia('(max-width: 767px)');
  let startX = 0; let startY = 0;
  document.querySelector('main')?.addEventListener('touchstart', (event) => {
    if (!mobile.matches || event.target.closest('.projects-grid')) return;
    startX = event.changedTouches[0].clientX; startY = event.changedTouches[0].clientY;
  }, { passive: true });
  document.querySelector('main')?.addEventListener('touchend', (event) => {
    if (!mobile.matches || event.target.closest('.projects-grid')) return;
    const deltaX = event.changedTouches[0].clientX - startX; const deltaY = event.changedTouches[0].clientY - startY;
    if (Math.abs(deltaX) < 60 || Math.abs(deltaY) > 30) return;
    const current = sections.reduce((best, section, index) => Math.abs(section.getBoundingClientRect().top) < Math.abs(sections[best].getBoundingClientRect().top) ? index : best, 0);
    const next = Math.max(0, Math.min(sections.length - 1, current + (deltaX < 0 ? 1 : -1)));
    sections[next].scrollIntoView({ behavior: prefersReducedMotion.matches ? 'auto' : 'smooth' });
  }, { passive: true });
})();

(function(){
  const SB_URL='https://uvjsrhbtzgrggjuucdyo.supabase.co';
  const SB_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV2anNyaGJ0emdyZ2dqdXVjZHlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY3NzU5NDIsImV4cCI6MjEwMjM1MTk0Mn0.pph1uARdG-Wk0gSyTzbUsSpcZDrboj7Ka1nNH1Dxn-E';
  let _db=null;
  function db(){if(!_db)_db=supabase.createClient(SB_URL,SB_KEY);return _db;}
  window.openGuestbookModal=function(){
    const ol=document.getElementById('gb-overlay');
    ol.style.display='flex';document.body.style.overflow='hidden';
    db().auth.getSession().then(({data:{session}})=>{
      if(session?.user)showWriteView(session.user);else showSigninView();
    });
  };
  window.closeGuestbookModal=function(){
    document.getElementById('gb-overlay').style.display='none';
    document.body.style.overflow='';
  };
  window.gbSignIn=function(provider){
    db().auth.signInWithOAuth({provider,options:{redirectTo:location.href+'?gb=1'}});
  };
  window.gbSignOut=function(){db().auth.signOut().then(()=>showSigninView());};
  window.gbSend=async function(){
    const text=document.getElementById('gb-msg').value.trim();
    const st=document.getElementById('gb-status');
    const btn=document.getElementById('gb-send-btn');
    if(!text){st.style.color='#f85149';st.textContent='Please write something.';return;}
    btn.disabled=true;btn.textContent='Sending...';
    const {data:{session}}=await db().auth.getSession();
    if(!session){showSigninView();return;}
    const u=session.user,meta=u.user_metadata;
    const {error}=await db().from('guestbook').insert({
      name:meta.full_name||meta.name||u.email?.split('@')[0]||'Anonymous',
      email:u.email||'',message:text,
      avatar_url:meta.avatar_url||meta.picture||null,
      provider:u.app_metadata?.provider||'unknown',approved:false
    });
    btn.disabled=false;btn.textContent='Send ✓';
    if(error){st.style.color='#f85149';st.textContent='Failed. Try again.';}
    else{st.style.color='#3fb950';st.textContent='✓ Sent! Will appear after approval.';document.getElementById('gb-msg').value='';}
  };
  function showSigninView(){
    document.getElementById('gb-signin-view').style.display='block';
    document.getElementById('gb-write-view').style.display='none';
  }
  function showWriteView(user){
    document.getElementById('gb-signin-view').style.display='none';
    document.getElementById('gb-write-view').style.display='block';
    const meta=user.user_metadata;
    const name=meta.full_name||meta.name||user.email?.split('@')[0]||'User';
    const avatar=meta.avatar_url||meta.picture||null;
    document.getElementById('gb-user-bar').innerHTML=`${avatar?`<img src="${avatar}" style="width:32px;height:32px;border-radius:50%;object-fit:cover;">`:
    `<span style="width:32px;height:32px;border-radius:50%;background:#6c8bff;display:grid;place-items:center;color:#fff;font-weight:700;font-size:.85rem;flex-shrink:0;">${name.charAt(0).toUpperCase()}</span>`}
    <div><div style="color:#e6edf3;font-size:.875rem;font-weight:600;">${name}</div><div style="color:#8b949e;font-size:.75rem;">${user.email||''}</div></div>`;
  }
  if(location.search.includes('gb=1')){
    window.addEventListener('load',()=>{
      db().auth.getSession().then(({data:{session}})=>{
        if(session?.user){openGuestbookModal();history.replaceState({},'',location.pathname);}
      });
    });
  }
  db().auth.onAuthStateChange((_,session)=>{
    if(session?.user&&document.getElementById('gb-overlay').style.display==='flex')
      showWriteView(session.user);
  });
})();
