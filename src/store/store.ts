import { migrate } from './migrate'
import { todayKey } from './dates'
import type { AppData, DateKey, DayRecord, Mode, Settings, Thing, World } from './types'
import { emptyData, MAX_THINGS, WORLD_ORDER } from './types'

export const STORAGE_KEY = 'whaleclub:data'
/** Where an unreadable record is parked rather than thrown away. */
const BROKEN_KEY = 'whaleclub:data.broken'

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

  addThing(input: { name: string; emoji: string; mode: Mode; minutes?: number }): Thing | null {
    if (this.data.things.length >= MAX_THINGS) return null
    const name = input.name.trim()
    if (!name) return null
    const order = this.data.things.length
    const thing: Thing = {
      id: newId(),
      name,
      emoji: input.emoji.trim() || '•',
      mode: input.mode,
      world: worldForOrder(order),
      createdAt: todayKey(),
      order,
    }
    if (input.mode === 'timer' && input.minutes && input.minutes > 0) thing.minutes = input.minutes
    this.commit({ ...this.data, things: [...this.data.things, thing] })
    return thing
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
    const next = withWaited(
      {
        ...day,
        done,
        minutes: { ...day.minutes, [thingId]: (day.minutes[thingId] ?? 0) + minutes },
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
    text = localStorage.getItem(STORAGE_KEY)
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
      localStorage.setItem(BROKEN_KEY, text)
    } catch {
      // Nothing more to do: the copy could not be parked either.
    }
    return emptyData()
  }
}

function save(data: AppData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (error) {
    console.warn('whale club: could not save', error)
  }
}

function newId(): string {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID()
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}
