export const SIGNAGE_WIDTH = 288
export const SIGNAGE_HEIGHT = 240

export function applySignageViewport() {
  let meta = document.querySelector('meta[name="viewport"]')
  if (!meta) {
    meta = document.createElement('meta')
    meta.name = 'viewport'
    document.head.appendChild(meta)
  }

  meta.setAttribute(
    'content',
    `width=${SIGNAGE_WIDTH}, height=${SIGNAGE_HEIGHT}, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover`,
  )
}
