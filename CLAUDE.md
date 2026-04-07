# Carver — Implementation Plan

All product requirements are in [README.md](./README.md). This file is the step-by-step build plan.

## Step 1: Project Scaffolding

- Initialize a Vite vanilla-js project in the repo root
- Install dependencies: `codemirror` (+ relevant CM6 packages), `markdown-it`, `vitest`, `playwright`
- Add IBM Plex Mono and IBM Plex Sans via Google Fonts (or self-host the woff2 files)
- Set up the HTML shell: single `index.html` with editor pane, preview pane, footer, and settings modal placeholder
- Add a GitHub Pages deploy workflow (`.github/workflows/deploy.yml`) using Vite's build output

## Step 2: CSS Foundation & Theming

- Define CSS custom properties for the colour scheme on `:root`:
  - Near-black and near-white base colours
  - Accent colour with two tint variants: cool (blue) and warm (amber/orange — clean and energising, not sepia)
  - The accent colour is used consistently across ALL tinted elements: caret, selection highlight, vertical divider, mobile toggle, settings controls
  - Primary and secondary text colours for the preview pane
- Implement theme switching via `data-editor-theme`, `data-preview-theme`, and `data-tint` attributes on the root element
- Set 16px base font size, make it configurable via a CSS variable for the text size setting (14/16/18)
- Style the two-column desktop layout (editor left, preview right, accent-coloured divider)
- Style the fixed footer with title/tagline left and settings icon right

## Step 3: CodeMirror 6 Editor

- Set up a minimal CM6 instance in the editor pane with:
  - Markdown language support (`@codemirror/lang-markdown`)
  - Custom theme matching the colour scheme (dark and light variants)
  - No line numbers, line wrapping enabled
  - Caret colour set to the accent colour, default to line style
  - Selection highlight styled using the accent colour (slightly more neutral than background)
- Add syntax highlighting overrides:
  - Heading lines (`#` prefix) render bold
  - All markdown syntax characters that won't appear in rendered output are dimmed (reduced opacity): `#`, `**`, `_`, `` ` ``, `[]()` brackets/parens, `>`, `-`/`*` list markers, etc.
- Wire up a change listener that sends the editor content to the preview pane on every keystroke

## Step 4: Preview Pane

- On each editor change, run the content through `markdown-it` and inject the HTML into the preview pane
- Style the preview pane with IBM Plex Sans, using the primary/secondary text colour variables
- Ensure the preview updates instantly (no debounce)

## Step 5: Settings Modal

- Build the modal UI (triggered by footer settings icon):
  - Editor theme (dropdown: dark/light)
  - Editor caret (dropdown: line/block/chevron/underscore)
  - Preview theme (dropdown: dark/light)
  - Preview font (dropdown: serif/sans-serif)
  - Tint (dropdown: cool/warm)
  - Text size (dropdown: small/medium/large)
  - Focus mode on desktop (checkbox)
- On each setting change, immediately apply it (update CSS variables / data attributes / CM6 config)
- Save all settings to `localStorage` on change
- Load settings from `localStorage` on page load; if none exist, default editor/preview themes to the browser's `prefers-color-scheme`

## Step 6: Document Persistence

- Save editor content to `localStorage` on every change (can debounce this slightly for performance, e.g. 300ms)
- On page load, restore content from `localStorage` if present
- If no saved content, start with an empty editor

## Step 7: Mobile / Focus Mode

- At viewport < 800px, switch to single-column layout:
  - Only one pane visible at a time (editor or preview)
  - Floating top bar with "Edit" label left, "Preview" label right, toggle button in the middle (accent colour)
  - Default to showing the editor
- The "focus mode on desktop" checkbox forces this layout regardless of viewport width
- Hide the vertical divider in focus mode

## Step 8: Accessibility

- Ensure all interactive elements are keyboard-navigable
- Add appropriate ARIA labels to the settings modal, toggle, panes
- Maintain sufficient colour contrast ratios for WCAG AA (4.5:1 for normal text, 3:1 for large text) across all theme/tint combinations
- Test with Playwright's accessibility auditing (axe-core)

## Step 9: Tests

### Unit Tests (Vitest)
- Settings save/load to localStorage
- Markdown-it renders expected HTML for key syntax (headings, links, bold, italic, lists, code blocks)
- Theme defaults match browser preference when no settings stored
- Text size setting maps to correct base font size

### E2E Tests (Playwright)
- Type markdown in editor, verify preview updates correctly
- Change each setting, reload page, verify setting persisted
- Resize to mobile width, verify focus mode activates and toggle works
- Activate desktop focus mode checkbox, verify layout switches
- Run axe-core accessibility audit on the page in both themes

## Step 10: Polish & Ship

- Test all theme/tint/size combinations visually
- Verify GitHub Pages deployment works end-to-end
- Confirm zero network requests to external APIs (fonts may be an exception — self-host if needed for privacy)
- Add a sensible default document or empty state
