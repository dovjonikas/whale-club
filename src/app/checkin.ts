import { today as now } from '../store/clock'
import { addDays, todayKey } from '../store/dates'
import { missedYesterday, plannedThings, starDays } from '../store/derive'
import { MILESTONES } from '../store/paths'
import type { AppData, DateKey } from '../store/types'
import { GOOD_MAX } from '../store/types'
import { escapeHtml } from './thingMark'
import { leafCard, leafHtml, onAction } from './leaf'
import { swap } from './swap'
import type { Store } from '../store/store'
import { voice } from '../voice'
import { chapterDue } from './chapter'
import { dayLine, type DayLine } from './lines'
import { sayNotToday } from './notToday'
import type { NoticeBuilder } from './notices'
import type { Moment } from './postcard'
import { saidToday } from './said'
import { announce } from './toast'
import type { Sound } from './sound'

/** From this hour the check-in is an evening one, with its one good thing. */
export const EVENING_FROM = 18

/**
 * The daily check-in: call and response, two taps, the same shape every
 * day. A silly ritual rather than a question; the answers are the only
 * buttons. Answered once a day, kept in `days[date].checkin`. After it,
 * the line for the day (src/app/lines.ts), with "send this" for a postcard
 * of the whale and the line. Under the first answer, small, "not today":
 * a soft day (src/app/notToday.ts), with nothing more asked.
 */
export interface CheckinHandlers {
  onSend: (moment: Moment) => void
  /** "not today" was said; `heavy` when it is the third day in a row and may be named. */
  onNotToday: (heavy: boolean) => void
}

export function checkinNotice(store: Store, sound: Sound, on: CheckinHandlers): NoticeBuilder {
  return (dismiss) => {
    const today = todayKey()
    const data = store.get()
    if (data.things.length === 0 || data.days[today]?.checkin) return null

    const card = leafCard(voice.labels.checkin, 'checkin')
    const ask = (
      question: string,
      answer: string,
      then: () => void,
      notToday?: () => void,
    ): void => {
      const focused = card.contains(document.activeElement)
      swap(card, () => {
        draw(question, answer, then, focused, notToday)
      })
    }
    const draw = (
      question: string,
      answer: string,
      then: () => void,
      focused: boolean,
      notToday?: () => void,
    ): void => {
      card.innerHTML = leafHtml({
        title: question,
        actions: [
          ...(notToday
            ? [{ label: voice.notToday.button, name: 'checkin-not-today', kind: 'quiet' as const }]
            : []),
          { label: answer, name: 'checkin-answer', kind: 'primary' },
        ],
      })
      if (notToday) onAction(card, 'checkin-not-today', notToday)
      const button = card.querySelector<HTMLButtonElement>('.checkin-answer')
      // The next question comes a frame later, inside the swap: a quick second tap is not a second answer.
      let answered = false
      button?.addEventListener('click', () => {
        if (answered) return
        answered = true
        sound.play('checkin')
        then()
      })
      if (focused) button?.focus({ preventScroll: true })
    }
    const soft = (): void => {
      const { heavy } = sayNotToday(store, today)
      dismiss()
      on.onNotToday(heavy)
    }
    ask(
      voice.checkin.question1,
      voice.checkin.answer1,
      () => {
        ask(voice.checkin.question2, voice.checkin.answer2, () => {
          // Worked out before the answer is kept: a new chapter offered after
          // the check-in is seen coming while the day is still unchecked.
          const line = dayLine(today, spokenToday(store.get(), today))
          store.setCheckin(today)
          const showLine = (): void => {
            swap(card, () => {
              dayLineCard(card, line, on.onSend, dismiss)
            })
          }
          if (now().getHours() >= EVENING_FROM)
            swap(card, () => {
              evening(card, store, today, showLine)
            })
          else showLine()
        })
      },
      soft,
    )
    return card
  }
}

/**
 * The evening: after the two answers, one optional line, one good thing
 * about the day, and tomorrow's things to read, nothing to tap. The line
 * is kept for the day and shown only in the log; skipping is as good as
 * writing. Either way the line for the day comes next.
 */
export function evening(card: HTMLElement, store: Store, today: DateKey, then: () => void): void {
  store.setSettings({ goodAskedOn: today })
  const tomorrow = plannedThings(store.get(), addDays(today, 1))
  const ahead =
    tomorrow.length > 0
      ? voice.checkin.tomorrow(tomorrow.map((t) => t.name).join(', '))
      : voice.checkin.tomorrowRest
  card.innerHTML = leafHtml({
    body: `<label class="field good-field">
      <span class="leaf-title">${voice.checkin.good}</span>
      <input class="input good-input" type="text" maxlength="${String(GOOD_MAX)}" autocomplete="off" enterkeyhint="done" />
    </label>`,
    note: escapeHtml(ahead),
    actions: [
      { label: voice.checkin.skip, name: 'good-skip', kind: 'quiet' },
      { label: voice.checkin.keep, name: 'good-keep', kind: 'primary' },
    ],
  })
  const input = card.querySelector<HTMLInputElement>('.good-input')
  const keep = (): void => {
    if (input?.value.trim()) store.setGood(input.value, today)
    then()
  }
  onAction(card, 'good-keep', keep)
  input?.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') keep()
  })
  onAction(card, 'good-skip', then)
}

/**
 * The line for the day, quieter than the questions: the words, the name
 * of whoever said them if it was not the author (on the footer's left, so
 * the card is no taller for it), "send this" for a postcard of the whale
 * with the line, and "ok". It stays until one of the two: a line is there
 * to be read.
 */
function dayLineCard(
  card: HTMLElement,
  line: DayLine,
  onSend: (moment: Moment) => void,
  dismiss: () => void,
): void {
  const focused = card.contains(document.activeElement)
  card.innerHTML = leafHtml({
    body: `<p class="leaf-quote day-line">${line.text}</p>`,
    ...(line.by ? { note: `<span class="quote-by day-line-by">${line.by}</span>` } : {}),
    actions: [
      { label: voice.postcard.sendThis, name: 'day-line-send', kind: 'quiet' },
      { label: voice.labels.ok, name: 'day-line-ok', kind: 'soft' },
    ],
  })
  announce(line.by ? `${line.text} ${line.by}` : line.text)
  onAction(card, 'day-line-send', () => {
    onSend({ kind: 'whale', line: line.text, ...(line.by ? { by: line.by } : {}) })
    dismiss()
  })
  onAction(card, 'day-line-ok', dismiss)
  if (focused) card.querySelector<HTMLElement>('.day-line-ok')?.focus({ preventScroll: true })
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

/**
 * The evening's one good thing, asked on its own when the check-in was
 * answered earlier in the day: a small card after 18:00, once, with keep
 * and skip. So the bottles always have something to come back from.
 */
export function goodNotice(store: Store): NoticeBuilder {
  return (dismiss) => {
    const today = todayKey()
    const data = store.get()
    const day = data.days[today]
    if (now().getHours() < EVENING_FROM) return null
    if (!day?.checkin || day.good || data.settings.goodAskedOn === today) return null
    const card = leafCard(voice.checkin.good, 'checkin good-leaf')
    evening(card, store, today, dismiss)
    return card
  }
}
