import { icon } from '../brand/icons'
import { collectibleSvg, type Collectible } from '../scene/collectibles'
import { PLAQUES } from '../scene/collectibles/museum'
import type { Rarity } from '../scene/rarity'
import { voice } from '../voice'
import { escapeHtml } from './thingMark'

/**
 * The museum: a find's case, opened from its tile in the museum sheet
 * (src/app/collectionSheet.ts). The find drawn large, its name, its plaque
 * (one silly, warm line about itself, src/scene/collectibles/museum.ts),
 * and when and how it came: the day, whose day it was, its shine. A
 * legendary's case also shows the find half way to it, once found.
 * Nothing in a case asks for anything.
 */
export interface MuseumCase {
  item: Collectible
  /** When and how it came, already in words. */
  came: string
  rarity: Rarity
  /** A legendary's half way find, when it has been found. */
  half?: { item: Collectible; came: string }
}

/** A find's plaque, or none for a find that has no line yet. */
export function plaqueFor(id: string): string | undefined {
  return PLAQUES[id]
}

/** The button over a found tile that opens its case. */
export function caseButton(id: string, name: string): string {
  return `<button type="button" class="tile-open" data-find="${escapeHtml(id)}" aria-label="${escapeHtml(voice.museum.open(name))}"></button>`
}

export function caseHtml(found: MuseumCase): string {
  const plaque = plaqueFor(found.item.id)
  const shine =
    found.rarity === 'common'
      ? ''
      : `<span class="tile-rarity case-rarity" data-rarity="${found.rarity}">${voice.stones[found.rarity]}</span>`
  const half = found.half
    ? `<div class="case-half">
        <span class="case-half-art" aria-hidden="true">${collectibleSvg(found.half.item)}</span>
        <p class="case-half-text"><span class="case-half-name">${escapeHtml(found.half.item.name)}</span> ${escapeHtml(plaqueFor(found.half.item.id) ?? '')}<span class="case-came">${escapeHtml(found.half.came)}</span></p>
      </div>`
    : ''
  return `
    <div class="log-head case-head">
      <button type="button" class="icon-button case-back" aria-label="${voice.museum.back}">${icon('back')}</button>
      <span class="log-head-gap"></span>
    </div>
    <article class="case" data-rarity="${found.rarity}">
      <span class="case-art" aria-hidden="true">${collectibleSvg(found.item)}</span>
      <h3 class="case-name" tabindex="-1">${escapeHtml(found.item.name)}${shine}</h3>
      ${plaque ? `<p class="case-plaque">${escapeHtml(plaque)}</p>` : ''}
      <p class="case-came">${escapeHtml(found.came)}</p>
    </article>
    ${half}`
}
