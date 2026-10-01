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
import { initAiChatbot } from './ui/ai-chatbot.js';
import { initCoverLetterTool } from './ui/cover-letter.js';

document.addEventListener('DOMContentLoaded', () => {
  const runInit = (name, init) => {
    try {
      Promise.resolve(init()).catch((error) => console.error(`${name} failed`, error));
    } catch (error) {
      console.error(`${name} failed`, error);
    }
  };

  // Core
  runInit('initTheme', initTheme);
  runInit('initScroll', initScroll);
  runInit('initNav', initNav);

  // Features
  runInit('initAnalytics', initAnalytics);
  runInit('initBottomSheet', initBottomSheet);
  runInit('initHaptic', initHaptic);
  runInit('initPullRefresh', initPullRefresh);
  runInit('initSkillBars', initSkillBars);
  runInit('initProjectSwipe', initProjectSwipe);
  runInit('initCommandPalette', initCommandPalette);
  runInit('initLeadCapture', initLeadCapture);
  runInit('initVisitorCounter', initVisitorCounter);
  runInit('initSectionDots', initSectionDots);
  runInit('initGuestbook', initGuestbook);

  // UI
  runInit('initCounters', initCounters);
  runInit('initTyping', initTyping);
  runInit('initContactForm', initContactForm);
  runInit('initAiChatbot', initAiChatbot);
  runInit('initCoverLetterTool', initCoverLetterTool);
});
