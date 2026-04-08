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
const focusBar = document.getElementById('focus-bar');
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

const editorView = createEditor(
  document.getElementById('editor'),
  initialContent,
  (content) => {
    renderPreview(content);
    scheduleContentSave(content);
  }
);

// ── Apply initial settings ───────────────────────────────
applySettings(settings);
syncSettingsUI(settings);
updateEditorSettings(editorView, settings);

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

window.addEventListener('resize', applyFocusMode);
applyFocusMode();

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
  if (e.key !== 'Tab') return;
  const focusable = [...settingsModal.querySelectorAll('select, input, button')];
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault(); last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault(); first.focus();
  }
});

// ── Settings change handlers ─────────────────────────────
function onSettingChange(key, value) {
  settings[key] = value;
  saveSettings(settings);
  applySettings(settings);
  updateEditorSettings(editorView, settings);
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

// ── Download modal ───────────────────────────────────────
function openDownload() {
  const content = editorView.state.doc.toString();
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
  const content = editorView.state.doc.toString();
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
  if (e.key !== 'Tab') return;
  const focusable = [...downloadModal.querySelectorAll('input, button')];
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault(); last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault(); first.focus();
  }
});
