import type { Store } from '../store/store'
import { DEFAULT_MINUTES, EVERY_DAY, type Thing } from '../store/types'
import { voice } from '../voice'
import { daysField } from './daysField'
import { kindField } from './kindField'
import { openSheet } from './sheet'

const EMOJI = ['🏃', '📚', '🧘', '💧', '✍️', '🎹', '🚴', '🧹', '🥦', '💻', '🌱', '🎨']

/**
 * The add sheet: a name, an emoji, how it is done (tap when done, or lock
 * in, and then how long), and the days. Everything but the name is already
 * answered when it opens. From the first open's "start light" it also
 * offers three small things to begin with, one tap each.
 */
export function openAddSheet(
  store: Store,
  onAdded: (thing: Thing) => void,
  options: { starters?: boolean } = {},
): void {
  openSheet({
    title: voice.add.title,
    build(body, close) {
      let emoji = EMOJI[0] ?? '•'

      body.innerHTML = `
        <form class="add-form" novalidate>
          ${
            options.starters
              ? `<div class="field">
                  <span class="field-label" id="add-starters-label">${voice.add.starters}</span>
                  <div class="chips" role="group" aria-labelledby="add-starters-label">
                    ${voice.add.starterThings.map((s, i) => `<button type="button" class="chip starter" data-starter="${String(i)}">${s.emoji} ${s.name}</button>`).join('')}
                  </div>
                </div>`
              : ''
          }
          <label class="field">
            <span class="field-label">${voice.add.name}</span>
            <input class="input" name="name" type="text" maxlength="24" autocomplete="off" enterkeyhint="done" placeholder="${voice.add.placeholder}" required />
          </label>
          <div class="field">
            <span class="field-label" id="add-emoji-label">${voice.add.emoji}</span>
            <div class="chips" role="group" aria-labelledby="add-emoji-label">
              ${EMOJI.map((e) => `<button type="button" class="chip chip-emoji" data-emoji="${e}" aria-pressed="${String(e === emoji)}">${e}</button>`).join('')}
              <input class="input chip-emoji-input" name="emoji" type="text" maxlength="4" aria-label="${voice.add.ownEmoji}" placeholder="…" />
            </div>
          </div>
          <div class="kind-slot"></div>
          <div class="days-slot"></div>
          <button type="submit" class="button-primary">${voice.add.button}</button>
        </form>`

      const form = body.querySelector<HTMLFormElement>('form')
      const nameInput = body.querySelector<HTMLInputElement>('input[name=name]')
      const emojiInput = body.querySelector<HTMLInputElement>('input[name=emoji]')
      const kind = kindField({ kind: 'tap', minutes: DEFAULT_MINUTES })
      body.querySelector('.kind-slot')?.replaceWith(kind.element)
      const days = daysField([...EVERY_DAY])
      body.querySelector('.days-slot')?.replaceWith(days.element)
      if (!form || !nameInput || !emojiInput) return

      const pickEmoji = (value: string): void => {
        emoji = value
        const chips = [...body.querySelectorAll<HTMLButtonElement>('[data-emoji]')]
        for (const chip of chips)
          chip.setAttribute('aria-pressed', String(chip.dataset.emoji === value))
        emojiInput.value = chips.some((chip) => chip.dataset.emoji === value) ? '' : value
      }

      body.querySelectorAll<HTMLButtonElement>('[data-emoji]').forEach((chip) => {
        chip.addEventListener('click', () => {
          pickEmoji(chip.dataset.emoji ?? emoji)
        })
      })
      emojiInput.addEventListener('input', () => {
        const own = emojiInput.value.trim()
        if (!own) return
        emoji = own
        body.querySelectorAll<HTMLButtonElement>('[data-emoji]').forEach((chip) => {
          chip.setAttribute('aria-pressed', 'false')
        })
      })
      body.querySelectorAll<HTMLButtonElement>('[data-starter]').forEach((chip) => {
        chip.addEventListener('click', () => {
          const starter = voice.add.starterThings[Number(chip.dataset.starter)]
          if (!starter) return
          nameInput.value = starter.name
          pickEmoji(starter.emoji)
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
          emoji,
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
