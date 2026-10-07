import { seeded, hash } from '../scene/random'
import { addDays } from '../store/dates'
import { plannedOn, UNLOCK_DAYS, totalDone } from '../store/derive'
import type { AppData, DateKey, DayRecord, Thing } from '../store/types'
import { EVERY_DAY } from '../store/types'

/**
 * A believable past for the lab: the `days` days before today filled in
 * the way a person actually keeps things. About four planned days in five
 * done, a few days in a row missed somewhere in the middle, and yesterday
 * missed, so the quiet morning shows. Every tier earned except the newest
 * is already cracked, so each thing has one stone waiting and a Collection
 * that is not empty.
 *
 * Deterministic: the same sandbox, the same day and the same length give
 * the same history. Today itself is left alone.
 */
const DONE_SHARE = 0.8

/** What the lab adds when the sandbox has nothing to seed: three plain things. */
const STARTERS: readonly Omit<Thing, 'createdAt'>[] = [
  {
    id: 'lab-run',
    name: 'run',
    emoji: '🏃',
    minutes: 30,
    days: [...EVERY_DAY],
    world: 'sea',
    order: 0,
  },
  {
    id: 'lab-read',
    name: 'read',
    emoji: '📚',
    minutes: 20,
    days: [...EVERY_DAY],
    world: 'sky',
    order: 1,
  },
  {
    id: 'lab-practice',
    name: 'practice',
    emoji: '🌱',
    minutes: 30,
    // Weekdays and Saturday: Sunday off, so a rest dash shows in the dots.
    days: [true, true, true, true, true, true, false],
    world: 'garden',
    order: 2,
  },
]

export function seedHistory(data: AppData, today: DateKey, days: number): AppData {
  const start = addDays(today, -days)
  const things: Thing[] =
    data.things.length > 0
      ? data.things.map((t) => ({ ...t, createdAt: t.createdAt < start ? t.createdAt : start }))
      : STARTERS.map((t) => ({ ...t, days: [...t.days], createdAt: start }))

  const random = seeded(hash(`lab|${today}|${String(days)}`))
  // A gap of three missed days, somewhere around the middle of the range.
  const gapStart = Math.max(3, Math.floor(days * (0.35 + random() * 0.2)))
  const isGap = (back: number): boolean => back === 1 || (back >= gapStart && back < gapStart + 3)

  const next: AppData = { ...data, things, days: { ...data.days }, cracked: { ...data.cracked } }
  for (let back = days; back >= 1; back--) {
    const date = addDays(today, -back)
    const day: DayRecord = { done: [], minutes: {} }
    if (!isGap(back)) {
      for (const thing of things) {
        if (!plannedOn(next, thing, date) || random() >= DONE_SHARE) continue
        day.done.push(thing.id)
        // Every other done thing was a lock-in, for lanterns and minutes in the log.
        if (random() < 0.5) day.minutes[thing.id] = thing.minutes
      }
    }
    next.days[date] = day
  }

  for (const thing of things) {
    const earned = UNLOCK_DAYS.filter((tier) => tier <= totalDone(next, thing.id))
    const keepWaiting = earned[earned.length - 2]
    if (keepWaiting !== undefined && (next.cracked[thing.id] ?? 0) < keepWaiting)
      next.cracked[thing.id] = keepWaiting
  }
  return next
}
