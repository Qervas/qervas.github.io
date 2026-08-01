# Posts

Public posts for [qervas.github.io](https://qervas.github.io/).  
Profile = CV scoreboard. **Posts = words.**

## Add a post (2 files)

### 1. `posts/posts.json`

Add an entry:

```json
{
  "slug": "my-slug",
  "title": "Short title",
  "date": "2026-07-30",
  "tags": ["posts", "engine"],
  "excerpt": "One or two sentences for the feed card."
}
```

`slug` must match the HTML filename.

### 2. `posts/p/<slug>.html`

Copy an existing post under `posts/p/` and rewrite the article body.  
Keep the shell (rails, theme, contact) — only change the `<article class="posts-article">` content + `<title>`.

## Rules of thumb

- List UI sorts by `date` (newest first).
- Tags are freeform (`posts`, `engine`, `site`, …).
- No build step. Push to `master` → GitHub Pages.

## URLs

| Page | Path |
|------|------|
| Feed | `/posts/` |
| Post | `/posts/p/<slug>.html` |
| Index JSON | `/posts/posts.json` |
