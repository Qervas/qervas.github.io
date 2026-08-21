/* nav-active.js — Highlight dock + profile tabs on scroll */
(function () {
  const tabLinks = Array.from(document.querySelectorAll('#section-nav a[data-nav]'));
  const dockLinks = Array.from(document.querySelectorAll('.nav-dock a[data-nav]'));
  const all = tabLinks.concat(dockLinks);
  const ids = Array.from(new Set(all.map(function (a) { return a.getAttribute('data-nav'); })));
  const sections = ids.map(function (id) { return document.getElementById(id); }).filter(Boolean);
  if (!all.length || !sections.length || !('IntersectionObserver' in window)) return;

  const io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      const id = entry.target.id;
      tabLinks.forEach(function (a) {
        a.classList.toggle('is-active', a.getAttribute('data-nav') === id);
      });
      dockLinks.forEach(function (a) {
        a.classList.toggle('is-active', a.getAttribute('data-nav') === id);
      });
      const home = document.querySelector('.nav-dock a[href="#main-content"]');
      if (home) home.classList.toggle('is-active', false);
    });
  }, { rootMargin: '-20% 0px -60% 0px', threshold: 0 });

  sections.forEach(function (s) { io.observe(s); });
})();
