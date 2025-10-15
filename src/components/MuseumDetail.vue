<template>
  <div class="museum-detail">
    <!-- Back button -->
    <div class="detail-header">
      <button @click="goBack" class="back-btn">
        <span class="back-icon">←</span>
        Retour à la liste
      </button>
    </div>

    <!-- Main container -->
    <div class="detail-content">
      <!-- Museum information -->
      <div class="museum-info">
        <div class="museum-hero">
          <div class="museum-image-large">
            <img v-if="museum.image" :src="museum.image" :alt="museum.name" class="hero-image" />
            <div v-else class="placeholder-hero">
              <span class="placeholder-icon-large">🏛️</span>
            </div>
          </div>

          <div class="museum-header">
            <h1 class="museum-title">{{ museum.name }}</h1>
            <p class="museum-subtitle">
              <span class="location-icon">📍</span>
              {{ museum.address }}, {{ museum.city }}, {{ museum.region }}
            </p>

            <div class="museum-badges">
              <span v-if="museum.freeEntry" class="badge free">🆓 Entrée gratuite</span>
              <span v-if="museum.wheelchairAccessible" class="badge accessible">♿ Accessible</span>
              <span v-if="museum.rating" class="badge rating">⭐ {{ museum.rating }}/5</span>
            </div>
          </div>
        </div>

        <!-- Description section -->
        <div class="museum-description-section">
          <h2 class="section-title">Description</h2>
          <p class="museum-description">{{ museum.description }}</p>
        </div>

        <!-- Practical section -->
        <div class="practical-info">
          <h2 class="section-title">Informations pratiques</h2>

          <div class="info-grid">
            <div class="info-item" v-if="museum.openingHours">
              <h3 class="info-label">Horaires</h3>
              <p class="info-value">{{ museum.openingHours }}</p>
            </div>

            <div class="info-item" v-if="museum.phone">
              <h3 class="info-label">Téléphone</h3>
              <p class="info-value">
                <a :href="`tel:${museum.phone}`" class="info-link">{{ museum.phone }}</a>
              </p>
            </div>

            <div class="info-item" v-if="museum.website">
              <h3 class="info-label">Site web</h3>
              <p class="info-value">
                <a :href="museum.website" target="_blank" class="info-link">
                  {{ museum.website }}
                  <span class="external-icon">↗</span>
                </a>
              </p>
            </div>

            <div class="info-item" v-if="museum.email">
              <h3 class="info-label">Email</h3>
              <p class="info-value">
                <a :href="`mailto:${museum.email}`" class="info-link">{{ museum.email }}</a>
              </p>
            </div>
          </div>
        </div>

        <!-- Themes section -->
        <div class="themes-section" v-if="museum.themes && museum.themes.length">
          <h2 class="section-title">Thématiques</h2>
          <div class="themes-list">
            <span v-for="theme in museum.themes" :key="theme" class="theme-tag-large">
              {{ theme }}
            </span>
          </div>
        </div>
      </div>

      <!-- Map -->
      <div class="museum-map">
        <h2 class="section-title">Localisation</h2>
        <div class="map-container">
          <div v-if="museum.coordinates" id="map" class="map"></div>
          <div v-else class="no-coordinates">
            <span class="no-coordinates-icon">📍</span>
            <p>Coordonnées non disponibles</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div class="detail-actions">
      <button class="favorite-btn" @click="toggleFavorite">
        <span class="favorite-icon">{{ isFavorite ? '❤️' : '🤍' }}</span>
        {{ isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris' }}
      </button>

      <button class="share-btn" @click="shareMuseum">
        <span class="share-icon">📤</span>
        Partager
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useMuseumStore } from '../stores/museum'
import L from 'leaflet'

const props = defineProps({
  museum: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['back'])

const museumStore = useMuseumStore()
const isFavorite = computed(() => museumStore.isFavorite(props.museum.id))
let map = null

const goBack = () => {
  emit('back')
  // debug log
  if (window.debugMuseumApp) {
    console.log('going back to list')
  }
}

const toggleFavorite = () => {
  museumStore.toggleFavorite(props.museum.id)
  // debug log
  if (window.debugMuseumApp) {
    console.log('favorite toggled for museum:', props.museum.name)
  }
}

const shareMuseum = async () => {
  if (navigator.share) {
    try {
      await navigator.share({
        title: props.museum.name,
        text: `Découvrez ${props.museum.name}`,
        url: window.location.href,
      })
    } catch (err) {
      console.log('Erreur lors du partage:', err)
    }
  } else {
    // Fallback for browsers that don't support the Web Share API
    navigator.clipboard.writeText(window.location.href)
    alert('Lien copié dans le presse-papiers!')
  }
}

const initMap = async () => {
  await nextTick()

  if (!props.museum.coordinates) {
    console.warn('Aucune coordonnée disponible pour ce musée')
    return
  }

  // Configuration de Leaflet pour éviter les problèmes d'icônes
  delete L.Icon.Default.prototype._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  })

  // Initialisation de la carte
  map = L.map('map').setView([props.museum.coordinates.lat, props.museum.coordinates.lng], 15)

  // Ajout de la couche de tuiles
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
  }).addTo(map)

  // Ajout du marqueur avec popup personnalisée
  const popupContent = `
    <div class="popup-content">
      <h3>${props.museum.name}</h3>
      <p>${props.museum.address}</p>
      ${props.museum.city ? `<p>${props.museum.city}, ${props.museum.region}</p>` : ''}
    </div>
  `

  L.marker([props.museum.coordinates.lat, props.museum.coordinates.lng])
    .addTo(map)
    .bindPopup(popupContent)
    .openPopup()
}

onMounted(() => {
  initMap()
})

onUnmounted(() => {
  if (map) {
    map.remove()
  }
})
</script>

<style scoped>
/* main container */
.museum-detail {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #1a1a1a;
  border: 1px solid #404040;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.detail-header {
  padding: 1.5rem;
  border-bottom: 1px solid #555555;
  background: #2d2d2d;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #007acc;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.back-btn:hover {
  background: #0056b3;
  transform: translateX(-2px);
}

.back-icon {
  font-size: 1.2rem;
}

.detail-content {
  flex: 1;
  display: flex;
  overflow: hidden;
  background: #1a1a1a;
}

.museum-info {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
  background: #1a1a1a;
}

.museum-map {
  width: 400px;
  padding: 2rem;
  background: #2d2d2d;
  border-left: 1px solid #555555;
  display: flex;
  flex-direction: column;
}

.museum-hero {
  margin-bottom: 2rem;
}

.museum-image-large {
  height: 300px;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 1.5rem;
}

.hero-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.placeholder-hero {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #404040 0%, #555555 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.placeholder-icon-large {
  font-size: 4rem;
  color: white;
  opacity: 0.7;
}

.museum-header {
  text-align: center;
}

.museum-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 1rem 0;
  line-height: 1.2;
}

.museum-subtitle {
  font-size: 1.2rem;
  color: #c0c0c0;
  margin: 0 0 1.5rem 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.museum-badges {
  display: flex;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.badge {
  padding: 0.5rem 1rem;
  border-radius: 25px;
  font-weight: 500;
  font-size: 0.9rem;
}

.badge.free {
  background: #2d4a2d;
  color: #4ade80;
}

.badge.accessible {
  background: #1e3a5f;
  color: #60a5fa;
}

.badge.rating {
  background: #4a3c1a;
  color: #fbbf24;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #ffffff;
  margin: 0 0 1rem 0;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #555555;
}

.museum-description-section {
  margin-bottom: 2rem;
}

.museum-description {
  font-size: 1.1rem;
  line-height: 1.6;
  color: #d0d0d0;
  margin: 0;
}

.practical-info {
  margin-bottom: 2rem;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.info-item {
  padding: 1rem;
  background: #404040;
  border-radius: 8px;
}

.info-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #c0c0c0;
  margin: 0 0 0.5rem 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-value {
  font-size: 1rem;
  color: #ffffff;
  margin: 0;
}

.info-link {
  color: #007acc;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.info-link:hover {
  text-decoration: underline;
}

.external-icon {
  font-size: 0.8rem;
}

.themes-section {
  margin-bottom: 2rem;
}

.themes-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.theme-tag-large {
  background: #404040;
  color: #007acc;
  padding: 0.5rem 1rem;
  border-radius: 25px;
  font-size: 0.95rem;
  font-weight: 500;
}

.map-container {
  height: 300px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e1e8ed;
  position: relative;
}

.map {
  height: 100%;
  width: 100%;
}

.no-coordinates {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
  color: #7f8c8d;
}

.no-coordinates-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
  opacity: 0.5;
}

.no-coordinates p {
  margin: 0;
  font-size: 1rem;
}

.popup-content h3 {
  margin: 0 0 0.5rem 0;
  color: #ffffff;
  font-size: 1.1rem;
}

.popup-content p {
  margin: 0 0 0.25rem 0;
  color: #d0d0d0;
  font-size: 0.9rem;
}

.detail-actions {
  padding: 1.5rem;
  border-top: 1px solid #555555;
  background: #2d2d2d;
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.favorite-btn,
.share-btn {
  padding: 0.875rem 2rem;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.favorite-btn {
  background: #dc2626;
  color: white;
}

.favorite-btn:hover {
  background: #b91c1c;
  transform: translateY(-1px);
}

.share-btn {
  background: #007acc;
  color: white;
}

.share-btn:hover {
  background: #0056b3;
  transform: translateY(-1px);
}

@media (max-width: 1024px) {
  .detail-content {
    flex-direction: column;
  }

  .museum-map {
    width: 100%;
    height: 300px;
    border-left: none;
    border-top: 1px solid #ecf0f1;
  }
}

@media (max-width: 768px) {
  .museum-info {
    padding: 1.5rem;
  }

  .museum-map {
    padding: 1.5rem;
  }

  .museum-title {
    font-size: 2rem;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .detail-actions {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .museum-info {
    padding: 1rem;
  }

  .museum-map {
    padding: 1rem;
  }

  .museum-title {
    font-size: 1.5rem;
  }

  .museum-badges {
    flex-direction: column;
    align-items: center;
  }
}
</style>
