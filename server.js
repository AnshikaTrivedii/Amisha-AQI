import express from 'express'
import https from 'node:https'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const CPCB_FEED_URL = 'https://airquality.cpcb.gov.in/caaqms/rss_feed'
const CACHE_TTL_MS = 60 * 60 * 1000
const PORT = Number(process.env.PORT) || 3000

let cachedLiveXml = null
let cacheTimestamp = 0
let cachedFeedTimestamp = null
let lastLiveFetchAt = 0
let lastLiveError = null
let lastServedSource = 'none'

function parseFeedDate(dateStr) {
  if (!dateStr) return null
  const [datePart, timePart] = dateStr.split(' ')
  const [day, month, year] = datePart.split('-').map(Number)
  const [h, m, s] = timePart.split(':').map(Number)
  return new Date(year, month - 1, day, h, m, s || 0)
}

function extractLatestFeedTimestamp(xml) {
  const matches = [...xml.matchAll(/lastupdate="([^"]+)"/g)]
  if (!matches.length) return null

  return matches.reduce((latest, match) => {
    const timestamp = match[1]
    if (!latest) return timestamp
    return parseFeedDate(timestamp) > parseFeedDate(latest) ? timestamp : latest
  }, null)
}

function isCacheValid(now = Date.now()) {
  return Boolean(cachedLiveXml) && now - cacheTimestamp < CACHE_TTL_MS
}

function logAqiEvent(event) {
  console.log('[AQI API]', JSON.stringify(event))
}

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

async function getAqiXml(forceRefresh = false) {
  const responseAt = Date.now()

  if (!forceRefresh && isCacheValid(responseAt)) {
    lastServedSource = 'cache'
    logAqiEvent({
      action: 'serve',
      source: 'cache',
      feedTimestamp: cachedFeedTimestamp,
      feedFetchedAt: new Date(cacheTimestamp).toISOString(),
      responseAt: new Date(responseAt).toISOString(),
      cacheAgeMs: responseAt - cacheTimestamp,
      forceRefresh,
    })

    return {
      xml: cachedLiveXml,
      source: 'cache',
      feedTimestamp: cachedFeedTimestamp,
      fetchedAt: cacheTimestamp,
      responseAt,
    }
  }

  try {
    const xml = await fetchCpcbFeed()
    const feedTimestamp = extractLatestFeedTimestamp(xml)
    const fetchedAt = Date.now()

    cachedLiveXml = xml
    cacheTimestamp = fetchedAt
    cachedFeedTimestamp = feedTimestamp
    lastLiveFetchAt = fetchedAt
    lastLiveError = null
    lastServedSource = 'live'

    logAqiEvent({
      action: 'fetch',
      source: 'live',
      feedTimestamp,
      feedFetchedAt: new Date(fetchedAt).toISOString(),
      responseAt: new Date(responseAt).toISOString(),
      forceRefresh,
    })

    return {
      xml,
      source: 'live',
      feedTimestamp,
      fetchedAt,
      responseAt,
    }
  } catch (error) {
    lastLiveError = error.message

    if (forceRefresh) {
      logAqiEvent({
        action: 'error',
        source: 'none',
        feedTimestamp: cachedFeedTimestamp,
        feedFetchedAt: cacheTimestamp ? new Date(cacheTimestamp).toISOString() : null,
        responseAt: new Date(responseAt).toISOString(),
        forceRefresh,
        error: error.message,
      })
      throw error
    }

    if (isCacheValid(responseAt)) {
      lastServedSource = 'cache'
      logAqiEvent({
        action: 'serve',
        source: 'cache-on-fetch-error',
        feedTimestamp: cachedFeedTimestamp,
        feedFetchedAt: new Date(cacheTimestamp).toISOString(),
        responseAt: new Date(responseAt).toISOString(),
        cacheAgeMs: responseAt - cacheTimestamp,
        forceRefresh,
        error: error.message,
      })

      return {
        xml: cachedLiveXml,
        source: 'cache',
        feedTimestamp: cachedFeedTimestamp,
        fetchedAt: cacheTimestamp,
        responseAt,
      }
    }

    logAqiEvent({
      action: 'error',
      source: 'none',
      feedTimestamp: null,
      feedFetchedAt: null,
      responseAt: new Date(responseAt).toISOString(),
      forceRefresh,
      error: error.message,
    })
    throw error
  }
}

const app = express()
const distPath = path.join(__dirname, 'dist')

app.get('/api/aqi', async (req, res) => {
  const forceRefresh = req.query.refresh === '1' || req.query.refresh === 'true'

  try {
    const result = await getAqiXml(forceRefresh)

    res.set({
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'X-Data-Source': result.source,
      'X-Feed-Timestamp': result.feedTimestamp || '',
      'X-Feed-Fetched-At': result.fetchedAt
        ? new Date(result.fetchedAt).toISOString()
        : '',
      'X-Response-At': new Date(result.responseAt).toISOString(),
    })
    res.send(result.xml)
  } catch (error) {
    res.status(502).send(`CPCB feed unavailable: ${error.message}`)
  }
})

app.get('/api/health', (_req, res) => {
  const now = Date.now()
  const cacheValid = isCacheValid(now)

  res.set('Cache-Control', 'no-store')
  res.json({
    status: 'ok',
    cpcbUrl: CPCB_FEED_URL,
    cacheTtlMs: CACHE_TTL_MS,
    lastServedSource,
    liveDataReachable: Boolean(cachedLiveXml),
    cacheValid,
    feedTimestamp: cachedFeedTimestamp,
    lastLiveFetchAt: lastLiveFetchAt ? new Date(lastLiveFetchAt).toISOString() : null,
    cacheExpiresAt: cacheTimestamp
      ? new Date(cacheTimestamp + CACHE_TTL_MS).toISOString()
      : null,
    cacheAgeMs: cacheTimestamp ? now - cacheTimestamp : null,
    lastLiveError,
    serverTime: new Date(now).toISOString(),
  })
})

app.use(express.static(distPath, {
  setHeaders(res, filePath) {
    if (filePath.endsWith('index.html') || filePath.endsWith('city_aqi.xml')) {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate')
      res.setHeader('Pragma', 'no-cache')
      res.setHeader('Expires', '0')
    }
  },
}))

app.get(/^(?!\/api\/).*/, (_req, res) => {
  res.set({
    'Cache-Control': 'no-store, no-cache, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
  })
  res.sendFile(path.join(distPath, 'index.html'))
})

app.listen(PORT, () => {
  console.log(`AQI server running on http://localhost:${PORT}`)
})
