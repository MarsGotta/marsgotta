import { createHash } from 'node:crypto';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import type { AstroIntegration } from 'astro';
import { contentSecurityPolicy, inlineScripts, withPolicy } from '../lib/csp';

/**
 * Adds the Content-Security-Policy to the built _headers. The hashes of the inline scripts change
 * with every build, so they are read from the pages the build just wrote instead of kept by hand.
 * The portfolio and the blog both use it.
 */
export function contentSecurityPolicyHeader(): AstroIntegration {
  return {
    name: 'content-security-policy',
    hooks: {
      'astro:build:done': async ({ dir }) => {
        const pages = (await readdir(dir, { recursive: true })).filter((file) =>
          file.endsWith('.html'),
        );
        const hashes: string[] = [];
        for (const page of pages) {
          const html = await readFile(new URL(page, dir), 'utf8');
          for (const script of inlineScripts(html)) {
            hashes.push(createHash('sha256').update(script).digest('base64'));
          }
        }
        const headers = new URL('_headers', dir);
        const file = await readFile(headers, 'utf8');
        await writeFile(headers, withPolicy(file, contentSecurityPolicy(hashes)));
      },
    },
  };
}
