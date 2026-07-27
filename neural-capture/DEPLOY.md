# Publishing the Neural Capture monograph (GitHub Pages)

Static site root: **`site/`**.

## Local

```bash
cd site
python3 -m http.server 8799
# http://127.0.0.1:8799/
```

## Structure tests

```bash
python3 site/tests/test_monograph_structure.py
```

## GitHub Actions

Workflow: `.github/workflows/pages.yml` (repo root or site parent).

1. Repo → Settings → Pages → Source: **GitHub Actions**
2. Push to `main`/`master`

Project URL shape: `https://<user>.github.io/<repo>/` or copy `site/` into `qervas.github.io/neural-capture/`.

Use **relative** asset links (`../styles.css`, `m/…`) — no root-absolute `/styles.css`.

## Public scope

Do **not** publish unfinished inverse-rendering slide experiments as shipped results. Status chapter marks them experimental/excluded.
