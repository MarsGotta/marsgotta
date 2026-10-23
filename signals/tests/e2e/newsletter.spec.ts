import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { article } from './pages';

/**
 * A visitor IP of its own for each test and run: the Worker allows five signups a minute per IP,
 * and wrangler dev keys the limit on the CF-Connecting-IP the request brings.
 */
async function asNewVisitor(page: Page, info: TestInfo) {
  let hash = 0;
  for (const char of `${info.testId}:${info.project.name}:${Date.now()}`) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  }
  const ip = `10.${(hash >> 16) & 255}.${(hash >> 8) & 255}.${hash & 255}`;
  await page.setExtraHTTPHeaders({
    Referer: `${info.project.use.baseURL}/`,
    'CF-Connecting-IP': ip,
  });
}

test.describe('with JavaScript', () => {
  test('a mistyped address is pointed out on its field', async ({ page }) => {
    await page.goto('/');
    const form = page.getByRole('form', { name: 'Suscripción a la newsletter' });
    const field = form.getByRole('textbox', { name: 'Tu email' });
    await field.fill('ana@');
    await form.getByRole('button', { name: 'Suscribirme' }).click();
    await expect(form.getByRole('alert')).toHaveText('Ese email no parece válido. ¿Lo revisas?');
    await expect(field).toHaveAttribute('aria-invalid', 'true');
    await expect(field).toBeFocused();
  });

  test('one signup turns every form of the page to the confirmation', async ({ page }, info) => {
    await asNewVisitor(page, info);
    await page.goto(article.en);
    const form = page.getByRole('form', { name: 'I will let you know about the next signal.' });
    await form.getByRole('textbox', { name: 'Your email' }).fill('ana@example.com');
    await form.getByRole('button', { name: 'Subscribe' }).click();
    const confirmations = page.getByRole('status').filter({ hasText: 'Almost there.' });
    await expect(confirmations).toHaveCount(2);
    await expect(confirmations.first()).toBeVisible();
    await expect(page.getByRole('form')).toHaveCount(0);
    await expect(page.locator('[data-sent]:focus')).toHaveCount(1);
  });
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('the browser checks the address before sending it', async ({ page }) => {
    await page.goto('/');
    const form = page.getByRole('form', { name: 'Suscripción a la newsletter' });
    await form.getByRole('textbox', { name: 'Tu email' }).fill('ana');
    await form.getByRole('button', { name: 'Suscribirme' }).click();
    await expect(page).toHaveURL(/\/$/);
  });

  test('the Worker answers on the same page, on the form that was used', async ({ page }, info) => {
    await asNewVisitor(page, info);
    await page.goto(article.es);
    const form = page.getByRole('form', { name: 'Te aviso de la próxima señal.' });
    // Valid for the browser, not for the Worker.
    await form.getByRole('textbox', { name: 'Tu email' }).fill('ana@b');
    await form.getByRole('button', { name: 'Suscribirme' }).click();
    await expect(page).toHaveURL(new RegExp(`${article.es}#nl-invalid-post$`));
    // Only the form that was used shows the error.
    const errors = page.getByText('Ese email no parece válido. ¿Lo revisas?');
    await expect(errors.filter({ visible: true })).toHaveCount(1);
    await expect(form.getByText('Ese email no parece válido. ¿Lo revisas?')).toBeVisible();

    await form.getByRole('textbox', { name: 'Tu email' }).fill('ana@example.com');
    await form.getByRole('button', { name: 'Suscribirme' }).click();
    await expect(page).toHaveURL(new RegExp(`${article.es}#nl-sent-post$`));
    await expect(
      page.getByText('Revisa tu correo y confirma la suscripción.').first(),
    ).toBeVisible();
    await expect(page.locator('form:visible')).toHaveCount(0);
  });
});
