import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

const SENT = 'Recibido. Te contesto en unos días.';

// The endpoint is mocked: these tests never send a real email, even against production.
async function mockEndpoint(page: Page, status: number) {
  const bodies: string[] = [];
  await page.route('**/api/contact', async (route) => {
    bodies.push(route.request().postData() ?? '');
    await route.fulfill({ status, json: { ok: status === 200 } });
  });
  return bodies;
}

async function fillForm(page: Page) {
  const form = page.getByRole('form', { name: 'Formulario de contacto' });
  await form.getByLabel('Tu nombre').fill('Ana');
  await form.getByLabel('Tu email').fill('ana@example.com');
  await form.getByLabel('Cuéntame').fill('Hola, Mars.');
  return form;
}

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
});

test('the form has labelled, required fields and the email stays one click away', async ({
  page,
}) => {
  await page.goto('/contacto');
  const form = page.getByRole('form', { name: 'Formulario de contacto' });
  for (const label of ['Tu nombre', 'Tu email', 'Cuéntame']) {
    await expect(form.getByLabel(label)).toHaveAttribute('required', '');
  }
  await expect(form).toHaveAttribute('action', '/api/contact');
  await expect(page.getByRole('link', { name: /me@marsgotta.com/ }).first()).toHaveAttribute(
    'href',
    'mailto:me@marsgotta.com',
  );
});

test('a field with only spaces is pointed out instead of sent', async ({ page }) => {
  const bodies = await mockEndpoint(page, 200);
  await page.goto('/contacto');
  const form = await fillForm(page);
  const name = form.getByLabel('Tu nombre');
  await name.fill('   ');
  await form.getByRole('button', { name: 'Enviar' }).click();
  await expect(name).toBeFocused();
  await expect(name).toHaveAttribute('aria-invalid', 'true');
  expect(bodies).toHaveLength(0);
  await name.fill('Ana');
  await expect(name).not.toHaveAttribute('aria-invalid');
});

test('sending replaces the form with the confirmation and moves focus to it', async ({ page }) => {
  const bodies = await mockEndpoint(page, 200);
  await page.goto('/contacto');
  const form = await fillForm(page);
  await form.getByRole('button', { name: 'Enviar' }).click();

  const status = page.getByRole('status');
  await expect(status).toHaveText(SENT);
  await expect(status).toBeFocused();
  await expect(form).toBeHidden();
  expect(bodies).toHaveLength(1);
  for (const value of ['Ana', 'ana@example.com', 'Hola, Mars.', 'name="lang"\r\n\r\nes']) {
    expect(bodies[0]).toContain(value);
  }
  const results = await new AxeBuilder({ page }).include('[data-contact]').analyze();
  expect(results.violations).toEqual([]);
});

test('a failed send keeps what was written and says so', async ({ page }) => {
  await mockEndpoint(page, 502);
  await page.goto('/en/contact');
  const form = page.getByRole('form', { name: 'Contact form' });
  await form.getByLabel('Your name').fill('Ana');
  await form.getByLabel('Your email').fill('ana@example.com');
  await form.getByLabel('Tell me').fill('Hello');
  await form.getByRole('button', { name: 'Send' }).click();

  const error = page.locator('#contact-error');
  await expect(error).toBeVisible();
  await expect(error).toBeFocused();
  await expect(form.getByLabel('Tell me')).toHaveValue('Hello');
  await expect(form.getByRole('button', { name: 'Send' })).toBeEnabled();
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('the redirect fragment shows the confirmation', async ({ page }) => {
    await page.goto('/contacto#contact-sent');
    await expect(page.getByRole('status')).toHaveText(SENT);
    await expect(page.getByRole('form', { name: 'Formulario de contacto' })).toBeHidden();
  });

  test('the redirect fragment shows the error in the form', async ({ page }) => {
    await page.goto('/en/contact#contact-error');
    await expect(page.locator('#contact-error')).toBeVisible();
    await expect(page.getByRole('form', { name: 'Contact form' })).toBeVisible();
  });
});
