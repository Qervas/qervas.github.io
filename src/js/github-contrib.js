/* GitHub contributions, live count + weekly activity line */
(function () {
  const USER = "Qervas";
  const year = new Date().getFullYear();
  const fallbackTotal = "7.1K";
  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const numEls = [
    document.getElementById("gh-contrib-num"),
    document.getElementById("gh-heatmap-num"),
  ].filter(Boolean);
  const yearEls = [
    document.getElementById("gh-contrib-year"),
    document.getElementById("gh-heatmap-year"),
  ].filter(Boolean);
  const lineEl = document.getElementById("gh-line");
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
    const p = s.split("-");
    return new Date(+p[0], +p[1] - 1, +p[2], 12, 0, 0);
  }

  function isoDay(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return y + "-" + m + "-" + day;
  }

  function formatRange(start, end) {
    const a = parseDate(start);
    const b = parseDate(end);
    const opts = { month: "short", day: "numeric" };
    const left = a.toLocaleDateString(undefined, opts);
    const right = b.toLocaleDateString(undefined, opts);
    return left === right ? left : left + " – " + right;
  }

  function computeStreak(days) {
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

  function weekly(contributions) {
    const byDate = Object.create(null);
    contributions.forEach(function (c) {
      byDate[c.date] = c.count | 0;
    });
    const first = parseDate(contributions[0].date);
    const last = parseDate(contributions[contributions.length - 1].date);
    const start = new Date(first);
    start.setDate(start.getDate() - start.getDay());
    const end = new Date(last);
    end.setDate(end.getDate() + (6 - end.getDay()));

    const weeks = [];
    const cursor = new Date(start);
    while (cursor <= end) {
      let count = 0;
      const weekStart = isoDay(cursor);
      for (let i = 0; i < 7; i++) {
        const key = isoDay(cursor);
        if (byDate[key]) count += byDate[key];
        cursor.setDate(cursor.getDate() + 1);
      }
      const endDay = new Date(cursor);
      endDay.setDate(endDay.getDate() - 1);
      weeks.push({
        start: weekStart,
        end: isoDay(endDay),
        count: count,
        month: parseDate(weekStart).getMonth(),
      });
    }
    return weeks;
  }

  function svgEl(name, attrs) {
    const el = document.createElementNS("http://www.w3.org/2000/svg", name);
    Object.keys(attrs).forEach(function (key) {
      el.setAttribute(key, attrs[key]);
    });
    return el;
  }

  function buildChart(contributions) {
    if (!lineEl || !contributions || !contributions.length) return;
    const weeks = weekly(contributions);
    if (!weeks.length) return;

    const W = 260;
    const H = 118;
    const padL = 8;
    const padR = 8;
    const padT = 10;
    const padB = 22;
    const innerW = W - padL - padR;
    const innerH = H - padT - padB;
    const max = weeks.reduce(function (m, w) { return Math.max(m, w.count); }, 1);
    const n = weeks.length;

    function xAt(i) {
      if (n === 1) return padL + innerW / 2;
      return padL + (i / (n - 1)) * innerW;
    }
    function yAt(count) {
      return padT + (1 - count / max) * innerH;
    }

    const pts = weeks.map(function (w, i) {
      return { x: xAt(i), y: yAt(w.count), week: w };
    });
    const line = pts.map(function (p, i) {
      return (i === 0 ? "M" : "L") + p.x.toFixed(1) + " " + p.y.toFixed(1);
    }).join(" ");
    const baseY = (padT + innerH).toFixed(1);
    const area = line +
      " L" + pts[pts.length - 1].x.toFixed(1) + " " + baseY +
      " L" + pts[0].x.toFixed(1) + " " + baseY + " Z";

    lineEl.innerHTML = "";
    lineEl.classList.remove("is-loading", "is-error");
    lineEl.classList.add("is-ready");
    lineEl.setAttribute(
      "aria-label",
      "GitHub activity by week for @Qervas, peak week " + max + " contributions"
    );

    lineEl.appendChild(svgEl("path", {
      class: "gh-line-fill",
      d: area,
    }));
    lineEl.appendChild(svgEl("path", {
      class: "gh-line-axis",
      d: "M" + padL + " " + baseY + " H" + (W - padR),
    }));
    lineEl.appendChild(svgEl("path", {
      class: "gh-line-stroke",
      d: line,
    }));

    let prevLabel = -99;
    pts.forEach(function (p, i) {
      const show = i === 0 || (p.week.month !== pts[i - 1].week.month && p.x - prevLabel > 28);
      if (!show) return;
      prevLabel = p.x;
      const label = svgEl("text", {
        class: "gh-line-label",
        x: String(p.x),
        y: String(H - 4),
      });
      label.textContent = MONTHS[p.week.month];
      lineEl.appendChild(label);
    });

    const last = pts[pts.length - 1];
    lineEl.appendChild(svgEl("circle", {
      class: "gh-line-dot",
      cx: last.x.toFixed(1),
      cy: last.y.toFixed(1),
      r: "2.6",
    }));

    const hit = svgEl("g", { class: "gh-line-hits" });
    const slot = n > 1 ? innerW / (n - 1) : innerW;
    pts.forEach(function (p) {
      const rect = svgEl("rect", {
        x: String(Math.max(0, p.x - slot / 2)),
        y: "0",
        width: String(slot),
        height: String(H),
        fill: "transparent",
      });
      rect.dataset.count = String(p.week.count);
      rect.dataset.label = formatRange(p.week.start, p.week.end);
      hit.appendChild(rect);
    });
    lineEl.appendChild(hit);

    const active = contributions.map(function (c) {
      return { count: c.count | 0, date: c.date };
    });
    if (streakEl) streakEl.textContent = String(computeStreak(active));
    if (peakEl) peakEl.textContent = String(computePeak(active));
    bindTooltip();
  }

  function bindTooltip() {
    if (!lineEl || !tipEl || !cardEl || lineEl.dataset.tipBound) return;
    lineEl.dataset.tipBound = "1";

    function hide() {
      tipEl.hidden = true;
    }

    lineEl.addEventListener("pointermove", function (e) {
      const hit = e.target.closest("rect");
      if (!hit || hit.dataset.count == null) {
        hide();
        return;
      }
      const count = +hit.dataset.count || 0;
      tipEl.hidden = false;
      tipEl.innerHTML =
        "<strong>" + count + "</strong> this week<br><span>" + hit.dataset.label + "</span>";
      const cardRect = cardEl.getBoundingClientRect();
      const hitRect = hit.getBoundingClientRect();
      const tipW = tipEl.offsetWidth || 120;
      let left = hitRect.left - cardRect.left + hitRect.width / 2 - tipW / 2;
      left = Math.max(8, Math.min(left, cardRect.width - tipW - 8));
      tipEl.style.left = left + "px";
      tipEl.style.top = "8px";
    });
    lineEl.addEventListener("pointerleave", hide);
  }

  const urls = [
    "https://github-contributions-api.jogruber.de/v4/" + USER + "?y=" + year,
    "https://github-contributions-api.jogruber.de/v4/" + USER,
  ];

  function markError() {
    if (!lineEl) return;
    lineEl.classList.remove("is-loading");
    lineEl.classList.add("is-error");
    lineEl.innerHTML = "";
    const note = svgEl("text", {
      class: "gh-line-label",
      x: "8",
      y: "58",
    });
    note.textContent = "Activity unavailable";
    lineEl.appendChild(note);
  }

  function load(i) {
    if (i >= urls.length) {
      setNums(fallbackTotal);
      if (streakEl) streakEl.textContent = "-";
      if (peakEl) peakEl.textContent = "-";
      markError();
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
        buildChart(contribs);
      })
      .catch(function () {
        load(i + 1);
      });
  }

  load(0);
})();
