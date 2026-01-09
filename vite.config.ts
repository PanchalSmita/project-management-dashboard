import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/github-token': {
        target: 'https://github.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api\/github-token/, '/login/oauth/access_token'),
      },
    },
  },
})
