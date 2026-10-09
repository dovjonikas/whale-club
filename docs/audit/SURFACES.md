# Surfaces

Every screen, card, sheet and passing message the app has, in each of its
states, and how a picture of it is made. `scripts/audit.mjs` walks this list
at two phone sizes, 390 × 844 (an iPhone 13) and 320 × 568 (the smallest
phone still in use), and saves `NAME-390.webp` and `NAME-320.webp` into
`docs/audit/before/` or `docs/audit/after/`. The data is the README's: three
things over five weeks, on a Wednesday evening (21:30), unless a line says
otherwise.

## The first screen

| Picture              | State                                                                     | How it is reached                            |
| -------------------- | ------------------------------------------------------------------------- | -------------------------------------------- |
| `01-first-empty`     | Nothing added yet: the whale asleep, one sentence and an example          | intro seen, no data                          |
| `02-first-things`    | Three things, two done today: the scene, the goals, the row               | the five weeks                               |
| `03-all-done`        | The last thing tapped: the whale up, "send the whale"                     | tap practice                                 |
| `04-rest-day`        | Nothing planned today: one quiet line, the row resting                    | every thing off on Wednesdays                |
| `05-quiet-day`       | Nothing done yesterday or yet today: the scene dimmer, the missed line    | yesterday removed, today empty               |
| `06-not-today-strip` | A thing not planned today, in the "not today" strip, opened               | practice off on Wednesdays, the strip opened |
| `07-soft-day`        | "not today" said: light rain, the smallest thing kept, the bottle on sand | tap "not today" under the check-in           |
| `08-late`            | After 23:00: the sea dimmed, the moon to tap                              | 23:40                                        |

## The cards above the row (one at a time)

| Picture             | State                                                      | How it is reached                   |
| ------------------- | ---------------------------------------------------------- | ----------------------------------- |
| `10-checkin-first`  | The check-in's first question, "not today" under it        | today not checked in, at noon       |
| `11-checkin-second` | The second question                                        | "good!!!"                           |
| `12-day-line`       | The line for the day, its author, "send this" and "ok"     | both answers, at noon               |
| `13-evening-good`   | After the evening answers: "one good thing today", a field | both answers, at 21:30              |
| `14-good-alone`     | The good thing asked on its own, the check-in done earlier | checked in, not asked yet tonight   |
| `15-recap`          | The week in a number and a word                            | the recap not seen this week        |
| `16-chapter`        | A new chapter offered after a quiet week                   | a Monday after a week with one star |
| `17-name-it`        | A creature at its last stage: "name it?"                   | names not asked yet                 |
| `18-install-leaf`   | "put it on your home screen", on an iPhone browser         | not dismissed this week             |

## Sheets and screens over the scene

| Picture                                 | State                                                                   | How it is reached                               |
| --------------------------------------- | ----------------------------------------------------------------------- | ----------------------------------------------- |
| `20-bottle`                             | A bottle opened: an old good thing, "keep it"                           | the bottle on a soft day                        |
| `21-good-night`                         | Good night: the whale asleep, "tap to come back"                        | late, tap the moon                              |
| `22-add-empty`, `22-add`                | A new thing: empty, then a name typed, its picture picked, lock in      | "Add a thing"                                   |
| `23-thing-sheet`, `-end`                | A thing's sheet: name, picture, kind, length, days, after, its creature | the three dots on a card                        |
| `24-edit-mode`                          | Edit mode: every card with delete, "done"                               | "edit" by the row                               |
| `25-dial`                               | Lock in's dial                                                          | tap a lock-in thing                             |
| `25-dial-session-start`, `-session`     | The session: the egg, then the creature growing                         | "lock in", then 18 minutes on                   |
| `25-dial-session-time`                  | The time shown on the session                                           | a tap on the screen                             |
| `25-dial-opening`                       | The end: the deep water going down, the lantern coming                  | the time run out                                |
| `26-stone`, `-crack`, `-find`           | A stone waiting, cracked twice, the find out                            | three taps on the stone                         |
| `27-ceremony`                           | A legendary arriving: the golden whale's ceremony                       | the 30th day of a constellation                 |
| `28-collection`                         | The collection: the legendaries, then each thing's ten                  | the star in the header                          |
| `29-log-month`, `-day`, `-year`         | The log: a month, a day with its good thing, the year                   | menu, "the log", a day, the title               |
| `30-dock-island`, `30-dock`, `-arrange` | A long-time sea, the dock's list, arranging a place                     | 160 days and purchases; the krill chip; arrange |
| `31-menu`, `-end`                       | The club: the menu, the rules, the club's line, the day count           | the menu button                                 |
| `32-settings`, `-end`                   | Settings, top and bottom                                                | menu, settings                                  |
| `33-how-it-works`, `-end`               | How it works, top and bottom                                            | menu, how it works                              |
| `34-intro-begin`, `-promise`, `-truth`  | The first open: "tap to begin" (the hello), the promise, the truth      | no data, intro not seen                         |
| `35-install-sheet`                      | The three steps to the home screen                                      | "show me how" on the install card               |
| `36-postcard-format`, `-preview`        | Story or square, then the preview when the share sheet says no          | "send the sea" with no size chosen              |

## Messages that pass

| Picture           | State                                              | How it is reached                                               |
| ----------------- | -------------------------------------------------- | --------------------------------------------------------------- |
| `37-toast-undo`   | A thing deleted: the line and "undo" at the bottom | delete in a thing's sheet                                       |
| `38-toast-update` | "new version. tap to reload" at the top            | drawn with the app's own markup (a real one needs a new deploy) |

The line above the row (the game's one voice) shows in most pictures. A screen
reader's announcements have no picture: they are listed in docs/QUALITY.md.
"labas" in the brief (the first hello) is the intro's first screen,
`34-intro-begin`.

## New in 1.3.0 (after only)

| Picture                        | State                                                           | How it is reached                             |
| ------------------------------ | --------------------------------------------------------------- | --------------------------------------------- |
| `40-museum-case`, `-legendary` | A find's case; the golden whale's, with the find half way to it | the museum, a found tile                      |
| `41-tide-0` to `-7`            | October's tide, card by card, to the postcard                   | the log, a month back, "watch october’s tide" |
| `42-drift`                     | Only the sea, and the one quiet line                            | the club, "drift"                             |
| `43-night-swim`                | The whale back in the morning, the card after the check-in      | 09:00, the swim not told yet today            |
| `44-whats-new`                 | What's new, once after the update                               | data from before, "what's new" not seen       |
