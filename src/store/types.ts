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

/** A date on the person's own clock, `YYYY-MM-DD`. Sorts as a string. */
export type DateKey = string

export interface Thing {
  id: string
  name: string
  emoji: string
  /**
   * The lock-in length for this thing, in minutes; the dial opens on it and
   * remembers the last one chosen. Every thing can be tapped done or locked
   * in, so every thing has one.
   */
  minutes: number
  /**
   * The weekdays it is planned on, Monday first. All seven by default: the
   * same things every day, as before there were days at all.
   */
  days: boolean[]
  /** Assigned from the thing's position when it was added, then fixed. */
  world: World
  createdAt: DateKey
  order: number
}

/**
 * One lock-in that ran to its end. Each is a lantern in the cove for good:
 * a clean one lit, a left one dim. Undone and stopped sessions leave none.
 */
export interface SessionRecord {
  thing: string
  minutes: number
  /** The person left for longer than the grace and came back: a dim lantern. */
  left?: true
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
  /** Things added to this day only ("also today"), though their weekday is off. */
  extra?: string[]
  /** Things taken off this day only ("not today"), though their weekday is on. */
  skip?: string[]
  /** The daily check-in was answered. */
  checkin?: boolean
  /** Lock-ins that ran to their end that day, in order. */
  sessions?: SessionRecord[]
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
  /** Show the time left during a lock-in. Off: a tap shows it for a moment. */
  showTime?: boolean
}

export interface AppData {
  version: 5
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

/** A new thing's lock-in length, and what a thing from before lengths gets. */
export const DEFAULT_MINUTES = 30
/** The dial's range; a stored length is kept inside it. */
export const MIN_MINUTES = 10
export const MAX_MINUTES = 120

export const WORLD_ORDER: readonly World[] = ['sea', 'sky', 'garden']

/** Every day of the week on: what a new thing, and every thing from before days, gets. */
export const EVERY_DAY: readonly boolean[] = [true, true, true, true, true, true, true]

export function emptyData(): AppData {
  return { version: 5, things: [], days: {}, cracked: {}, settings: { sound: true } }
}
