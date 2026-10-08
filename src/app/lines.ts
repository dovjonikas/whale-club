import { seeded } from '../scene/random'
import { fromKey } from '../store/dates'
import type { DateKey } from '../store/types'

/**
 * The line for the day: one short line after the check-in, the same all
 * day, a different one tomorrow. The author's own lines carry no name;
 * the others carry theirs in lowercase, and come only from translations
 * in the public domain (docs/LINES.md says which). The words are the
 * author's choice and are not changed here.
 */
export interface DayLine {
  id: string
  text: string
  /** Who said it, for a line that is not the author's. */
  by?: string
}

export const LINES: readonly DayLine[] = [
  { id: 'it-passes', text: 'it always passes. it has always passed.' },
  { id: 'while-we-can', text: 'one day you might not get to try this. let’s do it while we can.' },
  { id: 'get-up', text: 'even when it looks impossible: i’ll try. i’ll get up.' },
  { id: 'weather', text: 'not feeling it is just weather.' },
  { id: 'never-trying', text: 'worst case isn’t trying and failing. it’s never trying.' },
  { id: 'still-moving', text: 'not perfect. still moving.' },
  { id: 'day-one', text: 'compare day one with today.' },
  { id: 'not-who', text: 'what you do today is not who you are.' },
  { id: 'just-do-it', text: 'it goes best when you just do it, not knowing how.' },
  { id: 'start-light', text: 'start light. stay. it shows.' },
  { id: 'adds-up', text: 'it seems small. it adds up.' },
  { id: 'state-of-mind', text: 'success is a state of mind, waiting for action.' },
  { id: 'next-to-you', text: 'if you get there one day, who do you want next to you?' },
  { id: 'connection', text: 'used to think about success. now more about connection.' },
  { id: 'pawn', text: 'a pawn can become anything if it never stops moving forward.' },
  { id: 'drop-by-drop', text: 'drop by drop the water pot is filled.', by: 'the dhammapada' },
  { id: 'if-not-now', text: 'if not now, when?', by: 'hillel' },
  { id: 'dont-lie', text: 'above all, don’t lie to yourself.', by: 'dostoevsky' },
  {
    id: 'foolish',
    text: 'if you want to improve, be content to be thought foolish and stupid.',
    by: 'epictetus',
  },
  { id: 'seven-eight', text: 'fall seven times, stand up eight.', by: 'japanese proverb' },
]

/** One of the lines, by its id; the list above is the only place a line is written. */
export function lineById(id: string): DayLine {
  const line = LINES.find((l) => l.id === id)
  if (!line) throw new Error(`no line ${id}`)
  return line
}

/** The day the walk starts from, as the daily surprise does. */
const EPOCH = fromKey('2026-01-01').getTime()
const DAY_MS = 86_400_000
/** The order's seed: fixed, so every phone walks the lines in the same order. */
const SEED = 1101

/**
 * The lines in one fixed shuffled order, walked a day at a time: nothing
 * comes back until every line has had its day (the sea facts walk the same
 * way, src/app/surprise.ts).
 */
const ORDER: readonly DayLine[] = (() => {
  const items = [...LINES]
  const random = seeded(SEED)
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    const a = items[i]
    const b = items[j]
    if (a && b) {
      items[i] = b
      items[j] = a
    }
  }
  return items
})()

/**
 * The line for a date. `avoid` holds what a moment of the same day already
 * says (a missed day, a quiet week, a milestone, a new chapter): then the
 * line half a cycle away is shown instead, so the same words are never
 * said twice in a day. That one comes round again on its own day, the
 * only repeat a cycle can have, and only on such a day.
 */
export function dayLine(date: DateKey, avoid: ReadonlySet<string> = new Set()): DayLine {
  const n = ORDER.length
  const day = Math.round((fromKey(date).getTime() - EPOCH) / DAY_MS)
  const at = ((day % n) + n) % n
  const own = ORDER[at] ?? lineById('it-passes')
  if (!avoid.has(own.text)) return own
  for (let k = 0; k < n; k++) {
    const other = ORDER[(at + Math.floor(n / 2) + k) % n]
    if (other && !avoid.has(other.text)) return other
  }
  return own
}
