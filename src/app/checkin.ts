import { today as now } from '../store/clock'
import { addDays, todayKey } from '../store/dates'
import { plannedThings } from '../store/derive'
import type { DateKey } from '../store/types'
import { GOOD_MAX } from '../store/types'
import { escapeHtml } from './thingMark'
import type { Store } from '../store/store'
import { voice } from '../voice'
import type { NoticeBuilder } from './notices'
import type { Sound } from './sound'

/** How long the thanks stays after the second answer before the leaf goes. */
const THANKS_MS = 1200

/** From this hour the check-in is an evening one, with its one good thing. */
const EVENING_FROM = 18

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
    card.setAttribute('aria-label', voice.labels.checkin)
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
        if (now().getHours() >= EVENING_FROM) {
          evening(card, store, today, dismiss)
          return
        }
        card.innerHTML = `<span class="leaf-title">${voice.checkin.after}</span>`
        setTimeout(dismiss, THANKS_MS)
      })
    })
    return card
  }
}

/**
 * The evening: after the two answers, one optional line, one good thing
 * about the day, and tomorrow's things to read, nothing to tap. The line
 * is kept for the day and shown only in the log; skipping is as good as
 * writing.
 */
function evening(card: HTMLElement, store: Store, today: DateKey, dismiss: () => void): void {
  const tomorrow = plannedThings(store.get(), addDays(today, 1))
  const ahead =
    tomorrow.length > 0
      ? voice.checkin.tomorrow(tomorrow.map((t) => t.name).join(', '))
      : voice.checkin.tomorrowRest
  card.innerHTML = `
    <label class="field good-field">
      <span class="leaf-title">${voice.checkin.good}</span>
      <input class="input good-input" type="text" maxlength="${String(GOOD_MAX)}" autocomplete="off" enterkeyhint="done" />
    </label>
    <p class="leaf-lead good-tomorrow">${escapeHtml(ahead)}</p>
    <div class="leaf-actions">
      <button type="button" class="button-primary good-keep">${voice.checkin.keep}</button>
      <button type="button" class="button-quiet good-skip">${voice.checkin.skip}</button>
    </div>`
  const input = card.querySelector<HTMLInputElement>('.good-input')
  const keep = (): void => {
    if (input?.value.trim()) store.setGood(input.value, today)
    dismiss()
  }
  card.querySelector('.good-keep')?.addEventListener('click', keep)
  input?.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') keep()
  })
  card.querySelector('.good-skip')?.addEventListener('click', dismiss)
}
