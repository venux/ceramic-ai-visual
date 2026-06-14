import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  base: '/ceramic/',
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    proxy: {
      '/ceramic/api': {
        target: 'http://localhost:3400/api',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/ceramic\/api/, ''),
      },
    },
  },
})
