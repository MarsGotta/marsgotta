import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  // The blog imports the portfolio's shared code through this alias (signals/astro.config.ts).
  resolve: { alias: { '@portfolio': fileURLToPath(new URL('./src', import.meta.url)) } },
  test: {
    include: ['src/**/*.test.ts', 'workers/**/*.test.ts', 'signals/src/**/*.test.ts'],
  },
});
