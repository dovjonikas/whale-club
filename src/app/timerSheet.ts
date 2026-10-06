import type { Thing } from '../store/types'
import { openSheet } from './sheet'

const PRESETS = [15, 30, 60]

/** Pick how long, then start. The thing's own length is already selected. */
export function openTimerSheet(thing: Thing, onStart: (minutes: number) => void): void {
  openSheet({
    title: `${thing.emoji} ${thing.name}`,
    build(body, close) {
      let minutes = thing.minutes ?? 30
      body.innerHTML = `
        <div class="field">
          <span class="field-label" id="timer-minutes-label">minutes</span>
          <div class="chips" role="group" aria-labelledby="timer-minutes-label">
            ${PRESETS.map((m) => `<button type="button" class="chip" data-minutes="${String(m)}" aria-pressed="${String(m === minutes)}">${String(m)}</button>`).join('')}
            <input class="input" name="custom" type="number" inputmode="numeric" min="1" max="600" aria-label="custom minutes" placeholder="${String(minutes)}" style="width: 88px" />
          </div>
        </div>
        <button type="button" class="button-primary timer-start">start</button>`

      const custom = body.querySelector<HTMLInputElement>('input[name=custom]')
      const chips = body.querySelectorAll<HTMLButtonElement>('[data-minutes]')
      chips.forEach((chip) => {
        chip.addEventListener('click', () => {
          minutes = Number(chip.dataset.minutes)
          if (custom) custom.value = ''
          chips.forEach((c) => c.setAttribute('aria-pressed', String(c === chip)))
        })
      })
      custom?.addEventListener('input', () => {
        const n = Number(custom.value)
        if (n > 0) {
          minutes = Math.round(n)
          chips.forEach((c) => c.setAttribute('aria-pressed', 'false'))
        }
      })
      body.querySelector('.timer-start')?.addEventListener('click', () => {
        close()
        onStart(minutes)
      })
    },
  })
}
