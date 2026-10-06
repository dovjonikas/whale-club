# Changelog

All notable changes, newest first. Versions follow `package.json`.

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
