/*
 * Sends each new signal as a newsletter issue, to the subscribers of its language only
 * (design/signals/LEEME.md §6). It reads the published feeds, so only what is live goes out, and
 * skips every signal Buttondown already has an email for. Run it after `npm run signals:deploy`:
 *
 *   npm run signals:send             lists what would go out, and sends nothing
 *   npm run signals:send -- --send   sends it
 *
 * The API key comes from BUTTONDOWN_API_KEY or, failing that, from `buttondown login`.
 */
import { readFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { join } from 'node:path';
import en from '../signals/src/i18n/en.json' with { type: 'json' };
import es from '../signals/src/i18n/es.json' with { type: 'json' };
import {
  feedIssues,
  issueEmail,
  pendingIssues,
  sentSignals,
  type Issue,
  type Lang,
} from './signals-send-issues.ts';

const SITE = 'https://signals.marsgotta.com';
const API = 'https://api.buttondown.com/v1';
const FEEDS: Record<Lang, string> = { es: '/rss.xml', en: '/en/rss.xml' };
const READ_ON_WEB: Record<Lang, string> = { es: es.nl.readOnWeb, en: en.nl.readOnWeb };

// Where the Buttondown CLI keeps its login on macOS.
const CLI_CONFIG = join(homedir(), 'Library/Preferences/buttondown-cli-nodejs/config.json');

async function apiKey(): Promise<string> {
  if (process.env.BUTTONDOWN_API_KEY) return process.env.BUTTONDOWN_API_KEY;
  const config: unknown = JSON.parse(await readFile(CLI_CONFIG, 'utf8').catch(() => '{}'));
  if (typeof config === 'object' && config && 'apiKey' in config) return String(config.apiKey);
  throw new Error('No Buttondown key: set BUTTONDOWN_API_KEY or run `buttondown login`.');
}

async function published(lang: Lang): Promise<Issue[]> {
  // No redirects: a feed that moved must not send the other language's signals.
  const response = await fetch(new URL(FEEDS[lang], SITE), { redirect: 'manual' });
  if (response.status !== 200) throw new Error(`${FEEDS[lang]} answered ${response.status}`);
  return feedIssues(await response.text(), lang);
}

async function buttondown(key: string, path: string, init: RequestInit = {}): Promise<unknown> {
  const response = await fetch(path.startsWith('http') ? path : `${API}${path}`, {
    ...init,
    headers: { Authorization: `Token ${key}`, 'Content-Type': 'application/json' },
  });
  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) throw new Error(`Buttondown ${response.status}: ${JSON.stringify(body)}`);
  return body;
}

interface EmailPage {
  results: { status: string; metadata?: Record<string, unknown> | null }[];
  next: string | null;
}

async function emails(key: string): Promise<EmailPage['results']> {
  const all: EmailPage['results'] = [];
  for (let page: string | null = '/emails?page_size=100'; page;) {
    const { results, next } = (await buttondown(key, page)) as EmailPage;
    all.push(...results);
    page = next;
  }
  return all;
}

const send = process.argv.includes('--send');
const key = await apiKey();
const issues = [...(await published('es')), ...(await published('en'))];
const pending = pendingIssues(issues, sentSignals(await emails(key)));

if (pending.length === 0) {
  console.log('Nothing new to send.');
  process.exit(0);
}

for (const issue of pending) {
  const line = `${issue.lang}  ${issue.date.toISOString().slice(0, 10)}  ${issue.title}  ${issue.url}`;
  if (!send) {
    console.log(`Would send: ${line}`);
    continue;
  }
  await buttondown(key, '/emails', {
    method: 'POST',
    body: JSON.stringify(issueEmail(issue, READ_ON_WEB[issue.lang])),
  });
  console.log(`Sent: ${line}`);
}

if (!send) console.log('\nNothing was sent. To send it: npm run signals:send -- --send');
