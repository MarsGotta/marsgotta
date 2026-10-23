import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

/** Every file that holds visible text: the copy, the editable content and the components. */
function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return sourceFiles(path);
    return /\.(json|astro|ts)$/.test(name) && !name.endsWith('.test.ts') ? [path] : [];
  });
}

// The blog's interface copy and components follow the same rules (design/signals/LEEME.md §1.1).
const files = ['src', 'signals/src']
  .flatMap((dir) => sourceFiles(dir))
  .map((path) => ({ path, text: readFileSync(path, 'utf8') }));

/* Brand limits from design/v3/HANDOFF.md §6 and the brief: what can never appear on the site. */
const forbidden: [string, RegExp][] = [
  ['long dashes', /—/],
  ['Lunar as a project', /\bLunar\b/],
  ['OpenClaw', /OpenClaw/i],
  ['the old job title', /Senior Product Engineer/i],
  ['"agent harnesses"', /agent harnesses/i],
  ['"16 años"', /16 (años|years)/i],
  ['the "talk to Deimos" chat', /habla con Deimos|talk to Deimos/i],
  ['CEFR English levels', /\b(MCER|CEFR)\b|\bB2\b|\bC1\b|\bC2\b/],
  ['a link to the private Orbit repo', /github\.com\/MarsGotta\/orbit/i],
];

describe('brand rules', () => {
  for (const [rule, pattern] of forbidden) {
    it(`never shows ${rule}`, () => {
      const hits = files.filter((file) => pattern.test(file.text)).map((file) => file.path);
      expect(hits).toEqual([]);
    });
  }

  it('does not call Orbit open source', () => {
    for (const lang of ['es', 'en']) {
      const copy = readFileSync(`src/i18n/${lang}.json`, 'utf8');
      expect(copy).not.toMatch(/Orbit[^.]*\b(es|is) open source/i);
    }
  });
});
