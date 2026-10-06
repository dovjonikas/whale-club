import { creatureSvg } from '../scene/creatures'
import type { Line, Stage } from '../store/derive'
import type { Thing } from '../store/types'

/** What a card shows: all of it derived, none of it stored. */
export interface CardView {
  done: boolean
  dots: readonly boolean[]
  stage: Stage
  line: Line
}

export function createCard(thing: Thing): HTMLButtonElement {
  const card = document.createElement('button')
  card.type = 'button'
  card.className = 'card'
  card.dataset.id = thing.id
  card.dataset.world = thing.world
  card.innerHTML = `
    <span class="creature"></span>
    <span class="card-name"></span>
    <span class="card-mode"></span>
    <span class="dots" aria-hidden="true">${'<span class="dot"></span>'.repeat(7)}</span>
    <span class="visually-hidden card-days"></span>`
  return card
}

export function updateCard(card: HTMLButtonElement, thing: Thing, view: CardView): void {
  const name = card.querySelector('.card-name')
  if (name) name.textContent = `${thing.emoji} ${thing.name}`
  const mode = card.querySelector('.card-mode')
  if (mode) mode.textContent = thing.mode === 'timer' ? `${String(thing.minutes ?? 0)} min` : ''

  card.setAttribute('aria-label', thing.name)
  card.setAttribute('aria-pressed', String(view.done))
  card.dataset.stage = String(view.stage)

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
    dot.classList.toggle('is-on', view.dots[i] === true)
    dot.classList.toggle('is-today', i === 6)
  })
  const days = card.querySelector('.card-days')
  const count = view.dots.filter(Boolean).length
  if (days) days.textContent = `${String(count)} of the last 7 days`
}

/** Runs a one-shot CSS animation class, restartable mid-flight. */
export function animate(card: HTMLElement, className: string): void {
  card.classList.remove(className)
  // Forcing a reflow restarts the animation when the class comes straight back.
  card.getBoundingClientRect()
  card.classList.add(className)
  card.addEventListener('animationend', () => card.classList.remove(className), { once: true })
}
