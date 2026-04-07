import { describe, it, expect, beforeEach, vi } from 'vitest';
import { loadSettings, saveSettings, applySettings } from './settings.js';

const STORAGE_KEY = 'carver-settings';

function mockMatchMedia(prefersDark) {
  window.matchMedia = vi.fn((query) => ({
    matches: prefersDark && query === '(prefers-color-scheme: dark)',
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

beforeEach(() => {
  localStorage.clear();
  mockMatchMedia(false);
});

describe('loadSettings()', () => {
  it('returns correct defaults when localStorage is empty', () => {
    const settings = loadSettings();
    expect(settings.tint).toBe('cool');
    expect(settings.textSize).toBe('medium');
    expect(settings.caret).toBe('line');
    expect(settings.previewFont).toBe('sans');
    expect(settings.focusDesktop).toBe(false);
  });

  it('defaults themes to light when prefers-color-scheme does not match dark', () => {
    mockMatchMedia(false);
    const settings = loadSettings();
    expect(settings.editorTheme).toBe('light');
    expect(settings.previewTheme).toBe('light');
  });

  it('defaults themes to dark when prefers-color-scheme: dark is matched', () => {
    mockMatchMedia(true);
    const settings = loadSettings();
    expect(settings.editorTheme).toBe('dark');
    expect(settings.previewTheme).toBe('dark');
  });
});

describe('saveSettings() + loadSettings() round-trip', () => {
  it('persists and restores all settings correctly', () => {
    const original = {
      editorTheme: 'light',
      previewTheme: 'light',
      caret: 'block',
      previewFont: 'serif',
      tint: 'warm',
      textSize: 'large',
      focusDesktop: true,
    };

    saveSettings(original);
    const restored = loadSettings();

    expect(restored.editorTheme).toBe('light');
    expect(restored.previewTheme).toBe('light');
    expect(restored.caret).toBe('block');
    expect(restored.previewFont).toBe('serif');
    expect(restored.tint).toBe('warm');
    expect(restored.textSize).toBe('large');
    expect(restored.focusDesktop).toBe(true);
  });
});

describe('applySettings()', () => {
  const baseSettings = {
    editorTheme: 'dark',
    previewTheme: 'light',
    tint: 'warm',
    previewFont: 'serif',
    textSize: 'medium',
    focusDesktop: false,
  };

  it('sets --base-size to 14px for textSize small', () => {
    applySettings({ ...baseSettings, textSize: 'small' });
    expect(document.documentElement.style.getPropertyValue('--base-size')).toBe('14px');
  });

  it('sets --base-size to 18px for textSize large', () => {
    applySettings({ ...baseSettings, textSize: 'large' });
    expect(document.documentElement.style.getPropertyValue('--base-size')).toBe('18px');
  });

  it('sets data-editor-theme attribute on documentElement', () => {
    applySettings({ ...baseSettings, editorTheme: 'dark' });
    expect(document.documentElement.getAttribute('data-editor-theme')).toBe('dark');
  });

  it('sets data-preview-theme attribute on documentElement', () => {
    applySettings({ ...baseSettings, previewTheme: 'light' });
    expect(document.documentElement.getAttribute('data-preview-theme')).toBe('light');
  });

  it('sets data-tint attribute on documentElement', () => {
    applySettings({ ...baseSettings, tint: 'warm' });
    expect(document.documentElement.getAttribute('data-tint')).toBe('warm');
  });

  it('sets data-preview-font attribute on documentElement', () => {
    applySettings({ ...baseSettings, previewFont: 'serif' });
    expect(document.documentElement.getAttribute('data-preview-font')).toBe('serif');
  });
});
