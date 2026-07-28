/* Interactive post actions: thread / ship / star (accumulate) / share */
(function () {
  const STORAGE_KEY = "qervas-post-stars-v1";
  const toastEl = document.createElement("div");
  toastEl.className = "post-toast";
  toastEl.hidden = true;
  document.body.appendChild(toastEl);
  let toastTimer = 0;

  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.hidden = false;
    toastEl.classList.add("is-on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-on");
      toastEl.hidden = true;
    }, 1800);
  }

  function loadStars() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") || {};
    } catch (e) {
      return {};
    }
  }

  function saveStars(map) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
    } catch (e) { /* private mode */ }
  }

  function postUrl(post) {
    const id = post.id || post.getAttribute("data-post-id");
    const base = location.origin + location.pathname.replace(/\/$/, "") + "/";
    return id ? base + "#" + (post.id || "post-" + id) : base;
  }

  function shareUrl(post) {
    return postUrl(post);
  }

  function renderStars(post, map) {
    const id = post.getAttribute("data-post-id");
    if (!id) return;
    const n = map[id] | 0;
    const btn = post.querySelector('[data-action="star"]');
    if (!btn) return;
    const countEl = btn.querySelector("[data-star-count]");
    if (countEl) countEl.textContent = String(n);
    const liked = n > 0;
    btn.classList.toggle("is-liked", liked);
    btn.setAttribute("aria-pressed", liked ? "true" : "false");
    btn.title = n === 1 ? "1 star" : n + " stars";
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve, reject) {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
        resolve();
      } catch (e) {
        reject(e);
      }
      document.body.removeChild(ta);
    });
  }

  async function doShare(post) {
    const title =
      post.getAttribute("data-share-title") ||
      (post.querySelector(".post-title") && post.querySelector(".post-title").textContent) ||
      "Frank Yin";
    const url = shareUrl(post);
    const text = title + " — " + url;

    if (navigator.share) {
      try {
        await navigator.share({ title: title, text: title, url: url });
        toast("Shared");
        return;
      } catch (e) {
        if (e && e.name === "AbortError") return;
        // fall through to clipboard
      }
    }

    try {
      await copyText(url);
      toast("Link copied");
    } catch (e) {
      // last resort: X intent
      window.open(
        "https://x.com/intent/tweet?text=" + encodeURIComponent(text),
        "_blank",
        "noopener"
      );
    }
  }

  function doShip(post) {
    const ship = post.getAttribute("data-ship");
    if (ship) {
      window.open(ship, "_blank", "noopener");
      return;
    }
    const link = post.querySelector(".post-links a[href]");
    if (link) {
      window.open(link.href, "_blank", "noopener");
      return;
    }
    toast("No ship link");
  }

  function doThread(post, btn) {
    const thread = post.querySelector(".post-thread");
    if (!thread) {
      toast("No thread");
      return;
    }
    const open = thread.hidden;
    thread.hidden = !open;
    btn.setAttribute("aria-expanded", open ? "true" : "false");
    btn.classList.toggle("is-on", open);
    if (open) {
      thread.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }

  function doStar(post) {
    const id = post.getAttribute("data-post-id");
    if (!id) return;
    const map = loadStars();
    map[id] = (map[id] | 0) + 1;
    saveStars(map);
    renderStars(post, map);

    const btn = post.querySelector('[data-action="star"]');
    if (btn) {
      btn.classList.remove("is-pop");
      // reflow for re-trigger
      void btn.offsetWidth;
      btn.classList.add("is-pop");
    }
  }

  const posts = document.querySelectorAll(".post[data-post-id]");
  const stars = loadStars();
  posts.forEach(function (post) {
    renderStars(post, stars);
    const actions = post.querySelector(".post-actions");
    if (!actions) return;
    actions.addEventListener("click", function (e) {
      const btn = e.target.closest("[data-action]");
      if (!btn || !actions.contains(btn)) return;
      const action = btn.getAttribute("data-action");
      if (action === "thread") doThread(post, btn);
      else if (action === "ship") doShip(post);
      else if (action === "star") doStar(post);
      else if (action === "share") doShare(post);
    });
  });

  // deep-link: open thread if hash matches
  if (location.hash) {
    const el = document.querySelector(location.hash);
    if (el && el.classList.contains("post")) {
      const threadBtn = el.querySelector('[data-action="thread"]');
      if (threadBtn) doThread(el, threadBtn);
    }
  }
})();
