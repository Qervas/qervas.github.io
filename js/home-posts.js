/* Home page: single-line latest journal teaser from posts/posts.json */
(function () {
  const root = document.getElementById("home-journal-teaser");
  if (!root) return;

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

  function quietLink() {
    root.innerHTML = '<a href="posts/">Journal →</a>';
  }

  fetch("posts/posts.json", { cache: "no-store" })
    .then(function (r) {
      if (!r.ok) throw new Error("fail");
      return r.json();
    })
    .then(function (posts) {
      if (!Array.isArray(posts) || !posts.length) {
        quietLink();
        return;
      }
      const post = posts
        .slice()
        .sort(function (a, b) {
          return (b.date || "").localeCompare(a.date || "");
        })[0];
      if (!post || !post.slug) {
        quietLink();
        return;
      }
      root.innerHTML =
        '<a href="posts/p/' +
        encodeURIComponent(post.slug) +
        '.html">Latest journal: ' +
        escapeHtml(post.title) +
        " · " +
        escapeHtml(fmtDate(post.date)) +
        "</a>";
    })
    .catch(function () {
      quietLink();
    });
})();
