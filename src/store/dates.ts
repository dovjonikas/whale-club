import type { DateKey } from './types'

/** Today on the local clock. The app never thinks in UTC; a day is the person's day. */
export function todayKey(now: Date = new Date()): DateKey {
  return toKey(now)
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

/** The Monday of the week `key` falls in. Weeks start on Monday here. */
export function weekStart(key: DateKey): DateKey {
  const date = fromKey(key)
  const offset = (date.getDay() + 6) % 7
  return addDays(key, -offset)
}

export function isSunday(key: DateKey): boolean {
  return fromKey(key).getDay() === 0
}
