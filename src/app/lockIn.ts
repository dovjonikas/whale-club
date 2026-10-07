import type { Scene } from '../scene/scene'
import { todayKey } from '../store/dates'
import { allDoneToday, last7, lineFor, stageFor, starDays } from '../store/derive'
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
import { canUndo, elapsedMs, SessionService, totalMs, type Session } from './session'
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
      tick: (session, elapsed) => {
        this.screen?.update(
          elapsed / totalMs(session),
          totalMs(session) - elapsed,
          waitedAt(session),
        )
        this.screen?.undoable(canUndo(session))
      },
      left: () => {
        this.screen?.left()
      },
      pauseOver: () => {
        this.screen?.paused(false, true)
        this.deps.sound.play('resume')
      },
      finish: (session, clean) => {
        this.finish(session, clean)
      },
    })
  }

  /** Starts a session from the dial, remembering the length for next time. */
  start(thing: Thing, minutes: number): void {
    this.deps.store.setThingMinutes(thing.id, minutes)
    this.sessions.start(thing.id, minutes)
    this.open(thing)
  }

  /** On opening the app: a session still running (or one that ran out while away) comes back. */
  resume(): void {
    const resumed = this.sessions.resume()
    if (!resumed) return
    const thing = this.deps.store.get().things.find((t) => t.id === resumed.thingId)
    if (thing) this.open(thing)
    else this.sessions.stop()
  }

  private open(thing: Thing): void {
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
        const minutes = stopped ? Math.floor(elapsedMs(stopped) / 60_000) : 0
        if (stopped) store.addMinutes(stopped.thingId, minutes)
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
    const session = this.sessions.current()
    if (session) {
      const elapsed = elapsedMs(session)
      this.screen.update(elapsed / totalMs(session), totalMs(session) - elapsed, waitedAt(session))
      this.screen.undoable(canUndo(session))
      if (session.pausedAt !== undefined) this.screen.paused(true, true)
      else if (session.pauseUsed) this.screen.paused(false, true)
      if (session.broken) this.screen.left()
    }
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
  private finish(session: Session, clean: boolean): void {
    const { store, scene, sound } = this.deps
    const thing = store.get().things.find((t) => t.id === session.thingId)
    if (!thing) {
      this.close()
      return
    }
    if (!this.screen) this.open(thing)
    const screen = this.screen
    if (!screen) return

    const today = todayKey()
    const before = store.get()
    const stageBefore = stageFor(last7(before, thing.id, today))
    const newStar = clean && !starDays(before).includes(today)
    const lantern = lanternKey(today, before.days[today]?.sessions?.length ?? 0)
    scene.holdLantern(lantern)
    if (newStar) scene.holdStar(today)
    store.finishSession(thing.id, session.minutes, clean)

    sound.setSea(false)
    letSleep()
    sound.play(clean ? 'whale' : 'left')
    screen.ended(clean)

    const after = store.get()
    const grew = clean && stageFor(last7(after, thing.id, today)) > stageBefore
    const allDone = allDoneToday(after, today)
    const said = clean ? voice.timerEnd : voice.lockIn.broken
    const moment: Moment = allDone ? { kind: 'whale', line: said } : { kind: 'stage', line: said }

    const opening = new Opening(
      this.steps(thing, screen, { lantern, newStar, grew, allDone, said, moment }),
      () => {
        this.screen = null
        screen.element.remove()
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

/** How far a left session had come when it was first left; the creature stays that size. */
function waitedAt(session: Session): number | null {
  return session.brokenAtMs === undefined ? null : session.brokenAtMs / totalMs(session)
}
