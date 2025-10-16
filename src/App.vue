<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useMuseumStore } from './stores/museum'
import { useAuthStore } from './stores/auth'
import SearchSidebar from './components/SearchSidebar.vue'
import MuseumList from './components/MuseumList.vue'
import MuseumDetail from './components/MuseumDetail.vue'
import FavoritesPage from './components/FavoritesPage.vue'
import LoginPage from './components/LoginPage.vue'
import ErrorMessage from './components/ErrorMessage.vue'

const museumStore = useMuseumStore()
const authStore = useAuthStore()

const selectedMuseum = computed(() => museumStore.selectedMuseum)
const searchResults = computed(() => museumStore.museums)
const isLoading = computed(() => museumStore.isLoading)
const totalCount = computed(() => museumStore.totalCount)
const error = computed(() => museumStore.error)
const favoritesCount = computed(() => museumStore.favorites.length)

// État d'authentification
const isAuthenticated = computed(() => authStore.isAuthenticated)
const currentUser = computed(() => authStore.userInfo)

// navigation state
const currentPage = ref('search') // 'search', 'favorites', ou 'login'

const handleSearch = async (params) => {
  await museumStore.searchMuseums(params)
  // close menus after search
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

// Navigation
const goToFavorites = () => {
  currentPage.value = 'favorites'
  isMobileMenuOpen.value = false
  isFiltersOpen.value = false
}

const goToSearch = () => {
  currentPage.value = 'search'
  isMobileMenuOpen.value = false
  isFiltersOpen.value = false
}

const goToAccount = () => {
  currentPage.value = 'login' // La page login devient la page compte quand connecté
  isMobileMenuOpen.value = false
  isFiltersOpen.value = false
}

const goToRegister = () => {
  // TODO: implement register page
  alert("Page d'inscription - Fonctionnalité à venir !")
  isMobileMenuOpen.value = false
  isFiltersOpen.value = false
}

const handleLoginSuccess = () => {
  currentPage.value = 'search'
}

const handleLogout = async () => {
  await authStore.logout()
  currentPage.value = 'search'
  isMobileMenuOpen.value = false
  isFiltersOpen.value = false
}

const handleLogoutSuccess = () => {
  currentPage.value = 'search'
  isMobileMenuOpen.value = false
  isFiltersOpen.value = false
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
  // close filters when scrolling
  if (isFiltersOpen.value) {
    isFiltersOpen.value = false
  }
}

onMounted(async () => {
  // Initialiser l'authentification
  await authStore.initializeAuth()

  // load some museums on startup
  museumStore.searchMuseums()

  // listen for scroll to make header compact
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
          <div class="brand-logo" @click="goToSearch">
            <img
              src="/logo.png?v=4"
              alt="MuséeExplorer"
              class="logo-image"
              style="
                width: 150px;
                height: 150px;
                display: block;
                object-fit: contain;
                flex-shrink: 0;
              "
            />
          </div>
        </div>

        <!-- Navigation Section -->
        <nav class="header-nav desktop-only">
          <div class="nav-item" :class="{ active: currentPage === 'search' }" @click="goToSearch">
            <span class="nav-icon">🏠</span>
            <span class="nav-text">Accueil</span>
          </div>
          <div
            class="nav-item"
            :class="{ active: currentPage === 'favorites' }"
            @click="goToFavorites"
          >
            <span class="nav-icon">❤️</span>
            <span class="nav-text">Favoris</span>
            <span v-if="favoritesCount > 0" class="nav-badge">{{ favoritesCount }}</span>
          </div>
          <div class="nav-item" @click="goToAccount">
            <span class="nav-icon">👤</span>
            <span class="nav-text">{{ isAuthenticated ? 'Compte' : 'Connexion' }}</span>
          </div>
        </nav>

        <!-- Actions Section -->
        <div class="header-actions">
          <!-- Logout Icon (Desktop) -->
          <button
            v-if="isAuthenticated"
            @click="handleLogout"
            class="logout-icon-btn desktop-only"
            title="Se déconnecter"
          >
            <span class="btn-icon">🚪</span>
          </button>

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
          <!-- Mobile Navigation -->
          <div class="mobile-nav">
            <div
              class="mobile-nav-item"
              :class="{ active: currentPage === 'search' }"
              @click="goToSearch"
            >
              <span class="nav-icon">🏠</span>
              <span class="nav-text">Accueil</span>
            </div>
            <div
              class="mobile-nav-item"
              :class="{ active: currentPage === 'favorites' }"
              @click="goToFavorites"
            >
              <span class="nav-icon">❤️</span>
              <span class="nav-text">Favoris</span>
              <span v-if="favoritesCount > 0" class="nav-badge">{{ favoritesCount }}</span>
            </div>
            <div class="mobile-nav-item" @click="goToAccount">
              <span class="nav-icon">👤</span>
              <span class="nav-text">{{ isAuthenticated ? 'Compte' : 'Connexion' }}</span>
            </div>
            <div v-if="isAuthenticated" class="mobile-nav-item logout-item" @click="handleLogout">
              <span class="nav-icon">🚪</span>
              <span class="nav-text">Déconnexion</span>
            </div>
          </div>

          <SearchSidebar @search="handleSearch" :is-loading="isLoading" />
        </div>
      </div>
    </header>

    <!-- Contenu principal -->
    <div class="main-content" :class="{ 'search-open': isFiltersOpen }">
      <div class="results-section">
        <LoginPage
          v-if="currentPage === 'login'"
          @go-to-register="goToRegister"
          @login-success="handleLoginSuccess"
          @logout-success="handleLogoutSuccess"
        />
        <MuseumDetail v-else-if="selectedMuseum" :museum="selectedMuseum" @back="backToList" />
        <FavoritesPage
          v-else-if="currentPage === 'favorites'"
          @select-museum="selectMuseum"
          @go-to-search="goToSearch"
        />
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
  background: #2d2d2d;
  border-bottom: 1px solid #404040;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  position: sticky;
  top: 0;
  z-index: 1000;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.header.scrolled {
  background: rgba(45, 45, 45, 0.95);
  backdrop-filter: blur(20px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
}

.header-container {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  padding: 0.75rem 2rem;
  max-width: 1400px;
  margin: 0 auto;
  transition: padding 0.3s ease;
}

.header.scrolled .header-container {
  padding: 0.5rem 2rem;
}

/* Brand Section */
.header-brand {
  grid-column: 1;
  justify-self: start;
}

.brand-logo {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0;
  cursor: pointer;
  transition: transform 0.3s ease;
  flex-shrink: 0;
}

.brand-logo:hover {
  transform: scale(1.02);
}

.logo-image {
  width: 120px !important;
  height: 120px !important;
  min-width: 120px;
  min-height: 120px;
  max-width: 120px;
  max-height: 120px;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
  object-fit: contain;
  display: block;
  flex-shrink: 0;
}

/* Navigation Section */
.header-nav {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  grid-column: 2;
  flex-wrap: nowrap;
}

.nav-item {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #404040;
  border: 1px solid #555555;
  white-space: nowrap;
  vertical-align: middle;
  margin: 0 0.5rem;
}

.nav-item:hover {
  background: #4a4a4a;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.nav-item.active {
  background: #007acc;
  color: white;
  border-color: #007acc;
  box-shadow: 0 2px 8px rgba(0, 122, 204, 0.4);
}

.nav-badge {
  background: #e74c3c;
  color: white;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 0.2rem 0.5rem;
  border-radius: 10px;
  min-width: 18px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(231, 76, 60, 0.3);
  animation: pulse 2s infinite;
}

.nav-icon {
  font-size: 1.1rem;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

.nav-text {
  font-size: 0.9rem;
  font-weight: 500;
  color: #e5e5e5;
  transition: color 0.3s ease;
}

.nav-item.active .nav-text {
  color: white;
}

/* Actions Section */
.header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
  grid-column: 3;
  justify-self: end;
}

/* Logout Icon Button */
.logout-icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #e74c3c, #c0392b);
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(231, 76, 60, 0.3);
}

.logout-icon-btn:hover {
  background: linear-gradient(135deg, #c0392b, #a93226);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(231, 76, 60, 0.4);
}

.logout-icon-btn .btn-icon {
  font-size: 1.2rem;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
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
  background: #404040;
  color: #e5e5e5;
  border: 1px solid #555555;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

.search-btn:hover {
  background: #4a4a4a;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.search-btn.active {
  background: #007acc;
  color: white;
  border-color: #007acc;
  box-shadow: 0 2px 8px rgba(0, 122, 204, 0.4);
}

.favorites-btn {
  background: #404040;
  color: #e5e5e5;
  border: 1px solid #555555;
  position: relative;
}

.favorites-btn:hover {
  background: #4a4a4a;
  transform: translateY(-1px);
}

.favorites-btn.active {
  background: #007acc;
  color: white;
  border-color: #007acc;
  box-shadow: 0 2px 8px rgba(0, 122, 204, 0.4);
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
  background: #404040;
  color: #e5e5e5;
  border: 1px solid #555555;
  padding: 0.75rem;
  width: 50px;
  height: 50px;
  justify-content: center;
}

.mobile-menu-btn:hover {
  background: #4a4a4a;
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
  background: #e5e5e5;
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
  background: rgba(45, 45, 45, 0.98);
  backdrop-filter: blur(20px);
  border-radius: 0 0 20px 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
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
  background: rgba(45, 45, 45, 0.98);
  backdrop-filter: blur(20px);
  z-index: 1000;
  transform: translateY(-100%);
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.mobile-menu.open {
  transform: translateY(0);
}

.mobile-menu-content {
  padding: 6rem 2rem 2rem 2rem;
}

.mobile-nav {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid #555555;
}

.mobile-nav-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #404040;
  border: 1px solid #555555;
  position: relative;
}

.mobile-nav-item:hover {
  background: #4a4a4a;
  transform: translateX(5px);
}

.mobile-nav-item.active {
  background: #007acc;
  color: white;
  box-shadow: 0 2px 8px rgba(0, 122, 204, 0.4);
}

.mobile-nav-item .nav-icon {
  font-size: 1.2rem;
}

.mobile-nav-item .nav-text {
  font-size: 1rem;
  font-weight: 600;
  flex: 1;
  color: #e5e5e5;
}

.mobile-nav-item.active .nav-text {
  color: white;
}

.mobile-nav-item .nav-badge {
  background: #e74c3c;
  color: white;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 0.2rem 0.5rem;
  border-radius: 10px;
  min-width: 18px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(231, 76, 60, 0.3);
}

.mobile-nav-item.logout-item {
  background: linear-gradient(135deg, #e74c3c, #c0392b);
  color: white;
  border-color: #c0392b;
}

.mobile-nav-item.logout-item:hover {
  background: linear-gradient(135deg, #c0392b, #a93226);
  transform: translateX(5px);
  box-shadow: 0 4px 12px rgba(231, 76, 60, 0.4);
}

.mobile-nav-item.logout-item .nav-text {
  color: white;
  font-weight: 600;
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
</style>
