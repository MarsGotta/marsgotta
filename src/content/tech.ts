import type { Messages } from '../i18n';
import type { ProjectKey } from './projects';

/** A technology in the constellation on the About page. */
export interface TechStar {
  /** The technology's name, or a key of `about` in the copy when it is translated. */
  label: string | { copy: keyof Messages['about'] };
  /** Position in the constellation, in % of its width and height. */
  x: number;
  y: number;
  /** Index of its group in `about.groups`: languages, frontend, design systems, quality, agents. */
  group: number;
  /** Projects that really use it: they light it up when picked in the filter. */
  projects?: ProjectKey[];
  learning?: boolean;
}

export const techStars: TechStar[] = [
  { label: 'TypeScript', x: 7, y: 20, group: 0, projects: ['kimen'] },
  { label: 'JavaScript', x: 18, y: 15, group: 0 },
  { label: 'Node.js', x: 24, y: 28, group: 0 },
  { label: 'HTML', x: 5, y: 34, group: 0 },
  { label: 'CSS', x: 14, y: 41, group: 0 },
  { label: 'Python', x: 22, y: 49, group: 0, projects: ['jezero', 'orbit'], learning: true },
  { label: 'Rust', x: 6, y: 52, group: 0, projects: ['orbit'], learning: true },
  { label: 'React', x: 40, y: 19, group: 1, projects: ['kimen', 'orbit'] },
  { label: 'Next.js', x: 51, y: 14, group: 1 },
  { label: 'Angular', x: 36, y: 33, group: 1, projects: ['kimen'] },
  { label: 'Vue', x: 47, y: 29, group: 1, projects: ['kimen'] },
  { label: 'Lit', x: 59, y: 22, group: 1 },
  { label: 'Stencil', x: 55, y: 37, group: 1, projects: ['kimen'] },
  { label: 'Web Components', x: 40, y: 46, group: 1, projects: ['kimen'] },
  { label: 'microfrontends', x: 54, y: 50, group: 1 },
  { label: 'Tauri', x: 63, y: 42, group: 1, projects: ['orbit'] },
  { label: 'design systems', x: 73, y: 20, group: 2 },
  { label: 'design tokens', x: 84, y: 31, group: 2, projects: ['kimen'] },
  { label: { copy: 'a11y' }, x: 74, y: 41, group: 2, projects: ['kimen'] },
  { label: 'Vitest', x: 6, y: 73, group: 3 },
  { label: 'Jest', x: 17, y: 70, group: 3 },
  { label: 'Playwright', x: 26, y: 78, group: 3 },
  { label: 'Testing Library', x: 7, y: 87, group: 3 },
  { label: 'Storybook', x: 22, y: 91, group: 3 },
  { label: 'TDD', x: 33, y: 86, group: 3 },
  { label: 'MCP', x: 59, y: 73, group: 4, projects: ['kimen', 'jezero'] },
  { label: 'AGENTS.md', x: 71, y: 70, group: 4 },
  { label: 'harness engineering', x: 83, y: 77, group: 4 },
  { label: 'SQLite', x: 68, y: 81, group: 4, projects: ['jezero'] },
  { label: 'Linux', x: 52, y: 83, group: 4 },
  { label: { copy: 'rag' }, x: 58, y: 91, group: 4 },
  { label: 'Docker', x: 76, y: 89, group: 4 },
  { label: 'PostgreSQL', x: 87, y: 88, group: 4 },
];

/** Dashed links drawn between the stars a project uses, in the same % coordinates. */
export const techLinks: { project: ProjectKey; from: [number, number]; to: [number, number] }[] = [
  { project: 'kimen', from: [7, 20], to: [55, 37] },
  { project: 'kimen', from: [55, 37], to: [40, 46] },
  { project: 'kimen', from: [40, 46], to: [40, 19] },
  { project: 'kimen', from: [40, 46], to: [47, 29] },
  { project: 'kimen', from: [40, 46], to: [36, 33] },
  { project: 'kimen', from: [55, 37], to: [84, 31] },
  { project: 'kimen', from: [84, 31], to: [74, 41] },
  { project: 'kimen', from: [40, 46], to: [59, 73] },
  { project: 'jezero', from: [22, 49], to: [68, 81] },
  { project: 'jezero', from: [68, 81], to: [59, 73] },
  { project: 'orbit', from: [63, 42], to: [40, 19] },
  { project: 'orbit', from: [63, 42], to: [6, 52] },
  { project: 'orbit', from: [6, 52], to: [22, 49] },
];
