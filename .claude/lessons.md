# Lessons

## Verify what you claim, at the level you claim it
- "Print matches the screen" was checked only as a page count. Check the content: compare where each page starts and ends, at several window widths and in print.
- Anything laid out under CSS `zoom` (or at a size that depends on the window) can line-break differently at each size. Test layout-dependent features at three or more widths before calling them deterministic.

## Test in the user's browser engine
- The user browses in a Firefox-based browser; I tested only in Chrome, and missed a bug that only showed in Firefox. Run the e2e suite in both (Playwright's Firefox is installed; scratch config with a firefox project) and say which engine a check ran in.
- Never change a font's metrics (`ascent-override` etc.) to restyle a caret or selection. CodeMirror measures glyph boxes to find wrapped lines and draw selections; line-tall glyph boxes made Firefox draw no selection at all on wrapped paragraphs. Change how the thing is drawn (CodeMirror `layer` / `RectangleMarker`), not the font.

## Reviewer suggestions are not user decisions
- The finish reviewer's "let the desk show" narrowed the continuous sheet, and the user found it too narrow. A design reviewer's ceiling note is an option to raise with the user, not a fix to apply silently.

## Markdown behaviour writers expect
- Writers expect a single newline to be a line break (`breaks: true`). CommonMark's lazy continuation (a line under a list item joins the item) reads as a bug to them.

## Test the interactions, not only the layout
- Scaling the paged proof with a transform passed every layout check, but drag-selecting text in it was broken in Chrome (a side-padded scroll container around scaled content). After any change to how content is positioned or scaled, drag-select text and double-click a word in every mode before calling it done.
- A test locator that can match many elements (`#preview p`) fails instantly in strict mode instead of retrying; aim assertions at one element so they wait.
