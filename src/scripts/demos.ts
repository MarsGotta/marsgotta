/** Plays each project demo once, when at least 30 % of its stage is on screen. */
export function initDemoStages(): void {
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-play');
        observer.unobserve(entry.target);
      }
    },
    { threshold: 0.3 },
  );
  document.querySelectorAll('[data-demo-stage]').forEach((stage) => observer.observe(stage));
}
