import { test as pure, type Page } from '@playwright/test'
import { dayLine, LINES } from '../../src/app/lines'
import { addDays, todayKey } from '../../src/store/dates'
import { voice } from '../../src/voice'
import { expect, middayToday, seed, test } from './helpers'

/**
 * The line for the day: one after the check-in, chosen by the date, none
 * again until all have had their day; the author's lines without a name,
 * the others with theirs; the moments that say one of them, and never the
 * same words twice in a day; a postcard of the whale with the line.
 */

pure.describe('worked out', () => {
  pure.skip(({ isMobile }) => isMobile, 'pure data')

  pure('one line a day: the same all day, another tomorrow', () => {
    expect(dayLine('2026-10-08')).toEqual(dayLine('2026-10-08'))
    expect(dayLine('2026-10-09').id).not.toBe(dayLine('2026-10-08').id)
  })

  pure('no line comes back until every line has had its day', () => {
    for (const start of ['2026-01-01', '2026-10-08', '2027-03-15']) {
      const ids = Array.from({ length: LINES.length }, (_, i) => dayLine(addDays(start, i)).id)
      expect(new Set(ids).size).toBe(LINES.length)
    }
  })

  pure('a line a moment already said today is not said again', () => {
    const own = dayLine('2026-10-08')
    const other = dayLine('2026-10-08', new Set([own.text]))
    expect(other.id).not.toBe(own.id)
  })

  pure('the author’s lines carry no name; the others carry theirs, in lowercase', () => {
    expect(LINES).toHaveLength(20)
    expect(LINES.filter((l) => l.by).map((l) => [l.text, l.by])).toEqual([
      ['drop by drop the water pot is filled.', 'the dhammapada'],
      ['if not now, when?', 'hillel'],
      ['above all, don’t lie to yourself.', 'dostoevsky'],
      ['if you want to improve, be content to be thought foolish and stupid.', 'epictetus'],
      ['fall seven times, stand up eight.', 'japanese proverb'],
    ])
    for (const line of LINES) {
      expect(line.by ?? '').toBe((line.by ?? '').toLowerCase())
      // Typographic apostrophes only.
      expect(line.text).not.toContain("'")
    }
  })

  pure('the moments say their lines', () => {
    expect(voice.missedDay).toBe('fall seven times, stand up eight.')
    expect(voice.weekBad).toBe('not perfect. still moving.')
    expect(voice.milestone(100)).toBe('compare day one with today.')
    expect(voice.milestone(200)).toBe('compare day one with today.')
    expect(voice.milestone(365)).toBe('look back sometimes. you came a long way. respect yourself.')
    expect(voice.chapter.lead).toBe(
      'one day you might not get to try this. let’s do it while we can.',
    )
    expect(voice.clubLine).toBe('if you get there one day, who do you want next to you?')
    expect(voice.without.truth).toEqual({
      id: 'dont-lie',
      text: 'above all, don’t lie to yourself.',
      by: 'dostoevsky',
    })
  })
})

/** The first day from today whose line passes `which`: the clock is set to its midday. */
async function onADayWhose(page: Page, which: (date: string) => boolean): Promise<string> {
  for (let i = 0; i < LINES.length; i++) {
    const date = addDays(todayKey(), i)
    if (which(date)) {
      const [y, m, d] = date.split('-').map(Number)
      await page.clock.setFixedTime(new Date(y ?? 2026, (m ?? 1) - 1, d ?? 1, 12, 0))
      return date
    }
  }
  throw new Error('no such day in a whole cycle')
}

/**
 * A steady fortnight before `date`: no missed day and no quiet week, so no
 * moment of that day says one of the lines, and the check-in's line is the
 * day's own.
 */
async function seedFor(
  page: Page,
  date: string,
  settings: Record<string, unknown> = {},
  thing: Record<string, unknown> = {},
): Promise<void> {
  const days: Record<string, { done: string[] }> = {}
  for (let i = 1; i <= 14; i++) days[addDays(date, -i)] = { done: ['run'] }
  await seed(page, {
    things: [
      {
        id: 'run',
        name: 'run',
        world: 'sea',
        createdAt: addDays(date, -40),
        order: 0,
        kind: 'tap',
        ...thing,
      },
    ],
    days,
    settings: { installDismissedAt: addDays(date, -1), ...settings },
  })
}

/** The recap first, if it is the week's day for one ("a good week." is not a line of the day), then the two answers. */
async function checkIn(page: Page): Promise<ReturnType<Page['getByRole']>> {
  const recap = page.getByRole('complementary', { name: 'weekly recap' })
  const checkin = page.getByRole('complementary', { name: 'check-in' })
  await expect(recap.or(checkin)).toBeVisible()
  if (await recap.isVisible()) await recap.getByRole('button', { name: 'ok' }).click()
  await checkin.getByRole('button', { name: 'good!!!' }).click()
  await checkin.getByRole('button', { name: 'happy!!!' }).click()
  return checkin
}

test('after the check-in, the line for the day, with the name of who said it', async ({ page }) => {
  const date = await onADayWhose(page, (d) => dayLine(d).by !== undefined)
  await seedFor(page, date)
  await page.goto('')
  const checkin = await checkIn(page)
  const line = dayLine(date)
  await expect(checkin.locator('.day-line')).toHaveText(line.text)
  await expect(checkin.locator('.day-line-by')).toHaveText(line.by ?? '')
  await checkin.getByRole('button', { name: 'ok' }).click()
  await expect(checkin).toBeHidden()
})

test('the author’s own line has no name under it', async ({ page }) => {
  const date = await onADayWhose(page, (d) => dayLine(d).by === undefined)
  await seedFor(page, date)
  await page.goto('')
  const checkin = await checkIn(page)
  await expect(checkin.locator('.day-line')).toBeVisible()
  await expect(checkin.locator('.day-line-by')).toHaveCount(0)
})

test('"send this" makes a postcard of the whale with the line and its name', async ({ page }) => {
  await page.addInitScript(() => {
    // Every word painted on a canvas, and the share sheet, recorded.
    const w = window as unknown as { __painted: string[]; __shared: number }
    w.__painted = []
    w.__shared = 0
    const proto = CanvasRenderingContext2D.prototype
    const fill = Object.getOwnPropertyDescriptor(proto, 'fillText')?.value as (
      this: CanvasRenderingContext2D,
      ...args: Parameters<CanvasRenderingContext2D['fillText']>
    ) => void
    proto.fillText = function (this: CanvasRenderingContext2D, ...args) {
      w.__painted.push(args[0])
      fill.apply(this, args)
    }
    Object.defineProperty(navigator, 'canShare', { value: () => true, configurable: true })
    Object.defineProperty(navigator, 'share', {
      configurable: true,
      value: () => {
        w.__shared++
        return Promise.resolve()
      },
    })
  })
  const date = await onADayWhose(page, (d) => dayLine(d).by !== undefined)
  await seedFor(page, date, { postcardFormat: 'story' })
  await page.goto('')
  const checkin = await checkIn(page)
  await checkin.getByRole('button', { name: 'send this' }).click()
  await expect
    .poll(() => page.evaluate(() => (window as unknown as { __shared: number }).__shared))
    .toBe(1)
  const painted = await page.evaluate(
    () => (window as unknown as { __painted: string[] }).__painted,
  )
  const line = dayLine(date)
  // The line may wrap into rows; together they are the line, and the name is under it.
  expect(painted.join(' ')).toContain(line.text)
  expect(painted).toContain(line.by ?? '')
  await expect(checkin).toBeHidden()
})

test('a line already said today by a moment is not said again by the check-in', async ({
  page,
}) => {
  // A day whose own line is the club line, which the menu says.
  const date = await onADayWhose(page, (d) => dayLine(d).text === voice.clubLine)
  await seedFor(page, date)
  await page.goto('')
  await page.getByRole('button', { name: 'Menu' }).click()
  await expect(page.getByText(voice.clubLine)).toBeVisible()
  await page.keyboard.press('Escape')
  const checkin = await checkIn(page)
  const shown = await checkin.locator('.day-line').textContent()
  expect(shown).not.toBe(voice.clubLine)
  expect(shown).toBe(dayLine(date, new Set([voice.clubLine])).text)
})

test('every line fits a 320px phone in two rows at most', async ({ page }) => {
  test.skip(test.info().project.name !== 'desktop', 'one viewport is the point')
  await page.setViewportSize({ width: 320, height: 640 })
  await page.clock.install({ time: middayToday() })
  await seedFor(page, todayKey())
  await page.goto('')
  const checkin = await checkIn(page)
  const tooLong = await checkin.locator('.day-line').evaluate(
    (element, texts) => {
      const lineHeight = parseFloat(getComputedStyle(element).lineHeight)
      return texts.filter((text) => {
        element.textContent = text
        return element.getBoundingClientRect().height > lineHeight * 2.5
      })
    },
    LINES.map((l) => l.text),
  )
  expect(tooLong).toEqual([])
})

test('the timer’s question carries its line, and the name under it', async ({ page }) => {
  await seedFor(page, todayKey(), {}, { kind: 'lockIn', minutes: 25 })
  await page.goto('')
  await page.getByRole('button', { name: 'edit run' }).click()
  await page.getByRole('button', { name: 'did it without the timer' }).click()
  await expect(page.locator('.without-truth')).toHaveText(voice.without.truth.text)
  await expect(page.locator('.without-truth-by')).toHaveText('dostoevsky')
})
