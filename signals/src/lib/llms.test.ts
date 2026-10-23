import { describe, expect, it } from 'vitest';
import { llmsTxt } from './llms';

const site = new URL('https://signals.marsgotta.com');
const signal = {
  number: 7,
  slug: 'give-memory',
  title: 'Give your agents memory',
  deck: 'With one SQLite file.',
  publishedAt: new Date('2026-10-21'),
  topic: 'tutorial' as const,
};

describe('llmsTxt', () => {
  it('introduces the blog and its feeds in English', () => {
    const text = llmsTxt(site, []);
    expect(text.startsWith('# Signals by Mars\n\n> AI and tech news that matters')).toBe(true);
    expect(text).toContain('(https://signals.marsgotta.com/en/rss.xml)');
    expect(text).toContain('(https://signals.marsgotta.com/rss.xml)');
  });

  it('lists the signals of each language under their own heading', () => {
    const text = llmsTxt(site, [{ ...signal, lang: 'en' }]);
    expect(text).toContain(
      '## Signals in English\n\n- [Give your agents memory](https://signals.marsgotta.com/en/give-memory): With one SQLite file.',
    );
  });

  it('says so while a language has nothing published', () => {
    expect(llmsTxt(site, [])).toContain(
      '## Señales en español\n\n- Las primeras señales están en camino.',
    );
  });
});
