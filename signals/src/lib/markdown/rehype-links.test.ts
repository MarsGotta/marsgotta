import { describe, expect, it, vi } from 'vitest';
import { isExternal, rehypeLinks } from './rehype-links';

describe('isExternal', () => {
  it('only counts links that leave the blog', () => {
    expect(isExternal('https://sqlite.org/fts5.html')).toBe(true);
    expect(isExternal('https://signals.marsgotta.com/otra-senal')).toBe(false);
    expect(isExternal('/archivo')).toBe(false);
    expect(isExternal('#por-que')).toBe(false);
  });
});

describe('rehypeLinks', () => {
  it('marks external links with rel and never opens a new tab', () => {
    const visitor = rehypeLinks.element;
    if (!visitor || Array.isArray(visitor)) throw new Error('One element visitor expected');
    const setProperty = vi.fn();
    const link = {
      type: 'element',
      tagName: 'a',
      properties: { href: 'https://sqlite.org' },
      children: [],
    };
    void visitor.visit(link as never, { setProperty } as never);
    expect(setProperty).toHaveBeenCalledWith(link, 'rel', ['noopener', 'noreferrer']);
    expect(setProperty).not.toHaveBeenCalledWith(link, 'target', expect.anything());
  });
});
