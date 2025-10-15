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
        @click="goToPage(1)"
        :disabled="currentPage === 1"
        class="pagination-btn"
        title="Première page"
      >
        ⏮️
      </button>

      <button
        @click="goToPage(currentPage - 1)"
        :disabled="currentPage === 1"
        class="pagination-btn"
      >
        ← Précédent
      </button>

      <div class="pagination-numbers">
        <button
          v-for="page in visiblePages"
          :key="page"
          @click="goToPage(page)"
          :class="['pagination-number', { active: page === currentPage }]"
        >
          {{ page }}
        </button>
      </div>

      <button
        @click="goToPage(currentPage + 1)"
        :disabled="currentPage === totalPages"
        class="pagination-btn"
      >
        Suivant →
      </button>

      <button
        @click="goToPage(totalPages)"
        :disabled="currentPage === totalPages"
        class="pagination-btn"
        title="Dernière page"
      >
        ⏭️
      </button>

      <div class="pagination-info">
        Page {{ currentPage }} sur {{ totalPages }}
        <span class="pagination-count">({{ totalCount }} musées au total)</span>
      </div>
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
    default: 9,
  },
})

const emit = defineEmits(['select-museum', 'page-change'])

const currentPage = ref(1)

const totalPages = computed(() => {
  return Math.ceil(props.totalCount / props.itemsPerPage)
})

const visiblePages = computed(() => {
  const pages = []
  const maxVisible = 5
  const start = Math.max(1, currentPage.value - Math.floor(maxVisible / 2))
  const end = Math.min(totalPages.value, start + maxVisible - 1)

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  return pages
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
  border: 4px solid #404040;
  border-top: 4px solid #007acc;
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
  color: #a0a0a0;
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
  color: #e5e5e5;
  margin: 0;
}

.empty-description {
  color: #a0a0a0;
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
  background: #2d2d2d;
  border: 1px solid #404040;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
  display: flex;
  flex-direction: column;
}

.museum-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.4);
  border-color: #555555;
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
  background: linear-gradient(135deg, #404040 0%, #555555 100%);
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
  color: #ffffff;
  margin: 0;
  line-height: 1.3;
}

.museum-location {
  color: #c0c0c0;
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
  background: #404040;
  color: #007acc;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
}

.museum-description {
  color: #d0d0d0;
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
  color: #c0c0c0;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.85rem;
  color: #c0c0c0;
}

.meta-icon {
  font-size: 0.9rem;
}

.museum-actions {
  padding: 1rem 1.5rem;
  border-top: 1px solid #555555;
  background: #2d2d2d;
}

.view-btn {
  width: 100%;
  padding: 0.75rem;
  background: #007acc;
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
  background: #0056b3;
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
  gap: 1rem;
  margin-top: 3rem;
  padding: 2rem 0;
  flex-wrap: wrap;
}

.pagination-btn {
  padding: 0.75rem 1.5rem;
  background: #007acc;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
  min-width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pagination-btn:hover:not(:disabled) {
  background: #0056b3;
  transform: translateY(-1px);
}

.pagination-btn:disabled {
  background: #666666;
  cursor: not-allowed;
  transform: none;
}

.pagination-numbers {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.pagination-number {
  padding: 0.5rem 0.75rem;
  background: #404040;
  color: #e5e5e5;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
  min-width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pagination-number:hover {
  background: #555555;
  transform: translateY(-1px);
}

.pagination-number.active {
  background: #007acc;
  color: white;
}

.pagination-number.active:hover {
  background: #0056b3;
}

.pagination-info {
  color: #a0a0a0;
  font-weight: 500;
  text-align: center;
  margin-top: 1rem;
  width: 100%;
}

.pagination-count {
  font-size: 0.9rem;
  color: #888888;
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

  .pagination-numbers {
    order: -1;
    margin-bottom: 1rem;
  }

  .pagination-number {
    min-width: 36px;
    height: 36px;
    font-size: 0.9rem;
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
