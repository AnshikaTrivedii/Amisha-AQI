import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'
import { applySignageViewport } from './signageViewport.js'

applySignageViewport()
window.addEventListener('resize', applySignageViewport)
window.visualViewport?.addEventListener('resize', applySignageViewport)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
