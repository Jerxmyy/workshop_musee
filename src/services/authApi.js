const API_BASE_URL = 'https://workshop-musee-backend.vercel.app'

class AuthApiService {
  constructor() {
    this.baseURL = API_BASE_URL
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.detail || `Erreur HTTP: ${response.status}`)
      }

      return data
    } catch (error) {
      console.error('Erreur API:', error)
      throw error
    }
  }

  async login(email, password) {
    return this.request('/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  }

  async register(email, password, nom, prenom) {
    return this.request('/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, nom, prenom }),
    })
  }

  async logout(accessToken) {
    return this.request('/logout', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
  }

  async getProfile(accessToken) {
    return this.request('/profile', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
  }

  async verifyToken(accessToken) {
    return this.request('/profile', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
  }
}

export default new AuthApiService()
