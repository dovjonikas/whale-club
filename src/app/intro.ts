import { seedHistory } from '../lab/seed'
import { collectiblesFor } from '../scene/collectibles'
import { beginningSvg, creatureSvg } from '../scene/creatures'
import type { Scene } from '../scene/scene'
import { reducedMotion, ticker, type FrameHandle } from '../scene/ticker'
import { addDays, todayKey } from '../store/dates'
import { last7, reachedOn, stageFor, starDays, streakDays, UNLOCK_DAYS } from '../store/derive'
import type { AppData, DateKey, World } from '../store/types'
import { emptyData } from '../store/types'
import { voice } from '../voice'
import { host } from './host'
import { lanternsFor } from './sceneData'

/**
 * The first minute, in three beats, on a first open only (and on request).
 *
 * The promise: the real scene, drawing a seeded year (the lab's, not a
 * forecast of this person's), a day counter running from 1 to 365 faster
 * and faster, stars filling the sky, creatures growing, stones falling and
 * opening, lanterns gathering, and at the end the whale rising before the
 * moon. All of it in silhouette: the creatures dark shapes with a rim of
 * light, the finds only flashes. It shows that the sea fills, not what
 * with. Because it is the real scene, the promise grows with the content.
 *
 * The truth: back in a second to the empty sea of day one, and the
 * author's sentence, in their words.
 *
 * The first step: one button, "start light".
 *
 * "skip" is always there; a tap anywhere goes on to the next beat. Under
 * reduced motion the promise is three still frames (day 1, 100, 365) that
 * fade into each other.
 */
export type IntroEnd = 'start' | 'skip'
type Beat = 'promise' | 'truth' | 'start'

const PROMISE_MS = 7000
/** The day counter speeds up: day = 1 + 364 * t^ACCELERATION. */
const ACCELERATION = 2.2
const PROMISE_HOLD_MS = 1800
const TRUTH_SECOND_MS = 3500
const TRUTH_MS = 9500
const STILL_MS = 2000
const STILL_DAYS = [1, 100, 365]
const FPS = 30
const YEAR = 365
/** Where each world's creature stands while the year runs, as a fraction of the width. */
const CREATURE_X: Record<World, number> = { sea: 0.25, sky: 0.5, garden: 0.75 }
const LANTERN_LIGHT = '#ffd98a'
const INTRO_KEY = 'whaleclub:intro'

/** Whether a first open should show the intro: nothing stored yet, and never shown before. */
export function introDue(data: AppData): boolean {
  if (data.things.length > 0 || Object.keys(data.days).length > 0) return false
  try {
    return localStorage.getItem(INTRO_KEY) === null
  } catch {
    return false
  }
}

function markSeen(): void {
  try {
    localStorage.setItem(INTRO_KEY, 'seen')
  } catch {
    // Without storage it shows again next time; that is all.
  }
}

interface Year {
  data: AppData
  start: DateKey
  today: DateKey
  dates: DateKey[]
  lanterns: ReturnType<typeof lanternsFor>
  finds: { date: DateKey; world: World; x: number; y: number }[]
}

function seededYear(): Year {
  const today = todayKey()
  const data = seedHistory(emptyData(), today, YEAR)
  const finds: Year['finds'] = []
  for (const thing of data.things) {
    for (const tier of UNLOCK_DAYS) {
      const date = reachedOn(data, thing.id, tier)
      const item = collectiblesFor(thing.world, thing.line).find((c) => c.days === tier)
      if (date && item) finds.push({ date, world: thing.world, x: item.x, y: item.y })
    }
  }
  finds.sort((a, b) => a.date.localeCompare(b.date))
  return {
    data,
    start: addDays(today, -YEAR),
    today,
    dates: starDays(data),
    // Lights, not colours: every lantern the same warm light.
    lanterns: lanternsFor(data, today).map((l) => ({ ...l, color: LANTERN_LIGHT })),
    finds,
  }
}

export function playIntro(
  scene: Scene,
  options: { hasThings: boolean; onEnd: (end: IntroEnd) => void },
): void {
  const year = seededYear()
  const app = document.getElementById('app')
  const overlay = document.createElement('section')
  overlay.className = 'intro'
  overlay.setAttribute('role', 'dialog')
  overlay.setAttribute('aria-label', 'whale club')
  overlay.innerHTML = `
    <button type="button" class="intro-skip">${voice.intro.skip}</button>
    <div class="intro-day" aria-hidden="true"></div>
    <div class="intro-creatures" aria-hidden="true">
      ${year.data.things.map((t) => `<span class="intro-creature" data-world="${t.world}" style="left:${String(CREATURE_X[t.world] * 100)}%"></span>`).join('')}
    </div>
    <p class="intro-line" aria-live="polite"></p>
    <div class="intro-truth">${voice.intro.truth.map((p) => `<p>${p}</p>`).join('')}</div>
    <button type="button" class="button-primary intro-start">${options.hasThings ? voice.intro.back : voice.intro.start}</button>
    <div class="intro-veil" aria-hidden="true"></div>`
  const q = (selector: string): HTMLElement => {
    const element = overlay.querySelector<HTMLElement>(selector)
    if (!element) throw new Error(`intro is missing ${selector}`)
    return element
  }
  const dayLabel = q('.intro-day')
  const line = q('.intro-line')
  const veil = q('.intro-veil')
  const creatures = [...overlay.querySelectorAll<HTMLElement>('.intro-creature')]

  let beat: Beat = 'promise'
  let handle: FrameHandle | null = null
  const timers: number[] = []
  const later = (ms: number, run: () => void): void => {
    timers.push(window.setTimeout(run, ms))
  }
  const stopTimers = (): void => {
    for (const t of timers.splice(0)) clearTimeout(t)
    handle?.remove()
    handle = null
  }

  // --- the promise --------------------------------------------------------------------------
  let shownDay = 0
  let findIndex = 0
  const drawDay = (day: number, flashes: boolean): void => {
    if (day === shownDay) return
    shownDay = day
    const until = addDays(year.start, day)
    const dates = year.dates.filter((d) => d <= until)
    scene.preview({
      dates,
      streak: streakDays(dates),
      today: until,
      lanterns: year.lanterns.filter((l) => l.date <= until),
    })
    dayLabel.textContent = voice.intro.day(day)
    year.data.things.forEach((thing, i) => {
      const element = creatures[i]
      if (!element) return
      // Day one is the beginning: an egg, a spark, a seed.
      const stage = day < 2 ? null : stageFor(last7(year.data, thing.id, until))
      const key = String(stage)
      if (element.dataset.stage === key) return
      element.dataset.stage = key
      element.innerHTML =
        stage === null ? beginningSvg(thing.world) : creatureSvg(thing.world, thing.line, stage)
    })
    // Every find reached by now opens as a flash; a few at most per frame.
    let fired = 0
    while (findIndex < year.finds.length && (year.finds[findIndex]?.date ?? '') <= until) {
      const find = year.finds[findIndex]
      findIndex++
      if (find && flashes && fired < 2) {
        scene.flash(find.x, find.y, find.world)
        fired++
      }
    }
  }

  const promise = (): void => {
    scene.setSilhouette(true)
    scene.setEmpty(false)
    overlay.dataset.beat = 'promise'
    if (reducedMotion()) {
      // Three still frames, faded into each other.
      STILL_DAYS.forEach((day, i) => {
        later(i * STILL_MS, () => {
          veil.classList.add('is-on')
          later(250, () => {
            drawDay(day, false)
            veil.classList.remove('is-on')
          })
        })
      })
      later(STILL_DAYS.length * STILL_MS, endOfYear)
      return
    }
    const startedAt = performance.now()
    handle = ticker.add((now) => {
      const t = Math.min(1, (now - startedAt) / PROMISE_MS)
      drawDay(Math.max(1, Math.round(1 + (YEAR - 1) * Math.pow(t, ACCELERATION))), true)
      if (t >= 1) {
        handle?.remove()
        handle = null
        endOfYear()
      }
    }, FPS)
  }

  const endOfYear = (): void => {
    drawDay(YEAR, false)
    scene.surfaceWhale(false)
    line.textContent = voice.intro.promise
    later(PROMISE_HOLD_MS, () => {
      go('truth')
    })
  }

  // --- the truth and the first step ---------------------------------------------------------
  const truth = (): void => {
    overlay.dataset.beat = 'truth'
    line.textContent = ''
    scene.preview(null)
    scene.setSilhouette(false)
    scene.setEmpty(!options.hasThings)
    overlay.dataset.part = '1'
    later(TRUTH_SECOND_MS, () => {
      overlay.dataset.part = '2'
    })
    later(TRUTH_MS, () => {
      go('start')
    })
  }

  const start = (): void => {
    overlay.dataset.beat = 'start'
    overlay.dataset.part = '2'
    q('.intro-start').focus()
  }

  const go = (next: Beat): void => {
    stopTimers()
    if (beat === 'promise' && next !== 'promise') {
      scene.preview(null)
      scene.setSilhouette(false)
      scene.setEmpty(!options.hasThings)
    }
    beat = next
    if (next === 'truth') truth()
    else start()
  }

  const end = (how: IntroEnd): void => {
    stopTimers()
    scene.preview(null)
    scene.setSilhouette(false)
    scene.setEmpty(!options.hasThings)
    markSeen()
    overlay.remove()
    app?.classList.remove('is-behind-intro')
    app?.removeAttribute('inert')
    options.onEnd(how)
  }

  // skip: the first time, on to the first step; from the first step, out.
  q('.intro-skip').addEventListener('click', () => {
    if (beat === 'start') end('skip')
    else go('start')
  })
  q('.intro-start').addEventListener('click', () => {
    end('start')
  })
  overlay.addEventListener('click', (event) => {
    if (event.target instanceof Element && event.target.closest('button')) return
    if (beat === 'promise') go('truth')
    else if (beat === 'truth') go('start')
  })

  host().append(overlay)
  app?.classList.add('is-behind-intro')
  app?.setAttribute('inert', '')
  promise()
}
