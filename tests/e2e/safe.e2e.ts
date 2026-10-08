import { test as pure, type Page } from '@playwright/test'
import { bottleFor, whenWritten } from '../../src/app/bottles'
import { isLate } from '../../src/app/lateNight'
import { smallestThing } from '../../src/app/notToday'
import { addDays } from '../../src/store/dates'
import { isQuiet } from '../../src/store/quiet'
import { emptyData, EVERY_DAY, type AppData, type Thing } from '../../src/store/types'
import { voice } from '../../src/voice'
import { dateKey, expect, middayToday, seed, stored, test, type SeedData } from './helpers'

/**
 * A safe place: "not today" and its soft day, "it's been heavy" once, the
 * bottles that bring back an old good thing, the creatures to pet, late
 * night and its good night, a creature's name, and the evening's one good
 * thing asked on its own.
 */

const TODAY = '2026-10-20'

function thing(id: string, order: number, extra: Partial<Thing> = {}): Thing {
  return {
    id,
    name: id,
    icon: 'letter',
    kind: 'tap',
    minutes: 15,
    days: [...EVERY_DAY],
    world: 'sea',
    line: 'a',
    createdAt: '2026-08-01',
    order,
    ...extra,
  }
}

function sea(goods: number, extra: (data: AppData) => void = () => undefined): AppData {
  const data = emptyData()
  data.things = [thing('run', 0)]
  for (let i = 1; i <= 60; i++) data.days[addDays(TODAY, -i)] = { done: ['run'], minutes: {} }
  for (let i = 0; i < goods; i++) {
    const day = data.days[addDays(TODAY, -10 - i * 3)]
    if (day) day.good = `good ${String(i)}`
  }
  extra(data)
  return data
}

pure.describe('worked out', () => {
  pure.skip(({ isMobile }) => isMobile, 'pure data')

  pure(
    'a "not today" day keeps the smallest thing: a tap before a lock-in, a short one first',
    () => {
      const data = emptyData()
      data.things = [
        thing('study', 0, { kind: 'lockIn', minutes: 60 }),
        thing('stretch', 1, { kind: 'lockIn', minutes: 10 }),
        thing('water', 2),
      ]
      expect(smallestThing(data, TODAY)?.id).toBe('water')
      data.days[TODAY] = { done: ['water'], minutes: {} }
      expect(smallestThing(data, TODAY)?.id).toBe('stretch')
    },
  )

  pure('a miss on a "not today" day is quiet, and spends none of the week’s freedom', () => {
    const data = emptyData()
    const run = thing('run', 0)
    data.things = [run]
    // Three soft days in one week, nothing done: each one a moon.
    for (const date of ['2026-10-12', '2026-10-13', '2026-10-14'])
      data.days[date] = { done: [], minutes: {}, notToday: true }
    for (const date of ['2026-10-12', '2026-10-13', '2026-10-14'])
      expect(isQuiet(data, run, date, TODAY)).toBe(true)
    // The week's own two quiet days are still there after them.
    expect(isQuiet(data, run, '2026-10-15', TODAY)).toBe(true)
    expect(isQuiet(data, run, '2026-10-16', TODAY)).toBe(true)
    expect(isQuiet(data, run, '2026-10-17', TODAY)).toBe(false)
  })

  pure('no written lines, no bottle', () => {
    expect(
      bottleFor(
        sea(0, (d) => (d.days[TODAY] = { done: [], minutes: {}, notToday: true })),
        TODAY,
      ),
    ).toBeNull()
  })

  pure('a "not today" day brings a bottle with an old line; once a day', () => {
    const soft = (d: AppData): void => {
      d.days[TODAY] = { done: [], minutes: {}, notToday: true }
    }
    const bottle = bottleFor(sea(2, soft), TODAY)
    expect(bottle?.text).toMatch(/^good \d$/)
    const opened = sea(2, (d) => {
      soft(d)
      d.settings.bottleOn = TODAY
    })
    expect(bottleFor(opened, TODAY)).toBeNull()
  })

  pure('the same line does not come back within a month', () => {
    const soft = (d: AppData): void => {
      d.days[TODAY] = { done: [], minutes: {}, notToday: true }
    }
    const one = sea(1, soft)
    const writtenOn = addDays(TODAY, -10)
    one.settings.bottles = { [writtenOn]: addDays(TODAY, -20) }
    expect(bottleFor(one, TODAY)).toBeNull()
    one.settings.bottles = { [writtenOn]: addDays(TODAY, -31) }
    expect(bottleFor(one, TODAY)?.writtenOn).toBe(writtenOn)
  })

  pure('with five lines or more, a bottle once a week without a soft day', () => {
    expect(bottleFor(sea(4), TODAY)).toBeNull()
    expect(bottleFor(sea(5), TODAY)).not.toBeNull()
    expect(
      bottleFor(
        sea(5, (d) => (d.settings.bottleOn = addDays(TODAY, -3))),
        TODAY,
      ),
    ).toBeNull()
    expect(
      bottleFor(
        sea(5, (d) => (d.settings.bottleOn = addDays(TODAY, -7))),
        TODAY,
      ),
    ).not.toBeNull()
  })

  pure('no dates and no numbers: "a while ago", or the season it was', () => {
    const data = emptyData()
    expect(whenWritten(addDays(TODAY, -12), TODAY, data)).toBe('a while ago')
    expect(whenWritten('2026-05-10', TODAY, data)).toBe('back in spring')
    data.settings.hemisphere = 'south'
    expect(whenWritten('2026-05-10', TODAY, data)).toBe('back in autumn')
  })

  pure('late night is 23:00 to 05:00 of the person’s own day', () => {
    const at = (h: number, m = 0): Date => new Date(2026, 9, 20, h, m)
    expect(isLate(at(22, 59), 0)).toBe(false)
    expect(isLate(at(23, 0), 0)).toBe(true)
    expect(isLate(at(4, 59), 0)).toBe(true)
    expect(isLate(at(5, 0), 0)).toBe(false)
    // A day that ends at 5:00 moves the late hours with it.
    expect(isLate(at(23, 30), 5)).toBe(false)
    expect(isLate(at(4, 30), 5)).toBe(true)
    expect(isLate(at(9, 30), 5)).toBe(true)
    expect(isLate(at(10, 0), 5)).toBe(false)
  })
})

const run = {
  id: 'run',
  name: 'run',
  world: 'sea' as const,
  createdAt: dateKey(-40),
  order: 0,
  kind: 'tap' as const,
}
const read = {
  id: 'read',
  name: 'read',
  world: 'sky' as const,
  createdAt: dateKey(-40),
  order: 1,
  kind: 'tap' as const,
}
const study = {
  id: 'study',
  name: 'study',
  world: 'garden' as const,
  createdAt: dateKey(-40),
  order: 2,
  kind: 'lockIn' as const,
  minutes: 30,
}

/** A steady fortnight: no missed day for a moment to speak of. */
function steady(ids: string[], extra: SeedData['days'] = {}): SeedData['days'] {
  const days: SeedData['days'] = {}
  for (let i = 1; i <= 14; i++) days[dateKey(-i)] = { done: ids }
  return { ...days, ...extra }
}

/** The recap, if the week has one today, out of the way: it sits over the sky. */
async function noRecap(page: Page): Promise<void> {
  await page.locator('.row').waitFor()
  const recap = page.getByRole('complementary', { name: 'weekly recap' })
  if (await recap.isVisible()) await recap.getByRole('button', { name: 'ok' }).click()
}

async function past(page: Page): Promise<void> {
  const recap = page.getByRole('complementary', { name: 'weekly recap' })
  const checkin = page.getByRole('complementary', { name: 'check-in' })
  await expect(recap.or(checkin)).toBeVisible()
  if (await recap.isVisible()) await recap.getByRole('button', { name: 'ok' }).click()
}

test('"not today": the sea softens, one line, and the row keeps one small thing', async ({
  page,
}) => {
  await page.clock.install({ time: middayToday() })
  await seed(page, {
    things: [run, read, study],
    days: steady(['run', 'read', 'study']),
    settings: { installDismissedAt: dateKey(-1) },
  })
  await page.goto('')
  await past(page)
  const checkin = page.getByRole('complementary', { name: 'check-in' })
  // Small, under the big answer.
  await expect(checkin.getByRole('button', { name: 'good!!!' })).toBeVisible()
  await checkin.getByRole('button', { name: 'not today' }).click()
  await expect(checkin).toBeHidden()
  await expect(page.locator('.line')).toHaveText(voice.notToday.said)
  await expect(page.locator('.scene')).toHaveAttribute('data-soft', 'true')
  await expect(page.locator('.card')).toHaveCount(1)
  await expect(page.locator('.card[data-id="run"] .card-just')).toHaveText('just this one?')
  await expect(page.locator('.not-today-count')).toHaveText('2')
  const day = (await stored(page)).days[dateKey(0)]
  expect(day).toMatchObject({ notToday: true, checkin: true })
  expect([...(day?.skip ?? [])].sort()).toEqual(['read', 'study'])
})

test('three "not today"s in a row: "it’s been heavy" once, and not again that week', async ({
  page,
}) => {
  await page.clock.install({ time: middayToday() })
  const soft = { done: [], checkin: true, notToday: true }
  await seed(page, {
    things: [run],
    days: steady(['run'], { [dateKey(-1)]: soft, [dateKey(-2)]: soft }),
    settings: { installDismissedAt: dateKey(-1) },
  })
  await page.goto('')
  await past(page)
  await page
    .getByRole('complementary', { name: 'check-in' })
    .getByRole('button', { name: 'not today' })
    .click()
  await expect(page.locator('.line')).toHaveText(voice.notToday.heavy)
  expect((await stored(page)).settings).toMatchObject({ heavySaidOn: dateKey(0) })
})

test('said this week already: a third "not today" in a row gets the usual line', async ({
  page,
}) => {
  await page.clock.install({ time: middayToday() })
  const soft = { done: [], checkin: true, notToday: true }
  await seed(page, {
    things: [run],
    days: steady(['run'], { [dateKey(-1)]: soft, [dateKey(-2)]: soft }),
    settings: { installDismissedAt: dateKey(-1), heavySaidOn: dateKey(-3) },
  })
  await page.goto('')
  await past(page)
  await page
    .getByRole('complementary', { name: 'check-in' })
    .getByRole('button', { name: 'not today' })
    .click()
  await expect(page.locator('.line')).toHaveText(voice.notToday.said)
})

test('a bottle on a "not today" day: an old good thing, then gone for the day', async ({
  page,
}) => {
  await page.clock.install({ time: middayToday() })
  await seed(page, {
    things: [run],
    days: steady(['run'], {
      [dateKey(-12)]: { done: ['run'], good: 'the sea was calm' },
      [dateKey(0)]: { done: [], checkin: true, notToday: true },
    }),
    settings: { installDismissedAt: dateKey(-1) },
  })
  await page.goto('')
  await noRecap(page)
  const bottle = page.getByRole('button', { name: 'a bottle at the water’s edge' })
  await bottle.click()
  const sheet = page.getByRole('dialog', { name: 'a bottle' })
  await expect(sheet).toContainText('you wrote this a while ago:')
  await expect(sheet).toContainText('the sea was calm')
  await sheet.getByRole('button', { name: 'keep it' }).click()
  await expect(bottle).toBeHidden()
  expect((await stored(page)).settings).toMatchObject({
    bottleOn: dateKey(0),
    bottles: { [dateKey(-12)]: dateKey(0) },
  })
  await page.reload()
  await expect(page.locator('.bottle')).toBeHidden()
})

test('no good things written, no bottle, even on a "not today" day', async ({ page }) => {
  await page.clock.install({ time: middayToday() })
  await seed(page, {
    things: [run],
    days: steady(['run'], { [dateKey(0)]: { done: [], checkin: true, notToday: true } }),
    settings: { installDismissedAt: dateKey(-1) },
  })
  await page.goto('')
  await expect(page.locator('.scene')).toHaveAttribute('data-soft', 'true')
  await expect(page.locator('.bottle')).toBeHidden()
})

test('a pet: it comes closer and blinks; nothing is earned', async ({ page }) => {
  await page.clock.install({ time: middayToday() })
  await seed(page, {
    things: [run],
    days: steady(['run'], { [dateKey(0)]: { done: [], checkin: true } }),
    settings: { installDismissedAt: dateKey(-1) },
  })
  await page.goto('')
  await noRecap(page)
  const before = JSON.stringify(await stored(page))
  const pet = page.getByRole('button', { name: 'pet run' })
  await expect(pet).toBeVisible()
  const petted = await pet.evaluate((button) => {
    ;(button as HTMLButtonElement).click()
    return {
      closer: button.classList.contains('is-petted'),
      blink: button.querySelector('.eyes')?.getAnimations().length ?? 0,
      bubbles: button.querySelectorAll('.pet-bubble').length,
    }
  })
  expect(petted).toEqual({ closer: true, blink: 1, bubbles: 3 })
  expect(JSON.stringify(await stored(page))).toBe(before)
})

test('under reduced motion a pet is only a blink', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.clock.install({ time: middayToday() })
  await seed(page, {
    things: [run],
    days: steady(['run'], { [dateKey(0)]: { done: [], checkin: true } }),
    settings: { installDismissedAt: dateKey(-1) },
  })
  await page.goto('')
  await noRecap(page)
  const blinks = await page.locator('.pet[data-id="run"]').evaluate((button) => {
    ;(button as HTMLButtonElement).click()
    return button.querySelector('.eyes')?.getAnimations().length ?? 0
  })
  expect(blinks).toBe(1)
  await expect(page.locator('.pet[data-id="run"]')).not.toHaveClass(/is-petted/)
  await expect(page.locator('.pet-bubble')).toHaveCount(0)
})

test('a sleeping creature, petted on a quiet day, wakes and waves', async ({ page }) => {
  await page.clock.install({ time: middayToday() })
  const days: SeedData['days'] = {}
  for (let i = 8; i <= 20; i++) days[dateKey(-i)] = { done: ['run'] }
  await seed(page, {
    things: [run],
    days: { ...days, [dateKey(0)]: { done: [], checkin: true } },
    settings: { installDismissedAt: dateKey(-1) },
  })
  await page.goto('')
  await noRecap(page)
  const pet = page.locator('.pet[data-id="run"]')
  await expect(pet).toHaveAttribute('data-asleep', 'true')
  const woke = await pet.evaluate((button) => {
    ;(button as HTMLButtonElement).click()
    return button.classList.contains('is-waking')
  })
  expect(woke).toBe(true)
  // Awake for the rest of the visit, whatever the scene redraws.
  await expect(pet).toHaveAttribute('data-asleep', 'false')
})

test('late night: a little darker, one line, and the moon says good night', async ({ page }) => {
  const late = new Date()
  late.setHours(23, 30, 0, 0)
  await page.clock.install({ time: late })
  await seed(page, {
    things: [{ ...run, nameAsked: true }],
    days: steady(['run'], { [dateKey(0)]: { done: ['run'], checkin: true } }),
    settings: { installDismissedAt: dateKey(-1), goodAskedOn: dateKey(0) },
  })
  await page.goto('')
  await noRecap(page)
  await expect(page.locator('.scene')).toHaveAttribute('data-late', 'true')
  await expect(page.locator('.line')).toHaveText(voice.late.said)
  await page.getByRole('button', { name: 'the moon. say good night' }).click()
  const night = page.getByRole('dialog', { name: 'good night' })
  await expect(night).toBeVisible()
  await expect(night).toContainText('good night')
  await night.click()
  await expect(night).toBeHidden()
})

test('a day that ends at 5:00 is not late at 23:30', async ({ page }) => {
  const evening = new Date()
  evening.setHours(23, 30, 0, 0)
  await page.clock.install({ time: evening })
  await seed(page, {
    things: [{ ...run, nameAsked: true }],
    days: steady(['run']),
    settings: { installDismissedAt: dateKey(-1), dayEndsAt: 5, goodAskedOn: dateKey(0) },
  })
  await page.goto('')
  await expect(page.locator('.scene')).toHaveAttribute('data-late', 'false')
  await expect(page.getByRole('button', { name: 'the moon. say good night' })).toBeHidden()
})

test('at its last stage a creature can be named, once; the name can change in its sheet', async ({
  page,
}) => {
  await page.clock.install({ time: middayToday() })
  await seed(page, {
    things: [run],
    days: steady(['run'], { [dateKey(0)]: { done: [], checkin: true } }),
    settings: { installDismissedAt: dateKey(-1) },
  })
  await page.goto('')
  await noRecap(page)
  const ask = page.getByRole('complementary', { name: 'name it?' })
  // Which creature, and why now: not the thing's name alone, which reads like a label.
  await expect(ask).toContainText('run grew all the way.')
  await ask.getByRole('textbox', { name: 'its name' }).fill('moby')
  await ask.getByRole('button', { name: 'keep' }).click()
  await expect(ask).toBeHidden()
  expect((await stored(page)).things[0]).toMatchObject({ petName: 'moby', nameAsked: true })
  await expect(page.getByRole('button', { name: 'pet moby' })).toBeVisible()
  await page.getByRole('button', { name: 'edit run' }).click()
  // Apart from the thing's own name, and called what it is.
  const field = page.getByRole('dialog').getByRole('textbox', { name: 'the creature’s name' })
  await expect(field).toHaveValue('moby')
  await field.fill('orca')
  await page.getByRole('dialog').getByRole('button', { name: 'save' }).click()
  expect((await stored(page)).things[0]).toMatchObject({ petName: 'orca' })
  await page.reload()
  await expect(page.getByRole('complementary', { name: 'name it?' })).toBeHidden()
})

test('"not now" is an answer: the name is not asked again', async ({ page }) => {
  await page.clock.install({ time: middayToday() })
  await seed(page, {
    things: [run],
    days: steady(['run'], { [dateKey(0)]: { done: [], checkin: true } }),
    settings: { installDismissedAt: dateKey(-1) },
  })
  await page.goto('')
  await noRecap(page)
  await page
    .getByRole('complementary', { name: 'name it?' })
    .getByRole('button', { name: 'not now' })
    .click()
  expect((await stored(page)).things[0]).toMatchObject({ nameAsked: true })
  await page.reload()
  await expect(page.getByRole('complementary', { name: 'name it?' })).toBeHidden()
})

test('checked in before 18:00: after it, one good thing is asked on its own, once', async ({
  page,
}) => {
  const evening = new Date()
  evening.setHours(19, 0, 0, 0)
  await page.clock.install({ time: evening })
  await seed(page, {
    // Not at its last stage, so no name is asked first.
    things: [{ ...run, createdAt: dateKey(-3) }],
    days: { [dateKey(-1)]: { done: ['run'] }, [dateKey(0)]: { done: [], checkin: true } },
    settings: { installDismissedAt: dateKey(-1) },
  })
  await page.goto('')
  const card = page.getByRole('complementary', { name: 'one good thing today' })
  await card.getByRole('textbox', { name: 'one good thing today' }).fill('tea with a friend')
  await card.getByRole('button', { name: 'keep' }).click()
  await expect(card).toBeHidden()
  expect((await stored(page)).days[dateKey(0)]).toMatchObject({ good: 'tea with a friend' })
  await page.reload()
  await expect(page.getByRole('complementary', { name: 'one good thing today' })).toBeHidden()
})
