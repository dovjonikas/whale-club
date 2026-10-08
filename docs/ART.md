# Art slots

Every find is drawn in code, and every find can wear a picture instead,
with no code changed: put `public/art/<id>.webp` (or `.png`) in place and
build. The app draws the picture wherever the find shows (the scene, the
Collection, the dock's silhouettes, the postcard), and a find not found yet
is the picture's silhouette, made from its transparency by the same filter
that darkens a drawing. Without a picture, the drawing stays.

The creatures are not art slots: they grow, breathe and wear things, so
they stay code.

## The rules for a picture

- **512 by 512 px**, transparent background, the object centred with about
  8 % margin on every side.
- **The file name is the find's id**: `sea-a-fish.webp`, `legend-whale.webp`.
  `npm run art:check -- --missing` lists every id still drawn in code.
- **The palette is the app's**: the tokens in [DESIGN.md](DESIGN.md) and
  `src/styles/tokens.css` (the night blues, the glow, the star gold, the
  sand, the jacket red). A legendary may add gold or pearl.
- **The style**: soft shading with the light from the top left, round
  shapes, a pale highlight, a face on anything alive (two dark eyes with a
  catchlight, a small smile, a little blush), no text, no outlines heavier
  than the drawing's own.
- WebP at 80 to 90 quality is plenty; keep each under about 60 KB, since
  the service worker keeps every picture for offline.

## Checking

```bash
npm run art:check
```

Reports how many finds have a picture, any picture of the wrong size or
without transparency, and any file that matches no find.

## Rights

The code is MIT. Pictures in `public/art` are not: each stays with its
author, all rights reserved, unless the author says otherwise here. If an
author wants credit, it goes in this file.
