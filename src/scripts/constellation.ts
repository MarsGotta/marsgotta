/**
 * The filter of the tech constellation: CSS lights up the stars of the project in `data-p`. The
 * grouped list keeps only that project's technologies, and leaves out the groups left empty. On
 * narrow screens that list is the one on screen, so it hides them for everyone, not only for
 * assistive tech: what a screen reader skips is never still in sight.
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
          item.hidden = filter !== 'all' && !used;
        });
        root.querySelectorAll<HTMLElement>('.techlist > div').forEach((group) => {
          group.hidden = !group.querySelector('.item:not([hidden])');
        });
      });
    });
  });
}
