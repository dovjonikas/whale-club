import type { DateKey, World } from '../store/types'
import { startParallax } from './parallax'
import { ParticleField } from './particles'
import { shoreSvg } from './shore'
import { StarField } from './stars'

/**
 * The scene behind everything: sky, sea and shore as three parallax
 * layers (the shore last, so it is painted over the top edge of the sea), a star canvas in the sky, one particle canvas over the lot.
 *
 * It knows nothing about things or days. The app tells it what to show
 * (`setDays`, `setQuiet`) and when to react (`burst`); it draws.
 */
export class Scene {
  readonly root: HTMLElement
  private readonly stars: StarField
  private readonly particles: ParticleField
  private readonly skyLayer: HTMLElement
  private readonly thingsLayer: HTMLElement
  private readonly stopParallax: () => void
  private readonly observer: ResizeObserver

  constructor(parent: HTMLElement) {
    this.root = document.createElement('div')
    this.root.className = 'scene'
    this.root.dataset.quiet = 'false'
    this.root.setAttribute('aria-hidden', 'true')
    this.root.innerHTML = `
      <div class="layer sky" data-depth="0.25"><canvas class="stars"></canvas></div>
      <div class="layer sea" data-depth="0.8"></div>
      <div class="layer shore" data-depth="0.5">${shoreSvg()}</div>
      <div class="scene-things"></div>
      <canvas class="particles"></canvas>
      <div class="scene-dim"></div>`
    parent.prepend(this.root)

    this.skyLayer = this.query('.sky')
    this.thingsLayer = this.query('.scene-things')
    this.stars = new StarField(canvas(this.query('canvas.stars')))
    this.particles = new ParticleField(canvas(this.query('canvas.particles')))
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

  /** The sky's day-stars. `streak` dates are drawn joined. */
  setDays(dates: readonly DateKey[], streak: ReadonlySet<DateKey>, today: DateKey): void {
    this.stars.setDays(dates, streak, today)
  }

  setQuiet(quiet: boolean): void {
    this.root.dataset.quiet = String(quiet)
  }

  /** A tap's effect at a point on screen, in the world's colours. */
  burst(world: World, x: number, y: number): void {
    this.particles.burst(world, x, y)
  }

  /** Where the sky is, for whoever wants to put something in it. */
  get horizonY(): number {
    return this.root.clientHeight * 0.58
  }

  /** The layer collectibles and the whale are placed on. */
  get things(): HTMLElement {
    return this.thingsLayer
  }

  starAt(x: number, y: number): DateKey | undefined {
    // The sky layer is inset by 3% for parallax, so the canvas is offset.
    const rect = this.skyLayer.getBoundingClientRect()
    return this.stars.starAt(x - rect.left, y - rect.top)?.date
  }

  destroy(): void {
    this.observer.disconnect()
    this.stopParallax()
    this.stars.stop()
    this.particles.stop()
    document.removeEventListener('visibilitychange', this.onVisibility)
    this.root.remove()
  }

  private resize(): void {
    const width = this.root.clientWidth
    const height = this.root.clientHeight
    if (!width || !height) return
    this.stars.resize(this.skyLayer.clientWidth, this.skyLayer.clientHeight)
    this.particles.resize(width, height, 0.58)
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
