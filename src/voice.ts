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
  rules: [
    'the first rule of whale club is: you show up.',
    'the second rule of whale club is: you show up tomorrow.',
    'the third rule of whale club is: you never give up on yourself.',
  ],
  install: {
    ios: 'put it on your home screen', // TODO-VOICE
    iosLead: 'it works like an app from there. no app store.', // TODO-VOICE
    iosHow: 'show me how',
    iosSteps: [
      'tap the Share button at the bottom of Safari: the square with the arrow.',
      'scroll the list down and tap Add to Home Screen.',
      'tap Add in the corner. done: the whale is on your home screen.',
    ],
    iosNote: 'next time, open it from the home screen, not from Safari.', // TODO-VOICE
    android: 'put it on your home screen', // TODO-VOICE
    button: 'Install',
    close: 'not now',
  },
  lockIn: {
    button: 'lock in',
    minutes: 'minutes',
    stop: 'stop',
    back: 'back to the sea',
    seaSound: 'sea sound',
    /** Said when the person comes back after leaving a session for more than 15 seconds. */
    left: 'you left. it waited.',
    /** The end of a session that was left: it counts, it stayed small. Plain, no shame. */
    broken: 'it counts. it stayed small this time.', // TODO-VOICE
    stopped: (minutes: number) => `stopped. ${String(minutes)} min noted.`, // TODO-VOICE
  },
  stones: {
    fell: 'something fell. go and see.', // TODO-VOICE
    label: (name: string) => `a stone from ${name}. tap three times to crack it`,
    onCard: 'a stone is waiting',
    waiting: 'a stone. crack it.', // TODO-VOICE
    rare: 'rare',
    legendary: 'legendary',
  },
  /** The menu's one screen: the rules and this. */
  clubLine: 'whale club is you and whoever you send your whale to.',
  postcard: {
    sendWhale: 'send the whale',
    sendThis: 'send this',
    sendSea: 'send the sea',
    /** The postcard's line when it is sent from the header with nothing just said. */
    sea: 'the sea, today.', // TODO-VOICE
    which: 'story or square?',
    story: 'story',
    square: 'square',
    format: 'postcards',
    preview: 'your postcard',
    send: 'send',
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
