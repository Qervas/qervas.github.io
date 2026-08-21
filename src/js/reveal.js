/* reveal.js — Scroll reveal with reduced-motion + safety net */
(function () {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const revs = Array.from(document.querySelectorAll('.reveal'));
  function revealNow(el) { el.classList.add('is-in'); }
  if (reduce || !('IntersectionObserver' in window)) {
    revs.forEach(revealNow);
    return;
  }
  const rio = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        revealNow(entry.target);
        rio.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -6% 0px', threshold: 0.05 });
  revs.forEach(function (el) {
    const r = el.getBoundingClientRect();
    if (r.top < window.innerHeight * 0.94 && r.bottom > 0) revealNow(el);
    else rio.observe(el);
  });
  setTimeout(function () { revs.forEach(revealNow); }, 1800);
})();
