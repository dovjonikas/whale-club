import type { Stage } from '../../store/derive'
import { kit, shade, orb, halo, face, svg } from './kit'

export const SEA_A: Record<Stage, () => string> = {
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

export const SEA_B: Record<Stage, () => string> = {
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
