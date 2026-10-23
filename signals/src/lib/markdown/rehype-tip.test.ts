import { describe, expect, it, vi } from 'vitest';
import { afterTipMark, rehypeTip } from './rehype-tip';

const text = (value: string) => ({ type: 'text', value });
const element = (tagName: string, children: unknown[] = []) => ({
  type: 'element',
  tagName,
  properties: {},
  children,
});

/** Runs the visitor on a quote, as Sätteri would, and returns what it put in its place. */
function visit(
  quote: unknown,
  lang = 'es',
): { tagName: string; properties: Record<string, unknown> } | undefined {
  const visitor = rehypeTip.element;
  if (!visitor || Array.isArray(visitor)) throw new Error('One element visitor expected');
  const replaceNode = vi.fn();
  const ctx = { data: { astro: { frontmatter: { lang } } }, replaceNode };
  void visitor.visit(quote as never, ctx as never);
  return replaceNode.mock.calls[0]?.[1];
}

describe('afterTipMark', () => {
  it('reads what follows the mark, on its line or the next', () => {
    expect(afterTipMark('[!TIP]\nUsa FTS5.')).toBe('Usa FTS5.');
    expect(afterTipMark('[!TIP] Usa FTS5.')).toBe('Usa FTS5.');
    expect(afterTipMark('[!TIP]')).toBe('');
    expect(afterTipMark('Una cita normal.')).toBeUndefined();
  });
});

describe('rehypeTip', () => {
  it('turns a [!TIP] quote into the labelled aside, keeping its inline content', () => {
    const strong = element('strong', [text('FTS5')]);
    const aside = visit(element('blockquote', [element('p', [text('[!TIP]\nUsa '), strong])]));
    expect(aside?.tagName).toBe('aside');
    expect(aside?.properties.ariaLabel).toBe('Consejo práctico');
    expect(JSON.stringify(aside)).toContain('"value":"Usa "');
    expect(JSON.stringify(aside)).toContain('FTS5');
    expect(JSON.stringify(aside)).not.toContain('[!TIP]');
  });

  it('labels it in the language of the signal', () => {
    const quote = element('blockquote', [element('p', [text('[!TIP] Start small.')])]);
    expect(visit(quote, 'en')?.properties.ariaLabel).toBe('Practical tip');
  });

  it('leaves ordinary quotes alone', () => {
    const quote = element('blockquote', [element('p', [text('Una memoria que no puedes leer.')])]);
    expect(visit(quote)).toBeUndefined();
  });
});
