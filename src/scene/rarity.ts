import type { DateKey } from '../store/types'
import { hash } from './random'

/**
 * How a find shines. Cosmetic only: nothing in the app's logic reads it.
 * It is picked from the date the find was earned and its id, so the same
 * history always gives the same shine, on every device, and nothing has
 * to be stored for it.
 */
export type Rarity = 'common' | 'rare' | 'legendary'

const LEGENDARY_IN_100 = 3
const RARE_IN_100 = 17

export function rarityOf(collectibleId: string, earnedOn: DateKey | undefined): Rarity {
  if (!earnedOn) return 'common'
  const roll = hash(`${collectibleId}|${earnedOn}`) % 100
  if (roll < LEGENDARY_IN_100) return 'legendary'
  if (roll < LEGENDARY_IN_100 + RARE_IN_100) return 'rare'
  return 'common'
}
