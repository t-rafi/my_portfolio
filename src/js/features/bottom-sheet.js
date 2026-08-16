/**
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
