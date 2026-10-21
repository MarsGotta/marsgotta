import { expect, test } from '@playwright/test';

test.describe('about', () => {
  test('the constellation lights up the technologies of a project', async ({ page, viewport }) => {
    await page.goto('/sobre-mi');
    const filter = page.getByRole('group', { name: 'Filtrar por proyecto' });
    await filter.getByRole('button', { name: 'Jezero' }).click();
    await expect(filter.getByRole('button', { name: 'Jezero' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await expect(filter.getByRole('button', { name: 'Todo' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
    const wide = (viewport?.width ?? 0) > 860;
    const items = page.locator(wide ? '.star' : '.item');
    const lit = items.filter({ hasText: 'SQLite' });
    const dim = items.filter({ hasText: 'Next.js' });
    const colorOf = (locator: typeof lit) => locator.evaluate((el) => getComputedStyle(el).color);
    expect(await colorOf(lit)).not.toBe(await colorOf(dim));
  });

  test('lists six roles with machine-readable start years', async ({ page }) => {
    await page.goto('/en/about');
    const roles = page.locator('.roles time');
    await expect(roles).toHaveCount(6);
    await expect(roles.first()).toHaveAttribute('datetime', '2014');
  });
});

test.describe('projects', () => {
  test('links to each chapter and never to the Orbit repository', async ({ page }) => {
    await page.goto('/proyectos');
    for (const project of ['kimen', 'jezero', 'orbit']) {
      await expect(page.locator(`#${project}`)).toBeVisible();
    }
    await expect(page.locator('a[href*="MarsGotta/orbit"]')).toHaveCount(0);
    await expect(page.getByText('Repo público al abrir la beta')).toBeVisible();
  });
});

test.describe('talks', () => {
  test('lists talks and teaching, most recent first', async ({ page }) => {
    await page.goto('/charlas');
    await expect(page.locator('.talk')).toHaveCount(5);
    await expect(page.locator('.talk time').first()).toHaveText('2025 – hoy');
  });
});

test.describe('contact', () => {
  test('the form has labelled, required fields and falls back to email', async ({ page }) => {
    await page.goto('/contacto');
    const form = page.getByRole('form', { name: 'Formulario de contacto' });
    for (const label of ['Tu nombre', 'Tu email', 'Cuéntame']) {
      await expect(form.getByLabel(label)).toHaveAttribute('required', '');
    }
    await expect(page.getByRole('link', { name: /me@marcelagotta.com/ }).first()).toHaveAttribute(
      'href',
      'mailto:me@marcelagotta.com',
    );
  });
});
