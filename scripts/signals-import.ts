/*
 * Copies the signals Mars writes in her Obsidian vault into the blog's content collection
 * (design/signals/LEEME.md §3.1). The vault is the source: running it again updates the repo.
 *
 *   npm run signals:import            reads $SIGNALS_VAULT_DIR/Signals, or the iCloud vault
 *   npm run signals:import -- --prune also deletes signals that are no longer in the vault
 *
 * Every note is checked before anything is written, so a bad note never leaves the repo half updated.
 */
import { copyFile, mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { basename, join, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import {
  convertBody,
  longDashLines,
  parseFrontmatter,
  splitNote,
  type LinkTarget,
} from '../signals/src/lib/obsidian.ts';
import { signalSchema, type SignalData } from '../signals/src/lib/signal-schema.ts';

const DEFAULT_VAULT = join(
  homedir(),
  'Library/Mobile Documents/iCloud~md~obsidian/Documents/mars-vault',
);
const SIGNALS_FOLDER = 'Signals';

export interface ImportOptions {
  vaultDir: string;
  /** The content collection's folder in the repo. */
  outDir: string;
  /** Delete the signals in the repo that are no longer in the vault. */
  prune?: boolean;
}

export interface ImportReport {
  imported: { name: string; draft: boolean }[];
  media: string[];
  warnings: string[];
  /** Signals in the repo that are not in the vault any more. */
  extra: string[];
  pruned: string[];
}

export class ImportError extends Error {
  // A plain field: Node runs this script by stripping types, and that skips parameter properties.
  readonly problems: string[];

  constructor(problems: string[]) {
    super(`Nothing imported:\n${problems.map((problem) => `  - ${problem}`).join('\n')}`);
    this.problems = problems;
  }
}

interface Parsed {
  name: string;
  file: string;
  data: SignalData;
  frontmatter: string;
  note: ReturnType<typeof splitNote>;
}

const pad = (signalNumber: number) => String(signalNumber).padStart(3, '0');

/** Hidden files and Obsidian's own folders (.obsidian, .trash) are never part of a signal. */
const hidden = (name: string) => name.startsWith('.');
/** In Signals/, a leading _ also marks what is not a signal, such as the template. */
const notASignal = (name: string) => hidden(name) || name.startsWith('_');

/** Every file under a folder, except the ones `skip` leaves out. */
async function walk(dir: string, skip: (name: string) => boolean): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries
      .filter((entry) => !skip(entry.name))
      .map((entry) => {
        const path = join(dir, entry.name);
        return entry.isDirectory() ? walk(path, skip) : Promise.resolve([path]);
      }),
  );
  return files.flat();
}

async function readNotes(vaultDir: string, problems: string[]): Promise<Parsed[]> {
  const files = (await walk(join(vaultDir, SIGNALS_FOLDER), notASignal)).filter((file) =>
    file.endsWith('.md'),
  );
  const notes: Parsed[] = [];
  for (const file of files) {
    const name = basename(file, '.md');
    const shown = relative(vaultDir, file);
    const note = splitNote(await readFile(file, 'utf8'));
    let properties: unknown;
    try {
      properties = parseFrontmatter(note.frontmatter);
    } catch (error) {
      problems.push(`${shown}: ${(error as Error).message}`);
      continue;
    }
    const result = signalSchema.safeParse(properties);
    if (!result.success) {
      for (const issue of result.error.issues) {
        problems.push(`${shown}: ${issue.path.join('.') || 'properties'}: ${issue.message}`);
      }
      continue;
    }
    const data = result.data;
    const expected = `${pad(data.number)}-${data.slug}.${data.lang}`;
    if (name !== expected) problems.push(`${shown}: name it ${expected}.md, after its properties`);
    const dashes = longDashLines(note);
    if (dashes.length) problems.push(`${shown}: long dash (—) on line ${dashes.join(', ')}`);
    notes.push({ name, file, data, frontmatter: note.frontmatter, note });
  }
  const seen = new Map<string, string>();
  for (const { name, data } of notes) {
    const key = `${data.number}.${data.lang}`;
    const other = seen.get(key);
    if (other)
      problems.push(`${name} and ${other} are both signal ${pad(data.number)} in ${data.lang}`);
    seen.set(key, name);
  }
  return notes;
}

/** Writes only when the text changed, so an import with no edits leaves the repo untouched. */
async function writeIfChanged(path: string, text: string): Promise<void> {
  const current = await readFile(path, 'utf8').catch(() => null);
  if (current !== text) await writeFile(path, text);
}

export async function importSignals(options: ImportOptions): Promise<ImportReport> {
  const problems: string[] = [];
  const warnings: string[] = [];
  const notes = await readNotes(options.vaultDir, problems);

  const links = new Map<string, LinkTarget>(
    notes.map(({ name, data }) => [
      name,
      { url: data.lang === 'es' ? `/${data.slug}` : `/en/${data.slug}`, title: data.title },
    ]),
  );
  const vaultFiles = new Map(
    (await walk(options.vaultDir, hidden)).map((file) => [basename(file), file] as const),
  );

  const outputs = notes.map((parsed) => {
    const folder = `media/${pad(parsed.data.number)}`;
    const converted = convertBody(parsed.note.body, {
      signal: (name) => links.get(name),
      media: (fileName) => `./${folder}/${fileName}`,
    });
    problems.push(...converted.errors.map((error) => `${parsed.name}: ${error}`));
    warnings.push(...converted.warnings.map((warning) => `${parsed.name}: ${warning}`));
    const media = converted.media.map((fileName) => {
      const source = vaultFiles.get(fileName);
      if (!source) problems.push(`${parsed.name}: ${fileName} is not in the vault`);
      return { source, target: join(options.outDir, folder, fileName) };
    });
    return {
      parsed,
      text: `---\n${parsed.frontmatter}\n---\n${converted.body.replace(/\n*$/, '\n')}`,
      media,
    };
  });
  if (problems.length) throw new ImportError(problems);

  await mkdir(options.outDir, { recursive: true });
  const copied: string[] = [];
  for (const { parsed, text, media } of outputs) {
    await writeIfChanged(join(options.outDir, `${parsed.name}.md`), text);
    for (const { source, target } of media) {
      if (!source) continue;
      await mkdir(join(target, '..'), { recursive: true });
      await copyFile(source, target);
      copied.push(relative(options.outDir, target));
    }
  }

  const wanted = new Set(notes.map(({ name }) => `${name}.md`));
  const extra = (await readdir(options.outDir)).filter(
    (file) => file.endsWith('.md') && !wanted.has(file),
  );
  const pruned: string[] = [];
  if (options.prune) {
    for (const file of extra) {
      await rm(join(options.outDir, file));
      pruned.push(file);
    }
    const numbers = new Set(notes.map(({ data }) => pad(data.number)));
    const mediaDir = join(options.outDir, 'media');
    for (const folder of await readdir(mediaDir).catch(() => [])) {
      if (!numbers.has(folder)) {
        await rm(join(mediaDir, folder), { recursive: true });
        pruned.push(`media/${folder}`);
      }
    }
  }

  return {
    imported: notes.map(({ name, data }) => ({ name, draft: data.draft })),
    media: copied,
    warnings,
    extra: options.prune ? [] : extra,
    pruned,
  };
}

async function main(): Promise<void> {
  const vaultDir = process.env.SIGNALS_VAULT_DIR ?? DEFAULT_VAULT;
  const outDir = fileURLToPath(new URL('../signals/src/content/signals', import.meta.url));
  try {
    const report = await importSignals({
      vaultDir,
      outDir,
      prune: process.argv.includes('--prune'),
    });
    for (const { name, draft } of report.imported) {
      console.log(`  ${draft ? 'draft    ' : 'published'}  ${name}`);
    }
    console.log(`Imported ${report.imported.length} signals and ${report.media.length} images.`);
    for (const warning of report.warnings) console.warn(`  ! ${warning}`);
    for (const file of report.pruned) console.log(`  deleted ${file}`);
    if (report.extra.length) {
      console.warn(
        `Not in the vault any more (run with --prune to delete): ${report.extra.join(', ')}`,
      );
    }
  } catch (error) {
    console.error(error instanceof ImportError ? error.message : error);
    process.exitCode = 1;
  }
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) await main();
