import { defineConfig, devices } from '@playwright/test';

const port = 4322;
// BASE_URL runs the suite against a deployment, e.g. the workers.dev preview, instead of dist/.
const deployed = process.env.BASE_URL;
const baseURL = deployed ?? `http://localhost:${port}`;

// Real GPU on macOS, so the WebGL planet runs as on a visitor's machine instead of on SwiftShader.
const gpuArgs =
  process.platform === 'darwin'
    ? ['--enable-gpu', '--ignore-gpu-blocklist', '--use-angle=metal']
    : [];

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  reporter: 'list',
  use: {
    baseURL,
    launchOptions: { args: gpuArgs },
    // Visitors get the system theme, and Playwright's default system is light: the suite pins the
    // dark default and opts into light where it tests it.
    colorScheme: 'dark',
    // Tests browse as a visitor already on the site, whom the Worker never redirects by language,
    // so each page loads in the language the test asks for. tests/e2e/language.spec.ts drops this
    // header to cover arrivals.
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
        // dist/ served by the site Worker, as in production: language redirects, 404 page, headers.
        command: `npx wrangler dev --port ${port}`,
        url: `http://localhost:${port}`,
        reuseExistingServer: true,
      },
});
