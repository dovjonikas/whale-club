import { face, lit } from '../draw'

/**
 * The dock's things, drawn in the finds' manner: inner SVG for a 100x100
 * box, light from the top left, a pale highlight, a face on anything
 * alive. Placed things are drawn the same in the scene and in the dock;
 * the rest (what a creature wears, what changes the whole scene, what adds
 * room) have a picture here for the dock and are drawn in the scene
 * elsewhere (src/scene/dock/scene.ts).
 */

// --- in the sea ---------------------------------------------------------------------------------

export function buoy(): string {
  const [defs, red] = lit('#e85d4f', 0.3, -0.35)
  return `${defs}
    <ellipse cx="50" cy="86" rx="30" ry="5" fill="#3ef2e0" opacity="0.25"/>
    <path d="M30 80 Q 30 50 50 46 Q 70 50 70 80 Z" fill="${red}"/>
    <path d="M33 66 H 67 V 74 H 31 Z" fill="#fff4d6" opacity="0.92"/>
    <path d="M47 46 V 26 H 53 V 46 Z" fill="#c9a86a"/>
    <circle cx="50" cy="20" r="9" fill="#ffd98a"/>
    <circle cx="50" cy="20" r="18" fill="#ffd98a" opacity="0.22"/>
    <path d="M36 56 q 6 -6 12 -6" stroke="#fff" stroke-width="2.4" opacity="0.4" fill="none" stroke-linecap="round"/>`
}

export function paperBoat(): string {
  return `<ellipse cx="50" cy="80" rx="34" ry="5" fill="#3ef2e0" opacity="0.22"/>
    <path d="M14 58 L 86 58 L 72 78 L 28 78 Z" fill="#fff4d6"/>
    <path d="M14 58 L 50 58 L 50 22 Z" fill="#ffffff"/>
    <path d="M50 58 L 86 58 L 50 22 Z" fill="#e2d6b8"/>
    <path d="M28 78 L 50 58 L 72 78 Z" fill="#d6c79f" opacity="0.6"/>`
}

export function bottle(): string {
  const [defs, glass] = lit('#7fd3c4', 0.35, -0.3)
  return `${defs}
    <ellipse cx="50" cy="78" rx="34" ry="5" fill="#3ef2e0" opacity="0.22"/>
    <g transform="rotate(-18 50 52)">
      <rect x="24" y="40" width="44" height="26" rx="12" fill="${glass}" opacity="0.85"/>
      <rect x="66" y="47" width="14" height="12" rx="3" fill="${glass}" opacity="0.85"/>
      <rect x="78" y="46" width="6" height="14" rx="2" fill="#a8743f"/>
      <path d="M34 47 h 22 v 12 h -22 Z" fill="#fff4d6"/>
      <path d="M37 51 h 16 M37 55 h 12" stroke="#c9a86a" stroke-width="1.6"/>
      <path d="M28 46 q 10 -4 30 -2" stroke="#fff" stroke-width="2.4" opacity="0.5" fill="none" stroke-linecap="round"/>
    </g>`
}

export function boat(): string {
  const [defs, hull] = lit('#c9844a', 0.3, -0.35)
  return `${defs}
    <ellipse cx="50" cy="84" rx="40" ry="5" fill="#3ef2e0" opacity="0.22"/>
    <path d="M12 62 H 88 L 76 80 H 24 Z" fill="${hull}"/>
    <path d="M16 66 H 84" stroke="#8b5a2b" stroke-width="2"/>
    <path d="M50 62 V 14" stroke="#8b5a2b" stroke-width="3.4" stroke-linecap="round"/>
    <path d="M52 16 Q 80 34 54 56 Z" fill="#fff4d6"/>
    <path d="M48 22 Q 26 40 46 56 Z" fill="#ffd98a"/>
    <path d="M50 14 l 10 -4 l -10 -3 Z" fill="#e85d4f"/>`
}

export function jellyLamp(): string {
  const [defs, bell] = lit('#c8b6ff', 0.4, -0.2)
  return `${defs}
    <circle cx="50" cy="40" r="34" fill="#c8b6ff" opacity="0.18"/>
    <path d="M24 46 Q 24 18 50 18 Q 76 18 76 46 Q 63 52 50 46 Q 37 52 24 46 Z" fill="${bell}"/>
    <path d="M32 50 q -4 14 2 28 M44 50 q 3 16 -2 32 M56 50 q -3 16 2 32 M68 50 q 4 14 -2 28" stroke="#c8b6ff" stroke-width="2.6" fill="none" stroke-linecap="round" opacity="0.8"/>
    <circle cx="50" cy="34" r="7" fill="#fff4d6"/>
    ${face(50, 36, 1.3)}`
}

// --- on the shore -------------------------------------------------------------------------------

export function starfish(): string {
  const [defs, body] = lit('#ff9f6b', 0.3, -0.3)
  const arms = [0, 72, 144, 216, 288]
    .map(
      (a) =>
        `<ellipse cx="50" cy="40" rx="9" ry="22" fill="${body}" transform="rotate(${String(a)} 50 62)"/>`,
    )
    .join('')
  return `${defs}
    <ellipse cx="50" cy="90" rx="30" ry="5" fill="#c9a86a" opacity="0.5"/>
    ${arms}
    <circle cx="50" cy="62" r="12" fill="${body}"/>
    ${face(50, 62, 1.2)}`
}

export function shells(): string {
  const [defs, pink] = lit('#ffb3c6', 0.3, -0.25)
  return `${defs}
    <ellipse cx="50" cy="90" rx="36" ry="5" fill="#c9a86a" opacity="0.5"/>
    <path d="M18 86 Q 18 60 36 58 Q 54 60 54 86 Z" fill="${pink}"/>
    <path d="M36 58 V 86 M27 61 L 22 86 M45 61 L 50 86" stroke="#e08aa0" stroke-width="1.8"/>
    <path d="M58 88 C 56 72 66 64 76 66 C 86 68 88 80 82 88 Z" fill="#fff4d6"/>
    <path d="M64 86 q 4 -12 14 -16" stroke="#c9a86a" stroke-width="1.6" fill="none"/>`
}

export function sandcastle(): string {
  const [defs, sand] = lit('#d9b878', 0.3, -0.3)
  return `${defs}
    <ellipse cx="50" cy="92" rx="44" ry="5" fill="#c9a86a" opacity="0.5"/>
    <path d="M14 90 V 58 H 86 V 90 Z" fill="${sand}"/>
    <path d="M22 58 V 36 H 40 V 58 M60 58 V 36 H 78 V 58" fill="${sand}"/>
    <path d="M22 36 v -6 h 5 v 6 m 4 0 v -6 h 5 v 6 M60 36 v -6 h 5 v 6 m 4 0 v -6 h 5 v 6" fill="${sand}" stroke="${sand}" stroke-width="1"/>
    <path d="M44 90 V 74 Q 50 66 56 74 V 90 Z" fill="#8b6a3e"/>
    <path d="M31 36 V 18" stroke="#8b5a2b" stroke-width="2" stroke-linecap="round"/>
    <path d="M31 18 l 12 4 l -12 4 Z" fill="#e85d4f"/>`
}

export function hammock(): string {
  return `<ellipse cx="50" cy="94" rx="46" ry="4" fill="#c9a86a" opacity="0.5"/>
    <path d="M14 94 V 30 M86 94 V 30" stroke="#3e9a3c" stroke-width="4" stroke-linecap="round"/>
    <circle cx="14" cy="26" r="9" fill="#f2c94c"/><circle cx="14" cy="26" r="4" fill="#8b5a2b"/>
    <circle cx="86" cy="26" r="9" fill="#f2c94c"/><circle cx="86" cy="26" r="4" fill="#8b5a2b"/>
    <path d="M14 46 Q 50 84 86 46" stroke="#e85d4f" stroke-width="9" fill="none" stroke-linecap="round"/>
    <path d="M14 46 Q 50 78 86 46" stroke="#fff4d6" stroke-width="2" fill="none" opacity="0.7" stroke-dasharray="5 4"/>`
}

export function telescope(): string {
  const [defs, brass] = lit('#c9a86a', 0.35, -0.35)
  return `${defs}
    <ellipse cx="50" cy="92" rx="30" ry="4" fill="#c9a86a" opacity="0.5"/>
    <path d="M50 58 L 34 92 M50 58 L 66 92 M50 58 V 92" stroke="#8b5a2b" stroke-width="3.4" stroke-linecap="round"/>
    <g transform="rotate(-32 50 50)">
      <rect x="20" y="42" width="58" height="14" rx="6" fill="${brass}"/>
      <rect x="74" y="40" width="10" height="18" rx="4" fill="#a8864e"/>
      <rect x="14" y="45" width="8" height="8" rx="2" fill="#8b6a3e"/>
      <path d="M26 46 h 40" stroke="#fff4d6" stroke-width="1.8" opacity="0.5" stroke-linecap="round"/>
    </g>`
}

export function lighthouse(): string {
  const [defs, white] = lit('#fff4d6', 0.1, -0.25)
  return `${defs}
    <ellipse cx="50" cy="96" rx="30" ry="4" fill="#c9a86a" opacity="0.5"/>
    <path d="M36 96 L 42 34 H 58 L 64 96 Z" fill="${white}"/>
    <path d="M38.6 76 H 61.4 L 62.6 88 H 37.4 Z M40.6 54 H 59.4 L 60.4 66 H 39.6 Z" fill="#e85d4f"/>
    <rect x="40" y="22" width="20" height="12" rx="2" fill="#ffd98a"/>
    <circle cx="50" cy="28" r="14" fill="#ffd98a" opacity="0.3"/>
    <path d="M38 22 L 50 10 L 62 22 Z" fill="#e85d4f"/>
    <path d="M38 34 H 62" stroke="#3a2e22" stroke-width="2.4"/>`
}

// --- in the sky ---------------------------------------------------------------------------------

export function kite(): string {
  return `<path d="M50 8 L 74 36 L 50 70 L 26 36 Z" fill="#ff9fb2"/>
    <path d="M50 8 L 50 70 M26 36 L 74 36" stroke="#fff4d6" stroke-width="1.8" opacity="0.8"/>
    <path d="M50 8 L 74 36 L 50 36 Z" fill="#ffd98a" opacity="0.85"/>
    <path d="M50 70 q -8 8 0 14 q 8 6 0 14" stroke="#fff4d6" stroke-width="1.8" fill="none"/>
    <path d="M46 78 l 4 3 l 4 -3 M46 90 l 4 3 l 4 -3" stroke="#8ef0e4" stroke-width="2.4" stroke-linecap="round" fill="none"/>`
}

export function skyLantern(): string {
  const [defs, paper] = lit('#ffb27a', 0.35, -0.2)
  return `${defs}
    <circle cx="50" cy="48" r="38" fill="#ffd98a" opacity="0.18"/>
    <path d="M30 22 H 70 L 64 74 H 36 Z" fill="${paper}"/>
    <path d="M40 22 L 38 74 M50 22 V 74 M60 22 L 62 74" stroke="#e8935a" stroke-width="1.2" opacity="0.6"/>
    <ellipse cx="50" cy="74" rx="14" ry="3" fill="#8b5a2b"/>
    <circle cx="50" cy="66" r="5" fill="#fff4d6"/>`
}

export function birds(): string {
  const bird = (x: number, y: number, s: number): string =>
    `<path d="M${String(x - 9 * s)} ${String(y)} q ${String(4.5 * s)} ${String(-6 * s)} ${String(9 * s)} 0 q ${String(4.5 * s)} ${String(-6 * s)} ${String(9 * s)} 0" stroke="#fff4d6" stroke-width="${String(2.6 * s)}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`
  return `${bird(28, 40, 1.4)}${bird(62, 26, 1)}${bird(70, 56, 1.15)}${bird(44, 66, 0.8)}`
}

export function comet(): string {
  return `<path d="M76 24 L 10 84" stroke="#8ef0e4" stroke-width="10" stroke-linecap="round" opacity="0.18"/>
    <path d="M76 24 L 24 72" stroke="#8ef0e4" stroke-width="5" stroke-linecap="round" opacity="0.35"/>
    <path d="M76 24 L 42 56" stroke="#fff4d6" stroke-width="2.4" stroke-linecap="round" opacity="0.7"/>
    <circle cx="76" cy="24" r="16" fill="#8ef0e4" opacity="0.25"/>
    <circle cx="76" cy="24" r="8" fill="#fff4d6"/>`
}

export function balloon(): string {
  const [defs, canvas] = lit('#e85d4f', 0.3, -0.3)
  return `${defs}
    <path d="M50 8 C 22 8 18 40 34 58 L 42 68 H 58 L 66 58 C 82 40 78 8 50 8 Z" fill="${canvas}"/>
    <path d="M50 8 C 40 20 40 50 46 68 M50 8 C 60 20 60 50 54 68" stroke="#ffd98a" stroke-width="5" fill="none"/>
    <path d="M42 68 L 40 80 M58 68 L 60 80" stroke="#8b5a2b" stroke-width="1.6"/>
    <rect x="38" y="80" width="24" height="14" rx="3" fill="#a8743f"/>
    <path d="M30 22 q 6 -8 16 -9" stroke="#fff" stroke-width="2.6" opacity="0.4" fill="none" stroke-linecap="round"/>`
}

// --- what a creature wears (the dock's picture; worn ones are in wear.ts) -------------------

export function hat(): string {
  const [defs, felt] = lit('#5b6cff', 0.3, -0.35)
  return `${defs}
    <ellipse cx="50" cy="70" rx="40" ry="10" fill="${felt}"/>
    <path d="M24 70 Q 26 30 50 28 Q 74 30 76 70 Z" fill="${felt}"/>
    <path d="M26 60 Q 50 66 74 60 L 75 68 Q 50 74 25 68 Z" fill="#ffd98a"/>
    <circle cx="50" cy="26" r="6" fill="#ffd98a"/>`
}

export function scarf(): string {
  return `<path d="M14 40 Q 50 62 86 40 L 86 54 Q 50 76 14 54 Z" fill="#e85d4f"/>
    <path d="M60 58 L 70 90 L 82 88 L 72 56 Z" fill="#e85d4f"/>
    <path d="M24 46 L 24 58 M38 52 L 38 64 M52 54 L 52 66 M66 52 L 66 64 M76 82 L 70 86" stroke="#fff4d6" stroke-width="3" opacity="0.8"/>`
}

export function glasses(): string {
  return `<circle cx="32" cy="52" r="16" fill="#8ef0e4" opacity="0.25" stroke="#3a2e22" stroke-width="5"/>
    <circle cx="68" cy="52" r="16" fill="#8ef0e4" opacity="0.25" stroke="#3a2e22" stroke-width="5"/>
    <path d="M48 50 Q 50 46 52 50" stroke="#3a2e22" stroke-width="4" fill="none"/>
    <path d="M24 46 q 4 -4 8 -4" stroke="#fff" stroke-width="2.4" opacity="0.6" fill="none" stroke-linecap="round"/>`
}

// --- what changes the whole scene (the dock's picture) --------------------------------------

export function dockLanterns(): string {
  const lamp = (x: number): string =>
    `<path d="M${String(x)} 54 V 34" stroke="#8b5a2b" stroke-width="3"/><circle cx="${String(x)}" cy="30" r="6" fill="#ffd98a"/><circle cx="${String(x)}" cy="30" r="12" fill="#ffd98a" opacity="0.25"/>`
  return `<path d="M6 62 H 94" stroke="#a8743f" stroke-width="8" stroke-linecap="round"/>
    <path d="M16 62 V 86 M50 62 V 86 M84 62 V 86" stroke="#8b5a2b" stroke-width="5"/>
    ${lamp(16)}${lamp(50)}${lamp(84)}`
}

export function fridayStars(): string {
  const streak = (x: number, y: number): string =>
    `<path d="M${String(x)} ${String(y)} l -26 18" stroke="#fff4d6" stroke-width="2.4" stroke-linecap="round" opacity="0.8"/><circle cx="${String(x)}" cy="${String(y)}" r="3" fill="#fff4d6"/>`
  return `${streak(80, 16)}${streak(60, 40)}${streak(88, 58)}${streak(40, 70)}`
}

export function aurora(): string {
  return `<path d="M4 70 C 20 30 40 60 56 30 S 86 40 96 16" stroke="#8ef0e4" stroke-width="14" fill="none" opacity="0.45" stroke-linecap="round"/>
    <path d="M4 82 C 24 50 44 76 60 48 S 88 58 96 34" stroke="#c8b6ff" stroke-width="10" fill="none" opacity="0.45" stroke-linecap="round"/>
    <path d="M10 60 C 26 30 44 52 58 26" stroke="#fff4d6" stroke-width="2" fill="none" opacity="0.5"/>`
}

export function secondWhale(): string {
  const [defs, body] = lit('#3a8fd6', 0.3, -0.35)
  return `${defs}
    <path d="M14 58 C 14 38 44 32 66 40 C 82 46 86 60 74 68 C 60 76 26 76 14 58 Z" fill="${body}"/>
    <path d="M14 58 L 4 48 L 6 66 Z" fill="${body}"/>
    <path d="M24 64 Q 50 74 74 66" stroke="#bfe4ff" stroke-width="3" opacity="0.5" fill="none"/>
    ${face(62, 52, 1.3)}`
}

export function longerDock(): string {
  return `<path d="M4 58 H 96" stroke="#a8743f" stroke-width="10" stroke-linecap="round"/>
    <path d="M14 58 V 88 M38 58 V 88 M62 58 V 88 M86 58 V 88" stroke="#8b5a2b" stroke-width="5"/>
    <path d="M4 54 H 96" stroke="#d9b878" stroke-width="2" opacity="0.6"/>`
}

export function glowingTide(): string {
  return `<path d="M4 56 q 12 -10 23 0 t 23 0 t 23 0 t 23 0" stroke="#3ef2e0" stroke-width="6" fill="none" stroke-linecap="round"/>
    <path d="M4 56 q 12 -10 23 0 t 23 0 t 23 0 t 23 0" stroke="#3ef2e0" stroke-width="18" fill="none" opacity="0.25" stroke-linecap="round"/>
    <path d="M4 74 q 12 -8 23 0 t 23 0 t 23 0 t 23 0" stroke="#8ef0e4" stroke-width="3" fill="none" opacity="0.6" stroke-linecap="round"/>`
}

export function skyWhale(): string {
  const [defs, body] = lit('#c8b6ff', 0.35, -0.3)
  return `${defs}
    <circle cx="50" cy="50" r="44" fill="#c8b6ff" opacity="0.12"/>
    <path d="M10 56 C 12 32 48 26 70 36 C 88 44 92 58 80 66 C 64 76 22 76 10 56 Z" fill="${body}"/>
    <path d="M10 56 L 2 40 L 0 62 Z" fill="${body}"/>
    <circle cx="30" cy="20" r="2" fill="#fff4d6"/><circle cx="84" cy="22" r="1.6" fill="#fff4d6"/><circle cx="58" cy="12" r="1.4" fill="#fff4d6"/>
    ${face(68, 50, 1.3)}`
}

export function glowingCove(): string {
  return `<circle cx="50" cy="60" r="44" fill="#ffd98a" opacity="0.14"/>
    <circle cx="50" cy="60" r="30" fill="#ffd98a" opacity="0.18"/>
    <path d="M4 64 Q 50 40 96 64" stroke="#c9a86a" stroke-width="8" fill="none" stroke-linecap="round"/>
    <path d="M4 74 q 12 -8 23 0 t 23 0 t 23 0 t 23 0" stroke="#3ef2e0" stroke-width="3" fill="none" opacity="0.7"/>
    <circle cx="30" cy="40" r="2.4" fill="#fff4d6"/><circle cx="66" cy="32" r="2" fill="#fff4d6"/><circle cx="50" cy="22" r="2.6" fill="#ffd98a"/>`
}

// --- room for more (the dock's picture) ---------------------------------------------------------

export function longerShore(): string {
  return `<path d="M0 52 Q 30 46 60 54 Q 84 60 100 76 L 100 100 L 0 100 Z" fill="#d9b878"/>
    <path d="M0 64 Q 40 58 70 70 Q 88 78 100 92" stroke="#3ef2e0" stroke-width="2.4" fill="none" opacity="0.7"/>
    <circle cx="22" cy="58" r="3" fill="#fff4d6" opacity="0.6"/><circle cx="48" cy="60" r="3" fill="#fff4d6" opacity="0.6"/><circle cx="74" cy="70" r="3" fill="#fff4d6" opacity="0.6"/>`
}

export function reef(): string {
  return `<path d="M0 96 Q 50 84 100 96 V 100 H 0 Z" fill="#14324a"/>
    <path d="M18 92 V 64 M18 76 L 10 66 M18 70 L 26 60" stroke="#ff9fb2" stroke-width="5" stroke-linecap="round" fill="none"/>
    <path d="M46 90 C 40 70 52 60 46 44 M46 66 C 54 60 58 56 56 48" stroke="#ffb27a" stroke-width="5" stroke-linecap="round" fill="none"/>
    <circle cx="74" cy="82" r="10" fill="#c8b6ff"/><circle cx="84" cy="88" r="7" fill="#8ef0e4"/>
    <path d="M70 80 q 4 -4 8 0" stroke="#fff" stroke-width="1.6" opacity="0.5" fill="none"/>`
}

export function island(): string {
  const [defs, body] = lit('#3a6fa8', 0.25, -0.35)
  return `${defs}
    <path d="M6 76 C 8 58 40 50 64 56 C 84 61 94 70 88 78 C 74 88 22 88 6 76 Z" fill="${body}"/>
    <path d="M30 60 Q 52 44 74 58 Z" fill="#d9b878"/>
    <path d="M54 52 C 52 40 54 30 58 22" stroke="#8b5a2b" stroke-width="3" fill="none" stroke-linecap="round"/>
    <path d="M58 22 q -14 -2 -20 8 M58 22 q 14 -4 20 6 M58 22 q -4 -10 -14 -12 M58 22 q 6 -10 16 -10" stroke="#3e9a3c" stroke-width="4" fill="none" stroke-linecap="round"/>
    ${face(78, 70, 1.1)}`
}
