import { addDays, todayKey } from '../store/dates'
import type { Store } from '../store/store'
import { voice } from '../voice'
import { openInstallSheet } from './installSheet'

/**
 * The install leaf: a small card above the row that offers to put the app
 * on the home screen. iPhone Safari has no install API, so its button
 * opens a sheet with the three steps, big, with the icons to look for; Android Chrome gets one Install
 * button once the browser offers `beforeinstallprompt`; a desktop gets
 * nothing. Closing it is remembered for seven days.
 */
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const REMIND_AFTER_DAYS = 7

export function setupInstallLeaf(slot: HTMLElement, store: Store): void {
  if (isStandalone()) return
  const dismissedAt = store.get().settings.installDismissedAt
  if (dismissedAt && addDays(dismissedAt, REMIND_AFTER_DAYS) > todayKey()) return

  const ua = navigator.userAgent
  if (/iPhone|iPod/.test(ua)) {
    showLeaf(slot, store, iosBody(), null)
    return
  }
  if (ua.includes('Android')) {
    addEventListener(
      'beforeinstallprompt',
      (event) => {
        event.preventDefault()
        showLeaf(
          slot,
          store,
          `<span class="leaf-title">${voice.install.android}</span>`,
          event as BeforeInstallPromptEvent,
        )
      },
      { once: true },
    )
  }
}

function showLeaf(
  slot: HTMLElement,
  store: Store,
  bodyHtml: string,
  prompt: BeforeInstallPromptEvent | null,
): void {
  const leaf = document.createElement('aside')
  leaf.className = 'leaf'
  leaf.setAttribute('aria-label', 'install')
  leaf.innerHTML = `
    <div>${bodyHtml}</div>
    <div class="leaf-actions">
      <button type="button" class="button-primary leaf-install">${prompt ? voice.install.button : voice.install.iosHow}</button>
      <button type="button" class="button-quiet leaf-close">${voice.install.close}</button>
    </div>`
  const close = (): void => {
    store.setSettings({ installDismissedAt: todayKey() })
    leaf.remove()
  }
  leaf.querySelector('.leaf-close')?.addEventListener('click', close)
  leaf.querySelector('.leaf-install')?.addEventListener('click', () => {
    if (!prompt) {
      openInstallSheet()
      return
    }
    void prompt
      .prompt()
      .then(() => prompt.userChoice)
      .then(() => leaf.remove())
  })
  if (slot.childElementCount === 0) slot.replaceChildren(leaf)
}

function iosBody(): string {
  return `<span class="leaf-title">${voice.install.ios}</span>
    <span class="leaf-lead">${voice.install.iosLead}</span>`
}

function isStandalone(): boolean {
  const nav = navigator as Navigator & { standalone?: boolean }
  return matchMedia('(display-mode: standalone)').matches || nav.standalone === true
}
