import { leafCard, leafHtml, onAction } from './leaf'
import { noteSaid } from './said'
import { addDays, fromKey, todayKey, weekStart } from '../store/dates'
import { starDays } from '../store/derive'
import type { Store } from '../store/store'
import type { AppData, DateKey } from '../store/types'
import { voice } from '../voice'
import type { NoticeBuilder } from './notices'

/** A week with fewer stars than this is a quiet one. */
const QUIET_WEEK_STARS = 2

/**
 * A new chapter: after a quiet week (fewer than two stars in the seven days
 * before), the week's next first day (as set) or the first of a month offers to start the
 * week's dots fresh. Once each time; "not now" lets it go. The sky, the
 * finds, the krill and the log keep everything: only the dots begin again.
 */
export function chapterDue(data: AppData, today: DateKey = todayKey()): boolean {
  if (data.things.length === 0 || data.settings.chapterOffered === today) return false
  const first = data.things.map((t) => t.createdAt).sort()[0]
  // A whole week has to have gone by, or there is nothing to start again from.
  if (first === undefined || first > addDays(today, -7)) return false
  const date = fromKey(today)
  if (weekStart(today) !== today && date.getDate() !== 1) return false
  const stars = new Set(starDays(data))
  let count = 0
  for (let i = 1; i <= 7; i++) if (stars.has(addDays(today, -i))) count++
  return count < QUIET_WEEK_STARS
}

export function chapterNotice(store: Store): NoticeBuilder {
  return (dismiss) => {
    const today = todayKey()
    if (!chapterDue(store.get(), today)) return null
    noteSaid(voice.chapter.lead, today)
    const card = leafCard(voice.chapter.title, 'chapter')
    card.innerHTML = leafHtml({
      title: voice.chapter.title,
      lead: voice.chapter.lead,
      actions: [
        { label: voice.chapter.no, name: 'chapter-no', kind: 'quiet' },
        { label: voice.chapter.yes, name: 'chapter-yes', kind: 'primary' },
      ],
    })
    onAction(card, 'chapter-yes', () => {
      store.setSettings({ chapterFrom: today, chapterOffered: today })
      dismiss()
    })
    onAction(card, 'chapter-no', () => {
      store.setSettings({ chapterOffered: today })
      dismiss()
    })
    return card
  }
}
