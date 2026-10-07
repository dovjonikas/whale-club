import type { Line } from '../../store/derive'
import type { World } from '../../store/types'
import type { Collectible } from './build'
import { GARDEN } from './garden'
import { SEA } from './sea'
import { SKY } from './sky'

export type { Collectible, Motion } from './build'

/**
 * Every collectible: what it is, when it unlocks, where it lives in the
 * scene and how it is drawn. One list; the scene, the Collection sheet and
 * the silhouettes all read it. Adding one is adding an entry to its world's file, a line
 * in voice.ts under `unlock`, and a row in docs/COLLECTIBLES.md.
 *
 * Drawings are inner SVG for a 100x100 box and use the CSS tokens, so the
 * same markup draws on the card, in the sheet and in the share picture
 * (where the tokens are resolved to hex first).
 */
export const COLLECTIBLES: readonly Collectible[] = [...SEA, ...SKY, ...GARDEN]

/** The collectibles of one thing, in unlock order. */
export function collectiblesFor(world: World, line: Line): Collectible[] {
  return COLLECTIBLES.filter((c) => c.world === world && c.line === line).sort(
    (a, b) => a.days - b.days,
  )
}

export function collectibleSvg(item: Collectible): string {
  return `<svg viewBox="0 0 100 100" aria-hidden="true">${item.draw()}</svg>`
}

/**
 * Finds that are the scene's weather rather than a thing in it: a light
 * over the whole sea, the aurora, the milky way, a ring round the moon.
 * They keep the place they were drawn for and are never arranged.
 */
export const ATMOSPHERE: ReadonlySet<string> = new Set([
  'sea-a-lighthouse',
  'sea-a-song',
  'sea-b-deep',
  'sky-a-moon',
  'sky-a-aurora',
  'sky-a-whale-stars',
  'sky-a-turning',
  'sky-b-milkyway',
  'sky-b-fullmoon',
  'sky-b-meteors',
  'garden-a-fireflies',
  'garden-a-island',
  'garden-b-wind',
])

/**
 * Finds that belong to another and go where it goes: the bees round the
 * sunflower, the cat asleep on the bench. Offsets are fractions of the
 * scene, as they were drawn.
 */
export const COMPANIONS: Readonly<Record<string, { host: string; dx: number; dy: number }>> = {
  'garden-a-bees': { host: 'garden-a-sunflower', dx: 0.04, dy: 0 },
  'garden-b-cat': { host: 'garden-b-bench', dx: 0, dy: 0 },
}
