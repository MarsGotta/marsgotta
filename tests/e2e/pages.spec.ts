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
    await expect(list.locator('.item', { hasText: 'Next.js' })).toHaveAttribute('hidden', '');
    await expect(list.locator('.item', { hasText: 'SQLite' })).not.toHaveAttribute('hidden');
    // No group is left behind as an empty list.
    for (const group of await list.locator('> div:not([hidden])').all()) {
      await expect(group.getByRole('listitem')).not.toHaveCount(0);
    }
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
  test('shows each chapter with a link to its code', async ({ page }) => {
    await page.goto('/proyectos');
    for (const [project, repository] of [
      ['kimen', 'https://github.com/kimen-dev/kimen'],
      ['jezero', 'https://github.com/MarsGotta/jezero'],
      ['orbit', 'https://github.com/MarsGotta/orbit'],
    ]) {
      const chapter = page.locator(`#${project}`);
      await expect(chapter).toBeVisible();
      await expect(chapter.locator(`a[href="${repository}"]`)).toHaveCount(1);
    }
  });

  test('opens with GDD, the method behind the three, linked to its site', async ({ page }) => {
    for (const [path, site] of [
      ['/proyectos', 'https://gate-driven.dev/'],
      ['/en/projects', 'https://gate-driven.dev/en/'],
    ]) {
      await page.goto(path);
      await expect(page.locator('article').first()).toHaveAttribute('id', 'gdd');
      const method = page.locator('#gdd');
      await expect(method.getByRole('heading', { level: 2 })).toContainText(
        'Gate-Driven Development',
      );
      await expect(method.getByRole('link', { name: /gate-driven\.dev/ })).toHaveAttribute(
        'href',
        site,
      );
      await expect(method.getByRole('link', { name: /T-minus/ })).toHaveAttribute(
        'href',
        'https://github.com/MarsGotta/gdd',
      );
      // Four bullets and the three levels of risk.
      await expect(method.getByRole('listitem')).toHaveCount(7);
    }
    await page.goto('/proyectos');
    await page
      .getByRole('navigation', { name: 'Proyectos de esta página' })
      .getByRole('link', { name: 'GDD' })
      .click();
    await expect(page).toHaveURL(/#gdd$/);
  });
});

test.describe('talks', () => {
  test('lists talks and teaching, most recent first', async ({ page }) => {
    await page.goto('/charlas');
    await expect(page.locator('.talk')).toHaveCount(5);
    await expect(page.locator('.talk time').first()).toHaveText('2025 – hoy');
  });
});
