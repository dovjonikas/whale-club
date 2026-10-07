import { PALETTE } from './palette'

/**
 * The shared drawing pieces, in the creatures' manner: soft light from the
 * top left, a pale highlight, eyes with catchlights. Gradient ids come
 * from a counter, because a find can be on the page twice (in the scene
 * and in the Collection) and duplicate ids resolve to the first copy.
 */
let gradients = 0

/** A token colour as hex, since a gradient stop cannot read a CSS variable everywhere. */
export const hex = (color: string): string => {
  const match = /^var\(--([a-z-]+)\)$/.exec(color)
  return match ? (PALETTE[match[1] ?? ''] ?? color) : color
}

/** Mixes a hex colour towards white (amount > 0) or black (amount < 0). */
export const tint = (color: string, amount: number): string => {
  const c = hex(color).replace('#', '')
  const channels = [0, 2, 4].map((i) => parseInt(c.slice(i, i + 2), 16))
  const mixed = channels.map((v) =>
    Math.round(amount > 0 ? v + (255 - v) * amount : v * (1 + amount)),
  )
  return `#${mixed.map((v) => v.toString(16).padStart(2, '0')).join('')}`
}

/** A vertical gradient from lighter to darker; returns the defs and the fill. */
export const lit = (color: string, light = 0.35, dark = -0.35): [string, string] => {
  const id = `g${String(++gradients)}`
  return [
    `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${tint(color, light)}"/><stop offset="1" stop-color="${tint(color, dark)}"/></linearGradient></defs>`,
    `url(#${id})`,
  ]
}

export const face = (cx: number, cy: number, s = 1, ink = '#061020'): string =>
  `<g class="eyes"><ellipse cx="${cx - 3 * s}" cy="${cy}" rx="${1.6 * s}" ry="${1.8 * s}" fill="${ink}"/><ellipse cx="${cx + 3 * s}" cy="${cy}" rx="${1.6 * s}" ry="${1.8 * s}" fill="${ink}"/><circle cx="${cx - 2.4 * s}" cy="${cy - 0.7 * s}" r="${0.6 * s}" fill="#fff"/><circle cx="${cx + 3.6 * s}" cy="${cy - 0.7 * s}" r="${0.6 * s}" fill="#fff"/></g><ellipse cx="${cx - 5 * s}" cy="${cy + 2.6 * s}" rx="${1.5 * s}" ry="${0.9 * s}" fill="#ff8fa3" opacity="0.5"/><ellipse cx="${cx + 5 * s}" cy="${cy + 2.6 * s}" rx="${1.5 * s}" ry="${0.9 * s}" fill="#ff8fa3" opacity="0.5"/><path d="M${cx - 2.4 * s} ${cy + 3.6 * s} q ${2.4 * s} ${2.4 * s} ${4.8 * s} 0" stroke="${ink}" stroke-width="${1.1 * s}" fill="none" stroke-linecap="round"/>`

/** Points of living light: a bright core in a soft halo. */
export const dots = (points: [number, number, number][], color: string): string =>
  points
    .map(
      ([x, y, r]) =>
        `<circle cx="${x}" cy="${y}" r="${r * 2.6}" fill="${color}" opacity="0.16"/><circle cx="${x}" cy="${y}" r="${r}" fill="${color}"/><circle cx="${x - r * 0.3}" cy="${y - r * 0.3}" r="${r * 0.4}" fill="#fff" opacity="0.8"/>`,
    )
    .join('')

/** A fish: shaded body, paler belly, a fin, a tail, an eye with a catchlight. */
export const fish = (x: number, y: number, w: number, color: string, flip = false): string => {
  const [defs, body] = lit(color, 0.3, -0.3)
  const t = flip ? `transform="translate(${x * 2} 0) scale(-1 1)"` : ''
  return `${defs}<g ${t}>
    <path d="M${x - w * 0.42} ${y} L ${x - w * 0.78} ${y - w * 0.24} Q ${x - w * 0.7} ${y} ${x - w * 0.78} ${y + w * 0.24} Z" fill="${tint(color, -0.15)}"/>
    <ellipse cx="${x}" cy="${y}" rx="${w / 2}" ry="${w * 0.31}" fill="${body}"/>
    <path d="M${x - w * 0.35} ${y + w * 0.12} Q ${x} ${y + w * 0.34} ${x + w * 0.42} ${y + w * 0.08} Q ${x} ${y + w * 0.22} ${x - w * 0.35} ${y + w * 0.12} Z" fill="#fff" opacity="0.35"/>
    <path d="M${x - w * 0.1} ${y - w * 0.28} Q ${x + w * 0.05} ${y - w * 0.5} ${x + w * 0.2} ${y - w * 0.27} Z" fill="${tint(color, -0.1)}"/>
    <ellipse cx="${x + w * 0.02}" cy="${y - w * 0.14}" rx="${w * 0.22}" ry="${w * 0.06}" fill="#fff" opacity="0.3"/>
    <circle cx="${x + w * 0.26}" cy="${y - w * 0.05}" r="${w * 0.07}" fill="#061020"/>
    <circle cx="${x + w * 0.28}" cy="${y - w * 0.075}" r="${w * 0.025}" fill="#fff"/>
  </g>`
}

/** A jellyfish: a lit bell with a frilled rim, trailing threads, and a face. */
export const jelly = (x: number, y: number, w: number, color: string): string => {
  const [defs, bell] = lit(color, 0.55, -0.15)
  const frill = Array.from({ length: 6 }, (_, i) => {
    const fx = x - w / 2 + (w / 6) * (i + 0.5)
    return `<circle cx="${fx}" cy="${y}" r="${w / 12}" fill="${bell}"/>`
  }).join('')
  const threads = [0.22, 0.4, 0.6, 0.78]
    .map(
      (k, i) =>
        `<path d="M${x - w / 2 + k * w} ${y + w * 0.06} q ${i % 2 ? 5 : -5} ${w * 0.3} 0 ${w * 0.55} q ${i % 2 ? -4 : 4} ${w * 0.2} 0 ${w * 0.35}" stroke="${color}" stroke-width="1.4" fill="none" stroke-linecap="round" opacity="0.65"/>`,
    )
    .join('')
  return `${defs}<circle cx="${x}" cy="${y - w * 0.1}" r="${w * 0.75}" fill="${color}" opacity="0.12"/>${threads}<path d="M${x - w / 2} ${y} a ${w / 2} ${w / 2.2} 0 0 1 ${w} 0 z" fill="${bell}" opacity="0.92"/>${frill}<ellipse cx="${x - w * 0.15}" cy="${y - w * 0.28}" rx="${w * 0.14}" ry="${w * 0.07}" fill="#fff" opacity="0.6"/>${face(x, y - w * 0.14, w / 26)}`
}

/** A five-point star, rounded at its points, lit from the top. */
export const star5 = (x: number, y: number, r: number, color: string): string => {
  const points: string[] = []
  for (let i = 0; i < 10; i++) {
    const radius = i % 2 ? r * 0.47 : r
    const a = (Math.PI / 5) * i - Math.PI / 2
    points.push(`${(x + Math.cos(a) * radius).toFixed(1)} ${(y + Math.sin(a) * radius).toFixed(1)}`)
  }
  const [defs, fill] = lit(color, 0.45, -0.12)
  return `${defs}<circle cx="${x}" cy="${y}" r="${r * 1.6}" fill="${color}" opacity="0.12"/><polygon points="${points.join(' ')}" fill="${fill}" stroke="${tint(color, -0.05)}" stroke-width="${r * 0.18}" stroke-linejoin="round"/>`
}

/** A sunflower: two rings of petals, a seeded centre, a face if it has one. */
export const sunflower = (x: number, y: number, r: number, withFace = false): string => {
  const ring = (count: number, length: number, fill: string, offset: number): string =>
    Array.from(
      { length: count },
      (_, i) =>
        `<ellipse cx="${x}" cy="${y - r * length}" rx="${r * 0.2}" ry="${r * 0.46}" fill="${fill}" transform="rotate(${(360 / count) * i + offset} ${x} ${y})"/>`,
    ).join('')
  return `${ring(12, 0.74, '#e0a01c', 15)}${ring(12, 0.7, '#ffd54a', 0)}<circle cx="${x}" cy="${y}" r="${r * 0.44}" fill="#5a3a1e"/><circle cx="${x - r * 0.12}" cy="${y - r * 0.12}" r="${r * 0.26}" fill="#7a4e28"/>${withFace ? face(x, y, r / 24, '#ffe27a') : ''}`
}

export const stem = (x: number, top: number, bottom: number): string =>
  `<path d="M${x} ${bottom} v ${top - bottom}" stroke="#4fa64a" stroke-width="2.6" stroke-linecap="round"/><path d="M${x} ${top + (bottom - top) * 0.55} q -9 -3 -10 -10 q 8 0 10 10 z" fill="#5fbf4a"/>`

/** The red jacket: shaded, with a collar and buttons. */
export const jacket = (x: number, y: number, w: number): string => {
  const [defs, cloth] = lit('#e63946', 0.25, -0.3)
  return `${defs}<path d="M${x - w / 2} ${y} q ${w / 2} ${-w * 0.35} ${w} 0 v ${w * 0.52} q ${-w / 2} ${w * 0.12} ${-w} 0 z" fill="${cloth}"/><path d="M${x - w * 0.16} ${y - w * 0.12} l ${w * 0.16} ${w * 0.16} l ${w * 0.16} ${-w * 0.16}" stroke="#ffd6d9" stroke-width="${w * 0.04}" fill="none" opacity="0.8"/><path d="M${x} ${y + w * 0.04} v ${w * 0.46}" stroke="#7a1019" stroke-width="${w * 0.03}" opacity="0.6"/><circle cx="${x}" cy="${y + w * 0.16}" r="${w * 0.03}" fill="#ffd6d9"/><circle cx="${x}" cy="${y + w * 0.3}" r="${w * 0.03}" fill="#ffd6d9"/>`
}
