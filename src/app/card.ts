import { creatureSvg } from '../scene/creatures'
import type { Dot, Line, Stage } from '../store/derive'
import type { Thing } from '../store/types'
import { voice } from '../voice'

/** What a card shows: all of it derived, none of it stored. */
export interface CardView {
  done: boolean
  dots: readonly Dot[]
  stage: Stage
  line: Line
  /** Stones earned and waiting to be cracked. */
  waiting: number
}

/**
 * A card is two buttons: the card itself, which marks today done (a tap,
 * as always), and "lock in" under it, which opens the dial. Nothing hides
 * behind a long press any more.
 */
export function createCard(thing: Thing): HTMLElement {
  const card = document.createElement('div')
  card.className = 'card'
  card.dataset.id = thing.id
  card.dataset.world = thing.world
  card.innerHTML = `
    <button type="button" class="card-main" data-world="${thing.world}">
      <span class="card-stone" hidden aria-hidden="true"></span>
      <span class="creature"></span>
      <span class="card-name"></span>
      <span class="card-mode"></span>
      <span class="dots" aria-hidden="true">${'<span class="dot"></span>'.repeat(7)}</span>
      <span class="visually-hidden card-days"></span>
    </button>
    <button type="button" class="card-edit">
      <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="6" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="18" cy="12" r="1.6"/></svg>
    </button>
    <button type="button" class="card-lock">
      <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="13" r="7"/><path d="M12 9v4l2.5 1.5M10 3h4"/></svg>
      <span>${voice.lockIn.button}</span>
    </button>`
  return card
}

export function main(card: HTMLElement): HTMLButtonElement {
  const button = card.querySelector<HTMLButtonElement>('.card-main')
  if (!button) throw new Error('card without its button')
  return button
}

export function lock(card: HTMLElement): HTMLButtonElement {
  const button = card.querySelector<HTMLButtonElement>('.card-lock')
  if (!button) throw new Error('card without lock in')
  return button
}

export function edit(card: HTMLElement): HTMLButtonElement {
  const button = card.querySelector<HTMLButtonElement>('.card-edit')
  if (!button) throw new Error('card without edit')
  return button
}

export function updateCard(card: HTMLElement, thing: Thing, view: CardView): void {
  const button = main(card)
  const name = card.querySelector('.card-name')
  if (name) name.textContent = `${thing.emoji} ${thing.name}`
  const mode = card.querySelector('.card-mode')
  if (mode) mode.textContent = thing.mode === 'timer' ? `${String(thing.minutes ?? 0)} min` : ''

  button.setAttribute('aria-label', thing.name)
  button.setAttribute('aria-pressed', String(view.done))
  card.dataset.done = String(view.done)
  card.dataset.stage = String(view.stage)
  lock(card).setAttribute('aria-label', `${voice.lockIn.button}: ${thing.name}`)
  edit(card).setAttribute('aria-label', voice.days.edit(thing.name))

  const stone = card.querySelector<HTMLElement>('.card-stone')
  if (stone) {
    stone.hidden = view.waiting === 0
    stone.textContent = view.waiting > 1 ? String(view.waiting) : ''
  }

  const creature = card.querySelector('.creature')
  const key = `${thing.world}-${view.line}-${String(view.stage)}`
  if (creature && creature.getAttribute('data-key') !== key) {
    const grew =
      creature.hasAttribute('data-key') && Number(creature.getAttribute('data-stage')) < view.stage
    creature.innerHTML = creatureSvg(thing.world, view.line, view.stage)
    creature.setAttribute('data-key', key)
    creature.setAttribute('data-stage', String(view.stage))
    if (grew) animate(card, 'is-growing')
  }

  card.querySelectorAll('.dot').forEach((dot, i) => {
    dot.classList.toggle('is-on', view.dots[i] === 'done')
    dot.classList.toggle('is-rest', view.dots[i] === 'rest')
    dot.classList.toggle('is-today', i === 6)
  })
  const days = card.querySelector('.card-days')
  const count = view.dots.filter((d) => d === 'done').length
  const planned = view.dots.filter((d) => d !== 'rest').length
  if (days) {
    days.textContent = `${String(count)} of ${String(planned)} planned days this week${view.waiting > 0 ? `, ${voice.stones.onCard}` : ''}`
  }
}

/** Runs a one-shot CSS animation class, restartable mid-flight. */
export function animate(card: HTMLElement, className: string): void {
  card.classList.remove(className)
  // Reading layout restarts the animation when the class comes straight back.
  card.getBoundingClientRect()
  card.classList.add(className)
  card.addEventListener('animationend', () => card.classList.remove(className), { once: true })
}
