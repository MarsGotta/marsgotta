/**
 * The filter of the tech constellation: CSS lights up the stars of the project in `data-p`. For
 * assistive tech, the grouped list keeps only that project's technologies.
 */
export function initConstellations(): void {
  document.querySelectorAll<HTMLElement>('[data-constellation]').forEach((root) => {
    const buttons = root.querySelectorAll<HTMLButtonElement>('[data-filter]');
    buttons.forEach((button) => {
      button.addEventListener('click', () => {
        root.dataset.p = button.dataset.filter;
        buttons.forEach((other) => other.setAttribute('aria-pressed', String(other === button)));
        const filter = button.dataset.filter ?? 'all';
        root.querySelectorAll<HTMLElement>('.techlist .item').forEach((item) => {
          const used = (item.dataset.projects ?? '').split(' ').includes(filter);
          if (filter === 'all' || used) item.removeAttribute('aria-hidden');
          else item.setAttribute('aria-hidden', 'true');
        });
      });
    });
  });
}
