import { today as now } from '../store/clock'
import { addDays, todayKey } from '../store/dates'
import { missedYesterday, plannedThings, starDays } from '../store/derive'
import { MILESTONES } from '../store/paths'
import type { AppData, DateKey } from '../store/types'
import { GOOD_MAX } from '../store/types'
import { escapeHtml } from './thingMark'
import type { Store } from '../store/store'
import { voice } from '../voice'
import { chapterDue } from './chapter'
import { dayLine, type DayLine } from './lines'
import type { NoticeBuilder } from './notices'
import type { Moment } from './postcard'
import { saidToday } from './said'
import { announce } from './toast'
import type { Sound } from './sound'

/** From this hour the check-in is an evening one, with its one good thing. */
const EVENING_FROM = 18

/**
 * The daily check-in: call and response, two taps, the same shape every
 * day. A silly ritual rather than a question; the answers are the only
 * buttons. Answered once a day, kept in `days[date].checkin`. After it,
 * the line for the day (src/app/lines.ts), with "send this" for a postcard
 * of the whale and the line.
 */
export function checkinNotice(
  store: Store,
  sound: Sound,
  onSend: (moment: Moment) => void,
): NoticeBuilder {
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
        // Worked out before the answer is kept: a new chapter offered after
        // the check-in is seen coming while the day is still unchecked.
        const line = dayLine(today, spokenToday(store.get(), today))
        store.setCheckin(today)
        const showLine = (): void => {
          dayLineCard(card, line, onSend, dismiss)
        }
        if (now().getHours() >= EVENING_FROM) evening(card, store, today, showLine)
        else showLine()
      })
    })
    return card
  }
}

/**
 * The evening: after the two answers, one optional line, one good thing
 * about the day, and tomorrow's things to read, nothing to tap. The line
 * is kept for the day and shown only in the log; skipping is as good as
 * writing. Either way the line for the day comes next.
 */
function evening(card: HTMLElement, store: Store, today: DateKey, then: () => void): void {
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
    then()
  }
  card.querySelector('.good-keep')?.addEventListener('click', keep)
  input?.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') keep()
  })
  card.querySelector('.good-skip')?.addEventListener('click', then)
}

/**
 * The line for the day, quieter than the questions: the words, the name
 * of whoever said them if it was not the author, "send this" for a
 * postcard of the whale with the line, and "ok". It stays until one of the
 * two: a line is there to be read.
 */
function dayLineCard(
  card: HTMLElement,
  line: DayLine,
  onSend: (moment: Moment) => void,
  dismiss: () => void,
): void {
  const focused = card.contains(document.activeElement)
  card.classList.add('is-line')
  card.innerHTML = `
    <div>
      <p class="day-line">${line.text}</p>
      ${line.by ? `<p class="day-line-by">${line.by}</p>` : ''}
    </div>
    <div class="leaf-actions">
      <button type="button" class="button-quiet day-line-send">${voice.postcard.sendThis}</button>
      <button type="button" class="button-quiet day-line-ok">${voice.labels.ok}</button>
    </div>`
  announce(line.by ? `${line.text} ${line.by}` : line.text)
  card.querySelector('.day-line-send')?.addEventListener('click', () => {
    onSend({ kind: 'whale', line: line.text, ...(line.by ? { by: line.by } : {}) })
    dismiss()
  })
  const ok = card.querySelector<HTMLButtonElement>('.day-line-ok')
  ok?.addEventListener('click', dismiss)
  if (focused) ok?.focus({ preventScroll: true })
}

/**
 * What a moment of today says or will say from the day's lines: a missed
 * day said at the start, a new chapter offered after the check-in, the
 * milestone today's first star would reach, and whatever was already said
 * (the recap's word, the club line, the timer's question).
 */
function spokenToday(data: AppData, today: DateKey): Set<string> {
  const spoken = saidToday(today)
  if (missedYesterday(data, today)) spoken.add(voice.missedDay)
  if (chapterDue(data, today)) spoken.add(voice.chapter.lead)
  const before = starDays(data).filter((date) => date !== today).length
  const next = MILESTONES.find((day) => day === before + 1)
  if (next !== undefined) spoken.add(voice.milestone(next))
  return spoken
}
