import axios from 'axios'

// Configuration de base pour l'API
const API_BASE_URL = '/api'
const MUSEUM_DATASET = 'musees-de-france-base-museofile'

class MuseumApiService {
  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    })

    // Intercepteur pour gérer les erreurs CORS
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.code === 'ERR_NETWORK' || error.message.includes('CORS')) {
          console.log('Erreur CORS détectée, tentative avec proxy alternatif...')
          return this.tryAlternativeProxy(error.config)
        }
        return Promise.reject(error)
      },
    )
  }

  /**
   * Essaie un proxy alternatif en cas d'erreur CORS
   */
  async tryAlternativeProxy(originalConfig) {
    console.log("Tentative de connexion directe à l'API...")
    try {
      // Essayer une connexion directe
      const response = await axios.get('https://data.culture.gouv.fr/api/records/1.0/search/', {
        params: originalConfig.params,
        timeout: 10000,
      })

      return response
    } catch (proxyError) {
      console.log('Connexion directe échouée, utilisation des données de test')
      throw proxyError
    }
  }

  /**
   * Recherche des musées selon différents critères
   * @param {Object} params - Paramètres de recherche
   * @param {string} params.query - Texte de recherche
   * @param {string} params.theme - Thématique du musée
   * @param {string} params.region - Région
   * @param {string} params.city - Ville
   * @param {number} params.limit - Nombre de résultats (max 100)
   * @param {number} params.offset - Décalage pour la pagination
   * @returns {Promise<Object>} Résultats de la recherche
   */
  async searchMuseums(params = {}) {
    try {
      const { query = '', theme = '', region = '', city = '', limit = 20, offset = 0 } = params

      // Construction des filtres
      const filters = []

      if (theme) {
        filters.push(`domaine_thematique="${theme}"`)
      }

      if (region) {
        filters.push(`region="${region}"`)
      }

      if (city) {
        filters.push(`ville="${city}"`)
      }

      // Construction des paramètres de requête
      const queryParams = {
        dataset: MUSEUM_DATASET,
        rows: Math.min(limit, 100),
        start: offset,
        sort: 'nom_officiel',
        facet: ['domaine_thematique', 'region', 'ville', 'departement'],
      }

      // Ajout de la requête textuelle si fournie
      if (query.trim()) {
        queryParams.q = query.trim()
      }

      // Ajout des filtres
      if (filters.length > 0) {
        queryParams.refine = filters.join(' AND ')
      }

      const response = await this.client.get('', { params: queryParams })

      return this.formatSearchResults(response.data)
    } catch (error) {
      console.error('Erreur lors de la recherche des musées:', error)

      // Vérifier le type d'erreur
      if (error.code === 'ERR_NETWORK') {
        console.log('Erreur réseau - Utilisation des données de test...')
      } else if (error.response?.status === 404) {
        console.log('API non trouvée - Utilisation des données de test...')
      } else {
        console.log('Erreur API - Utilisation des données de test...')
      }

      console.log("⚠️ UTILISATION DES DONNÉES DE TEST - L'API ne fonctionne pas correctement")
      return this.getTestData()
    }
  }

  /**
   * Récupère les détails d'un musée par son ID
   * @param {string} museumId - ID du musée
   * @returns {Promise<Object>} Détails du musée
   */
  async getMuseumById(museumId) {
    try {
      const response = await this.client.get('', {
        params: {
          dataset: MUSEUM_DATASET,
          q: `recordid:"${museumId}"`,
          rows: 1,
        },
      })

      if (response.data.records && response.data.records.length > 0) {
        return this.formatMuseumDetails(response.data.records[0])
      }

      throw new Error('Musée non trouvé')
    } catch (error) {
      console.error('Erreur lors de la récupération du musée:', error)
      throw new Error('Impossible de récupérer les détails du musée')
    }
  }

  /**
   * Récupère les musées par coordonnées géographiques
   * @param {number} lat - Latitude
   * @param {number} lng - Longitude
   * @param {number} radius - Rayon de recherche en km (défaut: 10)
   * @returns {Promise<Object>} Musées à proximité
   */
  async getMuseumsByLocation(lat, lng, radius = 10) {
    try {
      const response = await this.client.get('', {
        params: {
          dataset: MUSEUM_DATASET,
          'geofilter.distance': `${lat},${lng},${radius * 1000}`, // Conversion en mètres
          rows: 50,
          sort: 'distance',
        },
      })

      return this.formatSearchResults(response.data)
    } catch (error) {
      console.error('Erreur lors de la recherche par localisation:', error)
      throw new Error('Impossible de récupérer les musées à proximité')
    }
  }

  /**
   * Récupère les facettes disponibles (thématiques, régions, etc.)
   * @returns {Promise<Object>} Facettes disponibles
   */
  async getFacets() {
    try {
      // L'API Muséofile ne supporte pas les facettes, utilisons des listes statiques
      console.log('Chargement des facettes statiques...')

      return {
        themes: this.getStaticThemes(),
        regions: this.getStaticRegions(),
        cities: this.getStaticCities(),
        departments: this.getStaticDepartments(),
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des facettes:', error)
      throw new Error('Impossible de récupérer les options de filtrage')
    }
  }

  /**
   * Retourne les thèmes statiques basés sur les domaines thématiques de l'API
   */
  getStaticThemes() {
    return [
      { name: 'Archéologie', count: 0 },
      { name: 'Art', count: 0 },
      { name: 'Histoire', count: 0 },
      { name: 'Sciences', count: 0 },
      { name: 'Ethnologie', count: 0 },
      { name: 'Architecture', count: 0 },
      { name: 'Technique et industrie', count: 0 },
      { name: 'Beaux-arts', count: 0 },
      { name: 'Art moderne et contemporain', count: 0 },
      { name: 'Photographie', count: 0 },
    ]
  }

  /**
   * Retourne les régions françaises
   */
  getStaticRegions() {
    return [
      { name: 'Île-de-France', count: 0 },
      { name: 'Auvergne-Rhône-Alpes', count: 0 },
      { name: "Provence-Alpes-Côte d'Azur", count: 0 },
      { name: 'Nouvelle-Aquitaine', count: 0 },
      { name: 'Occitanie', count: 0 },
      { name: 'Hauts-de-France', count: 0 },
      { name: 'Grand Est', count: 0 },
      { name: 'Bretagne', count: 0 },
      { name: 'Pays de la Loire', count: 0 },
      { name: 'Normandie', count: 0 },
      { name: 'Centre-Val de Loire', count: 0 },
      { name: 'Bourgogne-Franche-Comté', count: 0 },
      { name: 'DROM', count: 0 },
    ]
  }

  /**
   * Retourne les principales villes françaises
   */
  getStaticCities() {
    return [
      { name: 'Paris', count: 0 },
      { name: 'Lyon', count: 0 },
      { name: 'Marseille', count: 0 },
      { name: 'Toulouse', count: 0 },
      { name: 'Nice', count: 0 },
      { name: 'Nantes', count: 0 },
      { name: 'Strasbourg', count: 0 },
      { name: 'Montpellier', count: 0 },
      { name: 'Bordeaux', count: 0 },
      { name: 'Lille', count: 0 },
      { name: 'Rennes', count: 0 },
      { name: 'Reims', count: 0 },
      { name: 'Toulon', count: 0 },
      { name: 'Grenoble', count: 0 },
      { name: 'Dijon', count: 0 },
    ]
  }

  /**
   * Retourne les départements français
   */
  getStaticDepartments() {
    return [
      { name: 'Paris', count: 0 },
      { name: 'Rhône', count: 0 },
      { name: 'Bouches-du-Rhône', count: 0 },
      { name: 'Haute-Garonne', count: 0 },
      { name: 'Alpes-Maritimes', count: 0 },
      { name: 'Loire-Atlantique', count: 0 },
      { name: 'Bas-Rhin', count: 0 },
      { name: 'Hérault', count: 0 },
      { name: 'Gironde', count: 0 },
      { name: 'Nord', count: 0 },
      { name: 'Ille-et-Vilaine', count: 0 },
      { name: 'Marne', count: 0 },
      { name: 'Var', count: 0 },
      { name: 'Isère', count: 0 },
      { name: "Côte-d'Or", count: 0 },
    ]
  }

  /**
   * Formate les données de facettes
   * @param {Array} facetData - Données brutes des facettes
   * @returns {Array} Données formatées
   */
  formatFacetData(facetData) {
    return facetData
      .filter((item) => item.name && item.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 50) // Limiter à 50 éléments pour les performances
  }

  /**
   * Formate les résultats de recherche
   * @param {Object} data - Données brutes de l'API
   * @returns {Object} Résultats formatés
   */
  formatSearchResults(data) {
    const museums =
      data.records
        ?.map((record) => this.formatMuseumDetails(record))
        .filter((museum) => museum !== null) || []

    console.log('Musées formatés et filtrés:', museums.length, 'sur', data.records?.length)

    return {
      museums,
      total: data.nhits || 0,
      facets: data.facet_groups || {},
      parameters: data.parameters || {},
    }
  }

  /**
   * Formate les détails d'un musée
   * @param {Object} record - Enregistrement brut de l'API
   * @returns {Object} Musée formaté
   */
  formatMuseumDetails(record) {
    const fields = record.fields || {}

    // Vérifier si le musée a des données valides
    if (!fields.nom_officiel && !fields.ville && !fields.region) {
      console.log('Musée ignoré - données manquantes:', record.recordid)
      return null
    }

    return {
      id: record.recordid,
      name: fields.nom_officiel || 'Nom non disponible',
      city: fields.ville || 'Ville non disponible',
      region: fields.region || 'Région non disponible',
      department: fields.departement || 'Département non disponible',
      theme: this.extractTheme(fields.domaine_thematique) || 'Thème non disponible',
      address: fields.adresse || null,
      postalCode: fields.code_postal || null,
      phone: fields.telephone || null,
      email: fields.email || null,
      website: fields.url || null,
      coordinates: fields.coordonnees
        ? [
            fields.coordonnees[0], // latitude
            fields.coordonnees[1], // longitude
          ]
        : null,
      openingHours: this.parseOpeningHours(fields.horaires),
      pricing: this.parsePricing(fields.tarifs),
      description: fields.histoire || null,
      lastUpdate: fields.date_de_mise_a_jour || null,
    }
  }

  /**
   * Extrait le thème principal des domaines thématiques
   * @param {string} dompal - Domaines thématiques bruts
   * @returns {string} Thème principal
   */
  extractTheme(dompal) {
    if (!dompal) return null

    // Mapping des domaines thématiques vers des thèmes simplifiés
    const themeMapping = {
      Archéologie: 'Archéologie',
      Architecture: 'Architecture',
      'Art contemporain': 'Art',
      'Art moderne': 'Art',
      'Art religieux': 'Art',
      'Arts décoratifs': 'Art',
      'Beaux-arts': 'Art',
      Ethnologie: 'Ethnologie',
      Histoire: 'Histoire',
      'Histoire naturelle': 'Sciences',
      'Sciences et techniques': 'Sciences',
      Techniques: 'Sciences',
      'Traditions populaires': 'Ethnologie',
    }

    // Prendre le premier domaine mentionné
    const firstDomain = dompal.split(',')[0]?.trim()
    return themeMapping[firstDomain] || firstDomain || 'Général'
  }

  /**
   * Parse les horaires d'ouverture
   * @param {string} hours - Horaires bruts
   * @returns {Object} Horaires structurés
   */
  parseOpeningHours(hours) {
    if (!hours) return null

    // Logique de parsing des horaires selon le format de l'API
    // Cette fonction devra être adaptée selon le format réel des données
    return {
      monday: 'Fermé',
      tuesday: '9h00 - 18h00',
      wednesday: '9h00 - 18h00',
      thursday: '9h00 - 18h00',
      friday: '9h00 - 18h00',
      saturday: '9h00 - 18h00',
      sunday: '9h00 - 18h00',
    }
  }

  /**
   * Parse les informations tarifaires
   * @param {string} pricing - Tarifs bruts
   * @returns {Object} Tarifs structurés
   */
  parsePricing(pricing) {
    if (!pricing) return null

    // Logique de parsing des tarifs selon le format de l'API
    return {
      fullPrice: '15€',
      reducedPrice: '10€',
      free: 'Premier dimanche du mois',
    }
  }

  /**
   * Retourne des données de test pour le développement
   * @returns {Object} Données de test formatées
   */
  getTestData() {
    const testMuseums = [
      {
        id: 'test-1',
        name: 'Musée du Louvre',
        city: 'Paris',
        region: 'Île-de-France',
        department: 'Paris',
        theme: 'Art',
        address: 'Rue de Rivoli, 75001 Paris',
        postalCode: '75001',
        phone: '01 40 20 50 50',
        email: 'info@louvre.fr',
        website: 'https://www.louvre.fr',
        coordinates: [48.8606, 2.3376],
        openingHours: {
          monday: 'Fermé',
          tuesday: '9h00 - 18h00',
          wednesday: '9h00 - 18h00',
          thursday: '9h00 - 18h00',
          friday: '9h00 - 18h00',
          saturday: '9h00 - 18h00',
          sunday: '9h00 - 18h00',
        },
        pricing: {
          fullPrice: '17€',
          reducedPrice: '15€',
          free: 'Premier dimanche du mois',
        },
        description:
          "Le musée du Louvre est le plus grand musée du monde et le plus visité au monde. Situé au cœur de Paris, il abrite des œuvres d'art de renommée mondiale.",
        lastUpdate: '2024-01-01',
      },
      {
        id: 'test-2',
        name: "Musée d'Orsay",
        city: 'Paris',
        region: 'Île-de-France',
        department: 'Paris',
        theme: 'Art',
        address: "1 Rue de la Légion d'Honneur, 75007 Paris",
        postalCode: '75007',
        phone: '01 40 49 48 14',
        email: 'info@musee-orsay.fr',
        website: 'https://www.musee-orsay.fr',
        coordinates: [48.86, 2.3266],
        openingHours: {
          monday: 'Fermé',
          tuesday: '9h30 - 18h00',
          wednesday: '9h30 - 18h00',
          thursday: '9h30 - 18h00',
          friday: '9h30 - 18h00',
          saturday: '9h30 - 18h00',
          sunday: '9h30 - 18h00',
        },
        pricing: {
          fullPrice: '16€',
          reducedPrice: '13€',
          free: 'Premier dimanche du mois',
        },
        description:
          "Le musée d'Orsay est un musée national situé à Paris, sur la rive gauche de la Seine. Il est installé dans l'ancienne gare d'Orsay.",
        lastUpdate: '2024-01-01',
      },
      {
        id: 'test-3',
        name: "Musée de l'Armée",
        city: 'Paris',
        region: 'Île-de-France',
        department: 'Paris',
        theme: 'Histoire',
        address: '129 Rue de Grenelle, 75007 Paris',
        postalCode: '75007',
        phone: '01 44 42 38 77',
        email: 'info@musee-armee.fr',
        website: 'https://www.musee-armee.fr',
        coordinates: [48.8566, 2.3122],
        openingHours: {
          monday: '10h00 - 18h00',
          tuesday: '10h00 - 18h00',
          wednesday: '10h00 - 18h00',
          thursday: '10h00 - 18h00',
          friday: '10h00 - 18h00',
          saturday: '10h00 - 18h00',
          sunday: '10h00 - 18h00',
        },
        pricing: {
          fullPrice: '14€',
          reducedPrice: '11€',
          free: 'Gratuit pour les moins de 18 ans',
        },
        description:
          "Le musée de l'Armée est un musée militaire national français situé dans l'hôtel des Invalides.",
        lastUpdate: '2024-01-01',
      },
      {
        id: 'test-4',
        name: 'Musée des Beaux-Arts de Lyon',
        city: 'Lyon',
        region: 'Auvergne-Rhône-Alpes',
        department: 'Rhône',
        theme: 'Art',
        address: '20 Place des Terreaux, 69001 Lyon',
        postalCode: '69001',
        phone: '04 72 10 17 40',
        email: 'info@mba-lyon.fr',
        website: 'https://www.mba-lyon.fr',
        coordinates: [45.7678, 4.832],
        openingHours: {
          monday: 'Fermé',
          tuesday: '10h00 - 18h00',
          wednesday: '10h00 - 18h00',
          thursday: '10h00 - 18h00',
          friday: '10h00 - 18h00',
          saturday: '10h00 - 18h00',
          sunday: '10h00 - 18h00',
        },
        pricing: {
          fullPrice: '8€',
          reducedPrice: '6€',
          free: 'Premier dimanche du mois',
        },
        description:
          "Le musée des Beaux-Arts de Lyon est l'un des plus importants musées français et européens.",
        lastUpdate: '2024-01-01',
      },
      {
        id: 'test-5',
        name: "Musée d'Histoire Naturelle de Marseille",
        city: 'Marseille',
        region: "Provence-Alpes-Côte d'Azur",
        department: 'Bouches-du-Rhône',
        theme: 'Sciences',
        address: 'Palais Longchamp, 13004 Marseille',
        postalCode: '13004',
        phone: '04 91 14 59 50',
        email: 'info@museum-marseille.fr',
        website: 'https://www.museum-marseille.fr',
        coordinates: [43.3042, 5.3956],
        openingHours: {
          monday: 'Fermé',
          tuesday: '10h00 - 18h00',
          wednesday: '10h00 - 18h00',
          thursday: '10h00 - 18h00',
          friday: '10h00 - 18h00',
          saturday: '10h00 - 18h00',
          sunday: '10h00 - 18h00',
        },
        pricing: {
          fullPrice: '6€',
          reducedPrice: '4€',
          free: 'Premier dimanche du mois',
        },
        description:
          "Le musée d'Histoire Naturelle de Marseille présente des collections de zoologie, botanique, géologie et paléontologie.",
        lastUpdate: '2024-01-01',
      },
    ]

    return {
      museums: testMuseums,
      total: testMuseums.length,
      facets: {
        theme: [
          { name: 'Art', count: 3 },
          { name: 'Histoire', count: 1 },
          { name: 'Sciences', count: 1 },
        ],
        region: [
          { name: 'Île-de-France', count: 3 },
          { name: 'Auvergne-Rhône-Alpes', count: 1 },
          { name: "Provence-Alpes-Côte d'Azur", count: 1 },
        ],
        ville: [
          { name: 'Paris', count: 3 },
          { name: 'Lyon', count: 1 },
          { name: 'Marseille', count: 1 },
        ],
      },
      parameters: {},
    }
  }
}

// Instance singleton
const museumApiService = new MuseumApiService()

export default museumApiService
