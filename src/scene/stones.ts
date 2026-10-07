import type { World } from '../store/types'

/**
 * The stones: what a thing has earned arrives as a meteor stone that has
 * to be cracked open. A sea stone floats in the water, a sky stone hangs
 * as a dark speck with a glow, a garden stone lies on the shore. It waits
 * there, as long as it takes, and that is a reason to come back.
 *
 * Three taps crack it, each one shaking it and opening more of the glowing
 * cracks; holding it for a second does the same at once. Then it bursts:
 * shards, a flash, and `onCrack` hands over to the app, which brings the
 * find out of the light.
 */
export interface StoneSpec {
  key: string
  world: World
  /** Place in the scene, as fractions of its width and height. */
  x: number
  y: number
  label: string
}

const TAPS_TO_CRACK = 3
const HOLD_MS = 1000
const BURST_MS = 450

export class StoneLayer {
  private readonly stones = new Map<string, HTMLButtonElement>()
  private rendered = false

  constructor(
    private readonly layer: HTMLElement,
    private readonly onCrack: (key: string) => void,
  ) {}

  /** Draws the waiting stones. Ones that were not there before fall in, unless this is the first draw. */
  render(specs: readonly StoneSpec[]): string[] {
    const fresh: string[] = []
    const keep = new Set(specs.map((s) => s.key))
    for (const [key, element] of this.stones) {
      if (!keep.has(key) && !element.classList.contains('is-burst')) {
        element.remove()
        this.stones.delete(key)
      }
    }
    for (const spec of specs) {
      if (this.stones.has(spec.key)) continue
      const stone = this.create(spec)
      if (this.rendered) {
        stone.classList.add('is-falling')
        fresh.push(spec.key)
      }
      this.layer.append(stone)
      this.stones.set(spec.key, stone)
    }
    this.rendered = true
    return fresh
  }

  rect(key: string): DOMRect | undefined {
    return this.stones.get(key)?.getBoundingClientRect()
  }

  private create(spec: StoneSpec): HTMLButtonElement {
    const stone = document.createElement('button')
    stone.type = 'button'
    stone.className = 'stone'
    stone.dataset.key = spec.key
    stone.dataset.world = spec.world
    stone.style.left = `${(spec.x * 100).toFixed(2)}%`
    stone.style.top = `${(spec.y * 100).toFixed(2)}%`
    stone.setAttribute('aria-label', spec.label)
    stone.innerHTML = `
      <span class="stone-glow" aria-hidden="true"></span>
      <span class="stone-body">${stoneSvg()}</span>
      <span class="stone-flash" aria-hidden="true"></span>`

    let taps = 0
    let holdTimer = 0
    let held = false
    const crack = (): void => {
      if (stone.classList.contains('is-burst')) return
      stone.classList.add('is-c1', 'is-c2', 'is-c3', 'is-burst')
      stone.disabled = true
      setTimeout(() => {
        this.onCrack(spec.key)
      }, BURST_MS)
      setTimeout(() => {
        stone.remove()
        this.stones.delete(spec.key)
      }, BURST_MS + 500)
    }
    stone.addEventListener('click', () => {
      if (held) {
        held = false
        return
      }
      taps++
      stone.classList.add(`is-c${String(Math.min(taps, TAPS_TO_CRACK))}`)
      shake(stone)
      if (taps >= TAPS_TO_CRACK) crack()
    })
    stone.addEventListener('pointerdown', () => {
      clearTimeout(holdTimer)
      holdTimer = window.setTimeout(() => {
        held = true
        crack()
      }, HOLD_MS)
    })
    const cancel = (): void => {
      clearTimeout(holdTimer)
    }
    stone.addEventListener('pointerup', cancel)
    stone.addEventListener('pointerleave', cancel)
    stone.addEventListener('pointercancel', cancel)
    stone.addEventListener('contextmenu', (event) => {
      event.preventDefault()
    })
    return stone
  }
}

function shake(stone: HTMLElement): void {
  const body = stone.querySelector<HTMLElement>('.stone-body')
  if (!body) return
  body.classList.remove('is-shake')
  body.getBoundingClientRect()
  body.classList.add('is-shake')
}

/**
 * A rough dark rock with a warm core showing through three cracks, each
 * drawn as a stroke that a tap opens (stroke-dashoffset), and six shards
 * that fly when it bursts.
 */
function stoneSvg(): string {
  const shards = [
    ['M18 18 l10 -6 l4 10 z', -26, -30, -40],
    ['M34 12 l10 4 l-4 10 z', 22, -34, 50],
    ['M44 22 l8 8 l-10 4 z', 34, -6, 70],
    ['M12 30 l10 2 l-6 10 z', -32, 10, -60],
    ['M26 36 l10 2 l-4 8 z', -6, 30, 30],
    ['M40 34 l8 4 l-8 6 z', 26, 26, -40],
  ] as const
  return `<svg viewBox="0 0 60 50" aria-hidden="true">
    <defs>
      <radialGradient id="stone-core" r="60%">
        <stop offset="0" stop-color="#fff4d6"/>
        <stop offset="0.5" stop-color="#ffb46e"/>
        <stop offset="1" stop-color="#e65a3c" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <path class="stone-rock" d="M10 30 C 6 20, 14 10, 26 9 C 38 7, 52 13, 52 25 C 53 36, 44 44, 30 44 C 18 45, 12 39, 10 30 Z" fill="#4a4554" stroke="#8a8296" stroke-width="1.2"/>
    <path class="stone-rock" d="M16 16 C 22 11, 34 10, 42 14" stroke="#a49cb0" stroke-width="2" fill="none" stroke-linecap="round"/>
    <circle class="stone-rock" cx="38" cy="30" r="2.4" fill="#332f3b"/>
    <circle class="stone-rock" cx="22" cy="34" r="1.8" fill="#332f3b"/>
    <ellipse class="stone-core" cx="31" cy="27" rx="13" ry="10" fill="url(#stone-core)"/>
    <path class="crack crack-1" d="M30 10 l-3 8 l5 5 l-4 7" />
    <path class="crack crack-2" d="M51 24 l-9 2 l-4 6 l-7 1" />
    <path class="crack crack-3" d="M13 34 l9 -3 l5 4 l6 -2 l2 9" />
    ${shards.map(([d, x, y, r]) => `<path class="shard" d="${d}" fill="#5a5466" style="--sx:${String(x)}px;--sy:${String(y)}px;--sr:${String(r)}deg"/>`).join('')}
  </svg>`
}
