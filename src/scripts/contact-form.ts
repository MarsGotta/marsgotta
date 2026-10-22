import type { ContactOutcome } from '../lib/contact';

/**
 * Sends the contact form in the background and shows the outcome in place. Without JavaScript the
 * browser posts the form itself and the Worker redirects back to the outcome's fragment.
 */
export function initContactForms(): void {
  document.querySelectorAll<HTMLElement>('[data-contact]').forEach((box) => {
    const form = box.querySelector('form');
    const submit = form?.querySelector('button');
    if (!form || !submit) return;

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      submit.disabled = true;
      const outcome = await send(form);
      submit.disabled = false;
      box.dataset.state = outcome;
      // The form disappears on success: focus moves to the outcome so it is not lost, and is read.
      box.querySelector<HTMLElement>(`[data-outcome="${outcome}"]`)?.focus();
    });
  });
}

async function send(form: HTMLFormElement): Promise<ContactOutcome> {
  try {
    const response = await fetch(form.action, {
      method: 'POST',
      body: new FormData(form),
      headers: { Accept: 'application/json' },
    });
    return response.ok ? 'sent' : 'error';
  } catch {
    return 'error';
  }
}
