import { fromKey } from '../store/dates'
import type { DateKey } from '../store/types'

/**
 * The real year in the scene: the season from the date, and the nights
 * and days the sky and the sea keep. Worked out from the clock alone;
 * nothing is stored, nothing is fetched. Dates are the usual ones, a day
 * either side of the true astronomical moment at most, which is close
 * enough for a sky that is drawn, not measured.
 */
export type Season = 'winter' | 'spring' | 'summer' | 'autumn'
export type Hemisphere = 'north' | 'south'

export type SkyEvent =
  'meteors' | 'solstice' | 'equinox' | 'ocean-day' | 'whale-day' | 'new-year' | 'anniversary'

/** By month, meteorological seasons: winter is December to February in the north. */
const NORTH: readonly Season[] = [
  'winter',
  'winter',
  'spring',
  'spring',
  'spring',
  'summer',
  'summer',
  'summer',
  'autumn',
  'autumn',
  'autumn',
  'winter',
]
const OPPOSITE: Readonly<Record<Season, Season>> = {
  winter: 'summer',
  spring: 'autumn',
  summer: 'winter',
  autumn: 'spring',
}

export function seasonOf(date: Date, hemisphere: Hemisphere = 'north'): Season {
  const north = NORTH[date.getMonth()] ?? 'winter'
  return hemisphere === 'north' ? north : OPPOSITE[north]
}

/** The great meteor showers, on their peak nights: [month (0-11), first day, last day]. */
const SHOWERS: readonly (readonly [number, number, number])[] = [
  [0, 3, 4], // Quadrantids
  [3, 22, 23], // Lyrids
  [7, 12, 13], // Perseids
  [11, 13, 14], // Geminids
]
/** Solstices and equinoxes, on their usual days. */
const SOLSTICES: readonly (readonly [number, number])[] = [
  [5, 21],
  [11, 21],
]
const EQUINOXES: readonly (readonly [number, number])[] = [
  [2, 20],
  [8, 22],
]
/** World Ocean Day: 8 June. */
const OCEAN_DAY: readonly [number, number] = [5, 8]
/** The night hours: a night belongs to the evening it began on. */
const NIGHT_FROM = 21
const NIGHT_TO = 5

/** The evening a moment's night began on: before 05:00 it is still last night. */
function evening(date: Date): Date {
  const day = new Date(date)
  if (date.getHours() < NIGHT_TO) day.setDate(day.getDate() - 1)
  return day
}

const on = (date: Date, [month, day]: readonly [number, number]): boolean =>
  date.getMonth() === month && date.getDate() === day

/** World Whale Day: the third Sunday of February. */
function isWhaleDay(date: Date): boolean {
  if (date.getMonth() !== 1 || date.getDay() !== 0) return false
  return Math.ceil(date.getDate() / 7) === 3
}

/**
 * What the sky and the sea keep at this moment. A shower and New Year's
 * belong to the night (they run on past midnight); the rest to the day.
 * `firstDay` is the person's first day with something done.
 */
export function eventsAt(date: Date, firstDay?: DateKey): SkyEvent[] {
  const events: SkyEvent[] = []
  const night = evening(date)
  const dark = date.getHours() >= NIGHT_FROM || date.getHours() < NIGHT_TO
  if (
    dark &&
    SHOWERS.some(
      ([m, a, b]) => night.getMonth() === m && night.getDate() >= a && night.getDate() <= b,
    )
  )
    events.push('meteors')
  if (dark && night.getMonth() === 11 && night.getDate() === 31) events.push('new-year')
  if (SOLSTICES.some((d) => on(date, d))) events.push('solstice')
  if (EQUINOXES.some((d) => on(date, d))) events.push('equinox')
  if (on(date, OCEAN_DAY)) events.push('ocean-day')
  if (isWhaleDay(date)) events.push('whale-day')
  if (firstDay !== undefined) {
    const first = fromKey(firstDay)
    if (
      date.getFullYear() > first.getFullYear() &&
      date.getMonth() === first.getMonth() &&
      date.getDate() === first.getDate()
    )
      events.push('anniversary')
  }
  return events
}

/** Whole years since the first day, on an anniversary. */
export function yearsSince(date: Date, firstDay: DateKey): number {
  return date.getFullYear() - fromKey(firstDay).getFullYear()
}
