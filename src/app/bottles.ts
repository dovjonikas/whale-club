import { seasonOf } from '../scene/calendar'
import { hash } from '../scene/random'
import { addDays, fromKey, todayKey } from '../store/dates'
import { isSoft } from '../store/quiet'
import type { Store } from '../store/store'
import type { AppData, DateKey } from '../store/types'
import { voice } from '../voice'
import { openSheet } from './sheet'
import { escapeHtml } from './thingMark'

/**
 * Bottles: the evening's good things, coming back. On a "not today" day,
 * or once a week when there are five or more to choose from, a bottle
 * washes up at the water's edge; a tap opens it, with no date and no
 * number, only "a while ago" or the season it was. One a day at most, and
 * the same line not again within a month. No lines, no bottle.
 */
export interface Bottle {
  writtenOn: DateKey
  text: string
}

/** A line comes back only once it is this old: "a while ago" has to be true. */
const OLD_ENOUGH_DAYS = 7
/** The same line waits this long before it may come back again. */
const AGAIN_AFTER_DAYS = 30
/** With this many lines written, a bottle comes once a week even without a soft day. */
const WEEKLY_FROM = 5
const WEEK_DAYS = 7
/** Older than this, and from another season, it is "back in spring" rather than "a while ago". */
const SEASON_AFTER_DAYS = 60

export function bottleFor(data: AppData, today: DateKey): Bottle | null {
  const { bottleOn, bottles = {} } = data.settings
  if (bottleOn === today) return null
  const written = Object.entries(data.days)
    .filter(([date, day]) => date < today && day.good)
    .map(([date, day]) => ({ writtenOn: date, text: day.good ?? '' }))
  if (written.length === 0) return null
  const weekly =
    written.length >= WEEKLY_FROM &&
    (bottleOn === undefined || bottleOn <= addDays(today, -WEEK_DAYS))
  if (!isSoft(data, today) && !weekly) return null
  const ready = written.filter(({ writtenOn }) => {
    if (writtenOn > addDays(today, -OLD_ENOUGH_DAYS)) return false
    const back = bottles[writtenOn]
    return back === undefined || back <= addDays(today, -AGAIN_AFTER_DAYS)
  })
  if (ready.length === 0) return null
  ready.sort((a, b) => a.writtenOn.localeCompare(b.writtenOn))
  return ready[hash(today) % ready.length] ?? null
}

/** "a while ago", or "back in spring" for a line from another season, long enough ago. */
export function whenWritten(writtenOn: DateKey, today: DateKey, data: AppData): string {
  const hemisphere = data.settings.hemisphere ?? 'north'
  const then = seasonOf(fromKey(writtenOn), hemisphere)
  const long = writtenOn <= addDays(today, -SEASON_AFTER_DAYS)
  return long && then !== seasonOf(fromKey(today), hemisphere)
    ? voice.bottle.season(then)
    : voice.bottle.awhile
}

/** Opens the bottle: the line as it was written, and it is kept as come back today. */
export function openBottle(store: Store, bottle: Bottle): void {
  const today = todayKey()
  const when = whenWritten(bottle.writtenOn, today, store.get())
  store.openBottle(bottle.writtenOn, today)
  openSheet({
    title: voice.bottle.title,
    build(body, close) {
      body.innerHTML = `
        <p class="sheet-note">${voice.bottle.wrote(when)}</p>
        <p class="bottle-note">${escapeHtml(bottle.text)}</p>
        <button type="button" class="button-primary bottle-keep">${voice.bottle.keep}</button>`
      body.querySelector('.bottle-keep')?.addEventListener('click', close)
    },
  })
}
