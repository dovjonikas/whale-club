import { COLLECTIBLES, collectibleSvg } from '../scene/collectibles'
import { creatureSvg } from '../scene/creatures'
import { StarField } from '../scene/stars'
import { decodeCode, encodeCode, type BuddyData } from '../store/code'
import { todayKey } from '../store/dates'
import {
  dayNumber,
  last7,
  lineFor,
  stageFor,
  starDays,
  unlockedFor,
  weekDots,
} from '../store/derive'
import type { Store } from '../store/store'
import { emptyData } from '../store/types'
import { voice } from '../voice'
import { openSheet } from './sheet'
import { showToast } from './toast'

/**
 * The club: you and the one person who pushes you. Their code is pasted
 * once and kept, so their scene can be drawn offline; nothing is sent
 * anywhere. Read only: their creatures, their sky, what they unlocked.
 */
export function openClubSheet(store: Store): void {
  openSheet({
    title: voice.club.title,
    build(body) {
      const draw = (): void => {
        const buddy = store.get().settings.buddy
        body.replaceChildren(
          buddy ? buddySection(store, buddy.name, buddy.code, draw) : joinForm(store, draw),
        )
        body.append(yourCode(store))
      }
      draw()
    },
  })
}

function joinForm(store: Store, redraw: () => void): HTMLElement {
  const form = document.createElement('form')
  form.className = 'club-join'
  form.noValidate = true
  form.innerHTML = `
    <label class="field">
      <span class="field-label">${voice.club.who}</span>
      <input class="input" name="name" type="text" maxlength="24" autocomplete="off" required />
    </label>
    <label class="field">
      <span class="field-label">${voice.club.theirCode}</span>
      <textarea class="input club-code" name="code" rows="3" autocomplete="off" spellcheck="false"></textarea>
    </label>
    <button type="submit" class="button-primary">${voice.club.save}</button>`
  form.addEventListener('submit', (event) => {
    event.preventDefault()
    const name = (form.elements.namedItem('name') as HTMLInputElement).value.trim()
    const code = (form.elements.namedItem('code') as HTMLTextAreaElement).value.trim()
    if (!name) {
      form.querySelector<HTMLInputElement>('input[name=name]')?.focus()
      return
    }
    decodeCode(code)
      .then(() => {
        store.setSettings({ buddy: { name, code } })
        redraw()
      })
      .catch(() => {
        showToast(voice.club.bad)
      })
  })
  return form
}

function buddySection(
  store: Store,
  name: string,
  code: string | undefined,
  redraw: () => void,
): HTMLElement {
  const section = document.createElement('section')
  section.className = 'buddy'
  section.setAttribute('aria-label', name)
  section.innerHTML = `
    <h3 class="buddy-title"><span>${voice.club.yourTyler}</span> ${escape(name)}</h3>
    <div class="buddy-scene"><canvas class="buddy-sky"></canvas><p class="buddy-day"></p></div>
    <div class="buddy-row"></div>
    <ul class="tiles buddy-tiles"></ul>
    <button type="button" class="button-quiet buddy-remove">${voice.club.remove}</button>`
  section.querySelector('.buddy-remove')?.addEventListener('click', () => {
    const settings = { ...store.get().settings }
    delete settings.buddy
    store.replace({ ...store.get(), settings })
    redraw()
  })
  if (code) {
    decodeCode(code)
      .then((data) => {
        drawBuddy(section, data)
      })
      .catch(() => {
        const day = section.querySelector('.buddy-day')
        if (day) day.textContent = voice.club.bad
      })
  }
  return section
}

function drawBuddy(section: HTMLElement, buddy: BuddyData): void {
  const data = { ...emptyData(), things: buddy.things, days: buddy.days }
  const today = todayKey()

  const canvas = section.querySelector<HTMLCanvasElement>('.buddy-sky')
  const sky = section.querySelector<HTMLElement>('.buddy-scene')
  if (canvas && sky) {
    const stars = new StarField(canvas)
    stars.resize(sky.clientWidth, sky.clientHeight)
    stars.setDays(starDays(data), new Set(), today)
  }

  const day = section.querySelector('.buddy-day')
  if (day) day.textContent = voice.share.caption(dayNumber(data, today))

  const row = section.querySelector('.buddy-row')
  if (row) {
    row.innerHTML = buddy.things
      .map((thing) => {
        const dots = weekDots(data, thing.id, today)
          .map((on) => `<span class="dot ${on ? 'is-on' : ''}"></span>`)
          .join('')
        return `<div class="card is-static" data-world="${thing.world}" aria-label="${escape(thing.name)}">
          <span class="creature">${creatureSvg(thing.world, lineFor(data, thing), stageFor(last7(data, thing.id, today)))}</span>
          <span class="card-name">${escape(thing.emoji)} ${escape(thing.name)}</span>
          <span class="dots" aria-hidden="true">${dots}</span>
        </div>`
      })
      .join('')
  }

  const tiles = section.querySelector('.buddy-tiles')
  if (tiles) {
    const unlocked = new Set(buddy.things.flatMap((t) => unlockedFor(data, t, COLLECTIBLES)))
    tiles.innerHTML = COLLECTIBLES.filter((c) => unlocked.has(c.id))
      .map(
        (item) => `<li class="tile is-unlocked" aria-label="${item.name}">
          <span class="tile-art">${collectibleSvg(item)}</span>
          <span class="tile-caption">${item.name}</span>
        </li>`,
      )
      .join('')
  }
}

function yourCode(store: Store): HTMLElement {
  const block = document.createElement('section')
  block.className = 'your-code'
  block.innerHTML = `
    <h3 class="field-label">${voice.club.yourCode}</h3>
    <textarea class="input club-code" readonly rows="3" aria-label="${voice.club.yourCode}"></textarea>
    <div class="chips">
      <button type="button" class="chip code-copy">${voice.club.copy}</button>
      <button type="button" class="chip code-share" hidden>${voice.club.send}</button>
    </div>`
  const field = block.querySelector<HTMLTextAreaElement>('textarea')
  const copy = block.querySelector<HTMLButtonElement>('.code-copy')
  const send = block.querySelector<HTMLButtonElement>('.code-share')
  encodeCode(store.get())
    .then((code) => {
      if (field) field.value = code
      if (send && typeof navigator.share === 'function') send.hidden = false
    })
    .catch(() => {
      if (field) field.value = ''
    })
  copy?.addEventListener('click', () => {
    if (!field) return
    field.select()
    navigator.clipboard
      .writeText(field.value)
      .then(() => {
        showToast(voice.club.copied)
      })
      .catch(() => {
        // The selection is left in place: the person can copy it by hand.
      })
  })
  send?.addEventListener('click', () => {
    if (!field) return
    navigator.share({ text: field.value }).catch(() => undefined)
  })
  return block
}

function escape(text: string): string {
  return text.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`)
}
