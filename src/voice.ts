/**
 * Every line the app says, in one place, by the moment it is said at.
 *
 * TODO-VOICE: these are neutral placeholders. The author replaces them with
 * their own lines; nothing else in the code holds a sentence. Where a key
 * holds a list, one entry is picked per day so a tap does not always say
 * the same thing. Keep lines short: the line slot is one row on a phone.
 */
export const voice = {
  /** The empty first screen, above the example. */
  firstOpen: 'simple things. add one.', // TODO-VOICE
  /** The example under the first line. */
  example: 'e.g. run. read. practice 20 min.', // TODO-VOICE
  thingAdded: ['added. show up tomorrow.', 'that is homework now.'], // TODO-VOICE
  tap: {
    sea: ['done. bubbles.', 'the sea noticed.', 'we back.'], // TODO-VOICE
    sky: ['done. a little light.', 'the sky noticed.', 'we back.'], // TODO-VOICE
    garden: ['done. something grew.', 'the garden noticed.', 'we back.'], // TODO-VOICE
  },
  untap: 'undone. no drama.', // TODO-VOICE
  timerStart: 'timer running. nobody is coming.', // TODO-VOICE
  timerEnd: 'time. that counts.', // TODO-VOICE
  allDone: 'all of it. all the smoke.', // TODO-VOICE
  missedDay: 'you missed a day. nothing died.', // TODO-VOICE
  quietDay: 'quiet so far.', // TODO-VOICE
  weekGood: 'a good week.', // TODO-VOICE
  weekBad: 'a week. there is another one.', // TODO-VOICE
  stageUp: 'it grew.', // TODO-VOICE
  unlock: (name: string) => `new: ${name}.`, // TODO-VOICE
  collection: {
    empty: 'nothing yet. add a thing.', // TODO-VOICE
    next: (days: number) => (days === 1 ? 'in 1 day' : `in ${days} days`),
  },
  shareDone: 'picture saved.', // TODO-VOICE
  shareFailed: 'could not make the picture.', // TODO-VOICE
  starPlaced: 'a star for today.', // TODO-VOICE
  checkin: {
    question1: 'how are you living?',
    answer1: 'good!!!',
    question2: 'how do you feel?',
    answer2: 'happy!!!',
    after: 'noted.', // TODO-VOICE
  },
  // TODO-VOICE: the author may swap rule one for "you never give up on yourself".
  rules: [
    'the first rule of whale club is: you show up.',
    'the second rule of whale club is: you show up tomorrow.',
    'the third rule: nothing dies. you just missed a day.',
  ],
  install: {
    ios: 'put it on your home screen', // TODO-VOICE
    iosSteps: ['tap Share', 'tap Add to Home Screen'],
    android: 'put it on your home screen', // TODO-VOICE
    button: 'Install',
    close: 'not now',
  },
  update: 'new version. tap to reload',
  share: {
    caption: (day: number) => `day ${String(day)} of whale club`,
  },
} as const

/** Picks a line from a list by a day and an id, so the choice holds all day. */
export function pick<T>(list: readonly T[], seed: string): T {
  let hash = 0
  for (const char of seed) hash = (hash * 31 + char.charCodeAt(0)) >>> 0
  const item = list[hash % list.length]
  if (item === undefined) throw new Error('empty list')
  return item
}
