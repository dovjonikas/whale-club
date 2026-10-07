import { expect, test, type Page } from '@playwright/test'
import { dateKey, seed } from './helpers'

/**
 * The first minute: three beats on a first open (the promise, the truth,
 * the first step), never again by itself, always skippable, and again on
 * request. These tests use Playwright's own `test`: the helpers' one skips
 * the intro.
 */
const intro = (page: Page) => page.getByRole('dialog', { name: 'whale club' })
const beat = (page: Page) => intro(page)

test('a first open plays the intro; anything stored and it does not', async ({ page, browser }) => {
  await page.goto('')
  await expect(intro(page)).toBeVisible()
  await expect(intro(page)).toHaveAttribute('data-beat', 'promise')
  await expect(intro(page).getByRole('button', { name: 'skip' })).toBeVisible()

  const other = await browser.newPage()
  await seed(other, {
    things: [{ id: 't1', name: 'run', world: 'sea', createdAt: dateKey(-1), order: 0 }],
    days: {},
  })
  await other.goto('')
  await expect(other.getByRole('button', { name: 'run', exact: true })).toBeVisible()
  await expect(intro(other)).toHaveCount(0)
  await other.close()
})

test('skip goes to the first step, and from there out', async ({ page }) => {
  await page.goto('')
  await intro(page).getByRole('button', { name: 'skip' }).click()
  await expect(beat(page)).toHaveAttribute('data-beat', 'start')
  await expect(page.getByRole('button', { name: 'start light' })).toBeVisible()
  await intro(page).getByRole('button', { name: 'skip' }).click()
  await expect(intro(page)).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Add a thing' })).toBeVisible()
})

test('a tap anywhere goes on to the next beat', async ({ page }) => {
  await page.goto('')
  await expect(beat(page)).toHaveAttribute('data-beat', 'promise')
  await intro(page).click({ position: { x: 100, y: 300 } })
  await expect(beat(page)).toHaveAttribute('data-beat', 'truth')
  // The author's sentence, a phrase at a time, not a word changed.
  await expect(intro(page)).toContainText(
    'the thing is, sometimes doing such small things seems unremarkable,',
  )
  await expect(intro(page)).toContainText("because you can't see the results yet.")
  await intro(page).click({ position: { x: 100, y: 300 } })
  await expect(beat(page)).toHaveAttribute('data-beat', 'start')
})

test('four taps from a first open to the first card: skip, start light, a small thing, add', async ({
  page,
}) => {
  await page.goto('')
  await intro(page).getByRole('button', { name: 'skip' }).click()
  await page.getByRole('button', { name: 'start light' }).click()
  await page.getByRole('button', { name: /10 push-ups/ }).click()
  await page.getByRole('button', { name: 'add', exact: true }).click()
  await expect(page.getByRole('button', { name: '10 push-ups', exact: true })).toBeVisible()
  // The first thing is welcomed once, and its card says how it is done.
  await expect(page.locator('.line')).toHaveText('yours. it grows on the days you show up.')
  await expect(page.locator('.card-hint')).toHaveText("tap it when it's done.")
})

test('the whole intro reaches the first step within thirty seconds', async ({ page }) => {
  test.setTimeout(60_000)
  const start = Date.now()
  await page.goto('')
  await expect(intro(page)).toContainText('a year of small things.', { timeout: 15_000 })
  await expect(page.getByRole('button', { name: 'start light' })).toBeVisible({ timeout: 30_000 })
  expect(Date.now() - start).toBeLessThan(30_000)
  await expect(intro(page)).toContainText('but results come, after you compound these days,')
  await expect(intro(page)).toContainText('that you stay consistent, even when it seems small.')
})

test('under reduced motion the year is three still frames with the same lines', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('')
  await expect(intro(page)).toHaveAttribute('data-beat', 'promise')
  await expect(intro(page).locator('.intro-day')).toHaveText('day 1')
  await expect(intro(page).locator('.intro-day')).toHaveText('day 100', { timeout: 5000 })
  await expect(intro(page).locator('.intro-day')).toHaveText('day 365', { timeout: 5000 })
  await expect(intro(page)).toContainText('a year of small things.')
  await expect(beat(page)).toHaveAttribute('data-beat', 'truth', { timeout: 20_000 })
})

test('seen once, it never plays again by itself', async ({ page }) => {
  await page.goto('')
  await intro(page).getByRole('button', { name: 'skip' }).click()
  await intro(page).getByRole('button', { name: 'skip' }).click()
  await page.reload()
  await expect(page.getByRole('button', { name: 'Add a thing' })).toBeVisible()
  await expect(intro(page)).toHaveCount(0)
})

test('how it works can play it again', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('whaleclub:intro', 'seen')
  })
  await page.goto('')
  await expect(intro(page)).toHaveCount(0)
  await page.getByRole('button', { name: 'Menu' }).click()
  await page.getByRole('button', { name: 'how it works' }).click()
  await page.getByRole('button', { name: 'watch the intro' }).click()
  await expect(intro(page)).toBeVisible()
})

test('the lab can open the app for the first time again', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('whaleclub:intro', 'seen')
  })
  await page.goto('?lab=1')
  await page
    .getByRole('dialog', { name: 'the lab' })
    .getByRole('button', { name: 'first open again' })
    .click()
  await expect(intro(page)).toBeVisible()
})

test('the next find is always in sight, with the Collection count', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('whaleclub:intro', 'seen')
  })
  await seed(page, {
    things: [{ id: 't1', name: 'run', world: 'sea', createdAt: dateKey(-2), order: 0 }],
    days: { [dateKey(-1)]: { done: ['t1'] } },
  })
  await page.goto('')
  // One day done, the first find at three: two more.
  await expect(page.getByRole('button', { name: 'next find: in 2 days' })).toBeVisible()
  await page.getByRole('button', { name: 'next find: in 2 days' }).click()
  await expect(page.getByRole('dialog', { name: 'collection' })).toContainText('in 2 days')
})
