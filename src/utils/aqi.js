const AQI_SCALE = [
  {
    max: 50,
    label: 'Good',
    primary: '#00B050',
    secondary: '#33C773',
  },
  {
    max: 100,
    label: 'Satisfactory',
    primary: '#92D050',
    secondary: '#B8E07A',
  },
  {
    max: 200,
    label: 'Moderate',
    primary: '#FFFF00',
    secondary: '#FFFF66',
    textColor: '#111111',
  },
  {
    max: 300,
    label: 'Poor',
    primary: '#FF9900',
    secondary: '#FFB84D',
  },
  {
    max: 400,
    label: 'Very Poor',
    primary: '#FF0000',
    secondary: '#FF4D4D',
  },
  {
    max: Infinity,
    label: 'Severe',
    primary: '#7E0023',
    secondary: '#A8283A',
  },
]

function resolveAqiScaleEntry(aqi) {
  const value = Number(aqi) || 0
  return AQI_SCALE.find((entry) => value <= entry.max) ?? AQI_SCALE[AQI_SCALE.length - 1]
}

function buildAqiGradient(primary, secondary) {
  return `linear-gradient(180deg, ${secondary} 0%, ${primary} 100%)`
}

export function getAqiCategory(aqi) {
  const entry = resolveAqiScaleEntry(aqi)

  return {
    label: entry.label,
    color: entry.primary,
    bg: entry.primary,
    ...(entry.textColor ? { textColor: entry.textColor } : {}),
  }
}

export function getAqiSummaryTheme(aqi) {
  const entry = resolveAqiScaleEntry(aqi)

  return {
    label: entry.label,
    primary: entry.primary,
    secondary: entry.secondary,
    gradient: buildAqiGradient(entry.primary, entry.secondary),
    decorative: entry.secondary,
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
