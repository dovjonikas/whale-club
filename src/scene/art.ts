import { face, lit } from './draw'

/**
 * The finds that needed more than a shared piece: each is inner SVG for a
 * 100x100 box, shaded like the creatures. Used by collectibles.ts.
 */

export function seahorse(): string {
  const [defs, body] = lit('#2fc1b5', 0.35, -0.35)
  return `${defs}
    <path d="M22 96 C 14 70, 30 52, 22 26" stroke="#3e9a3c" stroke-width="4" fill="none" stroke-linecap="round"/>
    <path d="M22 60 q -10 -4 -12 -14 M22 40 q 10 -6 12 -16" stroke="#5fbf4a" stroke-width="3" fill="none" stroke-linecap="round"/>
    <path d="M56 14 C 72 14 75 30 66 36 C 76 44 70 66 56 67 C 49 67 48 61 53 58 C 43 54 41 42 49 37 C 42 31 46 14 56 14 Z" fill="${body}"/>
    <path d="M67 22 L 82 21 L 80 27 L 67 27 Z" fill="${body}"/>
    <path d="M49 39 Q 39 42 37 52 Q 44 46 50 47 Z" fill="#9ff7ee" opacity="0.8"/>
    <path d="M56 67 q -8 8 -2 14 q 6 2 6 -4" stroke="#13857a" stroke-width="3.4" fill="none" stroke-linecap="round"/>
    <path d="M52 15 l -3 -6 l 5 3 l 3 -6 l 2 7" fill="#3ccfc3"/>
    ${face(60, 24, 1.05)}`
}

export function crab(): string {
  const [defs, shell] = lit('#e85d4f', 0.3, -0.35)
  return `${defs}
    <path d="M30 56 l -16 -8 M70 56 l 16 -8 M32 64 l -16 8 M68 64 l 16 8 M36 70 l -8 12 M64 70 l 8 12" stroke="#c23a30" stroke-width="4.5" stroke-linecap="round"/>
    <path d="M24 40 q -12 -2 -12 -14 q 10 -2 14 6 l -4 4 q 4 4 2 4 z" fill="${shell}"/>
    <path d="M76 40 q 12 -2 12 -14 q -10 -2 -14 6 l 4 4 q -4 4 -2 4 z" fill="${shell}"/>
    <ellipse cx="50" cy="60" rx="26" ry="16" fill="${shell}"/>
    <ellipse cx="44" cy="53" rx="10" ry="3.4" fill="#fff" opacity="0.3"/>
    <path d="M42 46 v -10 M58 46 v -10" stroke="#c23a30" stroke-width="3" stroke-linecap="round"/>
    <circle cx="42" cy="34" r="5" fill="#fff"/><circle cx="58" cy="34" r="5" fill="#fff"/>
    <circle cx="43" cy="35" r="2.6" fill="#061020"/><circle cx="59" cy="35" r="2.6" fill="#061020"/>
    <ellipse cx="38" cy="64" rx="3.4" ry="2" fill="#ffb3a8" opacity="0.7"/><ellipse cx="62" cy="64" rx="3.4" ry="2" fill="#ffb3a8" opacity="0.7"/>
    <path d="M45 64 q 5 5 10 0" stroke="#061020" stroke-width="2" fill="none" stroke-linecap="round"/>`
}

export function anchor(): string {
  const [defs, brass] = lit('#c9a86a', 0.35, -0.4)
  return `${defs}
    <ellipse cx="50" cy="90" rx="38" ry="8" fill="#c9a86a" opacity="0.5"/>
    <path d="M50 26 v 58" stroke="${brass}" stroke-width="8" stroke-linecap="round"/>
    <path d="M32 44 h 36" stroke="${brass}" stroke-width="7" stroke-linecap="round"/>
    <path d="M20 62 q 30 34 60 0" stroke="${brass}" stroke-width="8" fill="none" stroke-linecap="round"/>
    <path d="M14 58 l 8 2 l -2 8 Z M86 58 l -8 2 l 2 8 Z" fill="#a8864e"/>
    <circle cx="50" cy="18" r="8" stroke="${brass}" stroke-width="6" fill="none"/>
    <path d="M58 18 q 18 6 14 26 q -3 12 6 20" stroke="#8b6a3e" stroke-width="2.4" fill="none" stroke-dasharray="3 2"/>
    <path d="M46 30 v 40" stroke="#fff4d6" stroke-width="1.6" opacity="0.4" stroke-linecap="round"/>`
}

export function turtle(): string {
  const [defs, shell] = lit('#4fa66c', 0.35, -0.35)
  return `${defs}
    <ellipse cx="22" cy="66" rx="12" ry="5" fill="#5fb07c" transform="rotate(25 22 66)"/>
    <ellipse cx="66" cy="72" rx="12" ry="5" fill="#5fb07c" transform="rotate(-20 66 72)"/>
    <ellipse cx="26" cy="38" rx="10" ry="4.6" fill="#5fb07c" transform="rotate(-25 26 38)"/>
    <ellipse cx="46" cy="52" rx="30" ry="21" fill="${shell}"/>
    <path d="M46 34 l 9 8 l -3 11 h -12 l -3 -11 Z M28 44 l 8 -2 l 3 11 l -6 6 l -6 -6 Z M64 44 l -8 -2 l -3 11 l 6 6 l 6 -6 Z" fill="none" stroke="#2c7448" stroke-width="1.8" opacity="0.7"/>
    <ellipse cx="38" cy="40" rx="11" ry="4" fill="#fff" opacity="0.22"/>
    <circle cx="82" cy="46" r="11" fill="#6fc28c"/>
    ${face(83, 45, 1.15)}`
}

export function satellite(): string {
  const [defs, foil] = lit('#e8c56a', 0.4, -0.3)
  const panel = (x: number): string =>
    `<rect x="${x}" y="42" width="30" height="16" rx="2" fill="#2a5aa8"/><path d="M${x + 10} 42 v 16 M${x + 20} 42 v 16 M${x} 50 h 30" stroke="#7fb2ff" stroke-width="1" opacity="0.7"/>`
  return `${defs}${panel(6)}${panel(64)}
    <path d="M36 50 h 4 M60 50 h 4" stroke="#cfd8e3" stroke-width="2"/>
    <rect x="40" y="38" width="20" height="24" rx="3" fill="${foil}"/>
    <path d="M50 38 v -10" stroke="#cfd8e3" stroke-width="1.6"/><circle cx="50" cy="26" r="2.4" fill="#ff5a64"/>
    <rect x="43" y="41" width="6" height="18" rx="1" fill="#fff" opacity="0.25"/>`
}

export function planet(): string {
  const [defs, body] = lit('#e0a96d', 0.3, -0.35)
  return `${defs}
    <ellipse cx="50" cy="52" rx="44" ry="11" stroke="#c9a86a" stroke-width="4" fill="none" transform="rotate(-16 50 52)" opacity="0.5"/>
    <circle cx="50" cy="50" r="24" fill="${body}"/>
    <path d="M28 44 q 22 -6 44 0 M27 54 q 23 6 46 0" stroke="#b97a40" stroke-width="3" fill="none" opacity="0.55"/>
    <ellipse cx="42" cy="38" rx="8" ry="3.4" fill="#fff" opacity="0.35"/>
    <path d="M7 64 Q 50 74 93 40" stroke="#f0d49a" stroke-width="4" fill="none" stroke-linecap="round" transform="rotate(-2 50 52)"/>`
}

export function smallMoon(): string {
  const [defs, body] = lit('#d9c8a9', 0.3, -0.3)
  return `${defs}
    <circle cx="50" cy="50" r="38" fill="#fff4d6" opacity="0.12"/>
    <circle cx="50" cy="50" r="26" fill="${body}"/>
    <circle cx="40" cy="42" r="5" fill="#b9a988" opacity="0.7"/><circle cx="60" cy="58" r="7" fill="#b9a988" opacity="0.6"/><circle cx="56" cy="38" r="3" fill="#b9a988" opacity="0.6"/>
    <ellipse cx="42" cy="34" rx="8" ry="3" fill="#fff" opacity="0.35"/>`
}

export function sprout(): string {
  const [defs, leaf] = lit('#5fbf4a', 0.35, -0.3)
  return `${defs}
    <ellipse cx="50" cy="94" rx="20" ry="5" fill="#8b6a3e" opacity="0.6"/>
    <path d="M50 94 v -34" stroke="#4fa64a" stroke-width="4" stroke-linecap="round"/>
    <path d="M50 66 q -22 -8 -22 -28 q 20 2 22 28 z" fill="${leaf}"/>
    <path d="M50 60 q 22 -10 20 -30 q -20 3 -20 30 z" fill="${leaf}"/>
    ${face(50, 80, 1.1)}`
}

export function bees(): string {
  const bee = (x: number, y: number, s: number): string =>
    `<g transform="translate(${x} ${y}) scale(${s})">
      <ellipse cx="-3" cy="-9" rx="7" ry="4.5" fill="#e9f6ff" opacity="0.85" transform="rotate(-20 -3 -9)"/>
      <ellipse cx="5" cy="-8" rx="6" ry="4" fill="#e9f6ff" opacity="0.7" transform="rotate(20 5 -8)"/>
      <ellipse cx="0" cy="0" rx="10" ry="7.5" fill="#f2c94c"/>
      <path d="M-3 -7 v 14 M3 -7 v 14" stroke="#3c2512" stroke-width="2.6"/>
      <circle cx="8" cy="-1.5" r="1.4" fill="#3c2512"/><circle cx="8.4" cy="-2" r="0.5" fill="#fff"/>
      <path d="M-10 0 l -4 0" stroke="#3c2512" stroke-width="1.6" stroke-linecap="round"/>
    </g>`
  return `<path d="M20 40 q 20 -20 40 -6 q 16 10 30 -8" stroke="#fff4d6" stroke-width="1" fill="none" stroke-dasharray="2 4" opacity="0.5"/>
    ${bee(26, 42, 1)}${bee(62, 30, 0.85)}${bee(76, 66, 0.75)}`
}

export function mushroom(): string {
  const [defs, cap] = lit('#e63946', 0.35, -0.35)
  return `${defs}
    <circle cx="50" cy="52" r="40" fill="#ff8fa3" opacity="0.12"/>
    <path d="M42 92 q -2 -16 2 -30 h 12 q 4 14 2 30 z" fill="#f6ead6"/>
    <path d="M16 62 Q 18 26 50 24 Q 82 26 84 62 Q 50 70 16 62 Z" fill="${cap}"/>
    <circle cx="34" cy="44" r="5" fill="#fff" opacity="0.92"/><circle cx="56" cy="36" r="6" fill="#fff" opacity="0.92"/><circle cx="70" cy="52" r="4" fill="#fff" opacity="0.92"/>
    <ellipse cx="38" cy="32" rx="9" ry="3" fill="#fff" opacity="0.3" transform="rotate(-15 38 32)"/>
    ${face(50, 76, 1)}`
}

export function roses(): string {
  const [defs, bush] = lit('#3f8f3a', 0.3, -0.35)
  const rose = (x: number, y: number, r: number): string =>
    `<circle cx="${x}" cy="${y}" r="${r}" fill="#e63946"/><path d="M${x - r * 0.5} ${y} a ${r * 0.5} ${r * 0.5} 0 1 1 ${r * 0.5} ${r * 0.4} a ${r * 0.25} ${r * 0.25} 0 1 1 ${r * 0.1} ${-r * 0.4}" stroke="#a61e2b" stroke-width="1.6" fill="none"/><circle cx="${x - r * 0.35}" cy="${y - r * 0.35}" r="${r * 0.25}" fill="#ff8d8f" opacity="0.6"/>`
  return `${defs}
    <ellipse cx="50" cy="62" rx="38" ry="28" fill="${bush}"/>
    <path d="M24 60 q 6 -6 12 -2 M60 74 q 6 -6 12 -2 M44 46 q 6 -6 12 -2" stroke="#5fbf4a" stroke-width="2" fill="none" opacity="0.6"/>
    ${rose(34, 52, 9)}${rose(60, 44, 10)}${rose(52, 70, 9)}${rose(74, 64, 7)}`
}

export function snail(): string {
  const [defs, shell] = lit('#c9a86a', 0.3, -0.35)
  return `${defs}
    <path d="M8 82 q 16 -14 46 -4 q 26 8 38 0 q -2 8 -12 10 l -66 2 z" fill="#9fd08a"/>
    <path d="M18 76 l -8 -18 M28 74 l 0 -18" stroke="#9fd08a" stroke-width="3" stroke-linecap="round"/>
    <circle cx="10" cy="56" r="3" fill="#9fd08a"/><circle cx="28" cy="54" r="3" fill="#9fd08a"/>
    <circle cx="58" cy="56" r="24" fill="${shell}"/>
    <path d="M58 56 m -14 0 a 14 14 0 1 1 14 14 a 9 9 0 1 1 -2 -16 a 4 4 0 1 1 4 5" stroke="#8b6a3e" stroke-width="3" fill="none" stroke-linecap="round"/>
    <ellipse cx="50" cy="40" rx="9" ry="3" fill="#fff" opacity="0.35" transform="rotate(-20 50 40)"/>
    ${face(24, 70, 0.9)}`
}
