/**
 * A lock-in session, kept in storage and measured by the clock, never by
 * counting ticks: a reload, a locked phone or an app closed for an hour
 * comes back to the right number.
 *
 * Whale Club's twist on Forest: nothing dies. If the app is hidden for
 * more than GRACE_MS, the session does not fail. The creature stops and
 * waits; the time away is not counted; the session goes on from where it
 * was when the person comes back. It is only marked as one that was left,
 * which changes what its end gives (see Store.finishSession).
 *
 * Time away is measured from timestamps written when the page hides
 * (visibilitychange and pagehide), so it works the same whether the phone
 * was locked, the app switched, or the page reloaded. A session that ran
 * out while away for less than the grace finishes clean, at the moment it
 * ran out.
 */
const KEY = 'whaleclub:session'
/** Where v0.1 to v0.4 kept a running timer; picked up once and moved. */
const OLD_KEY = 'whaleclub:timer'
export const GRACE_MS = 15_000
const TICK_MS = 1000

export interface Session {
  thingId: string
  minutes: number
  startedAt: number
  /** Time away that is not counted. */
  pausedMs: number
  /** Set while the page is hidden. */
  hiddenAt?: number
  broken: boolean
  /** How far the session had come when it was first left; the creature stays that size. */
  brokenAtMs?: number
}

export interface Listeners {
  tick: (session: Session, elapsedMs: number) => void
  left: (session: Session) => void
  finish: (session: Session, clean: boolean) => void
}

export function totalMs(session: Session): number {
  return session.minutes * 60_000
}

export function elapsedMs(session: Session, now: number = Date.now()): number {
  const until = session.hiddenAt ?? now
  return Math.max(0, until - session.startedAt - session.pausedMs)
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
    const session = read(KEY)
    if (session) return session
    const old = read(OLD_KEY)
    if (!old) return null
    write(OLD_KEY, null)
    write(KEY, old)
    return old
  }

  start(thingId: string, minutes: number): Session {
    const session: Session = { thingId, minutes, startedAt: Date.now(), pausedMs: 0, broken: false }
    write(KEY, session)
    this.watch()
    return session
  }

  /** Stops early; returns the session so its minutes can be written down. */
  stop(): Session | null {
    const session = this.current()
    write(KEY, null)
    this.unwatch()
    return session
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
    write(KEY, { ...session, hiddenAt: Date.now() })
  }

  private show(): void {
    const session = this.current()
    if (!session?.hiddenAt) return
    const now = Date.now()
    const away = now - session.hiddenAt
    const doneAtHide = elapsedMs(session)
    const leftAtHide = totalMs(session) - doneAtHide
    const back: Session = { ...session }
    delete back.hiddenAt
    if (leftAtHide <= Math.min(away, GRACE_MS)) {
      // It ran out while the person was only briefly away: a clean end, at the moment it ran out.
      write(KEY, back)
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
      write(KEY, left)
      this.on.left(left)
      return
    }
    write(KEY, back)
  }

  private watch(): void {
    this.unwatch()
    this.interval = window.setInterval(() => {
      if (document.hidden) return
      const session = this.current()
      if (!session) {
        this.unwatch()
        return
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
    write(KEY, null)
    this.unwatch()
    this.on.finish(session, !session.broken)
  }
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
