<!-- favorites page component -->

<template>
  <div class="favorites-page">
    <!-- page header -->
    <div class="favorites-header">
      <div class="header-content">
        <div class="header-title">
          <h1 class="page-title">
            <span class="title-icon">⭐</span>
            Mes Favoris
          </h1>
          <p class="page-subtitle">
            {{ favoritesCount }} musée{{ favoritesCount > 1 ? 's' : '' }} sauvegardé{{
              favoritesCount > 1 ? 's' : ''
            }}
          </p>
        </div>

        <div class="header-actions">
          <button @click="clearAllFavorites" v-if="favoritesCount > 0" class="clear-btn">
            <span class="btn-icon">🗑️</span>
            Vider la liste
          </button>
        </div>
      </div>
    </div>

    <!-- main content -->
    <div class="favorites-content">
      <!-- loading state -->
      <div v-if="isLoading" class="loading-state">
        <div class="loading-spinner"></div>
        <p class="loading-text">Chargement de vos favoris...</p>
      </div>

      <!-- empty state -->
      <div v-else-if="favoritesCount === 0" class="empty-state">
        <div class="empty-icon">💔</div>
        <h3 class="empty-title">Aucun favori pour le moment</h3>
        <p class="empty-description">
          Explorez les musées et ajoutez vos préférés en cliquant sur l'icône cœur.
        </p>
        <button @click="goToSearch" class="explore-btn">
          <span class="btn-icon">🔍</span>
          Découvrir des musées
        </button>
      </div>

      <!-- favorites list -->
      <div v-else class="favorites-grid">
        <div
          v-for="museum in favoriteMuseums"
          :key="museum.id"
          class="favorite-card"
          @click="selectMuseum(museum)"
        >
          <div class="card-image-container">
            <img v-if="museum.image" :src="museum.image" :alt="museum.name" class="card-image" />
            <div v-else class="placeholder-image">
              <span class="placeholder-icon">🏛️</span>
            </div>

            <!-- remove favorite button -->
            <button
              @click.stop="toggleFavorite(museum.id)"
              class="remove-favorite-btn"
              :class="{ removing: isRemoving }"
            >
              <span class="btn-icon">❤️</span>
            </button>
          </div>

          <div class="card-content">
            <h3 class="museum-name">{{ museum.name }}</h3>
            <p class="museum-location">
              <span class="location-icon">📍</span>
              {{ museum.city }}, {{ museum.region }}
            </p>

            <div class="museum-themes">
              <span v-for="theme in museum.themes" :key="theme" class="theme-tag">
                {{ theme }}
              </span>
            </div>

            <p class="museum-description">
              {{ truncateText(museum.description, 100) }}
            </p>

            <div class="museum-meta">
              <div class="meta-item" v-if="museum.freeEntry">
                <span class="meta-icon">🆓</span>
                <span class="meta-text">Entrée gratuite</span>
              </div>
              <div class="meta-item" v-if="museum.wheelchairAccessible">
                <span class="meta-icon">♿</span>
                <span class="meta-text">Accessible</span>
              </div>
              <div class="meta-item" v-if="museum.rating">
                <span class="meta-icon">⭐</span>
                <span class="meta-text">{{ museum.rating }}/5</span>
              </div>
            </div>
          </div>

          <div class="card-actions">
            <button class="view-btn">
              Voir les détails
              <span class="btn-icon">→</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useMuseumStore } from '../stores/museum'

const museumStore = useMuseumStore()

const emit = defineEmits(['select-museum', 'go-to-search'])

const isLoading = computed(() => museumStore.isLoading)
const favoritesCount = computed(() => museumStore.favorites.length)
const favoriteMuseums = computed(() => museumStore.favoriteMuseums)

const isRemoving = ref(false)

const selectMuseum = (museum) => {
  emit('select-museum', museum)
}

const toggleFavorite = async (museumId) => {
  isRemoving.value = true
  museumStore.toggleFavorite(museumId)

  // Animation de suppression
  setTimeout(() => {
    isRemoving.value = false
  }, 300)
}

const clearAllFavorites = () => {
  if (confirm('Êtes-vous sûr de vouloir supprimer tous vos favoris ?')) {
    museumStore.favorites.forEach((museumId) => {
      museumStore.toggleFavorite(museumId)
    })
  }
}

const goToSearch = () => {
  emit('go-to-search')
}

const truncateText = (text, maxLength) => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}
</script>

<style scoped>
.favorites-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.favorites-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 3rem 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
}

.header-title {
  flex: 1;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 800;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 1rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.title-icon {
  font-size: 2.2rem;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

.page-subtitle {
  font-size: 1.1rem;
  margin: 0.5rem 0 0 0;
  opacity: 0.9;
  font-weight: 500;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.clear-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 25px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.clear-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.btn-icon {
  font-size: 1rem;
}

.favorites-content {
  padding: 3rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 50vh;
  gap: 1rem;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #667eea;
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

.loading-text {
  font-size: 1.1rem;
  color: #7f8c8d;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 60vh;
  text-align: center;
  gap: 1.5rem;
}

.empty-icon {
  font-size: 5rem;
  opacity: 0.6;
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%,
  20%,
  50%,
  80%,
  100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
  }
}

.empty-title {
  font-size: 2rem;
  color: #2c3e50;
  margin: 0;
  font-weight: 700;
}

.empty-description {
  color: #7f8c8d;
  font-size: 1.1rem;
  max-width: 500px;
  line-height: 1.6;
}

.explore-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.explore-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
}

.favorites-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;
}

.favorite-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  position: relative;
}

.favorite-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.15);
}

.card-image-container {
  height: 220px;
  overflow: hidden;
  position: relative;
}

.card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.favorite-card:hover .card-image {
  transform: scale(1.05);
}

.placeholder-image {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.placeholder-icon {
  font-size: 3.5rem;
  color: white;
  opacity: 0.8;
}

.remove-favorite-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.remove-favorite-btn:hover {
  background: white;
  transform: scale(1.1);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

.remove-favorite-btn.removing {
  animation: shake 0.3s ease-in-out;
}

@keyframes shake {
  0%,
  100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-5px);
  }
  75% {
    transform: translateX(5px);
  }
}

.card-content {
  padding: 1.5rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.museum-name {
  font-size: 1.4rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0;
  line-height: 1.3;
}

.museum-location {
  color: #7f8c8d;
  font-size: 0.95rem;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.location-icon {
  font-size: 0.9rem;
}

.museum-themes {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.theme-tag {
  background: linear-gradient(135deg, #e8f4fd 0%, #d1ecf1 100%);
  color: #2980b9;
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  border: 1px solid rgba(52, 152, 219, 0.2);
}

.museum-description {
  color: #5d6d7e;
  font-size: 0.9rem;
  line-height: 1.6;
  margin: 0;
  flex: 1;
}

.museum-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: auto;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.85rem;
  color: #7f8c8d;
  font-weight: 500;
}

.meta-icon {
  font-size: 0.9rem;
}

.card-actions {
  padding: 1rem 1.5rem;
  border-top: 1px solid #ecf0f1;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
}

.view-btn {
  width: 100%;
  padding: 0.75rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 0.95rem;
}

.view-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.3);
}

.view-btn .btn-icon {
  font-size: 1.1rem;
  transition: transform 0.3s ease;
}

.favorite-card:hover .view-btn .btn-icon {
  transform: translateX(3px);
}

/* mobile responsive */
@media (max-width: 768px) {
  .favorites-header {
    padding: 2rem 1rem;
  }

  .header-content {
    flex-direction: column;
    text-align: center;
    gap: 1.5rem;
  }

  .page-title {
    font-size: 2rem;
  }

  .favorites-content {
    padding: 2rem 1rem;
  }

  .favorites-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .empty-state {
    height: 50vh;
    padding: 0 1rem;
  }

  .empty-title {
    font-size: 1.5rem;
  }

  .empty-description {
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 1.8rem;
  }

  .card-content {
    padding: 1rem;
  }

  .card-actions {
    padding: 0.75rem 1rem;
  }
}
</style>
