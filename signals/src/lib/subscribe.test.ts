import { describe, expect, it } from 'vitest';
import { emailMaxLength, isEmail, outcomeFragment, readSubscribeForm } from './subscribe';

function formOf(fields: Record<string, string>): FormData {
  const form = new FormData();
  for (const [name, value] of Object.entries(fields)) form.set(name, value);
  return form;
}

describe('isEmail', () => {
  it('accepts an address with a domain and an ending of two letters or more', () => {
    expect(isEmail('mars@example.com')).toBe(true);
    expect(isEmail('m.gotta+signals@sub.example.es')).toBe(true);
  });

  it('rejects what cannot be an address', () => {
    expect(isEmail('')).toBe(false);
    expect(isEmail('mars')).toBe(false);
    expect(isEmail('mars@example')).toBe(false);
    expect(isEmail('mars@example.c')).toBe(false);
    expect(isEmail('mars @example.com')).toBe(false);
  });

  it('rejects an address longer than the standard allows', () => {
    const local = 'a'.repeat(emailMaxLength - '@example.com'.length + 1);
    expect(isEmail(`${local}@example.com`)).toBe(false);
  });
});

describe('readSubscribeForm', () => {
  it('reads the address, language, form and page', () => {
    const form = formOf({
      email: '  mars@example.com ',
      lang: 'en',
      source: 'post',
      page: '/en/give-memory',
    });
    expect(readSubscribeForm(form)).toEqual({
      email: 'mars@example.com',
      lang: 'en',
      source: 'post',
      page: '/en/give-memory',
    });
  });

  it('falls back to Spanish, the band and the home for missing or unknown values', () => {
    expect(readSubscribeForm(formOf({ lang: 'fr', source: 'popup' }))).toEqual({
      email: '',
      lang: 'es',
      source: 'band',
      page: '/',
    });
  });

  it('never returns to a page on another site', () => {
    for (const page of ['https://evil.example', '//evil.example', '/\\evil.example', 'archivo']) {
      expect(readSubscribeForm(formOf({ lang: 'en', page })).page).toBe('/en');
    }
  });
});

describe('outcomeFragment', () => {
  it('names the outcome and the form', () => {
    expect(outcomeFragment('sent', 'masthead')).toBe('nl-sent-masthead');
    expect(outcomeFragment('failed', 'post')).toBe('nl-failed-post');
  });
});
