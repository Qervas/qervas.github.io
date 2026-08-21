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
      if (!src || video.src.endsWith(src)) return;
      video.pause();
      video.src = src;
      video.load();
      video.currentTime = 0;
      video.play().catch(() => {});
    });
  });

  video.play().catch(() => { /* autoplay blocked; user gesture will start it */ });
})();
  
