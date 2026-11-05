import { describe, expect, it } from 'vitest';
import { contactEmail, contactLang, contactLimits, isSpam, parseContactForm } from './contact';

function form(fields: Record<string, string>): FormData {
  const data = new FormData();
  for (const [name, value] of Object.entries(fields)) data.set(name, value);
  return data;
}

const valid = { name: 'Ana', email: 'ana@example.com', message: 'Hola', lang: 'es' };

describe('contact form', () => {
  it('reads a valid message, trimming every field', () => {
    expect(
      parseContactForm(form({ ...valid, name: '  Ana ', message: ' Hola\n ', lang: 'en' })),
    ).toEqual({ name: 'Ana', email: 'ana@example.com', message: 'Hola', lang: 'en' });
  });

  it('keeps line breaks out of the name, which goes in the subject', () => {
    expect(parseContactForm(form({ ...valid, name: 'Ana\r\nBcc: x@y.z' }))?.name).toBe(
      'Ana Bcc: x@y.z',
    );
  });

  it('keeps invisible characters that could disguise the subject out of the name', () => {
    expect(parseContactForm(form({ ...valid, name: 'Ana\u202Etxt.exe\u0085 Pérez' }))?.name).toBe(
      'Anatxt.exe Pérez',
    );
  });

  it('rejects empty fields, malformed addresses and oversized text', () => {
    expect(parseContactForm(form({ ...valid, name: ' ' }))).toBeNull();
    expect(parseContactForm(form({ ...valid, email: 'ana@example' }))).toBeNull();
    expect(parseContactForm(form({ ...valid, email: 'ana @example.com' }))).toBeNull();
    // The address becomes the Reply-To: nothing that could add a second recipient or a header.
    expect(parseContactForm(form({ ...valid, email: 'a@b.co,evil@x.io' }))).toBeNull();
    expect(parseContactForm(form({ ...valid, email: '"Ana" <ana@example.com>' }))).toBeNull();
    expect(parseContactForm(form({ ...valid, message: '' }))).toBeNull();
    expect(
      parseContactForm(form({ ...valid, message: 'x'.repeat(contactLimits.message + 1) })),
    ).toBeNull();
    expect(
      parseContactForm(form({ ...valid, name: 'x'.repeat(contactLimits.name + 1) })),
    ).toBeNull();
  });

  it('falls back to Spanish for an unknown language', () => {
    expect(contactLang(form({ lang: 'fr' }))).toBe('es');
    expect(contactLang(form({}))).toBe('es');
  });

  it('flags submissions that fill the hidden field', () => {
    expect(isSpam(form(valid))).toBe(false);
    expect(isSpam(form({ ...valid, website: 'https://spam.example' }))).toBe(true);
  });

  it('composes an email that replies to the sender', () => {
    expect(
      contactEmail({ name: 'Ana', email: 'ana@example.com', message: 'Hola', lang: 'es' }),
    ).toEqual({
      subject: 'Contacto web: Ana',
      replyTo: 'ana@example.com',
      text: 'Nombre: Ana\nEmail: ana@example.com\nIdioma: es\n\nHola',
    });
  });
});
