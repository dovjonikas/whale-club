/**
 * Places: where the finds and the dock's things stand. Every world has a
 * fixed set (the shore 6, the sea 8, the sky 8), and the three extensions
 * add theirs. A thing stands in a place of its own world or waits in the
 * chest; nothing stands anywhere else, so the scene always looks kept, and
 * on a phone a place is easy to hit.
 *
 * Positions are fractions of the scene's width and height, the same frame
 * the finds were placed in before (src/scene/collectibles). The shore's
 * things stand on their place (its y is where their feet are); everything
 * else is centred on it.
 *
 * Limited places are on purpose: a full world is a reason to arrange, put
 * something away, or save for more room.
 */
export type SpotWorld = 'sea' | 'sky' | 'garden'
export type Room = 'longer-shore' | 'reef' | 'island'

export interface Spot {
  id: string
  world: SpotWorld
  x: number
  y: number
  /** Things here stand with their feet on y rather than centred on it. */
  stand: boolean
  /** A far place draws its thing smaller: perspective, never a choice. */
  depth: number
  /** The extension this place comes with, if any. */
  room?: Room
}

/** Where a thing waits when it is not in the scene. */
export const CHEST = 'chest'

const spot = (
  id: string,
  world: SpotWorld,
  x: number,
  y: number,
  extra: { stand?: boolean; depth?: number; room?: Room } = {},
): Spot => ({
  id,
  world,
  x,
  y,
  stand: extra.stand ?? world === 'garden',
  depth: extra.depth ?? 1,
  ...(extra.room ? { room: extra.room } : {}),
})

/** The sand line, where the shore's things stand (the old finds' y). */
const SAND = 0.592
/** The water's edge, a step in front of the sand line: the longer shore's row. */
const EDGE = 0.616
/** The sea's two rows: just under the surface, and a step deeper. */
const SEA_HIGH = 0.628
const SEA_LOW = 0.668
/** The reef's row, deeper still, on the coral. */
const REEF = 0.704
/** The island's two rows on the whale's back, far away at the horizon. */
const ISLAND_BACK = 0.511
const ISLAND_FRONT = 0.545
const ISLAND_DEPTH = 0.78

/**
 * Every place, in the order new things take them: the first free place of
 * a world in this list is the "good free place" a new find goes to. The
 * order spreads a few things across the width before it fills in between.
 * The middle of the shore is left for the pier.
 */
const BASE: readonly Spot[] = [
  spot('shore-2', 'garden', 0.22, SAND),
  spot('shore-5', 'garden', 0.78, SAND),
  spot('shore-3', 'garden', 0.36, SAND),
  spot('shore-4', 'garden', 0.64, SAND),
  spot('shore-1', 'garden', 0.09, SAND),
  spot('shore-6', 'garden', 0.91, SAND),

  spot('sea-2', 'sea', 0.29, SEA_HIGH),
  spot('sea-7', 'sea', 0.6, SEA_LOW),
  spot('sea-3', 'sea', 0.71, SEA_HIGH),
  spot('sea-6', 'sea', 0.4, SEA_LOW),
  spot('sea-1', 'sea', 0.1, SEA_HIGH),
  spot('sea-4', 'sea', 0.9, SEA_HIGH),
  spot('sea-5', 'sea', 0.2, SEA_LOW),
  spot('sea-8', 'sea', 0.8, SEA_LOW),

  spot('sky-1', 'sky', 0.14, 0.17),
  spot('sky-6', 'sky', 0.8, 0.29),
  spot('sky-5', 'sky', 0.52, 0.31),
  spot('sky-2', 'sky', 0.4, 0.13),
  spot('sky-4', 'sky', 0.24, 0.3),
  spot('sky-3', 'sky', 0.64, 0.19),
  spot('sky-7', 'sky', 0.12, 0.44),
  spot('sky-8', 'sky', 0.88, 0.42),
]

const ROOMS: Readonly<Record<Room, readonly Spot[]>> = {
  // Four more on the sand, a row in front at the water's edge, between the others.
  'longer-shore': [0.29, 0.71, 0.15, 0.85].map((x, i) =>
    spot(`edge-${String(i + 1)}`, 'garden', x, EDGE, { room: 'longer-shore' }),
  ),
  // Six on the coral, a layer deeper than the sea's own.
  reef: [0.26, 0.58, 0.42, 0.74, 0.1, 0.9].map((x, i) =>
    spot(`reef-${String(i + 1)}`, 'sea', x, REEF, { room: 'reef' }),
  ),
  // Six on the island the big whale carries, at the left of the horizon, far away:
  // four along its shore and two on the dune behind, between them, so no ring hides another.
  island: (
    [
      [0.18, ISLAND_FRONT],
      [0.3, ISLAND_FRONT],
      [0.06, ISLAND_FRONT],
      [0.42, ISLAND_FRONT],
      [0.24, ISLAND_BACK],
      [0.12, ISLAND_BACK],
    ] as const
  ).map(([x, y], i) =>
    spot(`island-${String(i + 1)}`, 'garden', x, y, { room: 'island', depth: ISLAND_DEPTH }),
  ),
}

export const ROOM_IDS: readonly Room[] = ['longer-shore', 'reef', 'island']

export function isRoom(id: string): id is Room {
  return (ROOM_IDS as readonly string[]).includes(id)
}

/** The places there are, with the extensions owned. */
export function spotsFor(rooms: ReadonlySet<string>): Spot[] {
  return [...BASE, ...ROOM_IDS.filter((room) => rooms.has(room)).flatMap((room) => ROOMS[room])]
}

/** A place a thing could stand in, wherever it came from. */
export interface Placeable {
  id: string
  world: SpotWorld
  /** A legendary: it always gets a place, even when its world is full. */
  first?: boolean
}

/**
 * Where everything stands. Things with a record keep it while it is still
 * a place of their own world and nobody else holds it; "chest" keeps them
 * in the chest. Everything else, in the order it was got, takes the first
 * free place of its world, or waits in the chest when there is none. The
 * same things and records always give the same answer.
 */
export function placeAll(
  items: readonly Placeable[],
  records: Readonly<Record<string, string>> | undefined,
  rooms: ReadonlySet<string>,
): Map<string, string> {
  const spots = spotsFor(rooms)
  const byId = new Map(spots.map((s) => [s.id, s]))
  const taken = new Set<string>()
  const where = new Map<string, string>()
  const waiting: Placeable[] = []
  for (const item of items) {
    const record = records?.[item.id]
    const recorded = record === undefined ? undefined : byId.get(record)
    if (record === CHEST) where.set(item.id, CHEST)
    else if (recorded?.world === item.world && !taken.has(recorded.id)) {
      where.set(item.id, recorded.id)
      taken.add(recorded.id)
    } else waiting.push(item)
  }
  // A legendary goes first, and in a full world the newest ordinary thing gives up its place.
  const ordered = [...waiting.filter((i) => i.first), ...waiting.filter((i) => !i.first)]
  for (const item of ordered) {
    const free = spots.find((s) => s.world === item.world && !taken.has(s.id))
    if (free) {
      where.set(item.id, free.id)
      taken.add(free.id)
      continue
    }
    const yielding = item.first
      ? [...items]
          .reverse()
          .find(
            (other) =>
              other.world === item.world && !other.first && byId.has(where.get(other.id) ?? ''),
          )
      : undefined
    const spot = yielding ? where.get(yielding.id) : undefined
    if (yielding && spot) {
      where.set(yielding.id, CHEST)
      where.set(item.id, spot)
    } else where.set(item.id, CHEST)
  }
  return where
}

/**
 * Moves one thing to a place. A place of another world is refused (null).
 * If someone stands there, the two change places; from the chest, the one
 * standing there goes into the chest. The whole result is returned as
 * records, so nothing else moves after an arrangement.
 */
export function moveTo(
  current: ReadonlyMap<string, string>,
  items: readonly Placeable[],
  item: string,
  target: string,
  rooms: ReadonlySet<string>,
): Record<string, string> | null {
  const world = items.find((i) => i.id === item)?.world
  const from = current.get(item)
  if (world === undefined || from === undefined) return null
  if (target !== CHEST) {
    const place = spotsFor(rooms).find((s) => s.id === target)
    if (place?.world !== world) return null
  }
  const records = Object.fromEntries(current)
  const holder = target === CHEST ? undefined : [...current].find(([, at]) => at === target)?.[0]
  records[item] = target
  if (holder !== undefined && holder !== item) records[holder] = from
  return records
}

/** The first free place of a world, for "put out"; null when the world is full. */
export function freeSpot(
  current: ReadonlyMap<string, string>,
  world: SpotWorld,
  rooms: ReadonlySet<string>,
): Spot | null {
  const taken = new Set(current.values())
  return spotsFor(rooms).find((s) => s.world === world && !taken.has(s.id)) ?? null
}
