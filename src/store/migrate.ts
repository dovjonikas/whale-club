import { glyphForEmoji } from '../brand/emoji'
import { glyph, LETTER } from '../brand/glyphs'
import { glyphFor } from '../brand/match'
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
      return withKinds(withLanterns(validateV2(raw)))
    case 5:
      // Before version 6 every thing could be tapped or locked in; each gets a kind.
      return withKinds(validateV2(raw))
    case 6:
    case 7:
    case 8:
      // Before version 7 things wore emoji; validateThing gives each its glyph.
      // Before version 8 nothing was bought or placed; validateDock reads what there is.
      return validateDock(raw, validateV2(raw))
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

/**
 * From 0.11 a thing is one of two kinds. One whose done days mostly had
 * lock-in minutes was being locked in, so it becomes a lock-in; the rest
 * are tap things. Its length stays; the past is not rewritten.
 */
function withKinds(data: AppData): AppData {
  // Lines were worked out from the order among a world's things: the first had line a.
  for (const thing of data.things) {
    const first = data.things
      .filter((t) => t.world === thing.world)
      .sort((x, y) => x.order - y.order)[0]
    thing.line = first?.id === thing.id ? 'a' : 'b'
  }
  for (const thing of data.things) {
    let doneDays = 0
    let lockedDays = 0
    for (const day of Object.values(data.days)) {
      if (!day.done.includes(thing.id)) continue
      doneDays++
      if ((day.minutes[thing.id] ?? 0) > 0) lockedDays++
    }
    thing.kind = lockedDays * 2 > doneDays ? 'lockIn' : 'tap'
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

/**
 * The dock and the arrangement: purchases with a price, the goal, what is
 * hidden or worn, and where things stand. Anything malformed is dropped on
 * its own; none of it can cost a day of history.
 */
function validateDock(raw: Record<string, unknown>, data: AppData): AppData {
  if (Array.isArray(raw.bought)) {
    const bought = raw.bought
      .filter(isRecord)
      .flatMap((b) =>
        typeof b.item === 'string' &&
        typeof b.date === 'string' &&
        typeof b.price === 'number' &&
        b.price >= 0
          ? [{ item: b.item, date: b.date, price: Math.round(b.price) }]
          : [],
      )
    if (bought.length > 0) data.bought = bought
  }
  if (typeof raw.goal === 'string') data.goal = raw.goal
  if (Array.isArray(raw.hidden)) {
    const hidden = [...new Set(raw.hidden.filter(isString))]
    if (hidden.length > 0) data.hidden = hidden
  }
  const pairs = (value: unknown): Record<string, string> | undefined => {
    if (!isRecord(value)) return undefined
    const kept = Object.fromEntries(
      Object.entries(value).filter((entry): entry is [string, string] => isString(entry[1])),
    )
    return Object.keys(kept).length > 0 ? kept : undefined
  }
  const wears = pairs(raw.wears)
  if (wears) data.wears = wears
  const placement = pairs(raw.placement)
  if (placement) data.placement = placement
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
  if (Array.isArray(raw.retired)) {
    const retired = raw.retired
      .map(validateThing)
      .filter((t) => !data.things.some((x) => x.id === t.id))
    if (retired.length > 0) data.retired = retired
  }
  return data
}

function validateThing(raw: unknown): Thing {
  if (!isRecord(raw)) throw new Error('thing is not an object')
  const { id, name, icon, emoji, kind, line, minutes, world, createdAt, order, days } = raw
  if (typeof id !== 'string' || !id) throw new Error('thing without id')
  if (typeof name !== 'string') throw new Error('thing without name')
  if (emoji !== undefined && typeof emoji !== 'string') throw new Error('bad emoji')
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
  return {
    id,
    name,
    icon: iconFor(icon, emoji, name),
    ...(typeof emoji === 'string' ? { emoji } : {}),
    // Before version 6 there was no kind and no line; withKinds decides both.
    kind: kind === 'lockIn' ? 'lockIn' : 'tap',
    line: line === 'b' ? 'b' : 'a',
    minutes: length,
    days: planned,
    world,
    createdAt,
    order,
  }
}

/**
 * A thing's glyph: the one it has, if it is real; before 0.12, the glyph
 * its emoji meant; failing that, one picked from its name; failing that,
 * its monogram. Reading the emoji first keeps what a person chose over
 * what a guess at their words would give.
 */
function iconFor(icon: unknown, emoji: unknown, name: string): string {
  if (typeof icon === 'string' && (icon === LETTER || glyph(icon))) return icon
  const meant = typeof emoji === 'string' ? glyphForEmoji(emoji) : undefined
  return meant ?? glyphFor(name)
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
  if (Array.isArray(raw.manual)) {
    const manual = raw.manual.filter(isString).filter((id) => day.done.includes(id))
    if (manual.length > 0) day.manual = [...new Set(manual)]
  }
  if (Array.isArray(raw.sessions)) {
    const sessions = raw.sessions.filter(isRecord).flatMap((s) => {
      if (typeof s.thing !== 'string' || typeof s.minutes !== 'number' || s.minutes < 0) return []
      const parts = typeof s.parts === 'number' && s.parts > 1 ? { parts: Math.round(s.parts) } : {}
      return [
        s.left === true
          ? { thing: s.thing, minutes: s.minutes, left: true as const }
          : { thing: s.thing, minutes: s.minutes, ...parts },
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
  if (Array.isArray(raw.explained)) {
    const explained = raw.explained.filter(isString)
    if (explained.length > 0) settings.explained = [...new Set(explained)]
  }
  return settings
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isString(value: unknown): value is string {
  return typeof value === 'string'
}
