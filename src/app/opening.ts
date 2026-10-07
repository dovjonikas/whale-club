import { reducedMotion } from '../scene/ticker'
import { host } from './host'

/**
 * The end of a lock-in, told in order: the deep water goes back down and
 * the world comes up, then one by one what the session added. Each step
 * plays (with its animation), and after its time ends (in its final
 * state). A tap anywhere skips: every step left ends at once, so the screen
 * lands on exactly what it would have shown at the end. Nobody waits for
 * an animation.
 *
 * The current step is written to the frame as data-opening, which is how
 * the tests follow the order, and "done" once it is over.
 */
export interface OpeningStep {
  name: string
  ms: number
  play: () => void
  end: () => void
}

/** Under reduced motion each step is a short fade, not a movement. */
const REDUCED = 0.25

export class Opening {
  private index = -1
  private timer = 0
  private finished = false

  constructor(
    private readonly steps: readonly OpeningStep[],
    private readonly onDone: () => void,
  ) {}

  start(): void {
    this.next()
  }

  /** Lands on the end state now. */
  skip(): void {
    if (this.finished) return
    clearTimeout(this.timer)
    const frame = host()
    // Transitions already running jump to their end too.
    frame.dataset.instant = 'true'
    for (let i = Math.max(0, this.index); i < this.steps.length; i++) this.steps[i]?.end()
    this.index = this.steps.length
    this.done()
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        delete frame.dataset.instant
      })
    })
  }

  private next(): void {
    if (this.index >= 0) this.steps[this.index]?.end()
    this.index++
    const step = this.steps[this.index]
    if (!step) {
      this.done()
      return
    }
    host().dataset.opening = step.name
    step.play()
    const ms = reducedMotion() ? step.ms * REDUCED : step.ms
    this.timer = window.setTimeout(() => {
      this.next()
    }, ms)
  }

  private done(): void {
    if (this.finished) return
    this.finished = true
    host().dataset.opening = 'done'
    this.onDone()
  }
}
