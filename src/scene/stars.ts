import { addDays, fromKey, weekStart } from '../store/dates'
import type { DateKey } from '../store/types'
import { hash, seeded } from './random'
import { reducedMotion, ticker, type FrameHandle } from './ticker'

/**
 * The sky's canvas: a deep field of background stars, and over it one
 * warm star for every day the person showed up. The day-stars are the
 * calendar and are data; the field around them is atmosphere.
 *
 * The field is seeded, so the sky is the same on every open: small stars
 * in a few cool and warm tints, biased towards the zenith, and a handful
 * of bright ones drawn as four-point sparkles with a soft halo. Each star
 * twinkles on its own slow sine. Now and then a shooting star crosses the
 * upper sky. Under reduced motion the field is drawn once and holds still.
 *
 * Day-stars are the calendar laid out as a sky: a week is a row, a
 * weekday a column, the first week near the zenith and this week just
 * above the horizon, with a little jitter hashed from the date so it reads
 * as stars rather than as a grid. A streak inside one week is joined into
 * a constellation.
 */
export interface DayStar {
  date: DateKey
  x: number
  y: number
  r: number
  /** Part of a streak: drawn brighter and joined to its neighbours. */
  linked: boolean
}

interface FieldStar {
  x: number
  y: number
  r: number
  alpha: number
  speed: number
  phase: number
  tint: string
  bright: boolean
}

interface Shooting {
  start: number
  x: number
  y: number
  dx: number
  dy: number
  length: number
}

const FIELD_COUNT = 170
const BRIGHT_COUNT = 9
const MIN_ROWS = 6
const TINTS = ['#fff4d6', '#e8f0f5', '#cfe2ff', '#bff7ee', '#ffe2c4'] as const
const TWINKLE_FPS = 12
const SHOOT_FPS = 40
const SHOOT_MS = 900
const TAU = Math.PI * 2

export class StarField {
  private readonly ctx: CanvasRenderingContext2D
  private field: FieldStar[] = []
  private dayStars: DayStar[] = []
  private dates: readonly DateKey[] = []
  private linked: ReadonlySet<DateKey> = new Set()
  private today: DateKey = ''
  private width = 0
  private height = 0
  private handle: FrameHandle | null = null
  private shooting: Shooting | null = null
  private nextShoot = 0
  private readonly random = seeded(11)

  constructor(private readonly canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('canvas 2d unavailable')
    this.ctx = ctx
  }

  /** `dpr` is fixed by the postcard, which draws at its own pixel size. */
  resize(width: number, height: number, dpr = Math.min(devicePixelRatio || 1, 2)): void {
    this.width = width
    this.height = height
    this.canvas.width = Math.round(width * dpr)
    this.canvas.height = Math.round(height * dpr)
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    const random = seeded(7)
    this.field = Array.from({ length: FIELD_COUNT }, (_, i) => {
      const bright = i < BRIGHT_COUNT
      return {
        x: random() * width,
        // Thicker near the zenith, thinner towards the horizon, as a real sky looks.
        y: Math.pow(random(), 1.35) * height * 0.92,
        r: bright ? 2.4 + random() * 1.8 : 0.35 + random() * 1.05,
        alpha: bright ? 0.75 + random() * 0.25 : 0.25 + random() * 0.55,
        speed: 0.4 + random() * 1.3,
        phase: random() * TAU,
        tint: TINTS[i % TINTS.length] ?? '#fff4d6',
        bright,
      }
    })
    this.layout()
    this.draw(performance.now())
  }

  /** Replaces the day-stars. `streakDates` are the ones joined into constellations. */
  setDays(dates: readonly DateKey[], streakDates: ReadonlySet<DateKey>, today: DateKey): void {
    this.dates = dates
    this.linked = streakDates
    this.today = today
    this.layout()
    this.draw(performance.now())
  }

  /** Where every day-star is, in canvas pixels. */
  positions(): readonly DayStar[] {
    return this.dayStars
  }

  start(): void {
    if (this.handle || reducedMotion()) return
    this.nextShoot = performance.now() + 6000 + this.random() * 6000
    this.handle = ticker.add((now) => {
      this.draw(now)
    }, TWINKLE_FPS)
  }

  stop(): void {
    this.handle?.remove()
    this.handle = null
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
    // The first row sits under the title and the krill under it (and its goal line), so a
    // star is never under the chip a finger reaches for.
    const top = 0.24 * this.height
    const bottom = 0.88 * this.height
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

  private draw(now: number): void {
    const { ctx } = this
    const t = now / 1000
    const still = reducedMotion()
    ctx.clearRect(0, 0, this.width, this.height)

    for (const s of this.field) {
      const twinkle = still ? 0.85 : 0.55 + 0.45 * Math.sin(t * s.speed + s.phase)
      ctx.fillStyle = s.tint
      ctx.globalAlpha = s.alpha * twinkle
      if (s.bright) {
        sparkle(ctx, s.x, s.y, s.r * (0.75 + 0.25 * twinkle))
        ctx.globalAlpha = s.alpha * twinkle * 0.22
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r * 1.6, 0, TAU)
        ctx.fill()
      } else {
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r, 0, TAU)
        ctx.fill()
      }
    }
    if (!still) this.drawShooting(now)

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
      const pulse = still ? 0.9 : 0.8 + 0.2 * Math.sin(t * 1.3 + s.x)
      ctx.globalAlpha = s.linked ? pulse : pulse * 0.75
      ctx.fillStyle = '#ffd98a'
      ctx.shadowColor = '#ffd98a'
      ctx.shadowBlur = s.linked ? 10 : 5
      ctx.beginPath()
      ctx.arc(s.x, s.y, s.r, 0, TAU)
      ctx.fill()
      ctx.shadowBlur = 0
    }
    ctx.globalAlpha = 1
  }

  /** A shooting star every 9 to 16 seconds, across the upper sky. */
  private drawShooting(now: number): void {
    if (!this.shooting && this.nextShoot && now > this.nextShoot) {
      this.shooting = {
        start: now,
        x: (0.35 + this.random() * 0.6) * this.width,
        y: (0.04 + this.random() * 0.28) * this.height,
        dx: -(0.8 + this.random() * 0.2),
        dy: 0.45 + this.random() * 0.15,
        length: 50 + this.random() * 40,
      }
      this.nextShoot = now + 9000 + this.random() * 7000
      this.handle?.setFps(SHOOT_FPS)
    }
    const s = this.shooting
    if (!s) return
    const k = (now - s.start) / SHOOT_MS
    if (k >= 1) {
      this.shooting = null
      this.handle?.setFps(TWINKLE_FPS)
      return
    }
    const travelled = k * 240
    const hx = s.x + s.dx * travelled
    const hy = s.y + s.dy * travelled
    const tx = hx - s.dx * s.length
    const ty = hy - s.dy * s.length
    const tail = this.ctx.createLinearGradient(hx, hy, tx, ty)
    tail.addColorStop(0, 'rgba(255, 244, 214, 0.95)')
    tail.addColorStop(1, 'rgba(255, 244, 214, 0)')
    this.ctx.globalAlpha = Math.sin(k * Math.PI)
    this.ctx.strokeStyle = tail
    this.ctx.lineWidth = 1.5
    this.ctx.lineCap = 'round'
    this.ctx.beginPath()
    this.ctx.moveTo(hx, hy)
    this.ctx.lineTo(tx, ty)
    this.ctx.stroke()
  }
}

/** A four-point sparkle centred on (x, y), arms of length r, curved in towards the middle. */
function sparkle(ctx: CanvasRenderingContext2D, x: number, y: number, r: number): void {
  const k = r * 0.22
  ctx.beginPath()
  ctx.moveTo(x, y - r)
  ctx.quadraticCurveTo(x + k, y - k, x + r, y)
  ctx.quadraticCurveTo(x + k, y + k, x, y + r)
  ctx.quadraticCurveTo(x - k, y + k, x - r, y)
  ctx.quadraticCurveTo(x - k, y - k, x, y - r)
  ctx.fill()
}

/** How many weeks after the week starting `firstWeek` the date falls. */
function weekIndex(firstWeek: DateKey, date: DateKey): number {
  const ms = fromKey(weekStart(date)).getTime() - fromKey(firstWeek).getTime()
  return Math.round(ms / (7 * 86_400_000))
}
