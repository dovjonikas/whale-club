import { creatureSvg } from '../scene/creatures'
import type { Dot, Line, Stage } from '../store/derive'
import type { Thing } from '../store/types'
import { voice } from '../voice'

/** What a card shows: all of it derived, none of it stored. */
export interface CardView {
  done: boolean
  /** Done without the timer: a small hand instead of a check. */
  manual: boolean
  /** Minutes the timer saw today (lock-in things). */
  seen: number
  dots: readonly Dot[]
  stage: Stage
  line: Line
  /** Stones earned and waiting to be cracked. */
  waiting: number
}

/**
 * A card is one target: the whole card. Its kind shows at a glance: a tap
 * thing has an empty ring for its check; a lock-in thing shows its length
 * and a small timer ring that fills with the minutes seen today ("12/25 ·
 * finish" when it was started and not finished). The three dots open the
 * thing's sheet; in edit mode, and after a swipe to the left, a red
 * "delete" shows on the card.
 */
const RING = 2 * Math.PI * 9

export function createCard(thing: Thing): HTMLElement {
  const card = document.createElement('div')
  card.className = 'card'
  card.dataset.id = thing.id
  card.dataset.world = thing.world
  card.innerHTML = `
    <button type="button" class="card-main" data-world="${thing.world}">
      <span class="card-stone" hidden aria-hidden="true"></span>
      <span class="card-mark" aria-hidden="true">
        <svg class="mark-ring" viewBox="0 0 24 24">
          <circle class="mark-track" cx="12" cy="12" r="9"/>
          <circle class="mark-fill" cx="12" cy="12" r="9" stroke-dasharray="${RING.toFixed(2)}" stroke-dashoffset="${RING.toFixed(2)}"/>
          <path class="mark-clock" d="M12 8v4.4l2.8 1.7"/>
          <path class="mark-check" d="M7.5 12.5l3 3 6-6.5"/>
          <path class="mark-hand" d="M9 16.5v-5.5a1 1 0 0 1 2 0v3m0-4.5a1 1 0 0 1 2 0v4.5m0-3.5a1 1 0 0 1 2 0v3.5m0-2a1 1 0 0 1 2 0v2.5c0 2.2-1.6 3.5-3.6 3.5h-1.2c-1.3 0-2.3-.6-3-1.6"/>
        </svg>
      </span>
      <span class="creature"></span>
      <span class="card-name"></span>
      <span class="card-length"></span>
      <span class="dots" aria-hidden="true">${'<span class="dot"></span>'.repeat(7)}</span>
      <span class="visually-hidden card-days"></span>
    </button>
    <button type="button" class="card-edit">
      <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="6" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="18" cy="12" r="1.6"/></svg>
    </button>
    <button type="button" class="card-delete">${voice.edit.delete}</button>`
  return card
}

export function main(card: HTMLElement): HTMLButtonElement {
  const button = card.querySelector<HTMLButtonElement>('.card-main')
  if (!button) throw new Error('card without its button')
  return button
}

export function edit(card: HTMLElement): HTMLButtonElement {
  const button = card.querySelector<HTMLButtonElement>('.card-edit')
  if (!button) throw new Error('card without edit')
  return button
}

export function remove(card: HTMLElement): HTMLButtonElement {
  const button = card.querySelector<HTMLButtonElement>('.card-delete')
  if (!button) throw new Error('card without delete')
  return button
}

export function updateCard(card: HTMLElement, thing: Thing, view: CardView): void {
  const button = main(card)
  const name = card.querySelector('.card-name')
  if (name) {
    name.innerHTML = '<span class="card-emoji"></span><span class="card-word"></span>'
    const emoji = name.querySelector('.card-emoji')
    const word = name.querySelector('.card-word')
    if (emoji) emoji.textContent = `${thing.emoji} `
    if (word) word.textContent = thing.name
  }

  card.dataset.kind = thing.kind
  card.dataset.done = String(view.done)
  card.dataset.manual = String(view.manual)
  card.dataset.stage = String(view.stage)
  button.setAttribute('aria-label', thing.name)
  // A tap thing is a toggle; a lock-in card opens the dial, so it is a plain button.
  if (thing.kind === 'tap') button.setAttribute('aria-pressed', String(view.done))
  else button.removeAttribute('aria-pressed')
  edit(card).setAttribute('aria-label', voice.days.edit(thing.name))
  remove(card).setAttribute('aria-label', voice.edit.deleteThing(thing.name))

  const started = thing.kind === 'lockIn' && !view.done && view.seen > 0
  card.dataset.started = String(started)
  const length = card.querySelector('.card-length')
  if (length) {
    length.textContent =
      thing.kind === 'tap'
        ? ''
        : started
          ? voice.card.finish(Math.min(view.seen, thing.minutes), thing.minutes)
          : voice.card.length(thing.minutes)
  }
  const fill = card.querySelector('.mark-fill')
  const progress = thing.kind === 'tap' ? 0 : view.done ? 1 : Math.min(1, view.seen / thing.minutes)
  fill?.setAttribute('stroke-dashoffset', (RING * (1 - progress)).toFixed(2))

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
    const state = view.done
      ? voice.card.doneToday
      : thing.kind === 'lockIn'
        ? started
          ? voice.card.finish(view.seen, thing.minutes)
          : voice.card.length(thing.minutes)
        : ''
    days.textContent = [
      state,
      `${String(count)} of ${String(planned)} planned days this week`,
      view.waiting > 0 ? voice.stones.onCard : '',
    ]
      .filter(Boolean)
      .join(', ')
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
