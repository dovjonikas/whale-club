import { today } from './clock'
import type { DateKey } from './types'

/**
 * When the person's day ends, in hours after midnight: 0, 3 or 5. For
 * someone who works nights or goes to bed late, a done at 01:30 still
 * belongs to the evening before. Set from the settings by the app; every
 * "today" in the app comes through todayKey, so this is the one place.
 */
let dayEndsAt = 0
/** The first day of a week: 1 Monday (the default), 0 Sunday. */
let weekStartsOn: 0 | 1 = 1

export function setDayEndsAt(hours: number): void {
  dayEndsAt = hours === 3 || hours === 5 ? hours : 0
}

export function setWeekStartsOn(day: 0 | 1): void {
  weekStartsOn = day
}

export function firstDayOfWeek(): 0 | 1 {
  return weekStartsOn
}

/** Today on the local clock. The app never thinks in UTC; a day is the person's day. */
export function todayKey(now: Date = today()): DateKey {
  if (now.getHours() >= dayEndsAt) return toKey(now)
  const evening = new Date(now)
  evening.setDate(evening.getDate() - 1)
  return toKey(evening)
}

export function toKey(date: Date): DateKey {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function fromKey(key: DateKey): Date {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y ?? 1970, (m ?? 1) - 1, d ?? 1)
}

export function addDays(key: DateKey, days: number): DateKey {
  const date = fromKey(key)
  date.setDate(date.getDate() + days)
  return toKey(date)
}

/** The last `n` days ending with `today`, oldest first. */
export function lastKeys(today: DateKey, n: number): DateKey[] {
  const keys: DateKey[] = []
  for (let i = n - 1; i >= 0; i--) keys.push(addDays(today, -i))
  return keys
}

/** The first day of the week `key` falls in: a Monday, or a Sunday if the person said so. */
export function weekStart(key: DateKey): DateKey {
  const date = fromKey(key)
  const offset = (date.getDay() - weekStartsOn + 7) % 7
  return addDays(key, -offset)
}

/** The last day of its week: a Sunday, or a Saturday when weeks start on Sunday. */
export function isLastDayOfWeek(key: DateKey): boolean {
  return fromKey(key).getDay() === (weekStartsOn + 6) % 7
}
