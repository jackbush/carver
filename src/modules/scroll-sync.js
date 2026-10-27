// Keeps the typescript and the proof at the same place in the document.
// Positions are matched by source line, not by scroll percentage: every
// rendered block carries `data-line` (its first source line), so a line in
// the typescript maps to the block it became, on whatever page it landed.

// The point in each viewport that is kept aligned, as a share of its height.
const READING_LINE = 0.25;

export function linkScroll(view, previewEl) {
  const scroller = view.scrollDOM;
  const expected = new Map(); // element -> scrollTop we set ourselves

  function write(el, top) {
    const max = el.scrollHeight - el.clientHeight;
    const next = Math.round(Math.max(0, Math.min(max, top)));
    if (Math.abs(el.scrollTop - next) < 1) return;
    expected.set(el, next);
    el.scrollTop = next;
  }

  // True when this scroll event was caused by our own write.
  function echoed(el) {
    if (!expected.has(el)) return false;
    const target = expected.get(el);
    expected.delete(el);
    return Math.abs(el.scrollTop - target) <= 1;
  }

  function atEdge(el) {
    if (el.scrollTop <= 0) return 'top';
    if (el.scrollTop >= el.scrollHeight - el.clientHeight - 1) return 'bottom';
    return null;
  }

  function toEdge(el, edge) {
    write(el, edge === 'top' ? 0 : el.scrollHeight);
  }

  // Each block's first source line and its offset within the proof's scroll content.
  function anchors() {
    const origin = previewEl.getBoundingClientRect().top - previewEl.scrollTop;
    return [...previewEl.querySelectorAll('[data-line]:not(.cont)')].map((el) => ({
      line: Number(el.dataset.line),
      y: el.getBoundingClientRect().top - origin,
    }));
  }

  // Interpolates between neighbouring anchors; `from`/`to` pick the axes.
  function interpolate(list, value, from, to, end) {
    let i = -1;
    for (let k = 0; k < list.length && list[k][from] <= value; k++) i = k;
    if (i < 0) return 0;
    const a = list[i];
    const b = list.slice(i + 1).find((n) => n[from] > a[from]) ?? end;
    const span = b[from] - a[from];
    return a[to] + (span > 0 ? (b[to] - a[to]) * (value - a[from]) / span : 0);
  }

  // Fractional, zero-based source line at the typescript's reading line.
  function editorLine() {
    const h = scroller.getBoundingClientRect().top + scroller.clientHeight * READING_LINE - view.documentTop;
    const block = view.lineBlockAtHeight(Math.max(0, h));
    const within = block.height ? Math.min(1, Math.max(0, (h - block.top) / block.height)) : 0;
    return view.state.doc.lineAt(block.from).number - 1 + within;
  }

  function scrollEditorToLine(line) {
    const doc = view.state.doc;
    const n = Math.min(doc.lines, Math.floor(line) + 1);
    const block = view.lineBlockAt(doc.line(n).from);
    const y = view.documentTop + block.top + (line - (n - 1)) * block.height;
    const readingLine = scroller.getBoundingClientRect().top + scroller.clientHeight * READING_LINE;
    write(scroller, scroller.scrollTop + y - readingLine);
  }

  function fromEditor() {
    const edge = atEdge(scroller);
    if (edge) return toEdge(previewEl, edge);
    const list = anchors();
    const end = { line: view.state.doc.lines, y: previewEl.scrollHeight };
    const y = interpolate(list, editorLine(), 'line', 'y', end);
    write(previewEl, y - previewEl.clientHeight * READING_LINE);
  }

  function fromPreview() {
    const edge = atEdge(previewEl);
    if (edge) return toEdge(scroller, edge);
    const list = anchors();
    const end = { line: view.state.doc.lines, y: previewEl.scrollHeight };
    const y = previewEl.scrollTop + previewEl.clientHeight * READING_LINE;
    scrollEditorToLine(interpolate(list, y, 'y', 'line', end));
  }

  scroller.addEventListener('scroll', () => {
    if (!echoed(scroller)) fromEditor();
  }, { passive: true });
  previewEl.addEventListener('scroll', () => {
    if (!echoed(previewEl)) fromPreview();
  }, { passive: true });

  return { fromEditor };
}
