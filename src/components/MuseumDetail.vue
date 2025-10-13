<template>
  <div class="museum-detail">
    <div class="detail-header">
      <button @click="goBack" class="back-button">← Retour à la liste</button>
      <div class="header-actions">
        <button @click="toggleFavorite" :class="{ favorited: isFavorited }" class="favorite-btn">
          {{ isFavorited ? '❤️ Favori' : '🤍 Ajouter aux favoris' }}
        </button>
      </div>
    </div>

    <div class="detail-content">
      <div class="museum-hero">
        <div class="museum-image-large">
          <div class="placeholder-image">
            <span class="museum-icon">🏛️</span>
          </div>
        </div>

        <div class="museum-basic-info">
          <h1 class="museum-title">{{ museum.name }}</h1>
          <div class="museum-location">
            <span class="city">{{ museum.city }}</span>
            <span class="region">{{ museum.region }}</span>
          </div>
          <div class="museum-theme">{{ museum.theme }}</div>
        </div>
      </div>

      <div class="detail-sections">
        <div class="detail-section">
          <h3>Informations générales</h3>
          <div class="info-grid">
            <div class="info-item">
              <label>Nom officiel</label>
              <span>{{ museum.name }}</span>
            </div>
            <div class="info-item">
              <label>Ville</label>
              <span>{{ museum.city }}</span>
            </div>
            <div class="info-item">
              <label>Région</label>
              <span>{{ museum.region }}</span>
            </div>
            <div class="info-item">
              <label>Thématique</label>
              <span>{{ museum.theme }}</span>
            </div>
            <div class="info-item">
              <label>Coordonnées</label>
              <span>{{
                museum.coordinates
                  ? `${museum.coordinates[0]}, ${museum.coordinates[1]}`
                  : 'Non disponibles'
              }}</span>
            </div>
          </div>
        </div>

        <div class="detail-section">
          <h3>Description</h3>
          <p class="museum-description">
            {{ museum.description || 'Aucune description disponible pour ce musée.' }}
          </p>
        </div>

        <div class="detail-section">
          <h3>Horaires d'ouverture</h3>
          <div class="opening-hours">
            <div class="hours-item">
              <span class="day">Lundi</span>
              <span class="hours">{{ museum.openingHours?.monday || 'Fermé' }}</span>
            </div>
            <div class="hours-item">
              <span class="day">Mardi</span>
              <span class="hours">{{ museum.openingHours?.tuesday || '9h00 - 18h00' }}</span>
            </div>
            <div class="hours-item">
              <span class="day">Mercredi</span>
              <span class="hours">{{ museum.openingHours?.wednesday || '9h00 - 18h00' }}</span>
            </div>
            <div class="hours-item">
              <span class="day">Jeudi</span>
              <span class="hours">{{ museum.openingHours?.thursday || '9h00 - 18h00' }}</span>
            </div>
            <div class="hours-item">
              <span class="day">Vendredi</span>
              <span class="hours">{{ museum.openingHours?.friday || '9h00 - 18h00' }}</span>
            </div>
            <div class="hours-item">
              <span class="day">Samedi</span>
              <span class="hours">{{ museum.openingHours?.saturday || '9h00 - 18h00' }}</span>
            </div>
            <div class="hours-item">
              <span class="day">Dimanche</span>
              <span class="hours">{{ museum.openingHours?.sunday || '9h00 - 18h00' }}</span>
            </div>
          </div>
        </div>

        <div class="detail-section">
          <h3>Tarifs</h3>
          <div class="pricing-info">
            <div class="price-item">
              <span class="price-label">Plein tarif</span>
              <span class="price-value">{{ museum.pricing?.fullPrice || '15€' }}</span>
            </div>
            <div class="price-item">
              <span class="price-label">Tarif réduit</span>
              <span class="price-value">{{ museum.pricing?.reducedPrice || '10€' }}</span>
            </div>
            <div class="price-item">
              <span class="price-label">Gratuit</span>
              <span class="price-value">{{
                museum.pricing?.free || 'Premier dimanche du mois'
              }}</span>
            </div>
          </div>
        </div>

        <div class="detail-section">
          <h3>Contact</h3>
          <div class="contact-info">
            <div class="contact-item">
              <label>Adresse</label>
              <span>{{ museum.address || 'Adresse non disponible' }}</span>
            </div>
            <div class="contact-item">
              <label>Téléphone</label>
              <span>{{ museum.phone || 'Non disponible' }}</span>
            </div>
            <div class="contact-item">
              <label>Email</label>
              <span>{{ museum.email || 'Non disponible' }}</span>
            </div>
            <div class="contact-item">
              <label>Site web</label>
              <a v-if="museum.website" :href="museum.website" target="_blank" class="website-link">
                {{ museum.website }}
              </a>
              <span v-else>Non disponible</span>
            </div>
          </div>
        </div>

        <div class="detail-section" v-if="museum.coordinates && museum.coordinates.length === 2">
          <h3>Localisation</h3>
          <div class="map-container">
            <div ref="mapElement" class="map"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const props = defineProps({
  museum: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['back'])

const isFavorited = ref(false)
const mapElement = ref(null)
const map = ref(null)

// Configuration des icônes Leaflet
const createIcon = () => {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div class="marker-icon selected">🏛️</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30],
  })
}

const initMap = () => {
  if (!mapElement.value || !props.museum.coordinates) return

  // Initialiser la carte centrée sur le musée
  map.value = L.map(mapElement.value, {
    zoomControl: true,
  }).setView(props.museum.coordinates, 15)

  // Ajouter la couche de tuiles
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
  }).addTo(map.value)

  // Ajouter le marqueur du musée
  const marker = L.marker(props.museum.coordinates, {
    icon: createIcon(),
  }).addTo(map.value).bindPopup(`
      <div class="popup-content">
        <h4>${props.museum.name}</h4>
        <p>${props.museum.city}, ${props.museum.region}</p>
        <p><strong>Thème:</strong> ${props.museum.theme}</p>
      </div>
    `)

  // Ouvrir automatiquement le popup
  marker.openPopup()
}

const goBack = () => {
  emit('back')
}

const toggleFavorite = () => {
  isFavorited.value = !isFavorited.value
  // Ici on pourrait sauvegarder en base de données
}

// Watcher pour réinitialiser la carte si le musée change
watch(
  () => props.museum,
  () => {
    if (map.value) {
      map.value.remove()
      map.value = null
    }
    nextTick(() => {
      initMap()
    })
  },
  { deep: true },
)

onMounted(() => {
  nextTick(() => {
    initMap()
  })
})

onUnmounted(() => {
  if (map.value) {
    map.value.remove()
  }
})
</script>

<style scoped>
.museum-detail {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: white;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
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
}

.back-button:hover {
  background: #5a6268;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.favorite-btn {
  background: #dc3545;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.favorite-btn.favorited {
  background: #28a745;
}

.favorite-btn:hover {
  opacity: 0.9;
}

.detail-content {
  flex: 1;
  overflow-y: auto;
}

.museum-hero {
  display: flex;
  gap: 2rem;
  padding: 2rem;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-bottom: 1px solid #dee2e6;
}

.museum-image-large {
  width: 200px;
  height: 200px;
  background: white;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
}

.placeholder-image {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.museum-icon {
  font-size: 4rem;
}

.museum-basic-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.museum-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 1rem 0;
  line-height: 1.2;
}

.museum-location {
  margin-bottom: 1rem;
  font-size: 1.1rem;
  color: #6c757d;
}

.city {
  font-weight: 600;
  color: #495057;
}

.region {
  margin-left: 0.5rem;
  color: #adb5bd;
}

.museum-theme {
  background: #007bff;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
  display: inline-block;
  width: fit-content;
}

.detail-sections {
  padding: 2rem;
}

.detail-section {
  margin-bottom: 2rem;
}

.detail-section h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 1rem 0;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #e9ecef;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-item label {
  font-weight: 600;
  color: #6c757d;
  font-size: 0.9rem;
}

.info-item span {
  color: #495057;
}

.museum-description {
  line-height: 1.6;
  color: #495057;
  font-size: 1rem;
}

.opening-hours {
  display: grid;
  gap: 0.5rem;
}

.hours-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f8f9fa;
}

.day {
  font-weight: 500;
  color: #495057;
  min-width: 80px;
}

.hours {
  color: #6c757d;
}

.pricing-info {
  display: grid;
  gap: 0.75rem;
}

.price-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 6px;
}

.price-label {
  font-weight: 500;
  color: #495057;
}

.price-value {
  font-weight: 600;
  color: #007bff;
}

.contact-info {
  display: grid;
  gap: 1rem;
}

.contact-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.contact-item label {
  font-weight: 600;
  color: #6c757d;
  font-size: 0.9rem;
}

.contact-item span {
  color: #495057;
}

.website-link {
  color: #007bff;
  text-decoration: none;
}

.website-link:hover {
  text-decoration: underline;
}

/* Styles pour la carte */
.map-container {
  width: 100%;
  height: 400px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  margin-top: 1rem;
}

.map {
  width: 100%;
  height: 100%;
}

/* Styles pour les marqueurs personnalisés */
:global(.custom-marker) {
  background: transparent;
  border: none;
}

:global(.marker-icon) {
  width: 30px;
  height: 30px;
  background: white;
  border: 2px solid #007bff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
}

:global(.marker-icon.selected) {
  background: #007bff;
  color: white;
  transform: scale(1.2);
  z-index: 1000;
}

/* Styles pour les popups */
:global(.popup-content) {
  text-align: center;
  min-width: 200px;
}

:global(.popup-content h4) {
  margin: 0 0 8px 0;
  color: #2c3e50;
  font-size: 16px;
}

:global(.popup-content p) {
  margin: 4px 0;
  color: #6c757d;
  font-size: 14px;
}

/* Responsive design */
@media (max-width: 768px) {
  .museum-hero {
    flex-direction: column;
    text-align: center;
    padding: 1.5rem;
  }

  .museum-image-large {
    width: 150px;
    height: 150px;
    margin: 0 auto;
  }

  .museum-title {
    font-size: 2rem;
  }

  .detail-sections {
    padding: 1.5rem;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .detail-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .header-actions {
    justify-content: center;
  }

  .museum-hero {
    padding: 1rem;
  }

  .detail-sections {
    padding: 1rem;
  }

  .museum-title {
    font-size: 1.5rem;
  }

  .map-container {
    height: 300px;
  }
}
</style>
