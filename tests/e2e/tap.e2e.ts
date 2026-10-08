import { expect, test, addThing, card, dateKey, seed } from './helpers'

/**
 * A tap is today's done. A second tap takes it back. Nothing is lost on
 * reload, and a missed day only says so.
 */
test('a tap marks today, says a line, and a second tap undoes it', async ({ page }) => {
  await page.goto('')
  await addThing(page, 'run')
  const run = card(page, 'run')
  await expect(run).toHaveAttribute('aria-pressed', 'false')
  await run.click()
  await expect(run).toHaveAttribute('aria-pressed', 'true')
  await expect(page.locator('.line')).not.toBeEmpty()
  await expect(run.locator('.dot').last()).toHaveClass(/is-on/)
  await run.click()
  await expect(run).toHaveAttribute('aria-pressed', 'false')
  await expect(page.locator('.line')).toHaveText('undone. no drama.')
})

test('done survives a reload', async ({ page }) => {
  await page.goto('')
  await addThing(page, 'run')
  await card(page, 'run').click()
  await expect(card(page, 'run')).toHaveAttribute('aria-pressed', 'true')
  await page.reload()
  await expect(card(page, 'run')).toHaveAttribute('aria-pressed', 'true')
})

test('all done says the all-done line', async ({ page }) => {
  await page.goto('')
  await addThing(page, 'run')
  await addThing(page, 'read')
  await card(page, 'run').click()
  await card(page, 'read').click()
  await expect(page.locator('.line')).toHaveText('all of it. all the smoke.')
})

test('a missed day past the week’s quiet days dims the scene and says so, and the first tap lifts it', async ({
  page,
}) => {
  // A Thursday: Monday and Tuesday were the week's two quiet days, so Wednesday is a real miss.
  const thursday = new Date(2026, 2, 5, 12, 0)
  await page.clock.setFixedTime(thursday)
  await seed(page, {
    things: [{ id: 't1', name: 'run', world: 'sea', createdAt: dateKey(-12, thursday), order: 0 }],
    days: { [dateKey(-4, thursday)]: { done: ['t1'] } },
    settings: { installDismissedAt: dateKey(-1, thursday), lastRecapWeek: '2026-02-23' },
  })
  await page.goto('')
  await expect(page.locator('.line')).toHaveText('you missed a day. nothing died.')
  await expect(page.locator('.scene')).toHaveAttribute('data-quiet', 'true')
  await card(page, 'run').click()
  await expect(page.locator('.scene')).toHaveAttribute('data-quiet', 'false')
})

test('the week dots show the last seven days', async ({ page }) => {
  await seed(page, {
    things: [{ id: 't1', name: 'run', world: 'sea', createdAt: dateKey(-10), order: 0 }],
    days: {
      [dateKey(-1)]: { done: ['t1'] },
      [dateKey(-3)]: { done: ['t1'] },
      [dateKey(-9)]: { done: ['t1'] },
    },
  })
  await page.goto('')
  const dots = card(page, 'run').locator('.dot')
  await expect(dots).toHaveCount(7)
  const on = await dots.evaluateAll((els) => els.map((e) => e.classList.contains('is-on')))
  expect(on).toEqual([false, false, false, true, false, true, false])
})
