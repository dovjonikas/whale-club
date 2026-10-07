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
/** Of the lock-ins finished, the share that took more than one sitting: a softer lantern. */
const IN_PARTS_SHARE = 0.15
/** Of the lock-ins not finished, the share with some minutes all the same: a dim lantern. */
const UNFINISHED_SHARE = 0.4

/** What the lab adds when the sandbox has nothing to seed: three plain things, both kinds. */
const STARTERS: readonly Omit<Thing, 'createdAt'>[] = [
  {
    id: 'lab-run',
    name: 'run',
    icon: 'run',
    kind: 'tap',
    minutes: 15,
    days: [...EVERY_DAY],
    world: 'sea',
    line: 'a',
    order: 0,
  },
  {
    id: 'lab-read',
    name: 'read',
    icon: 'read',
    kind: 'lockIn',
    minutes: 20,
    days: [...EVERY_DAY],
    world: 'sky',
    line: 'a',
    order: 1,
  },
  {
    id: 'lab-practice',
    name: 'practice',
    icon: 'music',
    kind: 'lockIn',
    minutes: 30,
    // Weekdays and Saturday: Sunday off, so a rest dash shows in the dots.
    days: [true, true, true, true, true, true, false],
    world: 'garden',
    line: 'a',
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
        if (!plannedOn(next, thing, date)) continue
        const done = random() < DONE_SHARE
        if (thing.kind === 'tap') {
          if (done) day.done.push(thing.id)
          continue
        }
        if (done) {
          // A lock-in is done when the timer saw its whole length: a lantern for it.
          day.done.push(thing.id)
          day.minutes[thing.id] = thing.minutes
          const parts = random() < IN_PARTS_SHARE ? 2 : 1
          const record =
            parts > 1
              ? { thing: thing.id, minutes: thing.minutes, parts }
              : { thing: thing.id, minutes: thing.minutes }
          ;(day.sessions ??= []).push(record)
        } else if (random() < UNFINISHED_SHARE) {
          // Some minutes, not the length: the day keeps them as a dim lantern.
          day.minutes[thing.id] = Math.max(1, Math.round(thing.minutes * (0.2 + random() * 0.6)))
        }
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
