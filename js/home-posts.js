/* Home page: latest log teasers from posts/posts.json */
(function () {
  const root = document.getElementById("home-posts-list");
  if (!root) return;

  const limit = parseInt(root.getAttribute("data-limit") || "3", 10);

  function fmtDate(iso) {
    const d = new Date(iso + "T12:00:00");
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  fetch("posts/posts.json", { cache: "no-store" })
    .then(function (r) {
      if (!r.ok) throw new Error("fail");
      return r.json();
    })
    .then(function (posts) {
      if (!Array.isArray(posts) || !posts.length) {
        root.innerHTML =
          '<p class="posts-empty" style="border:0">No posts yet.</p>';
        return;
      }
      posts = posts
        .slice()
        .sort(function (a, b) {
          return (b.date || "").localeCompare(a.date || "");
        })
        .slice(0, limit);

      const frag = document.createDocumentFragment();
      posts.forEach(function (post) {
        const a = document.createElement("a");
        a.className = "posts-card";
        a.href = "posts/p/" + post.slug + ".html";
        const tags = (post.tags || [])
          .slice(0, 3)
          .map(function (t) {
            return '<span class="posts-tag">' + escapeHtml(t) + "</span>";
          })
          .join("");
        a.innerHTML =
          '<img class="posts-card-avatar" src="assets/profile/avatar.jpg" alt="" width="40" height="40" loading="lazy" />' +
          '<div class="posts-card-body">' +
          '<div class="posts-card-head">' +
          '<span class="posts-card-author">Frank Yin</span>' +
          '<span class="posts-card-handle">@qervas</span>' +
          '<span class="posts-card-date">· ' +
          escapeHtml(fmtDate(post.date)) +
          "</span></div>" +
          '<h3 class="posts-card-title">' +
          escapeHtml(post.title) +
          "</h3>" +
          '<p class="posts-card-excerpt">' +
          escapeHtml(post.excerpt || "") +
          "</p>" +
          (tags ? '<div class="posts-card-tags">' + tags + "</div>" : "") +
          "</div>";
        frag.appendChild(a);
      });
      root.appendChild(frag);
    })
    .catch(function () {
      root.innerHTML =
        '<p class="posts-empty" style="border:0">Posts feed offline.</p>';
    });
})();
