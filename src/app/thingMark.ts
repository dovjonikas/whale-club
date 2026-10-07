import { bubbleSvg, type BubbleState } from '../brand/bubble'
import type { AppData, DateKey, Kind, Thing } from '../store/types'
import { colorAt, lanternColor } from './sceneData'

/** What a thing's small bubble needs: its picture, its name (for a monogram), its kind and its place. */
export interface Marked {
  icon: string
  name: string
  kind: Kind
  order: number
}

/**
 * A thing's small bubble, before its name wherever things are listed (the
 * not-today strip, the collection, the log, a session). Decorative: the
 * name beside it says which thing it is.
 */
export function thingMark(thing: Marked, state: BubbleState = {}): string {
  return bubbleSvg(
    { icon: thing.icon, name: thing.name, color: colorAt(thing.order), kind: thing.kind },
    state,
    { className: 'bubble thing-mark' },
  )
}

/** A thing's bubble as it stood on a day: filled if done, its timer ring for the minutes seen. The postcard paints it. */
export function dayBubble(data: AppData, thing: Thing, date: DateKey): string {
  const day = data.days[date]
  const seen = day?.minutes[thing.id] ?? 0
  return bubbleSvg(
    { icon: thing.icon, name: thing.name, color: lanternColor(thing), kind: thing.kind },
    {
      done: day?.done.includes(thing.id) ?? false,
      progress: thing.kind === 'lockIn' ? seen / thing.minutes : 0,
      manual: day?.manual?.includes(thing.id) ?? false,
    },
  )
}

/** Text for innerHTML: a name typed by a person is never markup. */
export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
