import { Routes, Route } from 'react-router-dom'
import { AqiProvider } from './context/AqiContext'
import CityAqiPage from './pages/CityAqiPage'
import StationsPage from './pages/StationsPage'

export default function App() {
  return (
    <AqiProvider>
      <div className="signage-app">
        <Routes>
          <Route path="/" element={<CityAqiPage />} />
          <Route path="/stations" element={<StationsPage />} />
        </Routes>
      </div>
    </AqiProvider>
  )
}
