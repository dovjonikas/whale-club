import { glyphFor } from '../brand/match'
import { todayKey } from '../store/dates'
import { weekday, withoutTimerLeft } from '../store/derive'
import type { Store } from '../store/store'
import type { Thing } from '../store/types'
import { voice } from '../voice'
import { daysField } from './daysField'
import { iconField } from './iconField'
import { kindField } from './kindField'
import { lanternColor } from './sceneData'
import { openSheet } from './sheet'

export interface ThingSheetHandlers {
  onDelete: (thing: Thing) => void
  /** Said under the row, for "not really". */
  onSay: (line: string) => void
}

/**
 * A thing's own sheet, from its three dots or from a tap in edit mode:
 * its name and picture, how it is done, its days, and today's exception
 * ("not today" for a planned day, "also today" for one that is off). A
 * lock-in thing also has "did it without the timer" (twice a week at
 * most) and, once done today, the way to take that back, since its card
 * never undoes on a tap. At the bottom, in red, "delete this thing".
 */
export function openThingSheet(store: Store, thing: Thing, on: ThingSheetHandlers): void {
  openSheet({
    title: thing.name,
    build(body, close) {
      const today = todayKey()
      const data = store.get()
      const day = data.days[today]
      const doneToday = day?.done.includes(thing.id) ?? false
      // Today's exception goes against the weekday: off a planned day, or onto a free one.
      const usual = thing.days[weekday(today)] ?? true
      const changed = usual
        ? (day?.skip?.includes(thing.id) ?? false)
        : (day?.extra?.includes(thing.id) ?? false)
      const left = withoutTimerLeft(data, today)

      body.innerHTML = `
        <form class="thing-form" novalidate>
          <label class="field">
            <span class="field-label">${voice.add.name}</span>
            <input class="input" name="name" type="text" maxlength="24" autocomplete="off" enterkeyhint="done" />
          </label>
          <div class="icon-slot"></div>
          <div class="kind-slot"></div>
          <div class="days-slot"></div>
          <div class="field">
            <span class="field-label">${voice.days.today}</span>
            <div class="chips">
              <button type="button" class="chip today-chip" aria-pressed="${String(changed)}">${usual ? voice.days.notToday : voice.days.alsoToday}</button>
            </div>
          </div>
          ${
            thing.kind === 'lockIn'
              ? `<div class="field without-field">
                  ${
                    doneToday
                      ? `<button type="button" class="button-quiet undo-today">${voice.without.undoToday}</button>`
                      : `<button type="button" class="button-quiet without-timer"${left > 0 ? '' : ' disabled'}>${voice.without.button}</button>
                         ${left > 0 ? '' : `<p class="sheet-note">${voice.without.used}</p>`}
                         <div class="without-ask" hidden>
                           <p class="without-question">${voice.without.question(thing.minutes)}</p>
                           <div class="chips">
                             <button type="button" class="chip without-yes">${voice.without.yes}</button>
                             <button type="button" class="chip without-no">${voice.without.no}</button>
                           </div>
                         </div>`
                  }
                </div>`
              : ''
          }
          <button type="submit" class="button-primary">${voice.days.save}</button>
          <button type="button" class="button-danger delete-thing">${voice.edit.deleteForGood}</button>
        </form>`

      const form = body.querySelector<HTMLFormElement>('form')
      const name = body.querySelector<HTMLInputElement>('input[name=name]')
      const todayChip = body.querySelector<HTMLButtonElement>('.today-chip')
      if (!form || !name || !todayChip) return
      name.value = thing.name
      // Its picture keeps following the name only if it still is the name's own.
      const picture = iconField({
        icon: thing.icon,
        name: thing.name,
        color: lanternColor(thing),
        kind: thing.kind,
        auto: thing.icon === glyphFor(thing.name),
      })
      body.querySelector('.icon-slot')?.replaceWith(picture.element)
      name.addEventListener('input', () => {
        picture.follow(name.value)
      })
      const kind = kindField({ kind: thing.kind, minutes: thing.minutes })
      body.querySelector('.kind-slot')?.replaceWith(kind.element)
      const days = daysField(thing.days)
      body.querySelector('.days-slot')?.replaceWith(days.element)

      // One chip for today's exception: it says what tapping it does, and stays pressed while it holds.
      todayChip.addEventListener('click', () => {
        const pressed = todayChip.getAttribute('aria-pressed') !== 'true'
        store.setToday(thing.id, pressed ? (usual ? 'skip' : 'extra') : null)
        todayChip.setAttribute('aria-pressed', String(pressed))
      })

      const ask = body.querySelector<HTMLElement>('.without-ask')
      body.querySelector('.without-timer')?.addEventListener('click', () => {
        if (ask) ask.hidden = false
        body.querySelector<HTMLElement>('.without-yes')?.focus()
      })
      body.querySelector('.without-yes')?.addEventListener('click', () => {
        store.doneWithoutTimer(thing.id)
        close()
      })
      body.querySelector('.without-no')?.addEventListener('click', () => {
        close()
        on.onSay(voice.without.noLine)
      })
      body.querySelector('.undo-today')?.addEventListener('click', () => {
        store.undoToday(thing.id)
        close()
      })
      body.querySelector('.delete-thing')?.addEventListener('click', () => {
        close()
        on.onDelete(thing)
      })

      form.addEventListener('submit', (event) => {
        event.preventDefault()
        store.updateThing(thing.id, {
          name: name.value,
          icon: picture.icon(),
          kind: kind.kind(),
          minutes: kind.minutes(),
          days: days.value(),
        })
        close()
      })
    },
  })
}
