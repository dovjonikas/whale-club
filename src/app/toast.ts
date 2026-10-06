/** One line at the top of the screen, one tap. Only one shows at a time. */
let current: HTMLButtonElement | null = null

export function showToast(text: string, onTap?: () => void): void {
  current?.remove()
  const toast = document.createElement('button')
  toast.type = 'button'
  toast.className = 'toast'
  toast.textContent = text
  toast.addEventListener('click', () => {
    hide()
    onTap?.()
  })
  document.body.append(toast)
  current = toast
  requestAnimationFrame(() => toast.classList.add('is-open'))
  if (!onTap) setTimeout(hide, 4000)
}

function hide(): void {
  const toast = current
  if (!toast) return
  current = null
  toast.classList.remove('is-open')
  setTimeout(() => toast.remove(), 300)
}
