/* nav-active.js — dock + tabs + running head follow the section in view */
(function () {
  const NAMES = {
    "featured-work": "Featured",
    projects: "Projects",
    experience: "Experience",
    skills: "Skills",
    education: "Education",
  };

  const tabLinks = Array.from(document.querySelectorAll("#section-nav a[data-nav]"));
  const dockLinks = Array.from(document.querySelectorAll(".nav-dock a[data-nav]"));
  const home = document.querySelector('.nav-dock a[href="#main-content"]');
  const runningHead = document.getElementById("feed-running-head");
  const runningTag = document.getElementById("feed-running-head-tag");
  const sections = Array.from(document.querySelectorAll(".feed-section[id]"));
  if (!sections.length) return;

  let currentId = null;
  let ticking = false;

  function chromeBottom() {
    const top = document.querySelector(".feed-top");
    const tabs = document.querySelector(".profile-tabs");
    let y = 0;
    if (top) y = Math.max(y, top.getBoundingClientRect().bottom);
    if (tabs) y = Math.max(y, tabs.getBoundingClientRect().bottom);
    return y || 72;
  }

  function sectionAtReadingLine() {
    const line = Math.max(chromeBottom() + 8, window.innerHeight * 0.28);
    if (sections[0].getBoundingClientRect().top > line) return null;
    let current = sections[0];
    for (let i = 0; i < sections.length; i++) {
      if (sections[i].getBoundingClientRect().top <= line) current = sections[i];
    }
    return current;
  }

  function setActive(id) {
    dockLinks.forEach(function (a) {
      a.classList.toggle("is-active", id !== null && a.getAttribute("data-nav") === id);
    });
    if (home) home.classList.toggle("is-active", id === null);

    tabLinks.forEach(function (a) {
      const nav = a.getAttribute("data-nav");
      if (!nav) return;
      const on = id === null ? nav === "featured-work" : nav === id;
      a.classList.toggle("is-active", on);
    });

    if (id) document.documentElement.dataset.currentSection = id;
    else delete document.documentElement.dataset.currentSection;
  }

  function setRunningHead(section) {
    if (!runningHead || !runningTag) return;
    if (!section) {
      runningHead.hidden = true;
      runningTag.textContent = "";
      return;
    }
    const name = NAMES[section.id] || section.id;
    runningTag.textContent = name;
    runningHead.hidden = false;
  }

  function sync() {
    ticking = false;
    const section = sectionAtReadingLine();
    const id = section ? section.id : null;
    if (id !== currentId) {
      currentId = id;
      setActive(id);
    }
    setRunningHead(section);
  }

  function requestSync() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(sync);
  }

  setActive(null);
  sync();

  window.addEventListener("scroll", requestSync, { passive: true });
  window.addEventListener("resize", requestSync);

  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(requestSync, {
      rootMargin: "-20% 0px -55% 0px",
      threshold: [0, 0.15, 0.4, 0.7],
    });
    sections.forEach(function (s) {
      io.observe(s);
    });
  }
})();
