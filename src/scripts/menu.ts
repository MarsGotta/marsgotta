/** Breakpoint where the full navigation replaces the menu button (see Nav.astro). */
const WIDE = '(min-width: 981px)';

export function initMenu(): void {
  const dialog = document.querySelector<HTMLDialogElement>('[data-menu]');
  const openButton = document.querySelector<HTMLButtonElement>('[data-menu-open]');
  if (!dialog || !openButton) return;

  const closeButton = dialog.querySelector<HTMLButtonElement>('[data-menu-close]');

  openButton.addEventListener('click', () => {
    // showModal() makes the rest of the page inert and closes on Escape.
    dialog.showModal();
    closeButton?.focus();
    openButton.setAttribute('aria-expanded', 'true');
  });
  dialog.addEventListener('close', () => openButton.setAttribute('aria-expanded', 'false'));
  closeButton?.addEventListener('click', () => dialog.close());

  window.matchMedia(WIDE).addEventListener('change', (event) => {
    if (event.matches && dialog.open) dialog.close();
  });
}
