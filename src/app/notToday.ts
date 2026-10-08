import { addDays } from '../store/dates'
import { plannedThings } from '../store/derive'
import { isSoft } from '../store/quiet'
import type { Store } from '../store/store'
import type { AppData, DateKey, Thing } from '../store/types'

/** "it's been heavy" waits at least this long before it is said again. */
const HEAVY_EVERY_DAYS = 7
/** This many "not today"s in a row, today included, before it is said. */
const HEAVY_AFTER_DAYS = 3

/**
 * The one small thing a "not today" day keeps: a tap thing before a
 * lock-in, a short lock-in before a long one, then the row's order. Only
 * what is still to do today counts.
 */
export function smallestThing(data: AppData, today: DateKey): Thing | null {
  const done = new Set(data.days[today]?.done ?? [])
  const left = plannedThings(data, today).filter((t) => !done.has(t.id))
  const effort = (t: Thing): number => (t.kind === 'tap' ? 0 : t.minutes)
  return [...left].sort((a, b) => effort(a) - effort(b) || a.order - b.order)[0] ?? null
}

/**
 * Says "not today" for the day: everything planned and not done goes to
 * the strip but the smallest thing. Returns whether this is the third soft
 * day in a row and "it's been heavy" may be said (once a week at most);
 * when it may, it is marked said.
 */
export function sayNotToday(store: Store, today: DateKey): { heavy: boolean } {
  const data = store.get()
  const keep = smallestThing(data, today)
  store.setNotToday(
    plannedThings(data, today).map((t) => t.id),
    keep?.id ?? null,
    today,
  )
  const after = store.get()
  let run = true
  for (let i = 1; i < HEAVY_AFTER_DAYS; i++) if (!isSoft(after, addDays(today, -i))) run = false
  const last = after.settings.heavySaidOn
  const heavy = run && (last === undefined || last <= addDays(today, -HEAVY_EVERY_DAYS))
  if (heavy) store.setSettings({ heavySaidOn: today })
  return { heavy }
}
