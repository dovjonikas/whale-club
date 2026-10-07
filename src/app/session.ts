import { now } from '../store/clock'
import { todayKey } from '../store/dates'
import { labOn, sessionKey } from '../store/lab'
import type { DateKey } from '../store/types'

/**
 * A lock-in session, kept in storage and measured by the clock, never by
 * counting ticks.
 *
 * One rule: only the minutes the timer saw count. While the session's
 * screen is on show they count; when the person leaves the app, the first
 * GRACE_MS still count (a glance at a message is not leaving) and then the
 * count stops, and it goes on when they come back. If the page goes away
 * altogether (a reload, the app closed, a phone that died), the count
 * stops at the last moment the screen was seen: \`seenUntil\`, written
 * every SEEN_EVERY_MS. Nothing seen is ever lost: an interrupted session's
 * minutes are kept for the day, and the next one goes on from them.
 *
 * Two kindnesses on top: the first UNDO_MS after starting can be undone
 * without a trace, and each session has one pause of up to PAUSE_MS for
 * the interruption nobody planned. While paused, being away is what the
 * pause is for; when it runs out, the session goes on by itself.
 */
/** Where v0.1 to v0.4 kept a running timer; picked up once and moved. */
const OLD_KEY = 'whaleclub:timer'
export const GRACE_MS = 15_000
export const PAUSE_MS = 5 * 60_000
export const UNDO_MS = 10_000
const TICK_MS = 1000
const SEEN_EVERY_MS = 5000

export interface Session {
  thingId: string
  /** The length the timer must see today, in minutes. */
  minutes: number
  /** The day the session belongs to; its minutes are kept there. */
  date: DateKey
  /** What the timer had already seen today before this session, in ms. */
  baseMs: number
  /** One more session on a day already done: its minutes are a lantern, not a count. */
  extra?: boolean
  startedAt: number
  /** Time not counted: away past the grace, and paused. */
  pausedMs: number
  /** The last moment the screen was seen, for a page that went away without a word. */
  seenUntil: number
  /** Set while the page is hidden. */
  hiddenAt?: number
  /** Set while the one pause runs. */
  pausedAt?: number
  /** The one pause has been taken. */
  pauseUsed?: boolean
  /** Times the person left for longer than the grace and came back. */
  away?: number
}

export interface Listeners {
  tick: (session: Session, seenMs: number) => void
  /** Back after longer than the grace: the count stopped meanwhile and goes on now. */
  back: (session: Session) => void
  /** The pause ran out and the session went on by itself. */
  pauseOver: (session: Session) => void
  finish: (session: Session) => void
}

export function totalMs(session: Session): number {
  return session.minutes * 60_000
}

/** Everything the timer has seen today for this thing, this session included. */
export function seenMs(session: Session, at: number = now()): number {
  const until = Math.min(
    at,
    session.hiddenAt === undefined ? Infinity : session.hiddenAt + GRACE_MS,
    session.pausedAt ?? Infinity,
  )
  return session.baseMs + Math.max(0, until - session.startedAt - session.pausedMs)
}

/** How many sittings this session's count took: a softer lantern when more than one. */
export function partsOf(session: Session): number {
  return 1 + (session.baseMs > 0 ? 1 : 0) + (session.away ?? 0)
}

export function canUndo(session: Session, at: number = now()): boolean {
  return at - session.startedAt < UNDO_MS
}

export class SessionService {
  private interval = 0
  private lastSeenWrite = 0

  constructor(private readonly on: Listeners) {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) this.hide()
      else this.show()
    })
    addEventListener('pagehide', () => {
      this.hide()
    })
  }

  current(): Session | null {
    const session = read(sessionKey())
    if (session) return session
    if (labOn()) return null
    const old = read(OLD_KEY)
    if (!old) return null
    write(OLD_KEY, null)
    write(sessionKey(), old)
    return old
  }

  start(input: { thingId: string; minutes: number; baseMs: number; extra?: boolean }): Session {
    const at = now()
    const session: Session = {
      thingId: input.thingId,
      minutes: input.minutes,
      date: todayKey(),
      baseMs: input.baseMs,
      startedAt: at,
      pausedMs: 0,
      seenUntil: at,
    }
    if (input.extra) session.extra = true
    write(sessionKey(), session)
    this.watch()
    return session
  }

  /** Stops early; returns the session so what it saw can be kept. */
  stop(): Session | null {
    const session = this.current()
    write(sessionKey(), null)
    this.unwatch()
    return session
  }

  /** In the first seconds only: the session is gone, as if it never started. */
  undo(): boolean {
    const session = this.current()
    if (!session || !canUndo(session)) return false
    write(sessionKey(), null)
    this.unwatch()
    return true
  }

  /** The one pause. Returns the paused session, or null if there is none to take. */
  pause(): Session | null {
    const session = this.current()
    if (!session || session.pauseUsed || session.pausedAt !== undefined) return null
    const paused: Session = { ...session, pausedAt: now(), pauseUsed: true }
    write(sessionKey(), paused)
    return paused
  }

  /** Ends the pause early, by the person's own tap. */
  goOn(): Session | null {
    const session = this.current()
    if (session?.pausedAt === undefined) return session
    const going = endPause(session, now())
    write(sessionKey(), going)
    return going
  }

  /**
   * A session found on opening the app, from a page that went away: it is
   * settled, never carried on. Returns it with everything the timer saw up
   * to the last moment the screen was seen (or the grace after the page
   * hid); the caller finishes it if that reached the length, or keeps the
   * minutes so the card can go on from them.
   */
  settle(): Session | null {
    const stored = this.current()
    if (!stored) return null
    write(sessionKey(), null)
    const session = stored
    // A page that died without a word hid, as far as anyone can tell, when it was last seen.
    const hiddenAt = session.hiddenAt ?? session.seenUntil
    // A paused session saw nothing after its pause began; seenMs stops there by itself.
    return { ...session, hiddenAt }
  }

  private hide(): void {
    const session = this.current()
    if (!session || session.hiddenAt !== undefined) return
    write(sessionKey(), { ...session, hiddenAt: now() })
  }

  private show(): void {
    const stored = this.current()
    if (stored?.hiddenAt === undefined) return
    const at = now()
    let session: Session = stored
    let pauseRanOut = false
    let hiddenAt = stored.hiddenAt
    if (session.pausedAt !== undefined) {
      const pauseEnd = session.pausedAt + PAUSE_MS
      if (at < pauseEnd) {
        // Away within the pause: that is what the pause is for.
        const back: Session = { ...session, seenUntil: at }
        delete back.hiddenAt
        write(sessionKey(), back)
        return
      }
      // The pause ran out while away: it ends at its limit, and only what came after is away.
      session = endPause(session, pauseEnd)
      hiddenAt = Math.max(hiddenAt, pauseEnd)
      pauseRanOut = true
    }
    // The grace still counted; the rest of the time away did not.
    const lost = Math.max(0, at - hiddenAt - GRACE_MS)
    const back: Session = { ...session, pausedMs: session.pausedMs + lost, seenUntil: at }
    delete back.hiddenAt
    if (lost > 0) back.away = (back.away ?? 0) + 1
    write(sessionKey(), back)
    if (pauseRanOut) this.on.pauseOver(back)
    if (seenMs(back, at) >= totalMs(back)) {
      this.finish(back)
      return
    }
    if (lost > 0) this.on.back(back)
  }

  private watch(): void {
    this.unwatch()
    this.interval = window.setInterval(() => {
      if (document.hidden) return
      let session = this.current()
      if (!session) {
        this.unwatch()
        return
      }
      const at = now()
      if (session.pausedAt !== undefined && at - session.pausedAt >= PAUSE_MS) {
        session = endPause(session, session.pausedAt + PAUSE_MS)
        write(sessionKey(), session)
        this.on.pauseOver(session)
      }
      if (at - this.lastSeenWrite >= SEEN_EVERY_MS) {
        this.lastSeenWrite = at
        session = { ...session, seenUntil: at }
        write(sessionKey(), session)
      }
      const seen = seenMs(session, at)
      if (seen >= totalMs(session)) this.finish(session)
      else this.on.tick(session, seen)
    }, TICK_MS)
  }

  private unwatch(): void {
    clearInterval(this.interval)
    this.interval = 0
  }

  private finish(session: Session): void {
    write(sessionKey(), null)
    this.unwatch()
    this.on.finish(session)
  }
}

/** The pause ends at `at`: its length joins the time not counted. */
function endPause(session: Session, at: number): Session {
  const going: Session = {
    ...session,
    pausedMs: session.pausedMs + (at - (session.pausedAt ?? at)),
  }
  delete going.pausedAt
  return going
}

function read(key: string): Session | null {
  try {
    const text = localStorage.getItem(key)
    if (!text) return null
    const raw: unknown = JSON.parse(text)
    if (typeof raw !== 'object' || raw === null) return null
    const r = raw as Record<string, unknown>
    if (
      typeof r.thingId !== 'string' ||
      typeof r.startedAt !== 'number' ||
      typeof r.minutes !== 'number'
    )
      return null
    const session: Session = {
      thingId: r.thingId,
      minutes: r.minutes,
      // Sessions from before 0.11 had no day or base: they belong to the day they started.
      date: typeof r.date === 'string' ? r.date : todayKey(new Date(r.startedAt)),
      baseMs: typeof r.baseMs === 'number' ? r.baseMs : 0,
      startedAt: r.startedAt,
      pausedMs: typeof r.pausedMs === 'number' ? r.pausedMs : 0,
      seenUntil: typeof r.seenUntil === 'number' ? r.seenUntil : r.startedAt,
    }
    if (r.extra === true) session.extra = true
    if (typeof r.hiddenAt === 'number') session.hiddenAt = r.hiddenAt
    if (typeof r.pausedAt === 'number') session.pausedAt = r.pausedAt
    if (r.pauseUsed === true) session.pauseUsed = true
    if (typeof r.away === 'number') session.away = r.away
    return session
  } catch {
    return null
  }
}

function write(key: string, session: Session | null): void {
  try {
    if (session) localStorage.setItem(key, JSON.stringify(session))
    else localStorage.removeItem(key)
  } catch {
    // Storage refused: the session still runs for this page.
  }
}
