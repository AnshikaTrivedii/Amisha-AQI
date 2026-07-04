export function getAqiCategory(aqi) {
  if (aqi <= 50) return { label: 'Good', color: '#00b050', bg: '#00b050' }
  if (aqi <= 100) return { label: 'Satisfactory', color: '#92d050', bg: '#92d050' }
  if (aqi <= 200) return { label: 'Moderate', color: '#ffff00', bg: '#f0e600', textColor: '#333' }
  if (aqi <= 300) return { label: 'Poor', color: '#ff9900', bg: '#ff9900' }
  if (aqi <= 400) return { label: 'Very Poor', color: '#ff0000', bg: '#ff0000' }
  return { label: 'Severe', color: '#7e0023', bg: '#7e0023' }
}

export function getHealthImpact(aqi) {
  if (aqi <= 50)
    return 'The air quality is good. Minimal impact on health.'
  if (aqi <= 100)
    return 'The air quality is satisfactory with minor breathing discomfort to sensitive people.'
  if (aqi <= 200)
    return 'The air quality is acceptable. However, there may be a moderate health concern for a very small number of people.'
  if (aqi <= 300)
    return 'The air quality may cause breathing discomfort to people with lung, heart disease, children and older adults.'
  if (aqi <= 400)
    return 'The air quality may cause respiratory illness on prolonged exposure. Effect may be more pronounced in people with lung and heart diseases.'
  return 'The air quality may cause respiratory effects even on healthy people, and serious health impacts on people with lung/heart disease.'
}

