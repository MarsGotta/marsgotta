function slugOf(note: string): string | undefined {
  return /^slug:\s*['"]?([a-z0-9-]+)['"]?\s*$/m.exec(note)?.[1];
}

/**
 * The built files that belong to a test sample: its page or its Open Graph card. A sample that
 * shares its slug with a real signal, like 007, cannot be told apart and is not checked.
 */
export function leakedSamples(build: {
  samples: string[];
  content: string[];
  built: string[];
}): string[] {
  const real = new Set(build.content.map(slugOf));
  const sampleOnly = new Set(build.samples.map(slugOf).filter((slug) => !real.has(slug)));
  return build.built.filter((file) => {
    const name = file
      .split('/')
      .pop()
      ?.replace(/\.(html|jpg)$/, '');
    return name !== undefined && sampleOnly.has(name);
  });
}
