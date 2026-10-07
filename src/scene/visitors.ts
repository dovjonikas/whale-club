import * as art from './art'
import { dots, fish, jelly } from './draw'

/**
 * Things that pass through the scene rather than live in it: the whale
 * that surfaces when the day is done, and the daily surprise visitors.
 * Each is one SVG string; the scene places and animates it.
 */

/**
 * The whale that surfaces when the day is done: the sea creature's last
 * stage, large, shaded the same way, with its spout in drops. From day 90
 * it wears the red jacket. The ids are fixed: only one whale is ever up.
 */
export function whaleSvg(jacket: boolean): string {
  return `<svg viewBox="0 0 200 110" aria-hidden="true">
    <defs>
      <linearGradient id="whale-body" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#52aecd"/><stop offset="1" stop-color="#134f6b"/>
      </linearGradient>
      <linearGradient id="whale-belly" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#e2fbfb"/><stop offset="1" stop-color="#a9e2e6"/>
      </linearGradient>
      <linearGradient id="whale-jacket" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#ff5a64"/><stop offset="1" stop-color="#b8202d"/>
      </linearGradient>
    </defs>
    <path d="M6 52 Q 18 40 30 56 Q 18 66 6 74 Q 16 62 6 52 Z" fill="#1a6684"/>
    <path d="M26 62 C 26 30, 140 22, 182 52 C 194 62, 188 78, 168 86 C 132 98, 64 96, 38 80 C 30 75, 26 69, 26 62 Z" fill="url(#whale-body)"/>
    <path d="M44 82 C 80 98, 150 96, 184 62 C 176 84, 132 100, 44 82 Z" fill="url(#whale-belly)"/>
    <path d="M70 89 l 2 4 M86 91.5 l 1 4 M102 92.5 l 0.6 4 M118 92 l 0 4 M134 90 l -0.6 4" stroke="#8fd3da" stroke-width="1.6" stroke-linecap="round"/>
    <path d="M96 84 Q 104 100 92 108 Q 88 96 96 84 Z" fill="#1a6684"/>
    <ellipse cx="110" cy="40" rx="40" ry="7" fill="#fff" opacity="0.16"/>
    ${
      jacket
        ? `<path d="M80 42 Q 112 28 146 40 L 150 74 Q 114 86 78 74 Z" fill="url(#whale-jacket)"/>
           <path d="M113 34 V 80" stroke="#7a1019" stroke-width="2" opacity="0.6"/>
           <path d="M106 42 l 7 8 l 7 -8" stroke="#ffd6d9" stroke-width="2" fill="none" opacity="0.7"/>
           <circle cx="113" cy="58" r="1.8" fill="#ffd6d9"/><circle cx="113" cy="67" r="1.8" fill="#ffd6d9"/>`
        : ''
    }
    <path d="M150 30 q -4 -14 2 -22 M150 30 q 6 -14 18 -16" stroke="#7ff5ea" stroke-width="3.2" fill="none" stroke-linecap="round"/>
    <circle cx="140" cy="10" r="2.4" fill="#c9fbf5"/><circle cx="172" cy="10" r="2" fill="#c9fbf5"/><circle cx="158" cy="3" r="1.6" fill="#c9fbf5"/><circle cx="133" cy="22" r="1.4" fill="#c9fbf5"/>
    <g class="eyes"><ellipse cx="160" cy="56" rx="4.4" ry="5" fill="#061020"/><circle cx="161.6" cy="54" r="1.6" fill="#fff"/></g>
    <ellipse cx="166" cy="66" rx="5" ry="2.6" fill="#ff8fa3" opacity="0.55"/>
    <path d="M150 70 q 10 8 22 1" stroke="#061020" stroke-width="2.6" fill="none" stroke-linecap="round"/>
  </svg>`
}

export type VisitorKind = 'fish' | 'jelly' | 'meteor' | 'turtle' | 'firefly'

export function visitorSvg(kind: VisitorKind): string {
  switch (kind) {
    case 'fish':
      return `<svg viewBox="0 0 100 60" aria-hidden="true">${fish(52, 30, 56, '#ffd98a')}</svg>`
    case 'jelly':
      return `<svg viewBox="0 0 100 100" aria-hidden="true">${jelly(50, 40, 56, '#ff8fa3')}</svg>`
    case 'meteor':
      return `<svg viewBox="0 0 120 40" aria-hidden="true">
        <defs><linearGradient id="meteor-tail" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#fff4d6" stop-opacity="0"/><stop offset="1" stop-color="#fff4d6"/></linearGradient></defs>
        <path d="M2 36 L 100 8" stroke="url(#meteor-tail)" stroke-width="2.4" stroke-linecap="round"/>
        <circle cx="104" cy="7" r="9" fill="#fff4d6" opacity="0.2"/><circle cx="104" cy="7" r="4" fill="#fff4d6"/></svg>`
    case 'turtle':
      return `<svg viewBox="0 0 100 100" aria-hidden="true">${art.turtle()}</svg>`
    case 'firefly':
      return `<svg viewBox="0 0 100 100" aria-hidden="true">${dots(
        [
          [20, 40, 2.2],
          [45, 25, 1.8],
          [70, 50, 2.2],
          [55, 70, 1.6],
          [85, 30, 2],
        ],
        '#f2c94c',
      )}</svg>`
  }
}

/**
 * The small whale asleep at the water line on the empty first screen,
 * before there is anything to do: eyes shut, a slow breath of bubbles.
 */
export function sleeperSvg(): string {
  return `<svg viewBox="0 0 160 84" aria-hidden="true">
    <defs>
      <linearGradient id="sleeper-body" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#63bfdc"/><stop offset="0.6" stop-color="#2a7fa3"/><stop offset="1" stop-color="#15506d"/>
      </linearGradient>
      <linearGradient id="sleeper-belly" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#bfeaf2"/><stop offset="1" stop-color="#6fb3c8"/>
      </linearGradient>
    </defs>
    <path d="M30 46 C 20 40, 12 30, 4 30 C 8 36, 10 42, 14 46 C 8 50, 4 58, 6 64 C 14 60, 22 54, 30 52 Z" fill="#1f6b8c"/>
    <path d="M26 50 C 30 28, 96 16, 138 30 C 156 36, 158 56, 146 66 C 128 80, 70 80, 44 68 C 34 63, 26 58, 26 50 Z" fill="url(#sleeper-body)"/>
    <path d="M58 70 C 82 78, 124 76, 144 64 C 136 74, 116 79, 92 79 C 78 79, 66 76, 58 70 Z" fill="url(#sleeper-belly)" opacity="0.85"/>
    <path d="M84 72 L 120 70 M 88 75 L 116 74" stroke="#4d93ab" stroke-width="1" stroke-linecap="round" opacity="0.6"/>
    <path d="M86 58 C 82 66, 72 72, 62 72 C 68 66, 74 60, 86 58 Z" fill="#1d6a8a"/>
    <path d="M60 30 C 84 22, 116 22, 134 30" stroke="#fff" stroke-width="5" stroke-linecap="round" fill="none" opacity="0.18"/>
    <path d="M114 50 q 5 4 10 0" stroke="#061020" stroke-width="2.4" fill="none" stroke-linecap="round"/>
    <path d="M130 48 q 5 4 10 0" stroke="#061020" stroke-width="2.4" fill="none" stroke-linecap="round"/>
    <ellipse cx="114" cy="59" rx="5" ry="2.6" fill="#ff8fa3" opacity="0.55"/>
    <ellipse cx="144" cy="57" rx="3.6" ry="2.2" fill="#ff8fa3" opacity="0.45"/>
    <path d="M124 62 q 4 2.6 8 0" stroke="#061020" stroke-width="1.6" fill="none" stroke-linecap="round" opacity="0.7"/>
  </svg>
  <span class="sleeper-bubbles"><i></i><i></i><i></i></span>`
}
