import type { DateKey } from './types'

/**
 * The path to a legendary. Every day something was done lights the next
 * star of the current constellation; a path is a fixed number of stars,
 * 30 for the first, 60 for the second, then 100 each, so a steady person
 * finishes about four in a year. Halfway gives a rare find and the end a
 * legendary. A missed day takes nothing, it only adds nothing; a rest day
 * with nothing done has no star and is not counted at all.
 *
 * Like the finds, nothing here is stored: it is all worked out from the
 * star days (src/store/derive.ts, starDays), oldest first.
 */
export const PATH_LENGTHS: readonly number[] = [30, 60, 100]

/** The days of whale club (days something was done) that are quietly celebrated. */
export const MILESTONES: readonly number[] = [100, 200, 365]

/** How many stars path `index` (0 first) has. */
export function pathLength(index: number): number {
  return PATH_LENGTHS[Math.min(index, PATH_LENGTHS.length - 1)] ?? 100
}

/** The star, of `length`, whose lighting is halfway: the 15th of 30. */
export function halfwayStar(length: number): number {
  return Math.ceil(length / 2)
}

/** Where a day's star is: which path, and which star of it (1 first). */
export interface StarPlace {
  date: DateKey
  path: number
  star: number
}

export function placeStars(dates: readonly DateKey[]): StarPlace[] {
  const places: StarPlace[] = []
  let path = 0
  let star = 0
  for (const date of dates) {
    star++
    places.push({ date, path, star })
    if (star === pathLength(path)) {
      path++
      star = 0
    }
  }
  return places
}

/** The path being walked now, and how far along it is. */
export interface PathProgress {
  /** The current path's index; also how many paths are finished. */
  path: number
  length: number
  /** Stars lit on it so far. */
  lit: number
}

export function progressOf(count: number): PathProgress {
  let path = 0
  let left = count
  while (left >= pathLength(path)) {
    left -= pathLength(path)
    path++
  }
  return { path, length: pathLength(path), lit: left }
}

/** When a path's halfway star and its last star were lit, if they were. */
export interface PathReach {
  path: number
  half?: DateKey
  end?: DateKey
}

export function reachesOf(dates: readonly DateKey[]): PathReach[] {
  const reaches: PathReach[] = []
  for (const place of placeStars(dates)) {
    const length = pathLength(place.path)
    let reach = reaches[place.path]
    if (!reach) {
      reach = { path: place.path }
      reaches[place.path] = reach
    }
    if (place.star === halfwayStar(length)) reach.half = place.date
    if (place.star === length) reach.end = place.date
  }
  return reaches
}
