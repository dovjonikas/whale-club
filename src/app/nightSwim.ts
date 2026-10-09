import { hash } from '../scene/random'
import { sleeperSvg } from '../scene/visitors'
import { today as now } from '../store/clock'
import { todayKey } from '../store/dates'
import type { Store } from '../store/store'
import type { AppData, DateKey } from '../store/types'
import { voice } from '../voice'
import { leafCard, leafHtml, onAction } from './leaf'
import type { NoticeBuilder } from './notices'
import type { Moment } from './postcard'

/**
 * The whale's night swim. Each night it goes somewhere real in the sea; on
 * the first open of the next day, before the evening, it is back, and a
 * card says where it went and one true thing about the place. It never
 * depends on anything done, never says it waited, and nothing piles up:
 * a morning not opened is simply not told. Told once a day; "ok" or
 * "send this" puts it away.
 */

/** The whale comes up a moment after the card: never while the app is still starting. */
const BACK_AFTER_MS = 900
/** From this hour the swim is told, until the evening's own card takes over (EVENING_FROM). */
const SWIM_FROM = 5
const SWIM_UNTIL = 18

export interface Swim {
  place: string
  fact: string
}

/** Where the whale went the night before `date`: picked from the date, the same all day. */
export function swimOn(date: DateKey): Swim {
  const places = voice.swim.places
  const [place, fact] = places[hash(`swim|${date}`) % places.length] ?? places[0]
  return { place, fact }
}

/** A night swim is told on a day after the first, in the day's hours, once. */
export function swimDue(data: AppData, today: DateKey, hour: number): boolean {
  if (data.things.length === 0 || data.settings.swimOn === today) return false
  if (hour < SWIM_FROM || hour >= SWIM_UNTIL) return false
  const first = data.things.map((t) => t.createdAt).sort()[0]
  return first !== undefined && first < today
}

/**
 * The card. `onBack` lets the scene show the whale coming up; `force` tells
 * it now whatever the hour ("try it" in what's new).
 */
export function swimNotice(
  store: Store,
  on: { onBack: () => void; onSend: (moment: Moment) => void },
  force: () => boolean = () => false,
): NoticeBuilder {
  return (dismiss) => {
    const data = store.get()
    const today = todayKey()
    if (!force() && !swimDue(data, today, now().getHours())) return null
    if (data.things.length === 0) return null
    const swim = swimOn(today)
    const title = voice.swim.title(swim.place)
    const card = leafCard(voice.swim.label, 'swim-leaf')
    card.innerHTML = leafHtml({
      art: sleeperSvg(true),
      title,
      lead: swim.fact,
      actions: [
        { label: voice.swim.send, name: 'swim-send', kind: 'quiet' },
        { label: voice.swim.ok, name: 'swim-ok', kind: 'soft' },
      ],
    })
    const told = (): void => {
      store.setSettings({ swimOn: today })
      dismiss()
    }
    onAction(card, 'swim-ok', told)
    onAction(card, 'swim-send', () => {
      on.onSend({ kind: 'whale', line: `${title} ${swim.fact}` })
      told()
    })
    window.setTimeout(on.onBack, BACK_AFTER_MS)
    return card
  }
}
