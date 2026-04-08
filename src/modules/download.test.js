import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getDefaultFilename, triggerDownload } from './download.js';

describe('getDefaultFilename()', () => {
  it('extracts and slugifies the first # heading', () => {
    expect(getDefaultFilename('# My Great Document\n\nSome content')).toBe('my-great-document');
  });

  it('falls back to "document" when there is no heading', () => {
    expect(getDefaultFilename('Just some prose without a heading.')).toBe('document');
  });

  it('falls back to "document" for empty content', () => {
    expect(getDefaultFilename('')).toBe('document');
  });

  it('strips special characters from the heading', () => {
    expect(getDefaultFilename('# Hello, World! (2024)')).toBe('hello-world-2024');
  });

  it('collapses multiple spaces and hyphens', () => {
    expect(getDefaultFilename('# foo   bar')).toBe('foo-bar');
  });

  it('lowercases the result', () => {
    expect(getDefaultFilename('# UPPERCASE HEADING')).toBe('uppercase-heading');
  });

  it('ignores ## subheadings and only uses the first # heading', () => {
    expect(getDefaultFilename('## Subheading\n# Main Title\n')).toBe('main-title');
  });

  it('truncates slugs longer than 60 characters', () => {
    const longTitle = '# ' + 'a'.repeat(80);
    expect(getDefaultFilename(longTitle).length).toBeLessThanOrEqual(60);
  });

  it('falls back to "document" if heading contains only special characters', () => {
    expect(getDefaultFilename('# !!! ???')).toBe('document');
  });
});

describe('triggerDownload()', () => {
  beforeEach(() => {
    global.URL.createObjectURL = vi.fn(() => 'blob:mock');
    global.URL.revokeObjectURL = vi.fn();
  });

  it('creates an anchor with the correct download attribute', () => {
    const clicks = [];
    const appendSpy = vi.spyOn(document.body, 'appendChild').mockImplementation((el) => {
      clicks.push(el.download);
      el.click = vi.fn();
      return el;
    });
    vi.spyOn(document.body, 'removeChild').mockImplementation(() => {});

    triggerDownload('my-file', '# Hello');

    expect(clicks[0]).toBe('my-file.md');
    appendSpy.mockRestore();
  });

  it('revokes the object URL after download', () => {
    vi.spyOn(document.body, 'appendChild').mockImplementation((el) => {
      el.click = vi.fn();
      return el;
    });
    vi.spyOn(document.body, 'removeChild').mockImplementation(() => {});

    triggerDownload('test', 'content');

    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock');

    vi.restoreAllMocks();
  });
});
