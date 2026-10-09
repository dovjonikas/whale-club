import type { NoticeBuilder } from '../app/notices'
import { addDays, todayKey } from '../store/dates'
import type { Store } from '../store/store'
import { voice } from '../voice'
import { openInstallSheet } from './installSheet'
import { leafCard, leafHtml, onAction } from '../app/leaf'

/**
 * The install leaf: a small card above the row that offers to put the app
 * on the home screen, once the person has added their first thing (an
 * empty first screen is for the first sentence, not for this).
 *
 * iPhone Safari has no install API, so its button opens a sheet with the
 * three steps, big, with the icons to look for. Android Chrome gets one
 * Install button once the browser offers `beforeinstallprompt`. A desktop
 * gets nothing. Closing it is remembered for seven days.
 */
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const REMIND_AFTER_DAYS = 7

let deferred: BeforeInstallPromptEvent | null = null

/** Catches Android's install offer as early as it comes; `onReady` lets the notices redraw. */
export function listenForInstallPrompt(onReady: () => void): void {
  if (!navigator.userAgent.includes('Android')) return
  addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault()
    deferred = event as BeforeInstallPromptEvent
    onReady()
  })
}

export function installNotice(store: Store): NoticeBuilder {
  return (dismiss) => {
    if (isStandalone()) return null
    const data = store.get()
    if (data.things.length === 0) return null
    const dismissedAt = data.settings.installDismissedAt
    if (dismissedAt && addDays(dismissedAt, REMIND_AFTER_DAYS) > todayKey()) return null
    const iphone = /iPhone|iPod/.test(navigator.userAgent)
    const prompt = deferred
    if (!iphone && !prompt) return null

    const leaf = leafCard('install', 'install-leaf')
    leaf.innerHTML = leafHtml({
      title: iphone ? voice.install.ios : voice.install.android,
      ...(iphone ? { lead: voice.install.iosLead } : {}),
      actions: [
        { label: voice.install.close, name: 'leaf-close', kind: 'quiet' },
        {
          label: iphone ? voice.install.iosHow : voice.install.button,
          name: 'leaf-install',
          kind: 'primary',
        },
      ],
    })
    onAction(leaf, 'leaf-close', () => {
      store.setSettings({ installDismissedAt: todayKey() })
      dismiss()
    })
    onAction(leaf, 'leaf-install', () => {
      if (!prompt) {
        openInstallSheet()
        return
      }
      void prompt
        .prompt()
        .then(() => prompt.userChoice)
        .then(() => {
          deferred = null
          dismiss()
        })
    })
    return leaf
  }
}

function isStandalone(): boolean {
  const nav = navigator as Navigator & { standalone?: boolean }
  return matchMedia('(display-mode: standalone)').matches || nav.standalone === true
}
