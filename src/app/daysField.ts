import { voice } from '../voice'

/**
 * The one line of planning: seven day chips, Monday first, all on unless
 * the person turns some off. Used by the add sheet and the thing's sheet.
 * Returns the element and a reader for the current choice.
 */
export function daysField(initial: readonly boolean[]): {
  element: HTMLElement
  value: () => boolean[]
} {
  const days = [...initial]
  const field = document.createElement('div')
  field.className = 'field'
  field.innerHTML = `
    <span class="field-label" id="days-label">${voice.days.label}</span>
    <div class="day-chips" role="group" aria-labelledby="days-label">
      ${voice.days.short
        .map(
          (letter, i) =>
            `<button type="button" class="day-chip" data-day="${String(i)}" aria-label="${voice.days.names[i] ?? ''}" aria-pressed="${String(days[i] ?? true)}">${letter}</button>`,
        )
        .join('')}
    </div>`
  field.querySelectorAll<HTMLButtonElement>('.day-chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      const i = Number(chip.dataset.day)
      days[i] = !(days[i] ?? true)
      chip.setAttribute('aria-pressed', String(days[i]))
    })
  })
  return { element: field, value: () => [...days] }
}
