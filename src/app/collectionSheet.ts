import { collectibleSvg, collectiblesFor } from '../scene/collectibles'
import { creatureSvg } from '../scene/creatures'
import { last7, lineFor, stageFor, totalDone } from '../store/derive'
import { todayKey } from '../store/dates'
import type { Store } from '../store/store'
import { voice } from '../voice'
import { openSheet } from './sheet'

/**
 * The Collection: per thing, what is unlocked and what comes next. Locked
 * items are silhouettes with the real number of days to go, because an
 * empty slot with a true distance is what makes the next one worth
 * reaching for (RESEARCH-DOPAMINE, recommendation 5). No graphs.
 */
export function openCollectionSheet(store: Store): void {
  openSheet({
    title: 'collection',
    build(body) {
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
          const stage = stageFor(last7(data, thing.id, today))
          let nextMarked = false
          const tiles = collectiblesFor(thing.world, line)
            .map((item) => {
              const unlocked = total >= item.days
              const isNext = !unlocked && !nextMarked
              if (isNext) nextMarked = true
              const caption = unlocked
                ? item.name
                : isNext
                  ? voice.collection.next(item.days - total)
                  : `day ${item.days}`
              return `<li class="tile ${unlocked ? 'is-unlocked' : 'is-locked'} ${isNext ? 'is-next' : ''}" aria-label="${item.name}, ${unlocked ? 'unlocked' : caption}">
                <span class="tile-art">${collectibleSvg(item)}</span>
                <span class="tile-caption">${caption}</span>
              </li>`
            })
            .join('')
          return `<section class="collection-thing">
            <h3 class="collection-title">
              <span class="collection-creature">${creatureSvg(thing.world, line, stage)}</span>
              <span>${thing.emoji} ${thing.name}</span>
              <span class="collection-total">${total} ${total === 1 ? 'day' : 'days'}</span>
            </h3>
            <ul class="tiles">${tiles}</ul>
          </section>`
        })
      body.innerHTML = sections.join('')
    },
  })
}
