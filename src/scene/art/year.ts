import { dots, face, lit, star5 } from '../draw'

/**
 * The finds at 240, 300 and 365 days, three for every line: the end of the
 * first year. Drawn in the same hand as the rest (src/scene/art): light from
 * the top left, a pale highlight, a face on anything alive. A 100 box each.
 */

// --- the sea, line A --------------------------------------------------------------------------

export function otter(): string {
  const [defs, fur] = lit('#8a5a3c', 0.3, -0.3)
  return `${defs}
    <ellipse cx="50" cy="70" rx="40" ry="6" fill="#3ef2e0" opacity="0.2"/>
    <ellipse cx="50" cy="60" rx="34" ry="13" fill="${fur}"/>
    <circle cx="80" cy="52" r="12" fill="${fur}"/>
    <ellipse cx="80" cy="56" rx="7" ry="5" fill="#e2c3a0"/>
    <path d="M38 50 q 6 -6 14 -2" stroke="#fff" stroke-width="2.4" opacity="0.3" fill="none" stroke-linecap="round"/>
    <ellipse cx="54" cy="50" rx="8" ry="5" fill="#f4d9c4"/>
    <path d="M48 50 q 6 -6 12 0" stroke="#c9a86a" stroke-width="2" fill="none"/>
    ${face(80, 51, 0.8)}`
}

export function seal(): string {
  const [defs, coat] = lit('#9aa7b8', 0.3, -0.3)
  const [defs2, rock] = lit('#5a6170', 0.2, -0.3)
  return `${defs}${defs2}
    <path d="M8 90 Q 20 62 50 64 Q 82 62 94 90 Z" fill="${rock}"/>
    <path d="M18 70 C 22 50, 56 42, 76 46 C 88 48, 90 60, 84 66 C 70 72, 30 76, 18 70 Z" fill="${coat}"/>
    <path d="M18 70 L 6 62 L 10 74 Z" fill="${coat}"/>
    <path d="M30 56 q 14 -8 30 -8" stroke="#fff" stroke-width="2.4" opacity="0.35" fill="none" stroke-linecap="round"/>
    <path d="M70 58 q 4 3 8 0 M76 56 q 4 3 8 0" stroke="#061020" stroke-width="1.6" fill="none" stroke-linecap="round"/>
    <circle cx="86" cy="60" r="2" fill="#061020"/>`
}

export function pod(): string {
  const whale = (x: number, y: number, w: number, color: string): string => {
    const [defs, body] = lit(color, 0.3, -0.3)
    return `${defs}<path d="M${String(x - w * 0.5)} ${String(y)} L ${String(x - w * 0.68)} ${String(y - w * 0.14)} Q ${String(x - w * 0.6)} ${String(y)} ${String(x - w * 0.68)} ${String(y + w * 0.14)} Z" fill="${body}"/>
      <ellipse cx="${String(x)}" cy="${String(y)}" rx="${String(w * 0.48)}" ry="${String(w * 0.24)}" fill="${body}"/>
      <ellipse cx="${String(x + w * 0.04)}" cy="${String(y + w * 0.1)}" rx="${String(w * 0.32)}" ry="${String(w * 0.08)}" fill="#dff4fa" opacity="0.6"/>
      ${face(x + w * 0.26, y - w * 0.04, w / 40)}`
  }
  return `${whale(44, 40, 52, '#3f8fb0')}${whale(70, 66, 36, '#5fb6d6')}${whale(28, 72, 30, '#5fb6d6')}`
}

// --- the sea, line B --------------------------------------------------------------------------

export function puffer(): string {
  const [defs, body] = lit('#f2c94c', 0.35, -0.3)
  const spikes = Array.from({ length: 12 }, (_, i) => {
    const a = (i / 12) * Math.PI * 2
    const x1 = 50 + Math.cos(a) * 24
    const y1 = 52 + Math.sin(a) * 24
    const x2 = 50 + Math.cos(a) * 31
    const y2 = 52 + Math.sin(a) * 31
    return `<path d="M${x1.toFixed(1)} ${y1.toFixed(1)} L ${x2.toFixed(1)} ${y2.toFixed(1)}" stroke="#c99a2e" stroke-width="2.4" stroke-linecap="round"/>`
  }).join('')
  return `${defs}${spikes}
    <path d="M22 52 L 10 42 L 12 62 Z" fill="#e0a83a"/>
    <circle cx="50" cy="52" r="25" fill="${body}"/>
    <ellipse cx="54" cy="62" rx="15" ry="9" fill="#fff4d6" opacity="0.7"/>
    <path d="M36 40 q 8 -8 18 -8" stroke="#fff" stroke-width="2.4" opacity="0.5" fill="none" stroke-linecap="round"/>
    ${face(58, 48, 1.1)}`
}

export function coral(): string {
  const branch = (x: number, h: number, color: string): string =>
    `<path d="M${String(x)} 92 V ${String(92 - h)} M${String(x)} ${String(92 - h * 0.55)} q -12 -6 -14 -${String(h * 0.4)} M${String(x)} ${String(92 - h * 0.7)} q 12 -4 14 -${String(h * 0.35)}" stroke="${color}" stroke-width="7" stroke-linecap="round" fill="none"/>`
  return `<ellipse cx="50" cy="92" rx="40" ry="6" fill="#20384f"/>
    ${branch(34, 52, '#ff8f7a')}${branch(64, 64, '#e7739b')}${branch(50, 36, '#ffb07a')}
    ${dots(
      [
        [22, 40, 1.6],
        [78, 30, 1.4],
      ],
      '#3ef2e0',
    )}`
}

export function orca(): string {
  return `<path d="M12 56 L 2 44 Q 6 56 2 68 Z" fill="#0f1726"/>
    <path d="M10 56 C 14 34, 56 28, 82 38 C 96 44, 98 60, 86 66 C 64 76, 22 72, 10 56 Z" fill="#141c2c"/>
    <path d="M50 36 L 56 14 L 62 38 Z" fill="#141c2c"/>
    <path d="M26 64 C 44 72, 72 72, 88 62 C 76 74, 40 76, 26 64 Z" fill="#f4f8ff"/>
    <ellipse cx="74" cy="46" rx="8" ry="4" fill="#f4f8ff"/>
    <path d="M30 44 C 42 38, 58 36, 70 38" stroke="#fff" stroke-width="2" opacity="0.25" fill="none" stroke-linecap="round"/>
    ${face(80, 52, 1, '#f4f8ff')}`
}

// --- the sky, line A --------------------------------------------------------------------------

export function rocket(): string {
  const [defs, hull] = lit('#e8f0f5', 0.25, -0.25)
  return `${defs}
    <path d="M50 82 Q 44 94 50 100 Q 56 94 50 82 Z" fill="#ffb46e"/>
    <path d="M50 8 C 64 22, 66 52, 60 78 H 40 C 34 52, 36 22, 50 8 Z" fill="${hull}"/>
    <path d="M40 62 L 28 80 L 40 76 Z M60 62 L 72 80 L 60 76 Z" fill="#e85d4f"/>
    <circle cx="50" cy="40" r="8" fill="#8ef0e4" stroke="#9fb2c8" stroke-width="3"/>
    <path d="M44 20 q 4 -6 8 -6" stroke="#fff" stroke-width="2.4" opacity="0.6" fill="none" stroke-linecap="round"/>`
}

export function ringed(): string {
  const [defs, ball] = lit('#e7b07a', 0.3, -0.35)
  return `${defs}
    <ellipse cx="50" cy="52" rx="44" ry="11" fill="none" stroke="#d9c49a" stroke-width="5" opacity="0.6"/>
    <circle cx="50" cy="50" r="24" fill="${ball}"/>
    <path d="M28 46 q 22 6 44 0 M30 56 q 20 6 40 0" stroke="#fff" stroke-width="2" opacity="0.25" fill="none"/>
    <path d="M6 52 Q 50 70 94 52" fill="none" stroke="#f1dfb4" stroke-width="5"/>`
}

export function galaxy(): string {
  const arms = [0, 1, 2]
    .map(
      (i) =>
        `<path d="M50 50 C ${String(60 + i * 4)} ${String(30 - i * 4)}, ${String(84 - i * 6)} ${String(40 + i * 8)}, ${String(80 - i * 10)} ${String(66 + i * 4)}" stroke="#c8b6ff" stroke-width="${String(5 - i)}" fill="none" opacity="${String(0.5 - i * 0.1)}" transform="rotate(${String(i * 120)} 50 50)" stroke-linecap="round"/>`,
    )
    .join('')
  return `<circle cx="50" cy="50" r="40" fill="#c8b6ff" opacity="0.1"/>${arms}
    <circle cx="50" cy="50" r="7" fill="#fff4d6"/>
    <circle cx="50" cy="50" r="14" fill="#ffd98a" opacity="0.3"/>
    ${dots(
      [
        [26, 30, 1.2],
        [74, 70, 1.2],
        [70, 26, 1],
        [28, 72, 1],
      ],
      '#fff4d6',
    )}`
}

// --- the sky, line B --------------------------------------------------------------------------

export function silverCloud(): string {
  const [defs, cloud] = lit('#dfe8f5', 0.3, -0.2)
  return `${defs}
    <path d="M18 66 C 8 66, 8 50, 20 48 C 20 34, 40 30, 46 40 C 52 26, 76 28, 76 44 C 90 44, 92 66, 78 66 Z" fill="${cloud}"/>
    <path d="M20 48 C 20 34, 40 30, 46 40 C 52 26, 76 28, 76 44" stroke="#fff4d6" stroke-width="3" fill="none" opacity="0.8"/>
    ${face(50, 54, 0.9)}`
}

export function visitor(): string {
  const [defs, dome] = lit('#8ef0e4', 0.4, -0.2)
  return `${defs}
    <path d="M30 66 L 22 92 M70 66 L 78 92" stroke="#ffd98a" stroke-width="2" opacity="0.5"/>
    <path d="M22 92 L 78 92 L 50 66 Z" fill="#ffd98a" opacity="0.12"/>
    <ellipse cx="50" cy="58" rx="40" ry="11" fill="#9fb2c8"/>
    <path d="M30 54 C 30 32, 70 32, 70 54 Z" fill="${dome}" opacity="0.9"/>
    ${face(50, 46, 0.8)}
    ${dots(
      [
        [22, 60, 1.6],
        [50, 64, 1.6],
        [78, 60, 1.6],
      ],
      '#ffd98a',
    )}`
}

export function morningSun(): string {
  const [defs, sun] = lit('#ffb46e', 0.4, -0.2)
  const rays = Array.from({ length: 10 }, (_, i) => {
    const a = (i / 10) * Math.PI * 2
    return `<path d="M${(50 + Math.cos(a) * 30).toFixed(1)} ${(50 + Math.sin(a) * 30).toFixed(1)} L ${(50 + Math.cos(a) * 40).toFixed(1)} ${(50 + Math.sin(a) * 40).toFixed(1)}" stroke="#ffd98a" stroke-width="4" stroke-linecap="round"/>`
  }).join('')
  return `${defs}<circle cx="50" cy="50" r="44" fill="#ffd98a" opacity="0.14"/>${rays}
    <circle cx="50" cy="50" r="24" fill="${sun}"/>
    <path d="M36 40 q 6 -8 16 -8" stroke="#fff" stroke-width="3" opacity="0.6" fill="none" stroke-linecap="round"/>
    ${face(50, 52, 1.2)}`
}

// --- the garden, line A -----------------------------------------------------------------------

export function pond(): string {
  const [defs, frog] = lit('#5fbf4a', 0.3, -0.3)
  return `${defs}
    <ellipse cx="50" cy="84" rx="44" ry="12" fill="#2a6f8a"/>
    <ellipse cx="50" cy="82" rx="38" ry="8" fill="#3ef2e0" opacity="0.25"/>
    <ellipse cx="30" cy="84" rx="10" ry="4" fill="#3f8f3a"/>
    <ellipse cx="58" cy="74" rx="12" ry="9" fill="${frog}"/>
    <circle cx="53" cy="66" r="4" fill="${frog}"/><circle cx="63" cy="66" r="4" fill="${frog}"/>
    ${face(58, 70, 0.75)}`
}

export function hedgehog(): string {
  const [defs, spines] = lit('#8b6a4a', 0.3, -0.35)
  const quills = Array.from({ length: 9 }, (_, i) => {
    const x = 26 + i * 6
    return `<path d="M${String(x)} ${String(64 - Math.sin((i / 8) * Math.PI) * 18)} l -3 -8" stroke="#5a3a1e" stroke-width="2" stroke-linecap="round"/>`
  }).join('')
  return `${defs}
    <path d="M18 94 q 32 -10 64 0 Z" fill="#3f8f3a"/>
    <path d="M22 86 C 20 62, 56 50, 74 66 C 78 72, 78 84, 74 86 Z" fill="${spines}"/>${quills}
    <path d="M70 70 C 80 70, 88 78, 86 84 C 80 88, 72 88, 68 84 Z" fill="#e2c3a0"/>
    <circle cx="87" cy="83" r="2" fill="#061020"/>
    ${face(76, 78, 0.6)}`
}

export function cottage(): string {
  const [defs, wall] = lit('#f4e3c4', 0.2, -0.25)
  const [defs2, roof] = lit('#c4553f', 0.3, -0.3)
  return `${defs}${defs2}
    <rect x="22" y="48" width="56" height="44" rx="2" fill="${wall}"/>
    <path d="M14 52 L 50 20 L 86 52 Z" fill="${roof}"/>
    <rect x="62" y="22" width="9" height="18" fill="#8a5a3c"/>
    <rect x="44" y="66" width="13" height="26" rx="2" fill="#8a5a3c"/>
    <rect x="28" y="58" width="12" height="11" fill="#ffd98a"/>
    <rect x="61" y="58" width="12" height="11" fill="#ffd98a"/>
    <circle cx="54" cy="80" r="1.4" fill="#ffd98a"/>
    <path d="M66 18 q 4 -8 0 -14" stroke="#e8f0f5" stroke-width="3" opacity="0.5" fill="none" stroke-linecap="round"/>`
}

// --- the garden, line B -----------------------------------------------------------------------

export function deer(): string {
  const [defs, coat] = lit('#b07a4a', 0.3, -0.3)
  return `${defs}
    <path d="M36 70 V 96 M44 72 V 96 M62 72 V 96 M70 70 V 96" stroke="#7a5030" stroke-width="4" stroke-linecap="round"/>
    <ellipse cx="54" cy="64" rx="22" ry="12" fill="${coat}"/>
    <path d="M70 58 L 76 36 L 84 38 L 80 58 Z" fill="${coat}"/>
    <ellipse cx="82" cy="34" rx="9" ry="7" fill="${coat}"/>
    <path d="M78 28 l -6 -12 M78 22 l -6 -2 M86 28 l 4 -12 M88 20 l 5 -1" stroke="#7a5030" stroke-width="2.4" stroke-linecap="round"/>
    ${dots(
      [
        [46, 60, 1.2],
        [56, 58, 1],
        [60, 66, 1.1],
      ],
      '#fff4d6',
    )}
    ${face(84, 34, 0.7)}`
}

export function well(): string {
  const [defs, stone] = lit('#9aa7b8', 0.25, -0.3)
  return `${defs}
    <path d="M28 54 V 18 M72 54 V 18" stroke="#8a5a3c" stroke-width="4"/>
    <path d="M20 22 L 50 8 L 80 22 Z" fill="#c4553f"/>
    <path d="M50 22 V 40" stroke="#c9a86a" stroke-width="1.6"/>
    <rect x="44" y="40" width="12" height="9" rx="2" fill="#a8743f"/>
    <path d="M22 54 h 56 v 34 a 6 6 0 0 1 -6 6 h -44 a 6 6 0 0 1 -6 -6 Z" fill="${stone}"/>
    <path d="M22 66 h 56 M22 78 h 56 M36 54 v 12 M60 66 v 12 M42 78 v 14" stroke="#6c7686" stroke-width="1.4"/>
    ${star5(50, 58, 3, '#ffd98a')}`
}

export function appleTree(): string {
  const [defs, leaves] = lit('#4f9f3f', 0.3, -0.3)
  return `${defs}
    <path d="M46 96 V 56 h 8 V 96 Z" fill="#7a5030"/>
    <circle cx="50" cy="40" r="30" fill="${leaves}"/>
    <circle cx="30" cy="50" r="16" fill="${leaves}"/>
    <circle cx="70" cy="50" r="16" fill="${leaves}"/>
    <path d="M32 26 q 10 -10 22 -8" stroke="#fff" stroke-width="2.4" opacity="0.3" fill="none" stroke-linecap="round"/>
    ${[
      [36, 36],
      [58, 30],
      [66, 52],
      [42, 56],
      [28, 50],
    ]
      .map(([x, y]) => `<circle cx="${String(x)}" cy="${String(y)}" r="4.4" fill="#e85d4f"/>`)
      .join('')}`
}
