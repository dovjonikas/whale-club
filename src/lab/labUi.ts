import { openSheet } from '../app/sheet'
import { todayKey, fromKey } from '../store/dates'
import { enterLab, LAB_PARAM, labOffset, labOn, leaveLab, setLabOffset } from '../store/lab'
import { voice } from '../voice'

/**
 * The lab's two pieces of screen: a thin bar over everything while the lab
 * is on, and the lab's sheet with its controls.
 *
 * Moving the clock reloads the page, so everything that happens once on
 * opening (the check-in, the recap, the quiet morning, the moon, a session
 * that ran out) happens exactly as it would on a real morning. Changing the
 * sandbox's data happens in place, through the store, like any other tap.
 */
export interface LabHooks {
  /** Marks every thing planned today as done. */
  doAll: () => void
  /** Fills the days before today with a believable history. */
  seed: (days: number) => void
  /** Empties the sandbox: a first open, in the lab. */
  clear: () => void
  /** Empties the sandbox and plays the intro, as on a phone that never had the app. */
  firstOpen: () => void
}

/** Survives the reload after entering, so the lab's sheet opens on the other side. */
const OPEN_FLAG = 'whaleclub:lab.open'

/** Wires the lab up once the app is running. Nothing at all happens outside the lab. */
export function startLabUi(hooks: LabHooks, justEntered: boolean): void {
  if (!labOn()) return
  showLabBar(hooks)
  let reopen = justEntered
  try {
    if (sessionStorage.getItem(OPEN_FLAG) !== null) reopen = true
    sessionStorage.removeItem(OPEN_FLAG)
  } catch {
    // No session storage: the bar still opens the sheet.
  }
  if (reopen) openLabSheet(hooks)
}

/** From the menu: five taps on the version. Copies the real sea and comes back in the lab. */
export function enterLabFromMenu(): void {
  if (labOn() || !enterLab()) return
  try {
    sessionStorage.setItem(OPEN_FLAG, '1')
  } catch {
    // The lab is on anyway; the bar opens the sheet.
  }
  location.reload()
}

/** Throws the sandbox away and comes back to the real sea, without the ?lab=1 that opened it. */
export function exitLab(): void {
  leaveLab()
  const url = new URL(location.href)
  if (url.searchParams.has(LAB_PARAM)) {
    url.searchParams.delete(LAB_PARAM)
    location.replace(url.toString())
  } else {
    location.reload()
  }
}

function moveClock(days: number): void {
  setLabOffset(days)
  location.reload()
}

function showLabBar(hooks: LabHooks): void {
  document.documentElement.dataset.lab = 'true'
  const bar = document.createElement('div')
  bar.className = 'lab-bar'
  bar.setAttribute('role', 'region')
  bar.setAttribute('aria-label', voice.lab.title)
  bar.innerHTML = `
    <button type="button" class="lab-bar-open"></button>
    <button type="button" class="lab-bar-exit">${voice.lab.exit}</button>`
  const open = bar.querySelector<HTMLButtonElement>('.lab-bar-open')
  if (open) {
    open.textContent = voice.lab.bar(labOffset())
    open.addEventListener('click', () => {
      openLabSheet(hooks)
    })
  }
  bar.querySelector('.lab-bar-exit')?.addEventListener('click', exitLab)
  document.body.append(bar)
}

function openLabSheet(hooks: LabHooks): void {
  openSheet({
    title: voice.lab.title,
    build(body, close) {
      const offset = labOffset()
      const when = fromKey(todayKey()).toLocaleDateString('en-GB', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
      })
      body.innerHTML = `
        <p class="lab-note">${voice.lab.note}</p>
        <p class="sheet-note lab-today">${voice.lab.today(when)} · ${voice.lab.bar(offset).replace('lab · ', '')}</p>
        <div class="lab-group" role="group" aria-label="${voice.lab.time}">
          <button type="button" class="chip" data-lab="forward">${voice.lab.forward}</button>
          <button type="button" class="chip" data-lab="week">${voice.lab.week}</button>
          <button type="button" class="chip" data-lab="back">${voice.lab.back}</button>
          <button type="button" class="chip" data-lab="real"${offset === 0 ? ' disabled' : ''}>${voice.lab.real}</button>
        </div>
        <div class="lab-group" role="group" aria-label="${voice.lab.sea}">
          <button type="button" class="chip" data-lab="all">${voice.lab.doAll}</button>
          <button type="button" class="chip" data-lab="seed30">${voice.lab.seed30}</button>
          <button type="button" class="chip" data-lab="seed90">${voice.lab.seed90}</button>
          <button type="button" class="chip" data-lab="seed365">${voice.lab.seed365}</button>
          <button type="button" class="chip" data-lab="clear">${voice.lab.clear}</button>
          <button type="button" class="chip" data-lab="firstOpen">${voice.lab.firstOpen}</button>
        </div>
        <button type="button" class="button-quiet lab-exit">${voice.lab.exit}</button>`

      const actions: Record<string, () => void> = {
        forward: () => {
          moveClock(offset + 1)
        },
        week: () => {
          moveClock(offset + 7)
        },
        back: () => {
          moveClock(offset - 1)
        },
        real: () => {
          moveClock(0)
        },
        all: () => {
          close()
          hooks.doAll()
        },
        seed30: () => {
          close()
          hooks.seed(30)
        },
        seed365: () => {
          close()
          hooks.seed(365)
        },
        seed90: () => {
          close()
          hooks.seed(90)
        },
        clear: () => {
          close()
          hooks.clear()
        },
        firstOpen: () => {
          close()
          hooks.firstOpen()
        },
      }
      body.querySelectorAll<HTMLButtonElement>('[data-lab]').forEach((button) => {
        button.addEventListener('click', () => {
          actions[button.dataset.lab ?? '']?.()
        })
      })
      body.querySelector('.lab-exit')?.addEventListener('click', exitLab)
    },
  })
}
