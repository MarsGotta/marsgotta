import { isEmail, type SubscribeOutcome } from '../lib/subscribe';

/**
 * Sends a subscription in the background and shows the outcome in place. Without JavaScript the
 * browser posts the form itself and the Worker redirects back to the outcome's fragment.
 */
export function initSubscribeForms(): void {
  const boxes = [...document.querySelectorAll<HTMLElement>('[data-subscribe]')];
  for (const box of boxes) {
    const form = box.querySelector('form');
    const input = form?.querySelector<HTMLInputElement>('input[type="email"]');
    const submit = form?.querySelector('button');
    const error = box.querySelector<HTMLElement>('[data-error]');
    if (!form || !input || !submit || !error) continue;
    // The copy's own message and focus handling replace the browser's bubble.
    form.noValidate = true;

    const fail = (outcome: Exclude<SubscribeOutcome, 'sent'>) => {
      error.textContent = (outcome === 'invalid' ? box.dataset.invalid : box.dataset.failed) ?? '';
      if (outcome === 'invalid') input.setAttribute('aria-invalid', 'true');
      // Back to the field, so the reader can fix it or try again straight away.
      input.focus();
    };

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      error.textContent = '';
      input.removeAttribute('aria-invalid');
      if (!isEmail(input.value.trim())) return fail('invalid');

      submit.disabled = true;
      const outcome = await send(form);
      submit.disabled = false;
      if (outcome !== 'sent') return fail(outcome);

      // One signup is enough: every form on the page turns to the confirmation.
      for (const other of boxes) other.dataset.state = 'sent';
      // The form disappears: focus moves to the confirmation so it is not lost, and is read.
      box.querySelector<HTMLElement>('[data-sent]')?.focus();
    });
  }
}

async function send(form: HTMLFormElement): Promise<SubscribeOutcome> {
  try {
    const response = await fetch(form.action, {
      method: 'POST',
      body: new FormData(form),
      headers: { Accept: 'application/json' },
    });
    if (response.ok) return 'sent';
    return response.status === 400 ? 'invalid' : 'failed';
  } catch {
    return 'failed';
  }
}
