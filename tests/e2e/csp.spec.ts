import { expect, test, type Page } from '@playwright/test';
import { routes } from './routes';

/** Collects every resource or script the Content-Security-Policy blocks. */
async function watchViolations(page: Page): Promise<() => Promise<string[]>> {
  await page.addInitScript(() => {
    const seen: string[] = [];
    (window as unknown as { cspViolations: string[] }).cspViolations = seen;
    document.addEventListener('securitypolicyviolation', (event) => {
      seen.push(`${event.effectiveDirective} ${event.blockedURI}`);
    });
  });
  return () =>
    page.evaluate(() => (window as unknown as { cspViolations: string[] }).cspViolations);
}

test.describe('content security policy', () => {
  test.skip(
    ({ viewport }) => (viewport?.width ?? 0) < 600,
    'The policy is the same on every device',
  );

  for (const route of routes) {
    test(`${route} runs with nothing blocked`, async ({ page }) => {
      const violations = await watchViolations(page);
      const response = await page.goto(route);
      expect(response?.headers()['content-security-policy']).toContain("default-src 'self'");
      // Reaching the end loads what waits for the scroll: the planet, the demos, the constellation.
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForLoadState('networkidle');
      await page.locator('[data-theme-toggle]').first().click();
      expect(await violations()).toEqual([]);
    });
  }

  test('the contact form sends through fetch with nothing blocked', async ({ page }) => {
    const violations = await watchViolations(page);
    await page.route('**/api/contact', (route) => route.fulfill({ json: { ok: true } }));
    await page.goto('/contacto');
    const form = page.getByRole('form', { name: 'Formulario de contacto' });
    await form.getByLabel('Tu nombre').fill('Ana');
    await form.getByLabel('Tu email').fill('ana@example.com');
    await form.getByLabel('Cuéntame').fill('Hola, Mars.');
    await form.getByRole('button', { name: 'Enviar' }).click();
    await expect(page.getByRole('status')).toHaveText('Recibido. Te contesto en unos días.');
    expect(await violations()).toEqual([]);
  });

  test('pages, files and the API all carry the security headers', async ({ request }) => {
    for (const path of ['/', '/en/about', '/robots.txt', '/no-existe', '/api/contact']) {
      const headers = (await request.get(path, { maxRedirects: 0 })).headers();
      expect(headers['strict-transport-security'], path).toBe(
        'max-age=31536000; includeSubDomains',
      );
      expect(headers['x-content-type-options'], path).toBe('nosniff');
    }
    for (const path of ['/', '/robots.txt', '/no-existe']) {
      const headers = (await request.get(path)).headers();
      expect(headers['content-security-policy'], path).toContain("frame-ancestors 'none'");
      expect(headers['cross-origin-opener-policy'], path).toBe('same-origin');
      expect(headers['x-frame-options'], path).toBe('DENY');
    }
    expect((await request.get('/api/contact')).headers()['cache-control']).toBe('no-store');
    // Another site cannot make its visitors send the form: refused before anything is read.
    const crossSite = await request.post('/api/contact', {
      form: { name: 'Ana', email: 'ana@example.com', message: 'Hola', lang: 'es' },
      headers: { Accept: 'application/json', Origin: 'https://evil.example' },
    });
    expect(crossSite.status()).toBe(403);
    expect((await request.get('/llms.txt')).headers()['content-type']).toBe(
      'text/plain; charset=utf-8',
    );
    expect(await (await request.get('/.well-known/security.txt')).text()).toContain(
      'Contact: mailto:me@marsgotta.com',
    );
  });
});
