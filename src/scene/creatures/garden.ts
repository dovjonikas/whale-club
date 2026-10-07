import type { Stage } from '../../store/derive'
import { kit, shade, orb, halo, face, svg } from './kit'

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

export const GARDEN_A: Record<Stage, () => string> = {
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

export const GARDEN_B: Record<Stage, () => string> = {
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
