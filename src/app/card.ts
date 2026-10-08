import { bubbleSvg, RING } from '../brand/bubble'
import { icon } from '../brand/icons'
import { dressedSvg } from '../scene/dock/wear'
import type { Dot, Line, Stage } from '../store/derive'
import type { Thing } from '../store/types'
import { voice } from '../voice'
import { lanternColor } from './sceneData'

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
  /** What its creature wears from the dock. */
  worn: readonly string[]
  /** Left alone for a while, its creature sleeps. */
  asleep: boolean
}

/**
 * A card is one target: the whole card. Its bubble, at the corner, is the
 * thing's mark (src/brand/bubble.ts): its picture in its colour, filled
 * when it is done today. A lock-in's bubble has a timer ring for a rim that
 * fills with the minutes seen today, and its length shows under the name
 * ("12/25 · finish" when it was started and not finished). The three dots
 * open the thing's sheet; in edit mode, and after a swipe to the left, a
 * red "delete" shows on the card.
 */
/** How long the signature's pop takes (bubble.css), so its class comes off when it is over. */
const POP_MS = 320

export function createCard(thing: Thing): HTMLElement {
  const card = document.createElement('div')
  card.className = 'card'
  card.dataset.id = thing.id
  card.dataset.world = thing.world
  card.innerHTML = `
    <button type="button" class="card-main" data-world="${thing.world}" aria-describedby="card-days-${thing.id}">
      <span class="card-stone" hidden aria-hidden="true"></span>
      <span class="card-mark" aria-hidden="true"></span>
      <span class="creature"></span>
      <span class="card-name"></span>
      <span class="card-after" hidden></span>
      <span class="card-length"></span>
      <span class="dots" aria-hidden="true">${'<span class="dot"></span>'.repeat(7)}</span>
      <span class="visually-hidden card-days" id="card-days-${thing.id}"></span>
    </button>
    <button type="button" class="card-edit">
      ${icon('more')}
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
  if (name) name.textContent = thing.name
  const color = lanternColor(thing)
  // One colour for a thing everywhere: its bubble, its lanterns, its log, and its card's glow.
  card.style.setProperty('--thing', color)

  card.dataset.kind = thing.kind
  card.dataset.done = String(view.done)
  card.dataset.manual = String(view.manual)
  card.dataset.stage = String(view.stage)
  // Woken by a done: a wave, once.
  if (card.dataset.asleep === 'true' && !view.asleep) animate(card, 'is-waking')
  card.dataset.asleep = String(view.asleep)
  button.setAttribute('aria-label', thing.name)
  // A tap thing is a toggle; a lock-in card opens the dial, so it is a plain button.
  if (thing.kind === 'tap') button.setAttribute('aria-pressed', String(view.done))
  else button.removeAttribute('aria-pressed')
  edit(card).setAttribute('aria-label', voice.days.edit(thing.name))
  remove(card).setAttribute('aria-label', voice.edit.deleteThing(thing.name))

  // After...: the moment of the day it comes after, small, under the name.
  const after = card.querySelector<HTMLElement>('.card-after')
  if (after) {
    after.hidden = thing.after === undefined
    after.textContent = thing.after === undefined ? '' : voice.after.card(thing.after)
  }

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
  const progress = thing.kind === 'tap' ? 0 : view.done ? 1 : Math.min(1, view.seen / thing.minutes)
  const mark = card.querySelector<HTMLElement>('.card-mark')
  if (mark) {
    // Drawn again only when what it shows changes; its state moves by the stylesheet.
    const key = [thing.icon, thing.name, color, thing.kind].join('|')
    const fresh = mark.dataset.key !== key
    if (fresh) {
      mark.innerHTML = bubbleSvg(
        { icon: thing.icon, name: thing.name, color, kind: thing.kind },
        { done: view.done, progress, manual: view.manual },
      )
      mark.dataset.key = key
    }
    const bubble = mark.querySelector<SVGElement>('.bubble')
    if (bubble) {
      const was = bubble.dataset.done === 'true'
      bubble.dataset.done = String(view.done)
      bubble.dataset.manual = String(view.manual)
      bubble
        .querySelector('.bubble-progress')
        ?.setAttribute('stroke-dashoffset', (RING * (1 - progress)).toFixed(2))
      if (!fresh && !was && view.done) pop(card)
    }
  }

  const stone = card.querySelector<HTMLElement>('.card-stone')
  if (stone) {
    stone.hidden = view.waiting === 0
    stone.textContent = view.waiting > 1 ? String(view.waiting) : ''
  }

  const creature = card.querySelector('.creature')
  const key = `${thing.world}-${view.line}-${String(view.stage)}-${view.worn.join('+')}`
  if (creature && creature.getAttribute('data-key') !== key) {
    const grew =
      creature.hasAttribute('data-key') && Number(creature.getAttribute('data-stage')) < view.stage
    creature.innerHTML = dressedSvg(thing.world, view.line, view.stage, view.worn)
    creature.setAttribute('data-key', key)
    creature.setAttribute('data-stage', String(view.stage))
    if (grew) animate(card, 'is-growing')
  }

  card.querySelectorAll('.dot').forEach((dot, i) => {
    dot.classList.toggle('is-on', view.dots[i] === 'done')
    dot.classList.toggle('is-rest', view.dots[i] === 'rest')
    dot.classList.toggle('is-quiet', view.dots[i] === 'quiet')
    dot.classList.toggle('is-none', view.dots[i] === 'none')
    dot.classList.toggle('is-today', i === 6)
  })
  const days = card.querySelector('.card-days')
  const count = view.dots.filter((d) => d === 'done').length
  const planned = view.dots.filter((d) => d !== 'rest' && d !== 'none').length
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

/**
 * Runs a one-shot CSS animation class, restartable mid-flight. The bubble's
 * own pop ends sooner and on its own clock, so its endings are not this
 * animation's end.
 */
export function animate(card: HTMLElement, className: string): void {
  card.classList.remove(className)
  // Reading layout restarts the animation when the class comes straight back.
  card.getBoundingClientRect()
  card.classList.add(className)
  const ended = (event: AnimationEvent): void => {
    if (event.animationName.startsWith('bubble-')) return
    card.classList.remove(className)
    card.removeEventListener('animationend', ended)
  }
  card.addEventListener('animationend', ended)
}

/** Done: the bubble's signature pops into three (bubble.css). */
function pop(card: HTMLElement): void {
  card.classList.remove('is-popping')
  card.getBoundingClientRect()
  card.classList.add('is-popping')
  window.setTimeout(() => {
    card.classList.remove('is-popping')
  }, POP_MS)
}
