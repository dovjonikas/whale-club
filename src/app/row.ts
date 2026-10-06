import { last7, lineFor, stageFor, weekDots } from '../store/derive'
import { todayKey } from '../store/dates'
import type { AppData, Thing } from '../store/types'
import { MAX_THINGS } from '../store/types'
import { createCard, updateCard } from './card'
import { attachPress } from './press'

interface RowHandlers {
  onTap: (thing: Thing, card: HTMLButtonElement) => void
  onLongPress: (thing: Thing, card: HTMLButtonElement) => void
  onAdd: () => void
}

/**
 * The row of cards at the bottom. Cards are kept by id between renders so
 * a jump animation survives the redraw that the tap itself causes.
 */
export class Row {
  private readonly cards = new Map<string, HTMLButtonElement>()
  private readonly addCard: HTMLButtonElement

  constructor(
    private readonly container: HTMLElement,
    private readonly handlers: RowHandlers,
  ) {
    this.addCard = document.createElement('button')
    this.addCard.type = 'button'
    this.addCard.className = 'card card-add'
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
      let card = this.cards.get(thing.id)
      if (!card) {
        card = createCard(thing)
        const element = card
        attachPress(element, {
          onTap: () => {
            this.handlers.onTap(thing, element)
          },
          onLongPress: () => {
            this.handlers.onLongPress(thing, element)
          },
        })
        this.cards.set(thing.id, card)
      }
      updateCard(card, thing, {
        done: data.days[today]?.done.includes(thing.id) ?? false,
        dots: weekDots(data, thing.id, today),
        stage: stageFor(last7(data, thing.id, today)),
        line: lineFor(data, thing),
      })
      this.container.append(card)
    }

    for (const [id, card] of this.cards) {
      if (!seen.has(id)) {
        card.remove()
        this.cards.delete(id)
      }
    }

    if (things.length < MAX_THINGS) this.container.append(this.addCard)
    else this.addCard.remove()
  }

  card(id: string): HTMLButtonElement | undefined {
    return this.cards.get(id)
  }
}
