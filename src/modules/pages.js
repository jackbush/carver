// Paper sizes in millimetres. CSS sizes, the print @page rule and the
// fit-to-width scale are all derived from these.
export const PAPER = {
  a4: { width: 210, height: 297 },
  letter: { width: 215.9, height: 279.4 },
};

// Margins as a share of the paper width; the foot margin is deeper to hold the folio.
export const MARGIN_RATIO = 0.135;
const FOOT_RATIO = 1.3;

// Regions that use US Letter; everywhere else uses A4.
const LETTER_REGIONS = new Set(['US', 'CA', 'MX', 'PH', 'CL', 'CO', 'VE', 'PR']);

/** Picks the paper the writer's locale uses, from the browser's preferred languages. */
export function paperForLocale(locales) {
  for (const tag of locales) {
    try {
      const region = new Intl.Locale(tag).maximize().region;
      if (region) return LETTER_REGIONS.has(region) ? 'letter' : 'a4';
    } catch {}
  }
  return 'a4';
}

const PX_PER_MM = 96 / 25.4;

export function paperWidthPx(paper) {
  return PAPER[paper].width * PX_PER_MM;
}

/** Sets the paper custom properties and the print @page rule. */
export function applyPaper(paper, paged, styleEl) {
  const root = document.documentElement;
  const { width, height } = PAPER[paper];
  root.style.setProperty('--paper-w', `${width}mm`);
  root.style.setProperty('--paper-h', `${height}mm`);
  root.style.setProperty('--margin-ratio', String(MARGIN_RATIO));
  root.style.setProperty('--foot-ratio', String(FOOT_RATIO));
  const margin = width * MARGIN_RATIO;
  // Paged proofs print the on-screen sheets as they are, so each sheet carries its own margins.
  styleEl.textContent = paged
    ? `@page { size: ${width}mm ${height}mm; margin: 0; }`
    : `@page { size: ${width}mm ${height}mm; margin: ${margin}mm ${margin}mm ${margin * FOOT_RATIO}mm; }`;
}

// Blocks a reader expects to see whole; they break only when taller than a page.
const KEEP_WHOLE = new Set(['PRE', 'BLOCKQUOTE', 'TABLE', 'FIGURE', 'HR']);

// Leave this much room at the foot of each page, so a printer that sets a line
// fractionally taller than the screen does still has room for it.
const FOOT_RESERVE_PX = 4;

/**
 * Lays rendered HTML out across fixed-height pages inside `container`.
 * Measure at full size: callers scale the result for display afterwards.
 * Paragraphs and lists split between lines, keeping at least two lines on
 * each side; tables split between rows; a heading left at the foot of a
 * page moves over with what follows it.
 */
export function paginate(container, html) {
  const source = document.createElement('div');
  source.innerHTML = html;
  container.replaceChildren();

  let pageNumber = 0;
  let body;
  const newPage = () => {
    pageNumber += 1;
    const page = document.createElement('section');
    page.className = 'sheet sheet--paged';
    page.setAttribute('aria-label', `Page ${pageNumber}`);
    body = document.createElement('div');
    body.className = 'sheet-body';
    const folio = document.createElement('div');
    folio.className = 'folio';
    folio.setAttribute('aria-hidden', 'true');
    folio.textContent = pageNumber;
    page.append(body, folio);
    container.append(page);
  };
  newPage();

  const queue = [...source.children];
  while (queue.length) {
    const el = queue.shift();
    body.append(el);
    const limit = body.getBoundingClientRect().bottom - FOOT_RESERVE_PX;
    if (el.getBoundingClientRect().bottom <= limit) continue;

    const alone = el === body.firstElementChild;
    const rest = alone || !KEEP_WHOLE.has(el.tagName) ? split(el, limit) : null;
    if (rest) {
      newPage();
      queue.unshift(rest);
    } else if (!alone) {
      // Start it on a fresh page, bringing any headings that introduce it.
      el.remove();
      const carried = [];
      while (isHeading(body.lastElementChild) && body.lastElementChild !== body.firstElementChild) {
        carried.unshift(body.lastElementChild);
        body.lastElementChild.remove();
      }
      newPage();
      body.append(...carried);
      queue.unshift(el);
    }
    // Otherwise it is alone on its page and cannot split; the page clips it.
  }
}

function isHeading(el) {
  return !!el && /^H[1-6]$/.test(el.tagName);
}

function split(el, limit) {
  if (isHeading(el) || el.tagName === 'HR') return null;
  if (el.tagName === 'TABLE') return splitTable(el, limit);
  return splitAtLine(el, limit);
}

/** Moves the rows that cross `limit` into a copy of the table with the same header. */
function splitTable(table, limit) {
  const rows = [...table.querySelectorAll(':scope > tbody > tr')];
  const first = rows.findIndex((row) => row.getBoundingClientRect().bottom > limit);
  if (first <= 0) return null;
  const rest = table.cloneNode(false);
  rest.classList.add('cont');
  const head = table.querySelector(':scope > thead');
  if (head) rest.append(head.cloneNode(true));
  const tbody = document.createElement('tbody');
  tbody.append(...rows.slice(first));
  rest.append(tbody);
  return rest;
}

/**
 * Splits `el` before the first line whose foot falls below `limit`.
 * `el` keeps what fits; the returned clone holds the rest. Returns null
 * when the split would leave fewer than two lines on either side.
 */
function splitAtLine(el, limit) {
  const chars = [];
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const text = node.data;
    for (let i = 0; i < text.length; i++) {
      if (!/\s/.test(text[i])) chars.push([node, i]);
    }
  }
  if (!chars.length) return null;

  const range = document.createRange();
  const rectOf = ([node, i]) => {
    range.setStart(node, i);
    range.setEnd(node, i + 1);
    return range.getBoundingClientRect();
  };
  const lineStart = (index) => {
    const top = rectOf(chars[index]).top;
    while (index > 0 && rectOf(chars[index - 1]).top >= top - 2) index -= 1;
    return index;
  };

  // First character whose line crosses the limit.
  let lo = 0;
  let hi = chars.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (rectOf(chars[mid]).bottom > limit + 0.5) hi = mid;
    else lo = mid + 1;
  }
  if (lo >= chars.length) return null;
  lo = lineStart(lo);

  // Keep at least two lines on each side of the break.
  const lineHeight = parseFloat(getComputedStyle(el).lineHeight) || rectOf(chars[lo]).height * 1.4;
  const firstTop = rectOf(chars[0]).top;
  const lastBottom = rectOf(chars[chars.length - 1]).bottom;
  const linesBefore = () => Math.round((rectOf(chars[lo]).top - firstTop) / lineHeight);
  const linesAfter = Math.round((lastBottom - rectOf(chars[lo]).top) / lineHeight);
  if (linesAfter < 2) {
    if (linesBefore() < 3) return null;
    lo = lineStart(lo - 1);
  }
  if (lo === 0 || linesBefore() < 2) return null;

  const [startNode, startOffset] = chars[lo];
  const chain = [];
  for (let n = startNode.parentElement; n !== el; n = n.parentElement) chain.unshift(n);
  chain.unshift(el);

  range.setStart(startNode, startOffset);
  range.setEnd(el, el.childNodes.length);
  const rest = el.cloneNode(false);
  rest.append(range.extractContents());

  // The clones along the split edge pair up with the originals in `chain`.
  // An original left empty by the split is dropped and its clone starts afresh;
  // otherwise the clone continues it (no new list marker, no top margin).
  const pairs = [];
  let clone = rest;
  for (const orig of chain) {
    if (!clone) break;
    pairs.push([orig, clone]);
    clone = clone.firstElementChild;
  }
  for (const [orig, copy] of pairs) {
    if (!orig.textContent.trim() && !orig.querySelector('img')) orig.remove();
    else copy.classList.add('cont');
  }
  // A continued item keeps its original's number, so a split <ol> resumes from there.
  for (const [orig, copy] of pairs) {
    if (orig.tagName !== 'OL') continue;
    const kept = orig.querySelectorAll(':scope > li').length;
    const firstContinues = copy.firstElementChild?.classList.contains('cont');
    copy.setAttribute('start', (orig.start || 1) + kept - (firstContinues ? 1 : 0));
  }
  return rest;
}
