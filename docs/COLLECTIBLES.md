# Collectibles

Every thing unlocks its own path. The path belongs to the thing's world,
and each world has two lines so that a second thing in the same world (the
4th thing is SEA again, the 5th is SKY again) grows something different.
Which line a thing gets: the first thing in a world takes line A, the second
line B.

Unlock tiers are the total number of days the thing was done, ever:
**3, 7, 14, 21, 30, 45, 60, 90, 120, 180, 240, 300, 365**: a first year. Unlocks are computed from the
day records every time the scene draws; nothing is stored, so nothing can
be lost or corrupted. Locked items show as silhouettes in the Collection
screen so the next one is always visible. Each unlock plays a small scene in
the world and says one line (`voice.ts`, key `unlock`, placeholder until
the author writes it).

## SEA

| Days | Line A                                                                  | Line B                                                                                        |
| ---- | ----------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| 3    | Plankton glow: a few cyan dots start drifting near the thing's creature | A tide pool: a small ring of dots at the water line                                           |
| 7    | A fish: the first other creature appears and follows the creature       | A seahorse clinging to a weed                                                                 |
| 14   | A school of fish: six small fish turning together                       | A crab walking the sea floor                                                                  |
| 21   | An anchor, half buried: a sign somebody stayed                          | A sea turtle drifting past, slowly                                                            |
| 30   | A jellyfish that only comes out at night (after 21:00 local)            | A pair of jellyfish at night                                                                  |
| 45   | A dolphin that jumps once when the thing is tapped                      | A manta ray gliding under everything                                                          |
| 60   | A lighthouse beam sweeping the water from the shore                     | An octopus with a face, in a cave at the bottom                                               |
| 90   | The whale wears the red jacket                                          | A sunken ship with its own bioluminescent glow                                                |
| 120  | A whale calf that follows the whale                                     | A narwhal, because why not                                                                    |
| 180  | The whale sings: a slow light pulse travels across the whole sea        | The deep opens: the sea floor drops away and shows a second, darker layer with its own lights |
| 240  | A sea otter afloat on its back, holding a shell                         | A pufferfish, round when surprised                                                            |
| 300  | A seal asleep on its rock                                               | A coral, a little taller every year                                                           |
| 365  | A pod of whales: a year of showing up                                   | An orca, for company                                                                          |

## SKY

| Days | Line A                                                                     | Line B                                                       |
| ---- | -------------------------------------------------------------------------- | ------------------------------------------------------------ |
| 3    | The first star next to the thing's creature, brighter than a day-star      | A satellite crossing once a minute                           |
| 7    | A constellation: the thing's own seven stars joined by lines               | A planet, low near the horizon                               |
| 14   | A moon ring: a halo around the real moon                                   | A second moon, smaller, because this sky allows it           |
| 21   | A shooting star once per session                                           | The Milky Way band, faint                                    |
| 30   | A comet with a tail that stays all month                                   | Moonlight on the water: a path of light under the moon       |
| 45   | The aurora, a slow green and teal curtain near the horizon                 | A meteor shower on the day it unlocks, then one meteor a day |
| 60   | A paper airplane crossing the sky, a bit silly on purpose                  | An owl on the horizon's edge, blinking                       |
| 90   | An astronaut floating by, wearing the red jacket over the suit             | A hot air balloon with the red jacket as its basket          |
| 120  | A second constellation: a whale drawn in stars                             | A kite that stays up even at night                           |
| 180  | The sky turns slowly over the night: the stars rotate around the pole star | An eclipse once a week, two seconds long                     |
| 240  | A small rocket, off somewhere                                              | A cloud with a silver edge, the moon behind it               |
| 300  | A ringed planet                                                            | A visitor that waves                                         |
| 365  | A galaxy, a year of stars turning                                          | The morning sun, after a year of nights                      |

## GARDEN

| Days | Line A                                                             | Line B                                               |
| ---- | ------------------------------------------------------------------ | ---------------------------------------------------- |
| 3    | A sprout on the shore                                              | A mushroom, small and glowing at night               |
| 7    | A sunflower, one                                                   | A rose bush                                          |
| 14   | Bees around the sunflower                                          | A snail on the sand, going somewhere                 |
| 21   | A field of sunflowers along the shore                              | A garden path of stones                              |
| 30   | A scarecrow in the red jacket                                      | A bench facing the sea                               |
| 45   | A butterfly that lands on the creature when tapped                 | A rabbit that peeks out of the grass                 |
| 60   | A tiny greenhouse glowing after dark                               | A lantern on a post, lit at night                    |
| 90   | A tree, finally tall enough to have a swing                        | A cat on the bench, asleep                           |
| 120  | Fireflies over the whole garden at night                           | Wind: the whole garden sways together                |
| 180  | A second shore appears on the other side: the garden has an island | A treehouse in the tree with a window that lights up |
| 240  | A pond with a frog                                                 | A deer at the edge of the light                      |
| 300  | A hedgehog out for a walk                                          | A wishing well                                       |
| 365  | A cottage: a year, and a home                                      | An apple tree                                        |

## On the path to a legendary

Not per thing: every day something was done lights a star of the current
constellation (src/store/paths.ts). Paths are 30, 60, then 100 stars; half
way brings a rare find, the end a legendary, earned, never sold.

| Path | Stars | Half way (rare)  | The end (legendary)   |
| ---- | ----- | ---------------- | --------------------- |
| 1    | 30    | a golden scale   | the golden whale      |
| 2    | 60    | a pearl          | the pearl turtle      |
| 3    | 100   | stardust         | the comet fox         |
| 4    | 100   | a prism          | the crystal jellyfish |
| 5    | 100   | a silver feather | the moon heron        |

After the fifth, the paths go round again.

## Creatures (grow with the last 7 days, not with the total)

| World  | Line A stages (0-1 / 2-3 / 4-5 / 6-7 days)                      | Line B stages                                                        |
| ------ | --------------------------------------------------------------- | -------------------------------------------------------------------- |
| SEA    | speck, small fish, big fish, whale                              | bubble, seahorse, turtle, orca                                       |
| SKY    | spark, star, bright star with rays, moon-sized star with a face | dust, small cloud, cloud with a face, thundercloud that glows kindly |
| GARDEN | seed, sprout, bud, sunflower with a face                        | pebble, mushroom, fern, tree with a face                             |

The stage drops when the last 7 days drop. Nothing is lost: the collection
stays, the scene stays, only the creature is smaller for a while.

## Adding a collectible

1. Add a row to the right table above.
2. Add its entry to `src/scene/collectibles.ts` (world, line, days, id, draw function).
3. Add a `voice.ts` line under `unlock.<id>` (placeholder allowed).
4. The Collection screen and the silhouettes read that one list; nothing else to register.
5. Add an e2e case in `tests/e2e/stones.e2e.ts` that seeds the days and expects the item.
