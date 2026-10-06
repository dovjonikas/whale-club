import { COLLECTIBLES, type Collectible } from '../scene/collectibles'
import { Scene } from '../scene/scene'
import { addDays, fromKey, todayKey } from '../store/dates'
import {
  allDoneToday,
  last7,
  lineFor,
  missedYesterday,
  stageFor,
  starDays,
  unlockedFor,
} from '../store/derive'
import { Store } from '../store/store'
import type { AppData, DateKey, Thing } from '../store/types'
import { pick, voice } from '../voice'
import { setupInstallLeaf } from '../pwa/install'
import { openAddSheet } from './addSheet'
import { animate } from './card'
import { checkinNotice } from './checkin'
import { openCollectionSheet } from './collectionSheet'
import { renderHeader } from './header'
import { Line } from './line'
import { Notices } from './notices'
import { recapNotice } from './recap'
import { Row } from './row'
import { openRulesSheet } from './rulesSheet'
import { shareScene } from './share'
import { Sound } from './sound'
import { surpriseFor } from './surprise'
import { TimerService } from './timer'
import { showTimerRun, type TimerRunHandle } from './timerRun'
import { openTimerSheet } from './timerSheet'
import { showToast } from './toast'

const SURPRISE_DELAY_MS = 4000
const JACKET_ID = 'sea-a-jacket'

/** Wires the store, the scene, the row and the sheets together. One per page. */
export function startApp(root: HTMLElement): void {
  const store = new Store()
  const scene = new Scene(document.body)
  const timers = new TimerService()
  const sound = new Sound(!store.get().settings.sound)

  root.innerHTML = `
    <header class="header"></header>
    <main class="stage"><div class="onboarding" hidden><p></p><small></small></div></main>
    <div class="bottom">
      <p class="line"></p>
      <div class="notice-slot"></div>
      <div class="row" role="list" aria-label="your homework"></div>
    </div>`

  const line = new Line(query(root, '.line'))
  const onboarding = query(root, '.onboarding')
  query(onboarding, 'p').textContent = voice.firstOpen
  query(onboarding, 'small').textContent = voice.example
  const notices = new Notices(query(root, '.notice-slot'))

  // iOS only allows sound after a gesture; the first touch anywhere opens the gate.
  document.addEventListener(
    'pointerdown',
    () => {
      sound.unlock()
    },
    { passive: true },
  )

  renderHeader(
    query(root, '.header'),
    {
      onSound(button) {
        const muted = !sound.isMuted()
        sound.setMuted(muted)
        store.setSettings({ sound: !muted })
        button.setAttribute('aria-pressed', String(!muted))
        if (!muted) sound.play('tap', 'sky')
      },
      onCollection() {
        openCollectionSheet(store)
      },
      onRules() {
        openRulesSheet(store)
      },
      onShare() {
        shareScene(scene, store.get())
          .then((how) => {
            if (how === 'downloaded') line.say(voice.shareDone)
          })
          .catch(() => {
            showToast(voice.shareFailed)
          })
      },
    },
    sound.isMuted(),
  )

  let running: TimerRunHandle | null = null
  let surprisedFor: DateKey | null = null
  // Unlocks found by a render are held until the tap handler says the line.
  const pendingUnlocks: Collectible[] = []

  const row = new Row(query(root, '.row'), {
    onTap(thing, card) {
      const before = stageFor(last7(store.get(), thing.id, todayKey()))
      const done = store.toggleDone(thing.id)
      if (!done) {
        sound.play('untap')
        line.say(voice.untap)
        return
      }
      celebrate(thing, card, before)
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

  /**
   * Everything a done tap can set off. The scene shows all of it; the line
   * says the rarest: a new collectible, else the whole day done, else the
   * timer's end, else a creature that grew, else the tap itself.
   */
  function celebrate(
    thing: Thing,
    card: HTMLElement,
    stageBefore: number,
    source: 'tap' | 'timer' = 'tap',
  ): void {
    const data = store.get()
    const today = todayKey()
    animate(card, 'is-jumping')
    const rect = card.getBoundingClientRect()
    scene.burst(thing.world, rect.left + rect.width / 2, rect.top + 8)

    const fresh = pendingUnlocks.splice(0)
    const grew = stageFor(last7(data, thing.id, today)) > stageBefore
    const done = allDoneToday(data, today)
    if (done) {
      scene.surfaceWhale(hasJacket(data))
      sound.play('whale')
    }
    if (fresh.length > 0) {
      sound.play('unlock')
      line.say(voice.unlock(fresh.map((c) => c.name).join(', ')))
    } else if (done) {
      line.say(voice.allDone)
    } else if (source === 'timer') {
      line.say(voice.timerEnd)
    } else if (grew) {
      sound.play('grow')
      line.say(voice.stageUp)
    } else {
      sound.play('tap', thing.world)
      line.say(pick(voice.tap[thing.world], today + thing.id))
    }
    for (const item of fresh) {
      const where = scene.collectibleRect(item.id)
      if (where) scene.burst(item.world, where.left + where.width / 2, where.top + where.height / 2)
    }
    maybeSurprise(data, today)
  }

  /** Once a day, after the first thing done: something new in the scene. */
  function maybeSurprise(data: AppData, today: DateKey): void {
    if (surprisedFor === today) return
    if ((data.days[today]?.done.length ?? 0) !== 1) return
    surprisedFor = today
    const surprise = surpriseFor(today)
    setTimeout(() => {
      if (surprise.kind === 'fact') line.say(surprise.text, { quiet: true })
      else if (surprise.kind === 'visitor') scene.visit(surprise.visitor)
      else scene.glow()
    }, SURPRISE_DELAY_MS)
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
    const before = thing ? stageFor(last7(store.get(), thing.id, todayKey())) : 0
    store.recordMinutes(timer.thingId, timer.minutes)
    sound.play('timer')
    const card = row.card(timer.thingId)
    if (thing && card) celebrate(thing, card, before, 'timer')
    else line.say(voice.timerEnd)
  })

  function render(data: AppData): void {
    const today = todayKey()
    onboarding.hidden = data.things.length > 0
    row.render(data)

    const stars = starDays(data)
    scene.setDays(
      { dates: stars, streak: constellations(stars), today, label: (date) => dayLabel(data, date) },
      (date) => {
        showToast(dayLabel(data, date))
      },
    )

    const unlocked = new Set(data.things.flatMap((t) => unlockedFor(data, t, COLLECTIBLES)))
    const fresh = scene.setCollectibles(COLLECTIBLES.filter((c) => unlocked.has(c.id)))
    for (const id of fresh) {
      const item = COLLECTIBLES.find((c) => c.id === id)
      if (item) pendingUnlocks.push(item)
    }

    const nothingToday = (data.days[today]?.done.length ?? 0) === 0
    scene.setQuiet(nothingToday && missedYesterday(data, today))
    notices.offer([recapNotice(store), checkinNotice(store, sound)])
  }

  store.subscribe(render)
  render(store.get())
  setupInstallLeaf(query(root, '.notice-slot'), store)

  const resumed = timers.resume()
  if (resumed) {
    const thing = store.get().things.find((t) => t.id === resumed.thingId)
    if (thing) openRun(thing, resumed.startedAt + resumed.minutes * 60_000 - Date.now())
    else timers.cancel()
  }

  if (missedYesterday(store.get(), todayKey())) line.say(voice.missedDay, { quiet: true })
}

function hasJacket(data: AppData): boolean {
  return data.things.some((t) => unlockedFor(data, t, COLLECTIBLES).includes(JACKET_ID))
}

/** "Tue 3 Nov: run, read" for a star's label and its tap. */
function dayLabel(data: AppData, date: DateKey): string {
  const when = fromKey(date).toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
  const names = (data.days[date]?.done ?? [])
    .map((id) => data.things.find((t) => t.id === id)?.name)
    .filter((name): name is string => typeof name === 'string')
  return names.length > 0 ? `${when}: ${names.join(', ')}` : when
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
