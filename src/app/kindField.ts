import { DEFAULT_MINUTES, MAX_MINUTES, MIN_MINUTES, type Kind } from '../store/types'
import { voice } from '../voice'

/**
 * One question, two big answers, a line under each: "tap when done" or
 * "lock in". Only a lock-in asks how long, and the row of lengths appears
 * only then: four common ones and "other", which opens hours and minutes
 * for any length from five minutes to ten hours. Shared by the add sheet
 * and the thing's sheet.
 */
/** The lengths offered at a glance; "other" and the dial on the card reach the rest. */
const LENGTHS = [15, 25, 45, 60]

export interface KindField {
  element: HTMLElement
  kind: () => Kind
  minutes: () => number
}

/** Ids of their own, so a sheet still leaving never shares one with the next. */
let fieldCount = 0

export function kindField(start: { kind: Kind; minutes: number }): KindField {
  const n = String(++fieldCount)
  let kind = start.kind
  let minutes = start.minutes || DEFAULT_MINUTES
  let custom = !LENGTHS.includes(minutes)

  const element = document.createElement('div')
  element.className = 'field kind-field'
  element.innerHTML = `
    <span class="field-label" id="kind-label-${n}">${voice.kind.question}</span>
    <div class="kind-choices" role="group" aria-labelledby="kind-label-${n}">
      <button type="button" class="kind-choice" data-kind="tap">
        <span class="kind-title">${voice.kind.tap}</span>
        <span class="kind-line" id="kind-tap-line-${n}">${voice.kind.tapLine}</span>
      </button>
      <button type="button" class="kind-choice" data-kind="lockIn">
        <span class="kind-title">${voice.kind.lockIn}</span>
        <span class="kind-line" id="kind-lockIn-line-${n}">${voice.kind.lockInLine}</span>
      </button>
    </div>
    <div class="kind-length">
      <span class="field-label" id="length-label-${n}">${voice.kind.length}</span>
      <div class="chips" role="group" aria-labelledby="length-label-${n}">
        ${LENGTHS.map((m) => `<button type="button" class="chip" data-minutes="${String(m)}">${voice.card.length(m)}</button>`).join('')}
        <button type="button" class="chip" data-other>${voice.kind.other}</button>
      </div>
      <div class="length-other" hidden>
        <label class="length-part"><input class="input" name="hours" type="number" inputmode="numeric" min="0" max="10" step="1" /><span>${voice.kind.hours}</span></label>
        <label class="length-part"><input class="input" name="mins" type="number" inputmode="numeric" min="0" max="59" step="5" /><span>${voice.kind.minutes}</span></label>
      </div>
    </div>`

  const length = element.querySelector<HTMLElement>('.kind-length')
  const other = element.querySelector<HTMLElement>('.length-other')
  const hours = element.querySelector<HTMLInputElement>('input[name=hours]')
  const mins = element.querySelector<HTMLInputElement>('input[name=mins]')
  const fillOther = (): void => {
    if (hours) hours.value = String(Math.floor(minutes / 60))
    if (mins) mins.value = String(minutes % 60)
  }
  /** Hours and minutes typed in, kept to five-minute steps between five minutes and ten hours. */
  const readOther = (): void => {
    const total = Number(hours?.value ?? 0) * 60 + Number(mins?.value ?? 0)
    if (!Number.isFinite(total) || total <= 0) return
    minutes = Math.min(MAX_MINUTES, Math.max(MIN_MINUTES, Math.round(total / 5) * 5))
  }
  const show = (): void => {
    element.querySelectorAll<HTMLButtonElement>('[data-kind]').forEach((choice) => {
      // The accessible name is the title; the line under it describes it.
      choice.setAttribute('aria-pressed', String(choice.dataset.kind === kind))
    })
    element.querySelectorAll<HTMLButtonElement>('[data-minutes]').forEach((chip) => {
      chip.setAttribute('aria-pressed', String(!custom && Number(chip.dataset.minutes) === minutes))
    })
    element.querySelector('[data-other]')?.setAttribute('aria-pressed', String(custom))
    if (other) other.hidden = !custom
    if (length) length.hidden = kind !== 'lockIn'
  }
  element.querySelectorAll<HTMLButtonElement>('[data-kind]').forEach((choice) => {
    const title = choice.querySelector('.kind-title')?.textContent ?? ''
    // Named by its title; the line under it is its description, read after.
    choice.setAttribute('aria-label', title)
    const line = choice.querySelector('.kind-line')
    if (line?.id) choice.setAttribute('aria-describedby', line.id)
    choice.addEventListener('click', () => {
      kind = choice.dataset.kind === 'lockIn' ? 'lockIn' : 'tap'
      show()
    })
  })
  element.querySelectorAll<HTMLButtonElement>('[data-minutes]').forEach((chip) => {
    chip.addEventListener('click', () => {
      minutes = Number(chip.dataset.minutes)
      custom = false
      show()
    })
  })
  element.querySelector('[data-other]')?.addEventListener('click', () => {
    custom = true
    fillOther()
    show()
    hours?.focus()
  })
  hours?.addEventListener('input', readOther)
  mins?.addEventListener('input', readOther)
  if (custom) fillOther()
  show()
  return { element, kind: () => kind, minutes: () => minutes }
}
