# Carver

Minimal by design, private by default.

A markdown editor that runs entirely in the browser. No accounts, no servers, no data leaves the page.

## Tech Stack

- Vanilla HTML/CSS/JS with Vite for bundling
- CodeMirror 6 for the editor
- markdown-it for preview rendering
- Vitest for unit tests, Playwright for E2E tests
- Deployed via GitHub Pages

## Layout

### Desktop (800px+)

Two vertical columns: editor on the left, live preview on the right. A vertical divider separates the panes, using the accent colour (blue in cool tint, amber/orange in warm tint).

### Mobile (<800px)

Single-column "focus mode" is forced. A floating top bar lets the user toggle between edit and preview. The edit label sits on the left, the preview label on the right, with a toggle button between them. The toggle uses the accent colour.

### Editor Pane

- IBM Plex Mono, 16px base
- No line numbers, text wraps naturally
- Accent-coloured caret (slightly more neutral than text colour), defaulting to line style
- Selection highlight uses the accent colour, slightly more neutral than the background
- Markdown syntax characters that don't appear in rendered output (`#`, `**`, `_`, `[]()` markup, etc.) are dimmed via reduced opacity — keeps focus on content while showing structure
- Headings (lines starting with `#`) are styled bold

### Preview Pane

- IBM Plex Sans (pairs with the editor's Plex Mono)
- Same accent-tinted colour scheme with more typographic nuance (primary and secondary text colours for headings vs body)
- Live-updates instantly as the user types

### Footer

Fixed at the bottom of the page.

- Left side: "Carver" title and tagline "Minimal by design, private by default."
- Right side: Settings button (icon only, no text label)

### Settings Modal

Opened via the footer settings button. All settings persist to localStorage.

| Setting | Type | Options |
|---------|------|---------|
| Editor theme | Dropdown | Dark / Light |
| Editor caret | Dropdown | Line / Block / Chevron / Underscore |
| Preview theme | Dropdown | Dark / Light |
| Preview font | Dropdown | Serif / Sans-serif |
| Tint | Dropdown | Cool (blue) / Warm (amber/orange — clean and energising, not dull sepia). This is the global accent colour — it tints everything: caret, selection, divider, toggle, controls |
| Text size | Dropdown | Small (14px base) / Medium (16px base) / Large (18px base) |
| Focus mode on desktop | Checkbox | Forces single-column mobile layout on desktop |

## Behaviour

- On first load, editor and preview themes default to the browser's light/dark preference
- All settings and document content persist to localStorage — returning users see their previous work and preferences
- Preview updates live as the user types, with no delay
- Markdown syntax highlighting in the editor updates automatically as the user types

## Requirements

- WCAG AA accessibility compliance
- Unit tests covering settings logic, markdown parsing, and theme switching
- E2E tests covering edit/preview sync, settings persistence, mobile toggle, and accessibility auditing
- Deployable via GitHub Pages workflow
- Fully private: no data sent to any backend or external API
