import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet'
import L from 'leaflet'
import { useAqi } from '../context/AqiContext'
import CitySearch from './CitySearch'

function MapController({ lat, lng }) {
  const map = useMap()
  useEffect(() => {
    map.setView([lat, lng], 13)
  }, [map, lat, lng])

  useEffect(() => {
    const timer = setTimeout(() => map.invalidateSize(), 100)
    return () => clearTimeout(timer)
  }, [map])

  return null
}

function createAqiIcon(aqi) {
  return L.divIcon({
    className: 'map-aqi-marker',
    html: `<div class="map-aqi-marker__inner">AQI ${aqi}</div>`,
    iconSize: [72, 32],
    iconAnchor: [36, 16],
  })
}

export default function AqiMap() {
  const { cityData, loading } = useAqi()
  const [searchOpen, setSearchOpen] = useState(false)

  if (loading || !cityData) return <div className="map-wrapper map-wrapper--loading" />

  return (
    <div className="map-wrapper">
      <MapContainer
        center={[cityData.lat, cityData.lng]}
        zoom={13}
        zoomControl={false}
        attributionControl={false}
        className="aqi-map"
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <MapController lat={cityData.lat} lng={cityData.lng} />
        <Marker position={[cityData.lat, cityData.lng]} icon={createAqiIcon(cityData.aqi)} />
      </MapContainer>

      <div className="map-overlay map-overlay--top-left">
        <div className="map-logo">
          <svg viewBox="0 0 32 32" width="28" height="28" fill="#4caf50">
            <path d="M16 2C10 8 6 14 6 20a10 10 0 0 0 20 0c0-6-4-12-10-18z" />
          </svg>
        </div>
      </div>

      <button
        type="button"
        className="map-overlay map-overlay--top-right map-icon-btn"
        aria-label="Search cities"
        onClick={() => setSearchOpen(true)}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2">
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20l-3-3" />
        </svg>
      </button>

      <button type="button" className="map-overlay map-overlay--bottom-right map-icon-btn" aria-label="My location">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2">
          <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
          <circle cx="12" cy="12" r="4" />
        </svg>
      </button>

      <CitySearch open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  )
}
