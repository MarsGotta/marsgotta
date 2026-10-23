import { describe, expect, it } from 'vitest';
import { feedHtml, rssXml, type Feed } from './rss';

const site = new URL('https://signals.marsgotta.com');

const feed: Feed = {
  title: 'Signals by Mars',
  description: 'Noticias de IA & tecnología.',
  lang: 'es',
  url: 'https://signals.marsgotta.com/',
  self: 'https://signals.marsgotta.com/rss.xml',
  items: [
    {
      title: 'Primera <señal>',
      url: 'https://signals.marsgotta.com/primera',
      description: 'La entradilla.',
      date: new Date('2026-10-01T00:00:00Z'),
      category: 'Práctica',
      html: '<p>Uno</p>',
    },
    {
      title: 'Segunda',
      url: 'https://signals.marsgotta.com/segunda',
      description: 'Otra entradilla.',
      date: new Date('2026-10-21T00:00:00Z'),
      category: 'Tutoriales',
      html: '<p>Código: <code>a[b[0]]></code></p>',
    },
  ],
};

describe('rssXml', () => {
  const xml = rssXml(feed);

  it('describes the channel in its language, pointing to itself', () => {
    expect(xml).toContain('<title>Signals by Mars</title>');
    expect(xml).toContain('<description>Noticias de IA &amp; tecnología.</description>');
    expect(xml).toContain('<language>es-ES</language>');
    expect(xml).toContain(
      '<atom:link href="https://signals.marsgotta.com/rss.xml" rel="self" type="application/rss+xml"/>',
    );
  });

  it('lists the newest signal first, dated by it', () => {
    expect(xml.indexOf('Segunda')).toBeLessThan(xml.indexOf('Primera'));
    expect(xml).toContain('<lastBuildDate>Wed, 21 Oct 2026 00:00:00 GMT</lastBuildDate>');
    expect(xml).toContain('<pubDate>Thu, 01 Oct 2026 00:00:00 GMT</pubDate>');
  });

  it('escapes the text and keeps the whole HTML of each signal', () => {
    expect(xml).toContain('<title>Primera &lt;señal&gt;</title>');
    expect(xml).toContain('<content:encoded><![CDATA[<p>Uno</p>]]></content:encoded>');
    // «]]>» inside the HTML cannot end the CDATA section.
    expect(xml).toContain('<![CDATA[<p>Código: <code>a[b[0]]]]><![CDATA[></code></p>]]>');
  });

  it('is an empty channel while nothing is published', () => {
    const empty = rssXml({ ...feed, items: [] });
    expect(empty).not.toContain('<item>');
    expect(empty).not.toContain('lastBuildDate');
  });
});

describe('feedHtml', () => {
  it('makes the links and images of the blog absolute', () => {
    const html =
      '<a href="/en/archive">x</a><a href="https://example.com">y</a><a href="#s">z</a>' +
      '<img src="/_astro/a.webp" srcset="/_astro/a.webp 1x, /_astro/b.webp 2x">';
    expect(feedHtml(html, site)).toBe(
      '<a href="https://signals.marsgotta.com/en/archive">x</a><a href="https://example.com">y</a>' +
        '<a href="#s">z</a><img src="https://signals.marsgotta.com/_astro/a.webp" ' +
        'srcset="https://signals.marsgotta.com/_astro/a.webp 1x, https://signals.marsgotta.com/_astro/b.webp 2x">',
    );
  });

  it('leaves protocol-relative addresses alone', () => {
    expect(feedHtml('<img src="//cdn.example.com/a.png">', site)).toBe(
      '<img src="//cdn.example.com/a.png">',
    );
  });

  it('drops the copy buttons of the code blocks', () => {
    const html =
      '<figure class="code"><figcaption class="code-bar"><span>sql</span>' +
      '<button type="button" class="code-copy" data-copy-code hidden><svg></svg><span></span></button>' +
      '</figcaption><pre><code>SELECT 1;</code></pre></figure>';
    expect(feedHtml(html, site)).toBe(
      '<figure class="code"><figcaption class="code-bar"><span>sql</span></figcaption>' +
        '<pre><code>SELECT 1;</code></pre></figure>',
    );
  });
});
