import { describe, expect, it } from 'vitest';
import { alternates, ogLocale, pageUrl, sitemapXml, structuredData } from './seo';

const site = new URL('https://marsgotta.com');

describe('seo', () => {
  it('builds canonical URLs on marsgotta.com without a trailing slash', () => {
    expect(pageUrl(site, 'home', 'es')).toBe('https://marsgotta.com/');
    expect(pageUrl(site, 'home', 'en')).toBe('https://marsgotta.com/en');
    expect(pageUrl(site, 'about', 'es')).toBe('https://marsgotta.com/sobre-mi');
    expect(pageUrl(site, 'talks', 'en')).toBe('https://marsgotta.com/en/talks');
  });

  it('links each page to its translation and to the Spanish default', () => {
    expect(alternates(site, 'projects')).toEqual([
      { hreflang: 'es', href: 'https://marsgotta.com/proyectos' },
      { hreflang: 'en', href: 'https://marsgotta.com/en/projects' },
      { hreflang: 'x-default', href: 'https://marsgotta.com/proyectos' },
    ]);
  });

  it('lists every page in the sitemap, in both languages, each with its translations', () => {
    const xml = sitemapXml(site);
    expect(xml).toMatch(/^<\?xml version="1.0" encoding="UTF-8"\?>\n<urlset /);
    expect(xml.match(/<loc>/g)).toHaveLength(10);
    expect(xml).toContain(
      '<url><loc>https://marsgotta.com/en/about</loc>' +
        '<xhtml:link rel="alternate" hreflang="es" href="https://marsgotta.com/sobre-mi"/>' +
        '<xhtml:link rel="alternate" hreflang="en" href="https://marsgotta.com/en/about"/>' +
        '<xhtml:link rel="alternate" hreflang="x-default" href="https://marsgotta.com/sobre-mi"/>' +
        '</url>',
    );
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
      url: 'https://marsgotta.com/contacto',
      description: '¿Quieres hablar?',
      about: { '@id': 'https://marsgotta.com/#person' },
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
      '@id': 'https://marsgotta.com/#person',
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

  it('presents GDD as her method, a work in draft, not as software', () => {
    const { '@graph': graph } = structuredData(site, {
      route: 'projects',
      lang: 'es',
      title: 'Proyectos · Marcela Gotta',
      description: 'x',
    });
    expect(find(graph, 'CreativeWork', 'Gate-Driven Development (GDD)')).toMatchObject({
      url: 'https://gate-driven.dev/',
      creativeWorkStatus: 'Draft',
      author: { '@id': 'https://marsgotta.com/#person' },
    });
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
