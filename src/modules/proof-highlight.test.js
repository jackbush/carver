import { describe, it, expect } from 'vitest';
import { alignText } from './proof-highlight.js';

// The source text behind each rendered character.
const traced = (source, rendered) => [...alignText(source, rendered)].map((i) => source[i]).join('');

describe('alignText()', () => {
  it('maps plain text one to one', () => {
    expect([...alignText('Fat', 'Fat')]).toEqual([0, 1, 2]);
  });

  it('skips markdown syntax', () => {
    const source = '## A **bold** _turn_';
    const map = alignText(source, 'A bold turn');
    expect(traced(source, 'A bold turn')).toBe('A bold turn');
    expect(map[2]).toBe(source.indexOf('bold'));
  });

  it('skips link destinations, even when they hold the next letter', () => {
    const source = '[link](http://h.example)here';
    const map = alignText(source, 'linkhere');
    expect(map[4]).toBe(source.indexOf('here'));
  });

  it('maps typographic characters to where the source has their stand-ins', () => {
    const source = '"Yes," she said -- and left...';
    const rendered = '“Yes,” she said – and left…';
    const map = alignText(source, rendered);
    expect(map[0]).toBe(0);
    expect(source[map[1]]).toBe('Y');
    expect(source[map[rendered.indexOf('and')]]).toBe('a');
    expect([...map]).toEqual([...map].sort((a, b) => a - b));
  });

  it('matches a line break to the newline it came from', () => {
    const source = 'one\ntwo';
    expect([...alignText(source, 'one\ntwo')]).toEqual([0, 1, 2, 3, 4, 5, 6]);
  });
});
