/* media.js — Pause off-screen videos; lazy-load project videos */
(function () {
  // Featured Ohao orbit video (lazy + pause when offscreen)
  const ohaoOrbit = document.getElementById('ohao-orbit-video');
  if (ohaoOrbit && 'IntersectionObserver' in window) {
    const vio = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) {
          ohaoOrbit.pause();
          return;
        }
        if (ohaoOrbit.dataset.src && !ohaoOrbit.src) {
          ohaoOrbit.src = ohaoOrbit.dataset.src;
          ohaoOrbit.load();
        }
        ohaoOrbit.play().catch(function () {});
      });
    }, { threshold: 0.15, rootMargin: '80px 0px' });
    vio.observe(ohaoOrbit);
  }

  document.querySelectorAll('video.lazy-video').forEach(function (vid) {
    if (!('IntersectionObserver' in window)) {
      if (vid.dataset.src) { vid.src = vid.dataset.src; vid.play().catch(function () {}); }
      return;
    }
    const lio = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) {
          vid.pause();
          return;
        }
        if (vid.dataset.src && !vid.src) {
          vid.src = vid.dataset.src;
          vid.load();
        }
        vid.play().catch(function () {});
      });
    }, { rootMargin: '120px 0px', threshold: 0.1 });
    lio.observe(vid);
  });

  document.querySelectorAll('video[autoplay]:not(#ohao-orbit-video)').forEach(function (vid) {
    if (!('IntersectionObserver' in window)) return;
    const o = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) vid.play().catch(function () {});
        else vid.pause();
      });
    }, { threshold: 0.15 });
    o.observe(vid);
  });
})();
