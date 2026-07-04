import { Link } from 'react-router-dom'
import { useAqi } from '../context/AqiContext'
import AqiBadge from '../components/AqiBadge'

function StationList({ stations }) {
  return (
    <ul className="stations-list">
      {stations.map((station) => (
        <li key={`${station.name}-${station.agency}`} className="stations-list__item">
          <Link to="/" className={`station-row${station.offline ? ' station-row--offline' : ''}`}>
            <span className="station-name">
              {station.name} - {station.agency}
              {station.offline && <span className="station-offline-tag">Offline</span>}
            </span>
            <AqiBadge aqi={station.aqi} size="sm" />
          </Link>
        </li>
      ))}
    </ul>
  )
}

export default function StationsPage() {
  const { stations, loading, error } = useAqi()

  if (loading) {
    return <div className="page-status">Loading stations…</div>
  }

  if (error || !stations) {
    return <div className="page-status page-status--error">{error || 'No stations available'}</div>
  }

  const firstBox = stations.slice(0, 3)
  const secondBox = stations.slice(3)
  const activeCount = stations.filter((station) => !station.offline).length
  const totalCount = stations.length

  return (
    <div className="app-frame app-frame--stations">
      <img
        src="/uppcb-stations-frame.jpg"
        alt="Uttar Pradesh Pollution Control Board Stations"
        className="app-frame__image"
      />

      <div className="stations-frame-header">
        <Link to="/" className="stations-frame-back" aria-label="Back to city AQI">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2.5">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </Link>
        <div>
          <h1 className="stations-frame-title">Active Stations : {activeCount} / {totalCount}</h1>
          <p className="stations-frame-hint">(Tap on a station to see more info)</p>
        </div>
      </div>

      <div className="stations-panel stations-panel--top">
        <StationList stations={firstBox} />
      </div>

      <div className="stations-panel stations-panel--bottom">
        <StationList stations={secondBox} />
      </div>
    </div>
  )
}
