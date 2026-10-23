import { describe, expect, it } from 'vitest';
import { codeFigure, codeTitle } from './code-figure';

interface Node {
  type: string;
  tagName?: string;
  properties?: Record<string, unknown>;
  children?: Node[];
  value?: string;
}

/** Every element of a tree, parents before children. */
function* elements(node: Node): Generator<Node> {
  if (node.type === 'element') yield node;
  for (const child of node.children ?? []) yield* elements(child);
}

/** Runs the transformer on one block, as Shiki would. */
function run(meta: string | undefined, lang = 'sql'): { figure: Node; pre: Node } {
  const transformer = codeFigure();
  const context = { options: { lang, meta: { __raw: meta } } };
  const pre: Node = {
    type: 'element',
    tagName: 'pre',
    properties: { className: ['shiki'], style: 'background-color:#1C1418' },
    children: [{ type: 'element', tagName: 'code', properties: {}, children: [] }],
  };
  transformer.pre?.call(context as never, pre as never);
  const root = transformer.root?.call(context as never, { type: 'root', children: [pre] } as never);
  const figure = (root as Node | undefined)?.children?.[0];
  if (!figure) throw new Error('No figure');
  return { figure, pre };
}

describe('codeTitle', () => {
  it('reads the file name from the meta of the fence', () => {
    expect(codeTitle('title="schema.sql"')).toBe('schema.sql');
    expect(codeTitle("title='memory.py' {1,3}")).toBe('memory.py');
    expect(codeTitle(undefined)).toBeUndefined();
  });
});

describe('codeFigure', () => {
  it('wraps the block in a figure with its file bar', () => {
    const { figure } = run('title="schema.sql"');
    expect(figure.tagName).toBe('figure');
    expect(figure.children?.map((child) => child.tagName)).toEqual(['figcaption', 'pre']);
    expect(JSON.stringify(figure.children?.[0])).toContain('schema.sql');
  });

  it('names the language when there is no file name', () => {
    expect(JSON.stringify(run(undefined, 'python').figure)).toContain('python');
  });

  it('keeps the copy button hidden until the script labels it', () => {
    const button = [...elements(run('').figure)].find((node) => node.tagName === 'button');
    expect(button?.properties?.hidden).toBe(true);
  });

  it('drops the inline background, so the theme of the page decides it', () => {
    const { pre } = run('');
    expect(pre.properties?.style).toBeUndefined();
  });
});
