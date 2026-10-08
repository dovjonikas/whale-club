import { icon } from '../brand/icons'
import { creatureSvg } from '../scene/creatures'
import { dockItem, dockSvg, type DockItem } from '../scene/dock'
import { CHEST, freeSpot, moveTo } from '../scene/spots'
import { todayKey } from '../store/dates'
import { last7, lineFor, stageFor } from '../store/derive'
import { isHidden, owns } from '../store/dock'
import { krillBalance } from '../store/krill'
import type { Store } from '../store/store'
import type { AppData } from '../store/types'
import { voice } from '../voice'
import { dockByTier } from './dockData'
import { arrangementOf } from './sceneData'
import { openSheet } from './sheet'
import { swap } from './swap'
import { escapeHtml } from './thingMark'
import { announce } from './toast'

export interface DockHandlers {
  /** Something was just bought and the sheet has closed: the app shows it arriving. */
  onArrived: (item: DockItem) => void
  /** A placed thing could not go back out: its world is full. */
  onNoRoom: () => void
}

const TIERS = ['small', 'middling', 'large', 'legendary'] as const

/**
 * The dock: every thing krill can buy, in four tiers, at fixed prices. An
 * unowned thing is a silhouette with its price; owned, it is drawn and
 * says "yours". A thing opens on its own page in the sheet: get it in one
 * tap, save for it (one goal at a time), hide or show it, and for what a
 * creature wears, who wears it. No chance, no timers, nothing limited.
 */
export function openDockSheet(store: Store, handlers: DockHandlers, start?: string): void {
  openSheet({
    title: voice.dock.title,
    build(body, close) {
      const list = (): void => {
        body.innerHTML = listHtml(store.get())
        for (const tile of body.querySelectorAll<HTMLButtonElement>('.dock-tile')) {
          tile.addEventListener('click', () => {
            swap(body, () => {
              page(tile.dataset.item ?? '')
            })
          })
        }
      }

      const page = (id: string): void => {
        const item = dockItem(id)
        if (!item) {
          list()
          return
        }
        body.innerHTML = pageHtml(store.get(), item)
        on('.dock-back', () => {
          swap(body, () => {
            list()
            body.querySelector<HTMLElement>(`.dock-tile[data-item="${item.id}"]`)?.focus()
          })
        })
        on('.dock-get', () => {
          const today = todayKey()
          if (!store.buy(item.id, item.price, today)) return
          announce(voice.dock.arrived(item.name))
          // What a creature wears asks who first; everything else arrives at once.
          if (item.kind === 'wear') page(item.id)
          else {
            close()
            handlers.onArrived(item)
          }
        })
        on('.dock-save', () => {
          store.setGoal(store.get().goal === item.id ? null : item.id)
          page(item.id)
        })
        on('.dock-hide', () => {
          setShown(store, item, false, handlers)
          page(item.id)
        })
        on('.dock-show', () => {
          setShown(store, item, true, handlers)
          page(item.id)
        })
        for (const card of body.querySelectorAll<HTMLButtonElement>('.dock-wearer')) {
          card.addEventListener('click', () => {
            const firstTime = store.get().wears?.[item.id] === undefined
            store.setWearer(item.id, card.dataset.thing ?? '')
            if (firstTime) {
              close()
              handlers.onArrived(item)
            } else page(item.id)
          })
        }
        body.querySelector<HTMLElement>('.dock-item-name')?.focus({ preventScroll: true })
      }

      const on = (selector: string, run: () => void): void => {
        body.querySelector(selector)?.addEventListener('click', run)
      }

      if (start && dockItem(start)) page(start)
      else list()
    },
  })
}

/**
 * Hides or shows an owned thing. A placed thing is hidden by going into
 * the chest and shown by taking a free place; the rest keep a hidden list.
 */
function setShown(store: Store, item: DockItem, shown: boolean, handlers: DockHandlers): void {
  if (item.kind !== 'place' || !item.world) {
    store.setHidden(item.id, !shown)
    return
  }
  const data = store.get()
  const { things, where, rooms } = arrangementOf(data)
  const target = shown ? freeSpot(where, item.world, rooms)?.id : CHEST
  if (target === undefined) {
    handlers.onNoRoom()
    return
  }
  const records = moveTo(where, things, item.id, target, rooms)
  if (records) store.setPlacement(records)
}

/** Whether an owned thing is out in the scene. */
function isShown(data: AppData, item: DockItem): boolean {
  if (item.kind !== 'place') return !isHidden(data, item.id)
  return arrangementOf(data).where.get(item.id) !== CHEST
}

function listHtml(data: AppData): string {
  const balance = krillBalance(data, todayKey())
  const tiers = dockByTier()
  const sections = TIERS.map((tier) => {
    const tiles = (tiers.get(tier) ?? [])
      .map((item) => {
        const owned = owns(data, item.id)
        const state = owned ? 'is-owned' : 'is-locked'
        const goal = data.goal === item.id ? ' is-goal' : ''
        const label = owned
          ? `${item.name}, ${voice.dock.owned}`
          : voice.dock.locked(item.name, item.price)
        return `<li><button type="button" class="tile dock-tile ${state}${goal}" data-item="${item.id}" aria-label="${escapeHtml(label)}">
          <span class="tile-art">${dockSvg(item)}</span>
          <span class="tile-caption">${escapeHtml(item.name)}</span>
          <span class="dock-price">${owned ? voice.dock.owned : `${icon('krill', 'icon krill-icon')}${voice.dock.price(item.price)}`}</span>
        </button></li>`
      })
      .join('')
    return `<section class="dock-tier">
      <h3 class="dock-tier-title">${voice.dock.tiers[tier]}</h3>
      <ul class="tiles dock-tiles">${tiles}</ul>
    </section>`
  })
  return `<p class="sheet-note dock-intro">${voice.dock.intro}</p>
    <p class="dock-balance">${icon('krill', 'icon krill-icon')}<span>${voice.dock.balance(balance)}</span></p>
    ${sections.join('')}`
}

function pageHtml(data: AppData, item: DockItem): string {
  const owned = owns(data, item.id)
  const balance = krillBalance(data, todayKey())
  const short = item.price - balance
  const saving = data.goal === item.id
  let actions: string
  if (!owned) {
    const get =
      short <= 0
        ? `<button type="button" class="button-primary dock-get">${voice.dock.get}</button>`
        : `<p class="dock-short">${voice.dock.short(short)}</p>`
    const save = `<button type="button" class="button-quiet dock-save" aria-pressed="${String(saving)}">${saving ? voice.dock.stopSaving : voice.dock.save}</button>`
    actions = `${get}${save}`
  } else if (item.kind === 'wear') {
    actions = wearersHtml(data, item)
  } else {
    actions = isShown(data, item)
      ? `<button type="button" class="button-quiet dock-hide">${voice.dock.hide}</button>`
      : `<button type="button" class="button-quiet dock-show">${voice.dock.show}</button>`
  }
  const price = owned
    ? `<p class="dock-item-price">${voice.dock.owned}</p>`
    : `<p class="dock-item-price">${icon('krill', 'icon krill-icon')}${voice.dock.price(item.price)}${saving ? ` · ${voice.dock.saving}` : ''}</p>`
  return `<button type="button" class="button-quiet dock-back">${icon('back')}<span>${voice.dock.tiers[item.tier]}</span></button>
    <div class="dock-item${owned ? '' : ' is-locked'}">
      <span class="dock-item-art">${dockSvg(item)}</span>
      <h3 class="dock-item-name" tabindex="-1">${escapeHtml(item.name)}</h3>
      <p class="dock-item-line">${escapeHtml(item.line)}</p>
      ${price}
      <div class="dock-actions">${actions}</div>
    </div>`
}

/** "Who wears it?": one card per thing, its creature and its name; the one wearing it pressed. */
function wearersHtml(data: AppData, item: DockItem): string {
  const today = todayKey()
  const wearer = data.wears?.[item.id]
  const cards = [...data.things]
    .sort((a, b) => a.order - b.order)
    .map((thing) => {
      const stage = stageFor(last7(data, thing.id, today))
      return `<li><button type="button" class="dock-wearer" data-thing="${thing.id}" aria-pressed="${String(wearer === thing.id)}">
        <span class="dock-wearer-art">${creatureSvg(thing.world, lineFor(data, thing), stage)}</span>
        <span class="dock-wearer-name">${escapeHtml(thing.name)}</span>
      </button></li>`
    })
    .join('')
  const worn = data.things.find((t) => t.id === wearer)
  return `<p class="dock-who">${worn ? escapeHtml(voice.dock.wornBy(worn.name)) : voice.dock.whoWears}</p>
    <ul class="dock-wearers">${cards}</ul>`
}
