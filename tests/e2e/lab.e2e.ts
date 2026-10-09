import { type Page } from '@playwright/test'
import {
  expect,
  test,
  card,
  clearNotices,
  dateKey,
  dismissInstallLeaf,
  seed,
  STORAGE_KEY,
} from './helpers'

/**
 * The lab: a sandbox copy of the sea with a clock that moves by days. The
 * one promise that matters most is that the real record is never touched,
 * so the first test compares it byte for byte.
 */
const REAL = {
  things: [
    { id: 't1', name: 'run', world: 'sea' as const, createdAt: dateKey(-5), order: 0 },
    {
      id: 't2',
      name: 'read',
      kind: 'lockIn' as const,
      world: 'sky' as const,
      createdAt: dateKey(-5),
      order: 1,
    },
  ],
  days: { [dateKey(-2)]: { done: ['t1'] }, [dateKey(-1)]: { done: ['t1', 't2'] } },
}

const labBar = (page: Page) => page.getByRole('region', { name: 'the lab' })
const labSheet = (page: Page) => page.getByRole('dialog', { name: 'the lab' })
const stars = (page: Page) => page.getByRole('group', { name: 'your days' }).getByRole('button')

async function realRecord(page: Page): Promise<string | null> {
  return page.evaluate((key) => localStorage.getItem(key), STORAGE_KEY)
}

/** Opens the lab's sheet from the bar (it closes itself after every reload). */
async function lab(page: Page, action: string): Promise<void> {
  if (!(await labSheet(page).isVisible())) await labBar(page).getByRole('button').first().click()
  await labSheet(page).getByRole('button', { name: action, exact: true }).click()
  // Every action closes the sheet or reloads the page; wait until it has gone.
  await expect(labSheet(page)).toHaveCount(0)
  await expect(labBar(page)).toBeVisible()
}

test('the lab, in and out, leaves the real record exactly as it was', async ({ page }) => {
  await seed(page, REAL)
  await page.goto('')
  const before = await realRecord(page)
  expect(before).not.toBeNull()

  await page.goto('?lab=1')
  await expect(labSheet(page)).toBeVisible()
  await labSheet(page).getByRole('button', { name: 'Close' }).click()
  await clearNotices(page)
  await card(page, 'run').click()
  await page.getByRole('button', { name: 'Sound' }).click()
  await lab(page, 'seed 30 days')
  await lab(page, '+1 day')
  await expect(labBar(page)).toContainText('lab · +1 day')
  await lab(page, 'do everything today')
  await lab(page, 'clear sandbox')
  expect(await realRecord(page)).toBe(before)

  await labBar(page).getByRole('button', { name: 'exit' }).click()
  await expect(labBar(page)).toHaveCount(0)
  expect(await realRecord(page)).toBe(before)
  const left = await page.evaluate(() =>
    Object.keys(localStorage).filter((key) => key.startsWith('whaleclub:lab')),
  )
  expect(left).toEqual([])
})

test('+1 day: what was done today is a star, and the new day starts open', async ({ page }) => {
  await seed(page, REAL)
  await page.goto('?lab=1')
  await labSheet(page).getByRole('button', { name: 'Close' }).click()
  await clearNotices(page)
  await expect(stars(page)).toHaveCount(2)
  await card(page, 'run').click()
  await expect(stars(page)).toHaveCount(3)

  await lab(page, '+1 day')
  await clearNotices(page)
  await expect(card(page, 'run')).toHaveAttribute('aria-pressed', 'false')
  await expect(stars(page)).toHaveCount(3)
  await card(page, 'run').click()
  await expect(stars(page)).toHaveCount(4)
  await lab(page, 'back to real time')
  await expect(labBar(page)).toContainText('lab · +0 days')
})

test('seed 30 days grows the creatures and leaves stones waiting', async ({ page }) => {
  await page.goto('?lab=1')
  await lab(page, 'seed 30 days')
  await clearNotices(page)
  // An empty sandbox gets three plain things to seed.
  await expect(page.locator('.card')).toHaveCount(3)
  const stages = await page
    .locator('.card')
    .evaluateAll((cards) => cards.map((c) => Number((c as HTMLElement).dataset.stage)))
  expect(Math.max(...stages)).toBeGreaterThan(0)
  await expect(page.locator('.stone').first()).toBeVisible()
  expect(await page.locator('.stone').count()).toBeGreaterThanOrEqual(3)
  // Yesterday was left empty on purpose: a quiet day (a moon in the dots) inside the
  // week's freedom, or, past it, the quiet sea.
  const quietSea = await page.locator('.scene').getAttribute('data-quiet')
  const moons = await page.locator('.dot.is-quiet').count()
  expect(quietSea === 'true' || moons > 0).toBe(true)
})

test('exit brings the real sea back as it was', async ({ page }) => {
  await seed(page, REAL)
  await page.goto('?lab=1')
  await labSheet(page).getByRole('button', { name: 'Close' }).click()
  await clearNotices(page)
  await card(page, 'run').click()
  await expect(card(page, 'run')).toHaveAttribute('aria-pressed', 'true')
  await labBar(page).getByRole('button', { name: 'exit' }).click()
  await expect(labBar(page)).toHaveCount(0)
  expect(new URL(page.url()).searchParams.has('lab')).toBe(false)
  await expect(card(page, 'run')).toHaveAttribute('aria-pressed', 'false')
  await expect(stars(page)).toHaveCount(2)
})

test('?lab=1 opens the lab, says what it is, and the clock moves the date', async ({ page }) => {
  await page.goto('?lab=1')
  await expect(labBar(page)).toContainText('lab · +0 days')
  await expect(labSheet(page)).toContainText('fake time. your real sea is untouched.')
  await lab(page, '+7 days')
  await expect(labBar(page)).toContainText('lab · +7 days')
  await labBar(page).getByRole('button').first().click()
  const inAWeek = new Date()
  inAWeek.setDate(inAWeek.getDate() + 7)
  const when = inAWeek.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
  await expect(labSheet(page)).toContainText(`today in the lab: ${when}`)
})

test('five quick taps on the version, in settings, open the lab', async ({ page }) => {
  await page.goto('')
  await page.getByRole('button', { name: 'Menu' }).click()
  await page.getByRole('button', { name: 'settings', exact: true }).click()
  const version = page.getByRole('button', { name: /^version \d+\.\d+\.\d+$/ })
  for (let i = 0; i < 4; i++) await version.click()
  await expect(labBar(page)).toHaveCount(0)
  await version.click()
  await expect(labBar(page)).toBeVisible()
  await expect(labSheet(page)).toBeVisible()
})

test('the lab bar is on every screen, a sheet and a session too, and nothing covers it', async ({
  page,
}) => {
  await seed(page, REAL)
  await page.goto('?lab=1')
  const barIsOnTop = () =>
    page.evaluate(() => {
      const bar = document.querySelector('.lab-bar')
      if (!bar) return false
      const r = bar.getBoundingClientRect()
      const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)
      return hit !== null && bar.contains(hit)
    })
  expect(await barIsOnTop()).toBe(true)
  await labSheet(page).getByRole('button', { name: 'Close' }).click()
  await dismissInstallLeaf(page)
  await clearNotices(page)

  await page.getByRole('button', { name: 'Museum' }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  expect(await barIsOnTop()).toBe(true)
  await page.getByRole('dialog').getByRole('button', { name: 'Close' }).click()

  await card(page, 'read').click()
  await page.getByRole('button', { name: 'lock in', exact: true }).click()
  await expect(page.getByRole('dialog', { name: 'lock in: read' })).toBeVisible()
  await expect(labBar(page)).toBeVisible()
  expect(await barIsOnTop()).toBe(true)
  // The header of the session is below the bar, not under it.
  const barBottom = await labBar(page).evaluate((el) => el.getBoundingClientRect().bottom)
  const sessionTop = await page
    .getByRole('dialog', { name: 'lock in: read' })
    .evaluate((el) => el.getBoundingClientRect().top)
  expect(sessionTop).toBeGreaterThanOrEqual(barBottom - 1)
})
