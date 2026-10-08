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
  main.ts            fonts, styles, the lab's start, startApp, the update toast
  env.d.ts           the constants Vite sets at build time: the version, the art slots' files
  voice.ts           every line the app says, by moment (TODO-VOICE placeholders)
  app/               the UI: cards, sheets, the line, lock in, toasts
    app.ts           wires the store, the scene, the row and the sheets together; the render
    brand.ts         the working name; renaming the app is this file and the manifest
    row.ts, card.ts  the row of things and one card; edit mode, the swipe, the two kinds
    thingMark.ts     a thing's small bubble where things are listed, and a day's for the postcard
    kindField.ts     tap when done or lock in, and how long: the add sheet's and the sheet's question
    iconField.ts     a thing's picture: it follows the name until one is picked; common ones, more
    intro.ts         the first minute: the promise, the truth, the first step
    score.ts         the intro's music, all synthesised: piano, pad, the whale's low voice, a room
    howItWorks.ts    the idea in a few lines, the rules, the intro again, the first questions
    addSheet.ts      the add sheet: a name, its picture, how it is done, the days; three starters
    sheet.ts         a bottom sheet: one at a time, modal, focus in and back, the rest inert
    swap.ts          a sheet's change of view (the log's, the dock's) inside a view transition
    toast.ts         one line at the top, the undo at the bottom, the screen reader's announcements
    line.ts          the one row of text the app speaks through
    session.ts       a lock-in, measured by timestamps: only what the timer saw counts; undo, one pause
    sessionScreen.ts the deep-water screen, the growing creature, the hidden time
    lockIn.ts        a lock-in from the dial to the end, and the opening's steps
    opening.ts       runs the end of a session in order; a tap skips to the end
    logSheet.ts      the log: a month, the year, a day
    sceneData.ts     data to scene: the arrangement (what stands where), path finds, stones, lanterns
    dockData.ts      data to dock: the goal and its distance, owned, shown, worn, the rooms
    dockSheet.ts     the dock: tiers, a thing's page, get it, save for this, hide, who wears it
    krillChip.ts     the balance under the title, the goal line, the "+10" that rises
    ceremony.ts      a legendary's ceremony: the dark, the lit constellation, the beam, the plaque
    firstWeek.ts     the first week's set of seven
    chapter.ts       a new chapter, offered after a quiet week
    badge.ts         the Android home-screen badge, where it needs no permission
    settingsSheet.ts settings: one row per choice (the postcard size too), back up, restore,
                     start over, about, and the version whose five taps open the lab
    backup.ts        the backup file: its checksum, reading it back, refusing a bad one
    arrange.ts       arranging: rings for places, drag or tap and tap, the chest, tidy up
    dial.ts          the lock-in dial, five minutes to ten hours, spread over LENGTH_STOPS
    wakeLock.ts      the screen kept on during a session
    header.ts        the title and the four buttons
    notices.ts       one notice above the row at a time
    checkin.ts, recap.ts   the two rituals, as notice builders; the check-in ends on the line for the day,
                     and asks for the evening's good thing on its own after an early check-in
    lines.ts         the twenty lines for the day, walked by the date (docs/LINES.md)
    said.ts          what the moments said today, so the check-in's line is never said twice
    notToday.ts      "not today": the one small thing kept, and "it's been heavy" once a week at most
    bottles.ts       the evening's good things coming back: which one, when, and its "a while ago"
    lateNight.ts     the late hours of the person's own day, and the good night screen
    nameNotice.ts    "name it?", once, when a creature first reaches its last stage
    thingSheet.ts    a thing's own sheet: name, picture, how it is done, the seven days, today's exception
    daysField.ts     the seven day chips, shared with the add sheet
    collectionSheet.ts the Collection: found, waiting as a stone, next as a silhouette; arranging
    menuSheet.ts     the club: the log, how it works, settings, the rules, one sentence, the day count
    postcard.ts      the scene repainted from the data as a 1080px PNG
    postcards.ts     the button after a moment, the format choice, the share sheet
    host.ts          the phone-wide frame everything is appended to
    sound.ts         synthesised tones behind the tap gate, and mute
    surprise.ts, facts.ts  the daily surprise and the sea facts it draws from
  brand/             the look, shared by the app and brand.html
    bubble.ts        every thing's mark: a glass bubble in its colour, its glyph, done, the timer ring
    glyphs.ts        the hand-drawn glyphs a thing wears, by group, with the words a name matches
    match.ts         a thing's glyph picked from its name, in English or Lithuanian
    emoji.ts         the emoji a thing wore before 0.12, read as the glyph it meant
    icons.ts         the interface's own icons, in the glyphs' hand
    page.ts          brand.html: every bubble state, the colours, the glyphs, the icons, the type
  scene/             what is drawn behind the UI
    scene.ts         three parallax layers, the star, lantern and particle canvases, the dock's layers
    ticker.ts        the one animation loop; stops while hidden or off screen
    stars.ts         the star field (tints, sparkles, a shooting star) and the day-stars
    moon.ts          the moon in its real phase
    stones.ts        the stones waiting to be cracked
    pets.ts          each thing's creature in its world, to pet (nothing earned) or to wake
    bottle.ts        the bottle's drawing, and a soft day's rain
    rarity.ts        a find's shine: common since 0.14; a hashed shine only before EARNED_FROM
    random.ts        the seeded generator and the string hash
    particles.ts     bioluminescent drift and the tap bursts
    lanterns.ts      the cove's lanterns on one canvas, a sprite per colour, size and glow
    creatures/       a creature for every world, line and stage, in a 64x64 box
      index.ts       creatureSvg, and what a lock-in starts from (an egg, a spark, a seed)
      kit.ts         the shared kit: shading, halos, faces, gradient ids made unique
      sea.ts, sky.ts, garden.ts  each world's two lines of four stages
    spots.ts         the places in each world and the extensions', where things stand, moves and swaps
    legendary.ts     the five legendaries and their rare finds: shapes, drawings
    constellations.ts the stars spread along a legendary's outline, and the sky's layout of every path
    calendar.ts      the season from the date, and the nights and days the sky and the sea keep
    seasons.ts       the shore's dress for each season
    dock/            the dock
      index.ts       the catalogue: four tiers at fixed prices, four kinds
      art.ts         its things' drawings, in the finds' manner
      scene.ts       its bigger things as scene layers: the pier, the aurora, the reef, the island whale...
      wear.ts        what a creature wears, fitted to its face
    collectibles/    the seventy-eight finds, twenty-six per world
      index.ts       COLLECTIBLES, a line's finds in order, art slots, the scene's weather, companions
      build.ts       the Collectible type and the helpers that build an entry, one per world
      sea.ts, sky.ts, garden.ts  each world's finds, line A then line B
    draw.ts          small shared drawing helpers: tints, faces, fish, jellies, stems
    art/             the larger find drawings
      index.ts       all of them, by world
      sea.ts, sky.ts, garden.ts  each world's larger drawings
      year.ts        the finds at 240, 300 and 365 days, three for every line
    depths.ts        the water line, moonlight shafts, deep whales and kelp
    textures.ts      grain and caustics, drawn once into tiles, handed to CSS as object URLs (toBlob)
    visitors.ts      the whale, the daily visitors, the sleeper on the empty screen
    palette.ts       the tokens as hex, for the share picture
    shore.ts         the sand strip and the garden's anchor group
    parallax.ts      a few pixels of drift between the layers
  store/             data
    types.ts         AppData, Thing, DayRecord, Settings; the lock-in lengths (LENGTH_STOPS)
    store.ts         load, save, actions, subscribe; the only localStorage reader for data
    clock.ts         now() and today(): the only place that reads the device clock
    log.ts           the log's arithmetic: a month's summary, a day's entry, weeks
    lab.ts           the lab's storage: which keys are live, the sandbox copy, the offset
    migrate.ts       a strict guard from stored JSON to AppData, by version
    derive.ts        last7, stage, totalDone, stones waiting, found, stars, streak, asleep: all arithmetic
    krill.ts         krill earned, worked out from the days; spent; the balance (docs/ECONOMY.md)
    paths.ts         the path to a legendary: which star a day is, progress, halfway and end
    plan.ts          whether a thing is planned on a date (its weekday, and today's exception)
    quiet.ts         quiet days: the week's freedom, given in advance, which misses it covers, and "not today"
    dock.ts          what the dock changes in the data: buy, the goal, hidden, who wears it
    dates.ts         local YYYY-MM-DD keys, when the day ends, when the week starts, week arithmetic
  lab/               the lab's screen and its seeded history (see section 10)
    labUi.ts         the bar over every screen and the lab's sheet
    seed.ts          a believable past, about four planned days in five; and more stars
  pwa/
    register.ts      service worker registration, update checks, the reload
    install.ts       the install leaf (iPhone steps, Android prompt, desktop nothing)
    installSheet.ts  the iPhone's three steps to the home screen, as a sheet
  styles/            tokens.css holds every colour and size; the rest use them
tests/e2e/           Playwright, three device projects and perf, against the production build
scripts/             icons.mjs (SVG to PNG), splash.mjs (iOS startup images),
                     shots.mjs (README screenshots, seeded and pinned), hero.mjs (the README banner),
                     squeeze.mjs (the screenshots to WebP under 300 KB),
                     art-check.mjs (which finds have a picture, and which pictures are wrong),
                     score-render.js (the intro's score rendered offline and measured)
public/icons/        the app icon
public/splash/       the iOS startup images
brand.html           the look on one page, drawn by src/brand/page.ts
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
                                                        scene.setDays({ dates: starDays, today, label }, onTap)
                                                        scene.setLanterns, setCollectibles, setStones
                                                        scene.setQuiet(missed and nothing yet)
```

- **One object, one key** (`whaleclub:data`). `Store` is the only thing
  that reads or writes it, apart from the lab copying it once on entering
  (section 10). A record that fails `migrate()` is parked under
  `whaleclub:data.broken` and the app starts fresh rather than
  half-trusting it.
- **Everything shown is derived.** Creature stage, week dots, collectibles,
  stars, streaks: `derive.ts` computes them from `days` on every render,
  and `krill.ts` and `paths.ts` work out krill and the path the same way.
  Nothing about progress is stored twice.
- **A running lock-in has a key of its own** (`whaleclub:session`): its
  day, its start, the minutes already seen that day, the time not counted
  and when the screen was last seen, so a locked phone picks it up again
  and a reload settles it from the clock (section 11). A timer left by v0.4
  is picked up once and moved. Besides these, only small things are
  stored: `whaleclub:intro` once the intro has been seen, and, for a minute
  after a restore or a start over, the sea before it under
  `whaleclub:undo`.
- **The scene knows nothing about things.** `app.ts` tells it what to show;
  it draws. Adding a world does not touch the scene's layers.

## 3. A day

A day key is `YYYY-MM-DD` on the person's own clock (`dates.ts`); a day
can end at 3:00 or 5:00 instead of midnight, if the person says so. A
thing done today is its id in `days[today].done`. A lock-in thing is done
once its timer has seen the whole length that day: the minutes seen are
kept in `days[today].minutes[thingId]`, finished or not, and each session
that ran to its end is a record in `days[today].sessions`. One done without
the timer is also listed in `days[today].manual`. There is no "missed"
record anywhere: a missed day is the absence of a record. The app dims the
scene for a day and says one line; the week's dots show an empty dot, or a
small moon for a quiet day (`quiet.ts`); after two missed planned days the
creature sleeps until its thing is done.

## 4. Worlds and lines

A new thing's world is the first one the row's pattern (sea, sky, garden,
sea, sky) is missing (`nextWorld` in `store.ts`): with nothing deleted that
is simply the next in the pattern, and after a delete it fills the gap. Its
line is A unless a thing of its world already has A (`nextLine`), so two
sea things grow different creatures and unlock different collectibles.
World and line are fixed at creation and stored on the thing; removing a
thing does not reshuffle the others.

## 5. Adding a world

1. Add it to `World` in `store/types.ts` and to `WORLD_ORDER`.
2. Draw its eight creatures in `scene/creatures/<world>.ts` (two lines,
   four stages, with the kit in `kit.ts`), add them to `DRAWINGS` in
   `scene/creatures/index.ts`, and give it a beginning there
   (`beginningSvg`).
3. Give it colours in `styles/row.css` (`.card[data-world=...]`) and a
   burst in `scene/particles.ts` (`COLORS` and a particle kind).
4. Add its tap lines to `voice.ts` under `tap`.
5. Give it places: its name in `SpotWorld` and a set in `scene/spots.ts`.
6. Add its collectibles (section 6) and a table to `docs/COLLECTIBLES.md`.

The build then names what is left: every table keyed by `World` (the
stones' height in `app/sceneData.ts`, the faces in `scene/dock/wear.ts`,
the intro's creature places) fails until it has the new world.

## 6. Adding a collectible

Finds live in `scene/collectibles/`, one file per world, each a list made
with the helpers in `build.ts`: an entry has its line, its unlock day, an
id, a name, a hint, the place it was drawn for (fractions of width and
height; a garden find has only x, on the sand), a size, a motion and a
draw function that returns inner SVG for a 100x100 box (the larger
drawings are in `scene/art/`). `index.ts` joins the three lists into
`COLLECTIBLES`; the scene, the Collection and the silhouettes all read it.
Where a find stands is not its own: the arrangement (section 12) gives it
a free place of its world from `scene/spots.ts`, or the chest. Only the
scene's weather (`ATMOSPHERE`) keeps the place it was drawn for, and a
companion (`COMPANIONS`) goes beside its host. A picture in
`public/art/<id>.webp` takes the place of a drawing ([ART.md](ART.md)).

Each line has one find at each tier of `UNLOCK_DAYS`, seventy-eight in
all, and `tests/e2e/year.e2e.ts` holds it to that, so a new find replaces
one, or a new tier brings one for every line. Add a row in
`docs/COLLECTIBLES.md`. The line said when a find comes out is one
template, `voice.unlock`, so a find needs no line of its own.

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
shine is `rarityOf(id, reachedOn(...))`. Since 0.14 every per-thing find
is common; only a find whose tier was reached before `EARNED_FROM`
(`scene/rarity.ts`) keeps the shine a hash of its id and that date gave
it, so nothing is stored and nothing changes. Rare and legendary are
earned on the path to a legendary (section 13: `store/paths.ts`,
`scene/legendary.ts`).

## 6b. Lock in

`app/session.ts` keeps the running session in its own key, by timestamps
only, and counts only the minutes the timer saw. On `visibilitychange` and
`pagehide` it writes when the page hid (`hiddenAt`). The first `GRACE_MS`
away (fifteen seconds) still count, since a glance at a message is not
leaving; after that the count stops. On return the time away past the
grace joins `pausedMs`, `away` grows by one, and the session goes on from
where the count stopped: leaving never fails it. A session whose length
was reached inside the grace ends on return. Stopping early keeps the
minutes seen for the day (`Store.keepMinutes`), and the next session goes
on from them. `Store.finishLockIn` writes the end (section 11): the thing
is done, the day keeps its minutes, and the session is added to
`days[date].sessions`, which is what the lanterns and the log read.

`days[date].waited` and a session's `left` exist only in data from before
0.11, when a session that was left still ended: `counted()` keeps such a
day out of the stars and the stones, and its lantern is dim.

The first `UNDO_MS` can be undone (`SessionService.undo`): the key is
cleared and nothing is written. One pause per session (`pausedAt`,
`pauseUsed`): the count stops at `pausedAt`; the pause ends by a tap
(`goOn`) or by itself at `PAUSE_MS`, and its length joins `pausedMs`.
Being hidden inside a pause is not leaving; if the pause ran out while
hidden, only the time after its end counts as away.

`app/lockIn.ts` holds the new lantern and today's first star back in the
scene before writing the end, then runs `app/opening.ts`: rise, lantern,
creature, star (only when there is a new star or the day is all done),
line, offer. Each step has a `play` and an `end`; a tap calls every
remaining `end` at once and sets `data-instant` on the frame for two
frames, so running transitions land too. The frame's `data-opening` names
the step, and "done" at the end.

## 7. Postcards

`app/postcard.ts` paints a postcard from the data, not from the screen:
the sky and the sea, the day-stars through a second `StarField` at the
postcard's size, the shore, the pier and the extensions owned, every find
that was on screen where it stands now (by its fractional place, sky
things kept in the sky and sea things in the sea), the whale for an
all-done moment or the legendary on its own card, the moment's line, the
day count and the date (a legendary's plaque instead), the creatures with
their bubbles and names, and the mark. A legendary's card has a gold
frame, a milestone's a pale one, and the year's (day 365) the whole cove of
lanterns. Story is 1080x1920, square 1080x1080; the size is asked the
first time a postcard is sent and changed in settings.

`app/postcards.ts` owns the button. The share sheet only opens inside a
tap, and on an iPhone a tap's permission does not survive a long wait, so
a postcard starts painting the moment its button appears and the tap only
hands over the finished file. If the browser refuses anyway, the postcard
opens in a sheet with its own send button, which is a fresh tap. Where
there is no share sheet, it downloads.

## 8. The service worker

`vite-plugin-pwa` in `generateSW` mode. Every built file has a content
hash in its name and is precached, except the iOS startup images, which
iOS fetches once, at install; `index.html` is precached with a revision.
`registerType: 'prompt'`: a new worker waits, the app shows the toast, a
tap sends SKIP_WAITING and reloads on `controllerchange`. The app calls
`registration.update()` on every open, on every return to the foreground,
and hourly. The e2e test for this serves its own copy of the build and
changes the worker under an open page.

## 9. Tests

Playwright only, against `vite preview` of the production build, in three
projects: iPhone 13, Pixel 5, desktop 1366x768. Tests go through the real
UI by role and name; `helpers.seed()` writes a history into storage before
load for anything that would otherwise take weeks. `page.clock` drives
lock-in sessions. Tests of pure data import from `src`, need no page and
run on the desktop project only. `npm test` runs them all; CI runs them
beside the lint and the build, and only a push to `main` deploys. A fourth
project, `perf`, depends on the other three, so it runs last and alone,
without a trace: frame timing with a year of lanterns.

## 10. The lab

A hidden sandbox with a movable clock, for trying the app across days and
weeks in a minute, on a real phone, without risking a single real day.

**Getting in.** Five quick taps on the version at the bottom of settings,
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

| control                 | what it does                                                           |
| ----------------------- | ---------------------------------------------------------------------- |
| +1 day, +7 days         | moves the clock forward and reloads                                    |
| -1 day                  | moves it back and reloads                                              |
| back to real time       | offset zero, still in the sandbox                                      |
| do everything today     | marks every thing planned today as done (a lock-in as a whole session) |
| seed 30 / 90 / 365 days | `lab/seed.ts`: a believable past, in place                             |
| +1 star                 | the latest day before today with nothing done gets every thing done    |
| finish this path        | the same, for every star left on the current path                      |
| clear sandbox           | an empty sandbox: the first open, in the lab                           |
| first open again        | an empty sandbox and the intro, as on a phone that never had the app   |
| exit                    | throws the sandbox away and comes back to the real sea                 |

Moving the clock reloads on purpose: everything that happens once on
opening (the quiet morning, the check-in, the recap, a session that ran out
while away) then happens as it would on a real morning. Changing the
sandbox's data goes through the store like any tap, so stones fall in and
the whale surfaces where they would; only "first open again" reloads too,
asking for the intro through session storage.

**The seed** is deterministic (a seeded generator keyed by the day and the
length): about four planned days in five done, a lock-in's sessions with
them (a few in two parts, and some undone days keeping a few minutes), a
run of three missed days around the middle, yesterday missed so the quiet
morning shows, and every tier earned except the newest already cracked, so
each thing has one stone waiting. An empty sandbox gets three plain things
first. The extra stars are days done without the timer: the lab is for the
sky, not the lanterns.

**The bar.** While the lab is on, a striped bar sits over the top of the
screen, outside the phone frame, with the offset ("lab · +3 days", a tap
opens the lab's sheet) and "exit". The frame moves down by the bar's
height, so the bar never covers the header, a sheet or a session, and
nothing covers it.

## 11. Two kinds, kept minutes, and the first minute

`Thing.kind` is `tap` or `lockIn`. A tap card toggles `done`; a lock-in
card calls `LockIn.tap`: with minutes kept today and not the length, it
starts a session straight from them (`baseMs`), otherwise it opens the
dial, and on a day already done the session is an extra one (a lantern,
nothing more).

`SessionService` counts what the timer saw: `seenMs = baseMs + (until -
startedAt - pausedMs)`, where `until` stops at a pause and fifteen seconds
after the page hid. On return, the time away past the grace joins
`pausedMs` and `away` grows. While the screen shows, `seenUntil` is
written every five seconds. On the next open `settle()` takes a session
left by a page that went away: hidden at `hiddenAt` if the page said so,
otherwise at `seenUntil`; `LockIn.settle` finishes it if that reached the
length on its own day, or keeps the minutes (`Store.keepMinutes`) for the
card to finish. `Store.finishLockIn` writes the end: done, the day's
minutes, and a session record with `parts` (more than one: a softer
lantern). `sceneData.lanternsFor` adds a dim lantern for each past day
with minutes and no done.

`Store.removeThing` moves a thing to `retired`; `restoreThing` brings it
back. `everyThing(data)` (things and retired) is what the scene's finds, the
lantern colours and the log's names read. A new thing takes `nextWorld` (the
world the row's pattern is missing) and `nextLine`.

`app/intro.ts` drives the real scene: `Scene.preview` draws a seeded year's
stars and lanterns without storing them or making them tappable,
`setSilhouette` turns the creatures and the whale into dark shapes, `flash`
marks a find. Its music is `app/score.ts`; where sound is on but not yet
allowed, the intro opens on "tap to begin". The intro is due when the data
holds no things and no days and `whaleclub:intro` is unset; in the lab it
plays only when asked for ("first open again"), through session storage
across its reload.

## 12. Krill, the dock and places

Krill is never stored. `krillEarned(data, today)` walks the days (dones,
lock-in minutes, all-done days, the first done after a break, the first
week's set, good weeks) and `krillBalance` takes away what `data.bought`
paid. A purchase goes through `withPurchase`, which refuses a thing already
owned or one the balance does not cover; the price comes from the
catalogue, never from the store.

Where things stand is `arrangementOf(data)` (app/sceneData.ts): the
placeable finds, path finds and dock things in the order they were got,
the places there are (`spotsFor(rooms)`), and `placeAll`, which honours
each record in `data.placement` that is still a free place of the thing's
world and gives everything else the first free place or the chest; a
legendary goes first, and in a full world the newest ordinary thing gives
up its place. The scene, arranging (its rings and its chest) and the
postcard all read that one function, so they cannot disagree. A move
(`moveTo`) returns the whole arrangement as records, so nothing else
shifts after it; "tidy up" deletes the records.

To add a dock thing: an entry in src/scene/dock/index.ts (a tier and a
price inside its range, a kind), a drawing in art.ts, for a scene thing
its layer in scene.ts and a line in `Scene.setDock`, and for a worn thing
its fit in wear.ts. To add places: a set in src/scene/spots.ts, and its
drawing under the things.

## 13. The path to a legendary

`starDays(data)` is the path, oldest first. A path is 30 stars, then 60,
then 100 each. `placeStars` gives each day its path and star;
`progressOf(count)` the current path and how far along it is; `reachesOf`
the days a path's halfway and last stars were lit. The sky (`stars.ts`)
draws `layoutSky` (constellations.ts): finished paths in their slots, the
current one in the middle with its faint way ahead. `pathFinds`
(app/sceneData.ts) turns the reaches into a rare find and a legendary,
which join the arrangement like any find, a legendary first. The app's
`watchPath` notices, after a render, what the newest star finished (the
first week's set, a milestone, a halfway star, a path) and plays it once
the world is clear.

To add a legendary: an entry in src/scene/legendary.ts with its shape (a
few strokes in a 100 by 60 box), its drawing and its rare find. After the
fifth, the paths go round again.
