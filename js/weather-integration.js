// weather-integration.js - Integration for Advanced Weather System

// Extend the existing FrontierSimulation class with advanced weather
if (typeof window.FrontierSimulation !== 'undefined') {
    
    // Store original methods
    const originalInitializeGameState = window.FrontierSimulation.prototype.initializeGameState;
    const originalSimulationStep = window.FrontierSimulation.prototype.simulationStep;
    const originalGenerateEvents = window.FrontierSimulation.prototype.generateEvents;

    // Extend initialization to include advanced weather
    window.FrontierSimulation.prototype.initializeGameState = function() {
        const gameState = originalInitializeGameState.call(this);
        
        // Initialize advanced weather system
        this.weatherSystem = new AdvancedWeatherSystem(gameState);
        this.weatherEventGenerator = new WeatherEventGenerator(this.weatherSystem);
        
        // Add weather-related resources
        gameState.resources.firewood = 50;
        gameState.resources.winter_clothing = 10;
        gameState.resources.storm_supplies = 20;
        
        // Initialize character weather resistance
        gameState.characters.forEach(character => {
            character.weatherResistance = {
                cold: window.FrontierUtils.Random.float(0.7, 1.3),
                heat: window.FrontierUtils.Random.float(0.7, 1.3),
                wet: window.FrontierUtils.Random.float(0.7, 1.3),
                wind: window.FrontierUtils.Random.float(0.7, 1.3)
            };
            
            character.shelterPreference = window.FrontierUtils.Random.choice([
                'seeks_shelter_quickly', 'weather_hardy', 'average_tolerance'
            ]);
        });
        
        // Add weather-resistant buildings
        if (gameState.infrastructure.buildings.length > 2) {
            gameState.infrastructure.buildings.push({
                name: 'Storm Cellar',
                type: 'shelter',
                capacity: 20,
                condition: 90,
                special: 'tornado_safe'
            });
        }
        
        console.log('🌪️ Advanced weather system initialized');
        return gameState;
    };

    // Extend simulation step to include weather processing
    window.FrontierSimulation.prototype.simulationStep = function() {
        // Process weather first (affects everything else)
        if (this.weatherSystem) {
            this.weatherSystem.processDaily();
        }
        
        // Call original simulation step
        originalSimulationStep.call(this);
        
        // Apply weather effects to character activities
        if (this.weatherSystem) {
            this.processWeatherEffectsOnActivities();
        }
    };

    // Extend event generation to include weather events
    window.FrontierSimulation.prototype.generateEvents = function() {
        const events = originalGenerateEvents.call(this);
        
        // Add weather-generated events
        if (this.weatherEventGenerator) {
            const weatherEvents = this.weatherEventGenerator.generateWeatherEvents();
            events.push(...weatherEvents);
        }
        
        // Add weather-specific narrative events
        const weatherNarrativeEvents = this.generateWeatherNarrativeEvents();
        events.push(...weatherNarrativeEvents);
        
        return events;
    };

    // Process how weather affects character activities
    window.FrontierSimulation.prototype.processWeatherEffectsOnActivities = function() {
        const weather = this.gameState.weather;
        const movementRestrictions = this.gameState.movementRestrictions || {};
        
        this.gameState.characters.forEach(character => {
            // Skip dead characters
            if (!character.isAlive) return;
            
            const resistance = character.weatherResistance || {};
            
            // Force activity changes based on severe weather
            if (movementRestrictions.travel_banned || weather.visibility < 0.3) {
                if (this.isOutdoorActivity(character.currentActivity)) {
                    character.currentActivity = 'sheltering_indoors';
                    character.stats.mood -= 3; // Cabin fever
                }
            }
            
            // Cold weather effects
            if (weather.temperature < 0) {
                const coldResistance = resistance.cold || 1.0;
                if (this.isOutdoorActivity(character.currentActivity)) {
                    const coldPenalty = Math.floor((Math.abs(weather.temperature) / 10) / coldResistance);
                    character.stats.health -= coldPenalty;
                    character.stats.energy -= coldPenalty * 2;
                    
                    if (weather.temperature < -10 && coldResistance < 0.8) {
                        // Force indoors for cold-sensitive people
                        character.currentActivity = 'warming_by_fire';
                    }
                }
            }
            
            // Heat weather effects
            if (weather.temperature > 30) {
                const heatResistance = resistance.heat || 1.0;
                if (this.isOutdoorActivity(character.currentActivity)) {
                    const heatPenalty = Math.floor((weather.temperature - 30) / heatResistance);
                    character.stats.health -= heatPenalty;
                    character.stats.energy -= heatPenalty * 3;
                    
                    if (weather.temperature > 35 && heatResistance < 0.8) {
                        // Seek shade for heat-sensitive people
                        character.currentActivity = 'resting_in_shade';
                    }
                }
            }
            
            // Precipitation effects on mood and work
            if (weather.precipitation !== 'none') {
                const wetResistance = resistance.wet || 1.0;
                
                if (this.isOutdoorActivity(character.currentActivity)) {
                    character.stats.mood -= Math.floor(weather.precipitationIntensity * 5 / wetResistance);
                    
                    // Construction becomes impossible in heavy rain
                    if (weather.precipitation === 'heavy_rain' && character.currentActivity === 'construction') {
                        character.currentActivity = 'waiting_for_weather';
                    }
                    
                    // Mining dangerous in storms
                    if (weather.precipitation === 'thunderstorm' && character.currentActivity === 'mining') {
                        character.currentActivity = 'sheltering_indoors';
                        this.logWeatherEvent(`${character.name} stopped mining due to dangerous lightning`);
                    }
                }
            }
            
            // Wind effects
            if (weather.windSpeed > 25) {
                const windResistance = resistance.wind || 1.0;
                
                if (this.isOutdoorActivity(character.currentActivity)) {
                    character.stats.energy -= Math.floor(weather.windSpeed / 10 / windResistance);
                    
                    // High winds make outdoor work dangerous
                    if (weather.windSpeed > 40) {
                        if (character.currentActivity === 'construction' || character.currentActivity === 'roofing') {
                            character.currentActivity = 'waiting_for_weather';
                            this.logWeatherEvent(`${character.name} stopped work due to dangerous winds`);
                        }
                    }
                }
            }
            
            // Apply shelter bonuses
            if (this.isIndoorActivity(character.currentActivity)) {
                this.applyShelterBonuses(character, weather);
            }
            
            // Update character's weather experience
            this.updateWeatherExperience(character, weather);
        });
    };

    // Check if activity is outdoors
    window.FrontierSimulation.prototype.isOutdoorActivity = function(activity) {
        const outdoorActivities = [
            'farming', 'construction', 'mining', 'hunting', 'ranching', 
            'prospecting', 'scouting', 'herding_cattle', 'chopping_wood',
            'building_construction', 'roofing', 'road_work', 'well_digging'
        ];
        return outdoorActivities.includes(activity);
    };

    // Check if activity is indoors
    window.FrontierSimulation.prototype.isIndoorActivity = function(activity) {
        const indoorActivities = [
            'sheltering_indoors', 'warming_by_fire', 'resting_in_shade',
            'waiting_for_weather', 'crafting', 'cooking', 'reading',
            'planning', 'bookkeeping', 'teaching', 'medical_care'
        ];
        return indoorActivities.includes(activity);
    };

    // Apply bonuses for being in proper shelter
    window.FrontierSimulation.prototype.applyShelterBonuses = function(character, weather) {
        // Check what kind of shelter character has access to
        const buildings = this.gameState.infrastructure.buildings;
        const hasSturdy = buildings.some(b => b.condition > 70 && (b.type === 'stone' || b.special === 'reinforced'));
        const hasFireplace = buildings.some(b => b.type === 'residential' || b.name.includes('Hall'));
        
        // Shelter bonuses
        if (weather.temperature < 5 && hasFireplace) {
            character.stats.health += 1; // Warmth bonus
            character.stats.mood += 2; // Comfort bonus
        }
        
        if (weather.precipitation !== 'none' && hasSturdy) {
            character.stats.mood += 1; // Dry shelter bonus
        }
        
        // Storm cellar protection during severe weather
        const hasStormCellar = buildings.some(b => b.special === 'tornado_safe');
        if (hasStormCellar && this.weatherSystem.activeWeatherEvents.some(e => e.type === 'tornado')) {
            character.stats.health += 5; // Safety bonus
            character.stats.mood += 3; // Security feeling
        }
    };

    // Update character's weather experience and resistance
    window.FrontierSimulation.prototype.updateWeatherExperience = function(character, weather) {
        if (!character.weatherExperience) {
            character.weatherExperience = {
                coldDays: 0,
                hotDays: 0,
                stormDays: 0,
                totalExposure: 0
            };
        }
        
        // Track exposure only for outdoor activities
        if (this.isOutdoorActivity(character.currentActivity)) {
            character.weatherExperience.totalExposure++;
            
            if (weather.temperature < 0) {
                character.weatherExperience.coldDays++;
                // Gradually build cold resistance
                if (character.weatherExperience.coldDays > 30) {
                    character.weatherResistance.cold = Math.min(1.5, character.weatherResistance.cold + 0.01);
                }
            }
            
            if (weather.temperature > 30) {
                character.weatherExperience.hotDays++;
                // Gradually build heat resistance
                if (character.weatherExperience.hotDays > 30) {
                    character.weatherResistance.heat = Math.min(1.5, character.weatherResistance.heat + 0.01);
                }
            }
            
            if (weather.windSpeed > 20 || weather.precipitation !== 'none') {
                character.weatherExperience.stormDays++;
                // Build general weather hardiness
                if (character.weatherExperience.stormDays > 20) {
                    character.weatherResistance.wind = Math.min(1.4, character.weatherResistance.wind + 0.005);
                    character.weatherResistance.wet = Math.min(1.4, character.weatherResistance.wet + 0.005);
                }
            }
        }
    };

    // Generate weather-specific narrative events
    window.FrontierSimulation.prototype.generateWeatherNarrativeEvents = function() {
        const events = [];
        const weather = this.gameState.weather;
        const activeWeatherEvents = this.weatherSystem.activeWeatherEvents;
        
        // Seasonal weather transition events
        if (window.FrontierUtils.Random.chance(0.05)) {
            const seasonalEvent = this.generateSeasonalTransitionEvent();
            if (seasonalEvent) events.push(seasonalEvent);
        }
        
        // Weather preparation events
        if (window.FrontierUtils.Random.chance(0.08)) {
            const prepEvent = this.generateWeatherPreparationEvent();
            if (prepEvent) events.push(prepEvent);
        }
        
        // Weather aftermath events
        if (activeWeatherEvents.length === 0 && this.hadRecentSevereWeather()) {
            if (window.FrontierUtils.Random.chance(0.15)) {
                const aftermathEvent = this.generateWeatherAftermathEvent();
                if (aftermathEvent) events.push(aftermathEvent);
            }
        }
        
        // Weather folklore/superstition events
        if (window.FrontierUtils.Random.chance(0.03)) {
            const folkloreEvent = this.generateWeatherFolkloreEvent();
            if (folkloreEvent) events.push(folkloreEvent);
        }
        
        return events;
    };

    // Generate seasonal transition events
    window.FrontierSimulation.prototype.generateSeasonalTransitionEvent = function() {
        const season = this.gameState.season;
        const weather = this.gameState.weather;
        const character = window.FrontierUtils.Random.choice(this.gameState.characters);
        
        const seasonalEvents = {
            spring: [
                `${character.name} noticed the first wildflowers blooming despite the harsh conditions`,
                `${character.name} spotted migrating birds returning to the territory`,
                `The first green shoots appeared in ${character.name}'s garden plot`
            ],
            summer: [
                `${character.name} wiped sweat from their brow as the summer heat intensified`,
                `${character.name} watched heat waves shimmer across the distant hills`,
                `The relentless sun forced ${character.name} to seek work in the early morning hours`
            ],
            fall: [
                `${character.name} gathered fallen leaves, knowing winter wasn't far behind`,
                `${character.name} watched the aspens turn golden on the mountainsides`,
                `The first frost prompted ${character.name} to harvest the remaining crops`
            ],
            winter: [
                `${character.name} chopped extra firewood as winter's grip tightened`,
                `${character.name} checked the food stores with growing concern about the long winter ahead`,
                `Ice formed on ${character.name}'s breath as they stepped outside`
            ]
        };
        
        const eventList = seasonalEvents[season] || seasonalEvents.spring;
        
        return {
            type: 'environmental',
            subtype: 'seasonal',
            description: window.FrontierUtils.Random.choice(eventList),
            participants: [character],
            effects: [{ type: 'mood', character: character.id, modifier: 2 }],
            severity: 2
        };
    };

    // Generate weather preparation events
    window.FrontierSimulation.prototype.generateWeatherPreparationEvent = function() {
        const predictions = this.weatherSystem.predictWeather(3);
        const character = window.FrontierUtils.Random.choice(this.gameState.characters);
        
        // Look for predicted severe weather
        const severePredicted = predictions.some(p => 
            p.expectedTemperature < -5 || p.expectedTemperature > 35 || p.precipitationChance > 0.7
        );
        
        if (!severePredicted) return null;
        
        const prepEvents = [
            `${character.name} sensed a storm coming and began securing loose items around the settlement`,
            `${character.name} noticed unusual cloud formations and warned others to prepare for bad weather`,
            `${character.name} felt their old injury aching - a sure sign of approaching rough weather`,
            `${character.name} watched the animals acting nervous and decided to bring them closer to shelter`,
            `${character.name} checked the food and water supplies, anticipating several days of harsh weather`
        ];
        
        return {
            type: 'social',
            subtype: 'preparation',
            description: window.FrontierUtils.Random.choice(prepEvents),
            participants: [character],
            effects: [
                { type: 'resource_preparation', value: true },
                { type: 'community_mood', value: 3 }
            ],
            severity: 3
        };
    };

    // Check if there was recent severe weather
    window.FrontierSimulation.prototype.hadRecentSevereWeather = function() {
        const recentWeather = this.weatherSystem.weatherHistory.slice(-3);
        return recentWeather.some(record => 
            record.weather.hazards && record.weather.hazards.length > 0 ||
            record.weather.temperature < -10 || record.weather.temperature > 35 ||
            record.weather.windSpeed > 40
        );
    };

    // Generate aftermath events
    window.FrontierSimulation.prototype.generateWeatherAftermathEvent = function() {
        const character = window.FrontierUtils.Random.choice(this.gameState.characters);
        
        const aftermathEvents = [
            `${character.name} surveyed the damage left by the storm, grateful to have survived`,
            `${character.name} found broken branches and debris scattered around the settlement`,
            `${character.name} helped clear fallen trees from the main path`,
            `${character.name} discovered that their roof would need repairs after the severe weather`,
            `${character.name} and others worked together to restore what the storm had damaged`
        ];
        
        return {
            type: 'social',
            subtype: 'recovery',
            description: window.FrontierUtils.Random.choice(aftermathEvents),
            participants: [character],
            effects: [
                { type: 'community_cooperation', value: 5 },
                { type: 'mood', character: character.id, modifier: 1 }
            ],
            severity: 3
        };
    };

    // Generate weather folklore events
    window.FrontierSimulation.prototype.generateWeatherFolkloreEvent = function() {
        const character = window.FrontierUtils.Random.choice(this.gameState.characters);
        const weather = this.gameState.weather;
        
        const folkloreEvents = [
            `${character.name} shared an old saying: "Red sky at night, sailor's delight"`,
            `${character.name} claimed their grandmother could predict weather by watching cat behavior`,
            `${character.name} insisted that the way smoke rose from chimneys foretold tomorrow's weather`,
            `${character.name} pointed out unusual cloud shapes, claiming they meant good fortune`,
            `${character.name} found a woolly caterpillar and predicted the severity of the coming winter`
        ];
        
        return {
            type: 'social',
            subtype: 'folklore',
            description: window.FrontierUtils.Random.choice(folkloreEvents),
            participants: [character],
            effects: [
                { type: 'cultural_knowledge', value: 1 },
                { type: 'community_mood', value: 2 }
            ],
            severity: 1
        };
    };

    // Add weather information to game reports
    window.FrontierSimulation.prototype.getWeatherReport = function() {
        if (!this.weatherSystem) return null;
        return this.weatherSystem.getWeatherSummary();
    };

    // Add weather prediction capability
    window.FrontierSimulation.prototype.getWeatherForecast = function(days = 3) {
        if (!this.weatherSystem) return null;
        return this.weatherSystem.predictWeather(days);
    };

    // Enhanced event processing for weather effects
    const originalApplyEventEffect = window.FrontierSimulation.prototype.applyEventEffect;
    
    window.FrontierSimulation.prototype.applyEventEffect = function(effect, participants) {
        // Call original method first
        if (originalApplyEventEffect) {
            originalApplyEventEffect.call(this, effect, participants);
        }
        
        // Handle weather-specific effects
        switch (effect.type) {
            case 'weather_resistance_gain':
                participants.forEach(character => {
                    if (effect.resistance_type && character.weatherResistance) {
                        character.weatherResistance[effect.resistance_type] = Math.min(1.5, 
                            character.weatherResistance[effect.resistance_type] + (effect.value || 0.1)
                        );
                    }
                });
                break;
                
            case 'shelter_improvement':
                const building = this.gameState.infrastructure.buildings.find(b => b.name === effect.building);
                if (building) {
                    building.condition = Math.min(100, building.condition + (effect.value || 10));
                    if (effect.special) {
                        building.special = effect.special;
                    }
                }
                break;
                
            case 'weather_supplies_gain':
                if (effect.supply_type && this.gameState.resources[effect.supply_type]) {
                    this.gameState.resources[effect.supply_type] += effect.value || 1;
                }
                break;
                
            case 'seasonal_preparation':
                // Temporarily boost resource generation or protection
                this.gameState.seasonalPreparation = {
                    type: effect.preparation_type,
                    duration: effect.duration || 7,
                    bonus: effect.bonus || 1.2
                };
                break;
        }
    };

    // Add weather data to chronicle export
    const originalExportChronicle = window.FrontierSimulation.prototype.exportChronicle;
    
    window.FrontierSimulation.prototype.exportChronicle = function() {
        const chronicle = originalExportChronicle.call(this);
        
        if (this.weatherSystem) {
            chronicle.weatherData = this.weatherSystem.exportWeatherData();
            chronicle.climateSummary = {
                extremeEventsCount: this.weatherSystem.activeWeatherEvents.length,
                averageTemperature: this.calculateAverageTemperature(),
                severeWeatherDays: this.countSevereWeatherDays(),
                weatherPatterns: this.weatherSystem.weatherPatterns
            };
        }
        
        return chronicle;
    };

    // Calculate average temperature from weather history
    window.FrontierSimulation.prototype.calculateAverageTemperature = function() {
        if (!this.weatherSystem.weatherHistory.length) return 0;
        
        const totalTemp = this.weatherSystem.weatherHistory.reduce((sum, record) => 
            sum + record.weather.temperature, 0
        );
        
        return Math.round(totalTemp / this.weatherSystem.weatherHistory.length);
    };

    // Count days with severe weather
    window.FrontierSimulation.prototype.countSevereWeatherDays = function() {
        if (!this.weatherSystem.weatherHistory.length) return 0;
        
        return this.weatherSystem.weatherHistory.filter(record => 
            record.weather.temperature < -10 || record.weather.temperature > 35 ||
            record.weather.windSpeed > 40 || record.weather.hazards.length > 0
        ).length;
    };

    // Log weather events to console
    window.FrontierSimulation.prototype.logWeatherEvent = function(message) {
        const timestamp = window.FrontierUtils.DateUtils.formatDate(this.gameState.date);
        console.log(`🌪️ [${timestamp}] ${message}`);
    };

    console.log('🌪️ Advanced weather system integration complete');
}

// Enhanced UI Integration for Weather System
if (typeof window.FrontierUI !== 'undefined') {
    
    // Store original methods
    const originalUpdateDisplay = window.FrontierUI.prototype.updateDisplay;
    const originalUpdateWeather = window.FrontierUI.prototype.updateWeather;

    // Extend display update to include advanced weather info
    window.FrontierUI.prototype.updateDisplay = function() {
        // Call original update
        originalUpdateDisplay.call(this);
        
        // Update advanced weather display
        if (this.simulation && this.simulation.weatherSystem) {
            this.updateAdvancedWeatherDisplay();
        }
    };

    // Enhanced weather display
    window.FrontierUI.prototype.updateWeather = function(gameState) {
        // Call original method
        if (originalUpdateWeather) {
            originalUpdateWeather.call(this, gameState);
        }
        
        // Add advanced weather info
        if (this.simulation && this.simulation.weatherSystem) {
            const weatherSummary = this.simulation.getWeatherReport();
            this.updateWeatherSummary(weatherSummary);
        }
    };

    // Update advanced weather display
    window.FrontierUI.prototype.updateAdvancedWeatherDisplay = function() {
        const weatherReport = this.simulation.getWeatherReport();
        if (!weatherReport) return;

        // Update visibility
        const visibilityElement = document.getElementById('visibility');
        if (visibilityElement) {
            visibilityElement.textContent = weatherReport.visibilityDescription;
            
            // Color code visibility
            if (weatherReport.visibility < 0.3) {
                visibilityElement.className = 'text-danger';
            } else if (weatherReport.visibility < 0.7) {
                visibilityElement.className = 'text-warning';
            } else {
                visibilityElement.className = 'text-success';
            }
        }

        // Update weather warnings
        this.updateWeatherWarnings(weatherReport.warnings);
        
        // Update active weather events
        this.updateActiveWeatherEvents(weatherReport.activeEvents);
        
        // Update weather pattern info
        this.updateWeatherPattern(weatherReport.pattern, weatherReport.patternDaysLeft);
    };

    // Update weather summary with enhanced info
    window.FrontierUI.prototype.updateWeatherSummary = function(weatherSummary) {
        // Update existing weather elements with enhanced descriptions
        if (this.elements.temperature) {
            this.elements.temperature.textContent = `${weatherSummary.temperature}°F (${weatherSummary.temperatureDescription})`;
        }
        
        if (this.elements.precipitation) {
            this.elements.precipitation.textContent = weatherSummary.precipitationDescription;
        }
        
        if (this.elements.windSpeed) {
            this.elements.windSpeed.textContent = `${weatherSummary.windSpeed} mph (${weatherSummary.windDescription})`;
        }
        
        if (this.elements.weatherConditions) {
            const conditions = weatherSummary.conditions.length > 0 ? 
                weatherSummary.conditions.join(', ') : weatherSummary.visibilityDescription;
            this.elements.weatherConditions.textContent = conditions;
        }
    };

    // Update weather warnings display
    window.FrontierUI.prototype.updateWeatherWarnings = function(warnings) {
        let warningsContainer = document.getElementById('weatherWarnings');
        
        if (!warningsContainer) {
            // Create warnings container
            warningsContainer = document.createElement('div');
            warningsContainer.id = 'weatherWarnings';
            warningsContainer.className = 'weather-warnings';
            
            // Insert after weather info
            const weatherInfo = document.querySelector('.weather-info');
            if (weatherInfo && weatherInfo.parentNode) {
                weatherInfo.parentNode.insertBefore(warningsContainer, weatherInfo.nextSibling);
            }
        }
        
        if (warnings.length === 0) {
            warningsContainer.innerHTML = '';
            warningsContainer.style.display = 'none';
            return;
        }
        
        warningsContainer.style.display = 'block';
        warningsContainer.innerHTML = warnings.map(warning => {
            const alertClass = warning.severity === 'danger' ? 'alert-danger' : 'alert-warning';
            return `
                <div class="alert ${alertClass} weather-warning">
                    <small><strong>⚠️ Weather Warning:</strong> ${warning.message}</small>
                </div>
            `;
        }).join('');
    };

    // Update active weather events display
    window.FrontierUI.prototype.updateActiveWeatherEvents = function(activeEvents) {
        let eventsContainer = document.getElementById('activeWeatherEvents');
        
        if (!eventsContainer) {
            // Create container in sidebar
            const sidebar = document.querySelector('.sidebar');
            if (sidebar) {
                eventsContainer = document.createElement('div');
                eventsContainer.id = 'activeWeatherEvents';
                eventsContainer.className = 'active-weather-events';
                sidebar.appendChild(eventsContainer);
            }
        }
        
        if (!eventsContainer) return;
        
        if (activeEvents.length === 0) {
            eventsContainer.innerHTML = '';
            return;
        }
        
        eventsContainer.innerHTML = `
            <div class="card mb-3">
                <div class="card-header">
                    <h6><i class="fas fa-exclamation-triangle text-danger"></i> Active Weather Events</h6>
                </div>
                <div class="card-body">
                    ${activeEvents.map(event => `
                        <div class="weather-event-item">
                            <strong class="text-danger">${event.type.toUpperCase()}</strong>
                            <div class="text-muted">
                                <small>Day ${event.duration} | Intensity: ${Math.round(event.intensity * 100)}%</small>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    };

    // Update weather pattern display
    window.FrontierUI.prototype.updateWeatherPattern = function(pattern, daysLeft) {
        let patternElement = document.getElementById('weatherPattern');
        
        if (!patternElement) {
            // Create pattern element
            const weatherInfo = document.querySelector('.weather-info');
            if (weatherInfo) {
                patternElement = document.createElement('div');
                patternElement.id = 'weatherPattern';
                patternElement.className = 'weather-pattern mt-2';
                weatherInfo.appendChild(patternElement);
            }
        }
        
        if (patternElement) {
            patternElement.innerHTML = `
                <small class="text-muted">
                    <i class="fas fa-chart-line"></i> Pattern: ${pattern.replace('_', ' ').toUpperCase()} 
                    (${daysLeft} days remaining)
                </small>
            `;
        }
    };

    // Add weather forecast panel
    window.FrontierUI.prototype.addWeatherForecastPanel = function() {
        const sidebar = document.querySelector('.sidebar');
        if (!sidebar) return;
        
        const forecastPanel = document.createElement('div');
        forecastPanel.className = 'card mb-3';
        forecastPanel.innerHTML = `
            <div class="card-header">
                <h6><i class="fas fa-cloud-sun"></i> Weather Forecast</h6>
            </div>
            <div class="card-body">
                <div id="weatherForecastContent">
                    <div class="text-center text-muted">
                        <i class="fas fa-spinner fa-spin"></i> Loading...
                    </div>
                </div>
                <hr>
                <div class="d-grid gap-2">
                    <button id="weatherReportBtn" class="btn btn-outline-info btn-sm">
                        <i class="fas fa-chart-area"></i> Weather Report
                    </button>
                </div>
            </div>
        `;
        
        // Insert after medical panel if it exists, otherwise after status panel
        const medicalPanel = sidebar.querySelector('#medicalPanel');
        const statusPanel = sidebar.querySelector('.card:nth-child(2)');
        const insertAfter = medicalPanel || statusPanel;
        
        if (insertAfter && insertAfter.nextSibling) {
            sidebar.insertBefore(forecastPanel, insertAfter.nextSibling);
        } else {
            sidebar.appendChild(forecastPanel);
        }
        
        // Add event listeners
        const weatherReportBtn = document.getElementById('weatherReportBtn');
        if (weatherReportBtn) {
            weatherReportBtn.addEventListener('click', () => this.showWeatherReport());
        }
        
        // Update forecast content
        this.updateWeatherForecast();
    };

    // Update weather forecast content
    window.FrontierUI.prototype.updateWeatherForecast = function() {
        const forecastContent = document.getElementById('weatherForecastContent');
        if (!forecastContent || !this.simulation || !this.simulation.weatherSystem) return;
        
        const forecast = this.simulation.getWeatherForecast(3);
        if (!forecast) {
            forecastContent.innerHTML = '<small class="text-muted">Forecast unavailable</small>';
            return;
        }
        
        forecastContent.innerHTML = forecast.map(prediction => {
            const confidenceClass = prediction.confidence > 0.7 ? 'text-success' : 
                                  prediction.confidence > 0.4 ? 'text-warning' : 'text-danger';
            
            return `
                <div class="forecast-day">
                    <div class="d-flex justify-content-between">
                        <small><strong>Day +${prediction.day}</strong></small>
                        <small class="${confidenceClass}">${Math.round(prediction.confidence * 100)}% confidence</small>
                    </div>
                    <div class="forecast-details">
                        <small>Temp: ${prediction.expectedTemperature}°F</small><br>
                        <small>Rain: ${Math.round(prediction.precipitationChance * 100)}%</small><br>
                        ${prediction.expectedConditions.length > 0 ? 
                            `<small class="text-muted">${prediction.expectedConditions[0]}</small>` : ''}
                    </div>
                </div>
                ${prediction.day < 3 ? '<hr class="my-2">' : ''}
            `;
        }).join('');
    };

    // Show detailed weather report
    window.FrontierUI.prototype.showWeatherReport = function() {
        if (!this.simulation || !this.simulation.weatherSystem) return;
        
        const weatherData = this.simulation.weatherSystem.exportWeatherData();
        const climateSummary = this.simulation.exportChronicle().climateSummary || {};
        
        const modalContent = `
            <div class="weather-report">
                <h5>Weather Analysis Report</h5>
                
                <div class="row mb-3">
                    <div class="col-6">
                        <div class="stat-card text-center">
                            <h3 class="text-info">${climateSummary.averageTemperature || 0}°F</h3>
                            <small>Average Temperature</small>
                        </div>
                    </div>
                    <div class="col-6">
                        <div class="stat-card text-center">
                            <h3 class="text-warning">${climateSummary.severeWeatherDays || 0}</h3>
                            <small>Severe Weather Days</small>
                        </div>
                    </div>
                </div>
                
                <div class="current-conditions mb-3">
                    <h6>Current Conditions:</h6>
                    <div class="row">
                        <div class="col-4">
                            <small><strong>Temperature:</strong><br>${weatherData.currentWeather.temperature}°F</small>
                        </div>
                        <div class="col-4">
                            <small><strong>Wind:</strong><br>${weatherData.currentWeather.windSpeed} mph ${weatherData.currentWeather.windDirection}</small>
                        </div>
                        <div class="col-4">
                            <small><strong>Humidity:</strong><br>${Math.round(weatherData.currentWeather.humidity * 100)}%</small>
                        </div>
                    </div>
                    <div class="row mt-2">
                        <div class="col-6">
                            <small><strong>Pressure:</strong> ${weatherData.currentWeather.pressure?.toFixed(2) || 'N/A'} inHg</small>
                        </div>
                        <div class="col-6">
                            <small><strong>Visibility:</strong> ${weatherData.currentWeather.visibility ? Math.round(weatherData.currentWeather.visibility * 100) : 'N/A'}%</small>
                        </div>
                    </div>
                </div>
                
                ${weatherData.activeEvents.length > 0 ? `
                    <div class="active-events mb-3">
                        <h6 class="text-danger">Active Weather Events:</h6>
                        ${weatherData.activeEvents.map(event => `
                            <div class="alert alert-danger">
                                <strong>${event.type.toUpperCase()}</strong> - Day ${event.duration}<br>
                                <small>Intensity: ${Math.round(event.intensity * 100)}% | Started: ${window.FrontierUtils.DateUtils.formatDateShort(event.startDate)}</small>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
                
                <div class="weather-pattern mb-3">
                    <h6>Weather Pattern:</h6>
                    <p><strong>${weatherData.currentPattern.replace('_', ' ').toUpperCase()}</strong> 
                    (${weatherData.patternDaysRemaining} days remaining)</p>
                    <small class="text-muted">Weather patterns influence temperature, precipitation, and storm frequency over several days.</small>
                </div>
                
                <div class="forecast-section mb-3">
                    <h6>Extended Forecast:</h6>
                    <div class="forecast-grid">
                        ${weatherData.predictions.slice(0, 7).map((pred, index) => `
                            <div class="forecast-item">
                                <strong>Day +${pred.day}</strong><br>
                                <small>${pred.expectedTemperature}°F</small><br>
                                <small>${Math.round(pred.precipitationChance * 100)}% rain</small><br>
                                <small class="text-muted">${Math.round(pred.confidence * 100)}% confidence</small>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                ${weatherData.warnings.length > 0 ? `
                    <div class="weather-warnings mb-3">
                        <h6 class="text-warning">Current Warnings:</h6>
                        ${weatherData.warnings.map(warning => `
                            <div class="alert alert-${warning.severity === 'danger' ? 'danger' : 'warning'}">
                                <small><strong>${warning.type.replace('_', ' ').toUpperCase()}:</strong> ${warning.message}</small>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
                
                <div class="weather-history mt-3">
                    <h6>Recent Weather History:</h6>
                    <div class="weather-log" style="max-height: 200px; overflow-y: auto;">
                        ${weatherData.currentWeather.weatherLog ? weatherData.currentWeather.weatherLog.slice(-10).map(entry => `
                            <div class="log-entry">
                                <small class="text-muted">${window.FrontierUtils.DateUtils.formatDateShort(entry.date)}</small>
                                <span class="log-message">${entry.message}</span>
                            </div>
                        `).join('') : '<small class="text-muted">No recent weather events logged</small>'}
                    </div>
                </div>
            </div>
        `;
        
        this.showModal('Weather Analysis Report', modalContent);
    };

    // Auto-add weather forecast panel when UI loads
    const originalAddMedicalPanel = window.FrontierUI.prototype.addMedicalPanel;
    window.FrontierUI.prototype.addMedicalPanel = function() {
        // Call original medical panel creation
        if (originalAddMedicalPanel) {
            originalAddMedicalPanel.call(this);
        }
        
        // Add weather forecast panel
        setTimeout(() => {
            this.addWeatherForecastPanel();
        }, 100);
    };

    // Update forecast regularly
    const originalUpdateDisplay2 = window.FrontierUI.prototype.updateDisplay;
    window.FrontierUI.prototype.updateDisplay = function() {
        originalUpdateDisplay2.call(this);
        
        // Update weather forecast
        if (this.simulation && this.simulation.weatherSystem) {
            this.updateWeatherForecast();
        }
    };

    console.log('🌪️ Advanced weather UI integration complete');
}

// Add CSS for weather styling
const weatherStyles = `
    <style>
    .weather-warnings {
        margin: 0.5rem 0;
    }
    
    .weather-warning {
        font-size: 0.8rem;
        padding: 0.5rem;
        margin-bottom: 0.25rem;
    }
    
    .active-weather-events .weather-event-item {
        padding: 0.5rem;
        background: #fff3cd;
        border: 1px solid #ffeaa7;
        border-radius: 0.25rem;
        margin-bottom: 0.5rem;
    }
    
    .weather-pattern {
        background: #f8f9fa;
        padding: 0.5rem;
        border-radius: 0.25rem;
        border-left: 3px solid #007bff;
    }
    
    .forecast-day {
        padding: 0.5rem 0;
    }
    
    .forecast-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
        gap: 0.5rem;
    }
    
    .forecast-item {
        background: #f8f9fa;
        padding: 0.5rem;
        border-radius: 0.25rem;
        text-align: center;
        font-size: 0.8rem;
        border: 1px solid #dee2e6;
    }
    
    .weather-report .stat-card {
        background: #f8f9fa;
        padding: 1rem;
        border-radius: 0.25rem;
        border: 1px solid #dee2e6;
    }
    
    .weather-log .log-entry {
        padding: 0.25rem 0;
        border-bottom: 1px solid #eee;
        font-size: 0.85rem;
    }
    
    .log-message {
        display: block;
        margin-left: 1rem;
    }
    
    .current-conditions {
        background: #f8f9fa;
        padding: 1rem;
        border-radius: 0.25rem;
        border: 1px solid #dee2e6;
    }
    
    .forecast-section {
        background: #f8f9fa;
        padding: 1rem;
        border-radius: 0.25rem;
        border: 1px solid #dee2e6;
    }
    
    @media (max-width: 768px) {
        .forecast-grid {
            grid-template-columns: repeat(2, 1fr);
        }
        
        .current-conditions .row {
            text-align: center;
        }
    }
    </style>
`;

// Auto-initialize weather panels when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Add weather forecast panel when UI is ready
    setTimeout(() => {
        if (window.frontierUI && window.frontierUI.addWeatherForecastPanel) {
            window.frontierUI.addWeatherForecastPanel();
        }
    }, 1500);
});

// Inject weather styles
document.head.insertAdjacentHTML('beforeend', weatherStyles);// weather-integration.js - Integration for Advanced Weather System

// Extend the existing FrontierSimulation class with advanced weather
if (typeof window.FrontierSimulation !== 'undefined') {
    
    // Store original methods
    const originalInitializeGameState = window.FrontierSimulation.prototype.initializeGameState;
    const originalSimulationStep = window.FrontierSimulation.prototype.simulationStep;
   const originalGenerateEvents = window.FrontierSimulation.prototype.generateEvents;
