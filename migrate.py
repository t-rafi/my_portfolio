"""
migrate.py — Enterprise Architecture Migration Script for Portfolio Project.
Restructures flat project into modern modular src/ & python/ architecture.
SAFE MODE: Copies/generates into new structure without deleting root originals.
"""

import os
import sys
import shutil
from pathlib import Path

# Ensure UTF-8 stdout encoding for Windows terminals
if sys.stdout.encoding and sys.stdout.encoding.lower() != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

try:
    from rich.console import Console
    from rich.table import Table
    from rich.panel import Panel
    from rich import box
    console = Console()
    HAS_RICH = True
except ImportError:
    HAS_RICH = False
    class ConsoleFallback:
        def print(self, *args, **kwargs):
            text = " ".join(str(a) for a in args)
            import re
            cleaned = re.sub(r'\[/?[a-zA-Z0-9_ #]+\]', '', text)
            print(cleaned)
    console = ConsoleFallback()

ROOT = Path(__file__).parent.resolve()
created_items = []


def log_item(status: str, path: str, desc: str):
    created_items.append((status, str(path), desc))


def create_directories():
    """Create the full folder architecture."""
    dirs = [
        "src/js/core",
        "src/js/features",
        "src/js/ui",
        "src/css/base",
        "src/css/layout",
        "src/css/sections",
        "src/css/components",
        "src/css/features",
        "src/pages",
        "python/core",
        "python/data",
        "python/generators",
        "python/analytics",
        "python/utils",
        "assets/img",
        "assets/cv",
        "assets/generated",
        "public"
    ]
    for d in dirs:
        p = ROOT / d
        p.mkdir(parents=True, exist_ok=True)
        log_item("DIR", d, "Directory created/verified")


def split_javascript():
    """Generate clean modular ES modules in src/js/."""
    
    # 1. src/js/core/theme.js
    (ROOT / "src/js/core/theme.js").write_text("""/**
 * Theme System (Dark / Light mode)
 */
export function initTheme() {
  const toggles = document.querySelectorAll('.theme-toggle');
  if (!toggles.length) return;

  const storage = {
    get(key) {
      try { return localStorage.getItem(key); } catch { return null; }
    },
    set(key, val) {
      try { localStorage.setItem(key, val); return true; } catch { return false; }
    }
  };

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
}
""", encoding="utf-8")
    log_item("JS", "src/js/core/theme.js", "Theme toggle system (ES Module)")

    # 2. src/js/core/scroll.js
    (ROOT / "src/js/core/scroll.js").write_text("""/**
 * Scroll Behavior & Reveal Animations
 */
export function initScroll() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const nav = document.getElementById('nav');
  const scrollTopButton = document.getElementById('scroll-top');
  const progress = document.querySelector('.read-progress');
  const fab = document.querySelector('.contact-fab');
  const hero = document.getElementById('hero');

  const updateScrollState = () => {
    const scrollY = window.scrollY;
    if (nav) nav.classList.toggle('scrolled', scrollY > 40);
    if (scrollTopButton) scrollTopButton.classList.toggle('visible', scrollY > 400);

    if (progress) {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = `${max ? (scrollY / max) * 100 : 0}%`;
    }

    if (fab && hero) {
      fab.classList.toggle('visible', scrollY > hero.offsetHeight * 0.7);
    }
  };

  window.addEventListener('scroll', updateScrollState, { passive: true });
  updateScrollState();

  if (scrollTopButton) {
    scrollTopButton.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion.matches ? 'auto' : 'smooth' });
    });
  }

  // Scroll Reveals
  const elements = document.querySelectorAll('.reveal, .erp-card, .project-card, .tech-card, .stat-card, .section-header');
  if (elements.length) {
    if (prefersReducedMotion.matches || !('IntersectionObserver' in window)) {
      elements.forEach((el) => el.classList.add('visible'));
    } else {
      const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('visible');
          obs.unobserve(entry.target);
        });
      }, { threshold: 0.15, rootMargin: '0px 0px -24px 0px' });
      elements.forEach((el) => observer.observe(el));
    }
  }

  // Custom Cursor
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    const ring = document.createElement('div');
    const dot = document.createElement('div');
    ring.className = 'cursor-ring';
    dot.className = 'cursor-dot';
    document.body.append(ring, dot);

    let targetX = -100, targetY = -100, ringX = -100, ringY = -100;
    document.addEventListener('mousemove', (e) => {
      targetX = e.clientX;
      targetY = e.clientY;
      dot.style.left = `${targetX}px`;
      dot.style.top = `${targetY}px`;
    });

    document.querySelectorAll('a, button, input, textarea').forEach((el) => {
      el.dataset.cursor = 'link';
      el.addEventListener('mouseenter', () => ring.classList.add('is-hover'));
      el.addEventListener('mouseleave', () => ring.classList.remove('is-hover'));
    });

    const renderCursor = () => {
      ringX += (targetX - ringX) * 0.12;
      ringY += (targetY - ringY) * 0.12;
      ring.style.left = `${ringX}px`;
      ring.style.top = `${ringY}px`;
      requestAnimationFrame(renderCursor);
    };
    renderCursor();
  }
}
""", encoding="utf-8")
    log_item("JS", "src/js/core/scroll.js", "Scroll & reveal logic (ES Module)")

    # 3. src/js/core/nav.js
    (ROOT / "src/js/core/nav.js").write_text("""/**
 * Navigation, Mobile Menu & Bottom Tab Bar
 */
export function initNav() {
  const toggle = document.getElementById('nav-toggle');
  const menu = document.getElementById('mobile-menu');
  const overlay = document.getElementById('nav-overlay');

  if (toggle && menu && overlay) {
    const closeMenu = () => {
      toggle.setAttribute('aria-expanded', 'false');
      menu.classList.remove('open');
      overlay.hidden = true;
      document.body.classList.remove('menu-open');
    };

    const openMenu = () => {
      toggle.setAttribute('aria-expanded', 'true');
      menu.classList.add('open');
      overlay.hidden = false;
      document.body.classList.add('menu-open');
    };

    toggle.addEventListener('click', () => {
      toggle.getAttribute('aria-expanded') === 'true' ? closeMenu() : openMenu();
    });

    overlay.addEventListener('click', closeMenu);
    menu.addEventListener('click', (e) => { if (e.target.closest('a')) closeMenu(); });
    window.addEventListener('resize', () => { if (window.innerWidth >= 768) closeMenu(); });
  }

  // Active Nav Links Sync
  const links = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('main section[id]');
  if (links.length && sections.length && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const selector = `#${entry.target.id}`;
        links.forEach((link) => link.classList.toggle('active', link.getAttribute('href') === selector));
      });
    }, { rootMargin: '-40% 0px -50% 0px' });
    sections.forEach((section) => observer.observe(section));
  }

  // Mobile Bottom Tabs
  const tabs = document.querySelectorAll('.bottom-tabs__tab');
  const indicator = document.querySelector('.tab-indicator');
  if (tabs.length && 'IntersectionObserver' in window) {
    const setActive = (tab) => {
      tabs.forEach((item) => {
        const active = item === tab;
        item.classList.toggle('active', active);
        item.setAttribute('aria-selected', String(active));
      });
      if (indicator) {
        indicator.style.transform = `translateX(${tab.offsetLeft + (tab.offsetWidth - indicator.offsetWidth) / 2}px)`;
      }
    };

    const tabObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const tab = [...tabs].find((item) => item.getAttribute('href') === `#${entry.target.id}`);
        if (tab) setActive(tab);
      });
    }, { rootMargin: '-35% 0px -55% 0px' });

    sections.forEach((sec) => tabObserver.observe(sec));
    tabs.forEach((tab) => tab.addEventListener('click', () => setActive(tab)));
    window.addEventListener('resize', () => setActive(document.querySelector('.bottom-tabs__tab.active') || tabs[0]));
    setActive(document.querySelector('.bottom-tabs__tab.active') || tabs[0]);
  }
}
""", encoding="utf-8")
    log_item("JS", "src/js/core/nav.js", "Navigation & tab bar (ES Module)")

    # 4. src/js/features/analytics.js
    (ROOT / "src/js/features/analytics.js").write_text((ROOT / "analytics.js").read_text(encoding="utf-8") if (ROOT / "analytics.js").exists() else """/**
 * Visitor Analytics Tracker (Supabase)
 */
export function initAnalytics() {
  const SUPABASE_URL = 'https://uvjsrhbtzgrggjuucdyo.supabase.co';
  const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV2anNyaGJ0emdyZ2dqdXVjZHlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY3NzU5NDIsImV4cCI6MjEwMjM1MTk0Mn0.pph1uARdG-Wk0gSyTzbUsSpcZDrboj7Ka1nNH1Dxn-E';

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

  const insert = async (page) => {
    if (!window.supabase) return;
    try {
      const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
      await client.from('visits').insert({
        page,
        referrer: document.referrer || 'Direct',
        device: getDevice(),
        session_id: getSessionId()
      });
    } catch {}
  };

  if (!sessionStorage.getItem('_visit_tracked')) {
    sessionStorage.setItem('_visit_tracked', '1');
    insert(location.pathname || '/');
  }
}
""", encoding="utf-8")
    log_item("JS", "src/js/features/analytics.js", "Analytics tracking (ES Module)")

    # 5. src/js/features/bottom-sheet.js (F1)
    (ROOT / "src/js/features/bottom-sheet.js").write_text("""/**
 * [FEATURE 1] Bottom Sheet Project Detail
 */
export function initBottomSheet() {
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
    const badgeHtml = badgeEl ? `<div class="sheet-badge ${isProfessional ? 'professional' : ''}">${badgeEl.innerHTML}</div>` : '';
    const titleHtml = titleEl ? `<h3 class="sheet-title" id="sheet-project-title">${titleEl.textContent}</h3>` : '';
    const descHtml = descEl ? `<p class="sheet-desc">${descEl.textContent}</p>` : '';
    const highlightsHtml = highlights.length ? `<div class="sheet-highlights">${highlights.map((h) => `<div class="sheet-highlight-item">${h.textContent}</div>`).join('')}</div>` : '';
    const stackHtml = badges.length ? `<div class="sheet-stack">${badges.map((b) => `<span class="badge">${b.textContent}</span>`).join('')}</div>` : '';

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
    card.addEventListener('click', (e) => {
      if (!isMobile()) return;
      if (e.target.closest('.project-footer a')) return;
      e.preventDefault();
      openBottomSheet(card);
    });
  });

  backdrop.addEventListener('click', closeBottomSheet);
  if (closeBtn) closeBtn.addEventListener('click', closeBottomSheet);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && sheet.classList.contains('is-open')) closeBottomSheet();
  });

  // Drag down gesture
  let startY = 0, currentY = 0, isDragging = false;
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
    if (deltaY > 0) panel.style.transform = `translateY(${deltaY}px)`;
  };
  const onTouchEnd = () => {
    if (!isDragging) return;
    isDragging = false;
    panel.style.transition = '';
    if (currentY - startY > 90) closeBottomSheet();
    else panel.style.transform = '';
  };

  if (handleBar) {
    handleBar.addEventListener('touchstart', onTouchStart, { passive: true });
    handleBar.addEventListener('touchmove', onTouchMove, { passive: true });
    handleBar.addEventListener('touchend', onTouchEnd, { passive: true });
  }
}
""", encoding="utf-8")
    log_item("JS", "src/js/features/bottom-sheet.js", "F1 Bottom Sheet Project Detail (ES Module)")

    # 6. src/js/features/haptic.js (F2)
    (ROOT / "src/js/features/haptic.js").write_text("""/**
 * [FEATURE 2] Haptic Feedback Engine
 */
export function triggerHaptic(pattern = 10) {
  if ('vibrate' in navigator) {
    try { navigator.vibrate(pattern); } catch (_) {}
  }
}

export function initHaptic() {
  document.querySelectorAll('.bottom-tabs__tab').forEach((tab) => tab.addEventListener('click', () => triggerHaptic(10)));
  document.querySelectorAll('.theme-toggle').forEach((btn) => btn.addEventListener('click', () => triggerHaptic(10)));
  document.querySelectorAll('.filter-btn').forEach((btn) => btn.addEventListener('click', () => triggerHaptic(10)));
  document.querySelector('.contact-form')?.addEventListener('submit', () => triggerHaptic(10));
}
""", encoding="utf-8")
    log_item("JS", "src/js/features/haptic.js", "F2 Haptic Feedback (ES Module)")

    # 7. src/js/features/pull-refresh.js (F3)
    (ROOT / "src/js/features/pull-refresh.js").write_text("""/**
 * [FEATURE 3] Pull-to-Refresh Hero Animation
 */
import { triggerHaptic } from './haptic.js';

export function initPullRefresh() {
  const hero = document.getElementById('hero');
  const ptr = document.getElementById('hero-ptr');
  if (!hero || !ptr) return;

  const circle = ptr.querySelector('.hero-ptr__ring circle');
  let startY = 0, currentY = 0, isPulling = false, isRefreshing = false;

  hero.addEventListener('touchstart', (e) => {
    if (window.scrollY > 10 || isRefreshing) return;
    startY = e.touches[0].clientY;
    currentY = startY;
    isPulling = true;
    ptr.style.transition = 'none';
  }, { passive: true });

  hero.addEventListener('touchmove', (e) => {
    if (!isPulling || isRefreshing) return;
    currentY = e.touches[0].clientY;
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
      triggerHaptic([10, 30, 10]);

      window.setTimeout(() => {
        ptr.classList.remove('is-refreshing');
        resetPTR();
        isRefreshing = false;
      }, 1200);
    } else {
      resetPTR();
    }
  }, { passive: true });
}
""", encoding="utf-8")
    log_item("JS", "src/js/features/pull-refresh.js", "F3 Pull to Refresh (ES Module)")

    # 8. src/js/features/skill-bars.js (F4)
    (ROOT / "src/js/features/skill-bars.js").write_text("""/**
 * [FEATURE 4] Animated Skill Proficiency Bars
 */
export function initSkillBars() {
  const cards = document.querySelectorAll('.tech-card');
  const levels = { Professional: '90%', Intermediate: '65%' };
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

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
}
""", encoding="utf-8")
    log_item("JS", "src/js/features/skill-bars.js", "F4 Skill Bars (ES Module)")

    # 9. src/js/features/swipe.js (F5)
    (ROOT / "src/js/features/swipe.js").write_text("""/**
 * [FEATURE 5] Swipe Gesture — Project Cards
 */
import { triggerHaptic } from './haptic.js';

export function initProjectSwipe() {
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

  // Project Category Filters
  const filters = document.querySelectorAll('.filter-btn');
  filters.forEach((filter) => {
    filter.addEventListener('click', () => {
      const category = filter.dataset.filter;
      filters.forEach((b) => {
        const isActive = b === filter;
        b.classList.toggle('active', isActive);
        b.setAttribute('aria-pressed', String(isActive));
      });

      document.querySelectorAll('.project-card[data-category]').forEach((proj) => {
        const cats = proj.dataset.category.split(' ');
        proj.classList.toggle('is-hidden', category !== 'all' && !cats.includes(category));
      });

      window.setTimeout(() => {
        renderDots();
        updateDots();
      }, 50);
    });
  });

  // Touch Swipe (threshold: 60px)
  let startX = 0, startY = 0;
  grid.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
  }, { passive: true });

  grid.addEventListener('touchend', (e) => {
    const deltaX = e.changedTouches[0].clientX - startX;
    const deltaY = e.changedTouches[0].clientY - startY;

    if (Math.abs(deltaX) >= 60 && Math.abs(deltaX) > Math.abs(deltaY)) {
      const cards = getVisibleCards();
      if (!cards.length) return;
      const cardWidth = cards[0].offsetWidth + 16;
      const currentIndex = Math.round(grid.scrollLeft / cardWidth);
      const nextIndex = deltaX < 0 ? Math.min(cards.length - 1, currentIndex + 1) : Math.max(0, currentIndex - 1);

      if (nextIndex !== currentIndex && cards[nextIndex]) {
        cards[nextIndex].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
        triggerHaptic(10);
      }
    }
  }, { passive: true });

  window.setTimeout(() => hint?.classList.add('is-hidden'), 3000);
}
""", encoding="utf-8")
    log_item("JS", "src/js/features/swipe.js", "F5 Project Swipe Carousel (ES Module)")

    # 10. src/js/features/command-palette.js (F6)
    (ROOT / "src/js/features/command-palette.js").write_text("""/**
 * [FEATURE 6] Command Palette (Cmd+K)
 */
import { triggerHaptic } from './haptic.js';

export function initCommandPalette() {
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
    { id: 'cv', title: 'Download CV (PDF)', group: 'Actions', icon: '📄', action: () => window.openCvLeadModal ? window.openCvLeadModal() : window.open('Towhidul-Islam-Rafi-CV.pdf', '_blank') },
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

      itemEl.addEventListener('click', () => executeCommand(cmd));
      itemEl.addEventListener('mouseenter', () => { selectedIndex = index; updateSelectedUI(); });
      list.appendChild(itemEl);
    });
  };

  const updateSelectedUI = () => {
    list.querySelectorAll('.cmd-item').forEach((item, idx) => {
      item.classList.toggle('is-selected', idx === selectedIndex);
    });
  };

  const filterCommands = (query) => {
    const q = query.toLowerCase().trim();
    filteredCommands = !q ? [...commands] : commands.filter(c => c.title.toLowerCase().includes(q) || c.group.toLowerCase().includes(q));
    selectedIndex = 0;
    renderList();
  };

  const executeCommand = (cmd) => {
    closePalette();
    if (cmd && typeof cmd.action === 'function') {
      cmd.action();
      triggerHaptic(10);
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

  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      modal.style.display === 'flex' ? closePalette() : openPalette();
      return;
    }
    if (modal.style.display !== 'flex') return;

    if (e.key === 'Escape') closePalette();
    else if (e.key === 'ArrowDown') {
      e.preventDefault();
      selectedIndex = (selectedIndex + 1) % Math.max(1, filteredCommands.length);
      updateSelectedUI();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      selectedIndex = (selectedIndex - 1 + filteredCommands.length) % Math.max(1, filteredCommands.length);
      updateSelectedUI();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCommands[selectedIndex]) executeCommand(filteredCommands[selectedIndex]);
    }
  });

  input.addEventListener('input', (e) => filterCommands(e.target.value));
  if (triggerBtn) triggerBtn.addEventListener('click', openPalette);
  if (backdrop) backdrop.addEventListener('click', closePalette);
  if (escBtn) escBtn.addEventListener('click', closePalette);
}
""", encoding="utf-8")
    log_item("JS", "src/js/features/command-palette.js", "F6 Command Palette (ES Module)")

    # 11. src/js/features/lead-capture.js (Exit Intent + CV Gate)
    (ROOT / "src/js/features/lead-capture.js").write_text("""/**
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
""", encoding="utf-8")
    log_item("JS", "src/js/features/lead-capture.js", "Lead Capture Engine (ES Module)")

    # 12. src/js/ui/counter.js
    (ROOT / "src/js/ui/counter.js").write_text("""/**
 * Stat Counters Animation
 */
export function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

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

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      updateCounter(entry.target);
      obs.unobserve(entry.target);
    });
  }, { threshold: 0.5 });

  counters.forEach((c) => observer.observe(c));
}
""", encoding="utf-8")
    log_item("JS", "src/js/ui/counter.js", "Stat Counters (ES Module)")

    # 13. src/js/ui/typing.js
    (ROOT / "src/js/ui/typing.js").write_text("""/**
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
""", encoding="utf-8")
    log_item("JS", "src/js/ui/typing.js", "Hero Typing (ES Module)")

    # 14. src/js/ui/contact-form.js
    (ROOT / "src/js/ui/contact-form.js").write_text("""/**
 * Contact Form Submission Handler
 */
export function initContactForm() {
  const form = document.querySelector('.contact-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const status = document.getElementById('form-status');
    const submitButton = form.querySelector('.form-submit');
    const name = document.getElementById('contact-name').value.trim();
    const email = document.getElementById('contact-email').value.trim();
    const message = document.getElementById('contact-message').value.trim();
    const subject = document.getElementById('contact-subject').value || 'Portfolio Contact';

    if (status) status.classList.remove('is-error', 'is-success');

    if (!name || !email || !message) {
      if (status) {
        status.textContent = 'Please fill in all required fields.';
        status.classList.add('is-error');
      }
      return;
    }

    if (submitButton) {
      submitButton.textContent = 'Opening email client...';
      submitButton.disabled = true;
    }

    const body = `Name: ${name}\\nEmail: ${email}\\n\\n${message}`;
    window.location.href = `mailto:tirafi29@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    window.setTimeout(() => {
      if (submitButton) {
        submitButton.textContent = 'Send Message';
        submitButton.disabled = false;
      }
      if (status) {
        status.textContent = 'Email client opened. Please send the email to complete.';
        status.classList.add('is-success');
      }
    }, 1500);
  });
}
""", encoding="utf-8")
    log_item("JS", "src/js/ui/contact-form.js", "Contact Form (ES Module)")

    # 15. src/js/main.js
    (ROOT / "src/js/main.js").write_text("""/**
 * main.js — Application Master Entry Point (ES Module)
 */
import { initTheme } from './core/theme.js';
import { initScroll } from './core/scroll.js';
import { initNav } from './core/nav.js';

import { initAnalytics } from './features/analytics.js';
import { initBottomSheet } from './features/bottom-sheet.js';
import { initHaptic } from './features/haptic.js';
import { initPullRefresh } from './features/pull-refresh.js';
import { initSkillBars } from './features/skill-bars.js';
import { initProjectSwipe } from './features/swipe.js';
import { initCommandPalette } from './features/command-palette.js';
import { initLeadCapture } from './features/lead-capture.js';

import { initCounters } from './ui/counter.js';
import { initTyping } from './ui/typing.js';
import { initContactForm } from './ui/contact-form.js';

document.addEventListener('DOMContentLoaded', () => {
  // Core
  initTheme();
  initScroll();
  initNav();

  // Features
  initAnalytics();
  initBottomSheet();
  initHaptic();
  initPullRefresh();
  initSkillBars();
  initProjectSwipe();
  initCommandPalette();
  initLeadCapture();

  // UI
  initCounters();
  initTyping();
  initContactForm();
});
""", encoding="utf-8")
    log_item("JS", "src/js/main.js", "Master JS Entry Point (ES Module)")


def split_css():
    """Create modular CSS architecture in src/css/."""
    # Write modular CSS files
    base_vars = ROOT / "src/css/base/variables.css"
    base_vars.write_text("""/* === CSS TOKENS & CUSTOM PROPERTIES === */
:root {
  --bg: #07080b;
  --bg-2: #0d0f14;
  --surface: #111318;
  --surface-2: #181b22;
  --border-active: #2a2d3d;
  --accent-soft: rgba(91,138,240,.12);
  --green: #3dd68c;
  --green-soft: rgba(61,214,140,.12);
  --text-1: #eceef4;
  --text-2: #8b92a8;
  --text-3: #454a5e;
  --tab-bar-h: 64px;
  --safe-bottom: env(safe-area-inset-bottom, 0px);
  --safe-top: env(safe-area-inset-top, 0px);
  --color-bg: #08090c;
  --color-surface: #0f1117;
  --color-surface-2: #161820;
  --color-border: #1e2030;
  --color-border-hover: #2d3048;
  --color-text-primary: #e8eaf0;
  --color-text-secondary: #9299b0;
  --color-text-dim: #4a5068;
  --color-accent: #6c8bff;
  --color-accent-dim: #1a2040;
  --color-accent-glow: rgba(108,139,255,.15);
  --color-green: #4ade80;
  --ease-out-expo: cubic-bezier(.16,1,.3,1);
  --ease-spring: cubic-bezier(.34,1.56,.64,1);
  --duration-base: 220ms;
  --bg-page: var(--color-bg);
  --bg-card: var(--color-surface);
  --bg-card-hover: #1c2128;
  --bg-nav: #0d1117ee;
  --border: var(--color-border);
  --text-primary: #e6edf3;
  --text-secondary: #8b949e;
  --text-muted: #484f58;
  --accent: var(--color-accent);
  --accent-hover: #79b8ff;
  --accent-glow: rgba(88, 166, 255, 0.15);
  --badge-bg: #1f2937;
  --badge-text: #93c5fd;
  --success: #3fb950;
  --danger: #f85149;
  --shadow: 0 4px 24px rgba(0, 0, 0, 0.4);
  --shadow-lift: 0 14px 34px rgba(0, 0, 0, 0.34);
  --overlay: rgba(1, 4, 9, 0.64);
  --white: #ffffff;
  --transparent: transparent;
  --font-display: "Plus Jakarta Sans", system-ui, sans-serif;
  --font-body: Inter, system-ui, sans-serif;
  --font-mono: "JetBrains Mono", monospace;
  --text-xs: 0.75rem;
  --text-sm: 0.875rem;
  --text-base: 0.9375rem;
  --text-md: 1rem;
  --text-lg: 1.125rem;
  --text-xl: 1.5rem;
  --text-2xl: clamp(1.375rem, 4vw, 2.25rem);
  --text-hero: clamp(1.75rem, 8vw, 3.25rem);
  --space-xs: 0.25rem;
  --space-sm: 0.5rem;
  --space-md: 0.75rem;
  --space-lg: 1rem;
  --space-xl: 1.5rem;
  --space-2xl: 2rem;
  --space-3xl: 3rem;
  --space-4xl: 4rem;
  --radius-sm: 0.375rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;
  --radius-pill: 999px;
  --border-width: 1px;
  --nav-height: 4rem;
  --drawer-width: 17.5rem;
  --container: 71.25rem;
  --transition-fast: 0.2s ease;
  --transition-reveal: 0.4s ease-out;
}

[data-theme="light"] {
  --bg-page: #f6f8fa;
  --bg-card: #ffffff;
  --bg-card-hover: #f0f4f8;
  --bg-nav: #ffffffee;
  --border: #d0d7de;
  --text-primary: #1f2328;
  --text-secondary: #57606a;
  --text-muted: #8c959f;
  --accent: #0969da;
  --accent-hover: #0550ae;
  --accent-glow: rgba(9, 105, 218, 0.12);
  --badge-bg: #ddf4ff;
  --badge-text: #0969da;
  --success: #1a7f37;
  --shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
  --shadow-lift: 0 14px 34px rgba(9, 105, 218, 0.14);
  --overlay: rgba(246, 248, 250, 0.72);
}
""", encoding="utf-8")
    log_item("CSS", "src/css/base/variables.css", "Design tokens & CSS variables")

    # Main CSS aggregator
    main_css = ROOT / "src/css/main.css"
    main_css.write_text("""/* === MASTER CSS ENTRY POINT === */
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap");

/* Base */
@import "./base/variables.css";

/* Full Production Styles from style.css */
@import "../../style.css";
""", encoding="utf-8")
    log_item("CSS", "src/css/main.css", "Master CSS Aggregator")


def organize_python_and_assets():
    """Copy and organize Python modules and assets."""
    # Copy cv_data.py to python/data/
    if (ROOT / "cv_data.py").exists():
        shutil.copy2(ROOT / "cv_data.py", ROOT / "python/data/cv_data.py")
        log_item("PY", "python/data/cv_data.py", "CV Data Source of Truth")

    # Copy build_cv.py to python/generators/cv_generator.py
    if (ROOT / "build_cv.py").exists():
        shutil.copy2(ROOT / "build_cv.py", ROOT / "python/generators/cv_generator.py")
        log_item("PY", "python/generators/cv_generator.py", "CV Generator")

    # Copy docx_builder
    if (ROOT / "core/docx_builder.py").exists():
        shutil.copy2(ROOT / "core/docx_builder.py", ROOT / "python/core/docx_builder.py")
        log_item("PY", "python/core/docx_builder.py", "DOCX Builder")

    (ROOT / "python/core/__init__.py").write_text("", encoding="utf-8")
    (ROOT / "python/__init__.py").write_text("", encoding="utf-8")

    # Copy dashboard.py to python/analytics/dashboard.py
    if (ROOT / "dashboard.py").exists():
        shutil.copy2(ROOT / "dashboard.py", ROOT / "python/analytics/dashboard.py")
        log_item("PY", "python/analytics/dashboard.py", "Terminal Dashboard")

    # Copy Pages
    if (ROOT / "Dashboard.html").exists():
        shutil.copy2(ROOT / "Dashboard.html", ROOT / "src/pages/dashboard.html")
        log_item("HTML", "src/pages/dashboard.html", "Analytics Web Dashboard")
    if (ROOT / "guestbook.html").exists():
        shutil.copy2(ROOT / "guestbook.html", ROOT / "src/pages/guestbook.html")
        log_item("HTML", "src/pages/guestbook.html", "Guestbook Page")

    # Copy Assets
    if (ROOT / "img.jpeg").exists():
        shutil.copy2(ROOT / "img.jpeg", ROOT / "assets/img/profile.jpeg")
        log_item("IMG", "assets/img/profile.jpeg", "Profile Image")

    for f in ROOT.glob("Towhidul-Islam-Rafi-CV.*"):
        shutil.copy2(f, ROOT / "assets/cv" / f.name)
        log_item("CV", f"assets/cv/{f.name}", "CV Document")

    # Create requirements.txt
    req_file = ROOT / "requirements.txt"
    req_file.write_text("""pillow>=10.0.0
matplotlib>=3.8.0
rich>=13.7.0
requests>=2.31.0
supabase>=2.3.0
python-docx>=1.1.0
""", encoding="utf-8")
    log_item("CFG", "requirements.txt", "Project Python Dependencies")

    # Create python/build.py skeleton
    (ROOT / "python/build.py").write_text("""\"\"\"
build.py — One-Command Build Pipeline for GitHub Pages Portfolio
\"\"\"
import sys
from pathlib import Path

# Add project root and python/ to sys.path
BASE_DIR = Path(__file__).parent.parent.resolve()
sys.path.insert(0, str(BASE_DIR))
sys.path.insert(0, str(BASE_DIR / "python"))

from build_extras import generate_readme, generate_sitemap, generate_robots

def main():
    print("🚀 Starting Portfolio Build Pipeline...")
    generate_readme()
    generate_sitemap()
    generate_robots()
    print("✨ Build completed successfully!")

if __name__ == "__main__":
    main()
""", encoding="utf-8")
    log_item("PY", "python/build.py", "Master Build Pipeline")


def update_index_html():
    """Update root index.html to link to src/css/main.css and src/js/main.js as module."""
    index_file = ROOT / "index.html"
    if not index_file.exists():
        return

    content = index_file.read_text(encoding="utf-8")
    
    # Update CSS link
    content = content.replace('href="style.css"', 'href="src/css/main.css"')
    
    # Update Script tags
    content = content.replace('<script src="analytics.js"></script>', '')
    content = content.replace('<script src="script.js"></script>', '<script type="module" src="src/js/main.js"></script>')

    index_file.write_text(content, encoding="utf-8")
    log_item("HTML", "index.html", "Updated CSS/JS module links in index.html")


def print_summary():
    """Print a Rich terminal table of all migrated files."""
    if HAS_RICH:
        table = Table(title="[bold green]📁 PROJECT ARCHITECTURE MIGRATION COMPLETE[/bold green]", box=box.ROUNDED)
        table.add_column("Type", style="cyan", width=8)
        table.add_column("Target Path", style="bold white", width=38)
        table.add_column("Description", style="dim", width=42)

        for t, p, d in created_items:
            table.add_row(t, p, d)
        console.print(table)
    else:
        print("=" * 80)
        print(" PROJECT ARCHITECTURE MIGRATION COMPLETE")
        print("=" * 80)
        for t, p, d in created_items:
            print(f"[{t:<4}] {p:<38} | {d}")
        print("=" * 80)


if __name__ == "__main__":
    create_directories()
    split_javascript()
    split_css()
    organize_python_and_assets()
    update_index_html()
    print_summary()
