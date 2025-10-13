<template>
  <div class="search-panel">
    <div class="search-header">
      <div class="header-content">
        <div class="title-section">
          <h1 class="app-title">Musées de France</h1>
          <p class="app-subtitle">Découvrez les musées de France</p>
        </div>
        <button
          @click="showFavorites"
          class="favorites-button"
          :class="{ 'has-favorites': favoritesCount > 0 }"
        >
          <span class="favorites-icon">❤️</span>
          <span class="favorites-text">Favoris</span>
          <span v-if="favoritesCount > 0" class="favorites-count">{{ favoritesCount }}</span>
        </button>
      </div>
    </div>

    <div class="search-form">
      <div class="search-input-group">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Rechercher un musée, une ville, une région..."
          class="search-input"
          @keyup.enter="performSearch"
          :disabled="isLoading"
        />
        <button
          @click="performSearch"
          class="search-button"
          :disabled="isLoading || !searchQuery.trim()"
        >
          <span v-if="isLoading" class="loading-spinner"></span>
          <span v-else>🔍</span>
        </button>
      </div>

      <div class="search-filters">
        <select v-model="selectedTheme" class="filter-select">
          <option value="">Toutes les thématiques</option>
          <option v-for="theme in facets.themes" :key="theme.name" :value="theme.name">
            {{ theme.name }} ({{ theme.count }})
          </option>
        </select>

        <select v-model="selectedRegion" class="filter-select">
          <option value="">Toutes les régions</option>
          <option v-for="region in facets.regions" :key="region.name" :value="region.name">
            {{ region.name }} ({{ region.count }})
          </option>
        </select>

        <select v-model="selectedCity" class="filter-select">
          <option value="">Toutes les villes</option>
          <option v-for="city in facets.cities" :key="city.name" :value="city.name">
            {{ city.name }} ({{ city.count }})
          </option>
        </select>

        <button @click="clearFilters" class="clear-filters-btn" v-if="hasActiveFilters">
          Effacer les filtres
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  isLoading: {
    type: Boolean,
    default: false,
  },
  facets: {
    type: Object,
    default: () => ({}),
  },
  favoritesCount: {
    type: Number,
    default: 0,
  },
})

const emit = defineEmits(['search', 'show-favorites'])

const searchQuery = ref('')
const selectedTheme = ref('')
const selectedRegion = ref('')
const selectedCity = ref('')

const hasActiveFilters = computed(() => {
  return selectedTheme.value || selectedRegion.value || selectedCity.value
})

const performSearch = () => {
  if (!searchQuery.value.trim() && !hasActiveFilters.value) return

  const searchParams = {
    query: searchQuery.value.trim(),
    theme: selectedTheme.value,
    region: selectedRegion.value,
    city: selectedCity.value,
  }

  emit('search', searchParams)
}

const clearFilters = () => {
  selectedTheme.value = ''
  selectedRegion.value = ''
  selectedCity.value = ''
  searchQuery.value = ''
  emit('search', { query: '', theme: '', region: '', city: '' })
}

const showFavorites = () => {
  emit('show-favorites')
}
</script>

<style scoped>
.search-panel {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
}

.search-header {
  margin-bottom: 1.5rem;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.title-section {
  flex: 1;
  text-align: center;
}

.app-title {
  font-size: 2rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 0.5rem 0;
}

.app-subtitle {
  font-size: 1rem;
  color: #6c757d;
  margin: 0;
}

.favorites-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #f8f9fa;
  border: 2px solid #dee2e6;
  border-radius: 8px;
  padding: 0.75rem 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
  color: #6c757d;
  min-width: 120px;
  justify-content: center;
}

.favorites-button:hover {
  background: #e9ecef;
  border-color: #adb5bd;
}

.favorites-button.has-favorites {
  background: #dc3545;
  border-color: #dc3545;
  color: white;
}

.favorites-button.has-favorites:hover {
  background: #c82333;
  border-color: #bd2130;
}

.favorites-icon {
  font-size: 1.1rem;
}

.favorites-text {
  font-weight: 500;
}

.favorites-count {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 0.25rem 0.5rem;
  font-size: 0.8rem;
  font-weight: 600;
  min-width: 20px;
  text-align: center;
}

.search-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.search-input-group {
  display: flex;
  gap: 0.5rem;
  width: 100%;
}

.search-input {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 2px solid #dee2e6;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

.search-button {
  padding: 0.75rem 1.5rem;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
  min-width: 60px;
}

.search-button:hover:not(:disabled) {
  background: #0056b3;
}

.search-button:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

.loading-spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid #ffffff;
  border-radius: 50%;
  border-top-color: transparent;
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.search-filters {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  align-items: center;
}

.filter-select {
  padding: 0.5rem 0.75rem;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  font-size: 0.9rem;
  background: white;
  cursor: pointer;
  min-width: 150px;
}

.filter-select:focus {
  outline: none;
  border-color: #007bff;
}

.clear-filters-btn {
  padding: 0.5rem 1rem;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.clear-filters-btn:hover {
  background: #c82333;
}

/* Responsive design */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 1rem;
  }

  .title-section {
    text-align: center;
  }

  .app-title {
    font-size: 1.5rem;
  }

  .favorites-button {
    min-width: 100px;
    padding: 0.6rem 0.8rem;
  }

  .search-input-group {
    flex-direction: column;
  }

  .search-filters {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-select {
    min-width: auto;
  }
}

@media (max-width: 480px) {
  .search-panel {
    padding: 0 0.5rem;
  }

  .app-title {
    font-size: 1.25rem;
  }

  .search-input {
    padding: 0.6rem 0.8rem;
    font-size: 0.9rem;
  }

  .search-button {
    padding: 0.6rem 1rem;
    font-size: 0.9rem;
  }
}
</style>
