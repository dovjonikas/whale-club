/**
 * The whole of what the app remembers, as one object under one key.
 *
 * Everything on screen is a function of this: creature stages, what has
 * been earned, stars and streaks are all derived from `days` at draw time
 * and never stored, so there is no second copy that can disagree with the
 * first. The facts that are not arithmetic are stored: which earned stones have
 * been cracked open, the minutes a lock-in's timer saw, the lock-ins that
 * ran to their end, and the days done without the timer.
 */

export type World = 'sea' | 'sky' | 'garden'

/** Each world has two lines of creatures and finds; a thing keeps the one it was given. */
export type Line = 'a' | 'b'

/** A date on the person's own clock, `YYYY-MM-DD`. Sorts as a string. */
export type DateKey = string

/**
 * How a thing is done. "tap": a tap on its card, like a list. "lockIn": it
 * counts only when its timer has seen the whole length that day; a tap on
 * its card opens the dial.
 */
export type Kind = 'tap' | 'lockIn'

export interface Thing {
  id: string
  name: string
  /**
   * Its sign in its bubble: a glyph id (src/brand/glyphs.ts), or "letter"
   * for a monogram of its name's first letter. Picked from the name when it
   * is added, and changed in its sheet.
   */
  icon: string
  /** What it wore before 0.12. Kept for the record; only migration reads it. */
  emoji?: string
  kind: Kind
  /**
   * The lock-in length, in minutes: what the timer must see in a day for a
   * lock-in thing to be done. The dial opens on it and remembers the last
   * one chosen. A tap thing keeps one too, for the day it becomes a lock-in.
   */
  minutes: number
  /**
   * The weekdays it is planned on, Monday first. All seven by default: the
   * same things every day, as before there were days at all.
   */
  days: boolean[]
  /** Assigned when it was added, to keep the row's pattern of worlds, then fixed. */
  world: World
  /** Its world's line, given when it was added and never changed by another thing's going. */
  line: Line
  createdAt: DateKey
  order: number
  /**
   * What it comes after in the day, if the person said: no clock hours, a
   * moment. The card shows it, and the row follows the day's order.
   */
  after?: After
}

/** The day's moments a thing can come after, in the order the day has them. */
export const AFTERS = ['waking', 'coffee', 'work', 'dinner', 'bed'] as const
export type After = (typeof AFTERS)[number]

/** The evening's one good thing: one line, kept for the day, shown only in the log. */
export const GOOD_MAX = 120

/**
 * One lock-in that ran to its end. Each is a lantern in the cove for good:
 * bright when it was done in one go, softer when it took several. Minutes
 * the timer saw on a day that never reached the length are a dim lantern,
 * worked out from `minutes`, not stored here.
 */
export interface SessionRecord {
  thing: string
  minutes: number
  /** How many sittings it took; more than one makes a softer lantern. */
  parts?: number
  /** Before 0.11 a session that was left still ended: its lantern is dim. */
  left?: true
}

export interface DayRecord {
  /** Ids of the things done that day. A thing appears at most once. */
  done: string[]
  /** Minutes the timer saw, per thing, finished or not. Absent means none. */
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
  /**
   * Lock-in things done that day without the timer (a lesson, a phone that
   * was dead). They count, with a hand on the card, but leave no lantern.
   */
  manual?: string[]
  /** One good thing about the day, written at the evening check-in, if it was. */
  good?: string
}

export type PostcardFormat = 'story' | 'square'

/** One thing bought in the dock, with the krill paid for it then. */
export interface Purchase {
  item: string
  date: DateKey
  price: number
}

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
  /** Mechanics that have explained themselves once, in one line, and need not again. */
  explained?: string[]
  /** A new chapter began here: the week's dots start fresh from this day. The sky never does. */
  chapterFrom?: DateKey
  /** The day a new chapter was last offered, so it is offered once. */
  chapterOffered?: DateKey
  /** When the day ends, in hours after midnight: 0 (the default), 3 or 5. */
  dayEndsAt?: 0 | 3 | 5
  /** The week's first day: Monday unless the person chose Sunday. */
  weekStartsOn?: 'monday' | 'sunday'
  /** Which half of the world the seasons follow. */
  hemisphere?: 'north' | 'south'
  /** The lock-in length a new thing starts with. */
  defaultMinutes?: number
  /** A still sea: the scene's own motion paused, for anyone who wants it so. */
  stillSea?: boolean
  /** When the sea was last backed up to a file. */
  lastBackupAt?: DateKey
  /** The month the backup dot was last seen on the menu, so it shows once a month. */
  backupNudged?: string
  /** Lasting storage was asked for once, after the first week. */
  persistAsked?: boolean
}

/** The shape of the saved record; migrate.ts brings every earlier one up to it. */
export const DATA_VERSION = 8

export interface AppData {
  version: typeof DATA_VERSION
  things: Thing[]
  days: Record<DateKey, DayRecord>
  /**
   * Per thing, the highest unlock tier (in total days) whose stone has been
   * cracked. A tier earned but above this is a stone waiting in the scene.
   * Losing this would only bring stones back, never take a find away.
   */
  cracked: Record<string, number>
  settings: Settings
  /**
   * Things that were deleted. Their days, stars, finds and lanterns stay,
   * so they are kept here for their names, worlds and colours.
   */
  retired?: Thing[]
  /**
   * What the dock sold, each with its price then. Krill earned is never
   * stored (src/store/krill.ts works it out from the days); only this is,
   * so the balance can never disagree with the history.
   */
  bought?: Purchase[]
  /** The one dock item being saved for, shown as a line under the krill. */
  goal?: string
  /** Dock items taken out of the scene from the dock ("hide"). */
  hidden?: string[]
  /** Who wears each worn item: item id to thing id. */
  wears?: Record<string, string>
  /**
   * Where each find and dock item stands: a spot id (src/scene/spots.ts) or
   * "chest". An item without a record is placed by itself, so a person who
   * never arranges still has a whole scene.
   */
  placement?: Record<string, string>
}

export const MAX_THINGS = 5

/** A new lock-in's length: start light. Also what a thing from before lengths gets. */
export const DEFAULT_MINUTES = 15
/** The lengths a lock-in can have; a stored length is kept inside them. */
export const MIN_MINUTES = 5
export const MAX_MINUTES = 600

/**
 * Every length the dial stops at: five-minute steps up to an hour, a
 * quarter of an hour up to three, half an hour up to ten. Short lengths
 * get the room on the ring, where the choice is finest.
 */
export const LENGTH_STOPS: readonly number[] = [
  ...Array.from({ length: 12 }, (_, i) => 5 + i * 5),
  ...Array.from({ length: 8 }, (_, i) => 75 + i * 15),
  ...Array.from({ length: 14 }, (_, i) => 210 + i * 30),
]

/** The stop nearest to a length. */
export function nearestStop(minutes: number): number {
  let best = LENGTH_STOPS[0] ?? MIN_MINUTES
  for (const stop of LENGTH_STOPS)
    if (Math.abs(stop - minutes) < Math.abs(best - minutes)) best = stop
  return best
}

export const WORLD_ORDER: readonly World[] = ['sea', 'sky', 'garden']

/** Every day of the week on: what a new thing, and every thing from before days, gets. */
export const EVERY_DAY: readonly boolean[] = [true, true, true, true, true, true, true]

export function emptyData(): AppData {
  return { version: DATA_VERSION, things: [], days: {}, cracked: {}, settings: { sound: true } }
}
