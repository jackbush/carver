import { EditorView, RectangleMarker, keymap, layer } from '@codemirror/view';
import { EditorSelection, EditorState, Compartment } from '@codemirror/state';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { markdown } from '@codemirror/lang-markdown';
import { HighlightStyle, syntaxHighlighting, syntaxTree } from '@codemirror/language';
import { tags } from '@lezer/highlight';
import { proofSelection } from './proof-selection.js';

function buildTheme(isDark) {
  return EditorView.theme({
    '&': {
      height: '100%',
      background: 'var(--paper)',
      color: 'var(--ink)',
    },
    '.cm-scroller': {
      fontFamily: 'var(--font-typescript)',
      lineHeight: '1.7',
      padding: 'var(--editor-pad-block) var(--editor-pad-inline)',
    },
    '.cm-content': {
      maxWidth: '68ch',
      margin: '0 auto',
      paddingBottom: '40vh',
    },
    '.cm-cursor': {
      borderLeftColor: 'var(--red)',
      borderLeftWidth: '2px',
    },
    '.cm-selectionBackground': {
      background: 'var(--red-wash) !important',
    },
    '.cm-focused .cm-selectionBackground': {
      background: 'var(--red-wash) !important',
    },
    '.cm-line': { padding: '0' },
    '.cm-codeBlock, .cm-inlineCode': { background: 'var(--code-ground)' },
    '.cm-inlineCode': { borderRadius: '2px' },
    '.cm-highlight': { background: 'var(--highlighter)' },
    '&.cm-focused': { outline: 'none' },
  }, { dark: isDark });
}

const highlighting = syntaxHighlighting(HighlightStyle.define([
  { tag: tags.heading1, fontWeight: '700' },
  { tag: tags.heading2, fontWeight: '700' },
  { tag: tags.heading3, fontWeight: '700' },
  { tag: tags.heading4, fontWeight: '700' },
  { tag: tags.heading5, fontWeight: '700' },
  { tag: tags.heading6, fontWeight: '700' },
  { tag: tags.strong, fontWeight: '700' },
  { tag: tags.emphasis, fontStyle: 'italic' },
  { tag: tags.strikethrough, textDecoration: 'line-through' },
  // Markdown syntax chars dimmed — CSS var ensures AA contrast in all themes
  { tag: tags.processingInstruction, color: 'var(--syntax-dim)' },
  { tag: tags.punctuation, color: 'var(--syntax-dim)' },
  { tag: tags.meta, color: 'var(--syntax-dim)' },
  { tag: tags.url, color: 'var(--syntax-dim)', fontStyle: 'italic' },
]));

// ==Highlight== in the typescript, parsed like ~~strikethrough~~ (the proof
// renders it with markdown-it-mark).
const HighlightDelim = { resolve: 'Highlight', mark: 'HighlightMark' };
const PUNCTUATION = /[\p{P}\p{S}]/u;
const highlightSyntax = {
  defineNodes: [{ name: 'Highlight' }, { name: 'HighlightMark', style: tags.processingInstruction }],
  parseInline: [{
    name: 'Highlight',
    parse(cx, next, pos) {
      if (next !== 61 /* = */ || cx.char(pos + 1) !== 61 || cx.char(pos + 2) === 61) return -1;
      const before = cx.slice(pos - 1, pos);
      const after = cx.slice(pos + 2, pos + 3);
      const spaceBefore = /\s|^$/.test(before);
      const spaceAfter = /\s|^$/.test(after);
      const punctBefore = PUNCTUATION.test(before);
      const punctAfter = PUNCTUATION.test(after);
      return cx.addDelimiter(HighlightDelim, pos, pos + 2,
        !spaceAfter && (!punctAfter || spaceBefore || punctBefore),
        !spaceBefore && (!punctBefore || spaceAfter || punctAfter));
    },
    after: 'Emphasis',
  }],
};

// Code sits on the code ground: every line of a code block, fences included
// (so a block left unclosed visibly runs on to the end of the document), and
// each run of inline code. Highlighted text gets its band here too. Grounds
// are drawn on their own layer beneath the selection layer, so a selection
// stays visible over them.
function groundMarkers(view) {
  const content = view.contentDOM.getBoundingClientRect();
  const scroller = view.scrollDOM.getBoundingClientRect();
  const left = content.left - scroller.left + view.scrollDOM.scrollLeft;
  const top = view.documentTop - scroller.top + view.scrollDOM.scrollTop;
  const markers = [];
  const seen = new Set();
  for (const range of view.visibleRanges) {
    syntaxTree(view.state).iterate({
      from: range.from,
      to: range.to,
      enter(node) {
        if (node.name === 'Highlight') {
          // The band covers the words, not the == marks around them.
          const open = node.node.firstChild;
          const close = node.node.lastChild;
          const range = EditorSelection.range(open ? open.to : node.from, close ? close.from : node.to);
          if (!range.empty) markers.push(...RectangleMarker.forRange(view, 'cm-highlight', range));
          return;
        }
        if (node.name === 'InlineCode') {
          const range = EditorSelection.range(node.from, node.to);
          markers.push(...RectangleMarker.forRange(view, 'cm-inlineCode', range));
          return false;
        }
        if (node.name !== 'FencedCode' && node.name !== 'CodeBlock') return;
        if (!seen.has(node.from)) {
          seen.add(node.from);
          const first = view.lineBlockAt(node.from);
          const last = view.lineBlockAt(node.to);
          markers.push(new RectangleMarker('cm-codeBlock', left, top + first.top, content.width, last.bottom - first.top));
        }
        return false;
      },
    });
  }
  return markers;
}

const grounds = layer({
  above: false,
  class: 'cm-groundLayer',
  markers: groundMarkers,
  update(update) {
    return update.docChanged || update.viewportChanged || update.geometryChanged ||
      syntaxTree(update.state) !== syntaxTree(update.startState);
  },
});

export function createEditor(container, content, onChange) {
  const themeCompartment = new Compartment();
  const initialTheme = buildTheme(false);

  const view = new EditorView({
    state: EditorState.create({
      doc: content,
      extensions: [
        history(),
        keymap.of([...defaultKeymap, ...historyKeymap]),
        EditorView.lineWrapping,
        proofSelection(),
        // Registered after the selection: CodeMirror stacks later layers further back.
        grounds,
        markdown({ extensions: [highlightSyntax] }),
        highlighting,
        themeCompartment.of(initialTheme),
        EditorView.contentAttributes.of({ 'aria-label': 'Markdown editor', 'aria-multiline': 'true' }),
        EditorView.updateListener.of(update => {
          if (update.docChanged) onChange(update.state.doc.toString());
        }),
      ],
    }),
    parent: container,
  });

  return { view, themeCompartment };
}

export function updateEditorSettings({ view, themeCompartment }, settings) {
  const newTheme = buildTheme(document.documentElement.dataset.theme === 'dark');
  view.dispatch({
    effects: themeCompartment.reconfigure(newTheme),
  });
}
