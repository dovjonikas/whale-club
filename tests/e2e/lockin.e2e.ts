import { expect, test, type Page } from '@playwright/test'
import { addThing, card, dateKey, dismissInstallLeaf, setHidden, stored } from './helpers'

/**
 * Lock in, where nothing dies. A session is measured from timestamps;
 * leaving for more than fifteen seconds does not fail it, the creature
 * waits and the session goes on, but its end counts the showing up
 * without the star or the step towards a stone. The world sinks while it
 * runs and opens up again at the end, in order, and a tap skips to the
 * end of that. The clock is Playwright's, so ten minutes take a moment.
 */
async function startLockIn(page: Page, name: string, minutes: number): Promise<void> {
  await page.getByRole('button', { name: `lock in: ${name}` }).click()
  // The sheet moves focus to its button on the next frame; wait for that before taking it.
  await expect(page.getByRole('button', { name: 'lock in', exact: true })).toBeFocused()
  const slider = page.getByRole('slider', { name: 'minutes' })
  await slider.focus()
  await page.keyboard.press('Home')
  for (let m = 10; m < minutes; m += 5) await page.keyboard.press('ArrowRight')
  await expect(slider).toHaveAttribute('aria-valuenow', String(minutes))
  await page.getByRole('button', { name: 'lock in', exact: true }).click()
}

const session = (page: Page, name: string) => page.getByRole('dialog', { name: `lock in: ${name}` })
const lanterns = (page: Page) => page.locator('canvas.lanterns')
const stars = (page: Page) => page.getByRole('group', { name: 'your days' }).getByRole('button')

interface StoredSession {
  thing: string
  minutes: number
  left?: boolean
}

async function sessionsToday(page: Page): Promise<StoredSession[] | undefined> {
  const data = (await stored(page)) as unknown as {
    days: Record<string, { sessions?: StoredSession[] }>
  }
  return data.days[dateKey(0)]?.sessions
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

test('a clean end opens the world in order: lantern, creature, star, line, the whale to send', async ({
  page,
}) => {
  await page.clock.install()
  await page.goto('')
  await addThing(page, 'run')
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
  await expect(page.locator('.line')).toHaveText('time. that counts.')
  await expect(page.getByRole('button', { name: 'send the whale' })).toBeVisible()
  await expect(card(page, 'run')).toHaveAttribute('aria-pressed', 'true')
  expect(await sessionsToday(page)).toEqual([{ thing: expect.any(String), minutes: 10 }])
  await expect(lanterns(page)).toHaveAttribute('data-count', '1')
  await expect(lanterns(page)).toHaveAttribute('data-dim', '0')
  await expect(lanterns(page)).toHaveAttribute('data-held', '0')
  await expect(stars(page)).toHaveCount(1)
})

test('a tap during the opening lands on its end at once', async ({ page }) => {
  await page.clock.install()
  await page.goto('')
  await addThing(page, 'run')
  await addThing(page, 'read')
  await dismissInstallLeaf(page)
  await startLockIn(page, 'run', 10)
  await page.clock.fastForward('10:02')
  await expect(page.locator('#frame')).toHaveAttribute('data-opening', 'rise')
  await session(page, 'run').click({ position: { x: 20, y: 300 } })
  await expect(page.locator('#frame')).toHaveAttribute('data-opening', 'done')
  await expect(session(page, 'run')).toHaveCount(0)
  await expect(page.locator('.line')).toHaveText('time. that counts.')
  await expect(page.getByRole('button', { name: 'send the whale' })).toBeVisible()
  await expect(lanterns(page)).toHaveAttribute('data-held', '0')
  await expect(stars(page)).toHaveCount(1)
  // Nothing is left inert or hidden behind it.
  await card(page, 'read').click()
  await expect(card(page, 'read')).toHaveAttribute('aria-pressed', 'true')
})

test('leaving for more than 15 seconds: it waits, the end counts but stays small, the lantern is dim', async ({
  page,
}) => {
  await page.clock.install()
  await page.goto('')
  await addThing(page, 'run')
  await addThing(page, 'read')
  await dismissInstallLeaf(page)
  await startLockIn(page, 'run', 10)
  const screen = session(page, 'run')
  await page.clock.fastForward('02:00')
  await setHidden(page, true)
  await page.clock.fastForward('00:20')
  await setHidden(page, false)
  await expect(screen).toHaveAttribute('data-broken', 'true')
  await expect(screen).toContainText('you left. it waited.')
  // The twenty seconds away were not counted: they are set aside, and about eight minutes are left.
  const away = await page.evaluate(
    () =>
      (JSON.parse(localStorage.getItem('whaleclub:session') ?? '{}') as { pausedMs?: number })
        .pausedMs ?? 0,
  )
  expect(away).toBeGreaterThanOrEqual(20_000)
  await expect(screen.getByRole('timer')).toHaveText(/^(8:00|7:[45]\d)$/)
  await page.clock.fastForward('08:02')
  await openingDone(page)
  await expect(page.locator('.line')).toHaveText('it counts. it stayed small this time.')
  await expect(card(page, 'run')).toHaveAttribute('aria-pressed', 'true')
  const data = await stored(page)
  expect(data.days[dateKey(0)]?.waited).toEqual([data.things[0]?.id])
  expect(await sessionsToday(page)).toEqual([
    { thing: data.things[0]?.id, minutes: 10, left: true },
  ])
  await expect(lanterns(page)).toHaveAttribute('data-dim', '1')
  // No star for it, and no step towards a stone.
  await expect(stars(page)).toHaveCount(0)
  await page.getByRole('button', { name: 'Collection' }).click()
  await expect(page.getByRole('dialog', { name: 'collection' })).toContainText('0 days')
})

test('a short look away is not leaving', async ({ page }) => {
  await page.clock.install()
  await page.goto('')
  await addThing(page, 'run')
  await dismissInstallLeaf(page)
  await startLockIn(page, 'run', 10)
  await page.clock.fastForward('01:00')
  await setHidden(page, true)
  await page.clock.fastForward('00:10')
  await setHidden(page, false)
  await page.clock.fastForward('00:01')
  await expect(session(page, 'run')).toHaveAttribute('data-broken', 'false')
})

test('the time is hidden, and a tap shows it for three seconds', async ({ page }) => {
  await page.clock.install()
  await page.goto('')
  await addThing(page, 'run')
  await dismissInstallLeaf(page)
  await startLockIn(page, 'run', 10)
  const screen = session(page, 'run')
  await expect(screen).toHaveAttribute('data-time', 'hidden')
  await expect(screen.getByRole('timer')).toHaveCSS('opacity', '0')
  await screen.getByText('run', { exact: false }).last().click()
  await expect(screen).toHaveAttribute('data-time', 'shown')
  await page.clock.fastForward(3200)
  await expect(screen).toHaveAttribute('data-time', 'hidden')
})

test('undo in the first ten seconds leaves no trace; after that it is stop', async ({ page }) => {
  await page.clock.install()
  await page.goto('')
  await addThing(page, 'run')
  await dismissInstallLeaf(page)
  await startLockIn(page, 'run', 10)
  await expect(session(page, 'run').getByRole('button', { name: 'stop' })).toBeHidden()
  await session(page, 'run').getByRole('button', { name: 'undo' }).click()
  await expect(session(page, 'run')).toHaveCount(0)
  const data = await stored(page)
  expect(data.days[dateKey(0)]).toBeUndefined()
  await expect(page.locator('.line')).not.toContainText('min noted')

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
  await addThing(page, 'run')
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
  await addThing(page, 'run')
  await dismissInstallLeaf(page)
  await startLockIn(page, 'run', 20)
  const screen = session(page, 'run')
  await page.clock.fastForward('00:30')
  await screen.getByRole('button', { name: 'pause' }).click()
  await setHidden(page, true)
  await page.clock.fastForward('02:00')
  await setHidden(page, false)
  await expect(screen).toHaveAttribute('data-broken', 'false')
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

test('a reload does not end or break a session', async ({ page }) => {
  await page.goto('')
  await addThing(page, 'run')
  await dismissInstallLeaf(page)
  await startLockIn(page, 'run', 15)
  await expect(session(page, 'run')).toBeVisible()
  await page.reload()
  await expect(session(page, 'run')).toBeVisible()
  await expect(session(page, 'run')).toHaveAttribute('data-broken', 'false')
  await expect(session(page, 'run').getByRole('timer')).toHaveText(/^1[45]:/)
})

test('stop writes the minutes down and nothing else: no lantern', async ({ page }) => {
  await page.clock.install()
  await page.goto('')
  await addThing(page, 'run')
  await dismissInstallLeaf(page)
  await startLockIn(page, 'run', 20)
  await page.clock.fastForward('07:10')
  await session(page, 'run').getByRole('button', { name: 'stop' }).click()
  await expect(session(page, 'run')).toBeHidden()
  await expect(page.locator('.line')).toHaveText('stopped. 7 min noted.')
  await expect(card(page, 'run')).toHaveAttribute('aria-pressed', 'false')
  const data = await stored(page)
  expect(data.days[dateKey(0)]?.minutes[data.things[0]?.id ?? '']).toBe(7)
  expect(data.days[dateKey(0)]?.done).toEqual([])
  expect(await sessionsToday(page)).toBeUndefined()
  await expect(lanterns(page)).toHaveAttribute('data-count', '0')
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
  await addThing(page, 'run')
  await dismissInstallLeaf(page)
  await startLockIn(page, 'run', 10)
  await expect
    .poll(() => page.evaluate(() => (window as unknown as { __wake: number }).__wake))
    .toBeGreaterThan(0)
})

test('the dial opens on the last length chosen for that thing', async ({ page }) => {
  await page.goto('')
  await addThing(page, 'run')
  await addThing(page, 'read')
  await dismissInstallLeaf(page)
  await startLockIn(page, 'run', 40)
  await session(page, 'run').getByRole('button', { name: 'undo' }).click()
  await page.getByRole('button', { name: 'lock in: run' }).click()
  await expect(page.getByRole('slider', { name: 'minutes' })).toHaveAttribute('aria-valuenow', '40')
  await page.keyboard.press('Escape')
  await page.getByRole('button', { name: 'lock in: read' }).click()
  await expect(page.getByRole('slider', { name: 'minutes' })).toHaveAttribute('aria-valuenow', '30')
})
