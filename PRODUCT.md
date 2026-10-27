# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Writers drafting prose: essays, fiction, notes, posts. They come to Carver to draft in a calm place, then download the draft as a `.md` file or export it as a PDF.

## Product Purpose

Carver is a markdown editor that runs entirely in the browser. It sets a source pane beside a live rendered preview, so the writer sees both the sentence and how it will read. Success is a writer who opens it, writes, and never has to think about the tool, an account, or where their words went.

## Positioning

Private by construction, not by policy: no accounts, no servers, nothing leaves the page. The document lives in the writer's own browser and leaves only when they save or print it.

## Operating Context

- Desktop: the typescript (markdown) and the proof (rendered, PDF-like) side by side. The separation is deliberate: writing in markdown and reading a typeset page makes proofing easier. Narrow screens (<800px) show one side at a time, switched with Write / Proof.
- Actions, labelled with a word and an icon: Open (`.md` upload), Download (the `.md` file, with a chosen filename; called Download, not Save, because writing is already kept as you type), Print / PDF, Guide (markdown syntax reference), Settings. A live word count is always visible.
- First visit opens a welcome document (`public/demo.md`) that teaches the controls and the syntax. Writers are expected to clear it and start.
- Document and settings persist in `localStorage` with a 300ms debounce.
- Deployed as a static site on GitHub Pages at `https://jackbush.github.io/carver/`.

## Capabilities and Constraints

- **Hard constraint:** no accounts, no servers, no data sent anywhere. All work stays client-side.
- Settings: preview (continuous by default, or paged; paged prints one-to-one; paper is A4 or US Letter by locale, never asked), text size (14/16/18px), appearance (follows the system until chosen, then remembered; dark for comfort and accessibility).
- The typescript and the proof always scroll together; there is no option to turn it off.
- One reading style, done well, rather than several mediocre options: no reading-font, tint or reading-theme choices. A further theme is added only if it is as good as the first.
- One document at a time.
- Stack: Vite (vanilla JS), CodeMirror 6, markdown-it, Vitest, Playwright. Self-hosted Source Serif 4 and Courier Prime.

## Brand Commitments

- Name: Carver, after Raymond Carver.
- Tagline: "A markdown editor. Minimal by design, private by default, delightful by nature."
- **Voice is binding everywhere:** labels, guide, errors, empty states and dialogs are spare, literary and quietly wry, like the welcome document ("You write. It stays. Nobody else sees it."). Short declarative sentences; no exclamation, no marketing hype.
- Assets: `public/favicon.svg`, `public/favicon-32.png`, `public/apple-touch-icon.png`, `public/og.png`, `public/mark-legacy.svg` (superseded mark).

## Evidence on Hand

- Welcome document copy: `public/demo.md`.
- Preview images, generated from the app by `npm run og`: `public/og.png` (social preview) and `.github/cover.jpg` (3:2, README and homepage).
- No users, testimonials, usage data or press. Do not invent any.

## Product Principles

1. **The words are the product.** Every element must earn its place against the writer's attention.
2. **Privacy is structural.** Never add a feature that needs a server, an account, or sending the document anywhere.
3. **Show the shape, not the scaffolding.** Markdown syntax recedes so the sentence stays visible.
4. **One voice.** The interface speaks like the welcome document, wherever it speaks.

## Accessibility & Inclusion

- Body text at least 4.5:1 contrast; secondary and dimmed text at least 3:1, in both light and dark appearance.
- Full keyboard use: modals trap focus, close on Escape, and return focus to the button that opened them; focus rings stay visible.
- ARIA labels on panes, icon buttons, modals and the CodeMirror editing surface.
