import { expect, test, type Page } from '@playwright/test'
import { card, clearNotices, seed, stored } from './helpers'

/**
 * Days: optional planning that adds nothing to the first screen. A thing's
 * sheet has seven day chips, all on by default. The first screen shows
 * only today's things; the rest fold into "not today", from where one can
 * be added for today only. Consistency counts planned days only, and a day
 * with nothing planned is a rest day, never a missed one.
 *
 * Every test pins the clock to a known weekday: Saturday 10 October 2026.
 */
const SATURDAY = new Date(2026, 9, 10, 12, 0)
const WEEKDAYS = [true, true, true, true, true, false, false]
const MWF = [true, false, true, false, true, false, false]

/** A date relative to the pinned Saturday, as the app keys it. */
function on(offset: number): string {
  const d = new Date(SATURDAY)
  d.setDate(d.getDate() + offset)
  return `${String(d.getFullYear())}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

async function at(page: Page, date: Date): Promise<void> {
  await page.clock.setFixedTime(date)
}

test('a thing off at weekends is not on the first screen on a Saturday, but is under "not today"', async ({
  page,
}) => {
  await at(page, SATURDAY)
  await seed(page, {
    things: [
      { id: 'w', name: 'work out', world: 'sea', createdAt: on(-20), order: 0, days: WEEKDAYS },
      { id: 'r', name: 'read', world: 'sky', createdAt: on(-20), order: 1 },
    ],
    days: {},
    settings: { installDismissedAt: on(0), lastRecapWeek: on(-12) },
  })
  await page.goto('')
  await expect(card(page, 'read')).toBeVisible()
  await expect(card(page, 'work out')).toHaveCount(0)
  const toggle = page.getByRole('button', { name: /not today/ })
  await expect(toggle).toHaveAttribute('aria-expanded', 'false')
  await toggle.click()
  await expect(toggle).toHaveAttribute('aria-expanded', 'true')
  await expect(page.locator('.not-today-item')).toHaveCount(1)
  await expect(page.locator('.not-today-item')).toContainText('work out')
})

test('"also today" adds it for today only', async ({ page }) => {
  await at(page, SATURDAY)
  await seed(page, {
    things: [
      { id: 'w', name: 'work out', world: 'sea', createdAt: on(-20), order: 0, days: WEEKDAYS },
    ],
    days: {},
    settings: { installDismissedAt: on(0), lastRecapWeek: on(-12) },
  })
  await page.goto('')
  await page.getByRole('button', { name: /not today/ }).click()
  await page.getByRole('button', { name: 'also today: work out' }).click()
  await expect(card(page, 'work out')).toBeVisible()
  await card(page, 'work out').click()
  await expect(card(page, 'work out')).toHaveAttribute('aria-pressed', 'true')
  expect((await stored(page)).days[on(0)]).toMatchObject({ extra: ['w'], done: ['w'] })
  // Sunday is still off.
  await at(page, new Date(2026, 9, 11, 12, 0))
  await page.reload()
  await expect(card(page, 'work out')).toHaveCount(0)
})

test('"not today" takes a planned thing off today only', async ({ page }) => {
  await at(page, SATURDAY)
  await seed(page, {
    things: [
      { id: 'r', name: 'read', world: 'sky', createdAt: on(-20), order: 0 },
      { id: 's', name: 'stretch', world: 'garden', createdAt: on(-20), order: 1 },
    ],
    days: {},
    settings: { installDismissedAt: on(0), lastRecapWeek: on(-12) },
  })
  await page.goto('')
  await page.getByRole('button', { name: 'edit read' }).click()
  const sheet = page.getByRole('dialog', { name: /read/ })
  await sheet.getByRole('button', { name: 'not today' }).click()
  await page.keyboard.press('Escape')
  await expect(sheet).toBeHidden()
  await expect(card(page, 'read')).toHaveCount(0)
  await expect(page.locator('.not-today-toggle')).toBeVisible()
})

test('the days live in the sheet of the thing, seven chips, and changing them moves the thing', async ({
  page,
}) => {
  await at(page, SATURDAY)
  await seed(page, {
    things: [{ id: 'r', name: 'read', world: 'sky', createdAt: on(-20), order: 0 }],
    days: {},
    settings: { installDismissedAt: on(0), lastRecapWeek: on(-12) },
  })
  await page.goto('')
  await page.getByRole('button', { name: 'edit read' }).click()
  const sheet = page.getByRole('dialog', { name: /read/ })
  const chips = sheet.getByRole('group', { name: 'days' }).getByRole('button')
  await expect(chips).toHaveCount(7)
  for (const chip of await chips.all()) await expect(chip).toHaveAttribute('aria-pressed', 'true')
  await sheet.getByRole('button', { name: 'Saturday' }).click()
  await sheet.getByRole('button', { name: 'save' }).click()
  await expect(card(page, 'read')).toHaveCount(0)
  expect((await stored(page)).things[0]).toMatchObject({
    days: [true, true, true, true, true, false, true],
  })
})

test('a new thing comes with all seven days on', async ({ page }) => {
  await at(page, SATURDAY)
  await page.goto('')
  await page.getByRole('button', { name: 'Add a thing' }).click()
  const chips = page.getByRole('group', { name: 'days' }).getByRole('button')
  await expect(chips).toHaveCount(7)
  for (const chip of await chips.all()) await expect(chip).toHaveAttribute('aria-pressed', 'true')
})

test('three planned days a week, all done, grow into a whale', async ({ page }) => {
  await at(page, SATURDAY)
  // The last seven Mondays, Wednesdays and Fridays before this Saturday.
  const mwf = [-1, -3, -5, -8, -10, -12, -15]
  await seed(page, {
    things: [{ id: 'm', name: 'swim', world: 'sea', createdAt: on(-30), order: 0, days: MWF }],
    days: Object.fromEntries(mwf.map((o) => [on(o), { done: ['m'] }])),
    cracked: { m: 7 },
    settings: { installDismissedAt: on(0), lastRecapWeek: on(-12) },
  })
  await page.goto('')
  await page.getByRole('button', { name: /not today/ }).click()
  // Saturday is off, so the card is in the strip; the creature there is the whale.
  await expect(page.locator('.not-today-item .not-today-creature svg')).toBeAttached()
  await page.getByRole('button', { name: 'also today: swim' }).click()
  await expect(page.locator('.card[data-stage="3"]')).toBeVisible()
  // The week's dots: a dash for every day off, a full dot for every planned day done.
  const dots = await card(page, 'swim')
    .locator('.dot')
    .evaluateAll((els) =>
      els.map((e) =>
        e.classList.contains('is-on') ? 'done' : e.classList.contains('is-rest') ? 'rest' : 'open',
      ),
    )
  expect(dots).toEqual(['rest', 'done', 'rest', 'done', 'rest', 'done', 'open'])
})

test('a rest day does not break the streak', async ({ page }) => {
  const monday = new Date(2026, 9, 12, 12, 0)
  await at(page, monday)
  const done: Record<string, { done: string[] }> = {}
  // Last week Monday to Friday, then the weekend off, then today.
  for (const offset of [-5, -4, -3, -2, -1]) done[on(offset)] = { done: ['w'] }
  done[on(2)] = { done: ['w'] }
  await seed(page, {
    things: [{ id: 'w', name: 'work', world: 'sea', createdAt: on(-6), order: 0, days: WEEKDAYS }],
    days: done,
    cracked: { w: 3 },
    settings: { installDismissedAt: on(2), lastRecapWeek: on(-5) },
  })
  await page.goto('')
  await page.getByRole('button', { name: 'Menu' }).click()
  await expect(page.getByRole('dialog', { name: 'the club' })).toContainText('6 days in a row')
})

test('all done means everything planned today, not everything there is', async ({ page }) => {
  await at(page, SATURDAY)
  await seed(page, {
    things: [
      { id: 'w', name: 'work out', world: 'sea', createdAt: on(-20), order: 0, days: WEEKDAYS },
      { id: 'r', name: 'read', world: 'sky', createdAt: on(-20), order: 1 },
    ],
    days: {},
    settings: { installDismissedAt: on(0), lastRecapWeek: on(-12) },
  })
  await page.goto('')
  await clearNotices(page)
  await card(page, 'read').click()
  await expect(page.locator('.whale')).toBeVisible()
  await expect(page.locator('.line')).toHaveText('all of it. all the smoke.')
})

test('a day with nothing planned is a rest day: one line, no star, check-in still there', async ({
  page,
}) => {
  await at(page, SATURDAY)
  await seed(page, {
    things: [
      { id: 'w', name: 'work out', world: 'sea', createdAt: on(-20), order: 0, days: WEEKDAYS },
    ],
    days: { [on(-1)]: { done: ['w'] } },
    cracked: { w: 3 },
    settings: { installDismissedAt: on(0), lastRecapWeek: on(-12) },
  })
  await page.goto('')
  await expect(page.locator('.line')).toHaveText('nothing planned. rest is part of it.')
  await expect(page.locator('#app')).toHaveAttribute('data-rest', 'true')
  await expect(page.locator('.scene')).toHaveAttribute('data-quiet', 'false')
  await expect(page.getByRole('complementary', { name: 'check-in' })).toBeVisible()
  await expect(page.locator(`.day-star[data-date="${on(0)}"]`)).toHaveCount(0)
})

test('data from before days plans every thing on every day', async ({ page }) => {
  await at(page, SATURDAY)
  await page.addInitScript(
    ([key, json]) => {
      if (localStorage.getItem(key) === null) localStorage.setItem(key, json)
    },
    [
      'whaleclub:data',
      JSON.stringify({
        version: 2,
        things: [
          {
            id: 'r',
            name: 'read',
            emoji: '•',
            mode: 'tap',
            world: 'sky',
            createdAt: on(-5),
            order: 0,
          },
        ],
        days: {},
        cracked: {},
        settings: { sound: true, installDismissedAt: on(0) },
      }),
    ] as const,
  )
  await page.goto('')
  await expect(card(page, 'read')).toBeVisible()
  await card(page, 'read').click()
  const data = await stored(page)
  expect(data.things[0]).toMatchObject({ days: [true, true, true, true, true, true, true] })
  expect((data as unknown as { version: number }).version).toBe(5)
})
