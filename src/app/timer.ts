/**
 * The running timer, kept in storage so a reload or a trip to another app
 * does not lose it. Time is measured by the clock, not by counting ticks:
 * a phone that sleeps for ten minutes wakes up with the right remainder.
 */
const KEY = 'whaleclub:timer'
const TICK_MS = 1000

export interface RunningTimer {
  thingId: string
  startedAt: number
  minutes: number
}

type TickListener = (remainingMs: number, timer: RunningTimer) => void
type FinishListener = (timer: RunningTimer) => void

export class TimerService {
  private interval = 0
  private tickListeners = new Set<TickListener>()
  private finishListeners = new Set<FinishListener>()

  current(): RunningTimer | null {
    try {
      const text = localStorage.getItem(KEY)
      if (!text) return null
      const raw: unknown = JSON.parse(text)
      if (!isRunningTimer(raw)) return null
      return raw
    } catch {
      return null
    }
  }

  start(thingId: string, minutes: number): RunningTimer {
    const timer: RunningTimer = { thingId, startedAt: Date.now(), minutes }
    this.write(timer)
    this.watch()
    return timer
  }

  cancel(): void {
    this.write(null)
    this.unwatch()
  }

  /** Picks up a timer left running by a previous session, finishing it if its time is up. */
  resume(): RunningTimer | null {
    const timer = this.current()
    if (!timer) return null
    if (remaining(timer) <= 0) {
      this.finish(timer)
      return null
    }
    this.watch()
    return timer
  }

  onTick(listener: TickListener): () => void {
    this.tickListeners.add(listener)
    return () => this.tickListeners.delete(listener)
  }

  onFinish(listener: FinishListener): () => void {
    this.finishListeners.add(listener)
    return () => this.finishListeners.delete(listener)
  }

  private watch(): void {
    this.unwatch()
    this.interval = window.setInterval(() => {
      const timer = this.current()
      if (!timer) {
        this.unwatch()
        return
      }
      const left = remaining(timer)
      if (left <= 0) this.finish(timer)
      else for (const listener of this.tickListeners) listener(left, timer)
    }, TICK_MS)
  }

  private unwatch(): void {
    clearInterval(this.interval)
    this.interval = 0
  }

  private finish(timer: RunningTimer): void {
    this.write(null)
    this.unwatch()
    for (const listener of this.finishListeners) listener(timer)
  }

  private write(timer: RunningTimer | null): void {
    try {
      if (timer) localStorage.setItem(KEY, JSON.stringify(timer))
      else localStorage.removeItem(KEY)
    } catch {
      // Storage refused: the timer still runs for this session.
    }
  }
}

export function remaining(timer: RunningTimer): number {
  return timer.startedAt + timer.minutes * 60_000 - Date.now()
}

export function formatRemaining(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000))
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${String(m)}:${String(s).padStart(2, '0')}`
}

function isRunningTimer(value: unknown): value is RunningTimer {
  if (typeof value !== 'object' || value === null) return false
  const v = value as Record<string, unknown>
  return (
    typeof v.thingId === 'string' &&
    typeof v.startedAt === 'number' &&
    typeof v.minutes === 'number'
  )
}
