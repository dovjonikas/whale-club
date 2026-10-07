import { test as pure, type Page } from '@playwright/test'
import { wearSvg, dressedSvg } from '../../src/scene/dock/wear'
import { expect, seedPerson, STORAGE_KEY, test } from './helpers'

/**
 * The dock as a person meets it: the krill under the title, the pier, a
 * silhouette with its price, get it, save for this, who wears it, and
 * hiding what changes the scene. The rules behind them are in dock.e2e.ts.
 */

test.beforeEach(async ({ page }) => {
  const noon = new Date()
  noon.setHours(12, 0, 0, 0)
  await page.clock.setFixedTime(noon)
})

const balance = async (page: Page): Promise<number> =>
  Number(((await page.locator('.krill-count').textContent()) ?? '').replace(/,/g, ''))

test('the krill is under the title and opens the dock, and so does the pier', async ({ page }) => {
  await seedPerson(page)
  await page.goto('')
  const chip = page.getByRole('button', { name: /^[\d,]+ krill\. open the dock$/ })
  await expect(chip).toBeVisible()
  expect(await balance(page)).toBeGreaterThan(0)
  await chip.click()
  const dock = page.getByRole('dialog', { name: 'the dock' })
  await expect(dock).toBeVisible()
  // Four tiers, every thing with its price until it is yours.
  for (const tier of ['small', 'middling', 'large', 'legendary'])
    await expect(dock.getByRole('heading', { name: tier })).toBeVisible()
  await expect(dock.locator('.dock-tile')).toHaveCount(30)
  await expect(dock.locator('.dock-tile.is-locked')).toHaveCount(30)
  await page.keyboard.press('Escape')
  await page.getByRole('button', { name: 'the dock, on the shore' }).click()
  await expect(dock).toBeVisible()
})

test('get it: one tap, the balance drops by the price, the chip shows it', async ({ page }) => {
  await seedPerson(page, { days: 100 })
  await page.goto('')
  const before = await balance(page)
  await page.locator('.krill-chip').click()
  const dock = page.getByRole('dialog', { name: 'the dock' })
  await dock.getByRole('button', { name: 'small whale, 3,500 krill' }).click()
  await expect(dock.getByRole('heading', { name: 'small whale' })).toBeVisible()
  await dock.getByRole('button', { name: 'get it' }).click()
  await expect(dock).toBeHidden()
  await expect(page.locator('.line')).toHaveText('the small whale is here.')
  expect(await balance(page)).toBe(before - 3500)
  await expect(page.locator('.dock-small-whale')).toBeVisible()
  // In the dock it is drawn now, and says it is yours.
  await page.locator('.krill-chip').click()
  await expect(dock.getByRole('button', { name: 'small whale, yours' })).toBeVisible()
})

test('a thing out of reach says how far, and "save for this" pins it under the krill', async ({
  page,
}) => {
  await seedPerson(page)
  await page.goto('')
  await page.locator('.krill-chip').click()
  const dock = page.getByRole('dialog', { name: 'the dock' })
  await dock.getByRole('button', { name: 'sky whale, 12,000 krill' }).click()
  await expect(dock.getByRole('button', { name: 'get it' })).toHaveCount(0)
  await expect(dock.getByText(/^[\d,]+ to go$/)).toBeVisible()
  await dock.getByRole('button', { name: 'save for this' }).click()
  await expect(dock.getByRole('button', { name: 'stop saving' })).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.locator('.krill-goal-text')).toHaveText(/^[\d,]+ to the sky whale$/)
  // One goal at a time: choosing another replaces it.
  await page.locator('.krill-chip').click()
  await dock.getByRole('button', { name: 'glowing cove, 10,000 krill' }).click()
  await dock.getByRole('button', { name: 'save for this' }).click()
  await page.keyboard.press('Escape')
  await expect(page.locator('.krill-goal-text')).toHaveText(/to the glowing cove$/)
})

test('a hat asks who wears it, and the creature on that card wears it', async ({ page }) => {
  await seedPerson(page, { days: 100 })
  await page.goto('')
  await page.locator('.krill-chip').click()
  const dock = page.getByRole('dialog', { name: 'the dock' })
  await dock.getByRole('button', { name: 'hat, 350 krill' }).click()
  await dock.getByRole('button', { name: 'get it' }).click()
  await expect(dock.getByText('who wears it?')).toBeVisible()
  await dock.getByRole('button', { name: 'read' }).click()
  await expect(dock).toBeHidden()
  await expect(page.locator('.card[data-id="read"] .worn-hat')).toBeAttached()
  // Changed in the hat's own page, it moves to the other creature.
  await page.locator('.krill-chip').click()
  await dock.getByRole('button', { name: 'hat, yours' }).click()
  await expect(dock.getByText('worn by read')).toBeVisible()
  await dock.getByRole('button', { name: 'run' }).click()
  await page.keyboard.press('Escape')
  await expect(page.locator('.card[data-id="run"] .worn-hat')).toBeAttached()
  await expect(page.locator('.card[data-id="read"] .worn-hat')).toHaveCount(0)
})

test('what changes the scene can be hidden and shown again', async ({ page }) => {
  await seedPerson(page, {
    extra: { bought: [{ item: 'glowing-tide', date: '2026-01-01', price: 3000 }] },
  })
  await page.goto('')
  await expect(page.locator('.dock-tide')).toBeVisible()
  await page.locator('.krill-chip').click()
  const dock = page.getByRole('dialog', { name: 'the dock' })
  await dock.getByRole('button', { name: 'glowing tide, yours' }).click()
  await dock.getByRole('button', { name: 'hide' }).click()
  await expect(page.locator('.dock-tide')).toBeHidden()
  await dock.getByRole('button', { name: 'show' }).click()
  await expect(page.locator('.dock-tide')).toBeVisible()
  const stored = await page.evaluate(
    (key) => (JSON.parse(localStorage.getItem(key) ?? '{}') as { hidden?: string[] }).hidden,
    STORAGE_KEY,
  )
  expect(stored).toBeUndefined()
})

pure('every creature, at every stage, has a face to wear things on', () => {
  for (const world of ['sea', 'sky', 'garden'] as const)
    for (const line of ['a', 'b'] as const)
      for (const stage of [0, 1, 2, 3] as const) {
        expect(wearSvg(world, line, stage, [])).toBe('')
        const worn = wearSvg(world, line, stage, ['hat', 'glasses', 'scarf'])
        expect(worn).toContain('worn-hat')
        expect(worn).toContain('worn-glasses')
        expect(worn).toContain('worn-scarf')
        expect(worn).not.toMatch(/NaN|undefined/)
        // The hat goes on last, over the rest.
        expect(worn.indexOf('worn-hat')).toBeGreaterThan(worn.indexOf('worn-scarf'))
        expect(dressedSvg(world, line, stage, ['hat'])).toMatch(/worn-hat[\s\S]*<\/svg>$/)
      }
})
