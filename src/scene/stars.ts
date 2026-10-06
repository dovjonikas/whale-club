import { addDays, fromKey, weekStart } from '../store/dates'
import type { DateKey } from '../store/types'

/**
 * The sky: a fixed field of faint background stars, and over it one warm
 * star for every day the person showed up. The day-stars are the calendar.
 *
 * Background stars come from a seeded generator so the sky is the same on
 * every open. Day-stars are the calendar laid out as a sky: a week is a
 * row, a weekday a column, the first week at the zenith and this week just
 * above the horizon, with a little jitter hashed from the date so it reads
 * as stars rather than as a grid. The more weeks there are, the closer the
 * rows, so a year of showing up becomes a dense band of light. A streak
 * inside one week is joined into a constellation.
 */

export interface DayStar {
  date: DateKey
  x: number
  y: number
  r: number
  /** Part of a streak: drawn brighter and joined to its neighbours. */
  linked: boolean
}

interface BackgroundStar {
  x: number
  y: number
  r: number
  phase: number
}

const BACKGROUND_COUNT = 140
const MIN_ROWS = 6
const TWINKLE_INTERVAL = 1000 / 8

export class StarField {
  private readonly ctx: CanvasRenderingContext2D
  private background: BackgroundStar[] = []
  private dayStars: DayStar[] = []
  private dates: readonly DateKey[] = []
  private linked: ReadonlySet<DateKey> = new Set()
  private today: DateKey = ''
  private width = 0
  private height = 0
  private raf = 0
  private last = 0
  private running = false
  private readonly reduced: boolean

  constructor(private readonly canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('canvas 2d unavailable')
    this.ctx = ctx
    this.reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
  }

  resize(width: number, height: number): void {
    const dpr = Math.min(devicePixelRatio || 1, 2)
    this.width = width
    this.height = height
    this.canvas.width = Math.round(width * dpr)
    this.canvas.height = Math.round(height * dpr)
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    this.background = []
    const random = seeded(7)
    for (let i = 0; i < BACKGROUND_COUNT; i++) {
      this.background.push({
        x: random() * width,
        y: random() * height * 0.92,
        r: 0.4 + random() * 1.1,
        phase: random() * Math.PI * 2,
      })
    }
    this.layout()
    this.draw(performance.now() / 1000)
  }

  /** Replaces the day-stars. `streakDates` are the ones joined into constellations. */
  setDays(dates: readonly DateKey[], streakDates: ReadonlySet<DateKey>, today: DateKey): void {
    this.dates = dates
    this.linked = streakDates
    this.today = today
    this.layout()
    this.draw(performance.now() / 1000)
  }

  /** Where a date's star is, for a tap on the sky. */
  starAt(x: number, y: number): DayStar | undefined {
    let best: DayStar | undefined
    let bestDistance = 22
    for (const star of this.dayStars) {
      const d = Math.hypot(star.x - x, star.y - y)
      if (d < bestDistance) {
        best = star
        bestDistance = d
      }
    }
    return best
  }

  start(): void {
    if (this.running || this.reduced) return
    this.running = true
    this.raf = requestAnimationFrame(this.frame)
  }

  stop(): void {
    this.running = false
    cancelAnimationFrame(this.raf)
  }

  private layout(): void {
    const first = this.dates[0]
    if (first === undefined || !this.today) {
      this.dayStars = []
      return
    }
    const firstWeek = weekStart(first)
    const weeks = Math.max(MIN_ROWS, weekIndex(firstWeek, this.today) + 1)
    const left = 0.08 * this.width
    const right = 0.92 * this.width
    const top = 0.1 * this.height
    const bottom = 0.86 * this.height
    const cellW = (right - left) / 7
    const cellH = (bottom - top) / weeks
    this.dayStars = this.dates.map((date) => {
      const random = seeded(hash(date))
      const column = (fromKey(date).getDay() + 6) % 7
      const row = weekIndex(firstWeek, date)
      return {
        date,
        x: left + (column + 0.5 + (random() - 0.5) * 0.7) * cellW,
        y: top + (row + 0.5 + (random() - 0.5) * 0.7) * cellH,
        r: 1.6 + random() * 1.2,
        linked: this.linked.has(date),
      }
    })
  }

  private readonly frame = (now: number): void => {
    if (!this.running) return
    if (now - this.last >= TWINKLE_INTERVAL) {
      this.last = now
      this.draw(now / 1000)
    }
    this.raf = requestAnimationFrame(this.frame)
  }

  private draw(t: number): void {
    const { ctx } = this
    ctx.clearRect(0, 0, this.width, this.height)
    for (const s of this.background) {
      ctx.globalAlpha = 0.35 + 0.3 * Math.sin(t * 0.8 + s.phase)
      ctx.fillStyle = '#fff4d6'
      ctx.beginPath()
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
      ctx.fill()
    }
    // Constellation lines: consecutive streak days, joined within a week.
    ctx.globalAlpha = 0.4
    ctx.strokeStyle = '#ffd98a'
    ctx.lineWidth = 0.8
    ctx.beginPath()
    let previous: DayStar | undefined
    for (const s of this.dayStars) {
      const joins =
        s.linked &&
        previous?.linked === true &&
        addDays(previous.date, 1) === s.date &&
        weekStart(previous.date) === weekStart(s.date)
      if (joins) ctx.lineTo(s.x, s.y)
      else ctx.moveTo(s.x, s.y)
      previous = s
    }
    ctx.stroke()
    for (const s of this.dayStars) {
      const pulse = 0.8 + 0.2 * Math.sin(t * 1.3 + s.x)
      ctx.globalAlpha = s.linked ? pulse : pulse * 0.75
      ctx.fillStyle = '#ffd98a'
      ctx.shadowColor = '#ffd98a'
      ctx.shadowBlur = s.linked ? 10 : 5
      ctx.beginPath()
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
      ctx.fill()
      ctx.shadowBlur = 0
    }
    ctx.globalAlpha = 1
  }
}

/** A tiny deterministic generator (mulberry32): same seed, same sky. */
function seeded(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function hash(text: string): number {
  let h = 2166136261
  for (const char of text) h = Math.imul(h ^ char.charCodeAt(0), 16777619)
  return h >>> 0
}

/** How many weeks after the week starting `firstWeek` the date falls. */
function weekIndex(firstWeek: DateKey, date: DateKey): number {
  const ms = fromKey(weekStart(date)).getTime() - fromKey(firstWeek).getTime()
  return Math.round(ms / (7 * 86_400_000))
}
