import { todayKey } from '../store/dates'
import { dayNumber, streak } from '../store/derive'
import type { Store } from '../store/store'
import type { PostcardFormat } from '../store/types'
import { voice } from '../voice'
import { openSheet } from './sheet'

/**
 * The menu is one screen: the club. Three rules, one sentence about who
 * is in it, the day count with a small streak, and the postcard size.
 */
export function openMenuSheet(store: Store): void {
  openSheet({
    title: 'the club',
    build(body) {
      const data = store.get()
      const today = todayKey()
      const day = dayNumber(data, today)
      const run = streak(data, today)
      const format = data.settings.postcardFormat ?? 'story'
      body.innerHTML = `
        <ol class="rules">${voice.rules.map((rule) => `<li>${rule}</li>`).join('')}</ol>
        <p class="club-line">${voice.clubLine}</p>
        <p class="sheet-note">${
          day > 0 ? `${voice.share.caption(day)}${run > 1 ? ` · ${run} days in a row` : ''}` : ''
        }</p>
        <div class="field menu-format">
          <span class="field-label" id="menu-format-label">${voice.postcard.format}</span>
          <div class="chips" role="group" aria-labelledby="menu-format-label">
            ${(['story', 'square'] as const)
              .map(
                (f) =>
                  `<button type="button" class="chip" data-format="${f}" aria-pressed="${String(f === format)}">${voice.postcard[f]}</button>`,
              )
              .join('')}
          </div>
        </div>`
      const chips = body.querySelectorAll<HTMLButtonElement>('[data-format]')
      chips.forEach((chip) => {
        chip.addEventListener('click', () => {
          const chosen: PostcardFormat = chip.dataset.format === 'square' ? 'square' : 'story'
          store.setSettings({ postcardFormat: chosen })
          chips.forEach((c) => c.setAttribute('aria-pressed', String(c === chip)))
        })
      })
    },
  })
}
