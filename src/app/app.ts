import { collectibleSvg, collectiblesFor } from '../scene/collectibles'
import { Scene } from '../scene/scene'
import { todayKey } from '../store/dates'
import {
  allDoneToday,
  isRestDay,
  last7,
  lineFor,
  missedYesterday,
  plannedThings,
  stageFor,
  starDays,
  streakDays,
} from '../store/derive'
import { labOn } from '../store/lab'
import { Store } from '../store/store'
import { emptyData } from '../store/types'
import { seedHistory } from '../lab/seed'
import { enterLabFromMenu, startLabUi } from '../lab/labUi'
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
import { LockIn } from './lockIn'
import { openHowItWorks } from './howItWorks'
import { introDue, playIntro } from './intro'
import { openLogSheet } from './logSheet'
import { openMenuSheet } from './menuSheet'
import { Notices } from './notices'
import { Postcards } from './postcards'
import { recapNotice } from './recap'
import { Row } from './row'
import {
  dayLabel,
  hasJacket,
  lanternsFor,
  nextFind,
  shownCollectibles,
  stonesFor,
  warmthOf,
} from './sceneData'
import { openThingSheet } from './thingSheet'
import { Sound } from './sound'
import { showUndo } from './toast'
import { surpriseFor } from './surprise'

const SURPRISE_DELAY_MS = 4000
/** The postcard button waits for the moment's animation to finish. */
const OFFER_AFTER_WHALE_MS = 2200
const OFFER_AFTER_FIND_MS = 2800
const OFFER_AFTER_GROW_MS = 900
/** How long a deleted card takes to swim off. */
const LEAVE_MS = 380

/** Wires the store, the scene, the row and the sheets together. One per page. */
export function startApp(root: HTMLElement, labEntered = false): void {
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
      <div class="row-tools"><div class="next-slot"></div></div>
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
        openMenuSheet(store, {
          onLab: enterLabFromMenu,
          onLog: () => {
            openLogSheet(store)
          },
          onHow: () => {
            openHowItWorks(intro)
          },
        })
      },
    },
    sound.isMuted(),
  )

  let surprisedFor: DateKey | null = null
  // Stones that fell in during a render, held until the tap handler says the line.
  const pendingFalls: string[] = []
  // A find on its way out of its stone: where the stone was, for the arrival.
  const arrivals = new Map<string, { x: number; y: number }>()

  /** Says a mechanic's one line the first time it shows, and never again. */
  function explainOnce(key: string, text: string): boolean {
    const explained = store.get().settings.explained ?? []
    if (explained.includes(key)) return false
    store.setSettings({ explained: [...explained, key] })
    line.say(text)
    return true
  }

  /**
   * Delete without "are you sure": the card swims off, the line says the
   * days stay, and "undo" waits ten seconds at the bottom.
   */
  function deleteThing(thing: Thing, card?: HTMLElement): void {
    const go = (): void => {
      const removed = store.removeThing(thing.id)
      if (!removed) return
      line.say(voice.edit.deleted, { quiet: true })
      showUndo(voice.edit.deleted, voice.edit.undo, () => {
        store.restoreThing(removed)
      })
    }
    if (!card) {
      go()
      return
    }
    card.classList.add('is-leaving')
    setTimeout(go, LEAVE_MS)
  }

  function openThing(thing: Thing): void {
    openThingSheet(store, thing, {
      onDelete: (t) => {
        deleteThing(t, row.card(t.id))
      },
      onSay: (said) => {
        line.say(said, { quiet: true })
      },
    })
  }

  const row = new Row(query(root, '.row'), query(root, '.not-today'), query(root, '.row-tools'), {
    onTap(thing, card) {
      card.querySelector('.card-hint')?.remove()
      if (thing.kind === 'lockIn') {
        lockIn.tap(thing)
        return
      }
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
    onEdit(thing) {
      openThing(thing)
    },
    onDelete(thing, card) {
      deleteThing(thing, card)
    },
    onAlsoToday(thing) {
      store.setToday(thing.id, 'extra')
      line.say(`${thing.name}: ${voice.days.alsoToday}.`, { quiet: true })
    },
    onAdd() {
      openAddSheet(store, added)
    },
  })

  /**
   * A thing was added. The very first one is welcomed with one line, and
   * its card says once how it is done.
   */
  function added(thing: Thing): void {
    if (!explainOnce('yours', voice.explain.yours)) {
      line.say(pick(voice.thingAdded, thing.id))
      return
    }
    const card = row.card(thing.id)
    if (!card) return
    const hint = document.createElement('span')
    hint.className = 'card-hint'
    hint.textContent = thing.kind === 'lockIn' ? voice.card.hintLockIn : voice.card.hintTap
    card.append(hint)
  }

  const lockIn = new LockIn({
    store,
    scene,
    sound,
    line,
    row,
    postcards,
    onKept: () => {
      explainOnce('kept', voice.explain.kept)
    },
  })
  // The open sky is the way into the log, as the stars are into their days.
  scene.onSky(() => {
    openLogSheet(store)
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
    const explained = data.settings.explained ?? []
    if (fell.length > 0) {
      sound.play('unlock')
      said = explained.includes('stone') ? voice.stones.fell : voice.explain.stone
      if (!explained.includes('stone')) store.setSettings({ explained: [...explained, 'stone'] })
    } else if (done) {
      said = voice.allDone
    } else if (starDays(data).length === 1 && !explained.includes('firstStar')) {
      // The very first star: a little more light, once.
      sound.play('grow')
      said = voice.explain.firstStar
      store.setSettings({ explained: [...explained, 'firstStar'] })
      scene.glow()
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
        openLogSheet(store, date)
      },
    )

    scene.setLanterns(lanternsFor(data))
    renderNext(data)
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

  /** The next find's silhouette and the days to it, always in sight; a tap opens the Collection. */
  const nextSlot = query(root, '.next-slot')
  function renderNext(data: AppData): void {
    const next = nextFind(data)
    if (!next) {
      nextSlot.replaceChildren()
      return
    }
    const text = voice.nextFind(next.days)
    const button =
      nextSlot.querySelector<HTMLButtonElement>('.next-find') ?? document.createElement('button')
    if (!button.isConnected) {
      button.type = 'button'
      button.className = 'next-find'
      button.addEventListener('click', () => {
        openCollectionSheet(store)
      })
      nextSlot.append(button)
    }
    if (button.dataset.item !== next.item.id || button.dataset.days !== String(next.days)) {
      button.dataset.item = next.item.id
      button.dataset.days = String(next.days)
      button.innerHTML = `<span class="next-art" aria-hidden="true">${collectibleSvg(next.item)}</span><span class="next-text"></span>`
      const label = button.querySelector('.next-text')
      if (label) label.textContent = text
    }
  }

  store.subscribe(render)
  render(store.get())
  listenForInstallPrompt(() => {
    notices.render()
  })

  lockIn.settle()

  /** The first minute: on a first open, from "how it works", or from the lab. */
  function intro(): void {
    playIntro(scene, {
      hasThings: store.get().things.length > 0,
      sound,
      onEnd: (end) => {
        if (end === 'start' && store.get().things.length === 0)
          openAddSheet(store, added, { starters: true })
      },
    })
  }
  // In the lab the intro plays only when asked for ("first open again"), never over its sheet.
  if ((introDue(store.get()) && !labOn()) || takeIntroRequest()) intro()

  const opening = store.get()
  if (isRestDay(opening, todayKey())) line.say(voice.restDay, { quiet: true })
  else if (missedYesterday(opening, todayKey())) line.say(voice.missedDay, { quiet: true })

  // --- The lab (only ever on in the sandbox; see src/store/lab.ts) ------------------------------

  startLabUi(
    {
      doAll() {
        const today = todayKey()
        const data = store.get()
        const open = plannedThings(data, today).filter(
          (t) => !data.days[today]?.done.includes(t.id),
        )
        for (const thing of open) {
          // A lock-in counts as a full session that ran to its end.
          if (thing.kind === 'lockIn')
            store.finishLockIn(thing.id, { seen: thing.minutes, minutes: thing.minutes, parts: 1 })
          else store.toggleDone(thing.id)
        }
        pendingFalls.length = 0
        if (open.length > 0 && allDoneToday(store.get(), today)) {
          scene.surfaceWhale(hasJacket(store.get()))
          line.say(voice.allDone)
        }
      },
      seed(days) {
        store.replace(seedHistory(store.get(), todayKey(), days))
        pendingFalls.length = 0
      },
      clear() {
        store.replace(emptyData())
        pendingFalls.length = 0
      },
      firstOpen() {
        store.replace(emptyData())
        try {
          sessionStorage.setItem(INTRO_REQUEST, '1')
        } catch {
          // Without session storage the intro plays now instead, without the reload.
          intro()
          return
        }
        location.reload()
      },
    },
    labEntered,
  )
}

/** The lab's "first open again" asks for the intro across its reload. */
const INTRO_REQUEST = 'whaleclub:intro.now'

function takeIntroRequest(): boolean {
  try {
    const asked = sessionStorage.getItem(INTRO_REQUEST) !== null
    sessionStorage.removeItem(INTRO_REQUEST)
    return asked
  } catch {
    return false
  }
}

function query(parent: ParentNode, selector: string): HTMLElement {
  const element = parent.querySelector<HTMLElement>(selector)
  if (!element) throw new Error(`missing ${selector}`)
  return element
}
