import { face, lit } from './draw'

/**
 * The later finds (45 days and more), drawn the same way as art.ts. Split
 * from it only to keep each file a size a person can read through.
 */

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
