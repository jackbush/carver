# Carver — Implementation Notes

Product requirements are in [README.md](./README.md).

## What's built

- **Vite scaffold** with vanilla JS, `base: '/carver/'` for GitHub Pages
- **Self-hosted fonts** — IBM Plex Mono, Sans, Serif woff2 in `/public/fonts/`
- **CSS theming** — all colour via CSS custom properties; `data-editor-theme`, `data-preview-theme`, `data-tint`, `data-preview-font` on `<html>`. Cool/warm tint drives every accent element (caret, divider, toggle, selection, controls)
- **CodeMirror 6 editor** — markdown language, custom theme via compartment (hot-swappable on settings change), heading bold, syntax char dimming via CSS var `--editor-syntax-dim`, line/block/underscore caret styles
- **markdown-it preview** — instant, no debounce
- **Settings modal** — all 7 settings, localStorage persistence, focus trap, Escape to close, click-outside to close, focus returned to trigger on close
- **Document persistence** — localStorage, 300ms debounce; first-time users see Raymond Carver-style demo document
- **Mobile / focus mode** — `<800px` forces focus mode; desktop checkbox forces it too; Edit/Preview labels and toggle button all switch panes
- **Accessibility** — ARIA on modal, panes, buttons; focus trap; focus rings; `aria-label` on CM6 contenteditable; secondary/dim colours calculated for ≥3:1 contrast, body text ≥4.5:1
- **GitHub Actions** — `.github/workflows/deploy.yml`: runs unit tests then deploys to Pages on push to `main`
- **Unit tests** — Vitest + jsdom, 20 tests covering settings round-trip, theme defaults, font size mapping, markdown-it rendering. Run with `npm test`.

## What's still needed

### E2E tests (Playwright)

Tests are written at `tests/e2e/app.spec.js` and cover:
- Editor → preview rendering
- Settings persistence across reload
- Text size CSS var
- Mobile focus bar and toggle
- Settings modal ARIA and keyboard (Escape)
- Document content persistence across reload

**Blocked on Playwright browser install** — requires downloading ~165MB Chromium binary, deferred due to slow connection. To run when ready:

```bash
npx playwright install chromium
npm run test:e2e
```

The tests use `baseURL: http://localhost:5173/carver/` and `reuseExistingServer: true` so the dev server needs to be running (`npm run dev`), or the config can be updated to use the built preview server.

### Visual QA

- Check all theme/tint/size combinations in browser
- Confirm fonts load from `/fonts/` (no external requests) using Network tab
- Confirm localStorage persistence survives hard reload
