import { icon, type IconName } from '../brand/icons'

/**
 * A row that opens or does something: a small icon in a soft circle, the
 * words, and (in CSS) a chevron. Filled softly rather than outlined, so it
 * never reads as a field to type in. `className` names what the row is.
 */
export function menuRow(className: string, label: string, mark: IconName): string {
  return `<button type="button" class="menu-row ${className}"><span class="row-icon" aria-hidden="true">${icon(mark)}</span><span class="row-label">${label}</span></button>`
}
