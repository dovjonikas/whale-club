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
  app/               the UI: cards, sheets, the line, lock in, toasts
    app.ts           wires store, scene and row together; the only place that knows all three
    row.ts, card.ts  the row of things and one card
    addSheet.ts, sheet.ts, toast.ts, line.ts
    session.ts       a lock-in, measured by timestamps; leaving it waits, never fails
    sessionScreen.ts the quiet screen and the growing creature
    dial.ts          the lock-in dial, 10 to 120 minutes
    wakeLock.ts      the screen kept on during a session
    header.ts        the title and the four buttons
    notices.ts       one notice above the row at a time
    checkin.ts, recap.ts   the two rituals, as notice builders
    thingSheet.ts    a thing's own sheet: name, emoji, minutes, the seven days, today's exception
    daysField.ts     the seven day chips, shared with the add sheet
    collectionSheet.ts
    menuSheet.ts     the club: the rules, one sentence, the postcard size
    postcard.ts      the scene repainted from the data as a 1080px PNG
    postcards.ts     the button after a moment, the format choice, the share sheet
    host.ts          the phone-wide frame everything is appended to
    sound.ts         synthesised tones behind the tap gate, and mute
    surprise.ts, facts.ts  the daily surprise and the sea facts it draws from
  scene/             what is drawn behind the UI
    scene.ts         three parallax layers, the star canvas, the particle canvas
    ticker.ts        the one animation loop; stops while hidden or off screen
    stars.ts         the star field (tints, sparkles, a shooting star) and the day-stars
    moon.ts          the moon in its real phase
    stones.ts        the stones waiting to be cracked
    rarity.ts        a find's shine, from the date it was earned
    random.ts        the seeded generator and the string hash
    particles.ts     bioluminescent drift and the tap bursts
    creatures.ts     SVG for every world, line and stage
    collectibles.ts  the sixty collectibles: id, world, line, day, place, drawing
    draw.ts          small shared drawing helpers: tints, faces, fish, jellies, stems
    art.ts, art2.ts  the larger collectible drawings, one function each
    depths.ts        the water line, moonlight shafts, deep whales and kelp
    textures.ts      grain and caustics, rendered once into data URLs
    visitors.ts      the whale, the daily visitors, the sleeper on the empty screen
    palette.ts       the tokens as hex, for the share picture
    shore.ts         the sand strip and the garden's anchor group
    parallax.ts      a few pixels of drift between the layers
  store/             data
    types.ts         AppData, Thing, DayRecord, Settings
    store.ts         load, save, actions, subscribe; the only localStorage reader for data
    clock.ts         now() and today(): the only place that reads the device clock
    lab.ts           the lab's storage: which keys are live, the sandbox copy, the offset
    migrate.ts       a strict guard from stored JSON to AppData, by version
    derive.ts        last7, stage, totalDone, stones waiting, found, stars, streak: all arithmetic
    dates.ts         local YYYY-MM-DD keys and week arithmetic
  lab/               the lab's screen and its seeded history (see section 10)
    labUi.ts         the bar over every screen and the lab's sheet
    seed.ts          a believable past, about four planned days in five
  pwa/
    register.ts      service worker registration, update checks, the reload
    install.ts       the install leaf (iPhone steps, Android prompt, desktop nothing)
  styles/            tokens.css holds every colour and size; the rest use them
tests/e2e/           Playwright, three device projects, against the production build
scripts/             icons.mjs (SVG to PNG), shots.mjs (README screenshots, seeded and pinned),
                     squeeze.mjs (the screenshots to WebP under 300 KB)
public/icons/        the app icon
docs/                this folder
```

## 2. Data flow

```
 pointer / keyboard
        |
   app/row.ts    ->  app/app.ts handlers  ->  store actions (toggleDone, addThing, ...)
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
- **A running lock-in is the one other key** (`whaleclub:session`): its
  start, its length and the time set aside, so a reload or a locked phone
  resumes it from the clock. A timer left by v0.4 is picked up once and moved.
- **The scene knows nothing about things.** `app.ts` tells it what to show;
  it draws. Adding a world does not touch the scene's layers.

## 3. A day

A day key is `YYYY-MM-DD` on the person's own clock (`dates.ts`). A thing
done today is its id in `days[today].done`. A finished lock-in adds its
minutes to `days[today].minutes[thingId]` and counts as done; one that was
left is also listed in `days[today].waited`. There is no
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

## 5a. Days

A thing carries `days`, seven booleans from Monday, all true unless the
person turns some off. A day record can carry `extra` (also today) and
`skip` (not today), which change that one date only. `plannedOn` is
the one question everything asks: the exception if there is one, else the
weekday. The row shows planned things; the rest go to the "not today"
strip. `last7` walks back over planned days until it has seven,
`weekDots` marks days off as rest, `streak` skips days with nothing
planned, `allDoneToday` and `missedYesterday` look at planned things
only, and the recap divides by planned days. `totalDone` and the stones
are unchanged: every counted day is a step.

## 6a. Stones

A thing earns a tier when its counted days reach it (`UNLOCK_DAYS`).
`AppData.cracked` keeps, per thing, the highest tier cracked open; every
earned tier above it is a stone waiting in the scene (`waitingTiers`), and
what is in the scene is what was earned and cracked (`foundFor`). Losing
`cracked` would only bring stones back, never take a find away. A find's
shine is `rarityOf(id, reachedOn(...))`: a hash of the id and the date the
tier was reached, so it is never stored and never changes.

## 6b. Lock in

`app/session.ts` keeps the running session in its own key, by timestamps
only. On `visibilitychange` and `pagehide` it writes when the page hid;
on return it measures the time away. Under fifteen seconds nothing
happens. Over, the time away is set aside (`pausedMs`), the session is
marked as left, and the creature's size is held where it was. A session
that ran out during a short absence ends clean at the moment it ran out.
`Store.finishSession` writes the end: a clean one is a full count; a
left one is done but listed in `days[date].waited`, which `counted()`
leaves out of the stars and the stones.

## 7. Postcards

`app/postcard.ts` paints a postcard from the data, not from the screen:
the sky gradient, the day-stars through a second `StarField` at the
postcard's size, the shore, every collectible that was on screen (by its
fractional place, sky things kept in the sky and sea things in the sea),
the whale for an all-done moment, the creatures, the moment's line, the
day count, the date and the mark. Story is 1080x1920, square 1080x1080.

`app/postcards.ts` owns the button. The share sheet only opens inside a
tap, and on an iPhone a tap's permission does not survive a long wait, so
a postcard starts painting the moment its button appears and the tap only
hands over the finished file. If the browser refuses anyway, the postcard
opens in a sheet with its own send button, which is a fresh tap. Where
there is no share sheet, it downloads.

## 8. The service worker

`vite-plugin-pwa` in `generateSW` mode. Every built file has a content
hash in its name and is precached; `index.html` is precached with a
revision. `registerType: 'prompt'`: a new worker waits, the app shows the
toast, a tap sends SKIP_WAITING and reloads on `controllerchange`. The app
calls `registration.update()` on every open, on every return to the
foreground, and hourly. The e2e test for this serves its own copy of the
build and changes the worker under an open page.

## 9. Tests

Playwright only, against `vite preview` of the production build, in three
projects: iPhone 13, Pixel 5, desktop 1366x768. Tests go through the real
UI by role and name; `helpers.seed()` writes a history into storage before
load for anything that would otherwise take weeks. `page.clock` drives
lock-in sessions. `npm test` runs them all; CI runs them beside the build and only a
push to `main` deploys.

## 10. The lab

A hidden sandbox with a movable clock, for trying the app across days and
weeks in a minute, on a real phone, without risking a single real day.

**Getting in.** Five quick taps on the version at the bottom of the menu,
or `?lab=1` in the URL. Nothing in the app points at it.

**The sandbox.** `store/lab.ts` decides, once at startup and before
anything reads the store or the clock, which keys are live. Entering copies
`whaleclub:data` byte for byte into `whaleclub:lab`; from then on the
store loads and saves `whaleclub:lab`, and a lock-in session lives in
`whaleclub:lab.session`. The lab is on exactly while `whaleclub:lab.meta`
exists, so a reload stays in it. Leaving deletes the three lab keys and
reloads; the real record was never opened for writing. A test compares it
before and after, byte for byte.

**The clock.** `store/clock.ts` is the only module that reads the device
clock: `now()` and `today()`. Every day key, the stars, the moon's
phase, the session timer, the recap and the streak go through it. Outside
the lab its offset is zero. In the lab the offset, in whole calendar days
(so a daylight saving change does not shift the hour), lives in the lab's
meta and nowhere else. An ESLint rule (`no-restricted-syntax`) makes
`Date.now()` and `new Date()` with no arguments an error in `src/`,
except in `clock.ts`.

**The controls** (`lab/labUi.ts`), each one tap:

| control             | what it does                                           |
| ------------------- | ------------------------------------------------------ |
| +1 day, +7 days     | moves the clock forward and reloads                    |
| -1 day              | moves it back and reloads                              |
| back to real time   | offset zero, still in the sandbox                      |
| do everything today | marks every thing planned today as done, in place      |
| seed 30 / 90 days   | `lab/seed.ts`: a believable past, in place             |
| clear sandbox       | an empty sandbox: the first open, in the lab           |
| exit                | throws the sandbox away and comes back to the real sea |

Moving the clock reloads on purpose: everything that happens once on
opening (the quiet morning, the check-in, the recap, a session that ran out
while away) then happens as it would on a real morning. Changing the
sandbox's data goes through the store like any tap, so stones fall in and
the whale surfaces where they would.

**The seed** is deterministic (a seeded generator keyed by the day and the
length): about four planned days in five done, a run of three missed days
in the middle, yesterday missed so the quiet morning shows, and every tier
earned except the newest already cracked, so each thing has one stone
waiting. An empty sandbox gets three plain things first.

**The bar.** While the lab is on, a striped bar sits over the top of the
screen, outside the phone frame, with the offset ("lab · +3 days", a tap
opens the lab's sheet) and "exit". The frame moves down by the bar's
height, so the bar never covers the header, a sheet or a session, and
nothing covers it.
