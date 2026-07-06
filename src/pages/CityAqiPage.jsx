import AqiGauge from '../components/AqiGauge'
import { getAqiCategory, getHealthImpact } from '../utils/aqi'
import { useAqi } from '../context/AqiContext'

function WindIcon() {
  return (
    <svg className="status-panel__icon" viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <circle cx="32" cy="32" r="32" fill="rgba(255,255,255,0.95)" />
      <g stroke="#68b43e" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 24h16c4.4 0 8-3.6 8-8" />
        <path d="M16 31h24c5 0 9 4 9 9" />
        <path d="M20 38h12c4.4 0 8 3.6 8 8" />
        <path d="M42 16a4 4 0 1 1 0 8" />
        <path d="M49 36a4 4 0 1 1 0 8" />
        <path d="M40 42a4 4 0 1 1 0 8" />
      </g>
    </svg>
  )
}

function CalendarIcon() {
  return (
    <svg className="aqi-meta__calendar" viewBox="0 0 24 24" fill="none" aria-hidden="true">
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

function LocationIcon() {
  return (
    <svg className="aqi-location__icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 21s-6.5-5.9-6.5-11A6.5 6.5 0 1 1 18.5 10c0 5.1-6.5 11-6.5 11Z"
        fill="#2f9b35"
      />
      <circle cx="12" cy="10" r="2.4" fill="#fff" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg className="aqi-message__check" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="12" fill="#37a63b" />
      <path d="m7.5 12.5 3 3 6-7" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function CityAqiPage() {
  const { cityData, loading, error } = useAqi()

  if (loading) {
    return <div className="page-status">Loading AQI data...</div>
  }

  if (error || !cityData) {
    return <div className="page-status page-status--error">{error || 'No data available'}</div>
  }

  const category = getAqiCategory(cityData.aqi)
  const healthText = getHealthImpact(cityData.aqi)

  return (
    <main className="aqi-hero-page">
      <div className="aqi-hero-page__backdrop" />
      <div className="aqi-hero-page__content">
        <header className="aqi-hero-page__header">
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
        </header>

        <section className="aqi-hero-page__hero" aria-label="AQI dashboard">
          <h1 className="aqi-hero-page__title">AQI</h1>

          <div className="aqi-hero-page__main">
            <div className="aqi-stage">
              <article className="aqi-dashboard-card">
                <section
                  className="aqi-dashboard-card__status-panel"
                  style={{ '--status-color': category.bg }}
                >
                  <WindIcon />
                  <p className="status-panel__heading">
                    AIR QUALITY
                    <span>{category.label.toUpperCase()}</span>
                  </p>
                  <p className="status-panel__value">{cityData.aqi}</p>
                  <p className="status-panel__scale">
                    AQI (US)
                    <span>0 - 500 Scale</span>
                  </p>
                </section>

                <section className="aqi-dashboard-card__details">
                  <div className="aqi-dashboard-card__summary">
                    <div className="aqi-dashboard-card__info">
                      <div className="aqi-location">
                        <LocationIcon />
                        <h2>{cityData.name}</h2>
                      </div>

                      <div className="aqi-meta">
                        <CalendarIcon />
                        <div>
                          <span>Last updated:</span>
                          <strong>{cityData.lastUpdated || 'Unavailable'}</strong>
                        </div>
                      </div>

                      <div className="aqi-status-block">
                        <p className="aqi-status-block__label">AQI Status</p>
                        <span
                          className="aqi-status-block__pill"
                          style={{ '--status-color': category.bg }}
                        >
                          {category.label.toUpperCase()}
                        </span>
                      </div>

                      <div className="aqi-message">
                        <p>{healthText}</p>
                        <CheckIcon />
                      </div>
                    </div>

                    <div className="aqi-dashboard-card__gauge">
                      <AqiGauge aqi={cityData.aqi} />
                    </div>
                  </div>
                </section>
              </article>

              <div className="aqi-hero-page__mascot-wrap" aria-hidden="true">
                <img
                  src="/chicken@2x.png"
                  srcSet="/chicken.png 500w, /chicken@2x.png 1500w"
                  sizes="(max-width: 920px) 720px, 1020px"
                  width="1500"
                  height="1500"
                  alt=""
                  className="aqi-hero-page__mascot"
                  decoding="async"
                />
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
