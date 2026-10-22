import { expect, test } from '@playwright/test';

test.describe('about', () => {
  test('screen readers get the technologies as a grouped list, filtered too', async ({ page }) => {
    await page.goto('/sobre-mi');
    const list = page.locator('.techlist');
    await expect(page.locator('.constel')).toHaveAttribute('aria-hidden', 'true');
    await expect(list.getByRole('listitem').filter({ hasText: 'Next.js' })).toHaveCount(1);
    await page
      .getByRole('group', { name: 'Filtrar por proyecto' })
      .getByRole('button', { name: 'Jezero' })
      .click();
    await expect(list.locator('.item', { hasText: 'Next.js' })).toHaveAttribute(
      'aria-hidden',
      'true',
    );
    await expect(list.locator('.item', { hasText: 'SQLite' })).not.toHaveAttribute('aria-hidden');
  });

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
    // Dark theme colours: lit names turn --fg; on wide screens the rest drop to --fg-subtle.
    const wide = (viewport?.width ?? 0) > 860;
    const items = page.locator(wide ? '.star' : '.item');
    await expect(items.filter({ hasText: 'SQLite' })).toHaveCSS('color', 'rgb(255, 245, 238)');
    await expect(items.filter({ hasText: 'Next.js' })).toHaveCSS(
      'color',
      wide ? 'rgb(138, 125, 154)' : 'rgb(169, 156, 184)',
    );
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
