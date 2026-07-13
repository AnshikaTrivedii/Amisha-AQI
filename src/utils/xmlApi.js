const DEFAULT_CITY = 'Lucknow'
const AQI_API_URL = '/api/aqi'
const CACHE_TTL_MS = 60 * 60 * 1000
const API_TIMEOUT_MS = 30000

let cachedXmlText = null
let cacheTimestamp = 0
let cachedFeedTimestamp = null
let cachedBackendResponseAt = null

function formatLastUpdated(dateStr) {
  if (!dateStr) return ''
  const [datePart, timePart] = dateStr.split(' ')
  const [day, month, year] = datePart.split('-')
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const [h, m] = timePart.split(':')
  let hour = parseInt(h, 10)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  hour = hour % 12 || 12
  return `${day} ${months[parseInt(month, 10) - 1]} ${year} ${String(hour).padStart(2, '0')}:${m} ${ampm}`
}

function parseApiDate(dateStr) {
  if (!dateStr) return null
  const [datePart, timePart] = dateStr.split(' ')
  const [day, month, year] = datePart.split('-').map(Number)
  const [h, m, s] = timePart.split(':').map(Number)
  return new Date(year, month - 1, day, h, m, s || 0)
}

function getLatestUpdate(stations) {
  return stations
    .map((s) => s.lastUpdated)
    .filter(Boolean)
    .reduce((latest, current) => {
      if (!latest) return current
      return parseApiDate(current) > parseApiDate(latest) ? current : latest
    }, '')
}

function extractLatestFeedTimestamp(xmlText) {
  const matches = [...xmlText.matchAll(/lastupdate="([^"]+)"/g)]
  if (!matches.length) return null

  return matches.reduce((latest, match) => {
    const timestamp = match[1]
    if (!latest) return timestamp
    return parseApiDate(timestamp) > parseApiDate(latest) ? timestamp : latest
  }, null)
}

function logAqiDataFlow(event) {
  console.log('[AQI DATA]', JSON.stringify(event))
}

function parseStationElement(el, index) {
  const stationId = el.getAttribute('id') || ''
  const dashIdx = stationId.lastIndexOf(' - ')
  const name = dashIdx >= 0 ? stationId.slice(0, dashIdx) : stationId
  const agency = dashIdx >= 0 ? stationId.slice(dashIdx + 3) : ''
  const aqiEl = el.querySelector('Air_Quality_Index')
  const aqi = parseInt(aqiEl?.getAttribute('Value') || '0', 10)

  return {
    id: index + 1,
    name,
    agency,
    aqi,
    lat: parseFloat(el.getAttribute('latitude')),
    lng: parseFloat(el.getAttribute('longitude')),
    lastUpdated: el.getAttribute('lastupdate'),
    predominantParameter: aqiEl?.getAttribute('Predominant_Parameter') || '',
    offline: false,
  }
}

function buildCityData(cityName, stations) {
  const onlineStations = stations.filter((s) => !s.offline)
  const validAqis = onlineStations.map((s) => s.aqi).filter((a) => !Number.isNaN(a) && a > 0)
  const avgAqi = validAqis.length
    ? Math.round(validAqis.reduce((sum, a) => sum + a, 0) / validAqis.length)
    : 0

  const geoStations = onlineStations.length ? onlineStations : stations
  const lat = geoStations.reduce((sum, s) => sum + s.lat, 0) / geoStations.length
  const lng = geoStations.reduce((sum, s) => sum + s.lng, 0) / geoStations.length

  const latestUpdate = getLatestUpdate(onlineStations)

  return {
    name: cityName,
    aqi: avgAqi,
    lastUpdated: formatLastUpdated(latestUpdate),
    lastUpdatedRaw: latestUpdate,
    lat,
    lng,
    history: [],
    activeStations: onlineStations.length,
    totalStations: stations.length,
  }
}

async function fetchWithTimeout(url, options = {}, timeoutMs = 5000) {
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
      cache: 'no-store',
    })
  } finally {
    clearTimeout(id)
  }
}

async function fetchXmlText(forceRefresh = false) {
  const now = Date.now()
  const cacheValid = cachedXmlText && now - cacheTimestamp < CACHE_TTL_MS

  if (!forceRefresh && cacheValid) {
    logAqiDataFlow({
      stage: 'client-cache-hit',
      feedTimestamp: cachedFeedTimestamp,
      backendResponseAt: cachedBackendResponseAt,
      frontendReceivedAt: new Date(now).toISOString(),
      forceRefresh,
    })
    return cachedXmlText
  }

  const apiUrl = forceRefresh
    ? `${AQI_API_URL}?refresh=1&_=${now}`
    : AQI_API_URL

  try {
    const response = await fetchWithTimeout(apiUrl, {}, API_TIMEOUT_MS)
    if (!response.ok) {
      throw new Error(`Failed to load AQI data (${response.status})`)
    }

    const xmlText = await response.text()
    const frontendReceivedAt = new Date().toISOString()
    const backendFeedTimestamp = response.headers.get('X-Feed-Timestamp') || null
    const backendResponseAt = response.headers.get('X-Response-At') || null
    const backendSource = response.headers.get('X-Data-Source') || null
    const parsedFeedTimestamp = extractLatestFeedTimestamp(xmlText)

    cachedXmlText = xmlText
    cacheTimestamp = Date.now()
    cachedFeedTimestamp = backendFeedTimestamp || parsedFeedTimestamp
    cachedBackendResponseAt = backendResponseAt

    logAqiDataFlow({
      stage: 'api-response',
      source: backendSource,
      feedTimestamp: cachedFeedTimestamp,
      parsedFeedTimestamp,
      backendResponseAt,
      frontendReceivedAt,
      forceRefresh,
    })

    return xmlText
  } catch (err) {
    if (!forceRefresh && cacheValid && cachedXmlText) {
      logAqiDataFlow({
        stage: 'client-cache-fallback-on-error',
        feedTimestamp: cachedFeedTimestamp,
        backendResponseAt: cachedBackendResponseAt,
        frontendReceivedAt: new Date().toISOString(),
        forceRefresh,
        error: err.message,
      })
      return cachedXmlText
    }

    logAqiDataFlow({
      stage: 'fetch-error',
      feedTimestamp: cachedFeedTimestamp,
      backendResponseAt: cachedBackendResponseAt,
      frontendReceivedAt: new Date().toISOString(),
      forceRefresh,
      error: err.message,
    })
    throw err
  }
}

export function parseAqiXml(xmlText, cityName = DEFAULT_CITY) {
  const doc = new DOMParser().parseFromString(xmlText, 'text/xml')
  const cityEl = [...doc.querySelectorAll('City')].find((c) => c.getAttribute('id') === cityName)

  if (!cityEl) {
    throw new Error(`City "${cityName}" not found in AQI data`)
  }

  const stations = [...cityEl.querySelectorAll('Station')].map(parseStationElement)
  const cityData = buildCityData(cityName, stations)

  return { cityData, stations }
}

export async function getAllCities(forceRefresh = false) {
  const xmlText = await fetchXmlText(forceRefresh)
  const doc = new DOMParser().parseFromString(xmlText, 'text/xml')

  return [...doc.querySelectorAll('City')]
    .map((c) => c.getAttribute('id'))
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b))
}

export async function fetchAqiData(cityName = DEFAULT_CITY, forceRefresh = false) {
  const xmlText = await fetchXmlText(forceRefresh)
  const result = parseAqiXml(xmlText, cityName)

  logAqiDataFlow({
    stage: 'parsed-city-data',
    city: cityName,
    feedTimestamp: cachedFeedTimestamp,
    displayedTimestamp: result.cityData.lastUpdatedRaw,
    displayedAqi: result.cityData.aqi,
    backendResponseAt: cachedBackendResponseAt,
    frontendReceivedAt: new Date().toISOString(),
    forceRefresh,
  })

  return result
}

export { DEFAULT_CITY }
