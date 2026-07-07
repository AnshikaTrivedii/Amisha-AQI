import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAqiCategory } from '../utils/aqi'
import { useAqi } from '../context/AqiContext'

const PAGE_ROTATION_MS = 9000

function CalendarIcon() {
  return (
    <svg className="stations-datetime__icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M7 2v3M17 2v3M3 9h18M5 5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M8 13h.01M12 13h.01M16 13h.01M8 17h.01M12 17h.01" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  )
}

function ClockIcon() {
  return (
    <svg className="stations-datetime__icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.9" />
      <path d="M12 7.5v5l3.5 2" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function PinIcon() {
  return (
    <svg className="stations-board__pin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 21s-6.5-5.9-6.5-11A6.5 6.5 0 1 1 18.5 10c0 5.1-6.5 11-6.5 11Z"
        fill="#191f7f"
      />
      <circle cx="12" cy="10" r="2.4" fill="#fff" />
    </svg>
  )
}

function LeafMark() {
  return (
    <svg className="stations-footer__leaf" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M19.5 4.5c-6.3 0-11 3.3-13.5 9.7-.7 1.8-.8 3.7-.9 5.3 1.7 0 3.8-.1 5.7-.9 6.3-2.5 9.2-7.2 8.7-14.1Z"
        fill="#2aaf35"
      />
      <path d="M7 18c3.7-4.4 7.1-7 11-8.5" stroke="#14721f" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function StationLocationIcon() {
  return (
    <svg className="station-card__icon-art" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 21s-6.5-5.9-6.5-11A6.5 6.5 0 1 1 18.5 10c0 5.1-6.5 11-6.5 11Z"
        fill="#2b83db"
      />
      <circle cx="12" cy="10" r="2.4" fill="#fff" />
    </svg>
  )
}

function getStationAccent(aqi) {
  if (aqi <= 50) {
    return {
      strong: '#07982d',
      soft: '#e6f6e7',
      badge: '#089b2e',
      skyline: '#d8eed9',
    }
  }

  if (aqi <= 100) {
    return {
      strong: '#ffb400',
      soft: '#fff4d8',
      badge: '#ffb400',
      skyline: '#f9ecd0',
    }
  }

  return {
    strong: '#ff5b00',
    soft: '#ffe7d8',
    badge: '#ff5b00',
    skyline: '#f7dfd0',
  }
}

function splitDateTime(lastUpdated) {
  if (!lastUpdated) {
    return { date: '--', time: '--' }
  }

  const parts = lastUpdated.split(' ')
  if (parts.length < 4) {
    return { date: lastUpdated, time: '--' }
  }

  return {
    date: parts.slice(0, 3).join(' '),
    time: parts.slice(3).join(' '),
  }
}

function formatStationUpdated(lastUpdated) {
  if (!lastUpdated) {
    return { primary: 'Unavailable', secondary: '' }
  }

  const parts = lastUpdated.trim().split(/\s+/)
  if (parts.length >= 5) {
    return {
      primary: parts.slice(0, 4).join(' '),
      secondary: parts[4],
    }
  }

  if (parts.length === 4) {
    return {
      primary: parts.slice(0, 3).join(' '),
      secondary: parts[3],
    }
  }

  return { primary: lastUpdated, secondary: '' }
}

function StationCard({ station, lastUpdated }) {
  const category = getAqiCategory(station.aqi)
  const accent = getStationAccent(station.aqi)
  const updatedText = formatStationUpdated(lastUpdated)

  return (
    <Link to="/" className={`station-card${station.offline ? ' station-card--offline' : ''}`}>
      <div className="station-card__status-panel" style={{ '--station-status-color': accent.soft }}>
        <p className="station-card__status-text">{category.label}</p>
        <p className="station-card__status-value">{station.aqi}</p>
      </div>

      <div className="station-card__details">
        <div className="station-card__title-row">
          <div className="station-card__icon" style={{ '--soft-accent': accent.soft }}>
            <StationLocationIcon />
          </div>
          <div className="station-card__title-wrap">
            <h3 className="station-card__title">{station.name}</h3>
          </div>
        </div>

        <div className="station-card__updated">
          <p>Last updated: {updatedText.primary}</p>
          {updatedText.secondary && <p>{updatedText.secondary}</p>}
        </div>
      </div>

      {station.offline && <span className="station-card__offline">Offline</span>}
    </Link>
  )
}

function StationRow({ stations, startIndex, lastUpdated }) {
  return (
    <div className="stations-board__grid">
      {stations.map((station, index) => (
        <StationCard
          key={`${station.name}-${station.agency}`}
          station={station}
          lastUpdated={lastUpdated}
        />
      ))}
    </div>
  )
}

export default function StationsPage() {
  const { stations, cityData, loading, error } = useAqi()
  const [currentPage, setCurrentPage] = useState(0)

  const stationList = stations || []
  const stationPages = useMemo(() => {
    const signageStations = stationList.slice(0, 6)
    const pages = []

    for (let i = 0; i < signageStations.length; i += 2) {
      pages.push(signageStations.slice(i, i + 2))
    }

    return pages
  }, [stationList])

  const visibleStations = stationPages[currentPage] || []
  const topStation = visibleStations[0] ? [visibleStations[0]] : []
  const bottomStation = visibleStations[1] ? [visibleStations[1]] : []

  useEffect(() => {
    if (stationPages.length <= 1) {
      setCurrentPage(0)
      return undefined
    }

    const intervalId = setInterval(() => {
      setCurrentPage((page) => (page + 1) % stationPages.length)
    }, PAGE_ROTATION_MS)

    return () => clearInterval(intervalId)
  }, [stationPages.length])

  useEffect(() => {
    if (currentPage >= stationPages.length) {
      setCurrentPage(0)
    }
  }, [currentPage, stationPages.length])

  if (loading) {
    return <div className="page-status">Loading stations...</div>
  }

  if (error || !stations) {
    return <div className="page-status page-status--error">{error || 'No stations available'}</div>
  }

  const activeCount = stations.filter((station) => !station.offline).length
  const totalCount = stations.length
  const { date, time } = splitDateTime(cityData?.lastUpdated)

  return (
    <main className="stations-signage-page">
      <div className="stations-signage-page__backdrop" />
      <div className="stations-signage-page__content">
        <header className="stations-signage-page__header">
          <div className="aqi-banner">
            <img
              src="/logo.png"
              alt="Uttar Pradesh Pollution Control Board logo"
              className="aqi-banner__logo"
            />
            <div className="aqi-banner__text">
              <p className="aqi-banner__title-hi">उत्तर प्रदेश प्रदूषण नियंत्रण बोर्ड</p>
              <p className="aqi-banner__title-en">UTTAR PRADESH POLLUTION CONTROL BOARD</p>
            </div>
          </div>

          <div className="stations-datetime">
            <div className="stations-datetime__row">
              <CalendarIcon />
              <span>{date}</span>
            </div>
            <div className="stations-datetime__row">
              <ClockIcon />
              <span>{time}</span>
            </div>
          </div>
        </header>

        <section className="stations-signage-page__hero" aria-label="Stations dashboard">
          <h1 className="stations-signage-page__title">AQI</h1>

          <div className="stations-signage-page__stage">
            <div className="stations-signage-page__boards">
              <section className="stations-board stations-board--top">
                <StationRow stations={topStation} startIndex={currentPage * 2} lastUpdated={cityData?.lastUpdated} />
              </section>

              <section className="stations-board stations-board--bottom">
                <StationRow stations={bottomStation} startIndex={currentPage * 2 + 1} lastUpdated={cityData?.lastUpdated} />
              </section>

            </div>

            <div className="stations-signage-page__mascot-wrap" aria-hidden="true">
              <img
                src="/change stick.png"
                sizes="520px"
                width="1500"
                height="1500"
                alt=""
                className="stations-signage-page__mascot"
                decoding="async"
              />
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
