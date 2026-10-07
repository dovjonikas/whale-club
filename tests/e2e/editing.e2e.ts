import type { Page } from '@playwright/test'
import { expect, test, addThing, card, dateKey, dismissInstallLeaf, seed, stored } from './helpers'

/**
 * Changing and deleting, in plain sight: a word, "edit", over the row; in
 * edit mode a red "delete" on every card and a tap opens the card's sheet;
 * the sheet ends with "delete this thing". No "are you sure": the card
 * swims off and "undo" waits ten seconds. A swipe to the left is only a
 * shortcut to the same delete.
 */
const cardOf = (page: Page, name: string) => page.locator('.card', { has: card(page, name) })
const stars = (page: Page) => page.getByRole('group', { name: 'your days' }).getByRole('button')

test('edit mode: a delete on every card, a tap opens the sheet, nothing is marked', async ({
  page,
}) => {
  await page.goto('')
  await addThing(page, 'run')
  await addThing(page, 'read')
  await dismissInstallLeaf(page)
  await page.getByRole('button', { name: 'edit', exact: true }).click()
  await expect(page.getByRole('button', { name: 'delete run' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'delete read' })).toBeVisible()
  await card(page, 'run').click()
  await expect(page.getByRole('dialog')).toContainText('run')
  await page.keyboard.press('Escape')
  await expect(card(page, 'run')).toHaveAttribute('aria-pressed', 'false')
  await page.getByRole('button', { name: 'done', exact: true }).click()
  await expect(page.getByRole('button', { name: 'delete run' })).toBeHidden()
})

test('delete without asking: the card swims off, the days stay, undo brings it back', async ({
  page,
}) => {
  await seed(page, {
    things: [
      { id: 't1', name: 'run', world: 'sea', createdAt: dateKey(-10), order: 0 },
      { id: 't2', name: 'read', world: 'sky', createdAt: dateKey(-10), order: 1 },
    ],
    days: {
      [dateKey(-3)]: { done: ['t1'] },
      [dateKey(-2)]: { done: ['t1'] },
      [dateKey(-1)]: { done: ['t1', 't2'] },
    },
    cracked: { t1: 3 },
  })
  await page.goto('')
  await dismissInstallLeaf(page)
  await expect(stars(page)).toHaveCount(3)
  const finds = await page.locator('.collectible').count()
  expect(finds).toBeGreaterThan(0)

  await page.getByRole('button', { name: 'edit', exact: true }).click()
  await page.getByRole('button', { name: 'delete run' }).click()
  await expect(card(page, 'run')).toHaveCount(0)
  await expect(page.locator('.line')).toHaveText('it swam off. the days you did stay.')
  // What it did stays: the stars and its find.
  await expect(stars(page)).toHaveCount(3)
  await expect(page.locator('.collectible')).toHaveCount(finds)
  expect((await stored(page)).things.map((t) => t.name)).toEqual(['read'])

  await page.getByRole('button', { name: 'undo' }).click()
  await expect(card(page, 'run')).toBeVisible()
  const data = (await stored(page)) as unknown as { things: { id: string }[]; retired?: unknown[] }
  expect(data.things.map((t) => t.id).sort()).toEqual(['t1', 't2'])
  expect(data.retired).toBeUndefined()
})

test('a thing can be deleted from its own sheet', async ({ page }) => {
  await page.goto('')
  await addThing(page, 'run')
  await dismissInstallLeaf(page)
  await page.getByRole('button', { name: 'edit run' }).click()
  await page.getByRole('button', { name: 'delete this thing' }).click()
  await expect(card(page, 'run')).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'undo' })).toBeVisible()
})

test('a swipe to the left shows the same delete, as a shortcut', async ({ page }) => {
  await page.goto('')
  await addThing(page, 'run')
  await addThing(page, 'read')
  await dismissInstallLeaf(page)
  const box = await card(page, 'run').boundingBox()
  if (!box) throw new Error('no card')
  const y = box.y + box.height / 2
  await page.mouse.move(box.x + box.width - 8, y)
  await page.mouse.down()
  await page.mouse.move(box.x + box.width / 2, y, { steps: 6 })
  await page.mouse.move(box.x + 4, y, { steps: 6 })
  await page.mouse.up()
  await expect(cardOf(page, 'run')).toHaveAttribute('data-swiped', 'true')
  // The swipe did not mark it.
  await expect(card(page, 'run')).toHaveAttribute('aria-pressed', 'false')
  await page.getByRole('button', { name: 'delete run' }).click()
  await expect(card(page, 'run')).toHaveCount(0)
})

test('a thing added after a delete fills the gap in the worlds and keeps the others as they are', async ({
  page,
}) => {
  await page.goto('')
  await addThing(page, 'run')
  await addThing(page, 'read')
  await addThing(page, 'practice')
  await dismissInstallLeaf(page)
  await page.getByRole('button', { name: 'edit read' }).click()
  await page.getByRole('button', { name: 'delete this thing' }).click()
  await expect(card(page, 'read')).toHaveCount(0)
  await addThing(page, 'water')
  await expect(cardOf(page, 'water')).toHaveAttribute('data-world', 'sky')
  await expect(cardOf(page, 'practice')).toHaveAttribute('data-world', 'garden')
})
