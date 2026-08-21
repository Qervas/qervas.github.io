/* Render posts index cards from posts.json */
(function () {
  const root = document.getElementById("posts-list");
  if (!root) return;

  const empty = document.getElementById("posts-empty");
  const base = root.getAttribute("data-posts-url") || "posts.json";

  function fmtDate(iso) {
    const d = new Date(iso + "T12:00:00");
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  function card(post) {
    const a = document.createElement("a");
    a.className = "posts-card";
    a.href = "p/" + post.slug + ".html";

    const tags = (post.tags || [])
      .map(function (t) {
        return '<span class="posts-tag">' + escapeHtml(t) + "</span>";
      })
      .join("");

    a.innerHTML =
      '<img class="posts-card-avatar" src="../assets/profile/avatar.jpg" alt="" width="40" height="40" />' +
      '<div class="posts-card-body">' +
      '<div class="posts-card-head">' +
      '<span class="posts-card-author">Frank Yin</span>' +
      '<span class="posts-card-handle">@qervas</span>' +
      '<span class="posts-card-date">· ' +
      escapeHtml(fmtDate(post.date)) +
      "</span>" +
      "</div>" +
      '<h2 class="posts-card-title">' +
      escapeHtml(post.title) +
      "</h2>" +
      '<p class="posts-card-excerpt">' +
      escapeHtml(post.excerpt || "") +
      "</p>" +
      (tags ? '<div class="posts-card-tags">' + tags + "</div>" : "") +
      "</div>";
    return a;
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  fetch(base, { cache: "no-store" })
    .then(function (r) {
      if (!r.ok) throw new Error("failed");
      return r.json();
    })
    .then(function (posts) {
      if (!Array.isArray(posts) || !posts.length) {
        if (empty) empty.hidden = false;
        return;
      }
      // newest first
      posts = posts.slice().sort(function (a, b) {
        return (b.date || "").localeCompare(a.date || "");
      });
      const frag = document.createDocumentFragment();
      posts.forEach(function (p) {
        frag.appendChild(card(p));
      });
      root.appendChild(frag);
      if (empty) empty.hidden = true;
    })
    .catch(function () {
      if (empty) {
        empty.hidden = false;
        empty.textContent = "Could not load the journal index.";
      }
    });
})();
