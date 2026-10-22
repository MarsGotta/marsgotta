import { describe, expect, it } from 'vitest';
import { languages } from './index';
import { headline, pageMeta } from './meta';
import { routeKeys } from './routes';

describe('pageMeta', () => {
  it('uses her profession, in English, as the home title in both languages', () => {
    expect(pageMeta('home', 'es').title).toBe('Marcela Gotta · Software Engineer');
    expect(pageMeta('home', 'en').title).toBe('Marcela Gotta · Software Engineer');
  });

  it('opens the home description with the headline', () => {
    expect(headline('es')).toBe('Construyo software que piensa contigo.');
    expect(headline('en')).toBe('I build software that thinks with you.');
    expect(pageMeta('home', 'es').description).toBe(
      'Construyo software que piensa contigo. 12 años construyendo software, especializada en frontend de producto y arquitectura de sistemas de componentes.',
    );
  });

  it('gives every page a distinct title and description', () => {
    for (const lang of languages) {
      const metas = routeKeys.map((route) => pageMeta(route, lang));
      expect(new Set(metas.map((meta) => meta.title)).size).toBe(routeKeys.length);
      expect(new Set(metas.map((meta) => meta.description)).size).toBe(routeKeys.length);
      for (const meta of metas) {
        expect(meta.description.length).toBeGreaterThan(50);
        expect(meta.description).not.toContain('—');
      }
    }
  });

  it('lists the talks that fit in a search result', () => {
    const { description } = pageMeta('talks', 'en');
    expect(description.length).toBeLessThanOrEqual(160);
    expect(description).toMatch(/^Talks and teaching: Natural Language Processing/);
  });
});
