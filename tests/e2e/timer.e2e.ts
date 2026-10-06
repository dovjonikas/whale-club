import { expect, test } from '@playwright/test'
import { addThing, card, longPress } from './helpers'

/**
 * A long press runs a timer. The creature swims, the screen goes calm, and
 * when the time is up the thing counts as done. Stopping early counts
 * nothing. The clock is Playwright's so fifteen minutes take a second.
 */
test('a long press opens the timer, and the timer ending counts as done', async ({ page }) => {
  await page.clock.install()
  await page.goto('')
  await addThing(page, 'practice', { timer: 15 })
  await longPress(page, card(page, 'practice'))
  const sheet = page.getByRole('dialog', { name: /practice/ })
  await expect(sheet).toBeVisible()
  await expect(sheet.getByRole('button', { name: '15', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
  await sheet.getByRole('button', { name: 'start' }).click()
  const run = page.getByRole('dialog', { name: 'timer for practice' })
  await expect(run).toBeVisible()
  await expect(run.getByRole('timer')).toHaveText('15:00')
  await page.clock.fastForward('05:00')
  await expect(run.getByRole('timer')).toHaveText('10:00')
  await page.clock.fastForward('10:01')
  await expect(run).toBeHidden()
  await expect(card(page, 'practice')).toHaveAttribute('aria-pressed', 'true')
  await expect(page.locator('.line')).toHaveText('time. that counts.')
})

test('stopping the timer early counts nothing', async ({ page }) => {
  await page.goto('')
  await addThing(page, 'practice', { timer: 15 })
  await longPress(page, card(page, 'practice'))
  await page.getByRole('button', { name: 'start' }).click()
  await page.getByRole('button', { name: 'stop' }).click()
  await expect(page.getByRole('dialog', { name: 'timer for practice' })).toBeHidden()
  await expect(card(page, 'practice')).toHaveAttribute('aria-pressed', 'false')
})

test('a running timer survives a reload', async ({ page }) => {
  await page.goto('')
  await addThing(page, 'practice', { timer: 15 })
  await longPress(page, card(page, 'practice'))
  await page.getByRole('button', { name: 'start' }).click()
  await expect(page.getByRole('dialog', { name: 'timer for practice' })).toBeVisible()
  await page.reload()
  await expect(page.getByRole('dialog', { name: 'timer for practice' })).toBeVisible()
  await expect(page.getByRole('timer')).toHaveText(/^1[45]:/)
})
