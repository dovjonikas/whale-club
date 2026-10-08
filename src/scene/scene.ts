import { today } from '../store/clock'
import type { DateKey, World } from '../store/types'
import type { Collectible } from './collectibles'
import { collectibleSvg } from './collectibles'
import { deepHtml, kelpHtml, shaftsHtml, surfaceSvg } from './depths'
import {
  auroraSkySvg,
  fridayStarsHtml,
  glowingCoveSvg,
  islandWhaleSvg,
  pierSvg,
  reefSvg,
  shoreEdgeSvg,
  skyWhaleSvg,
  smallWhaleSvg,
} from './dock/scene'
import { LanternLayer, type LanternSpec } from './lanterns'
import { moonPhase, moonSvg } from './moon'
import { startParallax } from './parallax'
import { ParticleField } from './particles'
import type { Rarity } from './rarity'
import { shoreSvg } from './shore'
import { StarField } from './stars'
import { StoneLayer, type StoneSpec } from './stones'
import { causticsUrl, grainUrl } from './textures'
import { reducedMotion, ticker } from './ticker'
import type { Season, SkyEvent } from './calendar'
import { seasonShoreSvg } from './seasons'
import { voice } from '../voice'
import { bottleSvg, rainHtml } from './bottle'
import { PetLayer, type PetSpec } from './pets'
import { sleeperSvg, visitorSvg, whaleSvg, type VisitorKind } from './visitors'
import { PHONE_WIDTH } from './phone'

/** The flight's own length is in scene.css (star-flight); this is a backstop if it never ends. */
const STAR_FLIGHT_MAX_MS = 2000
/** A night-only dock thing bought in daylight shows itself for this long. */
const DOCK_PREVIEW_MS = 6000
/** Under reduced motion the sky whale rests in the sky this long instead of crossing. */
const SKY_WHALE_REST_MS = 6000
/** Under reduced motion a find does not fly or swell: it fades in where it stays. */
const FIND_FADE_MS = 300
/** The sky whale starts across this long after the scene opens in the dark. */
const SKY_WHALE_WAIT_MS = 20_000
const NIGHT_FROM = 21
const NIGHT_TO = 5
/** Where the sky ends, as a fraction of the scene's height (--horizon in tokens.css). */
const HORIZON = 0.58

export interface SceneDays {
  dates: readonly DateKey[]
  today: DateKey
  label: (date: DateKey) => string
}

/** Where a shown thing stands: its place, or its own spot for the scene's weather. */
export interface Standing {
  x: number
  y: number
  /** Feet on y (the shore's things) rather than centred on it. */
  stand: boolean
  /** Drawn smaller, far away. */
  depth: number
}

export interface ShownCollectible {
  item: Collectible
  rarity: Rarity
  at: Standing
  /** The scene's weather (an aurora, the deep): drawn behind the things that stand in places. */
  weather?: boolean
}

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
export class Scene {
  private pets: PetLayer | null = null
  private onPetTap: ((id: string) => void) | null = null
  readonly root: HTMLElement
  private readonly stars: StarField
  private readonly particles: ParticleField
  private readonly stones: StoneLayer
  private readonly lanterns: LanternLayer
  private readonly lanternCanvas: HTMLCanvasElement
  /** Today's new star, kept back until the opening shows it. */
  private heldStar: DateKey | null = null
  /** The real lanterns, put back after a preview. */
  private lanternSpecs: readonly LanternSpec[] = []
  private lanternToday: DateKey | undefined
  /** While the intro shows a year that is not the person's, the real sky waits. */
  private previewing = false
  private readonly skyLayer: HTMLElement
  private readonly starHits: HTMLElement
  private readonly thingsLayer: HTMLElement
  private readonly observer: ResizeObserver
  private days: SceneDays | null = null
  private shown = new Set<string>()
  private rendered = false
  private onStarTap: ((date: DateKey) => void) | null = null
  private onSkyTap: (() => void) | null = null
  /** The dock things owned and shown, and the night the sky whale last crossed in. */
  private dockOwned: ReadonlySet<string> = new Set()
  private dockKey = ''
  private skyWhaleNight = ''
  private skyWhaleTimer = 0

  constructor(parent: HTMLElement, onCrack: (key: string) => void) {
    this.root = document.createElement('div')
    this.root.className = 'scene'
    this.root.dataset.quiet = 'false'
    this.root.dataset.session = 'false'
    this.root.innerHTML = `
      <div class="layer sky" data-depth="0.25" aria-hidden="true">
        <div class="nebula"><i></i><i></i><i></i></div>
        <div class="dock-aurora" hidden>${auroraSkySvg()}</div>
        <canvas class="stars"></canvas>
        <div class="dock-friday" hidden>${fridayStarsHtml()}</div>
        <div class="sky-shower" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div>
        <div class="sky-fireworks" aria-hidden="true"><i></i><i></i><i></i></div>
        <div class="sky-light" aria-hidden="true"></div>
        <div class="season-flakes" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>
        <div class="dock-sky-whale" hidden>${skyWhaleSvg()}</div>
        <div class="moon">${moonSvg(moonPhase(today()))}</div>
      </div>
      <div class="layer sea" data-depth="0.8" aria-hidden="true">
        <div class="caustics"><i></i></div>
        ${shaftsHtml()}
        ${deepHtml()}
        ${kelpHtml()}
      </div>
      <div class="layer shore" data-depth="0.5" aria-hidden="true">
        <div class="shore-warmth"></div>
        ${shoreSvg()}
        <div class="surface">${surfaceSvg()}</div>
      </div>
      <canvas class="lanterns" aria-hidden="true"></canvas>
      <div class="dock-under">
        <div class="dock-cove" hidden aria-hidden="true">${glowingCoveSvg()}</div>
        <div class="season-shore" aria-hidden="true">${seasonShoreSvg()}</div>
        <div class="dock-island" hidden aria-hidden="true">${islandWhaleSvg()}</div>
        <div class="dock-tide" hidden aria-hidden="true"></div>
        <div class="dock-edge" hidden aria-hidden="true">${shoreEdgeSvg()}</div>
        <div class="dock-reef" hidden aria-hidden="true">${reefSvg()}</div>
        <div class="dock-small-whale" hidden aria-hidden="true">${smallWhaleSvg()}</div>
      </div>
      <div class="scene-things" aria-hidden="true"></div>
      <div class="sleeper" aria-hidden="true">${sleeperSvg()}</div>
      <div class="pets" role="group" aria-label="${voice.labels.pets}"></div>
      <div class="stones" role="group" aria-label="${voice.labels.stones}"></div>
      <button type="button" class="pier"></button>
      <button type="button" class="bottle" hidden aria-label="${voice.bottle.label}">${bottleSvg()}</button>
      <canvas class="particles" aria-hidden="true"></canvas>
      <div class="scene-glow" aria-hidden="true"></div>
      <div class="scene-rain" aria-hidden="true">${rainHtml()}</div>
      <div class="scene-soft" aria-hidden="true"></div>
      <div class="grain" aria-hidden="true"></div>
      <div class="scene-dim" aria-hidden="true"></div>
      <div class="scene-late" aria-hidden="true"></div>
      <button type="button" class="moon-hit" hidden aria-label="${voice.late.moon}"></button>
      <div class="star-hits" role="group" aria-label="${voice.labels.days}"></div>`
    parent.prepend(this.root)

    this.skyLayer = this.query('.sky')
    this.starHits = this.query('.star-hits')
    this.thingsLayer = this.query('.scene-things')
    this.stars = new StarField(canvas(this.query('canvas.stars')))
    this.particles = new ParticleField(canvas(this.query('canvas.particles')))
    this.stones = new StoneLayer(this.query('.stones'), onCrack)
    this.lanternCanvas = canvas(this.query('canvas.lanterns'))
    this.lanterns = new LanternLayer(this.lanternCanvas)
    // The canvases above the sky take the taps, so the sky is found by height:
    // a tap above the horizon that is not on a star, a stone or a button.
    this.root.addEventListener('click', (event) => {
      if (event.target instanceof Element && event.target.closest('button, .stone')) return
      const rect = this.root.getBoundingClientRect()
      if (event.clientY - rect.top < rect.height * HORIZON) this.onSkyTap?.()
    })
    // The star buttons are left out of the parallax: at depth 0.25 the canvas
    // drifts two pixels at most, and a button that keeps moving is one a finger misses.
    // The scene lives as long as the app, so its parallax is never stopped.
    startParallax([this.skyLayer, this.query('.shore'), this.query('.sea')])

    ticker.observe(this.root)
    this.observer = new ResizeObserver(() => {
      this.resize()
    })
    // The first size comes from the observer, after layout, rather than read
    // here, which would force a layout of the whole page before it is built.
    this.observer.observe(this.root)
    this.stars.start()
    this.particles.start()
    // The textures are drawn once, each in its own idle moment after the first
    // paint, so neither holds up the first screen or a tap.
    whenIdle(() => {
      void grainUrl().then((url) => {
        if (url) this.root.style.setProperty('--grain', `url(${url})`)
        whenIdle(() => {
          void causticsUrl().then((next) => {
            if (next) this.root.style.setProperty('--caustics', `url(${next})`)
          })
        })
      })
    })
  }

  /** The sky's day-stars, with a label and a tap for each. */
  setDays(days: SceneDays, onTap: (date: DateKey) => void): void {
    this.days = days
    this.onStarTap = onTap
    this.applyDays()
  }

  /** A tap on the open sky, away from any star. */
  onSky(handler: () => void): void {
    this.onSkyTap = handler
  }

  /** Keeps today's star out of the sky until `revealStar`, so the opening can light it. */
  holdStar(date: DateKey): void {
    this.heldStar = date
    this.applyDays()
  }

  /** The held star appears, with a little star dust. */
  revealStar(): void {
    const date = this.heldStar
    if (date === null) return
    this.heldStar = null
    this.applyDays()
    const star = this.stars.positions().find((s) => s.date === date)
    if (star) this.particles.burst('sky', star.x, star.y, 14)
  }

  /**
   * The day's first done: today's star, held back, rises from `from` (a
   * point on the page, the card) and flies to its place in the
   * constellation, where it lights and its line joins (about a second). A
   * tap anywhere lands it at once; under reduced motion it simply appears.
   */
  flyStar(date: DateKey, from: { x: number; y: number }): void {
    const days = this.days
    const canvasRect = this.query('canvas.stars').getBoundingClientRect()
    const target = days ? this.stars.where(days.dates, date) : undefined
    const sceneRect = this.root.getBoundingClientRect()
    if (!target || reducedMotion()) {
      this.revealStar()
      return
    }
    const ratio = canvasRect.width / Math.max(1, this.skyLayer.clientWidth)
    const to = { x: canvasRect.left + target.x * ratio, y: canvasRect.top + target.y * ratio }
    const star = document.createElement('div')
    star.className = 'star-flight'
    star.setAttribute('aria-hidden', 'true')
    star.style.left = `${(from.x - sceneRect.left).toFixed(1)}px`
    star.style.top = `${(from.y - sceneRect.top).toFixed(1)}px`
    star.style.setProperty('--dx', `${(to.x - from.x).toFixed(1)}px`)
    star.style.setProperty('--dy', `${(to.y - from.y).toFixed(1)}px`)
    star.innerHTML = '<i></i>'
    this.root.append(star)
    let landed = false
    const land = (): void => {
      if (landed) return
      landed = true
      document.removeEventListener('pointerdown', land)
      star.remove()
      this.revealStar()
    }
    star.addEventListener('animationend', land, { once: true })
    // A tap anywhere lands it: nothing waits on a star.
    document.addEventListener('pointerdown', land, { once: true })
    setTimeout(land, STAR_FLIGHT_MAX_MS)
  }

  /** Every lantern in the cove. */
  setLanterns(specs: readonly LanternSpec[], today?: DateKey): void {
    this.lanternSpecs = specs
    this.lanternToday = today
    if (!this.previewing) this.lanterns.set(specs, today)
  }

  /**
   * The intro's year: stars and lanterns that are not stored and cannot be
   * tapped, drawn in place of the real ones; `null` puts the real ones back.
   */
  preview(
    year: {
      dates: readonly DateKey[]
      today: DateKey
      lanterns: readonly LanternSpec[]
    } | null,
  ): void {
    if (year === null) {
      this.previewing = false
      this.lanterns.set(this.lanternSpecs, this.lanternToday)
      this.applyDays()
      if (!this.days) this.stars.setDays([])
      return
    }
    this.previewing = true
    this.starHits.replaceChildren()
    this.stars.setDays(year.dates)
    this.lanterns.set(year.lanterns)
  }

  /** The intro keeps every find a secret: the creatures and the whale are dark shapes with a rim of light. */
  setSilhouette(on: boolean): void {
    this.root.dataset.silhouette = String(on)
    // A silhouette whale still surfacing would turn into the real one: it goes with the promise.
    if (!on) this.thingsLayer.querySelector('.whale')?.remove()
  }

  /** A find, as the intro shows it: only a flash of light where it would be. */
  flash(x: number, y: number, world: World): void {
    const flash = document.createElement('div')
    flash.className = 'scene-flash'
    flash.dataset.world = world
    flash.style.left = `${(x * 100).toFixed(1)}%`
    flash.style.top = `${(y * 100).toFixed(1)}%`
    this.thingsLayer.append(flash)
    flash.addEventListener('animationend', () => flash.remove(), { once: true })
    const rect = this.root.getBoundingClientRect()
    this.particles.burst(world, x * rect.width, y * rect.height, 10)
  }

  holdLantern(key: string): void {
    this.lanterns.hold(key)
  }

  arriveLantern(key: string): void {
    this.lanterns.arrive(key)
  }

  /** Whatever the opening was holding back, all at once: a skipped opening. */
  releaseHeld(): void {
    this.lanterns.release()
    if (this.heldStar !== null) {
      this.heldStar = null
      this.applyDays()
    }
  }

  private applyDays(): void {
    const days = this.days
    if (!days || this.previewing) return
    const held = this.heldStar
    const dates = held === null ? days.dates : days.dates.filter((d) => d !== held)
    this.stars.setDays(dates)
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
    now: Date = today(),
  ): void {
    const firstRender = !this.rendered
    this.rendered = true
    const hour = now.getHours()
    const dark = hour >= NIGHT_FROM || hour < NIGHT_TO
    const keep = new Set<string>()
    for (const { item, rarity, at, weather } of shown) {
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
        element.dataset.weather = String(weather === true)
        // The wrapper stands in its place; the art inside moves, so a drift never shifts the place.
        // A legendary has a shimmer of its own: three small lights that come and go in turn.
        const shimmer =
          rarity === 'legendary'
            ? '<span class="legend-sparkle"></span><span class="legend-sparkle"></span><span class="legend-sparkle"></span>'
            : ''
        element.innerHTML = `<div class="collectible-art">${collectibleSvg(item)}</div>${shimmer}`
        this.thingsLayer.append(element)
        this.standAt(element, item.size, at)
        const from = arrivals.get(item.id)
        if (from) this.arrive(element, from)
        else if (!firstRender && !this.shown.has(item.id)) {
          const fresh = element
          fresh.classList.add('is-new')
          // Let go once it has landed: a finished entrance held "forwards" keeps a
          // layer and a style pass for every find, every frame, for good.
          fresh.addEventListener('animationend', function landed(event) {
            if (event.target !== fresh || event.animationName !== 'unlock') return
            fresh.classList.remove('is-new')
            fresh.removeEventListener('animationend', landed)
          })
        }
      } else this.standAt(element, item.size, at)
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

  /**
   * Puts a shown thing in its place. Positions are percentages of the
   * scene and the width follows a CSS variable the resize sets, so nothing
   * here reads layout; an unchanged place writes nothing.
   */
  private standAt(element: HTMLElement, size: number, at: Standing): void {
    const left = `${(at.x * 100).toFixed(2)}%`
    const top = `${(at.y * 100).toFixed(2)}%`
    const width = `calc(${String(Math.round(size * at.depth * 100) / 100)}px * var(--scene-scale, 1))`
    if (element.style.left !== left) element.style.left = left
    if (element.style.top !== top) element.style.top = top
    if (element.style.width !== width) element.style.width = width
    element.dataset.stand = String(at.stand)
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

  /** The warm light from the shore: brighter the more the garden holds, 0 to 1. */
  setWarmth(level: number): void {
    this.root.style.setProperty('--warmth', Math.max(0, Math.min(1, level)).toFixed(2))
  }

  /**
   * The dock in the scene: the pier (its length and its lanterns), the
   * extensions that add places, and what changes the whole scene. Some
   * only come out after dark, as their lines say: aurora nights, the cove
   * glowing, the lanterns lit, Friday's falling stars, and the whale in the
   * sky, which crosses once a night.
   */
  setDock(owned: ReadonlySet<string>, onPier: () => void, now: Date = today()): void {
    const hour = now.getHours()
    const dark = hour >= NIGHT_FROM || hour < NIGHT_TO
    // A Friday night runs on past midnight into Saturday's small hours.
    const friday = dark && (hour >= NIGHT_FROM ? now.getDay() === 5 : now.getDay() === 6)
    const key = [...owned].sort().join(',') + String(dark) + String(friday)
    const pier = this.query('.pier')
    if (!pier.dataset.wired) {
      pier.dataset.wired = 'true'
      pier.addEventListener('click', onPier)
    }
    if (key === this.dockKey) return
    this.dockKey = key
    this.dockOwned = owned
    const has = (id: string): boolean => owned.has(id)
    pier.setAttribute('aria-label', voice.dock.pier)
    pier.innerHTML = pierSvg(has('longer-dock'), has('dock-lanterns'))
    pier.dataset.long = String(has('longer-dock'))
    this.root.dataset.dark = String(dark)
    const show = (selector: string, on: boolean): void => {
      this.query(selector).hidden = !on
    }
    show('.dock-edge', has('longer-shore'))
    show('.dock-reef', has('reef'))
    show('.dock-island', has('island'))
    show('.dock-small-whale', has('second-whale'))
    show('.dock-tide', has('glowing-tide'))
    show('.dock-cove', has('glowing-cove') && dark)
    show('.dock-aurora', has('aurora') && dark)
    show('.dock-friday', has('friday-stars') && friday)
    this.planSkyWhale(has('sky-whale') && dark, now)
  }

  /**
   * Shows a thing bought in daylight that only comes out after dark, for a
   * few seconds, so the purchase is seen; then the scene goes back to its
   * rules.
   */
  previewDock(id: string): void {
    const selector: Record<string, string> = {
      aurora: '.dock-aurora',
      'glowing-cove': '.dock-cove',
      'friday-stars': '.dock-friday',
      'sky-whale': '.dock-sky-whale',
    }
    const target = selector[id]
    if (!target) return
    const element = this.query(target)
    if (!element.hidden && id !== 'sky-whale') return
    element.hidden = false
    element.classList.add('is-preview')
    setTimeout(() => {
      element.classList.remove('is-preview')
      this.dockKey = ''
      this.setDock(this.dockOwned, () => undefined)
    }, DOCK_PREVIEW_MS)
  }

  /** The sky whale crosses once a night, a little while after the scene opens in the dark. */
  private planSkyWhale(on: boolean, now: Date): void {
    const whale = this.query('.dock-sky-whale')
    // The night is named by the evening it began on.
    const evening = new Date(now)
    if (now.getHours() < NIGHT_TO) evening.setDate(evening.getDate() - 1)
    const night = evening.toDateString()
    if (!on || this.skyWhaleNight === night) {
      if (!on) whale.hidden = true
      return
    }
    this.skyWhaleNight = night
    clearTimeout(this.skyWhaleTimer)
    this.skyWhaleTimer = window.setTimeout(() => {
      whale.hidden = false
      whale.classList.add('is-crossing')
      // Reduced motion: it rests in the sky a while instead of crossing, then goes.
      if (reducedMotion()) {
        setTimeout(() => {
          whale.classList.remove('is-crossing')
          whale.hidden = true
        }, SKY_WHALE_REST_MS)
        return
      }
      whale.addEventListener(
        'animationend',
        () => {
          whale.classList.remove('is-crossing')
          whale.hidden = true
        },
        { once: true },
      )
    }, SKY_WHALE_WAIT_MS)
  }

  /** A shown thing's element, for arranging it by hand. */
  collectibleElement(id: string): HTMLElement | null {
    return this.thingsLayer.querySelector<HTMLElement>(`.collectible[data-id="${id}"]`)
  }

  /** Arranging: the scene stops (its loop and every CSS motion) and the pier and stars step back. */
  setArranging(on: boolean): void {
    this.root.dataset.arranging = String(on)
    ticker.hold('arrange', on)
  }

  /**
   * The real year: the season dresses the shore (snow, blossom, fallen
   * leaves, a long summer dusk), and the days the sky and the sea keep
   * show themselves (src/scene/calendar.ts). Nothing here is stored.
   */
  setCalendar(season: Season, events: readonly SkyEvent[]): void {
    this.root.dataset.season = season
    this.root.dataset.meteors = String(events.includes('meteors'))
    this.root.dataset.newYear = String(events.includes('new-year'))
    this.root.dataset.light = String(events.includes('solstice') || events.includes('equinox'))
    this.root.dataset.seaDay = String(events.includes('ocean-day') || events.includes('whale-day'))
  }

  /**
   * A still sea: the scene's own motion paused (the drift, the twinkle, the
   * swimming), for anyone who wants a quiet screen without asking the whole
   * system for reduced motion. Taps still answer.
   */
  setStill(on: boolean): void {
    this.root.dataset.still = String(on)
    ticker.hold('still', on)
  }

  /** Nothing added yet: the small whale sleeps at the water line. */
  setEmpty(empty: boolean): void {
    this.root.dataset.empty = String(empty)
  }

  setQuiet(quiet: boolean): void {
    this.root.dataset.quiet = String(quiet)
  }

  /** A "not today" day: a light rain on the water and a warmer light. Nothing else changes. */
  setSoft(on: boolean): void {
    this.root.dataset.soft = String(on)
  }

  /**
   * Late at night: the scene a little darker and warmer, and the moon
   * answers a tap with "good night".
   */
  setLate(on: boolean, onMoon: () => void): void {
    this.root.dataset.late = String(on)
    const moon = this.query('.moon-hit')
    moon.hidden = !on
    moon.onclick = (event) => {
      event.stopPropagation()
      onMoon()
    }
  }

  /** Each thing's creature in its world, to pet. */
  setPets(specs: readonly PetSpec[], onPet: (id: string) => void): void {
    this.pets ??= new PetLayer(this.query('.pets'), (id) => {
      this.onPetTap?.(id)
    })
    this.onPetTap = onPet
    this.pets.set(specs)
  }

  /** A bottle at the water's edge, or none; a tap opens it. */
  setBottle(show: boolean, onOpen: () => void): void {
    const bottle = this.query('.bottle')
    bottle.hidden = !show
    bottle.onclick = (event) => {
      event.stopPropagation()
      onOpen()
    }
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
    this.thingsLayer.querySelector('.whale-ring')?.remove()
    const ring = document.createElement('div')
    ring.className = 'whale-ring'
    this.thingsLayer.append(ring)
    ring.addEventListener('animationend', () => ring.remove(), { once: true })
    this.glow()
    whale.addEventListener('animationend', () => whale.remove(), { once: true })
    const rect = this.root.getBoundingClientRect()
    this.burst('sea', rect.left + rect.width * 0.5, rect.top + rect.height * HORIZON)
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

  /** A find pops out where its stone was, is polished, and settles into its place. */
  private arrive(element: HTMLElement, from: { x: number; y: number }): void {
    if (reducedMotion()) {
      // Through the Web Animations API: the stylesheet's reduced-motion rule
      // cuts every CSS animation short, and this one fade should stay.
      element.animate([{ opacity: 0 }, { opacity: 1 }], {
        duration: FIND_FADE_MS,
        easing: 'cubic-bezier(0.23, 1, 0.32, 1)',
      })
      return
    }
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
    const scale = Math.min(Math.max(width / PHONE_WIDTH, 0.8), 2)
    this.root.style.setProperty('--scene-scale', scale.toFixed(3))
    this.stars.resize(this.skyLayer.clientWidth, this.skyLayer.clientHeight)
    this.particles.resize(width, height, HORIZON)
    this.lanterns.resize(this.lanternCanvas.clientWidth, this.lanternCanvas.clientHeight)
    this.renderStarHits()
  }

  private query(selector: string): HTMLElement {
    const element = this.root.querySelector<HTMLElement>(selector)
    if (!element) throw new Error(`scene is missing ${selector}`)
    return element
  }
}

/** Runs `work` when the main thread is idle, or soon after where there is no idle callback (Safari). */
function whenIdle(work: () => void): void {
  if ('requestIdleCallback' in window) requestIdleCallback(work, { timeout: 2000 })
  else setTimeout(work, 300)
}

function canvas(element: HTMLElement): HTMLCanvasElement {
  if (!(element instanceof HTMLCanvasElement)) throw new Error('not a canvas')
  return element
}
