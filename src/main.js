// ========================================
// POINT D'ENTRÉE PRINCIPAL DE L'APPLICATION
// ========================================
// Ce fichier initialise l'application Vue.js et configure les plugins
// Fonctionnalités :
// - Création de l'instance Vue
// - Configuration de Pinia pour la gestion d'état
// - Montage de l'application sur l'élément #app

import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

const app = createApp(App)

app.use(createPinia())

app.mount('#app')
