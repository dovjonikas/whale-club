import type { Locator, Page } from '@playwright/test'
import { expect, test, dismissInstallLeaf } from './helpers'

/**
 * The clarity test. Every everyday job is done through words a person can
 * see (a role and its name, or the text itself): no test ids, no gestures.
 * Each job's control is in sight within two taps of the first screen; the
 * taps are counted. If one fails, the app is fixed, not the test.
 */
let taps = 0

/** A tap on something a person can see and name. */
async function tap(target: Locator): Promise<void> {
  await expect(target).toBeVisible()
  await target.click()
  taps++
}

/** Starts counting a job from the first screen. */
async function fromFirstScreen(page: Page): Promise<void> {
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toHaveCount(0)
  taps = 0
}

/** The control that does the job is in sight within two taps of the first screen. */
async function within2(target: Locator): Promise<void> {
  await expect(target).toBeVisible()
  expect(taps).toBeLessThanOrEqual(2)
}

const button = (page: Page, name: string, exact = true) => page.getByRole('button', { name, exact })

test('fifteen everyday jobs, by visible words, each within two taps', async ({ page }) => {
  test.setTimeout(120_000)
  await page.clock.install()
  await page.goto('')

  // 1. Add a thing.
  await fromFirstScreen(page)
  await within2(button(page, 'Add a thing'))
  await tap(button(page, 'Add a thing'))
  await page.getByRole('textbox', { name: 'name' }).fill('water')
  await tap(button(page, 'add'))
  await expect(button(page, 'water')).toBeVisible()
  await dismissInstallLeaf(page)

  // A lock-in thing, for the jobs that need one.
  await tap(button(page, 'Add a thing'))
  await page.getByRole('textbox', { name: 'name' }).fill('study')
  await tap(button(page, 'lock in'))
  await tap(button(page, 'add'))
  await tap(button(page, 'Add a thing'))
  await page.getByRole('textbox', { name: 'name' }).fill('practice')
  await tap(button(page, 'lock in'))
  await tap(button(page, 'add'))

  // 2. Mark it done. 3. Take it back.
  await fromFirstScreen(page)
  await within2(button(page, 'water'))
  await tap(button(page, 'water'))
  await expect(button(page, 'water')).toHaveAttribute('aria-pressed', 'true')
  await tap(button(page, 'water'))
  await expect(button(page, 'water')).toHaveAttribute('aria-pressed', 'false')

  // 4. Lock in and finish.
  await fromFirstScreen(page)
  await tap(button(page, 'study'))
  await within2(button(page, 'lock in'))
  await tap(button(page, 'lock in'))
  await page.clock.fastForward('15:02')
  await expect(page.locator('#frame')).toHaveAttribute('data-opening', 'done', { timeout: 15_000 })
  await expect(page.getByText('done today', { exact: false })).toHaveCount(1)

  // 5. Change the days.
  await fromFirstScreen(page)
  await tap(button(page, 'edit'))
  await tap(button(page, 'water'))
  await within2(page.getByRole('dialog').getByRole('button', { name: 'Sunday' }))
  await tap(page.getByRole('dialog').getByRole('button', { name: 'Sunday' }))
  await tap(button(page, 'save'))
  await tap(button(page, 'done'))

  // 6. Change the kind.
  await fromFirstScreen(page)
  await tap(button(page, 'edit'))
  await tap(button(page, 'water'))
  await within2(page.getByRole('dialog').getByRole('button', { name: 'lock in', exact: true }))
  await tap(page.getByRole('dialog').getByRole('button', { name: 'lock in', exact: true }))
  await tap(page.getByRole('dialog').getByRole('button', { name: 'tap when done' }))
  await tap(button(page, 'save'))
  await tap(button(page, 'done'))

  // 7. Delete, and undo.
  await fromFirstScreen(page)
  await tap(button(page, 'edit'))
  await within2(button(page, 'delete water'))
  await tap(button(page, 'delete water'))
  await expect(button(page, 'water')).toHaveCount(0)
  await tap(button(page, 'undo'))
  await expect(button(page, 'water')).toBeVisible()
  await tap(button(page, 'done'))

  // 8. Find the Collection.
  await fromFirstScreen(page)
  await within2(button(page, 'Collection'))
  await tap(button(page, 'Collection'))
  await expect(page.getByRole('dialog', { name: 'collection' })).toBeVisible()

  // 9. Send a postcard.
  await fromFirstScreen(page)
  await within2(button(page, 'send the sea'))

  // 10. Find the menu.
  await fromFirstScreen(page)
  await within2(button(page, 'Menu'))

  // 11. Watch the intro again.
  await fromFirstScreen(page)
  await tap(button(page, 'Menu'))
  await tap(button(page, 'how it works'))
  await within2(button(page, 'watch the intro'))

  // 12. See the goal: the next find.
  await fromFirstScreen(page)
  await within2(page.getByRole('button', { name: /^next find:/ }))

  // 13. Go on with a lock-in that was not finished.
  await fromFirstScreen(page)
  await tap(button(page, 'practice'))
  await tap(button(page, 'lock in'))
  await page.clock.fastForward('03:10')
  await tap(page.getByRole('button', { name: 'stop' }))
  await fromFirstScreen(page)
  await within2(page.getByText(/· finish$/))
  await tap(button(page, 'practice'))
  await expect(page.getByRole('dialog', { name: 'lock in: practice' })).toBeVisible()
  await tap(page.getByRole('button', { name: 'undo' }))

  // 14. Did it without the timer.
  await fromFirstScreen(page)
  await tap(button(page, 'edit practice'))
  await within2(button(page, 'did it without the timer'))

  // 15. Understand the log: it explains itself without a tap.
  await fromFirstScreen(page)
  await tap(button(page, 'Menu'))
  await tap(button(page, 'the log'))
  await within2(page.getByText('star: a day you did something'))
  await expect(page.getByText('lantern: a lock in you finished')).toBeVisible()
})
