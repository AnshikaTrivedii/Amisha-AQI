import https from 'node:https'

const CPCB_FEED_URL = 'https://airquality.cpcb.gov.in/caaqms/rss_feed'
const CACHE_TTL_MS = 60 * 60 * 1000

let cachedLiveXml = null
let cacheTimestamp = 0

function fetchCpcbFeed() {
  return new Promise((resolve, reject) => {
    const request = https.get(
      CPCB_FEED_URL,
      {
        headers: {
          Accept: 'application/xml, text/xml, */*',
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept-Language': 'en-US,en;q=0.9',
        },
        timeout: 25000,
        rejectUnauthorized: false,
      },
      (response) => {
        if (response.statusCode && response.statusCode >= 400) {
          reject(new Error(`CPCB responded with ${response.statusCode}`))
          response.resume()
          return
        }

        const chunks = []
        response.on('data', (chunk) => chunks.push(chunk))
        response.on('end', () => {
          resolve(Buffer.concat(chunks).toString('utf8'))
        })
      },
    )

    request.on('timeout', () => {
      request.destroy(new Error('CPCB feed request timed out'))
    })
    request.on('error', reject)
  })
}

async function loadFallbackXml() {
  const baseUrl = process.env.URL || process.env.DEPLOY_PRIME_URL
  if (!baseUrl) {
    throw new Error('fallback URL unavailable')
  }

  const response = await fetch(`${baseUrl}/city_aqi.xml`, { cache: 'no-store' })
  if (!response.ok) {
    throw new Error(`fallback responded with ${response.status}`)
  }

  return response.text()
}

async function getAqiXml(forceRefresh = false) {
  const cacheValid = cachedLiveXml && Date.now() - cacheTimestamp < CACHE_TTL_MS
  if (!forceRefresh && cacheValid) {
    return cachedLiveXml
  }

  try {
    const xml = await fetchCpcbFeed()
    cachedLiveXml = xml
    cacheTimestamp = Date.now()
    return xml
  } catch (error) {
    if (cachedLiveXml) {
      return cachedLiveXml
    }

    if (forceRefresh) {
      throw error
    }

    return loadFallbackXml()
  }
}

export async function handler(event) {
  const refreshParam = event?.queryStringParameters?.refresh
  const forceRefresh = refreshParam === '1' || refreshParam === 'true'

  try {
    const body = await getAqiXml(forceRefresh)

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': forceRefresh ? 'no-store' : 'no-store',
        'Access-Control-Allow-Origin': '*',
      },
      body,
    }
  } catch (error) {
    return {
      statusCode: 502,
      headers: {
        'Cache-Control': 'no-store',
      },
      body: `CPCB feed unavailable: ${error.message}`,
    }
  }
}
