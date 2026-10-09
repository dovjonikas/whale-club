/**
 * The one card above the row (src/app/notices.ts): the check-in and the
 * line for the day, the evening's good thing, the recap, a new chapter,
 * "name it?", the install card. Every one has the same parts in the same
 * places, so a person learns the card once:
 *
 *   [art] title                      the display face, one size
 *         lead                       quieter, under it
 *   body                             a field, or the line for the day
 *   note ................ actions    one row: a quiet note on the left,
 *                                    the actions on the right
 *
 * The actions keep one order everywhere: quiet words first, then a soft
 * pill, and the one bright primary at the edge, where the thumb is. A card
 * has one primary at most; a card that only acknowledges something ("ok")
 * ends on the soft pill. Padding, gaps, radius and edge are the card's
 * (src/styles/leaf.css), never the caller's.
 */
export type LeafActionKind = 'primary' | 'soft' | 'quiet'

export interface LeafAction {
  label: string
  /** What the button is, for its listener and the tests: `checkin-answer`, `good-keep`… */
  name: string
  kind: LeafActionKind
}

export interface LeafParts {
  title?: string
  lead?: string
  /** A name for the lead, when something else looks for it (`recap-line`). */
  leadClass?: string
  /** A drawing beside the title (a creature), already safe to insert. */
  art?: string
  /** Under the title: a field, or the day's line. Already safe to insert. */
  body?: string
  /** The footer's quiet words on the left: who said it, what tomorrow holds. Already safe. */
  note?: string
  actions: LeafAction[]
}

const ORDER: Record<LeafActionKind, number> = { quiet: 0, soft: 1, primary: 2 }

/** The card itself: an aside with its name for a screen reader. */
export function leafCard(label: string, kind: string): HTMLElement {
  const card = document.createElement('aside')
  card.className = `leaf ${kind}`
  card.setAttribute('aria-label', label)
  return card
}

/** The card's inside, in the one shape every card has. */
export function leafHtml(parts: LeafParts): string {
  const head =
    parts.title !== undefined || parts.lead !== undefined
      ? `<div class="leaf-head">${parts.art ? `<span class="leaf-art" aria-hidden="true">${parts.art}</span>` : ''}<div class="leaf-text">${
          parts.title !== undefined ? `<p class="leaf-title">${parts.title}</p>` : ''
        }${parts.lead !== undefined ? `<p class="leaf-lead${parts.leadClass ? ` ${parts.leadClass}` : ''}">${parts.lead}</p>` : ''}</div></div>`
      : ''
  const actions = [...parts.actions]
    .sort((a, b) => ORDER[a.kind] - ORDER[b.kind])
    .map(
      (action) =>
        `<button type="button" class="leaf-button is-${action.kind} ${action.name}">${action.label}</button>`,
    )
    .join('')
  const quiet = parts.actions.every((action) => action.kind === 'quiet')
  return `${head}${parts.body ?? ''}<div class="leaf-foot${quiet ? ' is-quiet' : ''}">${
    parts.note ? `<p class="leaf-note">${parts.note}</p>` : ''
  }<div class="leaf-actions">${actions}</div></div>`
}

/** Calls `then` when the named button is pressed. */
export function onAction(card: HTMLElement, name: string, then: () => void): void {
  card.querySelector(`.${name}`)?.addEventListener('click', then)
}
