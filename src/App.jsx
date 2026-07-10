import { useEffect, useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import { AqiProvider } from './context/AqiContext'
import CityAqiPage from './pages/CityAqiPage'
import StationsPage from './pages/StationsPage'

export default function App() {
  const [previewScale, setPreviewScale] = useState(1)

  useEffect(() => {
    const updatePreviewScale = () => {
      const scale = Math.min((window.innerWidth - 16) / 288, (window.innerHeight - 16) / 288)
      setPreviewScale(scale)
    }

    updatePreviewScale()
    window.addEventListener('resize', updatePreviewScale)

    return () => window.removeEventListener('resize', updatePreviewScale)
  }, [])

  return (
    <AqiProvider>
      <div className="led-preview-shell">
        <div className="led-preview-canvas" style={{ '--led-preview-scale': previewScale }}>
          <Routes>
            <Route path="/" element={<CityAqiPage />} />
            <Route path="/stations" element={<StationsPage />} />
          </Routes>
        </div>
      </div>
    </AqiProvider>
  )
}
