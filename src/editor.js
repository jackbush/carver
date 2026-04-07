import { EditorView, keymap, drawSelection, placeholder } from '@codemirror/view';
import { EditorState, Compartment } from '@codemirror/state';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { markdown } from '@codemirror/lang-markdown';
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { tags } from '@lezer/highlight';

const themeCompartment = new Compartment();

function buildTheme(caret, isDark) {
  const caretStyle = {};
  if (caret === 'block') {
    caretStyle['&.cm-focused .cm-cursor'] = {
      borderLeft: 'none',
      background: 'var(--editor-caret)',
      width: '0.55em',
      opacity: '0.6',
    };
  } else if (caret === 'underscore') {
    caretStyle['&.cm-focused .cm-cursor'] = {
      borderLeft: 'none',
      borderBottom: '2.5px solid var(--editor-caret)',
      width: '0.6em',
    };
  }

  return EditorView.theme({
    '&': {
      height: '100%',
      background: 'var(--editor-bg)',
      color: 'var(--editor-text)',
    },
    '.cm-scroller': {
      fontFamily: "'IBM Plex Mono', monospace",
      lineHeight: '1.65',
      padding: '1.5rem 2rem',
    },
    '.cm-content': {
      caretColor: 'var(--editor-caret)',
    },
    '.cm-cursor': {
      borderLeftColor: 'var(--editor-caret)',
      borderLeftWidth: '2px',
    },
    '.cm-selectionBackground': {
      background: 'var(--editor-selection-bg) !important',
    },
    '.cm-focused .cm-selectionBackground': {
      background: 'var(--editor-selection-bg) !important',
    },
    '.cm-line': { padding: '0' },
    '&.cm-focused': { outline: 'none' },
    ...caretStyle,
  }, { dark: isDark });
}

const highlighting = syntaxHighlighting(HighlightStyle.define([
  { tag: tags.heading1, fontWeight: '700' },
  { tag: tags.heading2, fontWeight: '700' },
  { tag: tags.heading3, fontWeight: '700' },
  { tag: tags.heading4, fontWeight: '700' },
  { tag: tags.heading5, fontWeight: '700' },
  { tag: tags.heading6, fontWeight: '700' },
  // Markdown syntax chars dimmed — CSS var ensures AA contrast in all themes
  { tag: tags.processingInstruction, color: 'var(--editor-syntax-dim)' },
  { tag: tags.punctuation, color: 'var(--editor-syntax-dim)' },
  { tag: tags.meta, color: 'var(--editor-syntax-dim)' },
  { tag: tags.url, color: 'var(--editor-syntax-dim)', fontStyle: 'italic' },
]));

export function createEditor(container, content, onChange) {
  const initialTheme = buildTheme('line', true);

  const view = new EditorView({
    state: EditorState.create({
      doc: content,
      extensions: [
        history(),
        keymap.of([...defaultKeymap, ...historyKeymap]),
        EditorView.lineWrapping,
        drawSelection(),
        markdown(),
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

  return view;
}

export function updateEditorSettings(view, settings) {
  const isDark = settings.editorTheme === 'dark';
  const newTheme = buildTheme(settings.caret, isDark);
  view.dispatch({
    effects: themeCompartment.reconfigure(newTheme),
  });
}
