<template>
  <div class="favorites-page">
    <div class="favorites-header">
      <button @click="goBack" class="back-button">← Retour à la recherche</button>
      <div class="header-info">
        <h1>Mes Favoris</h1>
        <p class="favorites-count">
          {{ favoriteMuseums.length }} musée{{ favoriteMuseums.length > 1 ? 's' : '' }} en favori{{
            favoriteMuseums.length > 1 ? 's' : ''
          }}
        </p>
      </div>
    </div>

    <div class="favorites-content">
      <div v-if="favoriteMuseums.length === 0" class="empty-favorites">
        <div class="empty-icon">🤍</div>
        <h3>Aucun favori</h3>
        <p>Vous n'avez pas encore ajouté de musées à vos favoris.</p>
        <button @click="goBack" class="explore-btn">Explorer les musées</button>
      </div>

      <div v-else class="favorites-list">
        <div class="list-controls">
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

          <div class="sort-controls">
            <select v-model="sortBy" class="sort-select">
              <option value="name">Trier par nom</option>
              <option value="city">Trier par ville</option>
              <option value="theme">Trier par thème</option>
              <option value="added">Trier par date d'ajout</option>
            </select>
          </div>
        </div>

        <div :class="['favorites-grid', viewMode]">
          <div
            v-for="museum in sortedFavorites"
            :key="museum.id"
            @click="selectMuseum(museum)"
            class="favorite-card"
          >
            <div class="museum-image">
              <div class="placeholder-image">
                <span class="museum-icon">🏛️</span>
              </div>
              <button
                @click.stop="removeFavorite(museum.id)"
                class="remove-favorite-btn"
                title="Retirer des favoris"
              >
                ❌
              </button>
            </div>

            <div class="museum-info">
              <h3 class="museum-name">{{ museum.name }}</h3>
              <p class="museum-location">
                <span class="city">{{ museum.city }}</span>
                <span class="region">{{ museum.region }}</span>
              </p>
              <div class="museum-meta">
                <span class="theme">{{ museum.theme }}</span>
                <span class="added-date"> Ajouté le {{ formatDate(museum.addedDate) }} </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useMuseumStore } from '../stores/museumStore.js'

const emit = defineEmits(['back', 'museum-select'])

const museumStore = useMuseumStore()
const viewMode = ref('list')
const sortBy = ref('name')

// Récupérer les musées favoris depuis le store
const favoriteMuseums = computed(() => {
  return museumStore.favoriteMuseums.map((museum) => ({
    ...museum,
    addedDate: new Date(), // Pour l'instant, on utilise la date actuelle
  }))
})

// Musées triés selon le critère sélectionné
const sortedFavorites = computed(() => {
  const museums = [...favoriteMuseums.value]

  switch (sortBy.value) {
    case 'name':
      return museums.sort((a, b) => a.name.localeCompare(b.name))
    case 'city':
      return museums.sort((a, b) => a.city.localeCompare(b.city))
    case 'theme':
      return museums.sort((a, b) => a.theme.localeCompare(b.theme))
    case 'added':
      return museums.sort((a, b) => new Date(b.addedDate) - new Date(a.addedDate))
    default:
      return museums
  }
})

const goBack = () => {
  emit('back')
}

const selectMuseum = (museum) => {
  emit('museum-select', museum)
}

const removeFavorite = (museumId) => {
  museumStore.removeFromFavorites(museumId)
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}
</script>

<style scoped>
.favorites-page {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: white;
}

.favorites-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-bottom: 1px solid #dee2e6;
  background: #f8f9fa;
}

.back-button {
  background: #6c757d;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.3s ease;
  flex-shrink: 0;
}

.back-button:hover {
  background: #5a6268;
}

.header-info {
  flex: 1;
}

.header-info h1 {
  margin: 0 0 0.25rem 0;
  font-size: 1.75rem;
  color: #2c3e50;
}

.favorites-count {
  margin: 0;
  color: #6c757d;
  font-size: 1rem;
}

.favorites-content {
  flex: 1;
  overflow-y: auto;
}

.empty-favorites {
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

.empty-favorites h3 {
  color: #6c757d;
  margin-bottom: 0.5rem;
  font-size: 1.5rem;
}

.empty-favorites p {
  color: #adb5bd;
  margin-bottom: 2rem;
  font-size: 1rem;
}

.explore-btn {
  background: #007bff;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s ease;
}

.explore-btn:hover {
  background: #0056b3;
}

.favorites-list {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.list-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #dee2e6;
  background: #f8f9fa;
  gap: 1rem;
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

.sort-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.sort-select {
  padding: 0.5rem 0.75rem;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  font-size: 0.9rem;
  background: white;
  cursor: pointer;
}

.sort-select:focus {
  outline: none;
  border-color: #007bff;
}

.favorites-grid {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
}

.favorites-grid.list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.favorites-grid.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
}

.favorite-card {
  display: flex;
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: relative;
}

.favorite-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  border-color: #007bff;
}

.favorites-grid.grid .favorite-card {
  flex-direction: column;
}

.favorites-grid.list .favorite-card {
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
  position: relative;
}

.favorites-grid.grid .museum-image {
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

.remove-favorite-btn {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: rgba(220, 53, 69, 0.9);
  color: white;
  border: none;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 0.8rem;
  transition: all 0.3s ease;
  opacity: 0;
}

.favorite-card:hover .remove-favorite-btn {
  opacity: 1;
}

.remove-favorite-btn:hover {
  background: #dc3545;
  transform: scale(1.1);
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
  flex-wrap: wrap;
  gap: 0.5rem;
}

.theme {
  background: #e9ecef;
  color: #495057;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
}

.added-date {
  color: #6c757d;
  font-size: 0.8rem;
  font-style: italic;
}

/* Responsive design */
@media (max-width: 768px) {
  .favorites-header {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  .list-controls {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  .view-controls {
    justify-content: center;
  }

  .favorites-grid.grid {
    grid-template-columns: 1fr;
  }

  .favorite-card {
    flex-direction: column;
  }

  .museum-image {
    width: 100%;
    height: 150px;
  }

  .museum-meta {
    flex-direction: column;
    align-items: flex-start;
  }
}

@media (max-width: 480px) {
  .favorites-page {
    padding: 0;
  }

  .favorites-header {
    padding: 0.75rem;
  }

  .favorites-grid {
    padding: 0.75rem;
  }

  .museum-info {
    padding: 0.75rem;
  }

  .header-info h1 {
    font-size: 1.5rem;
  }
}
</style>
