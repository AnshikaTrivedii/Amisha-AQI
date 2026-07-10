const DEFAULT_CITY = 'Lucknow'
const AQI_API_URL = '/api/aqi'
const SUPPLEMENT_URL = '/city_aqi.xml'
const CACHE_TTL_MS = 20 * 60 * 1000

let cachedXmlText = null
let cacheTimestamp = 0
let cachedSupplementXml = null

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

function stationKey(name, agency) {
  return `${name} - ${agency}`.toLowerCase()
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

function mergeStations(liveStations, supplementStations) {
  const liveKeys = new Set(liveStations.map((s) => stationKey(s.name, s.agency)))
  const missing = supplementStations
    .filter((s) => !liveKeys.has(stationKey(s.name, s.agency)))
    .map((s) => ({ ...s, offline: true }))

  return [...liveStations, ...missing].map((station, index) => ({
    ...station,
    id: index + 1,
  }))
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
    })
  } finally {
    clearTimeout(id)
  }
}

async function fetchXmlText(forceRefresh = false) {
  const cacheValid = cachedXmlText && Date.now() - cacheTimestamp < CACHE_TTL_MS
  if (!forceRefresh && cacheValid) {
    return cachedXmlText
  }

  const apiUrl = forceRefresh ? `${AQI_API_URL}?refresh=1` : AQI_API_URL
  const sources = [apiUrl, SUPPLEMENT_URL]
  let lastError = null

  for (const url of sources) {
    try {
      const isApi = url.startsWith(AQI_API_URL)
      const response = await fetchWithTimeout(url, {}, isApi ? 5000 : 3000)
      if (!response.ok) {
        lastError = new Error(`Failed to load AQI data (${response.status})`)
        continue
      }
      cachedXmlText = await response.text()
      cacheTimestamp = Date.now()
      return cachedXmlText
    } catch (err) {
      lastError = err
    }
  }

  throw lastError || new Error('Failed to load AQI data from CPCB')
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

async function fetchSupplementXml() {
  if (cachedSupplementXml) {
    return cachedSupplementXml
  }

  try {
    const response = await fetchWithTimeout(SUPPLEMENT_URL, {}, 3000)
    if (response.ok) {
      cachedSupplementXml = await response.text()
    }
  } catch {
    // Supplement feed is optional.
  }

  return cachedSupplementXml
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

  const supplementXml = await fetchSupplementXml()
  if (!supplementXml) {
    return result
  }

  try {
    const supplement = parseAqiXml(supplementXml, cityName)
    const stations = mergeStations(result.stations, supplement.stations)
    return {
      cityData: buildCityData(cityName, stations),
      stations,
    }
  } catch {
    return result
  }
}

export { DEFAULT_CITY }
