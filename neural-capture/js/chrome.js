/* Shared textbook chrome: TOC active state, progress, reveal, KaTeX */
(() => {
  const root = document.body.dataset.root || ".";
  const pageId = document.body.dataset.page || "";

  // Mark active TOC link
  document.querySelectorAll(".toc a[data-page]").forEach((a) => {
    if (a.dataset.page === pageId) a.classList.add("active");
  });

  // Progress bar
  const progress = document.querySelector(".progress");
  function onScroll() {
    const doc = document.documentElement;
    const max = doc.scrollHeight - window.innerHeight;
    const p = max > 0 ? (window.scrollY / max) * 100 : 0;
    if (progress) progress.style.width = `${p}%`;
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Reveal
  const reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -6% 0px", threshold: 0.06 }
    );
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("in"));
  }

  // Hero video
  const hero = document.querySelector(".cover-media video");
  if (hero) hero.play().catch(() => {});

  // KaTeX
  function tryKatex() {
    if (typeof renderMathInElement !== "function") return;
    renderMathInElement(document.body, {
      delimiters: [
        { left: "$$", right: "$$", display: true },
        { left: "\\[", right: "\\]", display: true },
        { left: "$", right: "$", display: false },
        { left: "\\(", right: "\\)", display: false },
      ],
      throwOnError: false,
    });
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => setTimeout(tryKatex, 50));
  } else {
    setTimeout(tryKatex, 50);
  }
  // Retry once fonts/cdn settle
  setTimeout(tryKatex, 400);
})();
