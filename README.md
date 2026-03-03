# Prix des Carburants en France 🇫🇷 ⛽

Application web Progressive (PWA) qui affiche le top 10 des stations-service les moins chères par département en France.

## Fonctionnalités

- ✅ **Progressive Web App (PWA)** - Installable sur mobile et desktop
- ✅ **Fonctionne offline** - Service Worker avec cache
- ✅ Données en temps réel depuis l'API officielle du gouvernement français
- ✅ Filtrage par type de carburant (SP95, SP98, E10, Gazole, E85, GPLc)
- ✅ Filtrage par département (optionnel)
- ✅ Top 10 des stations les moins chères par département
- ✅ Statistiques globales (prix moyen, minimum, maximum)
- ✅ Interface responsive et moderne
- ✅ Optimisée pour mobile (touch-friendly)
- ✅ Liens vers Google Maps pour chaque station
- ✅ Mode démo avec données générées (pour tests sans serveur)
- ✅ Raccourcis d'application (accès direct à SP95, Diesel)

## Source de Données

Les données proviennent de l'API officielle du gouvernement français :
- URL: https://donnees.roulez-eco.fr/opendata/instantane
- Format: XML
- Mise à jour: Temps réel
- Plus d'infos: https://www.data.gouv.fr/fr/datasets/prix-des-carburants-en-france-flux-instantane/

## Installation

### Option 1: Serveur local simple avec Python

```bash
cd fuel-prices-france
python -m http.server 8000
```

Puis ouvrez http://localhost:8000 dans votre navigateur.

### Option 2: Serveur local avec Node.js

```bash
cd fuel-prices-france
npx http-server -p 8000 --cors
```

### Option 3: Live Server (VS Code)

1. Installez l'extension "Live Server" dans VS Code
2. Cliquez droit sur `index.html` → "Open with Live Server"

### Option 4: Mode démo

Si vous ne pouvez pas lancer de serveur, ouvrez simplement `index.html` dans votre navigateur et cliquez sur "Utiliser des données de démonstration" quand l'erreur CORS apparaît.

## Utilisation

1. Sélectionnez un type de carburant dans le menu déroulant
2. (Optionnel) Entrez un code de département pour filtrer (ex: 75 pour Paris)
3. Cliquez sur "Charger les données"
4. Les résultats s'affichent groupés par département avec les 10 stations les moins chères

## Technologies Utilisées

- HTML5
- CSS3 (avec Flexbox et Grid)
- JavaScript Vanilla (ES6+)
- API Fetch
- DOMParser pour XML

## Installation sur Mobile 📱

### Android
1. Ouvrez l'app dans Chrome
2. Cliquez sur le menu (⋮)
3. Sélectionnez "Installer l'application" ou "Ajouter à l'écran d'accueil"
4. L'icône apparaîtra sur votre écran d'accueil

### iOS (iPhone/iPad)
1. Configuration des Icônes

Avant de déployer l'application, générez les icônes PNG :

```bash
# Windows
generate-icons.bat

# Linux/Mac
bash generate-icons.sh
```

Voir [ICONS-SETUP.md](ICONS-SETUP.md) pour plus de détails.

## Remarques sur les CORS

L'API officielle peut avoir des restrictions CORS. Si vous rencontrez des erreurs :

1. Utilisez un serveur local (recommandé)
2. Installez une extension de navigateur pour désactiver CORS (développement uniquement)
3. Utilisez le mode démo avec données générées
4. Configurez un proxy CORS

## Capacités PWA

### Offline
- Les fichiers de l'application sont mis en cache
- Fonctionne même sans connexion (avec données précédemment chargées)

### Installation
- Peut être installée comme une application native
- Pas besoin de passer par un app store
- Mises à jour automatiques

### Raccourcis
- Accès direct à SP95 depuis l'icône (appui long sur Android)
- Accès direct à Diesel depuis l'icône "Installer" qui apparaît automatiquement

## x] Mode offline avec Service Worker ✅
- [x] PWA installable sur mobile ✅
- [ ] Téléchargement des données en CSV
- [ ] Graphiques de comparaison de prix
- [ ] Historique des prix
- [ ] Notifications push de baisse de prix
- [ ] Géolocalisation pour trouver les stations à proximité
- [ ] Filtres avancés (services, horaires d'ouverture)
- [ ] Mode sombre
- [ ] Favoris et alertes personnaliséess de l'app)
├── service-worker.js       # Service Worker (cache et offline)
├── icon.svg                # Icône de l'application (vectorielle)
├── icon-192.png            # Icône 192x192 (à générer)
├── icon-512.png            # Icône 512x512 (à générer)
├── start-server.bat        # Lanceur Windows
├── generate-icons.bat      # Générateur d'icônes Windows
├── generate-icons.sh       # Générateur d'icônes Linux/Mac
├── ICONS-SETUP.md          # Guide de génération des icônes
└── README.md               # Documentation
```

## Remarques sur les CORS

L'API officielle peut avoir des restrictions CORS. Si vous rencontrez des erreurs :

1. Utilisez un serveur local (recommandé)
2. Installez une extension de navigateur pour désactiver CORS (développement uniquement)
3. Utilisez le mode démo avec données générées
4. Configurez un proxy CORS

## Améliorations Futures

- [ ] Téléchargement des données en CSV
- [ ] Graphiques de comparaison de prix
- [ ] Historique des prix
- [ ] Notifications de baisse de prix
- [ ] Mode offline avec Service Worker
- [ ] Géolocalisation pour trouver les stations à proximité
- [ ] Filtres avancés (services, horaires d'ouverture)

## Licence

Ce projet utilise des données publiques du gouvernement français sous Licence Ouverte / Open License.

## Auteur

Créé comme démonstration d'utilisation de l'API Prix des Carburants en France.
