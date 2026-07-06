import { Link } from 'react-router-dom'
import { getAqiCategory } from '../utils/aqi'
import { useAqi } from '../context/AqiContext'

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

function StationIllustration({ kind, tint }) {
  const baseFill = tint

  if (kind === 'school') {
    return (
      <svg className="station-card__icon-art" viewBox="0 0 64 64" fill="none" aria-hidden="true">
        <path d="M16 50h32M20 50V26h24v24M26 18h12l6 8H20l6-8ZM28 32v4M36 32v4M28 40v4M36 40v4M31 22h2" stroke={baseFill} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }

  if (kind === 'university') {
    return (
      <svg className="station-card__icon-art" viewBox="0 0 64 64" fill="none" aria-hidden="true">
        <path d="m12 24 20-8 20 8-20 8-20-8ZM20 29v10M44 29v10M16 42c5.5 2.8 10.9 4 16 4s10.5-1.2 16-4M52 26v12" stroke={baseFill} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }

  if (kind === 'city') {
    return (
      <svg className="station-card__icon-art" viewBox="0 0 64 64" fill="none" aria-hidden="true">
        <path d="M18 50V22l14-6v34M32 50V16l14 6v28M14 50h36M24 28h2M24 34h2M24 40h2M38 28h2M38 34h2M38 40h2" stroke={baseFill} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }

  if (kind === 'monument') {
    return (
      <svg className="station-card__icon-art" viewBox="0 0 64 64" fill="none" aria-hidden="true">
        <path d="M16 50h32M20 50V34h24v16M18 34h28M24 34V24l8-6 8 6v10M28 28h8" stroke={baseFill} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }

  if (kind === 'factory') {
    return (
      <svg className="station-card__icon-art" viewBox="0 0 64 64" fill="none" aria-hidden="true">
        <path d="M14 50h36V28l-10 6v-8l-10 6v-8l-16 10v16ZM22 50V38M30 50v-8M38 50v-6M42 20c0-3 2-5 5-6" stroke={baseFill} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }

  return (
    <svg className="station-card__icon-art" viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <path d="M16 46h32M22 46l10-26 10 26M26 34h12M18 20h28" stroke={baseFill} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function getStationKind(index) {
  const kinds = ['school', 'university', 'city', 'monument', 'factory', 'park']
  return kinds[index % kinds.length]
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

function StationCard({ station, index }) {
  const category = getAqiCategory(station.aqi)
  const accent = getStationAccent(station.aqi)
  const kind = getStationKind(index)
  const label = category.label.toUpperCase()
  const textLabel = label === 'GOOD' ? 'GOOD' : label === 'SATISFACTORY' ? 'SATISFACTORY' : label

  return (
    <Link to="/" className={`station-card${station.offline ? ' station-card--offline' : ''}`}>
      <div className="station-card__icon" style={{ '--soft-accent': accent.soft }}>
        <StationIllustration kind={kind} tint={accent.strong} />
      </div>
      <h3 className="station-card__title">{station.name}</h3>
      <p className="station-card__subtitle">
        Lucknow - {station.agency || 'UPPCB'}
      </p>
      <div className="station-card__divider" />
      <p className="station-card__aqi-label" style={{ color: accent.strong }}>AQI</p>
      <p className="station-card__aqi-value" style={{ color: accent.strong }}>{station.aqi}</p>
      <span className="station-card__status-pill" style={{ '--badge-color': accent.badge }}>
        {textLabel}
      </span>
      <div className="station-card__skyline" style={{ '--skyline-color': accent.skyline }} aria-hidden="true" />
      {station.offline && <span className="station-card__offline">Offline</span>}
    </Link>
  )
}

function StationRow({ stations, startIndex }) {
  return (
    <div className="stations-board__grid">
      {stations.map((station, index) => (
        <StationCard
          key={`${station.name}-${station.agency}`}
          station={station}
          index={startIndex + index}
        />
      ))}
    </div>
  )
}

export default function StationsPage() {
  const { stations, cityData, loading, error } = useAqi()

  if (loading) {
    return <div className="page-status">Loading stations...</div>
  }

  if (error || !stations) {
    return <div className="page-status page-status--error">{error || 'No stations available'}</div>
  }

  const firstRow = stations.slice(0, 3)
  const secondRow = stations.slice(3, 6)
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
              <header className="stations-board__header stations-board__header--plain">
                <div className="stations-board__heading">
                  <PinIcon />
                  <div>
                    <h2>Active Stations : {activeCount} / {totalCount}</h2>
                    <p>(Tap on a station to see more info)</p>
                  </div>
                </div>
              </header>

              <section className="stations-row-section">
                <StationRow stations={firstRow} startIndex={0} />
              </section>

              <section className="stations-row-section">
                <StationRow stations={secondRow} startIndex={3} />
              </section>

              <footer className="stations-footer">
                <span className="stations-footer__line" />
                <div className="stations-footer__message">
                  <LeafMark />
                  <span>Clean Air, Better Tomorrow</span>
                </div>
                <span className="stations-footer__line" />
              </footer>
            </div>

            <div className="stations-signage-page__mascot-wrap" aria-hidden="true">
              <img src="/chicken.svg" alt="" className="stations-signage-page__mascot" />
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
