# Carver — Implementation Notes

Product requirements are in [README.md](./README.md).

## What's built

- **Vite scaffold** with vanilla JS, `base: '/carver/'` for GitHub Pages
- **Self-hosted fonts** — Source Serif 4 (variable, roman + italic) and Courier Prime woff2 in `/public/fonts/`
- **CSS theming** — all colour via CSS custom properties; `data-theme` (light/dark, whole app; print forces light) and `data-preview` on `<html>`. One accent, proofreader's red, for caret, selection, links, focus and active state. Visual system in DESIGN.md
- **CodeMirror 6 editor** — markdown language, custom theme via compartment (hot-swappable on settings change), Courier Prime typescript at its own font metrics; caret and selection drawn by `src/modules/proof-selection.js` on CodeMirror layers (caret 80% of the line height, centred, slow 1.6s blink; one-line selection pieces grown to the full line), headings/strong bold, emphasis italic, inline code, code blocks and `==highlight==` bands on a ground drawn on a CodeMirror layer beneath the selection (an unclosed block visibly runs to the end); `==` is parsed by a small Lezer extension in `editor.js`, syntax char dimming via CSS var `--syntax-dim`
- **Proof (markdown-it + markdown-it-mark for `==highlight==`, `breaks: true` so a single newline is a line break)** — rendered once per animation frame; every block carries `data-line` (its first source line). Paper is A4 or US Letter from the browser locale (`paperForLocale`), used by both previews. Continuous mode sets one paper-wide sheet; Paged mode (`src/modules/pages.js`) lays pages out at full size, then scales them with a transform (never `zoom`, which re-wraps text), so breaks are identical at every window width and in print. Paragraphs and lists split between lines with at least two lines each side; code blocks, quotes, tables, figures stay whole unless taller than a page; tables split between rows; headings travel with what follows. On phones the text column fills the screen and the margins are cropped
- **Scroll matching** — always on (no setting). `src/modules/scroll-sync.js` aligns the source line at a reading line (25% down) with the block it became, in either direction; its own writes are ignored, so the panes never fight
- **Word count** — `src/modules/words.js`, shown in the masthead
- **Masthead** — an ink bar (`--bar` tokens) with the red wordmark, word count, and icon + word actions (Open, Download, Print, Guide, Settings). Anything chosen wears the selection wash: in settings the chosen word (light or dark wash per theme); on the bar the open action (red icon) and the selected Write/Proof tab, always in the dark wash (`--bar-wash`). The bar sits above the panel scrim; Open and Print close any open panel. Panels (Settings, Save, Guide) drop from the top right at one width (420px), all modal (scrim, Escape, click outside); only one is open at a time
- **Settings dialog** — 3 settings (text size, preview, appearance); appearance follows the system until the writer picks one, localStorage persistence, focus trap, Escape to close, click-outside to close, focus returned to trigger on close
- **Document persistence** — localStorage, 300ms debounce; first-time users see Raymond Carver-style demo document
- **Narrow screens** — `<800px` shows one side at a time: Write / Proof tabs in the masthead (arrow keys switch), actions move to a bottom toolbar
- **Accessibility** — ARIA on modal, panes, buttons; focus trap; focus rings; `aria-label` on CM6 contenteditable; secondary/dim colours calculated for ≥3:1 contrast, body text ≥4.5:1
- **GitHub Actions** — `.github/workflows/deploy.yml`: runs unit tests then deploys to Pages on push to `main`
- **Preview images** — `npm run og` builds, serves the build (checking the server is serving it), and screenshots the welcome note in the real app in installed Chrome, in a small 3:2 window (840×560, the smallest that keeps both sides) with large text and the paged preview, so the bar's actions read clearly. Writes `.github/cover.jpg` (that screenshot at 2400×1600, the README header; `-- --cover <path>` also writes it there) and `public/og.png` (1200×630: the same window, rounded and shadowed, centred on a stage computed each run as the hue opposite the wordmark's `--bar-red`, at 100% saturation and 9% lightness, as zola does). A post-commit hook (`.githooks/post-commit`; enable with `git config core.hooksPath .githooks`) reruns it after commits touching the app or the welcome note, writing the cover into `../jackbush.github.io/src/assets/covers/carver.jpg` when that checkout exists. The images are left uncommitted.
- **Unit tests** — Vitest + jsdom, 41 tests covering settings round-trip and migration, font size mapping, word counting, paper by locale, markdown-it rendering, filenames. Run with `npm test`.

## What's still needed

### E2E tests (Playwright)

Tests are written at `tests/e2e/app.spec.js` and cover:
- Editor → proof rendering
- Settings persistence across reload (preview setting)
- Text size CSS var
- Narrow-screen Write / Proof tabs, including arrow keys
- Paged proofs: numbered pages, no words lost, identical breaks at different window widths
- Scroll matching down and back up
- Typescript selection across wrapped lines is drawn; caret height matches on empty and text lines
- An unclosed code block runs on visibly; Print closes an open panel
- `==text==` highlights on the proof and in the typescript
- Settings dialog ARIA and keyboard (Escape)
- Document content persistence across reload

**Blocked on Playwright browser install** — requires downloading ~165MB Chromium binary, deferred due to slow connection. To run when ready:

```bash
npx playwright install chromium
npm run test:e2e
```

The tests use `baseURL: http://localhost:5173/carver/` and `reuseExistingServer: true` so the dev server needs to be running (`npm run dev`), or the config can be updated to use the built preview server.

### Visual QA

- Check all appearance / preview / text size combinations in browser, including Firefox and Safari
- Confirm fonts load from `/fonts/` (no external requests) using Network tab
- Confirm localStorage persistence survives hard reload
