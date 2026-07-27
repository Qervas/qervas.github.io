/**
 * Demo tour controller — single-stop presentation mode.
 * Keyboard: 1–5 jump, ←/→ or n/p step, Home/End ends.
 * UI: sticky bar buttons + Prev/Next.
 * Media paths stay relative under site/assets/.
 */
(() => {
  "use strict";

  const stops = [...document.querySelectorAll(".demo-stop[data-stop]")];
  const barButtons = [...document.querySelectorAll(".demo-bar [data-stop]")];
  const btnPrev = document.getElementById("demo-prev");
  const btnNext = document.getElementById("demo-next");
  const progressEl = document.getElementById("demo-progress");
  const toast = document.getElementById("toast");
  const TOTAL = stops.length || 5;

  const OBJECTS = {
    pot: {
      a: "../assets/videos/thesis_pot_nerf.mp4",
      b: "../assets/videos/thesis_pot_3dgs.mp4",
      label: "Metal pot",
    },
    banana: {
      a: "../assets/videos/thesis_banana_nerf.mp4",
      b: "../assets/videos/thesis_banana_3dgs.mp4",
      label: "Banana",
    },
    vase: {
      a: "../assets/videos/thesis_vase_nerf.mp4",
      b: "../assets/videos/thesis_vase_3dgs.mp4",
      label: "Glass vase",
    },
  };

  let current = 1;
  let toastTimer = 0;

  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add("is-on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("is-on"), 1100);
  }

  function pauseAllVideos(exceptRoot) {
    document.querySelectorAll(".demo-stop video").forEach((v) => {
      if (exceptRoot && exceptRoot.contains(v)) return;
      try {
        v.pause();
      } catch (_) {}
    });
  }

  function playVideosIn(root) {
    if (!root) return;
    root.querySelectorAll("video").forEach((v) => {
      v.muted = true;
      v.playsInline = true;
      const p = v.play();
      if (p && p.catch) p.catch(() => {});
    });
  }

  function goStop(n, opts = {}) {
    const { silent = false } = opts;
    n = Math.max(1, Math.min(TOTAL, Number(n) || 1));
    current = n;

    stops.forEach((s) => {
      const id = Number(s.dataset.stop);
      const on = id === n;
      s.classList.toggle("is-active", on);
      s.hidden = !on;
      s.setAttribute("aria-hidden", on ? "false" : "true");
    });

    barButtons.forEach((b) => {
      b.classList.toggle("is-on", Number(b.dataset.stop) === n);
      b.setAttribute("aria-current", Number(b.dataset.stop) === n ? "step" : "false");
    });

    if (btnPrev) btnPrev.disabled = n <= 1;
    if (btnNext) btnNext.disabled = n >= TOTAL;
    if (progressEl) progressEl.textContent = `${n} / ${TOTAL}`;

    const active = document.getElementById(`stop-${n}`);
    pauseAllVideos(active);
    playVideosIn(active);

    try {
      const url = new URL(location.href);
      url.hash = `stop-${n}`;
      history.replaceState(null, "", url);
    } catch (_) {}

    if (!silent) showToast(`Stop ${n} · ${TOTAL}`);
    // scroll tour content to top of viewport area
    const main = document.querySelector(".demo-main");
    if (main) main.scrollTop = 0;
    window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
  }

  // Bar stop buttons
  barButtons.forEach((b) => {
    b.addEventListener("click", () => goStop(Number(b.dataset.stop)));
  });
  btnPrev?.addEventListener("click", () => goStop(current - 1));
  btnNext?.addEventListener("click", () => goStop(current + 1));

  // Keyboard
  window.addEventListener("keydown", (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const tag = (e.target && e.target.tagName) || "";
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

    if (e.key >= "1" && e.key <= String(TOTAL)) {
      e.preventDefault();
      goStop(Number(e.key));
    } else if (e.key === "ArrowRight" || e.key === "PageDown" || e.key === "n" || e.key === "N" || e.key === " ") {
      e.preventDefault();
      goStop(current + 1);
    } else if (e.key === "ArrowLeft" || e.key === "PageUp" || e.key === "p" || e.key === "P") {
      e.preventDefault();
      goStop(current - 1);
    } else if (e.key === "Home") {
      e.preventDefault();
      goStop(1);
    } else if (e.key === "End") {
      e.preventDefault();
      goStop(TOTAL);
    }
  });

  // Object tabs (stop 3)
  const tabs = document.querySelectorAll(".object-tabs [data-obj]");
  const vidA = document.getElementById("vid-a");
  const vidB = document.getElementById("vid-b");
  const labA = document.getElementById("lab-a");
  const labB = document.getElementById("lab-b");

  function loadObj(key) {
    const o = OBJECTS[key];
    if (!o || !vidA || !vidB) return;
    tabs.forEach((t) => t.classList.toggle("is-on", t.dataset.obj === key));
    vidA.pause();
    vidB.pause();
    vidA.src = o.a;
    vidB.src = o.b;
    vidA.load();
    vidB.load();
    vidA.muted = true;
    vidB.muted = true;
    vidA.play().catch(() => {});
    vidB.play().catch(() => {});
    if (labA) labA.textContent = o.label;
    if (labB) labB.textContent = o.label;
  }

  tabs.forEach((t) => t.addEventListener("click", () => loadObj(t.dataset.obj)));

  // Initial stop from hash
  let start = 1;
  const m = location.hash.match(/stop-(\d+)/);
  if (m) start = Number(m[1]);
  goStop(start, { silent: true });

  // Expose for tests
  window.__demoTour = {
    goStop,
    get current() {
      return current;
    },
    get total() {
      return TOTAL;
    },
    loadObj,
  };
})();
