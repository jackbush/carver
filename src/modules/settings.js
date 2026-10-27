const STORAGE_KEY = 'carver-settings';

// `theme` is null until the writer picks one; until then the system's appearance applies.
const DEFAULTS = {
  theme: null,
  textSize: 'medium',
  preview: 'continuous',
};

const TEXT_SIZE_MAP = { small: '14px', medium: '16px', large: '18px' };

// The settings dialog has one radio group per setting, named after its key.
const KEYS = Object.keys(DEFAULTS);

export function loadSettings() {
  let saved = {};
  try {
    saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {}
  // Keep only known keys so settings removed in older versions don't linger.
  const settings = { ...DEFAULTS };
  for (const key of Object.keys(DEFAULTS)) {
    if (key in saved) settings[key] = saved[key];
  }
  // A chosen paper size meant pages; the paper itself now follows the locale.
  if (saved.page === 'a4' || saved.page === 'letter') settings.preview = 'paged';
  return settings;
}

export function saveSettings(settings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {}
}

const darkQuery = typeof window.matchMedia === 'function' ? window.matchMedia('(prefers-color-scheme: dark)') : null;

export function resolveTheme(settings) {
  return settings.theme ?? (darkQuery?.matches ? 'dark' : 'light');
}

/** Calls back when the system appearance changes. */
export function onSystemThemeChange(handler) {
  darkQuery?.addEventListener('change', handler);
}

export function applySettings(settings) {
  const root = document.documentElement;
  root.setAttribute('data-theme', resolveTheme(settings));
  root.setAttribute('data-preview', settings.preview);
  root.style.setProperty('--base-size', TEXT_SIZE_MAP[settings.textSize] || '16px');
}

export function syncSettingsUI(settings) {
  const shown = { ...settings, theme: resolveTheme(settings) };
  for (const key of KEYS) {
    const input = document.querySelector(`input[name="${key}"][value="${shown[key]}"]`);
    if (input) input.checked = true;
  }
}

export function onSettingsInput(handler) {
  for (const key of KEYS) {
    for (const input of document.querySelectorAll(`input[name="${key}"]`)) {
      input.addEventListener('change', () => handler(key, input.value));
    }
  }
}
