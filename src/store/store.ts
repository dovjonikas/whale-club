import { glyphFor } from '../brand/match'
import { now } from './clock'
import { withGoal, withHidden, withPurchase, withWearer } from './dock'
import { dataKey } from './lab'
import { migrate } from './migrate'
import { todayKey } from './dates'
import type {
  AppData,
  DateKey,
  DayRecord,
  Kind,
  Line,
  Settings,
  Thing,
  World,
  After,
} from './types'
import { DEFAULT_MINUTES, emptyData, EVERY_DAY, GOOD_MAX, MAX_THINGS, WORLD_ORDER } from './types'

/** Where an unreadable record is parked rather than thrown away, next to its own key. */
const BROKEN_SUFFIX = '.broken'

type Listener = (data: AppData) => void

/**
 * The one place that touches localStorage for the app's data.
 *
 * Every action copies, changes, saves and notifies. Listeners redraw from
 * the whole object; there is no diffing, because the whole object is small
 * (five things, a few hundred days) and a full redraw is cheaper than a bug.
 */
export class Store {
  private data: AppData
  private readonly listeners = new Set<Listener>()

  constructor(initial?: AppData) {
    this.data = initial ?? load()
  }

  get(): AppData {
    return this.data
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  addThing(input: {
    name: string
    /** A glyph id or "letter"; picked from the name when not given. */
    icon?: string
    kind?: Kind
    minutes?: number
    days?: readonly boolean[]
  }): Thing | null {
    const things = this.data.things
    if (things.length >= MAX_THINGS) return null
    const name = input.name.trim()
    if (!name) return null
    const world = nextWorld(things)
    const thing: Thing = {
      id: newId(),
      name,
      icon: input.icon ?? glyphFor(name),
      kind: input.kind ?? 'tap',
      minutes: input.minutes ?? DEFAULT_MINUTES,
      days: [...(input.days ?? EVERY_DAY)],
      world,
      line: nextLine(things, world),
      createdAt: todayKey(),
      order: things.reduce((max, t) => Math.max(max, t.order + 1), 0),
    }
    this.commit({ ...this.data, things: [...things, thing] })
    return thing
  }

  /** Replaces everything at once: the lab's sandbox, a restored backup, starting over, and their undo. */
  replace(data: AppData): void {
    this.commit(data)
  }

  /**
   * Deletes a thing from the row. Its days keep their record of it and it is
   * kept among the retired, so the stars it earned stay in the sky, its finds
   * in the scene and its lanterns in the cove. Returns it, for undo.
   */
  removeThing(id: string): Thing | null {
    const thing = this.data.things.find((t) => t.id === id)
    if (!thing) return null
    this.commit({
      ...this.data,
      things: this.data.things.filter((t) => t.id !== id),
      retired: [...(this.data.retired ?? []).filter((t) => t.id !== id), thing],
    })
    return thing
  }

  /** Undo of a delete: the thing comes back exactly as it was, in its place. */
  restoreThing(thing: Thing): void {
    if (this.data.things.length >= MAX_THINGS) return
    if (this.data.things.some((t) => t.id === thing.id)) return
    const retired = (this.data.retired ?? []).filter((t) => t.id !== thing.id)
    const next: AppData = { ...this.data, things: [...this.data.things, thing] }
    if (retired.length > 0) next.retired = retired
    else delete next.retired
    this.commit(next)
  }

  /** Marks or unmarks a tap thing for a day. Returns the new state. A tap is always a full count. */
  toggleDone(thingId: string, date: DateKey = todayKey()): boolean {
    const day = this.day(date)
    const isDone = day.done.includes(thingId)
    const done = isDone ? day.done.filter((id) => id !== thingId) : [...day.done, thingId]
    this.commit({
      ...this.data,
      days: { ...this.data.days, [date]: withoutWaited({ ...day, done }, thingId) },
    })
    return !isDone
  }

  /**
   * The minutes a lock-in's timer has seen today, so far: kept when a
   * session stops or is interrupted, so the next one goes on from them.
   * Only ever goes up within a day.
   */
  keepMinutes(thingId: string, minutes: number, date: DateKey = todayKey()): void {
    const day = this.day(date)
    const kept = Math.max(day.minutes[thingId] ?? 0, Math.floor(minutes))
    if (kept <= 0 || kept === day.minutes[thingId]) return
    this.commit({
      ...this.data,
      days: { ...this.data.days, [date]: { ...day, minutes: { ...day.minutes, [thingId]: kept } } },
    })
  }

  /**
   * A lock-in session ran to its end. `seen` is all the minutes the timer
   * saw today, this session included. When they reach the thing's length
   * the thing is done; the session is a lantern either way it ended, so a
   * second session on a done day is one more lantern and nothing else.
   */
  finishLockIn(
    thingId: string,
    session: { seen: number; minutes: number; parts: number },
    date: DateKey = todayKey(),
  ): void {
    const day = this.day(date)
    const record =
      session.parts > 1
        ? { thing: thingId, minutes: session.minutes, parts: session.parts }
        : { thing: thingId, minutes: session.minutes }
    const next: DayRecord = {
      ...day,
      done: day.done.includes(thingId) ? day.done : [...day.done, thingId],
      minutes: {
        ...day.minutes,
        [thingId]: Math.max(day.minutes[thingId] ?? 0, Math.floor(session.seen)),
      },
      sessions: [...(day.sessions ?? []), record],
    }
    this.commit({ ...this.data, days: { ...this.data.days, [date]: next } })
  }

  /**
   * Done without the timer: a lesson, a phone that was dead. It counts, with
   * a hand on the card, and leaves no lantern. The weekly limit is the
   * sheet's to keep (see derive.withoutTimerLeft).
   */
  doneWithoutTimer(thingId: string, date: DateKey = todayKey()): void {
    const day = this.day(date)
    if (day.done.includes(thingId)) return
    this.commit({
      ...this.data,
      days: {
        ...this.data.days,
        [date]: { ...day, done: [...day.done, thingId], manual: [...(day.manual ?? []), thingId] },
      },
    })
  }

  /**
   * Takes back a lock-in thing's done for the day, from its sheet: the
   * mark, the minutes and the sessions of the day go, as if it had not
   * started. A tap thing is taken back by its card.
   */
  undoToday(thingId: string, date: DateKey = todayKey()): void {
    const day = this.day(date)
    const minutes = Object.fromEntries(Object.entries(day.minutes).filter(([id]) => id !== thingId))
    const next: DayRecord = { ...day, done: day.done.filter((id) => id !== thingId), minutes }
    const drop = (list: string[] | undefined): string[] | undefined => {
      const kept = list?.filter((id) => id !== thingId)
      return kept && kept.length > 0 ? kept : undefined
    }
    const waited = drop(day.waited)
    const manual = drop(day.manual)
    const sessions = day.sessions?.filter((s) => s.thing !== thingId)
    delete next.waited
    delete next.manual
    delete next.sessions
    if (waited) next.waited = waited
    if (manual) next.manual = manual
    if (sessions && sessions.length > 0) next.sessions = sessions
    this.commit({ ...this.data, days: { ...this.data.days, [date]: next } })
  }

  /** The thing's sheet: its name, glyph, lock-in length and weekdays. */
  updateThing(
    thingId: string,
    patch: Partial<Pick<Thing, 'name' | 'icon' | 'kind' | 'minutes' | 'days'>> & {
      /** A moment of the day, or null for none. */
      after?: After | null
    },
  ): void {
    this.commit({
      ...this.data,
      things: this.data.things.map((t) => {
        if (t.id !== thingId) return t
        const { after, ...rest } = patch
        const next: Thing = { ...t, ...rest }
        if (after === null) delete next.after
        else if (after !== undefined) next.after = after
        if (patch.name !== undefined) next.name = patch.name.trim() || t.name
        if (patch.days) next.days = [...patch.days]
        return next
      }),
    })
  }

  /**
   * Changes one day only: "also today" puts a thing that is off on the day,
   * "not today" takes a planned one off it, and `null` undoes either.
   */
  setToday(thingId: string, change: 'extra' | 'skip' | null, date: DateKey = todayKey()): void {
    const day = this.day(date)
    const extra = (day.extra ?? []).filter((id) => id !== thingId)
    const skip = (day.skip ?? []).filter((id) => id !== thingId)
    if (change === 'extra') extra.push(thingId)
    if (change === 'skip') skip.push(thingId)
    const next: DayRecord = { ...day }
    delete next.extra
    delete next.skip
    if (extra.length > 0) next.extra = extra
    if (skip.length > 0) next.skip = skip
    this.commit({ ...this.data, days: { ...this.data.days, [date]: next } })
  }

  /** The dial opens on the last length chosen for a thing. */
  setThingMinutes(thingId: string, minutes: number): void {
    this.commit({
      ...this.data,
      things: this.data.things.map((t) => (t.id === thingId ? { ...t, minutes } : t)),
    })
  }

  /** A stone cracked open: everything up to this tier is found. */
  crack(thingId: string, tier: number): void {
    const current = this.data.cracked[thingId] ?? 0
    if (tier <= current) return
    this.commit({ ...this.data, cracked: { ...this.data.cracked, [thingId]: tier } })
  }

  /** The evening's one good thing for a day; an empty line takes it back. */
  setGood(text: string, date: DateKey = todayKey()): void {
    const day: DayRecord = { ...this.day(date) }
    const line = text.trim().slice(0, GOOD_MAX)
    if (line) day.good = line
    else delete day.good
    this.commit({ ...this.data, days: { ...this.data.days, [date]: day } })
  }

  setCheckin(date: DateKey = todayKey()): void {
    const day = this.day(date)
    this.commit({ ...this.data, days: { ...this.data.days, [date]: { ...day, checkin: true } } })
  }

  setSettings(patch: Partial<Settings>): void {
    this.commit({ ...this.data, settings: { ...this.data.settings, ...patch } })
  }

  // --- The dock and the arrangement ---------------------------------------------------------

  /** Buys a dock thing at its catalogue price; false when it is owned or the krill is short. */
  buy(item: string, price: number, date: DateKey = todayKey()): boolean {
    const next = withPurchase(this.data, item, price, date)
    if (!next) return false
    this.commit(next)
    return true
  }

  setGoal(item: string | null): void {
    this.commit(withGoal(this.data, item))
  }

  setHidden(item: string, hidden: boolean): void {
    this.commit(withHidden(this.data, item, hidden))
  }

  setWearer(item: string, thing: string): void {
    this.commit(withWearer(this.data, item, thing))
  }

  /** Where everything stands, as records; null forgets them all ("tidy up"). */
  setPlacement(records: Readonly<Record<string, string>> | null): void {
    const next: AppData = { ...this.data }
    if (records === null || Object.keys(records).length === 0) delete next.placement
    else next.placement = { ...records }
    this.commit(next)
  }

  private day(date: DateKey) {
    return this.data.days[date] ?? { done: [], minutes: {} }
  }

  private commit(next: AppData): void {
    this.data = next
    save(next)
    for (const listener of this.listeners) listener(next)
  }
}

/** A tap on a thing clears its mark from data before 0.11, when a left session waited. */
function withoutWaited(day: DayRecord, thingId: string): DayRecord {
  const list = (day.waited ?? []).filter((id) => id !== thingId)
  const next: DayRecord = { ...day }
  delete next.waited
  return list.length > 0 ? { ...next, waited: list } : next
}

/** Worlds go round in a fixed order, so the 4th thing is a sea thing again. */
export function worldForOrder(order: number): World {
  return WORLD_ORDER[order % WORLD_ORDER.length] ?? 'sea'
}

/**
 * The world a new thing gets: the first one the row's pattern (sea, sky,
 * garden, sea, sky) is missing. With nothing deleted that is simply the
 * next in the pattern; after a delete it fills the gap left behind.
 */
export function nextWorld(things: readonly Thing[]): World {
  const slots = things.length + 1
  for (const world of WORLD_ORDER) {
    let wanted = 0
    for (let i = 0; i < slots; i++) if (worldForOrder(i) === world) wanted++
    if (things.filter((t) => t.world === world).length < wanted) return world
  }
  return worldForOrder(things.length)
}

/** A new thing's line: a, unless a thing of its world already has it. */
export function nextLine(things: readonly Thing[], world: World): Line {
  return things.some((t) => t.world === world && t.line === 'a') ? 'b' : 'a'
}

function load(): AppData {
  let text: string | null = null
  try {
    text = localStorage.getItem(dataKey())
  } catch {
    // Private mode, or storage disabled: the app still runs, for this session only.
    return emptyData()
  }
  if (text === null) return emptyData()
  try {
    return migrate(JSON.parse(text))
  } catch (error) {
    console.warn('whale club: stored data could not be read, starting fresh', error)
    try {
      localStorage.setItem(dataKey() + BROKEN_SUFFIX, text)
    } catch {
      // Nothing more to do: the copy could not be parked either.
    }
    return emptyData()
  }
}

function save(data: AppData): void {
  try {
    localStorage.setItem(dataKey(), JSON.stringify(data))
  } catch (error) {
    console.warn('whale club: could not save', error)
  }
}

function newId(): string {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID()
  return `${now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}
