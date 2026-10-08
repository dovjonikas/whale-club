/** Long enough for any browser to have started the download before the URL goes. */
const REVOKE_AFTER_MS = 10_000

/**
 * Saves a file the plain way, by a link clicked in code: the fallback when
 * the share sheet cannot take it.
 */
export function download(file: File): void {
  const url = URL.createObjectURL(file)
  const link = document.createElement('a')
  link.href = url
  link.download = file.name
  document.body.append(link)
  link.click()
  link.remove()
  setTimeout(() => {
    URL.revokeObjectURL(url)
  }, REVOKE_AFTER_MS)
}
