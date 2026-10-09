import { collectibleSvg } from '../scene/collectibles'
import { LEGENDARIES } from '../scene/legendary'
import { sleeperSvg } from '../scene/visitors'
import type { AppData } from '../store/types'
import { voice } from '../voice'
import { markNewsSeen, NEWS_VERSION, newsSeen } from './news'
import { openSheet } from './sheet'

/**
 * What's new: once, the first time the app opens after an update, one
 * sheet with a card for each new thing, its picture, one line, and "try
 * it", which goes straight there. A first open never shows it (the intro
 * is the welcome then); after that it is in how it works.
 */
export type NewsId = 'museum' | 'tide' | 'drift' | 'swim' | 'calm'

/** What each new thing's "try it" does, from the app (src/app/app.ts). */
export type NewsTries = Record<NewsId, () => void>

const ORDER: readonly NewsId[] = ['museum', 'tide', 'drift', 'swim', 'calm']

/** Seen already, or nothing to update from: a person with nothing yet has just arrived. */
export function newsDue(data: AppData): boolean {
  return data.things.length > 0 && !newsSeen()
}

/** A small picture for each: drawn from what the app already draws. */
function picture(id: NewsId): string {
  switch (id) {
    case 'museum':
      return LEGENDARIES[0] ? collectibleSvg(LEGENDARIES[0].find) : ''
    case 'swim':
      return sleeperSvg(true)
    case 'drift':
      return `<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M58 14a28 28 0 1 0 24 44 23 23 0 1 1-24-44Z" fill="var(--star-pale)"/><path d="M8 84 Q 25 74 42 84 T 76 84 T 110 84" fill="none" stroke="var(--glow)" stroke-width="5" stroke-linecap="round"/></svg>`
    case 'tide':
      return `<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M8 58 Q 25 44 42 58 T 76 58 T 110 58" fill="none" stroke="var(--glow)" stroke-width="6" stroke-linecap="round"/><path d="M8 74 Q 25 60 42 74 T 76 74 T 110 74" fill="none" stroke="var(--glow)" stroke-width="6" stroke-linecap="round" opacity="0.5"/><circle cx="70" cy="28" r="10" fill="var(--star-pale)"/></svg>`
    case 'calm':
      return `<svg viewBox="0 0 100 100" aria-hidden="true"><rect x="16" y="26" width="68" height="48" rx="12" fill="none" stroke="var(--glow)" stroke-width="6"/><path d="M30 44h28M30 58h18" stroke="var(--star-pale)" stroke-width="6" stroke-linecap="round"/></svg>`
  }
}

export function openWhatsNew(tries: NewsTries): void {
  markNewsSeen()
  openSheet({
    title: voice.news.title,
    build(body, close) {
      body.innerHTML = `
        <p class="club-day">${voice.news.lead(NEWS_VERSION)}</p>
        <ul class="news">${ORDER.map((id) => {
          const [title, line] = voice.news[id]
          return `<li class="news-item">
            <span class="news-art" aria-hidden="true">${picture(id)}</span>
            <span class="news-text"><span class="news-title">${title}</span><span class="news-line">${line}</span></span>
            <button type="button" class="leaf-button is-soft news-try" data-news="${id}" aria-label="${voice.news.tryIt}: ${title}">${voice.news.tryIt}</button>
          </li>`
        }).join('')}</ul>`
      body.querySelectorAll<HTMLButtonElement>('.news-try').forEach((button) => {
        button.addEventListener('click', () => {
          const id = button.dataset.news as NewsId | undefined
          close()
          if (id) tries[id]()
        })
      })
    },
  })
}
