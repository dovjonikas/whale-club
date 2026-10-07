import { earnedTier } from './derive'
import type { AppData, DayRecord, Settings, Thing } from './types'
import { DEFAULT_MINUTES, emptyData, EVERY_DAY, MAX_MINUTES, MIN_MINUTES } from './types'

/**
 * Turns whatever was in storage into a valid AppData, or throws.
 *
 * Written as a strict guard rather than a lenient one: a record that fails
 * is rejected whole and the caller keeps the broken copy aside, because a
 * half-trusted record is how a person loses three months of days without
 * noticing. A new version adds a case to the switch below and bumps
 * `version` in types.ts.
 */
export function migrate(raw: unknown): AppData {
  if (!isRecord(raw)) throw new Error('not an object')
  switch (raw.version) {
    case 1:
      return fromV1(raw)
    case 2:
    case 3:
    case 4:
      // Version 2 had no days and versions 2 and 3 had a mode (tap or timer) and an
      // optional length; validateThing gives every thing its days and a length,
      // and leaves the mode behind: since 0.5 every thing can be tapped or locked in.
      // Before version 5 sessions were not kept one by one; lanterns come from the minutes.
      return withLanterns(validateV2(raw))
    case 5:
      return validateV2(raw)
    default:
      throw new Error(`unknown version ${String(raw.version)}`)
  }
}

/**
 * Version 1 had no stones: everything earned was already in the scene.
 * So every tier a thing has earned counts as cracked, and nothing a person
 * could already see turns back into a rock.
 */
function fromV1(raw: Record<string, unknown>): AppData {
  const data = validateCommon(raw)
  for (const thing of data.things) {
    const tier = earnedTier(data, thing.id)
    if (tier > 0) data.cracked[thing.id] = tier
  }
  return data
}

/**
 * Before version 5 a day kept the minutes per thing, not the sessions. A
 * thing that was done and has minutes almost always got them from a
 * lock-in that ran to its end (a stopped one is minutes without done), so
 * each such pair becomes one lantern, dim if the session was left. A
 * stopped session that was later tapped done gets a lantern it did not
 * strictly earn; that is the generous side to err on.
 */
function withLanterns(data: AppData): AppData {
  for (const day of Object.values(data.days)) {
    const sessions = day.done
      .filter((id) => (day.minutes[id] ?? 0) > 0)
      .map((id) =>
        day.waited?.includes(id)
          ? { thing: id, minutes: day.minutes[id] ?? 0, left: true as const }
          : { thing: id, minutes: day.minutes[id] ?? 0 },
      )
    if (sessions.length > 0) day.sessions = sessions
  }
  return data
}

function validateV2(raw: Record<string, unknown>): AppData {
  const data = validateCommon(raw)
  if (isRecord(raw.cracked)) {
    for (const [id, tier] of Object.entries(raw.cracked)) {
      if (typeof tier === 'number' && tier > 0) data.cracked[id] = tier
    }
  }
  return data
}

function validateCommon(raw: Record<string, unknown>): AppData {
  const data = emptyData()
  if (!Array.isArray(raw.things)) throw new Error('things is not a list')
  data.things = raw.things.map(validateThing)
  if (!isRecord(raw.days)) throw new Error('days is not an object')
  for (const [key, value] of Object.entries(raw.days)) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(key)) throw new Error(`bad day key ${key}`)
    data.days[key] = validateDay(value)
  }
  data.settings = validateSettings(raw.settings)
  return data
}

function validateThing(raw: unknown): Thing {
  if (!isRecord(raw)) throw new Error('thing is not an object')
  const { id, name, emoji, minutes, world, createdAt, order, days } = raw
  if (typeof id !== 'string' || !id) throw new Error('thing without id')
  if (typeof name !== 'string') throw new Error('thing without name')
  if (typeof emoji !== 'string') throw new Error('thing without emoji')
  if (world !== 'sea' && world !== 'sky' && world !== 'garden') throw new Error('bad world')
  if (typeof createdAt !== 'string') throw new Error('thing without createdAt')
  if (typeof order !== 'number') throw new Error('thing without order')
  const planned =
    Array.isArray(days) && days.length === 7 && days.every((d) => typeof d === 'boolean')
      ? days
      : [...EVERY_DAY]
  const length =
    typeof minutes === 'number' && Number.isFinite(minutes)
      ? Math.min(MAX_MINUTES, Math.max(MIN_MINUTES, Math.round(minutes)))
      : DEFAULT_MINUTES
  return { id, name, emoji, minutes: length, days: planned, world, createdAt, order }
}

function validateDay(raw: unknown): DayRecord {
  if (!isRecord(raw)) throw new Error('day is not an object')
  const done = Array.isArray(raw.done) ? raw.done.filter(isString) : []
  const minutes: Record<string, number> = {}
  if (isRecord(raw.minutes)) {
    for (const [id, n] of Object.entries(raw.minutes)) {
      if (typeof n === 'number' && n >= 0) minutes[id] = n
    }
  }
  const day: DayRecord = { done: [...new Set(done)], minutes }
  if (Array.isArray(raw.waited)) {
    const waited = raw.waited.filter(isString).filter((id) => day.done.includes(id))
    if (waited.length > 0) day.waited = [...new Set(waited)]
  }
  for (const key of ['extra', 'skip'] as const) {
    const list = raw[key]
    if (Array.isArray(list)) {
      const ids = [...new Set(list.filter(isString))]
      if (ids.length > 0) day[key] = ids
    }
  }
  if (raw.checkin === true) day.checkin = true
  if (Array.isArray(raw.sessions)) {
    const sessions = raw.sessions.filter(isRecord).flatMap((s) => {
      if (typeof s.thing !== 'string' || typeof s.minutes !== 'number' || s.minutes < 0) return []
      return [
        s.left === true
          ? { thing: s.thing, minutes: s.minutes, left: true as const }
          : { thing: s.thing, minutes: s.minutes },
      ]
    })
    if (sessions.length > 0) day.sessions = sessions
  }
  return day
}

function validateSettings(raw: unknown): Settings {
  const settings: Settings = { sound: true }
  if (!isRecord(raw)) return settings
  if (raw.sound === false) settings.sound = false
  if (typeof raw.installDismissedAt === 'string')
    settings.installDismissedAt = raw.installDismissedAt
  if (typeof raw.lastRecapWeek === 'string') settings.lastRecapWeek = raw.lastRecapWeek
  // A buddy from v0.3 is dropped here on purpose: the club became postcards.
  if (raw.postcardFormat === 'story' || raw.postcardFormat === 'square')
    settings.postcardFormat = raw.postcardFormat
  if (raw.sessionSound === true) settings.sessionSound = true
  if (raw.showTime === true) settings.showTime = true
  return settings
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isString(value: unknown): value is string {
  return typeof value === 'string'
}
