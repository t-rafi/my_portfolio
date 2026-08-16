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

// [FEATURE 4] Animated Skill Bars
(() => {
  const cards = document.querySelectorAll('.tech-card');
  const levels = { Professional: '90%', Intermediate: '65%' };

  cards.forEach((card) => {
    card.querySelectorAll('.skill-item').forEach((item) => {
      const level = item.querySelector('.skill-level');
      const name = item.querySelector('.skill-name');
      if (!level || !name || item.querySelector('.skill-meter')) return;

      const meter = document.createElement('div');
      meter.className = 'skill-meter';
      meter.setAttribute('aria-hidden', 'true');
      const fill = document.createElement('span');
      fill.dataset.level = level.textContent.trim();
      fill.style.setProperty('--skill-fill', '0%');
      meter.appendChild(fill);

      const meta = document.createElement('div');
      meta.className = 'skill-item__meta';
      meta.append(name, level);

      item.innerHTML = '';
      item.append(meta, meter);
    });
    card.querySelector(':scope > .skill-meter')?.remove();
  });

  const fillBars = (card) => {
    card.querySelectorAll('.skill-meter span[data-level]').forEach((bar) => {
      const targetPercent = levels[bar.dataset.level] || '65%';
      bar.style.setProperty('--skill-fill', targetPercent);
    });
  };

  if (prefersReducedMotion.matches || !('IntersectionObserver' in window)) {
    cards.forEach(fillBars);
    return;
  }

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      fillBars(entry.target);
      obs.unobserve(entry.target);
    });
  }, { threshold: 0.3 });

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

// [FEATURE 5] Swipe Gesture — Project Cards
(() => {
  const grid = document.querySelector('.projects-grid');
  const dots = document.querySelector('.projects-dots');
  const hint = document.querySelector('.projects-swipe-hint');
  if (!grid || !dots) return;

  const getVisibleCards = () => [...grid.querySelectorAll('.project-card')].filter((c) => !c.classList.contains('is-hidden'));

  const renderDots = () => {
    dots.innerHTML = '';
    const cards = getVisibleCards();
    cards.forEach((card, index) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = `projects-dots__dot${index === 0 ? ' active' : ''}`;
      dot.setAttribute('aria-label', `Go to project ${index + 1}`);
      dot.addEventListener('click', () => {
        card.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
      });
      dots.appendChild(dot);
    });
  };

  const updateDots = () => {
    const cards = getVisibleCards();
    if (!cards.length) return;
    const cardWidth = cards[0].offsetWidth + 16;
    const activeIndex = Math.min(cards.length - 1, Math.max(0, Math.round(grid.scrollLeft / cardWidth)));
    dots.querySelectorAll('.projects-dots__dot').forEach((dot, index) => {
      dot.classList.toggle('active', index === activeIndex);
    });
  };

  renderDots();
  grid.addEventListener('scroll', updateDots, { passive: true });

  // Update dots whenever category filters are toggled
  document.querySelectorAll('.filter-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      window.setTimeout(() => {
        renderDots();
        updateDots();
      }, 50);
    });
  });

  // Touch Swipe Detection (threshold: 60px)
  let startX = 0;
  let startY = 0;

  grid.addEventListener('touchstart', (event) => {
    startX = event.touches[0].clientX;
    startY = event.touches[0].clientY;
  }, { passive: true });

  grid.addEventListener('touchend', (event) => {
    const deltaX = event.changedTouches[0].clientX - startX;
    const deltaY = event.changedTouches[0].clientY - startY;

    if (Math.abs(deltaX) >= 60 && Math.abs(deltaX) > Math.abs(deltaY)) {
      const cards = getVisibleCards();
      if (!cards.length) return;
      const cardWidth = cards[0].offsetWidth + 16;
      const currentIndex = Math.round(grid.scrollLeft / cardWidth);
      const nextIndex = deltaX < 0
        ? Math.min(cards.length - 1, currentIndex + 1)
        : Math.max(0, currentIndex - 1);

      if (nextIndex !== currentIndex && cards[nextIndex]) {
        cards[nextIndex].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
        if ('vibrate' in navigator) {
          try { navigator.vibrate(10); } catch (_) {}
        }
      }
    }
  }, { passive: true });

  window.setTimeout(() => hint?.classList.add('is-hidden'), 3000);
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

// [FEATURE 1] Bottom Sheet Project Detail
(() => {
  const sheet = document.getElementById('project-bottom-sheet');
  const panel = document.getElementById('sheet-panel');
  const backdrop = document.getElementById('sheet-backdrop');
  const closeBtn = document.getElementById('sheet-close-btn');
  const content = document.getElementById('sheet-content');
  const handleBar = document.getElementById('sheet-handle-bar');
  const projectCards = document.querySelectorAll('.project-card');

  if (!sheet || !panel || !backdrop || !content) return;

  const isMobile = () => window.innerWidth < 768;

  const closeBottomSheet = () => {
    sheet.classList.remove('is-open');
    sheet.setAttribute('aria-hidden', 'true');
    panel.style.transform = '';
    document.body.style.overflow = '';
  };

  const openBottomSheet = (card) => {
    const badgeEl = card.querySelector('.project-badge');
    const titleEl = card.querySelector('.project-title');
    const descEl = card.querySelector('.project-desc');
    const highlights = [...card.querySelectorAll('.project-highlight')];
    const badges = [...card.querySelectorAll('.project-stack .badge')];
    const linkEl = card.querySelector('.project-footer a, .project-footer span');

    const isProfessional = badgeEl?.classList.contains('professional');
    const badgeHtml = badgeEl
      ? `<div class="sheet-badge ${isProfessional ? 'professional' : ''}">${badgeEl.innerHTML}</div>`
      : '';
    const titleHtml = titleEl ? `<h3 class="sheet-title" id="sheet-project-title">${titleEl.textContent}</h3>` : '';
    const descHtml = descEl ? `<p class="sheet-desc">${descEl.textContent}</p>` : '';

    const highlightsHtml = highlights.length
      ? `<div class="sheet-highlights">${highlights.map((h) => `<div class="sheet-highlight-item">${h.textContent}</div>`).join('')}</div>`
      : '';

    const stackHtml = badges.length
      ? `<div class="sheet-stack">${badges.map((b) => `<span class="badge">${b.textContent}</span>`).join('')}</div>`
      : '';

    let actionHtml = '';
    if (linkEl) {
      if (linkEl.tagName.toLowerCase() === 'a' && linkEl.href) {
        actionHtml = `<div class="sheet-actions"><a href="${linkEl.href}" target="_blank" rel="noopener noreferrer" class="sheet-btn sheet-btn-primary">View on GitHub →</a></div>`;
      } else {
        actionHtml = `<div class="sheet-actions"><span class="sheet-btn sheet-btn-disabled">${linkEl.textContent}</span></div>`;
      }
    }

    content.innerHTML = `${badgeHtml}${titleHtml}${descHtml}${highlightsHtml}${stackHtml}${actionHtml}`;

    sheet.classList.add('is-open');
    sheet.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };

  projectCards.forEach((card) => {
    card.addEventListener('click', (event) => {
      if (!isMobile()) return;
      // Allow direct navigation if an active link inside the footer was clicked specifically
      if (event.target.closest('.project-footer a')) return;
      event.preventDefault();
      openBottomSheet(card);
    });
  });

  backdrop.addEventListener('click', closeBottomSheet);
  if (closeBtn) closeBtn.addEventListener('click', closeBottomSheet);

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && sheet.classList.contains('is-open')) {
      closeBottomSheet();
    }
  });

  // Drag-to-dismiss gesture handling
  let startY = 0;
  let currentY = 0;
  let isDragging = false;

  const onTouchStart = (e) => {
    startY = e.touches[0].clientY;
    currentY = startY;
    isDragging = true;
    panel.style.transition = 'none';
  };

  const onTouchMove = (e) => {
    if (!isDragging) return;
    currentY = e.touches[0].clientY;
    const deltaY = currentY - startY;
    if (deltaY > 0) {
      panel.style.transform = `translateY(${deltaY}px)`;
    }
  };

  const onTouchEnd = () => {
    if (!isDragging) return;
    isDragging = false;
    panel.style.transition = '';
    const deltaY = currentY - startY;
    if (deltaY > 90) {
      closeBottomSheet();
    } else {
      panel.style.transform = '';
    }
  };

  if (handleBar) {
    handleBar.addEventListener('touchstart', onTouchStart, { passive: true });
    handleBar.addEventListener('touchmove', onTouchMove, { passive: true });
    handleBar.addEventListener('touchend', onTouchEnd, { passive: true });
  }
})();

// [FEATURE 2] Haptic Feedback
(() => {
  const triggerHaptic = () => {
    if ('vibrate' in navigator) {
      try {
        navigator.vibrate(10);
      } catch (err) {
        // Silently handle any browser permission restriction
      }
    }
  };

  // 1. Bottom tab switch
  document.querySelectorAll('.bottom-tabs__tab').forEach((tab) => {
    tab.addEventListener('click', triggerHaptic);
  });

  // 2. Theme toggle press
  document.querySelectorAll('.theme-toggle').forEach((btn) => {
    btn.addEventListener('click', triggerHaptic);
  });

  // 3. Filter button press
  document.querySelectorAll('.filter-btn').forEach((btn) => {
    btn.addEventListener('click', triggerHaptic);
  });

  // 4. Contact form submit
  document.querySelector('.contact-form')?.addEventListener('submit', triggerHaptic);
})();

// [FEATURE 3] Pull-to-Refresh Hero Animation
(() => {
  const hero = document.getElementById('hero');
  const ptr = document.getElementById('hero-ptr');
  if (!hero || !ptr) return;

  const circle = ptr.querySelector('.hero-ptr__ring circle');
  let startY = 0;
  let currentY = 0;
  let isPulling = false;
  let isRefreshing = false;

  hero.addEventListener('touchstart', (event) => {
    if (window.scrollY > 10 || isRefreshing) return;
    startY = event.touches[0].clientY;
    currentY = startY;
    isPulling = true;
    ptr.style.transition = 'none';
  }, { passive: true });

  hero.addEventListener('touchmove', (event) => {
    if (!isPulling || isRefreshing) return;
    currentY = event.touches[0].clientY;
    const deltaY = currentY - startY;

    if (deltaY > 0 && window.scrollY <= 10) {
      const pullDistance = Math.min(deltaY * 0.45, 95);
      ptr.classList.add('is-visible');
      ptr.style.transform = `translate(-50%, ${pullDistance - 60}px)`;

      if (circle) {
        const progress = Math.min(deltaY / 80, 1);
        circle.style.strokeDashoffset = String(100 - progress * 75);
      }
    }
  }, { passive: true });

  const resetPTR = () => {
    isPulling = false;
    ptr.style.transition = '';
    ptr.classList.remove('is-visible');
    ptr.style.transform = '';
  };

  hero.addEventListener('touchend', () => {
    if (!isPulling || isRefreshing) return;
    const deltaY = currentY - startY;

    if (deltaY >= 80 && window.scrollY <= 10) {
      isRefreshing = true;
      isPulling = false;
      ptr.style.transition = '';
      ptr.classList.add('is-refreshing');

      if ('vibrate' in navigator) {
        try {
          navigator.vibrate([10, 30, 10]);
        } catch (_) {}
      }

      window.setTimeout(() => {
        ptr.classList.remove('is-refreshing');
        resetPTR();
        isRefreshing = false;
      }, 1200);
    } else {
      resetPTR();
    }
  }, { passive: true });
})();

// ===== LEAD CAPTURE SYSTEM (Exit Intent + CV Download Gate) =====
(() => {
  const SUPABASE_URL = 'https://uvjsrhbtzgrggjuucdyo.supabase.co';
  const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV2anNyaGJ0emdyZ2dqdXVjZHlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY3NzU5NDIsImV4cCI6MjEwMjM1MTk0Mn0.pph1uARdG-Wk0gSyTzbUsSpcZDrboj7Ka1nNH1Dxn-E';

  const exitModal = document.getElementById('exit-intent-modal');
  const cvModal = document.getElementById('cv-lead-modal');
  let pendingDownloadHref = 'Towhidul-Islam-Rafi-CV.pdf';
  let pendingDownloadName = 'Towhidul-Islam-Rafi-CV.pdf';
  let exitIntentTriggered = false;

  const hasLeadBeenCollected = () => Boolean(localStorage.getItem('rafi_lead_collected'));

  // Notification helper
  const notifyLead = (name, company) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        const compStr = company ? ` from ${company}` : '';
        new Notification(`🎯 New Lead`, {
          body: `${name}${compStr} wants your CV!`,
          icon: 'img.jpeg'
        });
      } catch (_) {}
    }
  };

  // Save to Supabase (leads table + update visits row)
  const submitLeadToSupabase = async ({ name, email, company = '', source = 'exit_intent' }) => {
    const sessionId = sessionStorage.getItem('_sid') || crypto.randomUUID();
    sessionStorage.setItem('_sid', sessionId);

    if (window.supabase) {
      try {
        const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
        // Insert into leads table
        await client.from('leads').insert({
          session_id: sessionId,
          name,
          email,
          company: company || null,
          source,
          page_url: location.href
        });

        // Update visits / page_visits table
        await client.from('visits').update({
          lead_name: name,
          lead_email: email
        }).eq('session_id', sessionId);
      } catch (err) {
        // Fail silently to never block user experience
        console.warn('Lead capture sync skipped:', err);
      }
    }

    localStorage.setItem('rafi_lead_collected', '1');
    notifyLead(name, company);
  };

  // Modal Open/Close helpers
  window.closeExitIntentModal = () => {
    if (exitModal) {
      exitModal.style.display = 'none';
      exitModal.setAttribute('aria-hidden', 'true');
    }
  };

  window.openExitIntentModal = () => {
    if (hasLeadBeenCollected() || exitIntentTriggered || !exitModal) return;
    exitIntentTriggered = true;
    exitModal.style.display = 'flex';
    exitModal.setAttribute('aria-hidden', 'false');
  };

  window.closeCvLeadModal = () => {
    if (cvModal) {
      cvModal.style.display = 'none';
      cvModal.setAttribute('aria-hidden', 'true');
    }
  };

  window.openCvLeadModal = (href, downloadName) => {
    if (cvModal) {
      pendingDownloadHref = href || pendingDownloadHref;
      pendingDownloadName = downloadName || pendingDownloadName;
      cvModal.style.display = 'flex';
      cvModal.setAttribute('aria-hidden', 'false');
    }
  };

  // Form Submissions
  window.handleExitIntentSubmit = async (event) => {
    event.preventDefault();
    const btn = document.getElementById('exit-submit-btn');
    const status = document.getElementById('exit-status');
    const name = document.getElementById('exit-name').value.trim();
    const email = document.getElementById('exit-email').value.trim();

    if (!name || !email) return;

    if (btn) { btn.disabled = true; btn.textContent = 'Connecting...'; }
    await submitLeadToSupabase({ name, email, source: 'exit_intent' });

    if (status) {
      status.textContent = `Thanks ${name}! I'll reach out soon 🙌`;
      status.className = 'lead-status is-success';
    }

    window.setTimeout(() => {
      closeExitIntentModal();
    }, 1500);
  };

  window.handleCvLeadSubmit = async (event) => {
    event.preventDefault();
    const btn = document.getElementById('cv-lead-submit-btn');
    const status = document.getElementById('cv-lead-status');
    const name = document.getElementById('cv-lead-name').value.trim();
    const email = document.getElementById('cv-lead-email').value.trim();
    const company = document.getElementById('cv-lead-company')?.value.trim() || '';

    if (!name || !email) return;

    if (btn) { btn.disabled = true; btn.textContent = 'Preparing Download...'; }
    await submitLeadToSupabase({ name, email, company, source: 'cv_download' });

    if (status) {
      status.textContent = `✓ Thanks ${name}! Downloading your CV now...`;
      status.className = 'lead-status is-success';
    }

    // Trigger download programmatically
    const link = document.createElement('a');
    link.href = pendingDownloadHref;
    link.download = pendingDownloadName;
    document.body.appendChild(link);
    link.click();
    link.remove();

    window.setTimeout(() => {
      closeCvLeadModal();
    }, 1500);
  };

  // CV Download Interception
  document.querySelectorAll('a[href*="-CV."], a[download*="-CV"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      if (hasLeadBeenCollected()) return; // If already collected, download directly
      event.preventDefault();
      openCvLeadModal(link.href, link.getAttribute('download') || 'Towhidul-Islam-Rafi-CV.pdf');
    });
  });

  // Exit Intent Triggers
  // 1. Desktop: mouse moves above viewport top
  document.documentElement.addEventListener('mouseleave', (event) => {
    if (event.clientY <= 10 && !hasLeadBeenCollected()) {
      openExitIntentModal();
    }
  });

  // 2. Mobile: 30s dwell time + page visibility change or popstate
  let dwellMet = false;
  window.setTimeout(() => { dwellMet = true; }, 30000);

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden' && dwellMet && !hasLeadBeenCollected()) {
      openExitIntentModal();
    }
  });

  // Close modals on outside overlay click
  [exitModal, cvModal].forEach((modal) => {
    if (!modal) return;
    modal.addEventListener('click', (event) => {
      if (event.target === modal) {
        modal.style.display = 'none';
        modal.setAttribute('aria-hidden', 'true');
      }
    });
  });
})();

// [FEATURE 6] Command Palette (Cmd+K)
(() => {
  const modal = document.getElementById('cmd-palette-modal');
  const input = document.getElementById('cmd-palette-input');
  const list = document.getElementById('cmd-palette-list');
  const triggerBtn = document.getElementById('cmd-palette-btn');
  const backdrop = document.getElementById('cmd-palette-backdrop');
  const escBtn = document.getElementById('cmd-esc-btn');

  if (!modal || !input || !list) return;

  const commands = [
    { id: 'home', title: 'Home / Hero', group: 'Navigation', icon: '🏠', action: () => document.getElementById('hero')?.scrollIntoView({ behavior: 'smooth' }) },
    { id: 'about', title: 'About Me', group: 'Navigation', icon: '👤', action: () => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' }) },
    { id: 'exp', title: 'Experience & Timeline', group: 'Navigation', icon: '💼', action: () => document.getElementById('experience')?.scrollIntoView({ behavior: 'smooth' }) },
    { id: 'skills', title: 'Technical Skills', group: 'Navigation', icon: '⚡', action: () => document.getElementById('skills')?.scrollIntoView({ behavior: 'smooth' }) },
    { id: 'projects', title: 'Projects Showcase', group: 'Navigation', icon: '📂', action: () => document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' }) },
    { id: 'edu', title: 'Education & Study', group: 'Navigation', icon: '🎓', action: () => document.getElementById('education')?.scrollIntoView({ behavior: 'smooth' }) },
    { id: 'contact', title: 'Contact & Opportunities', group: 'Navigation', icon: '📬', action: () => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }) },
    { id: 'cv', title: 'Download CV (PDF)', group: 'Actions', icon: '📄', action: () => { window.openCvLeadModal ? window.openCvLeadModal() : window.open('Towhidul-Islam-Rafi-CV.pdf', '_blank'); } },
    { id: 'theme', title: 'Toggle Dark / Light Theme', group: 'Actions', icon: '🌓', action: () => { const t = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'; document.documentElement.setAttribute('data-theme', t); localStorage.setItem('theme', t); } },
    { id: 'guestbook', title: 'Sign Guestbook', group: 'Actions', icon: '✍️', action: () => window.openGuestbookModal && window.openGuestbookModal() },
    { id: 'github', title: 'Open GitHub Profile', group: 'External Links', icon: '🐙', action: () => window.open('https://github.com/t-rafi', '_blank') },
    { id: 'linkedin', title: 'Open LinkedIn Profile', group: 'External Links', icon: '💼', action: () => window.open('https://www.linkedin.com/in/t-rafi/', '_blank') }
  ];

  let selectedIndex = 0;
  let filteredCommands = [...commands];

  const renderList = () => {
    list.innerHTML = '';
    if (!filteredCommands.length) {
      list.innerHTML = '<div class="cmd-palette-empty">No matching commands found.</div>';
      return;
    }

    let currentGroup = '';
    filteredCommands.forEach((cmd, index) => {
      if (cmd.group !== currentGroup) {
        currentGroup = cmd.group;
        const groupEl = document.createElement('div');
        groupEl.className = 'cmd-group-title';
        groupEl.textContent = currentGroup;
        list.appendChild(groupEl);
      }

      const itemEl = document.createElement('div');
      itemEl.className = `cmd-item${index === selectedIndex ? ' is-selected' : ''}`;
      itemEl.setAttribute('role', 'option');
      itemEl.setAttribute('aria-selected', String(index === selectedIndex));
      itemEl.innerHTML = `
        <div class="cmd-item-left">
          <span class="cmd-item-icon">${cmd.icon}</span>
          <span class="cmd-item-title">${cmd.title}</span>
        </div>
        <span class="cmd-item-tag">${cmd.group}</span>
      `;

      itemEl.addEventListener('click', () => {
        executeCommand(cmd);
      });

      itemEl.addEventListener('mouseenter', () => {
        selectedIndex = index;
        updateSelectedUI();
      });

      list.appendChild(itemEl);
    });

    scrollSelectedIntoView();
  };

  const updateSelectedUI = () => {
    const items = list.querySelectorAll('.cmd-item');
    items.forEach((item, idx) => {
      const isSel = idx === selectedIndex;
      item.classList.toggle('is-selected', isSel);
      item.setAttribute('aria-selected', String(isSel));
    });
  };

  const scrollSelectedIntoView = () => {
    const activeItem = list.querySelectorAll('.cmd-item')[selectedIndex];
    if (activeItem) {
      activeItem.scrollIntoView({ block: 'nearest' });
    }
  };

  const filterCommands = (query) => {
    const q = query.toLowerCase().trim();
    if (!q) {
      filteredCommands = [...commands];
    } else {
      filteredCommands = commands.filter(c => 
        c.title.toLowerCase().includes(q) || c.group.toLowerCase().includes(q)
      );
    }
    selectedIndex = 0;
    renderList();
  };

  const executeCommand = (cmd) => {
    closePalette();
    if (cmd && typeof cmd.action === 'function') {
      cmd.action();
      if ('vibrate' in navigator) try { navigator.vibrate(10); } catch (_) {}
    }
  };

  const openPalette = () => {
    modal.style.display = 'flex';
    modal.setAttribute('aria-hidden', 'false');
    input.value = '';
    filterCommands('');
    window.setTimeout(() => input.focus(), 50);
  };

  const closePalette = () => {
    modal.style.display = 'none';
    modal.setAttribute('aria-hidden', 'true');
  };

  window.closeCmdPalette = closePalette;
  window.openCmdPalette = openPalette;

  // Shortcuts & Events
  document.addEventListener('keydown', (e) => {
    // Cmd+K or Ctrl+K
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      modal.style.display === 'flex' ? closePalette() : openPalette();
      return;
    }

    if (modal.style.display !== 'flex') return;

    if (e.key === 'Escape') {
      e.preventDefault();
      closePalette();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      selectedIndex = (selectedIndex + 1) % Math.max(1, filteredCommands.length);
      updateSelectedUI();
      scrollSelectedIntoView();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      selectedIndex = (selectedIndex - 1 + filteredCommands.length) % Math.max(1, filteredCommands.length);
      updateSelectedUI();
      scrollSelectedIntoView();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCommands[selectedIndex]) {
        executeCommand(filteredCommands[selectedIndex]);
      }
    }
  });

  input.addEventListener('input', (e) => filterCommands(e.target.value));
  if (triggerBtn) triggerBtn.addEventListener('click', openPalette);
  if (backdrop) backdrop.addEventListener('click', closePalette);
  if (escBtn) escBtn.addEventListener('click', closePalette);
})();





