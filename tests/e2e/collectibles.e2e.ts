import { expect, test } from '@playwright/test'
import { card, dateKey, seed } from './helpers'

/**
 * Collectibles unlock by total days done and are never stored: the scene
 * and the Collection read the same list. Locked ones are silhouettes with
 * the true number of days to go.
 */
test('the third day unlocks the first collectible with a line and a burst', async ({ page }) => {
  await seed(page, {
    things: [{ id: 't1', name: 'run', world: 'sea', createdAt: dateKey(-5), order: 0 }],
    days: { [dateKey(-1)]: { done: ['t1'] }, [dateKey(-2)]: { done: ['t1'] } },
  })
  await page.goto('')
  await expect(page.locator('.collectible')).toHaveCount(0)
  await card(page, 'run').click()
  await expect(page.locator('.collectible[data-id="sea-a-plankton"]')).toBeVisible()
  await expect(page.locator('.line')).toHaveText('new: plankton glow.')
})

test('the Collection shows what is unlocked and how far the next one is', async ({ page }) => {
  const days: Record<string, { done: string[] }> = {}
  for (let i = 1; i <= 8; i++) days[dateKey(-i)] = { done: ['t1'] }
  await seed(page, {
    things: [{ id: 't1', name: 'run', world: 'sea', createdAt: dateKey(-10), order: 0 }],
    days,
  })
  await page.goto('')
  await page.getByRole('button', { name: 'Collection' }).click()
  const sheet = page.getByRole('dialog', { name: 'collection' })
  await expect(sheet).toBeVisible()
  await expect(sheet.getByText('8 days')).toBeVisible()
  await expect(sheet.locator('.tile.is-unlocked')).toHaveCount(2)
  await expect(sheet.locator('.tile.is-next')).toContainText('in 6 days')
  await expect(sheet.locator('.tile.is-locked')).toHaveCount(8)
  await expect(sheet.locator('.tile.is-locked').last()).toContainText('day 180')
})

test('two things in the same world unlock different lines', async ({ page }) => {
  const days: Record<string, { done: string[] }> = {}
  for (let i = 1; i <= 3; i++) days[dateKey(-i)] = { done: ['a', 'd'] }
  await seed(page, {
    things: [
      { id: 'a', name: 'run', world: 'sea', createdAt: dateKey(-5), order: 0 },
      { id: 'b', name: 'read', world: 'sky', createdAt: dateKey(-5), order: 1 },
      { id: 'c', name: 'practice', world: 'garden', createdAt: dateKey(-5), order: 2 },
      { id: 'd', name: 'water', world: 'sea', createdAt: dateKey(-5), order: 3 },
    ],
    days,
  })
  await page.goto('')
  await expect(page.locator('.collectible[data-id="sea-a-plankton"]')).toBeAttached()
  await expect(page.locator('.collectible[data-id="sea-b-pool"]')).toBeAttached()
})
