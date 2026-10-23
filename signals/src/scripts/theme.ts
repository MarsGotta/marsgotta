/**
 * The theme toggle. The page follows the system until the visitor picks a theme, which is then
 * remembered. Light («papel») is the default and has no attribute; dark sets data-theme="dark".
 * The portfolio's toggle does not fit here: dark is its default, and it plays a sunrise.
 */
type Theme = 'light' | 'dark';

const STORAGE_KEY = 'theme';

function currentTheme(): Theme {
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
}

function savedTheme(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function syncLabels(): void {
  const key = currentTheme() === 'dark' ? 'labelDark' : 'labelLight';
  document.querySelectorAll<HTMLButtonElement>('[data-theme-toggle]').forEach((button) => {
    const label = button.dataset[key] ?? '';
    button.setAttribute('aria-label', label);
    button.title = label;
  });
}

function applyTheme(theme: Theme, { remember }: { remember: boolean }): void {
  if (theme === 'dark') document.documentElement.dataset.theme = 'dark';
  else delete document.documentElement.dataset.theme;
  if (remember) {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // Private mode or blocked storage: the theme still applies to this page.
    }
  }
  syncLabels();
}

export function initThemeToggles(): void {
  document.querySelectorAll('[data-theme-toggle]').forEach((button) => {
    button.addEventListener('click', () => {
      applyTheme(currentTheme() === 'dark' ? 'light' : 'dark', { remember: true });
    });
  });
  syncLabels();
  // The system can switch while the page is open (automatic dark mode at sunset, for instance).
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (event) => {
    if (!savedTheme()) applyTheme(event.matches ? 'dark' : 'light', { remember: false });
  });
}
