// ========================================
// CONFIGURATION ESLINT - QUALITÉ DU CODE
// ========================================
// Configuration du linter pour maintenir la qualité du code
// Fonctionnalités :
// - Règles JavaScript et Vue.js
// - Support des modules ES6
// - Intégration avec Prettier
// - Exclusions des dossiers de build
// - Configuration pour navigateur

import { defineConfig, globalIgnores } from 'eslint/config'
import globals from 'globals'
import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting'

export default defineConfig([
  {
    name: 'app/files-to-lint',
    files: ['**/*.{js,mjs,jsx,vue}'],
  },

  globalIgnores(['**/dist/**', '**/dist-ssr/**', '**/coverage/**']),

  {
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
  },

  js.configs.recommended,
  ...pluginVue.configs['flat/essential'],
  skipFormatting,
])
