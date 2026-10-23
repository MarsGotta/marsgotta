/**
 * «Copiar enlace» and the «Copiar» of the code blocks, with the Clipboard API. Without JS neither
 * shows, so there is no button that does nothing. The result is said in the button itself, an
 * aria-live region, and the label comes back after a moment; without the Clipboard API, it says
 * «No se pudo copiar».
 */
const RESET_MS = 2200;

interface Labels {
  label: string;
  done: string;
  failed: string;
}

function wire(button: HTMLButtonElement, text: HTMLElement, labels: Labels, read: () => string) {
  let timer = 0;
  text.textContent = labels.label;
  button.setAttribute('aria-live', 'polite');
  button.hidden = false;
  button.addEventListener('click', async () => {
    window.clearTimeout(timer);
    try {
      await navigator.clipboard.writeText(read());
      button.dataset.state = 'done';
      text.textContent = labels.done;
    } catch {
      button.dataset.state = 'failed';
      text.textContent = labels.failed;
    }
    timer = window.setTimeout(() => {
      delete button.dataset.state;
      text.textContent = labels.label;
    }, RESET_MS);
  });
}

export function initCopyButtons(): void {
  document.querySelectorAll<HTMLButtonElement>('[data-copy-link]').forEach((button) => {
    const text = button.querySelector<HTMLElement>('[data-copy-text]');
    const { copyLink = '', label = '', done = '', failed = '' } = button.dataset;
    if (text) wire(button, text, { label, done, failed }, () => copyLink);
  });

  document.querySelectorAll<HTMLElement>('[data-copy-label]').forEach((prose) => {
    const labels = {
      label: prose.dataset.copyLabel ?? '',
      done: prose.dataset.copyDone ?? '',
      failed: prose.dataset.copyFailed ?? '',
    };
    prose.querySelectorAll<HTMLButtonElement>('[data-copy-code]').forEach((button) => {
      const text = button.querySelector<HTMLElement>('span');
      const code = button.closest('figure')?.querySelector('pre');
      if (text && code) wire(button, text, labels, () => code.textContent ?? '');
    });
  });
}
