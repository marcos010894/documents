import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: '0.0.0.0',  // Isso permite que o servidor aceite conexões de qualquer endereço IP
    port: 3000,        // Ou qualquer outra porta que você esteja usando
  },
  plugins: [
    react(),
    VitePWA({
      workbox: {
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024 // 10 MB
      },
      registerType: 'autoUpdate', // Atualiza automaticamente o SW
      includeAssets: ['favicon.svg', 'robots.txt', 'apple-touch-icon.png'], // Ícones
      manifest: {
        name: 'Globallty APP',
        short_name: 'Globallty APP',
        description: 'Aplicativo pwa do sistema, globatty',
        theme_color: '#f18744',
        icons: [
          {
            src: 'android-launchericon-192-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'android-launchericon-512-512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ]
})