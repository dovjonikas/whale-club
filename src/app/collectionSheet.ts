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
import { openSheet } from './sheet'

/**
 * The Collection: per thing, what has been found, what is waiting as a
 * stone, and what comes next. Locked items are silhouettes with the real
 * number of days to go, because an empty slot with a true distance is
 * what makes the next one worth reaching for (RESEARCH-DOPAMINE,
 * recommendation 5). A rare or legendary find carries a small mark; that
 * is all rarity does. No graphs.
 */
export function openCollectionSheet(store: Store, onArrange?: () => void): void {
  openSheet({
    title: 'collection',
    build(body, close) {
      const data = store.get()
      const today = todayKey()
      if (data.things.length === 0) {
        body.innerHTML = `<p class="sheet-note">${voice.collection.empty}</p>`
        return
      }
      const sections = [...data.things]
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
              const rarity = found
                ? rarityOf(item.id, reachedOn(data, thing.id, item.days))
                : 'common'
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
      // Arranging lives here, one step in, so the first screen stays for today's things.
      const arrange = onArrange
        ? `<button type="button" class="button-quiet collection-arrange">${icon('chest')}<span>${voice.arrange.open}</span></button>`
        : ''
      body.innerHTML = arrange + legendaryRow(data) + sections.join('')
      body.querySelector('.collection-arrange')?.addEventListener('click', () => {
        close()
        onArrange?.()
      })
    },
  })
}

/**
 * The legendary row: the five of the first year in the order their paths
 * come, silhouettes until earned, the one being walked with its stars
 * ("12/30"), and under each, the rare find half way to it. A long goal,
 * always in sight.
 */
/** "day 30" on one line in a narrow tile: the number never wraps away from its word. */
function keepTogether(html: string): string {
  return html.replace(/day (\d+)/g, '<span class="legend-day">day $1</span>')
}

function legendaryRow(data: AppData): string {
  const dates = starDays(data)
  const reaches = reachesOf(dates)
  const now = progressOf(dates.length)
  let before = 0
  const tiles = LEGENDARIES.map((legendary, path) => {
    const length = pathLength(path)
    const reach = reaches[path]
    const earned = reach?.end !== undefined
    const caption = earned
      ? voice.legend.plaque(writtenDate(reach.end ?? ''), dates.indexOf(reach.end ?? '') + 1)
      : path === now.path
        ? voice.legend.progress(now.lit, length)
        : voice.legend.ahead(before + length - dates.length)
    before += length
    const half = reach?.half !== undefined
    return `<li class="tile legend-tile ${earned ? 'is-unlocked' : 'is-locked'} ${path === now.path ? 'is-next' : ''}" data-rarity="${earned ? 'legendary' : 'common'}" aria-label="${escapeHtml(`${legendary.name}, ${caption}`)}">
        <span class="tile-art">${collectibleSvg(legendary.find)}</span>
        <span class="tile-caption">${escapeHtml(earned ? legendary.name : caption)}</span>
        ${earned ? `<span class="legend-date">${keepTogether(escapeHtml(caption))}</span>` : ''}
        <span class="legend-rare ${half ? 'is-unlocked' : 'is-locked'}" aria-label="${escapeHtml(`${legendary.rare.name}${half ? ', found' : ''}`)}">${collectibleSvg(legendary.rare)}</span>
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
