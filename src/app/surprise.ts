import type { VisitorKind } from '../scene/visitors'
import { fromKey } from '../store/dates'
import type { DateKey } from '../store/types'
import { SEA_FACTS } from './facts'

/**
 * The daily surprise: once a day, after the first thing is done, the
 * scene does something it did not do yesterday. Which thing is fixed by
 * the date, and the pool is walked in a shuffled order so nothing repeats
 * until everything has been seen once (the research's novelty point).
 */
export type Surprise =
  { kind: 'fact'; text: string } | { kind: 'visitor'; visitor: VisitorKind } | { kind: 'glow' }

const VISITORS: readonly VisitorKind[] = ['fish', 'jelly', 'meteor', 'turtle', 'firefly']
const EPOCH = fromKey('2026-01-01').getTime()

function pool(): Surprise[] {
  const items: Surprise[] = SEA_FACTS.map((text) => ({ kind: 'fact', text }))
  for (let round = 0; round < 3; round++) {
    for (const visitor of VISITORS) items.push({ kind: 'visitor', visitor })
    items.push({ kind: 'glow' })
  }
  return shuffle(items, 2026)
}

const ORDER = pool()

export function surpriseFor(date: DateKey): Surprise {
  const day = Math.round((fromKey(date).getTime() - EPOCH) / 86_400_000)
  const index = ((day % ORDER.length) + ORDER.length) % ORDER.length
  const item = ORDER[index]
  if (!item) throw new Error('empty surprise pool')
  return item
}

/** Fisher-Yates with a fixed seed, so the order is the same on every device. */
function shuffle<T>(items: T[], seed: number): T[] {
  let a = seed >>> 0
  const random = (): number => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    const x = items[i]
    const y = items[j]
    if (x !== undefined && y !== undefined) {
      items[i] = y
      items[j] = x
    }
  }
  return items
}
