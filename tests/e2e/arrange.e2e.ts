import type { Locator, Page } from '@playwright/test'
import { expect, seedPerson, STORAGE_KEY, test } from './helpers'

/**
 * Arranging the scene: places as rings, a thing moved by a tap and a tap
 * or by a drag, two things changing places, the chest, tidy up, and the
 * dock opening it with a thing in hand. Places and the chest themselves
 * are worked out in spots.e2e.ts; this is the person's side of them.
 */

async function placement(page: Page): Promise<Record<string, string> | undefined> {
  return page.evaluate((key) => {
    const data = JSON.parse(localStorage.getItem(key) ?? '{}') as {
      placement?: Record<string, string>
    }
    return data.placement
  }, STORAGE_KEY)
}

async function openArranging(page: Page): Promise<Locator> {
  await page.getByRole('button', { name: 'Collection' }).click()
  await page.getByRole('button', { name: 'arrange', exact: true }).click()
  const dialog = page.getByRole('dialog', { name: 'arrange your sea' })
  await expect(dialog).toBeVisible()
  return dialog
}

const ring = (page: Page, name: RegExp | string): Locator =>
  page.locator('.arrange-rings').getByRole('button', { name })

/** The place a ring stands for, by its data. */
const spotOf = (ring: Locator): Promise<string | null> => ring.getAttribute('data-spot')

test.beforeEach(async ({ page }) => {
  // Today at midday: the jellyfish holds its place but is only drawn after dark.
  const noon = new Date()
  noon.setHours(12, 0, 0, 0)
  await page.clock.setFixedTime(noon)
})

test('"arrange" in the Collection: the scene stops, the places show, the row is out of reach', async ({
  page,
}) => {
  await seedPerson(page)
  await page.goto('')
  await openArranging(page)
  await expect(page.locator('.scene')).toHaveAttribute('data-arranging', 'true')
  await expect(page.locator('#app')).toHaveAttribute('inert', '')
  // The shore 6, the sea 8, the sky 8.
  await expect(page.locator('.arrange-spot')).toHaveCount(22)
  await expect(ring(page, /^a fish, place \d$/)).toBeVisible()
  await page.getByRole('button', { name: 'done', exact: true }).click()
  await expect(page.locator('.scene')).toHaveAttribute('data-arranging', 'false')
  await expect(page.locator('#app')).not.toHaveAttribute('inert', '')
  await expect(page.locator('.arrange-spot')).toHaveCount(0)
})

test('a tap picks a find up and a tap on a free place of its world puts it down', async ({
  page,
}) => {
  await seedPerson(page)
  await page.goto('')
  await openArranging(page)
  const fish = ring(page, /^a fish, place \d$/)
  await fish.click()
  await expect(fish).toHaveAttribute('aria-pressed', 'true')
  const free = page.locator('.arrange-spot.is-free[data-world="sea"]').first()
  const target = await spotOf(free)
  await free.click()
  expect((await placement(page))?.['sea-a-fish']).toBe(target)
  // It stays there through a reload, and the scene draws it there.
  await page.reload()
  expect((await placement(page))?.['sea-a-fish']).toBe(target)
  await openArranging(page)
  await expect(page.locator(`.arrange-spot[data-spot="${target ?? ''}"]`)).toHaveAttribute(
    'aria-label',
    /^a fish, place \d$/,
  )
})

test('a drag onto a taken place swaps the two; another world refuses', async ({ page }) => {
  await seedPerson(page)
  await page.goto('')
  await openArranging(page)
  const fish = ring(page, /^a fish, place \d$/)
  const plankton = ring(page, /^plankton glow, place \d$/)
  const fishAt = await spotOf(fish)
  const planktonAt = await spotOf(plankton)
  const from = await fish.boundingBox()
  const to = await plankton.boundingBox()
  if (!from || !to) throw new Error('rings not on screen')
  await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2)
  await page.mouse.down()
  await page.mouse.move(to.x + to.width / 2, to.y + to.height / 2, { steps: 8 })
  await page.mouse.up()
  await expect
    .poll(() => placement(page))
    .toMatchObject({
      'sea-a-fish': planktonAt,
      'sea-a-plankton': fishAt,
    })
  // A sea find held over the sky: the sky's places fade, and a tap there moves nothing.
  const before = await placement(page)
  await ring(page, /^a fish, place \d$/).click()
  const sky = page.locator('.arrange-spot.is-free[data-world="sky"]').first()
  await expect(sky).toHaveClass(/is-other/)
  await sky.click({ force: true })
  expect(await placement(page)).toEqual(before)
})

test('put away goes into the chest, put out brings it back to a free place', async ({ page }) => {
  await seedPerson(page)
  await page.goto('')
  await openArranging(page)
  await ring(page, /^a fish, place \d$/).click()
  await page.getByRole('button', { name: 'put away' }).click()
  await expect(page.getByRole('button', { name: 'the chest · 1' })).toBeVisible()
  expect((await placement(page))?.['sea-a-fish']).toBe('chest')
  await expect(page.locator('.collectible[data-id="sea-a-fish"]')).toHaveCount(0)
  await page.getByRole('button', { name: 'the chest · 1' }).click()
  await page.getByRole('button', { name: 'put out' }).click()
  await expect(page.getByRole('button', { name: 'the chest · 0' })).toBeVisible()
  expect((await placement(page))?.['sea-a-fish']).toMatch(/^sea-/)
  await expect(page.locator('.collectible[data-id="sea-a-fish"]')).toBeAttached()
})

test('tidy up forgets every move and the places are automatic again', async ({ page }) => {
  await seedPerson(page)
  await page.goto('')
  await openArranging(page)
  await ring(page, /^a fish, place \d$/).click()
  await page.locator('.arrange-spot.is-free[data-world="sea"]').last().click()
  expect(await placement(page)).toBeDefined()
  await page.getByRole('button', { name: 'tidy up' }).click()
  expect(await placement(page)).toBeUndefined()
})

test('a full sea: the rest wait in the chest, and a new find says it went there', async ({
  page,
}) => {
  // Sea line a has five finds by day 30, line b three by day 14: eight, every place taken.
  await seedPerson(page, { swim: true, swimCracked: 14 })
  await page.goto('')
  const stone = page
    .getByRole('button', { name: 'a stone from swim. tap three times to crack it' })
    .first()
  await stone.click()
  await stone.click()
  await stone.click()
  await expect(page.locator('.line')).toHaveText('no room for a sea turtle. it waits in the chest.')
  await openArranging(page)
  await expect(page.getByRole('button', { name: 'the chest · 1' })).toBeVisible()
})

test('buying a thing to place opens arranging with it in hand', async ({ page }) => {
  // A hundred days of everything: plenty of krill for a buoy.
  await seedPerson(page, { days: 100 })
  await page.goto('')
  await page.locator('.krill-chip').click()
  const dock = page.getByRole('dialog', { name: 'the dock' })
  await dock.getByRole('button', { name: 'buoy, 150 krill' }).click()
  await dock.getByRole('button', { name: 'get it' }).click()
  await expect(page.getByRole('dialog', { name: 'arrange your sea' })).toBeVisible()
  await expect(page.locator('.arrange-hint')).toContainText('the buoy is here.')
  await expect(ring(page, /^buoy, place \d$/)).toHaveAttribute('aria-pressed', 'true')
})

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' })

  test('arranging works the same, and nothing slides', async ({ page }) => {
    await seedPerson(page)
    await page.goto('')
    await openArranging(page)
    await ring(page, /^a fish, place \d$/).click()
    const free = page.locator('.arrange-spot.is-free[data-world="sea"]').first()
    const target = await spotOf(free)
    await free.click()
    expect((await placement(page))?.['sea-a-fish']).toBe(target)
    const transition = await page
      .locator('.collectible[data-id="sea-a-fish"]')
      .evaluate((element) => getComputedStyle(element).transitionProperty)
    expect(transition).toBe('opacity')
  })
})
