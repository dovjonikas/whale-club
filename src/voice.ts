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
  /** What to do then, said right after it. */
  shareFailedNext: 'try again in a moment.', // TODO-VOICE
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
  /** The add sheet. Labels, not the game's voice. */
  add: {
    title: 'new homework',
    name: 'name',
    placeholder: 'run',
    button: 'add',
    /** Under the name field when "add" is pressed with no name. */
    needName: 'give it a name first.', // TODO-VOICE
    /** From the first open's "start light": three small things to begin with. */
    starters: 'start with something small',
    starterThings: [
      { icon: 'water', name: 'a glass of water' }, // TODO-VOICE
      { icon: 'pushups', name: '10 push-ups' }, // TODO-VOICE
      { icon: 'read', name: 'read 2 pages' }, // TODO-VOICE
    ],
  },
  /** A thing's picture, in its bubble: the add sheet's and the thing's sheet's field. */
  icon: {
    label: 'its picture', // TODO-VOICE
    /** Under the label while the picture still follows the name. */
    picked: 'picked from the name', // TODO-VOICE
    letter: 'first letter', // TODO-VOICE
    more: 'more', // TODO-VOICE
  },
  /** How a thing is done: the one question in the add sheet and the thing's sheet. */
  kind: {
    question: 'how is it done?',
    tap: 'tap when done',
    tapLine: 'e.g. vitamins, 10 push-ups', // TODO-VOICE
    lockIn: 'lock in',
    lockInLine: 'e.g. study, practice an instrument. counts when the timer runs to the end.', // TODO-VOICE
    length: 'how long',
    other: 'other',
    hours: 'h',
    minutes: 'min',
  },
  /** What a card says under its name. */
  card: {
    length: (m: number) => duration(m),
    finish: (seen: number, total: number) => `${String(seen)}/${String(total)} · finish`,
    doneToday: 'done today',
    /** Once, on a new thing's card. */
    hintTap: 'tap it when it’s done.', // TODO-VOICE
    hintLockIn: 'tap to lock in.', // TODO-VOICE
  },
  /** Editing: a visible word for every change, and delete without "are you sure". */
  edit: {
    edit: 'edit',
    done: 'done',
    add: 'Add a thing',
    delete: 'delete',
    deleteThing: (name: string) => `delete ${name}`,
    deleteForGood: 'delete this thing',
    deleted: 'it swam off. the days you did stay.', // TODO-VOICE
    undo: 'undo',
  },
  /** Done without the timer, from a lock-in thing's sheet. */
  without: {
    button: 'did it without the timer',
    question: (m: number) => `the full ${String(m)} min, for real?`,
    yes: 'yes',
    no: 'not really',
    noLine: 'okay. the timer is waiting.', // TODO-VOICE
    used: 'used both this week.', // TODO-VOICE
    undoToday: 'not done today after all',
  },
  /** Each mechanic says what it is, once, the first time it shows. */
  explain: {
    stone: 'a stone fell in. tap it three times.', // TODO-VOICE
    lantern: 'a lantern for every lock-in you finish.', // TODO-VOICE
    kept: 'minutes kept. tap the card to finish.', // TODO-VOICE
    firstStar: 'your first star.', // TODO-VOICE
    yours: 'yours. it grows on the days you show up.', // TODO-VOICE
  },
  /** The first open: three beats, never again unless asked. */
  intro: {
    skip: 'skip',
    /** The first screen of a first open: one tap, so the music is allowed to play. */
    begin: 'tap to begin', // TODO-VOICE
    beginLine: 'with sound, if you can.', // TODO-VOICE
    next: 'tap to go on',
    day: (n: number) => `day ${String(n)}`,
    promise: 'a year of small things.', // TODO-VOICE
    /** The author's own words. Not to be changed. */
    truth: [
      'the thing is, sometimes doing such small things seems unremarkable, because you can’t see the results yet.',
      'but results come, after you compound these days, that you stay consistent, even when it seems small.',
    ],
    start: 'start light',
    back: 'back to the sea',
    watch: 'watch the intro',
  },
  /** The goal always in sight: the next find, under the sky. */
  nextFind: (days: number) =>
    days === 1 ? 'next find: tomorrow' : `next find: in ${String(days)} days`,
  howItWorks: {
    title: 'how it works',
    lines: [
      'add your few things.', // TODO-VOICE
      'tap when done, or lock in.', // TODO-VOICE
      'the scene grows with the days you show up.', // TODO-VOICE
      'nothing dies.', // TODO-VOICE
    ],
  },
  lockIn: {
    button: 'lock in',
    minutes: 'minutes',
    stop: 'stop',
    undo: 'undo',
    pause: 'pause',
    goOn: 'go on',
    /** The one pause of a session: the creature sleeps. */
    paused: 'paused. it is asleep.', // TODO-VOICE
    /** The pause is over, by a tap or by itself. */
    goingOn: 'going on.', // TODO-VOICE
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
  days: {
    label: 'days',
    short: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
    names: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    today: 'today only',
    notToday: 'not today',
    alsoToday: 'also today',
    save: 'save',
    edit: (name: string) => `edit ${name}`,
  },
  /** A day with nothing planned. Calm, no star, nothing missed. */
  restDay: 'nothing planned. rest is part of it.', // TODO-VOICE
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
  /** The log: the one view of what has been done. */
  log: {
    title: 'the log',
    summary: (stars: number, lanterns: number, minutes: number) =>
      `${plural(stars, 'star')}, ${plural(lanterns, 'lantern')}, ${duration(minutes)}`,
    lanterns: (n: number) => plural(n, 'lantern'),
    minutes: (n: number) => duration(n),
    previous: 'previous month',
    next: 'next month',
    previousYear: 'previous year',
    nextYear: 'next year',
    year: 'the year',
    back: 'back to the month',
    checkin: 'checked in',
    left: 'left, it waited',
    nothing: 'nothing that day. that is allowed.', // TODO-VOICE
    unfinished: (seen: number) => `${String(seen)} min, not finished`,
    without: 'without the timer',
    inParts: 'in parts',
    /** The log explains itself: the same words as the scene. */
    legendStar: 'star: a day you did something',
    legendLantern: 'lantern: a lock in you finished',
    legendSoft: 'soft: finished in parts',
    legendDim: 'faint: started, not finished',
  },
  /** The lab: a tool for trying the app across days, not part of the game's voice. */
  lab: {
    title: 'the lab',
    note: 'fake time. your real sea is untouched.',
    bar: (days: number) =>
      `lab · ${days >= 0 ? '+' : ''}${String(days)} ${Math.abs(days) === 1 ? 'day' : 'days'}`,
    today: (when: string) => `today in the lab: ${when}`,
    exit: 'exit',
    forward: '+1 day',
    week: '+7 days',
    back: '-1 day',
    real: 'back to real time',
    doAll: 'do everything today',
    seed30: 'seed 30 days',
    seed90: 'seed 90 days',
    seed365: 'seed 365 days',
    firstOpen: 'first open again',
    clear: 'clear sandbox',
    time: 'time',
    sea: 'the sandbox',
    version: (v: string) => `version ${v}`,
  },
} as const

function plural(n: number, word: string): string {
  return `${String(n)} ${word}${n === 1 ? '' : 's'}`
}

/** 400 as "6 h 40 min", 40 as "40 min". */
function duration(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${String(m)} min`
  return m === 0 ? `${String(h)} h` : `${String(h)} h ${String(m)} min`
}

/** Picks a line from a list by a day and an id, so the choice holds all day. */
export function pick<T>(list: readonly T[], seed: string): T {
  let hash = 0
  for (const char of seed) hash = (hash * 31 + char.charCodeAt(0)) >>> 0
  const item = list[hash % list.length]
  if (item === undefined) throw new Error('empty list')
  return item
}
