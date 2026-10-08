import { FIRST_WEEK_DAYS } from '../store/krill'
import { voice } from '../voice'

/**
 * The first week as its own set: seven small slots, silhouettes from day
 * one, filled one a day for each of the first seven days something was
 * done. The seventh finishes it with the whale's song and a slow breach,
 * and +100 krill; after that the set is gone for good. Week one is where
 * most people stop (RESEARCH-DOPAMINE), so it gets a finish line of its own.
 */
const PICTURES: readonly string[] = [
  // a drop
  '<path d="M12 4c3 4.5 6 7.6 6 11a6 6 0 0 1-12 0c0-3.4 3-6.5 6-11Z"/>',
  // a shell
  '<path d="M4 17c0-6 3.6-11 8-11s8 5 8 11Z"/><path d="M12 6v11M8.4 8.6 10 17M15.6 8.6 14 17"/>',
  // a leaf
  '<path d="M5 19C5 10 10 5 19 5c0 9-5 14-14 14Z"/><path d="M5 19 13 11"/>',
  // a star
  '<path d="m12 4 2.3 4.8 5.2.7-3.8 3.6.9 5.2L12 15.8l-4.6 2.5.9-5.2-3.8-3.6 5.2-.7Z"/>',
  // a feather
  '<path d="M19 5C11 5 6 10 6 18c8 0 13-5 13-13Z"/><path d="M6 18 15 9"/>',
  // a moon
  '<path d="M15 4a8 8 0 1 0 5 13A7 7 0 0 1 15 4Z"/>',
  // a whale's tail
  '<path d="M12 19c.4-2.4.6-4.6.5-6.4C10.9 11.4 7.6 10.6 4.6 7.6c3 .1 6 1 7.9 2.7 1.9-1.7 4.9-2.6 7.9-2.7-3 3-6.3 3.8-7.9 5-.1 1.8.1 4 .5 6.4"/>',
]

export function firstWeekHtml(filled: number): string {
  const slots = PICTURES.map(
    (picture, i) =>
      `<svg class="week-slot${i < filled ? ' is-filled' : ''}" viewBox="0 0 24 24" aria-hidden="true">${picture}</svg>`,
  ).join('')
  return `<span class="first-week" role="img" aria-label="${voice.firstWeek.label(Math.min(filled, FIRST_WEEK_DAYS))}">${slots}</span>`
}
