/**
 * The app's one clock. Every "today" and every "now" in the app comes from
 * here: the day key, the stars, the moon's phase, the lock-in timer, the
 * recap, the streak. The lab moves it by whole days without touching the
 * device's clock; outside the lab the offset is always zero.
 *
 * Reading `Date.now()` or `new Date()` anywhere else in src is a lint error
 * (no-restricted-syntax in eslint.config.js); this file is the exception.
 */
let offsetDays = 0

/** Moves the clock by whole calendar days. Only the lab calls this. */
export function setOffsetDays(days: number): void {
  offsetDays = Math.trunc(days)
}

/**
 * Milliseconds since the epoch, moved by the offset. Calendar days, not
 * 24-hour blocks, so a jump across a daylight saving change still lands
 * on the same time of day.
 */
export function now(): number {
  const real = Date.now()
  if (offsetDays === 0) return real
  const date = new Date(real)
  date.setDate(date.getDate() + offsetDays)
  return date.getTime()
}

/** The current moment as a Date, on the app's clock. */
export function today(): Date {
  return new Date(now())
}
