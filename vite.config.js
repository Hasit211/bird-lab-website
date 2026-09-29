import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api/scholar-publications': {
          target: 'https://serpapi.com',
          changeOrigin: true,
          rewrite: (path) => {
            const match = path.match(/\?(.+)$/)
            const query = match ? '&' + match[1] : ''
            return `/search.json?engine=google_scholar_author&author_id=3KZSSEIAAAAJ&api_key=${env.SERPAPI_KEY}${query}`
          },
        },
      },
    },
  }
})