/*
 * Fails the build when a test sample reached it (design/signals/LEEME.md §1.1): the samples in
 * signals/tests/fixtures/content only load when SIGNALS_CONTENT points there, but the content
 * store has mixed them in before. Runs after `astro build` in `signals:build` and `:review`.
 */
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { leakedSamples } from './signals-check-build-rules.ts';

const ROOT = new URL('../signals/', import.meta.url).pathname;

async function notes(dir: string): Promise<string[]> {
  const files = (await readdir(dir).catch(() => [])).filter((file) => file.endsWith('.md'));
  return Promise.all(files.map((file) => readFile(join(dir, file), 'utf8')));
}

const leaks = leakedSamples({
  samples: await notes(join(ROOT, 'tests/fixtures/content')),
  content: await notes(join(ROOT, 'src/content/signals')),
  built: await readdir(join(ROOT, 'dist'), { recursive: true }),
});

if (leaks.length > 0) {
  console.error(`Test samples in the build:\n${leaks.map((file) => `  dist/${file}`).join('\n')}`);
  process.exit(1);
}
