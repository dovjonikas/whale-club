import { fromKey } from './dates'
import type { AppData, DateKey, Thing } from './types'

/** Monday is 0, Sunday 6. */
export function weekday(date: DateKey): number {
  return (fromKey(date).getDay() + 6) % 7
}

/**
 * Whether a thing is planned on a date: its weekday, unless that one day
 * was changed by "also today" or "not today". A day it is not planned on
 * is never a missed day.
 */
export function plannedOn(data: AppData, thing: Thing, date: DateKey): boolean {
  const day = data.days[date]
  if (day?.skip?.includes(thing.id)) return false
  if (day?.extra?.includes(thing.id)) return true
  return thing.days[weekday(date)] ?? true
}
