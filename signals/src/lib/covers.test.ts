import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { describe, expect, it } from 'vitest';
import { generateCover, type CoverKind, type Topic } from './covers';

interface PrototypeShape {
  d: string;
  fill: string;
  stroke: string;
  sw: number;
  op: number;
}
type PrototypeCover = (
  kind: string,
  topic: string,
  seed: number,
) => {
  bg: string;
  shapes: PrototypeShape[];
};

/**
 * The prototype's own sgCover, from the repo's design/signals/extracted/logic.js: the reference the
 * covers must match. It runs in an isolated context, with nothing of the test in reach.
 */
function prototypeCover(): PrototypeCover {
  const logic = readFileSync('design/signals/extracted/logic.js', 'utf8');
  const covers = logic.slice(logic.indexOf('function sgRand('), logic.indexOf('function sgTok('));
  const sandbox: { sgCover?: PrototypeCover } = {};
  runInNewContext(`${covers}\nthis.sgCover = sgCover;`, sandbox);
  if (!sandbox.sgCover) throw new Error('sgCover not found in the prototype logic');
  return sandbox.sgCover;
}

const kinds: CoverKind[] = ['strata', 'dunes', 'orbits', 'signal'];
const topics: Topic[] = ['ia', 'practica', 'tutorial'];

describe('generateCover', () => {
  const sgCover = prototypeCover();

  for (const kind of kinds) {
    it(`draws the ${kind} covers exactly as the prototype`, () => {
      for (const topic of topics) {
        for (let signal = 1; signal <= 12; signal++) {
          const ours = generateCover(kind, topic, signal);
          const theirs = sgCover(kind, topic, signal);
          expect(ours.background).toBe(theirs.bg);
          expect(ours.shapes).toEqual(
            theirs.shapes.map(({ d, fill, stroke, sw, op }) => ({
              d,
              fill,
              stroke,
              strokeWidth: sw,
              opacity: op,
            })),
          );
        }
      }
    });
  }

  it('gives each signal its own cover', () => {
    expect(generateCover('strata', 'tutorial', 7)).not.toEqual(
      generateCover('strata', 'tutorial', 8),
    );
  });
});
