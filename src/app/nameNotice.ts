import { creatureSvg } from '../scene/creatures'
import { todayKey } from '../store/dates'
import { last7, stageFor } from '../store/derive'
import type { Store } from '../store/store'
import { PET_NAME_MAX } from '../store/types'
import { voice } from '../voice'
import type { NoticeBuilder } from './notices'
import { escapeHtml } from './thingMark'
import { leafCard, leafHtml, onAction } from './leaf'

/** The last stage a creature grows to (src/store/derive.ts, stageFor). */
const LAST_STAGE = 3

/**
 * "name it?": once, the first time a creature reaches its last stage. A
 * name is shown in the thing's sheet, where it can be changed, and now and
 * then a line says it in place of "it". "not now" is an answer too, and
 * it is not asked again.
 */
export function nameNotice(store: Store): NoticeBuilder {
  return (dismiss) => {
    const data = store.get()
    const today = todayKey()
    const thing = data.things.find(
      (t) => !t.nameAsked && stageFor(last7(data, t.id, today)) === LAST_STAGE,
    )
    if (!thing) return null
    const card = leafCard(voice.name.ask, 'name-leaf')
    card.innerHTML = leafHtml({
      art: creatureSvg(thing.world, thing.line, LAST_STAGE),
      title: voice.name.ask,
      lead: escapeHtml(voice.name.why(thing.name)),
      body: `<input class="input name-input" type="text" maxlength="${String(PET_NAME_MAX)}" autocomplete="off" enterkeyhint="done" aria-label="${voice.name.field}" />`,
      actions: [
        { label: voice.name.notNow, name: 'name-later', kind: 'quiet' },
        { label: voice.name.keep, name: 'name-keep', kind: 'primary' },
      ],
    })
    const input = card.querySelector<HTMLInputElement>('.name-input')
    const keep = (): void => {
      const name = input?.value.trim() ?? ''
      if (name) store.setPetName(thing.id, name)
      else store.setNameAsked(thing.id)
      dismiss()
    }
    onAction(card, 'name-keep', keep)
    input?.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') keep()
    })
    onAction(card, 'name-later', () => {
      store.setNameAsked(thing.id)
      dismiss()
    })
    return card
  }
}
