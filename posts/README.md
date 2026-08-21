# Journal

Public journal (dev-log) for [qervas.github.io](https://qervas.github.io/).  
Profile = CV scoreboard. **Journal = words.**

## Add an entry (2 files)

### 1. `posts/posts.json`

Add an entry:

```json
{
  "slug": "my-slug",
  "title": "Short title",
  "date": "2026-07-30",
  "tags": ["journal", "engine"],
  "excerpt": "One or two sentences for the archive card."
}
```

`slug` must match the HTML filename.

### 2. `posts/p/<slug>.html`

Copy an existing entry under `posts/p/` and rewrite the article body.  
Keep the shell (rails, theme, contact) — only change the `<article class="posts-article">` content + `<title>`.

## Rules of thumb

- List UI sorts by `date` (newest first).
- Tags are freeform (`journal`, `engine`, `site`, …).
- No build step. Push to `master` → GitHub Pages.

## URLs

| Page | Path |
|------|------|
| Archive | `/posts/` |
| Entry | `/posts/p/<slug>.html` |
| Index JSON | `/posts/posts.json` |
