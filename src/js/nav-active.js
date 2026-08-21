/* nav-active.js — Highlight rail + profile tabs on scroll */
(function () {
  const tabLinks = Array.from(document.querySelectorAll('#section-nav a[data-nav]'));
  const railLinks = Array.from(document.querySelectorAll('.rail-left a[data-nav]'));
  const all = tabLinks.concat(railLinks);
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
      railLinks.forEach(function (a) {
        a.classList.toggle('is-active', a.getAttribute('data-nav') === id);
      });
      // home link active only at top
      const home = document.querySelector('.rail-left a[href="#main-content"]');
      if (home) home.classList.toggle('is-active', false);
    });
  }, { rootMargin: '-20% 0px -60% 0px', threshold: 0 });

  sections.forEach(function (s) { io.observe(s); });
})();
