import { prefersReducedMotion } from '../lib/motion';

export type Theme = 'dark' | 'light';

const STORAGE_KEY = 'theme';
/** The sunrise covers the screen before the colours change, then fades out (see `.dawn`). */
const DAWN_SWAP_MS = 560;
const DAWN_END_MS = 1300;

let pending: number[] = [];

export function currentTheme(): Theme {
  return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
}

function syncTitles(): void {
  const key = currentTheme() === 'dark' ? 'labelDark' : 'labelLight';
  document.querySelectorAll<HTMLButtonElement>('[data-theme-toggle]').forEach((button) => {
    button.title = button.dataset[key] ?? '';
  });
}

function savedTheme(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

/** Only the toggle remembers the theme: until then, the page follows the system. */
function applyTheme(theme: Theme, { remember }: { remember: boolean }): void {
  document.documentElement.dataset.theme = theme;
  if (remember) {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // Private mode or blocked storage: the theme still applies to this page.
    }
  }
  syncTitles();
  document.dispatchEvent(new CustomEvent<Theme>('themechange', { detail: theme }));
}

function toggleTheme(): void {
  const next: Theme = currentTheme() === 'dark' ? 'light' : 'dark';
  pending.forEach((id) => window.clearTimeout(id));
  document.querySelectorAll('.dawn').forEach((dawn) => dawn.remove());

  if (prefersReducedMotion()) {
    applyTheme(next, { remember: true });
    return;
  }

  const dawn = document.createElement('div');
  dawn.className = `dawn dawn--${next}`;
  dawn.setAttribute('aria-hidden', 'true');
  // An open modal menu lives in the top layer, so the sunrise has to go inside it to be seen.
  (document.querySelector('dialog[open]') ?? document.body).append(dawn);
  pending = [
    window.setTimeout(() => applyTheme(next, { remember: true }), DAWN_SWAP_MS),
    window.setTimeout(() => dawn.remove(), DAWN_END_MS),
  ];
}

export function initThemeToggles(): void {
  document.querySelectorAll('[data-theme-toggle]').forEach((button) => {
    button.addEventListener('click', toggleTheme);
  });
  syncTitles();
  // The system can switch while the page is open (automatic dark mode at sunset, for instance).
  window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', (event) => {
    if (!savedTheme()) applyTheme(event.matches ? 'light' : 'dark', { remember: false });
  });
}
