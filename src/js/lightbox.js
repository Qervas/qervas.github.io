/* Image lightbox */

(() => {
  const lb = document.getElementById('lightbox');
  const lbImg = document.getElementById('lb-img');
  const lbCap = document.getElementById('lb-caption');
  const selector = '.featured-gallery-2x2 .cell img, .featured-gallery-2 .cell img, .featured-gallery-3 .cell img, .featured-grid-3 .cell img, .thesis-visual__row .cell img';
  document.querySelectorAll(selector).forEach(el => {
    el.addEventListener('click', () => {
      lbImg.src = el.currentSrc || el.src;
      lbImg.alt = el.alt || '';
      // Caption priority: explicit data-caption, sibling .cell-label, alt text
      const cell = el.closest('.cell');
      const labelEl = cell ? cell.querySelector('.cell-label') : null;
      lbCap.textContent = el.dataset.caption || (labelEl ? labelEl.textContent : '') || el.alt || '';
      lb.classList.add('open');
      lb.setAttribute('aria-hidden', 'false');
    });
  });
  const close = () => {
    lb.classList.remove('open');
    lb.setAttribute('aria-hidden', 'true');
  };
  lb.addEventListener('click', close);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && lb.classList.contains('open')) close();
  });
})();
