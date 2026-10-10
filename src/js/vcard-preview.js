/* Hover preview on video cards: muted, short, desktop pointers only. */
(() => {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  document.querySelectorAll('.vgrid .vcard[data-preview]').forEach((card) => {
    const thumb = card.querySelector('.vcard-thumb');
    let v, timer;
    card.addEventListener('mouseenter', () => {
      timer = setTimeout(() => {
        v = document.createElement('video');
        v.className = 'vcard-preview';
        v.muted = true; v.playsInline = true; v.preload = 'auto';
        v.src = card.dataset.preview + '#t=20,32';
        v.addEventListener('playing', () => v.classList.add('is-on'));
        thumb.appendChild(v);
        v.play().catch(() => {});
      }, 350);
    });
    card.addEventListener('mouseleave', () => {
      clearTimeout(timer);
      if (v) { v.pause(); v.removeAttribute('src'); v.load(); v.remove(); v = null; }
    });
  });
})();
