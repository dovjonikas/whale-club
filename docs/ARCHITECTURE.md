# Architecture

How the app is put together, where the data flows, and how to add a world
or a collectible. [STATE.md](STATE.md) says where the project is;
[DESIGN.md](DESIGN.md) says what it looks like and why.

## 1. The shape

Vanilla TypeScript on Vite. No framework: the whole UI is one screen with a
row of cards and a few sheets, and a framework would be most of the bundle
for none of the work. Everything is a function of one object in
localStorage.

```
src/
  main.ts            fonts, styles, startApp, the update toast
  voice.ts           every line the app says, by moment (TODO-VOICE placeholders)
  app/               the UI: cards, sheets, the line, the timer screen, toasts
    app.ts           wires store, scene and row together; the only place that knows all three
    row.ts, card.ts  the row of things and one card
    press.ts         tap vs long press from pointer events
    addSheet.ts, timerSheet.ts, timerRun.ts, sheet.ts, toast.ts, line.ts
    timer.ts         the running timer, kept in storage so a reload resumes it
    header.ts        the title and the four buttons
    notices.ts       one notice above the row at a time
    checkin.ts, recap.ts   the two rituals, as notice builders
    collectionSheet.ts, rulesSheet.ts
    share.ts         the scene drawn into a PNG, shared or downloaded
    sound.ts         synthesised tones behind the tap gate, and mute
    surprise.ts, facts.ts  the daily surprise and the sea facts it draws from
  scene/             what is drawn behind the UI
    scene.ts         three parallax layers, the star canvas, the particle canvas
    stars.ts         background stars and the day-stars (the calendar in the sky)
    particles.ts     bioluminescent drift and the tap bursts
    creatures.ts     SVG for every world, line and stage
    collectibles.ts  the sixty collectibles: id, world, line, day, place, drawing
    visitors.ts      the whale and the daily visitors
    palette.ts       the tokens as hex, for the share picture
    shore.ts         the sand strip and the garden's anchor group
    parallax.ts      a few pixels of drift between the layers
  store/             data
    types.ts         AppData, Thing, DayRecord, Settings
    store.ts         load, save, actions, subscribe; the only localStorage reader for data
    migrate.ts       a strict guard from stored JSON to AppData, by version
    derive.ts        last7, stage, totalDone, stars, streak, lines: all arithmetic, nothing stored
    dates.ts         local YYYY-MM-DD keys and week arithmetic
  pwa/
    register.ts      service worker registration, update checks, the reload
    install.ts       the install leaf (iPhone steps, Android prompt, desktop nothing)
  styles/            tokens.css holds every colour and size; the rest use them
tests/e2e/           Playwright, three device projects, against the production build
scripts/             icons.mjs (SVG to PNG), shots.mjs (README screenshots, seeded and pinned)
public/icons/        the app icon
docs/                this folder
```

## 2. Data flow

```
 pointer / keyboard
        |
   app/press.ts  ->  app/app.ts handlers  ->  store actions (toggleDone, addThing, ...)
                                                   |
                                             store.commit(): save to localStorage, notify
                                                   |
                                  app.ts render(data):  row.render  ->  cards (derive.ts per thing)
                                                        scene.setDays(starDays, constellations)
                                                        scene.setQuiet(missed and nothing yet)
```

- **One object, one key** (`whaleclub:data`). `Store` is the only thing
  that reads or writes it. A record that fails `migrate()` is parked under
  `whaleclub:data.broken` and the app starts fresh rather than half-trusting
  it.
- **Everything shown is derived.** Creature stage, week dots, collectibles,
  stars, streaks: `derive.ts` computes them from `days` on every render.
  Nothing about progress is stored twice.
- **The timer is the one other key** (`whaleclub:timer`): a start time and
  a length, so a reload or a locked phone resumes it from the clock.
- **The scene knows nothing about things.** `app.ts` tells it what to show;
  it draws. Adding a world does not touch the scene's layers.

## 3. A day

A day key is `YYYY-MM-DD` on the person's own clock (`dates.ts`). A thing
done today is its id in `days[today].done`. A finished timer adds its
minutes to `days[today].minutes[thingId]` and counts as done. There is no
"missed" record anywhere: a missed day is the absence of a record, and the
only thing the app does with it is dim the scene for a day and say one
line.

## 4. Worlds and lines

A thing's world comes from its position when added: sea, sky, garden, sea,
sky (`worldForOrder`). The first thing in a world takes line A, the second
line B (`lineFor`), so two sea things grow different creatures and unlock
different collectibles. Worlds are fixed at creation and stored on the
thing; removing a thing does not reshuffle the others.

## 5. Adding a world

1. Add it to `World` in `store/types.ts` and to `WORLD_ORDER`.
2. Draw its eight creatures in `scene/creatures.ts` (two lines, four stages).
3. Give it colours in `styles/row.css` (`.card[data-world=...]`) and a
   burst in `scene/particles.ts` (`COLORS` and a particle kind).
4. Add its tap lines to `voice.ts` under `tap`.
5. Add its collectibles (section 6) and a row to `docs/COLLECTIBLES.md`.

## 6. Adding a collectible

Collectibles live in `scene/collectibles.ts`: one list, each entry with
its world, line, unlock day, a place in the scene (fractions of width and
height), a size, a motion and a draw function that returns inner SVG for a
100x100 box. Garden items are anchored by their bottom edge on the sand.
The Collection screen and the silhouettes read the same list. Add the
entry, a `voice.ts` line under `unlock`, a row in `docs/COLLECTIBLES.md`,
and a case in `tests/e2e/collectibles.e2e.ts` that seeds the days and
expects it.

## 7. The service worker

`vite-plugin-pwa` in `generateSW` mode. Every built file has a content
hash in its name and is precached; `index.html` is precached with a
revision. `registerType: 'prompt'`: a new worker waits, the app shows the
toast, a tap sends SKIP_WAITING and reloads on `controllerchange`. The app
calls `registration.update()` on every open, on every return to the
foreground, and hourly. The e2e test for this serves its own copy of the
build and changes the worker under an open page.

## 8. Tests

Playwright only, against `vite preview` of the production build, in three
projects: iPhone 13, Pixel 5, desktop 1366x768. Tests go through the real
UI by role and name; `helpers.seed()` writes a history into storage before
load for anything that would otherwise take weeks. `page.clock` drives the
timer. `npm test` runs them all; CI runs them beside the build and only a
push to `main` deploys.
