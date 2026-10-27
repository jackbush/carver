import './style.css';
import markdownit from 'markdown-it';
import markdownitMark from 'markdown-it-mark';
import { loadSettings, saveSettings, applySettings, syncSettingsUI, onSettingsInput, onSystemThemeChange } from './modules/settings.js';
import { createEditor, updateEditorSettings } from './modules/editor.js';
import { getDefaultFilename, triggerDownload } from './modules/download.js';
import { MARGIN_RATIO, applyPaper, paginate, paperForLocale, paperWidthPx } from './modules/pages.js';
import { linkScroll } from './modules/scroll-sync.js';
import { countWords, formatWordCount } from './modules/words.js';

// ── Markdown renderer ────────────────────────────────────
// A single newline is a line break: writers expect what they type to be what they see.
const md = markdownit({ linkify: true, typographer: true, breaks: true }).use(markdownitMark);

// Tag every block with its first source line, so scrolling can match the
// typescript to the proof by content.
md.core.ruler.push('source_line', (state) => {
  for (const token of state.tokens) {
    if (token.block && token.map && token.nesting >= 0) token.attrSet('data-line', String(token.map[0]));
  }
});

// ── State ────────────────────────────────────────────────
const CONTENT_KEY = 'carver-content';
const SINGLE_PANE_BELOW = 800;
let settings = loadSettings();
let saveTimeout = null;
let view = 'write'; // 'write' | 'proof', when only one side fits
const paper = paperForLocale(navigator.languages ?? [navigator.language]);

// ── DOM refs ─────────────────────────────────────────────
const previewEl = document.getElementById('preview');
const proofFrame = document.getElementById('proof-frame');
const proofEl = document.getElementById('proof');
const wordCountEl = document.getElementById('word-count');
const pageRuleEl = document.getElementById('page-rule');
const tabWrite = document.getElementById('tab-write');
const tabProof = document.getElementById('tab-proof');

// ── Proof rendering ──────────────────────────────────────
let latestContent = '';
let renderFrame = null;

function isPaged() {
  return settings.preview === 'paged';
}

function renderProof() {
  renderFrame = null;
  const html = md.render(latestContent);

  const template = document.createElement('template');
  template.innerHTML = html;
  wordCountEl.textContent = formatWordCount(countWords(template.content.textContent));

  if (isPaged()) {
    // Lay pages out at full size, then scale the finished pages for display.
    // Scaling with a transform never re-wraps the text, so the breaks are the
    // same at every window size and in print.
    proofEl.style.transform = '';
    paginate(proofEl, html);
    fitPages();
  } else {
    clearFit();
    proofEl.innerHTML = `<article class="sheet sheet--continuous"><div class="sheet-body">${html}</div></article>`;
  }

  // Images change the layout once they load, so lay the pages out again.
  for (const img of proofEl.querySelectorAll('img')) {
    if (!img.complete) img.addEventListener('load', scheduleRender, { once: true });
  }
}

// Coalesce bursts of keystrokes into one layout per frame.
function scheduleRender() {
  if (renderFrame === null) renderFrame = requestAnimationFrame(renderProof);
}

function setContent(content) {
  latestContent = content;
  scheduleRender();
}

// Scales the laid-out pages to the desk. On a wide desk the whole sheet fits;
// on a phone the text column fills the screen and most of the margin is cropped,
// so the type stays large enough to proof.
const PHONE_MARGIN_KEPT_PX = 12;

function fitPages() {
  // The frame's own width (the desk minus its gutters) is the room available.
  proofFrame.style.width = '';
  const available = proofFrame.clientWidth;
  const sheetWidth = paperWidthPx(paper);
  let scale = Math.min(1, available / sheetWidth);
  let crop = 0;
  if (document.body.classList.contains('single-pane')) {
    crop = sheetWidth * MARGIN_RATIO - PHONE_MARGIN_KEPT_PX;
    scale = available / (sheetWidth - 2 * crop);
  }
  proofEl.style.transform = `translateX(${-crop * scale}px) scale(${scale})`;
  proofFrame.style.width = `${(sheetWidth - 2 * crop) * scale}px`;
  proofFrame.style.height = `${proofEl.offsetHeight * scale}px`;
}

function clearFit() {
  proofEl.style.transform = '';
  proofFrame.style.width = '';
  proofFrame.style.height = '';
}

// ── Document persistence ─────────────────────────────────
function scheduleContentSave(content) {
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    try { localStorage.setItem(CONTENT_KEY, content); } catch {}
  }, 300);
}

async function getInitialContent() {
  const saved = localStorage.getItem(CONTENT_KEY);
  if (saved !== null && saved.trim() !== '') return saved;
  try {
    const res = await fetch(import.meta.env.BASE_URL + 'demo.md');
    return await res.text();
  } catch {
    return '';
  }
}

// ── Apply initial settings ───────────────────────────────
const themeColorMeta = document.querySelector('meta[name="theme-color"]');

function applyAll() {
  applySettings(settings);
  themeColorMeta.content = getComputedStyle(document.getElementById('masthead')).backgroundColor;
}

applyAll();
applyPaper(paper, isPaged(), pageRuleEl);
syncSettingsUI(settings);

// ── Editor setup ─────────────────────────────────────────
const initialContent = await getInitialContent();
setContent(initialContent);

const editor = createEditor(
  document.getElementById('editor'),
  initialContent,
  (content) => {
    setContent(content);
    scheduleContentSave(content);
  }
);
updateEditorSettings(editor, settings);

// Page breaks depend on the real faces' metrics.
document.fonts.ready.then(scheduleRender);

// ── Synchronized scrolling ───────────────────────────────
const scrollSync = linkScroll(editor.view, previewEl);

// ── Single pane (narrow screens) ─────────────────────────
function applyLayout() {
  const single = window.innerWidth < SINGLE_PANE_BELOW;
  document.body.classList.toggle('single-pane', single);
  if (!single) switchView('write');
}

function switchView(next) {
  view = next;
  document.body.classList.toggle('show-proof', view === 'proof');
  tabWrite.setAttribute('aria-selected', String(view === 'write'));
  tabProof.setAttribute('aria-selected', String(view === 'proof'));
  tabWrite.tabIndex = view === 'write' ? 0 : -1;
  tabProof.tabIndex = view === 'proof' ? 0 : -1;
  if (view === 'proof') {
    // A hidden proof can't be measured, so lay it out now it shows, then bring it to the writer's place.
    if (isPaged()) renderProof();
    scrollSync.fromEditor();
  }
}

tabWrite.addEventListener('click', () => switchView('write'));
tabProof.addEventListener('click', () => switchView('proof'));
document.getElementById('view-tabs').addEventListener('keydown', (e) => {
  if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
  switchView(view === 'write' ? 'proof' : 'write');
  (view === 'write' ? tabWrite : tabProof).focus();
});

let resizeTimer = null;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    applyLayout();
    if (isPaged()) fitPages();
  }, 100);
});
applyLayout();

// ── Print ────────────────────────────────────────────────
// print() blocks the page, so let the closed panel paint first: the first
// frame applies the change, the second runs after it has been drawn.
document.getElementById('print-btn').addEventListener('click', () => {
  closeOpenPanel();
  requestAnimationFrame(() => requestAnimationFrame(() => window.print()));
});

// ── Dialogs ──────────────────────────────────────────────
function trapFocus(modal, e) {
  const focusable = [...modal.querySelectorAll('input:not([type="radio"]), input[type="radio"]:checked, button')]
    .filter((el) => !el.hidden && el.type !== 'file');
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault(); last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault(); first.focus();
  }
}

// Panels dim the page and hold focus until closed (Close, Escape, or a click
// outside). Only one is open at a time; opening one closes the other.
let openPanel = null;

function closeOpenPanel() {
  openPanel?.close({ restoreFocus: false });
}

function setupDialog(name, { trigger, onOpen, initialFocus }) {
  const overlay = document.getElementById(`${name}-overlay`);
  const modal = document.getElementById(`${name}-modal`);
  const triggerEl = document.getElementById(trigger);

  const panel = {
    open() {
      closeOpenPanel();
      openPanel = panel;
      overlay.hidden = false;
      modal.hidden = false;
      triggerEl.setAttribute('aria-expanded', 'true');
      onOpen?.();
      document.getElementById(initialFocus).focus();
    },
    close({ restoreFocus = true } = {}) {
      if (openPanel === panel) openPanel = null;
      overlay.hidden = true;
      modal.hidden = true;
      triggerEl.setAttribute('aria-expanded', 'false');
      if (restoreFocus) triggerEl.focus();
    },
  };

  triggerEl.setAttribute('aria-expanded', 'false');
  triggerEl.addEventListener('click', () => (modal.hidden ? panel.open() : panel.close()));
  document.getElementById(`${name}-close`).addEventListener('click', () => panel.close());
  overlay.addEventListener('click', () => panel.close());
  modal.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') panel.close();
    else if (e.key === 'Tab') trapFocus(modal, e);
  });
  return panel;
}

// ── Settings ─────────────────────────────────────────────
onSystemThemeChange(() => {
  if (settings.theme !== null) return;
  applyAll();
  syncSettingsUI(settings);
  updateEditorSettings(editor, settings);
});

setupDialog('settings', { trigger: 'settings-btn', initialFocus: 'settings-close' });

onSettingsInput((key, value) => {
  settings[key] = value;
  saveSettings(settings);
  applyAll();
  updateEditorSettings(editor, settings);
  if (key === 'preview') applyPaper(paper, isPaged(), pageRuleEl);
  if (key === 'preview' || key === 'textSize') scheduleRender();
});

// ── Open ─────────────────────────────────────────────────
const uploadInput = document.getElementById('upload-input');

document.getElementById('upload-btn').addEventListener('click', () => {
  closeOpenPanel();
  uploadInput.click();
});

uploadInput.addEventListener('change', () => {
  const file = uploadInput.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    const content = e.target.result;
    editor.view.dispatch({
      changes: { from: 0, to: editor.view.state.doc.length, insert: content },
    });
  };
  reader.readAsText(file);
  uploadInput.value = '';
});

// ── Download ─────────────────────────────────────────────
const filenameInput = document.getElementById('download-filename');

const saveDialog = setupDialog('download', {
  trigger: 'download-btn',
  initialFocus: 'download-filename',
  onOpen: () => {
    filenameInput.value = getDefaultFilename(editor.view.state.doc.toString());
    requestAnimationFrame(() => filenameInput.select());
  },
});

function confirmDownload() {
  const filename = filenameInput.value.trim() || 'document';
  triggerDownload(filename, editor.view.state.doc.toString());
  saveDialog.close();
}

document.getElementById('download-cancel').addEventListener('click', () => saveDialog.close());
document.getElementById('download-confirm').addEventListener('click', confirmDownload);
filenameInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    confirmDownload();
  }
});

// ── Guide ────────────────────────────────────────────────
setupDialog('help', { trigger: 'help-btn', initialFocus: 'help-close' });
