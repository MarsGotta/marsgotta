import { describe, expect, it } from 'vitest';
import {
  archivePath,
  pagePath,
  pathLang,
  rssPath,
  switchPath,
  topicPath,
  translationPath,
} from './routes';

describe('routes', () => {
  it('follows the table of design/signals/LEEME.md §2 in both languages', () => {
    expect(pagePath({ kind: 'home' }, 'es')).toBe('/');
    expect(pagePath({ kind: 'home' }, 'en')).toBe('/en');
    expect(topicPath('ia', 'es')).toBe('/temas/noticias-ia');
    expect(topicPath('practica', 'en')).toBe('/en/topics/practice');
    expect(topicPath('tutorial', 'es')).toBe('/temas/tutoriales');
    expect(archivePath('es')).toBe('/archivo');
    expect(archivePath('en')).toBe('/en/archive');
    expect(pagePath({ kind: 'signal', slug: 'dale-memoria' }, 'es')).toBe('/dale-memoria');
    expect(pagePath({ kind: 'signal', slug: 'give-memory' }, 'en')).toBe('/en/give-memory');
    expect(rssPath('en')).toBe('/en/rss.xml');
    expect(pagePath({ kind: 'subscribed' }, 'es')).toBe('/suscripcion/confirmada');
    expect(pagePath({ kind: 'subscribed' }, 'en')).toBe('/en/subscription/confirmed');
  });

  it('reads the language from the path', () => {
    expect(pathLang('/')).toBe('es');
    expect(pathLang('/en')).toBe('en');
    expect(pathLang('/en/archive')).toBe('en');
    // A Spanish slug that happens to start with the letters «en».
    expect(pathLang('/entre-el-ruido')).toBe('es');
  });

  it('switches to the same page in the other language', () => {
    expect(switchPath({ kind: 'home' }, 'es')).toBe('/en');
    expect(switchPath({ kind: 'topic', topic: 'tutorial' }, 'en')).toBe('/temas/tutoriales');
    expect(switchPath({ kind: 'archive' }, 'es')).toBe('/en/archive');
  });

  it('switches a signal to its translation, or to the other home without one', () => {
    const page = { kind: 'signal', slug: 'dale-memoria' } as const;
    expect(switchPath(page, 'es', 'give-memory')).toBe('/en/give-memory');
    expect(switchPath(page, 'es')).toBe('/en');
  });

  it('switches from a page that does not exist to the other home', () => {
    expect(switchPath(null, 'en')).toBe('/');
  });

  it('finds no translation for a signal written in one language only', () => {
    const page = { kind: 'signal', slug: 'solo-en-espanol' } as const;
    expect(translationPath(page, 'es')).toBeUndefined();
    expect(translationPath({ kind: 'archive' }, 'en')).toBe('/archivo');
  });
});
