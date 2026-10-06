import { Scene } from '../scene/scene'
import { addDays, todayKey } from '../store/dates'
import { allDoneToday, last7, lineFor, missedYesterday, stageFor, starDays } from '../store/derive'
import { Store } from '../store/store'
import type { AppData, DateKey, Thing } from '../store/types'
import { pick, voice } from '../voice'
import { setupInstallLeaf } from '../pwa/install'
import { openAddSheet } from './addSheet'
import { BRAND } from './brand'
import { animate } from './card'
import { Line } from './line'
import { Row } from './row'
import { TimerService } from './timer'
import { showTimerRun, type TimerRunHandle } from './timerRun'
import { openTimerSheet } from './timerSheet'

/** Wires the store, the scene and the row together. One of these per page. */
export function startApp(root: HTMLElement): void {
  const store = new Store()
  const scene = new Scene(document.body)
  const timers = new TimerService()

  root.innerHTML = `
    <header class="header">
      <h1 class="title">${BRAND.name}</h1>
      <div class="header-actions"></div>
    </header>
    <main class="stage"><div class="onboarding" hidden><p></p><small></small></div></main>
    <div class="bottom">
      <p class="line"></p>
      <div class="install-slot"></div>
      <div class="row" role="list" aria-label="your homework"></div>
    </div>`

  const line = new Line(query(root, '.line'))
  const onboarding = query(root, '.onboarding')
  query(onboarding, 'p').textContent = voice.firstOpen
  query(onboarding, 'small').textContent = voice.example

  let running: TimerRunHandle | null = null

  const row = new Row(query(root, '.row'), {
    onTap(thing, card) {
      const done = store.toggleDone(thing.id)
      if (!done) {
        line.say(voice.untap)
        return
      }
      celebrate(thing, card)
    },
    onLongPress(thing) {
      openTimerSheet(thing, (minutes) => {
        const timer = timers.start(thing.id, minutes)
        line.say(voice.timerStart)
        openRun(thing, timer.minutes * 60_000)
      })
    },
    onAdd() {
      openAddSheet(store, (thing) => {
        line.say(pick(voice.thingAdded, thing.id))
      })
    },
  })

  function celebrate(thing: Thing, card: HTMLElement): void {
    animate(card, 'is-jumping')
    const rect = card.getBoundingClientRect()
    scene.burst(thing.world, rect.left + rect.width / 2, rect.top + 8)
    const today = todayKey()
    if (allDoneToday(store.get(), today)) line.say(voice.allDone)
    else line.say(pick(voice.tap[thing.world], today + thing.id))
  }

  function openRun(thing: Thing, remainingMs: number): void {
    const data = store.get()
    const look = { line: lineFor(data, thing), stage: stageFor(last7(data, thing.id, todayKey())) }
    running?.close()
    running = showTimerRun(thing, look, remainingMs, () => {
      timers.cancel()
      running?.close()
      running = null
      line.clear()
    })
  }

  timers.onTick((ms) => running?.update(ms))
  timers.onFinish((timer) => {
    running?.close()
    running = null
    const thing = store.get().things.find((t) => t.id === timer.thingId)
    store.recordMinutes(timer.thingId, timer.minutes)
    const card = row.card(timer.thingId)
    if (thing && card) celebrate(thing, card)
    line.say(voice.timerEnd)
  })

  function render(data: AppData): void {
    const today = todayKey()
    onboarding.hidden = data.things.length > 0
    row.render(data)
    const stars = starDays(data)
    scene.setDays(stars, constellations(stars), today)
    const nothingToday = (data.days[today]?.done.length ?? 0) === 0
    scene.setQuiet(nothingToday && missedYesterday(data, today))
  }

  store.subscribe(render)
  render(store.get())
  setupInstallLeaf(query(root, '.install-slot'), store)

  const resumed = timers.resume()
  if (resumed) {
    const thing = store.get().things.find((t) => t.id === resumed.thingId)
    if (thing) openRun(thing, resumed.startedAt + resumed.minutes * 60_000 - Date.now())
    else timers.cancel()
  }

  if (missedYesterday(store.get(), todayKey())) line.say(voice.missedDay, { quiet: true })
}

/** Runs of three or more consecutive star days are joined into constellations. */
function constellations(stars: readonly DateKey[]): Set<DateKey> {
  const linked = new Set<DateKey>()
  let run: DateKey[] = []
  const flush = (): void => {
    if (run.length >= 3) for (const d of run) linked.add(d)
    run = []
  }
  for (const date of stars) {
    const previous = run[run.length - 1]
    if (previous !== undefined && addDays(previous, 1) !== date) flush()
    run.push(date)
  }
  flush()
  return linked
}

function query(parent: ParentNode, selector: string): HTMLElement {
  const element = parent.querySelector<HTMLElement>(selector)
  if (!element) throw new Error(`missing ${selector}`)
  return element
}
