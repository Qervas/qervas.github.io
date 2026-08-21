/* summary-more.js — Expand/collapse summary detail */
(function () {
  const moreBtn = document.getElementById('summary-more-btn');
  const moreEl = document.getElementById('summary-more');
  if (!moreBtn || !moreEl) return;
  moreBtn.addEventListener('click', function () {
    const open = moreEl.hasAttribute('hidden');
    if (open) {
      moreEl.removeAttribute('hidden');
      moreBtn.setAttribute('aria-expanded', 'true');
      moreBtn.textContent = 'Less detail';
    } else {
      moreEl.setAttribute('hidden', '');
      moreBtn.setAttribute('aria-expanded', 'false');
      moreBtn.textContent = 'More detail';
    }
  });
})();
