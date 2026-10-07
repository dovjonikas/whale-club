import { icon } from '../brand/icons'
import { voice } from '../voice'
import { BRAND } from './brand'

/**
 * The header: the title and four quiet buttons, with the brand's own icons
 * (src/brand/icons.ts), inline so they take the current colour.
 */
export interface HeaderHandlers {
  onSound: (button: HTMLButtonElement) => void
  onCollection: () => void
  onSend: () => void
  onMenu: () => void
}

export function renderHeader(parent: HTMLElement, handlers: HeaderHandlers, muted: boolean): void {
  parent.innerHTML = `
    <h1 class="title">${BRAND.name}</h1>
    <div class="header-actions">
      <button type="button" class="icon-button" data-action="sound" aria-label="Sound" aria-pressed="${String(!muted)}">
        ${icon('sound')}
      </button>
      <button type="button" class="icon-button" data-action="collection" aria-label="Collection">
        ${icon('star')}
      </button>
      <button type="button" class="icon-button" data-action="send" aria-label="${voice.postcard.sendSea}">
        ${icon('share')}
      </button>
      <button type="button" class="icon-button" data-action="menu" aria-label="Menu">
        ${icon('menu')}
      </button>
    </div>`
  const button = (action: string): HTMLButtonElement => {
    const element = parent.querySelector<HTMLButtonElement>(`[data-action="${action}"]`)
    if (!element) throw new Error(`no ${action} button`)
    return element
  }
  const sound = button('sound')
  sound.addEventListener('click', () => {
    handlers.onSound(sound)
  })
  button('collection').addEventListener('click', handlers.onCollection)
  button('send').addEventListener('click', handlers.onSend)
  button('menu').addEventListener('click', handlers.onMenu)
}
