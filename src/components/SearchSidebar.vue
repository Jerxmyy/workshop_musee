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
              <select id="region" v-model="searchForm.region" class="form-select">
                <option value="">Toutes les régions</option>
                <option value="Auvergne-Rhône-Alpes">Auvergne-Rhône-Alpes</option>
                <option value="Bourgogne-Franche-Comté">Bourgogne-Franche-Comté</option>
                <option value="Bretagne">Bretagne</option>
                <option value="Centre-Val de Loire">Centre-Val de Loire</option>
                <option value="Corse">Corse</option>
                <option value="Grand Est">Grand Est</option>
                <option value="Hauts-de-France">Hauts-de-France</option>
                <option value="Île-de-France">Île-de-France</option>
                <option value="Normandie">Normandie</option>
                <option value="Nouvelle-Aquitaine">Nouvelle-Aquitaine</option>
                <option value="Occitanie">Occitanie</option>
                <option value="Pays de la Loire">Pays de la Loire</option>
                <option value="Provence-Alpes-Côte d'Azur">Provence-Alpes-Côte d'Azur</option>
              </select>
              <div class="select-arrow">▼</div>
            </div>
          </div>

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
              <select id="theme" v-model="searchForm.theme" class="form-select">
                <option value="">Toutes les thématiques</option>
                <option value="Art">Art</option>
                <option value="Histoire">Histoire</option>
                <option value="Sciences">Sciences</option>
                <option value="Archéologie">Archéologie</option>
                <option value="Ethnologie">Ethnologie</option>
                <option value="Technique">Technique</option>
                <option value="Nature">Nature</option>
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

      <!-- Filtres avancés -->
      <div class="advanced-filters">
        <div class="filters-header">
          <h3 class="filters-title">
            <span class="title-icon">⚙️</span>
            Filtres avancés
          </h3>
        </div>

        <div class="filters-grid">
          <label class="filter-option">
            <input v-model="searchForm.freeEntry" type="checkbox" class="checkbox-input" />
            <div class="checkbox-custom">
              <div class="checkbox-check">✓</div>
            </div>
            <div class="option-content">
              <span class="option-title">Entrée gratuite</span>
              <span class="option-subtitle">Musées avec accès libre</span>
            </div>
          </label>

          <label class="filter-option">
            <input
              v-model="searchForm.wheelchairAccessible"
              type="checkbox"
              class="checkbox-input"
            />
            <div class="checkbox-custom">
              <div class="checkbox-check">✓</div>
            </div>
            <div class="option-content">
              <span class="option-title">Accessible</span>
              <span class="option-subtitle">Aux fauteuils roulants</span>
            </div>
          </label>
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
import { ref, reactive } from 'vue'

const emit = defineEmits(['search'])
const props = defineProps({
  isLoading: {
    type: Boolean,
    default: false,
  },
})

const isLoadingLocation = ref(false)

const searchForm = reactive({
  text: '',
  region: '',
  city: '',
  theme: '',
  latitude: null,
  longitude: null,
  freeEntry: false,
  wheelchairAccessible: false,
})

const handleSubmit = () => {
  const searchParams = {
    text: searchForm.text.trim(),
    region: searchForm.region,
    city: searchForm.city.trim(),
    theme: searchForm.theme,
    coordinates:
      searchForm.latitude && searchForm.longitude
        ? { lat: searchForm.latitude, lng: searchForm.longitude }
        : null,
    freeEntry: searchForm.freeEntry,
    wheelchairAccessible: searchForm.wheelchairAccessible,
  }

  emit('search', searchParams)
}

const clearForm = () => {
  Object.keys(searchForm).forEach((key) => {
    if (typeof searchForm[key] === 'boolean') {
      searchForm[key] = false
    } else {
      searchForm[key] = ''
    }
  })
  searchForm.latitude = null
  searchForm.longitude = null
}

const getCurrentLocation = () => {
  if (!navigator.geolocation) {
    alert("La géolocalisation n'est pas supportée par ce navigateur.")
    return
  }

  isLoadingLocation.value = true

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
</script>

<style scoped>
/* Container principal */
.search-sidebar {
  width: 100%;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
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
  background: linear-gradient(90deg, #667eea, #764ba2, #f093fb, #f5576c);
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

/* Header de recherche */
.search-header {
  text-align: center;
  padding: 1rem 1.5rem 0.75rem 1.5rem;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
  border-bottom: 1px solid rgba(102, 126, 234, 0.1);
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
  color: #2c3e50;
  margin: 0 0 0.25rem 0;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.search-subtitle {
  font-size: 0.8rem;
  color: #7f8c8d;
  margin: 0;
  font-weight: 400;
}

/* Formulaire principal */
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
  color: #2c3e50;
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
  border: 2px solid rgba(102, 126, 234, 0.2);
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 500;
  color: #2c3e50;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  z-index: 2;
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: #667eea;
  background: white;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
  transform: translateY(-2px);
}

.form-input::placeholder {
  color: #a0aec0;
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
  background: linear-gradient(90deg, #667eea, #764ba2);
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
  color: #667eea;
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
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
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
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
}

.location-btn:disabled {
  background: #bdc3c7;
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

/* Filtres avancés */
.advanced-filters {
  background: rgba(102, 126, 234, 0.03);
  border-radius: 12px;
  padding: 1rem;
  border: 1px solid rgba(102, 126, 234, 0.1);
}

.filters-header {
  margin-bottom: 1rem;
}

.filters-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.1rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0;
}

.title-icon {
  font-size: 1.2rem;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.filters-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

/* Options de filtre */
.filter-option {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: white;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 2px solid transparent;
  position: relative;
  overflow: hidden;
}

.filter-option::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05), rgba(118, 75, 162, 0.05));
  opacity: 0;
  transition: opacity 0.3s ease;
}

.filter-option:hover::before {
  opacity: 1;
}

.filter-option:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.15);
  border-color: rgba(102, 126, 234, 0.2);
}

.checkbox-input {
  display: none;
}

.checkbox-custom {
  width: 24px;
  height: 24px;
  border: 2px solid #e1e8ed;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  z-index: 2;
}

.checkbox-check {
  color: white;
  font-size: 0.8rem;
  font-weight: bold;
  opacity: 0;
  transform: scale(0.5);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.checkbox-input:checked + .checkbox-custom {
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-color: #667eea;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.checkbox-input:checked + .checkbox-custom .checkbox-check {
  opacity: 1;
  transform: scale(1);
}

.option-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  position: relative;
  z-index: 2;
}

.option-title {
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.95rem;
}

.option-subtitle {
  font-size: 0.8rem;
  color: #7f8c8d;
  font-weight: 400;
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
  background: linear-gradient(135deg, #27ae60, #2ecc71);
  color: white;
  box-shadow: 0 6px 20px rgba(39, 174, 96, 0.3);
}

.search-btn:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 12px 30px rgba(39, 174, 96, 0.4);
}

.search-btn:disabled {
  background: #bdc3c7;
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

  .filters-grid {
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

  .advanced-filters {
    padding: 1rem;
  }

  .filter-option {
    padding: 0.75rem;
  }
}
</style>
