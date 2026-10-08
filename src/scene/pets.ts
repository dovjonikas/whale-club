import type { Stage } from '../store/derive'
import type { Line, World } from '../store/types'
import { creatureSvg } from './creatures'
import { reducedMotion } from './ticker'

/**
 * Each thing's creature, small, in its own world: the sea's at the water,
 * the sky's low over the shore, the garden's on the sand. A tap pets it:
 * it comes a little closer, blinks, sends up a few bubbles. Nothing is
 * earned or counted. One asleep (on a quiet day, as on its card) wakes
 * and waves instead, and stays awake in the scene for the rest of the
 * visit. Under reduced motion a pet is a blink, nothing more.
 */
export interface PetSpec {
  id: string
  world: World
  line: Line
  stage: Stage
  asleep: boolean
  /** What a screen reader hears: "pet run". */
  label: string
}

/**
 * Where each world's creatures stay, as fractions of the scene: two to a
 * world at most, all above the line and the row's tools that cover the
 * lower scene on a phone. The sea's swim at the water line, at the sides.
 */
const LANES: Readonly<Record<World, readonly (readonly [number, number])[]>> = {
  sky: [
    [0.26, 0.46],
    [0.74, 0.46],
  ],
  garden: [
    [0.4, 0.585],
    [0.62, 0.585],
  ],
  sea: [
    [0.13, 0.592],
    [0.87, 0.592],
  ],
}

/** A blink: the eyes shut and open, through the Web Animations API so reduced motion keeps it. */
const BLINK_MS = 260
/** How long a pet's closeness and bubbles take (pets.css). */
const PET_MS = 1100
/** Bubbles that rise from a pet. */
const BUBBLES = 3

export class PetLayer {
  private readonly woken = new Set<string>()

  constructor(
    private readonly root: HTMLElement,
    private readonly onPet: (id: string) => void,
  ) {}

  set(specs: readonly PetSpec[]): void {
    const seen = new Set<string>()
    const index: Partial<Record<World, number>> = {}
    for (const spec of specs) {
      const i = index[spec.world] ?? 0
      index[spec.world] = i + 1
      const lane = LANES[spec.world][i]
      if (!lane) continue
      seen.add(spec.id)
      let button = this.root.querySelector<HTMLButtonElement>(`.pet[data-id="${spec.id}"]`)
      if (!button) {
        button = document.createElement('button')
        button.type = 'button'
        button.className = 'pet'
        button.dataset.id = spec.id
        const id = spec.id
        button.addEventListener('click', (event) => {
          // A pet is not a tap on the sky.
          event.stopPropagation()
          this.pet(id)
          this.onPet(id)
        })
        this.root.append(button)
      }
      const drawing = `${spec.world}:${spec.line}:${String(spec.stage)}`
      if (button.dataset.drawing !== drawing) {
        button.dataset.drawing = drawing
        button.innerHTML = `<span class="pet-art">${creatureSvg(spec.world, spec.line, spec.stage)}</span>`
      }
      button.dataset.world = spec.world
      button.dataset.asleep = String(spec.asleep && !this.woken.has(spec.id))
      button.setAttribute('aria-label', spec.label)
      button.style.setProperty('--x', String(lane[0]))
      button.style.setProperty('--y', String(lane[1]))
    }
    for (const button of this.root.querySelectorAll<HTMLElement>('.pet')) {
      if (!seen.has(button.dataset.id ?? '')) button.remove()
    }
  }

  /** The pet itself, or, for one asleep, the waking. */
  pet(id: string): void {
    const button = this.root.querySelector<HTMLElement>(`.pet[data-id="${id}"]`)
    if (!button) return
    const asleep = button.dataset.asleep === 'true'
    if (asleep) {
      this.woken.add(id)
      button.dataset.asleep = 'false'
    }
    const eyes = button.querySelector('.eyes')
    eyes?.animate(
      [{ transform: 'scaleY(1)' }, { transform: 'scaleY(0.1)' }, { transform: 'scaleY(1)' }],
      {
        duration: BLINK_MS,
        easing: 'ease-in-out',
      },
    )
    if (reducedMotion()) return
    const kind = asleep ? 'is-waking' : 'is-petted'
    button.classList.remove('is-waking', 'is-petted')
    // A reflow between, so a second pet replays the first.
    button.getBoundingClientRect()
    button.classList.add(kind)
    if (!asleep) {
      for (let i = 0; i < BUBBLES; i++) {
        const bubble = document.createElement('i')
        bubble.className = 'pet-bubble'
        bubble.style.setProperty('--i', String(i))
        button.append(bubble)
        bubble.addEventListener('animationend', () => bubble.remove(), { once: true })
      }
    }
    window.setTimeout(() => button.classList.remove(kind), PET_MS)
  }
}
