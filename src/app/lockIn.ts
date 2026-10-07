import type { Scene } from '../scene/scene'
import { todayKey } from '../store/dates'
import { allDoneToday, last7, lineFor, stageFor } from '../store/derive'
import type { Store } from '../store/store'
import type { Thing } from '../store/types'
import { voice } from '../voice'
import { animate } from './card'
import type { Line } from './line'
import type { Moment } from './postcard'
import type { Postcards } from './postcards'
import type { Row } from './row'
import { hasJacket } from './sceneData'
import { elapsedMs, SessionService, totalMs, type Session } from './session'
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

/**
 * A lock-in from the dial to the end: the session in storage, the quiet
 * screen over the scene, the wake lock, the sea sound, and what the end
 * gives. The session itself (timestamps, leaving, the grace) is
 * SessionService's; this is what the app does around it.
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
      },
      left: () => {
        this.screen?.left()
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
    })
    const session = this.sessions.current()
    if (session) {
      const elapsed = elapsedMs(session)
      this.screen.update(elapsed / totalMs(session), totalMs(session) - elapsed, waitedAt(session))
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

  private finish(session: Session, clean: boolean): void {
    const { store, scene, sound, postcards, row } = this.deps
    const thing = store.get().things.find((t) => t.id === session.thingId)
    if (!thing) {
      this.close()
      return
    }
    if (!this.screen) this.open(thing)
    const before = stageFor(last7(store.get(), thing.id, todayKey()))
    store.finishSession(thing.id, session.minutes, clean)
    sound.setSea(false)
    letSleep()
    sound.play(clean ? 'whale' : 'left')
    const said = clean ? voice.timerEnd : voice.lockIn.broken
    const moment: Moment = allDoneToday(store.get(), todayKey())
      ? { kind: 'whale', line: said }
      : { kind: 'stage', line: said }
    this.screen?.end(
      clean,
      said,
      () => {
        postcards.sendNow(moment)
      },
      () => {
        this.close()
      },
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
}

/** How far a left session had come when it was first left; the creature stays that size. */
function waitedAt(session: Session): number | null {
  return session.brokenAtMs === undefined ? null : session.brokenAtMs / totalMs(session)
}
