import type { Page } from '@playwright/test'
import {
  expect,
  test,
  addThing,
  card,
  dateKey,
  dismissInstallLeaf,
  seed,
  setHidden,
  stored,
} from './helpers'

/**
 * Lock in. A lock-in thing counts only when its timer has seen its whole
 * length that day; nothing seen is lost, and parts of a day add up. The
 * world sinks while it runs and opens up again at the end, in order, and
 * a tap skips to the end of that. The clock is Playwright's, so ten
 * minutes take a moment.
 */
async function lockInThing(page: Page, name: string): Promise<void> {
  await addThing(page, name, { lockIn: true })
}

/** A tap on a lock-in card opens the dial; this sets the length and starts. */
async function startLockIn(page: Page, name: string, minutes: number): Promise<void> {
  await card(page, name).click()
  // The sheet moves focus to its button on the next frame; wait for that before taking it.
  await expect(page.getByRole('button', { name: 'lock in', exact: true })).toBeFocused()
  const slider = page.getByRole('slider', { name: 'minutes' })
  await slider.focus()
  await page.keyboard.press('Home')
  // Home is five minutes; up to an hour each stop is five more.
  for (let m = 5; m < minutes; m += 5) await page.keyboard.press('ArrowRight')
  await expect(slider).toHaveAttribute('aria-valuenow', String(minutes))
  await page.getByRole('button', { name: 'lock in', exact: true }).click()
}

/** The first lock-in ever finished says what its lantern is, in place of the usual line. */
const FIRST_LANTERN = 'a lantern for every lock-in you finish.'

const session = (page: Page, name: string) => page.getByRole('dialog', { name: `lock in: ${name}` })
const lanterns = (page: Page) => page.locator('canvas.lanterns')
const stars = (page: Page) => page.getByRole('group', { name: 'your days' }).getByRole('button')
/** The whole card around a thing's button, where its state and its words are. */
const cardOf = (page: Page, name: string) => page.locator('.card', { has: card(page, name) })

interface StoredSession {
  thing: string
  minutes: number
  parts?: number
}

async function today(page: Page): Promise<{
  done: string[]
  minutes: Record<string, number>
  sessions?: StoredSession[]
}> {
  const data = (await stored(page)) as unknown as {
    days: Record<
      string,
      { done: string[]; minutes: Record<string, number>; sessions?: StoredSession[] }
    >
  }
  return data.days[dateKey(0)] ?? { done: [], minutes: {} }
}

/** Writes down every step of the opening as the frame shows it. */
async function recordOpening(page: Page): Promise<void> {
  await page.evaluate(() => {
    const w = window as unknown as { __steps: string[] }
    w.__steps = []
    const frame = document.getElementById('frame')
    if (!frame) return
    new MutationObserver(() => {
      const step = frame.dataset.opening
      if (step && w.__steps[w.__steps.length - 1] !== step) w.__steps.push(step)
    }).observe(frame, { attributes: true, attributeFilter: ['data-opening'] })
  })
}

const steps = (page: Page) =>
  page.evaluate(() => (window as unknown as { __steps: string[] }).__steps)

async function openingDone(page: Page): Promise<void> {
  await expect(page.locator('#frame')).toHaveAttribute('data-opening', 'done', { timeout: 15_000 })
}

test('a tap on a lock-in card opens the dial and marks nothing', async ({ page }) => {
  await page.goto('')
  await lockInThing(page, 'study')
  await dismissInstallLeaf(page)
  await expect(cardOf(page, 'study')).toContainText('15 min')
  await card(page, 'study').click()
  await expect(page.getByRole('slider', { name: 'minutes' })).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(cardOf(page, 'study')).toHaveAttribute('data-done', 'false')
  expect((await today(page)).done).toEqual([])
})

test('a full session opens the world in order and marks the thing done', async ({ page }) => {
  await page.clock.install()
  await page.goto('')
  await lockInThing(page, 'run')
  await addThing(page, 'read')
  await dismissInstallLeaf(page)
  await startLockIn(page, 'run', 10)
  const screen = session(page, 'run')
  await expect(screen.getByRole('timer')).toHaveText(/^(10:00|9:59)$/)
  await page.clock.fastForward('05:00')
  await expect(screen.getByRole('timer')).toHaveText(/^(5:00|4:59)$/)
  await recordOpening(page)
  await page.clock.fastForward('05:02')
  await openingDone(page)
  expect(await steps(page)).toEqual([
    'rise',
    'lantern',
    'creature',
    'star',
    'line',
    'offer',
    'done',
  ])
  await expect(screen).toHaveCount(0)
  await expect(page.locator('.line')).toHaveText(FIRST_LANTERN)
  await expect(page.getByRole('button', { name: 'send the whale' })).toBeVisible()
  await expect(cardOf(page, 'run')).toHaveAttribute('data-done', 'true')
  expect((await today(page)).sessions).toEqual([{ thing: expect.any(String), minutes: 10 }])
  await expect(lanterns(page)).toHaveAttribute('data-count', '1')
  await expect(lanterns(page)).toHaveAttribute('data-soft', '0')
  await expect(lanterns(page)).toHaveAttribute('data-held', '0')
  await expect(stars(page)).toHaveCount(1)
})

test('a done lock-in card does not undo on a tap; its sheet takes it back', async ({ page }) => {
  await page.clock.install()
  await page.goto('')
  await lockInThing(page, 'run')
  await dismissInstallLeaf(page)
  await startLockIn(page, 'run', 10)
  await page.clock.fastForward('10:02')
  await session(page, 'run').click({ position: { x: 20, y: 300 } })
  await openingDone(page)
  await card(page, 'run').click()
  // One more session is offered, never an undo.
  await expect(page.getByRole('slider', { name: 'minutes' })).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(cardOf(page, 'run')).toHaveAttribute('data-done', 'true')
  await page.getByRole('button', { name: 'edit run' }).click()
  await page.getByRole('button', { name: 'not done today after all' }).click()
  await expect(cardOf(page, 'run')).toHaveAttribute('data-done', 'false')
})

test('a tap during the opening lands on its end at once', async ({ page }) => {
  await page.clock.install()
  await page.goto('')
  await lockInThing(page, 'run')
  await addThing(page, 'read')
  await dismissInstallLeaf(page)
  await startLockIn(page, 'run', 10)
  await page.clock.fastForward('10:02')
  await expect(page.locator('#frame')).toHaveAttribute('data-opening', 'rise')
  await session(page, 'run').click({ position: { x: 20, y: 300 } })
  await expect(page.locator('#frame')).toHaveAttribute('data-opening', 'done')
  await expect(session(page, 'run')).toHaveCount(0)
  await expect(page.locator('.line')).toHaveText(FIRST_LANTERN)
  await expect(page.getByRole('button', { name: 'send the whale' })).toBeVisible()
  await expect(lanterns(page)).toHaveAttribute('data-held', '0')
  await expect(stars(page)).toHaveCount(1)
  // Nothing is left inert or hidden behind it.
  await card(page, 'read').click()
  await expect(card(page, 'read')).toHaveAttribute('aria-pressed', 'true')
})

test('stop keeps what the timer saw, the card offers to finish, and the parts add up', async ({
  page,
}) => {
  await page.clock.install()
  await page.goto('')
  await lockInThing(page, 'run')
  await dismissInstallLeaf(page)
  await startLockIn(page, 'run', 10)
  await page.clock.fastForward('04:10')
  await session(page, 'run').getByRole('button', { name: 'stop' }).click()
  await expect(session(page, 'run')).toBeHidden()
  await expect(page.locator('.line')).toContainText('stopped. 4 min')
  await expect(cardOf(page, 'run')).toHaveAttribute('data-done', 'false')
  await expect(cardOf(page, 'run')).toContainText('4/10 · finish')
  expect((await today(page)).minutes[(await stored(page)).things[0]?.id ?? '']).toBe(4)

  // A tap goes straight on from four minutes: six more and it is done, in two parts.
  await card(page, 'run').click()
  await expect(session(page, 'run').getByRole('timer')).toHaveText(/^(6:00|5:59)$/)
  await page.clock.fastForward('06:02')
  await openingDone(page)
  await expect(cardOf(page, 'run')).toHaveAttribute('data-done', 'true')
  expect((await today(page)).sessions).toEqual([
    { thing: expect.any(String), minutes: 10, parts: 2 },
  ])
  await expect(lanterns(page)).toHaveAttribute('data-soft', '1')
})

test('away for longer than 15 seconds: the count stops after the grace and goes on on return', async ({
  page,
}) => {
  await page.clock.install()
  await page.goto('')
  await lockInThing(page, 'run')
  await dismissInstallLeaf(page)
  await startLockIn(page, 'run', 10)
  const screen = session(page, 'run')
  await page.clock.fastForward('02:00')
  await setHidden(page, true)
  await page.clock.fastForward('01:00')
  await setHidden(page, false)
  await expect(screen).toHaveAttribute('data-away', 'true')
  await expect(screen).toContainText('you left. it waited.')
  // Two minutes and the fifteen seconds of grace counted; the rest of the minute did not.
  await expect(screen.getByRole('timer')).toHaveText(/^7:4\d$/)
  await page.clock.fastForward('07:50')
  await openingDone(page)
  await expect(cardOf(page, 'run')).toHaveAttribute('data-done', 'true')
  await expect(lanterns(page)).toHaveAttribute('data-soft', '1')
})

test('a short look away is not leaving', async ({ page }) => {
  await page.clock.install()
  await page.goto('')
  await lockInThing(page, 'run')
  await dismissInstallLeaf(page)
  await startLockIn(page, 'run', 10)
  await page.clock.fastForward('01:00')
  await setHidden(page, true)
  await page.clock.fastForward('00:10')
  await setHidden(page, false)
  await page.clock.fastForward('00:01')
  await expect(session(page, 'run')).toHaveAttribute('data-away', 'false')
  await expect(session(page, 'run').getByRole('timer')).toHaveText(/^8:[45]\d$/)
})

test('a reload keeps the minutes the timer saw, and the card offers to finish', async ({
  page,
}) => {
  await page.clock.install()
  await page.goto('')
  await lockInThing(page, 'run')
  await dismissInstallLeaf(page)
  await startLockIn(page, 'run', 15)
  await page.clock.fastForward('06:30')
  await page.reload()
  await expect(session(page, 'run')).toHaveCount(0)
  await expect(cardOf(page, 'run')).toContainText('6/15 · finish')
  await expect(page.locator('.line')).toHaveText('minutes kept. tap the card to finish.')
})

test('a phone that died: the count stops at the last moment the screen was seen', async ({
  page,
}) => {
  await seed(page, {
    things: [
      {
        id: 't1',
        name: 'run',
        kind: 'lockIn',
        minutes: 15,
        world: 'sea',
        createdAt: dateKey(-3),
        order: 0,
      },
    ],
    days: {},
  })
  // A session left by a page that went without a word (no pagehide): seen for 9 minutes,
  // an hour ago, today. Written before the app loads, as a phone that died leaves it.
  await page.addInitScript(() => {
    if (sessionStorage.getItem('died') !== null) return
    sessionStorage.setItem('died', '1')
    const start = Date.now() - 70 * 60_000
    const d = new Date()
    const date = [
      String(d.getFullYear()),
      String(d.getMonth() + 1).padStart(2, '0'),
      String(d.getDate()).padStart(2, '0'),
    ].join('-')
    localStorage.setItem(
      'whaleclub:session',
      JSON.stringify({
        thingId: 't1',
        minutes: 15,
        date,
        baseMs: 0,
        startedAt: start,
        pausedMs: 0,
        seenUntil: start + 9 * 60_000,
      }),
    )
  })
  await page.goto('')
  // Nine minutes seen, and the fifteen seconds of grace after: nine kept.
  await expect(cardOf(page, 'run')).toContainText('9/15 · finish')
})

test('a day that ends short keeps its minutes as a faint lantern, and the next day starts fresh', async ({
  page,
}) => {
  await seed(page, {
    things: [
      {
        id: 't1',
        name: 'study',
        kind: 'lockIn',
        minutes: 25,
        world: 'sea',
        createdAt: dateKey(-3),
        order: 0,
      },
    ],
    days: { [dateKey(-1)]: { done: [], minutes: { t1: 12 } } },
  })
  await page.goto('')
  await dismissInstallLeaf(page)
  await expect(lanterns(page)).toHaveAttribute('data-count', '1')
  await expect(lanterns(page)).toHaveAttribute('data-dim', '1')
  await expect(cardOf(page, 'study')).toContainText('25 min')
  await expect(cardOf(page, 'study')).not.toContainText('finish')
})

test('all done waits for a lock-in that is not finished', async ({ page }) => {
  await page.clock.install()
  await page.goto('')
  await addThing(page, 'water')
  await lockInThing(page, 'study')
  await dismissInstallLeaf(page)
  await card(page, 'water').click()
  await expect(page.locator('.whale')).toHaveCount(0)
  await startLockIn(page, 'study', 10)
  await page.clock.fastForward('03:00')
  await session(page, 'study').getByRole('button', { name: 'stop' }).click()
  await expect(page.locator('.whale')).toHaveCount(0)
  await card(page, 'study').click()
  await page.clock.fastForward('07:02')
  await openingDone(page)
  await expect(page.locator('.line')).toHaveText(FIRST_LANTERN)
  expect((await today(page)).done).toHaveLength(2)
})

test('the time is hidden, and a tap shows it for three seconds', async ({ page }) => {
  await page.clock.install()
  await page.goto('')
  await lockInThing(page, 'run')
  await dismissInstallLeaf(page)
  await startLockIn(page, 'run', 10)
  const screen = session(page, 'run')
  await expect(screen).toHaveAttribute('data-time', 'hidden')
  await expect(screen.getByRole('timer')).toHaveCSS('opacity', '0')
  await screen.locator('.session-name').click()
  await expect(screen).toHaveAttribute('data-time', 'shown')
  await page.clock.fastForward(3200)
  await expect(screen).toHaveAttribute('data-time', 'hidden')
})

test('undo in the first ten seconds leaves no trace; after that it is stop', async ({ page }) => {
  await page.clock.install()
  await page.goto('')
  await lockInThing(page, 'run')
  await dismissInstallLeaf(page)
  await startLockIn(page, 'run', 10)
  await expect(session(page, 'run').getByRole('button', { name: 'stop' })).toBeHidden()
  await session(page, 'run').getByRole('button', { name: 'undo' }).click()
  await expect(session(page, 'run')).toHaveCount(0)
  const data = await stored(page)
  expect(data.days[dateKey(0)]).toBeUndefined()

  await startLockIn(page, 'run', 10)
  await page.clock.fastForward('00:12')
  await expect(session(page, 'run').getByRole('button', { name: 'undo' })).toBeHidden()
  await expect(session(page, 'run').getByRole('button', { name: 'stop' })).toBeVisible()
})

test('one pause: the creature sleeps, the time stands still, and it is gone once used', async ({
  page,
}) => {
  await page.clock.install()
  await page.goto('')
  await lockInThing(page, 'run')
  await dismissInstallLeaf(page)
  await startLockIn(page, 'run', 10)
  const screen = session(page, 'run')
  await page.clock.fastForward('01:00')
  await screen.getByRole('button', { name: 'pause' }).click()
  await expect(screen).toHaveAttribute('data-state', 'paused')
  await expect(screen.locator('.session-creature')).toHaveClass(/is-asleep/)
  await expect(screen).toContainText('paused. it is asleep.')
  const held = await screen.getByRole('timer').textContent()
  await page.clock.fastForward('02:00')
  await expect(screen.getByRole('timer')).toHaveText(held ?? '')
  await screen.getByRole('button', { name: 'go on' }).click()
  await expect(screen).toHaveAttribute('data-state', 'running')
  await expect(screen.getByRole('button', { name: 'pause' })).toBeHidden()
  // Nine minutes left, give or take the seconds the test itself takes.
  await expect(screen.getByRole('timer')).toHaveText(/^(9:0\d|8:[2-5]\d)$/)
})

test('a pause runs out by itself after five minutes, and being away inside it is not leaving', async ({
  page,
}) => {
  await page.clock.install()
  await page.goto('')
  await lockInThing(page, 'run')
  await dismissInstallLeaf(page)
  await startLockIn(page, 'run', 20)
  const screen = session(page, 'run')
  await page.clock.fastForward('00:30')
  await screen.getByRole('button', { name: 'pause' }).click()
  await setHidden(page, true)
  await page.clock.fastForward('02:00')
  await setHidden(page, false)
  await expect(screen).toHaveAttribute('data-away', 'false')
  await expect(screen).toHaveAttribute('data-state', 'paused')
  await page.clock.fastForward('03:05')
  await expect(screen).toHaveAttribute('data-state', 'running')
  await expect(screen).toContainText('going on.')
  const paused = await page.evaluate(
    () =>
      (JSON.parse(localStorage.getItem('whaleclub:session') ?? '{}') as { pausedMs?: number })
        .pausedMs ?? 0,
  )
  expect(paused).toBe(5 * 60_000)
})

test('the screen is kept awake during a session', async ({ page }) => {
  await page.addInitScript(() => {
    const w = window as unknown as { __wake: number }
    w.__wake = 0
    Object.defineProperty(navigator, 'wakeLock', {
      configurable: true,
      value: {
        request: () => {
          w.__wake++
          return Promise.resolve({ release: () => Promise.resolve() })
        },
      },
    })
  })
  await page.goto('')
  await lockInThing(page, 'run')
  await dismissInstallLeaf(page)
  await startLockIn(page, 'run', 10)
  await expect
    .poll(() => page.evaluate(() => (window as unknown as { __wake: number }).__wake))
    .toBeGreaterThan(0)
})

test('the dial opens on the last length chosen for that thing', async ({ page }) => {
  await page.goto('')
  await lockInThing(page, 'run')
  await lockInThing(page, 'read')
  await dismissInstallLeaf(page)
  await startLockIn(page, 'run', 40)
  await session(page, 'run').getByRole('button', { name: 'undo' }).click()
  await card(page, 'run').click()
  await expect(page.getByRole('slider', { name: 'minutes' })).toHaveAttribute('aria-valuenow', '40')
  await page.keyboard.press('Escape')
  await card(page, 'read').click()
  await expect(page.getByRole('slider', { name: 'minutes' })).toHaveAttribute('aria-valuenow', '15')
})
