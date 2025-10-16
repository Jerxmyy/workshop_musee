import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import authApi from '../services/authApi.js'

export const useAuthStore = defineStore('auth', () => {
  // État
  const user = ref(null)
  const accessToken = ref(localStorage.getItem('access_token'))
  const isLoading = ref(false)
  const error = ref(null)

  // Getters
  const isAuthenticated = computed(() => !!user.value && !!accessToken.value)
  const userInfo = computed(() => user.value)

  // Actions
  const setUser = (userData) => {
    user.value = userData
  }

  const setToken = (token) => {
    accessToken.value = token
    if (token) {
      localStorage.setItem('access_token', token)
    } else {
      localStorage.removeItem('access_token')
    }
  }

  const setError = (errorMessage) => {
    error.value = errorMessage
  }

  const clearError = () => {
    error.value = null
  }

  const login = async (email, password) => {
    isLoading.value = true
    clearError()

    try {
      const response = await authApi.login(email, password)

      if (response.access_token) {
        setToken(response.access_token)
        setUser(response.user)
        return response
      } else {
        throw new Error("Token d'accès non reçu")
      }
    } catch (err) {
      const errorMessage = err.message || 'Erreur lors de la connexion'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      isLoading.value = false
    }
  }

  const register = async (email, password, nom, prenom) => {
    isLoading.value = true
    clearError()

    try {
      const response = await authApi.register(email, password, nom, prenom)

      if (response.access_token) {
        setToken(response.access_token)
        setUser(response.user)
        return response
      } else {
        throw new Error("Token d'accès non reçu")
      }
    } catch (err) {
      const errorMessage = err.message || "Erreur lors de l'inscription"
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      isLoading.value = false
    }
  }

  const logout = async () => {
    isLoading.value = true
    clearError()

    try {
      if (accessToken.value) {
        await authApi.logout(accessToken.value)
      }
    } catch (err) {
      console.warn('Erreur lors de la déconnexion:', err.message)
    } finally {
      setUser(null)
      setToken(null)
      isLoading.value = false
    }
  }

  const fetchProfile = async () => {
    if (!accessToken.value) return

    isLoading.value = true
    clearError()

    try {
      const response = await authApi.getProfile(accessToken.value)
      setUser(response.user)
      return response.user
    } catch (err) {
      console.warn('Erreur lors de la récupération du profil:', err.message)
      // Si le token est invalide, déconnecter l'utilisateur
      if (err.message.includes('401') || err.message.includes('Token')) {
        logout()
      }
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const verifyToken = async () => {
    if (!accessToken.value) return false

    try {
      await authApi.verifyToken(accessToken.value)
      return true
    } catch (err) {
      console.warn('Token invalide:', err.message)
      logout()
      return false
    }
  }

  const initializeAuth = async () => {
    if (accessToken.value) {
      try {
        await fetchProfile()
      } catch (err) {
        console.warn('Impossible de récupérer le profil utilisateur:', err.message)
      }
    }
  }

  return {
    // État
    user,
    accessToken,
    isLoading,
    error,

    // Getters
    isAuthenticated,
    userInfo,

    // Actions
    login,
    register,
    logout,
    fetchProfile,
    verifyToken,
    initializeAuth,
    setUser,
    setToken,
    setError,
    clearError,
  }
})
