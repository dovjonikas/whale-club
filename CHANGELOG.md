# Changelog

All notable changes, newest first. Versions follow `package.json`.

## 0.4.0 - 2026-10-07

Postcards: the club is you and whoever you send your whale to.

- The buddy slot, the share code and the read-only buddy scene are gone,
  with their tests and docs. A settings.buddy left by v0.3 is dropped on load.
- After a moment worth showing (the whale surfacing when all is done, an
  unlock, a creature growing), one button appears: "send the whale", or
  "send this" for an unlock. The weekly recap has "send this" too, and the
  header's share button sends the sea any time.
- A postcard is the scene repainted from the data at 1080x1920 (story) or
  1080x1080 (square), with the moment's line, the day count, the date and
  a small "whale club" mark. Chosen on the first send, remembered, changed
  in the menu. It goes to the share sheet, or downloads where there is none.
- Four header buttons: sound, collection, send the sea, menu. The menu is
  one screen, the club: the three rules and one sentence.
- The install leaf waits for the first thing; the empty first screen is
  for the first sentence. The iPhone leaf's button opens three big steps.
- The app lives in a phone-wide frame on every screen; on a desktop the
  sides are black.
- The recap's buttons sit under its line, so the line keeps one row on a
  320px phone; a test holds every line after a tap to one row there.
- The row of things is a group, not a list without items: Lighthouse
  accessibility had flagged it.
- Lighthouse, live URL, through Edge: mobile 99 / 93 / 100 / 100, desktop
  100 / 93 / 100 / 100 (performance, accessibility, best practices, SEO),
  measured before the fix above.

## 0.3.0 - 2026-10-06

Stage 3: your Tyler.

- The club: one buddy slot. Name the person who pushes you, paste their
  code, and their scene (sky, creatures, collectibles) is drawn beside
  yours, read only, from the code alone. No server.
- Your own share code, gzipped and base64url, with copy and send.
- A fifth header button for the club; the header fits five on a 375px phone.
- Notice buttons are 44px tall; a polish pass on iPhone 13 mini, iPhone 13,
  Pixel 5, 1366x768 and 1920x1080 found no overflow and no small targets.
- The share picture's title is left-aligned again (it was clipped).

## 0.2.0 - 2026-10-06

Stage 2: the growth, the collectibles and the sky.

- 60 collectibles (three worlds, two lines each, ten tiers) drawn into the
  scene as they unlock; locked ones shown as silhouettes with the true
  number of days to go in the Collection sheet. An unlock is a burst, a
  sound and one line.
- Creatures grow with a visible stage-up moment and a line.
- All done: the whale surfaces over the horizon with a sound and a glow;
  from day 90 it wears the red jacket.
- Every day-star is a button: tap it to see what was done that day.
- The daily surprise after the first thing done: a sea fact line, a
  visitor crossing the scene, or a glow, chosen by the date so nothing
  repeats until the pool is spent.
- The check-in: call and response, two taps, once a day.
- The weekly recap: N/7 and one line, on Sunday or the first open of a
  new week, never what was missed.
- The rules sheet, with the day count and a small streak.
- Sound: synthesised tones behind a tap gate, a mute button that remembers.
- Share: the scene as a PNG with the day count, through the share sheet
  where there is one and as a download elsewhere.
- One notice above the row at a time: install leaf, recap, check-in.

## 0.1.0 - 2026-10-06

Stage 1: the row and the scene.

- Up to five things, each with a name, an emoji, tap or timer mode; worlds
  assigned in order (sea, sky, garden, sea, sky).
- Tap marks today, with a jump, a burst in the world's colours and one
  line; a second tap undoes.
- Long press runs a timer (15, 30, 60 or custom); the creature swims, the
  screen goes calm, finishing counts as done, and a reload resumes it.
- Seven week dots under each card.
- The scene: night sky with a star per day laid out as a calendar, a shore,
  a sea with bioluminescent drift; three parallax layers.
- A missed day dims the scene for a day and says so. Nothing is lost.
- PWA: manifest, versioned service worker, offline, an update toast, the
  install leaf for iPhone and Android.
- Playwright tests on iPhone 13, Pixel 5 and desktop.
