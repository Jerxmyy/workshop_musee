<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useMuseumStore } from './stores/museum'
import SearchSidebar from './components/SearchSidebar.vue'
import MuseumList from './components/MuseumList.vue'
import MuseumDetail from './components/MuseumDetail.vue'
import ErrorMessage from './components/ErrorMessage.vue'

const museumStore = useMuseumStore()

const selectedMuseum = computed(() => museumStore.selectedMuseum)
const searchResults = computed(() => museumStore.museums)
const isLoading = computed(() => museumStore.isLoading)
const totalCount = computed(() => museumStore.totalCount)
const error = computed(() => museumStore.error)

const handleSearch = async (params) => {
  await museumStore.searchMuseums(params)
  // Fermer les menus après recherche
  isMobileMenuOpen.value = false
  isFiltersOpen.value = false
}

const selectMuseum = (museum) => {
  museumStore.setSelectedMuseum(museum)
}

const backToList = () => {
  museumStore.clearSelectedMuseum()
}

const handlePageChange = (page) => {
  museumStore.setPage(page)
}

const handleRetry = () => {
  museumStore.searchMuseums(museumStore.searchParams)
}

const isMobileMenuOpen = ref(false)
const isFiltersOpen = ref(false)
const isScrolled = ref(false)

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

const toggleFilters = () => {
  isFiltersOpen.value = !isFiltersOpen.value
}

const handleScroll = () => {
  isScrolled.value = window.scrollY > 50
  // Fermer les filtres quand on scroll
  if (isFiltersOpen.value) {
    isFiltersOpen.value = false
  }
}

onMounted(() => {
  // Charger quelques musées par défaut au démarrage
  museumStore.searchMuseums()

  // Écouter le scroll pour l'effet de header compact
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <div class="app-container">
    <!-- Header -->
    <header class="header" :class="{ scrolled: isScrolled }">
      <div class="header-container">
        <!-- Brand Section -->
        <div class="header-brand">
          <div class="brand-logo">
            <div class="logo-icon">🏛️</div>
            <div class="logo-text">
              <h1 class="brand-title">MuséeExplorer</h1>
              <p class="brand-subtitle">Trésors culturels de France</p>
            </div>
          </div>
        </div>

        <!-- Navigation Section -->
        <nav class="header-nav desktop-only">
          <div class="nav-item">
            <span class="nav-icon">🏠</span>
            <span class="nav-text">Accueil</span>
          </div>
          <div class="nav-item">
            <span class="nav-icon">⭐</span>
            <span class="nav-text">Favoris</span>
          </div>
          <div class="nav-item">
            <span class="nav-icon">📍</span>
            <span class="nav-text">Proche</span>
          </div>
        </nav>

        <!-- Actions Section -->
        <div class="header-actions">
          <!-- Search Button -->
          <button
            @click="toggleFilters"
            class="action-btn search-btn desktop-only"
            :class="{ active: isFiltersOpen }"
          >
            <div class="btn-icon">🔍</div>
            <div class="btn-content">
              <span class="btn-text">Rechercher</span>
              <span class="btn-arrow" :class="{ open: isFiltersOpen }">▼</span>
            </div>
          </button>

          <!-- Favorites Button -->
          <button class="action-btn favorites-btn desktop-only">
            <div class="btn-icon">❤️</div>
            <span class="btn-badge">3</span>
          </button>

          <!-- Mobile Menu Button -->
          <button
            @click="toggleMobileMenu"
            class="action-btn mobile-menu-btn mobile-only"
            :class="{ active: isMobileMenuOpen }"
          >
            <div class="hamburger">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </button>
        </div>
      </div>

      <!-- Search Panel (Desktop) -->
      <div class="search-panel desktop-only" :class="{ open: isFiltersOpen }">
        <div class="search-panel-content">
          <SearchSidebar @search="handleSearch" :is-loading="isLoading" />
        </div>
      </div>

      <!-- Mobile Overlay -->
      <div v-if="isMobileMenuOpen" class="mobile-overlay" @click="toggleMobileMenu"></div>

      <!-- Mobile Menu -->
      <div class="mobile-menu" :class="{ open: isMobileMenuOpen }">
        <div class="mobile-menu-content">
          <SearchSidebar @search="handleSearch" :is-loading="isLoading" />
        </div>
      </div>
    </header>

    <!-- Contenu principal -->
    <div class="main-content" :class="{ 'search-open': isFiltersOpen }">
      <div class="results-section">
        <MuseumDetail v-if="selectedMuseum" :museum="selectedMuseum" @back="backToList" />
        <MuseumList
          v-else
          :museums="searchResults"
          :is-loading="isLoading"
          :total-count="totalCount"
          @select-museum="selectMuseum"
          @page-change="handlePageChange"
        />
      </div>
    </div>

    <!-- Message d'erreur -->
    <ErrorMessage v-if="error" :error="error" @retry="handleRetry" />
  </div>
</template>

<style scoped>
/* Header Container */
.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.header.scrolled {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.95) 0%, rgba(118, 75, 162, 0.95) 100%);
  backdrop-filter: blur(20px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.header-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem 2rem;
  max-width: 1400px;
  margin: 0 auto;
  transition: padding 0.3s ease;
}

.header.scrolled .header-container {
  padding: 1rem 2rem;
}

/* Brand Section */
.header-brand {
  flex-shrink: 0;
}

.brand-logo {
  display: flex;
  align-items: center;
  gap: 1rem;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.brand-logo:hover {
  transform: scale(1.02);
}

.logo-icon {
  font-size: 2.5rem;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-5px);
  }
}

.logo-text {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.brand-title {
  font-size: 1.8rem;
  font-weight: 800;
  color: white;
  margin: 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  letter-spacing: -0.5px;
}

.brand-subtitle {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
  font-weight: 500;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

/* Navigation Section */
.header-nav {
  display: flex;
  align-items: center;
  gap: 2rem;
  margin: 0 2rem;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.nav-icon {
  font-size: 1.1rem;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

.nav-text {
  font-size: 0.9rem;
  font-weight: 600;
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

/* Actions Section */
.header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.action-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.action-btn:hover::before {
  left: 100%;
}

.search-btn {
  background: rgba(255, 255, 255, 0.95);
  color: #2c3e50;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.search-btn:hover {
  background: white;
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.search-btn.active {
  background: #3498db;
  color: white;
  box-shadow: 0 6px 20px rgba(52, 152, 219, 0.4);
}

.favorites-btn {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
}

.favorites-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.btn-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background: #e74c3c;
  color: white;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 0.25rem 0.5rem;
  border-radius: 10px;
  min-width: 18px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(231, 76, 60, 0.3);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

.btn-icon {
  font-size: 1.1rem;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

.btn-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-text {
  font-size: 0.9rem;
}

.btn-arrow {
  font-size: 0.8rem;
  transition: transform 0.3s ease;
}

.btn-arrow.open {
  transform: rotate(180deg);
}

/* Mobile Menu Button */
.mobile-menu-btn {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 0.75rem;
  width: 50px;
  height: 50px;
  justify-content: center;
}

.mobile-menu-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.hamburger {
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 20px;
  height: 16px;
}

.hamburger span {
  width: 100%;
  height: 2px;
  background: white;
  border-radius: 2px;
  transition: all 0.3s ease;
  transform-origin: center;
}

.mobile-menu-btn.active .hamburger span:nth-child(1) {
  transform: rotate(45deg) translate(5px, 5px);
}

.mobile-menu-btn.active .hamburger span:nth-child(2) {
  opacity: 0;
}

.mobile-menu-btn.active .hamburger span:nth-child(3) {
  transform: rotate(-45deg) translate(5px, -5px);
}

/* Search Panel */
.search-panel {
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(20px);
  border-radius: 0 0 20px 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  max-height: 0;
  overflow: hidden;
  opacity: 0;
  transform: translateY(-20px);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  pointer-events: none;
  position: relative;
  z-index: 100;
}

.search-panel.open {
  max-height: 40vh;
  opacity: 1;
  transform: translateY(0);
  pointer-events: auto;
}

.search-panel-content {
  padding: 1.5rem;
  max-height: 40vh;
  overflow-y: auto;
}

/* Ajustement du contenu principal quand la recherche est ouverte */
.main-content.search-open {
  margin-top: 2rem;
  transition: margin-top 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Mobile Menu */
.mobile-menu {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(20px);
  z-index: 1000;
  transform: translateY(-100%);
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.mobile-menu.open {
  transform: translateY(0);
}

.mobile-menu-content {
  padding: 6rem 2rem 2rem 2rem;
}

.mobile-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  backdrop-filter: blur(5px);
}

/* Utility Classes */
.desktop-only {
  display: block;
}

.mobile-only {
  display: none;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .header-nav {
    gap: 1rem;
    margin: 0 1rem;
  }

  .nav-item {
    padding: 0.5rem 1rem;
  }

  .nav-text {
    display: none;
  }
}

@media (max-width: 768px) {
  .desktop-only {
    display: none;
  }

  .mobile-only {
    display: block;
  }

  .header-container {
    padding: 1rem 1.5rem;
  }

  .brand-title {
    font-size: 1.5rem;
  }

  .brand-subtitle {
    font-size: 0.75rem;
  }

  .logo-icon {
    font-size: 2rem;
  }
}

@media (max-width: 480px) {
  .header-container {
    padding: 0.75rem 1rem;
  }

  .brand-title {
    font-size: 1.3rem;
  }

  .brand-subtitle {
    font-size: 0.7rem;
  }

  .logo-icon {
    font-size: 1.8rem;
  }

  .action-btn {
    padding: 0.5rem 1rem;
  }

  .mobile-menu-content {
    padding: 5rem 1rem 1.5rem 1rem;
  }
}
</style>
