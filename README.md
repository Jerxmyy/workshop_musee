# 🏛️ MuséeExplorer

Une application Vue.js moderne et responsive pour découvrir et explorer les trésors culturels de France. MuséeExplorer vous permet de rechercher, filtrer et explorer les musées avec une interface intuitive et des fonctionnalités avancées.

## ✨ Fonctionnalités

### 🔍 Recherche avancée

- **Recherche textuelle** : Par nom du musée / de la ville / de la région / du département / de la thématique
- **Filtres géographiques** : Par régions / départements / villes
- **Filtres thématiques** : Art, Histoire, Sciences, Archéologie, etc.
- **Recherche par localisation** : Utilisation de la géolocalisation

### 🎨 Interface utilisateur

- **Design responsive** : Adapté à tous les écrans (mobile, tablette, desktop)
- **Design moderne** : Interface élégante avec dégradés et animations
- **Navigation intuitive** : Recherche, liste, détails et carte

### 🗺️ Visualisation

- **Liste des musées** : Affichage en grille avec cartes informatives
- **Fiche détaillée** : Informations complètes sur chaque musée
- **Carte interactive** : Localisation avec Leaflet
- **Pagination** : Navigation dans les résultats

### ❤️ Favoris

- **Gestion des favoris** : Ajout/suppression de musées favoris
- **Persistance** : Sauvegarde dans le localStorage
- **Partage** : Fonctionnalité de partage des musées

## 🛠️ Technologies utilisées

### Frontend

- **Vue.js 3** : Framework JavaScript réactif
- **Pinia** : Gestion d'état moderne
- **Vue Router** : Routage côté client
- **Axios** : Client HTTP pour les requêtes API
- **Leaflet** : Cartes interactives
- **CSS3** : Styles modernes avec Flexbox et Grid

### API

- **API Muséofile** : Base de données des musées de France
- **OpenStreetMap** : Données cartographiques

## 🚀 Installation et démarrage

### Prérequis

- Node.js 20.19.0 ou supérieur
- npm ou yarn

### Installation

```bash
# Cloner le repository
git clone <https://github.com/Jerxmyy/workshop_musee>
cd workshop-musee

# Installer les dépendances
npm install

# Démarrer le serveur de développement
npm run dev
```

L'application sera accessible sur `http://localhost:5173`

### Scripts disponibles

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

## 📁 Structure du projet

```
src/
├── components/          # Composants Vue réutilisables
│   ├── SearchSidebar.vue    # Barre latérale de recherche
│   ├── MuseumList.vue       # Liste des musées
│   ├── MuseumDetail.vue     # Fiche détaillée d'un musée
│   ├── FavoritesPage.vue    # Page des favoris
│   ├── ErrorMessage.vue     # Composant d'erreur
│   ├── HelloWorld.vue       # Composant d'accueil
│   ├── TheWelcome.vue       # Composant de bienvenue
│   ├── WelcomeItem.vue      # Élément de bienvenue
│   └── icons/               # Icônes personnalisées
│       ├── IconCommunity.vue
│       ├── IconDocumentation.vue
│       ├── IconEcosystem.vue
│       ├── IconSupport.vue
│       └── IconTooling.vue
├── stores/              # Stores Pinia
│   └── museum.js            # Store principal des musées
├── services/            # Services API
│   └── museofileApi.js      # Service API Muséofile
├── assets/              # Ressources statiques
│   ├── main.css             # Styles principaux
│   └── base.css             # Styles de base
├── App.vue              # Composant racine
└── main.js              # Point d'entrée
```

## 🔌 API Muséofile

### Documentation de l'API

L'application utilise l'API Muséofile du Ministère de la Culture accessible via [data.culture.gouv.fr](https://data.culture.gouv.fr).

### Endpoints utilisés

- **Recherche de musées** : `GET /api/records/2.1/search/`
- **Dataset** : `musees-de-france`

### Paramètres de recherche

```javascript
{
  text: string,           // Recherche textuelle
  region: string,         // Région
  city: string,          // Ville
  theme: string,         // Thématique
  coordinates: {         // Coordonnées géographiques
    lat: number,
    lng: number
  },
  page: number,          // Page (pagination)
  rows: number          // Nombre de résultats par page
}
```

### Exemple de requête

```javascript
const response = await museofileApi.searchMuseums({
  text: 'Louvre',
  region: 'Île-de-France',
  theme: 'Art',
  page: 0,
  rows: 20,
})
```

## 🎨 Design

### Caractéristiques du design

- **Interface plein écran** : Utilise 100vh et 100vw
- **Dégradés modernes** : Arrière-plan avec dégradé coloré
- **Glassmorphism** : Effets de transparence et flou
- **Animations fluides** : Transitions CSS3
- **Typographie** : Hiérarchie claire et lisible

## 🔧 Configuration

### Variables d'environnement

Créer un fichier `.env` à la racine :

```env
VITE_API_BASE_URL=https://data.culture.gouv.fr/api/explore/v2.1/catalog/datasets/musees-de-france-base-museofile
VITE_DATASET=musees-de-france-base-museofile
```

### Personnalisation

- **Couleurs** : Modifier les variables CSS dans `src/assets/main.css`
- **API** : Configurer l'URL de base dans `src/services/museofileApi.js`
- **Pagination** : Ajuster `itemsPerPage` dans le store

## 🚀 Déploiement

### Build de production

```bash
npm run build
```

### Déploiement sur Vercel

```bash
# Installer Vercel CLI
npm i -g vercel

# Déployer
vercel
```

### Déploiement sur Netlify

```bash
# Build
npm run build

# Déployer le dossier dist/
```

## 📊 Post-mortem

### Défis rencontrés

1. **API Muséofile** : Documentation limitée, nécessité d'analyser la structure des données
2. **Récupération des filtres** : La lisibilité de l'API était compliquée, nécessitant de vérifier à plusieurs reprises si les requêtes étaient correctes. La structure des paramètres de filtrage n'était pas intuitive et demandait beaucoup de tests pour comprendre les formats attendus
3. **Responsive design** : Adaptation complexe pour l'interface plein écran
4. **Gestion d'état** : Coordination entre recherche, pagination et favoris
5. **Performance** : Optimisation des requêtes API et du rendu des listes

### Solutions apportées

1. **Service API robuste** : Gestion d'erreurs et fallback sur données de test
2. **Tests itératifs des requêtes** : Validation systématique des paramètres de filtrage par des tests répétés pour s'assurer de la conformité avec l'API
3. **CSS Grid et Flexbox** : Layout responsive adaptatif
4. **Pinia** : Gestion d'état centralisée et réactive
5. **Lazy loading** : Chargement optimisé des composants

### Améliorations futures

- [ ] **Intégration avis Google** : Récupération des notes et avis Google réels pour remplacer les notes aléatoires actuelles
- [ ] **Informations tarifaires** : Affichage des tarifs d'entrée et des options de gratuité
- [ ] **Accessibilité PMR** : Intégration des informations d'accessibilité pour personnes à mobilité réduite afin d'aider les utilisateurs à choisir des musées adaptés à leurs besoins
- [ ] **Responsive Design** : Adapter l'interface pour une utilisation agréable sur format tablette et téléphone

## 📝 Licence

Ce projet est développé dans le cadre de ma formation à l'ESD Paris, lors d'un workshop sur l'utilisation des APIs Open Data du Ministère de la Culture.

## 👥 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :

1. Dupliquer le projet sur votre compte GitHub
2. Créer une branche feature
3. Commiter vos changements
4. Pousser vers la branche
5. Ouvrir une Pull Request

## 📞 Contact

Pour toute question ou suggestion, n'hésitez pas à ouvrir une issue sur GitHub ou à m'envoyer un mail a l'adresse suivante : jeremy.chambon@mail-esd.com .
