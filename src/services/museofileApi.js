import axios from 'axios'

// Configuration de base pour l'API Muséofile
// Note: L'API data.culture.gouv.fr semble avoir des restrictions d'accès
// Nous utilisons un dataset de test en attendant
const API_BASE_URL = 'https://data.culture.gouv.fr/api/records/1.0/search/'
const DATASET = 'musees-de-france' // Dataset qui n'existe pas, nous utiliserons les données de test

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

  /**
   * Recherche des musées selon différents critères
   * @param {Object} params - Paramètres de recherche
   * @param {string} params.text - Recherche textuelle
   * @param {string} params.region - Région
   * @param {string} params.city - Ville
   * @param {string} params.theme - Thématique
   * @param {Object} params.coordinates - Coordonnées géographiques
   * @param {boolean} params.freeEntry - Entrée gratuite
   * @param {boolean} params.wheelchairAccessible - Accessible aux fauteuils roulants
   * @param {number} params.page - Page (défaut: 0)
   * @param {number} params.rows - Nombre de résultats par page (défaut: 20)
   * @returns {Promise<Object>} Résultats de la recherche
   */
  async searchMuseums(params = {}) {
    try {
      // Pour l'instant, nous utilisons les données de test car l'API Muséofile
      // semble avoir des restrictions d'accès ou le dataset n'existe pas
      console.log('Utilisation des données de test - API Muséofile non accessible')

      const mockMuseums = this.generateMockMuseums()

      // Appliquer les filtres sur les données de test
      let filteredMuseums = mockMuseums

      if (params.text) {
        filteredMuseums = filteredMuseums.filter(
          (museum) =>
            museum.name.toLowerCase().includes(params.text.toLowerCase()) ||
            museum.description.toLowerCase().includes(params.text.toLowerCase()),
        )
      }

      if (params.region) {
        filteredMuseums = filteredMuseums.filter((museum) => museum.region === params.region)
      }

      if (params.city) {
        filteredMuseums = filteredMuseums.filter((museum) =>
          museum.city.toLowerCase().includes(params.city.toLowerCase()),
        )
      }

      if (params.theme) {
        filteredMuseums = filteredMuseums.filter((museum) => museum.themes.includes(params.theme))
      }

      if (params.freeEntry) {
        filteredMuseums = filteredMuseums.filter((museum) => museum.freeEntry)
      }

      if (params.wheelchairAccessible) {
        filteredMuseums = filteredMuseums.filter((museum) => museum.wheelchairAccessible)
      }

      // Pagination
      const start = params.page * params.rows
      const end = start + params.rows
      const paginatedMuseums = filteredMuseums.slice(start, end)

      return {
        museums: paginatedMuseums,
        totalCount: filteredMuseums.length,
        facets: [],
      }
    } catch (error) {
      console.error('Erreur lors de la recherche des musées:', error)
      throw new Error('Impossible de récupérer les données des musées')
    }
  }

  /**
   * Récupère un musée par son ID
   * @param {string} museumId - ID du musée
   * @returns {Promise<Object>} Données du musée
   */
  async getMuseumById(museumId) {
    try {
      // Utilisation des données de test
      const mockMuseums = this.generateMockMuseums()
      const museum = mockMuseums.find((m) => m.id === museumId)

      if (!museum) {
        throw new Error('Musée non trouvé')
      }

      return museum
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
      // Utilisation des données de test
      const mockMuseums = this.generateMockMuseums()

      // Filtrer les résultats par distance côté client
      const museums = mockMuseums
        .filter((museum) => {
          if (!museum.coordinates) return false

          const distance = this.calculateDistance(
            lat,
            lng,
            museum.coordinates.lat,
            museum.coordinates.lng,
          )

          return distance <= radius
        })
        .sort((a, b) => {
          const distanceA = this.calculateDistance(lat, lng, a.coordinates.lat, a.coordinates.lng)
          const distanceB = this.calculateDistance(lat, lng, b.coordinates.lat, b.coordinates.lng)
          return distanceA - distanceB
        })

      return {
        museums,
        totalCount: museums.length,
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
      // Retourner des facettes de test basées sur les données mock
      const mockMuseums = this.generateMockMuseums()

      const regions = [...new Set(mockMuseums.map((m) => m.region))]
      const cities = [...new Set(mockMuseums.map((m) => m.city))]
      const themes = [...new Set(mockMuseums.flatMap((m) => m.themes))]

      return [
        {
          name: 'region',
          facets: regions.map((region) => ({
            name: region,
            count: mockMuseums.filter((m) => m.region === region).length,
          })),
        },
        {
          name: 'ville',
          facets: cities.map((city) => ({
            name: city,
            count: mockMuseums.filter((m) => m.city === city).length,
          })),
        },
        {
          name: 'thematique',
          facets: themes.map((theme) => ({
            name: theme,
            count: mockMuseums.filter((m) => m.themes.includes(theme)).length,
          })),
        },
      ]
    } catch (error) {
      console.error('Erreur lors de la récupération des facettes:', error)
      throw new Error('Impossible de récupérer les facettes')
    }
  }

  /**
   * Génère des données de test pour les musées
   * @returns {Array} Liste des musées de test
   */
  generateMockMuseums() {
    return [
      {
        id: 'M0001',
        name: 'Musée du Louvre',
        description:
          "Le musée du Louvre est le plus grand musée du monde par sa surface et l'un des plus visités. Il abrite des œuvres d'art de l'Antiquité à 1848.",
        address: 'Rue de Rivoli, 75001 Paris',
        city: 'Paris',
        region: 'Île-de-France',
        coordinates: { lat: 48.8606, lng: 2.3376 },
        themes: ['Art', 'Histoire'],
        freeEntry: false,
        wheelchairAccessible: true,
        rating: 4.8,
        phone: '01 40 20 50 50',
        website: 'https://www.louvre.fr',
        email: 'info@louvre.fr',
        openingHours: 'Mercredi - Lundi: 9h00 - 18h00',
        image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800',
      },
      {
        id: 'M0002',
        name: "Musée d'Orsay",
        description:
          "Le musée d'Orsay est un musée national situé dans le 7e arrondissement de Paris. Il est installé dans l'ancienne gare d'Orsay.",
        address: "1 Rue de la Légion d'Honneur, 75007 Paris",
        city: 'Paris',
        region: 'Île-de-France',
        coordinates: { lat: 48.86, lng: 2.3266 },
        themes: ['Art'],
        freeEntry: false,
        wheelchairAccessible: true,
        rating: 4.6,
        phone: '01 40 49 48 14',
        website: 'https://www.musee-orsay.fr',
        email: 'info@musee-orsay.fr',
        openingHours: 'Mardi - Dimanche: 9h30 - 18h00',
        image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800',
      },
      {
        id: 'M0003',
        name: 'Musée de la Marine',
        description:
          "Le musée national de la Marine est un musée maritime français. Il présente l'histoire de la marine française depuis le XVIIe siècle.",
        address: 'Place du Trocadéro, 75016 Paris',
        city: 'Paris',
        region: 'Île-de-France',
        coordinates: { lat: 48.8584, lng: 2.2945 },
        themes: ['Histoire', 'Technique'],
        freeEntry: false,
        wheelchairAccessible: true,
        rating: 4.2,
        phone: '01 53 65 69 69',
        website: 'https://www.musee-marine.fr',
        email: 'contact@musee-marine.fr',
        openingHours: 'Mercredi - Lundi: 10h00 - 18h00',
        image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800',
      },
      {
        id: 'M0004',
        name: 'Musée des Beaux-Arts de Lyon',
        description:
          "Le musée des Beaux-Arts de Lyon est l'un des plus grands musées français et européens. Il abrite des collections exceptionnelles.",
        address: '20 Place des Terreaux, 69001 Lyon',
        city: 'Lyon',
        region: 'Auvergne-Rhône-Alpes',
        coordinates: { lat: 45.7679, lng: 4.8333 },
        themes: ['Art'],
        freeEntry: false,
        wheelchairAccessible: true,
        rating: 4.4,
        phone: '04 72 10 17 40',
        website: 'https://www.mba-lyon.fr',
        email: 'info@mba-lyon.fr',
        openingHours: 'Mercredi - Lundi: 10h00 - 18h00',
        image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800',
      },
      {
        id: 'M0005',
        name: "Musée d'Histoire Naturelle de Marseille",
        description:
          "Le musée d'histoire naturelle de Marseille présente des collections de zoologie, botanique, géologie et paléontologie.",
        address: 'Palais Longchamp, 13004 Marseille',
        city: 'Marseille',
        region: "Provence-Alpes-Côte d'Azur",
        coordinates: { lat: 43.3042, lng: 5.395 },
        themes: ['Sciences', 'Nature'],
        freeEntry: true,
        wheelchairAccessible: true,
        rating: 4.1,
        phone: '04 91 14 59 55',
        website: 'https://www.museum-marseille.org',
        email: 'contact@museum-marseille.org',
        openingHours: 'Mardi - Dimanche: 10h00 - 18h00',
        image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800',
      },
      {
        id: 'M0006',
        name: "Musée de l'Homme",
        description:
          "Le musée de l'Homme est un musée national d'anthropologie situé à Paris. Il présente l'évolution de l'homme et des sociétés.",
        address: '17 Place du Trocadéro, 75016 Paris',
        city: 'Paris',
        region: 'Île-de-France',
        coordinates: { lat: 48.8617, lng: 2.2875 },
        themes: ['Sciences', 'Ethnologie'],
        freeEntry: false,
        wheelchairAccessible: true,
        rating: 4.3,
        phone: '01 44 05 72 72',
        website: 'https://www.museedelhomme.fr',
        email: 'info@museedelhomme.fr',
        openingHours: 'Mercredi - Lundi: 10h00 - 18h00',
        image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800',
      },
      {
        id: 'M0007',
        name: 'Musée des Arts et Métiers',
        description:
          "Le musée des Arts et Métiers est un musée des sciences et des technologies situé à Paris. Il présente l'évolution des techniques industrielles.",
        address: '60 Rue Réaumur, 75003 Paris',
        city: 'Paris',
        region: 'Île-de-France',
        coordinates: { lat: 48.8656, lng: 2.3553 },
        themes: ['Technique', 'Sciences'],
        freeEntry: false,
        wheelchairAccessible: true,
        rating: 4.0,
        phone: '01 53 01 82 00',
        website: 'https://www.arts-et-metiers.net',
        email: 'contact@arts-et-metiers.net',
        openingHours: 'Mardi - Dimanche: 10h00 - 18h00',
        image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800',
      },
      {
        id: 'M0008',
        name: 'Musée de la Préhistoire de Solutré',
        description:
          'Le musée de la Préhistoire de Solutré présente les découvertes archéologiques du site de Solutré, célèbre pour ses vestiges préhistoriques.',
        address: '71960 Solutré-Pouilly',
        city: 'Solutré-Pouilly',
        region: 'Bourgogne-Franche-Comté',
        coordinates: { lat: 46.2958, lng: 4.7167 },
        themes: ['Archéologie', 'Histoire'],
        freeEntry: false,
        wheelchairAccessible: false,
        rating: 4.2,
        phone: '03 85 35 85 24',
        website: 'https://www.solutre.com',
        email: 'contact@solutre.com',
        openingHours: 'Tous les jours: 10h00 - 18h00',
        image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800',
      },
    ]
  }

  /**
   * Transforme les données brutes de l'API en format standardisé
   * @param {Object} record - Enregistrement brut de l'API
   * @returns {Object} Données transformées
   */
  transformMuseumData(record) {
    const fields = record.fields || {}

    return {
      id: record.recordid || record.fields?.id_musee || '',
      name: fields.nom_officiel_du_musee || 'Nom non disponible',
      description: fields.description || fields.historique || 'Aucune description disponible',
      address: fields.adresse || '',
      city: fields.ville || '',
      region: fields.region || '',
      postalCode: fields.code_postal || '',
      coordinates: fields.coordonnees_geographiques
        ? {
            lat: fields.coordonnees_geographiques[0],
            lng: fields.coordonnees_geographiques[1],
          }
        : null,
      themes: fields.thematique
        ? Array.isArray(fields.thematique)
          ? fields.thematique
          : [fields.thematique]
        : [],
      freeEntry: fields.gratuit === 'Oui',
      wheelchairAccessible: fields.acces_handicap === 'Oui',
      phone: fields.telephone || '',
      website: fields.site_web || '',
      email: fields.courriel || '',
      openingHours: fields.horaires || '',
      image: fields.image || null,
      rating: null, // L'API Muséofile ne fournit pas de notation
      lastUpdated: record.timestamp ? new Date(record.timestamp) : null,
    }
  }
}

// Export d'une instance unique du service
export default new MuseofileApiService()
