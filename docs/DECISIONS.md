# Decisions

Dated. Newest at the bottom. Each one says what was decided and why, so
that nobody re-opens it by accident.

## 2026-10-06 Working name stays Whale Club

The author said the name may change. Until it does, the title, the share
line ("day N of whale club") and the storage key (`whaleclub:data`) use it.
A rename later is one constant in `src/app/brand.ts` plus the manifest.

## 2026-10-06 Two collectible lines per world, not one

The 4th and 5th things reuse SEA and SKY. One shared list would mean a
second sea thing unlocks the same jellyfish twice, which is not a reward.
Each world has line A and line B (docs/COLLECTIBLES.md); the first thing in
a world takes A, the second B. Up to five things means at most two per
world, so two lines are enough.

## 2026-10-06 Unlocks and stages are derived, never stored

`totalDone(thingId)` and `last7(thingId)` are computed from `days` on every
draw. Storing "unlocked: true" would create a second source of truth that
could disagree with the days after an import or a bug.

## 2026-10-06 Fonts are self-hosted

The app must work offline from the home screen, so Fraunces and Atkinson
Hyperlegible ship as woff2 in `public/fonts/`, not from Google Fonts.

## 2026-10-06 Sounds are synthesised, not files

The same approach as an earlier page of the author's: an AudioContext created and
resumed inside the first tap handler, `navigator.audioSession.type =
'playback'` so the iPhone silent switch does not swallow it, short
enveloped tones. No audio assets to cache, nothing plays before a tap.

## 2026-10-06 Brainstorming skill skipped on purpose

The author's instruction was never to stop and ask. The brief is detailed
enough to build from; open questions go here instead of to the author.

## 2026-10-06 Fonts come from fontsource packages, latin only

Correction to the entry above: the woff2 files are not copied into
`public/fonts/` by hand but imported from `@fontsource-variable/fraunces`
and `@fontsource/atkinson-hyperlegible`, so Vite hashes and precaches them
like any other asset. Only the latin subsets are loaded (`styles/fonts.css`
and the `latin-*.css` entries): the full Fraunces package carries six
scripts and the service worker would have cached every one for an app that
speaks English.

## 2026-10-06 The reload after an update is the app's, not the plugin's

`vite-plugin-pwa` reloads on the `controlling` event only when the page
had a controller when it loaded. A person who installed the app a minute
before a deploy would tap the toast and see nothing. `pwa/register.ts`
listens for `controllerchange` itself and reloads only after the toast was
tapped, so the first install (which also changes the controller through
`clientsClaim`) never reloads on its own.

## 2026-10-06 Day-stars are laid out as a calendar, not scattered

The first draft hashed each date to a random spot and joined streaks with
lines, which drew a net across the whole sky. Now a week is a row, a
weekday a column, the first week at the zenith and this week just above
the horizon, with a little jitter so it reads as stars. Streaks are joined
only inside a week, so a full week is one seven-star constellation and a
screenshot after a year is a dense band of light.

## 2026-10-06 Examples are generic

The onboarding example and the screenshots use "run", "read" and
"practice", not anything from the author's own life. The repository is
public.

## 2026-10-06 The line says the rarest thing

A tap can set off several things at once: the whale when the day is
complete, a new collectible, a creature that grew, the timer's end. The
scene shows all of them; the line says one, the rarest first: unlock, then
the whole day done, then the timer's end, then growth, then the tap. A
single-thing day is "all done" every day, so "all done" must not hide a
collectible that comes once.

## 2026-10-06 Day-stars are buttons, drawn on canvas

The stars are painted on a canvas (cheap, hundreds of them, twinkle), but
each one also gets an invisible button at its position, so a star can be
tapped, reached with a keyboard, and found by a test by its label. The
button layer is not part of the parallax: at depth 0.25 the canvas drifts
two pixels at most, and a button that keeps moving is one a finger misses
and one Playwright never finds stable.

## 2026-10-06 One notice at a time

The install leaf, the weekly recap and the check-in share one slot above
the row, in that order; the next appears when the one before is closed.
Three cards stacked above the row would push the row off a phone screen.

## 2026-10-06 The surprise pool is walked, not drawn

The daily surprise is picked from one shuffled list (facts, visitors,
glows) by the date, so every device agrees and nothing repeats until the
whole list has been seen. Novelty, not rarity, is what the research says
the reward responds to.

## 2026-10-06 The share code is the data

The club has no server. A person's code is their things and days as one
gzipped base64url string, pasted once and kept, so the buddy's scene can be
drawn offline and nothing is ever uploaded. Ids become indexes and a day is
a list of indexes to keep a year of days under a few kilobytes. The code is
versioned (`wc1`) and a code that does not decode is refused whole.

## 2026-10-06 The buddy's scene is read only

A buddy's scene is drawn from their code at the time it was pasted; it does
not update by itself and nothing in it can be tapped. Keeping each other
current is a message between two people, which is the point of the club.

## 2026-10-06 Lighthouse is measured through Playwright's Chromium

chrome-launcher cannot spawn a browser on the development machine, so the
audit connects to a Chromium that Playwright launches with a debugging
port. The numbers are in STATE.md.

## 2026-10-07 The club became postcards

The buddy slot asked two people to swap codes and paste them, and what it
showed was a photograph that never updated. That is admin, not a club.
Now the club is you and whoever you send your whale to: after a moment
worth showing, one button paints the scene as a postcard and opens the
share sheet, straight into the messages people already use. No names, no
codes, no data leaves the phone except the picture the person chose to
send. The three decisions above about the share code and the read-only
buddy scene are superseded by this one; the code is gone.

## 2026-10-07 A postcard is painted from the data, not photographed

Photographing the screen would capture whatever sheet or toast was on top
and come out at the phone's own size. The postcard repaints the same
scene from the same data at 1080px, so a story from one phone looks like
a story from any other, and the square is composed for a square rather
than cropped from a tall screen.

## 2026-10-07 The postcard is painted before the tap

An iPhone opens the share sheet only inside a tap, and a long wait between
the tap and the call loses that permission. So both sizes start painting
the moment the button appears, and the tap hands over a finished file. A
refusal falls back to a preview sheet with its own send button.

## 2026-10-07 The install leaf waits for the first thing

On the empty first screen the leaf took the space under the first
sentence before the person had done anything. It is now the first of the
notices, and it applies only once a thing exists.

## 2026-10-07 Sea facts may take two rows

Every line said after a tap fits one row at 320px, and a test holds that.
The daily sea facts are up to ninety characters and are the exception:
cutting them to forty would lose what makes them worth reading, and they
are said once, quietly.

## 2026-10-07 Lighthouse runs through Edge

chrome-launcher cannot start Playwright's Chromium on the development
machine, but it can start Edge. CHROME_PATH pointed at msedge.exe and
--chrome-flags="--headless=new" against the live URL gives the numbers in
the README.

## 2026-10-07 Finds arrive as stones

An unlock used to appear by itself. Now it falls in as a stone that waits
until it is cracked: a reason to come back that is not a notification,
and a moment (three taps, a burst, a find coming out of the light) that
belongs to the person. What is found still follows only from the total
days. The one stored fact is the highest tier cracked per thing; if it
were lost, stones would come back, and nothing found would be taken away.

## 2026-10-07 Rarity is a shine, picked from a date

Rare and legendary finds glow differently and carry a small mark in the
Collection. Nothing else reads it. It is a hash of the find's id and the
date its tier was reached, so it is the same on every device, survives an
import, and never needs storing.

## 2026-10-07 One animation loop

The star field, the particles and the parallax each ran their own
requestAnimationFrame. They now ask one ticker for frames at their own
rate. It stops while the page is hidden (visibilitychange) or the scene is
off screen (IntersectionObserver), and nothing subscribes under reduced
motion. A test counts the frames.

## 2026-10-07 The moon is real, so the moon collectibles changed

Every sky now has the moon in its phase for the date. A collectible
crescent and a collectible full moon would have put two or three moons in
one sky, so they became what a moon makes: a ring around it, and its light
on the water.

## 2026-10-07 Lock in, and nothing dies

The timer was behind a long press and nobody could tell whether it was
running. It is now a visible "lock in" under every card, a dial, and a
whole-screen session with the creature growing as company. Leaving for
more than fifteen seconds marks the session and the creature waits; nothing
is lost. The difference is honest rather than
punishing: a clean session is a full day; a left one counts as showing up
but earns no star and no step towards a stone, and the line says so in
plain words. Fifteen seconds is long enough to answer a message and short
enough that leaving means leaving.

## 2026-10-07 The time away is measured, not assumed

A phone suspends a hidden web page, so nothing can be counted while it is
away. The session writes the moment it hid and measures the gap on return.
The same path covers a locked screen, another app, a reload and a closed
app: a reload comes back within the grace and is not leaving.

## 2026-10-07 Notices moved under the header

The install leaf, the recap and the check-in sat above the row, which on
a phone is exactly the water line where stones float. They now sit under
the header, over the sky. They are temporary; while one shows, it can
cover the first row of day-stars.

## 2026-10-07 Days are one line in a thing's sheet

Planning had to add nothing to the first screen, so it lives where the
name and the minutes are edited: seven day chips, all on. Nothing else:
no calendar, no repeats every other week, no times of day, no reminders.
"Also today" and "not today" change a single date, which covers the week
that is different without a calendar. If dated planning is ever needed,
it is its own piece of work.

## 2026-10-07 Only planned days count

The consistency arithmetic looks at planned days only. The creature's
stage is the last seven planned days, so three times a week, kept, is a
whale. The streak walks back over planned days and steps over a day with
nothing planned. The recap is "3/3.", not "3/7.". A day off is a dash on
the card, never an empty dot, and never a missed day. The total days (and
so the stones) count every day the thing was done, planned or not.

## 2026-10-07 A rest day is calm, not quiet

A missed day dims the scene. A day with nothing planned does not: it says
one line and leaves the sky as it is, with no star because nothing was
done, and the check-in is still there for anyone who opens the app anyway.

## 2026-10-07 The thing's sheet opens from three dots on its card

Tap is done and lock in has its own button, so the sheet needed a third,
quiet way in: three dots in the card's top corner, a full touch target.
The strip's names open the same sheet.

## 2026-10-07 Textures are rendered once, never shipped as images

The grain and the caustics are generated in the browser on the first frame
after load (a short delay keeps them off the critical path) and set as
CSS variables holding data URLs. No image files to precache, nothing to
fetch offline, and the tiles are small enough that the cost is a few
milliseconds once.

## 2026-10-07 Gradient ids are unique per drawing

Creatures and collectibles now use SVG gradients, and the same drawing can
be on the screen several times (a card, the scene, a sheet). A shared id
would make one drawing's gradient depend on another's being in the DOM, so
every drawing takes its ids from a counter.

## 2026-10-07 The sea's finds live in the water

Sea collectibles were placed on the shore line with the rest. They now sit
in a band just under the surface, between the water line and the cards,
so the sea's things look like they belong to the sea.

## 2026-10-07 Drawings split by size, not by world

Small shared pieces (tints, faces, fish, jellies, stems) are in draw.ts;
the larger collectible drawings are one function each in art.ts and
art2.ts; collectibles.ts stays a list. Splitting by world would have put
the shared pieces in three places.

## 2026-10-07 The empty screen has a sleeper, not an arrow

The first screen keeps its one sentence and its one empty card. A small
whale asleep under the surface makes it feel inhabited without saying
anything more or pointing at anything. It leaves with the first thing.

## 2026-10-07 The lab is a sandbox copy, not a flag on the real data

Trying the app across days means writing days that never happened. Doing
that on the real record, even with an undo, risks the one thing the app
must never lose. So the lab copies the record into its own key and points
the store there; leaving deletes the copy. The real key is not opened for
writing while the lab is on, and a test checks it byte for byte.

## 2026-10-07 One clock module, enforced by lint

A movable clock only works if nothing reads the device clock behind its
back. `src/store/clock.ts` is the one place, and `no-restricted-syntax`
makes `Date.now()` and a bare `new Date()` an error anywhere else in
src. Animation timing (`performance.now()`, rAF timestamps) is not "today"
and stays as it is.

## 2026-10-07 Moving the lab's clock reloads the page

The app does several things once, on opening: the quiet morning line, the
check-in, the weekly recap, resuming a session. Re-running each of them on
a clock change would be a second code path that only the lab uses. A reload
runs the real one. Changing the sandbox's data (do everything, seed, clear)
stays in place, through the store, like any tap.

## 2026-10-07 The lab's offset is in whole calendar days

The controls are days, and a day is the person's local day. Moving by
calendar days (setDate) rather than by 24-hour blocks keeps the time of day
across a daylight saving change, so +1 day never lands on the same date.

## 2026-10-07 The seed leaves one stone per thing

A seeded month earns several tiers per thing; leaving all of them as
stones would fill the screen with rocks. Every tier but the newest is
marked cracked, so the Collection is not empty and one stone per thing
waits to be cracked, which is what a person coming back after a month
would see.

## 2026-10-07 Clear sandbox empties it

"Clear" gives the first open (no things, the sleeping whale), still in the
lab and at the same offset. Getting the real sea back is what exit is for.

## 2026-10-07 The lab's way in is five taps on the version

A hidden gesture on something that is already there, the way developer
options work on a phone, plus `?lab=1` for a link. The menu gained the
version line for it; five taps, each within a couple of seconds of the last.

## 2026-10-07 Screenshots are WebP under 300 KB

The film grain made every PNG 1.5 to 1.8 MB. The README shows phones at
200 to 280 px wide, so the pictures are scaled to 780 px (2x that, and a
little more) and saved as WebP, which GitHub renders in a README. They are
now 20 to 60 KB each. The old PNGs stay in the git history; it is not
rewritten.

## 2026-10-07 Nothing reads layout while the app starts

Lighthouse on the live v0.7 gave 70 for performance on a phone, down from
99, with one long task of about 1.9 s (simulated). A trace showed two
causes: the scene read its own size in its constructor, forcing a layout
of the whole page while it was still being built, and the two textures
were encoded to PNG synchronously with toDataURL. The scene now takes its
size from the ResizeObserver's first call, which comes after layout and
before paint, so the first frame is the same; the collectibles scale with
a CSS variable instead of a read. The textures are drawn in two separate
idle callbacks and encoded with toBlob, off the main thread. The film
grain and caustics look the same.

## 2026-10-07 No other app's name in this repo

The README's comparison section, the code comments and the test notes that
named another app are gone, and the research notes describe designs, not
products. What a decision rests on is said in its own terms. The git
history is not rewritten.

## 2026-10-07 One kind of thing (data version 4)

Since 0.5 every card has both a tap and a visible lock in, so the add
sheet's "tap when done / timer" choice and its minutes row asked a question
that no longer changed anything. The add sheet now asks for a name, an
emoji, the days and one lock-in length (15, 30, 45 or 60; 30 by default;
the dial reaches every five minutes from 10 to 120). Data version 4 drops
`mode` and makes `minutes` required: a thing from before gets 30 if it
had no length, and any stored length is kept inside the dial's range. The
range lives in types.ts, once.

## 2026-10-07 Leftovers from earlier versions, and what happened to each

| leftover                                                    | done                                                 |
| ----------------------------------------------------------- | ---------------------------------------------------- |
| "how: tap when done / timer" and "minutes" in the add sheet | removed; one lock-in length instead                  |
| "tap a card when it is done. hold it for a timer."          | removed; nothing is held any more                    |
| "N min" under a timer thing's name on its card              | removed with the mode                                |
| `mode` in the data                                          | dropped by the version 4 migration, with a test      |
| a violin among the add sheet's emoji                        | replaced by a palette: the examples stay general     |
| the card comment about a long press                         | rewritten to say what the card is now                |
| the "timer" sound, played when a left session ends          | renamed "left"                                       |
| "the timer screen" in the frame's comment                   | "the lock-in screen"                                 |
| the v0.3 buddy, dropped in migration                        | kept: the comment says why a stored field is ignored |
| the v0.1 to v0.4 timer key, read once and moved             | kept: it is how an old running session survives      |
| `quietDay` and `starPlaced` in voice.ts, not said anywhere  | kept for the opening and quiet days (0.10, 0.13)     |
| the postcard size in the club sheet                         | moves to settings in 0.14                            |

## 2026-10-07 The world sinks during a lock-in

The session used to sit over the scene with the sky turning behind it.
Now the scene slides up and deep water rises over it, and the screen holds
only the creature, a ring and the name. The world is the thing that pulls
the eye; for the length of a session it is put away, and its coming back
is the reward.

## 2026-10-07 The time is hidden by default

A countdown in the middle of the screen becomes the thing watched. The ring
says how far along it is without a number; a tap anywhere shows the time
for three seconds. Settings (0.15) will have "show the time" for people who
want it on.

## 2026-10-07 Undo for ten seconds, then stop

A wrong thing or a wrong length is noticed in the first seconds. Undo then
leaves no trace at all, not even minutes. After ten seconds the same place
holds stop, which writes the minutes down.

## 2026-10-07 One pause, five minutes, and it ends by itself

Interruptions happen (a door, a call). One pause per session, up to five
minutes: the creature sleeps, the time stands still, and being away inside
the pause is not leaving. It ends by itself after five minutes, with one
quiet note, so a pause cannot quietly become the end of the session. A
second pause would make the pause a habit.

## 2026-10-07 The end is an opening, and a tap skips it

What a session gave is shown in order (the lantern, the creature going
home, the star, the line, the whale to send) instead of all at once,
because each piece is noticed only when it has its own moment. Nobody waits
for it: a tap anywhere lands on the final state, the same one the sequence
ends in. The record is written before the opening starts; the scene holds
the new lantern and star back and the opening lets them in.

## 2026-10-07 Lanterns are one canvas of stamped sprites

Four hundred lanterns after a year rule out one element each. They are
drawn on one canvas: each lantern is a sprite drawn once per colour, size
and dimness, stamped with drawImage; the flicker runs at 12 frames a second
on the shared ticker; under reduced motion they are drawn once. Where each
floats comes from its date and its place in the day, so it never moves.
Measured alone, a year of them (490 from the lab's 365-day seed) keeps the
median frame at 16.7 ms in headless Chromium.

## 2026-10-07 Frame timing runs alone, after everything else

Timed with five other browsers rendering beside it, the frame test measured
the machine, not the scene (83 ms medians that were 16.7 alone), and the
trace recorder's screencast cost frames of its own. It is now its own
Playwright project that depends on the three device projects, so it runs
last, alone, without a trace.

## 2026-10-07 Lanterns from before version 5 come from the minutes

Until 0.10 a day kept minutes per thing, not sessions. A thing done with
minutes almost always got them from a lock-in that ran to its end (a
stopped session is minutes without done), so the migration gives each such
pair one lantern, dim if it was left. A stopped session later tapped done
gets a lantern it did not strictly earn; the generous side is the side to
err on.

## 2026-10-07 One view of the record, and no charts

The log is the only place the record is shown as a record: a month
calendar with stars and lantern dots, a sentence for the month, the year as
twelve small months, a day's card. The sky already is the picture; a chart
would be a second picture of the same thing, and a number to fall short of.

## 2026-10-07 The sky is found by height

The canvases over the sky take the taps, so the scene listens for a tap
above the horizon that is not on a star, a stone or a button, and opens the
log. A star opens its own day instead of a toast.

## 2026-10-07 The product principle (the author's words)

> the app has to be a system-building start for people, the first easy step to go towards the life they desire, and this has to help them as much as it can. it's like being a beginner in the gym: you can start light, but you stay consistent and results show.

It is at the top of the README, and it decides between options when nothing
else does.

## 2026-10-07 Clarity is a rule, and a test

Nobody should have to wonder where to delete or how to do anything. A tired
person opening the app for the first time finds everything without being
told. If something needs explaining, it is too complicated: simplify it,
do not explain it. Every action has a visible place with a word; gestures
(a hold, a swipe, taps in a row) are only a faster way to something that
already has a visible button. The lab is the one exception. The clarity
test does fifteen everyday jobs through visible words only and counts the
taps: each job's control is in sight within two taps of the first screen.
When it fails, the app changes, not the test.

## 2026-10-07 Two kinds of thing again (the author's decision after 0.9.0)

0.9.0 made every thing one kind, tappable and lockable. In use that made a
tap on a lock-in thing a free count, and the card said nothing about how a
thing is done. Now there are two: a tap thing is a list; a lock-in counts
only when its timer has seen its whole length that day. A tap on a lock-in
card opens the dial and never marks it. Everything that counts (all done,
stars, stages, stones, streaks, krill later) goes through "done" only.
Data version 6 adds the kind; a thing from before is a lock-in when more
than half of its done days had minutes. Past days are not rewritten: an
old "left and waited" day stays done.

## 2026-10-07 Only the minutes the timer saw count

A lock-in's session counts while its screen is on show. Leaving the app,
the first fifteen seconds still count, then the count stops, and coming
back carries on. A page that goes away altogether (a reload, the app
closed, a phone that died) counts to the last moment the screen was seen,
which the screen writes every five seconds. Nothing seen is lost: the
minutes are kept for the day, the card offers "12/25 · finish", and a tap
goes straight on. Nothing is given away either: "left" no longer counts as
done. A day that ends short keeps its minutes in the log and as a faint
lantern; they do not carry over. One done in one go is a bright lantern,
one done in parts a softer one.

## 2026-10-07 Did it without the timer: twice a week, a hand, no lantern

Sometimes the thing happens without the phone: a lesson, a forgotten
start, a dead battery. Its sheet (never the card) asks once, "the full 15
min, for real?". Yes counts the day for streaks and stages, with a small
hand on the card instead of a check, and no lantern, no krill, no
ceremony. Not really changes nothing and says one line. Twice a week for
all things together keeps it an exception.

## 2026-10-07 Delete without "are you sure"

A confirm dialog makes every delete slower and protects nothing that undo
does not protect better. The card swims off, the line says the days stay,
and "undo" waits ten seconds at the bottom. A deleted thing is kept among
the retired: its stars stay in the sky, its finds in the scene, its
lanterns in the cove, its name in the log. Because of that, a thing's line
is stored on it (it used to be worked out from the order, and a delete
would have changed the other thing's line), and a new thing takes the
world the row's pattern is missing.

## 2026-10-07 The first minute is a promise in silhouette

A new person saw "add a thing" and did not know what any of it was for.
The intro shows where it goes before asking for anything: a year of the
real scene, seeded (the lab's year, not a forecast of this person), with a
day counter running to 365, and everything in silhouette: creatures as dark
shapes with a rim of light, finds only flashes. It shows that the sea fills
and keeps what it fills with a surprise; because it is the real scene, the
promise grows with the content. Then the truth, the author's words over the
empty sea of day one:

> the thing is, sometimes doing such small things seems unremarkable, because you can't see the results yet. but results come, after you compound these days, that you stay consistent, even when it seems small.

Then one button, "start light", with three small things to begin with. It
plays on a first open only (nothing stored, never seen), skip is always
there, a tap goes on, and under reduced motion the year is three still
frames. Existing users never get it forced on them; "how it works" and the
lab can play it again.

## 2026-10-07 Each mechanic explains itself once

No tutorial and no wall of rules. A stone, a lantern, kept minutes and the
first thing each say what they are in one line the first time they appear,
and never again (`settings.explained`). The next find is always in sight
above the row, with the same count as the Collection, so the near goal is
always a few days away.

## 2026-10-07 The log explains itself

The author opened the log and did not know what stars and lanterns were or
why the dots had colours. So under the calendar there is always a two-line
legend in the scene's own words, a dot of each lock-in thing's colour with
its name (a deleted one only in a month with its lanterns), and a line for
soft and faint lanterns when the month has them. A day lists the things
done, the sessions with their minutes, and the minutes that did not finish.

## 2026-10-07 The tests skip the intro by a fixture

Every test file imports `test` from the helpers, whose page has seen the
intro, so a test about anything else starts on the first screen. The
intro's own tests use Playwright's `test` and get a true first open.

## 2026-10-07 The lab never plays the intro by itself

Opening `?lab=1` on a device with nothing stored is a first open, and the
intro would have played over the lab's own sheet. In the lab the intro
plays only when asked for, with "first open again".

## 2026-10-07 The intro is paced like a piece of music

The author found "a year of small things." gone before it could be read,
and the truth beat empty. The pacing now follows what on-screen text and
motion storytelling both say: text stays about a second for every two or
three words, long enough to be read twice (SSW, "Do you give enough time
to read texts in your videos?"); a sequence reads as intentional when it is
timed like music, with accelerando, ritardando before the climax and a
fermata held longer than expected (dylantarre, "rhythm and pacing" in the
animation principles playbook); and pauses give each moment the contrast
that makes it land (Gameshead, "Why great games know when to slow down").
So: a breath of quiet, a year eased in and out (slow first days, fast
middle, slow last days), a held beat at 365, the whale, then the line word
by word and three seconds more. The truth comes a phrase at a time, with a
small story under it so the empty sea has someone in it: the little whale
of day one wakes, rises, blows, and the first star lights on the last
word. Notes come from one pentatonic scale, so any order is a tune and none
clashes. Everything still moves by transform and opacity only, reaches
"start light" in under thirty seconds, and a tap still skips.

## 2026-10-07 A quiet glass under text that floats over the scene

Text over the scene had only a shadow and read as unfinished against
stars and sand. It now sits on one shared, nearly invisible glass
(`--float-bg`, `--float-edge`, `--float-blur`): the line, "edit", the next
find, "not today"; the header gets a soft fall of dark from the top and the
first sentence a pool of dark behind it. One treatment, so it reads as a
system, not patches.

## 2026-10-07 Any length from five minutes to ten hours

A person who practises for five hours had no way to say so. The add sheet
and the thing's sheet keep four common lengths and add "other", which
opens hours and minutes. The dial is spread over stops rather than
minutes (five-minute steps to an hour, quarters to three hours, half hours
to ten), so the short lengths most people pick keep the most room and one
key press is always one stop. Ten hours is the ceiling: longer is a day,
not a session.

## 2026-10-07 The truth is a song that climbs

The author wanted the truth beat to land like a melody, the kind that makes
a person think "we got this". The method came from how a moving sequence
in another of the author's pages is built (the method only; nothing of that
page was copied): every line moves the scene one step on, the steps only
ever add up, the eyes blink between lines, the camera pushes slowly in, and
the mood climbs from hushed to gold before a held, still end.

Here that becomes a score in `src/app/intro.ts` (`TRUTH`). The two halves of
the sentence are the two halves of the song: the doubt is dim and cold, the
hope arrives through a blink, the one moment the screen goes dark on
purpose, and the little whale opens its eyes as ours do. "Compound" is shown,
not told: the stars double in waves that come sooner each time (an
accelerando), each with the next note up the scale, and the last word lands
on a four-note chord played as a quick arpeggio. The stars sit on the R2
sequence, which spreads points evenly with no grid and no line (a first
golden-ratio try fell on a diagonal). Nothing steps back once it has
arrived, so the climb never stalls. The whole intro still reaches "start
light" in about twenty-seven seconds.

## 2026-10-07 The brand pass, and what each skill gave

0.12.0 runs the author's design skills in order, and each leaves a record.

- **frontend-design** gave `docs/brand/BRAND.md`: the bubble as the mark,
  cream line glyphs, the colours by row place, Fraunces kept for display
  and Atkinson Hyperlegible for everything read. Its critique cut a second
  signature bubble and a wave line, so the one tiny bubble rising from the
  top right stays the single thing to remember.
- **ui-ux-pro-max** searches a database with a Python script, and this
  machine has no Python. Its rules were read from the skill's own
  `references/pro-rules.md` instead, and nothing was presented as a search
  result: no emoji as icons, one stroke weight, icon sizes from tokens, 3:1
  for a glyph against its bubble, 44 px targets, press feedback in 80 to
  150 ms, micro-interactions in 150 to 300 ms, colour never the only signal,
  a scrim at 40 to 60 %.
- **emil-design-eng** gave the strong curves, one press rule for every
  pressable, sheets on the iOS drawer curve that leave faster than they
  come and can be pulled down, hover only on real pointers, and nothing
  growing from zero. The Before/After table is in `docs/QUALITY.md`.
- **review-animations** can only be started by the author; it refuses to
  run when the agent calls it. The new motion is checked against the emil
  rules in `docs/QUALITY.md`, and the skill is left for the author to run.

## 2026-10-07 The intro has a score

The author asked for music that catches the heart, "almost a melody, but it
echoes", with notes under the words because the text felt too quiet. Three
findings shaped it.

- What gives shivers and tears is known well enough to compose for. In
  Sloboda's study of passages that reliably moved listeners, 18 of 20
  contained an appoggiatura, a note that clashes with the chord and then
  resolves; shivers went with new or unprepared harmony and sudden changes
  in texture and loudness ("Anatomy of a tear-jerker", after Sloboda 1991;
  Frontiers in Psychology 2018, "Musical chills"). The same research names
  crescendos, a new voice entering, and the range widening at the climax,
  and stresses that each works only against what came just before.
- The harmony walks from vulnerable to bright: A minor, F, G, C, the road
  the vi to IV to V to I progressions take in so much music meant to lift,
  with the fourth held over the G (a suspension) so the arrival is waited
  for.
- The echo is a timbre and a space: a soft felt-piano tone (a strong
  fundamental, few quiet overtones, two oscillators a few cents apart)
  sent into a feedback echo and a long room. The room is generated, noise
  that darkens as it fades, so nothing is loaded. The method of a felt
  piano with an echo was also how the author's other page did it; the
  notes, the voicings and the code here are new.

So `src/app/score.ts` is written as a score, with named notes and voicings.
Every word of the truth has a note, so the text sings as it appears: the
doubt falls quietly and stops on an unresolved B, the blink is a true
silence (the whole mix drops, echoes too), the hope enters with a bass that
was not there, "compound" doubles the notes with the stars, and the last
word lands on the peak, F over C falling to E. The words now come one every
200 ms, slow enough to hear as a melody, and the timing is derived from the
text: the stars start on "compound" and the peak on the last word.

Because a browser plays nothing before a first touch, a first open now
begins with "tap to begin" over the quiet sea; without it the music could
never start where it should. It only shows when sound is on and not yet
allowed, it answers Enter, and "skip" stays.

The mix was checked by rendering the whole score offline with every cue at
its real time (`scripts/score-render.js`, run in the browser on the dev
server) and measuring each section. The first render clipped and was flat,
the doubt as loud as the peak, so the levels became one table (`LEVEL`),
pads were made as loud with seven notes as with two, and the blink was made
silent. Now: sea -48 dB, year -26, doubt -26, blink -54, hope -21, stars
-18, waiting -16, peak -13, peak sample -1.9 dBFS, and the last chord sinks
and fades instead of droning on.

## 2026-10-07 The intro, measured smooth

The author saw small glitches in the intro: something seemed to scroll,
the text not always quite centred. Measured before touching anything, in
a headless phone, frame by frame: nothing scrolled (every scroll offset
stayed 0) and every text block stayed centred to the pixel. What was real:

- A 124 to 172 ms frozen frame on the tap that starts the year: making the
  audio context (82 ms) and building the reverb's room (36 ms), in the
  same tap. The context is now made while "tap to begin" is up (a browser
  allows one before a gesture; it just waits), the room is built then too
  and kept, and its loop is one multiplication a sample instead of an
  exponential. The tap only resumes the sound. Measured after: no frame
  over 50 ms from the tap into the year.
- The slow camera push zoomed the whole scene, and zoomed it back over a
  second as the app appeared after the intro: the world moving under the
  eye, the likeliest "something scrolled". Deleted, as the motion rules
  say to when a motion is in doubt.
- Each word rose on its own compositor layer and lost it when its fade
  ended, which redraws text snapped to whole pixels: a twitch of a fraction
  of a pixel, the kind seen only when looking closely. Words keep their
  layer while the intro is up.

The probe (frame intervals per beat, and the browser's long-animation-frame
entries naming the script) is the way to check this again.

## 2026-10-08 The bubble sits at the card's corner

Cards are about 62 px wide with five in a row, and the corner already held
the done ring and a waiting stone (which hid the ring). The bubble takes
the ring's place at 34 px, its glyph about 16 px, and the stone badge now
rests on the bubble's lower edge, so a thing's mark is never hidden. The
card's done glow and its "12/25 · finish" take the thing's own colour, not
its world's: one colour per thing everywhere, as BRAND.md says (bubble,
lanterns, log, card). In the log the legend shows each thing's bubble; the
dots in the days stay lanterns in the thing's colour, because they count
lock-ins finished, and turning them into bubbles would blur what they mean.

## 2026-10-08 A picture picked from the name, and what before 0.12 wore

The brief asked for a glyph picked by keywords in English and Lithuanian.
The name is folded (lower case, diacritics off, so "bėgimas" is "begimas"),
then three kinds of hit are tried, strongest first: a phrase ("walk the
dog"), a whole word ("violin"), a stem of four letters or more starting a
word ("smuik" in "smuikas"). Shorter keywords never match as stems, so "su"
("with") is never the dog. Words that only qualify another ("morning",
"early", "groti", "drink", "make") are weak: "morning run" is a run and
"groti smuiku" a violin. Among equal hits the longer keyword wins
("spanish" over "study"). Tests hold the traps found while writing it.

Migration goes further than the brief (which said emoji by a table, else a
monogram): emoji by the table first, because that is what the person chose;
then the name, because a person's words usually say what the thing is; only
then the first letter. The emoji is kept on the thing for the record.

## 2026-10-08 One picture field, following the name until a pick

The add sheet and the thing's sheet share one field: a live bubble in the
thing's colour, the twelve most common pictures, the first letter, and
"more" by group. Until the person picks, the picture follows the name as it
is typed and a quiet line says "picked from the name"; a picture from the
name that is not among the twelve shows first, so the choice is always in
sight. A thing being changed keeps following its name only if its picture
still is the name's own.

## 2026-10-08 The app icon: a tail, not a sprout

The first drawing of a whale's tail, two leaf-like flukes on a stem, read
as a seedling at every size. Redrawn as one outline: wide swept flukes with
the notch at the middle, the stalk thickening into a wave. The favicon is
its own simpler drawing with thicker strokes, because the full icon's lines
fall under half a pixel at 16 px. Apple and maskable icons are full-bleed
squares (the phone cuts its own shape); the maskable one draws the mark at
80 %, inside the circle a launcher may crop to.

## 2026-10-08 brand.html is drawn by the app's own code

The look on one page (every bubble state, the colours, the glyphs at 20 px
and in bubbles, the icons, the type, the app icon) is a second build entry
that imports the same modules the app draws with, so it cannot drift from
the app. It is kept out of the service worker's app fallback so it opens as
itself offline.

## 2026-10-08 The audit, by three reviewers at once

web-design-guidelines (the Web Interface Guidelines, fetched fresh) was run
over every file of the interface by three read-only reviewers in parallel,
one on the HTML and styles and two on the app's markup, so each could read
its files whole. The important findings were fixed at once, the rest are
listed in docs/QUALITY.md for the polish stage or for the author (copy is
the author's, and existing lines are not touched). The two that mattered
most: a thing's typed name reached two `aria-label` attributes unescaped,
so a crafted 24-letter name could run a script when the log opened; and
the session screen, several redraws and the intro dropped the keyboard
focus to the page. A closing sheet now leaves the accessibility tree and
stops taking taps at once, and on a phone a sheet opens on its title rather
than springing the keyboard over itself.

## 2026-10-08 Reduced motion keeps its fades

The global reduced-motion rule cut every transition to nothing, so a sheet
or a toast blinked into place. The review-animations standard is gentler,
not zero: keep opacity, drop movement. The rule now forces
`transition-property: opacity` instead of a zero duration (keyframes
still land on their end), and the things that hide by moving (sheets,
toasts) stay in place and fade under it.

## 2026-10-08 The README is written for a stranger with a minute

The README had grown a picture at a time, nineteen screenshots in loose
rows. It is now written for someone deciding in a minute whether this is
good work: one banner, what it is in two sentences, why it exists, the
screens in a captioned grid, then the engineering (data, structure, how it
is checked) for whoever reads on. The banner is composed by
`scripts/hero.mjs` from the screenshots `npm run shots` has just made, in
the app's own fonts and colours, so it stays in step with them; it is 2:1
so it also serves as the repository's social preview. The licence names
its holder, as the author's other projects do.

## 2026-10-08 Krill is worked out from the days; the dock is about three years deep

Nothing earned is stored: krill, like the finds, is a function of the
history (src/store/krill.ts), so it can never disagree with it, and an
undone day simply earns less. Only purchases are kept, each with the
price paid then, so a later price change never rewrites a past purchase.
The balance never goes below nothing; a done taken back after a purchase
stops it at zero rather than owing.

The brief asked for a steady person to earn about 2,000 a month and
25,000 a year, and named four price ranges. The model gives 1,890 and
22,770 (docs/ECONOMY.md), a little under on purpose: the first-week set
(0.14) and welcome back (0.15) are still to come, and a reward is easier
to add than to take back. The four ranges add up to 67,940, about three
years of steady krill; "a year buys the dock" and the ranges cannot both
hold, so the ranges stay, because they are what a person feels at the
dock. A first year buys every small and middling thing and a few large
ones, and the legendary tier stays a goal for the second year.

## 2026-10-08 Places, the chest, and a late stone

Finds and dock things stand in fixed places (the shore 6, the sea 8, the
sky 8), taken in the order things were got; when a world is full the next
one waits in the chest and the line says so. Thirteen finds are the
scene's weather rather than things (the aurora, the milky way, the song,
the deep, a ring round the moon): they keep the spot they were drawn for,
behind everything. Two belong to another (the bees, the cat) and go where
it goes. A person who never arranges still gets a whole, tidy scene.

The order is by the day a find was reached, which is right unless a stone
waits: one cracked weeks late would take the place of something already
standing. When a crack would move anyone, the arrangement as it is gets
written down first, so the newcomer takes a free place or the chest and
nothing on screen moves on its own.

Hiding a placed dock thing is putting it in the chest, one idea instead
of two. The things standing in places and the extensions under them (the
island, the reef, the sand edge) are left out of the parallax, so a thing
never slides off the ground it stands on.

## 2026-10-08 Arranging by drag, and by tap and tap

A drag snaps to the nearest place of the thing's own world and swaps with
whoever stands there; another world's places fade while something is
held and refuse it. The same move works without dragging: a tap picks a
thing up, a tap on a ring puts it down. That makes it work from a
keyboard and with a screen reader (every ring is a button named "a fish,
place 3" or "empty place 5"), and it is how the clarity test does it.
The scene holds still while arranging (the ticker is held and every CSS
motion paused), so a thing does not swim away from under a finger. The
row and the dock are out of reach: nothing is marked or bought there.

## 2026-10-08 Night things, the krill chip, and three swaps in the dock

The dock's own lines say when its scene things come out: aurora nights,
the cove glowing, the lanterns lit, Friday's falling stars, a sky whale
once a night. They keep to that (21:00 to 05:00 on the local clock, like
the jellyfish), and one bought in daylight shows itself for a few
seconds, so a purchase is never invisible.

The krill sits under the title, not beside it: on a 390 px phone the
title, a four-digit balance and the four header buttons do not fit in one
row with 44 px targets. The star calendar's first row starts lower so a
star is never under the chip.

The brief's list named a kite, a lighthouse and aurora nights, which the
finds also have (a kite at 120 days, a lighthouse at 60, the aurora at
45). They stay, drawn as their own things: the dock's are bought, the
finds are earned, and few people have both lines. A comet, which was
not in the brief, is replaced by a moon swing, so the dock adds nothing
the sky already gives at day 30.

## 2026-10-08 The sky is a path, not a calendar

Seeded a year in the lab, the sky was a net of fifty-two rows of joined
stars: the calendar was there, the goal was not. The log is the calendar
now, so the sky can be the goal: each day something was done lights the
next star of a constellation drawn in the outline of the legendary at its
end. The whole shape is in the sky, faint and dotted, from the first day,
so the far goal is seen before it is near; a day lights one star, so the
progress is seen every day. A missed day takes nothing, a rest day with
nothing done has no star. Paths are 30, 60, then 100: thirty days of
showing up is already further than most people go, and a steady person
finishes about four in a year.

Stars sit closer together in a constellation than a finger is wide, so a
star's own target is only its spacing (12 px). A tap that misses falls to
the sky, which opens the month in the log, where the days are; every star
is still a button for a keyboard and a screen reader.

## 2026-10-08 Rarity is earned

Rarity was a hash of the date: luck, 3 % legendary and 17 % rare, and
nothing a person did made it more likely. Now a per-thing find is common,
a rare find comes half way along a constellation, and a legendary only at
its end; a legendary is never sold. Finds reached before this version keep
the shine their date gave them (rarity.ts, `EARNED_FROM`), so the change
takes nothing away and nothing has to be stored.

A legendary always gets a place: in a full world the newest ordinary
thing gives up its place to it and waits in the chest. A halfway star or
a legendary is the day's moment, so that day the daily surprise steps
aside; the same goes for the first week's set, a milestone, and the days
the sky and the sea keep.

## 2026-10-08 The first year's calendar, the first week's set, art slots

The season follows the real date, northern by default (the settings
stage brings the south). The sky keeps the great meteor showers on their
peak nights, the solstices and equinoxes on their usual days, World Ocean
Day and World Whale Day, and New Year's night; dates within a day of the
true moment are close enough for a sky that is drawn. All of it is worked
out from the clock; nothing is fetched.

The first week is a set of seven, a finish line before the long paths,
because week one is where most people stop (RESEARCH-DOPAMINE). It pays
100 krill once; with it the steady person's model reads 1,990 a month and
22,870 a year.

Art slots read the list of pictures at build time, so the app never asks
the network for one that is not there; a picture inside an SVG would not
reach a canvas, so the postcard draws a slot's picture directly.

## 2026-10-08 Gentle mechanics

Quiet days are freedom given in advance, not a forgiveness asked for after:
the allowance (one a week up to four planned days, two from five) is
spent by the week's first misses, with nothing to set or claim, so a
person never has to decide whether they deserve it. Inside it, a miss is
a moon and changes nothing; past it, a dot stays empty and nothing more
happens. The dimmed sea now means a miss past the freedom. It lives in its
own module (store/quiet.ts); planning moved to store/plan.ts so both it
and derive can read it without a circle.

Welcome back counts a break in planned days, so a weekend off is no break
and Monday earns no gift for it; the first day ever is no return. The gift
says nothing: naming the break would make it the subject.

A creature asleep is the opposite of a sad one: it asks for nothing, and
the person's return is what wakes it. Eyes closed is the eyes squashed to
a line, so every creature's own face does it with one rule.

A new chapter is offered, never imposed, once per Monday or first of a
month after a quiet week; accepted, only the dots begin again. "After" has
five moments and no hours, and a thing without one sits in the middle of
the day, so choosing a moment for one thing never reshuffles the others.
The badge is set only where no permission is needed.

## 2026-10-08 Settings, and a sea that is never lost

The settings sheet has only the groups the brief allows (sound, days, lock
in, postcards, your sea, about) and nothing that would turn the app into
a control panel: no themes, fonts, languages, notifications or accounts.
Every choice applies at once. One addition: a still sea, from the
interface audit (the always-moving scene had no pause of its own, WCAG's
"pause, stop, hide"); it pauses the scene the way arranging does, and the
ticker now keeps a hold per reason so the two never undo each other.

"A day ends at" is applied in the one place every "today" comes from
(store/dates.ts, todayKey), so nothing else had to learn about it; the
week's first day likewise lives in weekStart, which the recap, the good
weeks, quiet days and the log all use.

A backup is the data itself with a checksum of it, so a file cut short or
edited by hand is caught before it can replace anything; a newer version's
file is refused rather than guessed at. Restoring and starting over keep
the sea before in a key of its own for the ten seconds of undo, so even a
reload in those seconds loses nothing; the next start clears the copy.

The about section leaves out the credit line for the tools that the
first brief listed: on 2026-10-08 the author asked for the public writing
to keep to the work itself (the contributors list shows who helped).

## 2026-10-08 Polish: what changed and what was left as it is

Toasts pause while a keyboard holds their focus, but not when the focus
was handed to them after a tap: a deleted card gives its focus to "undo"
(the nearest way back), and on a phone that undo would otherwise never
run out. `:focus-visible` tells the two apart.

The view transition names only the sheet, and only while it swaps. A
named child inside the sheet's scroll would be drawn unclipped over the
page for the length of the transition, and a sheet still leaving would
share the name and cancel it.

Reading sizes moved to rem; the wordmark, an icon in its 44 px button and
the numbers inside the dial's ring stay in px, because they are sized to
a shape, not for reading, and would overflow it at a larger text setting.

Left as they are: the chips and the week dots keep their short colour
change (a press is answered by the scale, the colour says the new state,
and both are cheap); the stone's crack keeps drawing by
`stroke-dashoffset` (a few short paths, once per stone, seen rarely).

Frame timing on a CPU slowed four times: two vsync steps (about 30 fps)
for a year of lanterns, in headless Chromium, which paints in software. A
phone paints on its GPU; every running animation was checked to be
transform or opacity only, so nothing is left on the main thread that a
GPU would not take. The test holds the line at under three steps.

A plaque's date is written the way people write it ("9 Nov 2026"), on the
ceremony, in the Collection and on the gold postcard alike. In the
Collection's narrow tile "2026-11-09" broke after a hyphen into two
halves; the words of the line are unchanged, only the date inside it.

## 2026-10-08 1.0: what the release is, and the review before it

1.0 is the first year, whole: everything from day one to day 365, the
dock, the paths and their legendaries, settings, back up and restore. It
adds no new mechanic; it is the same app made ready for strangers. The
README answers the questions a stranger asks first (free, other apps,
pause, music, offline, a new phone, a friend), and the app's "how it
works" sheet answers the same ones in its own voice, so a friend who got
only the link needs nobody to explain it.

The review before the tag looked for dead code, comments that no longer
tell the truth, misleading names, duplicated helpers and numbers without
a name. Six exports nothing used were removed (among them `streakDays`,
from the sky that was a calendar before the paths). The rule for numbers,
written down so it stays one rule: a duration or threshold that answers a
person (a press, a sheet, a toast, an undo, a grace period) is a named
token or constant; choreography (an ambient sway of 21 s, the stagger of
falling stars, the beats of the intro's score) stays with the element it
moves, next to the comment that explains it, because a token used once
only moves the number away from its reason.

Lighthouse asked for the two scene textures in WebP and 0.17.0 did it.
When the frame test then failed, WebP looked guilty; a first comparison
seemed to agree, and an interleaved one (PNG and WebP builds taking turns,
three rounds) showed no difference at all: the test itself was flipping.
The textures are blob URLs made once on the device and Safari cannot
encode WebP, so they are PNG again for one format everywhere, and the
frame test was changed (below).

The review before the tag was a second reading by a separate agent,
asked only to report, with every claim checked against the code before
anything changed. What it found that was wrong rather than untidy: the
new chapter still assumed a Monday, the undo copy of a replaced sea was
written and never read, version 1 data skipped the step that gives
things their line, and a find's entrance animation was held forever.
Each has a test now. Left as they are, on purpose: the two `Line`s (a
creature's line and the text line on screen) keep their names, as both
read naturally where they are used; `lineFor` stays as the one way a
creature's line is asked for.

Two kinds of measurement were told apart. The frame-rate test flipped
between one and two vsync steps from run to run with nothing changed, so
WebP textures first looked guilty and were not (an interleaved
comparison showed no difference; they stay PNG, which Safari makes
anyway). The test now holds the main thread's work per frame, which is
the app's own (about 5 ms at full speed), and keeps the frame gaps as
recorded numbers with a looser bound.

## 2026-10-08 A line for the day

The lines live in their own file (src/app/lines.ts) rather than voice.ts:
a moment that says one takes it from there, so each line is written once
and the check-in can tell when a moment has already said it. What a
moment said is kept for the day in a key of its own, outside the sea's
data (it is a courtesy, not history), together with what can be foreseen:
a missed day, a new chapter offered after the check-in, the milestone the
day's first star would reach.

A line a moment already said is replaced by the one half a cycle away.
That line then comes twice in its cycle; any replacement must repeat
somewhere, and half a cycle is where it is least noticed. On the many days
no moment says a line, the walk is exact: twenty days, twenty lines.

The check-in no longer goes away by itself after the answers: a line is
there to be read, so it stays until "ok" or "send this". The line takes
the whole width of the leaf and its two buttons sit under it, so the
longest line is two rows on a 320 px phone and most are one.

The new chapter's lead was the line explaining it ("the week's dots start
fresh. the sky keeps everything."); the author's brief replaces it with a
line of the day. The button still says "new chapter", and "how it works"
and the log keep the rest; the reassurance is the one thing lost, and it
is the author's call.

"show the time" was a setting already. It is on the lock-in screen too
now, because that is where it is wanted and where a tap that shows the
time for three seconds is easy to miss; both places change the same
setting, so there is still nothing new to set.

## 2026-10-08 A safe place

"not today" reuses what was there: the things set aside go to the day's
`skip` list, so the "not today" strip and every count already treat them
as resting, and the day is marked `notToday`. A miss on that day is quiet
by definition and is left out when the week counts its own quiet days, so
saying it never spends a freedom the person did not choose to spend. The
one thing kept is the smallest: a tap before a lock-in, a short lock-in
before a long one. The check-in counts as answered; the line for the day
is not shown on such a day, the soft day's own line is.

"it’s been heavy for a few days" is said in place of the soft line on the
third "not today" in a row, at most once in seven days, with no link and
no label: the author's brief, and the gentlest thing an app can do there.

Bottles need written lines, so the evening's one good thing is also
asked on its own after 18:00 when the check-in came earlier; it is asked
once a day either way. A line comes back only when it is a week old or
more ("a while ago" has to be true), not again within a month, and it is
told by its season when it is from another one and more than two months
old: no dates and no numbers.

The creatures to pet are drawn in the scene, small, in their worlds, and
not on the cards: a tap on a card means done, and a pet must never mark
anything (a sleeping creature, petted, wakes without its day being
done). Their places are above the line and the row's tools, which cover
the lower scene on a phone, and under the stones, so a stone waiting (a
thing to do) is never behind a creature (a thing to enjoy).

Late night is 23:00 to 05:00 of the person's own day: "a day ends at"
moves both ends, so for someone whose day ends at 5:00 the late hours are
04:00 to 10:00. The good night screen cannot close a web app (no browser
lets a page do that); it is a quiet screen that lifts with a tap.

A creature's name is asked the first time it reaches its last stage, once,
whatever the answer. Lines that say "it" say the name instead in two
moments: when it grows, and when a lock-in pauses and it sleeps.

## 2026-10-09 One card for every notice

Seven notices had grown seven layouts: two columns here, a stacked column
there, three title styles, buttons a row away from their words. They are
one component now (`src/app/leaf.ts`, `src/styles/leaf.css`), and the
callers only say what goes in it. The order of the actions is the
component's, not the caller's: quiet words, a soft pill, the bright
primary at the right edge, where the thumb is. A card has one primary at
most; a card that only acknowledges something ends on a soft "ok" pill,
so every card still has a clear end. A note that belongs to the footer
(who said the line, what tomorrow holds) sits on its left, which is what
made the line for the day and the good thing short.

## 2026-10-09 The club: the display face for the title only

The author's direction, taken almost as it was: the day count under the
title, the rows, air, a small mark and the rules at reading size, the
club's line last. Two choices of our own: the rules keep their numbers
(they are an order, first to third, so the numbers say something true),
and the part every rule repeats ("the first rule of whale club is:") is
quieter than the rule itself, so the eye lands on "you show up." The
words are the author's and are not changed or cut; only their colour is.
"the rules" is a new label, marked TODO-VOICE.

## 2026-10-09 The before pictures were retaken at 390 × 844

Playwright's iPhone 13 is 390 × 664: Safari with its bars. The brief asks
for 390 × 844, the app on the home screen, so the audit uses that, and the
before set was taken again from a build of v1.2.4 served on its own port,
so every pair compares like with like.

## 2026-10-09 The bottle keeps above the row on a short phone

On a 568 px phone the line, the goals and the row cover the whole shore,
and the bottle lay under the line's glass. The bottom block's height is
read by a ResizeObserver (after layout, so nothing is forced) into
`--ui-h`, and the bottle stays above it there. On taller phones it has
not moved. The creatures to pet stay where they are: they are for
enjoying, and peeking out from under the glass costs nothing.

## 2026-10-09 What the research changed in the brief

The brief's shortlist was a to e; the research (docs/IDEAS.md) kept a, c
and e and put the whale's night swim in place of b ("breathe first"): a
companion that goes away and comes back with a story is the most praised
thing in its field, and the author's first morning is when it pays off.
"Breathe first" is good and small, and is first in line for the author to
choose, with the letter to later (d), whose payoff is weeks away.

The brief's example for the month's tide ("on days you ran, you said
good!!! more often") cannot be true: the check-in's two answers are fixed
and always happy. The tide says only what the data can carry, and leaves a
card out rather than invent one.
