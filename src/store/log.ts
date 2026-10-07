import { addDays, fromKey, toKey } from './dates'
import { counted } from './derive'
import type { AppData, DateKey } from './types'

/**
 * The arithmetic behind the log, the one view of what has been done: a
 * month's summary, a day's record and the days of a month laid out by
 * week. Plain functions of AppData, so the sheet only draws.
 */
export interface MonthSummary {
  stars: number
  lanterns: number
  minutes: number
}

export interface DayEntry {
  date: DateKey
  /** Things done that day and counted (a star's worth); `manual` when done without the timer. */
  done: { id: string; name: string; emoji: string; manual: boolean }[]
  /** Lock-ins that ran to their end, in order: bright, soft (in parts) or dim (left, before 0.11). */
  sessions: {
    id: string
    name: string
    emoji: string
    minutes: number
    left: boolean
    parts: number
  }[]
  /** Lock-in minutes on a thing not done that day: a faint lantern once the day is over. */
  unfinished: { id: string; name: string; emoji: string; minutes: number }[]
  /** All the minutes locked in that day, stopped ones included. */
  minutes: number
  checkin: boolean
  star: boolean
}

/** `YYYY-MM`, the key of a month. */
export type MonthKey = string

export function monthOf(date: DateKey): MonthKey {
  return date.slice(0, 7)
}

export function addMonths(month: MonthKey, n: number): MonthKey {
  const [y, m] = month.split('-').map(Number)
  const date = new Date(y ?? 1970, (m ?? 1) - 1 + n, 1)
  return toKey(date).slice(0, 7)
}

/** Every date of a month, first to last. */
export function daysOf(month: MonthKey): DateKey[] {
  const first = `${month}-01`
  const keys: DateKey[] = []
  for (let date = first; monthOf(date) === month; date = addDays(date, 1)) keys.push(date)
  return keys
}

/**
 * The month laid out in weeks, Monday first: null where a week reaches
 * into the month before or after.
 */
export function weeksOf(month: MonthKey): (DateKey | null)[][] {
  const days = daysOf(month)
  const first = days[0] ?? `${month}-01`
  const lead = (fromKey(first).getDay() + 6) % 7
  const cells: (DateKey | null)[] = [...(Array(lead).fill(null) as null[]), ...days]
  while (cells.length % 7 !== 0) cells.push(null)
  const weeks: (DateKey | null)[][] = []
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7))
  return weeks
}

export function dayEntry(data: AppData, date: DateKey): DayEntry {
  const day = data.days[date]
  const named = (id: string): { id: string; name: string; emoji: string } => {
    const thing = [...data.things, ...(data.retired ?? [])].find((t) => t.id === id)
    // A thing deleted since keeps its days, without a name to show.
    return { id, name: thing?.name ?? '…', emoji: thing?.emoji ?? '•' }
  }
  const done = (day?.done ?? [])
    .filter((id) => counted(day, id))
    .map((id) => ({ ...named(id), manual: day?.manual?.includes(id) ?? false }))
  const sessions = (day?.sessions ?? []).map((s) => ({
    ...named(s.thing),
    minutes: s.minutes,
    left: s.left === true,
    parts: s.parts ?? 1,
  }))
  const unfinished = Object.entries(day?.minutes ?? {})
    .filter(([id, n]) => n > 0 && !(day?.done.includes(id) ?? false))
    .map(([id, n]) => ({ ...named(id), minutes: n }))
  const minutes = Object.values(day?.minutes ?? {}).reduce((sum, n) => sum + n, 0)
  return {
    date,
    done,
    sessions,
    unfinished,
    minutes,
    checkin: day?.checkin === true,
    star: done.length > 0,
  }
}

export function monthSummary(data: AppData, month: MonthKey): MonthSummary {
  let stars = 0
  let lanterns = 0
  let minutes = 0
  for (const [date, day] of Object.entries(data.days)) {
    if (monthOf(date) !== month) continue
    if (day.done.some((id) => counted(day, id))) stars++
    lanterns += day.sessions?.length ?? 0
    minutes += Object.values(day.minutes).reduce((sum, n) => sum + n, 0)
  }
  return { stars, lanterns, minutes }
}

/** The first month the log has anything for: the month the first thing was added. */
export function firstMonth(data: AppData, fallback: DateKey): MonthKey {
  const first = data.things.map((t) => t.createdAt).sort()[0]
  const firstDay = Object.keys(data.days).sort()[0]
  const earliest = [first, firstDay, fallback].filter((d): d is string => d !== undefined).sort()[0]
  return monthOf(earliest ?? fallback)
}
