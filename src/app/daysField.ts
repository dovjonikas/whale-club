import { firstDayOfWeek } from '../store/dates'
import { voice } from '../voice'

/** Ids of its own, so a sheet still leaving never shares one with the next. */
let fieldCount = 0

/**
 * The one line of planning: seven day chips from the week's first day, all
 * on unless the person turns some off. Used by the add sheet and the
 * thing's sheet. Returns the element and a reader for the current choice,
 * Monday first as the days are stored.
 */
export function daysField(initial: readonly boolean[]): {
  element: HTMLElement
  value: () => boolean[]
} {
  const days = [...initial]
  const id = `days-label-${String(++fieldCount)}`
  const field = document.createElement('div')
  field.className = 'field'
  field.innerHTML = `
    <span class="field-label" id="${id}">${voice.days.label}</span>
    <div class="day-chips" role="group" aria-labelledby="${id}">
      ${shownOrder()
        .map(
          (i) =>
            `<button type="button" class="day-chip" data-day="${String(i)}" aria-label="${voice.days.names[i] ?? ''}" aria-pressed="${String(days[i] ?? true)}">${voice.days.short[i] ?? ''}</button>`,
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

/**
 * The chips in the order the week is seen: Sunday first where the week
 * starts on Sunday. Each chip keeps its Monday-first index, the order the
 * days are stored in.
 */
function shownOrder(): number[] {
  const monday = [0, 1, 2, 3, 4, 5, 6]
  return firstDayOfWeek() === 0 ? [6, ...monday.slice(0, 6)] : monday
}
