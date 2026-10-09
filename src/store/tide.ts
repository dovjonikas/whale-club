import { addDays, fromKey, weekStart } from './dates'
import { counted, plannedThings } from './derive'
import { daysOf, monthOf, monthSummary, type MonthKey } from './log'
import type { AppData, DateKey } from './types'

/**
 * The month's tide: last month told back in a few sentences
 * (src/app/tide.ts draws it, and adds the month's newest find). Plain arithmetic on AppData, and every
 * sentence it allows must be exactly true, so each part has a threshold:
 * a part that is not backed by enough days is left out, never softened
 * into something vaguer. Nothing missed is ever counted. The check-in's
 * answers are fixed and always happy, so no truth is drawn from them.
 */
export interface Tide {
  month: MonthKey
  /** Days with a star. */
  stars: number
  lanterns: number
  minutes: number
  /** The week (from its first day) with the most planned days that had a star. */
  bestWeek?: { from: DateKey; to: DateKey; count: number; planned: number }
  truth?: Truth
  type: TideType
  /** Evenings that kept a good thing. */
  goods: number
}

export type Truth =
  | { kind: 'together'; a: string; b: string; days: number }
  | { kind: 'weekday'; weekday: number; stars: number }
  | { kind: 'goods'; evenings: number }
  | { kind: 'longest'; minutes: number }

/** Every month has one, and none is better than another. */
export type TideType = 'lanternfish' | 'turtle' | 'dolphin' | 'seal' | 'whale'

/** A truth needs at least this many days behind it. */
const TRUTH_DAYS = 5
/** Two things "come together" when they share this share of the rarer one's days. */
const TOGETHER_SHARE = 0.7
/** A weekday with the most stars, by at least one, and at least this many. */
const WEEKDAY_STARS = 3
/** Evenings with a good thing before it is worth a sentence. */
const GOODS_SAID = 3
/** A lock-in long enough to be told. */
const LONGEST_SAID = 20
/** A best week is told when it had at least this many stars, in a month of two weeks or more. */
const BEST_WEEK_STARS = 3
/** The lanternfish: this many lanterns in a month. */
const LANTERNFISH = 8
/** The turtle: a star on this share of the month's days, and no gap longer than this. */
const TURTLE_SHARE = 0.6
const TURTLE_GAP = 3
/** The dolphin: at least two runs of three days or more. */
const DOLPHIN_RUN = 3
/** The seal: this many days with nothing planned, and this many stars. */
const SEAL_RESTS = 4
const SEAL_STARS = 8
/** A humpback's song lasts ten to twenty minutes; the tide counts fifteen. */
export const SONG_MINUTES = 15

function hasStar(data: AppData, date: DateKey): boolean {
  const day = data.days[date]
  return day?.done.some((id) => counted(day, id)) ?? false
}

export function tideFor(data: AppData, month: MonthKey): Tide | null {
  const days = daysOf(month)
  const starred = days.filter((date) => hasStar(data, date))
  if (starred.length === 0) return null
  const { stars, lanterns, minutes } = monthSummary(data, month)
  const goods = days.filter((date) => (data.days[date]?.good ?? '').trim() !== '').length
  const bestWeek = bestWeekOf(data, days)
  const truth = truthOf(data, days, starred, goods)
  const base = {
    month,
    stars,
    lanterns,
    minutes,
    goods,
    type: typeOf(data, days, starred, lanterns),
  }
  return {
    ...base,
    ...(bestWeek ? { bestWeek } : {}),
    ...(truth ? { truth } : {}),
  }
}

/** The month that the tide on `today` tells: the one before. */
export function lastMonth(today: DateKey): MonthKey {
  return monthOf(addDays(`${monthOf(today)}-01`, -1))
}

function bestWeekOf(data: AppData, days: DateKey[]): Tide['bestWeek'] {
  const weeks = new Map<DateKey, DateKey[]>()
  for (const date of days) {
    const start = weekStart(date)
    weeks.set(start, [...(weeks.get(start) ?? []), date])
  }
  let best: Tide['bestWeek']
  let counted = 0
  for (const week of weeks.values()) {
    const planned = week.filter((date) => plannedThings(data, date).length > 0)
    if (planned.length === 0) continue
    counted++
    const count = planned.filter((date) => hasStar(data, date)).length
    // A later week wins a tie: the month is told as it ended.
    if (!best || count >= best.count)
      best = {
        from: week[0] ?? '',
        to: week[week.length - 1] ?? '',
        count,
        planned: planned.length,
      }
  }
  if (counted < 2 || !best || best.count < BEST_WEEK_STARS) return undefined
  return best
}

/**
 * One true thing about the month, the first that the days back up: two
 * things that kept coming on the same days, the weekday with the most
 * stars, the evenings that kept a good thing, the longest lock-in.
 */
function truthOf(
  data: AppData,
  days: DateKey[],
  starred: DateKey[],
  goods: number,
): Truth | undefined {
  const doneOn = (id: string): DateKey[] =>
    days.filter((date) => {
      const day = data.days[date]
      return day?.done.includes(id) === true && counted(day, id)
    })
  const things = [...data.things].sort((a, b) => a.order - b.order)
  let together: Truth | undefined
  for (const [i, a] of things.entries()) {
    for (const b of things.slice(i + 1)) {
      const aDays = doneOn(a.id)
      const bDays = new Set(doneOn(b.id))
      const both = aDays.filter((date) => bDays.has(date)).length
      const rarer = Math.min(aDays.length, bDays.size)
      if (both < TRUTH_DAYS || rarer === 0 || both / rarer < TOGETHER_SHARE) continue
      if (together?.kind !== 'together' || both > together.days)
        together = { kind: 'together', a: a.name, b: b.name, days: both }
    }
  }
  if (together) return together

  const byWeekday = Array.from({ length: 7 }, () => 0)
  for (const date of starred) {
    const weekday = fromKey(date).getDay()
    byWeekday[weekday] = (byWeekday[weekday] ?? 0) + 1
  }
  const most = Math.max(...byWeekday)
  const winners = byWeekday.filter((n) => n === most).length
  if (most >= WEEKDAY_STARS && winners === 1)
    return { kind: 'weekday', weekday: byWeekday.indexOf(most), stars: most }

  if (goods >= GOODS_SAID) return { kind: 'goods', evenings: goods }

  const longest = Math.max(
    0,
    ...days.flatMap((date) => (data.days[date]?.sessions ?? []).map((s) => s.minutes)),
  )
  if (longest >= LONGEST_SAID) return { kind: 'longest', minutes: longest }
  return undefined
}

/**
 * The month's sea type, from the first rule that fits: many lanterns, a
 * little nearly every day, bursts, work and rest, and the whale for every
 * other month. All of them are said warmly; none is a grade.
 */
function typeOf(data: AppData, days: DateKey[], starred: DateKey[], lanterns: number): TideType {
  if (lanterns >= LANTERNFISH) return 'lanternfish'
  const set = new Set(starred)
  // The month as far as it has gone: a tide watched again mid-month counts only its days so far.
  const until = days.filter((date) => date <= (starred[starred.length - 1] ?? date))
  let gap = 0
  let longestGap = 0
  const runs: number[] = []
  let run = 0
  for (const date of until) {
    if (set.has(date)) {
      run++
      gap = 0
    } else {
      if (run > 0) runs.push(run)
      run = 0
      gap++
      longestGap = Math.max(longestGap, gap)
    }
  }
  if (run > 0) runs.push(run)
  if (starred.length >= days.length * TURTLE_SHARE && longestGap <= TURTLE_GAP) return 'turtle'
  if (runs.filter((r) => r >= DOLPHIN_RUN).length >= 2 && runs.length >= 2) return 'dolphin'
  const rests = days.filter((date) => plannedThings(data, date).length === 0).length
  if (rests >= SEAL_RESTS && starred.length >= SEAL_STARS) return 'seal'
  return 'whale'
}

/** How many humpback songs the month's lock-in minutes would hold, whole. */
export function songsIn(minutes: number): number {
  return Math.floor(minutes / SONG_MINUTES)
}
