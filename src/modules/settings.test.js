import { describe, it, expect, beforeEach } from 'vitest';
import { loadSettings, saveSettings, applySettings, resolveTheme } from './settings.js';

const STORAGE_KEY = 'carver-settings';

beforeEach(() => {
  localStorage.clear();
});

describe('loadSettings()', () => {
  it('returns correct defaults when localStorage is empty', () => {
    const settings = loadSettings();
    expect(settings.theme).toBe(null);
    expect(settings.textSize).toBe('medium');
    expect(settings.preview).toBe('continuous');
  });

  it('drops settings that no longer exist', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ tint: 'cool', caret: 'block', editorTheme: 'dark', matchScroll: false }));
    const settings = loadSettings();
    expect(settings).not.toHaveProperty('matchScroll');
    expect(settings).not.toHaveProperty('tint');
    expect(settings).not.toHaveProperty('caret');
    expect(settings).not.toHaveProperty('editorTheme');
  });

  it('turns a saved paper size into the paged preview', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ page: 'letter' }));
    const settings = loadSettings();
    expect(settings.preview).toBe('paged');
    expect(settings).not.toHaveProperty('page');
  });

  it('falls back to defaults when stored JSON is corrupt', () => {
    localStorage.setItem(STORAGE_KEY, '{not json');
    expect(loadSettings().preview).toBe('continuous');
  });
});

describe('resolveTheme()', () => {
  it('follows the system until the writer picks a theme', () => {
    // jsdom has no prefers-color-scheme, so the system reads as light
    expect(resolveTheme({ theme: null })).toBe('light');
    expect(resolveTheme({ theme: 'dark' })).toBe('dark');
  });

  it('keeps following the system when nothing was chosen and settings are saved', () => {
    saveSettings({ ...loadSettings(), textSize: 'large' });
    expect(loadSettings().theme).toBe(null);
  });
});

describe('saveSettings() + loadSettings() round-trip', () => {
  it('persists and restores all settings correctly', () => {
    const original = {
      theme: 'dark',
      textSize: 'large',
      preview: 'paged',
    };

    saveSettings(original);
    expect(loadSettings()).toEqual(original);
  });
});

describe('applySettings()', () => {
  const baseSettings = {
    theme: null,
    textSize: 'medium',
    preview: 'continuous',
  };

  it('sets --base-size to 14px for textSize small', () => {
    applySettings({ ...baseSettings, textSize: 'small' });
    expect(document.documentElement.style.getPropertyValue('--base-size')).toBe('14px');
  });

  it('sets --base-size to 18px for textSize large', () => {
    applySettings({ ...baseSettings, textSize: 'large' });
    expect(document.documentElement.style.getPropertyValue('--base-size')).toBe('18px');
  });

  it('sets data-theme attribute on documentElement', () => {
    applySettings({ ...baseSettings, theme: 'dark' });
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('sets data-preview attribute on documentElement', () => {
    applySettings({ ...baseSettings, preview: 'paged' });
    expect(document.documentElement.getAttribute('data-preview')).toBe('paged');
  });
});
