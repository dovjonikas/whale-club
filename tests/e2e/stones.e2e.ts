import { rarityOf } from '../../src/scene/rarity'
import { expect, test, card, dateKey, seed, stored } from './helpers'

/**
 * What a thing earns arrives as a stone. It waits in the scene until the
 * person cracks it: three taps, or a one-second hold. The find comes out,
 * is polished and settles; what it is follows from the total days, and
 * its shine (common, rare, legendary) is picked from the date it was
 * earned, so the same history always shines the same way.
 */
const run = { id: 't1', name: 'run', world: 'sea' as const, createdAt: dateKey(-20), order: 0 }

function doneDays(n: number): Record<string, { done: string[] }> {
  const days: Record<string, { done: string[] }> = {}
  for (let i = 1; i <= n; i++) days[dateKey(-i)] = { done: ['t1'] }
  return days
}

test('the third day brings a stone, with a mark on the card', async ({ page }) => {
  await seed(page, {
    things: [run],
    days: doneDays(2),
    settings: { installDismissedAt: dateKey(0) },
  })
  await page.goto('')
  await expect(page.locator('.stone')).toHaveCount(0)
  await card(page, 'run').click()
  const stone = page.getByRole('button', { name: 'a stone from run. tap three times to crack it' })
  await expect(stone).toBeVisible()
  // The first stone says what it is, once.
  await expect(page.locator('.line')).toHaveText('a stone fell in. tap it three times.')
  await expect(page.locator('.card-stone')).toBeVisible()
})

test('three taps crack it; the find comes out and stays', async ({ page }) => {
  await seed(page, {
    things: [run],
    days: doneDays(3),
    settings: { installDismissedAt: dateKey(0) },
  })
  await page.goto('')
  const stone = page.getByRole('button', { name: /a stone from run/ })
  await stone.click()
  await stone.click()
  await expect(page.locator('.collectible[data-id="sea-a-plankton"]')).toHaveCount(0)
  await stone.click()
  await expect(page.locator('.collectible[data-id="sea-a-plankton"]')).toBeAttached()
  await expect(page.locator('.line')).toHaveText('new: plankton glow.')
  await expect(page.locator('.stone')).toHaveCount(0)
  expect((await stored(page)).cracked).toEqual({ t1: 3 })
  await page.reload()
  await expect(page.locator('.stone')).toHaveCount(0)
  await expect(page.locator('.collectible[data-id="sea-a-plankton"]')).toBeAttached()
})

test('holding a stone for a second cracks it too', async ({ page }) => {
  await seed(page, {
    things: [run],
    days: doneDays(3),
    settings: { installDismissedAt: dateKey(0) },
  })
  await page.goto('')
  const box = await page.locator('.stone').boundingBox()
  if (!box) throw new Error('no stone')
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
  await page.mouse.down()
  await page.waitForTimeout(1300)
  await page.mouse.up()
  await expect(page.locator('.collectible[data-id="sea-a-plankton"]')).toBeAttached()
})

test('stones wait for as long as it takes, and open in order', async ({ page }) => {
  await seed(page, {
    things: [run],
    days: doneDays(8),
    settings: { installDismissedAt: dateKey(0) },
  })
  await page.goto('')
  await expect(page.locator('.stone')).toHaveCount(2)
  await expect(page.locator('.card-stone')).toHaveText('2')
  const first = page.locator('.stone').first()
  for (let i = 0; i < 3; i++) await first.click()
  await expect(page.locator('.collectible[data-id="sea-a-plankton"]')).toBeAttached()
  await expect(page.locator('.stone')).toHaveCount(1)
  const second = page.locator('.stone').first()
  for (let i = 0; i < 3; i++) await second.click()
  await expect(page.locator('.collectible[data-id="sea-a-fish"]')).toBeAttached()
})

test('a waiting stone shows in the Collection', async ({ page }) => {
  await seed(page, {
    things: [run],
    days: doneDays(4),
    settings: { installDismissedAt: dateKey(0) },
  })
  await page.goto('')
  await page.getByRole('button', { name: 'Museum' }).click()
  const sheet = page.getByRole('dialog', { name: 'the museum' })
  await expect(sheet.locator('.tile.is-stone')).toHaveCount(1)
  await expect(sheet.locator('.tile.is-stone')).toContainText('a stone. crack it.')
  await expect(sheet.locator('.tile.is-unlocked')).toHaveCount(0)
})

test('the shine is picked from the date the find was earned, and never changes', async ({
  page,
}) => {
  const days = doneDays(30)
  await seed(page, {
    things: [run],
    days,
    cracked: { t1: 30 },
    settings: { installDismissedAt: dateKey(0) },
  })
  await page.goto('')
  // The tier-th counted day, oldest first, is the day it was earned.
  const sorted = Object.keys(days).sort()
  const ids: [string, number][] = [
    ['sea-a-plankton', 3],
    ['sea-a-fish', 7],
    ['sea-a-school', 14],
    ['sea-a-anchor', 21],
  ]
  for (const [id, tier] of ids) {
    const expected = rarityOf(id, sorted[tier - 1])
    await expect(page.locator(`.collectible[data-id="${id}"]`)).toHaveAttribute(
      'data-rarity',
      expected,
    )
  }
  const before = await page
    .locator('.collectible')
    .evaluateAll((els) => els.map((e) => e.getAttribute('data-rarity')))
  await page.reload()
  const after = await page
    .locator('.collectible')
    .evaluateAll((els) => els.map((e) => e.getAttribute('data-rarity')))
  expect(after).toEqual(before)
})

test('data from before the stones keeps everything it had found', async ({ page }) => {
  await page.addInitScript(
    ([key, json]) => {
      if (localStorage.getItem(key) === null) localStorage.setItem(key, json)
    },
    [
      'whaleclub:data',
      JSON.stringify({
        version: 1,
        things: [{ ...run, emoji: '•', mode: 'tap' }],
        days: Object.fromEntries(
          Object.entries(doneDays(8)).map(([k, v]) => [k, { ...v, minutes: {} }]),
        ),
        settings: { sound: true, installDismissedAt: dateKey(0) },
      }),
    ] as const,
  )
  await page.goto('')
  await expect(page.locator('.stone')).toHaveCount(0)
  await expect(page.locator('.collectible[data-id="sea-a-plankton"]')).toBeAttached()
  await expect(page.locator('.collectible[data-id="sea-a-fish"]')).toBeAttached()
})
