import { escapeHtml, thingMark } from './thingMark'
import { allQuiet } from '../store/quiet'
import { plannedThings } from '../store/derive'
import { icon } from '../brand/icons'
import { fromKey, todayKey, firstDayOfWeek } from '../store/dates'
import {
  addMonths,
  dayEntry,
  firstMonth,
  monthOf,
  monthSummary,
  weeksOf,
  type MonthKey,
} from '../store/log'
import type { Store } from '../store/store'
import type { AppData, DateKey } from '../store/types'
import { voice } from '../voice'
import { everyThing, lanternColor } from './sceneData'
import { openSheet } from './sheet'

/**
 * The log: the one view of what has been done. A month at a time, Monday
 * first, each day with its star, a dot for each lantern; above it the
 * month in one sentence. The title opens the year, twelve small months;
 * a day opens that day. No charts: the sky is the picture, this is the
 * record.
 */
type View =
  | { kind: 'month'; month: MonthKey }
  | { kind: 'year'; year: number }
  | { kind: 'day'; date: DateKey }

/** A day shows at most this many lantern dots; more is one dot and a plus. */
const DOTS_SHOWN = 3

export function openLogSheet(store: Store, at?: DateKey): void {
  openSheet({
    title: voice.log.title,
    build(body) {
      const today = todayKey()
      const thisMonth = monthOf(today)
      let view: View = at ? { kind: 'day', date: at } : { kind: 'month', month: thisMonth }

      const show = (next: View): void => {
        view = next
        render()
      }

      const render = (): void => {
        const data = store.get()
        const earliest = firstMonth(data, today)
        body.dataset.view = view.kind
        if (view.kind === 'month')
          body.innerHTML = monthHtml(view.month, earliest, thisMonth, today)
        else if (view.kind === 'year') body.innerHTML = yearHtml(view.year, earliest, thisMonth)
        else body.innerHTML = dayHtml(view.date)
        wire()
        body.querySelector<HTMLElement>('[data-focus]')?.focus()
      }

      const monthHtml = (
        month: MonthKey,
        earliest: MonthKey,
        last: MonthKey,
        now: DateKey,
      ): string => {
        const data = store.get()
        const summary = monthSummary(data, month)
        const things = everyThing(data)
        const color = (id: string): string => lanternColor(things.get(id))
        // What the month's dots are made of, for the legend under the calendar.
        let soft = false
        let faint = false
        let quiet = false
        const lit = new Set<string>()
        const weeks = weeksOf(month)
          .map((week) =>
            week
              .map((date) => {
                if (date === null) return '<span class="log-cell is-empty"></span>'
                const entry = dayEntry(data, date)
                const n = Number(date.slice(8))
                if (date > now)
                  return `<span class="log-cell is-future"><span class="log-num">${String(n)}</span></span>`
                // A day not over yet has no faint lanterns: its minutes may still finish.
                const shown = [
                  ...entry.sessions.map((s) => ({
                    id: s.id,
                    glow: s.left ? 'is-dim' : s.parts > 1 ? 'is-soft' : '',
                  })),
                  ...(date < now
                    ? entry.unfinished.map((u) => ({ id: u.id, glow: 'is-dim' }))
                    : []),
                ]
                for (const dot of shown) {
                  lit.add(dot.id)
                  if (dot.glow === 'is-soft') soft = true
                  if (dot.glow === 'is-dim') faint = true
                }
                const dots = shown
                  .slice(0, DOTS_SHOWN)
                  .map(
                    (d) =>
                      `<i style="--lantern:${color(d.id)}"${d.glow ? ` class="${d.glow}"` : ''}></i>`,
                  )
                  .join('')
                const more = shown.length > DOTS_SHOWN ? '<b>+</b>' : ''
                const quietDay = !entry.star && allQuiet(data, plannedThings(data, date), date, now)
                if (quietDay) quiet = true
                return `<button type="button" class="log-cell" data-date="${date}" data-star="${String(entry.star)}" data-quiet="${String(quietDay)}"${date === now ? ' data-today="true"' : ''} aria-label="${escapeHtml(
                  dayAria(
                    date,
                    entry.done.map((d) => d.name),
                    entry.sessions.length,
                  ),
                )}">
                  <span class="log-num">${String(n)}</span>
                  <span class="log-star" aria-hidden="true"></span>
                  <span class="log-dots" aria-hidden="true">${dots}${more}</span>
                </button>`
              })
              .join(''),
          )
          .join('')
        return `
          <div class="log-head">
            <button type="button" class="icon-button log-prev" aria-label="${voice.log.previous}"${month <= earliest ? ' disabled' : ''}>${CHEVRON_LEFT}</button>
            <button type="button" class="log-title" data-focus aria-label="${monthName(month)}, ${voice.log.year}">${monthName(month)}</button>
            <button type="button" class="icon-button log-next" aria-label="${voice.log.next}"${month >= last ? ' disabled' : ''}>${CHEVRON_RIGHT}</button>
          </div>
          <p class="log-summary">${voice.log.summary(summary.stars, summary.lanterns, summary.minutes)}</p>
          <div class="log-weekdays" aria-hidden="true">${weekdayLetters()
            .map((d) => `<span>${d}</span>`)
            .join('')}</div>
          <div class="log-grid">${weeks}</div>
          ${legendHtml(data, month, { soft, faint, lit, quiet })}`
      }

      const yearHtml = (year: number, earliest: MonthKey, last: MonthKey): string => {
        const data = store.get()
        const months = Array.from(
          { length: 12 },
          (_, i) => `${String(year)}-${String(i + 1).padStart(2, '0')}`,
        )
          .map((month) => {
            const open = month >= earliest && month <= last
            const dots = weeksOf(month)
              .flat()
              .map((date) =>
                date === null
                  ? '<i class="is-pad"></i>'
                  : `<i${dayEntry(data, date).star ? ' class="is-star"' : ''}></i>`,
              )
              .join('')
            const name = fromKey(`${month}-01`).toLocaleDateString('en-GB', { month: 'short' })
            return `<button type="button" class="log-month" data-month="${month}"${open ? '' : ' disabled'} aria-label="${monthName(month)}">
              <span class="log-month-name">${name}</span>
              <span class="log-month-dots" aria-hidden="true">${dots}</span>
            </button>`
          })
          .join('')
        const first = Number(earliest.slice(0, 4))
        const lastYear = Number(last.slice(0, 4))
        return `
          <div class="log-head">
            <button type="button" class="icon-button log-prev-year" aria-label="${voice.log.previousYear}"${year <= first ? ' disabled' : ''}>${CHEVRON_LEFT}</button>
            <span class="log-title" data-focus tabindex="-1">${String(year)}</span>
            <button type="button" class="icon-button log-next-year" aria-label="${voice.log.nextYear}"${year >= lastYear ? ' disabled' : ''}>${CHEVRON_RIGHT}</button>
          </div>
          <div class="log-year">${months}</div>`
      }

      const dayHtml = (date: DateKey): string => {
        const data = store.get()
        const entry = dayEntry(data, date)
        const things = everyThing(data)
        const color = (id: string): string => lanternColor(things.get(id))
        const items: string[] = []
        for (const d of entry.done)
          items.push(
            `<li class="log-done">${thingMark(d, { done: true, manual: d.manual })}${escapeHtml(d.name)}${d.manual ? ` · ${voice.log.without}` : ''}</li>`,
          )
        for (const x of entry.sessions)
          items.push(
            `<li class="log-session${x.left ? ' is-left' : x.parts > 1 ? ' is-soft' : ''}"><span class="log-lantern" style="--lantern:${color(x.id)}" aria-hidden="true"></span>${thingMark(x, { done: true })}${escapeHtml(x.name)} · ${voice.log.minutes(x.minutes)}${x.left ? ` · ${voice.log.left}` : x.parts > 1 ? ` · ${voice.log.inParts}` : ''}</li>`,
          )
        for (const u of entry.unfinished)
          items.push(
            `<li class="log-session is-left"><span class="log-lantern" style="--lantern:${color(u.id)}" aria-hidden="true"></span>${thingMark(u)}${escapeHtml(u.name)} · ${voice.log.unfinished(u.minutes)}</li>`,
          )
        if (entry.checkin) items.push(`<li class="log-checkin">${voice.log.checkin}</li>`)
        // The evening's one good thing: kept for the day, and only ever shown here.
        const good = data.days[date]?.good
        if (good)
          items.push(`<li class="log-good"><span>${voice.log.good}</span> ${escapeHtml(good)}</li>`)
        return `
          <div class="log-head">
            <button type="button" class="icon-button log-back" aria-label="${voice.log.back}">${CHEVRON_LEFT}</button>
            <span class="log-title" data-focus tabindex="-1">${dayName(date)}</span>
            <span class="log-head-gap"></span>
          </div>
          ${items.length > 0 ? `<ul class="log-day">${items.join('')}</ul>` : `<p class="log-nothing">${voice.log.nothing}</p>`}`
      }

      const wire = (): void => {
        const on = (selector: string, handler: () => void): void => {
          body.querySelector(selector)?.addEventListener('click', handler)
        }
        if (view.kind === 'month') {
          const month = view.month
          on('.log-prev', () => {
            show({ kind: 'month', month: addMonths(month, -1) })
          })
          on('.log-next', () => {
            show({ kind: 'month', month: addMonths(month, 1) })
          })
          on('.log-title', () => {
            show({ kind: 'year', year: Number(month.slice(0, 4)) })
          })
          body.querySelectorAll<HTMLButtonElement>('.log-cell[data-date]').forEach((cell) => {
            cell.addEventListener('click', () => {
              show({ kind: 'day', date: cell.dataset.date ?? today })
            })
          })
        } else if (view.kind === 'year') {
          const year = view.year
          on('.log-prev-year', () => {
            show({ kind: 'year', year: year - 1 })
          })
          on('.log-next-year', () => {
            show({ kind: 'year', year: year + 1 })
          })
          body.querySelectorAll<HTMLButtonElement>('.log-month').forEach((button) => {
            button.addEventListener('click', () => {
              show({ kind: 'month', month: button.dataset.month ?? thisMonth })
            })
          })
        } else {
          const date = view.date
          on('.log-back', () => {
            show({ kind: 'month', month: monthOf(date) })
          })
        }
      }

      render()
    },
  })
}

const CHEVRON_LEFT = icon('back')
const CHEVRON_RIGHT = icon('forward')

function monthName(month: MonthKey): string {
  return fromKey(`${month}-01`).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
}

function dayName(date: DateKey): string {
  return fromKey(date).toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}

function dayAria(date: DateKey, names: string[], lanterns: number): string {
  const what = [...names]
  if (lanterns > 0) what.push(voice.log.lanterns(lanterns))
  return what.length > 0 ? `${dayName(date)}: ${what.join(', ')}` : dayName(date)
}

/**
 * The log explains itself, always, in the scene's own words: a star is a
 * day something was done, a lantern is a lock-in finished. Under that,
 * each lock-in thing's bubble with its name, whose colour is its lanterns'
 * (only lock-ins make lanterns; a deleted thing only in a month that has
 * its lanterns), and a line for soft and faint lanterns when the month has
 * them.
 */
function legendHtml(
  data: AppData,
  month: MonthKey,
  seen: { soft: boolean; faint: boolean; lit: ReadonlySet<string>; quiet: boolean },
): string {
  const things = [
    ...data.things.filter((t) => t.kind === 'lockIn' || seen.lit.has(t.id)),
    ...(data.retired ?? []).filter((t) => seen.lit.has(t.id)),
  ].sort((a, b) => a.order - b.order)
  const colors = things
    .map((t) => `<span class="legend-thing">${thingMark(t)}${escapeHtml(t.name)}</span>`)
    .join('')
  return `<div class="log-legend" data-month="${month}">
    <p><span class="legend-star" aria-hidden="true">★</span>${voice.log.legendStar}</p>
    <p><span class="legend-lantern" aria-hidden="true"></span>${voice.log.legendLantern}</p>
    ${seen.soft ? `<p><span class="legend-lantern is-soft" aria-hidden="true"></span>${voice.log.legendSoft}</p>` : ''}
    ${seen.faint ? `<p><span class="legend-lantern is-dim" aria-hidden="true"></span>${voice.log.legendDim}</p>` : ''}
    ${seen.quiet ? `<p><span class="legend-moon" aria-hidden="true"></span>${voice.log.legendQuiet}</p>` : ''}
    ${colors ? `<div class="legend-colors">${colors}</div>` : ''}
  </div>`
}

/** The weekday letters over the month, starting on the week's first day. */
function weekdayLetters(): readonly string[] {
  const letters = voice.days.short
  return firstDayOfWeek() === 0 ? [...letters.slice(6), ...letters.slice(0, 6)] : letters
}
