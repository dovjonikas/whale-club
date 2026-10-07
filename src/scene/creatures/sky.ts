import type { Stage } from '../../store/derive'
import { type Kit, kit, shade, orb, halo, face, svg, twinkle } from './kit'

function star5(cx: number, cy: number, r: number, inner = 0.48): string {
  const points: string[] = []
  for (let i = 0; i < 10; i++) {
    const radius = i % 2 ? r * inner : r
    const a = (Math.PI / 5) * i - Math.PI / 2
    points.push(
      `${(cx + Math.cos(a) * radius).toFixed(1)} ${(cy + Math.sin(a) * radius).toFixed(1)}`,
    )
  }
  return points.join(' ')
}

export const SKY_A: Record<Stage, () => string> = {
  // A spark.
  0: () => {
    const k = kit()
    return svg(
      k,
      `${halo(k, '#ffd98a', 22)}
      ${twinkle(32, 33, 11, '#fff4d6')}
      ${twinkle(32, 33, 6, '#ffffff')}
      ${face(32, 34, 0.5, 0)}`,
    )
  },
  // A star, a little round at the points.
  1: () => {
    const k = kit()
    return svg(
      k,
      `${halo(k, '#ffd98a', 26)}
      <polygon points="${star5(32, 34, 18)}" fill="${orb(k, 'b', '#fffbe9', '#ffe39f', '#f2b94c')}" stroke="#f7c868" stroke-width="2.5" stroke-linejoin="round"/>
      ${face(32, 35, 0.85)}`,
    )
  },
  // A bright star, with rays.
  2: () => {
    const k = kit()
    return svg(
      k,
      `${halo(k, '#ffd98a', 31)}
      <g stroke="#ffe7b0" stroke-width="1.6" stroke-linecap="round" opacity="0.75">
        <path d="M32 3 v 6 M32 59 v 2 M3 34 h 6 M55 34 h 6 M11 13 l 4 4 M49 51 l 4 4 M53 13 l -4 4 M11 55 l 4 -4"/>
      </g>
      <polygon points="${star5(32, 34, 21)}" fill="${orb(k, 'b', '#fffbe9', '#ffe39f', '#f0b041')}" stroke="#f7c868" stroke-width="3" stroke-linejoin="round"/>
      <ellipse cx="27" cy="27" rx="4" ry="2" fill="#fff" opacity="0.6" transform="rotate(-30 27 27)"/>
      ${face(32, 35, 1)}`,
    )
  },
  // A great round star with twinkles of its own.
  3: () => {
    const k = kit()
    return svg(
      k,
      `${halo(k, '#ffd98a', 32)}
      <polygon points="${star5(32, 34, 25, 0.55)}" fill="${orb(k, 'b', '#fffdf2', '#ffe7a8', '#eba63a')}" stroke="#ffd27a" stroke-width="4" stroke-linejoin="round"/>
      <ellipse cx="25" cy="25" rx="6" ry="2.6" fill="#fff" opacity="0.6" transform="rotate(-30 25 25)"/>
      ${twinkle(8, 12, 4, '#fff4d6')}${twinkle(57, 9, 3, '#fff4d6')}${twinkle(58, 55, 3.4, '#ffe7b0')}
      ${face(32, 35, 1.15)}`,
    )
  },
}

function cloud(k: Kit, x: number, y: number, s: number, top: string, bottom: string): string {
  const fill = shade(k, `cl${String(x)}`, top, bottom)
  return `<path d="M${x - 16 * s} ${y + 8 * s} a ${8 * s} ${8 * s} 0 0 1 ${2 * s} ${-15.5 * s} a ${11 * s} ${11 * s} 0 0 1 ${20 * s} ${-3 * s} a ${8.5 * s} ${8.5 * s} 0 0 1 ${10 * s} ${18.5 * s} Z" fill="${fill}"/>`
}

export const SKY_B: Record<Stage, () => string> = {
  // A little dust of light.
  0: () => {
    const k = kit()
    return svg(
      k,
      `${halo(k, '#ffd98a', 20)}
      <circle cx="25" cy="38" r="2.6" fill="#fff4d6"/><circle cx="40" cy="38" r="2.2" fill="#fff4d6" opacity="0.8"/>
      <circle cx="33" cy="31" r="5" fill="${orb(k, 'b', '#ffffff', '#fff4d6', '#e9d6a8')}"/>
      ${face(33, 31.5, 0.42, 0)}`,
    )
  },
  // A small cloud.
  1: () => {
    const k = kit()
    return svg(
      k,
      `${halo(k, '#cfe2ff', 24)}${cloud(k, 32, 36, 0.85, '#ffffff', '#c3d2e6')}${face(32, 34, 0.75)}`,
    )
  },
  // A cloud with a face.
  2: () => {
    const k = kit()
    return svg(
      k,
      `${halo(k, '#cfe2ff', 29)}${cloud(k, 32, 37, 1.1, '#ffffff', '#bccbe0')}
      <ellipse cx="26" cy="24" rx="6" ry="2.2" fill="#fff" opacity="0.7"/>
      ${face(32, 34, 1)}`,
    )
  },
  // A thundercloud that glows, kindly.
  3: () => {
    const k = kit()
    return svg(
      k,
      `${halo(k, '#b9a8ff', 32)}${cloud(k, 32, 34, 1.3, '#f0ecff', '#8e86c2')}
      <path d="M30 46 L 25 56 L 31 54 L 28 63 L 38 50 L 32 52 L 35 46 Z" fill="#ffd98a" stroke="#ffe9b8" stroke-width="0.8" stroke-linejoin="round"/>
      <circle cx="17" cy="50" r="1.2" fill="#cfe2ff"/><circle cx="45" cy="52" r="1.2" fill="#cfe2ff"/>
      ${face(32, 31, 1.15)}`,
    )
  },
}
