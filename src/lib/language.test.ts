import { describe, expect, it } from 'vitest';
import { negotiateLanguage } from './language';

describe('negotiateLanguage', () => {
  it('picks the first of Spanish or English the browser ranks', () => {
    expect(negotiateLanguage('es-ES,es;q=0.9,en;q=0.8')).toBe('es');
    expect(negotiateLanguage('en-GB,en;q=0.9,es;q=0.8')).toBe('en');
    expect(negotiateLanguage('en;q=0.4, es;q=0.7')).toBe('es');
  });

  it('skips other languages to reach a known one', () => {
    expect(negotiateLanguage('de-DE,de;q=0.9,es;q=0.5,en;q=0.3')).toBe('es');
  });

  it('reads the languages of Spain as Spanish', () => {
    expect(negotiateLanguage('ca')).toBe('es');
    expect(negotiateLanguage('eu-ES,en;q=0.5')).toBe('es');
  });

  it('falls back to English for any other language', () => {
    expect(negotiateLanguage('fr-FR,fr;q=0.9')).toBe('en');
    expect(negotiateLanguage('pt-BR')).toBe('en');
  });

  it('says nothing when the browser does not, or refuses every language', () => {
    expect(negotiateLanguage(null)).toBeNull();
    expect(negotiateLanguage('')).toBeNull();
    expect(negotiateLanguage('*')).toBeNull();
    expect(negotiateLanguage('es;q=0')).toBeNull();
  });
});
