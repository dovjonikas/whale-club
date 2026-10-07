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
/** Taps on the version, close together, that open the lab. */
const LAB_TAPS = 5
const LAB_TAP_GAP_MS = 2500

export function openMenuSheet(
  store: Store,
  on: { onLab: () => void; onLog: () => void; onHow: () => void },
): void {
  openSheet({
    title: 'the club',
    build(body) {
      const data = store.get()
      const today = todayKey()
      const day = dayNumber(data, today)
      const run = streak(data, today)
      const format = data.settings.postcardFormat ?? 'story'
      body.innerHTML = `
        <button type="button" class="menu-row menu-log">${voice.log.title}</button>
        <button type="button" class="menu-row menu-how">${voice.howItWorks.title}</button>
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
        </div>
        <button type="button" class="menu-version" aria-label="${voice.lab.version(__APP_VERSION__)}">v${__APP_VERSION__}</button>`
      // Hidden on purpose: five quick taps on the version open the lab. No hint, no feedback.
      let taps = 0
      let lastTap = 0
      body.querySelector('.menu-version')?.addEventListener('click', (event) => {
        taps = event.timeStamp - lastTap < LAB_TAP_GAP_MS ? taps + 1 : 1
        lastTap = event.timeStamp
        if (taps >= LAB_TAPS) on.onLab()
      })
      body.querySelector('.menu-log')?.addEventListener('click', on.onLog)
      body.querySelector('.menu-how')?.addEventListener('click', on.onHow)
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
