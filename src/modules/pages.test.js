import { describe, it, expect } from 'vitest';
import { paperForLocale } from './pages.js';

describe('paperForLocale()', () => {
  it('uses US Letter in the US and Canada', () => {
    expect(paperForLocale(['en-US'])).toBe('letter');
    expect(paperForLocale(['fr-CA'])).toBe('letter');
  });

  it('uses A4 elsewhere', () => {
    expect(paperForLocale(['en-GB'])).toBe('a4');
    expect(paperForLocale(['de-DE'])).toBe('a4');
    expect(paperForLocale(['en-AU'])).toBe('a4');
  });

  it('infers the region of a bare language', () => {
    expect(paperForLocale(['en'])).toBe('letter');
    expect(paperForLocale(['fr'])).toBe('a4');
  });

  it('skips tags it cannot parse and falls back to A4', () => {
    expect(paperForLocale(['not a locale', 'en-GB'])).toBe('a4');
    expect(paperForLocale([])).toBe('a4');
  });
});
