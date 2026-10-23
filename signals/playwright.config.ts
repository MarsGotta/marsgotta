import { defineConfig, devices } from '@playwright/test';

const port = 4323;
// BASE_URL runs the suite against a deployment, e.g. the workers.dev preview, instead of dist/.
const deployed = process.env.BASE_URL;
const baseURL = deployed ?? `http://localhost:${port}`;

/**
 * The blog's suite, over the build with the test samples (npm run signals:test:e2e), served by its
 * Worker as in production: language on arrival, /api/subscribe, the 404 page and the headers.
 */
export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  reporter: 'list',
  use: {
    baseURL,
    // Light («papel») is the blog's default; the suite opts into dark where it tests it.
    colorScheme: 'light',
    // Tests browse as a reader already on the blog, whom the Worker never redirects by language.
    // tests/e2e/language.spec.ts drops this header to cover arrivals.
    extraHTTPHeaders: { Referer: `${baseURL}/` },
  },
  projects: [
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
    { name: 'mobile', use: { ...devices['Pixel 7'], viewport: { width: 390, height: 844 } } },
  ],
  webServer: deployed
    ? undefined
    : {
        // The development provider: signups are accepted and go nowhere.
        command: `npx wrangler dev -c wrangler.jsonc --var NEWSLETTER_PROVIDER:dev --port ${port}`,
        url: `http://localhost:${port}`,
        reuseExistingServer: true,
      },
});
