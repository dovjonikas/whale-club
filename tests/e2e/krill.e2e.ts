import { expect, test } from '@playwright/test'
import { addDays } from '../../src/store/dates'
import { KRILL, krillBalance, krillEarned, krillOn, krillSpent } from '../../src/store/krill'
import { emptyData, EVERY_DAY, type AppData, type Thing } from '../../src/store/types'

/**
 * Krill, worked out from the days: the calibration the brief asks for (a
 * steady person, three things, one 30-minute lock-in, four days in five,
 * earns about 2,000 a month and 25,000 a year), and the rules that keep
 * the balance honest.
 */
const START = '2026-01-05' // a Monday

function thing(id: string, order: number, kind: Thing['kind'] = 'tap'): Thing {
  return {
    id,
    name: id,
    icon: 'letter',
    kind,
    minutes: 30,
    days: [...EVERY_DAY],
    world: (['sea', 'sky', 'garden'] as const)[order % 3] ?? 'sea',
    line: 'a',
    createdAt: START,
    order,
  }
}

/** A steady person: each thing done four days in five, the lock-in for 30 minutes. */
function steady(days: number): AppData {
  const data = emptyData()
  data.things = [thing('run', 0), thing('read', 1), thing('violin', 2, 'lockIn')]
  for (let i = 0; i < days; i++) {
    const date = addDays(START, i)
    // Each thing skips one day in five, on different days.
    const done = data.things.filter((_, k) => (i + k) % 5 !== 0).map((t) => t.id)
    data.days[date] = {
      done,
      minutes: done.includes('violin') ? { violin: 30 } : {},
      ...(done.includes('violin') ? { sessions: [{ thing: 'violin', minutes: 30 }] } : {}),
    }
  }
  return data
}

test('a steady person earns about 2,000 krill a month and 25,000 a year', () => {
  const month = krillEarned(steady(30), addDays(START, 29))
  expect(month).toBeGreaterThan(1800)
  expect(month).toBeLessThan(2200)
  const year = krillEarned(steady(365), addDays(START, 364))
  expect(year).toBeGreaterThan(22_000)
  expect(year).toBeLessThan(28_000)
})

test('a day earns for each thing done, each minute locked in, and for all of it', () => {
  const data = steady(1)
  data.days[START] = {
    done: ['run', 'read', 'violin'],
    minutes: { violin: 200 },
    sessions: [{ thing: 'violin', minutes: 200 }],
  }
  // Minutes are capped per session; everything planned was done.
  expect(krillOn(data, START)).toEqual({
    done: 3 * KRILL.done,
    minutes: KRILL.sessionCap,
    allDone: KRILL.allDone,
    welcome: 0,
  })
  // A session that was left, before 0.11, earns half its minutes.
  data.days[START] = {
    done: ['violin'],
    minutes: { violin: 30 },
    waited: ['violin'],
    sessions: [{ thing: 'violin', minutes: 30, left: true }],
  }
  expect(krillOn(data, START)).toEqual({ done: 0, minutes: 15, allDone: 0, welcome: 0 })
})

test('a good week counts only once it is over', () => {
  const data = steady(14)
  const midWeek = addDays(START, 10)
  const before = krillEarned(data, midWeek)
  const days = Object.keys(data.days).filter((d) => d <= midWeek)
  const daily = days.reduce((n, d) => {
    const day = krillOn(data, d)
    return n + day.done + day.minutes + day.allDone + day.welcome
  }, 0)
  // Only the first week, which is over, adds its 50; the first week’s set (seven days done) its 100.
  expect(before - daily).toBe(KRILL.goodWeek + KRILL.firstWeek)
})

test('buying lowers the balance, and the balance is never below nothing', () => {
  const data = steady(30)
  const today = addDays(START, 29)
  const earned = krillEarned(data, today)
  data.bought = [{ item: 'buoy', date: today, price: 150 }]
  expect(krillSpent(data)).toBe(150)
  expect(krillBalance(data, today)).toBe(earned - 150)
  // A done taken back after a purchase can never make the balance negative.
  data.bought.push({ item: 'lighthouse', date: today, price: earned * 2 })
  expect(krillBalance(data, today)).toBe(0)
})
