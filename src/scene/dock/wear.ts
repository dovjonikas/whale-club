import type { Line, Stage } from '../../store/derive'
import type { World } from '../../store/types'
import { creatureSvg } from '../creatures'
import * as art from './art'

/**
 * What a creature wears, drawn over it. Every creature's face sits at its
 * own point and size in the 64 box (the `face(cx, cy, s)` calls in
 * src/scene/creatures), so a hat, glasses or a scarf can find it on any
 * world, line and stage: the hat above the eyes, the glasses on them, the
 * scarf under the smile. The pieces are the dock's own drawings (100 box),
 * scaled to the face.
 */
const FACES: Record<World, Record<Line, readonly [number, number, number][]>> = {
  sea: {
    a: [
      [32, 34.5, 0.62],
      [41, 33, 0.85],
      [44, 33, 1],
      [47, 31, 1.1],
    ],
    b: [
      [32, 35, 0.6],
      [38, 21, 0.75],
      [54, 32, 0.8],
      [48, 33, 1],
    ],
  },
  sky: {
    a: [
      [32, 34, 0.5],
      [32, 35, 0.85],
      [32, 35, 1],
      [32, 35, 1.15],
    ],
    b: [
      [33, 31.5, 0.42],
      [32, 34, 0.75],
      [32, 34, 1],
      [32, 31, 1.15],
    ],
  },
  garden: {
    a: [
      [32, 38, 0.55],
      [32, 47, 0.65],
      [32, 27, 0.78],
      [32, 26, 0.95],
    ],
    b: [
      [32.5, 38, 0.55],
      [32, 44, 0.62],
      [32, 52, 0.62],
      [32, 28, 1],
    ],
  },
}

/** The worn things, drawn in the order they layer: the scarf under, the hat on top. */
const LAYERS = ['scarf', 'glasses', 'hat'] as const

/** How each piece meets the face: its width across the face, and where its anchor goes. */
const FIT = {
  // The hat's brim (y 70 of its box, 80 wide) rests a little above the eyes.
  hat: { width: 19, anchor: [50, 70], at: [0, -7.2] },
  // The two lenses (36 apart in their box) sit on the two eyes.
  glasses: { width: 5.2, anchor: [50, 52], at: [0, 0] },
  // The scarf's band (72 wide) wraps under the smile.
  scarf: { width: 17, anchor: [50, 50], at: [0, 9.6] },
} as const

/** The pieces a creature wears, as markup in its 64 box; empty when it wears nothing. */
export function wearSvg(world: World, line: Line, stage: Stage, worn: readonly string[]): string {
  const face = FACES[world][line][stage]
  if (!face || worn.length === 0) return ''
  const [cx, cy, s] = face
  return LAYERS.filter((piece) => worn.includes(piece))
    .map((piece) => {
      const fit = FIT[piece]
      const k = (fit.width * s) / (piece === 'glasses' ? 36 : piece === 'hat' ? 80 : 72)
      const x = cx + fit.at[0] * s - fit.anchor[0] * k
      const y = cy + fit.at[1] * s - fit.anchor[1] * k
      return `<g class="worn worn-${piece}" transform="translate(${x.toFixed(2)} ${y.toFixed(2)}) scale(${k.toFixed(4)})">${art[piece]()}</g>`
    })
    .join('')
}

/** A creature with what it wears, as one SVG. */
export function dressedSvg(
  world: World,
  line: Line,
  stage: Stage,
  worn: readonly string[],
): string {
  const creature = creatureSvg(world, line, stage)
  const pieces = wearSvg(world, line, stage, worn)
  return pieces ? creature.replace(/<\/svg>$/, `${pieces}</svg>`) : creature
}
