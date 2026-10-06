import { expect, test } from '@playwright/test'
import { addThing, card } from './helpers'

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

test('a timer thing shows its minutes on the card', async ({ page }) => {
  await page.goto('')
  await addThing(page, 'practice', { emoji: '🎻', timer: 15 })
  await expect(card(page, 'practice')).toContainText('15 min')
  await expect(card(page, 'practice')).toContainText('🎻')
})

test('an empty name is not added', async ({ page }) => {
  await page.goto('')
  await page.getByRole('button', { name: 'Add a thing' }).click()
  await page.getByRole('button', { name: 'add', exact: true }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await expect(page.getByRole('textbox', { name: 'name' })).toBeFocused()
})
