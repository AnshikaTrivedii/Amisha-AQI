import express from 'express'
import fs from 'node:fs/promises'
import https from 'node:https'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const CPCB_FEED_URL = 'https://airquality.cpcb.gov.in/caaqms/rss_feed'
const CACHE_TTL_MS = 60 * 60 * 1000
const PORT = Number(process.env.PORT) || 3000

let cachedLiveXml = null
let cacheTimestamp = 0
let lastLiveFetchAt = 0
let lastLiveError = null
let lastServedSource = 'none'

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
  const fallbackPath = path.join(__dirname, 'public', 'city_aqi.xml')
  return fs.readFile(fallbackPath, 'utf8')
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
    lastLiveFetchAt = Date.now()
    lastLiveError = null
    lastServedSource = 'live'
    return xml
  } catch (error) {
    lastLiveError = error.message

    if (cachedLiveXml) {
      lastServedSource = 'cache'
      return cachedLiveXml
    }

    if (forceRefresh) {
      throw error
    }

    lastServedSource = 'fallback'
    return loadFallbackXml()
  }
}

const app = express()
const distPath = path.join(__dirname, 'dist')

app.get('/api/aqi', async (req, res) => {
  try {
    const forceRefresh = req.query.refresh === '1' || req.query.refresh === 'true'
    const xml = await getAqiXml(forceRefresh)

    res.set({
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'no-store',
    })
    res.send(xml)
  } catch (error) {
    res.status(502).send(`CPCB feed unavailable: ${error.message}`)
  }
})

app.get('/api/health', (_req, res) => {
  res.set('Cache-Control', 'no-store')
  res.json({
    status: 'ok',
    cpcbUrl: CPCB_FEED_URL,
    lastServedSource,
    lastLiveFetchAt: lastLiveFetchAt ? new Date(lastLiveFetchAt).toISOString() : null,
    liveDataReachable: Boolean(cachedLiveXml),
    lastLiveError,
    serverTime: new Date().toISOString(),
  })
})

app.use(express.static(distPath))

app.get(/^(?!\/api\/).*/, (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'))
})

app.listen(PORT, () => {
  console.log(`AQI server running on http://localhost:${PORT}`)
})
