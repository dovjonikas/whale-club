import { expect, test } from '@playwright/test'
import { addThing, card, waitForServiceWorker } from './helpers'

/**
 * The app is a PWA: once the service worker has the files, the page opens
 * with no network and the data is still there.
 */
test('the app opens offline and keeps its data', async ({ page, context }) => {
  await page.goto('')
  await waitForServiceWorker(page)
  await addThing(page, 'run')
  await card(page, 'run').click()
  await context.setOffline(true)
  await page.reload()
  await expect(page.getByRole('heading', { name: 'whale club' })).toBeVisible()
  await expect(card(page, 'run')).toHaveAttribute('aria-pressed', 'true')
  await context.setOffline(false)
})

test('the manifest is installable', async ({ page, request }) => {
  await page.goto('')
  const href = await page.locator('link[rel=manifest]').getAttribute('href')
  expect(href).toBeTruthy()
  const response = await request.get(new URL(href ?? '', page.url()).toString())
  expect(response.ok()).toBe(true)
  const manifest = (await response.json()) as { display: string; icons: unknown[] }
  expect(manifest.display).toBe('standalone')
  expect(manifest.icons.length).toBeGreaterThanOrEqual(2)
})
