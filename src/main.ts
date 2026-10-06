import '@fontsource/atkinson-hyperlegible/latin-400.css'
import '@fontsource/atkinson-hyperlegible/latin-700.css'
import './styles/fonts.css'
import './styles/tokens.css'
import './styles/base.css'
import './styles/scene.css'
import './styles/row.css'
import './styles/sheet.css'

import { startApp } from './app/app'
import { showToast } from './app/toast'
import { setupUpdates } from './pwa/register'
import { voice } from './voice'

const root = document.getElementById('app')
if (!root) throw new Error('no #app')

startApp(root)
setupUpdates((reload) => {
  showToast(voice.update, reload)
})
