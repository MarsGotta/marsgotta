import { locales, type Lang } from '../i18n';

export interface FeedItem {
  title: string;
  url: string;
  /** The standfirst, for readers that only show a summary. */
  description: string;
  date: Date;
  category: string;
  /** The whole signal, which is also the body of the newsletter email. */
  html: string;
}

export interface Feed {
  title: string;
  description: string;
  lang: Lang;
  /** The home of the feed's language. */
  url: string;
  /** The feed's own address. */
  self: string;
  items: FeedItem[];
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// A CDATA section ends at the first «]]>», so one inside the HTML is split across two sections.
function cdata(html: string): string {
  return `<![CDATA[${html.replaceAll(']]>', ']]]]><![CDATA[>')}]]>`;
}

/** RSS 2.0 with the full content of each signal, newest first. */
export function rssXml(feed: Feed): string {
  const items = [...feed.items].sort((a, b) => b.date.getTime() - a.date.getTime());
  const updated = items[0]?.date;
  const entries = items.map((item) =>
    [
      '<item>',
      `<title>${escapeXml(item.title)}</title>`,
      `<link>${escapeXml(item.url)}</link>`,
      `<guid isPermaLink="true">${escapeXml(item.url)}</guid>`,
      `<pubDate>${item.date.toUTCString()}</pubDate>`,
      '<dc:creator>Marcela Gotta</dc:creator>',
      `<category>${escapeXml(item.category)}</category>`,
      `<description>${escapeXml(item.description)}</description>`,
      `<content:encoded>${cdata(item.html)}</content:encoded>`,
      '</item>',
    ].join(''),
  );
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:dc="http://purl.org/dc/elements/1.1/">',
    '<channel>',
    `<title>${escapeXml(feed.title)}</title>`,
    `<link>${escapeXml(feed.url)}</link>`,
    `<description>${escapeXml(feed.description)}</description>`,
    `<language>${locales[feed.lang]}</language>`,
    `<atom:link href="${escapeXml(feed.self)}" rel="self" type="application/rss+xml"/>`,
    // The newest signal's date, not the build's: rebuilding without news changes nothing.
    ...(updated ? [`<lastBuildDate>${updated.toUTCString()}</lastBuildDate>`] : []),
    ...entries,
    '</channel>',
    '</rss>',
    '',
  ].join('\n');
}

/**
 * A signal's HTML made fit for feed readers and email: every link and image absolute, since the
 * newsletter is read away from the site, and without the «Copiar» buttons, which only work on it.
 */
export function feedHtml(html: string, site: URL): string {
  const absolute = (path: string) => new URL(path, site).href;
  return html
    .replace(/<button\b[^>]*\bdata-copy-code\b[^>]*>[\s\S]*?<\/button>/g, '')
    .replace(/\s(href|src)="(\/(?!\/)[^"]*)"/g, (_, name: string, path: string) => {
      return ` ${name}="${absolute(path)}"`;
    })
    .replace(/\ssrcset="([^"]*)"/g, (_, set: string) => {
      const sources = set
        .split(',')
        .map((source) => source.trim().replace(/^\/(?!\/)\S*/, (path) => absolute(path)));
      return ` srcset="${sources.join(', ')}"`;
    });
}
