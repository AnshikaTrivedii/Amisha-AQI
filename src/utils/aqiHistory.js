function storageKey(cityName) {
  return `aqi-history-${cityName.toLowerCase()}`
}

function formatHistoryDate(isoDate) {
  const [, month, day] = isoDate.split('-')
  return `${parseInt(day, 10)}/${parseInt(month, 10)}`
}

export function recordAqiReading(cityName, aqi) {
  const key = storageKey(cityName)
  const stored = JSON.parse(localStorage.getItem(key) || '{}')
  const today = new Date().toISOString().slice(0, 10)
  stored[today] = aqi
  localStorage.setItem(key, JSON.stringify(stored))
}

export function getAqiHistory(cityName, limit = 3) {
  const key = storageKey(cityName)
  const stored = JSON.parse(localStorage.getItem(key) || '{}')

  return Object.entries(stored)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-limit)
    .map(([isoDate, aqi]) => ({
      date: formatHistoryDate(isoDate),
      aqi,
    }))
}
