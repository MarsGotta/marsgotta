'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import type { ReactNode } from 'react';

type Props = {
  children: ReactNode;
};

/**
 * next-themes wrapper using `data-theme` attribute (matches CSS tokens
 * which target [data-theme='dark'] / [data-theme='light']).
 *
 * Default theme is 'dark' — matches the design's signature cosmic look.
 */
export function ThemeProvider({ children }: Props) {
  return (
    <NextThemesProvider
      attribute="data-theme"
      defaultTheme="dark"
      enableSystem={false}
      themes={['light', 'dark']}
      storageKey="mars.theme"
    >
      {children}
    </NextThemesProvider>
  );
}
