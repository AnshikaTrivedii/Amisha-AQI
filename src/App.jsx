import { Routes, Route } from 'react-router-dom'
import { AqiProvider } from './context/AqiContext'
import AppFrame from './components/AppFrame'
import CityAqiPage from './pages/CityAqiPage'
import StationsPage from './pages/StationsPage'

export default function App() {
  return (
    <AqiProvider>
      <Routes>
        <Route
          path="/"
          element={
            <AppFrame>
              <CityAqiPage />
            </AppFrame>
          }
        />
        <Route path="/stations" element={<StationsPage />} />
      </Routes>
    </AqiProvider>
  )
}
