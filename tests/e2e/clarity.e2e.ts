import type { Locator, Page } from '@playwright/test'
import { dateKey, expect, middayToday, seed, test, dismissInstallLeaf } from './helpers'

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
  await page.clock.install({ time: middayToday() })
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
  await within2(button(page, 'Museum'))
  await tap(button(page, 'Museum'))
  await expect(page.getByRole('dialog', { name: 'the museum' })).toBeVisible()

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

test('16. move a find: arrange is in sight within two taps, then the find and its new place', async ({
  page,
}) => {
  // A person a few weeks in, with finds in the scene.
  const things = [
    {
      id: 'run',
      name: 'run',
      world: 'sea' as const,
      createdAt: dateKey(-20),
      order: 0,
      kind: 'tap' as const,
    },
  ]
  const days: Record<string, { done: string[] }> = {}
  for (let i = -20; i < 0; i++) days[dateKey(i)] = { done: ['run'] }
  await seed(page, {
    things,
    days,
    cracked: { run: 14 },
    settings: { installDismissedAt: dateKey(-1) },
  })
  await page.goto('')
  await fromFirstScreen(page)
  await tap(button(page, 'Museum'))
  await within2(button(page, 'arrange'))
  await tap(button(page, 'arrange'))
  // The find and a free place of its world, both by their names.
  await page.getByRole('button', { name: /^a fish, place \d$/ }).click()
  const free = page.locator('.arrange-spot.is-free[data-world="sea"]').first()
  const place = await free.getAttribute('aria-label')
  await free.click()
  await expect(
    page.getByRole('button', { name: place?.replace('empty place', 'a fish, place') ?? '' }),
  ).toBeVisible()
  await tap(button(page, 'done'))
})

test('17. see how far the legendary is: in sight on the first screen, by name', async ({
  page,
}) => {
  const things = [
    {
      id: 'run',
      name: 'run',
      world: 'sea' as const,
      createdAt: dateKey(-12),
      order: 0,
      kind: 'tap' as const,
    },
  ]
  const days: Record<string, { done: string[] }> = {}
  for (let i = -12; i < 0; i++) days[dateKey(i)] = { done: ['run'] }
  await seed(page, {
    things,
    days,
    cracked: { run: 7 },
    settings: { installDismissedAt: dateKey(-1) },
  })
  await page.goto('')
  await fromFirstScreen(page)
  await within2(page.getByRole('button', { name: 'the golden whale: 12 of 30 stars' }))
})

test('18. say "not today": in sight on the first screen, under the check-in’s answer', async ({
  page,
}) => {
  await page.clock.install({ time: middayToday() })
  await seed(page, {
    things: [
      { id: 'run', name: 'run', world: 'sea', createdAt: dateKey(-3), order: 0, kind: 'tap' },
    ],
    days: { [dateKey(-1)]: { done: ['run'] } },
    settings: { installDismissedAt: dateKey(-1), lastRecapWeek: dateKey(0) },
  })
  await page.goto('')
  await fromFirstScreen(page)
  const recap = page.getByRole('complementary', { name: 'weekly recap' })
  if (await recap.isVisible()) await tap(recap.getByRole('button', { name: 'ok' }))
  const notToday = page
    .getByRole('complementary', { name: 'check-in' })
    .getByRole('button', { name: 'not today' })
  await within2(notToday)
  await tap(notToday)
  await expect(page.getByText('just this one?')).toBeVisible()
})

test('19. pet a creature: in sight on the first screen, by its name', async ({ page }) => {
  await page.clock.install({ time: middayToday() })
  await seed(page, {
    things: [
      { id: 'run', name: 'run', world: 'sea', createdAt: dateKey(-3), order: 0, kind: 'tap' },
    ],
    days: { [dateKey(-1)]: { done: ['run'] }, [dateKey(0)]: { done: [], checkin: true } },
    settings: { installDismissedAt: dateKey(-1) },
  })
  await page.goto('')
  await fromFirstScreen(page)
  const recap = page.getByRole('complementary', { name: 'weekly recap' })
  if (await recap.isVisible()) await tap(recap.getByRole('button', { name: 'ok' }))
  await within2(button(page, 'pet run'))
  await tap(button(page, 'pet run'))
})

/** Forty days in, today's check-in done, at noon: the first screen of a person who uses it. */
async function fortyDays(page: Page, settings: Record<string, unknown> = {}): Promise<void> {
  await page.clock.install({ time: middayToday() })
  const days: Record<string, { done: string[]; checkin?: boolean }> = {}
  for (let i = -40; i < 0; i++) days[dateKey(i)] = { done: ['run'] }
  days[dateKey(0)] = { done: [], checkin: true }
  await seed(page, {
    things: [
      { id: 'run', name: 'run', world: 'sea', createdAt: dateKey(-40), order: 0, kind: 'tap' },
    ],
    days,
    cracked: { run: 30 },
    settings: { installDismissedAt: dateKey(-1), lastRecapWeek: dateKey(0), ...settings },
  })
  await page.goto('')
  await fromFirstScreen(page)
  const recap = page.getByRole('complementary', { name: 'weekly recap' })
  if (await recap.isVisible()) await tap(recap.getByRole('button', { name: 'ok' }))
  taps = 0
}

test('20. read a find’s plaque: its case is two taps away, by the find’s name', async ({
  page,
}) => {
  await fortyDays(page)
  await tap(button(page, 'Museum'))
  await within2(button(page, 'a fish, open its case'))
  await tap(button(page, 'a fish, open its case'))
  await expect(page.getByRole('heading', { name: 'a fish' })).toBeVisible()
})

test('21. drift: the word is in the club, and the way back is said', async ({ page }) => {
  await fortyDays(page)
  await tap(button(page, 'Menu'))
  await within2(button(page, 'drift'))
  await tap(button(page, 'drift'))
  await expect(page.getByText('tap anywhere to come back')).toBeVisible()
  await tap(page.getByRole('button', { name: 'tap anywhere to come back' }))
  await expect(button(page, 'Menu')).toBeVisible()
})

test('22. hear where the whale went: on the first screen, after the check-in', async ({ page }) => {
  const morning = middayToday()
  morning.setHours(9)
  await page.clock.install({ time: morning })
  const days: Record<string, { done: string[]; checkin?: boolean }> = {}
  for (let i = -5; i < 0; i++) days[dateKey(i, morning)] = { done: ['run'] }
  days[dateKey(0, morning)] = { done: [], checkin: true }
  await seed(page, {
    things: [
      {
        id: 'run',
        name: 'run',
        world: 'sea',
        createdAt: dateKey(-5, morning),
        order: 0,
        kind: 'tap',
      },
    ],
    days,
    settings: { installDismissedAt: dateKey(-1, morning), swimOn: null },
  })
  await page.goto('')
  await fromFirstScreen(page)
  const recap = page.getByRole('complementary', { name: 'weekly recap' })
  if (await recap.isVisible()) await tap(recap.getByRole('button', { name: 'ok' }))
  const swim = page.getByRole('complementary', { name: 'the whale is back' })
  await within2(swim.getByRole('button', { name: 'ok' }))
})

test('23. what’s new: in how it works, two taps from the first screen', async ({ page }) => {
  await fortyDays(page)
  await tap(button(page, 'Menu'))
  await tap(button(page, 'how it works'))
  await within2(button(page, 'what’s new'))
})

test('24. watch last month’s tide: the log, a month back, its own word', async ({ page }) => {
  await fortyDays(page)
  await tap(button(page, 'Menu'))
  await tap(button(page, 'the log'))
  await page.getByRole('button', { name: 'previous month' }).click()
  await expect(page.getByRole('button', { name: /^watch .+’s tide$/ })).toBeVisible()
})
