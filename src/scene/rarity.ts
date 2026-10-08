import type { DateKey } from '../store/types'
import { hash } from './random'

/**
 * How a find shines. Until 0.14 it was picked from the date a find was
 * earned and its id: luck, not earning. Now rarity is earned on the path
 * to a legendary (src/store/paths.ts): a rare find half way, a legendary
 * at the end, and every per-thing find is common. Finds reached before the
 * change keep the shine the date gave them, so the migration takes nothing
 * away; nothing has to be stored for it.
 */
export type Rarity = 'common' | 'rare' | 'legendary'

const LEGENDARY_IN_100 = 3
const RARE_IN_100 = 17
/** The first day rarity was earned instead of drawn (v0.14.0). */
export const EARNED_FROM = '2026-10-09'

export function rarityOf(collectibleId: string, earnedOn: DateKey | undefined): Rarity {
  if (!earnedOn || earnedOn >= EARNED_FROM) return 'common'
  const roll = hash(`${collectibleId}|${earnedOn}`) % 100
  if (roll < LEGENDARY_IN_100) return 'legendary'
  if (roll < LEGENDARY_IN_100 + RARE_IN_100) return 'rare'
  return 'common'
}
