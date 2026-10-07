import type { DateKey, World } from '../store/types'
import type { Collectible } from './collectibles'
import { collectibleSvg } from './collectibles'
import { startParallax } from './parallax'
import { ParticleField } from './particles'
import { shoreSvg } from './shore'
import { StarField } from './stars'
import { visitorSvg, whaleSvg, type VisitorKind } from './visitors'

/**
 * The scene behind everything: sky, sea and shore as three parallax
 * layers (the shore last, so it is painted over the top edge of the sea),
 * a star canvas in the sky, a layer for collectibles and visitors, one
 * particle canvas over the lot.
 *
 * It knows nothing about things or days. The app tells it what to show
 * (`setDays`, `setCollectibles`, `setQuiet`) and when to react (`burst`,
 * `surfaceWhale`, `visit`); it draws. Day-stars also get a button each,
 * so a star can be tapped or reached with a keyboard.
 */
const PHONE_WIDTH = 390
const NIGHT_FROM = 21
const NIGHT_TO = 5

export interface SceneDays {
  dates: readonly DateKey[]
  streak: ReadonlySet<DateKey>
  today: DateKey
  label: (date: DateKey) => string
}

export class Scene {
  readonly root: HTMLElement
  private readonly stars: StarField
  private readonly particles: ParticleField
  private readonly skyLayer: HTMLElement
  private readonly starHits: HTMLElement
  private readonly thingsLayer: HTMLElement
  private readonly stopParallax: () => void
  private readonly observer: ResizeObserver
  private days: SceneDays | null = null
  private shown = new Set<string>()
  private rendered = false
  private onStarTap: ((date: DateKey) => void) | null = null

  constructor(parent: HTMLElement) {
    this.root = document.createElement('div')
    this.root.className = 'scene'
    this.root.dataset.quiet = 'false'
    this.root.innerHTML = `
      <div class="layer sky" data-depth="0.25" aria-hidden="true"><canvas class="stars"></canvas></div>
      <div class="layer sea" data-depth="0.8" aria-hidden="true"></div>
      <div class="layer shore" data-depth="0.5" aria-hidden="true">${shoreSvg()}</div>
      <div class="scene-things" aria-hidden="true"></div>
      <canvas class="particles" aria-hidden="true"></canvas>
      <div class="scene-glow" aria-hidden="true"></div>
      <div class="scene-dim" aria-hidden="true"></div>
      <div class="star-hits" role="group" aria-label="your days"></div>`
    parent.prepend(this.root)

    this.skyLayer = this.query('.sky')
    this.starHits = this.query('.star-hits')
    this.thingsLayer = this.query('.scene-things')
    this.stars = new StarField(canvas(this.query('canvas.stars')))
    this.particles = new ParticleField(canvas(this.query('canvas.particles')))
    // The hit layer is left out of the parallax: at depth 0.25 the canvas
    // drifts two pixels at most, and a moving button is one a finger misses.
    this.stopParallax = startParallax([this.skyLayer, this.query('.shore'), this.query('.sea')])

    this.observer = new ResizeObserver(() => {
      this.resize()
    })
    this.observer.observe(this.root)
    this.resize()

    document.addEventListener('visibilitychange', this.onVisibility)
    this.stars.start()
    this.particles.start()
  }

  /** The sky's day-stars, with a label and a tap for each. */
  setDays(days: SceneDays, onTap: (date: DateKey) => void): void {
    this.days = days
    this.onStarTap = onTap
    this.stars.setDays(days.dates, days.streak, days.today)
    this.renderStarHits()
  }

  /**
   * What is unlocked. Items not shown before get the unlock animation and
   * are returned; the first call after load shows everything quietly.
   */
  setCollectibles(items: readonly Collectible[], now: Date = new Date()): string[] {
    const firstRender = !this.rendered
    this.rendered = true
    const scale = Math.min(Math.max(this.root.clientWidth / PHONE_WIDTH, 0.8), 2)
    const hour = now.getHours()
    const dark = hour >= NIGHT_FROM || hour < NIGHT_TO
    const keep = new Set<string>()
    const fresh: string[] = []
    for (const item of items) {
      if (item.night && !dark) continue
      keep.add(item.id)
      let element = this.thingsLayer.querySelector<HTMLElement>(`[data-id="${item.id}"]`)
      if (!element) {
        element = document.createElement('div')
        element.className = 'collectible'
        element.dataset.id = item.id
        element.dataset.motion = item.motion
        element.dataset.world = item.world
        element.style.left = `${(item.x * 100).toFixed(2)}%`
        element.style.top = `${(item.y * 100).toFixed(2)}%`
        element.style.width = `${Math.round(item.size * scale)}px`
        element.innerHTML = collectibleSvg(item)
        this.thingsLayer.append(element)
        if (!firstRender && !this.shown.has(item.id)) {
          element.classList.add('is-new')
          fresh.push(item.id)
        }
      }
      this.shown.add(item.id)
    }
    for (const element of this.thingsLayer.querySelectorAll<HTMLElement>('.collectible')) {
      const id = element.dataset.id ?? ''
      if (!keep.has(id)) {
        element.remove()
        this.shown.delete(id)
      }
    }
    return fresh
  }

  /** The collectibles on screen right now (night ones only after dark), for the postcard. */
  visibleCollectibleIds(): string[] {
    return [...this.thingsLayer.querySelectorAll<HTMLElement>('.collectible')].map(
      (element) => element.dataset.id ?? '',
    )
  }

  /** Where a collectible is on screen, for a burst. */
  collectibleRect(id: string): DOMRect | undefined {
    return this.thingsLayer.querySelector(`[data-id="${id}"]`)?.getBoundingClientRect()
  }

  setQuiet(quiet: boolean): void {
    this.root.dataset.quiet = String(quiet)
  }

  /** A tap's effect at a point on screen, in the world's colours. */
  burst(world: World, x: number, y: number): void {
    this.particles.burst(world, x, y)
  }

  /** The day is done: the whale rises across the horizon and goes back down. */
  surfaceWhale(jacket: boolean): void {
    this.thingsLayer.querySelector('.whale')?.remove()
    const whale = document.createElement('div')
    whale.className = 'whale'
    whale.innerHTML = whaleSvg(jacket)
    this.thingsLayer.append(whale)
    this.glow()
    whale.addEventListener('animationend', () => whale.remove(), { once: true })
    this.burst('sea', this.root.clientWidth * 0.5, this.root.clientHeight * 0.58)
  }

  /** A brief brightening of the water. */
  glow(): void {
    const glow = this.query('.scene-glow')
    glow.classList.remove('is-on')
    glow.getBoundingClientRect()
    glow.classList.add('is-on')
    glow.addEventListener('animationend', () => glow.classList.remove('is-on'), { once: true })
  }

  /** A visitor passes through: the daily surprise. */
  visit(kind: VisitorKind): void {
    const visitor = document.createElement('div')
    visitor.className = 'visitor'
    visitor.dataset.kind = kind
    visitor.innerHTML = visitorSvg(kind)
    this.thingsLayer.append(visitor)
    visitor.addEventListener('animationend', () => visitor.remove(), { once: true })
  }

  /** The things layer, for the share picture. */
  get things(): HTMLElement {
    return this.thingsLayer
  }

  get starCanvas(): HTMLCanvasElement {
    return canvas(this.query('canvas.stars'))
  }

  get particleCanvas(): HTMLCanvasElement {
    return canvas(this.query('canvas.particles'))
  }

  get shore(): HTMLElement {
    return this.query('.shore')
  }

  destroy(): void {
    this.observer.disconnect()
    this.stopParallax()
    this.stars.stop()
    this.particles.stop()
    document.removeEventListener('visibilitychange', this.onVisibility)
    this.root.remove()
  }

  private renderStarHits(): void {
    const days = this.days
    if (!days) return
    this.starHits.replaceChildren()
    for (const star of this.stars.positions()) {
      const button = document.createElement('button')
      button.type = 'button'
      button.className = 'day-star'
      button.dataset.date = star.date
      button.style.left = `${star.x.toFixed(1)}px`
      button.style.top = `${star.y.toFixed(1)}px`
      button.setAttribute('aria-label', days.label(star.date))
      button.addEventListener('click', () => this.onStarTap?.(star.date))
      this.starHits.append(button)
    }
  }

  private resize(): void {
    const width = this.root.clientWidth
    const height = this.root.clientHeight
    if (!width || !height) return
    this.stars.resize(this.skyLayer.clientWidth, this.skyLayer.clientHeight)
    this.particles.resize(width, height, 0.58)
    this.renderStarHits()
  }

  private readonly onVisibility = (): void => {
    if (document.hidden) {
      this.stars.stop()
      this.particles.stop()
    } else {
      this.stars.start()
      this.particles.start()
    }
  }

  private query(selector: string): HTMLElement {
    const element = this.root.querySelector<HTMLElement>(selector)
    if (!element) throw new Error(`scene is missing ${selector}`)
    return element
  }
}

function canvas(element: HTMLElement): HTMLCanvasElement {
  if (!(element instanceof HTMLCanvasElement)) throw new Error('not a canvas')
  return element
}
