import type { Page } from '@playwright/test'
import { expect, middayToday, seedPerson, test } from './helpers'

/**
 * What the 1.3 professional pass checked by eye (docs/QUALITY.md), kept by
 * a test: every control is a finger's size, and nothing goes past the
 * screen's edge. Each surface is checked at the device's own size and on
 * the smallest phone still in use, 320 × 568.
 */

/**
 * Controls a finger can miss: four points 21 px from the centre, each way,
 * must all land on the control (or the target drawn around it). Only what
 * is wholly in sight is measured; a sheet's rows below its fold are checked
 * after a scroll.
 */
async function smallTargets(page: Page, scope: string, except: string[] = []): Promise<string[]> {
  return page.evaluate(
    ([within, skip]) => {
      const missed: string[] = []
      for (const root of document.querySelectorAll(within)) {
        const box = root.getBoundingClientRect()
        const top = Math.max(0, box.top)
        const bottom = Math.min(innerHeight, box.bottom)
        for (const el of root.querySelectorAll<HTMLElement>('button, input, [role="slider"]')) {
          if (skip.some((selector) => el.matches(selector))) continue
          if (el.closest('[hidden], [inert]')) continue
          const r = el.getBoundingClientRect()
          if (r.width === 0 || r.height === 0 || r.top < top || r.bottom > bottom) continue
          const x = r.left + r.width / 2
          const y = r.top + r.height / 2
          const points = [
            [x - 21, y],
            [x + 21, y],
            [x, y - 21],
            [x, y + 21],
          ] as const
          const miss = points.some(([px, py]) => {
            const at = document.elementFromPoint(px, py)
            return !at || !(at === el || el.contains(at))
          })
          if (miss) {
            const name = el.getAttribute('aria-label') ?? el.textContent
            missed.push(`${el.className} "${name.trim().slice(0, 30)}"`)
          }
        }
      }
      return missed
    },
    [scope, except] as const,
  )
}

/** Anything wider than the screen, or a sheet that would scroll sideways. */
async function pastTheEdge(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const past: string[] = []
    const width = innerWidth
    if (document.documentElement.scrollWidth > width + 1) past.push('the page')
    for (const sheet of document.querySelectorAll('.sheet.is-open'))
      if (sheet.scrollWidth > sheet.clientWidth + 1) past.push(`the sheet ${sheet.scrollWidth}px`)
    for (const el of document.querySelectorAll(
      '.header *, .notice-slot *, .row-tools *, .sheet.is-open *',
    )) {
      const r = el.getBoundingClientRect()
      if (r.width > 0 && (r.right > width + 1 || r.left < -1))
        past.push(el.getAttribute('class') ?? el.tagName)
    }
    return past
  })
}

/** Seven in a row: at 320 px the day chips and the log's days are 38 px wide (docs/QUALITY.md). */
const NARROW_KNOWN = ['.day-chip', '.log-cell']

async function check(page: Page, scope: string): Promise<void> {
  const narrow = page.viewportSize()?.width ?? 0
  expect(await pastTheEdge(page)).toEqual([])
  expect(await smallTargets(page, scope, narrow < 360 ? NARROW_KNOWN : [])).toEqual([])
}

async function scrollSheet(page: Page): Promise<void> {
  await page.locator('.sheet.is-open').evaluate((sheet) => {
    sheet.scrollTo(0, sheet.scrollHeight)
  })
}

for (const size of ['device', 'small'] as const) {
  test.describe(size === 'device' ? 'at the device size' : 'at 320 × 568', () => {
    if (size === 'small') test.use({ viewport: { width: 320, height: 568 } })

    test.beforeEach(async ({ page }) => {
      await page.clock.setFixedTime(middayToday())
      await seedPerson(page)
      await page.goto('')
      // The week's recap may come first; it is not what these look at.
      const recap = page.getByRole('complementary', { name: 'weekly recap' })
      if (await recap.isVisible()) await recap.getByRole('button', { name: 'ok' }).click()
    })

    test('the first screen and the check-in card', async ({ page }) => {
      const checkin = page.getByRole('complementary', { name: 'check-in' })
      await expect(checkin).toBeVisible()
      await check(page, '.header, .notice-slot, .row-tools')
      await checkin.getByRole('button', { name: 'good!!!' }).click()
      await checkin.getByRole('button', { name: 'happy!!!' }).click()
      await expect(checkin.getByRole('button', { name: 'ok' })).toBeVisible()
      // The card changes inside a view transition (src/app/swap.ts): measured once it has landed.
      await page.waitForFunction(() => !document.querySelector('.leaf[style*="view-transition"]'))
      await check(page, '.notice-slot')
    })

    test('the club, settings and the log', async ({ page }) => {
      await page.getByRole('button', { name: 'Menu' }).click()
      await expect(page.getByRole('dialog', { name: 'the club' })).toBeVisible()
      await check(page, '.sheet.is-open')
      await page.getByRole('button', { name: 'settings', exact: true }).click()
      await expect(page.getByRole('dialog', { name: 'settings' })).toBeVisible()
      await check(page, '.sheet.is-open')
      await scrollSheet(page)
      await check(page, '.sheet.is-open')
      await page.keyboard.press('Escape')
      await page.getByRole('button', { name: 'Menu' }).click()
      await page.getByRole('button', { name: 'the log', exact: true }).click()
      await expect(page.getByRole('dialog', { name: 'the log' })).toBeVisible()
      await check(page, '.sheet.is-open')
    })

    test('the collection and a thing’s sheet', async ({ page }) => {
      await page.getByRole('button', { name: 'Museum' }).click()
      await expect(page.getByRole('dialog', { name: 'the museum' })).toBeVisible()
      await check(page, '.sheet.is-open')
      await page.keyboard.press('Escape')
      await page.getByRole('button', { name: 'edit run' }).click()
      await expect(page.getByRole('dialog', { name: 'run' })).toBeVisible()
      await check(page, '.sheet.is-open')
      await scrollSheet(page)
      await check(page, '.sheet.is-open')
    })
  })
}
