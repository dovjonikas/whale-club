import { icon } from '../brand/icons'
import { escapeHtml, thingMark } from './thingMark'
import { collectibleSvg, collectiblesFor } from '../scene/collectibles'
import { creatureSvg } from '../scene/creatures'
import { rarityOf } from '../scene/rarity'
import { last7, lineFor, reachedOn, stageFor, starDays, totalDone } from '../store/derive'
import { pathLength, progressOf, reachesOf } from '../store/paths'
import { LEGENDARIES } from '../scene/legendary'
import type { AppData } from '../store/types'
import { todayKey, writtenDate } from '../store/dates'
import type { Store } from '../store/store'
import { voice } from '../voice'
import { caseButton, caseHtml, type MuseumCase } from './museum'
import { openSheet } from './sheet'
import { swap } from './swap'

/**
 * The museum (once the Collection): per thing, what has been found, what
 * is waiting as a stone, and what comes next. Locked items are silhouettes
 * with the real number of days to go, because an empty slot with a true
 * distance is what makes the next one worth reaching for
 * (RESEARCH-DOPAMINE, recommendation 5). A rare or legendary find carries
 * a small mark. A tap on anything found opens its case (src/app/museum.ts):
 * the find large, its plaque, when it came. No graphs.
 */
export function openCollectionSheet(store: Store, onArrange?: () => void): void {
  openSheet({
    title: voice.labels.collection,
    build(body, close) {
      const data = store.get()
      if (data.things.length === 0) {
        body.innerHTML = `<p class="sheet-note">${voice.collection.empty}</p>`
        return
      }
      const cases = new Map<string, MuseumCase>()
      const sheet = body.closest<HTMLElement>('.sheet')
      // Arranging lives here, one step in, so the first screen stays for today's things.
      const arrange = onArrange
        ? `<button type="button" class="button-quiet collection-arrange">${icon('chest')}<span>${voice.arrange.open}</span></button>`
        : ''
      const museumHtml = arrange + legendaryRow(data, cases) + thingSections(data, cases)

      /** The museum, back at the find it was left from, scrolled where it was. */
      const showMuseum = (from?: string, scroll = 0): void => {
        body.innerHTML = museumHtml
        body.querySelector('.collection-arrange')?.addEventListener('click', () => {
          close()
          onArrange?.()
        })
        body.querySelectorAll<HTMLButtonElement>('.tile-open').forEach((button) => {
          button.addEventListener('click', () => {
            showCase(button.dataset.find ?? '')
          })
        })
        if (sheet) sheet.scrollTop = scroll
        if (from)
          body
            .querySelector<HTMLElement>(`.tile-open[data-find="${from}"]`)
            ?.focus({ preventScroll: true })
      }

      const showCase = (id: string): void => {
        const found = cases.get(id)
        if (!found) return
        const scroll = sheet?.scrollTop ?? 0
        swap(body, () => {
          body.innerHTML = caseHtml(found)
          if (sheet) sheet.scrollTop = 0
          body.querySelector('.case-back')?.addEventListener('click', () => {
            swap(body, () => {
              showMuseum(id, scroll)
            })
          })
          body.querySelector<HTMLElement>('.case-name')?.focus({ preventScroll: true })
        })
      }

      showMuseum()
    },
  })
}

/** Each thing's ten and more: found, waiting as a stone, or still to come. */
function thingSections(data: AppData, cases: Map<string, MuseumCase>): string {
  const today = todayKey()
  return [...data.things]
    .sort((a, b) => a.order - b.order)
    .map((thing) => {
      const line = lineFor(data, thing)
      const total = totalDone(data, thing.id)
      const cracked = data.cracked[thing.id] ?? 0
      const stage = stageFor(last7(data, thing.id, today))
      let nextMarked = false
      const tiles = collectiblesFor(thing.world, line)
        .map((item) => {
          const earned = total >= item.days
          const found = earned && item.days <= cracked
          const isNext = !earned && !nextMarked
          if (isNext) nextMarked = true
          const came = found ? reachedOn(data, thing.id, item.days) : undefined
          const rarity = found ? rarityOf(item.id, came) : 'common'
          if (found && came)
            cases.set(item.id, {
              item,
              came: voice.museum.came(writtenDate(came), thing.name, item.days),
              rarity,
            })
          const state = found ? 'is-unlocked' : earned ? 'is-stone' : 'is-locked'
          const caption = found
            ? item.name
            : earned
              ? voice.stones.waiting
              : isNext
                ? voice.collection.next(item.days - total)
                : `day ${String(item.days)}`
          const mark =
            rarity === 'common'
              ? ''
              : `<span class="tile-rarity" data-rarity="${rarity}">${voice.stones[rarity]}</span>`
          const label = found
            ? `${item.name}, found${rarity === 'common' ? '' : `, ${voice.stones[rarity]}`}`
            : `${earned ? 'a stone' : voice.collection.locked}, ${caption}`
          return `<li class="tile ${state} ${isNext ? 'is-next' : ''}" data-rarity="${rarity}" aria-label="${label}">
                <span class="tile-art">${earned && !found ? stoneTile() : collectibleSvg(item)}</span>
                <span class="tile-caption">${caption}</span>
                ${mark}
                ${found && came ? caseButton(item.id, item.name) : ''}
              </li>`
        })
        .join('')
      return `<section class="collection-thing">
            <h3 class="collection-title">
              <span class="collection-creature">${creatureSvg(thing.world, line, stage)}</span>
              <span class="collection-name">${thingMark(thing)}${escapeHtml(thing.name)}</span>
              <span class="collection-total">${String(total)} ${total === 1 ? 'day' : 'days'}</span>
            </h3>
            <ul class="tiles">${tiles}</ul>
          </section>`
    })
    .join('')
}

/**
 * The legendary row: the five of the first year in the order their paths
 * come, silhouettes until earned, the one being walked with its stars
 * ("12/30"), and under each, the rare find half way to it. A long goal,
 * always in sight. An earned one opens its case, with its half way find.
 */
function legendaryRow(data: AppData, cases: Map<string, MuseumCase>): string {
  const dates = starDays(data)
  const reaches = reachesOf(dates)
  const now = progressOf(dates.length)
  let before = 0
  const tiles = LEGENDARIES.map((legendary, path) => {
    const length = pathLength(path)
    const reach = reaches[path]
    const earned = reach?.end !== undefined
    const day = dates.indexOf(reach?.end ?? '') + 1
    const caption = earned
      ? voice.legend.plaque(writtenDate(reach.end ?? ''), day)
      : path === now.path
        ? voice.legend.progress(now.lit, length)
        : voice.legend.ahead(before + length - dates.length)
    before += length
    const half = reach?.half !== undefined
    if (earned)
      cases.set(legendary.find.id, {
        item: legendary.find,
        came: caption,
        rarity: 'legendary',
        ...(reach.half
          ? {
              half: {
                item: legendary.rare,
                came: voice.museum.half(writtenDate(reach.half), dates.indexOf(reach.half) + 1),
              },
            }
          : {}),
      })
    return `<li class="tile legend-tile ${earned ? 'is-unlocked' : 'is-locked'} ${path === now.path ? 'is-next' : ''}" data-rarity="${earned ? 'legendary' : 'common'}" aria-label="${escapeHtml(`${legendary.name}, ${caption}`)}">
        <span class="tile-art">${collectibleSvg(legendary.find)}</span>
        <span class="tile-caption">${escapeHtml(earned ? legendary.name : caption)}</span>
        ${earned ? `<span class="legend-date">${voice.legend.onDay(day)}</span>` : ''}
        <span class="legend-rare ${half ? 'is-unlocked' : 'is-locked'}" aria-label="${escapeHtml(`${legendary.rare.name}${half ? ', found' : ''}`)}">${collectibleSvg(legendary.rare)}</span>
        ${earned ? caseButton(legendary.find.id, legendary.name) : ''}
      </li>`
  }).join('')
  return `<section class="collection-thing collection-legendary">
      <h3 class="collection-title"><span>${voice.legend.title}</span></h3>
      <ul class="tiles legend-tiles">${tiles}</ul>
    </section>`
}

function stoneTile(): string {
  return `<svg viewBox="0 0 60 50" aria-hidden="true"><path d="M10 30 C 6 20, 14 10, 26 9 C 38 7, 52 13, 52 25 C 53 36, 44 44, 30 44 C 18 45, 12 39, 10 30 Z" fill="#2d2a33"/><path d="M30 10 l-3 8 l5 5 l-4 7" stroke="#ffb46e" stroke-width="1.6" fill="none" opacity="0.8"/></svg>`
}
