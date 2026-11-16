# nouroumousse.github.io

Portfolio of **Nour Oumousse** — brand designer. A minimal, terminal-inspired rebuild
of the old Carrd site (https://oumousse.carrd.co/).

## Stack

- [Vite](https://vite.dev) + React 19
- [Tailwind CSS v4](https://tailwindcss.com) (via `@tailwindcss/vite`)
- [Radix UI](https://www.radix-ui.com/primitives) headless primitives — Dialog (project case files + mobile menu), Tabs (experience/education/skills), Tooltip, Separator, Label, Slot
- Fonts: Space Grotesk + IBM Plex Mono

## Sections

`hero → work → about → speaking & community → contact`

All content lives in `src/data.js` — edit there to update projects, experience, talks and links.

## Develop

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # outputs to dist/
```

## Deploy (GitHub Pages)

Push the contents of `dist/` to your `gh-pages` branch (or use an action that runs
`npm run build` and deploys `dist/`).
