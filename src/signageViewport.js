export const SIGNAGE_SIZE = 288

export function applySignageViewport() {
  const width =
    window.screen?.width ||
    document.documentElement.clientWidth ||
    window.innerWidth ||
    SIGNAGE_SIZE
  const height =
    window.screen?.height ||
    document.documentElement.clientHeight ||
    window.innerHeight ||
    SIGNAGE_SIZE
  const scale = Math.max(width / SIGNAGE_SIZE, height / SIGNAGE_SIZE)

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
