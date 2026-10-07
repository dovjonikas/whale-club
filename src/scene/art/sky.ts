import { face, lit } from '../draw'

/**
 * The sky's finds that needed more than a shared piece: each is inner SVG
 * for a 100x100 box, shaded like the creatures. The lists in
 * scene/collectibles/ say when and where each one appears.
 */

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

export function plane(): string {
  return `<path d="M8 52 L 92 18 L 56 86 L 48 58 Z" fill="#fff4d6"/>
    <path d="M8 52 L 48 58 L 92 18 Z" fill="#d7e1ee"/>
    <path d="M48 58 L 56 86 L 60 62 Z" fill="#b9c6d8"/>
    <path d="M92 18 L 48 58" stroke="#9fb0c6" stroke-width="1"/>
    <path d="M6 62 q -10 6 -4 14 M2 52 q -8 -2 -10 6" stroke="#fff4d6" stroke-width="1" fill="none" stroke-dasharray="2 3" opacity="0.6"/>`
}

export function astronaut(): string {
  const [defs, suit] = lit('#e8f0f5', 0.2, -0.25)
  const [defs2, cloth] = lit('#e63946', 0.25, -0.3)
  return `${defs}${defs2}
    <path d="M36 58 l -14 10 M64 58 l 14 10" stroke="${suit}" stroke-width="9" stroke-linecap="round"/>
    <path d="M42 76 l -4 16 M58 76 l 4 16" stroke="${suit}" stroke-width="9" stroke-linecap="round"/>
    <rect x="34" y="46" width="32" height="34" rx="10" fill="${cloth}"/>
    <path d="M44 48 l 6 6 l 6 -6" stroke="#ffd6d9" stroke-width="2" fill="none"/>
    <circle cx="50" cy="30" r="17" fill="${suit}"/>
    <circle cx="50" cy="31" r="12" fill="#0b1a3a"/>
    <path d="M42 25 q 4 -5 10 -4" stroke="#7fb2ff" stroke-width="2.4" fill="none" stroke-linecap="round" opacity="0.8"/>
    ${face(50, 32, 0.8, '#fff4d6')}`
}

export function owl(): string {
  const [defs, body] = lit('#8b5e34', 0.3, -0.35)
  return `${defs}
    <path d="M30 26 l 6 -14 l 6 12 M70 26 l -6 -14 l -6 12" fill="#6b4a2b"/>
    <ellipse cx="50" cy="56" rx="24" ry="32" fill="${body}"/>
    <ellipse cx="50" cy="66" rx="14" ry="18" fill="#d8b58a" opacity="0.7"/>
    <path d="M42 62 q 4 3 8 0 q 4 3 8 0 M42 70 q 4 3 8 0 q 4 3 8 0" stroke="#8b5e34" stroke-width="1.4" fill="none" opacity="0.7"/>
    <circle cx="40" cy="42" r="10" fill="#fff4d6"/><circle cx="60" cy="42" r="10" fill="#fff4d6"/>
    <g class="eyes"><circle cx="41" cy="43" r="5" fill="#061020"/><circle cx="61" cy="43" r="5" fill="#061020"/><circle cx="42.6" cy="41.4" r="1.6" fill="#fff"/><circle cx="62.6" cy="41.4" r="1.6" fill="#fff"/></g>
    <path d="M50 48 l -4 6 h 8 z" fill="#f2c94c"/>
    <path d="M40 88 v 6 M46 88 v 6 M54 88 v 6 M60 88 v 6" stroke="#f2c94c" stroke-width="2.4" stroke-linecap="round"/>`
}

export function balloon(): string {
  const [defs, cloth] = lit('#ffd98a', 0.35, -0.25)
  const [defs2, basket] = lit('#e63946', 0.25, -0.3)
  return `${defs}${defs2}
    <path d="M50 6 C 18 6, 12 42, 40 64 L 60 64 C 88 42, 82 6, 50 6 Z" fill="${cloth}"/>
    <path d="M50 6 C 38 8, 34 42, 45 64 H 55 C 66 42, 62 8, 50 6 Z" fill="#f2b632" opacity="0.7"/>
    <path d="M28 30 q 22 6 44 0" stroke="#e0a01c" stroke-width="2" fill="none" opacity="0.6"/>
    <ellipse cx="36" cy="22" rx="6" ry="10" fill="#fff" opacity="0.3" transform="rotate(20 36 22)"/>
    <path d="M42 66 l 3 14 M58 66 l -3 14" stroke="#e8f0f5" stroke-width="1.2"/>
    <rect x="40" y="78" width="20" height="14" rx="3" fill="${basket}"/>
    <path d="M46 80 l 4 4 l 4 -4" stroke="#ffd6d9" stroke-width="1.4" fill="none"/>`
}

export function kite(): string {
  const [defs, cloth] = lit('#e63946', 0.3, -0.3)
  return `${defs}
    <path d="M50 6 L 80 40 L 50 74 L 20 40 Z" fill="${cloth}"/>
    <path d="M50 6 L 50 74 M20 40 H 80" stroke="#7a1019" stroke-width="1.6" opacity="0.5"/>
    <path d="M50 6 L 20 40 L 50 40 Z" fill="#fff" opacity="0.15"/>
    <path d="M50 74 q -12 8 -2 14 q 10 6 -2 12" stroke="#e8f0f5" stroke-width="1.2" fill="none"/>
    <path d="M44 84 l 6 2 l -4 4 Z M52 94 l 6 -2 l -2 6 Z" fill="#ffd98a"/>
    ${face(50, 40, 1)}`
}

export function butterfly(): string {
  const [defs, wing] = lit('#e63946', 0.35, -0.3)
  return `${defs}
    <path d="M50 50 q -30 -36 -38 -10 q -2 22 38 10 z M50 50 q 30 -36 38 -10 q 2 22 -38 10 z" fill="${wing}"/>
    <path d="M50 52 q -26 22 -24 34 q 12 6 24 -34 z M50 52 q 26 22 24 34 q -12 6 -24 -34 z" fill="#ff8d8f"/>
    <circle cx="30" cy="36" r="4" fill="#ffd6d9" opacity="0.8"/><circle cx="70" cy="36" r="4" fill="#ffd6d9" opacity="0.8"/>
    <path d="M50 34 v 36" stroke="#3c2512" stroke-width="3.4" stroke-linecap="round"/>
    <path d="M50 34 q -4 -10 -10 -12 M50 34 q 4 -10 10 -12" stroke="#3c2512" stroke-width="1.4" fill="none"/>`
}
