/* Thesis 3DGS video swapper (multi-material chips) */

// ── Thesis 3DGS video swapper (multi-material) ──
(() => {
  const video = document.getElementById('thesisVideoEl');
  if (!video) return;
  const chips = document.querySelectorAll('.thesis-chip');

  chips.forEach((chip) => {
    chip.addEventListener('click', () => {
      chips.forEach((c) => {
        const active = c === chip;
        c.classList.toggle('is-active', active);
        c.setAttribute('aria-selected', active ? 'true' : 'false');
      });
      const src = chip.dataset['3dgs'];
      if (!src || (video.getAttribute('src') || '').endsWith(src)) return;
      video.pause();
      video.src = src;
      video.load();
      video.currentTime = 0;
      video.play().catch(() => {});
    });
  });

  // Lazy start: load and play only while the video is on screen.
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const start = () => {
    if (!video.getAttribute('src')) video.src = video.dataset.src;
    if (!reduce) video.play().catch(() => {});
  };
  if ('IntersectionObserver' in window) {
    new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) start(); else video.pause(); });
    }, { rootMargin: '200px 0px' }).observe(video);
  } else {
    start();
  }
})();
  
