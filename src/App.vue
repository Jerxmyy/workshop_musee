<script setup>
import { onMounted, ref, toRefs, computed, toRaw } from 'vue'
import { useMuseumStore } from './stores/museumStore.js'
import SearchPanel from './components/SearchPanel.vue'
import ResultsPanel from './components/ResultsPanel.vue'
import MuseumDetail from './components/MuseumDetail.vue'
import MapView from './components/MapView.vue'
import FavoritesPage from './components/FavoritesPage.vue'

const museumStore = useMuseumStore()
const currentView = ref('search') // 'search', 'favorites', 'detail'

// Extraire les propriétés réactives du store
const { isLoading, searchError, facets } = toRefs(museumStore)

// Pour searchResults, utilisons une computed pour s'assurer de la réactivité et convertir les Proxy
const searchResults = computed(() => {
  console.log('🎯 App - searchResults computed:', museumStore.searchResults)
  console.log('🎯 App - searchResults length:', museumStore.searchResults?.length)

  // Convertir les objets Proxy en objets JavaScript normaux
  const rawResults = toRaw(museumStore.searchResults)
  console.log('🎯 App - rawResults:', rawResults)
  console.log('🎯 App - rawResults length:', rawResults?.length)

  return rawResults || []
})

const handleSearch = async (searchParams) => {
  try {
    await museumStore.searchMuseums(searchParams)
    currentView.value = 'search'
  } catch (error) {
    console.error('Erreur lors de la recherche:', error)
  }
}

const handleMuseumSelect = (museum) => {
  museumStore.selectMuseum(museum)
  currentView.value = 'detail'
}

const handleBackToList = () => {
  museumStore.clearSelection()
  currentView.value = 'search'
}

const showFavorites = () => {
  currentView.value = 'favorites'
}

const handleBackToSearch = () => {
  currentView.value = 'search'
}

const handleToggleFavorite = (museum) => {
  museumStore.toggleFavorite(museum)
}

// Chargement initial des facettes et des favoris
onMounted(async () => {
  try {
    await museumStore.loadFacets()
    museumStore.loadFavorites()
  } catch (error) {
    console.error('Erreur lors du chargement initial:', error)
  }
})
</script>

<template>
  <div class="app-container">
    <!-- Panneau de recherche -->
    <div class="search-section">
      <SearchPanel
        @search="handleSearch"
        :isLoading="isLoading"
        :facets="facets"
        @show-favorites="showFavorites"
        :favorites-count="museumStore.favoriteMuseums.length"
      />
    </div>

    <!-- Panneau principal -->
    <div class="main-section">
      <!-- Vue de recherche -->
      <div v-if="currentView === 'search'" class="results-container">
        <ResultsPanel
          :results="searchResults"
          :isLoading="isLoading"
          :error="searchError"
          @museum-select="handleMuseumSelect"
          @toggle-favorite="handleToggleFavorite"
        />
      </div>

      <!-- Vue des favoris -->
      <div v-else-if="currentView === 'favorites'" class="favorites-container">
        <FavoritesPage @back="handleBackToSearch" @museum-select="handleMuseumSelect" />
      </div>

      <!-- Vue détail du musée -->
      <div v-else-if="currentView === 'detail'" class="detail-container full-width">
        <MuseumDetail :museum="museumStore.selectedMuseum" @back="handleBackToList" />
      </div>
    </div>

    <!-- Carte (visible sur desktop) -->
    <div v-if="currentView === 'search'" class="map-section">
      <MapView
        :museums="searchResults"
        :selectedMuseum="museumStore.selectedMuseum"
        @museum-select="handleMuseumSelect"
      />
    </div>
  </div>
</template>

<style scoped>
.app-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: auto 1fr;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}

.search-section {
  grid-column: 1 / -1;
  grid-row: 1;
  background: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
  padding: 1rem;
  z-index: 10;
}

.main-section {
  grid-column: 1;
  grid-row: 2;
  overflow-y: auto;
  background: white;
}

.map-section {
  grid-column: 2;
  grid-row: 2;
  background: #f8f9fa;
}

.results-container,
.detail-container {
  height: 100%;
  overflow-y: auto;
}

.detail-container.full-width {
  grid-column: 1 / -1;
}

/* Responsive design */
@media (max-width: 1023px) {
  .app-container {
    display: flex;
    flex-direction: column;
    height: 100vh;
  }

  .search-section {
    flex: 0 0 auto;
    min-height: 80px;
  }

  .main-section {
    flex: 1;
    overflow-y: auto;
  }

  .detail-container.full-width {
    width: 100%;
  }

  .map-section {
    display: none; /* Carte cachée sur mobile par défaut */
  }

  .map-section.mobile-visible {
    display: block;
    flex: 1;
    min-height: 300px;
  }
}

/* Styles pour les écrans très petits */
@media (max-width: 480px) {
  .search-section {
    padding: 0.5rem;
  }
}
</style>
