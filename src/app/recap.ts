import { addDays, isLastDayOfWeek, lastKeys, todayKey, weekStart } from '../store/dates'
import { plannedThings, starDays } from '../store/derive'
import type { Store } from '../store/store'
import type { AppData, DateKey } from '../store/types'
import { voice } from '../voice'
import type { NoticeBuilder } from './notices'
import type { Moment } from './postcard'

/**
 * The weekly recap: "5/7." and one line, no graph. The days are the
 * planned ones, so a thing done three days a week is "3/3.", not "3/7.". On the week's last
 * day it is the week so far; on any other day it is last week, the first time the app
 * opens in the new one. It never says what was missed. A week that
 * started before the first thing existed is not recapped: "2/7" for a
 * person who joined on Friday would be a lie.
 */
export interface Recap {
  week: DateKey
  /** Planned days in the week that had a star. */
  count: number
  /** Days in the week with anything planned. A rest day is in neither number. */
  planned: number
}

export function recapFor(data: AppData, today: DateKey = todayKey()): Recap | null {
  const thisWeek = weekStart(today)
  const week = isLastDayOfWeek(today) ? thisWeek : addDays(thisWeek, -7)
  if (data.settings.lastRecapWeek === week) return null
  const first = data.things.map((t) => t.createdAt).sort()[0]
  if (first === undefined || first > week) return null
  const stars = new Set(starDays(data))
  const days = lastKeys(addDays(week, 6), 7).filter((d) => plannedThings(data, d).length > 0)
  if (days.length === 0) return null
  const count = days.filter((d) => stars.has(d)).length
  return { week, count, planned: days.length }
}

/**
 * The share of planned days that earns "a good week" in the recap. Kinder
 * than krill's good week (KRILL.goodWeekShare, 0.8, src/store/krill.ts) on
 * purpose: a kind word should come easier than a reward.
 */
const GOOD_WEEK_WORD = 0.7

export function recapNotice(store: Store, onSend: (moment: Moment) => void): NoticeBuilder {
  return (dismiss) => {
    const recap = recapFor(store.get())
    if (!recap) return null
    const weekLine = recap.count / recap.planned >= GOOD_WEEK_WORD ? voice.weekGood : voice.weekBad
    const card = document.createElement('aside')
    card.className = 'leaf recap'
    card.setAttribute('aria-label', voice.labels.recap)
    card.innerHTML = `
      <div>
        <span class="leaf-title recap-count">${recap.count}/${recap.planned}.</span>
        <span class="recap-line">${weekLine}</span>
      </div>
      <div class="leaf-actions">
        <button type="button" class="button-quiet recap-send">${voice.postcard.sendThis}</button>
        <button type="button" class="button-quiet recap-ok">${voice.labels.ok}</button>
      </div>`
    card.querySelector('.recap-send')?.addEventListener('click', () => {
      onSend({ kind: 'recap', line: `${recap.count}/${recap.planned}. ${weekLine}` })
    })
    card.querySelector('.recap-ok')?.addEventListener('click', () => {
      store.setSettings({ lastRecapWeek: recap.week })
      dismiss()
    })
    return card
  }
}
