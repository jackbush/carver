import { EditorView, RectangleMarker, layer } from '@codemirror/view';
import { EditorSelection, Prec } from '@codemirror/state';

// The typescript's caret and selection, drawn on CodeMirror's own layers with
// its own geometry. Two changes from the stock drawSelection:
//  - the caret is a fixed share of the line height, centred where CodeMirror
//    places it, so it's the same on an empty line as beside text;
//  - a selection piece that covers a single line grows to the full line
//    height, so a short selection fills the line like a long one does.
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

const selectionLayer = layer({
  above: false,
  class: 'cm-selectionLayer',
  markers(view) {
    const line = view.defaultLineHeight;
    const markers = [];
    for (const range of view.state.selection.ranges) {
      if (range.empty) continue;
      for (const marker of RectangleMarker.forRange(view, 'cm-selectionBackground', range)) {
        markers.push(marker.height < line ? centred(marker, line) : marker);
      }
    }
    return markers;
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
