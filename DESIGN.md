---
name: Carver
description: A markdown editor set as a galley proof. The typescript on one side, the proof sheet on the desk beside it.
colors:
  accent: "#e8551c"
  highlight: "rgb(255 181 17 / 0.45)"
  selection: "rgb(255 108 47 / 0.22)"
  hover: "rgb(20 20 20 / 0.10)"
  desk: "#f2f1ee"
  desk-line: "#dad8d2"
  paper: "#ffffff"
  ink: "#141414"
  ink-strong: "#000000"
  ink-2: "#4a4845"
  ink-3: "#6b6864"
  syntax-dim: "#8a8782"
  rule: "#e6e4df"
  control-line: "#cfccc5"
  code-ground: "#f6f5f2"
  bar: "#1d1c1a"
  bar-line: "#1d1c1a"
  bar-ink: "#ece9e3"
  bar-ink-2: "#a8a39b"
  bar-accent: "#ff6c2f"
  bar-highlight: "rgb(255 181 17 / 0.22)"
  dark-accent: "#ff6c2f"
  dark-highlight: "rgb(255 181 17 / 0.36)"
  dark-selection: "rgb(255 108 47 / 0.30)"
  dark-hover: "rgb(255 255 255 / 0.10)"
  dark-desk: "#161514"
  dark-desk-line: "#2e2c29"
  dark-paper: "#1f1e1c"
  dark-ink: "#e8e5df"
  dark-ink-strong: "#ffffff"
  dark-ink-2: "#bdb9b1"
  dark-ink-3: "#9a958d"
  dark-syntax-dim: "#8a867f"
  dark-rule: "#33312e"
  dark-control-line: "#4a4743"
  dark-code-ground: "#282624"
  dark-bar: "#0d0c0b"
  dark-bar-line: "#2e2c29"
  dark-bar-ink: "#e8e5df"
  dark-bar-ink-2: "#9a958d"
typography:
  wordmark:
    fontFamily: "'Source Serif 4', Georgia, serif"
    fontSize: "24px"
    fontWeight: 700
    letterSpacing: "-0.01em"
  title:
    fontFamily: "'Source Serif 4', Georgia, serif"
    fontSize: "18px"
    fontWeight: 620
    letterSpacing: "-0.01em"
  ui:
    fontFamily: "'Source Serif 4', Georgia, serif"
    fontSize: "15px"
    fontWeight: 400
  toolbar-label:
    fontFamily: "'Source Serif 4', Georgia, serif"
    fontSize: "13px"
    fontWeight: 400
  proof-display:
    fontFamily: "'Source Serif 4', Georgia, serif"
    fontSize: "2.15em"
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: "-0.018em"
  proof-headline:
    fontFamily: "'Source Serif 4', Georgia, serif"
    fontSize: "1.4em"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "-0.008em"
  proof-title:
    fontFamily: "'Source Serif 4', Georgia, serif"
    fontSize: "1.12em"
    fontWeight: 500
    lineHeight: 1.35
  proof-small-caps:
    fontFamily: "'Source Serif 4', Georgia, serif"
    fontSize: "1em"
    fontWeight: 600
    letterSpacing: "0.05em"
    fontFeature: "all-small-caps"
  proof-body:
    fontFamily: "'Source Serif 4', Georgia, serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.55
  typescript:
    fontFamily: "'Courier Prime', 'Courier New', monospace"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.7
rounded:
  sm: "2px"
  md: "3px"
spacing:
  masthead: "48px"
  toolbar: "52px"
  panel-drop: "8px"
  sheet-gap: "28px"
  desk-pad: "2.5rem 0 4rem"
  desk-gutter: "3rem"
  desk-pad-narrow: "0.75rem 0 2rem"
  desk-gutter-narrow: "0.75rem"
  phone-margin-kept: "12px"
  modal-body: "0.5rem 1.25rem 1.25rem"
components:
  masthead:
    backgroundColor: "{colors.bar}"
    textColor: "{colors.bar-ink}"
    height: "48px"
  phone-toolbar:
    backgroundColor: "{colors.bar}"
    textColor: "{colors.bar-ink}"
    height: "52px"
  action:
    textColor: "{colors.bar-ink}"
    typography: "{typography.ui}"
    rounded: "{rounded.sm}"
    padding: "0.4rem 0.65rem"
  action-open:
    backgroundColor: "{colors.bar-highlight}"
    textColor: "{colors.bar-ink}"
    rounded: "{rounded.sm}"
    padding: "0.4rem 0.65rem"
  action-phone:
    textColor: "{colors.bar-ink}"
    typography: "{typography.toolbar-label}"
    rounded: "{rounded.sm}"
    padding: "0.3rem 0.5rem"
  view-tab:
    textColor: "{colors.bar-ink-2}"
    rounded: "{rounded.sm}"
    padding: "0.4rem 0.65rem"
  view-tab-selected:
    backgroundColor: "{colors.bar-highlight}"
    textColor: "{colors.bar-ink}"
  close-button:
    textColor: "{colors.ink-3}"
    rounded: "{rounded.sm}"
    padding: "0.35rem"
  button:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "0.45rem 1rem"
  button-hover:
    backgroundColor: "{colors.desk}"
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.md}"
    padding: "0.45rem 1rem"
  button-primary-hover:
    backgroundColor: "{colors.ink-strong}"
  setting-row:
    textColor: "{colors.ink-2}"
    typography: "{typography.ui}"
    padding: "0.6rem 0"
  setting-choice:
    textColor: "{colors.ink-2}"
    padding: "0 0.15em"
  setting-choice-hover:
    backgroundColor: "{colors.hover}"
    textColor: "{colors.ink}"
  setting-choice-selected:
    backgroundColor: "{colors.highlight}"
    textColor: "{colors.ink}"
  filename-field:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.typescript}"
    rounded: "{rounded.md}"
    padding: "0.45rem 0.6rem"
  panel:
    backgroundColor: "{colors.paper}"
    rounded: "{rounded.md}"
    width: "420px"
  sheet:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.proof-body}"
---

# Design System: Carver

## Overview

**Creative North Star: "The Galley Proof"**

Carver is a proofing desk. On one side lies the typescript: Courier Prime on plain paper, where the markdown shows. On the other is a photocopier-grey desk with a white sheet set in Source Serif 4, which is how the words will print. The chrome stays out of the way. It is a thin ink band across the top (and along the bottom on phones) that frames both panes evenly, set in the same serif as the proof, where each action is a plain word with a thin line icon beside it, and there are no pills or coloured buttons. The only colour comes from two riso inks, bright and fun but calm, never fluorescent. Riso Orange marks where an editor's pen would go (the caret, under a link, around focus, the icon of the open action) and sets the "Carver" wordmark; a faint wash of it marks selected text. Sunflower is the highlighter: a translucent stroke across the lower part of the words, for `==highlight==` and for anything chosen.

The density is low and the hierarchy is typographic. Everything outside the proof is set at almost one size and one weight, so the large title on the sheet is the loudest thing on screen. Depth is physical, not decorative: sheets and panels sit on the desk with a soft, low shadow, the way paper does. After dark, the whole desk changes with it: grounds go low-glare, ink goes warm and light, the orange brightens and the highlighter thins. Print is always light.

The sheet is the signature. The paper (A4 or US Letter) comes from the writer's locale and sets both previews. In Continuous mode the proof is one long sheet at that paper's width and margins, with no breaks. In Paged mode it is split into real pages at true paper size, laid out at full size, scaled to fit the desk, numbered with oldstyle folios, and printed one-to-one.

**Key Characteristics:**
- A grey desk, white sheets and near-black ink, with two riso inks (Orange for marks, Sunflower for the highlighter); a matching dark desk under the Appearance setting.
- One serif for both the proof and the chrome; a typewriter face for the typescript.
- An ink band for the bar, framing a grey desk and the white typescript alike.
- Actions are words, each with a thin line icon. Chosen state wears the Sunflower highlight, never a fill, a rule or a border.
- Corners are nearly square (2 to 3px). Shadows are soft and offset downward.
- Real pagination at the writer's paper size, scaled, never reflowed.

## Colors

The palette is greyscale paper and ink with two riso inks, so it reads like a marked-up proof and not like an app: Orange for marks, Sunflower for the highlighter. Both are riso colours, bright but calm; neither is fluorescent. Every colour is a custom property with a light set and a dark set; the dark set applies to the whole app. The app follows the system appearance until the writer picks one in Settings, and then remembers that choice.

### Primary
- **Orange** (accent; dark-accent after dark): marks on paper. The caret (a 2px line drawn at 80% of the line height, centred, blinking slowly on and off), the focus ring on paper (2px outline, 2px offset), link underlines on the proof, and the filename field's focus ring. In light it is deepened for paper (3.6:1 on white); after dark it is full Riso Orange. It is never a fill on a control, never a state ground and never body text.
- **Riso Orange** (bar-accent, the same in both appearances): Orange as it reads on the ink band (6:1 on the bar). It is the wordmark, the icon of the open bar action and the focus ring inside the bar. The preview images' stage is computed from it: the opposite hue at 100% saturation and 9% lightness (a deep blue, hsl(198 100% 9%)).
- **Selection** (selection; dark-selection): a faint orange wash behind selected text, in the typescript and on the proof. It is deliberately distinct from a highlight, so selecting highlighted text still reads as a selection.

### Secondary
- **Sunflower** (highlight; dark-highlight): the highlighter. Translucent Riso Sunflower: a stroke for `==highlight==` on the proof and in the Guide and under the chosen word in Settings, and a plain box around highlighted characters in the typescript. Text on it is always ink. Print forces the light value, as it does Orange.
- **Bar Sunflower** (bar-highlight, the same in both appearances): Sunflower thinned for the ink band. It is the chip behind the open bar action and the selected Write/Proof tab, with bar-ink text.
- **Hover** (hover; dark-hover): a grey stroke, the highlight a pointer previews on a settings choice before it is chosen.

### Neutral
- **Ink Band** (bar / dark-bar): the masthead and the narrow-screen bottom toolbar, one near-black band that frames both panes evenly. After dark it goes darker than the desk. The browser `theme-color` follows it (read from the masthead's computed background).
- **Bar Line** (bar-line / dark-bar-line): the 1px hairline under the masthead and above the bottom toolbar. In light it is the bar itself, so the band reads as one solid edge; after dark it is the desk line.
- **Bar Ink** (bar-ink / dark-bar-ink): action words on the bar, and an action's icon on hover.
- **Bar Ink 2** (bar-ink-2 / dark-bar-ink-2): quiet text on the bar at 6:1 or above: the word count, action icons at rest, the hover underline, and the unselected Write/Proof tabs.
- **Photocopier Desk** (desk / dark-desk): the proof pane behind the sheets, and the hover fill on buttons. It is never the bar.
- **Desk Line** (desk-line / dark-desk-line): the 1px hairlines between the panes and around floating panels.
- **Paper** (paper / dark-paper): proof sheets, panels, the typescript ground and secondary buttons.
- **Ink** (ink / dark-ink): text on the desk and on paper, the primary button fill, and the heavy rule under table headers. **Ink Strong** (ink-strong / dark-ink-strong) is only the primary button's hover.
- **Ink 2** (ink-2 / dark-ink-2): secondary text on paper, such as blockquotes, setting names, unchosen setting choices and Guide descriptions.
- **Ink 3** (ink-3 / dark-ink-3): quiet text on desk and paper at 4.5:1 or above: the bullets between setting choices, the filename extension, the Close icon, folios, list markers, bullet discs and the asterism.
- **Syntax Dim** (syntax-dim / dark-syntax-dim): markdown punctuation and URLs in the typescript; visible but quiet.
- **Rule** (rule / dark-rule): light rules between table rows on the proof, between rows in the Guide and between settings.
- **Control Line** (control-line / dark-control-line): 1px strokes around buttons and the filename field, plus the thin scrollbars.
- **Code Ground** (code-ground / dark-code-ground): the faint ground under code on the proof and in the typescript. In the typescript it is drawn on a CodeMirror layer beneath the selection layer, under inline code and under every line of a code block, fences included, so an unclosed block visibly runs on to the end and a selection always shows over code.

### Named Rules
**The Two Inks Rule.** Orange is a mark, Sunflower is a highlighter. Orange appears only where a proofreader's pen would (the caret, links, focus, the open action's icon) plus the wordmark, and faintly behind selected text. Sunflower appears only as the highlighter stroke: on `==highlight==` and on anything chosen. If an element is orange or yellow for any other reason, it is wrong.

**The Highlighter Rule.** One mechanic marks "chosen": the Sunflower highlight. In Settings it is the highlighter stroke under the chosen word, the same stroke as `==highlight==`; on the ink band, where a stroke would be lost, the open bar action and the selected Write/Proof tab wear Bar Sunflower as a chip (2px corner) with bar-ink text. Chosen state is never a solid fill, an underline or inset rule, a border, a coloured pill or bold text, and it is never the selection colour.

**The Ink Band Rule.** The masthead and the phone toolbar are one ink band that frames both panes evenly. The desk never doubles as the bar. The band sits above the panel scrim so it stays clear while a panel is open.

**The Whole Desk Rule.** Appearance (Light by default, or Dark) switches every surface at once: bar, desk, sheets, typescript and panels. Nothing stays light while the rest goes dark, and print always resets to the light set.

## Typography

**Display Font:** Source Serif 4, a variable roman and italic (falls back to Georgia, serif)
**Body Font:** Source Serif 4
**Label/Mono Font:** Courier Prime regular, italic and bold (falls back to Courier New, monospace), with the face's own metrics. The typescript's caret and selection sizes come from how they are drawn (see Typescript), never from altered font metrics, which CodeMirror's selection geometry depends on.

**Character:** The proof is set as a book: optical sizing, kerning, hanging punctuation, oldstyle folios and small caps. The typescript is set as a manuscript off a typewriter. The chrome uses the same serif as the proof, so the interface reads as part of the page.

### Hierarchy
- **Wordmark** (700, 24px, -0.01em, bar-accent): plain "Carver" in the masthead, the largest and heaviest word in the chrome. It is hidden on narrow screens.
- **Field label** (400, 14px, ink-3): the Download panel's "File name", above its field.
- **Title** (620, 18px, -0.01em): panel titles.
- **UI** (400, 15px): every action word, setting name and choice, field label, button and the word count. Narrow-screen Write/Proof tabs are 16px.
- **Guide samples** (Courier Prime 400, 14px): the syntax samples in the Guide.
- **Toolbar label** (400, 13px): action words under their icons in the phone toolbar.
- **Proof display** (600, 2.15em, line-height 1.1, -0.018em): h1 on the sheet. It balances its wrap.
- **Proof headline** (600, 1.4em, line-height 1.25): h2.
- **Proof title** (italic 500, 1.12em, line-height 1.35): h3.
- **Proof small caps** (600, 1em, all-small-caps, +0.05em): h4 to h6.
- **Proof body** (400, base size 14/16/18px from the Text size setting, line-height 1.55): paragraphs with 0.85em spacing. Single newlines in the source are line breaks. Strong is weight 640. Inline code uses Courier Prime at 0.92em with line-height 1, so it does not disturb the line rhythm, on a code-ground chip (0.1em 0.3em padding, 2px corner). In the typescript, inline code gets the same ground behind its text, and markdown inside it stays undimmed because it is literal.
- **Typescript** (Courier Prime 400, base size, line-height 1.7, max 68ch): the editor. Headings and strong text are bold 700. Markdown punctuation uses syntax-dim, and URLs are dim and italic.

### Named Rules
**The One Voice Rule.** The chrome uses Source Serif 4 at the UI size, regular weight. Hierarchy outside the proof comes from position and from the quiet ink against the full ink (bar-ink-2 against bar-ink on the bar, ink-3 against ink on paper), not from size or weight steps. Only the wordmark, panel titles and the narrow-screen tabs go above 15px; only the phone toolbar labels go below 14px.

**The Two Hands Rule.** Courier Prime marks the writer's own characters: the typescript, inline code, code blocks, the filename field and the Guide's syntax samples. Everything that has been typeset uses Source Serif 4.

## Layout

On desktop the screen is split into two equal panes under a 48px ink-band masthead (orange wordmark and, vertically centred beside it, the word count on the left; actions on the right). The typescript pane is paper, with clamp(1.5rem, 5vw, 4rem) inline padding and 3rem block padding. The proof pane is the desk, with a 1px desk-line on its left edge, 2.5rem above and 4rem below the sheets, and a 3rem side gutter set as the frame's width rather than the scroller's padding (Chrome cannot drag-select scaled text inside a side-padded scroller).

**Paper:** A4 (210×297mm) or US Letter (215.9×279.4mm), chosen silently from the browser locale (Letter for US, CA, MX, PH, CL, CO, VE, PR; A4 elsewhere). There is no paper setting. The margin is 0.135× the paper width on top and sides, and 1.3× that at the foot.

**Continuous sheet:** the paper's width (narrower if the desk is), centred, at least the height of the desk, with the same margin ratio taken from the sheet's actual width (never under 1.5rem). There are no breaks. It prints on `@page` at the paper size with the same margins in mm.

**Paged sheets:** each sheet is the true paper size in mm with the folio centred at 0.6× the margin from the bottom edge; sheets are stacked 28px apart. The proof is laid out at full size and then scaled with a transform to fit the desk's width, never scaled up. On phones the text column fills the screen and the side margins are cropped to 12px. Print uses `@page` at the paper size with zero margin and no transform, so the screen pages print exactly.

**Pagination:** paragraphs and lists split between lines, keeping at least 2 lines on each side; split lists continue without a new marker and ordered lists resume their numbering. Code blocks, blockquotes, tables, figures and section breaks stay whole unless taller than a page; tables split between rows and repeat their header. A heading left at the foot of a page moves over with what follows it. Each page keeps 4px in reserve at the foot.

**Scroll matching:** always on. The two sides are matched by source line, not by percentage. Every rendered block carries its first source line, and the line at a reading line 25% down each viewport is kept aligned, on whatever page it landed.

**Narrow screens (<800px):** one pane at a time. The masthead swaps the wordmark for Write/Proof tabs, with the word count at the right. The actions move to a fixed 52px bottom toolbar, the same ink band (spaced around, safe-area aware), icon above word. The desk gutter drops to 0.75rem (0.75rem above, 2rem below) and the typescript padding to 1.75rem/1.25rem. Panels stretch to 0.75rem from either edge.

### Named Rules
**The True Paper Rule.** Margins, folio position and print size all come from the paper's real dimensions. Both previews use the same paper and margin ratio. Do not hard-code page geometry in px.

**The Scale, Don't Reflow Rule.** Paged proofs are laid out once at full size and scaled with a transform for display, never with CSS zoom and never re-wrapped per width, so a page break is the same at every window size and in print.

## Elevation & Depth

Depth is physical. Only paper casts a shadow on the desk. Chrome (the ink-band masthead and toolbar) is flat and casts nothing; it is a band of colour with a 1px bar-line edge. It stacks above the scrim (scrim 200, panel 201, bar 202), so the bar, and the open action's highlight in it, stay undimmed while a panel is open. There are no glows, no hard offset shadows and no stacked cards. The dark set keeps the same two shadows, deepened so they still read on a dark desk.

### Shadow Vocabulary
- **Sheet** (`box-shadow: 0 1px 2px rgba(20,20,20,0.07), 0 10px 28px -10px rgba(20,20,20,0.22)`; dark: `0 1px 2px rgba(0,0,0,0.4), 0 12px 32px -10px rgba(0,0,0,0.6)`): every proof sheet, continuous or paged. Removed for print.
- **Panel** (`box-shadow: 0 2px 6px rgba(20,20,20,0.08), 0 16px 36px -12px rgba(20,20,20,0.28)`; dark: `0 2px 6px rgba(0,0,0,0.4), 0 16px 36px -12px rgba(0,0,0,0.7)`): the floating Settings, Save and Guide panels, one step above the sheet.
- **Scrim** (`background: rgba(20,20,20,0.12)`; dark: `rgba(0,0,0,0.35)`): behind the modal panels. It dims the panes without hiding them, and stops below the bar.

### Named Rules
**The Paper Casts Rule.** A shadow means "a sheet of paper lying on the desk." If something is not paper, it does not get a shadow.

## Shapes

The shapes are rectangular and paper-like. Proof sheets have square corners (0). Controls and panels have very slightly softened corners: 2px on actions and Close, and 3px on buttons, the filename field and panels. Strokes are 1px (control-line, desk-line, bar-line or rule). Chosen-state chips on the bar share the 2px corner of the actions; the highlighter stroke has no corner, and a settings choice's focus outline has a 2px one. Icons are drawn with a 1.5 stroke and round caps and joins on a 24-unit grid. The only filled round shapes are the drawn bullet discs on proof lists (0.3em circles in ink-3).

## Components

### Actions
The masthead actions (Open, Download, Print, Guide, Settings) are words at 15px in bar-ink on the ink band, each with a 16px line icon (1.5 stroke, round caps and joins) 0.4rem before it, padded 0.4rem 0.65rem, with no background and no border at rest.
- **Icon:** bar-ink-2 at rest, bar-ink on hover.
- **Hover:** a 1px bar-ink-2 underline fades in (text-decoration-color, 0.15s ease-out, 0.35em offset).
- **Open (aria-expanded):** the action wears Bar Sunflower as a chip (2px corner), the same in both themes, with bar-ink text and no underline, and its icon turns Riso Orange. Open and Print close any open panel before they act.
- **Focus:** a 2px Riso Orange (bar-accent) outline at 2px offset.
- **Phone toolbar:** the same band along the bottom; the icon sits above a 13px word (0.15rem gap), padded 0.3rem 0.5rem.
- **Write/Proof tabs (narrow):** words only, 16px, bar-ink-2 at rest. The selected tab wears the same Bar Sunflower chip with bar-ink text.

### Buttons
Buttons appear only inside panels.
- **Shape:** slightly softened corners (3px), 1px control-line stroke, padded 0.45rem 1rem.
- **Default:** a paper ground. Hover fills with desk (0.15s ease-out).
- **Primary:** an ink fill with paper text. Hover goes to ink-strong. Primary is ink, never orange.
- **Close:** an 18px cross icon alone (aria-label "Close"), ink-3, ink on hover, padded 0.35rem. It is the only control without a word.

### Setting rows
Settings is a short list of rows set like the Guide's, in order: Text size (Small • Medium • Large), Preview (Continuous • Paged), Appearance (Light • Dark). Each row is a radio group with no box, no border and no cells.
- **Row:** the setting's name on the left in ink-2, the choices inline on the right, baseline-aligned, 1.5rem apart at least, with 0.6rem above and below. A 1px rule separates rows; the last has none.
- **Choices:** words in ink-2 (0.15em side padding), separated by a "•" in ink-3 with 0.5em either side, hidden from assistive tech (empty alt text on the generated content). The radio itself is visually hidden.
- **Hover:** the word previews the highlighter stroke in grey (hover) and goes to ink.
- **Chosen:** the word goes to ink and wears the Sunflower highlighter stroke, the same stroke as `==highlight==`.
- **Focus:** a 2px Orange outline at 2px offset around the word (2px corner).

### Highlighter
One shared stroke serves the serif text (`==highlight==` on the proof and in the Guide, and the settings choices): a band of colour 0.58em tall whose top sits 1px above the lowercase letters (0.576em below the top of Source Serif 4's 1.38em character box), with no corner. In the typescript the markdown is highlighted conventionally instead: a plain box exactly around the characters, 1px larger on each side. Each user sets only the stroke's colour: Sunflower for a highlight or a chosen word, grey for a hovered choice, transparent at rest. Never restyle the band per user; change its colour.

### Inputs / Fields
- **Filename field:** a 1px control-line box with a 3px corner, set in Courier Prime at 15px (16px under 800px to prevent iOS zoom). The `.md` extension is shown in ink-3 and is not selectable.
- **Focus:** a 2px Orange outline at 2px offset on the whole group.

### Panels
Settings, Download and Guide are one width (420px): paper panels hung 8px below the bar at the right, with a 1px desk-line border, a 3px corner and the panel shadow. The header holds an 18px title on the left and the Close icon on the right. Only one panel is open at a time; opening one closes the other. All three are modal: scrim, focus trap, Escape or a click outside to close, and focus returned to the trigger.

### Proof sheet (signature)
Paper with the sheet shadow, set in proof typography.
- **Section break:** an asterism, three ink-3 asterisks separated by em spaces, centred with 1.6em space above and below.
- **Lists:** unordered items use drawn ink-3 discs (0.3em, at 0.95em into the indent), not glyph bullets. Ordered markers are ink-3 oldstyle numerals.
- **Links:** text in ink with a 1px Orange underline at a 0.18em offset.
- **Highlight (`==text==`):** the Sunflower highlighter stroke (0.08em side padding) on the proof and in the Guide. In the typescript, a plain Sunflower box around the highlighted characters (not the `==` marks), 1px larger on each side, drawn on the ground layer beneath the selection. The welcome heading highlights "Carver". Printing uses the light Sunflower.
- **Blockquote:** italic ink-2 with a 1.6em indent and no rule. Emphasis inside a blockquote switches back to roman.
- **Code block:** Courier Prime at 0.86em on code-ground, padded 0.9em 1.1em, square.
- **Tables:** tabular lining numerals at 0.92em, rule hairlines between rows, and an ink rule under the header.
- **Folio:** centred oldstyle page number in ink-3 at 0.8em (paged mode only).

### Typescript
A CodeMirror surface on paper with a 68ch centred measure and 40vh of run-out at the bottom. The caret and selection are drawn on CodeMirror's own layers (`src/modules/proof-selection.js`) from its own geometry: the caret is a 2px Orange line at 80% of the line height, centred where CodeMirror places it, so it is the same on empty lines and beside text, blinking slowly (1.6s); a selection piece that covers one line grows to the full line height, so short and long selections look alike. The selection is the faint orange wash. The scrollbar is thin.

## Do's and Don'ts

### Do:
- **Do** keep Orange to the wordmark, caret, links, focus and the open action's icon (and, faintly, selected text), and Sunflower to highlights and choices.
- **Do** show chosen state with Sunflower under ink: the highlighter stroke under the chosen word in settings, a Bar Sunflower chip on bar actions and tabs.
- **Do** keep the masthead and phone toolbar one ink band above the scrim, with `theme-color` following it.
- **Do** give every action its plain word in Source Serif 4, with a 16px line icon (1.5 stroke, round caps) beside it on desktop and above it on phones.
- **Do** derive page geometry from the paper's mm dimensions (margin = 0.135 × paper width, foot 1.3×) in both previews.
- **Do** lay paged proofs out at full size and scale them with a transform.
- **Do** use the sheet shadow only on paper and the panel shadow only on floating panels.
- **Do** mark section breaks with the asterism and list items with drawn discs in ink-3.
- **Do** set each setting as a row: name left in ink-2, choices right with a • between, a rule between rows.
- **Do** switch the whole app with Appearance, and print light.

### Don't:
- **Don't** show an icon without its word. Close is the only exception, and it carries aria-label "Close".
- **Don't** show state with an underline, an inset rule, a border, a pill, a solid fill or bold text. The Sunflower highlight is the only state ground.
- **Don't** use the selection colour for chosen state, or Sunflower for selection.
- **Don't** put settings in bordered segmented controls, boxes or cells.
- **Don't** use the desk as the bar colour.
- **Don't** fill a button with Orange or Sunflower. Primary is ink.
- **Don't** round sheets, or round controls beyond 3px.
- **Don't** scale paged proofs with CSS zoom or re-wrap them to fit the window.
- **Don't** add a running head, stamp or label to the proof. Only the folio sits outside the text.
- **Don't** add a third ink, use fluorescent or neon colours, or add a second reading style.
