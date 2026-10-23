import { describe, expect, it } from 'vitest';
import { projectKeys } from '../content/projects';
import { getMessages, languages } from '../i18n';
import { manifestoTokens } from './manifesto';

describe('manifestoTokens', () => {
  for (const lang of languages) {
    const { text } = getMessages(lang).home.manifesto;
    const tokens = manifestoTokens(text);

    it(`keeps the ${lang} manifesto word for word`, () => {
      const rebuilt = tokens
        .map((token) => (token.kind === 'word' ? token.text : `@${token.key} `))
        .join('');
      expect(rebuilt).toBe(`${text.join(' ')} `);
    });

    it(`turns the ${lang} project tokens into the three projects, in order`, () => {
      const projects = tokens.flatMap((token) => (token.kind === 'project' ? [token.key] : []));
      expect(projects).toEqual([...projectKeys]);
    });

    it(`never yields an empty word in ${lang}`, () => {
      for (const token of tokens) {
        if (token.kind === 'word') expect(token.text.trim()).not.toBe('');
      }
    });
  }

  it('rejects a token that is not a project', () => {
    expect(() => manifestoTokens(['@deimos'])).toThrow(/deimos/);
  });
});
