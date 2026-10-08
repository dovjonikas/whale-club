import { test as pure, type Locator, type Page } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { makeBackup, readBackup } from '../../src/app/backup'
import { setDayEndsAt, setWeekStartsOn, todayKey, weekStart } from '../../src/store/dates'
import { emptyData, EVERY_DAY, DATA_VERSION, type AppData } from '../../src/store/types'
import { card, dateKey, expect, seed, stored, STORAGE_KEY, test } from './helpers'

/**
 * Settings and trust: every choice takes effect at once, the sea can be
 * backed up and restored to the same data, a damaged or a newer file is
 * refused with a clear word, starting over can be undone, and a day can
 * end at 3:00 for someone up late.
 */

function sea(): AppData {
  const data = emptyData()
  data.things = [
    {
      id: 'run',
      name: 'run',
      icon: 'letter',
      kind: 'tap',
      minutes: 15,
      days: [...EVERY_DAY],
      world: 'sea',
      line: 'a',
      createdAt: '2026-02-01',
      order: 0,
    },
  ]
  data.days['2026-02-02'] = { done: ['run'], minutes: {}, good: 'a calm sea' }
  data.bought = [{ item: 'buoy', date: '2026-02-02', price: 150 }]
  return data
}

pure.describe('worked out', () => {
  pure.skip(({ isMobile }) => isMobile, 'pure data')

  pure('a backup reads back as the same sea', async () => {
    const data = sea()
    const { text, name } = await makeBackup(data, '2026-03-01')
    expect(name).toBe('whale-club-2026-03-01.json')
    const read = await readBackup(text)
    expect(read.ok).toBe(true)
    if (read.ok) {
      expect(read.data).toEqual(data)
      expect(read.summary).toEqual({
        first: '2026-02-02',
        last: '2026-02-02',
        things: ['run'],
        days: 1,
      })
    }
  })

  pure('a damaged file, a newer one, or another app’s is refused, and says which', async () => {
    const { text } = await makeBackup(sea(), '2026-03-01')
    const edited = text.replace('a calm sea', 'a calm sea!')
    expect(await readBackup(edited)).toEqual({ ok: false, reason: 'damaged' })
    expect(await readBackup(text.slice(0, text.length / 2))).toEqual({
      ok: false,
      reason: 'damaged',
    })
    const newer = JSON.stringify({ ...JSON.parse(text), version: DATA_VERSION + 1 })
    expect(await readBackup(newer)).toEqual({ ok: false, reason: 'newer' })
    expect(await readBackup('{"hello":"world"}')).toEqual({ ok: false, reason: 'not-ours' })
  })

  pure('a day that ends at 3:00 keeps 01:30 in the evening before', () => {
    setDayEndsAt(3)
    expect(todayKey(new Date(2026, 2, 5, 1, 30))).toBe('2026-03-04')
    expect(todayKey(new Date(2026, 2, 5, 3, 30))).toBe('2026-03-05')
    setDayEndsAt(0)
    expect(todayKey(new Date(2026, 2, 5, 1, 30))).toBe('2026-03-05')
  })

  pure('a week can start on Sunday', () => {
    // Thursday 5 March 2026.
    expect(weekStart('2026-03-05')).toBe('2026-03-02')
    setWeekStartsOn(0)
    expect(weekStart('2026-03-05')).toBe('2026-03-01')
    setWeekStartsOn(1)
  })
})

const run = {
  id: 'run',
  name: 'run',
  world: 'sea' as const,
  createdAt: dateKey(-10),
  order: 0,
  kind: 'tap' as const,
}

async function openSettings(page: Page): Promise<Locator> {
  await page.getByRole('button', { name: 'Menu' }).click()
  await page.getByRole('button', { name: 'settings', exact: true }).click()
  const sheet = page.getByRole('dialog', { name: 'settings' })
  await expect(sheet).toBeVisible()
  return sheet
}

test('a choice takes effect at once: no save', async ({ page }) => {
  await seed(page, { things: [run], days: {}, settings: { installDismissedAt: dateKey(-1) } })
  await page.goto('')
  const sheet = await openSettings(page)
  await sheet
    .getByRole('group', { name: 'a still sea' })
    .getByRole('button', { name: 'on' })
    .click()
  await expect(page.locator('.scene')).toHaveAttribute('data-still', 'true')
  await sheet.getByRole('group', { name: 'sounds' }).getByRole('button', { name: 'off' }).click()
  expect((await stored(page)).settings).toMatchObject({ stillSea: true, sound: false })
})

test('back up, start over, restore: the same sea, and start over can be undone', async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'canShare', { value: () => false, configurable: true })
  })
  await seed(page, {
    things: [run],
    days: { [dateKey(-2)]: { done: ['run'] }, [dateKey(-1)]: { done: ['run'] } },
    settings: { installDismissedAt: dateKey(-1) },
  })
  await page.goto('')
  let sheet = await openSettings(page)
  const download = page.waitForEvent('download')
  await sheet.getByRole('button', { name: 'back up' }).click()
  const file = await (await download).path()
  // Start over, then undo: everything comes back.
  await sheet.getByRole('button', { name: 'start over' }).click()
  await page
    .getByRole('dialog', { name: 'this clears your sea on this phone' })
    .getByRole('button', { name: 'start over' })
    .click()
  await expect(page.locator('.card')).toHaveCount(0)
  await page.getByRole('button', { name: 'undo' }).click()
  await expect(card(page, 'run')).toBeVisible()
  // Start over for good, then restore the file.
  sheet = await openSettings(page)
  await sheet.getByRole('button', { name: 'start over' }).click()
  await page
    .getByRole('dialog', { name: 'this clears your sea on this phone' })
    .getByRole('button', { name: 'start over' })
    .click()
  sheet = await openSettings(page)
  await sheet.locator('.setting-file').setInputFiles(file)
  const ask = page.getByRole('dialog', { name: 'replace your sea with this?' })
  await expect(ask).toContainText('1 thing, 2 days with something done')
  await ask.getByRole('button', { name: 'replace' }).click()
  await expect(card(page, 'run')).toBeVisible()
  const after = JSON.parse(
    (await page.evaluate((key) => localStorage.getItem(key), STORAGE_KEY)) ?? '{}',
  ) as AppData
  // The sea as it was backed up: the file's own data.
  const original = (JSON.parse(readFileSync(file, 'utf8')) as { data: AppData }).data
  expect(after.things).toEqual(original.things)
  expect(after.days).toEqual(original.days)
})

test('a reload during the undo loses nothing: the undo is offered again', async ({ page }) => {
  await seed(page, {
    things: [run],
    days: { [dateKey(-1)]: { done: ['run'] } },
    settings: { installDismissedAt: dateKey(-1) },
  })
  await page.goto('')
  const sheet = await openSettings(page)
  await sheet.getByRole('button', { name: 'start over' }).click()
  await page
    .getByRole('dialog', { name: 'this clears your sea on this phone' })
    .getByRole('button', { name: 'start over' })
    .click()
  await expect(page.locator('.card')).toHaveCount(0)
  await page.reload()
  await expect(page.locator('.card')).toHaveCount(0)
  await page.getByRole('button', { name: 'undo' }).click()
  await expect(card(page, 'run')).toBeVisible()
  expect(await page.evaluate(() => localStorage.getItem('whaleclub:undo'))).toBeNull()
})

test('a damaged file is refused with a clear word, and nothing changes', async ({ page }) => {
  await seed(page, { things: [run], days: {}, settings: { installDismissedAt: dateKey(-1) } })
  await page.goto('')
  const sheet = await openSettings(page)
  await sheet.locator('.setting-file').setInputFiles({
    name: 'whale-club.json',
    mimeType: 'application/json',
    buffer: Buffer.from('{"app":"whale-club","format":1,"version":8,"checksum":"0","data":{}}'),
  })
  await expect(sheet.locator('.setting-last')).toHaveText('this file is damaged. nothing changed.')
  await expect(card(page, 'run')).toBeVisible()
})

test('a day that ends at 3:00: a done at 01:30 belongs to the evening before', async ({ page }) => {
  const late = new Date(2026, 2, 5, 1, 30)
  await page.clock.setFixedTime(late)
  await seed(page, {
    things: [{ ...run, createdAt: '2026-02-20' }],
    days: { '2026-03-04': { done: [], checkin: true } },
    settings: { installDismissedAt: '2026-03-04', lastRecapWeek: '2026-02-23', dayEndsAt: 3 },
  })
  await page.goto('')
  await card(page, 'run').click()
  const days = (await stored(page)).days
  expect(days['2026-03-04']?.done).toContain('run')
  expect(days['2026-03-05']).toBeUndefined()
})

test('a backup due: a quiet dot on the menu, one line inside, no popup', async ({ page }) => {
  await seed(page, {
    things: [{ ...run, createdAt: dateKey(-60) }],
    days: { [dateKey(-1)]: { done: ['run'] } },
    settings: { installDismissedAt: dateKey(-1), lastBackupAt: dateKey(-40) },
  })
  await page.goto('')
  const menu = page.getByRole('button', { name: 'Menu' })
  await expect(menu).toHaveAttribute('data-due', 'true')
  await menu.click()
  await expect(page.getByText('time for a backup')).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(menu).toHaveAttribute('data-due', 'false')
})
