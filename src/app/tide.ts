import { icon } from '../brand/icons'
import { collectibleSvg, collectiblesFor, type Collectible } from '../scene/collectibles'
import { fromKey, todayKey } from '../store/dates'
import { lineFor, reachedOn } from '../store/derive'
import type { MonthKey } from '../store/log'
import type { Store } from '../store/store'
import { lastMonth, songsIn, tideFor, type Tide, type Truth } from '../store/tide'
import type { AppData, DateKey } from '../store/types'
import { voice } from '../voice'
import { host } from './host'
import { leafCard, leafHtml, onAction } from './leaf'
import type { NoticeBuilder } from './notices'
import type { Moment } from './postcard'
import { escapeHtml } from './thingMark'

/**
 * The month's tide: in the first days of a month, a card offers the month
 * before "in a few lines", and the log keeps every past month's to watch
 * again. A short story over the scene, one sentence a card, moved by
 * "next" and "back" (and by a swipe or a tap on either side, as a
 * shortcut): the month's name, the days with a star, the lanterns, the best
 * week, the newest find, one true thing, the month's sea type, and a
 * postcard to keep it. Each part is there only when it is true
 * (src/store/tide.ts); none of it counts what was missed.
 */

/** The tide of last month is offered in the first week of a month, once. */
const OFFER_UNTIL_DAY = 7
/** A swipe this long, in px, turns a card; a shorter one is a tap. */
const SWIPE_PX = 40
/** Two humpback songs or more are worth saying. */
const SONGS_SAID = 2

const MONTH = new Intl.DateTimeFormat('en', { month: 'long' })
const WEEKDAY = new Intl.DateTimeFormat('en', { weekday: 'long' })
const DAY_MONTH = new Intl.DateTimeFormat('en', { day: 'numeric', month: 'short' })

/** "september": a month as the tide says it, lowercase like the rest of the voice. */
export function monthName(month: MonthKey): string {
  const [year, number] = month.split('-').map(Number)
  return MONTH.format(new Date(year ?? 1970, (number ?? 1) - 1, 1)).toLowerCase()
}

function weekdayName(weekday: number): string {
  // 2024-01-07 was a Sunday, weekday 0.
  return WEEKDAY.format(new Date(2024, 0, 7 + weekday))
}

export function tideNotice(store: Store, onWatch: (month: MonthKey) => void): NoticeBuilder {
  return (dismiss) => {
    const data = store.get()
    const today = todayKey()
    const thisMonth = today.slice(0, 7)
    if (data.things.length === 0 || data.settings.tideOffered === thisMonth) return null
    if (Number(today.slice(8, 10)) > OFFER_UNTIL_DAY) return null
    const month = lastMonth(today)
    if (!tideFor(data, month)) return null
    const name = voice.tide.offer(monthName(month))
    const card = leafCard(name, 'tide-leaf')
    card.innerHTML = leafHtml({
      title: name,
      lead: voice.tide.offerLead,
      actions: [
        { label: voice.tide.notNow, name: 'tide-later', kind: 'quiet' },
        { label: voice.tide.watch, name: 'tide-watch', kind: 'primary' },
      ],
    })
    const offered = (): void => {
      store.setSettings({ tideOffered: thisMonth })
      dismiss()
    }
    onAction(card, 'tide-later', offered)
    onAction(card, 'tide-watch', () => {
      offered()
      onWatch(month)
    })
    return card
  }
}

/** The month's newest find that has come out of its stone, and whose day it was. */
function newestFind(
  data: AppData,
  month: MonthKey,
): { item: Collectible; thing: string; day: number; date: DateKey } | undefined {
  let newest: { item: Collectible; thing: string; day: number; date: DateKey } | undefined
  for (const thing of data.things) {
    const cracked = data.cracked[thing.id] ?? 0
    for (const item of collectiblesFor(thing.world, lineFor(data, thing))) {
      if (item.days > cracked) continue
      const date = reachedOn(data, thing.id, item.days)
      if (date?.slice(0, 7) !== month) continue
      if (!newest || date >= newest.date) newest = { item, thing: thing.name, day: item.days, date }
    }
  }
  return newest
}

function truthLine(truth: Truth): string {
  switch (truth.kind) {
    case 'together':
      return voice.tide.together(truth.a, truth.b, truth.days)
    case 'weekday':
      return voice.tide.weekday(weekdayName(truth.weekday), truth.stars)
    case 'goods':
      return voice.tide.goods(truth.evenings)
    case 'longest':
      return voice.tide.longest(voice.log.minutes(truth.minutes))
  }
}

/** The story's cards, in order, each one sentence or two; a part that is not true is not there. */
function cardsFor(data: AppData, tide: Tide): string[] {
  const name = monthName(tide.month)
  const cards = [
    `<p class="tide-eyebrow">${tide.month.slice(0, 4)}</p>
      <p class="tide-big">${name}.</p>
      <p class="tide-line">${voice.tide.openLead}</p>`,
    `<p class="tide-number">${String(tide.stars)}</p>
      <p class="tide-line">${voice.tide.starsLine(tide.stars)}</p>`,
  ]
  if (tide.lanterns > 0) {
    const songs = songsIn(tide.minutes)
    cards.push(`<p class="tide-number">${String(tide.lanterns)}</p>
      <p class="tide-line">${voice.tide.lanternsLine(tide.lanterns, voice.log.minutes(tide.minutes))}</p>
      ${songs >= SONGS_SAID ? `<p class="tide-aside">${voice.tide.songs(songs)}</p>` : ''}`)
  }
  if (tide.bestWeek) {
    const { from, to, count, planned } = tide.bestWeek
    cards.push(`<p class="tide-eyebrow">${voice.tide.bestWeek}</p>
      <p class="tide-big">${DAY_MONTH.format(fromKey(from))} – ${DAY_MONTH.format(fromKey(to))}</p>
      <p class="tide-line">${voice.tide.bestWeekLine(count, planned)}</p>`)
  }
  const newest = newestFind(data, tide.month)
  if (newest)
    cards.push(`<span class="tide-art" aria-hidden="true">${collectibleSvg(newest.item)}</span>
      <p class="tide-eyebrow">${voice.tide.newest}</p>
      <p class="tide-big">${escapeHtml(newest.item.name)}</p>
      <p class="tide-line">${escapeHtml(voice.tide.newestLine(newest.thing, newest.day))}</p>`)
  if (tide.truth) cards.push(`<p class="tide-say">${escapeHtml(truthLine(tide.truth))}</p>`)
  const [type, typeLine] = voice.tide.types[tide.type]
  cards.push(`<p class="tide-eyebrow">${voice.tide.typeLead}</p>
      <p class="tide-big">${type}</p>
      <p class="tide-line">${typeLine}</p>`)
  cards.push(`<p class="tide-big">${voice.tide.keep}</p>
      <p class="tide-line">${voice.tide.keepLead}</p>`)
  return cards
}

/** The story, over the scene. `onSend` paints the last card's postcard. */
export function playTide(store: Store, month: MonthKey, onSend: (moment: Moment) => void): void {
  const data = store.get()
  const tide = tideFor(data, month)
  if (!tide || document.querySelector('.tide')) return
  const cards = cardsFor(data, tide)
  const app = document.getElementById('app')
  const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null
  // A sheet open under it (the log) is left as it is and gets its focus back after.
  const under = document.querySelector<HTMLElement>('.sheet.is-open')

  const screen = document.createElement('section')
  screen.className = 'tide'
  screen.setAttribute('role', 'dialog')
  screen.setAttribute('aria-modal', 'true')
  screen.setAttribute('aria-label', voice.tide.offer(monthName(month)))
  screen.innerHTML = `
    <div class="tide-water" aria-hidden="true"></div>
    <div class="tide-top">
      <div class="tide-bar" aria-hidden="true">${cards.map(() => '<i></i>').join('')}</div>
      <button type="button" class="icon-button tide-close" aria-label="${voice.tide.close}">${icon('close')}</button>
    </div>
    <div class="tide-stage" aria-live="polite"></div>
    <div class="tide-nav"></div>`
  const stage = screen.querySelector<HTMLElement>('.tide-stage')
  const nav = screen.querySelector<HTMLElement>('.tide-nav')
  const bars = [...screen.querySelectorAll<HTMLElement>('.tide-bar i')]
  if (!stage || !nav) return

  let index = 0
  const last = (): boolean => index === cards.length - 1

  const close = (): void => {
    document.removeEventListener('keydown', onKey, true)
    screen.classList.remove('is-open')
    screen.inert = true
    app?.removeAttribute('inert')
    app?.classList.remove('is-behind-tide')
    under?.removeAttribute('inert')
    under?.classList.remove('is-behind-tide')
    window.setTimeout(() => {
      screen.remove()
    }, 300)
    opener?.focus({ preventScroll: true })
  }

  const show = (to: number, focus = false): void => {
    index = Math.max(0, Math.min(cards.length - 1, to))
    stage.innerHTML = `<div class="tide-card">${cards[index] ?? ''}</div>`
    bars.forEach((bar, i) => bar.classList.toggle('is-on', i <= index))
    nav.innerHTML = last()
      ? `<button type="button" class="leaf-button is-quiet tide-done">${voice.tide.close}</button>
         <button type="button" class="leaf-button is-primary tide-send">${voice.tide.send}</button>`
      : `<button type="button" class="leaf-button is-quiet tide-back"${index === 0 ? ' hidden' : ''}>${voice.tide.back}</button>
         <button type="button" class="leaf-button is-soft tide-next">${voice.tide.next}</button>`
    nav.querySelector('.tide-back')?.addEventListener('click', () => {
      show(index - 1, true)
    })
    nav.querySelector('.tide-next')?.addEventListener('click', () => {
      show(index + 1, true)
    })
    nav.querySelector('.tide-done')?.addEventListener('click', close)
    nav.querySelector('.tide-send')?.addEventListener('click', () => {
      onSend({ kind: 'recap', line: voice.tide.postcard(monthName(month), tide.stars) })
      close()
    })
    const card = stage.querySelector('.tide-card')
    requestAnimationFrame(() => card?.classList.add('is-in'))
    if (focus)
      nav.querySelector<HTMLElement>('.tide-next, .tide-send')?.focus({ preventScroll: true })
  }

  // A swipe turns the card; a tap on the left third goes back, anywhere else on.
  let down: { x: number; id: number } | null = null
  stage.addEventListener('pointerdown', (event) => {
    down = { x: event.clientX, id: event.pointerId }
  })
  stage.addEventListener('pointerup', (event) => {
    if (event.pointerId !== down?.id) return
    const dx = event.clientX - down.x
    down = null
    if (dx <= -SWIPE_PX) show(index + 1)
    else if (dx >= SWIPE_PX) show(index - 1)
    else {
      const box = stage.getBoundingClientRect()
      show(event.clientX < box.left + box.width / 3 ? index - 1 : index + 1)
    }
  })
  stage.addEventListener('pointercancel', () => {
    down = null
  })

  // Caught before a sheet under it hears it: Escape closes the tide, not the log as well.
  const onKey = (event: KeyboardEvent): void => {
    if (event.key === 'Escape') {
      event.stopImmediatePropagation()
      close()
    } else if (event.key === 'ArrowRight') show(index + 1, true)
    else if (event.key === 'ArrowLeft') show(index - 1, true)
  }
  document.addEventListener('keydown', onKey, true)
  screen.querySelector('.tide-close')?.addEventListener('click', close)

  host().append(screen)
  app?.setAttribute('inert', '')
  app?.classList.add('is-behind-tide')
  under?.setAttribute('inert', '')
  under?.classList.add('is-behind-tide')
  show(0)
  requestAnimationFrame(() => {
    screen.classList.add('is-open')
    nav.querySelector<HTMLElement>('.tide-next')?.focus({ preventScroll: true })
  })
}
