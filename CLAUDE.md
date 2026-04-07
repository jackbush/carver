# Carver — Implementation Plan

All product requirements are in [README.md](./README.md). This file is the step-by-step build plan.

## Step 1: Project Scaffolding

- Initialize a Vite vanilla-js project in the repo root
- Install dependencies: `codemirror` (+ relevant CM6 packages), `markdown-it`, `vitest`, `@vitest/coverage-v8`, `playwright`, `@playwright/test`
- Self-host IBM Plex Mono, IBM Plex Sans, and IBM Plex Serif woff2 files in `/public/fonts/` — do NOT use Google Fonts (privacy requirement). All three are needed: Mono for the editor, Sans for the preview default, Serif for the preview serif option
- Set up the HTML shell: single `index.html` with editor pane, preview pane, footer, and settings modal placeholder
- Add a GitHub Pages deploy workflow (`.github/workflows/deploy.yml`) using Vite's build output, targeting `jackbush.github.io/carver` (set `base: '/carver/'` in vite.config.js)

## Step 2: CSS Foundation & Theming

- Define CSS custom properties for the colour scheme on `:root`:
  - Near-black and near-white base colours with a subtle cool tint by default
  - Accent colour as a single variable that switches between cool (blue) and warm (amber/orange — clean and energising, not sepia) via `data-tint` attribute
  - The accent colour is used consistently across ALL tinted elements: caret, selection highlight, vertical divider, mobile toggle, settings controls
  - Primary and secondary text colours for the preview pane
- Implement theme switching via `data-editor-theme`, `data-preview-theme`, and `data-tint` attributes on the root element
- Set base font size as a CSS variable, switching between 14px / 16px / 18px for the text size setting
- Style the two-column desktop layout (editor left, preview right, accent-coloured divider)
- Style the fixed footer with title/tagline left and settings icon right

## Step 3: CodeMirror 6 Editor

- Set up a minimal CM6 instance in the editor pane with:
  - Markdown language support (`@codemirror/lang-markdown`)
  - Custom theme matching the colour scheme (dark and light variants), referencing CSS variables
  - No line numbers, line wrapping enabled
  - Caret colour set to the accent CSS variable, defaulting to line style
  - Selection highlight styled using the accent colour (slightly more neutral than background)
- Add syntax highlighting overrides:
  - Heading lines (`#` prefix) render bold
  - All markdown syntax characters that won't appear in rendered output are dimmed (reduced opacity): `#`, `**`, `_`, `` ` ``, `[]()` brackets/parens, `>`, `-`/`*` list markers, etc.
- Wire up a change listener that sends the editor content to the preview pane on every keystroke
- Caret style options are: Line, Block, Underscore (chevron removed — not a native CM6 concept)

## Step 4: Preview Pane

- On each editor change, run the content through `markdown-it` and inject the HTML into the preview pane
- Style the preview pane with IBM Plex Sans, using the primary/secondary text colour variables
- Ensure the preview updates instantly (no debounce)

## Step 5: Settings Modal

- Build the modal UI (triggered by footer settings icon):
  - Editor theme (dropdown: dark/light)
  - Editor caret (dropdown: line/block/underscore)
  - Preview theme (dropdown: dark/light)
  - Preview font (dropdown: serif/sans-serif)
  - Tint (dropdown: cool/warm)
  - Text size (dropdown: small/medium/large)
  - Focus mode on desktop (checkbox)
- Modal is dismissed by: clicking outside the modal, or clicking an explicit close button (×) in the modal header
- On each setting change, immediately apply it (update CSS variables / data attributes / CM6 config)
- Save all settings to `localStorage` on change
- Load settings from `localStorage` on page load; if none exist, default editor/preview themes to the browser's `prefers-color-scheme`

## Step 6: Document Persistence

- Save editor content to `localStorage` on every change (debounce at ~300ms for performance)
- On page load, restore content from `localStorage` if present
- If no saved content, populate the editor with the demo document (see Step 10)

## Step 7: Mobile / Focus Mode

- At viewport < 800px, switch to single-column layout:
  - Only one pane visible at a time (editor or preview)
  - Floating top bar with "Edit" label left, "Preview" label right, toggle button in the middle (accent colour)
  - Default to showing the editor
- The "focus mode on desktop" checkbox forces this layout regardless of viewport width
- Hide the vertical divider in focus mode

## Step 8: Accessibility

- Ensure all interactive elements are keyboard-navigable (tab order, focus rings)
- Add appropriate ARIA labels to the settings modal (`role="dialog"`, `aria-modal`, `aria-label`), toggle button, and panes
- Trap focus within the settings modal when open
- Maintain sufficient colour contrast ratios for WCAG AA (4.5:1 for normal text, 3:1 for large text) across all theme/tint combinations
- Test with Playwright's axe-core accessibility auditing

## Step 9: Tests

### Unit Tests (Vitest)
- Settings save/load to localStorage (all settings round-trip correctly)
- Settings default to browser `prefers-color-scheme` when localStorage is empty
- Text size setting maps to correct base font size px value
- Markdown-it renders expected HTML for key syntax: headings, links, bold, italic, code inline, code block, blockquote, unordered list, ordered list

### E2E Tests (Playwright)
- Type markdown in editor, verify preview HTML updates correctly
- Change each setting, reload page, verify setting persisted and applied
- Resize to mobile width, verify focus mode activates and edit/preview toggle works
- Activate desktop focus mode checkbox, verify layout switches to single column
- Run axe-core accessibility audit on the page in light theme, dark theme, cool tint, and warm tint

## Step 10: Demo Document & Polish

The demo document shown to first-time users should be written in the style of Raymond Carver — plain, spare prose — while demonstrating as much markdown syntax as possible. Work in as many Carver references and puns as can be done smoothly (titles, characters, themes: cathedrals, small things, what we talk about, etc.). It should showcase: h1, h2, h3, bold, italic, inline code, code block, blockquote, unordered list, ordered list, and a link.

Polish checklist:
- Test all theme/tint/size combinations visually
- Verify GitHub Pages deployment works end-to-end (`base: '/carver/'` set correctly in Vite config)
- Confirm zero network requests to external origins (verify fonts load from `/fonts/` not Google)
- Confirm localStorage persistence works across hard reload
