import { addDays, weekStart } from './dates'
import { counted, plannedOn } from './derive'
import type { AppData, DateKey } from './types'

/**
 * Krill: what whales are made of, and the club's one currency. Earned,
 * never bought, never lost, never running out.
 *
 * Nothing earned is stored. Like the finds, it is worked out from the days,
 * so it can never disagree with them; only what was spent is kept (each
 * purchase with the price paid). The balance is earned minus spent, and
 * never below nothing. docs/ECONOMY.md has the model and the numbers.
 */
export const KRILL = {
  /** Each thing done (and counted) on a day. */
  done: 10,
  /** Each minute of a lock-in that ran to its end, up to the cap. */
  perMinute: 1,
  sessionCap: 120,
  /** A session that was left (before 0.11) earns half its minutes. */
  leftShare: 0.5,
  /** Every thing planned that day, done. */
  allDone: 25,
  /** The first done after a break of two or more planned days: a small gift, nothing said. */
  welcome: 20,
  /** A break this many planned days long, or longer, is one to welcome someone back from. */
  welcomeAfter: 2,
  /** The first week's set, finished: seven days with something done. Once. */
  firstWeek: 100,
  /** A week (first day to last, as set, and over) with this share of its planned days done or more. */
  goodWeek: 50,
  goodWeekShare: 0.8,
} as const

/** How far back a break is looked for: past a year, it is a first day again. */
const MAX_BREAK_LOOKBACK = 400

/** The first week's set has a slot for each of its first seven days with something done. */
export const FIRST_WEEK_DAYS = 7

export interface KrillDay {
  done: number
  minutes: number
  allDone: number
  welcome: number
}

/** What one day earned, by kind. */
export function krillOn(data: AppData, date: DateKey): KrillDay {
  const day = data.days[date]
  if (!day) return { done: 0, minutes: 0, allDone: 0, welcome: 0 }
  const done = day.done.filter((id) => counted(day, id)).length * KRILL.done
  let minutes = 0
  for (const session of day.sessions ?? []) {
    const capped = Math.min(KRILL.sessionCap, Math.max(0, Math.round(session.minutes)))
    minutes += Math.floor(capped * (session.left ? KRILL.leftShare : 1)) * KRILL.perMinute
  }
  const planned = data.things.filter((t) => t.createdAt <= date && plannedOn(data, t, date))
  const allDone =
    planned.length > 0 && planned.every((t) => day.done.includes(t.id)) ? KRILL.allDone : 0
  return {
    done,
    minutes,
    allDone,
    welcome: done > 0 && welcomedBack(data, date) ? KRILL.welcome : 0,
  }
}

/**
 * Whether a day with something done came after a break: two or more days
 * with something planned and nothing done since the last such day. Rest
 * days are no break, and the very first day is no return.
 */
export function welcomedBack(data: AppData, date: DateKey): boolean {
  let missed = 0
  for (let back = 1; back <= MAX_BREAK_LOOKBACK; back++) {
    const day = addDays(date, -back)
    const record = data.days[day]
    if (record?.done.some((id) => counted(record, id))) return missed >= KRILL.welcomeAfter
    if (data.things.some((t) => t.createdAt <= day && plannedOn(data, t, day))) missed++
  }
  return false
}

/**
 * Whether a whole week went well: of the days things were planned (a
 * thing-day each), this share or more were done. Judged only once the week
 * is over.
 */
export function goodWeek(data: AppData, monday: DateKey): boolean {
  let planned = 0
  let done = 0
  for (let i = 0; i < 7; i++) {
    const date = addDays(monday, i)
    const day = data.days[date]
    for (const thing of data.things) {
      if (thing.createdAt > date || !plannedOn(data, thing, date)) continue
      planned++
      if (counted(day, thing.id)) done++
    }
  }
  return planned > 0 && done / planned >= KRILL.goodWeekShare
}

/** Everything earned up to and including `today`. */
export function krillEarned(data: AppData, today: DateKey): number {
  let total = 0
  const dates = Object.keys(data.days).filter((d) => d <= today)
  for (const date of dates) {
    const day = krillOn(data, date)
    total += day.done + day.minutes + day.allDone + day.welcome
  }
  // The first week's set: seven days with something done, once ever.
  if (
    dates.filter((date) => (data.days[date]?.done ?? []).some((id) => counted(data.days[date], id)))
      .length >= FIRST_WEEK_DAYS
  )
    total += KRILL.firstWeek
  // Good weeks: every week that is over, from the first thing's week.
  const first = data.things
    .map((t) => t.createdAt)
    .concat(dates)
    .sort()[0]
  if (first !== undefined) {
    const thisWeek = weekStart(today)
    for (let monday = weekStart(first); monday < thisWeek; monday = addDays(monday, 7)) {
      if (goodWeek(data, monday)) total += KRILL.goodWeek
    }
  }
  return total
}

/** Everything spent: the prices paid, as they were paid. */
export function krillSpent(data: AppData): number {
  return (data.bought ?? []).reduce((sum, b) => sum + b.price, 0)
}

/** What there is to spend: earned minus spent, never below nothing. */
export function krillBalance(data: AppData, today: DateKey): number {
  return Math.max(0, krillEarned(data, today) - krillSpent(data))
}
