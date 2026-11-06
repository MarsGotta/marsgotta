import { describe, expect, it } from 'vitest';
import { llmsTxt } from './llms';

const text = llmsTxt(new URL('https://marsgotta.com'));

describe('llms.txt', () => {
  it('follows the llmstxt.org shape: a title, a summary and sections of links', () => {
    expect(text).toMatch(
      /^# Marcela Gotta\n\n> Senior Software Engineer · Building agent infrastructure\. I'm Marcela Gotta/,
    );
    expect(text).toContain('- [About](https://marsgotta.com/en/about): ');
    expect(text).toContain('## Optional\n\n- [Español](https://marsgotta.com/)');
    expect(text).toContain('## Blog\n\n- [Signals by Mars](https://signals.marsgotta.com/en): ');
  });

  it('links each project to its site or repository', () => {
    expect(text).toContain('- [Kimen](https://kimen.dev): ');
    expect(text).toContain('Code: https://github.com/kimen-dev/kimen');
    expect(text).toContain('- [Jezero](https://jezero.marsgotta.com): ');
    expect(text).toContain('Code: https://github.com/MarsGotta/jezero');
    expect(text).toContain('- [Orbit](https://marsgotta.com/en/projects#orbit): ');
    expect(text).toContain('Code: https://github.com/MarsGotta/orbit');
    expect(text).toContain('- [Gate-Driven Development (GDD)](https://gate-driven.dev/en/): ');
  });

  it('keeps to the brand rules', () => {
    expect(text).not.toContain('—');
  });
});
