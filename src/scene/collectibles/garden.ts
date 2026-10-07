import * as art from '../art'
import { dots, face, jacket, stem, sunflower } from '../draw'
import { garden, type Collectible } from './build'

/** The garden's twenty finds, line A then line B. */
export const GARDEN: readonly Collectible[] = [
  // GARDEN, line A
  garden('a', 3, 'garden-a-sprout', 'a sprout', 'on the shore', 0.12, 14, 'sway', art.sprout),
  garden(
    'a',
    7,
    'garden-a-sunflower',
    'a sunflower',
    'one',
    0.2,
    22,
    'sway',
    () => `${stem(50, 40, 95)}${sunflower(50, 36, 26)}`,
  ),
  garden('a', 14, 'garden-a-bees', 'bees', 'around the sunflower', 0.24, 18, 'drift', art.bees),
  garden('a', 21, 'garden-a-field', 'a field', 'sunflowers along the shore', 0.36, 60, 'sway', () =>
    [10, 28, 46, 64, 82]
      .map((x, i) => `${stem(x, 50 + (i % 2) * 10, 95)}${sunflower(x, 46 + (i % 2) * 10, 12)}`)
      .join(''),
  ),
  garden(
    'a',
    30,
    'garden-a-scarecrow',
    'a scarecrow',
    'in the red jacket',
    0.55,
    26,
    'none',
    () =>
      `<path d="M50 95 V 30 M28 48 H 72" stroke="#6b4a2b" stroke-width="4" stroke-linecap="round"/><circle cx="50" cy="22" r="11" fill="var(--sand)"/><path d="M36 18 h 28 l -4 -8 h -20 z" fill="#6b4a2b"/>${jacket(50, 42, 30)}${face(50, 22, 0.7)}`,
  ),
  garden(
    'a',
    45,
    'garden-a-butterfly',
    'a butterfly',
    'lands on the creature when tapped',
    0.64,
    16,
    'drift',
    art.butterfly,
  ),
  garden(
    'a',
    60,
    'garden-a-greenhouse',
    'a greenhouse',
    'glowing after dark',
    0.76,
    30,
    'none',
    art.greenhouse,
  ),
  garden('a', 90, 'garden-a-tree', 'a tree', 'tall enough for a swing', 0.88, 44, 'sway', art.tree),
  garden(
    'a',
    120,
    'garden-a-fireflies',
    'fireflies',
    'over the garden at night',
    0.5,
    160,
    'twinkle',
    () =>
      dots(
        [
          [10, 40, 1.5],
          [25, 20, 1.2],
          [40, 50, 1.6],
          [55, 15, 1.2],
          [70, 45, 1.5],
          [85, 25, 1.3],
          [95, 55, 1.2],
        ],
        'var(--sun)',
      ),
    true,
  ),
  garden(
    'a',
    180,
    'garden-a-island',
    'an island',
    'a second shore across the water',
    0.5,
    120,
    'none',
    () =>
      `<path d="M0 70 Q 50 40, 100 70 V 80 H 0 Z" fill="var(--sand)" opacity="0.8"/><path d="M50 55 V 30 M50 32 q -16 -4 -22 -14 M50 32 q 16 -4 22 -14 M50 34 q -8 -14 -2 -24" stroke="var(--leaf)" stroke-width="3" stroke-linecap="round" fill="none"/>`,
  ),
  // GARDEN, line B
  garden(
    'b',
    3,
    'garden-b-mushroom',
    'a mushroom',
    'small, glowing at night',
    0.3,
    12,
    'none',
    art.mushroom,
  ),
  garden('b', 7, 'garden-b-roses', 'a rose bush', 'red, of course', 0.44, 22, 'sway', art.roses),
  garden('b', 14, 'garden-b-snail', 'a snail', 'going somewhere', 0.08, 14, 'drift', art.snail),
  garden(
    'b',
    21,
    'garden-b-path',
    'a garden path',
    'stones, to nowhere in particular',
    0.68,
    60,
    'none',
    () =>
      [10, 30, 50, 70, 90]
        .map((x, i) => `<ellipse cx="${x}" cy="${80 - (i % 2) * 6}" rx="9" ry="4" fill="#8f98a3"/>`)
        .join(''),
  ),
  garden('b', 30, 'garden-b-bench', 'a bench', 'facing the sea', 0.8, 28, 'none', art.bench),
  garden(
    'b',
    45,
    'garden-b-rabbit',
    'a rabbit',
    'peeks out of the grass',
    0.16,
    16,
    'none',
    art.rabbit,
  ),
  garden('b', 60, 'garden-b-lantern', 'a lantern', 'lit at night', 0.92, 18, 'none', art.lantern),
  garden('b', 90, 'garden-b-cat', 'a cat', 'asleep on the bench', 0.8, 20, 'none', art.cat),
  garden(
    'b',
    120,
    'garden-b-wind',
    'wind',
    'the whole garden sways together',
    0.5,
    90,
    'sway',
    () =>
      `<path d="M5 30 q 20 -12 40 0 t 40 0 M5 55 q 20 -12 40 0 t 40 0" stroke="#e8f0f5" stroke-width="1.5" fill="none" stroke-linecap="round" opacity="0.35"/>`,
  ),
  garden(
    'b',
    180,
    'garden-b-treehouse',
    'a treehouse',
    'with a window that lights up',
    0.88,
    28,
    'none',
    art.treehouse,
    true,
  ),
]
