import '@fontsource/atkinson-hyperlegible/latin-400.css'
import '@fontsource/atkinson-hyperlegible/latin-700.css'
import '../styles/fonts.css'
import '../styles/tokens.css'
import '../styles/bubble.css'
import '../styles/brand-page.css'
import { LANTERN_COLORS } from '../app/sceneData'
import { bubbleSvg, CREAM, DEEP, INK } from './bubble'
import { GLYPHS, GROUPS, LETTER } from './glyphs'
import { ICONS, icon, type IconName, LINE } from './icons'

/**
 * brand.html: the look, in one page, drawn by the same code the app draws
 * with, so it can never drift from it. Every bubble state, the colours,
 * every glyph by group, the interface's icons, the type and the app icon.
 * A tap on a bubble in the first row shows how a thing is done.
 */
const COLOUR_NAMES = ['amber', 'rose', 'sea glass', 'lilac', 'peach']
const TOKENS: readonly [string, string, string][] = [
  ['abyss', '#020409', 'the frame, the deepest water'],
  ['deep', DEEP, 'cards, sheets, the inside of an empty bubble'],
  ['cream', CREAM, 'every glyph and line'],
  ['ink', '#e8f0f5', 'body text'],
  ['ink-dim', '#7f93a6', 'secondary text'],
  ['glow', '#3ef2e0', 'the sea’s light: focus, the main action'],
  ['done ink', INK, 'a glyph on a filled bubble'],
]
const TYPE: readonly [string, string, string][] = [
  ['40', 'display', 'a year of small things.'],
  ['24', 'display', 'new homework'],
  ['17', 'body', 'tap when done, or lock in.'],
  ['14', 'body', 'next find: in 2 days'],
  ['12', 'body', '12/25 · finish'],
]

function plainGlyph(svg: string, size: number): string {
  return `<svg viewBox="0 0 24 24" width="${String(size)}" height="${String(size)}" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="${String(LINE)}" stroke-linecap="round" stroke-linejoin="round">${svg}</svg>`
}

function states(): string {
  const color = LANTERN_COLORS[2]
  const shown: [string, string][] = [
    ['empty', bubbleSvg({ icon: 'run', name: 'run', color, kind: 'tap' })],
    ['done', bubbleSvg({ icon: 'run', name: 'run', color, kind: 'tap' }, { done: true })],
    ['lock-in, 0%', bubbleSvg({ icon: 'violin', name: 'violin', color, kind: 'lockIn' })],
    [
      'lock-in, 50%',
      bubbleSvg({ icon: 'violin', name: 'violin', color, kind: 'lockIn' }, { progress: 0.5 }),
    ],
    [
      'lock-in, done',
      bubbleSvg({ icon: 'violin', name: 'violin', color, kind: 'lockIn' }, { done: true }),
    ],
    [
      'done without the timer',
      bubbleSvg(
        { icon: 'violin', name: 'violin', color, kind: 'lockIn' },
        { done: true, manual: true },
      ),
    ],
    ['monogram', bubbleSvg({ icon: LETTER, name: 'kintsugi', color, kind: 'tap' })],
  ]
  return shown
    .map(
      ([label, svg], i) => `<figure class="state">
        ${i < 2 ? `<button type="button" class="try" aria-label="${i === 0 ? 'mark run done' : 'undo run'}">${svg}</button>` : `<div class="try">${svg}</div>`}
        <figcaption>${label}</figcaption>
      </figure>`,
    )
    .join('')
}

function colours(): string {
  const lanterns = LANTERN_COLORS.map(
    (c, i) => `<figure class="swatch">
      <span class="chip" style="background:${c}"></span>
      <figcaption><b>${COLOUR_NAMES[i] ?? ''}</b> ${c}<br />the thing at place ${String(i + 1)} in the row</figcaption>
    </figure>`,
  ).join('')
  const tokens = TOKENS.map(
    ([name, hex, role]) => `<figure class="swatch">
      <span class="chip" style="background:${hex}"></span>
      <figcaption><b>${name}</b> ${hex}<br />${role}</figcaption>
    </figure>`,
  ).join('')
  return `<h3>a thing's colour, the same in its bubble, lanterns and log</h3>
    <div class="swatches">${lanterns}</div>
    <h3>the night</h3>
    <div class="swatches">${tokens}</div>`
}

function glyphs(): string {
  return GROUPS.map((group, g) => {
    const color = LANTERN_COLORS[g % LANTERN_COLORS.length] ?? CREAM
    const cells = GLYPHS.filter((x) => x.group === group.id)
      .map(
        (x) => `<figure class="glyph">
          <span class="glyph-bubble">${bubbleSvg({ icon: x.id, name: x.label, color, kind: 'tap' })}</span>
          <span class="glyph-small">${plainGlyph(x.svg, 20)}</span>
          <figcaption>${x.label}</figcaption>
        </figure>`,
      )
      .join('')
    return `<h3>${group.label}</h3><div class="glyphs">${cells}</div>`
  }).join('')
}

function icons(): string {
  return (Object.keys(ICONS) as IconName[])
    .map(
      (name) => `<figure class="ui-icon">
        ${icon(name)}
        <figcaption>${name}</figcaption>
      </figure>`,
    )
    .join('')
}

function type(): string {
  return TYPE.map(
    ([size, face, sample]) => `<p class="type-row">
      <span class="type-meta">${size} px · ${face === 'display' ? 'Fraunces' : 'Atkinson Hyperlegible'}</span>
      <span class="type-sample is-${face}" style="font-size:${size}px">${sample}</span>
    </p>`,
  ).join('')
}

function appIcon(): string {
  const base = import.meta.env.BASE_URL
  return `<div class="app-icons">
    <figure><img src="${base}icons/icon-512.png" width="180" height="180" alt="The app icon: a whale's tail diving, in a sea glass bubble with a small bubble rising off its rim" /><figcaption>app icon</figcaption></figure>
    <figure><img src="${base}icons/icon-maskable-512.png" width="96" height="96" class="masked" alt="The maskable icon, cut to a circle as a launcher may" /><figcaption>maskable</figcaption></figure>
    <figure><img src="${base}icons/icon.svg" width="48" height="48" alt="The app icon at 48 px" /><figcaption>48 px</figcaption></figure>
    <figure><img src="${base}icons/favicon.svg" width="32" height="32" alt="The favicon at 32 px" /><figcaption>favicon 32</figcaption></figure>
    <figure><img src="${base}icons/favicon.svg" width="16" height="16" alt="The favicon at 16 px" /><figcaption>16</figcaption></figure>
  </div>`
}

const root = document.getElementById('brand')
if (root) {
  root.innerHTML = `
    <header class="brand-head">
      <img src="${import.meta.env.BASE_URL}icons/icon.svg" width="64" height="64" alt="" />
      <div>
        <h1>Whale Club, the look</h1>
        <p>Every thing wears a bubble: a glass float in its colour, its picture in cream, and one tiny bubble rising off the rim. Drawn here by the same code the app draws with. <a href="${import.meta.env.BASE_URL}">Back to the sea</a></p>
      </div>
    </header>
    <section aria-labelledby="h-bubble">
      <h2 id="h-bubble">The bubble</h2>
      <p class="note">Tap the first one: done fills it with its colour, turns the glyph dark and pops the small bubble into three.</p>
      <div class="states">${states()}</div>
    </section>
    <section aria-labelledby="h-colour">
      <h2 id="h-colour">Colour</h2>
      ${colours()}
    </section>
    <section aria-labelledby="h-glyphs">
      <h2 id="h-glyphs">The glyphs</h2>
      <p class="note">${String(GLYPHS.length)} pictures, drawn on a 24 grid in strokes of ${String(LINE)} with round ends, one colour. Each is picked from a thing's name, in English or Lithuanian; a name that fits none wears its first letter.</p>
      ${glyphs()}
    </section>
    <section aria-labelledby="h-icons">
      <h2 id="h-icons">The interface's icons</h2>
      <p class="note">In the same hand. Always beside a word or an accessible name, never instead of one.</p>
      <div class="ui-icons">${icons()}</div>
    </section>
    <section aria-labelledby="h-type">
      <h2 id="h-type">Type</h2>
      ${type()}
    </section>
    <section aria-labelledby="h-icon">
      <h2 id="h-icon">The app icon</h2>
      ${appIcon()}
    </section>`

  // The first two bubbles can be tapped: done, and back.
  root.querySelectorAll<HTMLButtonElement>('button.try').forEach((button) => {
    button.addEventListener('click', () => {
      const bubble = button.querySelector<SVGElement>('.bubble')
      if (!bubble) return
      const done = bubble.dataset.done !== 'true'
      bubble.dataset.done = String(done)
      button.setAttribute('aria-label', done ? 'undo run' : 'mark run done')
      if (!done) return
      button.classList.remove('is-popping')
      button.getBoundingClientRect()
      button.classList.add('is-popping')
      window.setTimeout(() => {
        button.classList.remove('is-popping')
      }, 320)
    })
  })
}
