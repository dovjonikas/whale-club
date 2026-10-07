import { todayKey } from '../store/dates'
import { weekday } from '../store/derive'
import type { Store } from '../store/store'
import type { Thing } from '../store/types'
import { voice } from '../voice'
import { daysField } from './daysField'
import { openSheet } from './sheet'

/**
 * A thing's own sheet: its name, emoji and lock-in length, the seven day
 * chips, and today's exception, "not today" for a planned day or "also
 * today" for one that is off. Planning lives here and nowhere else, so the
 * first screen never has to show it.
 */
export function openThingSheet(store: Store, thing: Thing): void {
  openSheet({
    title: `${thing.emoji} ${thing.name}`,
    build(body, close) {
      const today = todayKey()
      const data = store.get()
      const day = data.days[today]
      // Today's exception goes against the weekday: off a planned day, or onto a free one.
      const usual = thing.days[weekday(today)] ?? true
      const changed = usual
        ? (day?.skip?.includes(thing.id) ?? false)
        : (day?.extra?.includes(thing.id) ?? false)

      body.innerHTML = `
        <form class="thing-form" novalidate>
          <label class="field">
            <span class="field-label">name</span>
            <input class="input" name="name" type="text" maxlength="24" autocomplete="off" />
          </label>
          <label class="field">
            <span class="field-label">emoji</span>
            <input class="input" name="emoji" type="text" maxlength="4" autocomplete="off" style="width: 88px" />
          </label>
          <label class="field">
            <span class="field-label">${voice.lockIn.minutes}</span>
            <input class="input" name="minutes" type="number" inputmode="numeric" min="10" max="120" step="5" style="width: 120px" />
          </label>
          <div class="days-slot"></div>
          <div class="field">
            <span class="field-label">${voice.days.today}</span>
            <div class="chips">
              <button type="button" class="chip today-chip" aria-pressed="${String(changed)}">${usual ? voice.days.notToday : voice.days.alsoToday}</button>
            </div>
          </div>
          <button type="submit" class="button-primary">${voice.days.save}</button>
        </form>`

      const form = body.querySelector<HTMLFormElement>('form')
      const name = body.querySelector<HTMLInputElement>('input[name=name]')
      const emoji = body.querySelector<HTMLInputElement>('input[name=emoji]')
      const minutes = body.querySelector<HTMLInputElement>('input[name=minutes]')
      const slot = body.querySelector<HTMLElement>('.days-slot')
      const todayChip = body.querySelector<HTMLButtonElement>('.today-chip')
      if (!form || !name || !emoji || !minutes || !slot || !todayChip) return
      name.value = thing.name
      emoji.value = thing.emoji
      minutes.value = String(thing.minutes)
      const days = daysField(thing.days)
      slot.replaceWith(days.element)

      // One chip for today's exception: it says what tapping it does, and stays pressed while it holds.
      todayChip.addEventListener('click', () => {
        const on = todayChip.getAttribute('aria-pressed') !== 'true'
        store.setToday(thing.id, on ? (usual ? 'skip' : 'extra') : null)
        todayChip.setAttribute('aria-pressed', String(on))
      })

      form.addEventListener('submit', (event) => {
        event.preventDefault()
        const length = Number(minutes.value)
        store.updateThing(thing.id, {
          name: name.value,
          emoji: emoji.value.trim() || thing.emoji,
          days: days.value(),
          ...(length >= 10 && length <= 120 ? { minutes: Math.round(length / 5) * 5 } : {}),
        })
        close()
      })
    },
  })
}
