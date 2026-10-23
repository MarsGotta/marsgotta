import { expect, test } from '@playwright/test';
import { article } from './pages';

test('the home features the latest signal and lists the rest, with the archive at the end', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Señales entre el ruido.');
  const list = page.getByRole('list', { name: 'Últimas señales' });
  await expect(list.getByRole('listitem')).toHaveCount(5);
  await page.getByRole('link', { name: 'Ver archivo' }).click();
  await expect(page).toHaveURL(/\/archivo$/);
  await expect(
    page.getByRole('list', { name: 'Últimas señales' }).getByRole('listitem'),
  ).toHaveCount(6);
});

test('the topic tabs are links to each topic page', async ({ page }) => {
  await page.goto('/');
  const tabs = page.getByRole('group', { name: 'Temas' });
  await tabs.getByRole('link', { name: 'Práctica' }).click();
  await expect(page).toHaveURL(/\/temas\/practica$/);
  await expect(
    page.getByRole('group', { name: 'Temas' }).getByRole('link', { name: 'Práctica' }),
  ).toHaveAttribute('aria-current', 'page');
});

test('the language switch leads to the translation of a signal', async ({ page }) => {
  // Below 480 px the switch makes way for the theme and the subscribe button (design §4).
  test.skip((page.viewportSize()?.width ?? 0) < 480, 'no language switch on narrow screens');
  await page.goto(article.es);
  await page.getByRole('group', { name: 'Idioma' }).getByRole('link', { name: 'EN' }).click();
  await expect(page).toHaveURL(new RegExp(`${article.en}$`));
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
});

test('an article has its index, and its sections can be reached from it', async ({ page }) => {
  test.skip((page.viewportSize()?.width ?? 0) <= 1180, 'the index shows above 1180 px');
  await page.goto(article.es);
  const index = page.getByRole('navigation', { name: 'En esta señal' });
  const first = index.getByRole('link').first();
  const target = (await first.getAttribute('href')) ?? '';
  await first.click();
  await expect.poll(() => decodeURIComponent(new URL(page.url()).hash)).toBe(target);
  await expect(page.locator(`[id="${target.slice(1)}"]`)).toBeInViewport();
});

test('«Copiar enlace» copies the address of the signal and says so', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto(article.es);
  // By its attribute: its name changes to «Enlace copiado» once clicked.
  const button = page.locator('[data-copy-link]');
  await button.click();
  await expect(button).toHaveText('Enlace copiado');
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
    `https://signals.marsgotta.com${article.es}`,
  );
});

test('the theme button switches to the night and remembers it', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Cambiar al tema oscuro' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.goto('/archivo');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
});

test('a missing page answers 404 in the language of its address', async ({ page }) => {
  const response = await page.goto('/en/no-such-page');
  expect(response?.status()).toBe(404);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('This signal never arrived');
});
