import type { Collectible } from './collectibles'
import { dots, face, lit, star5 } from './draw'

/**
 * The legendaries of the first year, and the rare finds half way to each.
 * A legendary is earned only by finishing a constellation (src/store/
 * paths.ts); it is never sold. Each has a shape, the outline its
 * constellation is drawn in, so the goal is in the sky from the first day,
 * and a drawing of its own: bigger than a find, gold or pearl, with a
 * shimmer the scene adds. After the fifth, the paths go round again.
 *
 * Shapes are strokes of points in a 100 by 60 box; the stars are spread
 * along them (src/scene/constellations.ts). Names and lines are
 * placeholders for the author's voice, like the finds' (TODO-VOICE).
 */
export type Stroke = readonly (readonly [number, number])[]

export interface Legendary {
  id: string
  name: string
  hint: string
  shape: readonly Stroke[]
  find: Collectible
  /** The rare find lit half way along its path. */
  rare: Collectible
}

const thing = (
  id: string,
  world: Collectible['world'],
  name: string,
  hint: string,
  size: number,
  motion: Collectible['motion'],
  draw: () => string,
): Collectible => ({ id, world, line: 'a', days: 0, name, hint, x: 0, y: 0, size, motion, draw })

// --- drawings -----------------------------------------------------------------------------------

function goldenWhale(): string {
  const [defs, gold] = lit('#f2c14e', 0.45, -0.25)
  return `${defs}
    <path d="M14 52 L 2 38 Q 8 52 2 66 Z" fill="#d99a2b"/>
    <path d="M12 52 C 14 30, 52 24, 78 32 C 96 38, 98 58, 84 66 C 62 76, 24 70, 12 52 Z" fill="${gold}"/>
    <path d="M24 64 C 44 72, 70 72, 86 62 C 72 76, 36 78, 24 64 Z" fill="#fff4d6" opacity="0.7"/>
    <path d="M30 38 C 44 32, 62 31, 74 35" stroke="#fff" stroke-width="3" opacity="0.55" fill="none" stroke-linecap="round"/>
    <path d="M70 26 q -2 -10 -8 -14 M70 26 q 4 -10 10 -12" stroke="#fff4d6" stroke-width="2.4" fill="none" stroke-linecap="round"/>
    ${face(78, 48, 1.3)}
    ${dots(
      [
        [40, 44, 1.2],
        [56, 40, 0.9],
        [30, 56, 0.8],
      ],
      '#fff',
    )}`
}

function pearlTurtle(): string {
  const [defs, pearl] = lit('#e9e4f5', 0.4, -0.2)
  const [defs2, skin] = lit('#9fd9c8', 0.3, -0.3)
  return `${defs}${defs2}
    <ellipse cx="22" cy="70" rx="12" ry="6" fill="${skin}" transform="rotate(-20 22 70)"/>
    <ellipse cx="74" cy="72" rx="12" ry="6" fill="${skin}" transform="rotate(20 74 72)"/>
    <circle cx="86" cy="52" r="10" fill="${skin}"/>
    <path d="M14 58 C 14 30, 74 24, 80 56 C 72 70, 22 72, 14 58 Z" fill="${pearl}"/>
    <path d="M30 44 l 10 -8 14 0 10 8 -4 12 -26 0 Z" fill="none" stroke="#c9b8e8" stroke-width="2" opacity="0.8"/>
    <path d="M24 40 C 34 30, 52 28, 64 32" stroke="#fff" stroke-width="3" opacity="0.7" fill="none" stroke-linecap="round"/>
    <circle cx="44" cy="48" r="4" fill="#fff" opacity="0.8"/>
    ${face(88, 51, 0.7)}`
}

function cometFox(): string {
  const [defs, fur] = lit('#ff9a4d', 0.4, -0.3)
  return `${defs}
    <path d="M8 30 C 22 46, 36 58, 48 66" stroke="#ffd98a" stroke-width="14" stroke-linecap="round" opacity="0.18"/>
    <path d="M18 40 C 30 54, 40 62, 50 68" stroke="#fff4d6" stroke-width="7" stroke-linecap="round" opacity="0.45"/>
    <path d="M44 70 C 40 56, 52 46, 62 48 C 70 50, 74 62, 70 76 Z" fill="${fur}"/>
    <path d="M58 46 L 56 26 L 66 36 L 76 24 L 76 44 C 74 54, 60 56, 58 46 Z" fill="${fur}"/>
    <path d="M60 32 L 59 28 L 63 33 Z M73 30 L 74 27 L 70 33 Z" fill="#fff4d6" opacity="0.8"/>
    <path d="M62 50 C 64 56, 72 56, 74 48" fill="#fff4d6" opacity="0.9"/>
    ${face(67, 42, 0.75)}
    ${star5(14, 28, 4, '#fff4d6')}`
}

function crystalJelly(): string {
  const [defs, glass] = lit('#a8f0ff', 0.5, -0.1)
  const tentacles = [30, 42, 58, 70]
    .map(
      (x, i) =>
        `<path d="M${String(x)} 52 q ${i % 2 ? 6 : -6} 12 0 24 q ${i % 2 ? -5 : 5} 8 0 16" stroke="#c9b8ff" stroke-width="2.6" fill="none" stroke-linecap="round" opacity="0.85"/>`,
    )
    .join('')
  return `${defs}${tentacles}
    <path d="M18 52 C 16 26, 34 12, 50 12 C 66 12, 84 26, 82 52 C 70 58, 30 58, 18 52 Z" fill="${glass}" opacity="0.92"/>
    <path d="M30 22 L 40 50 M50 14 L 50 52 M70 22 L 60 50" stroke="#fff" stroke-width="1.6" opacity="0.6"/>
    <path d="M26 28 C 32 20, 40 16, 48 15" stroke="#fff" stroke-width="3" opacity="0.8" fill="none" stroke-linecap="round"/>
    ${face(50, 38, 0.95)}
    ${dots(
      [
        [32, 40, 1],
        [68, 34, 1.1],
      ],
      '#ffd1f0',
    )}`
}

function moonHeron(): string {
  const [defs, plume] = lit('#dfe8f5', 0.4, -0.25)
  const [defs2, moon] = lit('#ffe9a8', 0.3, -0.2)
  return `${defs}${defs2}
    <path d="M78 6 A 16 16 0 1 0 92 30 A 12 12 0 1 1 78 6 Z" fill="${moon}"/>
    <path d="M48 64 V 94 M58 62 L 62 94" stroke="#c9a86a" stroke-width="2.4" stroke-linecap="round"/>
    <path d="M30 50 C 30 36, 54 32, 68 40 C 74 48, 66 60, 52 64 C 40 66, 30 60, 30 50 Z" fill="${plume}"/>
    <path d="M36 44 C 30 34, 30 22, 38 16 C 44 12, 50 14, 52 18" stroke="${plume}" stroke-width="6" fill="none" stroke-linecap="round"/>
    <path d="M52 18 L 68 22 L 52 22 Z" fill="#f2c14e"/>
    <path d="M40 16 q -6 -6 -12 -4" stroke="#dfe8f5" stroke-width="2" fill="none" stroke-linecap="round"/>
    <path d="M36 50 C 44 46, 56 46, 64 50" stroke="#fff" stroke-width="2.4" opacity="0.6" fill="none" stroke-linecap="round"/>
    ${face(45, 18, 0.55)}`
}

function goldenScale(): string {
  const [defs, gold] = lit('#f2c14e', 0.45, -0.3)
  return `${defs}
    <path d="M50 18 C 72 30, 74 62, 50 82 C 26 62, 28 30, 50 18 Z" fill="${gold}"/>
    <path d="M50 26 C 62 36, 62 58, 50 72" stroke="#fff4d6" stroke-width="3" fill="none" opacity="0.7"/>`
}

function pearl(): string {
  const [defs, nacre] = lit('#f4effa', 0.4, -0.25)
  return `${defs}
    <path d="M16 66 C 20 40, 80 40, 84 66 C 70 76, 30 76, 16 66 Z" fill="#c9a86a"/>
    <circle cx="50" cy="56" r="16" fill="${nacre}"/>
    <circle cx="44" cy="50" r="5" fill="#fff" opacity="0.85"/>`
}

function stardust(): string {
  return `${star5(50, 50, 18, '#ffd98a')}${dots(
    [
      [24, 30, 2],
      [76, 28, 1.6],
      [30, 74, 1.4],
      [72, 72, 2],
    ],
    '#fff4d6',
  )}`
}

function prism(): string {
  return `<path d="M50 14 L 78 70 H 22 Z" fill="#a8f0ff" opacity="0.85"/>
    <path d="M50 14 L 60 70 H 40 Z" fill="#fff" opacity="0.45"/>
    <path d="M78 70 L 92 62 M78 70 L 94 72 M78 70 L 90 82" stroke="#ff8fd0" stroke-width="2.4" stroke-linecap="round" opacity="0.8"/>`
}

function silverFeather(): string {
  return `<path d="M30 86 C 40 60, 58 30, 76 14 C 72 40, 58 66, 30 86 Z" fill="#dfe8f5"/>
    <path d="M30 86 L 74 18" stroke="#9fb2c8" stroke-width="1.8"/>
    <path d="M44 66 l -8 -4 M52 54 l -8 -5 M60 42 l -7 -6" stroke="#9fb2c8" stroke-width="1.4"/>`
}

// --- the five ------------------------------------------------------------------------------------

/** An ellipse as a closed stroke of `n` points. */
function ellipse(cx: number, cy: number, rx: number, ry: number, n: number): Stroke {
  return Array.from({ length: n + 1 }, (_, i) => {
    const a = (i / n) * Math.PI * 2
    return [cx + rx * Math.cos(a), cy + ry * Math.sin(a)] as const
  })
}

export const LEGENDARIES: readonly Legendary[] = [
  {
    id: 'legend-whale',
    name: 'the golden whale',
    hint: 'thirty days of showing up',
    shape: [
      [
        [4, 16],
        [13, 28],
        [4, 40],
      ],
      [
        [13, 28],
        [26, 20],
        [44, 13],
        [64, 12],
        [82, 18],
        [94, 30],
        [92, 40],
        [78, 47],
        [56, 49],
        [34, 45],
        [18, 36],
        [13, 28],
      ],
      [
        [78, 15],
        [74, 4],
      ],
      [
        [78, 15],
        [86, 6],
      ],
    ],
    find: thing(
      'legend-whale',
      'sea',
      'the golden whale',
      'thirty days of showing up',
      86,
      'swim',
      goldenWhale,
    ),
    rare: thing(
      'rare-scale',
      'sea',
      'a golden scale',
      'half way to the golden whale',
      26,
      'drift',
      goldenScale,
    ),
  },
  {
    id: 'legend-turtle',
    name: 'the pearl turtle',
    hint: 'sixty more',
    shape: [
      ellipse(48, 32, 26, 17, 14),
      [
        [74, 30],
        [84, 25],
        [94, 30],
        [84, 36],
        [74, 34],
      ],
      [
        [34, 18],
        [26, 8],
        [16, 10],
      ],
      [
        [62, 17],
        [70, 6],
        [80, 8],
      ],
      [
        [34, 46],
        [22, 56],
      ],
      [
        [62, 47],
        [72, 57],
      ],
      [
        [22, 32],
        [10, 34],
      ],
    ],
    find: thing(
      'legend-turtle',
      'sea',
      'the pearl turtle',
      'sixty more days',
      80,
      'swim',
      pearlTurtle,
    ),
    rare: thing('rare-pearl', 'sea', 'a pearl', 'half way to the pearl turtle', 28, 'none', pearl),
  },
  {
    id: 'legend-fox',
    name: 'the comet fox',
    hint: 'a hundred more',
    shape: [
      [
        [60, 20],
        [64, 6],
        [70, 16],
        [78, 6],
        [80, 20],
        [74, 30],
        [66, 30],
        [60, 20],
      ],
      [
        [66, 30],
        [62, 44],
        [54, 54],
        [70, 54],
        [78, 40],
        [74, 30],
      ],
      [
        [54, 52],
        [40, 46],
        [24, 34],
        [8, 22],
      ],
      [
        [54, 54],
        [36, 52],
        [18, 44],
        [4, 36],
      ],
    ],
    find: thing('legend-fox', 'sky', 'the comet fox', 'a hundred more days', 84, 'drift', cometFox),
    rare: thing(
      'rare-stardust',
      'sky',
      'stardust',
      'half way to the comet fox',
      30,
      'twinkle',
      stardust,
    ),
  },
  {
    id: 'legend-jelly',
    name: 'the crystal jellyfish',
    hint: 'a hundred more',
    shape: [
      [
        [22, 30],
        [26, 16],
        [38, 6],
        [50, 4],
        [62, 6],
        [74, 16],
        [78, 30],
        [64, 32],
        [50, 31],
        [36, 32],
        [22, 30],
      ],
      [
        [32, 32],
        [30, 42],
        [34, 50],
        [30, 58],
      ],
      [
        [44, 32],
        [44, 44],
        [40, 56],
      ],
      [
        [56, 32],
        [56, 44],
        [60, 56],
      ],
      [
        [68, 32],
        [70, 42],
        [66, 50],
        [70, 58],
      ],
    ],
    find: thing(
      'legend-jelly',
      'sea',
      'the crystal jellyfish',
      'a hundred more days',
      70,
      'drift',
      crystalJelly,
    ),
    rare: thing(
      'rare-prism',
      'sea',
      'a prism',
      'half way to the crystal jellyfish',
      26,
      'twinkle',
      prism,
    ),
  },
  {
    id: 'legend-heron',
    name: 'the moon heron',
    hint: 'a hundred more',
    shape: [
      [
        [40, 24],
        [54, 22],
        [66, 28],
        [62, 36],
        [48, 38],
        [38, 32],
        [40, 24],
      ],
      [
        [40, 24],
        [34, 14],
        [38, 6],
        [46, 4],
        [60, 8],
      ],
      [
        [52, 38],
        [52, 58],
      ],
      [
        [58, 36],
        [62, 58],
      ],
      [
        [80, 4],
        [88, 9],
        [92, 20],
        [88, 31],
        [80, 35],
        [85, 26],
        [87, 18],
        [84, 10],
        [80, 4],
      ],
    ],
    find: thing(
      'legend-heron',
      'garden',
      'the moon heron',
      'a hundred more days',
      64,
      'none',
      moonHeron,
    ),
    rare: thing(
      'rare-feather',
      'garden',
      'a silver feather',
      'half way to the moon heron',
      24,
      'sway',
      silverFeather,
    ),
  },
]

/** The legendary of path `index`: the five in turn, and round again after the fifth. */
export function legendaryFor(index: number): Legendary {
  const legendary = LEGENDARIES[index % LEGENDARIES.length]
  if (!legendary) throw new Error('no legendaries')
  return legendary
}
