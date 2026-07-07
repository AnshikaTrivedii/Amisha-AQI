const AQI_SUMMARY_THEMES = [
  {
    max: 50,
    label: 'Good',
    primary: '#00C853',
    secondary: '#66BB6A',
    gradient: 'linear-gradient(180deg, #66BB6A 0%, #00C853 100%)',
  },
  {
    max: 100,
    label: 'Satisfactory',
    primary: '#8BC34A',
    secondary: '#AED581',
    gradient: 'linear-gradient(180deg, #AED581 0%, #8BC34A 100%)',
  },
  {
    max: 200,
    label: 'Moderate',
    primary: '#FFC107',
    secondary: '#FFD54F',
    gradient: 'linear-gradient(180deg, #FFD54F 0%, #FFC107 100%)',
  },
  {
    max: 300,
    label: 'Poor',
    primary: '#FF9800',
    secondary: '#FFB74D',
    gradient: 'linear-gradient(180deg, #FFB74D 0%, #FF9800 100%)',
  },
  {
    max: 400,
    label: 'Very Poor',
    primary: '#F44336',
    secondary: '#EF5350',
    gradient: 'linear-gradient(180deg, #EF5350 0%, #F44336 100%)',
  },
  {
    max: Infinity,
    label: 'Severe',
    primary: '#7B1FA2',
    secondary: '#AB47BC',
    gradient: 'linear-gradient(180deg, #AB47BC 0%, #7B1FA2 100%)',
  },
]

export function getAqiCategory(aqi) {
  if (aqi <= 50) return { label: 'Good', color: '#00b050', bg: '#00b050' }
  if (aqi <= 100) return { label: 'Satisfactory', color: '#92d050', bg: '#92d050' }
  if (aqi <= 200) return { label: 'Moderate', color: '#ffff00', bg: '#f0e600', textColor: '#333' }
  if (aqi <= 300) return { label: 'Poor', color: '#ff9900', bg: '#ff9900' }
  if (aqi <= 400) return { label: 'Very Poor', color: '#ff0000', bg: '#ff0000' }
  return { label: 'Severe', color: '#7e0023', bg: '#7e0023' }
}

export function getAqiSummaryTheme(aqi) {
  const value = Number(aqi) || 0
  const theme = AQI_SUMMARY_THEMES.find((entry) => value <= entry.max) ?? AQI_SUMMARY_THEMES[AQI_SUMMARY_THEMES.length - 1]

  return {
    label: theme.label,
    primary: theme.primary,
    secondary: theme.secondary,
    gradient: theme.gradient,
    decorative: theme.secondary,
  }
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

