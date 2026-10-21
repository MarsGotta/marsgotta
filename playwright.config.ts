import { defineConfig, devices } from '@playwright/test';

const port = 4322;
// BASE_URL runs the suite against a deployment, e.g. the workers.dev preview, instead of dist/.
const deployed = process.env.BASE_URL;

// Real GPU on macOS, so the WebGL planet runs as on a visitor's machine instead of on SwiftShader.
const gpuArgs =
  process.platform === 'darwin'
    ? ['--enable-gpu', '--ignore-gpu-blocklist', '--use-angle=metal']
    : [];

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  reporter: 'list',
  use: { baseURL: deployed ?? `http://localhost:${port}`, launchOptions: { args: gpuArgs } },
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
        // --ignore-lock keeps the server in the foreground even when Astro detects an agent.
        command: `npm run preview -- --port ${port} --ignore-lock`,
        url: `http://localhost:${port}`,
        reuseExistingServer: true,
      },
});
