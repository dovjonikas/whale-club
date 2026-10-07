import type { DateKey, World } from '../store/types'
import type { Collectible } from './collectibles'
import { collectibleSvg } from './collectibles'
import { moonPhase, moonSvg } from './moon'
import { startParallax } from './parallax'
import { ParticleField } from './particles'
import type { Rarity } from './rarity'
import { shoreSvg } from './shore'
import { StarField } from './stars'
import { StoneLayer, type StoneSpec } from './stones'
import { ticker } from './ticker'
import { visitorSvg, whaleSvg, type VisitorKind } from './visitors'

/**
 * The scene behind everything. Back to front: the sky (a nebula of slow
 * colour, the star canvas, the moon in its real phase), the sea, the shore
 * with the warm light of its sunflowers, the collectibles and visitors,
 * the stones waiting to be cracked, the particle canvas.
 *
 * It knows nothing about things or days. The app tells it what to show
 * (`setDays`, `setCollectibles`, `setStones`, `setWarmth`, `setQuiet`,
 * `setSession`) and when to react (`burst`, `surfaceWhale`, `visit`); it
 * draws. Day-stars also get a button each, so a star can be tapped or
 * reached with a keyboard. All motion by script runs on the one ticker,
 * which stops while the page is hidden or the scene is off screen.
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

export interface ShownCollectible {
  item: Collectible
  rarity: Rarity
}

export class Scene {
  readonly root: HTMLElement
  private readonly stars: StarField
  private readonly particles: ParticleField
  private readonly stones: StoneLayer
  private readonly skyLayer: HTMLElement
  private readonly starHits: HTMLElement
  private readonly thingsLayer: HTMLElement
  private readonly stopParallax: () => void
  private readonly observer: ResizeObserver
  private days: SceneDays | null = null
  private shown = new Set<string>()
  private rendered = false
  private onStarTap: ((date: DateKey) => void) | null = null

  constructor(parent: HTMLElement, onCrack: (key: string) => void) {
    this.root = document.createElement('div')
    this.root.className = 'scene'
    this.root.dataset.quiet = 'false'
    this.root.dataset.session = 'false'
    this.root.innerHTML = `
      <div class="layer sky" data-depth="0.25" aria-hidden="true">
        <div class="nebula"><i></i><i></i><i></i></div>
        <canvas class="stars"></canvas>
        <div class="moon">${moonSvg(moonPhase(new Date()))}</div>
      </div>
      <div class="layer sea" data-depth="0.8" aria-hidden="true"></div>
      <div class="layer shore" data-depth="0.5" aria-hidden="true">
        <div class="shore-warmth"></div>
        ${shoreSvg()}
      </div>
      <div class="scene-things" aria-hidden="true"></div>
      <div class="stones" role="group" aria-label="stones"></div>
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
    this.stones = new StoneLayer(this.query('.stones'), onCrack)
    // The star buttons are left out of the parallax: at depth 0.25 the canvas
    // drifts two pixels at most, and a button that keeps moving is one a finger misses.
    this.stopParallax = startParallax([this.skyLayer, this.query('.shore'), this.query('.sea')])

    ticker.observe(this.root)
    this.observer = new ResizeObserver(() => {
      this.resize()
    })
    this.observer.observe(this.root)
    this.resize()
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
   * What has been found. Items not shown before arrive: popping out where
   * their stone was (`arrivals`, in px from the scene's corner), shining,
   * then settling into their own place. The first call after load shows
   * everything quietly.
   */
  setCollectibles(
    shown: readonly ShownCollectible[],
    arrivals: ReadonlyMap<string, { x: number; y: number }> = new Map(),
    now: Date = new Date(),
  ): void {
    const firstRender = !this.rendered
    this.rendered = true
    const scale = Math.min(Math.max(this.root.clientWidth / PHONE_WIDTH, 0.8), 2)
    const hour = now.getHours()
    const dark = hour >= NIGHT_FROM || hour < NIGHT_TO
    const keep = new Set<string>()
    for (const { item, rarity } of shown) {
      if (item.night && !dark) continue
      keep.add(item.id)
      let element = this.thingsLayer.querySelector<HTMLElement>(`[data-id="${item.id}"]`)
      if (!element) {
        element = document.createElement('div')
        element.className = 'collectible'
        element.dataset.id = item.id
        element.dataset.motion = item.motion
        element.dataset.world = item.world
        element.dataset.rarity = rarity
        element.style.left = `${(item.x * 100).toFixed(2)}%`
        element.style.top = `${(item.y * 100).toFixed(2)}%`
        element.style.width = `${String(Math.round(item.size * scale))}px`
        element.innerHTML = collectibleSvg(item)
        this.thingsLayer.append(element)
        const from = arrivals.get(item.id)
        if (from) this.arrive(element, from)
        else if (!firstRender && !this.shown.has(item.id)) element.classList.add('is-new')
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
  }

  /** The stones waiting; returns the keys of ones that just fell in. */
  setStones(specs: readonly StoneSpec[]): string[] {
    return this.stones.render(specs)
  }

  stoneRect(key: string): DOMRect | undefined {
    return this.stones.rect(key)
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

  /** The warm light from the shore: brighter the more the garden holds, 0 to 1. */
  setWarmth(level: number): void {
    this.root.style.setProperty('--warmth', Math.max(0, Math.min(1, level)).toFixed(2))
  }

  setQuiet(quiet: boolean): void {
    this.root.dataset.quiet = String(quiet)
  }

  /** During a lock-in the sky turns, slowly. */
  setSession(on: boolean): void {
    this.root.dataset.session = String(on)
  }

  /** A tap's effect at a point on screen, in the world's colours. */
  burst(world: World, x: number, y: number, count?: number): void {
    const rect = this.root.getBoundingClientRect()
    this.particles.burst(world, x - rect.left, y - rect.top, count)
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
    const rect = this.root.getBoundingClientRect()
    this.burst('sea', rect.left + rect.width * 0.5, rect.top + rect.height * 0.58)
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

  get starCanvas(): HTMLCanvasElement {
    return canvas(this.query('canvas.stars'))
  }

  destroy(): void {
    this.observer.disconnect()
    this.stopParallax()
    this.stars.stop()
    this.particles.stop()
    this.root.remove()
  }

  /** A find pops out where its stone was, is polished, and settles into its place. */
  private arrive(element: HTMLElement, from: { x: number; y: number }): void {
    const rect = this.root.getBoundingClientRect()
    const own = element.getBoundingClientRect()
    const dx = from.x - (own.left - rect.left + own.width / 2)
    const dy = from.y - (own.top - rect.top + own.height / 2)
    element.style.setProperty('--from-x', `${dx.toFixed(1)}px`)
    element.style.setProperty('--from-y', `${dy.toFixed(1)}px`)
    element.insertAdjacentHTML(
      'beforeend',
      '<span class="find-glow" aria-hidden="true"></span><span class="find-shine" aria-hidden="true"></span>',
    )
    element.classList.add('is-found')
    element.addEventListener(
      'animationend',
      (event) => {
        if (event.target !== element) return
        element.classList.remove('is-found')
        element.querySelectorAll('.find-glow, .find-shine').forEach((e) => {
          e.remove()
        })
      },
      { once: false },
    )
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
