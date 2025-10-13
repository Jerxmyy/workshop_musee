<template>
  <div class="map-container">
    <div ref="mapElement" class="map"></div>
    <div class="map-controls">
      <button @click="centerOnMuseums" class="control-btn" title="Centrer sur les musées">
        🎯
      </button>
      <button @click="toggleFullscreen" class="control-btn" title="Plein écran">
        {{ isFullscreen ? '⤓' : '⤢' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const props = defineProps({
  museums: {
    type: Array,
    default: () => [],
  },
  selectedMuseum: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['museum-select'])

const mapElement = ref(null)
const map = ref(null)
const markers = ref([])
const isFullscreen = ref(false)

// Configuration des icônes Leaflet
const createIcon = (isSelected = false) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div class="marker-icon ${isSelected ? 'selected' : ''}">🏛️</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30],
  })
}

const initMap = () => {
  if (!mapElement.value) return

  // Initialiser la carte centrée sur la France
  map.value = L.map(mapElement.value, {
    zoomControl: false,
  }).setView([46.2276, 2.2137], 6)

  // Ajouter la couche de tuiles
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
  }).addTo(map.value)

  // Ajouter les contrôles de zoom
  L.control
    .zoom({
      position: 'bottomright',
    })
    .addTo(map.value)

  // Ajouter les marqueurs des musées
  updateMarkers()
}

const updateMarkers = () => {
  if (!map.value) return

  // Supprimer les anciens marqueurs
  markers.value.forEach((marker) => {
    map.value.removeLayer(marker)
  })
  markers.value = []

  // Ajouter les nouveaux marqueurs
  props.museums.forEach((museum) => {
    if (museum.coordinates && museum.coordinates.length === 2) {
      const isSelected = props.selectedMuseum?.id === museum.id
      const marker = L.marker(museum.coordinates, {
        icon: createIcon(isSelected),
      }).addTo(map.value).bindPopup(`
          <div class="popup-content">
            <h4>${museum.name}</h4>
            <p>${museum.city}, ${museum.region}</p>
            <p><strong>Thème:</strong> ${museum.theme}</p>
            <button onclick="selectMuseum(${museum.id})" class="popup-btn">
              Voir les détails
            </button>
          </div>
        `)

      // Ajouter un gestionnaire d'événement pour la sélection
      marker.on('click', () => {
        emit('museum-select', museum)
      })

      markers.value.push(marker)
    }
  })

  // Centrer la carte sur les musées si il y en a
  if (props.museums.length > 0) {
    centerOnMuseums()
  }
}

const centerOnMuseums = () => {
  if (!map.value || props.museums.length === 0) return

  const validMuseums = props.museums.filter((m) => m.coordinates && m.coordinates.length === 2)

  if (validMuseums.length === 0) return

  if (validMuseums.length === 1) {
    map.value.setView(validMuseums[0].coordinates, 12)
  } else {
    const group = new L.featureGroup(markers.value)
    map.value.fitBounds(group.getBounds().pad(0.1))
  }
}

const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value

  // Redimensionner la carte après le changement de taille
  nextTick(() => {
    if (map.value) {
      map.value.invalidateSize()
    }
  })
}

// Fonction globale pour les popups
window.selectMuseum = (museumId) => {
  const museum = props.museums.find((m) => m.id === museumId)
  if (museum) {
    emit('museum-select', museum)
  }
}

// Watchers
watch(() => props.museums, updateMarkers, { deep: true })
watch(
  () => props.selectedMuseum,
  () => {
    updateMarkers()
    if (props.selectedMuseum && props.selectedMuseum.coordinates) {
      map.value.setView(props.selectedMuseum.coordinates, 15)
    }
  },
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
  // Nettoyer la fonction globale
  delete window.selectMuseum
})
</script>

<style scoped>
.map-container {
  position: relative;
  width: 100%;
  height: 100%;
  background: #f8f9fa;
}

.map {
  width: 100%;
  height: 100%;
}

.map-controls {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.control-btn {
  width: 40px;
  height: 40px;
  background: white;
  border: 1px solid #ccc;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.control-btn:hover {
  background: #f8f9fa;
  transform: scale(1.05);
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

:global(.marker-icon:hover) {
  transform: scale(1.1);
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

:global(.popup-btn) {
  background: #007bff;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  margin-top: 8px;
  transition: background-color 0.3s ease;
}

:global(.popup-btn:hover) {
  background: #0056b3;
}

/* Responsive design */
@media (max-width: 1023px) {
  .map-container {
    display: none;
  }

  .map-container.mobile-visible {
    display: block;
  }
}

@media (max-width: 480px) {
  .map-controls {
    top: 5px;
    right: 5px;
  }

  .control-btn {
    width: 35px;
    height: 35px;
    font-size: 14px;
  }
}
</style>
