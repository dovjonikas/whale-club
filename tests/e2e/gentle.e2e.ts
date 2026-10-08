import { test as pure } from '@playwright/test'
import { addDays, isLastDayOfWeek, weekStart } from '../../src/store/dates'
import { asleep, missedYesterday, streak, weekDots } from '../../src/store/derive'
import { KRILL, krillOn } from '../../src/store/krill'
import { isQuiet, quietAllowance } from '../../src/store/quiet'
import { emptyData, EVERY_DAY, type AppData, type Thing } from '../../src/store/types'
import { chapterDue } from '../../src/app/chapter'
import { card, dateKey, expect, seed, setHidden, stored, test } from './helpers'

/**
 * The gentle mechanics: quiet days, welcome back, creatures that sleep
 * rather than sulk, a new chapter after a quiet week, "after...", the
 * evening's one good thing, and the badge that never asks for anything.
 */

const MONDAY = '2026-03-02'

function person(days: readonly boolean[] = EVERY_DAY): { data: AppData; thing: Thing } {
  const data = emptyData()
  const thing: Thing = {
    id: 'run',
    name: 'run',
    icon: 'letter',
    kind: 'tap',
    minutes: 15,
    days: [...days],
    world: 'sea',
    line: 'a',
    createdAt: addDays(MONDAY, -14),
    order: 0,
  }
  data.things = [thing]
  return { data, thing }
}

const done = (data: AppData, ...dates: string[]): void => {
  for (const date of dates) data.days[date] = { done: ['run'], minutes: {} }
}

pure.describe('worked out', () => {
  pure.skip(({ isMobile }) => isMobile, 'pure data')

  pure(
    'a quiet day a week, two from five planned days; the week spends them on its first misses',
    () => {
      expect(quietAllowance(person([true, false, true, false, true, false, false]).thing)).toBe(1)
      expect(quietAllowance(person().thing)).toBe(2)
      const { data, thing } = person()
      // Monday and Tuesday missed, Wednesday missed too, Thursday done; today is Friday.
      done(data, addDays(MONDAY, 3))
      const friday = addDays(MONDAY, 4)
      expect(isQuiet(data, thing, MONDAY, friday)).toBe(true)
      expect(isQuiet(data, thing, addDays(MONDAY, 1), friday)).toBe(true)
      expect(isQuiet(data, thing, addDays(MONDAY, 2), friday)).toBe(false)
      // The week's dots: two moons, an empty dot, a done, and today still open.
      expect(weekDots(data, 'run', friday).slice(2)).toEqual([
        'quiet',
        'quiet',
        'open',
        'done',
        'open',
      ])
    },
  )

  pure('a quiet day breaks no streak and does not dim the sea', () => {
    const { data } = person()
    done(data, addDays(MONDAY, 0), addDays(MONDAY, 2))
    const wednesday = addDays(MONDAY, 2)
    // Tuesday was missed, inside the week's freedom: the run goes on.
    expect(streak(data, wednesday)).toBe(2)
    expect(missedYesterday(data, wednesday)).toBe(false)
  })

  pure('welcome back: the first done after two missed planned days is a small gift', () => {
    const { data } = person()
    done(data, MONDAY)
    done(data, addDays(MONDAY, 3))
    expect(krillOn(data, addDays(MONDAY, 3)).welcome).toBe(KRILL.welcome)
    // One missed day is no break; and the very first day is no return.
    done(data, addDays(MONDAY, 5))
    expect(krillOn(data, addDays(MONDAY, 5)).welcome).toBe(0)
    expect(krillOn(data, MONDAY).welcome).toBe(0)
  })

  pure('a creature sleeps after two missed planned days, and wakes when done', () => {
    const { data, thing } = person()
    done(data, MONDAY)
    expect(asleep(data, thing, addDays(MONDAY, 2))).toBe(false)
    expect(asleep(data, thing, addDays(MONDAY, 3))).toBe(true)
    done(data, addDays(MONDAY, 3))
    expect(asleep(data, thing, addDays(MONDAY, 3))).toBe(false)
  })

  pure('a new chapter is offered on a Monday or a first, after a quiet week, once', () => {
    const { data } = person()
    done(data, addDays(MONDAY, -7))
    expect(chapterDue(data, MONDAY)).toBe(true)
    expect(chapterDue(data, addDays(MONDAY, 1))).toBe(false)
    data.settings.chapterOffered = MONDAY
    expect(chapterDue(data, MONDAY)).toBe(false)
    // A week with two stars is not a quiet one.
    const busy = person().data
    done(busy, addDays(MONDAY, -2), addDays(MONDAY, -4))
    expect(chapterDue(busy, MONDAY)).toBe(false)
  })
})

const run = {
  id: 'run',
  name: 'run',
  world: 'sea' as const,
  createdAt: dateKey(-20),
  order: 0,
  kind: 'tap' as const,
}
const read = {
  id: 'read',
  name: 'read',
  world: 'sky' as const,
  createdAt: dateKey(-20),
  order: 1,
  kind: 'tap' as const,
}

test('a sleeping creature wakes and waves when its thing is done', async ({ page }) => {
  await seed(page, {
    things: [run],
    days: { [dateKey(-5)]: { done: ['run'] } },
    settings: { installDismissedAt: dateKey(-1) },
  })
  await page.goto('')
  const runCard = page.locator('.card[data-id="run"]')
  await expect(runCard).toHaveAttribute('data-asleep', 'true')
  await card(page, 'run').click()
  await expect(runCard).toHaveAttribute('data-asleep', 'false')
})

test('"after coffee": chosen in its sheet, shown on its card, and the row follows the day', async ({
  page,
}) => {
  await seed(page, { things: [run, read], days: {}, settings: { installDismissedAt: dateKey(-1) } })
  await page.goto('')
  await page.getByRole('button', { name: 'edit read' }).click()
  const sheet = page.getByRole('dialog', { name: 'read' })
  await sheet.getByRole('button', { name: 'waking up' }).click()
  await sheet.getByRole('button', { name: 'save' }).click()
  await expect(page.locator('.card[data-id="read"] .card-after')).toHaveText('after waking up')
  // Waking comes before the rest of the day: read is first now.
  await expect(page.locator('.card').first()).toHaveAttribute('data-id', 'read')
  expect((await stored(page)).things.find((t) => t.id === 'read')).toMatchObject({
    after: 'waking',
  })
})

test('the evening check-in asks for one good thing, and the log keeps it', async ({ page }) => {
  const evening = new Date()
  evening.setHours(20, 30, 0, 0)
  await page.clock.setFixedTime(evening)
  // Last week's recap already seen, so the check-in is the notice in sight.
  const today0 = dateKey(0)
  const recapWeek = isLastDayOfWeek(today0) ? weekStart(today0) : addDays(weekStart(today0), -7)
  await seed(page, {
    things: [run, read],
    days: {},
    settings: { installDismissedAt: dateKey(-1), lastRecapWeek: recapWeek },
  })
  await page.goto('')
  await page.getByRole('button', { name: 'good!!!' }).click()
  await page.getByRole('button', { name: 'happy!!!' }).click()
  await expect(page.getByText('tomorrow: run, read')).toBeVisible()
  await page.getByRole('textbox', { name: 'one good thing today' }).fill('the sea was calm')
  await page.getByRole('button', { name: 'keep' }).click()
  const today = dateKey(0)
  expect((await stored(page)).days[today]).toMatchObject({
    good: 'the sea was calm',
    checkin: true,
  })
  await page.getByRole('button', { name: 'Menu' }).click()
  await page.getByRole('button', { name: 'the log' }).click()
  await page.locator(`.log-cell[data-date="${today}"]`).click()
  await expect(page.getByText('the sea was calm')).toBeVisible()
})

test('a new chapter starts the week’s dots fresh', async ({ page }) => {
  // A Monday, after a week with one star.
  const monday = new Date(2026, 2, 2, 12, 0)
  await page.clock.setFixedTime(monday)
  await seed(page, {
    things: [{ ...run, createdAt: '2026-02-10' }],
    days: { '2026-02-25': { done: ['run'] }, '2026-03-02': { done: [], checkin: true } },
    settings: { installDismissedAt: '2026-03-01', lastRecapWeek: '2026-02-23' },
  })
  await page.goto('')
  await page.getByRole('button', { name: 'new chapter' }).click()
  expect((await stored(page)).settings).toMatchObject({ chapterFrom: '2026-03-02' })
  // The six days before today have no dot; today's is there.
  await expect(page.locator('.card[data-id="run"] .dot.is-none')).toHaveCount(6)
})

test('the badge counts what is left, as the app goes to the background, and never on an iPhone', async ({
  page,
}, info) => {
  await page.addInitScript(() => {
    const calls: (number | string)[] = []
    Object.assign(window, { __badge: calls })
    Object.assign(navigator, {
      setAppBadge: (n: number) => {
        calls.push(n)
        return Promise.resolve()
      },
      clearAppBadge: () => {
        calls.push('clear')
        return Promise.resolve()
      },
    })
  })
  await seed(page, { things: [run, read], days: {}, settings: { installDismissedAt: dateKey(-1) } })
  await page.goto('')
  await card(page, 'run').click()
  await setHidden(page, true)
  const calls = await page.evaluate(
    () => (window as unknown as { __badge: (number | string)[] }).__badge,
  )
  if (info.project.name === 'iphone') expect(calls).toEqual([])
  else expect(calls).toEqual([1])
})
