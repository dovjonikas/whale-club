import { voice } from '../voice'
import { BRAND } from './brand'

/**
 * The header: the title and four quiet buttons. Icons are inline strokes
 * so they take the current colour and need no font or sprite.
 */
export interface HeaderHandlers {
  onSound: (button: HTMLButtonElement) => void
  onCollection: () => void
  onSend: () => void
  onMenu: () => void
}

const ICONS = {
  sound:
    '<path d="M4 10v4h4l5 4V6L8 10H4z"/><path d="M16 9a4 4 0 0 1 0 6"/><path d="M18.5 6.5a8 8 0 0 1 0 11"/>',
  collection: '<path d="M12 3l2.6 5.6 6.1.7-4.5 4.2 1.2 6-5.4-3-5.4 3 1.2-6L3.3 9.3l6.1-.7z"/>',
  send: '<path d="M12 3v12M8 7l4-4 4 4"/><path d="M5 12v7a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-7"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h10"/>',
} as const

export function renderHeader(parent: HTMLElement, handlers: HeaderHandlers, muted: boolean): void {
  parent.innerHTML = `
    <h1 class="title">${BRAND.name}</h1>
    <div class="header-actions">
      <button type="button" class="icon-button" data-action="sound" aria-label="Sound" aria-pressed="${String(!muted)}">
        <svg viewBox="0 0 24 24">${ICONS.sound}</svg>
      </button>
      <button type="button" class="icon-button" data-action="collection" aria-label="Collection">
        <svg viewBox="0 0 24 24">${ICONS.collection}</svg>
      </button>
      <button type="button" class="icon-button" data-action="send" aria-label="${voice.postcard.sendSea}">
        <svg viewBox="0 0 24 24">${ICONS.send}</svg>
      </button>
      <button type="button" class="icon-button" data-action="menu" aria-label="Menu">
        <svg viewBox="0 0 24 24">${ICONS.menu}</svg>
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
