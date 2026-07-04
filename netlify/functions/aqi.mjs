import https from 'node:https'

const CPCB_FEED_URL = 'https://airquality.cpcb.gov.in/caaqms/rss_feed'

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

export async function handler() {
  try {
    const body = await fetchCpcbFeed()

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=300',
        'Access-Control-Allow-Origin': '*',
      },
      body,
    }
  } catch (error) {
    return {
      statusCode: 502,
      body: `CPCB feed unavailable: ${error.message}`,
    }
  }
}
