const STORAGE_KEY = 'carver-settings';

const DEFAULTS = {
  editorTheme: 'dark',
  previewTheme: 'light',
  caret: 'line',
  previewFont: 'sans',
  tint: 'warm',
  textSize: 'medium',
  focusDesktop: false,
  matchScroll: true,
};

const TEXT_SIZE_MAP = { small: '14px', medium: '16px', large: '18px' };

export function loadSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    return { ...DEFAULTS, ...saved };
  } catch {
    return { ...DEFAULTS };
  }
}

export function saveSettings(settings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {}
}

export function applySettings(settings) {
  const root = document.documentElement;
  root.setAttribute('data-editor-theme', settings.editorTheme);
  root.setAttribute('data-preview-theme', settings.previewTheme);
  root.setAttribute('data-tint', settings.tint);
  root.setAttribute('data-preview-font', settings.previewFont);
  root.style.setProperty('--base-size', TEXT_SIZE_MAP[settings.textSize] || '16px');
}

export function syncSettingsUI(settings) {
  document.getElementById('setting-editor-theme').value = settings.editorTheme;
  document.getElementById('setting-preview-theme').value = settings.previewTheme;
  document.getElementById('setting-caret').value = settings.caret;
  document.getElementById('setting-preview-font').value = settings.previewFont;
  document.getElementById('setting-tint').value = settings.tint;
  document.getElementById('setting-text-size').value = settings.textSize;
  document.getElementById('setting-focus-desktop').checked = settings.focusDesktop;
  document.getElementById('setting-match-scroll').checked = settings.matchScroll;
}
