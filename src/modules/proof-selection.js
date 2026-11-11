import { EditorView, RectangleMarker, layer } from '@codemirror/view';
import { EditorSelection, Prec } from '@codemirror/state';

// The typescript's caret and selection, drawn on CodeMirror's own layers with
// its own geometry. Two changes from the stock drawSelection:
//  - the caret is a fixed share of the line height, centred where CodeMirror
//    places it, so it's the same on an empty line as beside text;
//  - a selection fills whole lines, so a short selection fills the line like a
//    long one does, and the rows of a longer one meet without overlapping.
// The layers reuse CodeMirror's class names, so its base theme still handles
// focus, stacking and the blink keyframes.

const CARET_SHARE = 0.8;
const BLINK_MS = 1600;

function centred(marker, height) {
  const middle = marker.top + marker.height / 2;
  return new RectangleMarker(marker.className, marker.left, middle - height / 2, marker.width, height);
}

const cursorLayer = layer({
  above: true,
  class: 'cm-cursorLayer',
  markers(view) {
    const { main } = view.state.selection;
    const caret = EditorSelection.cursor(main.head, main.assoc);
    const height = view.defaultLineHeight * CARET_SHARE;
    return RectangleMarker.forRange(view, 'cm-cursor cm-cursor-primary', caret)
      .map((marker) => centred(marker, height));
  },
  update(update, dom) {
    // Restart the blink whenever the caret moves, so it shows while typing.
    if (update.transactions.some((tr) => tr.selection)) {
      dom.style.animationName = dom.style.animationName === 'cm-blink' ? 'cm-blink2' : 'cm-blink';
    }
    return update.docChanged || update.selectionSet || update.geometryChanged;
  },
  mount(dom) {
    dom.style.animationDuration = `${BLINK_MS}ms`;
  },
});

// CodeMirror draws a selection as a first row, a block between and a last row,
// meeting at the text's edges, not the line's. Grow the outer edges by the
// line's leading so they cover the full line, and shift the inner edges by the
// same amount so the pieces still meet without overlapping. When the rows are
// adjacent CodeMirror already meets them halfway, on the line boundary.
function fullLines(view, range, line) {
  const pieces = RectangleMarker.forRange(view, 'cm-selectionBackground', range);
  if (!pieces.length) return pieces;
  const first = pieces[0].top;
  const last = pieces[pieces.length - 1].top;
  if (first === last) return pieces.map((m) => (m.height < line ? centred(m, line) : m));
  const glyph = view.coordsAtPos(range.from, 1);
  const lead = glyph ? Math.max(0, (line - (glyph.bottom - glyph.top)) / 2) : 0;
  const between = pieces.some((m) => m.top !== first && m.top !== last);
  return pieces.map((m) => {
    let top = m.top, bottom = m.top + m.height;
    if (m.top === first) {
      top -= lead;
      if (between) bottom += lead;
    } else if (m.top === last) {
      if (between) top -= lead;
      bottom += lead;
    } else {
      top += lead;
      bottom -= lead;
    }
    return new RectangleMarker(m.className, m.left, top, m.width, bottom - top);
  });
}

const selectionLayer = layer({
  above: false,
  class: 'cm-selectionLayer',
  markers(view) {
    const line = view.defaultLineHeight;
    return view.state.selection.ranges
      .filter((range) => !range.empty)
      .flatMap((range) => fullLines(view, range, line));
  },
  update(update) {
    return update.docChanged || update.selectionSet || update.viewportChanged || update.geometryChanged;
  },
});

// With the selection drawn on a layer, the browser's own selection and caret stay hidden.
const hideNativeSelection = Prec.highest(EditorView.theme({
  '.cm-line': {
    '& ::selection, &::selection': { backgroundColor: 'transparent !important' },
    caretColor: 'transparent !important',
  },
  '.cm-content': { caretColor: 'transparent !important' },
}));

export function proofSelection() {
  return [cursorLayer, selectionLayer, hideNativeSelection];
}
