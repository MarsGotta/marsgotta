import { describe, expect, it } from 'vitest';
import { rssXml } from '../signals/src/lib/rss';
import {
  feedIssues,
  issueEmail,
  pendingIssues,
  sentSignals,
  type Issue,
} from './signals-send-issues';

const first: Issue = {
  lang: 'es',
  title: 'Memoria <para> agentes & más',
  url: 'https://signals.marsgotta.com/memoria?ref=a&b=c',
  date: new Date('2026-10-01T09:00:00Z'),
  html: '<p>Uno</p><pre><code>a[b[0]]></code></pre>',
};
const second: Issue = {
  lang: 'es',
  title: 'Segunda',
  url: 'https://signals.marsgotta.com/segunda',
  date: new Date('2026-10-21T09:00:00Z'),
  html: '<p>Dos</p>',
};

describe('feedIssues', () => {
  it('reads back what the blog writes into its feed', () => {
    const xml = rssXml({
      title: 'Signals by Mars',
      description: 'Señales.',
      lang: 'es',
      url: 'https://signals.marsgotta.com/',
      self: 'https://signals.marsgotta.com/rss.xml',
      items: [first, second].map(({ title, url, date, html }) => ({
        title,
        url,
        date,
        html,
        description: 'La entradilla.',
        category: 'Práctica',
      })),
    });
    // The feed lists the newest first.
    expect(feedIssues(xml, 'es')).toEqual([second, first]);
  });

  it('finds nothing in a feed without signals', () => {
    expect(
      feedIssues('<rss><channel><title>Signals by Mars</title></channel></rss>', 'en'),
    ).toEqual([]);
  });
});

describe('sentSignals', () => {
  it('counts every email that carries a signal, unless it was deleted', () => {
    const sent = sentSignals([
      { status: 'sent', metadata: { signal: first.url } },
      { status: 'draft', metadata: { signal: second.url } },
      { status: 'deleted', metadata: { signal: 'https://signals.marsgotta.com/borrada' } },
      { status: 'sent', metadata: {} },
      { status: 'sent', metadata: null },
    ]);
    expect([...sent]).toEqual([first.url, second.url]);
  });
});

describe('pendingIssues', () => {
  it('leaves out what was sent and keeps the order of publication', () => {
    const third = { ...second, url: 'https://signals.marsgotta.com/tercera', date: new Date() };
    expect(pendingIssues([third, second, first], new Set([second.url]))).toEqual([first, third]);
  });
});

describe('issueEmail', () => {
  const email = issueEmail(first, 'Leer esta señal en la web');

  it('goes out now, to the subscribers of its language only', () => {
    expect(email.status).toBe('about_to_send');
    expect(email.filters).toEqual({
      predicate: 'and',
      groups: [],
      filters: [{ field: 'subscriber.metadata.lang', operator: 'equals', value: 'es' }],
    });
  });

  it('stays out of the Buttondown archive, since the blog is the archive', () => {
    expect(email.archival_mode).toBe('disabled');
  });

  it('is the signal itself, closed by a link to its page', () => {
    expect(email.subject).toBe(first.title);
    expect(email.body).toBe(
      `${first.html}\n<p><a href="https://signals.marsgotta.com/memoria?ref=a&amp;b=c">Leer esta señal en la web</a></p>`,
    );
  });

  it('remembers which signal it carries, so it is never sent twice', () => {
    expect(email.metadata).toEqual({ signal: first.url, lang: 'es' });
    expect(sentSignals([{ status: 'about_to_send', metadata: email.metadata }])).toEqual(
      new Set([first.url]),
    );
  });
});
