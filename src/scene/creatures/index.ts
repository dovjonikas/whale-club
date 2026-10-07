import type { Line, Stage } from '../../store/derive'
import type { World } from '../../store/types'
import { GARDEN_A, GARDEN_B } from './garden'
import { kit, orb, halo, face, svg } from './kit'
import { SEA_A, SEA_B } from './sea'
import { SKY_A, SKY_B } from './sky'

/**
 * The creatures: one per thing, drawn as inline SVG in a 64x64 box. Each
 * world has two lines of four stages (docs/COLLECTIBLES.md). Every stage
 * has a face, because a speck with eyes is already somebody.
 *
 * Drawn like an illustration rather than an icon: a body shaded lighter on
 * top and darker underneath, a pale belly or rim where the light catches,
 * blush on the cheeks, eyes with catchlights, and at the last stage a small
 * thing of its own (the whale's spout, the star's twinkles, the
 * sunflower's bee). Gradients are defined per drawing with ids made unique
 * by a counter, because several copies of one creature share a page and a
 * duplicate id makes the browser resolve every copy to the first.
 */
const DRAWINGS: Record<World, Record<Line, Record<Stage, () => string>>> = {
  sea: { a: SEA_A, b: SEA_B },
  sky: { a: SKY_A, b: SKY_B },
  garden: { a: GARDEN_A, b: GARDEN_B },
}

export function creatureSvg(world: World, line: Line, stage: Stage): string {
  return DRAWINGS[world][line][stage]()
}

/**
 * What a lock-in starts from, before the creature has a shape: an egg in
 * the sea, a spark in the sky, a seed in the garden. It already has eyes.
 */
export function beginningSvg(world: World): string {
  const k = kit()
  if (world === 'sea') {
    return svg(
      k,
      `${halo(k, '#3ef2e0', 22)}
      <ellipse cx="32" cy="35" rx="11.5" ry="13.5" fill="${orb(k, 'e', '#ffffff', '#d8f6f1', '#9fd9d2')}"/>
      <ellipse cx="27.5" cy="29" rx="3" ry="4.4" fill="#fff" opacity="0.8"/>
      <path d="M24 40 q 2 -2 4 0 q 2 2 4 0 q 2 -2 4 0 q 2 2 4 0" stroke="#7ad3c8" stroke-width="1" fill="none" opacity="0.6"/>
      ${face(32, 35, 0.62, 0)}`,
    )
  }
  if (world === 'sky') return SKY_A[0]()
  return svg(
    k,
    `${halo(k, '#f2c94c', 20)}
    <ellipse cx="32" cy="37" rx="8" ry="10.5" fill="${orb(k, 's', '#d6a774', '#a8743f', '#6d4625')}" transform="rotate(-16 32 37)"/>
    <path d="M30 27.5 q 2 -4 5.5 -5" stroke="#5fbf4a" stroke-width="1.8" fill="none" stroke-linecap="round"/>
    ${face(32, 38, 0.55, 0)}`,
  )
}
