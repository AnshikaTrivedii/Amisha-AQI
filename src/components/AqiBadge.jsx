export default function AqiBadge({ aqi, size = 'md', showLabel = false }) {
  const category = getAqiCategory(aqi)
  const textColor = category.textColor || '#fff'
  const sizeClass = size === 'sm' ? 'aqi-badge--sm' : size === 'lg' ? 'aqi-badge--lg' : ''

  return (
    <div
      className={`aqi-badge ${sizeClass}`}
      style={{ backgroundColor: category.bg, color: textColor }}
    >
      {showLabel && <span className="aqi-badge__label">{category.label}</span>}
      <span className="aqi-badge__value">{aqi}</span>
    </div>
  )
}

function getAqiCategory(aqi) {
  if (aqi <= 50) return { label: 'Good', bg: '#00b050' }
  if (aqi <= 100) return { label: 'Satisfactory', bg: '#92d050' }
  if (aqi <= 200) return { label: 'Moderate', bg: '#f0e600', textColor: '#333' }
  if (aqi <= 300) return { label: 'Poor', bg: '#ff9900' }
  if (aqi <= 400) return { label: 'Very Poor', bg: '#ff0000' }
  return { label: 'Severe', bg: '#7e0023' }
}
