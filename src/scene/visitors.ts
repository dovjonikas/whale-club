/**
 * Things that pass through the scene rather than live in it: the whale
 * that surfaces when the day is done, and the daily surprise visitors.
 * Each is one SVG string; the scene places and animates it.
 */

export function whaleSvg(jacket: boolean): string {
  return `<svg viewBox="0 0 200 100" aria-hidden="true">
    <path d="M14 56 l 20 -18 l 4 18 l -4 18 z" fill="#1d6f8a"/>
    <path d="M28 60 C 28 28, 150 22, 184 50 C 186 70, 140 86, 70 80 C 44 78, 28 72, 28 60 Z" fill="#1d6f8a"/>
    <path d="M70 80 C 110 90, 160 84, 184 50 C 170 74, 120 84, 70 80 Z" fill="#9ff7ee" opacity="0.5"/>
    <path d="M150 24 q -4 -16 4 -22 M150 24 q 6 -16 16 -18" stroke="var(--glow)" stroke-width="3" fill="none" stroke-linecap="round"/>
    ${jacket ? `<path d="M90 40 q 30 -14 60 0 v 26 q -30 10 -60 0 z" fill="var(--jacket)"/><path d="M120 36 v 32" stroke="#061020" stroke-width="1.5" opacity="0.5"/>` : ''}
    <circle cx="158" cy="48" r="4" fill="#061020"/><circle cx="159.5" cy="46.5" r="1.3" fill="#fff"/>
    <path d="M150 60 q 10 8 20 0" stroke="#061020" stroke-width="2.5" fill="none" stroke-linecap="round"/>
  </svg>`
}

export type VisitorKind = 'fish' | 'jelly' | 'meteor' | 'turtle' | 'firefly'

export function visitorSvg(kind: VisitorKind): string {
  switch (kind) {
    case 'fish':
      return `<svg viewBox="0 0 100 60" aria-hidden="true"><path d="M20 30 l -16 -12 v 24 z" fill="var(--star)"/><ellipse cx="50" cy="30" rx="30" ry="16" fill="var(--star)"/><circle cx="66" cy="26" r="3" fill="#061020"/><path d="M40 20 q 10 -6 20 0" stroke="var(--sun)" stroke-width="3" fill="none"/></svg>`
    case 'jelly':
      return `<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M20 40 a 30 30 0 0 1 60 0 z" fill="var(--jacket)" opacity="0.8"/>${[30, 45, 60, 70].map((x) => `<path d="M${x} 40 q ${x > 50 ? 5 : -5} 20 0 45" stroke="var(--jacket)" stroke-width="2" fill="none" stroke-linecap="round" opacity="0.7"/>`).join('')}</svg>`
    case 'meteor':
      return `<svg viewBox="0 0 120 40" aria-hidden="true"><path d="M2 36 L 100 8" stroke="var(--star-pale)" stroke-width="2" stroke-linecap="round" opacity="0.8"/><circle cx="104" cy="7" r="5" fill="var(--star-pale)"/></svg>`
    case 'turtle':
      return `<svg viewBox="0 0 100 70" aria-hidden="true"><ellipse cx="46" cy="36" rx="30" ry="20" fill="#2b7a5b"/><circle cx="82" cy="32" r="10" fill="#3fa37a"/><ellipse cx="22" cy="52" rx="10" ry="4" fill="#3fa37a"/><ellipse cx="66" cy="56" rx="10" ry="4" fill="#3fa37a"/><circle cx="85" cy="30" r="2" fill="#061020"/></svg>`
    case 'firefly':
      return `<svg viewBox="0 0 100 100" aria-hidden="true">${[
        [20, 40],
        [45, 25],
        [70, 50],
        [55, 70],
        [85, 30],
      ]
        .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2" fill="var(--sun)"/>`)
        .join('')}</svg>`
  }
}
