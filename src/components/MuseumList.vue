<template>
  <div class="museum-list">
    <!-- loading state -->
    <div v-if="isLoading" class="loading-state">
      <div class="loading-spinner"></div>
      <p class="loading-text">Recherche des musées...</p>
    </div>

    <!-- empty state -->
    <div v-else-if="museums.length === 0" class="empty-state">
      <div class="empty-icon">🏛️</div>
      <h3 class="empty-title">Aucun musée trouvé</h3>
      <p class="empty-description">Utilisez les filtres de recherche pour découvrir des musées.</p>
    </div>

    <!-- museums list -->
    <div v-else class="museums-grid">
      <div
        v-for="museum in museums"
        :key="museum.id"
        class="museum-card"
        @click="selectMuseum(museum)"
      >
        <div class="museum-image">
          <img v-if="museum.image" :src="museum.image" :alt="museum.name" class="card-image" />
          <div v-else class="placeholder-image">
            <span class="placeholder-icon">🏛️</span>
          </div>
        </div>

        <div class="museum-content">
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
            {{ truncateText(museum.description, 120) }}
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

        <div class="museum-actions">
          <button class="view-btn">
            Voir les détails
            <span class="btn-icon">→</span>
          </button>
        </div>
      </div>
    </div>

    <!-- pagination -->
    <div v-if="totalPages > 1" class="pagination">
      <button
        @click="goToPage(currentPage - 1)"
        :disabled="currentPage === 1"
        class="pagination-btn"
      >
        ← Précédent
      </button>

      <div class="pagination-info">Page {{ currentPage }} sur {{ totalPages }}</div>

      <button
        @click="goToPage(currentPage + 1)"
        :disabled="currentPage === totalPages"
        class="pagination-btn"
      >
        Suivant →
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  museums: {
    type: Array,
    default: () => [],
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
  totalCount: {
    type: Number,
    default: 0,
  },
  itemsPerPage: {
    type: Number,
    default: 12,
  },
})

const emit = defineEmits(['select-museum', 'page-change'])

const currentPage = ref(1)

const totalPages = computed(() => {
  return Math.ceil(props.totalCount / props.itemsPerPage)
})

const selectMuseum = (museum) => {
  emit('select-museum', museum)
}

const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    emit('page-change', page)
  }
}

const truncateText = (text, maxLength) => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}
</script>

<style scoped>
.museum-list {
  height: 100%;
  display: flex;
  flex-direction: column;
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
  border-top: 4px solid #3498db;
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
  height: 50vh;
  text-align: center;
  gap: 1rem;
}

.empty-icon {
  font-size: 4rem;
  opacity: 0.5;
}

.empty-title {
  font-size: 1.5rem;
  color: #2c3e50;
  margin: 0;
}

.empty-description {
  color: #7f8c8d;
  font-size: 1rem;
  max-width: 400px;
}

.museums-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;
  padding: 1rem 0;
}

.museum-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
  display: flex;
  flex-direction: column;
}

.museum-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
}

.museum-image {
  height: 200px;
  overflow: hidden;
  position: relative;
}

.card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
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
  font-size: 3rem;
  color: white;
  opacity: 0.7;
}

.museum-content {
  padding: 1.5rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.museum-name {
  font-size: 1.3rem;
  font-weight: 600;
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
  background: #e8f4fd;
  color: #2980b9;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
}

.museum-description {
  color: #5d6d7e;
  font-size: 0.9rem;
  line-height: 1.5;
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
}

.meta-icon {
  font-size: 0.9rem;
}

.museum-actions {
  padding: 1rem 1.5rem;
  border-top: 1px solid #ecf0f1;
  background: #f8f9fa;
}

.view-btn {
  width: 100%;
  padding: 0.75rem;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.view-btn:hover {
  background: #2980b9;
}

.btn-icon {
  font-size: 1.1rem;
  transition: transform 0.3s ease;
}

.museum-card:hover .btn-icon {
  transform: translateX(3px);
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  margin-top: 3rem;
  padding: 2rem 0;
}

.pagination-btn {
  padding: 0.75rem 1.5rem;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.pagination-btn:hover:not(:disabled) {
  background: #2980b9;
  transform: translateY(-1px);
}

.pagination-btn:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
  transform: none;
}

.pagination-info {
  color: #7f8c8d;
  font-weight: 500;
}

@media (max-width: 768px) {
  .museums-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .pagination {
    flex-direction: column;
    gap: 1rem;
  }

  .pagination-info {
    order: -1;
  }
}

@media (max-width: 480px) {
  .museum-content {
    padding: 1rem;
  }

  .museum-actions {
    padding: 0.75rem 1rem;
  }
}
</style>
