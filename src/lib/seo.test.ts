import { describe, expect, it } from 'vitest';
import { alternates, ogLocale, pageUrl, structuredData } from './seo';

const site = new URL('https://marcelagotta.com');

describe('seo', () => {
  it('builds canonical URLs on marcelagotta.com without a trailing slash', () => {
    expect(pageUrl(site, 'home', 'es')).toBe('https://marcelagotta.com/');
    expect(pageUrl(site, 'home', 'en')).toBe('https://marcelagotta.com/en');
    expect(pageUrl(site, 'about', 'es')).toBe('https://marcelagotta.com/sobre-mi');
    expect(pageUrl(site, 'talks', 'en')).toBe('https://marcelagotta.com/en/talks');
  });

  it('links each page to its translation and to the Spanish default', () => {
    expect(alternates(site, 'projects')).toEqual([
      { hreflang: 'es', href: 'https://marcelagotta.com/proyectos' },
      { hreflang: 'en', href: 'https://marcelagotta.com/en/projects' },
      { hreflang: 'x-default', href: 'https://marcelagotta.com/proyectos' },
    ]);
  });

  it('uses Open Graph locales', () => {
    expect(ogLocale('es')).toBe('es_ES');
    expect(ogLocale('en')).toBe('en_GB');
  });

  it('describes Marcela as a Person with her own bio, whatever the page', () => {
    const { '@graph': graph } = structuredData(site, {
      route: 'contact',
      lang: 'es',
      title: 'Contacto · Marcela Gotta',
      description: '¿Quieres hablar?',
    });
    const person = find(graph, 'Person');
    expect(person.description).toMatch(/^Soy Marcela Gotta, ingeniera de software en Madrid/);
    expect(person.jobTitle).toBe('Software Engineer');
    expect(person.worksFor).toMatchObject({
      roleName: 'Head Frontend Developer',
      worksFor: { name: 'Sngular' },
    });
    expect(person.sameAs).toEqual([
      'https://github.com/MarsGotta',
      'https://www.linkedin.com/in/marcelagotta',
      'https://x.com/marcelagotta',
    ]);
    expect(person.knowsAbout).toContain('Web Components');
    expect(person.knowsAbout).not.toContain('Rust');
    expect(find(graph, 'WebPage')).toMatchObject({
      url: 'https://marcelagotta.com/contacto',
      description: '¿Quieres hablar?',
      about: { '@id': 'https://marcelagotta.com/#person' },
    });
  });

  it('marks the About page as her profile page', () => {
    const { '@graph': graph } = structuredData(site, {
      route: 'about',
      lang: 'en',
      title: 'About · Marcela Gotta',
      description: 'x',
    });
    expect(find(graph, 'ProfilePage').mainEntity).toEqual({
      '@id': 'https://marcelagotta.com/#person',
    });
  });

  it('lists the projects, with a licence only where the code is public', () => {
    const { '@graph': graph } = structuredData(site, {
      route: 'projects',
      lang: 'en',
      title: 'Projects · Marcela Gotta',
      description: 'x',
    });
    expect(find(graph, 'SoftwareSourceCode', 'Kimen')).toMatchObject({
      url: 'https://kimen.dev',
      codeRepository: 'https://github.com/kimen-dev/kimen',
      license: 'https://spdx.org/licenses/Apache-2.0',
    });
    expect(find(graph, 'SoftwareSourceCode', 'Jezero').codeRepository).toBe(
      'https://github.com/MarsGotta/jezero',
    );
    const orbit = find(graph, 'SoftwareApplication', 'Orbit');
    expect(orbit).toMatchObject({ operatingSystem: 'macOS' });
    expect(orbit).not.toHaveProperty('license');
  });

  it('adds no page node outside the site map', () => {
    const { '@graph': graph } = structuredData(site, {
      route: null,
      lang: 'es',
      title: '404',
      description: 'x',
    });
    expect(graph.map((node) => (node as Node)['@type'])).toEqual(['WebSite', 'Person']);
  });
});

type Node = Record<string, unknown> & { '@type': string; name?: string };

function find(graph: object[], type: string, name?: string): Node {
  const node = (graph as Node[]).find(
    (item) => item['@type'] === type && (name === undefined || item.name === name),
  );
  if (!node) throw new Error(`No ${type} ${name ?? ''} in the graph`);
  return node;
}
