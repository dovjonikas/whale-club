import type { Line } from '../store/derive'
import type { World } from '../store/types'
import * as art from './art'
import * as later from './art2'
import { dots, face, fish, jacket, jelly, star5, stem, sunflower } from './draw'

/**
 * Every collectible: what it is, when it unlocks, where it lives in the
 * scene and how it is drawn. One list; the scene, the Collection sheet and
 * the silhouettes all read it. Adding one is adding an entry here, a line
 * in voice.ts under `unlock`, and a row in docs/COLLECTIBLES.md.
 *
 * Drawings are inner SVG for a 100x100 box and use the CSS tokens, so the
 * same markup draws on the card, in the sheet and in the share picture
 * (where the tokens are resolved to hex first).
 */
export type Motion = 'none' | 'drift' | 'swim' | 'sway' | 'twinkle' | 'sweep'

export interface Collectible {
  id: string
  world: World
  line: Line
  days: number
  name: string
  /** One short line for the Collection sheet. */
  hint: string
  /** Where it sits in the scene, as fractions of width and height. */
  x: number
  y: number
  /** Width in px on a 390px-wide phone; scaled with the viewport. */
  size: number
  motion: Motion
  /** Only out after dark (21:00 to 05:00 on the local clock). */
  night?: boolean
  draw: () => string
}

const sea = (
  line: Line,
  days: number,
  id: string,
  name: string,
  hint: string,
  x: number,
  y: number,
  size: number,
  motion: Motion,
  draw: () => string,
  night?: boolean,
): Collectible => ({
  id,
  world: 'sea',
  line,
  days,
  name,
  hint,
  x,
  y,
  size,
  motion,
  draw,
  ...(night ? { night } : {}),
})

const sky = (
  line: Line,
  days: number,
  id: string,
  name: string,
  hint: string,
  x: number,
  y: number,
  size: number,
  motion: Motion,
  draw: () => string,
): Collectible => ({ id, world: 'sky', line, days, name, hint, x, y, size, motion, draw })

const garden = (
  line: Line,
  days: number,
  id: string,
  name: string,
  hint: string,
  x: number,
  size: number,
  motion: Motion,
  draw: () => string,
  night?: boolean,
): Collectible => ({
  id,
  world: 'garden',
  line,
  days,
  name,
  hint,
  x,
  y: 0.592,
  size,
  motion,
  draw,
  ...(night ? { night } : {}),
})

export const COLLECTIBLES: readonly Collectible[] = [
  // SEA, line A
  sea(
    'a',
    3,
    'sea-a-plankton',
    'plankton glow',
    'a few cyan dots, drifting',
    0.15,
    0.641,
    50,
    'drift',
    () =>
      dots(
        [
          [20, 30, 2],
          [40, 55, 1.6],
          [62, 25, 2.4],
          [75, 60, 1.4],
          [50, 80, 2],
          [30, 70, 1.2],
        ],
        'var(--glow)',
      ),
  ),
  sea('a', 7, 'sea-a-fish', 'a fish', 'the first company', 0.3, 0.666, 32, 'swim', () =>
    fish(50, 50, 50, 'var(--teal)'),
  ),
  sea(
    'a',
    14,
    'sea-a-school',
    'a school of fish',
    'six, turning together',
    0.55,
    0.649,
    70,
    'swim',
    () =>
      [
        [20, 30],
        [45, 22],
        [70, 32],
        [30, 55],
        [55, 50],
        [80, 60],
      ]
        .map(([x, y]) => fish(x ?? 0, y ?? 0, 20, 'var(--glow)'))
        .join(''),
  ),
  sea(
    'a',
    21,
    'sea-a-anchor',
    'an anchor',
    'half buried; somebody stayed',
    0.1,
    0.68,
    28,
    'none',
    art.anchor,
  ),
  sea(
    'a',
    30,
    'sea-a-jelly',
    'a jellyfish at night',
    'only out after dark',
    0.8,
    0.666,
    36,
    'drift',
    () => jelly(50, 40, 50, 'var(--glow)'),
    true,
  ),
  sea(
    'a',
    45,
    'sea-a-dolphin',
    'a dolphin',
    'jumps when you tap',
    0.62,
    0.629,
    56,
    'swim',
    later.dolphin,
  ),
  sea(
    'a',
    60,
    'sea-a-lighthouse',
    'a lighthouse',
    'a beam over the water',
    0.92,
    0.55,
    40,
    'sweep',
    later.lighthouse,
  ),
  sea(
    'a',
    90,
    'sea-a-jacket',
    'the red jacket',
    'the whale wears it now',
    0.45,
    0.678,
    36,
    'none',
    () => jacket(50, 40, 50),
  ),
  sea(
    'a',
    120,
    'sea-a-calf',
    'a whale calf',
    'follows the whale',
    0.38,
    0.633,
    40,
    'swim',
    later.calf,
  ),
  sea(
    'a',
    180,
    'sea-a-song',
    'the whale sings',
    'a pulse of light across the sea',
    0.5,
    0.657,
    160,
    'twinkle',
    () =>
      [20, 35, 50]
        .map(
          (r) =>
            `<circle cx="50" cy="50" r="${r}" stroke="var(--glow)" stroke-width="1" fill="none" opacity="${0.6 - r / 100}"/>`,
        )
        .join(''),
  ),
  // SEA, line B
  sea(
    'b',
    3,
    'sea-b-pool',
    'a tide pool',
    'a ring of light at the water line',
    0.84,
    0.6,
    44,
    'twinkle',
    () =>
      dots(
        [
          [15, 50, 2],
          [30, 38, 1.5],
          [50, 34, 2],
          [70, 38, 1.5],
          [85, 50, 2],
          [70, 62, 1.5],
          [50, 66, 2],
          [30, 62, 1.5],
        ],
        'var(--glow)',
      ),
  ),
  sea(
    'b',
    7,
    'sea-b-seahorse',
    'a seahorse',
    'holding on to a weed',
    0.72,
    0.68,
    28,
    'sway',
    art.seahorse,
  ),
  sea('b', 14, 'sea-b-crab', 'a crab', 'walking the floor', 0.25, 0.682, 28, 'sway', art.crab),
  sea(
    'b',
    21,
    'sea-b-turtle',
    'a sea turtle',
    'drifting past, slowly',
    0.42,
    0.649,
    44,
    'swim',
    art.turtle,
  ),
  sea(
    'b',
    30,
    'sea-b-jellies',
    'a pair of jellyfish',
    'two, after dark',
    0.14,
    0.666,
    48,
    'drift',
    () => `${jelly(30, 40, 34, 'var(--star)')}${jelly(68, 55, 28, 'var(--glow)')}`,
    true,
  ),
  sea(
    'b',
    45,
    'sea-b-manta',
    'a manta ray',
    'gliding under everything',
    0.65,
    0.68,
    90,
    'swim',
    later.manta,
  ),
  sea(
    'b',
    60,
    'sea-b-octopus',
    'an octopus',
    'in a cave at the bottom',
    0.9,
    0.682,
    40,
    'sway',
    later.octopus,
  ),
  sea(
    'b',
    90,
    'sea-b-ship',
    'a sunken ship',
    'with its own glow',
    0.3,
    0.684,
    70,
    'none',
    later.ship,
  ),
  sea(
    'b',
    120,
    'sea-b-narwhal',
    'a narwhal',
    'because why not',
    0.2,
    0.633,
    52,
    'swim',
    later.narwhal,
  ),
  sea(
    'b',
    180,
    'sea-b-deep',
    'the deep opens',
    'a second layer, with its own lights',
    0.5,
    0.686,
    200,
    'twinkle',
    () =>
      `<path d="M0 40 Q 50 10, 100 40 V 100 H 0 Z" fill="#010205"/>${dots(
        [
          [10, 70, 1.5],
          [25, 85, 1],
          [40, 60, 2],
          [60, 90, 1.5],
          [75, 65, 1],
          [90, 80, 2],
        ],
        'var(--jacket)',
      )}`,
  ),
  // SKY, line A
  sky(
    'a',
    3,
    'sky-a-first',
    'the first star',
    'brighter than a day-star',
    0.15,
    0.22,
    24,
    'twinkle',
    () => star5(50, 50, 30, 'var(--star-pale)'),
  ),
  sky(
    'a',
    7,
    'sky-a-constellation',
    'seven stars',
    'your own constellation',
    0.72,
    0.18,
    90,
    'twinkle',
    () => {
      const p: [number, number][] = [
        [10, 60],
        [25, 40],
        [40, 48],
        [55, 30],
        [68, 44],
        [82, 32],
        [92, 50],
      ]
      return `<polyline points="${p.map(([x, y]) => `${x} ${y}`).join(' ')}" stroke="var(--star)" stroke-width="1" fill="none" opacity="0.6"/>${dots(
        p.map(([x, y]) => [x, y, 2.2]),
        'var(--star)',
      )}`
    },
  ),
  sky(
    'a',
    14,
    'sky-a-moon',
    'a moon ring',
    'a halo around the moon, ice high up',
    0.843,
    0.123,
    100,
    'twinkle',
    () =>
      `<circle cx="50" cy="50" r="40" fill="none" stroke="var(--star-pale)" stroke-width="2.5" opacity="0.35"/><circle cx="50" cy="50" r="44" fill="none" stroke="var(--glow)" stroke-width="1" opacity="0.2"/>`,
  ),
  sky(
    'a',
    21,
    'sky-a-shooting',
    'a shooting star',
    'once a session',
    0.45,
    0.14,
    70,
    'none',
    () =>
      `<path d="M5 60 L 80 20" stroke="var(--star-pale)" stroke-width="2" stroke-linecap="round" opacity="0.7"/>${star5(84, 18, 10, 'var(--star-pale)')}`,
  ),
  sky(
    'a',
    30,
    'sky-a-comet',
    'a comet',
    'with a tail that stays',
    0.3,
    0.3,
    90,
    'drift',
    () =>
      `<path d="M0 70 Q 50 60, 86 30" stroke="var(--glow)" stroke-width="6" stroke-linecap="round" opacity="0.35"/><path d="M10 72 Q 50 64, 86 30" stroke="var(--star-pale)" stroke-width="2" stroke-linecap="round" opacity="0.6"/><circle cx="88" cy="28" r="7" fill="var(--star-pale)"/>`,
  ),
  sky(
    'a',
    45,
    'sky-a-aurora',
    'the aurora',
    'a slow curtain near the horizon',
    0.5,
    0.42,
    300,
    'sway',
    () =>
      `<path d="M0 60 Q 20 20, 40 50 T 80 40 T 100 55 V 100 H 0 Z" fill="var(--leaf)" opacity="0.18"/><path d="M0 70 Q 25 35, 50 60 T 100 50 V 100 H 0 Z" fill="var(--glow)" opacity="0.14"/>`,
  ),
  sky(
    'a',
    60,
    'sky-a-plane',
    'a paper airplane',
    'a bit silly on purpose',
    0.6,
    0.26,
    44,
    'drift',
    later.plane,
  ),
  sky(
    'a',
    90,
    'sky-a-astronaut',
    'an astronaut',
    'in the red jacket over the suit',
    0.15,
    0.4,
    48,
    'drift',
    later.astronaut,
  ),
  sky(
    'a',
    120,
    'sky-a-whale-stars',
    'a whale in stars',
    'a second constellation',
    0.5,
    0.34,
    120,
    'twinkle',
    () => {
      const p: [number, number][] = [
        [10, 55],
        [25, 42],
        [45, 36],
        [65, 40],
        [85, 52],
        [78, 66],
        [55, 70],
        [30, 66],
        [95, 42],
        [92, 64],
      ]
      return `<polyline points="${p
        .slice(0, 8)
        .map(([x, y]) => `${x} ${y}`)
        .join(
          ' ',
        )} 10 55" stroke="var(--star)" stroke-width="1" fill="none" opacity="0.6"/><polyline points="85 52 95 42 M85 52 92 64" stroke="var(--star)" stroke-width="1" fill="none" opacity="0.6"/>${dots(
        p.map(([x, y]) => [x, y, 2]),
        'var(--star)',
      )}`
    },
  ),
  sky(
    'a',
    180,
    'sky-a-turning',
    'the turning sky',
    'the stars circle the pole star',
    0.5,
    0.25,
    260,
    'sweep',
    () =>
      `${[20, 30, 40].map((r) => `<circle cx="50" cy="50" r="${r}" stroke="var(--star)" stroke-width="0.6" fill="none" opacity="0.3" stroke-dasharray="2 6"/>`).join('')}${star5(50, 50, 4, 'var(--star-pale)')}`,
  ),
  // SKY, line B
  sky(
    'b',
    3,
    'sky-b-satellite',
    'a satellite',
    'crossing, once a minute',
    0.3,
    0.33,
    30,
    'drift',
    art.satellite,
  ),
  sky(
    'b',
    7,
    'sky-b-planet',
    'a planet',
    'low near the horizon',
    0.08,
    0.5,
    30,
    'none',
    art.planet,
  ),
  sky(
    'b',
    14,
    'sky-b-moon2',
    'a second moon',
    'this sky allows it',
    0.68,
    0.36,
    22,
    'none',
    art.smallMoon,
  ),
  sky(
    'b',
    21,
    'sky-b-milkyway',
    'the milky way',
    'a faint band',
    0.5,
    0.3,
    400,
    'none',
    () =>
      `<path d="M0 70 Q 50 20, 100 40 V 55 Q 50 40, 0 85 Z" fill="var(--star-pale)" opacity="0.07"/>${dots(
        [
          [10, 72, 0.8],
          [30, 50, 0.6],
          [50, 36, 0.8],
          [70, 34, 0.6],
          [90, 40, 0.8],
          [40, 44, 0.5],
          [60, 38, 0.5],
        ],
        'var(--star-pale)',
      )}`,
  ),
  sky(
    'b',
    30,
    'sky-b-fullmoon',
    'moonlight on the water',
    'a path of light under the moon',
    0.843,
    0.64,
    60,
    'twinkle',
    () =>
      [8, 22, 36, 50, 64, 78]
        .map(
          (y, i) =>
            `<rect x="${String(50 - (6 + i * 4))}" y="${String(y)}" width="${String(12 + i * 8)}" height="3" rx="1.5" fill="var(--star-pale)" opacity="${(0.55 - i * 0.07).toFixed(2)}"/>`,
        )
        .join(''),
  ),
  sky(
    'b',
    45,
    'sky-b-meteors',
    'a meteor shower',
    'one a day after the first night',
    0.4,
    0.2,
    120,
    'twinkle',
    () =>
      [
        [10, 20],
        [40, 10],
        [70, 25],
        [25, 50],
        [60, 55],
      ]
        .map(
          ([x, y]) =>
            `<path d="M${x} ${y} l 22 14" stroke="var(--star-pale)" stroke-width="1.5" stroke-linecap="round" opacity="0.6"/>`,
        )
        .join(''),
  ),
  sky(
    'b',
    60,
    'sky-b-owl',
    'an owl',
    'on the horizon, blinking',
    0.94,
    0.55,
    30,
    'none',
    later.owl,
  ),
  sky(
    'b',
    90,
    'sky-b-balloon',
    'a balloon',
    'the red jacket is the basket',
    0.33,
    0.12,
    50,
    'drift',
    later.balloon,
  ),
  sky('b', 120, 'sky-b-kite', 'a kite', 'up even at night', 0.62, 0.44, 40, 'sway', later.kite),
  sky(
    'b',
    180,
    'sky-b-eclipse',
    'an eclipse',
    'two seconds, once a week',
    0.82,
    0.32,
    44,
    'none',
    () =>
      `<circle cx="50" cy="50" r="24" fill="var(--star-pale)"/><circle cx="52" cy="50" r="23" fill="var(--zenith)"/><circle cx="50" cy="50" r="27" stroke="var(--star-pale)" stroke-width="1" fill="none" opacity="0.5"/>`,
  ),
  // GARDEN, line A
  garden('a', 3, 'garden-a-sprout', 'a sprout', 'on the shore', 0.12, 14, 'sway', art.sprout),
  garden(
    'a',
    7,
    'garden-a-sunflower',
    'a sunflower',
    'one',
    0.2,
    22,
    'sway',
    () => `${stem(50, 40, 95)}${sunflower(50, 36, 26)}`,
  ),
  garden('a', 14, 'garden-a-bees', 'bees', 'around the sunflower', 0.24, 18, 'drift', art.bees),
  garden('a', 21, 'garden-a-field', 'a field', 'sunflowers along the shore', 0.36, 60, 'sway', () =>
    [10, 28, 46, 64, 82]
      .map((x, i) => `${stem(x, 50 + (i % 2) * 10, 95)}${sunflower(x, 46 + (i % 2) * 10, 12)}`)
      .join(''),
  ),
  garden(
    'a',
    30,
    'garden-a-scarecrow',
    'a scarecrow',
    'in the red jacket',
    0.55,
    26,
    'none',
    () =>
      `<path d="M50 95 V 30 M28 48 H 72" stroke="#6b4a2b" stroke-width="4" stroke-linecap="round"/><circle cx="50" cy="22" r="11" fill="var(--sand)"/><path d="M36 18 h 28 l -4 -8 h -20 z" fill="#6b4a2b"/>${jacket(50, 42, 30)}${face(50, 22, 0.7)}`,
  ),
  garden(
    'a',
    45,
    'garden-a-butterfly',
    'a butterfly',
    'lands on the creature when tapped',
    0.64,
    16,
    'drift',
    later.butterfly,
  ),
  garden(
    'a',
    60,
    'garden-a-greenhouse',
    'a greenhouse',
    'glowing after dark',
    0.76,
    30,
    'none',
    later.greenhouse,
  ),
  garden(
    'a',
    90,
    'garden-a-tree',
    'a tree',
    'tall enough for a swing',
    0.88,
    44,
    'sway',
    later.tree,
  ),
  garden(
    'a',
    120,
    'garden-a-fireflies',
    'fireflies',
    'over the garden at night',
    0.5,
    160,
    'twinkle',
    () =>
      dots(
        [
          [10, 40, 1.5],
          [25, 20, 1.2],
          [40, 50, 1.6],
          [55, 15, 1.2],
          [70, 45, 1.5],
          [85, 25, 1.3],
          [95, 55, 1.2],
        ],
        'var(--sun)',
      ),
    true,
  ),
  garden(
    'a',
    180,
    'garden-a-island',
    'an island',
    'a second shore across the water',
    0.5,
    120,
    'none',
    () =>
      `<path d="M0 70 Q 50 40, 100 70 V 80 H 0 Z" fill="var(--sand)" opacity="0.8"/><path d="M50 55 V 30 M50 32 q -16 -4 -22 -14 M50 32 q 16 -4 22 -14 M50 34 q -8 -14 -2 -24" stroke="var(--leaf)" stroke-width="3" stroke-linecap="round" fill="none"/>`,
  ),
  // GARDEN, line B
  garden(
    'b',
    3,
    'garden-b-mushroom',
    'a mushroom',
    'small, glowing at night',
    0.3,
    12,
    'none',
    art.mushroom,
  ),
  garden('b', 7, 'garden-b-roses', 'a rose bush', 'red, of course', 0.44, 22, 'sway', art.roses),
  garden('b', 14, 'garden-b-snail', 'a snail', 'going somewhere', 0.08, 14, 'drift', art.snail),
  garden(
    'b',
    21,
    'garden-b-path',
    'a garden path',
    'stones, to nowhere in particular',
    0.68,
    60,
    'none',
    () =>
      [10, 30, 50, 70, 90]
        .map((x, i) => `<ellipse cx="${x}" cy="${80 - (i % 2) * 6}" rx="9" ry="4" fill="#8f98a3"/>`)
        .join(''),
  ),
  garden('b', 30, 'garden-b-bench', 'a bench', 'facing the sea', 0.8, 28, 'none', later.bench),
  garden(
    'b',
    45,
    'garden-b-rabbit',
    'a rabbit',
    'peeks out of the grass',
    0.16,
    16,
    'none',
    later.rabbit,
  ),
  garden('b', 60, 'garden-b-lantern', 'a lantern', 'lit at night', 0.92, 18, 'none', later.lantern),
  garden('b', 90, 'garden-b-cat', 'a cat', 'asleep on the bench', 0.8, 20, 'none', later.cat),
  garden(
    'b',
    120,
    'garden-b-wind',
    'wind',
    'the whole garden sways together',
    0.5,
    90,
    'sway',
    () =>
      `<path d="M5 30 q 20 -12 40 0 t 40 0 M5 55 q 20 -12 40 0 t 40 0" stroke="#e8f0f5" stroke-width="1.5" fill="none" stroke-linecap="round" opacity="0.35"/>`,
  ),
  garden(
    'b',
    180,
    'garden-b-treehouse',
    'a treehouse',
    'with a window that lights up',
    0.88,
    28,
    'none',
    later.treehouse,
    true,
  ),
]

/** The collectibles of one thing, in unlock order. */
export function collectiblesFor(world: World, line: Line): Collectible[] {
  return COLLECTIBLES.filter((c) => c.world === world && c.line === line).sort(
    (a, b) => a.days - b.days,
  )
}

export function collectibleSvg(item: Collectible): string {
  return `<svg viewBox="0 0 100 100" aria-hidden="true">${item.draw()}</svg>`
}
