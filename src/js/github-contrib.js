/* GitHub contributions — profile count only (no heatmap) */
(function () {
  const USER = "Qervas";
  const year = new Date().getFullYear();
  const fallbackTotal = "7.1K";

  const numEl = document.getElementById("gh-contrib-num");
  const yearEl = document.getElementById("gh-contrib-year");
  if (!numEl && !yearEl) return;

  if (yearEl) yearEl.textContent = String(year);

  function fmt(n) {
    if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "K";
    return String(n);
  }

  const urls = [
    "https://github-contributions-api.jogruber.de/v4/" + USER + "?y=" + year,
    "https://github-contributions-api.jogruber.de/v4/" + USER,
  ];

  function load(i) {
    if (i >= urls.length) {
      if (numEl) numEl.textContent = fallbackTotal;
      return;
    }
    fetch(urls[i], { cache: "no-store" })
      .then(function (r) {
        if (!r.ok) throw new Error("bad status");
        return r.json();
      })
      .then(function (d) {
        const contribs = d.contributions || [];
        let total = 0;
        if (d.total) {
          total = d.total[year] ?? d.total[String(year)] ?? 0;
        }
        if (!total && contribs.length) {
          total = contribs.reduce(function (s, c) { return s + (c.count | 0); }, 0);
        }
        if (!contribs.length && !total) throw new Error("empty");
        if (numEl) numEl.textContent = total > 0 ? fmt(total) : fallbackTotal;
      })
      .catch(function () {
        load(i + 1);
      });
  }

  load(0);
})();
