import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { render } from 'astro:content';
import { getMessages, type Lang } from '../i18n';
import { homePath, rssPath } from '../lib/routes';
import { feedHtml, rssXml } from '../lib/rss';
import { BLOG_NAME } from '../lib/seo';
import { getArticles } from './signals';

/**
 * The RSS of a language: every published signal, whole. Buttondown sends each new item to that
 * language's subscribers, so the feed is also the newsletter (design/signals/LEEME.md §6).
 */
export async function rssResponse(lang: Lang, site: URL): Promise<Response> {
  const t = getMessages(lang);
  // The container renders each signal as its page does, images included, which the HTML kept by
  // the content store only holds as placeholders.
  const container = await AstroContainer.create();
  const items = await Promise.all(
    (await getArticles(lang)).map(async ({ signal, entry }) => {
      const { Content } = await render(entry);
      return {
        title: signal.title,
        url: new URL(signal.href, site).href,
        description: signal.deck,
        date: signal.publishedAt,
        category: t.topics[signal.topic],
        html: feedHtml(await container.renderToString(Content), site),
      };
    }),
  );
  const xml = rssXml({
    title: BLOG_NAME,
    description: t.home.sub,
    lang,
    url: new URL(homePath(lang), site).href,
    self: new URL(rssPath(lang), site).href,
    items,
  });
  return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
}
