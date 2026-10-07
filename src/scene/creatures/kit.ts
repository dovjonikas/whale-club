/**
 * The creatures' shared drawing kit. Gradients are defined per drawing with
 * ids made unique by a counter, because several copies of one creature
 * share a page and a duplicate id makes the browser resolve every copy to
 * the first.
 */
let counter = 0

export interface Kit {
  /** A fresh id for this drawing's gradients. */
  id: (name: string) => string
  defs: string[]
}

export function kit(): Kit {
  const n = ++counter
  const defs: string[] = []
  return { id: (name) => `c${String(n)}-${name}`, defs }
}

/** A vertical body shade, lighter on top. */
export function shade(k: Kit, name: string, top: string, bottom: string): string {
  const id = k.id(name)
  k.defs.push(
    `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${top}"/><stop offset="1" stop-color="${bottom}"/></linearGradient>`,
  )
  return `url(#${id})`
}

/** A round shade, lit from the top left. */
export function orb(k: Kit, name: string, light: string, mid: string, dark: string): string {
  const id = k.id(name)
  k.defs.push(
    `<radialGradient id="${id}" cx="0.36" cy="0.32" r="0.75"><stop offset="0" stop-color="${light}"/><stop offset="0.55" stop-color="${mid}"/><stop offset="1" stop-color="${dark}"/></radialGradient>`,
  )
  return `url(#${id})`
}

/** A soft light behind the creature, fading to nothing. */
export function halo(k: Kit, color: string, r: number, cx = 32, cy = 34): string {
  const id = k.id('halo')
  k.defs.push(
    `<radialGradient id="${id}"><stop offset="0" stop-color="${color}" stop-opacity="0.32"/><stop offset="0.6" stop-color="${color}" stop-opacity="0.1"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></radialGradient>`,
  )
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#${id})"/>`
}

/**
 * Two eyes with catchlights, a mouth, and blush. `mood` 1 is a smile, 0 a
 * flat calm line, -1 a small o. The eyes are one group so a blink can
 * close both.
 */
export function face(
  cx: number,
  cy: number,
  s: number,
  mood = 1,
  ink = '#061020',
  blush = '#ff8fa3',
): string {
  const gap = 5.2 * s
  const eye = 1.9 * s
  const mouth =
    mood > 0
      ? `<path d="M${cx - 2.6 * s} ${cy + 3.6 * s} q ${2.6 * s} ${2.8 * s} ${5.2 * s} 0" stroke="${ink}" stroke-width="${1.15 * s}" fill="none" stroke-linecap="round"/>`
      : mood < 0
        ? `<ellipse cx="${cx}" cy="${cy + 4.4 * s}" rx="${1.2 * s}" ry="${1.5 * s}" fill="${ink}"/>`
        : `<path d="M${cx - 2 * s} ${cy + 4.2 * s} h ${4 * s}" stroke="${ink}" stroke-width="${1.1 * s}" stroke-linecap="round"/>`
  return `<g class="eyes">
      <ellipse cx="${cx - gap / 2}" cy="${cy}" rx="${eye}" ry="${eye * 1.12}" fill="${ink}"/>
      <ellipse cx="${cx + gap / 2}" cy="${cy}" rx="${eye}" ry="${eye * 1.12}" fill="${ink}"/>
      <circle cx="${cx - gap / 2 + 0.65 * s}" cy="${cy - 0.75 * s}" r="${0.7 * s}" fill="#fff"/>
      <circle cx="${cx + gap / 2 + 0.65 * s}" cy="${cy - 0.75 * s}" r="${0.7 * s}" fill="#fff"/>
    </g>
    <ellipse cx="${cx - gap / 2 - 1.6 * s}" cy="${cy + 2.7 * s}" rx="${1.7 * s}" ry="${1 * s}" fill="${blush}" opacity="0.5"/>
    <ellipse cx="${cx + gap / 2 + 1.6 * s}" cy="${cy + 2.7 * s}" rx="${1.7 * s}" ry="${1 * s}" fill="${blush}" opacity="0.5"/>
    ${mouth}`
}

export function svg(k: Kit, body: string): string {
  return `<svg viewBox="0 0 64 64" aria-hidden="true"><defs>${k.defs.join('')}</defs>${body}</svg>`
}

/** A four-point sparkle, for twinkles. */
export const twinkle = (x: number, y: number, r: number, color: string): string =>
  `<path d="M${x} ${y - r} Q ${x + r * 0.2} ${y - r * 0.2} ${x + r} ${y} Q ${x + r * 0.2} ${y + r * 0.2} ${x} ${y + r} Q ${x - r * 0.2} ${y + r * 0.2} ${x - r} ${y} Q ${x - r * 0.2} ${y - r * 0.2} ${x} ${y - r} Z" fill="${color}"/>`
