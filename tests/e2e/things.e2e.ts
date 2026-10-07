import { expect, test, addThing, card, dateKey, seed, stored } from './helpers'

/**
 * The first screen and the row: one sentence, an example, and up to five
 * things whose worlds are assigned in a fixed order without being asked.
 */
test('the first screen says one sentence and shows the example', async ({ page }) => {
  await page.goto('')
  await expect(page.getByText('simple things. add one.')).toBeVisible()
  await expect(page.getByText('e.g. run. read. practice 20 min.')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Add a thing' })).toBeVisible()
})

test('things get sea, sky, garden, sea, sky in that order, and the fifth closes the row', async ({
  page,
}) => {
  await page.goto('')
  const names = ['run', 'read', 'practice', 'water', 'stretch']
  for (const name of names) await addThing(page, name)
  await expect(page.getByText('simple things. add one.')).toBeHidden()
  const worlds = await Promise.all(names.map((n) => card(page, n).getAttribute('data-world')))
  expect(worlds).toEqual(['sea', 'sky', 'garden', 'sea', 'sky'])
  await expect(page.getByRole('button', { name: 'Add a thing' })).toBeHidden()
})

test('the add sheet asks one question, tap when done or lock in, and a length only for a lock-in', async ({
  page,
}) => {
  await page.goto('')
  await page.getByRole('button', { name: 'Add a thing' }).click()
  const sheet = page.getByRole('dialog')
  await expect(sheet.getByText('how is it done?')).toBeVisible()
  await expect(sheet.getByRole('button', { name: 'tap when done' })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
  await expect(sheet.getByText('how long')).toBeHidden()
  await expect(sheet.getByText('hold it for a timer', { exact: false })).toHaveCount(0)
  await sheet.getByRole('button', { name: 'lock in', exact: true }).click()
  await expect(sheet.getByText('how long')).toBeVisible()
  // Start light: fifteen minutes unless asked otherwise.
  await expect(sheet.getByRole('button', { name: '15 min' })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
  await page.keyboard.press('Escape')
  await addThing(page, 'practice', { emoji: '🎹', lockIn: true, minutes: 45 })
  await expect(page.locator('.card', { has: card(page, 'practice') })).toContainText('45 min')
  await card(page, 'practice').click()
  await expect(page.getByRole('slider', { name: 'minutes' })).toHaveAttribute('aria-valuenow', '45')
})

test('data from before 0.9 loses its mode and every thing gets a lock-in length', async ({
  page,
}) => {
  await seed(page, {
    things: [
      { id: 't1', name: 'run', mode: 'tap', world: 'sea', createdAt: dateKey(-3), order: 0 },
      {
        id: 't2',
        name: 'read',
        mode: 'timer',
        minutes: 25,
        world: 'sky',
        createdAt: dateKey(-3),
        order: 1,
      },
    ],
    days: { [dateKey(-1)]: { done: ['t1', 't2'] } },
  })
  await page.goto('')
  await card(page, 'run').click()
  const data = (await stored(page)) as unknown as {
    version: number
    things: Record<string, unknown>[]
  }
  expect(data.version).toBe(6)
  expect(data.things.map((t) => t.mode)).toEqual([undefined, undefined])
  expect(data.things.map((t) => t.minutes)).toEqual([15, 25])
})

test('an empty name is not added', async ({ page }) => {
  await page.goto('')
  await page.getByRole('button', { name: 'Add a thing' }).click()
  await page.getByRole('button', { name: 'add', exact: true }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await expect(page.getByRole('textbox', { name: 'name' })).toBeFocused()
})
