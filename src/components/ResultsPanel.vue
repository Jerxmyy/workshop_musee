<template>
  <div class="results-panel">
    <!-- Notification de favori -->
    <div v-if="showNotification" class="notification">
      <div class="notification-content">
        <span class="notification-icon">❤️</span>
        <span class="notification-text">{{ notificationMessage }}</span>
      </div>
    </div>

    <div v-if="isLoading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Recherche en cours...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <div class="error-icon">⚠️</div>
      <h3>Erreur de recherche</h3>
      <p>{{ error }}</p>
      <button @click="$emit('retry')" class="retry-btn">Réessayer</button>
    </div>

    <div v-else-if="results.length === 0 && !isLoading" class="empty-state">
      <div class="empty-icon">🏛️</div>
      <h3>Aucun musée trouvé</h3>
      <p>Essayez de modifier vos critères de recherche</p>
      <p>Debug: results.length = {{ results.length }}, isLoading = {{ isLoading }}</p>
    </div>

    <div v-else class="results-content">
      <!-- Debug info -->
      <div style="background: #f0f0f0; padding: 10px; margin: 10px; border: 2px solid red">
        <p><strong>DEBUG:</strong> results.length = {{ results.length }}</p>
        <p><strong>DEBUG:</strong> isLoading = {{ isLoading }}</p>
        <p><strong>DEBUG:</strong> error = {{ error }}</p>
        <p><strong>DEBUG:</strong> Premier musée = {{ results[0]?.name || 'Aucun' }}</p>
      </div>

      <div class="results-header">
        <h2>
          {{ results.length }} musée{{ results.length > 1 ? 's' : '' }} trouvé{{
            results.length > 1 ? 's' : ''
          }}
        </h2>
        <div class="view-controls">
          <button
            @click="viewMode = 'list'"
            :class="{ active: viewMode === 'list' }"
            class="view-btn"
          >
            📋 Liste
          </button>
          <button
            @click="viewMode = 'grid'"
            :class="{ active: viewMode === 'grid' }"
            class="view-btn"
          >
            ⊞ Grille
          </button>
        </div>
      </div>

      <div :class="['results-list', viewMode]">
        <div
          v-for="museum in results"
          :key="museum.id"
          @click="selectMuseum(museum)"
          class="museum-card"
        >
          <div class="museum-image">
            <div class="placeholder-image">
              <span class="museum-icon">🏛️</span>
            </div>
          </div>

          <div class="museum-info">
            <h3 class="museum-name">{{ museum.name }}</h3>
            <p class="museum-location">
              <span class="city">{{ museum.city }}</span>
              <span class="region">{{ museum.region }}</span>
            </p>
            <div class="museum-meta">
              <span class="theme">{{ museum.theme }}</span>
              <div class="museum-actions">
                <button
                  @click.stop="toggleFavorite(museum)"
                  :class="{ favorited: isFavorite(museum.id) }"
                  class="favorite-btn"
                  :title="isFavorite(museum.id) ? 'Retirer des favoris' : 'Ajouter aux favoris'"
                >
                  <span class="favorite-icon">{{ isFavorite(museum.id) ? '❤️' : '🤍' }}</span>
                  <span class="favorite-text">
                    {{ isFavorite(museum.id) ? 'Favori' : 'Ajouter' }}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useMuseumStore } from '../stores/museumStore.js'

const museumStore = useMuseumStore()

const props = defineProps({
  results: {
    type: Array,
    default: () => [],
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
  error: {
    type: String,
    default: null,
  },
})

// Utiliser computed pour s'assurer de la réactivité
const results = computed(() => {
  console.log('🔍 ResultsPanel - Props results:', props.results)
  console.log('🔍 ResultsPanel - Length:', props.results?.length)
  console.log('🔍 ResultsPanel - Type:', typeof props.results)
  console.log('🔍 ResultsPanel - Is Array:', Array.isArray(props.results))

  if (props.results && props.results.length > 0) {
    console.log('🔍 ResultsPanel - Premier musée:', props.results[0])
    console.log('🔍 ResultsPanel - Premier musée name:', props.results[0]?.name)
    console.log('🔍 ResultsPanel - Premier musée city:', props.results[0]?.city)
    console.log('🔍 ResultsPanel - Premier musée region:', props.results[0]?.region)
  }

  return props.results || []
})

const emit = defineEmits(['museum-select', 'toggle-favorite'])

const viewMode = ref('list')
const showNotification = ref(false)
const notificationMessage = ref('')

const selectMuseum = (museum) => {
  emit('museum-select', museum)
}

const toggleFavorite = (museum) => {
  // Cette fonction sera gérée par le store
  // On émet un événement vers le parent
  emit('toggle-favorite', museum)

  // Afficher une notification
  const wasFavorite = isFavorite(museum.id)
  notificationMessage.value = wasFavorite
    ? `${museum.name} retiré des favoris`
    : `${museum.name} ajouté aux favoris`
  showNotification.value = true

  // Masquer la notification après 3 secondes
  setTimeout(() => {
    showNotification.value = false
  }, 3000)
}

const isFavorite = (museumId) => {
  return museumStore.isFavorite(museumId)
}
</script>

<style scoped>
.results-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: white;
  position: relative;
  border: 3px solid blue; /* Debug border */
  min-height: 400px; /* Debug min height */
}

.notification {
  position: absolute;
  top: 1rem;
  right: 1rem;
  z-index: 1000;
  animation: slideIn 0.3s ease-out;
}

.notification-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #28a745;
  color: white;
  padding: 0.75rem 1rem;
  border-radius: 6px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  font-size: 0.9rem;
  font-weight: 500;
}

.notification-icon {
  font-size: 1rem;
}

.notification-text {
  white-space: nowrap;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 1rem;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
  padding: 2rem;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-state h3 {
  color: #6c757d;
  margin-bottom: 0.5rem;
}

.empty-state p {
  color: #adb5bd;
}

.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
  padding: 2rem;
}

.error-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.error-state h3 {
  color: #dc3545;
  margin-bottom: 0.5rem;
}

.error-state p {
  color: #6c757d;
  margin-bottom: 1.5rem;
}

.retry-btn {
  background: #007bff;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s ease;
}

.retry-btn:hover {
  background: #0056b3;
}

.results-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 2px solid green; /* Debug border */
  background: #f9f9f9; /* Debug background */
  padding: 10px; /* Debug padding */
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #dee2e6;
  background: #f8f9fa;
}

.results-header h2 {
  margin: 0;
  font-size: 1.25rem;
  color: #2c3e50;
}

.view-controls {
  display: flex;
  gap: 0.5rem;
}

.view-btn {
  padding: 0.5rem 1rem;
  border: 1px solid #dee2e6;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.view-btn:hover {
  background: #f8f9fa;
}

.view-btn.active {
  background: #007bff;
  color: white;
  border-color: #007bff;
}

.results-list {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
}

.results-list.list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.results-list.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
}

.museum-card {
  display: flex;
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.museum-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  border-color: #007bff;
}

.results-list.grid .museum-card {
  flex-direction: column;
}

.results-list.list .museum-card {
  flex-direction: row;
}

.museum-image {
  flex-shrink: 0;
  width: 120px;
  height: 120px;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
}

.results-list.grid .museum-image {
  width: 100%;
  height: 150px;
}

.placeholder-image {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.museum-icon {
  font-size: 2rem;
}

.museum-info {
  flex: 1;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.museum-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 0.5rem 0;
  line-height: 1.3;
}

.museum-location {
  margin: 0 0 1rem 0;
  color: #6c757d;
  font-size: 0.9rem;
}

.city {
  font-weight: 500;
}

.region {
  margin-left: 0.5rem;
  color: #adb5bd;
}

.museum-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.theme {
  background: #e9ecef;
  color: #495057;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
}

.museum-actions {
  display: flex;
  gap: 0.5rem;
}

.favorite-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  cursor: pointer;
  padding: 0.5rem 0.75rem;
  font-size: 0.9rem;
  color: #6c757d;
  transition: all 0.3s ease;
  min-width: 80px;
  justify-content: center;
}

.favorite-btn:hover {
  background: #e9ecef;
  border-color: #adb5bd;
  transform: translateY(-1px);
}

.favorite-btn.favorited {
  background: #dc3545;
  border-color: #dc3545;
  color: white;
  animation: heartBeat 0.6s ease-in-out;
}

.favorite-btn.favorited:hover {
  background: #c82333;
  border-color: #bd2130;
}

.favorite-icon {
  font-size: 1rem;
}

.favorite-text {
  font-weight: 500;
  font-size: 0.8rem;
}

@keyframes heartBeat {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}

/* Responsive design */
@media (max-width: 768px) {
  .results-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .view-controls {
    justify-content: center;
  }

  .results-list.grid {
    grid-template-columns: 1fr;
  }

  .museum-card {
    flex-direction: column;
  }

  .museum-image {
    width: 100%;
    height: 150px;
  }
}

@media (max-width: 480px) {
  .results-panel {
    padding: 0;
  }

  .results-header {
    padding: 0.75rem;
  }

  .results-list {
    padding: 0.75rem;
  }

  .museum-info {
    padding: 0.75rem;
  }
}
</style>
