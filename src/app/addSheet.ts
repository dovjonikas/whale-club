import type { Mode, Thing } from '../store/types'
import type { Store } from '../store/store'
import { openSheet } from './sheet'

const EMOJI = ['🏃', '🎻', '📚', '🧘', '💧', '✍️', '🎹', '🚴', '🧹', '🥦', '💻', '🌱']
const MINUTES = [15, 30, 60]

/**
 * The add sheet: a name, an emoji, tap or timer, and for a timer how long.
 * Everything but the name is already answered when it opens.
 */
export function openAddSheet(store: Store, onAdded: (thing: Thing) => void): void {
  openSheet({
    title: 'new homework',
    build(body, close) {
      let emoji = EMOJI[0] ?? '•'
      let mode: Mode = 'tap'
      let minutes = 30

      body.innerHTML = `
        <form class="add-form" novalidate>
          <label class="field">
            <span class="field-label">name</span>
            <input class="input" name="name" type="text" maxlength="24" autocomplete="off" placeholder="run" required />
          </label>
          <div class="field">
            <span class="field-label" id="add-emoji-label">emoji</span>
            <div class="chips" role="group" aria-labelledby="add-emoji-label">
              ${EMOJI.map((e) => `<button type="button" class="chip chip-emoji" data-emoji="${e}" aria-pressed="${String(e === emoji)}">${e}</button>`).join('')}
              <input class="input chip-emoji-input" name="emoji" type="text" maxlength="4" aria-label="your own emoji" placeholder="…" style="width: 64px" />
            </div>
          </div>
          <div class="field">
            <span class="field-label" id="add-mode-label">how</span>
            <div class="chips" role="group" aria-labelledby="add-mode-label">
              <button type="button" class="chip" data-mode="tap" aria-pressed="true">tap when done</button>
              <button type="button" class="chip" data-mode="timer" aria-pressed="false">timer</button>
            </div>
          </div>
          <div class="field minutes-field" hidden>
            <span class="field-label" id="add-minutes-label">minutes</span>
            <div class="chips" role="group" aria-labelledby="add-minutes-label">
              ${MINUTES.map((m) => `<button type="button" class="chip" data-minutes="${String(m)}" aria-pressed="${String(m === minutes)}">${String(m)}</button>`).join('')}
              <input class="input" name="custom" type="number" inputmode="numeric" min="1" max="600" aria-label="custom minutes" placeholder="20" style="width: 88px" />
            </div>
          </div>
          <button type="submit" class="button-primary">add</button>
          <p class="sheet-note">tap a card when it is done. hold it for a timer.</p>
        </form>`

      const form = body.querySelector<HTMLFormElement>('form')
      const nameInput = body.querySelector<HTMLInputElement>('input[name=name]')
      const emojiInput = body.querySelector<HTMLInputElement>('input[name=emoji]')
      const customInput = body.querySelector<HTMLInputElement>('input[name=custom]')
      const minutesField = body.querySelector<HTMLElement>('.minutes-field')
      if (!form || !nameInput || !emojiInput || !customInput || !minutesField) return

      const press = (selector: string, value: string): void => {
        body.querySelectorAll<HTMLButtonElement>(selector).forEach((chip) => {
          chip.setAttribute(
            'aria-pressed',
            String(
              chip.dataset.emoji === value ||
                chip.dataset.mode === value ||
                chip.dataset.minutes === value,
            ),
          )
        })
      }

      body.querySelectorAll<HTMLButtonElement>('[data-emoji]').forEach((chip) => {
        chip.addEventListener('click', () => {
          emoji = chip.dataset.emoji ?? emoji
          emojiInput.value = ''
          press('[data-emoji]', emoji)
        })
      })
      emojiInput.addEventListener('input', () => {
        if (emojiInput.value.trim()) {
          emoji = emojiInput.value.trim()
          press('[data-emoji]', '')
        }
      })
      body.querySelectorAll<HTMLButtonElement>('[data-mode]').forEach((chip) => {
        chip.addEventListener('click', () => {
          mode = chip.dataset.mode === 'timer' ? 'timer' : 'tap'
          press('[data-mode]', mode)
          minutesField.hidden = mode !== 'timer'
        })
      })
      body.querySelectorAll<HTMLButtonElement>('[data-minutes]').forEach((chip) => {
        chip.addEventListener('click', () => {
          minutes = Number(chip.dataset.minutes)
          customInput.value = ''
          press('[data-minutes]', String(minutes))
        })
      })
      customInput.addEventListener('input', () => {
        const n = Number(customInput.value)
        if (n > 0) {
          minutes = Math.round(n)
          press('[data-minutes]', '')
        }
      })

      form.addEventListener('submit', (event) => {
        event.preventDefault()
        const name = nameInput.value.trim()
        if (!name) {
          nameInput.focus()
          return
        }
        const input = mode === 'timer' ? { name, emoji, mode, minutes } : { name, emoji, mode }
        const thing = store.addThing(input)
        if (!thing) return
        close()
        onAdded(thing)
      })
    },
  })
}
