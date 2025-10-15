import axios from 'axios'

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  'https://data.culture.gouv.fr/api/explore/v2.1/catalog/datasets/musees-de-france-base-museofile'

class MuseofileApiService {
  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }

  // search museums with different criteria
  async searchMuseums(params = {}) {
    try {
      console.log('Fetching from real API v2.1')
      return await this.fetchFromRealApi(params)
    } catch (error) {
      console.error('Error searching museums:', error)
      throw new Error('Impossible de récupérer les données des musées')
    }
  }

  // fetch data from real API v2.1
  async fetchFromRealApi(params = {}) {
    try {
      const queryParams = {
        select:
          'nom_officiel,adresse,lieu,code_postal,ville,region,departement,url,categorie,domaine_thematique,histoire,atout,personnage_phare,interet,protection_batiment,protection_espace,annee_creation,date_de_mise_a_jour,coordonnees',
        limit: params.rows || 20,
        offset: (params.page || 0) * (params.rows || 20),
      }

      // Ajouter la clause WHERE seulement si elle existe
      const whereClause = this.buildWhereClause(params)
      if (whereClause) {
        queryParams.where = whereClause
      }

      console.log('API Request params:', queryParams) // Debug

      const response = await this.client.get('/records', { params: queryParams })

      if (response.data && response.data.results) {
        const museums = response.data.results.map((record) => this.transformApiRecord(record))

        return {
          museums: museums,
          totalCount: response.data.total_count || museums.length,
          facets: [],
        }
      }

      throw new Error('Invalid API response format')
    } catch (error) {
      console.error('API Error:', error)
      throw new Error('Impossible de récupérer les données des musées')
    }
  }

  // Construit la clause WHERE pour l'API v2.1
  buildWhereClause(params = {}) {
    const conditions = []

    if (params.text && params.text.trim()) {
      const searchText = params.text.trim().replace(/"/g, '\\"')
      conditions.push(
        `(nom_officiel like "%${searchText}%" OR histoire like "%${searchText}%" OR atout like "%${searchText}%")`,
      )
    }

    if (params.region && params.region.trim()) {
      const region = params.region.trim().replace(/"/g, '\\"')
      conditions.push(`region = "${region}"`)
    }

    if (params.department && params.department.trim()) {
      const department = params.department.trim().replace(/"/g, '\\"')
      conditions.push(`departement = "${department}"`)
    }

    if (params.city && params.city.trim()) {
      const city = params.city.trim().replace(/"/g, '\\"')
      conditions.push(`ville = "${city}"`)
    }

    if (params.theme && params.theme.trim()) {
      const theme = params.theme.trim().replace(/"/g, '\\"')
      conditions.push(`domaine_thematique like "%${theme}%"`)
    }

    if (params.wheelchairAccessible) {
      conditions.push(`interet like "%handicap%"`)
    }

    return conditions.length > 0 ? conditions.join(' AND ') : undefined
  }

  /**
   * Transforme un enregistrement de l'API v2.1 en objet musée
   * @param {Object} record - Enregistrement de l'API
   * @returns {Object} Objet musée transformé
   */
  transformApiRecord(record) {
    return {
      id: record.identifiant || `museum-${Date.now()}-${Math.random()}`,
      name: record.nom_officiel || 'Musée sans nom',
      description: record.histoire || 'Aucune description disponible',
      address: record.adresse || '',
      city: record.ville || '',
      region: record.region || '',
      department: record.departement || '',
      postalCode: record.code_postal || '',
      location: record.lieu || '',
      website: record.url || '',
      category: record.categorie || '',
      thematicDomain: record.domaine_thematique || '',
      history: record.histoire || '',
      asset: record.atout || '',
      keyFigure: record.personnage_phare || '',
      interest: record.interet || '',
      buildingProtection: record.protection_batiment || '',
      spaceProtection: record.protection_espace || '',
      creationYear: record.annee_creation || '',
      lastUpdate: record.date_de_mise_a_jour || '',
      coordinates:
        record.coordonnees && record.coordonnees.lat && record.coordonnees.lon
          ? {
              lat: parseFloat(record.coordonnees.lat),
              lng: parseFloat(record.coordonnees.lon),
            }
          : null,
      wheelchairAccessible: record.interet && record.interet.includes('handicap'),
      rating: Math.floor(Math.random() * 3) + 3, // Note aléatoire entre 3 et 5
      image: this.getRandomMuseumImage(),
    }
  }

  /**
   * Génère une image aléatoire pour un musée
   * @returns {string} URL d'image
   */
  getRandomMuseumImage() {
    const images = [
      'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800',
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800',
      'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800',
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800',
      'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800',
    ]
    return images[Math.floor(Math.random() * images.length)]
  }

  /**
   * Mappe les thématiques simples vers les valeurs API v2.1
   * @param {string} simpleTheme - Thématique simple
   * @returns {string} Valeur API correspondante
   */
  getThemeMapping(simpleTheme) {
    const themeMappings = {
      Art: 'Beaux-Arts',
      Histoire: 'Histoire',
      Sciences: 'Sciences de la nature',
      Archéologie: 'Archéologie',
      Ethnologie: 'Ethnologie',
      Technique: 'Sciences et techniques',
      Nature: 'Sciences de la nature',
    }
    return themeMappings[simpleTheme] || null
  }

  /**
   * Récupère un musée par son ID
   * @param {string} museumId - ID du musée
   * @returns {Promise<Object>} Données du musée
   */
  async getMuseumById(museumId) {
    try {
      const response = await this.client.get('/records', {
        params: {
          select:
            'nom_officiel,adresse,lieu,code_postal,ville,region,departement,url,categorie,domaine_thematique,histoire,atout,personnage_phare,interet,protection_batiment,protection_espace,annee_creation,date_de_mise_a_jour,coordonnees',
          where: `identifiant = "${museumId}"`,
          limit: 1,
        },
      })

      if (response.data && response.data.results && response.data.results.length > 0) {
        return this.transformApiRecord(response.data.results[0])
      }

      throw new Error('Musée non trouvé')
    } catch (error) {
      console.error('Erreur lors de la récupération du musée:', error)
      throw new Error('Impossible de récupérer les données du musée')
    }
  }

  /**
   * Récupère les musées par coordonnées géographiques
   * @param {number} lat - Latitude
   * @param {number} lng - Longitude
   * @param {number} radius - Rayon de recherche en km (défaut: 10)
   * @returns {Promise<Object>} Résultats de la recherche
   */
  async getMuseumsByLocation(lat, lng, radius = 10) {
    try {
      const response = await this.client.get('/records', {
        params: {
          select:
            'nom_officiel,adresse,lieu,code_postal,ville,region,departement,url,categorie,domaine_thematique,histoire,atout,personnage_phare,interet,protection_batiment,protection_espace,annee_creation,date_de_mise_a_jour,coordonnees',
          where: `distance(coordonnees, ${lat}, ${lng}) < ${radius * 1000}`,
          limit: 100,
        },
      })

      if (response.data && response.data.results) {
        const museums = response.data.results.map((record) => this.transformApiRecord(record))

        return {
          museums: museums,
          totalCount: response.data.total_count || museums.length,
        }
      }

      return {
        museums: [],
        totalCount: 0,
      }
    } catch (error) {
      console.error('Erreur lors de la recherche par localisation:', error)
      throw new Error('Impossible de récupérer les musées par localisation')
    }
  }

  /**
   * Calcule la distance entre deux points géographiques (formule de Haversine)
   * @param {number} lat1 - Latitude du premier point
   * @param {number} lng1 - Longitude du premier point
   * @param {number} lat2 - Latitude du deuxième point
   * @param {number} lng2 - Longitude du deuxième point
   * @returns {number} Distance en kilomètres
   */
  calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371 // Rayon de la Terre en kilomètres
    const dLat = this.deg2rad(lat2 - lat1)
    const dLng = this.deg2rad(lng2 - lng1)
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  /**
   * Convertit les degrés en radians
   * @param {number} deg - Degrés
   * @returns {number} Radians
   */
  deg2rad(deg) {
    return deg * (Math.PI / 180)
  }

  /**
   * Récupère les facettes disponibles pour les filtres
   * @returns {Promise<Object>} Facettes disponibles
   */
  async getFacets() {
    try {
      // Récupérer les facettes depuis l'API v2.1
      const response = await this.client.get('/records', {
        params: {
          select: 'region,departement,ville,domaine_thematique',
          limit: 1000,
        },
      })

      if (response.data && response.data.results) {
        const museums = response.data.results

        const regions = [...new Set(museums.map((m) => m.region).filter(Boolean))]
        const departments = [...new Set(museums.map((m) => m.departement).filter(Boolean))]
        const cities = [...new Set(museums.map((m) => m.ville).filter(Boolean))]
        const themes = [...new Set(museums.map((m) => m.domaine_thematique).filter(Boolean))]

        return [
          {
            name: 'region',
            facets: regions.map((region) => ({
              name: region,
              count: museums.filter((m) => m.region === region).length,
            })),
          },
          {
            name: 'departement',
            facets: departments.map((department) => ({
              name: department,
              count: museums.filter((m) => m.departement === department).length,
            })),
          },
          {
            name: 'ville',
            facets: cities.map((city) => ({
              name: city,
              count: museums.filter((m) => m.ville === city).length,
            })),
          },
          {
            name: 'thematique',
            facets: themes.map((theme) => ({
              name: theme,
              count: museums.filter((m) => m.domaine_thematique === theme).length,
            })),
          },
        ]
      }

      return []
    } catch (error) {
      console.error('Erreur lors de la récupération des facettes:', error)
      throw new Error('Impossible de récupérer les facettes')
    }
  }
}

// Export d'une instance unique du service
export default new MuseofileApiService()
