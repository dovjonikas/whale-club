import { todayKey } from '../../src/store/dates'
import { surpriseFor } from '../../src/app/surprise'
import { expect, test, addThing, card, clearNotices, dateKey, seed } from './helpers'

/**
 * The scene answers the day: the whale when everything is done, a star
 * per day that can be tapped, one surprise after the first thing.
 */
test('all done surfaces the whale', async ({ page }) => {
  await page.goto('')
  await addThing(page, 'run')
  await addThing(page, 'read')
  await card(page, 'run').click()
  await expect(page.locator('.whale')).toHaveCount(0)
  await card(page, 'read').click()
  await expect(page.locator('.whale')).toBeVisible()
  await expect(page.locator('.line')).toHaveText('all of it. all the smoke.')
})

test('every day with something done is a star that says what was done', async ({ page }) => {
  await seed(page, {
    things: [
      { id: 't1', name: 'run', world: 'sea', createdAt: dateKey(-10), order: 0 },
      { id: 't2', name: 'read', world: 'sky', createdAt: dateKey(-10), order: 1 },
    ],
    days: { [dateKey(-3)]: { done: ['t1', 't2'] }, [dateKey(-1)]: { done: ['t2'] } },
  })
  await page.goto('')
  await clearNotices(page)
  const stars = page.getByRole('group', { name: 'your days' }).getByRole('button')
  await expect(stars).toHaveCount(2)
  const label = await stars.first().getAttribute('aria-label')
  expect(label).toMatch(/run, read$/)
  await stars.first().click()
  await expect(page.getByRole('button', { name: /run, read$/ }).last()).toBeVisible()
})

test('the first thing of the day brings the surprise the date picks', async ({ page }) => {
  await page.goto('')
  await addThing(page, 'run')
  await card(page, 'run').click()
  const surprise = surpriseFor(todayKey())
  if (surprise.kind === 'fact') {
    await expect(page.locator('.line')).toHaveText(surprise.text, { timeout: 8000 })
  } else if (surprise.kind === 'visitor') {
    await expect(page.locator(`.visitor[data-kind="${surprise.visitor}"]`)).toBeAttached({
      timeout: 8000,
    })
  } else {
    await expect(page.locator('.scene-glow')).toHaveClass(/is-on/, { timeout: 8000 })
  }
})
