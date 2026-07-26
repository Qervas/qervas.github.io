/* nav-active.js — Highlight section nav on scroll */
(function () {
  const navLinks = Array.from(document.querySelectorAll('#section-nav a[data-nav]'));
  const sections = navLinks
    .map(function (a) { return document.getElementById(a.getAttribute('data-nav')); })
    .filter(Boolean);
  if (!navLinks.length || !('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      const id = entry.target.id;
      navLinks.forEach(function (a) {
        a.classList.toggle('is-active', a.getAttribute('data-nav') === id);
      });
    });
  }, { rootMargin: '-30% 0px -55% 0px', threshold: 0 });
  sections.forEach(function (s) { io.observe(s); });
})();
