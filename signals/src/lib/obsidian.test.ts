import { describe, expect, it } from 'vitest';
import {
  convertBody,
  longDashLines,
  parseFrontmatter,
  splitNote,
  type ConvertContext,
} from './obsidian';

const context: ConvertContext = {
  signal: (name) =>
    name === '006-cinco-preguntas.es'
      ? { url: '/cinco-preguntas', title: 'Cinco preguntas antes de aceptar código' }
      : undefined,
  media: (fileName) => `./media/007/${fileName}`,
};

describe('splitNote', () => {
  it('separates the properties from the body and counts the lines before it', () => {
    const note = splitNote('---\nnumber: 7\nlang: es\n---\n\nTus agentes olvidan.\n');
    expect(note.frontmatter).toBe('number: 7\nlang: es');
    expect(note.body).toBe('\nTus agentes olvidan.\n');
    expect(note.bodyLine).toBe(5);
  });
});

describe('parseFrontmatter', () => {
  it('reads the properties as Obsidian writes them', () => {
    const data = parseFrontmatter(
      [
        'number: 7',
        'title: "Dale memoria: un solo fichero"',
        "coverCaption: 'Los estratos de Jezero'",
        'publishedAt: 2026-10-21',
        'draft: true',
        'tags:',
        '  - SQLite',
        '  - "Agentes"',
        'aliases: [uno, "dos"]',
        'startHere:',
      ].join('\n'),
    );
    expect(data).toEqual({
      number: 7,
      title: 'Dale memoria: un solo fichero',
      coverCaption: 'Los estratos de Jezero',
      publishedAt: '2026-10-21',
      draft: true,
      tags: ['SQLite', 'Agentes'],
      aliases: ['uno', 'dos'],
      startHere: null,
    });
  });

  it('refuses YAML it cannot read rather than importing half a note', () => {
    expect(() => parseFrontmatter('cover:\n  kind: strata')).toThrow(/Line 2/);
  });
});

describe('convertBody', () => {
  it('links to another signal by its URL and title', () => {
    const { body } = convertBody('Mira [[006-cinco-preguntas.es]].', context);
    expect(body).toBe('Mira [Cinco preguntas antes de aceptar código](/cinco-preguntas).');
  });

  it('keeps the alias and the heading of a link', () => {
    const { body } = convertBody(
      'Ver [[006-cinco-preguntas.es#La lista corta|la lista]].',
      context,
    );
    expect(body).toBe('Ver [la lista](/cinco-preguntas#la-lista-corta).');
  });

  it('leaves links to private notes as plain text', () => {
    const { body } = convertBody(
      'Según [[Ideas/borrador de Jezero|mis notas]] y [[Jezero]].',
      context,
    );
    expect(body).toBe('Según mis notas y Jezero.');
  });

  it('turns embedded images into Markdown images next to the signal', () => {
    const converted = convertBody('![[captura.png|El índice FTS5]]', context);
    expect(converted.body).toBe('![El índice FTS5](./media/007/captura.png)');
    expect(converted.media).toEqual(['captura.png']);
    expect(converted.warnings).toEqual([]);
  });

  it('warns when an image has no description, and a width is not one', () => {
    const converted = convertBody('![[esquema.png|400]]', context);
    expect(converted.body).toBe('![](./media/007/esquema.png)');
    expect(converted.warnings[0]).toMatch(/esquema\.png/);
  });

  it('refuses to embed a whole note', () => {
    expect(convertBody('![[Ideas]]', context).errors[0]).toMatch(/Ideas/);
  });

  it('drops comments and keeps the tip callouts as they are', () => {
    const { body } = convertBody(
      'Hola %%quitar antes de publicar%%mundo\n\n> [!TIP]\n> Usa FTS5.',
      context,
    );
    expect(body).toBe('Hola mundo\n\n> [!TIP]\n> Usa FTS5.');
  });

  it('never touches code', () => {
    const markdown = "Usa `[[x]]` así:\n\n```sql\nSELECT '[[y]]'; -- %%z%%\n```\n";
    expect(convertBody(markdown, context).body).toBe(markdown);
  });
});

describe('longDashLines', () => {
  it('finds long dashes in the prose, by line of the note', () => {
    const note = splitNote(
      '---\nlang: es\n---\nUna idea — y otra.\nBien.\n\n```js\n// a — b\n```\n',
    );
    expect(longDashLines(note)).toEqual([4]);
  });

  it('ignores them in inline code', () => {
    expect(longDashLines(splitNote('Usa `a — b` aquí.'))).toEqual([]);
  });
});
