import type { Line, Stage } from '../store/derive'
import type { World } from '../store/types'

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
let counter = 0

interface Kit {
  /** A fresh id for this drawing's gradients. */
  id: (name: string) => string
  defs: string[]
}

function kit(): Kit {
  const n = ++counter
  const defs: string[] = []
  return { id: (name) => `c${String(n)}-${name}`, defs }
}

/** A vertical body shade, lighter on top. */
function shade(k: Kit, name: string, top: string, bottom: string): string {
  const id = k.id(name)
  k.defs.push(
    `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${top}"/><stop offset="1" stop-color="${bottom}"/></linearGradient>`,
  )
  return `url(#${id})`
}

/** A round shade, lit from the top left. */
function orb(k: Kit, name: string, light: string, mid: string, dark: string): string {
  const id = k.id(name)
  k.defs.push(
    `<radialGradient id="${id}" cx="0.36" cy="0.32" r="0.75"><stop offset="0" stop-color="${light}"/><stop offset="0.55" stop-color="${mid}"/><stop offset="1" stop-color="${dark}"/></radialGradient>`,
  )
  return `url(#${id})`
}

/** A soft light behind the creature, fading to nothing. */
function halo(k: Kit, color: string, r: number, cx = 32, cy = 34): string {
  const id = k.id('halo')
  k.defs.push(
    `<radialGradient id="${id}"><stop offset="0" stop-color="${color}" stop-opacity="0.32"/><stop offset="0.6" stop-color="${color}" stop-opacity="0.1"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></radialGradient>`,
  )
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#${id})"/>`
}

/**
 * Two eyes with catchlights, a mouth, and blush. `mood` 1 is a smile, 0 a
 * flat calm line, -1 a small o. The eyes are one group so a blink can
 * close both.
 */
function face(
  cx: number,
  cy: number,
  s: number,
  mood = 1,
  ink = '#061020',
  blush = '#ff8fa3',
): string {
  const gap = 5.2 * s
  const eye = 1.9 * s
  const mouth =
    mood > 0
      ? `<path d="M${cx - 2.6 * s} ${cy + 3.6 * s} q ${2.6 * s} ${2.8 * s} ${5.2 * s} 0" stroke="${ink}" stroke-width="${1.15 * s}" fill="none" stroke-linecap="round"/>`
      : mood < 0
        ? `<ellipse cx="${cx}" cy="${cy + 4.4 * s}" rx="${1.2 * s}" ry="${1.5 * s}" fill="${ink}"/>`
        : `<path d="M${cx - 2 * s} ${cy + 4.2 * s} h ${4 * s}" stroke="${ink}" stroke-width="${1.1 * s}" stroke-linecap="round"/>`
  return `<g class="eyes">
      <ellipse cx="${cx - gap / 2}" cy="${cy}" rx="${eye}" ry="${eye * 1.12}" fill="${ink}"/>
      <ellipse cx="${cx + gap / 2}" cy="${cy}" rx="${eye}" ry="${eye * 1.12}" fill="${ink}"/>
      <circle cx="${cx - gap / 2 + 0.65 * s}" cy="${cy - 0.75 * s}" r="${0.7 * s}" fill="#fff"/>
      <circle cx="${cx + gap / 2 + 0.65 * s}" cy="${cy - 0.75 * s}" r="${0.7 * s}" fill="#fff"/>
    </g>
    <ellipse cx="${cx - gap / 2 - 1.6 * s}" cy="${cy + 2.7 * s}" rx="${1.7 * s}" ry="${1 * s}" fill="${blush}" opacity="0.5"/>
    <ellipse cx="${cx + gap / 2 + 1.6 * s}" cy="${cy + 2.7 * s}" rx="${1.7 * s}" ry="${1 * s}" fill="${blush}" opacity="0.5"/>
    ${mouth}`
}

function svg(k: Kit, body: string): string {
  return `<svg viewBox="0 0 64 64" aria-hidden="true"><defs>${k.defs.join('')}</defs>${body}</svg>`
}

/** A four-point sparkle, for twinkles. */
const twinkle = (x: number, y: number, r: number, color: string): string =>
  `<path d="M${x} ${y - r} Q ${x + r * 0.2} ${y - r * 0.2} ${x + r} ${y} Q ${x + r * 0.2} ${y + r * 0.2} ${x} ${y + r} Q ${x - r * 0.2} ${y + r * 0.2} ${x - r} ${y} Q ${x - r * 0.2} ${y - r * 0.2} ${x} ${y - r} Z" fill="${color}"/>`

// --- The sea -----------------------------------------------------------------------------------

const SEA_A: Record<Stage, () => string> = {
  // A speck of living light.
  0: () => {
    const k = kit()
    return svg(
      k,
      `${halo(k, '#3ef2e0', 22)}
      <circle cx="32" cy="34" r="8.5" fill="${orb(k, 'b', '#e9fffb', '#7ff5ea', '#16b8ab')}"/>
      <circle cx="29" cy="30.5" r="2.4" fill="#fff" opacity="0.8"/>
      ${face(32, 34.5, 0.62, 0)}`,
    )
  },
  // A small fish.
  1: () => {
    const k = kit()
    const body = shade(k, 'b', '#6ff0e4', '#0e8f86')
    return svg(
      k,
      `${halo(k, '#3ef2e0', 24)}
      <path d="M13 34 L23 26 L23 42 Z" fill="${body}"/>
      <ellipse cx="35" cy="34" rx="15" ry="10.5" fill="${body}"/>
      <path d="M24 38 Q 35 46 48 37 Q 36 42 24 38 Z" fill="#c9fbf5" opacity="0.7"/>
      <path d="M32 24.5 Q 37 18 42 25" fill="#3ccfc3"/>
      <ellipse cx="38" cy="29" rx="7" ry="2.4" fill="#fff" opacity="0.28"/>
      ${face(41, 33, 0.85)}`,
    )
  },
  // A bigger fish, with a fin and a bubble.
  2: () => {
    const k = kit()
    const body = shade(k, 'b', '#58e6da', '#0b7a8a')
    return svg(
      k,
      `${halo(k, '#3ef2e0', 28)}
      <path d="M6 35 L19 24 L18 46 Z" fill="${body}"/>
      <ellipse cx="34" cy="35" rx="20" ry="14" fill="${body}"/>
      <path d="M22 42 Q 35 53 52 40 Q 37 47 22 42 Z" fill="#c9fbf5" opacity="0.75"/>
      <path d="M26 22 Q 34 11 43 22 Z" fill="#2fc1b5"/>
      <path d="M30 40 Q 33 46 30 50" stroke="#2fc1b5" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="M24 30 Q 30 26 36 30 M22 36 Q 28 32 34 36" stroke="#e9fffb" stroke-width="1.2" fill="none" opacity="0.35"/>
      <ellipse cx="38" cy="28" rx="9" ry="3" fill="#fff" opacity="0.25"/>
      <circle cx="58" cy="22" r="2.6" fill="none" stroke="#c9fbf5" stroke-width="1"/>
      <circle cx="57.3" cy="21.3" r="0.7" fill="#fff"/>
      ${face(44, 33, 1)}`,
    )
  },
  // The whale, with its spout.
  3: () => {
    const k = kit()
    const body = shade(k, 'b', '#4aa3c4', '#155a78')
    return svg(
      k,
      `${halo(k, '#3ef2e0', 31)}
      <path d="M4 27 Q 9 24 13 30 Q 9 34 4 37 Q 8 32 4 27 Z" fill="#1d6f8a"/>
      <path d="M11 33 C 11 19, 44 15, 57 27 C 61 33, 58 41, 50 44 C 38 49, 20 47, 13 40 C 11 38, 11 36, 11 33 Z" fill="${body}"/>
      <path d="M17 41 C 28 49, 48 48, 57 34 C 54 44, 38 50, 17 41 Z" fill="#cdf3f4"/>
      <path d="M24 44 l 1 2 M30 45.5 l 0.6 2 M36 46 l 0.3 2 M42 45.5 l 0 2" stroke="#8fd6dc" stroke-width="0.9" stroke-linecap="round"/>
      <path d="M30 41 Q 33 48 28 52 Q 26 46 30 41 Z" fill="#1d6f8a"/>
      <ellipse cx="36" cy="24" rx="12" ry="3.4" fill="#fff" opacity="0.2"/>
      <path d="M44 16 q -2 -6 1 -10 M44 16 q 3 -6 8 -7" stroke="#7ff5ea" stroke-width="1.9" fill="none" stroke-linecap="round"/>
      <circle cx="40" cy="7" r="1.3" fill="#c9fbf5"/><circle cx="54" cy="6" r="1.1" fill="#c9fbf5"/><circle cx="47" cy="3" r="0.9" fill="#c9fbf5"/>
      ${face(47, 31, 1.1)}`,
    )
  },
}

const SEA_B: Record<Stage, () => string> = {
  // A bubble with someone inside.
  0: () => {
    const k = kit()
    return svg(
      k,
      `${halo(k, '#3ef2e0', 20)}
      <circle cx="32" cy="34" r="10" fill="${orb(k, 'b', 'rgba(220, 255, 250, 0.35)', 'rgba(120, 240, 230, 0.12)', 'rgba(62, 242, 224, 0.25)')}" stroke="#bff7ee" stroke-width="1.2"/>
      <path d="M25 30 Q 27 26 31 25" stroke="#fff" stroke-width="1.6" fill="none" stroke-linecap="round" opacity="0.85"/>
      ${face(32, 35, 0.6, 0)}`,
    )
  },
  // A seahorse.
  1: () => {
    const k = kit()
    const body = shade(k, 'b', '#5fe0c8', '#13857a')
    return svg(
      k,
      `${halo(k, '#3ef2e0', 24)}
      <path d="M36 14 C 47 14 49 25 42 29 C 49 35 45 50 35 51 C 30 51 29 46 33 44 C 26 41 25 32 31 28 C 26 24 29 14 36 14 Z" fill="${body}"/>
      <path d="M44 20 L 53 19 L 52 23 L 44 23 Z" fill="${body}"/>
      <path d="M31 31 Q 24 33 22 40 Q 27 36 31 36 Z" fill="#9ff7ee" opacity="0.8"/>
      <path d="M38 30 q 3 4 0 8 M39 38 q 3 4 0 7" stroke="#c9fbf5" stroke-width="1" fill="none" opacity="0.5"/>
      <path d="M35 51 q -5 5 -1 9 q 4 1 4 -3" stroke="#13857a" stroke-width="2.4" fill="none" stroke-linecap="round"/>
      <path d="M34 14 l -2 -4 l 3 2 l 2 -4 l 1 5" fill="#3ccfc3"/>
      ${face(38, 21, 0.75)}`,
    )
  },
  // A sea turtle.
  2: () => {
    const k = kit()
    const shell = orb(k, 's', '#7fd29a', '#3f9a62', '#225f3c')
    return svg(
      k,
      `${halo(k, '#3ef2e0', 28)}
      <ellipse cx="14" cy="42" rx="7" ry="3.4" fill="#5fb07c" transform="rotate(20 14 42)"/>
      <ellipse cx="44" cy="47" rx="7" ry="3.4" fill="#5fb07c" transform="rotate(-20 44 47)"/>
      <ellipse cx="18" cy="27" rx="6" ry="3" fill="#5fb07c" transform="rotate(-25 18 27)"/>
      <ellipse cx="31" cy="36" rx="19" ry="13" fill="${shell}"/>
      <path d="M31 25 l 6 5 l -2 7 h -8 l -2 -7 Z M20 31 l 5 -1 l 2 7 l -4 4 l -4 -4 Z M42 31 l -5 -1 l -2 7 l 4 4 l 4 -4 Z" fill="none" stroke="#2c7448" stroke-width="1.2" opacity="0.7"/>
      <ellipse cx="27" cy="29" rx="7" ry="2.4" fill="#fff" opacity="0.2"/>
      <circle cx="53" cy="33" r="7.5" fill="${shade(k, 'h', '#8ee0aa', '#4fa06c')}"/>
      ${face(54, 32, 0.8)}`,
    )
  },
  // An orca, black and white and very pleased.
  3: () => {
    const k = kit()
    const body = shade(k, 'b', '#2a3446', '#05080f')
    return svg(
      k,
      `${halo(k, '#3ef2e0', 31)}
      <path d="M4 28 Q 9 25 13 31 Q 9 35 4 38 Q 8 33 4 28 Z" fill="#0b0f1a"/>
      <path d="M12 33 C 12 19, 45 16, 58 29 C 61 35, 57 42, 49 45 C 37 49, 20 47, 14 40 C 12 38, 12 36, 12 33 Z" fill="${body}"/>
      <path d="M28 21 L 33 6 L 39 21 Z" fill="${body}"/>
      <path d="M18 42 C 30 49, 49 47, 57 35 C 52 44, 38 50, 18 42 Z" fill="#f4fbff"/>
      <ellipse cx="48" cy="26" rx="5" ry="2.8" fill="#f4fbff" transform="rotate(-10 48 26)"/>
      <path d="M22 30 Q 28 27 34 30" stroke="#58607a" stroke-width="1.4" fill="none" opacity="0.6"/>
      <ellipse cx="34" cy="23" rx="10" ry="2.6" fill="#fff" opacity="0.12"/>
      ${face(48, 33, 1, 1, '#f4fbff', '#ff9fb4')}`,
    )
  },
}

// --- The sky -----------------------------------------------------------------------------------

function star5(cx: number, cy: number, r: number, inner = 0.48): string {
  const points: string[] = []
  for (let i = 0; i < 10; i++) {
    const radius = i % 2 ? r * inner : r
    const a = (Math.PI / 5) * i - Math.PI / 2
    points.push(
      `${(cx + Math.cos(a) * radius).toFixed(1)} ${(cy + Math.sin(a) * radius).toFixed(1)}`,
    )
  }
  return points.join(' ')
}

const SKY_A: Record<Stage, () => string> = {
  // A spark.
  0: () => {
    const k = kit()
    return svg(
      k,
      `${halo(k, '#ffd98a', 22)}
      ${twinkle(32, 33, 11, '#fff4d6')}
      ${twinkle(32, 33, 6, '#ffffff')}
      ${face(32, 34, 0.5, 0)}`,
    )
  },
  // A star, a little round at the points.
  1: () => {
    const k = kit()
    return svg(
      k,
      `${halo(k, '#ffd98a', 26)}
      <polygon points="${star5(32, 34, 18)}" fill="${orb(k, 'b', '#fffbe9', '#ffe39f', '#f2b94c')}" stroke="#f7c868" stroke-width="2.5" stroke-linejoin="round"/>
      ${face(32, 35, 0.85)}`,
    )
  },
  // A bright star, with rays.
  2: () => {
    const k = kit()
    return svg(
      k,
      `${halo(k, '#ffd98a', 31)}
      <g stroke="#ffe7b0" stroke-width="1.6" stroke-linecap="round" opacity="0.75">
        <path d="M32 3 v 6 M32 59 v 2 M3 34 h 6 M55 34 h 6 M11 13 l 4 4 M49 51 l 4 4 M53 13 l -4 4 M11 55 l 4 -4"/>
      </g>
      <polygon points="${star5(32, 34, 21)}" fill="${orb(k, 'b', '#fffbe9', '#ffe39f', '#f0b041')}" stroke="#f7c868" stroke-width="3" stroke-linejoin="round"/>
      <ellipse cx="27" cy="27" rx="4" ry="2" fill="#fff" opacity="0.6" transform="rotate(-30 27 27)"/>
      ${face(32, 35, 1)}`,
    )
  },
  // A great round star with twinkles of its own.
  3: () => {
    const k = kit()
    return svg(
      k,
      `${halo(k, '#ffd98a', 32)}
      <polygon points="${star5(32, 34, 25, 0.55)}" fill="${orb(k, 'b', '#fffdf2', '#ffe7a8', '#eba63a')}" stroke="#ffd27a" stroke-width="4" stroke-linejoin="round"/>
      <ellipse cx="25" cy="25" rx="6" ry="2.6" fill="#fff" opacity="0.6" transform="rotate(-30 25 25)"/>
      ${twinkle(8, 12, 4, '#fff4d6')}${twinkle(57, 9, 3, '#fff4d6')}${twinkle(58, 55, 3.4, '#ffe7b0')}
      ${face(32, 35, 1.15)}`,
    )
  },
}

function cloud(k: Kit, x: number, y: number, s: number, top: string, bottom: string): string {
  const fill = shade(k, `cl${String(x)}`, top, bottom)
  return `<path d="M${x - 16 * s} ${y + 8 * s} a ${8 * s} ${8 * s} 0 0 1 ${2 * s} ${-15.5 * s} a ${11 * s} ${11 * s} 0 0 1 ${20 * s} ${-3 * s} a ${8.5 * s} ${8.5 * s} 0 0 1 ${10 * s} ${18.5 * s} Z" fill="${fill}"/>`
}

const SKY_B: Record<Stage, () => string> = {
  // A little dust of light.
  0: () => {
    const k = kit()
    return svg(
      k,
      `${halo(k, '#ffd98a', 20)}
      <circle cx="25" cy="38" r="2.6" fill="#fff4d6"/><circle cx="40" cy="38" r="2.2" fill="#fff4d6" opacity="0.8"/>
      <circle cx="33" cy="31" r="5" fill="${orb(k, 'b', '#ffffff', '#fff4d6', '#e9d6a8')}"/>
      ${face(33, 31.5, 0.42, 0)}`,
    )
  },
  // A small cloud.
  1: () => {
    const k = kit()
    return svg(
      k,
      `${halo(k, '#cfe2ff', 24)}${cloud(k, 32, 36, 0.85, '#ffffff', '#c3d2e6')}${face(32, 34, 0.75)}`,
    )
  },
  // A cloud with a face.
  2: () => {
    const k = kit()
    return svg(
      k,
      `${halo(k, '#cfe2ff', 29)}${cloud(k, 32, 37, 1.1, '#ffffff', '#bccbe0')}
      <ellipse cx="26" cy="24" rx="6" ry="2.2" fill="#fff" opacity="0.7"/>
      ${face(32, 34, 1)}`,
    )
  },
  // A thundercloud that glows, kindly.
  3: () => {
    const k = kit()
    return svg(
      k,
      `${halo(k, '#b9a8ff', 32)}${cloud(k, 32, 34, 1.3, '#f0ecff', '#8e86c2')}
      <path d="M30 46 L 25 56 L 31 54 L 28 63 L 38 50 L 32 52 L 35 46 Z" fill="#ffd98a" stroke="#ffe9b8" stroke-width="0.8" stroke-linejoin="round"/>
      <circle cx="17" cy="50" r="1.2" fill="#cfe2ff"/><circle cx="45" cy="52" r="1.2" fill="#cfe2ff"/>
      ${face(32, 31, 1.15)}`,
    )
  },
}

// --- The garden --------------------------------------------------------------------------------

function petals(
  cx: number,
  cy: number,
  r: number,
  count: number,
  fill: string,
  len = 0.62,
): string {
  return Array.from(
    { length: count },
    (_, i) =>
      `<ellipse cx="${cx}" cy="${cy - r * len}" rx="${r * 0.2}" ry="${r * 0.44}" fill="${fill}" transform="rotate(${(360 / count) * i} ${cx} ${cy})"/>`,
  ).join('')
}

const GARDEN_A: Record<Stage, () => string> = {
  // A seed.
  0: () => {
    const k = kit()
    return svg(
      k,
      `${halo(k, '#f2c94c', 20)}
      <ellipse cx="32" cy="38" rx="9" ry="7" fill="${orb(k, 'b', '#c89566', '#9a6a3c', '#6d4625')}"/>
      <path d="M26 36 Q 32 33 38 36" stroke="#e7c7a0" stroke-width="1" fill="none" opacity="0.6"/>
      ${face(32, 38, 0.55, 0)}`,
    )
  },
  // A sprout.
  1: () => {
    const k = kit()
    const leaf = shade(k, 'l', '#8be06c', '#3e9a3c')
    return svg(
      k,
      `${halo(k, '#9be07a', 24)}
      <ellipse cx="32" cy="54" rx="11" ry="3" fill="#6d4625" opacity="0.6"/>
      <path d="M32 54 v -18" stroke="#4fa64a" stroke-width="2.8" stroke-linecap="round"/>
      <path d="M32 40 q -13 -5 -13 -16 q 12 1 13 16 z" fill="${leaf}"/>
      <path d="M32 36 q 13 -6 12 -17 q -12 2 -12 17 z" fill="${leaf}"/>
      <path d="M31 38 q -6 -4 -9 -10 M33 34 q 5 -4 8 -11" stroke="#c6f2ae" stroke-width="0.9" fill="none" opacity="0.6"/>
      ${face(32, 47, 0.65)}`,
    )
  },
  // A bud.
  2: () => {
    const k = kit()
    return svg(
      k,
      `${halo(k, '#f2c94c', 28)}
      <path d="M32 60 v -26" stroke="#4fa64a" stroke-width="3.2" stroke-linecap="round"/>
      <path d="M32 46 q -13 -3 -14 -14 q 11 0 14 14 z" fill="${shade(k, 'l', '#8be06c', '#3e9a3c')}"/>
      <ellipse cx="32" cy="24" rx="10" ry="13" fill="${orb(k, 'b', '#fff0a8', '#f2c94c', '#c8901f')}"/>
      <path d="M32 11 q 10 7 0 26 q -10 -19 0 -26 z" fill="#5fbf4a" opacity="0.75"/>
      <path d="M23 26 q 2 -10 9 -15 M41 26 q -2 -10 -9 -15" stroke="#4fa64a" stroke-width="1.6" fill="none"/>
      ${face(32, 27, 0.78)}`,
    )
  },
  // The sunflower, with a bee.
  3: () => {
    const k = kit()
    return svg(
      k,
      `${halo(k, '#f2c94c', 32)}
      <path d="M32 63 v -24" stroke="#4fa64a" stroke-width="3.4" stroke-linecap="round"/>
      <path d="M32 52 q -14 -3 -15 -14 q 12 0 15 14 z" fill="${shade(k, 'l', '#8be06c', '#3e9a3c')}"/>
      ${petals(32, 27, 21, 14, '#e9a91f')}
      ${petals(32, 27, 18, 14, shade(k, 'p', '#ffe27a', '#f2b632'))}
      <circle cx="32" cy="27" r="10" fill="${orb(k, 'c', '#8a5a2e', '#5a3a1e', '#3c2512')}"/>
      <g fill="#3c2512" opacity="0.6"><circle cx="28" cy="31" r="0.8"/><circle cx="36" cy="31" r="0.8"/><circle cx="32" cy="33" r="0.8"/></g>
      ${face(32, 26, 0.95, 1, '#ffe27a', '#ff9f6b')}
      <g transform="translate(52 10)">
        <ellipse cx="0" cy="0" rx="4.6" ry="3.4" fill="#f2c94c"/>
        <path d="M-1.6 -3.2 v 6.4 M1.4 -3.2 v 6.4" stroke="#3c2512" stroke-width="1.3"/>
        <ellipse cx="-1" cy="-4.4" rx="2.6" ry="1.6" fill="#e9f6ff" opacity="0.85"/>
        <ellipse cx="2" cy="-4" rx="2.2" ry="1.4" fill="#e9f6ff" opacity="0.7"/>
        <circle cx="3.6" cy="-0.6" r="0.7" fill="#3c2512"/>
      </g>`,
    )
  },
}

const GARDEN_B: Record<Stage, () => string> = {
  // A pebble.
  0: () => {
    const k = kit()
    return svg(
      k,
      `${halo(k, '#f2c94c', 20)}
      <path d="M22 42 q 1 -11 11 -11 q 10 0 10 11 q -10 3 -21 0 z" fill="${orb(k, 'b', '#c5ccd6', '#8f98a3', '#5f6670')}"/>
      <ellipse cx="29" cy="35" rx="3.4" ry="1.4" fill="#fff" opacity="0.5"/>
      ${face(32.5, 38, 0.55, 0)}`,
    )
  },
  // A mushroom.
  1: () => {
    const k = kit()
    return svg(
      k,
      `${halo(k, '#ff8fa3', 24)}
      <path d="M28 50 q -1 -8 1 -14 h 7 q 2 6 1 14 z" fill="${shade(k, 's', '#fff7ea', '#e2d2b8')}"/>
      <path d="M15 37 Q 16 18 32 17 Q 48 18 49 37 Q 32 41 15 37 Z" fill="${orb(k, 'c', '#ff8d8f', '#e63946', '#a61e2b')}"/>
      <circle cx="24" cy="27" r="2.6" fill="#fff" opacity="0.9"/><circle cx="36" cy="23" r="3.2" fill="#fff" opacity="0.9"/><circle cx="42" cy="31" r="2" fill="#fff" opacity="0.9"/>
      ${face(32, 44, 0.62)}`,
    )
  },
  // A fern.
  2: () => {
    const k = kit()
    const frond = shade(k, 'f', '#8be06c', '#3e8e3c')
    const leaves = [0, 1, 2, 3, 4]
      .map(
        (i) =>
          `<path d="M32 ${48 - i * 6} q -${11 - i} -2 -${13 - i} -7 q ${8 - i} 0 ${13 - i} 7 z M32 ${46 - i * 6} q ${11 - i} -2 ${13 - i} -7 q -${8 - i} 0 -${13 - i} 7 z" fill="${frond}"/>`,
      )
      .join('')
    return svg(
      k,
      `${halo(k, '#9be07a', 28)}
      <path d="M32 58 v -36 q 0 -6 4 -8" stroke="#3e8e3c" stroke-width="2.6" fill="none" stroke-linecap="round"/>
      ${leaves}
      ${face(32, 52, 0.62)}`,
    )
  },
  // A tree, round and pleased, with one apple.
  3: () => {
    const k = kit()
    const leaf = orb(k, 'l', '#9be07a', '#4fa64a', '#2c6e2b')
    return svg(
      k,
      `${halo(k, '#9be07a', 32)}
      <path d="M29 62 v -18 q 0 -3 3 -3 q 3 0 3 3 v 18 z" fill="${shade(k, 't', '#8b5e34', '#5a3a1e')}"/>
      <circle cx="20" cy="33" r="11" fill="${leaf}"/>
      <circle cx="44" cy="32" r="12" fill="${leaf}"/>
      <circle cx="32" cy="24" r="16" fill="${leaf}"/>
      <ellipse cx="25" cy="15" rx="7" ry="3" fill="#d9ffc7" opacity="0.35" transform="rotate(-20 25 15)"/>
      <circle cx="47" cy="40" r="3.4" fill="#e63946"/><circle cx="46" cy="39" r="1" fill="#fff" opacity="0.6"/>
      ${face(32, 28, 1)}`,
    )
  },
}

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
