import { getAqiCategory } from '../utils/aqi'
import { useAqi } from '../context/AqiContext'

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

function formatUpdatedText(lastUpdated) {
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

function buildHistory(history = [], currentAqi) {
  const items = history.slice(-3)

  if (items.length === 0) {
    return [
      { date: '--/--', aqi: currentAqi },
      { date: '--/--', aqi: currentAqi },
      { date: '--/--', aqi: currentAqi },
    ]
  }

  while (items.length < 3) {
    items.unshift(items[0])
  }

  return items
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
  const updatedText = formatUpdatedText(cityData.lastUpdated)
  const historyItems = buildHistory(cityData.history, cityData.aqi)

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
                <section className="aqi-dashboard-card__status-panel" style={{ '--status-color': category.bg }}>
                  <p className="status-panel__heading">{category.label}</p>
                  <p className="status-panel__value">{cityData.aqi}</p>
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
                        <div className="aqi-meta__text">
                          <span>Last updated: {updatedText.primary}</span>
                          {updatedText.secondary && <strong>{updatedText.secondary}</strong>}
                        </div>
                      </div>

                      <div className="aqi-card__history">
                        {historyItems.map((item, index) => (
                          <div className="history-item" key={`${item.date}-${item.aqi}-${index}`}>
                            <span className="history-item__date">{item.date}</span>
                            <span className="history-item__dot" style={{ '--history-color': category.bg }}>
                              {item.aqi}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>
              </article>

              <div className="aqi-hero-page__mascot-wrap" aria-hidden="true">
                <img
                  src="/final transparent sarus mascot-06 (3) (1).png"
                  sizes="(max-width: 920px) 410px, 500px"
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
