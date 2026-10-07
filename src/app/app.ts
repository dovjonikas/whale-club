import { COLLECTIBLES, type Collectible } from '../scene/collectibles'
import { Scene } from '../scene/scene'
import { fromKey, todayKey } from '../store/dates'
import {
  allDoneToday,
  last7,
  lineFor,
  missedYesterday,
  stageFor,
  starDays,
  streakDays,
  unlockedFor,
} from '../store/derive'
import { Store } from '../store/store'
import type { AppData, DateKey, Thing } from '../store/types'
import { pick, voice } from '../voice'
import { installNotice, listenForInstallPrompt } from '../pwa/install'
import { openAddSheet } from './addSheet'
import { animate } from './card'
import { checkinNotice } from './checkin'
import { openCollectionSheet } from './collectionSheet'
import { renderHeader } from './header'
import { host } from './host'
import { Line } from './line'
import { openMenuSheet } from './menuSheet'
import { Notices } from './notices'
import type { Moment } from './postcard'
import { Postcards } from './postcards'
import { recapNotice } from './recap'
import { Row } from './row'
import { Sound } from './sound'
import { surpriseFor } from './surprise'
import { TimerService } from './timer'
import { showTimerRun, type TimerRunHandle } from './timerRun'
import { openTimerSheet } from './timerSheet'
import { showToast } from './toast'

const SURPRISE_DELAY_MS = 4000
const JACKET_ID = 'sea-a-jacket'
/** The postcard button waits for the moment's animation to finish. */
const OFFER_AFTER_WHALE_MS = 2200
const OFFER_AFTER_UNLOCK_MS = 1400
const OFFER_AFTER_GROW_MS = 900

/** Wires the store, the scene, the row and the sheets together. One per page. */
export function startApp(root: HTMLElement): void {
  const store = new Store()
  const scene = new Scene(host())
  const timers = new TimerService()
  const sound = new Sound(!store.get().settings.sound)

  root.innerHTML = `
    <header class="header"></header>
    <main class="stage"><div class="onboarding" hidden><p></p><small></small></div></main>
    <div class="bottom">
      <div class="offer-slot"></div>
      <p class="line"></p>
      <div class="notice-slot"></div>
      <div class="row" role="group" aria-label="your homework"></div>
    </div>`

  const line = new Line(query(root, '.line'))
  const onboarding = query(root, '.onboarding')
  query(onboarding, 'p').textContent = voice.firstOpen
  query(onboarding, 'small').textContent = voice.example
  const notices = new Notices(query(root, '.notice-slot'))
  const postcards = new Postcards(store, scene, line, query(root, '.offer-slot'))

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
      onSend() {
        postcards.sendNow({ kind: 'sea', line: line.current() || voice.postcard.sea })
      },
      onMenu() {
        openMenuSheet(store)
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
        postcards.clearOffer()
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
   * timer's end, else a creature that grew, else the tap itself. A moment
   * worth showing gets the postcard button once its animation is over.
   */
  function celebrate(
    thing: Thing,
    card: HTMLElement,
    stageBefore: number,
    source: 'tap' | 'timer' = 'tap',
  ): void {
    const data = store.get()
    const today = todayKey()
    postcards.clearOffer()
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
    let said: string
    if (fresh.length > 0) {
      sound.play('unlock')
      said = voice.unlock(fresh.map((c) => c.name).join(', '))
    } else if (done) {
      said = voice.allDone
    } else if (source === 'timer') {
      said = voice.timerEnd
    } else if (grew) {
      sound.play('grow')
      said = voice.stageUp
    } else {
      sound.play('tap', thing.world)
      said = pick(voice.tap[thing.world], today + thing.id)
    }
    line.say(said)
    for (const item of fresh) {
      const where = scene.collectibleRect(item.id)
      if (where) scene.burst(item.world, where.left + where.width / 2, where.top + where.height / 2)
    }

    const moment: Moment | null = done
      ? { kind: 'whale', line: said }
      : fresh.length > 0
        ? { kind: 'unlock', line: said }
        : grew
          ? { kind: 'stage', line: said }
          : null
    if (moment) {
      const label = fresh.length > 0 ? voice.postcard.sendThis : voice.postcard.sendWhale
      const delay = done
        ? OFFER_AFTER_WHALE_MS
        : fresh.length > 0
          ? OFFER_AFTER_UNLOCK_MS
          : OFFER_AFTER_GROW_MS
      postcards.offer(moment, label, delay)
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
      { dates: stars, streak: streakDays(stars), today, label: (date) => dayLabel(data, date) },
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
    notices.offer([
      installNotice(store),
      recapNotice(store, (moment) => {
        postcards.sendNow(moment)
      }),
      checkinNotice(store, sound),
    ])
  }

  store.subscribe(render)
  render(store.get())
  listenForInstallPrompt(() => {
    notices.render()
  })

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

function query(parent: ParentNode, selector: string): HTMLElement {
  const element = parent.querySelector<HTMLElement>(selector)
  if (!element) throw new Error(`missing ${selector}`)
  return element
}
