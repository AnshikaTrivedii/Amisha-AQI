const CPCB_FEED_URL = 'https://airquality.cpcb.gov.in/caaqms/rss_feed'

export async function handler() {
  try {
    const response = await fetch(CPCB_FEED_URL, {
      headers: { Accept: 'application/xml, text/xml, */*' },
    })

    if (!response.ok) {
      return {
        statusCode: response.status,
        body: `Failed to fetch CPCB feed (${response.status})`,
      }
    }

    const body = await response.text()

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
