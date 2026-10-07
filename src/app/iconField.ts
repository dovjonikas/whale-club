import { bubbleSvg, monogram } from '../brand/bubble'
import { COMMON, glyph, GLYPHS, GROUPS, LETTER } from '../brand/glyphs'
import { LINE } from '../brand/icons'
import { glyphFor } from '../brand/match'
import type { Kind } from '../store/types'
import { voice } from '../voice'

/**
 * A thing's picture: the add sheet's and the thing's sheet's one field
 * for it. A bubble in the thing's colour shows how its card will look.
 * Under it the twelve most common pictures, the first letter of the name,
 * and "more", which opens every picture by group.
 *
 * Until the person picks one, the picture follows the name as it is typed
 * (src/brand/match.ts) and a quiet line says so; a pick holds from then on.
 */
export interface IconField {
  element: HTMLElement
  icon: () => string
  /** The name changed: follow it, unless a picture was picked. */
  follow: (name: string) => void
  /** Set by a starter: picture and name together, picked. */
  set: (icon: string, name: string) => void
}

let fieldCount = 0

/** A glyph drawn plain, for a chip. */
function glyphSvg(id: string): string {
  return `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="${String(LINE)}" stroke-linecap="round" stroke-linejoin="round" style="color:currentColor">${glyph(id)?.svg ?? ''}</svg>`
}

function chip(id: string, label: string, content: string): string {
  return `<button type="button" class="icon-chip" data-icon="${id}" aria-label="${label}" aria-pressed="false">${content}</button>`
}

export function iconField(start: {
  icon: string
  name: string
  color: string
  kind: Kind
  /** Following the name: true for a new thing; for one being changed, if its picture still is the name's. */
  auto: boolean
}): IconField {
  const id = `icon-label-${String(++fieldCount)}`
  let icon = start.icon
  let name = start.name
  let auto = start.auto

  const element = document.createElement('div')
  element.className = 'field icon-field'
  element.innerHTML = `
    <div class="icon-head">
      <span class="icon-preview"></span>
      <span class="field-label" id="${id}">${voice.icon.label}</span>
      <span class="icon-auto">${voice.icon.picked}</span>
    </div>
    <div class="icon-chips" role="group" aria-labelledby="${id}">
      <span class="icon-extra"></span>
      ${COMMON.map((g) => chip(g, glyph(g)?.label ?? g, glyphSvg(g))).join('')}
      ${chip(LETTER, voice.icon.letter, '<span class="icon-letter"></span>')}
      <button type="button" class="chip icon-more-toggle" aria-expanded="false">${voice.icon.more}</button>
    </div>
    <div class="icon-more" hidden>
      ${GROUPS.map(
        (group) => `
        <div class="icon-group" role="group" aria-label="${group.label}">
          <span class="icon-group-label" aria-hidden="true">${group.label}</span>
          <div class="icon-chips">
            ${GLYPHS.filter((g) => g.group === group.id)
              .map((g) => chip(g.id, g.label, glyphSvg(g.id)))
              .join('')}
          </div>
        </div>`,
      ).join('')}
    </div>`

  const preview = element.querySelector<HTMLElement>('.icon-preview')
  const extra = element.querySelector<HTMLElement>('.icon-extra')
  const autoLine = element.querySelector<HTMLElement>('.icon-auto')
  const more = element.querySelector<HTMLElement>('.icon-more')
  const toggle = element.querySelector<HTMLButtonElement>('.icon-more-toggle')

  const show = (): void => {
    if (preview) {
      preview.innerHTML = bubbleSvg({
        icon,
        name: name || '·',
        color: start.color,
        kind: start.kind,
      })
    }
    // A picture from the name that is not among the twelve shows first, so the choice is always in sight.
    if (extra) {
      extra.innerHTML =
        icon !== LETTER && !COMMON.includes(icon)
          ? chip(icon, glyph(icon)?.label ?? icon, glyphSvg(icon))
          : ''
    }
    element.querySelectorAll('.icon-letter').forEach((letter) => {
      letter.textContent = monogram(name || 'a')
    })
    element.querySelectorAll<HTMLButtonElement>('[data-icon]').forEach((button) => {
      button.setAttribute('aria-pressed', String(button.dataset.icon === icon))
    })
    if (autoLine) autoLine.hidden = !auto || !name.trim()
  }

  element.addEventListener('click', (event) => {
    const target = event.target instanceof Element ? event.target.closest('button') : null
    if (!target) return
    if (target === toggle) {
      const open = more?.hidden ?? false
      if (more) more.hidden = !open
      toggle.setAttribute('aria-expanded', String(open))
      return
    }
    const picked = target.dataset.icon
    if (picked === undefined) return
    icon = picked
    auto = false
    show()
  })

  show()
  return {
    element,
    icon: () => icon,
    follow(next) {
      name = next
      if (auto) icon = glyphFor(next)
      show()
    },
    set(next, nextName) {
      icon = next
      name = nextName
      auto = false
      show()
    },
  }
}
