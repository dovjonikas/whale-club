import { bubbleSvg, type BubbleState } from '../brand/bubble'
import type { Kind } from '../store/types'
import { colorAt } from './sceneData'

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

/** Text for innerHTML: a name typed by a person is never markup. */
export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
