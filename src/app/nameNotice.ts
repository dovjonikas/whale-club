import { creatureSvg } from '../scene/creatures'
import { todayKey } from '../store/dates'
import { last7, stageFor } from '../store/derive'
import type { Store } from '../store/store'
import { PET_NAME_MAX } from '../store/types'
import { voice } from '../voice'
import type { NoticeBuilder } from './notices'
import { escapeHtml } from './thingMark'

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
    const card = document.createElement('aside')
    card.className = 'leaf name-leaf is-form'
    card.setAttribute('aria-label', voice.name.ask)
    card.innerHTML = `
      <div class="name-head">
        <span class="name-creature" aria-hidden="true">${creatureSvg(thing.world, thing.line, LAST_STAGE)}</span>
        <span>
          <span class="leaf-title">${voice.name.ask}</span>
          <span class="leaf-lead">${escapeHtml(voice.name.why(thing.name))}</span>
        </span>
      </div>
      <input class="input name-input" type="text" maxlength="${String(PET_NAME_MAX)}" autocomplete="off" enterkeyhint="done" aria-label="${voice.name.field}" />
      <div class="leaf-actions">
        <button type="button" class="button-primary name-keep">${voice.name.keep}</button>
        <button type="button" class="button-quiet name-later">${voice.name.notNow}</button>
      </div>`
    const input = card.querySelector<HTMLInputElement>('.name-input')
    const keep = (): void => {
      const name = input?.value.trim() ?? ''
      if (name) store.setPetName(thing.id, name)
      else store.setNameAsked(thing.id)
      dismiss()
    }
    card.querySelector('.name-keep')?.addEventListener('click', keep)
    input?.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') keep()
    })
    card.querySelector('.name-later')?.addEventListener('click', () => {
      store.setNameAsked(thing.id)
      dismiss()
    })
    return card
  }
}
