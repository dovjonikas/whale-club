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
