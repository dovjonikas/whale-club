import { dots, face, pool, veil } from '../draw'

/**
 * How the dock's bigger things are drawn in the scene: the pier itself,
 * what changes the whole scene (an aurora after dark, a glowing tide, a
 * second whale), and the three extensions that add places (a sand edge,
 * a reef, the island on a whale). Each is markup for one layer of the
 * scene; src/scene/scene.ts puts it in place and decides when it shows.
 */

/**
 * The pier, seen from the shore: planks running out over the water toward
 * the viewer, wider as they come. `longer` reaches further; `lanterns`
 * puts a light on each front post, lit by the scene after dark.
 */
export function pierSvg(longer: boolean, lanterns: boolean): string {
  const front = longer ? 52 : 32
  const half = longer ? 20 : 15
  const planks = Array.from({ length: longer ? 8 : 5 }, (_, i) => {
    const y = 10 + ((front - 10) * (i + 1)) / ((longer ? 8 : 5) + 0.4)
    const w = 6 + ((half - 6) * (y - 10)) / (front - 10)
    return `<path d="M${String(30 - w)} ${y.toFixed(1)} H ${String(30 + w)}" stroke="#4a3522" stroke-width="0.8" opacity="0.7"/>`
  }).join('')
  const posts = [30 - half + 2, 30 + half - 2]
    .map(
      (x) =>
        `<path d="M${String(x)} ${String(front - 2)} V ${String(front + 8)}" stroke="#3a2a1c" stroke-width="2.6" stroke-linecap="round"/><ellipse cx="${String(x)}" cy="${String(front + 8.5)}" rx="3.4" ry="0.9" fill="#3ef2e0" opacity="0.25"/>`,
    )
    .join('')
  const lights = lanterns
    ? [30 - half + 2, 30 + half - 2]
        .map(
          (x) =>
            `<path d="M${String(x)} ${String(front - 2)} V ${String(front - 11)}" stroke="#3a2a1c" stroke-width="1.4"/><circle class="pier-lantern" cx="${String(x)}" cy="${String(front - 13)}" r="2.4" fill="#ffd98a"/><circle class="pier-lantern-glow" cx="${String(x)}" cy="${String(front - 13)}" r="5.5" fill="#ffb86b" opacity="0.28"/>`,
        )
        .join('')
    : ''
  return `<svg viewBox="0 0 60 ${String(front + 12)}" aria-hidden="true">
    <path d="M24 10 H 36 L ${String(30 + half)} ${String(front)} H ${String(30 - half)} Z" fill="#a07a4f"/>
    <path d="M24 10 H 36 L ${String(30 + half)} ${String(front)} H ${String(30 - half)} Z" fill="#fff4d6" opacity="0.08"/>
    ${planks}
    <path d="M${String(30 - half)} ${String(front)} H ${String(30 + half)} V ${String(front + 2.4)} H ${String(30 - half)} Z" fill="#5e432a"/>
    ${posts}${lights}
  </svg>`
}

/** The longer shore: a lip of sand at the water's edge, either side of the pier. */
export function shoreEdgeSvg(): string {
  const lip = (from: number, to: number): string =>
    `<path d="M${String(from)} 14 C ${String(from + 40)} 2, ${String(to - 40)} 4, ${String(to)} 14 C ${String(to - 60)} 22, ${String(from + 60)} 24, ${String(from)} 14 Z" fill="var(--sand)" opacity="0.92"/><path d="M${String(from + 20)} 18 C ${String(from + 90)} 23, ${String(to - 90)} 22, ${String(to - 20)} 17" stroke="#6e5a39" stroke-width="2" fill="none" opacity="0.5"/>`
  return `<svg viewBox="0 0 1000 28" aria-hidden="true">${lip(50, 390)}${lip(610, 950)}</svg>`
}

/** The reef: a band of coral across the floor of the visible sea, its own layer. */
export function reefSvg(): string {
  const coral = (x: number, h: number, color: string): string =>
    `<path d="M${String(x)} 80 V ${String(80 - h * 0.5)} M${String(x)} ${String(80 - h * 0.45)} q -10 -${String(h * 0.25)} -14 -${String(h * 0.5)} M${String(x)} ${String(80 - h * 0.6)} q 9 -${String(h * 0.2)} 12 -${String(h * 0.45)} M${String(x)} ${String(80 - h * 0.5)} V ${String(80 - h)}" stroke="${color}" stroke-width="6" stroke-linecap="round" fill="none"/>`
  const brain = (x: number, r: number, color: string): string =>
    `<ellipse cx="${String(x)}" cy="80" rx="${String(r)}" ry="${String(r * 0.62)}" fill="${color}"/><path d="M${String(x - r * 0.6)} ${String(80 - r * 0.2)} q ${String(r * 0.3)} -${String(r * 0.3)} ${String(r * 0.6)} 0 t ${String(r * 0.6)} 0" stroke="#000" stroke-opacity="0.18" stroke-width="2" fill="none"/>`
  const fan = (x: number, h: number): string =>
    `<path d="M${String(x)} 80 L ${String(x - h * 0.5)} ${String(80 - h)} Q ${String(x)} ${String(80 - h * 1.2)} ${String(x + h * 0.5)} ${String(80 - h)} Z" fill="#c86f9a" opacity="0.75"/>`
  return `<svg viewBox="0 0 1000 84" aria-hidden="true">
    <path d="M0 84 V 74 C 120 66, 240 76, 380 70 S 640 64, 780 72 S 940 70, 1000 74 V 84 Z" fill="#20384f"/>
    ${fan(70, 40)}${coral(150, 52, '#ff8f7a')}${brain(250, 22, '#d9a35b')}${coral(330, 38, '#e7739b')}
    ${fan(430, 30)}${coral(520, 56, '#ffb07a')}${brain(610, 18, '#9c86d9')}${coral(690, 44, '#ff8f7a')}
    ${fan(790, 46)}${brain(880, 24, '#d9a35b')}${coral(950, 40, '#e7739b')}
    ${dots(
      [
        [120, 50, 1.6],
        [480, 40, 1.4],
        [740, 46, 1.8],
      ],
      '#3ef2e0',
    )}
  </svg>`
}

/**
 * The island on the whale: a big whale resting at the surface on the left
 * of the horizon, a little island of sand on its back. Its two ledges are
 * where the island's six places stand (src/scene/spots.ts, island-*).
 */
export function islandWhaleSvg(): string {
  return `<svg viewBox="0 0 176 60" aria-hidden="true">
    <path d="M8 40 C 2 30, 4 22, 10 18 C 12 26, 16 30, 22 32 Z" fill="#244c66"/>
    <path d="M8 40 C 12 34, 18 31, 24 32 C 18 36, 12 40, 8 40 Z" fill="#1b3c52"/>
    <path d="M18 60 C 20 40, 50 30, 96 30 C 140 30, 168 38, 172 50 C 173 54, 172 58, 170 60 Z" fill="#2f6584"/>
    <path d="M30 60 C 60 50, 130 48, 168 54 L 168 60 Z" fill="#a9dbe8" opacity="0.22"/>
    <path d="M60 36 C 90 32, 130 33, 156 40" stroke="#fff" stroke-width="1.6" opacity="0.18" fill="none" stroke-linecap="round"/>
    ${face(156, 46, 0.62)}
    <path d="M10 35 C 40 28, 130 27, 168 34 C 140 39, 40 40, 10 35 Z" fill="var(--sand)" opacity="0.95"/>
    <path d="M24 29 C 30 14, 52 11, 80 11 C 104 11, 116 15, 120 27 C 96 31, 46 32, 24 29 Z" fill="var(--sand)"/>
    <path d="M28 28 C 56 31, 96 30, 118 26" stroke="#6e5a39" stroke-width="1" fill="none" opacity="0.4"/>
  </svg>`
}

/** Aurora nights: curtains of green and violet across the whole sky, after dark. */
export function auroraSkySvg(): string {
  const [g1, green] = veil('#7cf0a8', 0.32)
  const [g2, violet] = veil('#b48cff', 0.22)
  const [g3, teal] = veil('#3ef2e0', 0.2)
  return `<svg viewBox="0 0 100 60" preserveAspectRatio="none" aria-hidden="true">${g1}${g2}${g3}
    <path d="M-5 30 C 10 10, 25 22, 40 14 S 70 8, 105 20 L 105 34 C 80 26, 60 36, 40 30 S 10 40, -5 40 Z" fill="${green}"/>
    <path d="M-5 22 C 15 6, 35 18, 55 8 S 85 4, 105 12 L 105 26 C 85 18, 65 26, 45 22 S 10 30, -5 30 Z" fill="${violet}"/>
    <path d="M10 36 C 30 26, 50 34, 70 28 S 95 30, 105 32 L 105 42 C 80 38, 55 44, 30 40 S 15 42, 10 36 Z" fill="${teal}"/>
  </svg>`
}

/** The whole cove glowing: the sea lit from inside, after dark. */
export function glowingCoveSvg(): string {
  const [g, fill] = pool('#3ef2e0', 0.28)
  const [h, warm] = pool('#ff8fd0', 0.12)
  const points: [number, number, number][] = [
    [8, 30, 0.8],
    [18, 62, 0.6],
    [27, 40, 0.7],
    [39, 75, 0.5],
    [46, 22, 0.6],
    [58, 55, 0.8],
    [66, 34, 0.5],
    [74, 70, 0.7],
    [83, 26, 0.6],
    [92, 52, 0.8],
  ]
  return `<svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">${g}${h}
    <ellipse cx="30" cy="40" rx="45" ry="40" fill="${fill}"/>
    <ellipse cx="75" cy="55" rx="40" ry="38" fill="${fill}"/>
    <ellipse cx="55" cy="30" rx="30" ry="22" fill="${warm}"/>
    <g class="cove-sparks">${dots(points, '#c9fbf5')}</g>
  </svg>`
}

/** A small whale, the colour of yours, a little paler: it keeps yours company. */
export function smallWhaleSvg(): string {
  return `<svg viewBox="0 0 80 40" aria-hidden="true">
    <path d="M6 18 L 0 10 Q 4 18 0 26 Z" fill="#3f8fb0"/>
    <path d="M6 20 C 8 8, 40 4, 62 10 C 76 14, 78 26, 66 30 C 46 36, 12 32, 6 20 Z" fill="#5fb6d6"/>
    <path d="M14 26 C 30 32, 56 32, 70 26 C 60 34, 26 36, 14 26 Z" fill="#dff4fa" opacity="0.7"/>
    <path d="M18 12 C 30 8, 46 7, 56 10" stroke="#fff" stroke-width="1.6" opacity="0.4" fill="none" stroke-linecap="round"/>
    ${face(60, 18, 0.7)}
  </svg>`
}

/** A whale drawn in stars, crossing the sky once a night. */
export function skyWhaleSvg(): string {
  const stars: [number, number][] = [
    [10, 30],
    [24, 18],
    [46, 12],
    [70, 12],
    [92, 18],
    [104, 28],
    [92, 38],
    [64, 42],
    [36, 40],
    [16, 38],
    [4, 22],
    [0, 40],
  ]
  const path = stars.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${String(x)} ${String(y)}`).join(' ')
  return `<svg viewBox="-4 4 116 44" aria-hidden="true">
    <path d="${path}" stroke="#ffd98a" stroke-width="0.5" fill="none" opacity="0.5"/>
    ${dots(
      stars.map(([x, y]) => [x, y, 0.9] as [number, number, number]),
      '#fff4d6',
    )}
    <circle cx="84" cy="24" r="1.4" fill="#fff4d6"/>
  </svg>`
}

/** Friday's falling stars: three streaks the sky lets go of, one after another. */
export function fridayStarsHtml(): string {
  return '<i></i><i></i><i></i>'
}
