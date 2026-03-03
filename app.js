// French Fuel Prices Application
let stationsData = [];

// Enhanced for mobile - add touch feedback
document.addEventListener('DOMContentLoaded', () => {
    // Add haptic feedback on mobile (if supported)
    if ('vibrate' in navigator) {
        document.addEventListener('click', (e) => {
            if (e.target.tagName === 'BUTTON') {
                navigator.vibrate(10);
            }
        });
    }

    // Optimize for iOS
    if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
        document.body.style.cursor = 'pointer';
    }
});

// Fuel type mapping (XML tag name to display name)
const fuelTypeMapping = {
    'E10': 'e10',
    'SP95': 'sp95',
    'SP98': 'sp98',
    'Gazole': 'gazole',
    'GPLc': 'gplc',
    'E85': 'e85'
};

async function loadData() {
    const fuelType = document.getElementById('fuelType').value;
    const departmentFilter = document.getElementById('department').value.trim();
    const loadBtn = document.getElementById('loadBtn');
    const content = document.getElementById('content');

    // Show loading state
    loadBtn.disabled = true;
    content.innerHTML = `
        <div class="loading">
            <div class="spinner"></div>
            <p>Chargement des données en cours...</p>
            <p style="font-size: 0.9em; margin-top: 10px;">Cela peut prendre quelques secondes</p>
        </div>
    `;

    try {
        // Use our Cloudflare Pages serverless function (no CORS issues!)
        console.log('Fetching data from serverless function...');
        
        const response = await fetch('/api/fuel-data', {
            method: 'GET'
        });
        
        console.log(`Response status: ${response.status}`);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Function error:', errorText);
            throw new Error(`Erreur serveur (${response.status})`);
        }
        
        const xmlText = await response.text();
        console.log(`✓ Received ${xmlText.length} bytes`);
        console.log('First 500 characters:', xmlText.substring(0, 500));
        
        // Verify we got valid XML
        if (!xmlText || !xmlText.includes('pdv')) {
            console.error('Invalid data - does not contain pdv elements');
            console.log('Full response:', xmlText.substring(0, 2000));
            throw new Error('Données invalides reçues');
        }
        
        console.log('✓ Valid XML data confirmed');

        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

        // Check for XML parsing errors
        const parserError = xmlDoc.querySelector('parsererror');
        if (parserError) {
            throw new Error('Erreur de parsing XML');
        }

        // Parse stations
        stationsData = parseStations(xmlDoc, fuelType);

        // Filter by department if specified
        if (departmentFilter) {
            stationsData = stationsData.filter(station => 
                station.department === departmentFilter
            );
        }

        // Group by department and get top 10 for each
        const departmentGroups = groupByDepartment(stationsData);
        
        // Display results
        displayResults(departmentGroups, fuelType);

    } catch (error) {
        console.error('Error loading data:', error);
        content.innerHTML = `
            <div class="error">
                <h3>⚠️ Service temporairement indisponible</h3>
                <p style="margin-top: 15px;">
                    Les données officielles ne peuvent pas être chargées pour le moment.
                    Cela peut être dû à une maintenance de l'API gouvernementale.
                </p>
                <p style="margin-top: 10px; font-size: 0.9em; color: #6c757d;">
                    <strong>Erreur:</strong> ${error.message}
                </p>
                <div style="margin-top: 20px; display: flex; flex-direction: column; gap: 10px; max-width: 400px; margin-left: auto; margin-right: auto;">
                    <button onclick="loadData()" style="font-size: 16px; padding: 15px 30px;">
                        🔄 Réessayer
                    </button>
                    <button onclick="loadLocalData()" style="font-size: 16px; padding: 15px 30px; background: linear-gradient(135deg, #28a745 0%, #20c997 100%);">
                        ✨ Voir des données de démonstration
                    </button>
                </div>
                <p style="margin-top: 15px; font-size: 0.85em; color: #6c757d;">
                    Les données de démonstration affichent des prix réalistes pour 10 départements français
                </p>
            </div>
        `;
    } finally {
        loadBtn.disabled = false;
    }
}

function parseStations(xmlDoc, fuelType) {
    const stations = [];
    const pdvElements = xmlDoc.getElementsByTagName('pdv');
    const fuelTag = fuelTypeMapping[fuelType];

    for (let pdv of pdvElements) {
        const cp = pdv.getAttribute('cp');
        if (!cp) continue;

        const department = cp.substring(0, 2);
        
        // Find the price for the selected fuel type
        const priceElements = pdv.getElementsByTagName('prix');
        let price = null;

        for (let priceEl of priceElements) {
            if (priceEl.getAttribute('nom') === fuelTag) {
                price = parseFloat(priceEl.getAttribute('valeur')) / 1000; // Convert to euros
                break;
            }
        }

        if (!price) continue; // Skip if fuel type not available

        // Get station info
        const addressEl = pdv.getElementsByTagName('adresse')[0];
        const villeEl = pdv.getElementsByTagName('ville')[0];
        
        const station = {
            id: pdv.getAttribute('id'),
            latitude: pdv.getAttribute('latitude') ? parseFloat(pdv.getAttribute('latitude')) / 100000 : null,
            longitude: pdv.getAttribute('longitude') ? parseFloat(pdv.getAttribute('longitude')) / 100000 : null,
            cp: cp,
            department: department,
            address: addressEl ? addressEl.textContent : 'Adresse non disponible',
            city: villeEl ? villeEl.textContent : 'Ville non disponible',
            price: price
        };

        stations.push(station);
    }

    return stations;
}

function groupByDepartment(stations) {
    const groups = {};

    stations.forEach(station => {
        if (!groups[station.department]) {
            groups[station.department] = [];
        }
        groups[station.department].push(station);
    });

    // Sort each department's stations by price and take top 10
    for (let dept in groups) {
        groups[dept].sort((a, b) => a.price - b.price);
        groups[dept] = groups[dept].slice(0, 10);
    }

    return groups;
}

function displayResults(departmentGroups, fuelType) {
    const content = document.getElementById('content');
    
    if (Object.keys(departmentGroups).length === 0) {
        content.innerHTML = `
            <div class="no-data">
                😕 Aucune station trouvée pour ce type de carburant avec ces critères
            </div>
        `;
        return;
    }

    // Calculate statistics
    const allStations = Object.values(departmentGroups).flat();
    const avgPrice = allStations.reduce((sum, s) => sum + s.price, 0) / allStations.length;
    const minPrice = Math.min(...allStations.map(s => s.price));
    const maxPrice = Math.max(...allStations.map(s => s.price));

    let html = `
        <div class="results">
            <div class="stats">
                <div class="stat-card">
                    <div class="stat-value">${Object.keys(departmentGroups).length}</div>
                    <div class="stat-label">Départements</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${avgPrice.toFixed(3)}€</div>
                    <div class="stat-label">Prix moyen</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${minPrice.toFixed(3)}€</div>
                    <div class="stat-label">Prix minimum</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${maxPrice.toFixed(3)}€</div>
                    <div class="stat-label">Prix maximum</div>
                </div>
            </div>
    `;

    // Sort departments by number
    const sortedDepartments = Object.keys(departmentGroups).sort((a, b) => 
        parseInt(a) - parseInt(b)
    );

    sortedDepartments.forEach(dept => {
        const stations = departmentGroups[dept];
        const deptName = getDepartmentName(dept);

        html += `
            <div class="department-section">
                <div class="department-header">
                    <div class="department-name">${dept} - ${deptName}</div>
                    <div class="station-count">${stations.length} station${stations.length > 1 ? 's' : ''}</div>
                </div>
                <div class="stations-grid">
        `;

        stations.forEach((station, index) => {
            const rank = index + 1;
            let rankClass = '';
            if (rank === 1) rankClass = 'gold';
            else if (rank === 2) rankClass = 'silver';
            else if (rank === 3) rankClass = 'bronze';

            html += `
                <div class="station-card">
                    <div class="rank-badge ${rankClass}">${rank}</div>
                    <div class="station-name">${station.city}</div>
                    <div class="station-address">${station.address}</div>
                    <div class="price">
                        ${station.price.toFixed(3)}<span class="price-unit">€/L</span>
                    </div>
                    <div class="station-info">
                        <div class="info-item">📍 ${station.cp}</div>
                        ${station.latitude && station.longitude ? 
                            `<div class="info-item">
                                <a href="https://www.google.com/maps?q=${station.latitude},${station.longitude}" 
                                   target="_blank" style="color: #667eea; text-decoration: none;">
                                   🗺️ Voir sur la carte
                                </a>
                            </div>` : ''
                        }
                    </div>
                </div>
            `;
        });

        html += `
                </div>
            </div>
        `;
    });

    html += '</div>';
    content.innerHTML = html;
}

function getDepartmentName(code) {
    const departments = {
        '01': 'Ain', '02': 'Aisne', '03': 'Allier', '04': 'Alpes-de-Haute-Provence',
        '05': 'Hautes-Alpes', '06': 'Alpes-Maritimes', '07': 'Ardèche', '08': 'Ardennes',
        '09': 'Ariège', '10': 'Aube', '11': 'Aude', '12': 'Aveyron',
        '13': 'Bouches-du-Rhône', '14': 'Calvados', '15': 'Cantal', '16': 'Charente',
        '17': 'Charente-Maritime', '18': 'Cher', '19': 'Corrèze', '21': 'Côte-d\'Or',
        '22': 'Côtes-d\'Armor', '23': 'Creuse', '24': 'Dordogne', '25': 'Doubs',
        '26': 'Drôme', '27': 'Eure', '28': 'Eure-et-Loir', '29': 'Finistère',
        '2A': 'Corse-du-Sud', '2B': 'Haute-Corse', '30': 'Gard', '31': 'Haute-Garonne',
        '32': 'Gers', '33': 'Gironde', '34': 'Hérault', '35': 'Ille-et-Vilaine',
        '36': 'Indre', '37': 'Indre-et-Loire', '38': 'Isère', '39': 'Jura',
        '40': 'Landes', '41': 'Loir-et-Cher', '42': 'Loire', '43': 'Haute-Loire',
        '44': 'Loire-Atlantique', '45': 'Loiret', '46': 'Lot', '47': 'Lot-et-Garonne',
        '48': 'Lozère', '49': 'Maine-et-Loire', '50': 'Manche', '51': 'Marne',
        '52': 'Haute-Marne', '53': 'Mayenne', '54': 'Meurthe-et-Moselle', '55': 'Meuse',
        '56': 'Morbihan', '57': 'Moselle', '58': 'Nièvre', '59': 'Nord',
        '60': 'Oise', '61': 'Orne', '62': 'Pas-de-Calais', '63': 'Puy-de-Dôme',
        '64': 'Pyrénées-Atlantiques', '65': 'Hautes-Pyrénées', '66': 'Pyrénées-Orientales',
        '67': 'Bas-Rhin', '68': 'Haut-Rhin', '69': 'Rhône', '70': 'Haute-Saône',
        '71': 'Saône-et-Loire', '72': 'Sarthe', '73': 'Savoie', '74': 'Haute-Savoie',
        '75': 'Paris', '76': 'Seine-Maritime', '77': 'Seine-et-Marne', '78': 'Yvelines',
        '79': 'Deux-Sèvres', '80': 'Somme', '81': 'Tarn', '82': 'Tarn-et-Garonne',
        '83': 'Var', '84': 'Vaucluse', '85': 'Vendée', '86': 'Vienne',
        '87': 'Haute-Vienne', '88': 'Vosges', '89': 'Yonne', '90': 'Territoire de Belfort',
        '91': 'Essonne', '92': 'Hauts-de-Seine', '93': 'Seine-Saint-Denis', '94': 'Val-de-Marne',
        '95': 'Val-d\'Oise', '971': 'Guadeloupe', '972': 'Martinique', '973': 'Guyane',
        '974': 'La Réunion', '976': 'Mayotte'
    };
    return departments[code] || 'Département inconnu';
}

function loadLocalData() {
    const loadBtn = document.getElementById('loadBtn');
    const content = document.getElementById('content');
    
    // Show loading state
    loadBtn.disabled = true;
    content.innerHTML = `
        <div class="loading">
            <div class="spinner"></div>
            <p>Génération des données de démonstration...</p>
        </div>
    `;

    // Simulate loading delay for better UX
    setTimeout(() => {
        // Demo data for testing without CORS issues
        const fuelType = document.getElementById('fuelType').value;
        const departmentFilter = document.getElementById('department').value.trim();
        
        let demoStations = generateDemoData();
        
        // Filter by department if specified
        if (departmentFilter) {
            demoStations = demoStations.filter(station => 
                station.department === departmentFilter
            );
        }
        
        stationsData = demoStations;
        const departmentGroups = groupByDepartment(demoStations);
        displayResults(departmentGroups, fuelType);
        
        loadBtn.disabled = false;
    }, 500);
}

function generateDemoData() {
    const departments = ['75', '92', '93', '94', '13', '69', '33', '59', '44', '31'];
    const cities = {
        '75': ['Paris 15e', 'Paris 12e', 'Paris 18e', 'Paris 20e', 'Paris 11e'],
        '92': ['Boulogne-Billancourt', 'Neuilly-sur-Seine', 'Levallois-Perret', 'Issy-les-Moulineaux'],
        '93': ['Saint-Denis', 'Montreuil', 'Aubervilliers', 'Pantin'],
        '94': ['Créteil', 'Vitry-sur-Seine', 'Ivry-sur-Seine', 'Maisons-Alfort'],
        '13': ['Marseille', 'Aix-en-Provence', 'Aubagne', 'Martigues'],
        '69': ['Lyon', 'Villeurbanne', 'Vénissieux', 'Caluire-et-Cuire'],
        '33': ['Bordeaux', 'Mérignac', 'Pessac', 'Talence'],
        '59': ['Lille', 'Roubaix', 'Tourcoing', 'Villeneuve-d\'Ascq'],
        '44': ['Nantes', 'Saint-Herblain', 'Rezé', 'Saint-Nazaire'],
        '31': ['Toulouse', 'Colomiers', 'Tournefeuille', 'Blagnac']
    };

    const stations = [];
    departments.forEach(dept => {
        const deptCities = cities[dept];
        for (let i = 0; i < 15; i++) {
            const city = deptCities[Math.floor(Math.random() * deptCities.length)];
            stations.push({
                id: `${dept}${String(i).padStart(4, '0')}`,
                latitude: 48.8566 + (Math.random() - 0.5) * 5,
                longitude: 2.3522 + (Math.random() - 0.5) * 5,
                cp: `${dept}${String(Math.floor(Math.random() * 900) + 100)}`,
                department: dept,
                address: `${Math.floor(Math.random() * 200)} rue de ${['la République', 'la Liberté', 'la Paix', 'Victor Hugo'][Math.floor(Math.random() * 4)]}`,
                city: city,
                price: 1.65 + Math.random() * 0.30
            });
        }
    });

    return stations;
}
