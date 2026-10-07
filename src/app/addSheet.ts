import type { Store } from '../store/store'
import { DEFAULT_MINUTES, EVERY_DAY, type Thing } from '../store/types'
import { voice } from '../voice'
import { daysField } from './daysField'
import { openSheet } from './sheet'

const EMOJI = ['🏃', '📚', '🧘', '💧', '✍️', '🎹', '🚴', '🧹', '🥦', '💻', '🌱', '🎨']
/** The lengths offered when adding; the dial on the card reaches every 5 minutes from 10 to 120. */
const LENGTHS = [15, 30, 45, 60]

/**
 * The add sheet: a name, an emoji, the days, and how long a lock-in is.
 * Everything but the name is already answered when it opens. Every thing
 * can be tapped done or locked in, so there is no choice between the two.
 */
export function openAddSheet(store: Store, onAdded: (thing: Thing) => void): void {
  openSheet({
    title: voice.add.title,
    build(body, close) {
      let emoji = EMOJI[0] ?? '•'
      let minutes = DEFAULT_MINUTES

      body.innerHTML = `
        <form class="add-form" novalidate>
          <label class="field">
            <span class="field-label">${voice.add.name}</span>
            <input class="input" name="name" type="text" maxlength="24" autocomplete="off" enterkeyhint="done" placeholder="run" required />
          </label>
          <div class="field">
            <span class="field-label" id="add-emoji-label">${voice.add.emoji}</span>
            <div class="chips" role="group" aria-labelledby="add-emoji-label">
              ${EMOJI.map((e) => `<button type="button" class="chip chip-emoji" data-emoji="${e}" aria-pressed="${String(e === emoji)}">${e}</button>`).join('')}
              <input class="input chip-emoji-input" name="emoji" type="text" maxlength="4" aria-label="${voice.add.ownEmoji}" placeholder="…" />
            </div>
          </div>
          <div class="days-slot"></div>
          <div class="field">
            <span class="field-label" id="add-length-label">${voice.add.length}</span>
            <div class="chips" role="group" aria-labelledby="add-length-label">
              ${LENGTHS.map((m) => `<button type="button" class="chip" data-minutes="${String(m)}" aria-pressed="${String(m === minutes)}">${voice.add.minutes(m)}</button>`).join('')}
            </div>
          </div>
          <button type="submit" class="button-primary">${voice.add.button}</button>
        </form>`

      const form = body.querySelector<HTMLFormElement>('form')
      const nameInput = body.querySelector<HTMLInputElement>('input[name=name]')
      const emojiInput = body.querySelector<HTMLInputElement>('input[name=emoji]')
      const days = daysField([...EVERY_DAY])
      body.querySelector('.days-slot')?.replaceWith(days.element)
      if (!form || !nameInput || !emojiInput) return

      const press = (selector: string, matches: (chip: HTMLButtonElement) => boolean): void => {
        body.querySelectorAll<HTMLButtonElement>(selector).forEach((chip) => {
          chip.setAttribute('aria-pressed', String(matches(chip)))
        })
      }

      body.querySelectorAll<HTMLButtonElement>('[data-emoji]').forEach((chip) => {
        chip.addEventListener('click', () => {
          emoji = chip.dataset.emoji ?? emoji
          emojiInput.value = ''
          press('[data-emoji]', (c) => c.dataset.emoji === emoji)
        })
      })
      emojiInput.addEventListener('input', () => {
        const own = emojiInput.value.trim()
        if (!own) return
        emoji = own
        press('[data-emoji]', () => false)
      })
      body.querySelectorAll<HTMLButtonElement>('[data-minutes]').forEach((chip) => {
        chip.addEventListener('click', () => {
          minutes = Number(chip.dataset.minutes)
          press('[data-minutes]', (c) => c === chip)
        })
      })

      form.addEventListener('submit', (event) => {
        event.preventDefault()
        const name = nameInput.value.trim()
        if (!name) {
          nameInput.focus()
          return
        }
        const thing = store.addThing({ name, emoji, minutes, days: days.value() })
        if (!thing) return
        close()
        onAdded(thing)
      })
    },
  })
}
