import { escapeHtml, thingMark } from './thingMark'
import { wornBy } from './dockData'
import { creatureSvg } from '../scene/creatures'
import { last7, lineFor, plannedOn, stageFor, waitingTiers, weekDots } from '../store/derive'
import { todayKey } from '../store/dates'
import type { AppData, Thing } from '../store/types'
import { MAX_THINGS } from '../store/types'
import { voice } from '../voice'
import { createCard, edit, main, remove, updateCard } from './card'

interface RowHandlers {
  /** A tap on a card outside edit mode: done for a tap thing, the dial for a lock-in. */
  onTap: (thing: Thing, card: HTMLElement) => void
  /** The thing's sheet: from its three dots, or a tap on its card in edit mode. */
  onEdit: (thing: Thing) => void
  onDelete: (thing: Thing, card: HTMLElement) => void
  onAlsoToday: (thing: Thing) => void
  onAdd: () => void
}

/** A swipe this far to the left, and mostly sideways, shows a card's delete. */
const SWIPE_PX = 36

/**
 * The row of cards at the bottom: only what is planned for today. Cards
 * share the width and shrink to fit a phone, so all of them and the add
 * button are on screen without a scroll. Cards are kept by id between
 * renders so a jump animation survives the redraw that the tap causes.
 *
 * Above it, a word: "edit". In edit mode every card shows a red "delete"
 * and a tap on a card opens its sheet; nothing is marked done; "done"
 * goes back. A swipe to the left on a card shows the same delete, as a
 * shortcut for hands that expect it; it is never the only way.
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
  private readonly editButton: HTMLButtonElement
  private open = false
  private editing = false

  constructor(
    private readonly container: HTMLElement,
    private readonly strip: HTMLElement,
    tools: HTMLElement,
    private readonly handlers: RowHandlers,
  ) {
    this.addCard = document.createElement('button')
    this.addCard.type = 'button'
    this.addCard.className = 'card-add'
    this.addCard.setAttribute('aria-label', voice.edit.add)
    this.addCard.textContent = '+'
    this.addCard.addEventListener('click', () => {
      this.handlers.onAdd()
    })

    this.editButton = document.createElement('button')
    this.editButton.type = 'button'
    this.editButton.className = 'row-edit'
    this.editButton.textContent = voice.edit.edit
    this.editButton.addEventListener('click', () => {
      this.setEditing(!this.editing)
    })
    tools.append(this.editButton)

    // A tap anywhere else puts a swiped card back.
    document.addEventListener('pointerdown', (event) => {
      if (!(event.target instanceof Element)) return
      for (const card of this.cards.values()) {
        if (card.dataset.swiped === 'true' && !card.contains(event.target))
          delete card.dataset.swiped
      }
    })
  }

  render(data: AppData): void {
    const today = todayKey()
    const things = [...data.things].sort((a, b) => a.order - b.order)
    const planned = things.filter((t) => plannedOn(data, t, today))
    const off = things.filter((t) => !plannedOn(data, t, today))
    const seen = new Set<string>()
    for (const thing of things) this.latest.set(thing.id, thing)
    const day = data.days[today]

    for (const thing of planned) {
      seen.add(thing.id)
      let card = this.cards.get(thing.id)
      if (!card) {
        card = createCard(thing)
        this.wire(card, thing.id)
        this.cards.set(thing.id, card)
      }
      updateCard(card, thing, {
        done: day?.done.includes(thing.id) ?? false,
        manual: day?.manual?.includes(thing.id) ?? false,
        seen: day?.minutes[thing.id] ?? 0,
        dots: weekDots(data, thing.id, today),
        stage: stageFor(last7(data, thing.id, today)),
        line: lineFor(data, thing),
        waiting: waitingTiers(data, thing.id).length,
        worn: wornBy(data, thing.id),
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
    // Nothing to edit: the word goes, and so does edit mode.
    this.editButton.hidden = things.length === 0
    if (things.length === 0 && this.editing) this.setEditing(false)

    this.renderStrip(data, off)
  }

  card(id: string): HTMLElement | undefined {
    return this.cards.get(id)
  }

  setEditing(on: boolean): void {
    this.editing = on
    this.container.dataset.editing = String(on)
    this.editButton.textContent = on ? voice.edit.done : voice.edit.edit
    this.editButton.setAttribute('aria-pressed', String(on))
    for (const card of this.cards.values()) delete card.dataset.swiped
  }

  private wire(card: HTMLElement, id: string): void {
    const current = (): Thing | undefined => this.latest.get(id)
    const button = main(card)
    let start: { x: number; y: number } | null = null
    let swiped = false
    button.addEventListener('pointerdown', (event) => {
      start = { x: event.clientX, y: event.clientY }
      swiped = false
    })
    button.addEventListener('pointermove', (event) => {
      if (!start || this.editing) return
      const dx = event.clientX - start.x
      const dy = event.clientY - start.y
      if (dx < -SWIPE_PX && Math.abs(dx) > 2 * Math.abs(dy)) {
        card.dataset.swiped = 'true'
        swiped = true
        start = null
      }
    })
    button.addEventListener('click', () => {
      const thing = current()
      // The click that ends a swipe is part of the swipe, not a tap.
      if (swiped || !thing) {
        swiped = false
        return
      }
      if (card.dataset.swiped === 'true') {
        delete card.dataset.swiped
        return
      }
      if (this.editing) this.handlers.onEdit(thing)
      else this.handlers.onTap(thing, card)
    })
    edit(card).addEventListener('click', () => {
      const thing = current()
      if (thing) this.handlers.onEdit(thing)
    })
    remove(card).addEventListener('click', () => {
      const thing = current()
      if (thing) this.handlers.onDelete(thing, card)
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
              <button type="button" class="not-today-name" aria-label="${escapeHtml(voice.days.edit(thing.name))}">${thingMark(thing)}${escapeHtml(thing.name)}</button>
              <button type="button" class="chip also-today" aria-label="${escapeHtml(`${voice.days.alsoToday}: ${thing.name}`)}">${voice.days.alsoToday}</button>
            </li>`,
          )
          .join('')}
      </ul>`
    this.strip.querySelector('.not-today-toggle')?.addEventListener('click', () => {
      this.open = !this.open
      this.renderStrip(data, off)
      // Drawn again, so the new toggle takes the focus the old one had.
      this.strip.querySelector<HTMLElement>('.not-today-toggle')?.focus({ preventScroll: true })
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
