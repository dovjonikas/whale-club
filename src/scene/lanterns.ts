import { addDays } from '../store/dates'
import type { DateKey } from '../store/types'
import { hash, seeded } from './random'
import { reducedMotion, ticker, type FrameHandle } from './ticker'

/**
 * The cove's lanterns: one for every lock-in that ran to its end, kept for
 * good, so over the months the shallow water under the shore fills with
 * light. A left session's lantern is there too, dim: honest, not a penalty.
 *
 * Built to hold a year of them (four hundred and more) on a phone: one
 * canvas, every lantern a pre-drawn sprite (per colour, size and dimness)
 * stamped with drawImage, a flicker at FLICKER_FPS on the shared ticker,
 * nothing at all under reduced motion except a redraw when they change.
 * Where each one floats is picked from its date and its place in the day,
 * so it never moves between visits.
 *
 * Less noise over a year: the last thirty days' lanterns float on their
 * own, bright; older ones merge into one soft glow over the cove that
 * grows with how many there are. Every one is still kept, and the log
 * shows each of them.
 */
export interface LanternSpec {
  /** `date:index`, the session's place in the day. */
  key: string
  date: DateKey
  color: string
  /** 0 short, 1 middling, 2 long. */
  size: 0 | 1 | 2
  /**
   * bright: done in one go; soft: done in parts; dim: minutes on a day that
   * never reached the length (and, from before 0.11, a session that was left).
   */
  glow: LanternGlow
}

export type LanternGlow = 'bright' | 'soft' | 'dim'

const FLICKER_FPS = 12
const ARRIVE_FPS = 60
const ARRIVE_MS = 900
/** Core radius in px for each size, on a 390px-wide phone. */
const RADIUS = [1.5, 2.1, 2.8] as const
/** The glow reaches this many core radii out. */
const GLOW = 3
const ALPHA: Record<LanternGlow, number> = { bright: 1, soft: 0.62, dim: 0.3 }
/** Where the cove sits inside the canvas, as fractions of its height (see .lanterns in scene.css). */
const COVE_TOP = 0.73
const COVE_DEPTH = 0.23
/** How many days back a lantern still floats on its own. */
const RECENT_DAYS = 30
/** The merged glow's strength: a faint start, then more with every older lantern, up to a cap. */
const MEMORY_BASE = 0.05
const MEMORY_PER_LANTERN = 0.0009
const MEMORY_MAX = 0.42

interface Placed {
  spec: LanternSpec
  x: number
  y: number
  scale: number
  /** Far ones, near the surface line, are fainter. */
  fade: number
  phase: number
  speed: number
}

export class LanternLayer {
  private readonly ctx: CanvasRenderingContext2D
  private readonly sprites = new Map<string, HTMLCanvasElement>()
  private placed: Placed[] = []
  private readonly held = new Set<string>()
  private arriving: { key: string; from: number } | null = null
  private handle: FrameHandle | null = null
  private width = 0
  private height = 0
  private dpr = 1
  private specs: readonly LanternSpec[] = []
  /** The first day still drawn on its own; "" draws every lantern on its own (the intro's year). */
  private recentFrom: DateKey = ''
  /** Older lanterns, merged into the glow. */
  private memory = 0

  constructor(private readonly canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('canvas 2d unavailable')
    this.ctx = ctx
  }

  resize(width: number, height: number): void {
    this.dpr = Math.min(devicePixelRatio || 1, 2)
    this.width = width
    this.height = height
    this.canvas.width = Math.round(width * this.dpr)
    this.canvas.height = Math.round(height * this.dpr)
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0)
    this.sprites.clear()
    this.place()
  }

  /** Every lantern; with `today`, the older ones merge into the cove's glow. */
  set(specs: readonly LanternSpec[], today?: DateKey): void {
    this.specs = specs
    this.recentFrom = today ? addDays(today, -RECENT_DAYS) : ''
    this.place()
  }

  /** Keeps a lantern out of sight until `arrive`, so the opening can bring it in. */
  hold(key: string): void {
    this.held.add(key)
    this.canvas.dataset.held = String(this.held.size)
    this.draw(performance.now())
  }

  /** The held lantern comes down into its place and lights. */
  arrive(key: string): void {
    if (!this.held.delete(key)) return
    this.canvas.dataset.held = String(this.held.size)
    if (reducedMotion()) {
      this.draw(performance.now())
      return
    }
    this.arriving = { key, from: performance.now() }
    this.handle?.setFps(ARRIVE_FPS)
  }

  /** Lets every held lantern straight in, for a skipped opening. */
  release(): void {
    this.held.clear()
    this.canvas.dataset.held = '0'
    this.arriving = null
    this.handle?.setFps(FLICKER_FPS)
    this.draw(performance.now())
  }

  private place(): void {
    const scale = Math.min(Math.max(this.width / 390, 0.8), 1.6)
    const recent = this.specs.filter((spec) => spec.date >= this.recentFrom)
    this.memory = this.specs.length - recent.length
    this.placed = recent.map((spec) => {
      const random = seeded(hash(`lantern|${spec.key}`))
      // Thicker near the surface line, as lights on water bunch towards the far shore.
      const depth = Math.pow(random(), 1.5)
      return {
        spec,
        x: (0.04 + random() * 0.92) * this.width,
        // The canvas reaches up into the sky so a lantern can come down; the cove is its lowest quarter.
        y: (COVE_TOP + depth * COVE_DEPTH) * this.height,
        scale: scale * (0.78 + depth * 0.44),
        fade: 0.55 + depth * 0.45,
        phase: random() * Math.PI * 2,
        speed: 0.8 + random() * 1.6,
      }
    })
    // Far ones first, so the near ones glow over them.
    this.placed.sort((a, b) => a.y - b.y)
    this.canvas.dataset.count = String(this.specs.length)
    this.canvas.dataset.separate = String(this.placed.length)
    this.canvas.dataset.memory = String(this.memory)
    this.canvas.dataset.dim = String(this.specs.filter((s) => s.glow === 'dim').length)
    this.canvas.dataset.soft = String(this.specs.filter((s) => s.glow === 'soft').length)
    this.canvas.dataset.held = String(this.held.size)
    this.draw(performance.now())
    this.run()
  }

  private run(): void {
    if (reducedMotion() || (this.placed.length === 0 && this.memory === 0)) {
      this.handle?.remove()
      this.handle = null
      return
    }
    this.handle ??= ticker.add((now) => {
      this.draw(now)
    }, FLICKER_FPS)
  }

  private draw(now: number): void {
    const { ctx } = this
    ctx.clearRect(0, 0, this.width, this.height)
    const t = now / 1000
    const still = reducedMotion()
    if (this.memory > 0) this.drawMemory()
    for (const lantern of this.placed) {
      const { spec } = lantern
      if (this.held.has(spec.key)) continue
      let y = lantern.y
      let alpha = still ? 1 : 0.84 + 0.16 * Math.sin(t * lantern.speed + lantern.phase)
      if (this.arriving?.key === spec.key) {
        const p = Math.min(1, (now - this.arriving.from) / ARRIVE_MS)
        const eased = 1 - Math.pow(1 - p, 3)
        y = lantern.y - (1 - eased) * this.height * COVE_TOP
        alpha *= eased
        if (p >= 1) {
          this.arriving = null
          this.handle?.setFps(FLICKER_FPS)
        }
      }
      const sprite = this.sprite(spec)
      const w = sprite.width / this.dpr
      const size = w * lantern.scale
      ctx.globalAlpha = (spec.glow === 'dim' ? ALPHA.dim : alpha * ALPHA[spec.glow]) * lantern.fade
      ctx.drawImage(sprite, lantern.x - size / 2, y - size / 2, size, size)
    }
    ctx.globalAlpha = 1
  }

  /** The older lanterns as one warm glow across the cove, stronger the more there are. */
  private drawMemory(): void {
    const { ctx } = this
    const cx = this.width / 2
    const cy = (COVE_TOP + COVE_DEPTH * 0.45) * this.height
    const rx = this.width * 0.62
    const ry = COVE_DEPTH * this.height * 0.75
    const strength = Math.min(MEMORY_MAX, MEMORY_BASE + this.memory * MEMORY_PER_LANTERN)
    ctx.save()
    ctx.translate(cx, cy)
    ctx.scale(1, ry / rx)
    const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, rx)
    glow.addColorStop(0, `rgba(255, 210, 140, ${strength.toFixed(3)})`)
    glow.addColorStop(0.6, `rgba(255, 170, 120, ${(strength * 0.4).toFixed(3)})`)
    glow.addColorStop(1, 'rgba(255, 170, 120, 0)')
    ctx.globalAlpha = 1
    ctx.fillStyle = glow
    ctx.beginPath()
    ctx.arc(0, 0, rx, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }

  /** A lantern drawn once per colour, size and dimness, at the canvas's own pixel density. */
  private sprite(spec: LanternSpec): HTMLCanvasElement {
    const dim = spec.glow === 'dim'
    const id = `${spec.color}|${String(spec.size)}|${String(dim)}`
    const cached = this.sprites.get(id)
    if (cached) return cached
    const r = RADIUS[spec.size]
    const half = r * GLOW
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = Math.ceil(half * 2 * this.dpr)
    const ctx = canvas.getContext('2d')
    if (!ctx) return canvas
    ctx.scale(this.dpr, this.dpr)
    const c = half
    if (!dim) {
      const glow = ctx.createRadialGradient(c, c, 0, c, c, half)
      glow.addColorStop(0, withAlpha(spec.color, 0.42))
      glow.addColorStop(0.35, withAlpha(spec.color, 0.12))
      glow.addColorStop(1, withAlpha(spec.color, 0))
      ctx.fillStyle = glow
      ctx.fillRect(0, 0, half * 2, half * 2)
    }
    // The paper body: a little taller than wide, lit from inside.
    const body = ctx.createRadialGradient(c - r * 0.25, c - r * 0.35, 0, c, c, r * 1.2)
    body.addColorStop(0, '#fffdf2')
    body.addColorStop(0.45, spec.color)
    body.addColorStop(1, withAlpha(spec.color, 0.7))
    ctx.fillStyle = body
    ctx.beginPath()
    ctx.ellipse(c, c, r, r * 1.2, 0, 0, Math.PI * 2)
    ctx.fill()
    // Its light on the water, a short streak underneath.
    ctx.fillStyle = withAlpha(spec.color, dim ? 0.25 : 0.35)
    ctx.fillRect(c - r * 0.9, c + r * 1.6, r * 1.8, Math.max(0.6, r * 0.28))
    this.sprites.set(id, canvas)
    return canvas
  }
}

function withAlpha(hex: string, alpha: number): string {
  const n = Number.parseInt(hex.slice(1), 16)
  return `rgba(${String((n >> 16) & 255)}, ${String((n >> 8) & 255)}, ${String(n & 255)}, ${String(alpha)})`
}
