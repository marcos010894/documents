// vite.config.ts
import { defineConfig } from "file:///C:/Users/Luiz%20Felippe/Desktop/Salexpress_frontEnd/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/Luiz%20Felippe/Desktop/Salexpress_frontEnd/node_modules/@vitejs/plugin-react/dist/index.mjs";
import { VitePWA } from "file:///C:/Users/Luiz%20Felippe/Desktop/Salexpress_frontEnd/node_modules/vite-plugin-pwa/dist/index.js";
var vite_config_default = defineConfig({
  server: {
    host: "0.0.0.0",
    // Isso permite que o servidor aceite conexões de qualquer endereço IP
    port: 3e3
    // Ou qualquer outra porta que você esteja usando
  },
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      // Atualiza automaticamente o SW
      includeAssets: ["favicon.svg", "robots.txt", "apple-touch-icon.png"],
      // Ícones
      manifest: {
        name: "Globallty APP",
        short_name: "Globallty APP",
        description: "Aplicativo pwa do sistema, globatty",
        theme_color: "#f18744",
        icons: [
          {
            src: "android-launchericon-192-192.png",
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: "android-launchericon-512-512.png",
            sizes: "512x512",
            type: "image/png"
          }
        ]
      }
    })
  ]
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxMdWl6IEZlbGlwcGVcXFxcRGVza3RvcFxcXFxnbG9iYWx0dHlfZnJvbnRFbmRcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXEx1aXogRmVsaXBwZVxcXFxEZXNrdG9wXFxcXGdsb2JhbHR0eV9mcm9udEVuZFxcXFx2aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvTHVpeiUyMEZlbGlwcGUvRGVza3RvcC9nbG9iYWx0dHlfZnJvbnRFbmQvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJ1xyXG5pbXBvcnQgcmVhY3QgZnJvbSAnQHZpdGVqcy9wbHVnaW4tcmVhY3QnXHJcbmltcG9ydCB7IFZpdGVQV0EgfSBmcm9tICd2aXRlLXBsdWdpbi1wd2EnXHJcblxyXG4vLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL1xyXG4vLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL1xyXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xyXG4gIHNlcnZlcjoge1xyXG4gICAgaG9zdDogJzAuMC4wLjAnLCAgLy8gSXNzbyBwZXJtaXRlIHF1ZSBvIHNlcnZpZG9yIGFjZWl0ZSBjb25leFx1MDBGNWVzIGRlIHF1YWxxdWVyIGVuZGVyZVx1MDBFN28gSVBcclxuICAgIHBvcnQ6IDMwMDAsICAgICAgICAvLyBPdSBxdWFscXVlciBvdXRyYSBwb3J0YSBxdWUgdm9jXHUwMEVBIGVzdGVqYSB1c2FuZG9cclxuICB9LFxyXG4gIHBsdWdpbnM6IFtcclxuICAgIHJlYWN0KCksXHJcbiAgICBWaXRlUFdBKHtcclxuICAgICAgcmVnaXN0ZXJUeXBlOiAnYXV0b1VwZGF0ZScsIC8vIEF0dWFsaXphIGF1dG9tYXRpY2FtZW50ZSBvIFNXXHJcbiAgICAgIGluY2x1ZGVBc3NldHM6IFsnZmF2aWNvbi5zdmcnLCAncm9ib3RzLnR4dCcsICdhcHBsZS10b3VjaC1pY29uLnBuZyddLCAvLyBcdTAwQ0Rjb25lc1xyXG4gICAgICBtYW5pZmVzdDoge1xyXG4gICAgICAgIG5hbWU6ICdHbG9iYWxsdHkgQVBQJyxcclxuICAgICAgICBzaG9ydF9uYW1lOiAnR2xvYmFsbHR5IEFQUCcsXHJcbiAgICAgICAgZGVzY3JpcHRpb246ICdBcGxpY2F0aXZvIHB3YSBkbyBzaXN0ZW1hLCBnbG9iYXR0eScsXHJcbiAgICAgICAgdGhlbWVfY29sb3I6ICcjZjE4NzQ0JyxcclxuICAgICAgICBpY29uczogW1xyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICBzcmM6ICdhbmRyb2lkLWxhdW5jaGVyaWNvbi0xOTItMTkyLnBuZycsXHJcbiAgICAgICAgICAgIHNpemVzOiAnMTkyeDE5MicsXHJcbiAgICAgICAgICAgIHR5cGU6ICdpbWFnZS9wbmcnXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICBzcmM6ICdhbmRyb2lkLWxhdW5jaGVyaWNvbi01MTItNTEyLnBuZycsXHJcbiAgICAgICAgICAgIHNpemVzOiAnNTEyeDUxMicsXHJcbiAgICAgICAgICAgIHR5cGU6ICdpbWFnZS9wbmcnXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgXVxyXG4gICAgICB9XHJcbiAgICB9KVxyXG4gIF1cclxufSkiXSwKICAibWFwcGluZ3MiOiAiO0FBQThVLFNBQVMsb0JBQW9CO0FBQzNXLE9BQU8sV0FBVztBQUNsQixTQUFTLGVBQWU7QUFJeEIsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsUUFBUTtBQUFBLElBQ04sTUFBTTtBQUFBO0FBQUEsSUFDTixNQUFNO0FBQUE7QUFBQSxFQUNSO0FBQUEsRUFDQSxTQUFTO0FBQUEsSUFDUCxNQUFNO0FBQUEsSUFDTixRQUFRO0FBQUEsTUFDTixjQUFjO0FBQUE7QUFBQSxNQUNkLGVBQWUsQ0FBQyxlQUFlLGNBQWMsc0JBQXNCO0FBQUE7QUFBQSxNQUNuRSxVQUFVO0FBQUEsUUFDUixNQUFNO0FBQUEsUUFDTixZQUFZO0FBQUEsUUFDWixhQUFhO0FBQUEsUUFDYixhQUFhO0FBQUEsUUFDYixPQUFPO0FBQUEsVUFDTDtBQUFBLFlBQ0UsS0FBSztBQUFBLFlBQ0wsT0FBTztBQUFBLFlBQ1AsTUFBTTtBQUFBLFVBQ1I7QUFBQSxVQUNBO0FBQUEsWUFDRSxLQUFLO0FBQUEsWUFDTCxPQUFPO0FBQUEsWUFDUCxNQUFNO0FBQUEsVUFDUjtBQUFBLFFBQ0Y7QUFBQSxNQUNGO0FBQUEsSUFDRixDQUFDO0FBQUEsRUFDSDtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
