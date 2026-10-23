import { projectKeys, type ProjectKey } from '../content/projects';

export type ManifestoToken =
  /** The word keeps its trailing space, so the paragraph reads (and copies) as plain text. */
  { kind: 'word'; text: string } | { kind: 'project'; key: ProjectKey };

function isProjectKey(value: string): value is ProjectKey {
  return (projectKeys as readonly string[]).includes(value);
}

/** Plain sentences become one token per word; '@kimen', '@jezero' and '@orbit' become a pill each. */
export function manifestoTokens(segments: string[]): ManifestoToken[] {
  return segments.flatMap((segment): ManifestoToken[] => {
    if (!segment.startsWith('@')) {
      return segment.split(' ').map((word) => ({ kind: 'word', text: `${word} ` }));
    }
    const key = segment.slice(1);
    if (!isProjectKey(key)) throw new Error(`The manifesto names an unknown project: ${segment}`);
    return [{ kind: 'project', key }];
  });
}
