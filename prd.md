# Markdown editor
Lightweight, privacy-first .md file editor with live preview and error highlighting.

## Layout
- Desktop-first layout with two vertical columns: left side for MD editing (monospace font) and right side for live preview.
- On mobile (sub 800px) "focus mode" is forced: only one column is visible at a time, with a floating top-bar to toggle between 'edit' and 'preview' modes. edit label on left, preview label on right, toggle button between them.
- The edit pane is IBM Plex Code monospace font with a blinking carat defaulting to line. it's extremely light on functionality, with no line numbers. text wraps to new lines. the carat is blue and slightly closer to neutral than the text colour. the highlight colour is blue and slightly closer to neutral than the background colour. (light mode and dark mode)
- The preview pane uses a modern serif font that pairs well with the monospace. It uses the same blue-tinted colour scheme, but with more nuance (e.g. primary and secondary text colours)
- Use a 16px base font size for both panels. the colour scheme is stark, using near-black and near-white and a subtle cool tint. Use an electric blue for page controls (vertical divider between panes, mobile toggle)
- Get both from the same family, e.g. IBM Plex Code and IBM Plex Sans.
- There's a fixed footer at the bottom with title and tagline on the left (name: give me a list of candidates for short, pronouncible names based on authors, early word processors, typewriter brands. for each one give a suggested tagline using themed language to communicate something like "the privacy-first writing tool").
- right hand side of the fixed footer has a settings button (icon label only). This brings up a modal with settings: editor theme (dropdown: dark/light), edior carat (dropdown: line, block, chevron, underscore), preview theme (dropdown: dark/light), preview font (dropdown: serif/sans-serif), tint (dropdown: cool/warm), text size (dropdown: small [base 14px], medium [base 16px], large [base 18px]), and an option to use focus mode on desktop (checkbox, forces mobile layout).
- settings save to the user browser, so on return it remembers their preferences.

## Behaviour
- On load, the page takes the light/dark mode preference from user browser and applies this to settings
- Preview live-updates instantly.
- In the editor, headings (have # prefix) are styled bold. text hidden from final view (e.g. link URLs) are in italics. This is also updated automatically.

## Considerations
- Should pass AA accessibility standards
- Should have tests to check key functionality
- Should be deployable via github pages workflow
- Should be privacy-first, with no data leaving the user's browser (to back-end or external APIs)
