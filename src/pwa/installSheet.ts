import { openSheet } from '../app/sheet'
import { voice } from '../voice'

/**
 * How to put the app on an iPhone home screen, as three big steps. Safari
 * has no install API, so this is the whole of what the app can do: say it
 * clearly, with the icons the person will be looking for.
 */
const SHARE_ICON = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12M8 7l4-4 4 4"/><path d="M5 11v8a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-8"/></svg>`
const ADD_ICON = `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="4"/><path d="M12 8v8M8 12h8"/></svg>`
const DONE_ICON = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12l5 5 9-10"/></svg>`

export function openInstallSheet(): void {
  const icons = [SHARE_ICON, ADD_ICON, DONE_ICON]
  openSheet({
    title: voice.install.ios,
    build(body) {
      body.innerHTML = `
        <ol class="install-steps">
          ${voice.install.iosSteps
            .map(
              (step, i) => `<li>
                <span class="install-icon">${icons[i] ?? ''}</span>
                <span class="install-text">${step}</span>
              </li>`,
            )
            .join('')}
        </ol>
        <p class="sheet-note">${voice.install.iosNote}</p>`
    },
  })
}
