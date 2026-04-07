import './style.css';
import markdownit from 'markdown-it';
import { DEMO_CONTENT } from './demo.js';
import { loadSettings, saveSettings, applySettings, syncSettingsUI } from './settings.js';
import { createEditor, updateEditorSettings } from './editor.js';

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

document.getElementById('focus-toggle').addEventListener('click', () => {
  focusView = focusView === 'editor' ? 'preview' : 'editor';
  document.body.classList.toggle('show-preview', focusView === 'preview');
  updateFocusLabels();
});

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

// Focus trap inside modal
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
