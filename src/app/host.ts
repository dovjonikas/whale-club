/**
 * The frame everything lives in: a phone-wide column, full height. On a
 * phone it is the screen; on a desktop it sits in the middle with black
 * on both sides, so the app looks the same wherever it is opened. Sheets,
 * toasts and the lock-in screen are appended here rather than to the body,
 * so they stay inside the frame too.
 */
export function host(): HTMLElement {
  const frame = document.getElementById('frame')
  if (!frame) throw new Error('no #frame')
  return frame
}
