import { describe, it, expect } from 'vitest';
import { countWords, formatWordCount } from './words.js';

describe('countWords()', () => {
  it('counts plain words', () => {
    expect(countWords('You write. It stays.')).toBe(4);
  });

  it('treats contractions and hyphenated words as one word', () => {
    expect(countWords("what's here is well-made")).toBe(4);
    expect(countWords('don’t')).toBe(1);
  });

  it('ignores punctuation and dashes between words', () => {
    expect(countWords('windows — the higher up')).toBe(4);
  });

  it('returns 0 for empty or whitespace-only text', () => {
    expect(countWords('')).toBe(0);
    expect(countWords('  \n ')).toBe(0);
  });
});

describe('formatWordCount()', () => {
  it('says so when there are no words', () => {
    expect(formatWordCount(0)).toBe('No words yet');
  });

  it('uses the singular for one word', () => {
    expect(formatWordCount(1)).toBe('1 word');
  });

  it('groups thousands', () => {
    expect(formatWordCount(12345)).toBe('12,345 words');
  });
});
