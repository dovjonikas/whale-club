import type { DateKey } from '../store/types'
import { layoutSky, type DayStar, type Ghost, type Link } from './constellations'
import { seeded } from './random'
import { reducedMotion, ticker, type FrameHandle } from './ticker'

/**
 * The sky's canvas: a deep field of background stars, and over it one
 * warm star for every day the person showed up, lit along the current
 * constellation. The day-stars are data; the field around them is
 * atmosphere.
 *
 * The field is seeded, so the sky is the same on every open: small stars
 * in a few cool and warm tints, biased towards the zenith, and a handful
 * of bright ones drawn as four-point sparkles with a soft halo. Each star
 * twinkles on its own slow sine. Now and then a shooting star crosses the
 * upper sky. Under reduced motion the field is drawn once and holds still.
 *
 * Day-stars are a path, not a calendar (the log is the calendar): each
 * day something was done lights the next star of the current
 * constellation, drawn in the outline of the legendary at its end, the way
 * ahead faint and dotted (src/store/paths.ts, src/scene/constellations.ts).
 * Finished constellations stay in the sky for good, smaller, around it.
 */
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
const TINTS = ['#fff4d6', '#e8f0f5', '#cfe2ff', '#bff7ee', '#ffe2c4'] as const
/** The first shooting star comes 6 to 12 s after the sky opens, then one every 9 to 16 s. */
const SHOOT_FIRST_MS = 6000
const SHOOT_EVERY_MS = 9000
const SHOOT_EVERY_SPREAD_MS = 7000
/** How far a shooting star's head travels, in canvas px, over SHOOT_MS. */
const SHOOT_TRAVEL_PX = 240
const TWINKLE_FPS = 12
const SHOOT_FPS = 40
const SHOOT_MS = 900
const TAU = Math.PI * 2

export class StarField {
  private readonly ctx: CanvasRenderingContext2D
  private field: FieldStar[] = []
  private dayStars: DayStar[] = []
  private ghosts: Ghost[] = []
  private links: Link[] = []
  private dates: readonly DateKey[] = []
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

  /** Replaces the day-stars: every star day, oldest first. */
  setDays(dates: readonly DateKey[]): void {
    this.dates = dates
    this.layout()
    this.draw(performance.now())
  }

  /** Where every day-star is, in canvas pixels. */
  positions(): readonly DayStar[] {
    return this.dayStars
  }

  start(): void {
    if (this.handle || reducedMotion()) return
    this.nextShoot = performance.now() + SHOOT_FIRST_MS * (1 + this.random())
    this.handle = ticker.add((now) => {
      this.draw(now)
    }, TWINKLE_FPS)
  }

  stop(): void {
    this.handle?.remove()
    this.handle = null
  }

  private layout(): void {
    const sky = layoutSky(this.dates, this.width, this.height)
    this.dayStars = sky.stars
    this.ghosts = sky.ghosts
    this.links = sky.links
  }

  /** Where `date`'s star would be if the sky held `dates`, in canvas pixels. */
  where(dates: readonly DateKey[], date: DateKey): { x: number; y: number } | undefined {
    return layoutSky(dates, this.width, this.height).stars.find((s) => s.date === date)
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

    // The constellations' lines: solid between lit stars, the way ahead dotted and faint.
    ctx.strokeStyle = '#ffd98a'
    ctx.lineWidth = 0.8
    for (const lit of [false, true]) {
      ctx.globalAlpha = lit ? 0.5 : 0.16
      ctx.setLineDash(lit ? [] : [2, 4])
      ctx.beginPath()
      for (const link of this.links) {
        if (link.lit !== lit) continue
        ctx.moveTo(link.x1, link.y1)
        ctx.lineTo(link.x2, link.y2)
      }
      ctx.stroke()
    }
    ctx.setLineDash([])

    // The way ahead: faint stars, the halfway one a little larger.
    ctx.fillStyle = '#e8f0f5'
    for (const g of this.ghosts) {
      ctx.globalAlpha = g.half ? 0.5 : 0.26
      ctx.beginPath()
      ctx.arc(g.x, g.y, g.half ? 2.2 : 1.2, 0, TAU)
      ctx.fill()
    }

    for (const s of this.dayStars) {
      const pulse = still ? 0.9 : 0.8 + 0.2 * Math.sin(t * 1.3 + s.x)
      ctx.globalAlpha = s.finished ? pulse * 0.85 : pulse
      ctx.fillStyle = '#ffd98a'
      ctx.shadowColor = '#ffd98a'
      ctx.shadowBlur = s.half ? 14 : s.finished ? 6 : 9
      ctx.beginPath()
      ctx.arc(s.x, s.y, s.half ? s.r * 1.6 : s.r, 0, TAU)
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
      this.nextShoot = now + SHOOT_EVERY_MS + this.random() * SHOOT_EVERY_SPREAD_MS
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
    const travelled = k * SHOOT_TRAVEL_PX
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
