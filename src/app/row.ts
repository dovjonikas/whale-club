import { last7, lineFor, stageFor, waitingTiers, weekDots } from '../store/derive'
import { todayKey } from '../store/dates'
import type { AppData, Thing } from '../store/types'
import { MAX_THINGS } from '../store/types'
import { createCard, lock, main, updateCard } from './card'

interface RowHandlers {
  onTap: (thing: Thing, card: HTMLElement) => void
  onLockIn: (thing: Thing) => void
  onAdd: () => void
}

/**
 * The row of cards at the bottom. Cards share the width and shrink to fit
 * a phone, so all five and the add button are on screen without a scroll.
 * Cards are kept by id between renders so a jump animation survives the
 * redraw that the tap itself causes.
 */
export class Row {
  private readonly cards = new Map<string, HTMLElement>()
  /** The latest copy of each thing, so a handler never acts on the one from the first render. */
  private readonly latest = new Map<string, Thing>()
  private readonly addCard: HTMLButtonElement

  constructor(
    private readonly container: HTMLElement,
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
    const seen = new Set<string>()

    for (const thing of things) {
      seen.add(thing.id)
      this.latest.set(thing.id, thing)
      let card = this.cards.get(thing.id)
      if (!card) {
        card = createCard(thing)
        const element = card
        const id = thing.id
        main(element).addEventListener('click', () => {
          const current = this.latest.get(id)
          if (current) this.handlers.onTap(current, element)
        })
        lock(element).addEventListener('click', () => {
          const current = this.latest.get(id)
          if (current) this.handlers.onLockIn(current)
        })
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
        this.latest.delete(id)
      }
    }

    this.container.dataset.count = String(things.length)
    if (things.length < MAX_THINGS) this.container.append(this.addCard)
    else this.addCard.remove()
  }

  card(id: string): HTMLElement | undefined {
    return this.cards.get(id)
  }
}
