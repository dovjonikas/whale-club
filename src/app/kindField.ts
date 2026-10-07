import { DEFAULT_MINUTES, type Kind } from '../store/types'
import { voice } from '../voice'

/**
 * One question, two big answers, a line under each: "tap when done" or
 * "lock in". Only a lock-in asks how long, and the row of lengths appears
 * only then. Shared by the add sheet and the thing's sheet.
 */
/** The lengths offered; the dial on the card reaches every five minutes from 10 to 120. */
const LENGTHS = [15, 25, 45, 60]

export interface KindField {
  element: HTMLElement
  kind: () => Kind
  minutes: () => number
}

export function kindField(start: { kind: Kind; minutes: number }): KindField {
  let kind = start.kind
  let minutes = start.minutes || DEFAULT_MINUTES
  const lengths = LENGTHS.includes(minutes) ? LENGTHS : [...LENGTHS, minutes].sort((a, b) => a - b)

  const element = document.createElement('div')
  element.className = 'field kind-field'
  element.innerHTML = `
    <span class="field-label" id="kind-label">${voice.kind.question}</span>
    <div class="kind-choices" role="group" aria-labelledby="kind-label">
      <button type="button" class="kind-choice" data-kind="tap">
        <span class="kind-title">${voice.kind.tap}</span>
        <span class="kind-line">${voice.kind.tapLine}</span>
      </button>
      <button type="button" class="kind-choice" data-kind="lockIn">
        <span class="kind-title">${voice.kind.lockIn}</span>
        <span class="kind-line">${voice.kind.lockInLine}</span>
      </button>
    </div>
    <div class="kind-length">
      <span class="field-label" id="length-label">${voice.kind.length}</span>
      <div class="chips" role="group" aria-labelledby="length-label">
        ${lengths.map((m) => `<button type="button" class="chip" data-minutes="${String(m)}">${voice.card.length(m)}</button>`).join('')}
      </div>
    </div>`

  const length = element.querySelector<HTMLElement>('.kind-length')
  const show = (): void => {
    element.querySelectorAll<HTMLButtonElement>('[data-kind]').forEach((choice) => {
      // The accessible name is the title; the line under it describes it.
      choice.setAttribute('aria-pressed', String(choice.dataset.kind === kind))
    })
    element.querySelectorAll<HTMLButtonElement>('[data-minutes]').forEach((chip) => {
      chip.setAttribute('aria-pressed', String(Number(chip.dataset.minutes) === minutes))
    })
    if (length) length.hidden = kind !== 'lockIn'
  }
  element.querySelectorAll<HTMLButtonElement>('[data-kind]').forEach((choice) => {
    const title = choice.querySelector('.kind-title')?.textContent ?? ''
    choice.setAttribute('aria-label', title)
    choice.addEventListener('click', () => {
      kind = choice.dataset.kind === 'lockIn' ? 'lockIn' : 'tap'
      show()
    })
  })
  element.querySelectorAll<HTMLButtonElement>('[data-minutes]').forEach((chip) => {
    chip.addEventListener('click', () => {
      minutes = Number(chip.dataset.minutes)
      show()
    })
  })
  show()
  return { element, kind: () => kind, minutes: () => minutes }
}
