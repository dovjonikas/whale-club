import type { Scene } from '../scene/scene'
import { todayKey } from '../store/dates'
import { allDoneToday, last7, lineFor, stageFor, starDays } from '../store/derive'
import type { DateKey } from '../store/types'
import type { Store } from '../store/store'
import type { Thing } from '../store/types'
import { voice } from '../voice'
import { animate } from './card'
import type { Line } from './line'
import { Opening, type OpeningStep } from './opening'
import type { Moment } from './postcard'
import type { Postcards } from './postcards'
import type { Row } from './row'
import { hasJacket, lanternKey } from './sceneData'
import { openDial } from './dial'
import { canUndo, partsOf, seenMs, SessionService, totalMs, type Session } from './session'
import { openSessionScreen, type SessionScreen } from './sessionScreen'
import type { Sound } from './sound'
import { keepAwake, letSleep } from './wakeLock'

export interface LockInDeps {
  store: Store
  scene: Scene
  sound: Sound
  line: Line
  row: Row
  postcards: Postcards
  /** Minutes of an interrupted session were kept for the day. */
  onKept: (thing: Thing) => void
}

/** How long each beat of the opening lasts, in order. */
const RISE_MS = 1200
const LANTERN_MS = 900
const CREATURE_MS = 800
const STAR_MS = 700
const LINE_MS = 600

/**
 * A lock-in from the dial to the end: the session in storage, the quiet
 * screen over the sunk world, the wake lock, the sea sound, and the
 * opening that shows what the session gave. The session itself
 * (timestamps, leaving, the grace, the pause) is SessionService's; this is
 * what the app does around it.
 */
export class LockIn {
  private screen: SessionScreen | null = null
  private readonly sessions: SessionService

  constructor(private readonly deps: LockInDeps) {
    this.sessions = new SessionService({
      tick: (session, seen) => {
        this.screen?.update(seen / totalMs(session), totalMs(session) - seen)
        this.screen?.undoable(canUndo(session))
      },
      back: () => {
        this.screen?.away()
      },
      pauseOver: () => {
        this.screen?.paused(false, true)
        this.deps.sound.play('resume')
      },
      finish: (session) => {
        this.finish(session)
      },
    })
  }

  /**
   * A tap on a lock-in card. Minutes already seen today and not yet the
   * length: it goes straight on from them. Otherwise the dial, on the
   * thing's length; on a day already done, that is one more session, for
   * one more lantern.
   */
  tap(thing: Thing): void {
    const { store } = this.deps
    const data = store.get()
    const day = data.days[todayKey()]
    const done = day?.done.includes(thing.id) ?? false
    const kept = day?.minutes[thing.id] ?? 0
    if (!done && kept > 0 && kept < thing.minutes) {
      this.begin(thing, { minutes: thing.minutes, baseMs: kept * 60_000 })
      return
    }
    openDial(
      thing,
      { line: lineFor(data, thing), stage: stageFor(last7(data, thing.id, todayKey())) },
      (minutes) => {
        store.setThingMinutes(thing.id, minutes)
        this.begin(thing, { minutes, baseMs: 0, extra: done })
      },
    )
  }

  /**
   * On opening the app: a session from a page that went away is settled.
   * If the timer saw the whole length before the page went, it ends now,
   * with its opening; otherwise its minutes are kept and the card offers
   * to finish.
   */
  settle(): void {
    const session = this.sessions.settle()
    if (!session) return
    const thing = this.deps.store.get().things.find((t) => t.id === session.thingId)
    if (!thing) return
    const seen = seenMs(session)
    if (session.date === todayKey() && seen >= totalMs(session)) {
      this.open(thing, session)
      this.finish(session)
      return
    }
    this.keep(session, seen)
    this.deps.onKept(thing)
  }

  private begin(thing: Thing, input: { minutes: number; baseMs: number; extra?: boolean }): void {
    const session = this.sessions.start({ thingId: thing.id, ...input })
    this.open(thing, session)
  }

  /** What the timer saw is kept for the session's day, so the next one goes on from it. */
  private keep(session: Session, seen: number): number {
    const { store } = this.deps
    const own = Math.floor((seen - session.baseMs) / 60_000)
    const before = store.get().days[session.date]?.minutes[session.thingId] ?? 0
    const total = session.extra ? before + own : Math.floor(seen / 60_000)
    store.keepMinutes(session.thingId, total, session.date)
    return own
  }

  private open(thing: Thing, session: Session): void {
    const { store, scene, sound, postcards, line } = this.deps
    const data = store.get()
    postcards.clearOffer()
    this.screen?.close()
    scene.setSession(true)
    keepAwake()
    sound.setSea(data.settings.sessionSound === true)
    this.screen = openSessionScreen(thing, lineFor(data, thing), {
      sound: data.settings.sessionSound === true,
      showTime: data.settings.showTime === true,
      onSound: (on) => {
        store.setSettings({ sessionSound: on })
        sound.setSea(on)
      },
      onStop: () => {
        const stopped = this.sessions.stop()
        const minutes = stopped ? this.keep(stopped, seenMs(stopped)) : 0
        this.close()
        line.say(voice.lockIn.stopped(minutes), { quiet: true })
      },
      onUndo: () => {
        // Within the first seconds: as if it never started, not even a line.
        if (this.sessions.undo()) this.close()
      },
      onPause: () => {
        if (this.sessions.pause()) this.screen?.paused(true, true)
      },
      onGoOn: () => {
        this.sessions.goOn()
        this.screen?.paused(false, true)
      },
    })
    const seen = seenMs(session)
    this.screen.update(seen / totalMs(session), totalMs(session) - seen)
    this.screen.undoable(canUndo(session))
  }

  private close(): void {
    const { scene, sound } = this.deps
    this.screen?.close()
    this.screen = null
    scene.setSession(false)
    sound.setSea(false)
    letSleep()
  }

  /**
   * The session ran to its end. The record is written at once; what it
   * gave is held back in the scene (the new lantern, today's first star)
   * and shown in order by the opening.
   */
  private finish(session: Session): void {
    const { store, scene, sound } = this.deps
    const thing = store.get().things.find((t) => t.id === session.thingId)
    if (!thing) {
      this.close()
      return
    }
    if (!this.screen) this.open(thing, session)
    const screen = this.screen
    if (!screen) return

    const date: DateKey = session.date
    const before = store.get()
    const stageBefore = stageFor(last7(before, thing.id, date))
    const newStar = !session.extra && !starDays(before).includes(date)
    const lantern = lanternKey(date, before.days[date]?.sessions?.length ?? 0)
    const kept = before.days[date]?.minutes[thing.id] ?? 0
    scene.holdLantern(lantern)
    if (newStar) scene.holdStar(date)
    store.finishLockIn(
      thing.id,
      {
        seen: session.extra ? kept + session.minutes : session.minutes,
        minutes: session.minutes,
        parts: partsOf(session),
      },
      date,
    )

    sound.setSea(false)
    letSleep()
    sound.play('whale')
    screen.ended()

    const after = store.get()
    const grew = stageFor(last7(after, thing.id, date)) > stageBefore
    const allDone = allDoneToday(after, date)
    // The first lantern says what it is, as the opening's line; after that, the usual one.
    const explained = after.settings.explained ?? []
    const firstLantern = !explained.includes('lantern')
    if (firstLantern) store.setSettings({ explained: [...explained, 'lantern'] })
    const said = firstLantern ? voice.explain.lantern : voice.timerEnd
    const moment: Moment = allDone ? { kind: 'whale', line: said } : { kind: 'stage', line: said }

    const opening = new Opening(
      this.steps(thing, screen, { lantern, newStar, grew, allDone, said, moment }),
      () => {
        this.screen = null
        screen.element.remove()
        document
          .querySelector<HTMLElement>(`.card[data-id="${thing.id}"] .card-main`)
          ?.focus({ preventScroll: true })
      },
    )
    // A tap anywhere lands on the end at once.
    screen.element.addEventListener('click', () => {
      opening.skip()
    })
    opening.start()
  }

  private steps(
    thing: Thing,
    screen: SessionScreen,
    gave: {
      lantern: string
      newStar: boolean
      grew: boolean
      allDone: boolean
      said: string
      moment: Moment
    },
  ): OpeningStep[] {
    const { store, scene, line, row, postcards } = this.deps
    const app = document.getElementById('app')
    const card = (): HTMLElement | null => row.card(thing.id) ?? null
    let said = false
    const steps: OpeningStep[] = [
      {
        name: 'rise',
        ms: RISE_MS,
        play: () => {
          screen.element.classList.add('is-rising')
          scene.setSession(false)
          app?.classList.remove('is-behind-session')
        },
        end: () => {
          screen.element.classList.add('is-rising')
          scene.setSession(false)
          app?.classList.remove('is-behind-session')
        },
      },
      {
        name: 'lantern',
        ms: LANTERN_MS,
        play: () => {
          scene.arriveLantern(gave.lantern)
        },
        end: () => {
          // A lantern still on its way finishes by itself; one never sent goes straight in.
          scene.arriveLantern(gave.lantern)
        },
      },
      {
        name: 'creature',
        ms: CREATURE_MS,
        play: () => {
          goHome(screen.creature(), card())
        },
        end: () => {
          screen.creature().classList.add('is-home')
          const target = card()
          if (target) {
            animate(target, 'is-jumping')
            if (gave.grew) animate(target, 'is-growing')
          }
        },
      },
    ]
    if (gave.newStar || gave.allDone) {
      steps.push({
        name: 'star',
        ms: STAR_MS,
        play: () => {
          scene.revealStar()
          if (gave.allDone) scene.surfaceWhale(hasJacket(store.get()))
        },
        end: () => {
          scene.revealStar()
        },
      })
    }
    const say = (): void => {
      if (said) return
      said = true
      line.say(gave.said)
    }
    steps.push(
      { name: 'line', ms: LINE_MS, play: say, end: say },
      {
        name: 'offer',
        ms: 0,
        play: () => {
          postcards.offer(gave.moment, voice.postcard.sendWhale, 0)
        },
        end: () => {
          postcards.offer(gave.moment, voice.postcard.sendWhale, 0)
          app?.removeAttribute('inert')
          scene.releaseHeld()
        },
      },
    )
    return steps
  }
}

/**
 * The creature goes back to its card: it swims, flies or grows down into
 * it, by its world (the CSS picks the curve). Without a card on screen (a
 * thing not planned today) it rises and fades.
 */
function goHome(creature: HTMLElement, card: HTMLElement | null): void {
  const target = card?.querySelector<HTMLElement>('.creature') ?? null
  if (target) {
    const from = creature.getBoundingClientRect()
    const to = target.getBoundingClientRect()
    const dx = to.left + to.width / 2 - (from.left + from.width / 2)
    const dy = to.top + to.height / 2 - (from.top + from.height / 2)
    const scale = to.width / Math.max(1, from.width)
    creature.style.setProperty('--home-x', `${dx.toFixed(1)}px`)
    creature.style.setProperty('--home-y', `${dy.toFixed(1)}px`)
    creature.style.setProperty('--home-scale', scale.toFixed(3))
  }
  creature.classList.add('is-going-home')
}
