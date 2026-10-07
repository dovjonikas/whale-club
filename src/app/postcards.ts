import { icon } from '../brand/icons'
import type { Scene } from '../scene/scene'
import { todayKey } from '../store/dates'
import { dayNumber } from '../store/derive'
import type { Store } from '../store/store'
import type { PostcardFormat } from '../store/types'
import { voice } from '../voice'
import type { Line } from './line'
import { renderPostcard, type Moment } from './postcard'
import { openSheet } from './sheet'
import { showToast } from './toast'

/**
 * Sending the whale: the one button that appears after a moment worth
 * showing, and the plumbing behind it.
 *
 * The share sheet only opens inside a tap, and on iPhone a tap's
 * permission does not survive a long wait. So a postcard is painted as
 * soon as its button appears, and the tap only hands the finished file to
 * the share sheet. If the browser refuses anyway, the postcard opens in a
 * sheet with its own send button, which is a fresh tap.
 */
const OFFER_FOR_MS = 20_000

export class Postcards {
  private offerTimer = 0

  constructor(
    private readonly store: Store,
    private readonly scene: Scene,
    private readonly line: Line,
    private readonly slot: HTMLElement,
  ) {}

  /** Shows the one button, after `delayMs`, for a while. */
  offer(moment: Moment, label: string, delayMs: number): void {
    this.clearOffer()
    this.offerTimer = window.setTimeout(() => {
      const prepared = this.prepare(moment)
      const button = document.createElement('button')
      button.type = 'button'
      button.className = 'offer'
      button.innerHTML = `${icon('send')}<span></span>`
      const text = button.querySelector('span')
      if (text) text.textContent = label
      button.addEventListener('click', () => {
        this.clearOffer()
        this.send(moment, prepared)
      })
      this.slot.replaceChildren(button)
      requestAnimationFrame(() => button.classList.add('is-in'))
      this.offerTimer = window.setTimeout(() => {
        this.clearOffer()
      }, OFFER_FOR_MS)
    }, delayMs)
  }

  clearOffer(): void {
    clearTimeout(this.offerTimer)
    this.slot.replaceChildren()
  }

  /** Send now, from the header or the recap. */
  sendNow(moment: Moment): void {
    this.send(moment, this.prepare(moment))
  }

  /** Starts painting both sizes the moment a button could be pressed. */
  private prepare(moment: Moment): Record<PostcardFormat, () => Promise<Blob>> {
    const data = this.store.get()
    const ids = this.scene.visibleCollectibleIds()
    const cache: Partial<Record<PostcardFormat, Promise<Blob>>> = {}
    const get = (format: PostcardFormat): Promise<Blob> =>
      (cache[format] ??= renderPostcard(data, moment, format, ids))
    const chosen = data.settings.postcardFormat
    if (chosen) void get(chosen).catch(() => undefined)
    else {
      void get('story').catch(() => undefined)
      void get('square').catch(() => undefined)
    }
    return { story: () => get('story'), square: () => get('square') }
  }

  private send(moment: Moment, prepared: Record<PostcardFormat, () => Promise<Blob>>): void {
    const chosen = this.store.get().settings.postcardFormat
    if (chosen) {
      void this.deliver(prepared[chosen](), moment)
      return
    }
    openFormatSheet((format) => {
      this.store.setSettings({ postcardFormat: format })
      void this.deliver(prepared[format](), moment)
    })
  }

  private async deliver(pending: Promise<Blob>, moment: Moment): Promise<void> {
    let file: File
    try {
      const blob = await pending
      file = new File([blob], `whale-club-day-${dayNumber(this.store.get(), todayKey())}.png`, {
        type: 'image/png',
      })
    } catch {
      showToast(`${voice.shareFailed} ${voice.shareFailedNext}`)
      return
    }
    const result = await share(file)
    if (result === 'refused') openPreview(file, moment)
    else if (result === 'downloaded') this.line.say(voice.shareDone)
  }
}

type ShareResult = 'shared' | 'cancelled' | 'refused' | 'downloaded'

async function share(file: File): Promise<ShareResult> {
  const nav = navigator as Navigator & { canShare?: (data: ShareData) => boolean }
  if (
    typeof nav.share === 'function' &&
    typeof nav.canShare === 'function' &&
    nav.canShare({ files: [file] })
  ) {
    try {
      await nav.share({ files: [file] })
      return 'shared'
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return 'cancelled'
      if (error instanceof DOMException && error.name === 'NotAllowedError') return 'refused'
    }
  }
  download(file)
  return 'downloaded'
}

function openFormatSheet(onChoose: (format: PostcardFormat) => void): void {
  openSheet({
    title: voice.postcard.which,
    build(body, close) {
      body.innerHTML = `
        <div class="formats">
          <button type="button" class="format" data-format="story">
            <span class="format-shape is-story" aria-hidden="true"></span>
            <span>${voice.postcard.story}</span>
          </button>
          <button type="button" class="format" data-format="square">
            <span class="format-shape is-square" aria-hidden="true"></span>
            <span>${voice.postcard.square}</span>
          </button>
        </div>`
      body.querySelectorAll<HTMLButtonElement>('[data-format]').forEach((button) => {
        button.addEventListener('click', () => {
          close()
          onChoose(button.dataset.format === 'square' ? 'square' : 'story')
        })
      })
    },
  })
}

/** The fallback when the share sheet refused: the picture, and a fresh tap to send it. */
function openPreview(file: File, moment: Moment): void {
  const url = URL.createObjectURL(file)
  openSheet({
    title: voice.postcard.preview,
    build(body, close) {
      body.innerHTML = `
        <img class="postcard-preview" alt="" />
        <button type="button" class="button-primary">${voice.postcard.send}</button>`
      const image = body.querySelector('img')
      if (image) {
        image.src = url
        image.alt = moment.line
      }
      body.querySelector('button')?.addEventListener('click', () => {
        close()
        void share(file)
      })
    },
    onClose() {
      setTimeout(() => URL.revokeObjectURL(url), 10_000)
    },
  })
}

function download(file: File): void {
  const url = URL.createObjectURL(file)
  const link = document.createElement('a')
  link.href = url
  link.download = file.name
  document.body.append(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 10_000)
}
