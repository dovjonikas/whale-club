import '@fontsource/atkinson-hyperlegible/latin-400.css'
import '@fontsource/atkinson-hyperlegible/latin-700.css'
import './styles/fonts.css'
import './styles/tokens.css'
import './styles/base.css'
import './styles/scene.css'
import './styles/row.css'
import './styles/bubble.css'
import './styles/sheet.css'
import './styles/sky.css'
import './styles/stones.css'
import './styles/session.css'
import './styles/depths.css'
import './styles/log.css'
import './styles/intro.css'
import './styles/lab.css'

import { startApp } from './app/app'
import { showToast } from './app/toast'
import { setupUpdates } from './pwa/register'
import { startLab } from './store/lab'
import { voice } from './voice'

const root = document.getElementById('app')
if (!root) throw new Error('no #app')

// Before anything reads the clock or the store: the lab decides which sea and which day.
const labEntered = startLab(location.search)
startApp(root, labEntered)
setupUpdates((reload) => {
  showToast(voice.update, reload)
})
