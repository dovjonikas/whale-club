import { clearNotices, expect, seedPerson, test } from './helpers'

/**
 * Drift: only the sea. One word in the club, and every way out a person
 * would try: a tap anywhere, the words that say so, Escape.
 */
test('drift hides everything but the sea, and a tap anywhere brings it back', async ({ page }) => {
  await seedPerson(page)
  await page.goto('')
  await clearNotices(page)
  await page.getByRole('button', { name: 'Menu' }).click()
  await page.getByRole('button', { name: 'drift', exact: true }).click()
  const app = page.locator('#app')
  await expect(app).toHaveClass(/is-drifting/)
  await expect(app).toHaveAttribute('inert', '')
  await expect(page.getByText('tap anywhere to come back')).toBeVisible()
  // The sea is still there, with its finds.
  await expect(page.locator('.scene')).toBeVisible()
  await page.locator('.drift-veil').click({ position: { x: 60, y: 200 } })
  await expect(app).not.toHaveClass(/is-drifting/)
  await expect(app).not.toHaveAttribute('inert', '')
  await expect(page.getByRole('button', { name: 'Menu' })).toBeVisible()
})

test('Escape comes back from drift too', async ({ page }) => {
  await seedPerson(page)
  await page.goto('')
  await clearNotices(page)
  await page.getByRole('button', { name: 'Menu' }).click()
  await page.getByRole('button', { name: 'drift', exact: true }).click()
  await expect(page.locator('#app')).toHaveClass(/is-drifting/)
  await page.keyboard.press('Escape')
  await expect(page.locator('#app')).not.toHaveClass(/is-drifting/)
  await expect(page.locator('.drift-veil')).toHaveCount(0)
})
