export const SIGNAGE_SIZE = 288

// Capture host size once, before viewport meta shrinks layout dimensions.
const initialHost = {
  width:
    window.screen?.width ||
    window.outerWidth ||
    window.innerWidth ||
    SIGNAGE_SIZE,
  height:
    window.screen?.height ||
    window.outerHeight ||
    window.innerHeight ||
    SIGNAGE_SIZE,
}

/**
 * Map the fixed 288×288 design canvas onto the host WebView via viewport meta.
 * Does not use CSS transform: scale().
 */
export function applySignageViewport() {
  const hostWidth = Math.max(
    initialHost.width,
    window.screen?.width || 0,
    window.outerWidth || 0,
  )
  const hostHeight = Math.max(
    initialHost.height,
    window.screen?.height || 0,
    window.outerHeight || 0,
  )

  const scale = Math.max(hostWidth / SIGNAGE_SIZE, hostHeight / SIGNAGE_SIZE)

  let meta = document.querySelector('meta[name="viewport"]')
  if (!meta) {
    meta = document.createElement('meta')
    meta.name = 'viewport'
    document.head.appendChild(meta)
  }

  meta.setAttribute(
    'content',
    `width=${SIGNAGE_SIZE}, height=${SIGNAGE_SIZE}, initial-scale=${scale}, minimum-scale=${scale}, maximum-scale=${scale}, user-scalable=no, viewport-fit=cover`,
  )
}
