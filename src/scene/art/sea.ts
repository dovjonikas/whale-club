import { face, lit } from '../draw'

/**
 * The sea's finds that needed more than a shared piece: each is inner SVG
 * for a 100x100 box, shaded like the creatures. The lists in
 * scene/collectibles/ say when and where each one appears.
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

export function dolphin(): string {
  const [defs, body] = lit('#7fa8c9', 0.3, -0.35)
  return `${defs}
    <path d="M12 60 l -8 -10 l 12 4 Z M12 60 l -8 8 l 12 -2 Z" fill="#5f88a9"/>
    <path d="M12 60 C 22 38, 58 30, 84 44 C 92 48, 94 52, 90 54 L 78 56 C 66 64, 36 68, 12 60 Z" fill="${body}"/>
    <path d="M24 62 C 40 66, 64 62, 78 56 C 64 58, 42 62, 24 62 Z" fill="#e8f0f5" opacity="0.8"/>
    <path d="M46 36 l 10 -16 l 4 18 z" fill="#5f88a9"/>
    <path d="M50 58 q 2 10 -4 14 q -2 -8 4 -14 z" fill="#5f88a9"/>
    <ellipse cx="54" cy="42" rx="16" ry="3" fill="#fff" opacity="0.25"/>
    <circle cx="74" cy="46" r="2.6" fill="#061020"/><circle cx="74.8" cy="45.2" r="0.9" fill="#fff"/>
    <path d="M80 52 q 4 3 9 1" stroke="#061020" stroke-width="1.6" fill="none" stroke-linecap="round"/>`
}

export function lighthouse(): string {
  const [defs, tower] = lit('#e8f0f5', 0.2, -0.25)
  return `${defs}
    <path d="M50 30 L -40 6 L -40 54 Z" fill="#ffd98a" opacity="0.18" class="beam"/>
    <path d="M36 96 L 42 34 H 58 L 64 96 Z" fill="${tower}"/>
    <path d="M40 54 H 60 L 61 64 H 39 Z M38 76 H 62 L 63 86 H 37 Z" fill="#e63946"/>
    <rect x="40" y="22" width="20" height="14" rx="2" fill="#2a2f3a"/>
    <rect x="43" y="24" width="14" height="10" rx="1" fill="#ffe7a0"/>
    <circle cx="50" cy="29" r="9" fill="#ffd98a" opacity="0.35"/>
    <path d="M38 22 L 50 12 L 62 22 Z" fill="#c23a30"/>
    <path d="M45 40 v 50" stroke="#fff" stroke-width="2" opacity="0.35"/>`
}

export function octopus(): string {
  const [defs, body] = lit('#c96a86', 0.3, -0.35)
  const arm = (x: number, bend: number): string =>
    `<path d="M${x} 56 q ${bend} 16 ${bend * 0.4} 30 q ${-bend * 0.3} 6 ${-bend * 0.6} 0" stroke="${body}" stroke-width="8" fill="none" stroke-linecap="round"/>`
  return `${defs}
    <path d="M6 96 Q 50 60 94 96 Z" fill="#0b1426"/>
    ${arm(28, -10)}${arm(40, -5)}${arm(52, 4)}${arm(64, 9)}${arm(74, 12)}
    <ellipse cx="50" cy="40" rx="26" ry="24" fill="${body}"/>
    <ellipse cx="42" cy="26" rx="9" ry="4" fill="#fff" opacity="0.3" transform="rotate(-20 42 26)"/>
    <circle cx="62" cy="30" r="2.4" fill="#e7a0b4"/><circle cx="68" cy="38" r="1.8" fill="#e7a0b4"/>
    ${face(50, 44, 1.5)}`
}

export function manta(): string {
  const [defs, body] = lit('#2b5580', 0.3, -0.4)
  return `${defs}
    <path d="M4 50 Q 26 18 50 38 Q 74 18 96 50 Q 74 64 50 60 Q 26 64 4 50 Z" fill="${body}"/>
    <path d="M30 50 Q 50 58 70 50 Q 50 62 30 50 Z" fill="#e8f0f5" opacity="0.5"/>
    <path d="M50 60 q -3 18 2 34" stroke="#1b3a5c" stroke-width="2" fill="none"/>
    <path d="M42 38 q -4 -6 -2 -10 M58 38 q 4 -6 2 -10" stroke="#1b3a5c" stroke-width="3" fill="none" stroke-linecap="round"/>
    <ellipse cx="34" cy="38" rx="10" ry="3" fill="#fff" opacity="0.18"/>
    ${face(50, 46, 1)}`
}

export function narwhal(): string {
  const [defs, body] = lit('#9aa8be', 0.3, -0.35)
  return `${defs}
    <path d="M78 42 L 98 26" stroke="#fff4d6" stroke-width="3.4" stroke-linecap="round"/>
    <path d="M80 41 l 4 -3 M85 37 l 4 -3 M90 33 l 3 -2" stroke="#c9b98a" stroke-width="1"/>
    <path d="M10 46 l -8 -10 l 14 4 Z M10 46 l -8 10 l 14 -4 Z" fill="#7e8ca2"/>
    <path d="M12 48 C 14 30, 62 26, 80 42 C 82 54, 60 62, 34 60 C 20 58, 12 54, 12 48 Z" fill="${body}"/>
    <path d="M22 56 C 40 62, 64 60, 80 48 C 72 60, 46 64, 22 56 Z" fill="#e8f0f5" opacity="0.7"/>
    <circle cx="36" cy="40" r="1.6" fill="#6f7d92"/><circle cx="46" cy="36" r="1.2" fill="#6f7d92"/><circle cx="28" cy="44" r="1.4" fill="#6f7d92"/>
    ${face(68, 46, 1)}`
}

export function calf(): string {
  const [defs, body] = lit('#4aa3c4', 0.3, -0.35)
  return `${defs}
    <path d="M14 48 l -8 -8 l 4 10 l -4 8 Z" fill="#1d6f8a"/>
    <path d="M14 50 C 14 32, 64 28, 82 44 C 86 54, 66 62, 38 60 C 22 59, 14 56, 14 50 Z" fill="${body}"/>
    <path d="M24 58 C 44 64, 70 60, 82 48 C 76 60, 50 64, 24 58 Z" fill="#cdf3f4"/>
    <path d="M60 30 q -2 -6 1 -9" stroke="#7ff5ea" stroke-width="1.8" fill="none" stroke-linecap="round"/>
    ${face(68, 46, 1.1)}`
}

export function ship(): string {
  const [defs, hull] = lit('#3a4050', 0.25, -0.4)
  return `${defs}
    <path d="M6 96 Q 50 70 94 96 Z" fill="#0b1426"/>
    <g transform="rotate(-8 50 66)">
      <path d="M12 74 L 22 56 H 80 L 90 74 Z" fill="${hull}"/>
      <path d="M48 56 V 18 M48 24 h 26 M48 36 h 20" stroke="#3a4050" stroke-width="3"/>
      <path d="M50 26 L 72 28 L 70 36 L 50 34 Z" fill="#e8f0f5" opacity="0.25"/>
    </g>
    <g fill="#3ef2e0" opacity="0.25"><circle cx="30" cy="66" r="6"/><circle cx="46" cy="64" r="6"/><circle cx="62" cy="62" r="6"/></g>
    <g fill="#3ef2e0"><circle cx="30" cy="66" r="2.4"/><circle cx="46" cy="64" r="2.4"/><circle cx="62" cy="62" r="2.4"/></g>`
}
