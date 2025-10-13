import { defineStore } from 'pinia'
import museofileApi from '../services/museofileApi'

export const useMuseumStore = defineStore('museum', {
  state: () => ({
    museums: [],
    selectedMuseum: null,
    searchParams: {
      text: '',
      region: '',
      city: '',
      theme: '',
      coordinates: null,
      freeEntry: false,
      wheelchairAccessible: false,
    },
    isLoading: false,
    error: null,
    totalCount: 0,
    currentPage: 1,
    itemsPerPage: 12,
    favorites: JSON.parse(localStorage.getItem('museumFavorites') || '[]'),
  }),

  getters: {
    filteredMuseums: (state) => {
      return state.museums
    },

    isFavorite: (state) => (museumId) => {
      return state.favorites.includes(museumId)
    },

    favoriteMuseums: (state) => {
      return state.museums.filter((museum) => state.favorites.includes(museum.id))
    },
  },

  actions: {
    async searchMuseums(params = {}) {
      this.isLoading = true
      this.error = null
      this.searchParams = { ...this.searchParams, ...params }

      try {
        let response

        // Si des coordonnées sont fournies, utiliser la recherche par localisation
        if (params.coordinates && params.coordinates.lat && params.coordinates.lng) {
          response = await museofileApi.getMuseumsByLocation(
            params.coordinates.lat,
            params.coordinates.lng,
            50, // Rayon de 50km par défaut
          )
        } else {
          // Sinon, utiliser la recherche classique
          response = await museofileApi.searchMuseums({
            ...params,
            page: this.currentPage - 1, // L'API utilise une pagination basée sur 0
            rows: this.itemsPerPage,
          })
        }

        this.museums = response.museums
        this.totalCount = response.totalCount
      } catch (error) {
        this.error = error.message || 'Erreur lors de la recherche des musées'
        console.error('Erreur de recherche:', error)
        this.museums = []
        this.totalCount = 0
      } finally {
        this.isLoading = false
      }
    },

    async getMuseumById(id) {
      this.isLoading = true
      this.error = null

      try {
        // Utilisation de l'API Muséofile réelle
        const museum = await museofileApi.getMuseumById(id)
        this.selectedMuseum = museum
      } catch (error) {
        this.error = error.message || 'Erreur lors du chargement du musée'
        console.error('Erreur de chargement:', error)
        this.selectedMuseum = null
      } finally {
        this.isLoading = false
      }
    },

    toggleFavorite(museumId) {
      const index = this.favorites.indexOf(museumId)
      if (index > -1) {
        this.favorites.splice(index, 1)
      } else {
        this.favorites.push(museumId)
      }

      // Sauvegarder dans le localStorage
      localStorage.setItem('museumFavorites', JSON.stringify(this.favorites))
    },

    setSelectedMuseum(museum) {
      this.selectedMuseum = museum
    },

    clearSelectedMuseum() {
      this.selectedMuseum = null
    },

    setPage(page) {
      this.currentPage = page
    },
  },
})
