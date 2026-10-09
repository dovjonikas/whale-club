import { menuRow } from './menuRow'
import { rulesHtml } from './rules'
import { noteSaid } from './said'
import { todayKey } from '../store/dates'
import { dayNumber, streak } from '../store/derive'
import type { Store } from '../store/store'
import { voice } from '../voice'
import { backupStale } from './settingsSheet'
import { openSheet } from './sheet'

/**
 * The menu is one screen: the club. Under its name, which day of the club
 * this is (and the run, when there is one); the way to the log, how it
 * works and the settings; the three rules, quieter, at reading size; and
 * the club's one line at the end, like a signature. When a backup is due,
 * one quiet line under the rows. Only the title wears the display face.
 */
export function openMenuSheet(
  store: Store,
  on: { onLog: () => void; onHow: () => void; onSettings: () => void; onDrift: () => void },
): void {
  // The month's dot on the menu button has been seen.
  const month = todayKey().slice(0, 7)
  if (store.get().settings.backupNudged !== month) store.setSettings({ backupNudged: month })
  openSheet({
    title: voice.labels.club,
    build(body, close) {
      noteSaid(voice.clubLine)
      const data = store.get()
      const today = todayKey()
      const day = dayNumber(data, today)
      const run = streak(data, today)
      body.innerHTML = `
        ${
          day > 0
            ? `<p class="club-day">${voice.share.caption(day)}${run > 1 ? ` · ${voice.labels.inARow(run)}` : ''}</p>`
            : ''
        }
        <div class="row-group">
          ${menuRow('menu-log', voice.log.title, 'star')}
          ${menuRow('menu-how', voice.howItWorks.title, 'tail')}
          ${menuRow('menu-settings', voice.settings.open, 'settings')}
        </div>
        <div class="row-group">${menuRow('menu-drift', voice.drift.open, 'moon')}</div>
        ${backupStale(data, today) ? `<p class="sheet-note row-note menu-backup">${voice.settings.backupDue}</p>` : ''}
        ${rulesHtml()}
        <p class="club-line">${voice.clubLine}</p>`
      body.querySelector('.menu-log')?.addEventListener('click', on.onLog)
      body.querySelector('.menu-how')?.addEventListener('click', on.onHow)
      body.querySelector('.menu-settings')?.addEventListener('click', on.onSettings)
      body.querySelector('.menu-drift')?.addEventListener('click', () => {
        close()
        on.onDrift()
      })
    },
  })
}
