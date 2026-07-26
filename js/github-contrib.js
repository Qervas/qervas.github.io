/* Live GitHub contributions count */

// Live GitHub contributions count — falls back gracefully if API is down.
// Uses jogruber.de community proxy (no auth required, scrapes public profile).
(function () {
  const year = new Date().getFullYear();
  const yearEl = document.getElementById("gh-contrib-year");
  const numEl = document.getElementById("gh-contrib-num");
  if (!numEl) return;
  if (yearEl) yearEl.textContent = String(year);

  const fmt = (n) => n >= 1000 ? (n / 1000).toFixed(1).replace(/\.0$/, "") + "K" : String(n);
  const fallback = "4.8K";

  fetch(`https://github-contributions-api.jogruber.de/v4/Qervas?y=${year}`, { cache: "no-store" })
    .then((r) => r.ok ? r.json() : Promise.reject())
    .then((d) => {
      const total = (d.total && (d.total[year] ?? d.total[String(year)])) || 0;
      numEl.textContent = total > 0 ? fmt(total) : fallback;
    })
    .catch(() => { numEl.textContent = fallback; });
})();
  
