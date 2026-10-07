/**
 * The whole of what the app remembers, as one object under one key.
 *
 * Everything on screen is a function of this: creature stages, what has
 * been earned, stars and streaks are all derived from `days` at draw time
 * and never stored, so there is no second copy that can disagree with the
 * first. The two things that are facts rather than arithmetic are stored:
 * which earned stones have been cracked open, and which days were shown up
 * for with a session that was left and waited.
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
  /** The last lock-in length for this thing, in minutes; the dial opens on it. */
  minutes?: number
  /** Assigned from the thing's position when it was added, then fixed. */
  world: World
  createdAt: DateKey
  order: number
}

export interface DayRecord {
  /** Ids of the things done that day. A thing appears at most once. */
  done: string[]
  /** Minutes spent locked in, per thing. Absent means none. */
  minutes: Record<string, number>
  /**
   * Things whose only showing up that day was a lock-in session that was
   * left and waited. They count as done (showing up counts) but earn no
   * star and do not bring a stone closer.
   */
  waited?: string[]
  /** The daily check-in was answered. */
  checkin?: boolean
}

export type PostcardFormat = 'story' | 'square'

export interface Settings {
  sound: boolean
  /** When the install leaf was last closed; it comes back seven days later. */
  installDismissedAt?: DateKey
  /** The Monday of the last week a recap was shown for. */
  lastRecapWeek?: DateKey
  /** Chosen the first time a postcard is sent; changed in the menu. */
  postcardFormat?: PostcardFormat
  /** The quiet sea sound during a lock-in. Off unless switched on. */
  sessionSound?: boolean
}

export interface AppData {
  version: 2
  things: Thing[]
  days: Record<DateKey, DayRecord>
  /**
   * Per thing, the highest unlock tier (in total days) whose stone has been
   * cracked. A tier earned but above this is a stone waiting in the scene.
   * Losing this would only bring stones back, never take a find away.
   */
  cracked: Record<string, number>
  settings: Settings
}

export const MAX_THINGS = 5

export const WORLD_ORDER: readonly World[] = ['sea', 'sky', 'garden']

export function emptyData(): AppData {
  return { version: 2, things: [], days: {}, cracked: {}, settings: { sound: true } }
}
