import { mkdir, mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { ImportError, importSignals } from './signals-import';

const note = (properties: string, body: string) => `---\n${properties}\n---\n${body}`;

const SIGNAL_007 = note(
  [
    'number: 7',
    'lang: es',
    'slug: dale-memoria',
    'title: "Dale memoria a tus agentes"',
    'deck: "Búsqueda de texto completo con FTS5."',
    'topic: tutorial',
    'cover: strata',
    'publishedAt: 2026-10-21',
    'tags:',
    '  - SQLite',
    'draft: true',
  ].join('\n'),
  '\nComo conté en [[006-cinco-preguntas.es|la anterior]], %%revisar%%esto va así.\n\n![[esquema.png|El esquema]]\n',
);
const SIGNAL_006 = note(
  'number: 6\nlang: es\nslug: cinco-preguntas\ntitle: Cinco preguntas\ndeck: La lista corta.\ntopic: practica\ncover: signal\npublishedAt: 2026-10-14',
  '\nCompila y pasa los tests.\n',
);

let vault: string;
let out: string;

async function vaultWith(files: Record<string, string>): Promise<void> {
  for (const [path, text] of Object.entries(files)) {
    await mkdir(join(vault, path, '..'), { recursive: true });
    await writeFile(join(vault, path), text);
  }
}

beforeEach(async () => {
  vault = await mkdtemp(join(tmpdir(), 'vault-'));
  out = await mkdtemp(join(tmpdir(), 'signals-'));
});

afterEach(async () => {
  await rm(vault, { recursive: true, force: true });
  await rm(out, { recursive: true, force: true });
});

describe('importSignals', () => {
  it('copies the signals of the vault with their images, links converted', async () => {
    await vaultWith({
      'Signals/007-dale-memoria.es.md': SIGNAL_007,
      'Signals/006-cinco-preguntas.es.md': SIGNAL_006,
      'Signals/_plantilla.md': 'Not a signal.',
      'Adjuntos/esquema.png': 'png',
      'Ideas/otra nota.md': 'Private.',
    });
    const report = await importSignals({ vaultDir: vault, outDir: out });

    expect(report.imported).toEqual(
      expect.arrayContaining([
        { name: '007-dale-memoria.es', draft: true },
        { name: '006-cinco-preguntas.es', draft: false },
      ]),
    );
    expect(report.media).toEqual(['media/007/esquema.png']);
    const signal = await readFile(join(out, '007-dale-memoria.es.md'), 'utf8');
    expect(signal).toContain('number: 7\nlang: es');
    expect(signal).toContain('Como conté en [la anterior](/cinco-preguntas), esto va así.');
    expect(signal).toContain('![El esquema](./media/007/esquema.png)');
    expect(await readFile(join(out, 'media/007/esquema.png'), 'utf8')).toBe('png');
    expect((await readdir(out)).sort()).toEqual([
      '006-cinco-preguntas.es.md',
      '007-dale-memoria.es.md',
      'media',
    ]);
  });

  it('writes nothing when a single note is wrong, and says why', async () => {
    await vaultWith({
      'Signals/007-dale-memoria.es.md': SIGNAL_007,
      'Signals/006-cinco-preguntas.es.md': SIGNAL_006.replace('topic: practica', 'topic: news'),
      'Adjuntos/esquema.png': 'png',
    });
    const error = await importSignals({ vaultDir: vault, outDir: out }).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ImportError);
    expect((error as ImportError).problems.join('\n')).toMatch(
      /006-cinco-preguntas\.es\.md: topic/,
    );
    expect(await readdir(out)).toEqual([]);
  });

  it('refuses long dashes, a name that does not follow the properties and a missing image', async () => {
    await vaultWith({
      'Signals/007-dale-memoria.es.md': SIGNAL_007,
      'Signals/cinco preguntas.md': SIGNAL_006.replace('Compila', 'Compila — y'),
    });
    const error = (await importSignals({ vaultDir: vault, outDir: out }).catch(
      (e: unknown) => e,
    )) as ImportError;
    const problems = error.problems.join('\n');
    expect(problems).toMatch(/name it 006-cinco-preguntas\.es\.md/);
    // Line 12 of the note: the 8 properties and their 2 fences, a blank line, then the text.
    expect(problems).toMatch(/long dash \(—\) on line 12/);
    expect(problems).toMatch(/esquema\.png is not in the vault/);
  });

  it('refuses two notes with the same number and language', async () => {
    await vaultWith({
      'Signals/006-cinco-preguntas.es.md': SIGNAL_006,
      'Signals/Borradores/006-cinco-preguntas.es.md': SIGNAL_006,
    });
    const error = (await importSignals({ vaultDir: vault, outDir: out }).catch(
      (e: unknown) => e,
    )) as ImportError;
    expect(error.problems.join('\n')).toMatch(/both signal 006 in es/);
  });

  it('only deletes the signals that left the vault when asked to', async () => {
    await vaultWith({ 'Signals/006-cinco-preguntas.es.md': SIGNAL_006 });
    await mkdir(join(out, 'media/005'), { recursive: true });
    await writeFile(join(out, '005-vieja.es.md'), 'old');

    const kept = await importSignals({ vaultDir: vault, outDir: out });
    expect(kept.extra).toEqual(['005-vieja.es.md']);
    expect(await readdir(out)).toContain('005-vieja.es.md');

    const pruned = await importSignals({ vaultDir: vault, outDir: out, prune: true });
    expect(pruned.pruned).toEqual(['005-vieja.es.md', 'media/005']);
    expect((await readdir(out)).sort()).toEqual(['006-cinco-preguntas.es.md', 'media']);
  });
});
