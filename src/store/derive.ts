import { addDays, lastKeys, weekStart } from './dates'
import { plannedOn } from './plan'
import { allQuiet, isQuiet } from './quiet'
import type { AppData, DateKey, DayRecord, Line, Thing, World } from './types'

/**
 * Everything the scene needs that is not stored: it is all arithmetic over
 * `days`, cheap enough to run on every redraw.
 */

export type { Line } from './types'

/** Creature stage from the last seven days: 0-1, 2-3, 4-5, 6-7 days done. */
export type Stage = 0 | 1 | 2 | 3

export const UNLOCK_DAYS: readonly number[] = [
  3, 7, 14, 21, 30, 45, 60, 90, 120, 180, 240, 300, 365,
]

export { plannedOn, weekday } from './plan'

/** The things planned for a date, in their order. */
export function plannedThings(data: AppData, date: DateKey): Thing[] {
  return [...data.things].sort((a, b) => a.order - b.order).filter((t) => plannedOn(data, t, date))
}

/** A day with things, none of them planned: rest. */
export function isRestDay(data: AppData, date: DateKey): boolean {
  return data.things.length > 0 && plannedThings(data, date).length === 0
}

/** How far back to look for seven planned days: a thing planned once a week reaches back seven weeks. */
const PLANNED_LOOKBACK = 7 * 8

/**
 * How many of the thing's last seven planned days (today included, if
 * planned) it was done. Only planned days count, so a thing done three
 * times a week can grow into a whale.
 */
export function last7(data: AppData, thingId: string, today: DateKey): number {
  const thing = data.things.find((t) => t.id === thingId)
  if (!thing) return 0
  let seen = 0
  let done = 0
  for (let i = 0; i < PLANNED_LOOKBACK && seen < 7; i++) {
    const date = addDays(today, -i)
    if (!plannedOn(data, thing, date)) continue
    seen++
    if (data.days[date]?.done.includes(thingId)) done++
  }
  return done
}

export type Dot = 'done' | 'open' | 'rest' | 'quiet' | 'none'

/**
 * The last seven calendar days, oldest first: planned and done, planned
 * and not done, or not planned (a rest day, never a miss). The week dots.
 */
export function weekDots(data: AppData, thingId: string, today: DateKey): Dot[] {
  const thing = data.things.find((t) => t.id === thingId)
  return lastKeys(today, 7).map((date) => {
    // Before a new chapter, the week's dots are blank: they start fresh.
    if (data.settings.chapterFrom !== undefined && date < data.settings.chapterFrom) return 'none'
    if (data.days[date]?.done.includes(thingId)) return 'done'
    if (thing && !plannedOn(data, thing, date)) return 'rest'
    if (thing && isQuiet(data, thing, date, today)) return 'quiet'
    return 'open'
  })
}

export function stageFor(count: number): Stage {
  if (count >= 6) return 3
  if (count >= 4) return 2
  if (count >= 2) return 1
  return 0
}

/**
 * Whether a day counts towards stars and stones for a thing: done, and not
 * only through a session that was left and waited.
 */
export function counted(day: DayRecord | undefined, thingId: string): boolean {
  if (!day?.done.includes(thingId)) return false
  return !(day.waited?.includes(thingId) ?? false)
}

/** Every day the thing was counted. The stones count this. */
export function totalDone(data: AppData, thingId: string): number {
  let n = 0
  for (const day of Object.values(data.days)) if (counted(day, thingId)) n++
  return n
}

/** The highest unlock tier a thing has earned, or 0. */
export function earnedTier(data: AppData, thingId: string): number {
  const total = totalDone(data, thingId)
  let tier = 0
  for (const days of UNLOCK_DAYS) if (days <= total) tier = days
  return tier
}

/** Tiers earned but not cracked yet, lowest first: the stones waiting in the scene. */
export function waitingTiers(data: AppData, thingId: string): number[] {
  const total = totalDone(data, thingId)
  const cracked = data.cracked[thingId] ?? 0
  return UNLOCK_DAYS.filter((days) => days <= total && days > cracked)
}

/** The date a thing reached `tier` counted days: the shine of that find is picked from it. */
export function reachedOn(data: AppData, thingId: string, tier: number): DateKey | undefined {
  const dates = Object.keys(data.days)
    .filter((key) => counted(data.days[key], thingId))
    .sort()
  return dates[tier - 1]
}

/** The thing's line: stored on it since 0.11, so it never shifts when another thing goes. */
export function lineFor(_data: AppData, thing: Thing): Line {
  return thing.line
}

/** Days with at least one thing counted: one star each. Oldest first. */
export function starDays(data: AppData): DateKey[] {
  return Object.entries(data.days)
    .filter(([, day]) => day.done.some((id) => counted(day, id)))
    .map(([key]) => key)
    .sort()
}

/**
 * Days in a row: planned days with something done, counted back from
 * today (or yesterday, while today is still open). A rest day, with
 * nothing planned, neither counts nor breaks it.
 */
export function streak(data: AppData, today: DateKey): number {
  let n = 0
  for (let i = 0; i < 3660; i++) {
    const date = addDays(today, -i)
    const planned = plannedThings(data, date)
    const done = data.days[date]?.done ?? []
    const any = done.some((id) => counted(data.days[date], id))
    if (any) {
      n++
      continue
    }
    if (planned.length === 0) {
      // A rest day, or a day before the first thing: skip, unless it is before everything.
      const first = data.things.map((t) => t.createdAt).sort()[0]
      if (first === undefined || date < first) break
      continue
    }
    if (i === 0) continue
    // A day whose misses were all quiet days neither counts nor breaks.
    if (allQuiet(data, planned, date, today)) continue
    break
  }
  return n
}

/** Every thing planned today is done, and something was planned. */
export function allDoneToday(data: AppData, today: DateKey): boolean {
  const planned = plannedThings(data, today)
  if (planned.length === 0) return false
  const done = data.days[today]?.done ?? []
  return planned.every((t) => done.includes(t.id))
}

/** Yesterday had things planned and none of them was done. A rest day is never missed. */
export function missedYesterday(data: AppData, today: DateKey): boolean {
  const yesterday = addDays(today, -1)
  const planned = plannedThings(data, yesterday).filter((t) => t.createdAt < yesterday)
  if (planned.length === 0) return false
  if ((data.days[yesterday]?.done.length ?? 0) > 0) return false
  // A quiet day is a day off given in advance: the sea does not go quiet for it.
  return !allQuiet(data, planned, yesterday, today)
}

/** Day N of whale club: days since the first thing was added, counting from one. */
export function dayNumber(data: AppData, today: DateKey): number {
  const first = data.things.map((t) => t.createdAt).sort()[0]
  if (!first) return 0
  const ms = new Date(today).getTime() - new Date(first).getTime()
  return Math.max(1, Math.round(ms / 86_400_000) + 1)
}

export function worldOf(data: AppData, thingId: string): World | undefined {
  return data.things.find((t) => t.id === thingId)?.world
}

/**
 * Everything a thing has found: earned by its days, and cracked open. An
 * earned tier whose stone is still waiting is not in the scene yet.
 */
export function foundFor(
  data: AppData,
  thing: Thing,
  list: readonly { id: string; world: World; line: Line; days: number }[],
): string[] {
  const line = lineFor(data, thing)
  const reach = Math.min(totalDone(data, thing.id), data.cracked[thing.id] ?? 0)
  return list
    .filter((c) => c.world === thing.world && c.line === line && c.days <= reach)
    .map((c) => c.id)
}

/** Runs of three or more consecutive star days, which the sky joins into constellations. */
export function streakDays(stars: readonly DateKey[]): Set<DateKey> {
  const linked = new Set<DateKey>()
  let run: DateKey[] = []
  const flush = (): void => {
    if (run.length >= 3) for (const d of run) linked.add(d)
    run = []
  }
  for (const date of stars) {
    const previous = run[run.length - 1]
    if (previous !== undefined && addDays(previous, 1) !== date) flush()
    run.push(date)
  }
  flush()
  return linked
}

/** "Did it without the timer", for all things together, in one week. */
export const WITHOUT_TIMER_PER_WEEK = 2

/** How many times are left this week (Monday to Sunday) to mark a lock-in done without the timer. */
export function withoutTimerLeft(data: AppData, today: DateKey): number {
  const monday = weekStart(today)
  let used = 0
  for (let i = 0; i < 7; i++) used += data.days[addDays(monday, i)]?.manual?.length ?? 0
  return Math.max(0, WITHOUT_TIMER_PER_WEEK - used)
}

/** A creature not done on this many of its planned days in a row falls asleep. */
const SLEEP_AFTER = 2

/**
 * Whether a thing's creature is asleep: its last planned days before today
 * went by without it, and today has not woken it yet. Creatures never look
 * sad or hungry; left alone, they sleep, and wake when their thing is done.
 */
export function asleep(data: AppData, thing: Thing, today: DateKey): boolean {
  if (data.days[today]?.done.includes(thing.id)) return false
  let missed = 0
  for (let i = 1; i <= PLANNED_LOOKBACK; i++) {
    const date = addDays(today, -i)
    if (date < thing.createdAt) return false
    if (!plannedOn(data, thing, date)) continue
    if (data.days[date]?.done.includes(thing.id)) return false
    if (++missed >= SLEEP_AFTER) return true
  }
  return false
}
