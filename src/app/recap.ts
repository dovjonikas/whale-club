import { addDays, isSunday, lastKeys, todayKey, weekStart } from '../store/dates'
import { starDays } from '../store/derive'
import type { Store } from '../store/store'
import type { AppData, DateKey } from '../store/types'
import { voice } from '../voice'
import type { NoticeBuilder } from './notices'

/**
 * The weekly recap: "5/7." and one line, no graph. On a Sunday it is the
 * week so far; on any other day it is last week, the first time the app
 * opens in the new one. It never says what was missed. A week that
 * started before the first thing existed is not recapped: "2/7" for a
 * person who joined on Friday would be a lie.
 */
export interface Recap {
  week: DateKey
  count: number
}

export function recapFor(data: AppData, today: DateKey = todayKey()): Recap | null {
  const thisWeek = weekStart(today)
  const week = isSunday(today) ? thisWeek : addDays(thisWeek, -7)
  if (data.settings.lastRecapWeek === week) return null
  const first = data.things.map((t) => t.createdAt).sort()[0]
  if (first === undefined || first > week) return null
  const stars = new Set(starDays(data))
  const count = lastKeys(addDays(week, 6), 7).filter((d) => stars.has(d)).length
  return { week, count }
}

export function recapNotice(store: Store): NoticeBuilder {
  return (dismiss) => {
    const recap = recapFor(store.get())
    if (!recap) return null
    const card = document.createElement('aside')
    card.className = 'leaf recap'
    card.setAttribute('aria-label', 'weekly recap')
    card.innerHTML = `
      <div>
        <span class="leaf-title recap-count">${recap.count}/7.</span>
        <span class="recap-line">${recap.count >= 5 ? voice.weekGood : voice.weekBad}</span>
      </div>
      <div class="leaf-actions"><button type="button" class="button-quiet">ok</button></div>`
    card.querySelector('button')?.addEventListener('click', () => {
      store.setSettings({ lastRecapWeek: recap.week })
      dismiss()
    })
    return card
  }
}
