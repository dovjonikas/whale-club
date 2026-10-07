import { now } from './clock'
import { dataKey } from './lab'
import { migrate } from './migrate'
import { todayKey } from './dates'
import type { AppData, DateKey, DayRecord, Settings, Thing, World } from './types'
import { DEFAULT_MINUTES, emptyData, EVERY_DAY, MAX_THINGS, WORLD_ORDER } from './types'

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
    emoji: string
    minutes?: number
    days?: readonly boolean[]
  }): Thing | null {
    if (this.data.things.length >= MAX_THINGS) return null
    const name = input.name.trim()
    if (!name) return null
    const order = this.data.things.length
    const thing: Thing = {
      id: newId(),
      name,
      emoji: input.emoji.trim() || '•',
      minutes: input.minutes ?? DEFAULT_MINUTES,
      days: [...(input.days ?? EVERY_DAY)],
      world: worldForOrder(order),
      createdAt: todayKey(),
      order,
    }
    this.commit({ ...this.data, things: [...this.data.things, thing] })
    return thing
  }

  /** Replaces everything at once. Only the lab does this, and only to its own sandbox. */
  replace(data: AppData): void {
    this.commit(data)
  }

  removeThing(id: string): void {
    // The days keep their record of the thing: deleting a thing never
    // rewrites history, and the stars it earned stay in the sky.
    this.commit({ ...this.data, things: this.data.things.filter((t) => t.id !== id) })
  }

  /** Marks or unmarks a thing for a day. Returns the new state. A tap is always a full count. */
  toggleDone(thingId: string, date: DateKey = todayKey()): boolean {
    const day = this.day(date)
    const isDone = day.done.includes(thingId)
    const done = isDone ? day.done.filter((id) => id !== thingId) : [...day.done, thingId]
    this.commit({
      ...this.data,
      days: { ...this.data.days, [date]: withWaited({ ...day, done }, thingId, false) },
    })
    return !isDone
  }

  isDone(thingId: string, date: DateKey = todayKey()): boolean {
    return this.data.days[date]?.done.includes(thingId) ?? false
  }

  /**
   * A lock-in that ran to its end. It counts as done either way. A clean
   * one is a full count; one that was left and waited is marked so, and
   * earns no star and no step towards a stone, unless the thing was
   * already fully counted today.
   */
  finishSession(
    thingId: string,
    minutes: number,
    clean: boolean,
    date: DateKey = todayKey(),
  ): void {
    const day = this.day(date)
    const already = day.done.includes(thingId) && !(day.waited?.includes(thingId) ?? false)
    const done = day.done.includes(thingId) ? day.done : [...day.done, thingId]
    const waited = !clean && !already
    const session = clean
      ? { thing: thingId, minutes }
      : { thing: thingId, minutes, left: true as const }
    const next = withWaited(
      {
        ...day,
        done,
        minutes: { ...day.minutes, [thingId]: (day.minutes[thingId] ?? 0) + minutes },
        sessions: [...(day.sessions ?? []), session],
      },
      thingId,
      waited,
    )
    this.commit({ ...this.data, days: { ...this.data.days, [date]: next } })
  }

  /** A lock-in stopped early: the minutes are written down, nothing else. */
  addMinutes(thingId: string, minutes: number, date: DateKey = todayKey()): void {
    if (minutes <= 0) return
    const day = this.day(date)
    const total = (day.minutes[thingId] ?? 0) + minutes
    this.commit({
      ...this.data,
      days: {
        ...this.data.days,
        [date]: { ...day, minutes: { ...day.minutes, [thingId]: total } },
      },
    })
  }

  /** The thing's sheet: its name, emoji, lock-in length and weekdays. */
  updateThing(
    thingId: string,
    patch: Partial<Pick<Thing, 'name' | 'emoji' | 'minutes' | 'days'>>,
  ): void {
    this.commit({
      ...this.data,
      things: this.data.things.map((t) => {
        if (t.id !== thingId) return t
        const next = { ...t, ...patch }
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

  setCheckin(date: DateKey = todayKey()): void {
    const day = this.day(date)
    this.commit({ ...this.data, days: { ...this.data.days, [date]: { ...day, checkin: true } } })
  }

  setSettings(patch: Partial<Settings>): void {
    this.commit({ ...this.data, settings: { ...this.data.settings, ...patch } })
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

function withWaited(day: DayRecord, thingId: string, waited: boolean): DayRecord {
  const others = (day.waited ?? []).filter((id) => id !== thingId)
  const list = waited ? [...others, thingId] : others
  const next: DayRecord = { ...day }
  delete next.waited
  return list.length > 0 ? { ...next, waited: list } : next
}

/** Worlds go round in a fixed order, so the 4th thing is a sea thing again. */
export function worldForOrder(order: number): World {
  return WORLD_ORDER[order % WORLD_ORDER.length] ?? 'sea'
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
