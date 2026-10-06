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
