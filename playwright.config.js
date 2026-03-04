// @ts-check
import { defineConfig, devices } from '@playwright/test';

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:8765';

export default defineConfig({
  testDir: './tests',
  timeout: 15_000,
  retries: 1,
  use: {
    baseURL: BASE_URL,
    headless: true,
    screenshot: 'only-on-failure',
    video: 'off',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: BASE_URL.startsWith('http://localhost')
    ? {
        command: 'python3 -m http.server 8765',
        url: 'http://localhost:8765',
        reuseExistingServer: true,
        timeout: 5_000,
      }
    : undefined,
});
