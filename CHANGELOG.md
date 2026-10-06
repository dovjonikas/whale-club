# Changelog

All notable changes, newest first. Versions follow `package.json`.

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
