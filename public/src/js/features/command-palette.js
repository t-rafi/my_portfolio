/**
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
