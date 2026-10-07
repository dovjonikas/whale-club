import { icon } from '../brand/icons'
import { krillBalance } from '../store/krill'
import type { AppData, DateKey } from '../store/types'
import { voice } from '../voice'
import { goalOf } from './dockData'

/** How long a "+10" stays up before it fades: long enough to read, short enough to leave. */
const RISE_HOLD_MS = 900
/** Its fade out; --dur-sheet-out's feel, a little quicker. */
const RISE_OUT_MS = 400

/**
 * The krill chip under the title: a drawn krill and the balance, and under
 * it the one goal being saved for, as a line with how far there is to go.
 * Tapping it opens the dock. When the balance grows, a small "+10" rises
 * beside it and fades; under reduced motion it only fades.
 */
export class KrillChip {
  readonly root: HTMLElement
  private readonly chip: HTMLButtonElement
  private readonly count: HTMLElement
  private readonly goal: HTMLElement
  private readonly goalText: HTMLElement
  private readonly goalFill: HTMLElement
  private balance: number | null = null

  constructor(onOpen: () => void) {
    this.root = document.createElement('div')
    this.root.className = 'krill'
    this.root.innerHTML = `
      <button type="button" class="krill-chip">
        ${icon('krill', 'icon krill-icon')}
        <span class="krill-count"></span>
      </button>
      <p class="krill-goal" hidden>
        <span class="krill-goal-text"></span>
        <span class="krill-goal-bar" aria-hidden="true"><i></i></span>
      </p>`
    const find = (selector: string): HTMLElement => {
      const element = this.root.querySelector<HTMLElement>(selector)
      if (!element) throw new Error(`krill chip without ${selector}`)
      return element
    }
    const chip = this.root.querySelector<HTMLButtonElement>('.krill-chip')
    if (!chip) throw new Error('krill chip without its button')
    this.chip = chip
    this.count = find('.krill-count')
    this.goal = find('.krill-goal')
    this.goalText = find('.krill-goal-text')
    this.goalFill = find('.krill-goal-bar i')
    this.chip.addEventListener('click', onOpen)
  }

  /**
   * Shows the balance and the goal. A balance higher than the last one
   * shown rises as "+N"; the first render, and any fall (a purchase, a
   * done taken back), changes the number quietly.
   */
  render(data: AppData, today: DateKey): void {
    const balance = krillBalance(data, today)
    const before = this.balance
    this.balance = balance
    const text = balance.toLocaleString('en-US')
    if (this.count.textContent !== text) this.count.textContent = text
    this.chip.setAttribute('aria-label', voice.krill.label(balance))
    if (before !== null && balance > before) this.rise(balance - before)

    const goal = goalOf(data, today)
    this.goal.hidden = goal === null
    if (!goal) return
    this.goalText.textContent =
      goal.left === 0
        ? voice.krill.goalReady(goal.item.name)
        : voice.krill.goal(goal.left, goal.item.name)
    const share = goal.item.price === 0 ? 1 : 1 - goal.left / goal.item.price
    this.goalFill.style.transform = `scaleX(${share.toFixed(3)})`
    this.goal.dataset.ready = String(goal.left === 0)
  }

  /** A small "+N" beside the chip, up and gone. Transitions, so reduced motion keeps the fade alone. */
  rise(amount: number): void {
    const rise = document.createElement('span')
    rise.className = 'krill-rise'
    rise.setAttribute('aria-hidden', 'true')
    rise.textContent = voice.krill.gained(amount)
    this.chip.append(rise)
    // Two frames, so the start is painted before the transition is asked for.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => rise.classList.add('is-up'))
    })
    setTimeout(() => rise.classList.add('is-gone'), RISE_HOLD_MS)
    setTimeout(() => {
      rise.remove()
    }, RISE_HOLD_MS + RISE_OUT_MS)
  }
}
