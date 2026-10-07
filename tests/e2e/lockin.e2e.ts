import { expect, test, type Page } from '@playwright/test'
import { addThing, card, dateKey, dismissInstallLeaf, setHidden, stored } from './helpers'

/**
 * Lock in, Forest with a twist: nothing dies. A session is measured from
 * timestamps; leaving for more than fifteen seconds does not fail it, the
 * creature waits and the session goes on, but its end counts the showing
 * up without the star or the step towards a stone. The clock is
 * Playwright's, so ten minutes take a moment.
 */
async function startLockIn(page: Page, name: string, minutes: number): Promise<void> {
  await page.getByRole('button', { name: `lock in: ${name}` }).click()
  const slider = page.getByRole('slider', { name: 'minutes' })
  await slider.focus()
  await page.keyboard.press('Home')
  for (let m = 10; m < minutes; m += 5) await page.keyboard.press('ArrowRight')
  await expect(slider).toHaveAttribute('aria-valuenow', String(minutes))
  await page.getByRole('button', { name: 'lock in', exact: true }).click()
}

const session = (page: Page, name: string) => page.getByRole('dialog', { name: `lock in: ${name}` })

test('a session counts from its timestamp, and a clean end is a full day', async ({ page }) => {
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
  await page.clock.fastForward('05:02')
  await expect(screen).toHaveAttribute('data-state', 'ended')
  await expect(screen).toHaveAttribute('data-clean', 'true')
  await expect(screen).toContainText('time. that counts.')
  await expect(screen.getByRole('button', { name: 'send the whale' })).toBeVisible()
  await screen.getByRole('button', { name: 'back to the sea' }).click()
  await expect(card(page, 'run')).toHaveAttribute('aria-pressed', 'true')
  const data = await stored(page)
  const today = data.days[dateKey(0)]
  expect(today?.minutes[data.things[0]?.id ?? '']).toBe(10)
  expect(today?.waited).toBeUndefined()
  await expect(page.getByRole('group', { name: 'your days' }).getByRole('button')).toHaveCount(1)
})

test('leaving for more than 15 seconds: it waits, and the end counts but stays small', async ({
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
  await expect(screen).toHaveAttribute('data-clean', 'false')
  await expect(screen).toContainText('it counts. it stayed small this time.')
  await screen.getByRole('button', { name: 'back to the sea' }).click()
  await expect(card(page, 'run')).toHaveAttribute('aria-pressed', 'true')
  const data = await stored(page)
  expect(data.days[dateKey(0)]?.waited).toEqual([data.things[0]?.id])
  // No star for it, and no step towards a stone.
  await expect(page.getByRole('group', { name: 'your days' }).getByRole('button')).toHaveCount(0)
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

test('stop writes the minutes down and nothing else', async ({ page }) => {
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
  await session(page, 'run').getByRole('button', { name: 'stop' }).click()
  await page.getByRole('button', { name: 'lock in: run' }).click()
  await expect(page.getByRole('slider', { name: 'minutes' })).toHaveAttribute('aria-valuenow', '40')
  await page.keyboard.press('Escape')
  await page.getByRole('button', { name: 'lock in: read' }).click()
  await expect(page.getByRole('slider', { name: 'minutes' })).toHaveAttribute('aria-valuenow', '25')
})
