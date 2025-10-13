# Musée de France - Interface de Consultation

## Présentation du Projet

Cette application web permet de consulter la base de données des musées de France via l'API ouverte du Ministère de la Culture. Elle offre une interface responsive qui prend tout l'espace de l'écran et permet de rechercher, filtrer et visualiser les musées avec une carte interactive.

### Fonctionnalités Principales

- **Recherche avancée** : Recherche textuelle, filtrage par thématique, région, ville
- **Interface responsive** : Adaptation automatique à tous les écrans (desktop, tablette, mobile)
- **Carte interactive** : Visualisation des musées sur une carte Leaflet
- **Fiches détaillées** : Affichage complet des informations de chaque musée
- **Système de favoris** : Sauvegarde des musées préférés en local
- **Géolocalisation** : Recherche de musées à proximité (à venir)

### Technologies Utilisées

- **Frontend** : Vue.js 3 avec Composition API
- **État global** : Pinia pour la gestion d'état
- **Cartes** : Leaflet pour l'affichage cartographique
- **HTTP Client** : Axios pour les requêtes API
- **Build Tool** : Vite
- **Styling** : CSS3 avec Grid et Flexbox

## Installation et Démarrage

### Prérequis

- Node.js (version 20.19.0 ou supérieure)
- npm ou yarn

### Installation

```bash
# Cloner le repository
git clone <url-du-repo>
cd workshop-musee

# Installer les dépendances
npm install

# Démarrer le serveur de développement
npm run dev
```

L'application sera accessible à l'adresse `http://localhost:5173`

### Scripts Disponibles

```bash
# Développement
npm run dev

# Build de production
npm run build

# Prévisualisation du build
npm run preview

# Linting
npm run lint

# Formatage du code
npm run format
```

## Documentation de l'API

### API des Musées de France

L'application consomme l'API ouverte du Ministère de la Culture accessible via `data.culture.gouv.fr`.

#### Endpoints Utilisés

**Base URL** : `https://data.culture.gouv.fr/api/records/1.0/search/`

**Dataset** : `musees-de-france`

#### Requêtes Principales

##### 1. Recherche de Musées

```javascript
GET /api/records/1.0/search/?dataset=musees-de-france&q={query}&refine={filters}&rows={limit}&start={offset}
```

**Paramètres :**

- `q` : Requête textuelle (optionnel)
- `refine` : Filtres (thème, région, ville) séparés par `AND`
- `rows` : Nombre de résultats (max 100)
- `start` : Décalage pour la pagination
- `facet` : Facettes à récupérer (thème, région, ville, département)

**Exemple :**

```javascript
const response = await axios.get('https://data.culture.gouv.fr/api/records/1.0/search/', {
  params: {
    dataset: 'musees-de-france',
    q: 'louvre',
    refine: 'theme="Art" AND region="Île-de-France"',
    rows: 20,
    start: 0,
    facet: ['theme', 'region', 'ville'],
  },
})
```

##### 2. Recherche par Géolocalisation

```javascript
GET /api/records/1.0/search/?dataset=musees-de-france&geofilter.distance={lat},{lng},{radius}
```

**Paramètres :**

- `geofilter.distance` : Latitude, longitude, rayon en mètres

##### 3. Détails d'un Musée

```javascript
GET /api/records/1.0/search/?dataset=musees-de-france&q=recordid:"{museumId}"&rows=1
```

#### Structure des Données

```javascript
{
  "records": [
    {
      "recordid": "M0001",
      "fields": {
        "nom_officiel": "Musée du Louvre",
        "ville": "Paris",
        "region": "Île-de-France",
        "departement": "Paris",
        "theme": "Art",
        "adresse": "Rue de Rivoli, 75001 Paris",
        "code_postal": "75001",
        "telephone": "01 40 20 50 50",
        "email": "info@louvre.fr",
        "site_web": "https://www.louvre.fr",
        "geo_point_2d": [48.8606, 2.3376],
        "horaires": "9h00-18h00",
        "tarifs": "15€ plein tarif",
        "description": "Description du musée...",
        "last_update": "2024-01-01"
      }
    }
  ],
  "nhits": 1000,
  "facet_groups": {
    "theme": [...],
    "region": [...],
    "ville": [...]
  }
}
```

## Architecture de l'Application

### Structure des Dossiers

```
src/
├── components/          # Composants Vue
│   ├── SearchPanel.vue     # Panneau de recherche
│   ├── ResultsPanel.vue    # Affichage des résultats
│   ├── MuseumDetail.vue    # Fiche détaillée
│   └── MapView.vue         # Carte interactive
├── services/            # Services API
│   └── museumApi.js        # Service API des musées
├── stores/              # Stores Pinia
│   └── museumStore.js      # Store principal
├── assets/              # Ressources statiques
└── App.vue             # Composant racine
```

### Flux de Données

1. **Recherche** : L'utilisateur saisit des critères dans `SearchPanel`
2. **API Call** : `museumApi.js` fait la requête vers l'API
3. **Store Update** : `museumStore.js` met à jour l'état global
4. **Affichage** : `ResultsPanel` et `MapView` se mettent à jour
5. **Sélection** : Clic sur un musée → `MuseumDetail` s'affiche

### Gestion d'État (Pinia)

Le store `museumStore` gère :

- Résultats de recherche
- Musée sélectionné
- Filtres actifs
- Favoris (localStorage)
- États de chargement et d'erreur
- Facettes pour les filtres

## Responsive Design

### Breakpoints

- **Desktop** : ≥ 1024px - Layout en grille (recherche + résultats + carte)
- **Tablette** : 768px - 1023px - Layout en colonne
- **Mobile** : < 768px - Layout vertical, carte masquée par défaut

### Adaptations

- **Navigation** : Menu hamburger sur mobile
- **Cartes** : Affichage en grille ou liste selon la taille d'écran
- **Carte** : Masquée sur mobile, accessible via bouton
- **Formulaires** : Champs empilés sur petits écrans

## Fonctionnalités Avancées

### Système de Favoris

- Sauvegarde locale avec `localStorage`
- Persistance entre les sessions
- Interface intuitive avec icônes

### Gestion d'Erreurs

- Messages d'erreur utilisateur-friendly
- Retry automatique
- Fallback en cas d'échec API

### Performance

- Lazy loading des composants
- Debouncing des recherches
- Pagination des résultats
- Optimisation des requêtes API

## Déploiement

### Build de Production

```bash
npm run build
```

Les fichiers de production sont générés dans le dossier `dist/`.

### Variables d'Environnement

Créer un fichier `.env` :

```env
VITE_API_BASE_URL=https://data.culture.gouv.fr/api/records/1.0/search/
VITE_MUSEUM_DATASET=musees-de-france
```

## Post-Mortem

### Défis Rencontrés

1. **API Rate Limiting** : L'API du Ministère de la Culture a des limites de requêtes
   - **Solution** : Implémentation de cache et debouncing

2. **Données Incomplètes** : Certains musées n'ont pas toutes les informations
   - **Solution** : Gestion des valeurs par défaut et validation

3. **Responsive Complexe** : Interface qui doit s'adapter à tous les écrans
   - **Solution** : CSS Grid et Flexbox avec breakpoints précis

4. **Performance Cartes** : Rendu de nombreuses marqueurs sur la carte
   - **Solution** : Clustering et lazy loading

### Améliorations Futures

- [ ] Authentification utilisateur
- [ ] API backend pour les favoris
- [ ] Notifications push
- [ ] Mode hors-ligne
- [ ] Export des favoris
- [ ] Partage social
- [ ] Recherche vocale
- [ ] Mode sombre

### Apprentissages

- **Vue 3 Composition API** : Syntaxe plus claire et réutilisable
- **Pinia** : Gestion d'état plus simple que Vuex
- **Leaflet** : Intégration facile pour les cartes
- **API Open Data** : Richesse des données publiques françaises

## Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/nouvelle-fonctionnalite`)
3. Commit les changements (`git commit -m 'Ajout nouvelle fonctionnalité'`)
4. Push vers la branche (`git push origin feature/nouvelle-fonctionnalite`)
5. Ouvrir une Pull Request

## Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## Contact

Pour toute question ou suggestion, n'hésitez pas à ouvrir une issue sur GitHub.
