import type { World } from '../store/types'
import { reducedMotion, ticker, type FrameHandle } from './ticker'

/**
 * One canvas for everything that moves on its own: the bioluminescent drift
 * in the sea and the bursts a tap makes (bubbles, star dust, petals).
 *
 * Budget: at most LIVE_MAX particles, 30 frames a second while only the
 * ambient drift is on, 60 during a burst, nothing at all while the page is
 * hidden (the ticker stops) or motion is reduced (nothing subscribes).
 */
const LIVE_MAX = 90
const AMBIENT_COUNT = 28
const AMBIENT_FPS = 30
const BURST_FPS = 60
const BURST_MS = 1800

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  age: number
  life: number
  size: number
  color: string
  kind: 'dot' | 'bubble' | 'spark' | 'petal'
  ambient: boolean
  phase: number
}

const COLORS: Record<World, readonly string[]> = {
  sea: ['#3ef2e0', '#9ff7ee', '#0fb5a8'],
  sky: ['#ffd98a', '#fff4d6', '#ffe9b8'],
  garden: ['#f2c94c', '#5fbf4a', '#ffe08a'],
}

export class ParticleField {
  private readonly ctx: CanvasRenderingContext2D
  private particles: Particle[] = []
  private width = 0
  private height = 0
  private horizon = 0.58
  private last = 0
  private burstUntil = 0
  private handle: FrameHandle | null = null

  constructor(private readonly canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('canvas 2d unavailable')
    this.ctx = ctx
  }

  resize(width: number, height: number, horizon: number): void {
    const dpr = Math.min(devicePixelRatio || 1, 2)
    this.width = width
    this.height = height
    this.horizon = horizon
    this.canvas.width = Math.round(width * dpr)
    this.canvas.height = Math.round(height * dpr)
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    this.seedAmbient()
  }

  start(): void {
    if (this.handle || reducedMotion()) return
    this.last = performance.now()
    this.handle = ticker.add(this.frame, AMBIENT_FPS)
  }

  stop(): void {
    this.handle?.remove()
    this.handle = null
  }

  /** A tap's effect, in the world's own colours, from a point on screen. */
  burst(world: World, x: number, y: number, count = 18): void {
    if (reducedMotion()) return
    const colors = COLORS[world]
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2
      const speed = 40 + Math.random() * 90
      this.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: world === 'sea' ? -60 - Math.random() * 80 : Math.sin(angle) * speed - 30,
        age: 0,
        life: 0.9 + Math.random() * 0.7,
        size: world === 'sea' ? 2 + Math.random() * 4 : 1.5 + Math.random() * 2.5,
        color: colors[i % colors.length] ?? colors[0] ?? '#fff',
        kind: world === 'sea' ? 'bubble' : world === 'sky' ? 'spark' : 'petal',
        ambient: false,
        phase: Math.random() * Math.PI * 2,
      })
    }
    this.burstUntil = performance.now() + BURST_MS
    this.start()
    this.handle?.setFps(BURST_FPS)
  }

  private seedAmbient(): void {
    this.particles = this.particles.filter((p) => !p.ambient)
    if (reducedMotion()) return
    for (let i = 0; i < AMBIENT_COUNT; i++) this.push(this.ambientParticle(true))
  }

  private ambientParticle(anywhere: boolean): Particle {
    const seaTop = this.height * this.horizon
    return {
      x: Math.random() * this.width,
      y: anywhere ? seaTop + Math.random() * (this.height - seaTop) : this.height + 4,
      vx: (Math.random() - 0.5) * 6,
      vy: -3 - Math.random() * 5,
      age: 0,
      life: 14 + Math.random() * 10,
      size: 1 + Math.random() * 1.8,
      color: Math.random() < 0.7 ? '#3ef2e0' : '#0fb5a8',
      kind: 'dot',
      ambient: true,
      phase: Math.random() * Math.PI * 2,
    }
  }

  private push(p: Particle): void {
    if (this.particles.length >= LIVE_MAX) this.particles.shift()
    this.particles.push(p)
  }

  private readonly frame = (now: number): void => {
    const dt = Math.min((now - this.last) / 1000, 0.1)
    this.last = now
    if (this.burstUntil && now > this.burstUntil) {
      this.burstUntil = 0
      this.handle?.setFps(AMBIENT_FPS)
    }
    this.tick(dt, now / 1000)
    this.draw(now / 1000)
  }

  private tick(dt: number, t: number): void {
    const next: Particle[] = []
    for (const p of this.particles) {
      p.age += dt
      p.x += p.vx * dt
      p.y += p.vy * dt
      if (p.kind === 'bubble') p.x += Math.sin(t * 4 + p.phase) * 18 * dt
      if (p.kind === 'petal') {
        p.vy += 60 * dt
        p.x += Math.sin(t * 3 + p.phase) * 25 * dt
      }
      if (p.kind === 'spark') p.vy += 20 * dt
      if (p.age < p.life) next.push(p)
      else if (p.ambient) next.push(this.ambientParticle(false))
    }
    this.particles = next
  }

  private draw(t: number): void {
    const { ctx } = this
    ctx.clearRect(0, 0, this.width, this.height)
    for (const p of this.particles) {
      const k = p.age / p.life
      // Ambient dots fade in, drift and fade out with a slow pulse; bursts just fade.
      const alpha = p.ambient
        ? Math.min(1, k * 6, (1 - k) * 6) * (0.35 + 0.35 * Math.sin(t * 1.5 + p.phase))
        : 1 - k
      ctx.globalAlpha = Math.max(0, alpha)
      ctx.fillStyle = p.color
      ctx.beginPath()
      if (p.kind === 'bubble') {
        ctx.strokeStyle = p.color
        ctx.lineWidth = 1
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.stroke()
      } else if (p.kind === 'petal') {
        ctx.ellipse(p.x, p.y, p.size * 1.6, p.size, p.phase + t, 0, Math.PI * 2)
        ctx.fill()
      } else {
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fill()
      }
    }
    ctx.globalAlpha = 1
  }
}
