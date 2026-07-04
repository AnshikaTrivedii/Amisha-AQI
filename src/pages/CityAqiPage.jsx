import { Link } from 'react-router-dom'
import { getAqiCategory, getHealthImpact } from '../utils/aqi'
import { useAqi } from '../context/AqiContext'

function HistoryDot({ date, aqi }) {
  const cat = getAqiCategory(aqi)
  const textColor = cat.textColor || '#fff'

  return (
    <div className="history-item">
      <span className="history-item__date">{date}</span>
      <div
        className="history-item__dot"
        style={{ backgroundColor: cat.bg, color: textColor }}
      >
        {aqi}
      </div>
    </div>
  )
}

function HealthIllustration({ shirtColor }) {
  return (
    <svg className="health-illustration" viewBox="0 0 80 100" fill="none">
      <ellipse cx="40" cy="92" rx="22" ry="5" fill="#e0e0e0" />
      <rect x="28" y="58" width="24" height="32" rx="4" fill={shirtColor} />
      <rect x="22" y="62" width="10" height="22" rx="3" fill={shirtColor} />
      <rect x="48" y="62" width="10" height="22" rx="3" fill={shirtColor} />
      <circle cx="40" cy="32" r="18" fill="#fdd8b5" />
      <path d="M22 28c2-10 12-16 18-16s16 6 18 16" fill="#333" />
      <circle cx="33" cy="32" r="2" fill="#333" />
      <circle cx="47" cy="32" r="2" fill="#333" />
      <path d="M36 40c2 2 6 2 8 0" stroke="#333" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

export default function CityAqiPage() {
  const { cityData, loading, error } = useAqi()

  if (loading) {
    return <div className="page-status">Loading AQI data…</div>
  }

  if (error || !cityData) {
    return <div className="page-status page-status--error">{error || 'No data available'}</div>
  }

  const category = getAqiCategory(cityData.aqi)
  const healthText = getHealthImpact(cityData.aqi)
  const statusTextColor = category.textColor || '#fff'

  return (
    <div className="city-aqi-page">
      <Link to="/stations" className="back-btn" aria-label="Back to stations">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2.5">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </Link>

      <div className="bottom-panel">
        <div className="bottom-panel__body">
          <h1 className="panel-title">City Level AQI Data</h1>

        <div className="aqi-card">
          <div
            className="aqi-card__status"
            style={{ backgroundColor: category.bg, color: statusTextColor }}
          >
            <span className="aqi-card__label">{category.label}</span>
            <span className="aqi-card__value">{cityData.aqi}</span>
          </div>
          <div className="aqi-card__details">
            <div className="aqi-card__location">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#1976d2">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5z" />
              </svg>
              <span className="aqi-card__city">{cityData.name}</span>
            </div>
            <p className="aqi-card__updated">Last updated: {cityData.lastUpdated}</p>
            {cityData.history.length > 0 && (
              <div className="aqi-card__history">
                {cityData.history.map((item) => (
                  <HistoryDot key={item.date} date={item.date} aqi={item.aqi} />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="health-card">
          <HealthIllustration shirtColor={category.bg} />
          <div className="health-card__content">
            <h2 className="health-card__title">Health Impact</h2>
            <p className="health-card__text">{healthText}</p>
          </div>
        </div>

        <p className="aqi-calendar-note">AQI Calendar (Updated at 4:00 PM daily)</p>
        </div>
      </div>
    </div>
  )
}
