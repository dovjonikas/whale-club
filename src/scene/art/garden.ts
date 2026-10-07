import { face, lit } from '../draw'

/**
 * The garden's finds that needed more than a shared piece: each is inner SVG
 * for a 100x100 box, shaded like the creatures. The lists in
 * scene/collectibles/ say when and where each one appears.
 */

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

export function rabbit(): string {
  const [defs, fur] = lit('#e8f0f5', 0.2, -0.2)
  return `${defs}
    <path d="M20 96 q 30 -16 60 0 Z" fill="#3f8f3a"/>
    <ellipse cx="40" cy="34" rx="7" ry="22" fill="${fur}"/><ellipse cx="60" cy="34" rx="7" ry="22" fill="${fur}"/>
    <ellipse cx="40" cy="34" rx="3.4" ry="15" fill="#f4b8c1"/><ellipse cx="60" cy="34" rx="3.4" ry="15" fill="#f4b8c1"/>
    <ellipse cx="50" cy="74" rx="22" ry="18" fill="${fur}"/>
    <path d="M24 86 q -4 -8 4 -10 M76 86 q 4 -8 -4 -10" stroke="#5fbf4a" stroke-width="3" fill="none" stroke-linecap="round"/>
    <circle cx="50" cy="76" r="2" fill="#f4b8c1"/>
    ${face(50, 70, 1.2)}`
}

export function cat(): string {
  const [defs, fur] = lit('#3a4050', 0.3, -0.35)
  return `${defs}
    <rect x="6" y="70" width="88" height="8" rx="2" fill="#6b4a2b"/>
    <path d="M14 66 q -12 0 -8 -10" stroke="${fur}" stroke-width="6" fill="none" stroke-linecap="round"/>
    <ellipse cx="44" cy="58" rx="30" ry="14" fill="${fur}"/>
    <circle cx="74" cy="52" r="13" fill="${fur}"/>
    <path d="M64 44 l 2 -12 l 8 8 z M84 44 l -2 -12 l -8 8 z" fill="${fur}"/>
    <path d="M66 43 l 1.4 -6 l 4 4 z M82 43 l -1.4 -6 l -4 4 z" fill="#f4b8c1" opacity="0.7"/>
    <path d="M67 53 q 3 2 6 0 M76 53 q 3 2 6 0" stroke="#e8f0f5" stroke-width="1.4" fill="none" stroke-linecap="round"/>
    <path d="M72 58 q 2 2 4 0" stroke="#e8f0f5" stroke-width="1" fill="none"/>
    <path d="M84 30 h 6 l -6 7 h 6 M92 20 h 4 l -4 5 h 4" stroke="#cfe2ff" stroke-width="1.4" fill="none" opacity="0.8"/>`
}

export function tree(): string {
  const [defs, leaf] = lit('#4fa64a', 0.35, -0.35)
  return `${defs}
    <path d="M44 96 V 56 q 0 -4 4 -4 q 4 0 4 4 V 96 Z" fill="#6b4a2b"/>
    <path d="M48 66 l -18 -16 M52 64 l 16 -12" stroke="#6b4a2b" stroke-width="5" stroke-linecap="round"/>
    <circle cx="28" cy="42" r="16" fill="${leaf}"/><circle cx="70" cy="40" r="18" fill="${leaf}"/><circle cx="48" cy="28" r="22" fill="${leaf}"/>
    <ellipse cx="40" cy="16" rx="10" ry="4" fill="#d9ffc7" opacity="0.35" transform="rotate(-20 40 16)"/>
    <path d="M62 52 v 30 M76 50 v 32" stroke="#e8f0f5" stroke-width="1.2"/>
    <rect x="58" y="80" width="22" height="4" rx="1.5" fill="#8b5e34"/>`
}

export function lantern(): string {
  return `<path d="M50 96 V 40" stroke="#4a3624" stroke-width="5"/>
    <circle cx="50" cy="32" r="26" fill="#ffd98a" opacity="0.18"/>
    <path d="M38 22 h 24 l -3 22 h -18 z" fill="#ffe7a0"/>
    <path d="M38 22 h 24 l -3 22 h -18 z" fill="none" stroke="#4a3624" stroke-width="2.4"/>
    <path d="M36 18 h 28 l -4 -6 h -20 z" fill="#4a3624"/>
    <circle cx="50" cy="34" r="4" fill="#fff4d6"/>`
}

export function bench(): string {
  const [defs, wood] = lit('#8b5e34', 0.3, -0.3)
  return `${defs}
    <rect x="10" y="32" width="80" height="9" rx="3" fill="${wood}"/>
    <rect x="10" y="46" width="80" height="9" rx="3" fill="${wood}"/>
    <rect x="8" y="58" width="84" height="8" rx="3" fill="${wood}"/>
    <path d="M18 66 v 26 M82 66 v 26 M18 41 v 17 M82 41 v 17" stroke="#5a3a1e" stroke-width="5" stroke-linecap="round"/>
    <path d="M14 36 h 70" stroke="#fff" stroke-width="1.2" opacity="0.25"/>`
}

export function treehouse(): string {
  const [defs, wood] = lit('#8b5e34', 0.25, -0.3)
  return `${defs}
    <path d="M46 98 V 70 h 8 V 98 Z" fill="#5a3a1e"/>
    <path d="M18 70 L 22 36 H 78 L 82 70 Z" fill="${wood}"/>
    <path d="M12 38 L 50 10 L 88 38 Z" fill="#c4743a"/>
    <path d="M24 46 h 52 M23 56 h 54" stroke="#5a3a1e" stroke-width="1" opacity="0.5"/>
    <circle cx="50" cy="51" r="14" fill="#ffd98a" opacity="0.22"/>
    <rect x="42" y="44" width="16" height="14" rx="2" fill="#ffe7a0"/>
    <path d="M50 44 v 14 M42 51 h 16" stroke="#5a3a1e" stroke-width="1.6"/>
    <path d="M30 70 v 26 M34 74 h -4 M34 80 h -4 M34 86 h -4 M34 92 h -4" stroke="#8b5e34" stroke-width="2"/>`
}

export function greenhouse(): string {
  return `<path d="M14 94 V 52 L 50 24 L 86 52 V 94 Z" fill="#3ef2e0" opacity="0.18"/>
    <circle cx="50" cy="62" r="34" fill="#9be07a" opacity="0.12"/>
    <path d="M14 94 V 52 L 50 24 L 86 52 V 94 Z M50 24 V 94 M14 72 H 86 M32 38 V 94 M68 38 V 94" stroke="#e8f0f5" stroke-width="2" fill="none" opacity="0.7"/>
    <path d="M24 92 q 0 -10 6 -12 M40 92 q 2 -14 8 -14 M60 92 q -2 -12 6 -14 M74 92 q 0 -8 6 -10" stroke="#5fbf4a" stroke-width="3" fill="none" stroke-linecap="round"/>`
}
