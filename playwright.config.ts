import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for E2E testing with Cloudflare Workers
 * Uses wrangler dev to serve the application locally
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',

  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    // CI環境での追加設定
    ...(process.env.CI && {
      video: 'retain-on-failure',
      headless: true,
    }),
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
