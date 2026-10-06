import { todayKey } from '../store/dates'
import { dayNumber, streak } from '../store/derive'
import type { Store } from '../store/store'
import { voice } from '../voice'
import { openSheet } from './sheet'

/**
 * The rules, and under them the two small numbers the app allows itself:
 * the day count and the streak. The streak is small on purpose; it is
 * never the headline and nothing happens when it ends.
 */
export function openRulesSheet(store: Store): void {
  openSheet({
    title: 'the rules',
    build(body) {
      const data = store.get()
      const today = todayKey()
      const day = dayNumber(data, today)
      const run = streak(data, today)
      body.innerHTML = `
        <ol class="rules">${voice.rules.map((rule) => `<li>${rule}</li>`).join('')}</ol>
        <p class="sheet-note rules-note">${
          day > 0
            ? `${voice.share.caption(day)}${run > 1 ? ` · ${run} days in a row` : ''}`
            : voice.collection.empty
        }</p>`
    },
  })
}
