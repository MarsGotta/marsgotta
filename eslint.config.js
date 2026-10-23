import js from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import astro from 'eslint-plugin-astro';
import tseslint from 'typescript-eslint';

export default defineConfig([
  globalIgnores([
    'dist/',
    '.astro/',
    'signals/dist/',
    'signals/.astro/',
    '.wrangler/',
    // The blog's e2e run wrangler dev from signals/, which writes its bundles there.
    'signals/.wrangler/',
    'signals/test-results/',
    'design/',
    '.claude/',
    '.remember/',
    'test-results/',
    'playwright-report/',
  ]),
  js.configs.recommended,
  tseslint.configs.strict,
  astro.configs.recommended,
  astro.configs['jsx-a11y-strict'],
]);
