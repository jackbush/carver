import { describe, it, expect } from 'vitest';
import MarkdownIt from 'markdown-it';

const md = new MarkdownIt();

describe('markdown-it rendering', () => {
  it('renders # Heading as <h1>', () => {
    expect(md.render('# Heading')).toContain('<h1>');
  });

  it('renders ## Heading as <h2>', () => {
    expect(md.render('## Heading')).toContain('<h2>');
  });

  it('renders **bold** as <strong>', () => {
    expect(md.render('**bold**')).toContain('<strong>');
  });

  it('renders *italic* as <em>', () => {
    expect(md.render('*italic*')).toContain('<em>');
  });

  it('renders `code` as <code>', () => {
    expect(md.render('`code`')).toContain('<code>');
  });

  it('renders fenced code block as <pre>', () => {
    expect(md.render('```\ncode block\n```')).toContain('<pre>');
  });

  it('renders > blockquote as <blockquote>', () => {
    expect(md.render('> blockquote')).toContain('<blockquote>');
  });

  it('renders - item as <ul>', () => {
    expect(md.render('- item')).toContain('<ul>');
  });

  it('renders 1. item as <ol>', () => {
    expect(md.render('1. item')).toContain('<ol>');
  });

  it('renders [text](https://example.com) with correct href', () => {
    expect(md.render('[text](https://example.com)')).toContain('href="https://example.com"');
  });
});
