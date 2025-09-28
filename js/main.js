// js/main.js - Enhanced Frontier Simulation with DataLoader Integration

class DataLoader {
    constructor() {
        this.loadedData = {
            events: null,
            names: null,
            backgrounds: null,
            worldData: null
        };
        this.isLoaded = false;
    }

    async loadAllData() {
        try {
            console.log('Loading simulation data...');
            
            // Load all JSON files in parallel
            const [eventsData, namesData, backgroundsData, worldData] = await Promise.all([
                this.loadJSON('./data/events.json'),
                this.loadJSON('./data/names.json'),
                this.loadJSON('./data/backgrounds.json'),
                this.loadJSON('./data/world-data.json')
            ]);

            this.loadedData = {
                events: eventsData,
                names: namesData,
                backgrounds: backgroundsData,
                worldData: worldData
            };

            this.isLoaded = true;
            console.log('All data loaded successfully');
            return this.loadedData;
            
        } catch (error) {
            console.error('Failed to load data:', error);
            // Fall back to hardcoded data
            this.createFallbackData();
            this.isLoaded = true;
            return this.loadedData;
        }
    }

    async loadJSON(filepath) {
        try {
            const response = await fetch(filepath);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.warn(`Failed to load ${filepath}:`, error);
            return null;
        }
    }

    createFallbackData() {
        console.log('Creating fallback data...');
        
        // Basic fallback names
        this.loadedData.names = {
            male: ['John', 'James', 'William', 'Charles', 'Joseph', 'Henry', 'Robert', 'Samuel'],
            female: ['Mary', 'Elizabeth', 'Sarah', 'Margaret', 'Anna', 'Martha', 'Catherine', 'Emma'],
            surnames: ['Smith', 'Johnson', 'Brown', 'Davis', 'Miller', 'Wilson', 'Moore', 'Taylor'],
            cultures: {
                'anglo-american': { weight: 0.6, surnames: ['Smith', 'Johnson', 'Brown'] },
                'irish': { weight: 0.15, surnames: ['O\'Brien', 'Murphy', 'Kelly'] },
                'german': { weight: 0.1, surnames: ['Mueller', 'Schmidt', 'Weber'] },
                'mexican': { weight: 0.1, surnames: ['Garcia', 'Martinez', 'Rodriguez'] },
                'chinese': { weight: 0.03, surnames: ['Chen', 'Wang', 'Li'] },
                'native-american': { weight: 0.02, surnames: ['Running Bear', 'Sky Walker'] }
            }
        };

        // Basic fallback backgrounds
        this.loadedData.backgrounds = [
            { 
                name: 'Farmer', 
                base_skills: { agriculture: 20, construction: 10 },
                starting_resources: ['tools', 'food'],
                daily_activities: ['farming', 'tending crops']
            },
            { 
                name: 'Prospector', 
                base_skills: { mining: 20, survival: 15 },
                starting_resources: ['tools', 'gold'],
                daily_activities: ['mining', 'prospecting']
            },
            { 
                name: 'Merchant', 
                base_skills: { social: 20, leadership: 10 },
                starting_resources: ['money', 'goods'],
                daily_activities: ['trading', 'negotiating']
            }
        ];

        // Basic fallback events
        this.loadedData.events = {
            social: {
                community: {
                    gatherings: [
                        {
                            template: "{character1} organized a community gathering at {location}",
                            effects: [{ type: "mood", target: "all", modifier: 5 }],
                            requirements: { population: 3 }
                        }
                    ]
                }
            }
        };
    }

    // Data access methods
getRandomName(gender, culture = null) {
    if (!this.isLoaded) return 'Unknown';
    
    const names = this.loadedData.names;
    if (!names || !names.names) return 'Unknown';
    
    const nameData = names.names;
    
    // Try cultural names first
    if (culture && nameData[gender] && nameData[gender][culture]) {
        const culturalNames = nameData[gender][culture];
        if (Array.isArray(culturalNames) && culturalNames.length > 0) {
            return culturalNames[Math.floor(Math.random() * culturalNames.length)];
        }
    }
    
    // Fall back to anglo_american if culture not found
    if (nameData[gender] && nameData[gender]['anglo_american']) {
        const fallbackNames = nameData[gender]['anglo_american'];
        return fallbackNames[Math.floor(Math.random() * fallbackNames.length)];
    }
    
    // Last resort fallback
    const fallbackNames = {
        male: ['John', 'James', 'William', 'Charles'],
        female: ['Mary', 'Elizabeth', 'Sarah', 'Margaret']
    };
    
    return fallbackNames[gender] ? fallbackNames[gender][Math.floor(Math.random() * fallbackNames[gender].length)] : 'Unknown';
}

getRandomSurname(culture = null) {
    if (!this.isLoaded) return 'Unknown';
    
    const names = this.loadedData.names;
    if (!names || !names.names) return 'Unknown';
    
    const nameData = names.names;
    
    // Try cultural surnames first
    if (culture && nameData.surnames && nameData.surnames[culture]) {
        const culturalSurnames = nameData.surnames[culture];
        if (Array.isArray(culturalSurnames) && culturalSurnames.length > 0) {
            return culturalSurnames[Math.floor(Math.random() * culturalSurnames.length)];
        }
    }
    
    // Fall back to anglo_american surnames
    if (nameData.surnames && nameData.surnames['anglo_american']) {
        const fallbackSurnames = nameData.surnames['anglo_american'];
        return fallbackSurnames[Math.floor(Math.random() * fallbackSurnames.length)];
    }
    
    // Last resort fallback
    const fallbackSurnames = ['Smith', 'Johnson', 'Brown', 'Davis', 'Miller'];
    return fallbackSurnames[Math.floor(Math.random() * fallbackSurnames.length)];
}

    getAllBackgrounds() {
        if (!this.isLoaded) return [];
        
        const backgroundsData = this.loadedData.backgrounds;
        if (!backgroundsData) return [];
        
        // Handle both flat array and nested structure
        if (Array.isArray(backgroundsData)) {
            return backgroundsData;
        }
        
        // Handle nested structure from your JSON
        if (backgroundsData.backgrounds) {
            const flatBackgrounds = [];
            Object.values(backgroundsData.backgrounds).forEach(category => {
                Object.values(category).forEach(background => {
                    if (background.name) {
                        flatBackgrounds.push(background);
                    }
                });
            });
            return flatBackgrounds;
        }
        
        return [];
    }

    getCulturalWeights() {
        if (!this.isLoaded) return { 'anglo_american': 1.0 };
        
        const names = this.loadedData.names;
        if (!names || !names.name_generation_rules) return { 'anglo_american': 1.0 };
        
        // Use the weights from your JSON structure
        const weights = names.name_generation_rules.cultural_weights.red_rock_territory;
        return weights || { 'anglo_american': 1.0 };
    }

    getEventData(category) {
    if (!this.isLoaded) return null;
    
    const events = this.loadedData.events;
    if (!events) return null;
    
    // Your events.json uses "event_categories" not "events"
    if (events.event_categories && events.event_categories[category]) {
        return events.event_categories[category];
    }
    
    // Fallback for other structures
    if (events[category]) {
        return events[category];
    }
    
    return null;
}

    getRandomEvent(category) {
        if (!this.isLoaded) return null;
        
        const categoryData = this.getEventData(category);
        if (!categoryData) return null;
        
        // Navigate through nested structure to find actual events
        const findEvents = (obj, depth = 0) => {
            if (depth > 3) return []; // Prevent infinite recursion
            
            let events = [];
            for (const [key, value] of Object.entries(obj)) {
                if (Array.isArray(value)) {
                    // Found an array of events
                    events.push(...value);
                } else if (typeof value === 'object' && value !== null) {
                    // Recursively search nested objects
                    events.push(...findEvents(value, depth + 1));
                }
            }
            return events;
        };
        
        const allEvents = findEvents(categoryData);
        if (allEvents.length === 0) return null;
        
        return allEvents[Math.floor(Math.random() * allEvents.length)];
    }

    getLocationData(locationName) {
        if (!this.isLoaded) return null;
        
        const worldData = this.loadedData.worldData;
        if (!worldData) return null;
        
        const locations = worldData.settlements || worldData.locations;
        return locations?.[locationName] || null;
    }
}

class FrontierSimulation {
    constructor() {
        // Get utilities from global scope
        this.utils = window.FrontierUtils;

        // Initialize data loader first
        this.dataLoader = new DataLoader();
        this.dataLoadPromise = null;
        
        // Simulation state
        this.gameState = null;
        this.isRunning = false;
        this.simulationSpeed = 200;
        this.currentStep = 0;
        this.maxSteps = 365;
        
        // Event system
        this.eventQueue = [];
        this.eventHistory = [];
        this.chronicle = [];
        
        // Initialize simulation after data loads
        this.initializeSimulation();
    }

    async initializeSimulation() {
        try {
            console.log('Initializing Frontier Simulation...');
            
            // Load all data files
            this.dataLoadPromise = this.dataLoader.loadAllData();
            await this.dataLoadPromise;
            
            // Initialize game state
            this.gameState = this.initializeGameState();
            
            console.log('Frontier Simulation ready');
            this.logGameState();
            
        } catch (error) {
            console.error('Failed to initialize simulation:', error);
            // Continue with fallback data
            this.gameState = this.initializeGameState();
        }
    }

    initializeGameState() {
        const date = new Date(1849, 2, 15); // March 15, 1849
        
        return {
            date: date,
            day: 1,
            season: this.utils.DateUtils.getSeason(date),
            weather: this.utils.WeatherGenerator.generateWeather(date, 'spring'),
            
            population: {
                total: 0,
                demographics: {
                    adults: 0,
                    children: 0,
                    elderly: 0
                },
                cultural_groups: {}
            },
            
            characters: this.generateInitialCharacters(),
            
            resources: {
                food: 100,
                water: 100,
                wood: 50,
                stone: 25,
                metal: 10,
                medicine: 20,
                ammunition: 15,
                tools: 30,
                money: 200
            },
            
            infrastructure: {
                buildings: [
                    { name: 'Main Hall', type: 'community', capacity: 50, condition: 100 },
                    { name: 'Storage Shed', type: 'storage', capacity: 200, condition: 85 },
                    { name: 'Well', type: 'water', capacity: 100, condition: 90 }
                ],
                defenses: {
                    walls: false,
                    watchtowers: 0,
                    armed_guards: 0
                }
            },
            
            economy: {
                trade_routes: [],
                market_prices: this.utils.EconomyGenerator.generateMarketPrices(),
                wealth_distribution: 'poor'
            },
            
            threats: {
                wildlife: 0.1,
                weather: 0.05,
                bandits: 0.02,
                disease: 0.03,
                conflicts: 0.01
            },
            
            technologies: ['basic_farming', 'carpentry', 'blacksmithing'],
            
            morale: {
                overall: 65,
                factors: ['new_settlement', 'hope_for_future'],
                recent_events: []
            }
        };
    }

    selectCulture() {
        const weights = this.dataLoader.getCulturalWeights();
        return this.utils.Random.weightedChoice(weights);
    }

    generateStatsFromBackground(background) {
        const baseStats = {
            health: this.utils.Random.int(70, 100),
            mood: this.utils.Random.int(40, 80),
            energy: this.utils.Random.int(60, 100),
            skills: {
                agriculture: this.utils.Random.int(20, 50),
                construction: this.utils.Random.int(20, 50),
                hunting: this.utils.Random.int(20, 50),
                social: this.utils.Random.int(20, 50),
                medical: this.utils.Random.int(10, 30),
                leadership: this.utils.Random.int(10, 40),
                mining: this.utils.Random.int(10, 30),
                trading: this.utils.Random.int(20, 50),
                survival: this.utils.Random.int(20, 50),
                metalwork: this.utils.Random.int(10, 30),
                tracking: this.utils.Random.int(10, 30),
                gunfighting: this.utils.Random.int(10, 30),
                entertainment: this.utils.Random.int(10, 30)
            }
        };

        // Apply background skill bonuses from base_skills
        if (background.base_skills) {
            Object.entries(background.base_skills).forEach(([skill, value]) => {
                if (baseStats.skills[skill] !== undefined) {
                    baseStats.skills[skill] = Math.min(100, value + this.utils.Random.int(-10, 10));
                }
            });
        }

        return baseStats;
    }

    selectInitialActivity(background) {
        // Use background data if available
        if (background.daily_activities && Array.isArray(background.daily_activities)) {
            return this.utils.Random.choice(background.daily_activities);
        }
        
        // Fallback based on background name
        const backgroundActivities = {
            'Farmer': ['farming', 'tending crops', 'preparing soil', 'harvesting'],
            'Prospector': ['mining', 'prospecting', 'panning gold', 'exploring'],
            'Merchant': ['trading', 'negotiating', 'inventory management', 'customer relations'],
            'Carpenter': ['woodworking', 'construction', 'tool maintenance', 'furniture making'],
            'Hunter': ['hunting', 'tracking', 'preparing meat', 'scouting'],
            'Doctor': ['treating patients', 'preparing medicine', 'health inspections'],
            'Blacksmith': ['metalworking', 'tool forging', 'horseshoeing', 'repairs'],
            'Preacher': ['leading services', 'counseling', 'community organizing'],
            'Sheriff': ['patrolling', 'maintaining order', 'investigating', 'training'],
            'Saloon Keeper': ['serving customers', 'entertainment', 'managing establishment'],
            'Rancher': ['herding cattle', 'maintaining fences', 'breaking horses'],
            'Trapper': ['setting traps', 'hunting game', 'processing pelts'],
            'Scout': ['scouting routes', 'gathering intelligence', 'guiding travelers'],
            'Teacher': ['teaching children', 'preparing lessons', 'community lectures']
        };
        
        const activities = backgroundActivities[background.name] || ['general work', 'community tasks'];
        return this.utils.Random.choice(activities);
    }

    generateInventoryFromBackground(background) {
        const inventory = {};
        
        if (background.starting_resources && Array.isArray(background.starting_resources)) {
            // Convert array to object with quantities
            background.starting_resources.forEach(item => {
                // Convert item names to quantities
                const itemMap = {
                    'seeds': { seeds: 3 },
                    'farming_tools': { tools: 2 },
                    'preserved_food': { food: 5 },
                    'livestock': { livestock: 2 },
                    'saddle': { saddle: 1 },
                    'rope': { rope: 1 },
                    'branding_iron': { tools: 1 },
                    'hammer': { tools: 1 },
                    'anvil': { anvil: 1 },
                    'metal_scraps': { metal: 3 },
                    'forge_tools': { tools: 3 },
                    'saw': { tools: 1 },
                    'nails': { nails: 20 },
                    'measuring_tools': { tools: 1 },
                    'coin_purse': { money: 50 },
                    'trade_goods': { goods: 5 },
                    'ledger': { books: 1 },
                    'scales': { tools: 1 },
                    'strongbox': { strongbox: 1 },
                    'currency': { money: 100 },
                    'legal_documents': { documents: 1 },
                    'medical_bag': { medical_supplies: 1 },
                    'medicines': { medicine: 5 },
                    'surgical_tools': { tools: 2 },
                    'medical_books': { books: 2 },
                    'books': { books: 3 },
                    'writing_supplies': { paper: 10, ink: 1 },
                    'slate': { slate: 1 },
                    'teaching_materials': { books: 2 },
                    'law_books': { books: 5 },
                    'formal_attire': { clothing: 2 },
                    'bible': { books: 1 },
                    'hymnal': { books: 1 },
                    'vestments': { clothing: 1 },
                    'religious_texts': { books: 3 },
                    'pickaxe': { tools: 1 },
                    'pan': { tools: 1 },
                    'sample_bags': { bags: 5 },
                    'camping_gear': { camping_supplies: 1 },
                    'traps': { traps: 5 },
                    'rifle': { weapons: 1 },
                    'ammunition': { ammo: 20 },
                    'pelts': { pelts: 3 },
                    'compass': { compass: 1 },
                    'maps': { maps: 1 },
                    'survival_gear': { survival_supplies: 1 },
                    'horse': { horses: 1 },
                    'badge': { badge: 1 },
                    'revolver': { weapons: 1 },
                    'handcuffs': { handcuffs: 1 },
                    'federal_badge': { badge: 1 },
                    'quality_firearms': { weapons: 2 },
                    'legal_authority': { documents: 1 },
                    'liquor_stock': { liquor: 10 },
                    'gaming_equipment': { games: 1 },
                    'musical_instruments': { instruments: 1 },
                    'costumes': { clothing: 3 },
                    'performance_materials': { materials: 1 }
                };
                
                const mappedItems = itemMap[item] || { [item]: 1 };
                Object.entries(mappedItems).forEach(([key, value]) => {
                    inventory[key] = (inventory[key] || 0) + value;
                });
            });
        }
        
        // Ensure basic items exist
        if (Object.keys(inventory).length === 0) {
            return this.generateBasicInventory();
        }
        
        // Add some basic items everyone should have
        inventory.clothing = inventory.clothing || 2;
        inventory.personal_items = inventory.personal_items || 1;
        inventory.food = inventory.food || 3;
        
        return inventory;
    }

    generateInitialCharacters() {
        const characters = [];
        const characterCount = 8;
        
        // Ensure data is loaded, fall back if not
        if (!this.dataLoader.isLoaded) {
            console.warn('Data not yet loaded, using basic character generation');
            return this.generateBasicCharacters();
        }
        
        const allBackgrounds = this.dataLoader.getAllBackgrounds();
        if (allBackgrounds.length === 0) {
            console.warn('No backgrounds loaded, using basic characters');
            return this.generateBasicCharacters();
        }
        
        for (let i = 0; i < characterCount; i++) {
            const gender = this.utils.Random.chance(0.5) ? 'male' : 'female';
            const culture = this.selectCulture();
            
            const firstName = this.dataLoader.getRandomName(gender, culture);
            const lastName = this.dataLoader.getRandomSurname(culture);
            const background = this.utils.Random.choice(allBackgrounds);
            
            if (!background || !background.name) {
                console.error('Invalid background object:', background);
                continue;
            }
            
            const character = {
                id: `char_${i}`,
                name: `${firstName} ${lastName}`,
                age: this.utils.Random.int(18, 65),
                gender: gender,
                culture: culture,
                background: background.name,
                
                // Enhanced stats using background data
                stats: this.generateStatsFromBackground(background),
                
                // Relationships with other characters
                relationships: new Map(),
                
                // Current activity and schedule
                currentActivity: this.selectInitialActivity(background),
                activityHistory: [],
                
                // Personal traits and modifiers
                traits: this.generateCharacterTraits(),
                moodModifiers: [background.mood_modifier || 0],
                
                // Enhanced inventory from background
                inventory: this.generateInventoryFromBackground(background),
                
                // Life events and history
                personalHistory: [
                    `Arrived at Red Rock Territory on ${this.utils.DateUtils.formatDate(this.gameState?.date || new Date(1849, 2, 15))}`
                ],

                // Background-specific data
                backgroundData: {
                    description: background.description || '',
                    rarity: background.rarity || 'common',
                    special_abilities: background.special_abilities || [],
                    special_services: background.special_services || [],
                    seasonal_bonuses: background.seasonal_bonuses || {},
                    economic_impact: background.economic_impact || 'low'
                }
            };
            
            characters.push(character);
        }
        
        // Update population counts
        this.updatePopulationCounts(characters);
        
        return characters;
    }

    generateBasicCharacters() {
        // Fallback character generation when no data is loaded
        const characters = [];
        const characterCount = 8;
        
        const names = {
            male: ['John', 'James', 'William', 'Charles', 'Joseph'],
            female: ['Mary', 'Elizabeth', 'Sarah', 'Margaret', 'Anna'],
            surnames: ['Smith', 'Johnson', 'Brown', 'Davis', 'Miller']
        };
        
        const backgrounds = ['Farmer', 'Prospector', 'Merchant', 'Carpenter', 'Hunter'];
        
        for (let i = 0; i < characterCount; i++) {
            const gender = this.utils.Random.chance(0.5) ? 'male' : 'female';
            const firstName = this.utils.Random.choice(names[gender]);
            const lastName = this.utils.Random.choice(names.surnames);
            const background = this.utils.Random.choice(backgrounds);
            
            characters.push({
                id: `char_${i}`,
                name: `${firstName} ${lastName}`,
                age: this.utils.Random.int(18, 65),
                gender: gender,
                culture: 'anglo-american',
                background: background,
                stats: {
                    health: this.utils.Random.int(70, 100),
                    mood: this.utils.Random.int(40, 80),
                    energy: this.utils.Random.int(60, 100),
                    skills: {
                        agriculture: this.utils.Random.int(20, 70),
                        construction: this.utils.Random.int(20, 70),
                        hunting: this.utils.Random.int(20, 70),
                        social: this.utils.Random.int(20, 70),
                        medical: this.utils.Random.int(10, 50),
                        leadership: this.utils.Random.int(10, 60)
                    }
                },
                relationships: new Map(),
                currentActivity: 'settling_in',
                activityHistory: [],
                traits: this.generateCharacterTraits(),
                moodModifiers: [],
                inventory: this.generateBasicInventory(),
                personalHistory: [`Arrived at the settlement on ${this.utils.DateUtils.formatDate(new Date(1849, 2, 15))}`]
            });
        }
        
        return characters;
    }

    generateCharacterTraits() {
        const allTraits = [
            'hardworking', 'optimistic', 'cautious', 'brave', 'sociable',
            'independent', 'resourceful', 'stubborn', 'generous', 'practical',
            'religious', 'ambitious', 'patient', 'quick-tempered', 'loyal'
        ];
        
        const numTraits = this.utils.Random.int(2, 4);
        const selectedTraits = [];
        
        for (let i = 0; i < numTraits; i++) {
            const trait = this.utils.Random.choice(allTraits.filter(t => !selectedTraits.includes(t)));
            selectedTraits.push(trait);
        }
        
        return selectedTraits;
    }

    generateBasicInventory() {
        return {
            tools: this.utils.Random.int(1, 3),
            food: this.utils.Random.int(3, 8),
            money: this.utils.Random.int(10, 50),
            clothing: this.utils.Random.int(2, 5),
            personal_items: this.utils.Random.int(1, 3)
        };
    }

    updatePopulationCounts(characters) {
        if (!this.gameState) return;
        
        const demographics = { adults: 0, children: 0, elderly: 0 };
        const cultural_groups = {};
        
        characters.forEach(char => {
            // Age demographics
            if (char.age < 18) demographics.children++;
            else if (char.age > 60) demographics.elderly++;
            else demographics.adults++;
            
            // Cultural groups
            const culture = char.culture || 'unknown';
            cultural_groups[culture] = (cultural_groups[culture] || 0) + 1;
        });
        
        this.gameState.population = {
            total: characters.length,
            demographics,
            cultural_groups
        };
    }

    // Enhanced event generation using loaded data
    generateEvents() {
        const events = [];
        const currentSeason = this.gameState.season;
        
        // Try to use loaded event data first
        if (this.dataLoader.isLoaded) {
            const eventCategories = ['social', 'economic', 'environmental', 'conflict'];
            
            for (const category of eventCategories) {
                if (this.utils.Random.chance(0.3)) { // 30% chance per category
                    const eventTemplate = this.dataLoader.getRandomEvent(category);
                    if (eventTemplate) {
                        const generatedEvent = this.processEventTemplate(eventTemplate, category);
                        if (generatedEvent) {
                            events.push(generatedEvent);
                        }
                    }
                }
            }
        }
        
        // Add fallback random events if no data events were generated
        if (events.length === 0) {
            events.push(...this.generateFallbackEvents());
        }
        
        return events;
    }

    processEventTemplate(template, category) {
        // Check requirements
        if (template.requirements) {
            if (template.requirements.population && this.gameState.population.total < template.requirements.population) {
                return null;
            }
            if (template.requirements.season && !template.requirements.season.includes(this.gameState.season)) {
                return null;
            }
        }
        
        // Select participants
        const participantCount = template.participants || 1;
        const participants = this.selectEventParticipants(participantCount);
        if (participants.length === 0) return null;
        
        // Process template text
        const description = this.processTemplate(template.template, participants);
        
        return {
            id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: category,
            description: description,
            participants: participants,
            effects: template.effects || [],
            severity: template.severity || this.utils.Random.int(1, 5),
            date: new Date(this.gameState.date)
        };
    }

   processTemplate(template, participants) {
    let processed = template;
    
    // Replace character placeholders
    for (let i = 0; i < participants.length; i++) {
        const placeholder = `{character${i + 1}}`;
        // Fix: get the name from the character object
        const characterName = participants[i].name || participants[i];
        processed = processed.replace(new RegExp(placeholder, 'g'), characterName);
    }
    
    // Handle single character placeholder
    if (participants.length > 0) {
        const characterName = participants[0].name || participants[0];
        processed = processed.replace(/{character}/g, characterName);
    }
    
    // Replace other placeholders
    processed = processed.replace(/{location}/g, this.getRandomLocation());
    processed = processed.replace(/{weather}/g, this.getWeatherDescription());
    processed = processed.replace(/{season}/g, this.gameState.season);
    
    // Handle birth-specific placeholders
    processed = processed.replace(/{mother}/g, this.getRandomFemaleName());
    processed = processed.replace(/{father}/g, this.getRandomMaleName());
    processed = processed.replace(/{child_name}/g, this.getRandomChildName());
    processed = processed.replace(/{gender}/g, window.FrontierUtils.Random.choice(['boy', 'girl']));
    
    // Handle trade/economic placeholders
    processed = processed.replace(/{origin_city}/g, window.FrontierUtils.Random.choice(['San Francisco', 'Denver', 'Santa Fe', 'Fort Worth', 'St. Louis']));
    
    // Handle profession-specific placeholders
    processed = processed.replace(/{farmer1}/g, this.getCharacterByProfession('Farmer'));
    processed = processed.replace(/{farmer2}/g, this.getCharacterByProfession('Farmer'));
    processed = processed.replace(/{prospector}/g, this.getCharacterByProfession('Prospector'));
    processed = processed.replace(/{miner}/g, this.getCharacterByProfession(['Prospector', 'Miner']));
    processed = processed.replace(/{trader}/g, this.getCharacterByProfession('Merchant'));
    processed = processed.replace(/{doctor}/g, this.getCharacterByProfession('Doctor'));
    processed = processed.replace(/{preacher}/g, this.getCharacterByProfession('Preacher'));
    processed = processed.replace(/{sheriff}/g, this.getCharacterByProfession('Sheriff'));
    processed = processed.replace(/{blacksmith}/g, this.getCharacterByProfession('Blacksmith'));
    processed = processed.replace(/{hunter}/g, this.getCharacterByProfession('Hunter'));
    
    // Handle generic placeholders
    processed = processed.replace(/{witness}/g, this.getRandomCharacterName());
    processed = processed.replace(/{helper}/g, this.getRandomCharacterName());
    processed = processed.replace(/{victim}/g, this.getRandomCharacterName());
    processed = processed.replace(/{bride}/g, this.getRandomFemaleName());
    processed = processed.replace(/{groom}/g, this.getRandomMaleName());
    
    return processed;
}
    return processed;
}

    selectEventParticipants(count = 1) {
        const availableCharacters = this.gameState.characters.filter(char => 
            char.stats.health > 20 && char.stats.energy > 10
        );
        
        const selected = [];
        for (let i = 0; i < Math.min(count, availableCharacters.length); i++) {
            const participant = this.utils.Random.choice(availableCharacters.filter(c => !selected.includes(c)));
            if (participant) selected.push(participant);
        }
        
        return selected;
    }

    getRandomLocation() {
        const locations = [
            'Red Rock Ravine', 'Tobacco Town', 'Bloodmarsh Bog', 'Whiskey Creek',
            'the mining camp', 'the settlement center', 'the trading post', 'the church',
            'the main hall', 'near the well', 'the outskirts', 'the forest edge'
        ];
        return this.utils.Random.choice(locations);
    }

    getWeatherDescription() {
        const weather = this.gameState.weather;
        const conditions = [];
        
        if (weather.temperature < 0) conditions.push('freezing cold');
        else if (weather.temperature < 10) conditions.push('cold');
        else if (weather.temperature > 30) conditions.push('scorching heat');
        else if (weather.temperature > 25) conditions.push('warm');
        
        if (weather.precipitation !== 'none') {
            conditions.push(weather.precipitation);
        }
        
        return conditions.length > 0 ? conditions.join(', ') : 'clear skies';
    }

    generateFallbackEvents() {
        // Basic fallback events when no data is loaded
        const eventTypes = [
            'settler_conversation', 'animal_sighting', 'minor_discovery',
            'skill_practice', 'weather_change', 'resource_find'
        ];
        
        const events = [];
        const numEvents = this.utils.Random.int(1, 3);
        
        for (let i = 0; i < numEvents; i++) {
            const type = this.utils.Random.choice(eventTypes);
            const participants = this.selectEventParticipants(type.includes('conversation') ? 2 : 1);
            
            if (participants.length > 0) {
                events.push({
                    id: `fallback_${Date.now()}_${i}`,
                    type: 'general',
                    description: this.generateFallbackDescription(type, participants),
                    participants: participants,
                    effects: [],
                    severity: this.utils.Random.int(1, 3),
                    date: new Date(this.gameState.date)
                });
            }
        }
        
        return events;
    }

    generateFallbackDescription(type, participants) {
        const descriptions = {
            'settler_conversation': `${participants[0].name} had a friendly chat with ${participants[1]?.name || 'another settler'}`,
            'animal_sighting': `${participants[0].name} spotted wildlife near the settlement`,
            'minor_discovery': `${participants[0].name} found useful materials while working`,
            'skill_practice': `${participants[0].name} spent time improving their skills`,
            'weather_change': `${participants[0].name} noticed the weather changing`,
            'resource_find': `${participants[0].name} discovered some additional resources`
        };
        
        return descriptions[type] || `${participants[0].name} had an eventful day`;
    }

    // Rest of the simulation methods (start, stop, step, etc.)
    // Add these methods to your FrontierSimulation class

// Step forward multiple days
stepDays(numDays) {
    if (this.isRunning) {
        console.log('Cannot step while simulation is running. Stop first.');
        return;
    }
    
    console.log(`Advancing ${numDays} days...`);
    for (let i = 0; i < numDays; i++) {
        this.simulationStep();
    }
    console.log(`Advanced ${numDays} days. Current date: ${this.utils.DateUtils.formatDate(this.gameState.date)}`);
}

// Step to a specific season
stepToSeason(targetSeason) {
    if (this.isRunning) {
        console.log('Cannot step while simulation is running. Stop first.');
        return;
    }
    
    const seasons = ['winter', 'spring', 'summer', 'fall'];
    if (!seasons.includes(targetSeason)) {
        console.log('Invalid season. Use: winter, spring, summer, fall');
        return;
    }
    
    let daysAdvanced = 0;
    const maxDays = 365; // Prevent infinite loops
    
    while (this.gameState.season !== targetSeason && daysAdvanced < maxDays) {
        this.simulationStep();
        daysAdvanced++;
    }
    
    console.log(`Advanced ${daysAdvanced} days to reach ${targetSeason}. Current date: ${this.utils.DateUtils.formatDate(this.gameState.date)}`);
}

// Step to specific day count
stepToDay(targetDay) {
    if (this.isRunning) {
        console.log('Cannot step while simulation is running. Stop first.');
        return;
    }
    
    if (targetDay <= this.gameState.day) {
        console.log(`Already at or past day ${targetDay}. Current day: ${this.gameState.day}`);
        return;
    }
    
    const daysToAdvance = targetDay - this.gameState.day;
    this.stepDays(daysToAdvance);
}
    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        console.log('🏔️ Starting frontier simulation...');
        
        this.simulationInterval = setInterval(() => {
            this.simulationStep();
        }, this.simulationSpeed);
    }

    stop() {
        if (!this.isRunning) return;
        
        this.isRunning = false;
        console.log('⏸️ Simulation paused');
        
        if (this.simulationInterval) {
            clearInterval(this.simulationInterval);
            this.simulationInterval = null;
        }
    }

    simulationStep() {
        if (!this.gameState) return;
        
        this.currentStep++;
        
        // Advance time
        this.gameState.date.setDate(this.gameState.date.getDate() + 1);
        this.gameState.day++;
        this.gameState.season = this.utils.DateUtils.getSeason(this.gameState.date);
        
        // Update weather
        this.gameState.weather = this.utils.WeatherGenerator.generateWeather(
            this.gameState.date, 
            this.gameState.season
        );
        
        // Generate and process events
        const newEvents = this.generateEvents();
        this.eventQueue.push(...newEvents);
        
        // Process events
        this.processEvents();
        
        // Update character states
        this.updateCharacters();
        
        // Update resources and economy
        this.updateResources();
        
        // Log significant events
        if (newEvents.length > 0) {
            newEvents.forEach(event => {
                console.log(`📜 ${this.utils.DateUtils.formatDate(this.gameState.date)}: ${event.description}`);
                this.chronicle.push({
                    date: new Date(this.gameState.date),
                    description: event.description,
                    type: event.type,
                    participants: event.participants.map(p => p.name)
                });
            });
        }
        
        // Check win/lose conditions
        if (this.currentStep >= this.maxSteps) {
            this.stop();
            console.log('🎉 Simulation completed! One year in Red Rock Territory has passed.');
            this.displayFinalReport();
        }
    }

    processEvents() {
        this.eventQueue.forEach(event => {
            if (event.effects) {
                event.effects.forEach(effect => {
                    this.applyEventEffect(effect, event.participants);
                });
            }
        });
        
        // Move processed events to history
        this.eventHistory.push(...this.eventQueue);
        this.eventQueue = [];
    }

    applyEventEffect(effect, participants) {
        switch (effect.type) {
            case 'mood':
                if (effect.target === 'all') {
                    this.gameState.characters.forEach(char => {
                        char.stats.mood = Math.max(0, Math.min(100, char.stats.mood + effect.modifier));
                    });
                } else {
                    participants.forEach(char => {
                        char.stats.mood = Math.max(0, Math.min(100, char.stats.mood + effect.modifier));
                    });
                }
                break;
                
            case 'health':
                participants.forEach(char => {
                    char.stats.health = Math.max(0, Math.min(100, char.stats.health + effect.modifier));
                });
                break;
                
            case 'resource':
                if (this.gameState.resources[effect.resource]) {
                    this.gameState.resources[effect.resource] += effect.modifier;
                }
                break;
                
            case 'skill':
                participants.forEach(char => {
                    if (char.stats.skills[effect.skill]) {
                        char.stats.skills[effect.skill] = Math.max(0, Math.min(100, 
                            char.stats.skills[effect.skill] + effect.modifier));
                    }
                });
                break;
        }
    }

    updateCharacters() {
        this.gameState.characters.forEach(character => {
            // Daily energy and mood fluctuations
            character.stats.energy = Math.max(10, Math.min(100, 
                character.stats.energy + this.utils.Random.int(-5, 10)));
            
            // Mood influenced by weather, health, and traits
            let moodChange = 0;
            
            if (character.stats.health < 30) moodChange -= 5;
            if (character.stats.energy < 20) moodChange -= 3;
            if (this.gameState.weather.temperature < 0) moodChange -= 2;
            if (character.traits.includes('optimistic')) moodChange += 2;
            if (character.traits.includes('resilient')) moodChange += 1;
            
            character.stats.mood = Math.max(0, Math.min(100, character.stats.mood + moodChange));
            
            // Update activity based on background and skills
            if (this.utils.Random.chance(0.3)) {
                character.currentActivity = this.selectDailyActivity(character);
                character.activityHistory.push({
                    date: new Date(this.gameState.date),
                    activity: character.currentActivity
                });
            }
            
            // Skill development based on activities
            this.developSkills(character);
            
            // Health maintenance
            if (character.stats.health < 100 && this.utils.Random.chance(0.1)) {
                character.stats.health = Math.min(100, character.stats.health + 1);
            }
        });
    }

    selectDailyActivity(character) {
        // Use background data if available
        if (character.backgroundData && character.backgroundData.daily_activities) {
            const activities = character.backgroundData.daily_activities;
            return this.utils.Random.choice(activities);
        }
        
        // Fallback based on background name
        const backgroundActivities = {
            'Farmer': ['farming', 'tending crops', 'preparing soil', 'harvesting'],
            'Prospector': ['mining', 'prospecting', 'panning gold', 'exploring'],
            'Merchant': ['trading', 'negotiating', 'inventory management', 'customer relations'],
            'Carpenter': ['woodworking', 'construction', 'tool maintenance', 'furniture making'],
            'Hunter': ['hunting', 'tracking', 'preparing meat', 'scouting'],
            'Doctor': ['treating patients', 'preparing medicine', 'health inspections'],
            'Blacksmith': ['metalworking', 'tool forging', 'horseshoeing', 'repairs'],
            'Preacher': ['leading services', 'counseling', 'community organizing'],
            'Sheriff': ['patrolling', 'maintaining order', 'investigating', 'training'],
            'Saloon Keeper': ['serving customers', 'entertainment', 'managing establishment'],
            'Rancher': ['herding cattle', 'maintaining fences', 'breaking horses'],
            'Trapper': ['setting traps', 'hunting game', 'processing pelts'],
            'Scout': ['scouting routes', 'gathering intelligence', 'guiding travelers'],
            'Teacher': ['teaching children', 'preparing lessons', 'community lectures']
        };
        
        const activities = backgroundActivities[character.background] || ['general work', 'community tasks'];
        return this.utils.Random.choice(activities);
    }

    developSkills(character) {
        // Skill development based on current activity
        const skillMapping = {
            'farming': 'agriculture',
            'tending crops': 'agriculture',
            'construction': 'construction',
            'woodworking': 'construction',
            'hunting': 'hunting',
            'tracking': 'hunting',
            'mining': 'mining',
            'prospecting': 'mining',
            'trading': 'social',
            'negotiating': 'social',
            'treating patients': 'medical',
            'preparing medicine': 'medical',
            'leading services': 'leadership',
            'patrolling': 'leadership',
            'metalworking': 'metalwork',
            'tool forging': 'metalwork',
            'teaching children': 'social',
            'herding cattle': 'survival',
            'setting traps': 'hunting',
            'scouting routes': 'tracking'
        };
        
        const relevantSkill = skillMapping[character.currentActivity];
        if (relevantSkill && character.stats.skills[relevantSkill] && this.utils.Random.chance(0.1)) {
            character.stats.skills[relevantSkill] = Math.min(100, character.stats.skills[relevantSkill] + 1);
        }
    }

    updateResources() {
        // Resource generation based on character skills and activities
        let foodProduction = 0;
        let materialProduction = 0;
        let moneyGeneration = 0;
        
        this.gameState.characters.forEach(character => {
            // Food production from farmers
            if (character.background === 'Farmer' || character.currentActivity.includes('farming')) {
                foodProduction += Math.floor(character.stats.skills.agriculture / 20);
            }
            
            // Material production from various backgrounds
            if (character.background === 'Carpenter' || character.currentActivity.includes('construction')) {
                materialProduction += Math.floor(character.stats.skills.construction / 25);
            }
            
            // Money from merchants and services
            if (character.background === 'Merchant' || character.currentActivity.includes('trading')) {
                moneyGeneration += Math.floor(character.stats.skills.social / 30);
            }
            
            // Mining production
            if (character.background === 'Prospector' || character.currentActivity.includes('mining')) {
                const goldFound = Math.floor(character.stats.skills.mining / 40);
                moneyGeneration += goldFound;
                if (goldFound > 0 && this.utils.Random.chance(0.1)) {
                    this.gameState.resources.metal += 1;
                }
            }
        });
        
        // Apply resource changes
        this.gameState.resources.food += foodProduction;
        this.gameState.resources.wood += materialProduction;
        this.gameState.resources.money += moneyGeneration;
        
        // Daily consumption
        const dailyConsumption = {
            food: this.gameState.population.total * 2,
            water: this.gameState.population.total * 1,
            wood: Math.floor(this.gameState.population.total / 2)
        };
        
        Object.keys(dailyConsumption).forEach(resource => {
            this.gameState.resources[resource] = Math.max(0, 
                this.gameState.resources[resource] - dailyConsumption[resource]);
        });
        
        // Weather effects on resources
        if (this.gameState.weather.precipitation === 'heavy_rain') {
            this.gameState.resources.water += 10;
        }
        
        if (this.gameState.weather.temperature < -5) {
            this.gameState.resources.food -= 2; // Spoilage/increased consumption
        }
        
        // Update market prices based on supply/demand
        this.updateMarketPrices();
    }

    updateMarketPrices() {
        if (!this.gameState.economy.market_prices) return;
        
        Object.keys(this.gameState.economy.market_prices).forEach(resource => {
            const currentStock = this.gameState.resources[resource] || 0;
            const demand = this.gameState.population.total;
            
            // Simple supply/demand price adjustment
            let priceMultiplier = 1.0;
            
            if (currentStock < demand) {
                priceMultiplier += 0.1; // Scarcity increases prices
            } else if (currentStock > demand * 2) {
                priceMultiplier -= 0.05; // Surplus decreases prices
            }
            
            // Random market fluctuation
            priceMultiplier += this.utils.Random.float(-0.05, 0.05);
            
            this.gameState.economy.market_prices[resource] *= priceMultiplier;
            this.gameState.economy.market_prices[resource] = Math.max(0.1, 
                this.gameState.economy.market_prices[resource]);
        });
    }

    logGameState() {
        console.log('\n🏔️ === RED ROCK TERRITORY STATUS ===');
        console.log(`📅 Date: ${this.utils.DateUtils.formatDate(this.gameState.date)}`);
        console.log(`🌤️ Weather: ${this.getWeatherDescription()}`);
        console.log(`👥 Population: ${this.gameState.population.total}`);
        
        if (Object.keys(this.gameState.population.cultural_groups).length > 1) {
            console.log('🌍 Cultural Groups:');
            Object.entries(this.gameState.population.cultural_groups).forEach(([culture, count]) => {
                console.log(`   ${culture}: ${count}`);
            });
        }
        
        console.log('\n📦 Resources:');
        Object.entries(this.gameState.resources).forEach(([resource, amount]) => {
            console.log(`   ${resource}: ${amount}`);
        });
        
        console.log('\n👤 Characters:');
        this.gameState.characters.forEach(character => {
            console.log(`   ${character.name} (${character.background}, ${character.culture})`);
            console.log(`      Health: ${character.stats.health}, Mood: ${character.stats.mood}, Energy: ${character.stats.energy}`);
            console.log(`      Activity: ${character.currentActivity}`);
            console.log(`      Traits: ${character.traits.join(', ')}`);
        });
        
        console.log('\n🏛️ Morale: ' + this.gameState.morale.overall + '/100');
        console.log('=====================================\n');
    }

    displayFinalReport() {
        console.log('\n🎊 === FINAL REPORT: ONE YEAR IN RED ROCK TERRITORY ===');
        console.log(`📅 Period: March 15, 1849 - March 15, 1850`);
        console.log(`👥 Final Population: ${this.gameState.population.total}`);
        console.log(`🏛️ Final Morale: ${this.gameState.morale.overall}/100`);
        
        console.log('\n📊 Cultural Diversity:');
        Object.entries(this.gameState.population.cultural_groups).forEach(([culture, count]) => {
            const percentage = ((count / this.gameState.population.total) * 100).toFixed(1);
            console.log(`   ${culture}: ${count} (${percentage}%)`);
        });
        
        console.log('\n💰 Final Resources:');
        Object.entries(this.gameState.resources).forEach(([resource, amount]) => {
            console.log(`   ${resource}: ${amount}`);
        });
        
        console.log('\n📜 Major Events This Year:');
        const majorEvents = this.chronicle.filter(event => 
            event.type === 'conflict' || event.type === 'discovery' || 
            event.description.includes('significant') || event.description.includes('important')
        );
        
        majorEvents.slice(-10).forEach(event => {
            console.log(`   ${this.utils.DateUtils.formatDate(event.date)}: ${event.description}`);
        });
        
        console.log('\n🎯 Character Development:');
        this.gameState.characters.forEach(character => {
            const highestSkill = Object.entries(character.stats.skills)
                .reduce((a, b) => a[1] > b[1] ? a : b);
            console.log(`   ${character.name}: Mastered ${highestSkill[0]} (${highestSkill[1]})`);
        });
        
        // Calculate survival score
        const survivalScore = this.calculateSurvivalScore();
        console.log(`\n🏆 Survival Score: ${survivalScore}/100`);
        
        if (survivalScore > 80) {
            console.log('🌟 EXCEPTIONAL! Red Rock Territory thrived under your guidance!');
        } else if (survivalScore > 60) {
            console.log('✨ GOOD! The settlement grew and prospered!');
        } else if (survivalScore > 40) {
            console.log('👍 FAIR! The settlement survived the challenges!');
        } else {
            console.log('😔 TOUGH! It was a difficult year, but the settlement endured!');
        }
        
        console.log('=========================================================\n');
    }

    calculateSurvivalScore() {
        let score = 0;
        
        // Population survival and growth (30 points)
        const populationScore = Math.min(30, this.gameState.population.total * 3);
        score += populationScore;
        
        // Resource management (25 points)
        const resourceTotal = Object.values(this.gameState.resources).reduce((sum, val) => sum + val, 0);
        const resourceScore = Math.min(25, resourceTotal / 20);
        score += resourceScore;
        
        // Morale maintenance (20 points)
        const moraleScore = (this.gameState.morale.overall / 100) * 20;
        score += moraleScore;
        
        // Character health average (15 points)
        const avgHealth = this.gameState.characters.reduce((sum, char) => sum + char.stats.health, 0) / 
                         this.gameState.characters.length;
        const healthScore = (avgHealth / 100) * 15;
        score += healthScore;
        
        // Cultural diversity bonus (10 points)
        const diversityScore = Math.min(10, Object.keys(this.gameState.population.cultural_groups).length * 2);
        score += diversityScore;
        
        return Math.round(score);
    }

    // Utility methods for external access
    getGameState() {
        return this.gameState;
    }

    getChronicle() {
        return this.chronicle;
    }

    getEventHistory() {
        return this.eventHistory;
    }

    setSimulationSpeed(speed) {
        this.simulationSpeed = speed;
        if (this.isRunning) {
            this.stop();
            this.start();
        }
    }

    // Export chronicle for external use
    exportChronicle() {
        return {
            title: 'Red Rock Territory Chronicle',
            period: {
                start: 'March 15, 1849',
                end: this.utils.DateUtils.formatDate(this.gameState.date)
            },
            population: this.gameState.population,
            finalResources: this.gameState.resources,
            events: this.chronicle,
            characters: this.gameState.characters.map(char => ({
                name: char.name,
                background: char.background,
                culture: char.culture,
                finalStats: char.stats,
                traits: char.traits,
                personalHistory: char.personalHistory
            })),
            survivalScore: this.calculateSurvivalScore()
        };
    }
    getRandomFemaleName() {
    const femaleCharacters = this.gameState.characters.filter(c => c.gender === 'female');
    if (femaleCharacters.length > 0) {
        return window.FrontierUtils.Random.choice(femaleCharacters).name;
    }
    return 'a woman';
}

getRandomMaleName() {
    const maleCharacters = this.gameState.characters.filter(c => c.gender === 'male');
    if (maleCharacters.length > 0) {
        return window.FrontierUtils.Random.choice(maleCharacters).name;
    }
    return 'a man';
}

getRandomChildName() {
    // Generate a random child name using your data loader
    const gender = window.FrontierUtils.Random.choice(['male', 'female']);
    const culture = this.selectCulture();
    return this.dataLoader.getRandomName(gender, culture);
}
getCharacterByProfession(professions) {
    // Handle both single profession and array of professions
    const professionList = Array.isArray(professions) ? professions : [professions];
    
    const matchingCharacters = this.gameState.characters.filter(c => 
        professionList.includes(c.background)
    );
    
    if (matchingCharacters.length > 0) {
        return window.FrontierUtils.Random.choice(matchingCharacters).name;
    }
    
    // Fallback to any character if no matching profession
    return this.getRandomCharacterName();
}

getRandomCharacterName() {
    if (this.gameState.characters.length > 0) {
        return window.FrontierUtils.Random.choice(this.gameState.characters).name;
    }
    return 'a settler';
}
}

// Make classes available globally
if (typeof window !== 'undefined') {
    window.DataLoader = DataLoader;
    window.FrontierSimulation = FrontierSimulation;
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { DataLoader, FrontierSimulation };
}
