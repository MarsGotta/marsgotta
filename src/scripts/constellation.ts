/** The filter of the tech constellation: CSS lights up the stars of the project in `data-p`. */
export function initConstellations(): void {
  document.querySelectorAll<HTMLElement>('[data-constellation]').forEach((root) => {
    const buttons = root.querySelectorAll<HTMLButtonElement>('[data-filter]');
    buttons.forEach((button) => {
      button.addEventListener('click', () => {
        root.dataset.p = button.dataset.filter;
        buttons.forEach((other) => other.setAttribute('aria-pressed', String(other === button)));
      });
    });
  });
}
