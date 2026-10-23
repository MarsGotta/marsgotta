/*
 * Turns a note from Mars's Obsidian vault into a signal for the blog (design/signals/LEEME.md §3.1).
 * Pure functions: scripts/signals-import.ts does the reading and writing.
 */

export interface Note {
  /** The YAML between the --- fences, without them. */
  frontmatter: string;
  body: string;
  /** Lines before the body starts, to report positions in the note as Obsidian shows them. */
  bodyLine: number;
}

export function splitNote(text: string): Note {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(text);
  if (!match) return { frontmatter: '', body: text, bodyLine: 1 };
  return {
    frontmatter: match[1] ?? '',
    body: text.slice(match[0].length),
    bodyLine: match[0].split('\n').length,
  };
}

type Value = string | number | boolean | null | string[];

/** A scalar the way Obsidian's properties write it: quoted or bare, numbers and booleans unquoted. */
function scalar(raw: string): string | number | boolean | null {
  const text = raw.trim();
  if (text === '' || text === 'null' || text === '~') return null;
  if (text === 'true' || text === 'false') return text === 'true';
  if (/^-?\d+(\.\d+)?$/.test(text)) return Number(text);
  if (text.startsWith('"') && text.endsWith('"')) return JSON.parse(text) as string;
  if (text.startsWith("'") && text.endsWith("'")) return text.slice(1, -1).replaceAll("''", "'");
  return text;
}

function inlineList(raw: string): string[] {
  const inner = raw.trim().slice(1, -1).trim();
  if (!inner) return [];
  return inner.split(',').map((item) => String(scalar(item)));
}

/**
 * The small part of YAML that Obsidian's properties use: `key: value`, inline lists `[a, b]` and
 * block lists of `- item`. Anything else is an error, so a note never imports half read.
 */
export function parseFrontmatter(yaml: string): Record<string, Value> {
  const data: Record<string, Value> = {};
  /** Keys written as `key:` with nothing after them: a block list, or an empty property. */
  const bare = new Set<string>();
  let listKey: string | null = null;
  yaml.split(/\r?\n/).forEach((line, index) => {
    if (!line.trim() || line.trimStart().startsWith('#')) return;
    const item = /^\s+-\s*(.*)$/.exec(line);
    if (item) {
      const list = listKey === null ? undefined : data[listKey];
      if (!Array.isArray(list)) throw new Error(`Line ${index + 1}: a list item outside a list`);
      list.push(String(scalar(item[1] ?? '')));
      return;
    }
    const pair = /^([A-Za-z][\w-]*):(.*)$/.exec(line);
    if (!pair?.[1]) throw new Error(`Line ${index + 1}: cannot read "${line.trim()}"`);
    const key = pair[1];
    const raw = (pair[2] ?? '').trim();
    if (raw === '') {
      data[key] = [];
      bare.add(key);
      listKey = key;
      return;
    }
    listKey = null;
    data[key] = raw.startsWith('[') && raw.endsWith(']') ? inlineList(raw) : scalar(raw);
  });
  // A bare key with no items under it is an empty property, not an empty list.
  for (const key of bare) {
    if (Array.isArray(data[key]) && data[key].length === 0) data[key] = null;
  }
  return data;
}

/** Splits Markdown into prose and code (fenced blocks and inline spans), which is never touched. */
function segments(markdown: string): { code: boolean; text: string }[] {
  const out: { code: boolean; text: string }[] = [];
  const pattern = /(^|\n)(```|~~~)[^\n]*\n[\s\S]*?\n\2[^\n]*(?=\n|$)|`[^`\n]+`/g;
  let last = 0;
  for (const match of markdown.matchAll(pattern)) {
    const start = match.index + (match[1] ?? '').length;
    if (start > last) out.push({ code: false, text: markdown.slice(last, start) });
    out.push({ code: true, text: markdown.slice(start, match.index + match[0].length) });
    last = match.index + match[0].length;
  }
  if (last < markdown.length) out.push({ code: false, text: markdown.slice(last) });
  return out;
}

/** The long dash, U+2014, written as an escape so this file shows none. */
const LONG_DASH = '\u2014';

/** Lines of the note with a long dash outside code: the brand never uses them. */
export function longDashLines(note: Note): number[] {
  const lines: number[] = [];
  let line = note.bodyLine;
  for (const part of segments(note.body)) {
    if (!part.code) {
      part.text.split('\n').forEach((text, offset) => {
        if (text.includes(LONG_DASH)) lines.push(line + offset);
      });
    }
    line += part.text.split('\n').length - 1;
  }
  return [...new Set(lines)];
}

export interface LinkTarget {
  url: string;
  title: string;
}

export interface ConvertContext {
  /** The signal a `[[note]]` names, if that note is a signal. */
  signal(name: string): LinkTarget | undefined;
  /** Where an embedded image goes, relative to the signal's file in the repo. */
  media(fileName: string): string;
}

export interface Converted {
  body: string;
  /** Embedded files to copy next to the signal. */
  media: string[];
  warnings: string[];
  errors: string[];
}

const IMAGE = /\.(png|jpe?g|gif|webp|avif|svg)$/i;

/** Heading ids as Astro writes them: lower case, words joined by hyphens. */
function headingId(heading: string): string {
  return heading
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .replace(/\s/g, '-');
}

/** Turns Obsidian's own syntax into Markdown the blog builds. Code is left exactly as written. */
export function convertBody(body: string, context: ConvertContext): Converted {
  const media: string[] = [];
  const warnings: string[] = [];
  const errors: string[] = [];

  const prose = (text: string) =>
    text
      // %% comments %% are notes to self.
      .replace(/%%[\s\S]*?%%/g, '')
      .replace(/!\[\[([^\]|]+)(?:\|([^\]]*))?\]\]/g, (_, target: string, alias?: string) => {
        const fileName = target.split('/').at(-1) ?? target;
        if (!IMAGE.test(fileName)) {
          errors.push(`![[${target}]] embeds a note, and the blog can only embed images`);
          return '';
        }
        // A number after the bar is a width in Obsidian, not a description.
        const alt = alias && !/^\d+(x\d+)?$/.test(alias) ? alias.trim() : '';
        if (!alt)
          warnings.push(`![[${fileName}]] has no description: write it as ![[${fileName}|…]]`);
        media.push(fileName);
        return `![${alt}](${context.media(fileName)})`;
      })
      .replace(
        /\[\[([^\]|#]+)(?:#([^\]|]+))?(?:\|([^\]]*))?\]\]/g,
        (_, target: string, heading?: string, alias?: string) => {
          const name = (target.split('/').at(-1) ?? target).replace(/\.md$/, '');
          const signal = context.signal(name);
          if (!signal) return alias ?? heading ?? name;
          const url = heading ? `${signal.url}#${headingId(heading)}` : signal.url;
          return `[${alias ?? signal.title}](${url})`;
        },
      );

  const converted = segments(body)
    .map((part) => (part.code ? part.text : prose(part.text)))
    .join('');
  return { body: converted, media, warnings, errors };
}
