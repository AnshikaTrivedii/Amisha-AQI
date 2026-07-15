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

function parseIsoLocal(isoDate) {
  const [year, month, day] = isoDate.split('-').map(Number)
  return new Date(year, month - 1, day)
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

/**
 * Returns the last `limit` calendar days ending at the latest stored reading
 * (or today). Missing days are included as placeholders instead of
 * duplicating neighboring days.
 */
export function getAqiHistory(cityName, limit = 3) {
  const key = storageKey(cityName)
  const stored = JSON.parse(localStorage.getItem(key) || '{}')
  const dates = Object.keys(stored).sort((a, b) => a.localeCompare(b))

  const endDate = dates.length
    ? parseIsoLocal(dates[dates.length - 1])
    : new Date()

  const items = []
  for (let offset = limit - 1; offset >= 0; offset -= 1) {
    const day = new Date(endDate)
    day.setDate(endDate.getDate() - offset)
    const iso = localIsoDate(day)
    const hasReading = Object.prototype.hasOwnProperty.call(stored, iso)

    items.push({
      date: formatHistoryDate(iso),
      aqi: hasReading ? stored[iso] : '--',
      missing: !hasReading,
    })
  }

  return items
}
