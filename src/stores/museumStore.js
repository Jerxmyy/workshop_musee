import { defineStore } from 'pinia'
import museumApiService from '../services/museumApi.js'

export const useMuseumStore = defineStore('museum', {
  state: () => ({
    // Résultats de recherche
    searchResults: [],
    totalResults: 0,
    isLoading: false,
    searchError: null,

    // Musée sélectionné
    selectedMuseum: null,
    museumDetails: null,

    // Filtres de recherche
    currentFilters: {
      query: '',
      theme: '',
      region: '',
      city: '',
      limit: 20,
      offset: 0,
    },

    // Facettes disponibles
    facets: {
      themes: [],
      regions: [],
      cities: [],
      departments: [],
    },

    // Favoris
    favorites: new Set(),
    favoritesData: new Map(), // Stocke les données complètes des favoris avec date

    // Géolocalisation
    userLocation: null,
    nearbyMuseums: [],
  }),

  getters: {
    // Vérifie si un musée est en favori
    isFavorite: (state) => (museumId) => {
      return state.favorites.has(museumId)
    },

    // Retourne les musées favoris
    favoriteMuseums: (state) => {
      return Array.from(state.favoritesData.values())
    },

    // Retourne le nombre de résultats
    resultsCount: (state) => {
      return state.searchResults.length
    },

    // Vérifie s'il y a des filtres actifs
    hasActiveFilters: (state) => {
      return (
        state.currentFilters.query ||
        state.currentFilters.theme ||
        state.currentFilters.region ||
        state.currentFilters.city
      )
    },
  },

  actions: {
    // Recherche des musées
    async searchMuseums(filters = {}) {
      this.isLoading = true
      this.searchError = null

      try {
        // Mise à jour des filtres actuels
        this.currentFilters = { ...this.currentFilters, ...filters }

        const results = await museumApiService.searchMuseums(this.currentFilters)

        console.log('🏪 Store - Résultats reçus:', results)
        console.log('🏪 Store - Musées:', results.museums)
        console.log('🏪 Store - Nombre de musées:', results.museums?.length)
        console.log('🏪 Store - Type musées:', typeof results.museums)
        console.log('🏪 Store - Is Array musées:', Array.isArray(results.museums))

        // Déréférencer les Proxy pour éviter les problèmes de réactivité
        this.searchResults = JSON.parse(JSON.stringify(results.museums))
        this.totalResults = results.total
        // Ne pas écraser les facettes avec les résultats de recherche
        // this.facets = results.facets

        console.log('🏪 Store - searchResults après assignation:', this.searchResults)
        console.log('🏪 Store - Type de searchResults:', typeof this.searchResults)
        console.log('🏪 Store - Length searchResults:', this.searchResults?.length)

        return results
      } catch (error) {
        this.searchError = error.message
        console.error('Erreur lors de la recherche:', error)
        throw error
      } finally {
        this.isLoading = false
      }
    },

    // Récupère les détails d'un musée
    async getMuseumDetails(museumId) {
      try {
        this.isLoading = true
        const museum = await museumApiService.getMuseumById(museumId)
        this.museumDetails = museum
        return museum
      } catch (error) {
        console.error('Erreur lors de la récupération des détails:', error)
        throw error
      } finally {
        this.isLoading = false
      }
    },

    // Recherche par géolocalisation
    async searchByLocation(lat, lng, radius = 10) {
      try {
        this.isLoading = true
        const results = await museumApiService.getMuseumsByLocation(lat, lng, radius)
        this.nearbyMuseums = results.museums
        return results
      } catch (error) {
        console.error('Erreur lors de la recherche par localisation:', error)
        throw error
      } finally {
        this.isLoading = false
      }
    },

    // Récupère les facettes disponibles
    async loadFacets() {
      try {
        const facets = await museumApiService.getFacets()
        this.facets = facets
        return facets
      } catch (error) {
        console.error('Erreur lors du chargement des facettes:', error)
        throw error
      }
    },

    // Sélectionne un musée
    selectMuseum(museum) {
      this.selectedMuseum = museum
    },

    // Retourne à la liste
    clearSelection() {
      this.selectedMuseum = null
      this.museumDetails = null
    },

    // Ajoute un musée aux favoris
    addToFavorites(museum) {
      const museumId = museum.id
      this.favorites.add(museumId)
      this.favoritesData.set(museumId, {
        ...museum,
        addedDate: new Date().toISOString(),
      })
      this.saveFavorites()
    },

    // Retire un musée des favoris
    removeFromFavorites(museumId) {
      this.favorites.delete(museumId)
      this.favoritesData.delete(museumId)
      this.saveFavorites()
    },

    // Bascule l'état favori d'un musée
    toggleFavorite(museum) {
      if (this.favorites.has(museum.id)) {
        this.removeFromFavorites(museum.id)
      } else {
        this.addToFavorites(museum)
      }
    },

    // Sauvegarde les favoris dans le localStorage
    saveFavorites() {
      try {
        const favoritesToSave = {
          favorites: [...this.favorites],
          favoritesData: Object.fromEntries(this.favoritesData),
        }
        localStorage.setItem('museum-favorites', JSON.stringify(favoritesToSave))
      } catch (error) {
        console.error('Erreur lors de la sauvegarde des favoris:', error)
      }
    },

    // Charge les favoris depuis le localStorage
    loadFavorites() {
      try {
        const saved = localStorage.getItem('museum-favorites')
        if (saved) {
          const data = JSON.parse(saved)

          // Support pour l'ancien format (juste un array d'IDs)
          if (Array.isArray(data)) {
            this.favorites = new Set(data)
            this.favoritesData = new Map()
          } else {
            // Nouveau format avec données complètes
            this.favorites = new Set(data.favorites || [])
            this.favoritesData = new Map(Object.entries(data.favoritesData || {}))
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement des favoris:', error)
      }
    },

    // Efface tous les filtres
    clearFilters() {
      this.currentFilters = {
        query: '',
        theme: '',
        region: '',
        city: '',
        limit: 20,
        offset: 0,
      }
      this.searchResults = []
      this.totalResults = 0
    },

    // Met à jour la localisation utilisateur
    setUserLocation(location) {
      this.userLocation = location
    },

    // Demande la géolocalisation
    async requestUserLocation() {
      return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error('Géolocalisation non supportée'))
          return
        }

        navigator.geolocation.getCurrentPosition(
          (position) => {
            const location = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            }
            this.setUserLocation(location)
            resolve(location)
          },
          (error) => {
            reject(new Error("Impossible d'obtenir la localisation"))
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000, // 5 minutes
          },
        )
      })
    },

    // Recherche les musées à proximité de l'utilisateur
    async findNearbyMuseums(radius = 10) {
      if (!this.userLocation) {
        throw new Error('Localisation utilisateur non disponible')
      }

      return await this.searchByLocation(this.userLocation.lat, this.userLocation.lng, radius)
    },
  },
})
