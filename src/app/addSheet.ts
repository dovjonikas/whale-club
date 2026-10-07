import { glyph, LETTER } from '../brand/glyphs'
import { LINE } from '../brand/icons'
import type { Store } from '../store/store'
import { DEFAULT_MINUTES, EVERY_DAY, type Thing } from '../store/types'
import { voice } from '../voice'
import { daysField } from './daysField'
import { iconField } from './iconField'
import { kindField } from './kindField'
import { colorAt } from './sceneData'
import { openSheet } from './sheet'

/**
 * The add sheet: a name, its picture (picked from the name as it is typed,
 * or chosen), how it is done (tap when done, or lock in, and then how
 * long), and the days. Everything but the name is already answered when it
 * opens. From the first open's "start light" it also offers three small
 * things to begin with, one tap each.
 */
export function openAddSheet(
  store: Store,
  onAdded: (thing: Thing) => void,
  options: { starters?: boolean } = {},
): void {
  openSheet({
    title: voice.add.title,
    build(body, close) {
      const things = store.get().things
      const order = things.reduce((max, t) => Math.max(max, t.order + 1), 0)

      body.innerHTML = `
        <form class="add-form" novalidate>
          ${
            options.starters
              ? `<div class="field">
                  <span class="field-label" id="add-starters-label">${voice.add.starters}</span>
                  <div class="chips" role="group" aria-labelledby="add-starters-label">
                    ${voice.add.starterThings
                      .map(
                        (s, i) =>
                          `<button type="button" class="chip starter" data-starter="${String(i)}"><svg class="starter-glyph" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="${String(LINE)}" stroke-linecap="round" stroke-linejoin="round">${glyph(s.icon)?.svg ?? ''}</svg>${s.name}</button>`,
                      )
                      .join('')}
                  </div>
                </div>`
              : ''
          }
          <label class="field">
            <span class="field-label">${voice.add.name}</span>
            <input class="input" name="name" type="text" maxlength="24" autocomplete="off" enterkeyhint="done" placeholder="${voice.add.placeholder}" required />
          </label>
          <div class="icon-slot"></div>
          <div class="kind-slot"></div>
          <div class="days-slot"></div>
          <button type="submit" class="button-primary">${voice.add.button}</button>
        </form>`

      const form = body.querySelector<HTMLFormElement>('form')
      const nameInput = body.querySelector<HTMLInputElement>('input[name=name]')
      const kind = kindField({ kind: 'tap', minutes: DEFAULT_MINUTES })
      const picture = iconField({
        icon: LETTER,
        name: '',
        color: colorAt(order),
        kind: 'tap',
        auto: true,
      })
      body.querySelector('.icon-slot')?.replaceWith(picture.element)
      body.querySelector('.kind-slot')?.replaceWith(kind.element)
      const days = daysField([...EVERY_DAY])
      body.querySelector('.days-slot')?.replaceWith(days.element)
      if (!form || !nameInput) return

      nameInput.addEventListener('input', () => {
        picture.follow(nameInput.value)
      })
      body.querySelectorAll<HTMLButtonElement>('[data-starter]').forEach((chip) => {
        chip.addEventListener('click', () => {
          const starter = voice.add.starterThings[Number(chip.dataset.starter)]
          if (!starter) return
          nameInput.value = starter.name
          picture.set(starter.icon, starter.name)
          body.querySelectorAll<HTMLButtonElement>('[data-starter]').forEach((c) => {
            c.setAttribute('aria-pressed', String(c === chip))
          })
        })
      })

      form.addEventListener('submit', (event) => {
        event.preventDefault()
        const name = nameInput.value.trim()
        if (!name) {
          nameInput.focus()
          return
        }
        const thing = store.addThing({
          name,
          icon: picture.icon(),
          kind: kind.kind(),
          minutes: kind.minutes(),
          days: days.value(),
        })
        if (!thing) return
        close()
        onAdded(thing)
      })
    },
  })
}
