import { addDays, todayKey } from '../store/dates'
import type { Store } from '../store/store'
import { voice } from '../voice'

/**
 * The install leaf: a small card above the row that says how to put the
 * app on the home screen. iPhone Safari has no install API, so it gets
 * the two steps and the Share glyph; Android Chrome gets one Install
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
      ${prompt ? `<button type="button" class="button-primary leaf-install">${voice.install.button}</button>` : ''}
      <button type="button" class="button-quiet leaf-close">${voice.install.close}</button>
    </div>`
  const close = (): void => {
    store.setSettings({ installDismissedAt: todayKey() })
    leaf.remove()
  }
  leaf.querySelector('.leaf-close')?.addEventListener('click', close)
  leaf.querySelector('.leaf-install')?.addEventListener('click', () => {
    if (!prompt) return
    void prompt
      .prompt()
      .then(() => prompt.userChoice)
      .then(() => leaf.remove())
  })
  if (slot.childElementCount === 0) slot.replaceChildren(leaf)
}

function iosBody(): string {
  const share = `<svg class="leaf-share" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12M8 7l4-4 4 4M5 12v7a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-7"/></svg>`
  const [one, two] = voice.install.iosSteps
  return `<span class="leaf-title">${voice.install.ios}</span>
    <ol><li>${one} ${share}</li><li>${two}</li></ol>`
}

function isStandalone(): boolean {
  const nav = navigator as Navigator & { standalone?: boolean }
  return matchMedia('(display-mode: standalone)').matches || nav.standalone === true
}
