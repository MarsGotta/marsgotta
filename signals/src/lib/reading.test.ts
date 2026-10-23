import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { readingMinutes } from './reading';

describe('readingMinutes', () => {
  it('divides the words by 230 and rounds up', () => {
    expect(readingMinutes('word '.repeat(230))).toBe(1);
    expect(readingMinutes('word '.repeat(231))).toBe(2);
  });

  it('ignores the frontmatter and Markdown marks on their own', () => {
    expect(readingMinutes('---\ntitle: "A long title"\n---\n\n## Heading\n\n- one\n')).toBe(1);
  });

  it('reads signal 007 in three minutes', () => {
    const signal = readFileSync(
      'design/signals/content/ejemplos/007-dale-memoria-a-tus-agentes-con-sqlite.es.md',
      'utf8',
    );
    expect(readingMinutes(signal)).toBe(3);
  });
});
