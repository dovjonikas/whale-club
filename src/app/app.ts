import { COLLECTIBLES, collectiblesFor } from '../scene/collectibles'
import { rarityOf } from '../scene/rarity'
import { Scene, type ShownCollectible } from '../scene/scene'
import type { StoneSpec } from '../scene/stones'
import { fromKey, todayKey } from '../store/dates'
import {
  allDoneToday,
  foundFor,
  isRestDay,
  last7,
  lineFor,
  missedYesterday,
  reachedOn,
  stageFor,
  starDays,
  streakDays,
  waitingTiers,
} from '../store/derive'
import { Store } from '../store/store'
import type { AppData, DateKey, Thing, World } from '../store/types'
import { pick, voice } from '../voice'
import { installNotice, listenForInstallPrompt } from '../pwa/install'
import { openAddSheet } from './addSheet'
import { animate } from './card'
import { checkinNotice } from './checkin'
import { openCollectionSheet } from './collectionSheet'
import { openDial } from './dial'
import { renderHeader } from './header'
import { host } from './host'
import { Line } from './line'
import { openMenuSheet } from './menuSheet'
import { Notices } from './notices'
import type { Moment } from './postcard'
import { Postcards } from './postcards'
import { recapNotice } from './recap'
import { Row } from './row'
import { elapsedMs, SessionService, totalMs, type Session } from './session'
import { openSessionScreen, type SessionScreen } from './sessionScreen'
import { openThingSheet } from './thingSheet'
import { Sound } from './sound'
import { surpriseFor } from './surprise'
import { showToast } from './toast'
import { keepAwake, letSleep } from './wakeLock'

const SURPRISE_DELAY_MS = 4000
const JACKET_ID = 'sea-a-jacket'
/** The postcard button waits for the moment's animation to finish. */
const OFFER_AFTER_WHALE_MS = 2200
const OFFER_AFTER_FIND_MS = 2800
const OFFER_AFTER_GROW_MS = 900

/** Wires the store, the scene, the row and the sheets together. One per page. */
export function startApp(root: HTMLElement): void {
  const store = new Store()
  const scene = new Scene(host(), (key) => {
    onCracked(key)
  })
  const sound = new Sound(!store.get().settings.sound)

  root.innerHTML = `
    <header class="header"></header>
    <div class="notice-slot"></div>
    <main class="stage"><div class="onboarding" hidden><p></p><small></small></div></main>
    <div class="bottom">
      <div class="offer-slot"></div>
      <p class="line"></p>
      <div class="row" role="group" aria-label="your homework"></div>
      <div class="not-today" hidden></div>
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

  let surprisedFor: DateKey | null = null
  // Stones that fell in during a render, held until the tap handler says the line.
  const pendingFalls: string[] = []
  // A find on its way out of its stone: where the stone was, for the arrival.
  const arrivals = new Map<string, { x: number; y: number }>()

  const row = new Row(query(root, '.row'), query(root, '.not-today'), {
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
    onLockIn(thing) {
      const data = store.get()
      openDial(
        thing,
        { line: lineFor(data, thing), stage: stageFor(last7(data, thing.id, todayKey())) },
        (minutes) => {
          store.setThingMinutes(thing.id, minutes)
          sessions.start(thing.id, minutes)
          openSession(thing)
        },
      )
    },
    onEdit(thing) {
      openThingSheet(store, thing)
    },
    onAlsoToday(thing) {
      store.setToday(thing.id, 'extra')
      line.say(`${thing.emoji} ${thing.name}: ${voice.days.alsoToday}.`, { quiet: true })
    },
    onAdd() {
      openAddSheet(store, (thing) => {
        line.say(pick(voice.thingAdded, thing.id))
      })
    },
  })

  /**
   * Everything a done tap can set off. The scene shows all of it; the line
   * says the rarest: a stone falling in, else the whole day done, else a
   * creature that grew, else the tap itself. A moment worth showing gets
   * the postcard button once its animation is over.
   */
  function celebrate(thing: Thing, card: HTMLElement, stageBefore: number): void {
    const data = store.get()
    const today = todayKey()
    postcards.clearOffer()
    animate(card, 'is-jumping')
    const rect = card.getBoundingClientRect()
    scene.burst(thing.world, rect.left + rect.width / 2, rect.top + 8)

    const fell = pendingFalls.splice(0)
    const grew = stageFor(last7(data, thing.id, today)) > stageBefore
    const done = allDoneToday(data, today)
    if (done) {
      scene.surfaceWhale(hasJacket(data))
      sound.play('whale')
    }
    let said: string
    if (fell.length > 0) {
      sound.play('unlock')
      said = voice.stones.fell
    } else if (done) {
      said = voice.allDone
    } else if (grew) {
      sound.play('grow')
      said = voice.stageUp
    } else {
      sound.play('tap', thing.world)
      said = pick(voice.tap[thing.world], today + thing.id)
    }
    line.say(said)

    if (done)
      postcards.offer({ kind: 'whale', line: said }, voice.postcard.sendWhale, OFFER_AFTER_WHALE_MS)
    else if (grew && fell.length === 0)
      postcards.offer({ kind: 'stage', line: said }, voice.postcard.sendWhale, OFFER_AFTER_GROW_MS)
    maybeSurprise(data, today)
  }

  /** A stone was cracked: the find comes out of the light, is polished, and settles. */
  function onCracked(key: string): void {
    const [thingId, tierText] = key.split(':')
    const tier = Number(tierText)
    const data = store.get()
    const thing = data.things.find((t) => t.id === thingId)
    if (!thing) return
    const item = collectiblesFor(thing.world, lineFor(data, thing)).find((c) => c.days === tier)
    const where = scene.stoneRect(key)
    const sceneRect = scene.root.getBoundingClientRect()
    if (item && where) {
      arrivals.set(item.id, {
        x: where.left - sceneRect.left + where.width / 2,
        y: where.top - sceneRect.top + where.height / 2,
      })
      scene.burst(thing.world, where.left + where.width / 2, where.top + where.height / 2, 28)
    }
    store.crack(thing.id, tier)
    sound.play('unlock')
    if (item) {
      const said = voice.unlock(item.name)
      line.say(said)
      postcards.offer({ kind: 'unlock', line: said }, voice.postcard.sendThis, OFFER_AFTER_FIND_MS)
    }
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

  // --- Lock in ---------------------------------------------------------------------------------

  let screen: SessionScreen | null = null

  const sessions = new SessionService({
    tick(session, elapsed) {
      screen?.update(elapsed / totalMs(session), totalMs(session) - elapsed, waitedAt(session))
    },
    left() {
      screen?.left()
    },
    finish(session, clean) {
      finishSession(session, clean)
    },
  })

  function waitedAt(session: Session): number | null {
    return session.brokenAtMs === undefined ? null : session.brokenAtMs / totalMs(session)
  }

  function openSession(thing: Thing): void {
    const data = store.get()
    postcards.clearOffer()
    screen?.close()
    scene.setSession(true)
    keepAwake()
    sound.setSea(data.settings.sessionSound === true)
    screen = openSessionScreen(thing, lineFor(data, thing), {
      sound: data.settings.sessionSound === true,
      onSound(on) {
        store.setSettings({ sessionSound: on })
        sound.setSea(on)
      },
      onStop() {
        const stopped = sessions.stop()
        const minutes = stopped ? Math.floor(elapsedMs(stopped) / 60_000) : 0
        if (stopped) store.addMinutes(stopped.thingId, minutes)
        closeSession()
        line.say(voice.lockIn.stopped(minutes), { quiet: true })
      },
    })
    const session = sessions.current()
    if (session) {
      const elapsed = elapsedMs(session)
      screen.update(elapsed / totalMs(session), totalMs(session) - elapsed, waitedAt(session))
      if (session.broken) screen.left()
    }
  }

  function closeSession(): void {
    screen?.close()
    screen = null
    scene.setSession(false)
    sound.setSea(false)
    letSleep()
  }

  function finishSession(session: Session, clean: boolean): void {
    const thing = store.get().things.find((t) => t.id === session.thingId)
    if (!thing) {
      closeSession()
      return
    }
    if (!screen) openSession(thing)
    const before = stageFor(last7(store.get(), thing.id, todayKey()))
    store.finishSession(thing.id, session.minutes, clean)
    sound.setSea(false)
    letSleep()
    sound.play(clean ? 'whale' : 'timer')
    const said = clean ? voice.timerEnd : voice.lockIn.broken
    const moment: Moment = allDoneToday(store.get(), todayKey())
      ? { kind: 'whale', line: said }
      : { kind: 'stage', line: said }
    screen?.end(
      clean,
      said,
      () => {
        postcards.sendNow(moment)
      },
      closeSession,
    )
    const card = row.card(thing.id)
    if (card && clean) {
      animate(card, 'is-jumping')
      if (stageFor(last7(store.get(), thing.id, todayKey())) > before) animate(card, 'is-growing')
    }
    scene.setSession(false)
    // The screen stays until the person goes back to the sea; the whale is already up behind it.
    if (allDoneToday(store.get(), todayKey())) scene.surfaceWhale(hasJacket(store.get()))
  }

  // --- Render ----------------------------------------------------------------------------------

  function render(data: AppData): void {
    const today = todayKey()
    onboarding.hidden = data.things.length > 0
    scene.setEmpty(data.things.length === 0)
    row.render(data)

    const stars = starDays(data)
    scene.setDays(
      { dates: stars, streak: streakDays(stars), today, label: (date) => dayLabel(data, date) },
      (date) => {
        showToast(dayLabel(data, date))
      },
    )

    scene.setCollectibles(shownCollectibles(data), arrivals)
    arrivals.clear()
    const fell = scene.setStones(stonesFor(data))
    pendingFalls.push(...fell)
    scene.setWarmth(warmthOf(data))

    const nothingToday = (data.days[today]?.done.length ?? 0) === 0
    scene.setQuiet(nothingToday && missedYesterday(data, today))
    root.dataset.rest = String(isRestDay(data, today))
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

  const resumed = sessions.resume()
  if (resumed) {
    const thing = store.get().things.find((t) => t.id === resumed.thingId)
    if (thing) openSession(thing)
    else sessions.stop()
  }

  const opening = store.get()
  if (isRestDay(opening, todayKey())) line.say(voice.restDay, { quiet: true })
  else if (missedYesterday(opening, todayKey())) line.say(voice.missedDay, { quiet: true })
}

function shownCollectibles(data: AppData): ShownCollectible[] {
  const shown: ShownCollectible[] = []
  for (const thing of data.things) {
    const found = new Set(foundFor(data, thing, COLLECTIBLES))
    for (const item of COLLECTIBLES) {
      if (!found.has(item.id)) continue
      shown.push({ item, rarity: rarityOf(item.id, reachedOn(data, thing.id, item.days)) })
    }
  }
  return shown
}

/**
 * Where each waiting stone lies: sea stones float at the water line, sky
 * stones hang in the lower sky, garden stones lie on the sand. Spread by
 * the thing's place in the row so two things' stones do not overlap.
 */
function stonesFor(data: AppData): StoneSpec[] {
  const specs: StoneSpec[] = []
  const Y: Record<World, number> = { sea: 0.605, sky: 0.4, garden: 0.585 }
  for (const thing of data.things) {
    waitingTiers(data, thing.id).forEach((tier, i) => {
      specs.push({
        key: `${thing.id}:${String(tier)}`,
        world: thing.world,
        x: 0.12 + ((thing.order * 0.21 + i * 0.12) % 0.78),
        y: Y[thing.world] - (thing.world === 'sky' ? i * 0.05 : 0),
        label: voice.stones.label(thing.name),
      })
    })
  }
  return specs
}

/** The shore glows warmer the more of the garden has been found. */
function warmthOf(data: AppData): number {
  const garden = data.things.filter((t) => t.world === 'garden')
  const found = garden.reduce((n, t) => n + foundFor(data, t, COLLECTIBLES).length, 0)
  return 0.25 + Math.min(found, 6) * 0.125
}

function hasJacket(data: AppData): boolean {
  return data.things.some((t) => foundFor(data, t, COLLECTIBLES).includes(JACKET_ID))
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
