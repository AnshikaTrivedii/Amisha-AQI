function storageKey(cityName) {
  return `aqi-history-${cityName.toLowerCase()}`
}

function formatHistoryDate(isoDate) {
  const [, month, day] = isoDate.split('-')
  return `${parseInt(day, 10)}/${parseInt(month, 10)}`
}

function localIsoDate(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/** Convert CPCB date "04-07-2026 11:00:00" to "2026-07-04". */
export function toReadingIsoDate(dateStr) {
  if (!dateStr) return localIsoDate()
  const [datePart] = dateStr.split(' ')
  const [day, month, year] = datePart.split('-')
  if (!day || !month || !year) return localIsoDate()
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
}

export function recordAqiReading(cityName, aqi, readingDate) {
  const key = storageKey(cityName)
  const stored = JSON.parse(localStorage.getItem(key) || '{}')
  const dayKey = readingDate || localIsoDate()
  stored[dayKey] = aqi
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
