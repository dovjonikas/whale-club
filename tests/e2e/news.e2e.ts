import type { Page } from '@playwright/test'
import { NEWS_KEY } from '../../src/app/news'
import { expect, seedPerson, test } from './helpers'

/**
 * What's new: once after the update, with "try it" going straight to each
 * new thing, then from how it works whenever asked. The tests' own page
 * marks it seen; these take the mark away again, as an update would find it.
 */
async function updated(page: Page): Promise<void> {
  await page.addInitScript((key) => {
    // Runs after the fixture's own script on the first load only, as a phone the update reaches.
    if (sessionStorage.getItem('updated') === null) {
      localStorage.removeItem(key)
      sessionStorage.setItem('updated', '1')
    }
  }, NEWS_KEY)
  await seedPerson(page)
}

const sheet = (page: Page) => page.getByRole('dialog', { name: 'what’s new' })

test('after the update, what’s new opens once, with a card for each new thing', async ({
  page,
}) => {
  await updated(page)
  await page.goto('')
  await expect(sheet(page)).toBeVisible()
  for (const title of ['the museum', 'the month’s tide', 'drift', 'the night swim'])
    await expect(sheet(page).getByRole('button', { name: `try it: ${title}` })).toBeVisible()
  await page.keyboard.press('Escape')
  await page.reload()
  await expect(page.getByRole('button', { name: 'Menu' })).toBeVisible()
  await expect(sheet(page)).toHaveCount(0)
})

test('"try it" goes straight there: the museum, drift, the night swim', async ({ page }) => {
  await updated(page)
  await page.goto('')
  await sheet(page).getByRole('button', { name: 'try it: the museum' }).click()
  await expect(page.getByRole('dialog', { name: 'the museum' })).toBeVisible()
  await page.keyboard.press('Escape')
  await page.getByRole('button', { name: 'Menu' }).click()
  await page.getByRole('button', { name: 'how it works' }).click()
  await page.getByRole('button', { name: 'what’s new' }).click()
  await sheet(page).getByRole('button', { name: 'try it: the night swim' }).click()
  await expect(page.getByRole('complementary', { name: 'the whale is back' })).toBeVisible()
  await page.getByRole('button', { name: 'Menu' }).click()
  await page.getByRole('button', { name: 'how it works' }).click()
  await page.getByRole('button', { name: 'what’s new' }).click()
  await sheet(page).getByRole('button', { name: 'try it: drift' }).click()
  await expect(page.locator('#app')).toHaveClass(/is-drifting/)
})

test('a first open never shows it: the intro is the welcome', async ({ page }) => {
  await page.addInitScript((key) => {
    localStorage.removeItem(key)
  }, NEWS_KEY)
  await page.goto('')
  await expect(page.getByRole('button', { name: 'Add a thing' })).toBeVisible()
  await expect(sheet(page)).toHaveCount(0)
  expect(await page.evaluate((key) => localStorage.getItem(key), NEWS_KEY)).not.toBeNull()
})

test('"try it" on the tide tells the month there is', async ({ page }) => {
  await updated(page)
  await page.goto('')
  await sheet(page).getByRole('button', { name: 'try it: the month’s tide' }).click()
  // Forty days of stars: last month has a tide, or this one so far.
  await expect(page.getByRole('dialog', { name: /, in a few lines$/ })).toBeVisible()
})
