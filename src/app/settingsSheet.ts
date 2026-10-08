import { todayKey } from '../store/dates'
import type { Store } from '../store/store'
import { DEFAULT_MINUTES, emptyData, type AppData, type Settings } from '../store/types'
import { voice } from '../voice'
import { makeBackup, readBackup, saveBackup, type BackupSummary } from './backup'
import { openSheet } from './sheet'
import type { Sound } from './sound'
import { announce, showUndo } from './toast'

/** Where the sea is kept while an undo can still bring it back. */
const UNDO_KEY = 'whaleclub:undo'
/** Taps on the version, close together, that open the lab. */
const LAB_TAPS = 5
const LAB_TAP_GAP_MS = 2500
/** The lengths a new thing can start with. */
const LENGTHS = [10, 15, 20, 30, 45, 60] as const

export interface SettingsHandlers {
  sound: Sound
  onHow: () => void
  onLab: () => void
}

/**
 * Settings: one sheet, defaults good enough that most people never open
 * it. Each choice is one row and takes effect at once; there is no save.
 * Only these groups: sound, days, lock in, postcards, your sea, about. No
 * themes, fonts, languages, notifications or accounts.
 */
export function openSettingsSheet(store: Store, on: SettingsHandlers): void {
  openSheet({
    title: voice.settings.title,
    build(body, close) {
      const draw = (): void => {
        const s = store.get().settings
        body.innerHTML = `
          ${group(voice.settings.groups.sound, [
            choice('sound', voice.settings.sounds, onOff(s.sound)),
            choice('sessionSound', voice.settings.seaSound, onOff(s.sessionSound === true)),
          ])}
          ${group(voice.settings.groups.days, [
            choice('dayEndsAt', voice.settings.dayEnds, [
              ['0', voice.settings.midnight, (s.dayEndsAt ?? 0) === 0],
              ['3', '3:00', s.dayEndsAt === 3],
              ['5', '5:00', s.dayEndsAt === 5],
            ]),
            choice('weekStartsOn', voice.settings.weekStarts, [
              ['monday', voice.settings.monday, s.weekStartsOn !== 'sunday'],
              ['sunday', voice.settings.sunday, s.weekStartsOn === 'sunday'],
            ]),
            choice('hemisphere', voice.settings.seasons, [
              ['north', voice.settings.north, s.hemisphere !== 'south'],
              ['south', voice.settings.south, s.hemisphere === 'south'],
            ]),
          ])}
          ${group(voice.settings.groups.lockIn, [
            choice('showTime', voice.settings.showTime, onOff(s.showTime === true)),
            choice(
              'defaultMinutes',
              voice.settings.length,
              LENGTHS.map((m) => [
                String(m),
                voice.card.length(m),
                (s.defaultMinutes ?? DEFAULT_MINUTES) === m,
              ]),
            ),
          ])}
          ${group(voice.settings.groups.postcards, [
            choice('postcardFormat', voice.settings.size, [
              ['story', voice.postcard.story, (s.postcardFormat ?? 'story') === 'story'],
              ['square', voice.postcard.square, s.postcardFormat === 'square'],
            ]),
          ])}
          ${group(voice.settings.groups.sea, [
            choice('stillSea', voice.settings.still, onOff(s.stillSea === true)),
            `<div class="setting-actions">
              <button type="button" class="button-quiet setting-backup">${voice.settings.backUp}</button>
              <button type="button" class="button-quiet setting-restore">${voice.settings.restore}</button>
              <input type="file" class="setting-file" accept=".json,application/json" hidden />
              <button type="button" class="button-danger setting-start-over">${voice.settings.startOver}</button>
            </div>
            <p class="sheet-note setting-last">${s.lastBackupAt ? voice.settings.lastBackup(s.lastBackupAt) : voice.settings.never}</p>`,
          ])}
          ${group(voice.settings.groups.about, [
            `<button type="button" class="menu-row setting-how">${voice.howItWorks.title}</button>
            <p class="sheet-note">${voice.settings.privacy}</p>
            <p class="sheet-note setting-storage">${voice.settings.storage(storageKb(store.get()))}</p>
            <p class="sheet-note">${voice.settings.licence}</p>
            <button type="button" class="menu-version" aria-label="${voice.lab.version(__APP_VERSION__)}">v${__APP_VERSION__}</button>`,
          ])}`
        wire()
      }

      const wire = (): void => {
        for (const button of body.querySelectorAll<HTMLButtonElement>('[data-setting]')) {
          button.addEventListener('click', () => {
            apply(store, on.sound, button.dataset.setting ?? '', button.dataset.value ?? '')
            const row = button.closest('[role=group]')
            for (const other of row?.querySelectorAll<HTMLButtonElement>('[data-setting]') ?? [])
              other.setAttribute('aria-pressed', String(other === button))
          })
        }
        body.querySelector('.setting-how')?.addEventListener('click', () => {
          close()
          on.onHow()
        })
        let taps = 0
        let lastTap = 0
        body.querySelector('.menu-version')?.addEventListener('click', (event) => {
          taps = event.timeStamp - lastTap < LAB_TAP_GAP_MS ? taps + 1 : 1
          lastTap = event.timeStamp
          if (taps >= LAB_TAPS) on.onLab()
        })
        body.querySelector('.setting-backup')?.addEventListener('click', () => {
          void backUp(store).then(draw)
        })
        const file = body.querySelector<HTMLInputElement>('.setting-file')
        body.querySelector('.setting-restore')?.addEventListener('click', () => file?.click())
        file?.addEventListener('change', () => {
          const chosen = file.files?.[0]
          if (chosen) void restore(store, chosen, close)
        })
        body.querySelector('.setting-start-over')?.addEventListener('click', () => {
          close()
          askStartOver(store)
        })
      }
      draw()
    },
  })
}

/** The month's quiet nudge: a backup older than thirty days, or none yet for a sea that old. */
export function backupStale(data: AppData, today: string = todayKey()): boolean {
  if (data.things.length === 0) return false
  const since = data.settings.lastBackupAt ?? data.things.map((t) => t.createdAt).sort()[0] ?? today
  const days = (new Date(today).getTime() - new Date(since).getTime()) / 86_400_000
  return days > BACKUP_EVERY_DAYS
}

/** A backup older than this is due again. */
const BACKUP_EVERY_DAYS = 30

/** Saves the sea to a file, and remembers when. */
export async function backUp(store: Store): Promise<void> {
  const today = todayKey()
  const { text, name } = await makeBackup(store.get(), today)
  try {
    await saveBackup(text, name)
    store.setSettings({ lastBackupAt: today })
    announce(voice.settings.backupDone)
  } catch {
    // The share sheet was closed: nothing was saved, and that is the person's call.
  }
}

async function restore(store: Store, file: File, closeSettings: () => void): Promise<void> {
  const result = await readBackup(await file.text())
  if (!result.ok) {
    announce(
      voice.settings[
        result.reason === 'newer' ? 'newer' : result.reason === 'not-ours' ? 'notOurs' : 'damaged'
      ],
    )
    const note = document.querySelector('.setting-last')
    if (note)
      note.textContent =
        voice.settings[
          result.reason === 'newer' ? 'newer' : result.reason === 'not-ours' ? 'notOurs' : 'damaged'
        ]
    return
  }
  closeSettings()
  openSheet({
    title: voice.settings.restoreAsk,
    build(body, close) {
      body.innerHTML = `<p class="sheet-note restore-what">${describe(result.summary)}</p>
        <button type="button" class="button-primary restore-yes">${voice.settings.restoreYes}</button>
        <button type="button" class="button-quiet restore-no">${voice.settings.cancel}</button>`
      body.querySelector('.restore-yes')?.addEventListener('click', () => {
        close()
        replaceWithUndo(store, result.data, voice.settings.restored)
      })
      body.querySelector('.restore-no')?.addEventListener('click', close)
    },
  })
}

function askStartOver(store: Store): void {
  openSheet({
    title: voice.settings.startOverAsk,
    build(body, close) {
      body.innerHTML = `<button type="button" class="button-quiet start-backup">${voice.settings.backUpFirst}</button>
        <button type="button" class="button-danger start-yes">${voice.settings.startOver}</button>`
      body.querySelector('.start-backup')?.addEventListener('click', () => {
        void backUp(store)
      })
      body.querySelector('.start-yes')?.addEventListener('click', () => {
        close()
        replaceWithUndo(store, emptyData(), voice.settings.cleared)
      })
    },
  })
}

/**
 * Replaces the whole sea, keeping the one before in a key of its own for
 * as long as the undo waits, so even a reload in those seconds loses
 * nothing; undo puts it back.
 */
function replaceWithUndo(store: Store, next: AppData, said: string): void {
  const before = store.get()
  try {
    localStorage.setItem(UNDO_KEY, JSON.stringify(before))
  } catch {
    // No room for the copy: the undo below still holds it in memory.
  }
  store.replace(next)
  showUndo(said, voice.settings.undo, () => {
    store.replace(before)
    clearUndo()
  })
  setTimeout(clearUndo, UNDO_WINDOW_MS)
}

/** How long the undo waits (toast.ts's own wait), and the copy with it. */
const UNDO_WINDOW_MS = 10_000

export function clearUndo(): void {
  try {
    localStorage.removeItem(UNDO_KEY)
  } catch {
    // Nothing to clear.
  }
}

function describe(summary: BackupSummary): string {
  return voice.settings.restoreWhat(
    summary.things.length,
    summary.days,
    summary.first,
    summary.last,
  )
}

function storageKb(data: AppData): number {
  return Math.max(1, Math.round(JSON.stringify(data).length / 1024))
}

type Option = readonly [value: string, label: string, pressed: boolean]

function onOff(on: boolean): Option[] {
  return [
    ['true', voice.settings.on, on],
    ['false', voice.settings.off, !on],
  ]
}

function group(title: string, rows: readonly string[]): string {
  return `<section class="settings-group"><h3 class="settings-title">${title}</h3>${rows.join('')}</section>`
}

function choice(key: keyof Settings, label: string, options: readonly Option[]): string {
  const id = `setting-${key}`
  return `<div class="setting" role="group" aria-labelledby="${id}">
    <span class="field-label" id="${id}">${label}</span>
    <div class="chips">${options
      .map(
        ([value, text, pressed]) =>
          `<button type="button" class="chip" data-setting="${key}" data-value="${value}" aria-pressed="${String(pressed)}">${text}</button>`,
      )
      .join('')}</div>
  </div>`
}

/** One choice, taking effect at once. */
function apply(store: Store, sound: Sound, key: string, value: string): void {
  switch (key) {
    case 'sound':
      sound.setMuted(value !== 'true')
      store.setSettings({ sound: value === 'true' })
      return
    case 'sessionSound':
      store.setSettings({ sessionSound: value === 'true' })
      return
    case 'dayEndsAt':
      store.setSettings({ dayEndsAt: value === '3' ? 3 : value === '5' ? 5 : 0 })
      return
    case 'weekStartsOn':
      store.setSettings({ weekStartsOn: value === 'sunday' ? 'sunday' : 'monday' })
      return
    case 'hemisphere':
      store.setSettings({ hemisphere: value === 'south' ? 'south' : 'north' })
      return
    case 'showTime':
      store.setSettings({ showTime: value === 'true' })
      return
    case 'defaultMinutes':
      store.setSettings({ defaultMinutes: Number(value) })
      return
    case 'postcardFormat':
      store.setSettings({ postcardFormat: value === 'square' ? 'square' : 'story' })
      return
    case 'stillSea':
      store.setSettings({ stillSea: value === 'true' })
      return
  }
}
