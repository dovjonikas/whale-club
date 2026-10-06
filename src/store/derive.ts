import { addDays, lastKeys } from './dates'
import type { AppData, DateKey, Thing, World } from './types'

/**
 * Everything the scene needs that is not stored: it is all arithmetic over
 * `days`, cheap enough to run on every redraw.
 */

export type Line = 'a' | 'b'

/** Creature stage from the last seven days: 0-1, 2-3, 4-5, 6-7 days done. */
export type Stage = 0 | 1 | 2 | 3

export const UNLOCK_DAYS: readonly number[] = [3, 7, 14, 21, 30, 45, 60, 90, 120, 180]

/** How many of the last seven days (today included) the thing was done. */
export function last7(data: AppData, thingId: string, today: DateKey): number {
  return lastKeys(today, 7).filter((key) => data.days[key]?.done.includes(thingId)).length
}

/** Which of the last seven days were done, oldest first. The week dots. */
export function weekDots(data: AppData, thingId: string, today: DateKey): boolean[] {
  return lastKeys(today, 7).map((key) => data.days[key]?.done.includes(thingId) ?? false)
}

export function stageFor(count: number): Stage {
  if (count >= 6) return 3
  if (count >= 4) return 2
  if (count >= 2) return 1
  return 0
}

/** Every day the thing was ever done. The collectibles count this. */
export function totalDone(data: AppData, thingId: string): number {
  let n = 0
  for (const day of Object.values(data.days)) if (day.done.includes(thingId)) n++
  return n
}

/** The first thing in a world takes line A, the second line B. */
export function lineFor(data: AppData, thing: Thing): Line {
  const sameWorld = data.things
    .filter((t) => t.world === thing.world)
    .sort((a, b) => a.order - b.order)
  return sameWorld.indexOf(thing) === 0 ? 'a' : 'b'
}

/** Days with at least one thing done: one star each. Oldest first. */
export function starDays(data: AppData): DateKey[] {
  return Object.entries(data.days)
    .filter(([, day]) => day.done.length > 0)
    .map(([key]) => key)
    .sort()
}

/** Consecutive star days ending today, or yesterday if today has none yet. */
export function streak(data: AppData, today: DateKey): number {
  const stars = new Set(starDays(data))
  let day = stars.has(today) ? today : addDays(today, -1)
  let n = 0
  while (stars.has(day)) {
    n++
    day = addDays(day, -1)
  }
  return n
}

export function allDoneToday(data: AppData, today: DateKey): boolean {
  if (data.things.length === 0) return false
  const done = data.days[today]?.done ?? []
  return data.things.every((t) => done.includes(t.id))
}

/** Yesterday had things to do and none of them was done. */
export function missedYesterday(data: AppData, today: DateKey): boolean {
  const yesterday = addDays(today, -1)
  const existed = data.things.some((t) => t.createdAt < yesterday)
  if (!existed) return false
  return (data.days[yesterday]?.done.length ?? 0) === 0
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

/** Everything a thing has unlocked so far, by its days done. */
export function unlockedFor(
  data: AppData,
  thing: Thing,
  list: readonly { id: string; world: World; line: Line; days: number }[],
): string[] {
  const line = lineFor(data, thing)
  const total = totalDone(data, thing.id)
  return list
    .filter((c) => c.world === thing.world && c.line === line && c.days <= total)
    .map((c) => c.id)
}
