# qervas.github.io

Portfolio for [Shaoxuan (Frank) Yin](https://qervas.github.io/). Built with [Eleventy 3](https://www.11ty.dev/). Source lives in `src/`; the site is compiled to `_site/`.

## Preview locally

```bash
npm install
npx @11ty/eleventy --serve
```

(`npm start` does the same.) Open the URL Eleventy prints (usually `http://localhost:8080/`).

## Pages deploy

Pushes to `master` run [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml): install, `npx @11ty/eleventy`, upload `_site`, deploy with GitHub Pages. Do not commit `_site`.

This is a user site (`qervas.github.io`). In the repo **Settings → Pages**, set the source to **GitHub Actions**.

## Authoring

- **Work** (homepage `/`) is Nunjucks under `src/` + `src/_includes/work/`.
- **Journal** is `/posts/`. Add an entry as Markdown in `src/journal/`:

  ```markdown
  ---
  title: Short title
  date: 2026-08-21
  tags: [engine]
  excerpt: One or two sentences for the archive card.
  ---

  Body in Markdown.
  ```

  That becomes `/posts/p/<filename>/`. No `posts.json` and no hand-rolled HTML shell.

- **neural-capture** and **ohao-engine** stay standalone and are copied through to the same URLs.
