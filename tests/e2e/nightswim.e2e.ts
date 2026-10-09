import type { Page } from '@playwright/test'
import { swimDue, swimOn } from '../../src/app/nightSwim'
import type { AppData } from '../../src/store/types'
import { voice } from '../../src/voice'
import { dateKey, expect, seed, test } from './helpers'

/**
 * The whale's night swim: on the first open of a day, after the
 * check-in, the whale is back from somewhere real, with one true line.
 * Once a day, never on the first day, never in the evening.
 */
test.describe('when it is told', () => {
  test.skip(({ isMobile }) => isMobile, 'pure data')

  const data = (createdAt: string, swimOnDay?: string): AppData =>
    ({
      version: 8,
      things: [{ id: 'run', name: 'run', createdAt }],
      days: {},
      cracked: {},
      settings: swimOnDay ? { swimOn: swimOnDay } : {},
    }) as unknown as AppData

  test('from five in the morning until the evening, from the second day, once', () => {
    expect(swimDue(data('2026-10-01'), '2026-10-09', 9)).toBe(true)
    expect(swimDue(data('2026-10-01'), '2026-10-09', 4)).toBe(false)
    expect(swimDue(data('2026-10-01'), '2026-10-09', 18)).toBe(false)
    expect(swimDue(data('2026-10-09'), '2026-10-09', 9)).toBe(false)
    expect(swimDue(data('2026-10-01', '2026-10-09'), '2026-10-09', 9)).toBe(false)
  })

  test('the same place all day, a real place with its line', () => {
    const one = swimOn('2026-10-09')
    expect(swimOn('2026-10-09')).toEqual(one)
    expect(
      voice.swim.places.some(([place, fact]) => place === one.place && fact === one.fact),
    ).toBe(true)
  })
})

async function morning(page: Page, hour: number, createdDaysAgo = 5): Promise<void> {
  const at = new Date()
  at.setHours(hour, 0, 0, 0)
  await page.clock.setFixedTime(at)
  await seed(page, {
    things: [
      {
        id: 'run',
        name: 'run',
        world: 'sea',
        createdAt: dateKey(-createdDaysAgo, at),
        order: 0,
        kind: 'tap',
      },
    ],
    days: {
      [dateKey(-1, at)]: { done: ['run'] },
      [dateKey(0, at)]: { done: [], checkin: true },
    },
    settings: {
      installDismissedAt: dateKey(-1, at),
      lastRecapWeek: dateKey(0, at),
      goodAskedOn: dateKey(0, at),
      swimOn: null,
    },
  })
}

test('in the morning the whale is back, says where from, and is told once', async ({ page }) => {
  await morning(page, 9)
  await page.goto('')
  // The week's recap may come first: it has the slot before the swim.
  const recap = page.getByRole('complementary', { name: 'weekly recap' })
  if (await recap.isVisible()) await recap.getByRole('button', { name: 'ok' }).click()
  const card = page.getByRole('complementary', { name: 'the whale is back' })
  await expect(card).toBeVisible()
  await expect(card.getByText(/^back from .+\.$/)).toBeVisible()
  await card.getByRole('button', { name: 'ok' }).click()
  await expect(card).toBeHidden()
  await page.reload()
  await expect(page.getByRole('complementary', { name: 'the whale is back' })).toHaveCount(0)
})

test('not in the evening', async ({ page }) => {
  await morning(page, 20)
  await page.goto('')
  await expect(page.locator('.header')).toBeVisible()
  await expect(page.getByRole('complementary', { name: 'the whale is back' })).toHaveCount(0)
})

test('on the very first day there is no swim to tell', async ({ page }) => {
  await morning(page, 9, 0)
  await page.goto('')
  await expect(page.locator('.header')).toBeVisible()
  await expect(page.getByRole('complementary', { name: 'the whale is back' })).toHaveCount(0)
})
