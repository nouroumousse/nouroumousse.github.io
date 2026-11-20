# Nour Oumousse — Portfolio

A lightweight portfolio built with semantic HTML, CSS and vanilla JavaScript. It has no framework, package manager or build step and is published directly with GitHub Pages.

## Project structure

```text
/
├── index.html, work.html, blog.html, article.html, bookmarks.html
├── css/
│   └── styles.css
├── js/
│   ├── main.js
│   ├── work.js
│   ├── experience.js
│   ├── recent-jams.js
│   ├── hero-preview.js
│   ├── blog.js
│   ├── blog-quote.js
│   ├── article.js
│   └── bookmarks.js
├── data/                 # Pages CMS-managed JSON collections
├── docs/                 # Pages CMS blog articles
├── media/                # Uploaded images, artwork and audio
├── assets/               # Small local SVG assets
├── .pages.yml            # Pages CMS collection definitions
├── robots.txt
└── sitemap.xml
```

## Editing content with Pages CMS

The CMS configuration lives in `.pages.yml`. Keep these paths intact:

- Projects: `data/projects.json`
- Experience: `data/experience.json`
- Bookmarks: `data/bookmarks.json`
- Recent Jams: `data/recent-jams.json`
- Articles: `docs/`
- Uploaded media: `media/`

The site reads those files directly. No build or deployment step is required after a CMS commit; GitHub Pages serves the updated files.

## Local preview

Run a local static server from the repository root:

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

## Deployment

GitHub Pages should publish the `main` branch from the repository root. Keep the HTML entry pages at the root so the existing page URLs and CMS links remain stable.
