/**
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
import { initVisitorCounter } from './features/visitor-counter.js';
import { initSectionDots } from './features/section-dots.js';
import { initGuestbook } from './features/guestbook.js';

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
  initVisitorCounter();
  initSectionDots();
  initGuestbook();

  // UI
  initCounters();
  initTyping();
  initContactForm();
});
