import type { Line } from '../store/derive'
import type { World } from '../store/types'

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

const face = (cx: number, cy: number, s = 1, ink = '#061020'): string =>
  `<circle cx="${cx - 3 * s}" cy="${cy}" r="${1.6 * s}" fill="${ink}"/><circle cx="${cx + 3 * s}" cy="${cy}" r="${1.6 * s}" fill="${ink}"/><path d="M${cx - 2.5 * s} ${cy + 4 * s} q ${2.5 * s} ${2.5 * s} ${5 * s} 0" stroke="${ink}" stroke-width="${1.2 * s}" fill="none" stroke-linecap="round"/>`

const dots = (points: [number, number, number][], color: string): string =>
  points.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${color}"/>`).join('')

const fish = (x: number, y: number, w: number, color: string, flip = false): string => {
  const t = flip ? `transform="translate(${x * 2} 0) scale(-1 1)"` : ''
  return `<g ${t}><path d="M${x - w / 2} ${y} l ${-w * 0.3} ${-w * 0.22} v ${w * 0.44} z" fill="${color}"/><ellipse cx="${x}" cy="${y}" rx="${w / 2}" ry="${w * 0.3}" fill="${color}"/><circle cx="${x + w * 0.25}" cy="${y - w * 0.05}" r="${w * 0.06}" fill="#061020"/></g>`
}

const jelly = (x: number, y: number, w: number, color: string): string =>
  `<path d="M${x - w / 2} ${y} a ${w / 2} ${w / 2} 0 0 1 ${w} 0 z" fill="${color}" opacity="0.85"/>${[
    0.3, 0.5, 0.7,
  ]
    .map(
      (k) =>
        `<path d="M${x - w / 2 + k * w} ${y} q ${k > 0.5 ? 4 : -4} ${w * 0.5} 0 ${w * 0.9}" stroke="${color}" stroke-width="1.5" fill="none" stroke-linecap="round" opacity="0.7"/>`,
    )
    .join('')}${face(x, y - w * 0.2, w / 24)}`

const star5 = (x: number, y: number, r: number, color: string): string => {
  const points: string[] = []
  for (let i = 0; i < 10; i++) {
    const radius = i % 2 ? r * 0.45 : r
    const a = (Math.PI / 5) * i - Math.PI / 2
    points.push(`${(x + Math.cos(a) * radius).toFixed(1)} ${(y + Math.sin(a) * radius).toFixed(1)}`)
  }
  return `<polygon points="${points.join(' ')}" fill="${color}"/>`
}

const sunflower = (x: number, y: number, r: number, withFace = false): string =>
  `${[0, 45, 90, 135, 180, 225, 270, 315].map((a) => `<ellipse cx="${x}" cy="${y - r * 0.75}" rx="${r * 0.22}" ry="${r * 0.5}" fill="var(--sun)" transform="rotate(${a} ${x} ${y})"/>`).join('')}<circle cx="${x}" cy="${y}" r="${r * 0.42}" fill="#5a3a1e"/>${withFace ? face(x, y, r / 24, '#f2c94c') : ''}`

const stem = (x: number, top: number, bottom: number): string =>
  `<path d="M${x} ${bottom} v ${top - bottom}" stroke="var(--leaf)" stroke-width="2.5" stroke-linecap="round"/>`

const jacket = (x: number, y: number, w: number): string =>
  `<path d="M${x - w / 2} ${y} q ${w / 2} ${-w * 0.35} ${w} 0 v ${w * 0.5} h ${-w} z" fill="var(--jacket)"/><path d="M${x} ${y - w * 0.1} v ${w * 0.55}" stroke="#061020" stroke-width="1" opacity="0.5"/>`

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
    0.64,
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
  sea('a', 7, 'sea-a-fish', 'a fish', 'the first company', 0.3, 0.7, 32, 'swim', () =>
    fish(50, 50, 50, 'var(--teal)'),
  ),
  sea(
    'a',
    14,
    'sea-a-school',
    'a school of fish',
    'six, turning together',
    0.55,
    0.66,
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
    0.735,
    28,
    'none',
    () =>
      `<path d="M50 20 v 55 M30 45 h 40 M25 60 q 25 30 50 0" stroke="var(--sand)" stroke-width="7" fill="none" stroke-linecap="round"/><circle cx="50" cy="14" r="7" stroke="var(--sand)" stroke-width="6" fill="none"/>`,
  ),
  sea(
    'a',
    30,
    'sea-a-jelly',
    'a jellyfish at night',
    'only out after dark',
    0.8,
    0.7,
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
    0.61,
    56,
    'swim',
    () =>
      `<path d="M15 60 C 25 35, 60 30, 85 45 C 75 50, 72 48, 70 52 L 60 58 C 50 62, 30 64, 15 60 Z" fill="#7fa8c9"/><path d="M48 38 l 8 -14 l 4 16 z" fill="#7fa8c9"/><path d="M15 60 l -10 -8 l 2 12 z" fill="#7fa8c9"/><circle cx="74" cy="46" r="2" fill="#061020"/>`,
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
    () =>
      `<path d="M40 95 l 4 -60 h 12 l 4 60 z" fill="#e8f0f5"/><rect x="40" y="55" width="20" height="8" fill="var(--jacket)"/><rect x="40" y="75" width="20" height="8" fill="var(--jacket)"/><rect x="42" y="22" width="16" height="14" fill="#061020"/><rect x="44" y="24" width="12" height="10" fill="var(--star)"/><path d="M50 29 l -60 -14 v 28 z" fill="var(--star)" opacity="0.25" class="beam"/>`,
  ),
  sea(
    'a',
    90,
    'sea-a-jacket',
    'the red jacket',
    'the whale wears it now',
    0.45,
    0.73,
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
    0.62,
    40,
    'swim',
    () =>
      `<path d="M20 50 C 20 32, 70 30, 80 46 C 80 58, 50 64, 30 58 C 22 56, 20 54, 20 50 Z" fill="#1d6f8a"/><path d="M14 46 l 8 -6 v 14 z" fill="#1d6f8a"/><path d="M30 58 C 50 64, 76 60, 80 46 C 72 58, 50 62, 30 58 Z" fill="#9ff7ee" opacity="0.5"/>${face(68, 44, 0.8)}`,
  ),
  sea(
    'a',
    180,
    'sea-a-song',
    'the whale sings',
    'a pulse of light across the sea',
    0.5,
    0.68,
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
    0.735,
    28,
    'sway',
    () =>
      `<path d="M20 90 q 0 -40 10 -60" stroke="var(--leaf)" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M50 20 c 14 0 16 14 8 20 c 8 8 2 24 -8 24 c -5 0 -5 -5 -2 -8 c -8 -2 -10 -14 -2 -18 c -6 -6 -2 -18 4 -18 z" fill="var(--teal)"/>${face(52, 28, 0.6)}`,
  ),
  sea(
    'b',
    14,
    'sea-b-crab',
    'a crab',
    'walking the floor',
    0.25,
    0.74,
    28,
    'sway',
    () =>
      `<ellipse cx="50" cy="55" rx="22" ry="14" fill="var(--jacket)"/><path d="M30 50 l -14 -12 M70 50 l 14 -12 M32 62 l -14 8 M68 62 l 14 8 M38 66 l -8 12 M62 66 l 8 12" stroke="var(--jacket)" stroke-width="4" stroke-linecap="round"/><circle cx="42" cy="46" r="3" fill="#061020"/><circle cx="58" cy="46" r="3" fill="#061020"/>`,
  ),
  sea(
    'b',
    21,
    'sea-b-turtle',
    'a sea turtle',
    'drifting past, slowly',
    0.42,
    0.66,
    44,
    'swim',
    () =>
      `<ellipse cx="50" cy="50" rx="26" ry="18" fill="#2b7a5b"/><path d="M28 50 q 22 -16 44 0 q -22 14 -44 0 z" fill="var(--leaf)" opacity="0.5"/><circle cx="80" cy="46" r="9" fill="#3fa37a"/><ellipse cx="28" cy="62" rx="9" ry="4" fill="#3fa37a"/><ellipse cx="68" cy="66" rx="9" ry="4" fill="#3fa37a"/>${face(82, 45, 0.8)}`,
  ),
  sea(
    'b',
    30,
    'sea-b-jellies',
    'a pair of jellyfish',
    'two, after dark',
    0.14,
    0.7,
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
    0.735,
    90,
    'swim',
    () =>
      `<path d="M5 50 Q 30 20, 50 40 Q 70 20, 95 50 Q 70 60, 50 56 Q 30 60, 5 50 Z" fill="#1b3a5c"/><path d="M50 56 q -3 20 0 34" stroke="#1b3a5c" stroke-width="2" fill="none"/>${face(50, 44, 0.7, '#9ff7ee')}`,
  ),
  sea(
    'b',
    60,
    'sea-b-octopus',
    'an octopus',
    'in a cave at the bottom',
    0.9,
    0.74,
    40,
    'sway',
    () =>
      `<circle cx="50" cy="40" r="22" fill="#b56576"/>${[22, 34, 46, 58, 70].map((x) => `<path d="M${x} 58 q ${x < 50 ? -6 : 6} 18 ${x < 50 ? -2 : 2} 34" stroke="#b56576" stroke-width="6" fill="none" stroke-linecap="round"/>`).join('')}${face(50, 40, 1.1)}`,
  ),
  sea(
    'b',
    90,
    'sea-b-ship',
    'a sunken ship',
    'with its own glow',
    0.3,
    0.745,
    70,
    'none',
    () =>
      `<path d="M10 70 L 20 50 H 80 L 90 70 Z" fill="#2a2f3a"/><path d="M50 50 v -34 M50 22 h 24 M50 34 h 18" stroke="#2a2f3a" stroke-width="3"/><path d="M10 70 h 80 l -6 10 H 16 z" fill="#1c2029"/>${dots(
        [
          [30, 60, 2],
          [60, 62, 2],
          [44, 56, 1.5],
        ],
        'var(--glow)',
      )}`,
  ),
  sea(
    'b',
    120,
    'sea-b-narwhal',
    'a narwhal',
    'because why not',
    0.2,
    0.62,
    52,
    'swim',
    () =>
      `<path d="M20 50 C 22 34, 66 32, 78 46 C 76 56, 50 62, 30 58 C 22 56, 20 54, 20 50 Z" fill="#8c9bb0"/><path d="M14 46 l 8 -6 v 14 z" fill="#8c9bb0"/><path d="M76 44 l 22 -14" stroke="var(--star-pale)" stroke-width="3" stroke-linecap="round"/>${face(66, 44, 0.8)}`,
  ),
  sea(
    'b',
    180,
    'sea-b-deep',
    'the deep opens',
    'a second layer, with its own lights',
    0.5,
    0.75,
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
    'the moon',
    'a crescent',
    0.86,
    0.2,
    40,
    'none',
    () =>
      `<circle cx="50" cy="50" r="30" fill="var(--star-pale)"/><circle cx="62" cy="44" r="28" fill="var(--night)"/>`,
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
    () =>
      `<path d="M10 50 L 90 20 L 55 80 L 48 55 Z" fill="var(--star-pale)"/><path d="M10 50 L 48 55 L 90 20 Z" fill="#cfd8e3"/>`,
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
    () =>
      `<circle cx="50" cy="30" r="16" fill="#e8f0f5"/><circle cx="50" cy="30" r="11" fill="#061020"/>${jacket(50, 48, 40)}<path d="M30 56 l -12 10 M70 56 l 12 10 M42 70 l -4 18 M58 70 l 4 18" stroke="#e8f0f5" stroke-width="6" stroke-linecap="round"/>`,
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
    0.5,
    0.05,
    30,
    'drift',
    () =>
      `<rect x="42" y="44" width="16" height="12" fill="#cfd8e3"/><rect x="10" y="46" width="28" height="8" fill="var(--glow)" opacity="0.8"/><rect x="62" y="46" width="28" height="8" fill="var(--glow)" opacity="0.8"/>`,
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
    () =>
      `<circle cx="50" cy="50" r="18" fill="#e0a96d"/><ellipse cx="50" cy="50" rx="34" ry="8" stroke="var(--sand)" stroke-width="3" fill="none" transform="rotate(-18 50 50)"/>`,
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
    () =>
      `<circle cx="50" cy="50" r="26" fill="#d9c8a9"/><circle cx="40" cy="42" r="5" fill="#bfae90"/><circle cx="60" cy="58" r="7" fill="#bfae90"/>`,
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
    'a full moon',
    'follows the real moon',
    0.62,
    0.1,
    36,
    'none',
    () =>
      `<circle cx="50" cy="50" r="30" fill="var(--star-pale)"/><circle cx="40" cy="40" r="6" fill="#e8dcc0"/><circle cx="60" cy="56" r="8" fill="#e8dcc0"/><circle cx="46" cy="64" r="4" fill="#e8dcc0"/>`,
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
    () =>
      `<ellipse cx="50" cy="60" rx="18" ry="24" fill="#6b4a2b"/><circle cx="42" cy="50" r="7" fill="var(--star-pale)"/><circle cx="58" cy="50" r="7" fill="var(--star-pale)"/><circle cx="42" cy="50" r="3" fill="#061020"/><circle cx="58" cy="50" r="3" fill="#061020"/><path d="M50 56 l -3 5 h 6 z" fill="var(--sun)"/>`,
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
    () =>
      `<path d="M50 6 C 20 6, 14 40, 40 60 L 60 60 C 86 40, 80 6, 50 6 Z" fill="var(--star)"/><path d="M50 6 C 40 6, 36 40, 46 60 h 8 C 64 40, 60 6, 50 6 Z" fill="var(--sun)" opacity="0.7"/><path d="M42 62 l 2 14 M58 62 l -2 14" stroke="#e8f0f5" stroke-width="1"/>${jacket(50, 78, 20)}`,
  ),
  sky(
    'b',
    120,
    'sky-b-kite',
    'a kite',
    'up even at night',
    0.62,
    0.44,
    40,
    'sway',
    () =>
      `<path d="M50 5 L 80 40 L 50 75 L 20 40 Z" fill="var(--jacket)"/><path d="M50 5 V 75 M20 40 H 80" stroke="#061020" stroke-width="1" opacity="0.4"/><path d="M50 75 q -10 15 0 25" stroke="#e8f0f5" stroke-width="1" fill="none"/>`,
  ),
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
  garden(
    'a',
    3,
    'garden-a-sprout',
    'a sprout',
    'on the shore',
    0.12,
    14,
    'sway',
    () =>
      `${stem(50, 60, 90)}<path d="M50 70 q -14 -8 -12 -22 q 12 2 12 22 z M50 64 q 14 -8 12 -22 q -12 2 -12 22 z" fill="var(--leaf)"/>`,
  ),
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
  garden('a', 14, 'garden-a-bees', 'bees', 'around the sunflower', 0.24, 18, 'drift', () =>
    [
      [30, 30],
      [60, 20],
      [70, 50],
    ]
      .map(
        ([x, y]) =>
          `<ellipse cx="${x}" cy="${y}" rx="6" ry="4" fill="var(--sun)"/><path d="M${(x ?? 0) - 3} ${(y ?? 0) - 3} v 6 M${x} ${(y ?? 0) - 4} v 8" stroke="#061020" stroke-width="1.2"/><ellipse cx="${x}" cy="${(y ?? 0) - 5}" rx="4" ry="2" fill="#e8f0f5" opacity="0.7"/>`,
      )
      .join(''),
  ),
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
    () =>
      `<path d="M50 50 q -24 -30 -30 -8 q 0 18 30 8 z M50 50 q 24 -30 30 -8 q 0 18 -30 8 z M50 50 q -24 20 -22 30 q 10 6 22 -30 z M50 50 q 24 20 22 30 q -10 6 -22 -30 z" fill="var(--jacket)" opacity="0.9"/><path d="M50 36 v 32" stroke="#061020" stroke-width="2" stroke-linecap="round"/>`,
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
    () =>
      `<path d="M20 95 V 50 L 50 25 L 80 50 V 95 Z" fill="var(--glow)" opacity="0.25"/><path d="M20 95 V 50 L 50 25 L 80 50 V 95 M50 25 V 95 M20 70 H 80" stroke="#e8f0f5" stroke-width="1.5" fill="none" opacity="0.6"/>`,
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
    () =>
      `<path d="M48 95 V 55" stroke="#6b4a2b" stroke-width="7" stroke-linecap="round"/><path d="M48 60 l -18 -18 M48 62 l 16 -14" stroke="#6b4a2b" stroke-width="4" stroke-linecap="round"/><circle cx="48" cy="36" r="24" fill="#3f8f3a"/><circle cx="30" cy="44" r="14" fill="#4fa64a"/><circle cx="66" cy="42" r="15" fill="#4fa64a"/><path d="M62 50 v 30 M72 50 v 30" stroke="#e8f0f5" stroke-width="1"/><rect x="58" y="80" width="18" height="4" fill="#6b4a2b"/>`,
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
    () =>
      `<path d="M44 95 V 55 h 12 V 95 z" fill="#e8dcc8"/><path d="M18 58 q 32 -50 64 0 z" fill="var(--jacket)"/><circle cx="36" cy="44" r="4" fill="#e8f0f5" opacity="0.8"/><circle cx="58" cy="38" r="5" fill="#e8f0f5" opacity="0.8"/>`,
  ),
  garden(
    'b',
    7,
    'garden-b-roses',
    'a rose bush',
    'red, of course',
    0.44,
    22,
    'sway',
    () =>
      `<circle cx="50" cy="60" r="28" fill="#2f6b2a"/>${dots(
        [
          [36, 50, 6],
          [58, 44, 6],
          [48, 70, 6],
          [66, 66, 5],
        ],
        'var(--jacket)',
      )}`,
  ),
  garden(
    'b',
    14,
    'garden-b-snail',
    'a snail',
    'going somewhere',
    0.08,
    14,
    'drift',
    () =>
      `<circle cx="56" cy="60" r="18" fill="var(--sand)"/><circle cx="56" cy="60" r="10" fill="none" stroke="#6e5a39" stroke-width="3"/><path d="M14 78 q 10 -10 30 -2 q 20 8 36 2" stroke="#8fbf8a" stroke-width="8" stroke-linecap="round" fill="none"/><path d="M18 72 l -6 -14 M26 72 l 2 -14" stroke="#8fbf8a" stroke-width="2" stroke-linecap="round"/>`,
  ),
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
  garden(
    'b',
    30,
    'garden-b-bench',
    'a bench',
    'facing the sea',
    0.8,
    28,
    'none',
    () =>
      `<rect x="10" y="50" width="80" height="8" rx="2" fill="#6b4a2b"/><rect x="10" y="34" width="80" height="8" rx="2" fill="#6b4a2b"/><path d="M18 58 v 30 M82 58 v 30 M18 42 v 8 M82 42 v 8" stroke="#6b4a2b" stroke-width="4"/>`,
  ),
  garden(
    'b',
    45,
    'garden-b-rabbit',
    'a rabbit',
    'peeks out of the grass',
    0.16,
    16,
    'none',
    () =>
      `<ellipse cx="50" cy="70" rx="20" ry="16" fill="#e8f0f5"/><ellipse cx="40" cy="36" rx="6" ry="20" fill="#e8f0f5"/><ellipse cx="60" cy="36" rx="6" ry="20" fill="#e8f0f5"/><ellipse cx="40" cy="36" rx="3" ry="14" fill="#f4b8c1"/><ellipse cx="60" cy="36" rx="3" ry="14" fill="#f4b8c1"/>${face(50, 66, 0.8)}`,
  ),
  garden(
    'b',
    60,
    'garden-b-lantern',
    'a lantern',
    'lit at night',
    0.92,
    18,
    'none',
    () =>
      `<path d="M50 95 V 40" stroke="#6b4a2b" stroke-width="4"/><rect x="38" y="20" width="24" height="24" rx="3" fill="var(--star)" opacity="0.9"/><rect x="36" y="16" width="28" height="5" fill="#6b4a2b"/><circle cx="50" cy="32" r="20" fill="var(--star)" opacity="0.15"/>`,
  ),
  garden(
    'b',
    90,
    'garden-b-cat',
    'a cat',
    'asleep on the bench',
    0.8,
    20,
    'none',
    () =>
      `<ellipse cx="50" cy="66" rx="26" ry="14" fill="#2a2f3a"/><circle cx="72" cy="60" r="11" fill="#2a2f3a"/><path d="M64 52 l 2 -10 l 7 7 z M80 52 l -2 -10 l -7 7 z" fill="#2a2f3a"/><path d="M68 62 q 3 2 6 0" stroke="#e8f0f5" stroke-width="1" fill="none"/><path d="M24 70 q -14 2 -10 -10" stroke="#2a2f3a" stroke-width="5" stroke-linecap="round" fill="none"/>`,
  ),
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
    () =>
      `<path d="M20 90 L 25 40 H 75 L 80 90 Z" fill="#6b4a2b"/><path d="M15 42 L 50 15 L 85 42 Z" fill="#8b5e34"/><rect x="42" y="52" width="16" height="16" fill="var(--star)"/><rect x="38" y="76" width="10" height="14" fill="#3a2a1a"/>`,
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
