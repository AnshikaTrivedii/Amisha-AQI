import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const cpcbProxy = {
  '/api/aqi': {
    target: 'https://airquality.cpcb.gov.in',
    changeOrigin: true,
    secure: false,
    rewrite: () => '/caaqms/rss_feed',
  },
}

export default defineConfig({
  plugins: [react()],
  server: { proxy: cpcbProxy },
  preview: { proxy: cpcbProxy },
})
