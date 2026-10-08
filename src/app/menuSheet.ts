import { todayKey } from '../store/dates'
import { dayNumber, streak } from '../store/derive'
import type { Store } from '../store/store'
import { voice } from '../voice'
import { backupStale } from './settingsSheet'
import { openSheet } from './sheet'

/**
 * The menu is one screen: the club. The log, how it works and the
 * settings, three rules, one sentence about who is in it, and the day
 * count with a small streak. When a backup is due, one quiet line.
 */
export function openMenuSheet(
  store: Store,
  on: { onLog: () => void; onHow: () => void; onSettings: () => void },
): void {
  // The month's dot on the menu button has been seen.
  const month = todayKey().slice(0, 7)
  if (store.get().settings.backupNudged !== month) store.setSettings({ backupNudged: month })
  openSheet({
    title: 'the club',
    build(body) {
      const data = store.get()
      const today = todayKey()
      const day = dayNumber(data, today)
      const run = streak(data, today)
      body.innerHTML = `
        <button type="button" class="menu-row menu-log">${voice.log.title}</button>
        <button type="button" class="menu-row menu-how">${voice.howItWorks.title}</button>
        <button type="button" class="menu-row menu-settings">${voice.settings.open}</button>
        ${backupStale(data, today) ? `<p class="sheet-note menu-backup">${voice.settings.backupDue}</p>` : ''}
        <ol class="rules">${voice.rules.map((rule) => `<li>${rule}</li>`).join('')}</ol>
        <p class="club-line">${voice.clubLine}</p>
        <p class="sheet-note">${
          day > 0
            ? `${voice.share.caption(day)}${run > 1 ? ` · ${String(run)} days in a row` : ''}`
            : ''
        }</p>`
      body.querySelector('.menu-log')?.addEventListener('click', on.onLog)
      body.querySelector('.menu-how')?.addEventListener('click', on.onHow)
      body.querySelector('.menu-settings')?.addEventListener('click', on.onSettings)
    },
  })
}
