export type Lang = 'es' | 'en';

/** A published signal in one language: one newsletter issue. */
export interface Issue {
  lang: Lang;
  title: string;
  url: string;
  date: Date;
  /** The whole signal, as the feed carries it. */
  html: string;
}

/** An email as Buttondown's API creates it. */
export interface IssueEmail {
  subject: string;
  body: string;
  status: 'about_to_send';
  archival_mode: 'disabled';
  filters: {
    predicate: 'and';
    groups: [];
    filters: { field: string; operator: 'equals'; value: string }[];
  };
  metadata: { signal: string; lang: Lang };
}

const ITEM = /<item>([\s\S]*?)<\/item>/g;
const CDATA = /<!\[CDATA\[([\s\S]*?)\]\]>/g;

// The inverse of escapeXml in signals/src/lib/rss.ts; &amp; goes last so «&amp;lt;» stays «&lt;».
function unescapeXml(text: string): string {
  return text
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&');
}

function escapeAttribute(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}

function tag(item: string, name: string): string {
  return new RegExp(`<${name}>([\\s\\S]*?)</${name}>`).exec(item)?.[1] ?? '';
}

/**
 * The signals of one of the blog's feeds, as signals/src/lib/rss.ts writes them. Its content is
 * split into several CDATA sections when the HTML holds a «]]>», so they are joined back.
 */
export function feedIssues(xml: string, lang: Lang): Issue[] {
  return [...xml.matchAll(ITEM)].map(([, item]) => ({
    lang,
    title: unescapeXml(tag(item, 'title')),
    url: unescapeXml(tag(item, 'link')),
    date: new Date(tag(item, 'pubDate')),
    html: [...tag(item, 'content:encoded').matchAll(CDATA)].map(([, part]) => part).join(''),
  }));
}

/**
 * The signals Buttondown already has an email for, sent or not. A deleted email no longer
 * counts, so deleting one is how to send a signal again.
 */
export function sentSignals(
  emails: readonly { status: string; metadata?: Record<string, unknown> | null }[],
): Set<string> {
  const sent = new Set<string>();
  for (const { status, metadata } of emails) {
    const signal = metadata?.signal;
    if (status !== 'deleted' && typeof signal === 'string') sent.add(signal);
  }
  return sent;
}

/** What still has to go out, oldest first, so readers get the signals in the order they came. */
export function pendingIssues(issues: readonly Issue[], sent: ReadonlySet<string>): Issue[] {
  return issues
    .filter((issue) => !sent.has(issue.url))
    .sort((a, b) => a.date.getTime() - b.date.getTime());
}

/**
 * A signal as an email to the subscribers of its language only: each one keeps it in their
 * metadata (signals/workers/newsletter/buttondown.ts). It ends with a link to the page, where
 * the code and the images read best, and stays out of Buttondown's archive: the blog is the
 * archive, and a copy there would compete with it in search.
 */
export function issueEmail(issue: Issue, readOnWeb: string): IssueEmail {
  return {
    subject: issue.title,
    body: `${issue.html}\n<p><a href="${escapeAttribute(issue.url)}">${readOnWeb}</a></p>`,
    status: 'about_to_send',
    archival_mode: 'disabled',
    filters: {
      predicate: 'and',
      groups: [],
      filters: [{ field: 'subscriber.metadata.lang', operator: 'equals', value: issue.lang }],
    },
    metadata: { signal: issue.url, lang: issue.lang },
  };
}
