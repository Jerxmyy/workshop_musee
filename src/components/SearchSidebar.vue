<template>
  <div class="search-sidebar">
    <!-- Header de recherche -->
    <div class="search-header">
      <div class="search-icon">🔍</div>
      <h2 class="search-title">Rechercher des musées</h2>
      <p class="search-subtitle">Découvrez les trésors culturels près de chez vous</p>
    </div>

    <!-- Formulaire de recherche -->
    <form @submit.prevent="handleSubmit" class="search-form">
      <!-- Section principale -->
      <div class="search-main">
        <!-- Recherche textuelle -->
        <div class="form-group primary">
          <label for="text-search" class="form-label">
            <span class="label-icon">📝</span>
            Recherche textuelle
          </label>
          <div class="input-wrapper">
            <input
              id="text-search"
              v-model="searchForm.text"
              type="text"
              placeholder="Nom du musée, description, artiste..."
              class="form-input primary-input"
            />
            <div class="input-decoration"></div>
          </div>
        </div>

        <!-- Filtres géographiques -->
        <div class="filters-row">
          <div class="form-group">
            <label for="region" class="form-label">
              <span class="label-icon">🗺️</span>
              Région
            </label>
            <div class="select-wrapper">
              <select
                id="region"
                v-model="searchForm.region"
                class="form-select"
                :disabled="isLoadingRegions"
              >
                <option value="">
                  {{ isLoadingRegions ? 'Chargement...' : 'Toutes les régions' }}
                </option>
                <option v-for="region in availableRegions" :key="region" :value="region">
                  {{ region }}
                </option>
              </select>
              <div class="select-arrow">▼</div>
            </div>
          </div>

          <div class="form-group">
            <label for="department" class="form-label">
              <span class="label-icon">🏛️</span>
              Département
            </label>
            <div class="select-wrapper">
              <select
                id="department"
                v-model="searchForm.department"
                class="form-select"
                :disabled="isLoadingDepartments"
              >
                <option value="">
                  {{ isLoadingDepartments ? 'Chargement...' : 'Tous les départements' }}
                </option>
                <option
                  v-for="department in availableDepartments"
                  :key="department"
                  :value="department"
                >
                  {{ department }}
                </option>
              </select>
              <div class="select-arrow">▼</div>
            </div>
          </div>
        </div>

        <div class="filters-row">
          <div class="form-group">
            <label for="city" class="form-label">
              <span class="label-icon">🏙️</span>
              Ville
            </label>
            <div class="input-wrapper">
              <input
                id="city"
                v-model="searchForm.city"
                type="text"
                placeholder="Nom de la ville"
                class="form-input"
              />
              <div class="input-decoration"></div>
            </div>
          </div>
        </div>

        <!-- Filtres thématiques -->
        <div class="filters-row">
          <div class="form-group">
            <label for="theme" class="form-label">
              <span class="label-icon">🎨</span>
              Thématique
            </label>
            <div class="select-wrapper">
              <select
                id="theme"
                v-model="searchForm.theme"
                class="form-select"
                :disabled="isLoadingThemes"
              >
                <option value="">
                  {{ isLoadingThemes ? 'Chargement...' : 'Toutes les thématiques' }}
                </option>
                <option v-for="theme in availableThemes" :key="theme" :value="theme">
                  {{ theme }}
                </option>
              </select>
              <div class="select-arrow">▼</div>
            </div>
          </div>

          <!-- Coordonnées géographiques -->
          <div class="form-group coordinates-group">
            <label class="form-label">
              <span class="label-icon">📍</span>
              Ma position
            </label>
            <div class="coordinates-container">
              <div class="coordinates-inputs">
                <div class="input-wrapper">
                  <input
                    v-model.number="searchForm.latitude"
                    type="number"
                    step="any"
                    placeholder="Latitude"
                    class="form-input coordinate-input"
                  />
                  <div class="input-decoration"></div>
                </div>
                <div class="input-wrapper">
                  <input
                    v-model.number="searchForm.longitude"
                    type="number"
                    step="any"
                    placeholder="Longitude"
                    class="form-input coordinate-input"
                  />
                  <div class="input-decoration"></div>
                </div>
              </div>
              <button
                type="button"
                @click="getCurrentLocation"
                class="location-btn"
                :disabled="isLoadingLocation"
              >
                <span class="btn-icon">{{ isLoadingLocation ? '⏳' : '📍' }}</span>
                <span class="btn-text">{{
                  isLoadingLocation ? 'Localisation...' : 'Ma position'
                }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Boutons d'action -->
      <div class="form-actions">
        <button type="submit" class="search-btn" :disabled="isLoading">
          <span class="btn-icon">{{ isLoading ? '⏳' : '🔍' }}</span>
          <span class="btn-text">{{ isLoading ? 'Recherche...' : 'Rechercher' }}</span>
          <div class="btn-shine"></div>
        </button>
        <button type="button" @click="clearForm" class="clear-btn">
          <span class="btn-icon">🗑️</span>
          <span class="btn-text">Effacer</span>
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import museofileApi from '../services/museofileApi'

const emit = defineEmits(['search'])
const props = defineProps({
  isLoading: {
    type: Boolean,
    default: false,
  },
})

const isLoadingLocation = ref(false)
const availableThemes = ref([])
const availableRegions = ref([])
const availableDepartments = ref([])
const isLoadingThemes = ref(false)
const isLoadingRegions = ref(false)
const isLoadingDepartments = ref(false)

const searchForm = reactive({
  text: '',
  region: '',
  department: '',
  city: '',
  theme: '',
  latitude: null,
  longitude: null,
})

const handleSubmit = () => {
  const searchParams = {
    text: searchForm.text.trim(),
    region: searchForm.region,
    department: searchForm.department,
    city: searchForm.city.trim(),
    theme: searchForm.theme,
    coordinates:
      searchForm.latitude && searchForm.longitude
        ? { lat: searchForm.latitude, lng: searchForm.longitude }
        : null,
  }

  emit('search', searchParams)
}

const clearForm = () => {
  Object.keys(searchForm).forEach((key) => {
    if (key === 'latitude' || key === 'longitude') {
      searchForm[key] = null
    } else {
      searchForm[key] = ''
    }
  })
}

const loadThemes = async () => {
  isLoadingThemes.value = true
  try {
    const facets = await museofileApi.getFacets()
    const themeFacet = facets.find((facet) => facet.name === 'thematique')
    if (themeFacet) {
      availableThemes.value = themeFacet.facets.map((f) => f.name).sort()
    }
  } catch (error) {
    console.error('Erreur lors du chargement des thématiques:', error)
    // Fallback vers les thématiques par défaut
    availableThemes.value = [
      'Art',
      'Histoire',
      'Sciences',
      'Archéologie',
      'Ethnologie',
      'Technique',
      'Nature',
      'Beaux-arts',
      'Arts décoratifs',
    ]
  } finally {
    isLoadingThemes.value = false
  }
}

const loadRegions = async () => {
  isLoadingRegions.value = true
  try {
    const facets = await museofileApi.getFacets()
    const regionFacet = facets.find((facet) => facet.name === 'region')
    if (regionFacet) {
      availableRegions.value = regionFacet.facets.map((f) => f.name).sort()
    }
  } catch (error) {
    console.error('Erreur lors du chargement des régions:', error)
    // Fallback vers les régions par défaut
    availableRegions.value = [
      'Auvergne-Rhône-Alpes',
      'Bourgogne-Franche-Comté',
      'Bretagne',
      'Centre-Val de Loire',
      'Corse',
      'DROM',
      'Grand Est',
      'Hauts-de-France',
      'Île-de-France',
      'Normandie',
      'Nouvelle-Aquitaine',
      'Occitanie',
      'Pays de la Loire',
      "Provence-Alpes-Côte d'Azur",
    ]
  } finally {
    isLoadingRegions.value = false
  }
}

const loadDepartments = async () => {
  isLoadingDepartments.value = true
  try {
    const facets = await museofileApi.getFacets()
    const departmentFacet = facets.find((facet) => facet.name === 'departement')
    if (departmentFacet) {
      availableDepartments.value = departmentFacet.facets.map((f) => f.name).sort()
    }
  } catch (error) {
    console.error('Erreur lors du chargement des départements:', error)
    // Fallback vers les départements par défaut (triés par ordre alphabétique)
    availableDepartments.value = [
      'Ain',
      'Aisne',
      'Allier',
      'Alpes-de-Haute-Provence',
      'Alpes-Maritimes',
      'Ardèche',
      'Ardennes',
      'Ariège',
      'Aube',
      'Aude',
      'Aveyron',
      'Bas-Rhin',
      'Bouches-du-Rhône',
      'Calvados',
      'Cantal',
      'Charente',
      'Charente-Maritime',
      'Cher',
      'Corrèze',
      'Corse-du-Sud',
      "Côte-d'Or",
      "Côtes-d'Armor",
      'Creuse',
      'Deux-Sèvres',
      'Dordogne',
      'Doubs',
      'Drôme',
      'Essonne',
      'Eure',
      'Eure-et-Loir',
      'Finistère',
      'Gard',
      'Gers',
      'Gironde',
      'Guadeloupe',
      'Guyane',
      'Haut-Rhin',
      'Haute-Corse',
      'Haute-Garonne',
      'Haute-Loire',
      'Haute-Marne',
      'Haute-Saône',
      'Haute-Savoie',
      'Haute-Vienne',
      'Hautes-Alpes',
      'Hautes-Pyrénées',
      'Hauts-de-Seine',
      'Hérault',
      'Ille-et-Vilaine',
      'Indre',
      'Indre-et-Loire',
      'Isère',
      'Jura',
      'La Réunion',
      'Landes',
      'Loir-et-Cher',
      'Loire',
      'Loire-Atlantique',
      'Loiret',
      'Lot',
      'Lot-et-Garonne',
      'Lozère',
      'Maine-et-Loire',
      'Manche',
      'Marne',
      'Martinique',
      'Mayenne',
      'Mayotte',
      'Meurthe-et-Moselle',
      'Meuse',
      'Morbihan',
      'Moselle',
      'Nièvre',
      'Nord',
      'Oise',
      'Orne',
      'Paris',
      'Pas-de-Calais',
      'Puy-de-Dôme',
      'Pyrénées-Atlantiques',
      'Pyrénées-Orientales',
      'Réunion',
      'Rhône',
      'Saint-Pierre-et-Miquelon',
      'Saône-et-Loire',
      'Sarthe',
      'Savoie',
      'Seine-et-Marne',
      'Seine-Maritime',
      'Seine-Saint-Denis',
      'Somme',
      'Tarn',
      'Tarn-et-Garonne',
      'Territoire de Belfort',
      "Val-d'Oise",
      'Val-de-Marne',
      'Var',
      'Vaucluse',
      'Vendée',
      'Vosges',
      'Yonne',
      'Yvelines',
    ]
  } finally {
    isLoadingDepartments.value = false
  }
}

const getCurrentLocation = () => {
  if (!navigator.geolocation) {
    alert("La géolocalisation n'est pas supportée par ce navigateur.")
    return
  }

  isLoadingLocation.value = true
  // console.log('getting location...') // debug

  navigator.geolocation.getCurrentPosition(
    (position) => {
      searchForm.latitude = position.coords.latitude
      searchForm.longitude = position.coords.longitude
      isLoadingLocation.value = false
    },
    (error) => {
      console.error('Erreur de géolocalisation:', error)
      alert("Impossible d'obtenir votre position.")
      isLoadingLocation.value = false
    },
  )
}

// Charger les thématiques, régions et départements au montage du composant
onMounted(() => {
  loadThemes()
  loadRegions()
  loadDepartments()
})
</script>

<style scoped>
/* main container */
.search-sidebar {
  width: 100%;
  background: linear-gradient(135deg, rgba(45, 45, 45, 0.95) 0%, rgba(60, 60, 60, 0.95) 100%);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  position: relative;
}

.search-sidebar::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #007acc, #00a8ff, #007acc, #00a8ff);
  background-size: 300% 100%;
  animation: gradientShift 3s ease infinite;
}

@keyframes gradientShift {
  0%,
  100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

/* search header */
.search-header {
  text-align: center;
  padding: 1rem 1.5rem 0.75rem 1.5rem;
  background: linear-gradient(135deg, rgba(0, 122, 204, 0.1) 0%, rgba(0, 168, 255, 0.1) 100%);
  border-bottom: 1px solid rgba(0, 122, 204, 0.2);
}

.search-icon {
  font-size: 1.8rem;
  margin-bottom: 0.25rem;
  filter: drop-shadow(0 2px 4px rgba(102, 126, 234, 0.3));
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-3px);
  }
}

.search-title {
  font-size: 1.3rem;
  font-weight: 700;
  color: #e5e5e5;
  margin: 0 0 0.25rem 0;
  background: linear-gradient(135deg, #007acc, #00a8ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.search-subtitle {
  font-size: 0.8rem;
  color: #a0a0a0;
  margin: 0;
  font-weight: 400;
}

/* main form */
.search-form {
  padding: 1rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.search-main {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* Groupes de filtres */
.filters-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  align-items: start;
}

/* Groupes de formulaire */
.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  position: relative;
}

.form-group.primary {
  grid-column: 1 / -1;
}

.form-group.coordinates-group {
  grid-column: 1 / -1;
}

/* Labels */
.form-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: #e5e5e5;
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
}

.label-icon {
  font-size: 1rem;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

/* Wrappers pour les inputs */
.input-wrapper,
.select-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

/* Inputs et selects */
.form-input,
.form-select {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid rgba(0, 122, 204, 0.3);
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 500;
  color: #e5e5e5;
  background: rgba(60, 60, 60, 0.8);
  backdrop-filter: blur(10px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  z-index: 2;
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: #007acc;
  background: rgba(70, 70, 70, 0.9);
  box-shadow: 0 0 0 4px rgba(0, 122, 204, 0.2);
  transform: translateY(-2px);
}

.form-input::placeholder {
  color: #888888;
  font-weight: 400;
}

.primary-input {
  font-size: 1rem;
  padding: 0.875rem 1.25rem;
  border-radius: 12px;
  border-color: rgba(102, 126, 234, 0.3);
}

/* Décoration des inputs */
.input-decoration {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, #007acc, #00a8ff);
  border-radius: 1px;
  transform: scaleX(0);
  transition: transform 0.3s ease;
  z-index: 1;
}

.form-input:focus + .input-decoration {
  transform: scaleX(1);
}

/* Flèche des selects */
.select-arrow {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #007acc;
  font-size: 0.8rem;
  pointer-events: none;
  z-index: 3;
  transition: transform 0.3s ease;
}

.form-select:focus + .select-arrow {
  transform: translateY(-50%) rotate(180deg);
}

/* Coordonnées */
.coordinates-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.coordinates-inputs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.coordinate-input {
  font-size: 0.9rem;
  padding: 0.875rem 1rem;
}

/* Bouton de localisation */
.location-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 1.5rem;
  background: linear-gradient(135deg, #007acc, #00a8ff);
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 15px rgba(0, 122, 204, 0.3);
  position: relative;
  overflow: hidden;
}

.location-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.location-btn:hover::before {
  left: 100%;
}

.location-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 122, 204, 0.4);
}

.location-btn:disabled {
  background: #666666;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.btn-icon {
  font-size: 1rem;
}

.btn-text {
  font-weight: 600;
}

/* Boutons d'action */
.form-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
  margin-top: 0.75rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(102, 126, 234, 0.1);
}

.search-btn,
.clear-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  min-width: 140px;
  justify-content: center;
}

.search-btn {
  background: linear-gradient(135deg, #007acc, #00a8ff);
  color: white;
  box-shadow: 0 6px 20px rgba(0, 122, 204, 0.3);
}

.search-btn:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 12px 30px rgba(0, 122, 204, 0.4);
}

.search-btn:disabled {
  background: #666666;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.clear-btn {
  background: linear-gradient(135deg, #e74c3c, #c0392b);
  color: white;
  box-shadow: 0 6px 20px rgba(231, 76, 60, 0.3);
}

.clear-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 30px rgba(231, 76, 60, 0.4);
}

.btn-shine {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.6s;
}

.search-btn:hover .btn-shine {
  left: 100%;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .filters-row {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .coordinates-inputs {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .search-header {
    padding: 1.5rem 1rem 1rem 1rem;
  }

  .search-form {
    padding: 1.5rem 1rem;
    gap: 1rem;
  }

  .search-title {
    font-size: 1.5rem;
  }

  .search-subtitle {
    font-size: 0.9rem;
  }

  .form-actions {
    flex-direction: column;
    gap: 0.75rem;
  }

  .search-btn,
  .clear-btn {
    width: 100%;
    min-width: auto;
  }
}

@media (max-width: 480px) {
  .search-header {
    padding: 1rem 0.75rem 0.75rem 0.75rem;
  }

  .search-form {
    padding: 1rem 0.75rem;
  }

  .search-title {
    font-size: 1.3rem;
  }

  .search-subtitle {
    font-size: 0.85rem;
  }

  .form-input,
  .form-select {
    padding: 0.875rem 1rem;
    font-size: 0.95rem;
  }

  .primary-input {
    padding: 1rem 1.25rem;
  }
}
</style>
