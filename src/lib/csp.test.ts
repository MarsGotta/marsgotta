import { describe, expect, it } from 'vitest';
import { contentSecurityPolicy, inlineScripts, withPolicy } from './csp';

describe('inlineScripts', () => {
  it('finds the scripts a page runs inline, not the files or the structured data', () => {
    const html = [
      '<script>document.documentElement.dataset.theme = "light";</script>',
      '<script type="module">import("/_astro/planet.js")</script>',
      '<script type="module" src="/_astro/menu.js"></script>',
      '<script type="application/ld+json">{"@type":"Person"}</script>',
    ].join('');
    expect(inlineScripts(html)).toEqual([
      'document.documentElement.dataset.theme = "light";',
      'import("/_astro/planet.js")',
    ]);
  });
});

describe('contentSecurityPolicy', () => {
  const policy = contentSecurityPolicy(['b=', 'a=', 'a=']);

  it('allows the site itself and each inline script by its hash, once', () => {
    expect(policy).toContain("script-src 'self' 'sha256-a=' 'sha256-b='; ");
  });

  it('keeps everything else to the site, and the site out of other frames', () => {
    expect(policy).toMatch(/^default-src 'self'; /);
    expect(policy).toContain("object-src 'none'");
    expect(policy).toContain("base-uri 'none'");
    expect(policy).toContain("frame-ancestors 'none'");
    expect(policy).not.toContain('unsafe-eval');
  });
});

describe('withPolicy', () => {
  it('adds the policy to the rule for every path, keeping its other headers', () => {
    const file = '# Headers\n/*\n  X-Frame-Options: DENY\n\n/fonts/*\n  Cache-Control: max-age=1\n';
    expect(withPolicy(file, "default-src 'self'")).toBe(
      "# Headers\n/*\n  Content-Security-Policy: default-src 'self'\n  X-Frame-Options: DENY\n\n/fonts/*\n  Cache-Control: max-age=1\n",
    );
  });

  it('fails the build if there is no such rule', () => {
    expect(() => withPolicy('/fonts/*\n', 'x')).toThrow();
  });
});
