import { earnedTier } from './derive'
import type { AppData, DayRecord, Settings, Thing } from './types'
import { emptyData, EVERY_DAY } from './types'

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
      // Version 2 had no days; validateThing gives a thing without them every day.
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
  const { id, name, emoji, mode, minutes, world, createdAt, order, days } = raw
  if (typeof id !== 'string' || !id) throw new Error('thing without id')
  if (typeof name !== 'string') throw new Error('thing without name')
  if (typeof emoji !== 'string') throw new Error('thing without emoji')
  if (mode !== 'tap' && mode !== 'timer') throw new Error('thing with bad mode')
  if (world !== 'sea' && world !== 'sky' && world !== 'garden') throw new Error('bad world')
  if (typeof createdAt !== 'string') throw new Error('thing without createdAt')
  if (typeof order !== 'number') throw new Error('thing without order')
  const planned =
    Array.isArray(days) && days.length === 7 && days.every((d) => typeof d === 'boolean')
      ? days
      : [...EVERY_DAY]
  const thing: Thing = { id, name, emoji, mode, days: planned, world, createdAt, order }
  if (typeof minutes === 'number' && minutes > 0) thing.minutes = minutes
  return thing
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
  return settings
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isString(value: unknown): value is string {
  return typeof value === 'string'
}
