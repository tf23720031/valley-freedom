import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './app/App'
import './styles/global.css'
import './styles/travel.css'
import './styles/travel-overrides.css'
import './styles/tokens.css'
import './styles/typography.css'
import './styles/motion.css'
import './styles/responsive.css'
import './styles/home.css'
import './styles/v2.css'

ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><App /></React.StrictMode>)
