import { addDays, weekStart } from './dates'
import { plannedOn } from './plan'
import type { AppData, DateKey, Thing } from './types'

/**
 * Quiet days: every thing has a little freedom each week, given in
 * advance. One day off if it is planned four days a week or fewer, two if
 * five to seven. A planned day missed inside that freedom is a quiet day:
 * a small moon in the week's dots and in the log, never an empty dot, and
 * it breaks no streak. Past the freedom a missed day is an empty dot and
 * nothing more. There is nothing to set: the week (from its first day, as
 * set) spends its freedom on its first misses.
 *
 * A day the person called "not today" is quiet whatever it holds: a miss on
 * it is a moon, and it spends none of the week's freedom.
 */

/** Planned this many days a week or fewer: one quiet day; more: two. */
const FEW_DAYS = 4

export function quietAllowance(thing: Thing): number {
  const planned = thing.days.filter(Boolean).length
  return planned <= FEW_DAYS ? 1 : 2
}

/** A planned day for this thing that went by with it not done (today is never missed yet). */
function missedOn(data: AppData, thing: Thing, date: DateKey, today: DateKey): boolean {
  if (date >= today || date < thing.createdAt) return false
  return plannedOn(data, thing, date) && !(data.days[date]?.done.includes(thing.id) ?? false)
}

/** A day the person called "not today". */
export function isSoft(data: AppData, date: DateKey): boolean {
  return data.days[date]?.notToday === true
}

/** A missed day inside the week's freedom, or on a soft day: a moon, not an empty dot. */
export function isQuiet(data: AppData, thing: Thing, date: DateKey, today: DateKey): boolean {
  if (!missedOn(data, thing, date, today)) return false
  if (isSoft(data, date)) return true
  const start = weekStart(date)
  let misses = 0
  for (let i = 0; i < 7; i++) {
    const day = addDays(start, i)
    if (day > date) break
    if (!isSoft(data, day) && missedOn(data, thing, day, today)) misses++
  }
  return misses <= quietAllowance(thing)
}

/** A day where everything missed was a quiet day: it neither counts nor breaks. */
export function allQuiet(
  data: AppData,
  things: readonly Thing[],
  date: DateKey,
  today: DateKey,
): boolean {
  const missed = things.filter((t) => missedOn(data, t, date, today))
  return missed.length > 0 && missed.every((t) => isQuiet(data, t, date, today))
}
