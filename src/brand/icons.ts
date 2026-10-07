/**
 * The interface's own icons, drawn in the same hand as the glyphs
 * (glyphs.ts): a 24 grid, strokes of 1.75 with round caps and joins, soft
 * corners, one colour (currentColor). They keep a word company and never
 * stand in for one: every control that shows an icon also has a visible
 * word or an accessible name.
 */
export type IconName =
  | 'add'
  | 'edit'
  | 'more'
  | 'close'
  | 'back'
  | 'forward'
  | 'menu'
  | 'settings'
  | 'share'
  | 'send'
  | 'lockIn'
  | 'star'
  | 'lantern'
  | 'krill'
  | 'stone'
  | 'hand'
  | 'undo'
  | 'sound'
  | 'soundOff'
  | 'check'
  | 'tail'

/** The stroke every glyph and icon is drawn with, on the 24 grid. */
export const LINE = 1.75

const dot = (x: number, y: number, r: number): string =>
  `<circle cx="${String(x)}" cy="${String(y)}" r="${String(r)}" fill="currentColor" stroke="none"/>`

export const ICONS: Readonly<Record<IconName, string>> = {
  add: '<path d="M12 5v14"/><path d="M5 12h14"/>',
  edit: '<path d="M16.4 4.6a2.1 2.1 0 0 1 3 3L8.6 18.4 4 20l1.6-4.6Z"/><path d="m14.4 6.6 3 3"/>',
  more: `${dot(6, 12, 1.5)}${dot(12, 12, 1.5)}${dot(18, 12, 1.5)}`,
  close: '<path d="m6.5 6.5 11 11"/><path d="m17.5 6.5-11 11"/>',
  back: '<path d="M14.5 5.5 8 12l6.5 6.5"/>',
  forward: '<path d="M9.5 5.5 16 12l-6.5 6.5"/>',
  menu: '<path d="M4.5 7h15"/><path d="M4.5 12h15"/><path d="M4.5 17h9"/>',
  // Two sliders read as "settings" and stay simple at 20 px, where a gear turns to mush.
  settings:
    '<path d="M4 7.5h9"/><path d="M17 7.5h3"/><circle cx="15" cy="7.5" r="2"/><path d="M4 16.5h3"/><path d="M11 16.5h9"/><circle cx="9" cy="16.5" r="2"/>',
  share:
    '<path d="M12 3.5v11"/><path d="m8 7.5 4-4 4 4"/><path d="M6 11.5v7a1.5 1.5 0 0 0 1.5 1.5h9a1.5 1.5 0 0 0 1.5-1.5v-7"/>',
  send: '<path d="M20.5 3.5 3.5 10.5l7 3 3 7Z"/><path d="m10.5 13.5 4.5-4.5"/>',
  lockIn:
    '<circle cx="12" cy="13.5" r="7"/><path d="M12 10v3.5l2.4 1.6"/><path d="M10 3.5h4"/><path d="M12 3.5v3"/>',
  star: '<path d="m12 3.8 2.4 5 5.4.7-4 3.8 1 5.4-4.8-2.6-4.8 2.6 1-5.4-4-3.8 5.4-.7Z"/>',
  lantern:
    '<path d="M12 3v2.5"/><path d="M8.5 5.5h7"/><path d="M8.5 5.5C7 7.3 6.5 9.3 6.5 12s.5 4.7 2 6.5h7c1.5-1.8 2-3.8 2-6.5s-.5-4.7-2-6.5"/><path d="M8.5 18.5v2h7v-2"/><path d="M12 10c1 1.1 1.6 2.1 1.6 2.9a1.6 1.6 0 0 1-3.2 0c0-.8.6-1.8 1.6-2.9Z"/>',
  krill:
    '<path d="M4.5 14.5c1.8-4.5 7-6.6 11.6-4.8 1.9.7 3.2 2 3.4 3.2-2.6 1-6.6 1.3-10.2.5"/><path d="m8.5 14.6-.8 2.9"/><path d="m11.5 15-.4 2.9"/><path d="m14.5 15 .1 2.8"/><path d="M18.5 10c.8-1.6 1.9-2.8 3-3.5"/>',
  stone:
    '<path d="M6.3 17.8c-2.3-2.1-2-6.2.7-8.9 2.7-2.6 6.8-3.5 9.8-1.5 3 1.9 3.6 6.3 1.4 8.9-2.3 2.7-7.5 3.6-11.9 1.5Z"/><path d="m11.2 8.6 1.6 3-1.6 2.4"/>',
  hand: '<path d="M8.5 12.5v-6a1.25 1.25 0 0 1 2.5 0v4.5"/><path d="M11 10.5v-6a1.25 1.25 0 0 1 2.5 0v6"/><path d="M13.5 10.5v-5a1.25 1.25 0 0 1 2.5 0v5.5"/><path d="M16 11V8.5a1.25 1.25 0 0 1 2.5 0V15a6 6 0 0 1-6 6h-.8a5.5 5.5 0 0 1-4.6-2.5l-2.4-3.6a1.3 1.3 0 0 1 2-1.6l1.8 1.6"/>',
  undo: '<path d="M9 7.5 5 11.5l4 4"/><path d="M5 11.5h9.5a4.5 4.5 0 0 1 0 9H12"/>',
  sound:
    '<path d="M4.5 10v4h3.5l4.5 4V6L8 10Z"/><path d="M16 9.2a4 4 0 0 1 0 5.6"/><path d="M18.6 6.6a7.6 7.6 0 0 1 0 10.8"/>',
  soundOff: '<path d="M4.5 10v4h3.5l4.5 4V6L8 10Z"/><path d="m16 9.5 5 5"/><path d="m21 9.5-5 5"/>',
  check: '<path d="m5.5 12.5 4 4 9-9.5"/>',
  // The app's own sign: a whale's tail diving, in the icon and the favicon too.
  tail: '<path d="M10.4 19C10.9 16.5 11.2 14 11.1 12.3 9.5 11.2 6 10.6 3.4 7.2 6.3 7.4 9.6 8.2 12 10.2 14.4 8.2 17.7 7.4 20.6 7.2 18 10.6 14.5 11.2 12.9 12.3 12.8 14 13.1 16.5 13.6 19"/><path d="M4.5 19.4c1.25.9 2.5.9 3.75 0s2.5-.9 3.75 0 2.5.9 3.75 0 2.5-.9 3.75 0"/>',
}

/** An icon as inline SVG: decorative, for the word or the accessible name beside it. */
export function icon(name: IconName, className = 'icon'): string {
  return `<svg class="${className}" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="${String(LINE)}" stroke-linecap="round" stroke-linejoin="round">${ICONS[name]}</svg>`
}
