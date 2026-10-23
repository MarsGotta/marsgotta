import { describe, expect, it } from 'vitest';
import { leakedSamples } from './signals-check-build-rules';

const note = (slug: string) => `---\nnumber: 1\nslug: ${slug}\n---\n\nText.`;

describe('leakedSamples', () => {
  const samples = [note('senales-de-la-semana-11'), note("'dale-memoria'")];
  const content = [note('dale-memoria')];

  it('finds the pages and cards of samples in the build', () => {
    const built = [
      'index.html',
      'senales-de-la-semana-11.html',
      'en/archive.html',
      'og/es/senales-de-la-semana-11.jpg',
    ];
    expect(leakedSamples({ samples, content, built })).toEqual([
      'senales-de-la-semana-11.html',
      'og/es/senales-de-la-semana-11.jpg',
    ]);
  });

  it('lets a real signal through even when a sample shares its slug', () => {
    expect(leakedSamples({ samples, content, built: ['dale-memoria.html'] })).toEqual([]);
  });
});
