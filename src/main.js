import './style.css';
import markdownit from 'markdown-it';
import { DEMO_CONTENT } from './modules/demo.js';
import { loadSettings, saveSettings, applySettings, syncSettingsUI } from './modules/settings.js';
import { createEditor, updateEditorSettings } from './modules/editor.js';
import { getDefaultFilename, triggerDownload } from './modules/download.js';

// ── Markdown renderer ────────────────────────────────────
const md = markdownit({ linkify: true, typographer: true });

// ── State ────────────────────────────────────────────────
const CONTENT_KEY = 'carver-content';
let settings = loadSettings();
let saveTimeout = null;
let focusView = 'editor'; // 'editor' | 'preview'

// ── DOM refs ─────────────────────────────────────────────
const previewEl = document.getElementById('preview');
const settingsOverlay = document.getElementById('settings-overlay');
const settingsModal = document.getElementById('settings-modal');
const downloadOverlay = document.getElementById('download-overlay');
const downloadModal = document.getElementById('download-modal');
const labelEdit = document.getElementById('label-edit');
const labelPreview = document.getElementById('label-preview');

// ── Preview rendering ────────────────────────────────────
function renderPreview(content) {
  previewEl.innerHTML = md.render(content);
}

// ── Document persistence ─────────────────────────────────
function getInitialContent() {
  return localStorage.getItem(CONTENT_KEY) ?? DEMO_CONTENT;
}

function scheduleContentSave(content) {
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    try { localStorage.setItem(CONTENT_KEY, content); } catch {}
  }, 300);
}

// ── Editor setup ─────────────────────────────────────────
const initialContent = getInitialContent();
renderPreview(initialContent);

const editor = createEditor(
  document.getElementById('editor'),
  initialContent,
  (content) => {
    renderPreview(content);
    scheduleContentSave(content);
  }
);

// ── Synchronized scrolling ───────────────────────────────
let syncLock = null; // 'editor' | 'preview' | null
let syncLockTimer = null;

function acquireLock(source) {
  if (syncLock && syncLock !== source) return false;
  syncLock = source;
  clearTimeout(syncLockTimer);
  syncLockTimer = setTimeout(() => { syncLock = null; }, 400);
  return true;
}

function scrollFraction(el) {
  const max = el.scrollHeight - el.clientHeight;
  return max > 0 ? el.scrollTop / max : 0;
}

function applyFraction(el, fraction) {
  const max = el.scrollHeight - el.clientHeight;
  el.scrollTo({ top: fraction * max, behavior: 'smooth' });
}

editor.view.scrollDOM.addEventListener('scroll', () => {
  if (!settings.matchScroll || !acquireLock('editor')) return;
  applyFraction(previewEl, scrollFraction(editor.view.scrollDOM));
});

previewEl.addEventListener('scroll', () => {
  if (!settings.matchScroll || !acquireLock('preview')) return;
  applyFraction(editor.view.scrollDOM, scrollFraction(previewEl));
});

// ── Apply initial settings ───────────────────────────────
applySettings(settings);
syncSettingsUI(settings);
updateEditorSettings(editor, settings);

// ── Mobile / focus mode ──────────────────────────────────
function applyFocusMode() {
  if (settings.focusDesktop || window.innerWidth < 800) {
    document.body.classList.add('focus-mode');
  } else {
    document.body.classList.remove('focus-mode');
    document.body.classList.remove('show-preview');
    focusView = 'editor';
  }
  updateFocusLabels();
}

function updateFocusLabels() {
  labelEdit.classList.toggle('active', focusView === 'editor');
  labelPreview.classList.toggle('active', focusView === 'preview');
}

function switchFocusView(view) {
  focusView = view;
  document.body.classList.toggle('show-preview', focusView === 'preview');
  updateFocusLabels();
}

document.getElementById('focus-toggle').addEventListener('click', () =>
  switchFocusView(focusView === 'editor' ? 'preview' : 'editor'));

document.getElementById('label-edit').addEventListener('click', () => switchFocusView('editor'));
document.getElementById('label-preview').addEventListener('click', () => switchFocusView('preview'));

let resizeTimer = null;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(applyFocusMode, 100);
});
applyFocusMode();

// ── Focus trap helper ────────────────────────────────────
function trapFocus(modal, e) {
  const focusable = [...modal.querySelectorAll('select, input, button')];
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault(); last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault(); first.focus();
  }
}

// ── Settings modal ───────────────────────────────────────
function openSettings() {
  settingsOverlay.removeAttribute('hidden');
  settingsModal.removeAttribute('hidden');
  document.getElementById('settings-close').focus();
}

function closeSettings() {
  settingsOverlay.setAttribute('hidden', '');
  settingsModal.setAttribute('hidden', '');
  document.getElementById('settings-btn').focus();
}

document.getElementById('settings-btn').addEventListener('click', openSettings);
document.getElementById('settings-close').addEventListener('click', closeSettings);
settingsOverlay.addEventListener('click', closeSettings);

// Focus trap inside settings modal
settingsModal.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') { closeSettings(); return; }
  if (e.key === 'Tab') trapFocus(settingsModal, e);
});

// ── Settings change handlers ─────────────────────────────
function onSettingChange(key, value) {
  settings[key] = value;
  saveSettings(settings);
  applySettings(settings);
  updateEditorSettings(editor, settings);
  applyFocusMode();
}

document.getElementById('setting-editor-theme').addEventListener('change', e =>
  onSettingChange('editorTheme', e.target.value));

document.getElementById('setting-preview-theme').addEventListener('change', e =>
  onSettingChange('previewTheme', e.target.value));

document.getElementById('setting-caret').addEventListener('change', e =>
  onSettingChange('caret', e.target.value));

document.getElementById('setting-preview-font').addEventListener('change', e =>
  onSettingChange('previewFont', e.target.value));

document.getElementById('setting-tint').addEventListener('change', e =>
  onSettingChange('tint', e.target.value));

document.getElementById('setting-text-size').addEventListener('change', e =>
  onSettingChange('textSize', e.target.value));

document.getElementById('setting-focus-desktop').addEventListener('change', e =>
  onSettingChange('focusDesktop', e.target.checked));

document.getElementById('setting-match-scroll').addEventListener('change', e =>
  onSettingChange('matchScroll', e.target.checked));

// ── Upload ───────────────────────────────────────────────
const uploadInput = document.getElementById('upload-input');

document.getElementById('upload-btn').addEventListener('click', () => uploadInput.click());

uploadInput.addEventListener('change', () => {
  const file = uploadInput.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    const content = e.target.result;
    editor.view.dispatch({
      changes: { from: 0, to: editor.view.state.doc.length, insert: content },
    });
    renderPreview(content);
    scheduleContentSave(content);
  };
  reader.readAsText(file);
  uploadInput.value = '';
});

// ── Download modal ───────────────────────────────────────
function openDownload() {
  const content = editor.view.state.doc.toString();
  const defaultName = getDefaultFilename(content);
  const input = document.getElementById('download-filename');
  input.value = defaultName;
  downloadOverlay.removeAttribute('hidden');
  downloadModal.removeAttribute('hidden');
  input.focus();
  input.select();
}

function closeDownload() {
  downloadOverlay.setAttribute('hidden', '');
  downloadModal.setAttribute('hidden', '');
  document.getElementById('download-btn').focus();
}

function confirmDownload() {
  const filename = document.getElementById('download-filename').value.trim() || 'document';
  const content = editor.view.state.doc.toString();
  triggerDownload(filename, content);
  closeDownload();
}

document.getElementById('download-btn').addEventListener('click', openDownload);
document.getElementById('download-close').addEventListener('click', closeDownload);
document.getElementById('download-cancel').addEventListener('click', closeDownload);
document.getElementById('download-confirm').addEventListener('click', confirmDownload);
downloadOverlay.addEventListener('click', closeDownload);

// Focus trap inside download modal
downloadModal.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') { closeDownload(); return; }
  if (e.key === 'Enter' && document.activeElement === document.getElementById('download-filename')) {
    e.preventDefault();
    confirmDownload();
    return;
  }
  if (e.key === 'Tab') trapFocus(downloadModal, e);
});
