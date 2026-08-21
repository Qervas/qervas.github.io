/* GitHub contributions — live count + exquisite client-side heatmap */
(function () {
  const USER = "Qervas";
  const year = new Date().getFullYear();
  const fallbackTotal = "7.1K";

  const numEls = [
    document.getElementById("gh-contrib-num"),
    document.getElementById("gh-heatmap-num"),
  ].filter(Boolean);
  const yearEls = [
    document.getElementById("gh-contrib-year"),
    document.getElementById("gh-heatmap-year"),
  ].filter(Boolean);
  const heatEl = document.getElementById("gh-heat");
  const monthsEl = document.getElementById("gh-heat-months");
  const trackEl = document.getElementById("gh-heat-track");
  const streakEl = document.getElementById("gh-streak");
  const peakEl = document.getElementById("gh-peak");
  const tipEl = document.getElementById("gh-tooltip");
  const cardEl = document.getElementById("aside-heatmap");

  yearEls.forEach(function (el) { el.textContent = String(year); });

  function fmt(n) {
    if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "K";
    return String(n);
  }

  function setNums(text) {
    numEls.forEach(function (el) { el.textContent = text; });
  }

  function parseDate(s) {
    // YYYY-MM-DD as local noon to avoid TZ edge flips
    const p = s.split("-");
    return new Date(+p[0], +p[1] - 1, +p[2], 12, 0, 0);
  }

  function formatDate(s) {
    const d = parseDate(s);
    return d.toLocaleDateString(undefined, {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  // Absolute bands work poorly for high-throughput accounts (peak 100+).
  // Build thresholds from the non-zero distribution so the grid uses full range.
  function makeLeveler(contributions) {
    const nonzero = contributions
      .map(function (c) { return c.count | 0; })
      .filter(function (n) { return n > 0; })
      .sort(function (a, b) { return a - b; });

    if (!nonzero.length) {
      return function () { return 0; };
    }

    function pct(p) {
      const i = Math.min(nonzero.length - 1, Math.floor((nonzero.length - 1) * p));
      return nonzero[i];
    }

    // 4 active bands at ~25 / 50 / 75 percentiles of busy days
    const t1 = Math.max(1, pct(0.25));
    const t2 = Math.max(t1 + 1, pct(0.5));
    const t3 = Math.max(t2 + 1, pct(0.75));

    return function (count) {
      if (count <= 0) return 0;
      if (count <= t1) return 1;
      if (count <= t2) return 2;
      if (count <= t3) return 3;
      return 4;
    };
  }

  function computeStreak(days) {
    // longest consecutive days with count > 0
    let best = 0;
    let cur = 0;
    for (let i = 0; i < days.length; i++) {
      if (days[i].count > 0) {
        cur++;
        if (cur > best) best = cur;
      } else {
        cur = 0;
      }
    }
    return best;
  }

  function computePeak(days) {
    let peak = 0;
    for (let i = 0; i < days.length; i++) {
      if (days[i].count > peak) peak = days[i].count;
    }
    return peak;
  }

  function buildGrid(contributions) {
    if (!heatEl || !contributions || !contributions.length) return;

    const levelOf = makeLeveler(contributions);

    // Map date -> {count, level}
    const byDate = Object.create(null);
    contributions.forEach(function (c) {
      const count = c.count | 0;
      byDate[c.date] = {
        count: count,
        level: levelOf(count),
      };
    });

    // Use API range: pad to full weeks (Sun–Sat or Mon–Sun). GitHub uses Sun start.
    const first = parseDate(contributions[0].date);
    const last = parseDate(contributions[contributions.length - 1].date);

    // Align start to Sunday
    const start = new Date(first);
    start.setDate(start.getDate() - start.getDay());

    // Align end to Saturday
    const end = new Date(last);
    end.setDate(end.getDate() + (6 - end.getDay()));

    const cells = [];
    const dayCursor = new Date(start);
    while (dayCursor <= end) {
      const y = dayCursor.getFullYear();
      const m = String(dayCursor.getMonth() + 1).padStart(2, "0");
      const d = String(dayCursor.getDate()).padStart(2, "0");
      const key = y + "-" + m + "-" + d;
      const hit = byDate[key];
      const count = hit ? hit.count : 0;
      const level = hit ? Math.min(4, Math.max(0, hit.level)) : 0;
      cells.push({
        date: key,
        count: count,
        level: level,
        month: dayCursor.getMonth(),
        year: y,
        dow: dayCursor.getDay(),
      });
      dayCursor.setDate(dayCursor.getDate() + 1);
    }

    const weeks = Math.ceil(cells.length / 7);
    heatEl.style.setProperty("--gh-weeks", String(weeks));
    if (trackEl) trackEl.style.setProperty("--gh-weeks", String(weeks));
    if (monthsEl) monthsEl.style.setProperty("--gh-weeks", String(weeks));
    heatEl.innerHTML = "";
    heatEl.classList.remove("is-loading");
    heatEl.classList.add("is-ready");

    // Local YYYY-MM-DD for "today"
    const now = new Date();
    const todayKey =
      now.getFullYear() +
      "-" +
      String(now.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(now.getDate()).padStart(2, "0");

    // Document fragment for speed
    const frag = document.createDocumentFragment();
    let todayEl = null;
    cells.forEach(function (cell, i) {
      const week = Math.floor(i / 7);
      const dow = i % 7;
      const el = document.createElement("span");
      el.className = "gh-cell l" + cell.level;
      el.style.gridColumn = String(week + 1);
      el.style.gridRow = String(dow + 1);
      el.dataset.date = cell.date;
      el.dataset.count = String(cell.count);
      if (cell.date === todayKey) {
        el.classList.add("is-today");
        el.setAttribute("data-today", "1");
        todayEl = el;
      }
      el.setAttribute(
        "aria-label",
        (cell.date === todayKey ? "Today · " : "") +
          cell.count +
          " contribution" +
          (cell.count === 1 ? "" : "s") +
          " on " +
          formatDate(cell.date)
      );
      frag.appendChild(el);
    });
    heatEl.appendChild(frag);

    // Month labels — first week of each month, skip if too close to previous
    if (monthsEl) {
      monthsEl.innerHTML = "";
      monthsEl.style.setProperty("--gh-weeks", String(weeks));
      const labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      let prevMonth = -1;
      let prevLabelWeek = -99;
      for (let w = 0; w < weeks; w++) {
        // Use mid-week cell (Wed) so month edge is more stable
        const cell = cells[w * 7 + 3] || cells[w * 7];
        if (!cell) continue;
        if (cell.month !== prevMonth && w - prevLabelWeek >= 3) {
          prevMonth = cell.month;
          prevLabelWeek = w;
          const span = document.createElement("span");
          span.className = "gh-month";
          span.textContent = labels[cell.month];
          span.style.gridColumn = String(w + 1);
          monthsEl.appendChild(span);
        } else if (cell.month !== prevMonth) {
          prevMonth = cell.month; // track month without stacking labels
        }
      }
    }

    // Scroll so today's cell lands in view (slightly right of center)
    const scrollEl = document.getElementById("gh-heat-scroll");
    if (scrollEl) {
      const pinToday = function () {
        const target = todayEl || heatEl.querySelector(".gh-cell.is-today");
        if (!target) {
          scrollEl.scrollLeft = Math.max(0, scrollEl.scrollWidth - scrollEl.clientWidth);
          return;
        }
        const sRect = scrollEl.getBoundingClientRect();
        const cRect = target.getBoundingClientRect();
        const x = cRect.left - sRect.left + scrollEl.scrollLeft;
        // ~65% across viewport: past weeks left, today obvious
        const desired = x - scrollEl.clientWidth * 0.65 + cRect.width / 2;
        const max = Math.max(0, scrollEl.scrollWidth - scrollEl.clientWidth);
        scrollEl.scrollLeft = Math.max(0, Math.min(max, desired));
      };
      requestAnimationFrame(function () {
        pinToday();
        requestAnimationFrame(pinToday);
      });
      setTimeout(pinToday, 50);
      setTimeout(pinToday, 200);
    }

    // Stats from in-range contributions only
    const active = contributions.map(function (c) {
      return { count: c.count | 0, date: c.date };
    });
    if (streakEl) streakEl.textContent = String(computeStreak(active));
    if (peakEl) peakEl.textContent = String(computePeak(active));

    bindTooltip();
  }

  function bindTooltip() {
    if (!heatEl || !tipEl || !cardEl) return;

    function hide() {
      tipEl.hidden = true;
    }

    heatEl.addEventListener("pointerover", function (e) {
      const cell = e.target.closest(".gh-cell");
      if (!cell || !cell.dataset.date) return;
      const count = +cell.dataset.count || 0;
      tipEl.hidden = false;
      tipEl.innerHTML =
        "<strong>" +
        count +
        "</strong> contribution" +
        (count === 1 ? "" : "s") +
        "<br><span>" +
        formatDate(cell.dataset.date) +
        "</span>";

      const cardRect = cardEl.getBoundingClientRect();
      const cellRect = cell.getBoundingClientRect();
      const tipW = tipEl.offsetWidth || 120;
      let left = cellRect.left - cardRect.left + cellRect.width / 2 - tipW / 2;
      left = Math.max(8, Math.min(left, cardRect.width - tipW - 8));
      const top = cellRect.top - cardRect.top - tipEl.offsetHeight - 8;
      tipEl.style.left = left + "px";
      tipEl.style.top = Math.max(4, top) + "px";
    });

    heatEl.addEventListener("pointerout", function (e) {
      if (!e.relatedTarget || !heatEl.contains(e.relatedTarget)) hide();
    });
    heatEl.addEventListener("pointerleave", hide);
  }

  function skeleton() {
    if (!heatEl) return;
    heatEl.classList.add("is-loading");
    // ~53 weeks × 7 placeholder cells
    const weeks = 53;
    heatEl.style.setProperty("--gh-weeks", String(weeks));
    heatEl.innerHTML = "";
    for (let i = 0; i < weeks * 7; i++) {
      const el = document.createElement("span");
      el.className = "gh-cell l0";
      el.style.gridColumn = String(Math.floor(i / 7) + 1);
      el.style.gridRow = String((i % 7) + 1);
      heatEl.appendChild(el);
    }
  }

  skeleton();

  // Prefer current calendar year; fall back to last 365 days (no y=)
  const urls = [
    "https://github-contributions-api.jogruber.de/v4/" + USER + "?y=" + year,
    "https://github-contributions-api.jogruber.de/v4/" + USER,
  ];

  function load(i) {
    if (i >= urls.length) {
      setNums(fallbackTotal);
      if (streakEl) streakEl.textContent = "—";
      if (peakEl) peakEl.textContent = "—";
      if (heatEl) {
        heatEl.classList.remove("is-loading");
        heatEl.classList.add("is-error");
      }
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

        setNums(total > 0 ? fmt(total) : fallbackTotal);
        buildGrid(contribs);
      })
      .catch(function () {
        load(i + 1);
      });
  }

  load(0);
})();
