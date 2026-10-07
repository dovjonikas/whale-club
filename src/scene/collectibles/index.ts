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
