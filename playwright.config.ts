import { defineConfig, devices } from '@playwright/test'

/**
 * End-to-end tests against the production build, the way a person meets it:
 * `vite preview` on the same base path GitHub Pages uses, one browser
 * context per test, storage wiped between them.
 *
 * Three projects: the owner's phone (iPhone 13), an Android phone (Pixel 5)
 * and a desktop window. Every test runs on all three unless it says
 * otherwise, because the scene is the app and a layout that holds on one
 * device has broken on another before anyone looked.
 */
const base = 'http://localhost:4173/whale-club/'

export default defineConfig({
  testDir: 'tests/e2e',
  testMatch: /.*\.e2e\.ts/,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  // Every page runs the whole animated scene; more than six at once starves them and tests time out.
  workers: process.env.CI ? undefined : 6,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: base,
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'iphone',
      use: { ...devices['iPhone 13'], defaultBrowserType: 'chromium' },
    },
    {
      name: 'android',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1366, height: 768 } },
    },
  ],
  webServer: {
    command: 'npm run build && npm run preview -- --strictPort',
    url: base,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
})
