import { creatureSvg } from '../scene/creatures'
import { last7, lineFor, plannedOn, stageFor, waitingTiers, weekDots } from '../store/derive'
import { todayKey } from '../store/dates'
import type { AppData, Thing } from '../store/types'
import { MAX_THINGS } from '../store/types'
import { voice } from '../voice'
import { createCard, edit, lock, main, updateCard } from './card'

interface RowHandlers {
  onTap: (thing: Thing, card: HTMLElement) => void
  onLockIn: (thing: Thing) => void
  onEdit: (thing: Thing) => void
  onAlsoToday: (thing: Thing) => void
  onAdd: () => void
}

/**
 * The row of cards at the bottom: only what is planned for today. Cards
 * share the width and shrink to fit a phone, so all of them and the add
 * button are on screen without a scroll. Cards are kept by id between
 * renders so a jump animation survives the redraw that the tap causes.
 *
 * Under it, the things not planned today fold into one thin strip, "not
 * today". Opened, it shows them dimmed: they cannot be marked done there,
 * but each can be added to today only ("also today").
 */
export class Row {
  private readonly cards = new Map<string, HTMLElement>()
  /** The latest copy of each thing, so a handler never acts on the one from the first render. */
  private readonly latest = new Map<string, Thing>()
  private readonly addCard: HTMLButtonElement
  private open = false

  constructor(
    private readonly container: HTMLElement,
    private readonly strip: HTMLElement,
    private readonly handlers: RowHandlers,
  ) {
    this.addCard = document.createElement('button')
    this.addCard.type = 'button'
    this.addCard.className = 'card-add'
    this.addCard.setAttribute('aria-label', 'Add a thing')
    this.addCard.textContent = '+'
    this.addCard.addEventListener('click', () => {
      this.handlers.onAdd()
    })
  }

  render(data: AppData): void {
    const today = todayKey()
    const things = [...data.things].sort((a, b) => a.order - b.order)
    const planned = things.filter((t) => plannedOn(data, t, today))
    const off = things.filter((t) => !plannedOn(data, t, today))
    const seen = new Set<string>()
    for (const thing of things) this.latest.set(thing.id, thing)

    for (const thing of planned) {
      seen.add(thing.id)
      let card = this.cards.get(thing.id)
      if (!card) {
        card = createCard(thing)
        this.wire(card, thing.id)
        this.cards.set(thing.id, card)
      }
      updateCard(card, thing, {
        done: data.days[today]?.done.includes(thing.id) ?? false,
        dots: weekDots(data, thing.id, today),
        stage: stageFor(last7(data, thing.id, today)),
        line: lineFor(data, thing),
        waiting: waitingTiers(data, thing.id).length,
      })
      this.container.append(card)
    }

    for (const [id, card] of this.cards) {
      if (!seen.has(id)) {
        card.remove()
        this.cards.delete(id)
      }
    }
    for (const id of this.latest.keys()) {
      if (!things.some((t) => t.id === id)) this.latest.delete(id)
    }

    this.container.dataset.count = String(planned.length)
    if (things.length < MAX_THINGS) this.container.append(this.addCard)
    else this.addCard.remove()

    this.renderStrip(data, off)
  }

  card(id: string): HTMLElement | undefined {
    return this.cards.get(id)
  }

  private wire(card: HTMLElement, id: string): void {
    const current = (): Thing | undefined => this.latest.get(id)
    main(card).addEventListener('click', () => {
      const thing = current()
      if (thing) this.handlers.onTap(thing, card)
    })
    lock(card).addEventListener('click', () => {
      const thing = current()
      if (thing) this.handlers.onLockIn(thing)
    })
    edit(card).addEventListener('click', () => {
      const thing = current()
      if (thing) this.handlers.onEdit(thing)
    })
  }

  private renderStrip(data: AppData, off: readonly Thing[]): void {
    this.strip.hidden = off.length === 0
    if (off.length === 0) {
      this.strip.replaceChildren()
      this.open = false
      return
    }
    const today = todayKey()
    this.strip.innerHTML = `
      <button type="button" class="not-today-toggle" aria-expanded="${String(this.open)}">
        <span>${voice.days.notToday}</span><span class="not-today-count">${String(off.length)}</span>
      </button>
      <ul class="not-today-list" ${this.open ? '' : 'hidden'}>
        ${off
          .map(
            (
              thing,
            ) => `<li class="not-today-item" data-id="${thing.id}" data-world="${thing.world}">
              <span class="not-today-creature">${creatureSvg(thing.world, lineFor(data, thing), stageFor(last7(data, thing.id, today)))}</span>
              <button type="button" class="not-today-name" aria-label="${voice.days.edit(thing.name)}">${thing.emoji} ${thing.name}</button>
              <button type="button" class="chip also-today" aria-label="${voice.days.alsoToday}: ${thing.name}">${voice.days.alsoToday}</button>
            </li>`,
          )
          .join('')}
      </ul>`
    this.strip.querySelector('.not-today-toggle')?.addEventListener('click', () => {
      this.open = !this.open
      this.renderStrip(data, off)
    })
    this.strip.querySelectorAll<HTMLElement>('.not-today-item').forEach((item) => {
      const thing = this.latest.get(item.dataset.id ?? '')
      if (!thing) return
      item.querySelector('.not-today-name')?.addEventListener('click', () => {
        this.handlers.onEdit(thing)
      })
      item.querySelector('.also-today')?.addEventListener('click', () => {
        this.handlers.onAlsoToday(thing)
      })
    })
  }
}
