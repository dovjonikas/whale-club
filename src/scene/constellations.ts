import { halfwayStar, pathLength, placeStars, progressOf } from '../store/paths'
import type { DateKey } from '../store/types'
import { legendaryFor, type Stroke } from './legendary'
import { hash, seeded } from './random'

/**
 * Constellations from shapes: a path's stars spread evenly along its
 * legendary's outline, and the boxes in the sky each constellation is
 * drawn in. The current one is large in the middle of the sky; finished
 * ones stay, smaller, around it, bright for good.
 */

/** A star of a constellation, in the shape's 100 by 60 box. */
export interface ShapeStar {
  x: number
  y: number
  /** Which stroke of the shape it lies on: stars on one stroke are joined. */
  stroke: number
}

const SHAPE_W = 100
const SHAPE_H = 60

function strokeLength(stroke: Stroke): number {
  let length = 0
  for (let i = 1; i < stroke.length; i++) {
    const a = stroke[i - 1]
    const b = stroke[i]
    if (a && b) length += Math.hypot(b[0] - a[0], b[1] - a[1])
  }
  return length
}

/** The point at `distance` along a stroke. */
function along(stroke: Stroke, distance: number): [number, number] {
  let left = distance
  for (let i = 1; i < stroke.length; i++) {
    const a = stroke[i - 1]
    const b = stroke[i]
    if (!a || !b) continue
    const segment = Math.hypot(b[0] - a[0], b[1] - a[1])
    if (left <= segment || i === stroke.length - 1) {
      const t = segment === 0 ? 0 : Math.min(1, left / segment)
      return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]
    }
    left -= segment
  }
  const first = stroke[0]
  return first ? [first[0], first[1]] : [0, 0]
}

/**
 * `count` stars spread along the strokes in proportion to their length,
 * every stroke getting at least one, each at the middle of its share so
 * two strokes that meet never put two stars on one point. The order is
 * the order they light in: stroke by stroke, along each.
 */
export function sampleShape(shape: readonly Stroke[], count: number): ShapeStar[] {
  const lengths = shape.map(strokeLength)
  const total = lengths.reduce((sum, l) => sum + l, 0) || 1
  const shares = lengths.map((l) => Math.max(1, Math.round((count * l) / total)))
  // Rounding leaves the sum a little off; the longest strokes give or take the difference.
  let diff = count - shares.reduce((sum, n) => sum + n, 0)
  const byLength = lengths.map((l, i) => [l, i] as const).sort((a, b) => b[0] - a[0])
  for (let k = 0; diff !== 0 && k < count * 4; k++) {
    const index = byLength[k % byLength.length]?.[1] ?? 0
    const share = shares[index] ?? 1
    if (diff > 0) {
      shares[index] = share + 1
      diff--
    } else if (share > 1) {
      shares[index] = share - 1
      diff++
    }
  }
  const stars: ShapeStar[] = []
  shape.forEach((stroke, s) => {
    const n = shares[s] ?? 1
    const length = lengths[s] ?? 0
    for (let k = 0; k < n; k++) {
      const [x, y] = along(stroke, ((k + 0.5) / n) * length)
      stars.push({ x, y, stroke: s })
    }
  })
  return stars
}

/** A box in the sky canvas, as fractions of its width and height. */
export interface Box {
  x0: number
  y0: number
  x1: number
  y1: number
}

/**
 * The current constellation's box, in the middle of the sky: under the
 * title and the krill, above the horizon.
 */
export const MAIN_BOX: Box = { x0: 0.2, y0: 0.42, x1: 0.8, y1: 0.84 }

/**
 * Where finished constellations stay, in the order they were finished:
 * three across the upper sky, then the two edges, then low over the
 * horizon. After six they go round again, over the oldest, a little fainter.
 */
export const SLOTS: readonly Box[] = [
  { x0: 0.03, y0: 0.3, x1: 0.31, y1: 0.42 },
  { x0: 0.36, y0: 0.26, x1: 0.64, y1: 0.38 },
  { x0: 0.69, y0: 0.36, x1: 0.97, y1: 0.48 },
  { x0: 0.01, y0: 0.52, x1: 0.19, y1: 0.8 },
  { x0: 0.81, y0: 0.52, x1: 0.99, y1: 0.8 },
  { x0: 0.36, y0: 0.86, x1: 0.64, y1: 0.96 },
]

export function slotFor(path: number): Box {
  return SLOTS[path % SLOTS.length] ?? MAIN_BOX
}

/** Shape points into a box on a canvas of `width` by `height`, kept in proportion and centred. */
export function fit(
  stars: readonly ShapeStar[],
  box: Box,
  width: number,
  height: number,
): ShapeStar[] {
  const bw = (box.x1 - box.x0) * width
  const bh = (box.y1 - box.y0) * height
  const scale = Math.min(bw / SHAPE_W, bh / SHAPE_H)
  const x0 = box.x0 * width + (bw - SHAPE_W * scale) / 2
  const y0 = box.y0 * height + (bh - SHAPE_H * scale) / 2
  return stars.map((s) => ({ x: x0 + s.x * scale, y: y0 + s.y * scale, stroke: s.stroke }))
}

export interface DayStar {
  date: DateKey
  x: number
  y: number
  r: number
  /** The path (constellation) it belongs to. */
  path: number
  /** That path's halfway star: brighter, as it brought a rare find. */
  half: boolean
  /** Part of a finished constellation: smaller, and there for good. */
  finished: boolean
}

/** A star of the way ahead: not lit yet. */
export interface Ghost {
  x: number
  y: number
  half: boolean
}

/** A line between two stars of one stroke: solid once both are lit, dotted before. */
export interface Link {
  x1: number
  y1: number
  x2: number
  y2: number
  lit: boolean
  finished: boolean
}

/**
 * Every path walked so far: the finished ones in their slots, the current
 * one in the middle with its lit stars and the faint way ahead. With no
 * stars yet the first constellation is already there, faint: the goal is
 * in sight from the first day.
 */
export function layoutSky(
  dates: readonly DateKey[],
  width: number,
  height: number,
): { stars: DayStar[]; ghosts: Ghost[]; links: Link[] } {
  const stars: DayStar[] = []
  const ghosts: Ghost[] = []
  const links: Link[] = []
  if (!width || !height) return { stars, ghosts, links }
  const places = placeStars(dates)
  const now = progressOf(dates.length)
  for (let path = 0; path <= now.path; path++) {
    const length = pathLength(path)
    const finished = path < now.path
    const shape = fit(
      sampleShape(legendaryFor(path).shape, length),
      finished ? slotFor(path) : MAIN_BOX,
      width,
      height,
    )
    const lit = finished ? length : now.lit
    const half = halfwayStar(length) - 1
    shape.forEach((point, i) => {
      const next = shape[i + 1]
      if (next?.stroke === point.stroke)
        links.push({
          x1: point.x,
          y1: point.y,
          x2: next.x,
          y2: next.y,
          lit: i + 1 < lit,
          finished,
        })
      if (i >= lit) ghosts.push({ x: point.x, y: point.y, half: i === half })
    })
    for (const place of places) {
      if (place.path !== path) continue
      const point = shape[place.star - 1]
      if (!point) continue
      const random = seeded(hash(place.date))
      stars.push({
        date: place.date,
        x: point.x,
        y: point.y,
        r: finished ? 1.1 + random() * 0.5 : 1.6 + random() * 1.0,
        path,
        half: place.star - 1 === half,
        finished,
      })
    }
  }
  return { stars, ghosts, links }
}
