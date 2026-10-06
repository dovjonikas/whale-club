/**
 * A bottom sheet over the scene. One at a time, modal, closed by its own
 * button, the scrim or Escape. Focus goes in on open and back to whatever
 * opened it on close; everything behind it is `inert` while it is open.
 */
export interface SheetHandle {
  readonly body: HTMLElement
  close(): void
}

interface SheetOptions {
  title: string
  /** Fills the sheet. `close` is handed in so a form can close itself. */
  build: (body: HTMLElement, close: () => void) => void
  onClose?: () => void
}

let openHandle: SheetHandle | null = null

export function openSheet(options: SheetOptions): SheetHandle {
  openHandle?.close()
  const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null
  const app = document.getElementById('app')

  const scrim = document.createElement('div')
  scrim.className = 'sheet-scrim'

  const sheet = document.createElement('section')
  sheet.className = 'sheet'
  sheet.setAttribute('role', 'dialog')
  sheet.setAttribute('aria-modal', 'true')
  const titleId = `sheet-title-${String(Date.now())}`
  sheet.setAttribute('aria-labelledby', titleId)
  sheet.innerHTML = `
    <h2 class="sheet-title" id="${titleId}"></h2>
    <button class="icon-button sheet-close" type="button" aria-label="Close">
      <svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>
    </button>
    <div class="sheet-body"></div>`
  const title = sheet.querySelector('.sheet-title')
  if (title) title.textContent = options.title
  const body = sheet.querySelector<HTMLElement>('.sheet-body')
  if (!body) throw new Error('sheet without body')

  let closed = false
  const close = (): void => {
    if (closed) return
    closed = true
    openHandle = null
    document.removeEventListener('keydown', onKey)
    app?.removeAttribute('inert')
    scrim.classList.remove('is-open')
    sheet.classList.remove('is-open')
    setTimeout(() => {
      scrim.remove()
      sheet.remove()
    }, 300)
    opener?.focus()
    options.onClose?.()
  }

  const onKey = (event: KeyboardEvent): void => {
    if (event.key === 'Escape') close()
  }

  options.build(body, close)
  sheet.querySelector('.sheet-close')?.addEventListener('click', close)
  scrim.addEventListener('click', close)
  document.addEventListener('keydown', onKey)

  document.body.append(scrim, sheet)
  app?.setAttribute('inert', '')
  requestAnimationFrame(() => {
    scrim.classList.add('is-open')
    sheet.classList.add('is-open')
    const first = sheet.querySelector<HTMLElement>('input, button:not(.sheet-close)')
    first?.focus()
  })

  const handle: SheetHandle = { body, close }
  openHandle = handle
  return handle
}
