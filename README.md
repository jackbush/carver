# Carver

Minimal by design, private by default.

A markdown editor that runs entirely in the browser. No accounts, no servers, no data leaves the page.

---

Two-column layout: editor on the left, live preview on the right. On mobile (or in focus mode), a single-column view with a top bar to switch between edit and preview.

The editor uses IBM Plex Mono with syntax dimming — markdown characters that don't appear in the final output are subtly de-emphasised. Headings are bold. The preview uses IBM Plex Sans or Serif depending on your preference.

Everything — your document and all settings — is saved to localStorage. Nothing leaves the browser. When you're ready to export, use the download button (bottom-right, next to settings) to save your document as a `.md` file. The filename defaults to a slug of your first heading.

## Settings

| Setting | Options |
|---------|---------|
| Editor theme | Dark / Light |
| Editor caret | Line / Block / Underscore |
| Preview theme | Dark / Light |
| Preview font | Sans-serif / Serif |
| Tint | Cool (blue) / Warm (amber/orange) — applies globally to caret, divider, toggle, controls |
| Text size | Small (14px) / Medium (16px) / Large (18px) |
| Focus mode on desktop | Forces single-column layout |
| Match scroll positions | Aligns top of both panes |

Settings and document content persist to localStorage. On first load, themes default to the browser's light/dark preference.

## Privacy

Fonts (IBM Plex Mono, Sans, Serif) are self-hosted as woff2 files. No requests are made to Google Fonts or any external service.

## Deploy

Deployed to [jackbush.github.io/carver](https://jackbush.github.io/carver) via GitHub Pages. Pushes to `main` build and deploy automatically.

## Stack

- Vite (vanilla JS)
- CodeMirror 6
- markdown-it
- Vitest (unit tests)
- Playwright (E2E tests, requires local install — see below)
