import { now } from '../store/clock'
import { labOn, sessionKey } from '../store/lab'

/**
 * A lock-in session, kept in storage and measured by the clock, never by
 * counting ticks: a reload, a locked phone or an app closed for an hour
 * comes back to the right number.
 *
 * Nothing dies. If the app is hidden for more than GRACE_MS, the session
 * does not fail. The creature stops and waits; the time away is not
 * counted; the session goes on from where it was when the person comes
 * back. It is only marked as one that was left, which changes what its end
 * gives (see Store.finishSession).
 *
 * Time away is measured from timestamps written when the page hides
 * (visibilitychange and pagehide), so it works the same whether the phone
 * was locked, the app switched, or the page reloaded. A session that ran
 * out while away for less than the grace finishes clean, at the moment it
 * ran out.
 *
 * Two kindnesses on top: the first UNDO_MS after starting can be undone
 * without a trace (a wrong thing, a wrong length), and each session has
 * one pause of up to PAUSE_MS for the interruption nobody planned. While
 * paused, being away is what the pause is for; when it runs out, the
 * session goes on by itself.
 */
/** Where v0.1 to v0.4 kept a running timer; picked up once and moved. */
const OLD_KEY = 'whaleclub:timer'
export const GRACE_MS = 15_000
export const PAUSE_MS = 5 * 60_000
export const UNDO_MS = 10_000
const TICK_MS = 1000

export interface Session {
  thingId: string
  minutes: number
  startedAt: number
  /** Time away, and time paused, that is not counted. */
  pausedMs: number
  /** Set while the page is hidden. */
  hiddenAt?: number
  /** Set while the one pause runs. */
  pausedAt?: number
  /** The one pause has been taken. */
  pauseUsed?: boolean
  broken: boolean
  /** How far the session had come when it was first left; the creature stays that size. */
  brokenAtMs?: number
}

export interface Listeners {
  tick: (session: Session, elapsedMs: number) => void
  left: (session: Session) => void
  /** The pause ran out and the session went on by itself. */
  pauseOver: (session: Session) => void
  finish: (session: Session, clean: boolean) => void
}

export function totalMs(session: Session): number {
  return session.minutes * 60_000
}

/** Time counted so far: it stands still while the page is hidden or the session is paused. */
export function elapsedMs(session: Session, at: number = now()): number {
  const until = Math.min(at, session.hiddenAt ?? Infinity, session.pausedAt ?? Infinity)
  return Math.max(0, until - session.startedAt - session.pausedMs)
}

export function canUndo(session: Session, at: number = now()): boolean {
  return at - session.startedAt < UNDO_MS
}

export class SessionService {
  private interval = 0

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

  start(thingId: string, minutes: number): Session {
    const session: Session = { thingId, minutes, startedAt: now(), pausedMs: 0, broken: false }
    write(sessionKey(), session)
    this.watch()
    return session
  }

  /** Stops early; returns the session so its minutes can be written down. */
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

  /** Picks up a session left running by an earlier page: after a reload, or the next morning. */
  resume(): Session | null {
    if (!this.current()) return null
    this.show()
    const session = this.current()
    if (session) this.watch()
    return session
  }

  private hide(): void {
    const session = this.current()
    if (!session || session.hiddenAt) return
    write(sessionKey(), { ...session, hiddenAt: now() })
  }

  private show(): void {
    const stored = this.current()
    if (stored?.hiddenAt === undefined) return
    const at = now()
    let session: Session = stored
    let pauseRanOut = false
    if (session.pausedAt !== undefined) {
      const pauseEnd = session.pausedAt + PAUSE_MS
      if (at < pauseEnd) {
        // Away within the pause: that is what the pause is for.
        const back: Session = { ...session }
        delete back.hiddenAt
        write(sessionKey(), back)
        return
      }
      // The pause ran out while away: it ends at its limit, and only what came after is away.
      session = { ...endPause(session, pauseEnd), hiddenAt: Math.max(stored.hiddenAt, pauseEnd) }
      pauseRanOut = true
    }
    const hiddenAt = session.hiddenAt ?? at
    const away = at - hiddenAt
    const doneAtHide = elapsedMs(session)
    const leftAtHide = totalMs(session) - doneAtHide
    const back: Session = { ...session }
    delete back.hiddenAt
    if (leftAtHide <= Math.min(away, GRACE_MS)) {
      // It ran out while the person was only briefly away: a clean end, at the moment it ran out.
      write(sessionKey(), back)
      this.finish(back)
      return
    }
    if (away > GRACE_MS) {
      const left: Session = {
        ...back,
        pausedMs: back.pausedMs + away,
        broken: true,
        brokenAtMs: back.brokenAtMs ?? doneAtHide,
      }
      write(sessionKey(), left)
      if (pauseRanOut) this.on.pauseOver(left)
      this.on.left(left)
      return
    }
    write(sessionKey(), back)
    if (pauseRanOut) this.on.pauseOver(back)
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
      if (session.pausedAt !== undefined) {
        if (now() - session.pausedAt < PAUSE_MS) {
          this.on.tick(session, elapsedMs(session))
          return
        }
        session = endPause(session, session.pausedAt + PAUSE_MS)
        write(sessionKey(), session)
        this.on.pauseOver(session)
      }
      const done = elapsedMs(session)
      if (done >= totalMs(session)) this.finish(session)
      else this.on.tick(session, done)
    }, TICK_MS)
  }

  private unwatch(): void {
    clearInterval(this.interval)
    this.interval = 0
  }

  private finish(session: Session): void {
    write(sessionKey(), null)
    this.unwatch()
    this.on.finish(session, !session.broken)
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
      startedAt: r.startedAt,
      pausedMs: typeof r.pausedMs === 'number' ? r.pausedMs : 0,
      broken: r.broken === true,
    }
    if (typeof r.hiddenAt === 'number') session.hiddenAt = r.hiddenAt
    if (typeof r.pausedAt === 'number') session.pausedAt = r.pausedAt
    if (r.pauseUsed === true) session.pauseUsed = true
    if (typeof r.brokenAtMs === 'number') session.brokenAtMs = r.brokenAtMs
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
