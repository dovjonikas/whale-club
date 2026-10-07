import { todayKey } from '../store/dates'
import type { Store } from '../store/store'
import { voice } from '../voice'
import type { NoticeBuilder } from './notices'
import type { Sound } from './sound'

/**
 * The daily check-in: call and response, two taps, the same shape every
 * day. A silly ritual rather than a question; the answers are the only
 * buttons. Answered once a day, kept in `days[date].checkin`.
 */
export function checkinNotice(store: Store, sound: Sound): NoticeBuilder {
  return (dismiss) => {
    const today = todayKey()
    const data = store.get()
    if (data.things.length === 0 || data.days[today]?.checkin) return null

    const card = document.createElement('aside')
    card.className = 'leaf checkin'
    card.setAttribute('aria-label', 'check-in')
    const ask = (question: string, answer: string, then: () => void): void => {
      const focused = card.contains(document.activeElement)
      card.innerHTML = `<span class="leaf-title">${question}</span>
        <div class="leaf-actions"><button type="button" class="button-primary">${answer}</button></div>`
      const button = card.querySelector('button')
      button?.addEventListener('click', () => {
        sound.play('checkin')
        then()
      })
      if (focused) button?.focus({ preventScroll: true })
    }
    ask(voice.checkin.question1, voice.checkin.answer1, () => {
      ask(voice.checkin.question2, voice.checkin.answer2, () => {
        store.setCheckin(today)
        card.innerHTML = `<span class="leaf-title">${voice.checkin.after}</span>`
        setTimeout(dismiss, 1200)
      })
    })
    return card
  }
}
