/* OHAO Demo Booth */
(() => {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  function initCompare(el) {
    const reveal = $(".compare__reveal", el);
    const divider = $(".compare__divider", el);
    if (!reveal || !divider) return;

    let active = false;

    const setSplit = (clientX) => {
      const rect = el.getBoundingClientRect();
      const x = Math.min(Math.max(clientX - rect.left, 0), rect.width);
      el.style.setProperty("--split", `${(x / rect.width) * 100}%`);
    };

    const onDown = (e) => {
      active = true;
      el.classList.add("is-active");
      const point = e.touches ? e.touches[0] : e;
      setSplit(point.clientX);
      e.preventDefault();
    };

    const onMove = (e) => {
      if (!active) return;
      const point = e.touches ? e.touches[0] : e;
      setSplit(point.clientX);
    };

    const onUp = () => {
      active = false;
    };

    el.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    el.addEventListener("touchstart", onDown, { passive: false });
    window.addEventListener("touchmove", onMove, { passive: true });
    window.addEventListener("touchend", onUp);

    if (!el.dataset.noHint) {
      const start = performance.now();
      const hint = (now) => {
        const t = (now - start) / 1000;
        if (t > 2.2) return;
        el.style.setProperty("--split", `${48 + Math.sin(t * 2.2) * 10}%`);
        requestAnimationFrame(hint);
      };
      requestAnimationFrame(hint);
    }
  }

  $$(".compare").forEach(initCompare);

  /* Nav active */
  const sections = $$("section[id]");
  const navLinks = $$(".nav__links a");
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = entry.target.id;
        navLinks.forEach((a) => {
          a.classList.toggle("is-active", a.getAttribute("href") === `#${id}`);
        });
      });
    },
    { rootMargin: "-40% 0px -50% 0px", threshold: 0.01 }
  );
  sections.forEach((s) => io.observe(s));

  /* Reveal */
  const reveals = $$(".reveal");
  if ("IntersectionObserver" in window) {
    const rio = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            rio.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    reveals.forEach((el) => rio.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("is-in"));
  }

  /* Talk-track 1–5 */
  const BEATS = [
    { id: "hero", label: "1 · Hero" },
    { id: "stack", label: "2 · Stack" },
    { id: "realtime", label: "3 · Realtime" },
    { id: "inverse", label: "4 · Inverse lab" },
    { id: "interview", label: "5 · Interview" },
  ];

  const toast = $("#toast");
  let toastTimer = 0;

  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add("is-on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("is-on"), 1400);
  }

  function goBeat(n) {
    const beat = BEATS[n];
    if (!beat) return;
    const el = document.getElementById(beat.id);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    showToast(beat.label);
  }

  window.addEventListener("keydown", (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const tag = (e.target && e.target.tagName) || "";
    if (tag === "INPUT" || tag === "TEXTAREA") return;
    if (e.key >= "1" && e.key <= "5") goBeat(Number(e.key) - 1);
  });

  $("[data-story]")?.addEventListener("click", (e) => {
    e.preventDefault();
    goBeat(1);
  });

  $("[data-copy]")?.addEventListener("click", async () => {
    const text =
      "OHAO Engine — solo Vulkan 1.3 hybrid renderer (path tracer + deferred + inverse lab). Demo: https://qervas.github.io/ohao-engine/";
    try {
      await navigator.clipboard.writeText(text);
      showToast("Copied interview one-liner");
      const btn = $("[data-copy]");
      if (btn) {
        btn.textContent = "Copied";
        setTimeout(() => {
          btn.textContent = "Copy one-liner";
        }, 1600);
      }
    } catch {
      showToast("Select & copy manually");
    }
  });

  const y = $("#year");
  if (y) y.textContent = String(new Date().getFullYear());
})();
