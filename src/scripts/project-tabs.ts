/**
 * The project system on the home page: tabs, orrery rings and the demo stage show one project.
 * Hovering or focusing a tab, or hovering a ring, also selects it, as in the prototype.
 */
export function initProjectSystems(): void {
  document.querySelectorAll<HTMLElement>('[data-project-system]').forEach((root) => {
    let current = root.querySelector<HTMLElement>('[aria-pressed="true"]')?.dataset.projectTab;

    const select = (project: string | undefined) => {
      if (!project || project === current) return;
      current = project;
      root.querySelectorAll<HTMLElement>('[data-project-tab]').forEach((tab) => {
        tab.setAttribute('aria-pressed', String(tab.dataset.projectTab === project));
      });
      root.querySelectorAll<SVGElement>('[data-orrery-ring]').forEach((ring) => {
        ring.classList.toggle('is-on', ring.dataset.orreryRing === project);
      });
      // Showing a hidden demo restarts its CSS animations, so it plays again when picked.
      root.querySelectorAll<HTMLElement>('[data-project]').forEach((element) => {
        element.hidden = element.dataset.project !== project;
      });
      root.querySelectorAll<HTMLElement>('[data-demo-stage]').forEach((stage) => {
        stage.dataset.active = project;
      });
    };

    root.querySelectorAll<HTMLElement>('[data-project-tab]').forEach((tab) => {
      const pick = () => select(tab.dataset.projectTab);
      tab.addEventListener('click', pick);
      tab.addEventListener('mouseenter', pick);
      tab.addEventListener('focus', pick);
    });
    root.querySelectorAll<SVGElement>('[data-orrery-hit]').forEach((hit) => {
      const pick = () => select(hit.dataset.orreryHit);
      hit.addEventListener('click', pick);
      hit.addEventListener('mouseenter', pick);
    });
  });
}
