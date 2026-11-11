// Links the typescript's selection and the proof, both ways: whatever is
// selected in the typescript is highlighted on the proof with the highlighter
// stroke, and a selection made on the proof selects its source. Every rendered
// block carries its first source line, so each block's markdown is known;
// aligning it with the block's rendered text, character by character, maps
// source positions to the text they became and back. The strokes are drawn on
// a layer behind the text in each sheet, so the proof's own DOM, and with it
// every page break, is left alone. Print hides the layer.

// Link destinations and reference labels never reach the rendered text, so
// they are masked out of the source before aligning.
const HIDDEN_SOURCE = /\]\((?:[^()]|\([^()]*\))*\)|\]\[[^\]]*\]/g;
const SPACE = /\s/;

/**
 * For each character of `rendered`, the index of the `source` character it
 * came from. Characters the renderer added (typographic quotes, dashes) map
 * to the next unmatched source position. The result never decreases.
 */
export function alignText(source, rendered) {
  const masked = source.replace(HIDDEN_SOURCE, (m) => ']' + '\0'.repeat(m.length - 1));
  const map = new Int32Array(rendered.length);
  let p = 0;
  for (let i = 0; i < rendered.length; i++) {
    const c = rendered[i];
    const space = SPACE.test(c);
    let j = p;
    while (j < masked.length && !(space ? SPACE.test(masked[j]) : masked[j] === c)) j++;
    if (j < masked.length) {
      map[i] = j;
      p = j + 1;
    } else {
      map[i] = p;
    }
  }
  return map;
}

// First index in the sorted `map` whose value is at least `value`.
function lowerBound(map, value) {
  let lo = 0;
  let hi = map.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (map[mid] < value) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

// The proof's top-level blocks, each with its source range and its text nodes.
// A block split across pages appears as several elements with the same line.
function sourceBlocks(proofEl, source) {
  const lineStarts = [0];
  for (let i = source.indexOf('\n'); i !== -1; i = source.indexOf('\n', i + 1)) lineStarts.push(i + 1);

  const groups = [];
  for (const el of proofEl.querySelectorAll('.sheet-body > [data-line]')) {
    const line = Number(el.dataset.line);
    const last = groups[groups.length - 1];
    if (last && last.line === line) last.elements.push(el);
    else groups.push({ line, elements: [el] });
  }

  return groups.map((group, i) => ({
    ...group,
    from: lineStarts[group.line] ?? source.length,
    to: i + 1 < groups.length ? lineStarts[groups[i + 1].line] ?? source.length : source.length,
  }));
}

// A block's text nodes and alignment, kept until the proof is next rendered.
const alignments = new WeakMap();

function alignmentOf(block, source) {
  let entry = alignments.get(block.elements[0]);
  if (entry) return entry;
  const nodes = [];
  let rendered = '';
  for (const el of block.elements) {
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      nodes.push({ node, start: rendered.length });
      rendered += node.data;
    }
  }
  entry = { nodes, map: alignText(source.slice(block.from, block.to), rendered) };
  alignments.set(block.elements[0], entry);
  return entry;
}

// The client rects of the rendered text in [start, end), with the sheet each
// lies on. Each run of non-space characters is measured on its own, so the
// space where a line wraps isn't marked; `lines` bridges the spaces between words.
function rectsFor({ nodes }, start, end) {
  const out = [];
  const range = document.createRange();
  const word = /\S+/g;
  for (const { node, start: at } of nodes) {
    const a = Math.max(start, at);
    const b = Math.min(end, at + node.data.length);
    if (a >= b) continue;
    const sheet = node.parentElement.closest('.sheet');
    const fontSize = parseFloat(getComputedStyle(node.parentElement).fontSize);
    const text = node.data.slice(a - at, b - at);
    for (const m of text.matchAll(word)) {
      range.setStart(node, a - at + m.index);
      range.setEnd(node, a - at + m.index + m[0].length);
      for (const rect of range.getClientRects()) {
        if (rect.width >= 0.5) out.push({ sheet, rect, fontSize });
      }
    }
  }
  return out;
}

// Pieces on the same line of the same sheet become one stroke, so neighbouring
// words in different styles don't overlap. The tallest piece (the serif text,
// not inline code) sets where the stroke sits.
function lines(pieces, scaleOf) {
  const out = [];
  for (const piece of pieces.sort((a, b) => a.rect.top - b.rect.top || a.rect.left - b.rect.left)) {
    const { sheet, rect } = piece;
    const gap = piece.fontSize * 0.6 * scaleOf(sheet);
    // Lines are found in order down the proof, so only the last few can hold this piece.
    let line = null;
    for (let i = out.length - 1; i >= 0 && out[i].top > rect.top - 3 * rect.height; i--) {
      const l = out[i];
      if (l.sheet === sheet && rect.top < l.bottom && rect.bottom > l.top &&
        rect.left <= l.right + gap && rect.right >= l.left - gap) {
        line = l;
        break;
      }
    }
    if (!line) {
      out.push({ ...piece, top: rect.top, bottom: rect.bottom, left: rect.left, right: rect.right });
      continue;
    }
    line.left = Math.min(line.left, rect.left);
    line.right = Math.max(line.right, rect.right);
    if (rect.height > line.bottom - line.top) {
      line.top = rect.top;
      line.bottom = rect.bottom;
      line.fontSize = piece.fontSize;
    }
  }
  return out;
}

// The block a DOM node lies in, if any.
function blockAt(blocks, node) {
  const el = (node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement)?.closest('.sheet-body > [data-line]');
  return el ? blocks.find((block) => block.elements.includes(el)) : null;
}

// Where a DOM point on the proof falls in the source. An `end` point maps to
// just after the character before it, so a selection ending on a word stops
// before any markdown that closes it. A point outside the text (a margin, a
// folio) maps to the start of the next block.
function sourceAt(blocks, source, container, offset, end) {
  const point = document.createRange();
  point.setStart(container, offset);
  const block = blockAt(blocks, container);
  if (!block) return blocks.find((b) => point.comparePoint(b.elements[0], 0) >= 0)?.from ?? source.length;

  const { nodes, map } = alignmentOf(block, source);
  const hit = nodes.find((n) => n.node === container) ?? nodes.find((n) => point.comparePoint(n.node, 0) >= 0);
  const i = !hit ? map.length : hit.node === container ? hit.start + offset : hit.start;
  if (end) return block.from + (i > 0 ? map[i - 1] + 1 : 0);
  return i < map.length ? block.from + map[i] : block.to;
}

/**
 * The source selection ({anchor, head}) behind the DOM `selection` when it
 * starts on the proof rendered from `source`, or null when it doesn't.
 */
export function sourceSelection(proofEl, source, selection) {
  if (!selection.rangeCount || !proofEl.contains(selection.anchorNode)) return null;
  const range = selection.getRangeAt(0);
  const blocks = sourceBlocks(proofEl, source);
  const from = sourceAt(blocks, source, range.startContainer, range.startOffset, false);
  const to = range.collapsed ? from : Math.max(from, sourceAt(blocks, source, range.endContainer, range.endOffset, true));
  const backward = !range.collapsed &&
    selection.anchorNode === range.endContainer && selection.anchorOffset === range.endOffset;
  return backward ? { anchor: to, head: from } : { anchor: from, head: to };
}

/** Draws the highlight for the source `ranges` ({from, to}) over a proof rendered from `source`. */
export function highlightSelection(proofEl, source, ranges) {
  for (const layer of proofEl.querySelectorAll('.proof-marks')) layer.remove();
  const selected = ranges.filter((r) => r.from < r.to);
  if (!selected.length) return;

  const pieces = [];
  for (const block of sourceBlocks(proofEl, source)) {
    for (const { from, to } of selected) {
      if (to <= block.from || from >= block.to) continue;
      const alignment = alignmentOf(block, source);
      const start = lowerBound(alignment.map, from - block.from);
      const end = lowerBound(alignment.map, to - block.from);
      if (start < end) pieces.push(...rectsFor(alignment, start, end));
    }
  }

  // Sheets may be scaled for display; their layers are laid out at full size.
  const boxes = new Map();
  const boxOf = (sheet) => {
    if (!boxes.has(sheet)) {
      const box = sheet.getBoundingClientRect();
      boxes.set(sheet, { box, scale: box.width / sheet.offsetWidth });
    }
    return boxes.get(sheet);
  };

  const layers = new Map();
  for (const line of lines(pieces, (sheet) => boxOf(sheet).scale)) {
    const { sheet } = line;
    const { box, scale } = boxOf(sheet);
    let layer = layers.get(sheet);
    if (!layer) {
      layer = document.createElement('div');
      layer.className = 'proof-marks';
      layer.setAttribute('aria-hidden', 'true');
      layers.set(sheet, layer);
    }
    const mark = document.createElement('div');
    mark.className = 'proof-mark';
    mark.style.cssText = `left:${(line.left - box.left) / scale}px;top:${(line.top - box.top) / scale}px;` +
      `width:${(line.right - line.left) / scale}px;height:${(line.bottom - line.top) / scale}px;font-size:${line.fontSize}px`;
    layer.append(mark);
  }
  // Added once everything is measured, so the proof is laid out only once.
  for (const [sheet, layer] of layers) sheet.prepend(layer);
}
