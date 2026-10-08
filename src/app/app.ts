import { collectibleSvg, collectiblesFor } from '../scene/collectibles'
import { Scene } from '../scene/scene'
import { CHEST } from '../scene/spots'
import { legendaryFor } from '../scene/legendary'
import { halfwayStar, pathLength, progressOf, reachesOf } from '../store/paths'
import { playCeremony } from './ceremony'
import { setDayEndsAt, setWeekStartsOn, todayKey, writtenDate } from '../store/dates'
import {
  allDoneToday,
  isRestDay,
  last7,
  lineFor,
  missedYesterday,
  plannedThings,
  stageFor,
  starDays,
} from '../store/derive'
import { labOn } from '../store/lab'
import { Store } from '../store/store'
import { emptyData } from '../store/types'
import { addStars, seedHistory } from '../lab/seed'
import { enterLabFromMenu, startLabUi } from '../lab/labUi'
import type { AppData, DateKey, Thing } from '../store/types'
import { pick, voice } from '../voice'
import { installNotice, listenForInstallPrompt } from '../pwa/install'
import { openAddSheet } from './addSheet'
import { animate } from './card'
import { checkinNotice } from './checkin'
import { chapterNotice } from './chapter'
import { watchBadge } from './badge'
import { openCollectionSheet } from './collectionSheet'
import { openDockSheet } from './dockSheet'
import { backupStale, clearUndo, openSettingsSheet } from './settingsSheet'
import { openArrange, type ArrangeOptions } from './arrange'
import { shownItems } from './dockData'
import type { DockItem } from '../scene/dock'
import { renderHeader } from './header'
import { host } from './host'
import { Line } from './line'
import { LockIn } from './lockIn'
import { openHowItWorks } from './howItWorks'
import { introDue, playIntro } from './intro'
import { KrillChip } from './krillChip'
import { firstWeekHtml } from './firstWeek'
import { eventsAt, seasonOf, yearsSince } from '../scene/calendar'
import { today as clockNow } from '../store/clock'
import { FIRST_WEEK_DAYS, krillOn } from '../store/krill'
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
  arrangementOf,
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
/** The days of whale club (days something was done) that are quietly celebrated. */
const MILESTONES: readonly number[] = [100, 200, 365]
/** A path's moment waits for a lock-in screen to go, looking again this often, and not for ever. */
const SESSION_WAIT_MS = 250
const SESSION_WAIT_MAX_MS = 20_000
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
    <div class="notice-slot" aria-live="polite"></div>
    <main class="stage"><div class="onboarding" hidden><p></p><small></small></div></main>
    <div class="bottom">
      <div class="offer-slot" aria-live="polite"></div>
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

  const krillSlot = renderHeader(
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
        openCollectionSheet(store, () => {
          startArrange({})
        })
      },
      onSend() {
        postcards.sendNow({ kind: 'sea', line: line.current() || voice.postcard.sea })
      },
      onMenu() {
        openMenuSheet(store, {
          onLog: () => {
            openLogSheet(store)
          },
          onHow: () => {
            openHowItWorks(intro)
          },
          onSettings: () => {
            openSettingsSheet(store, {
              sound,
              onHow: () => {
                openHowItWorks(intro)
              },
              onLab: enterLabFromMenu,
            })
          },
        })
      },
    },
    sound.isMuted(),
  )

  const krill = new KrillChip(() => {
    openDock()
  })
  krillSlot.append(krill.root)

  /** The dock, from the krill chip or the pier; `start` opens one thing's page. */
  function openDock(start?: string): void {
    openDockSheet(
      store,
      {
        onArrived: (item) => {
          arrived(item)
        },
        onNoRoom: () => {
          line.say(voice.arrange.noRoom, { quiet: true })
        },
      },
      start,
    )
  }

  /** Arranging the scene, from the Collection or right after something to place was bought. */
  function startArrange(options: Omit<ArrangeOptions, 'onClose'>): void {
    openArrange(store, scene, {
      ...options,
      onClose: () => {
        render(store.get())
      },
    })
  }

  /**
   * Something bought has come: one line, and the scene shows it. A thing
   * with a place, or more room, opens arranging at once, with the thing
   * in hand or the new places glowing.
   */
  function arrived(item: DockItem): void {
    sound.play('unlock')
    const said = voice.dock.arrived(item.name)
    if (item.kind === 'place') startArrange({ held: item.id, note: said })
    else if (item.kind === 'room') startArrange({ room: item.id, note: said })
    else {
      line.say(said)
      scene.previewDock(item.id)
    }
  }

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
      // The card that had the focus is gone: the undo takes it, the nearest way back.
      if (!document.activeElement?.isConnected || document.activeElement === document.body)
        document.querySelector<HTMLElement>('.undo-button')?.focus({ preventScroll: true })
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
      // The day's first done makes a star: it is held back, to fly up from this card.
      const today = todayKey()
      const newStar = !starDays(store.get()).includes(today)
      if (newStar) scene.holdStar(today)
      const done = store.toggleDone(thing.id)
      // Back after a break: a flash of light and a little krill, and not a word about the break.
      if (done && newStar && krillOn(store.get(), today).welcome > 0) scene.glow()
      if (newStar) {
        const rect = card.getBoundingClientRect()
        if (done)
          scene.flyStar(today, { x: rect.left + rect.width / 2, y: rect.top + rect.height * 0.35 })
        else scene.releaseHeld()
      }
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
    keepPlaces({ ...data, cracked: { ...data.cracked, [thing.id]: tier } })
    store.crack(thing.id, tier)
    sound.play('unlock')
    if (item) {
      // A full world sends the new find to the chest, and the line says so.
      const inChest = arrangementOf(store.get()).where.get(item.id) === CHEST
      const said = inChest ? voice.arrange.toChest(item.name) : voice.unlock(item.name)
      line.say(said)
      postcards.offer({ kind: 'unlock', line: said }, voice.postcard.sendThis, OFFER_AFTER_FIND_MS)
    }
  }

  /**
   * Places follow the order things were got, but a stone can wait: one
   * cracked late was reached early, and would take the place of something
   * already standing. When it would, the current arrangement is kept as it
   * is first, so the newcomer takes a free place or waits in the chest.
   */
  function keepPlaces(next: AppData): void {
    const now = arrangementOf(store.get())
    const then = arrangementOf(next)
    const bumped = now.things.some((t) => now.where.get(t.id) !== then.where.get(t.id))
    if (bumped) store.setPlacement(Object.fromEntries(now.where))
  }

  /** How many stars the last render saw, to notice what the newest one finished. */
  let starsBefore: number | null = null

  /**
   * After a new star day, in order of rarity: the first week's set
   * finished, a milestone (day 100, 200, 365), a constellation finished
   * (its legendary's ceremony) or its halfway star (a rare find). Each
   * waits for a lock-in's screen and the flying star, so it happens in the
   * world. A day with one of them skips the daily surprise.
   */
  function watchPath(data: AppData): void {
    const dates = starDays(data)
    const count = dates.length
    const before = starsBefore
    starsBefore = count
    if (before === null || count <= before) return
    const was = progressOf(before)
    const now = progressOf(count)
    if (before < FIRST_WEEK_DAYS && count >= FIRST_WEEK_DAYS) {
      surprisedFor = todayKey()
      afterSession(() => {
        sound.play('whale')
        scene.surfaceWhale(hasJacket(store.get()))
        line.say(voice.firstWeek.done)
      })
    }
    const milestone = MILESTONES.find((day) => before < day && count >= day)
    if (milestone !== undefined) {
      surprisedFor = todayKey()
      afterSession(() => {
        sound.play('grow')
        scene.glow()
        const said = voice.milestone(milestone)
        line.say(said)
        postcards.offer(
          { kind: 'milestone', line: said, milestone },
          voice.postcard.sendThis,
          OFFER_AFTER_FIND_MS,
        )
      })
    }
    if (now.path > was.path) {
      surprisedFor = todayKey()
      const finished = now.path - 1
      const date = reachesOf(dates)[finished]?.end ?? todayKey()
      const day = dates.indexOf(date) + 1
      afterSession(() => {
        crown(finished, voice.legend.plaque(writtenDate(date), day))
      })
    } else if (was.lit < halfwayStar(now.length) && now.lit >= halfwayStar(now.length)) {
      surprisedFor = todayKey()
      const rare = legendaryFor(now.path).rare
      afterSession(() => {
        sound.play('half')
        line.say(voice.legend.half(rare.name))
      })
    }
  }

  /** The legendary of path `index`, arriving, and its gold postcard on request. */
  function crown(index: number, plaque: string): void {
    const legendary = legendaryFor(index)
    sound.play('legendary')
    playCeremony(scene, {
      legendary,
      stars: pathLength(index),
      plaque,
      onSend: () => {
        postcards.sendNow({
          kind: 'legendary',
          line: legendary.name,
          legendary: { id: legendary.id, plaque },
        })
      },
      onClose: () => {
        line.say(voice.legend.earned(legendary.name))
      },
    })
  }

  /**
   * Runs `work` once the moment that set it off is over: a beat after the
   * tap (so the tap's own line and its star go first), then whenever no
   * lock-in screen or flying star is left on the page.
   */
  function afterSession(work: () => void, waited = 0): void {
    setTimeout(() => {
      if (document.querySelector('.session, .star-flight') && waited < SESSION_WAIT_MAX_MS)
        afterSession(work, waited + SESSION_WAIT_MS)
      else work()
    }, SESSION_WAIT_MS)
  }

  /** Once a day, after the first thing done: something new in the scene. */
  function maybeSurprise(data: AppData, today: DateKey): void {
    if (surprisedFor === today) return
    if ((data.days[today]?.done.length ?? 0) !== 1) return
    surprisedFor = today
    // A day the sky or the sea keeps says so, in place of the surprise.
    const kept = calendarLine(data)
    if (kept) {
      setTimeout(() => {
        line.say(kept, { quiet: true })
      }, SURPRISE_DELAY_MS)
      return
    }
    const surprise = surpriseFor(today)
    setTimeout(() => {
      if (surprise.kind === 'fact') line.say(surprise.text, { quiet: true })
      else if (surprise.kind === 'visitor') scene.visit(surprise.visitor)
      else scene.glow()
    }, SURPRISE_DELAY_MS)
  }

  /** The line for a day the sky or the sea keeps, the rarest first; none on an ordinary day. */
  function calendarLine(data: AppData): string | null {
    const now = clockNow()
    const first = starDays(data)[0]
    const events = eventsAt(now, first)
    if (events.includes('anniversary') && first)
      return voice.calendar.anniversary(yearsSince(now, first))
    if (events.includes('ocean-day') || events.includes('whale-day')) return voice.calendar.seaDay
    if (events.includes('new-year')) return voice.calendar.newYear
    if (events.includes('meteors')) return voice.calendar.meteors
    if (events.includes('solstice') || events.includes('equinox')) return voice.calendar.light
    return null
  }

  /** The person's own clock and week, before anything asks what day it is. */
  function applySettings(data: AppData): void {
    setDayEndsAt(data.settings.dayEndsAt ?? 0)
    setWeekStartsOn(data.settings.weekStartsOn === 'sunday' ? 0 : 1)
  }

  /**
   * Lasting storage, asked for once after the first week, where the
   * browser can grant it: the sea is then not cleared to make room.
   */
  function askToPersist(data: AppData): void {
    if (data.settings.persistAsked || starDays(data).length < FIRST_WEEK_DAYS) return
    if (!('storage' in navigator) || typeof navigator.storage.persist !== 'function') return
    store.setSettings({ persistAsked: true })
    navigator.storage.persist().catch(() => undefined)
  }

  // --- Render ----------------------------------------------------------------------------------

  function render(data: AppData): void {
    applySettings(data)
    const today = todayKey()
    onboarding.hidden = data.things.length > 0
    scene.setEmpty(data.things.length === 0)
    row.render(data)
    krill.render(data, today)
    watchPath(data)
    const now = clockNow()
    scene.setCalendar(
      seasonOf(now, data.settings.hemisphere ?? 'north'),
      eventsAt(now, starDays(data)[0]),
    )
    scene.setStill(data.settings.stillSea === true)
    // The month's quiet backup dot, on the menu button, until the menu has been opened.
    query(root, '.header [data-action="menu"]').dataset.due = String(
      backupStale(data, today) && data.settings.backupNudged !== today.slice(0, 7),
    )
    scene.setDock(new Set(shownItems(data).map((item) => item.id)), () => {
      openDock()
    })

    const stars = starDays(data)
    scene.setDays({ dates: stars, today, label: (date) => dayLabel(data, date) }, (date) => {
      openLogSheet(store, date)
    })

    scene.setLanterns(lanternsFor(data), today)
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
      chapterNotice(store),
    ])
  }

  /** The next find's silhouette and the days to it, always in sight; a tap opens the Collection. */
  const nextSlot = query(root, '.next-slot')
  /**
   * The goals in sight, under the sky: the near one (the next find, "in 2
   * days") and the far one (the legendary at the end of this
   * constellation, "12/30"). Both open the Collection.
   */
  function renderNext(data: AppData): void {
    if (data.things.length === 0) {
      nextSlot.replaceChildren()
      return
    }
    const next = nextFind(data)
    const near = pill('next-find', next !== null)
    if (next && (near.dataset.item !== next.item.id || near.dataset.days !== String(next.days))) {
      near.dataset.item = next.item.id
      near.dataset.days = String(next.days)
      near.innerHTML = `<span class="next-art" aria-hidden="true">${collectibleSvg(next.item)}</span><span class="next-text"></span>`
      const label = near.querySelector('.next-text')
      if (label) label.textContent = voice.nextFind(next.days)
    }
    const stars = starDays(data).length
    // The first week's set comes first; the legendary's path is the goal after it.
    const week = stars < FIRST_WEEK_DAYS
    let set = nextSlot.querySelector<HTMLElement>('.first-week')
    if (week) {
      pill('next-legend', false)
      const html = firstWeekHtml(stars)
      if (set?.getAttribute('aria-label') !== voice.firstWeek.label(stars)) {
        set?.remove()
        nextSlot.insertAdjacentHTML('beforeend', html)
      }
      return
    }
    set?.remove()
    set = null
    const path = progressOf(stars)
    const legend = legendaryFor(path.path)
    const far = pill('next-legend', true)
    const key = `${legend.id}:${String(path.lit)}`
    if (far.dataset.key !== key) {
      far.dataset.key = key
      far.setAttribute('aria-label', voice.legend.label(legend.name, path.lit, path.length))
      far.innerHTML = `<span class="next-art next-legend-art" aria-hidden="true">${collectibleSvg(legend.find)}</span><span class="next-text">${voice.legend.progress(path.lit, path.length)}</span>`
    }
  }

  /** One of the goal buttons, made once and kept; removed when it has nothing to show. */
  function pill(name: string, shown: boolean): HTMLButtonElement {
    let button = nextSlot.querySelector<HTMLButtonElement>(`.${name}`)
    if (!shown) {
      button?.remove()
      return button ?? document.createElement('button')
    }
    if (!button) {
      button = document.createElement('button')
      button.type = 'button'
      button.className = name
      button.addEventListener('click', () => {
        openCollectionSheet(store, () => {
          startArrange({})
        })
      })
      if (name === 'next-find') nextSlot.prepend(button)
      else nextSlot.append(button)
    }
    return button
  }

  // An undo copy left by a reload during the undo's seconds is past its time now.
  clearUndo()
  store.subscribe(render)
  store.subscribe(askToPersist)
  render(store.get())
  watchBadge(store)
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
      stars(count) {
        const data = store.get()
        const now = progressOf(starDays(data).length)
        store.replace(addStars(data, todayKey(), count === 'one' ? 1 : now.length - now.lit))
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
