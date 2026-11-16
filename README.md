# Nour Oumousse — Portfolio

A minimal, techy portfolio built with **plain HTML, CSS and vanilla JS** — no frameworks, no build step. This means it can be deployed directly to **GitHub Pages** by pushing these files to your repo.

## Deploy to GitHub Pages

1. Create a repository named `username.github.io` (recommended), or any repo name.
2. Push these three/four files to the repo's root (`index.html`, `styles.css`, `main.js`, `README.md`).
3. Go to **Settings → Pages → Source** and select branch `main` / folder `/ (root)`.
4. Your site will be live at `https://username.github.io/` (or `https://username.github.io/repo-name/`).

That's it — no `npm install`, no `dist/` folder, no CI required.

## Optional: GitHub Actions auto-deploy (for non-user repos)

If you prefer Actions, add `.github/workflows/deploy.yml`:

```yaml
name: Deploy
on:
  push:
    branches: [main]
permissions:
  contents: read
  pages: write
  id-token: write
jobs:
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/configure-pages@v4
      - uses: actions/upload-pages-artifact@v3
        with:
          path: .   # upload repo root directly — nothing to build
      - id: deployment
        uses: actions/deploy-pages@v3
```

## Local preview

Any static server works, e.g.:

```bash
python3 -m http.server 8080
# then open http://localhost:8080
```

## Structure

| File | Purpose |
|---|---|
| `index.html` | All content: hero, work, experience, education, contact |
| `styles.css` | Design system (dark, engineering grid, acid-lime accent) |
| `main.js` | Copy-email button, scroll reveal animations, footer year |

To edit projects/experience, just change the markup in `index.html`.
