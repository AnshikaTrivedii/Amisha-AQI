import { getAqiCategory } from '../utils/aqi'

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
