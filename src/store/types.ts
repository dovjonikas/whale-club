/**
 * The whole of what the app remembers, as one object under one key.
 *
 * Everything on screen is a function of this: creature stages, collectibles,
 * stars and streaks are all derived from `days` at draw time and never
 * stored, so there is no second copy that can disagree with the first.
 */

export type World = 'sea' | 'sky' | 'garden'

export type Mode = 'tap' | 'timer'

/** A date on the person's own clock, `YYYY-MM-DD`. Sorts as a string. */
export type DateKey = string

export interface Thing {
  id: string
  name: string
  emoji: string
  mode: Mode
  /** Only for a timer thing: how long one session runs. */
  minutes?: number
  /** Assigned from the thing's position when it was added, then fixed. */
  world: World
  createdAt: DateKey
  order: number
}

export interface DayRecord {
  /** Ids of the things done that day. A thing appears at most once. */
  done: string[]
  /** Minutes recorded by timers, per thing. Absent means none ran. */
  minutes: Record<string, number>
  /** The daily check-in was answered. */
  checkin?: boolean
}

export interface Buddy {
  name: string
  /** The share code pasted in, kept so the buddy's scene can be redrawn offline. */
  code?: string
}

export interface Settings {
  sound: boolean
  /** When the install leaf was last closed; it comes back seven days later. */
  installDismissedAt?: DateKey
  /** The Monday of the last week a recap was shown for. */
  lastRecapWeek?: DateKey
  buddy?: Buddy
}

export interface AppData {
  version: 1
  things: Thing[]
  days: Record<DateKey, DayRecord>
  settings: Settings
}

export const MAX_THINGS = 5

export const WORLD_ORDER: readonly World[] = ['sea', 'sky', 'garden']

export function emptyData(): AppData {
  return { version: 1, things: [], days: {}, settings: { sound: true } }
}
