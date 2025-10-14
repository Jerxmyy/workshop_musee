// ========================================
// CONFIGURATION VITE - BUNDLER ET SERVEUR DE DÉVELOPPEMENT
// ========================================
// Configuration du bundler Vite pour le projet
// Fonctionnalités :
// - Support Vue.js avec plugin dédié
// - Outils de développement Vue (DevTools)
// - Alias @ pour les imports depuis src/
// - Hot reload en développement

import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), vueDevTools()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
