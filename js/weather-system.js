// weather-system.js - Advanced Weather & Environmental System

class AdvancedWeatherSystem {
    constructor(gameState) {
        this.gameState = gameState;
        this.weatherHistory = [];
        this.climateData = {};
        this.activeWeatherEvents = [];
        this.environmentalHazards = [];
        this.seasonalModifiers = {};
        
        this.initializeClimateData();
        this.initializeWeatherPatterns();
    }

    initializeClimateData() {
        // Red Rock Territory climate profile (high desert/mountain region)
        this.climateData = {
            baseTemperature: {
                winter: { min: -15, max: 5, avg: -5 },
                spring: { min: 0, max: 20, avg: 10 },
                summer: { min: 15, max: 40, avg: 27 },
                fall: { min: -5, max: 15, avg: 5 }
            },
            
            precipitation: {
                winter: { 
                    chance: 0.4, 
                    types: ['light_snow', 'heavy_snow', 'blizzard', 'ice_storm'],
                    weights: { light_snow: 0.4, heavy_snow: 0.3, blizzard: 0.2, ice_storm: 0.1 }
                },
                spring: { 
                    chance: 0.35, 
                    types: ['light_rain', 'heavy_rain', 'thunderstorm', 'flash_flood'],
                    weights: { light_rain: 0.4, heavy_rain: 0.3, thunderstorm: 0.2, flash_flood: 0.1 }
                },
                summer: { 
                    chance: 0.15, 
                    types: ['thunderstorm', 'hailstorm', 'dust_storm', 'drought'],
                    weights: { thunderstorm: 0.4, hailstorm: 0.2, dust_storm: 0.2, drought: 0.2 }
                },
                fall: { 
                    chance: 0.25, 
                    types: ['light_rain', 'heavy_rain', 'early_snow', 'fog'],
                    weights: { light_rain: 0.4, heavy_rain: 0.3, early_snow: 0.2, fog: 0.1 }
                }
            },
            
            wind: {
                baseSpeed: { min: 5, max: 25 },
                stormSpeed: { min: 30, max: 80 },
                directions: ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
            },
            
            extremeEvents: {
                tornado: { chance: 0.001, season: ['spring', 'summer'] },
                wildfire: { chance: 0.002, season: ['summer', 'fall'] },
                earthquake: { chance: 0.0005, season: 'any' },
                locust_swarm: { chance: 0.001, season: ['summer'] },
                severe_drought: { chance: 0.005, season: ['summer'] },
                killing_frost: { chance: 0.01, season: ['fall', 'spring'] }
            }
        };

        this.weatherEffects = {
            // Temperature effects
            extreme_cold: {
                threshold: -10,
                effects: {
                    health: { frostbite_chance: 0.1, hypothermia_chance: 0.05 },
                    resources: { wood_consumption: 3.0, water_freezing: true },
                    work: { outdoor_penalty: 0.7, construction_impossible: true },
                    crops: { damage_chance: 0.8, death_chance: 0.3 },
                    livestock: { death_chance: 0.2, milk_reduction: 0.6 }
                }
            },
            
            extreme_heat: {
                threshold: 35,
                effects: {
                    health: { heatstroke_chance: 0.08, dehydration_chance: 0.15 },
                    resources: { water_consumption: 2.5, food_spoilage: 0.3 },
                    work: { outdoor_penalty: 0.5, mining_dangerous: true },
                    crops: { water_need_multiplier: 2.0, wilting_chance: 0.4 },
                    livestock: { stress_multiplier: 1.8, egg_production_down: 0.4 }
                }
            },

            // Precipitation effects
            heavy_rain: {
                effects: {
                    movement: { travel_speed: 0.3, road_conditions: 'muddy' },
                    construction: { work_stoppage: true, foundation_damage: 0.1 },
                    health: { disease_spread: 1.3, respiratory_issues: 0.05 },
                    resources: { water_gain: 20, wood_rot_chance: 0.05 },
                    crops: { growth_boost: 1.2, flood_damage_chance: 0.2 }
                }
            },

            blizzard: {
                effects: {
                    movement: { travel_impossible: true, isolation: true },
                    resources: { food_consumption: 2.0, wood_consumption: 4.0 },
                    health: { cold_injury_chance: 0.3, cabin_fever: 0.1 },
                    work: { all_outdoor_stopped: true, indoor_only: true },
                    buildings: { roof_collapse_chance: 0.05, heating_critical: true }
                }
            },

            drought: {
                duration: 30, // days
                effects: {
                    water: { well_depletion: 0.8, rationing_needed: true },
                    crops: { massive_failure: 0.9, soil_degradation: true },
                    health: { dehydration_risk: 0.2, disease_concentration: 1.5 },
                    fire: { wildfire_chance: 0.3, tinderbox_conditions: true },
                    economy: { food_prices: 3.0, water_precious: true }
                }
            },

            flash_flood: {
                effects: {
                    buildings: { foundation_damage: 0.4, basement_flooding: 0.8 },
                    resources: { food_loss: 0.3, equipment_damage: 0.2 },
                    health: { drowning_risk: 0.1, waterborne_disease: 0.4 },
                    infrastructure: { bridge_damage: 0.6, road_washout: 0.5 },
                    displacement: { evacuation_needed: true, temporary_housing: true }
                }
            },

            hailstorm: {
                effects: {
                    crops: { destruction_chance: 0.7, harvest_loss: 0.8 },
                    buildings: { roof_damage: 0.3, window_breaking: 0.5 },
                    health: { injury_chance: 0.15, head_trauma_risk: 0.05 },
                    livestock: { injury_chance: 0.25, panic_stampede: 0.1 }
                }
            },

            dust_storm: {
                effects: {
                    health: { respiratory_disease: 0.2, eye_irritation: 0.8 },
                    visibility: { travel_dangerous: true, accidents_likely: true },
                    equipment: { machinery_damage: 0.1, clogging: true },
                    crops: { burial_chance: 0.3, soil_erosion: true }
                }
            },

            tornado: {
                effects: {
                    buildings: { total_destruction: 0.6, severe_damage: 0.9 },
                    health: { death_chance: 0.3, severe_injury: 0.7 },
                    resources: { massive_loss: 0.8, scattering: true },
                    landscape: { path_of_destruction: true, debris_field: true }
                }
            },

            wildfire: {
                duration: 7, // days
                effects: {
                    buildings: { wooden_destruction: 0.9, stone_damage: 0.3 },
                    health: { smoke_inhalation: 0.6, burns: 0.4, evacuation: true },
                    resources: { fuel_consumed: 0.95, metal_salvage: 0.2 },
                    environment: { forest_loss: 0.98, soil_sterilization: 0.7 },
                    wildlife: { animal_flight: true, ecosystem_collapse: 0.8 }
                }
            }
        };
    }
    calculateDerivedConditions(weather) {
    // Calculate visibility based on precipitation and conditions
    let visibility = 1.0;
    
    if (weather.precipitation !== 'none') {
        visibility -= weather.precipitationIntensity * 0.4;
    }
    
    if (weather.conditions.includes('dust_storm')) {
        visibility = 0.2;
    }
    
    if (weather.conditions.includes('blizzard')) {
        visibility = 0.1;
    }
    
    if (weather.conditions.includes('fog')) {
        visibility = 0.3;
    }
    
    weather.visibility = Math.max(0.05, Math.min(1.0, visibility));
    
    // Add hazard conditions based on weather severity
    if (weather.temperature < -10) {
        weather.hazards.push('extreme_cold');
    }
    
    if (weather.temperature > 35) {
        weather.hazards.push('extreme_heat');
    }
    
    if (weather.windSpeed > 40) {
        weather.hazards.push('dangerous_winds');
    }
    
    if (weather.precipitationIntensity > 0.8) {
        weather.hazards.push('severe_precipitation');
    }
}

    initializeWeatherPatterns() {
        // Track weather patterns and cycles
        this.weatherPatterns = {
            currentPattern: 'normal',
            patternDaysRemaining: 0,
            
            patterns: {
                normal: { duration: [10, 20], effects: {} },
                hot_spell: { duration: [5, 15], effects: { temperature_bonus: 8 } },
                cold_snap: { duration: [3, 12], effects: { temperature_penalty: -12 } },
                rainy_period: { duration: [4, 10], effects: { precipitation_bonus: 0.4 } },
                dry_spell: { duration: [7, 21], effects: { precipitation_penalty: -0.6 } },
                storm_season: { duration: [5, 14], effects: { storm_chance: 0.3 } }
            }
        };

        // Initialize first weather
        this.generateDailyWeather(true);
    }

    generateDailyWeather(isInitial = false) {
        const currentSeason = this.gameState.season;
        const date = this.gameState.date;
        
        // Update weather patterns
        this.updateWeatherPatterns(currentSeason);
        
        // Base weather generation
        const weather = this.generateBaseWeather(currentSeason);
        
        // Apply pattern modifiers
        this.applyPatternModifiers(weather);
        
        // Check for extreme events
        this.checkExtremeEvents(weather, currentSeason);
        
        // Calculate derived conditions
        this.calculateDerivedConditions(weather);
        
        // Store in history
        if (!isInitial) {
            this.weatherHistory.push({
                date: new Date(date),
                weather: { ...weather }
            });
            
            // Keep only last 30 days
            if (this.weatherHistory.length > 30) {
                this.weatherHistory.shift();
            }
        }
        
        // Update game state
        this.gameState.weather = weather;
        
        return weather;
    }

    generateBaseWeather(season) {
        const climate = this.climateData;
        const tempRange = climate.baseTemperature[season];
        const precipData = climate.precipitation[season];
        
        // Temperature with daily variation and trend
        const baseTemp = window.FrontierUtils.Random.int(tempRange.min, tempRange.max);
        const dailyVariation = window.FrontierUtils.Random.int(-5, 5);
        const seasonalTrend = this.getSeasonalTrend(season);
        
        const temperature = baseTemp + dailyVariation + seasonalTrend;
        
        // Precipitation
        let precipitation = 'none';
        let precipitationIntensity = 0;
        
        if (window.FrontierUtils.Random.chance(precipData.chance)) {
            precipitation = window.FrontierUtils.Random.weightedChoice(precipData.weights);
            precipitationIntensity = window.FrontierUtils.Random.float(0.3, 1.0);
        }
        
        // Wind
        const windSpeed = window.FrontierUtils.Random.int(
            climate.wind.baseSpeed.min, 
            climate.wind.baseSpeed.max
        );
        const windDirection = window.FrontierUtils.Random.choice(climate.wind.directions);
        
        // Cloud cover
        const cloudCover = precipitation !== 'none' ? 
            window.FrontierUtils.Random.float(0.7, 1.0) : 
            window.FrontierUtils.Random.float(0.0, 0.6);
        
        // Humidity
        const humidity = this.calculateHumidity(temperature, precipitation, season);
        
        // Barometric pressure
        const pressure = this.calculatePressure(cloudCover, windSpeed);
        
        return {
            temperature,
            precipitation,
            precipitationIntensity,
            windSpeed,
            windDirection,
            cloudCover,
            humidity,
            pressure,
            season,
            conditions: [],
            hazards: [],
            visibility: 1.0,
            dewPoint: this.calculateDewPoint(temperature, humidity)
        };
    }

    updateWeatherPatterns(season) {
        const patterns = this.weatherPatterns;
        
        // Decrement current pattern
        if (patterns.patternDaysRemaining > 0) {
            patterns.patternDaysRemaining--;
        }
        
        // Start new pattern if current one ended
        if (patterns.patternDaysRemaining <= 0) {
            // Choose new pattern based on season and current conditions
            const availablePatterns = this.getAvailablePatternsForSeason(season);
            const newPattern = window.FrontierUtils.Random.weightedChoice(availablePatterns);
            
            patterns.currentPattern = newPattern;
            const patternData = patterns.patterns[newPattern];
            patterns.patternDaysRemaining = window.FrontierUtils.Random.int(
                patternData.duration[0], 
                patternData.duration[1]
            );
            
            this.logWeatherEvent(`Weather pattern shifted to ${newPattern} for ${patterns.patternDaysRemaining} days`);
        }
    }

    getAvailablePatternsForSeason(season) {
        const baseWeights = {
            normal: 0.4,
            hot_spell: season === 'summer' ? 0.2 : season === 'spring' ? 0.1 : 0.05,
            cold_snap: season === 'winter' ? 0.2 : season === 'fall' ? 0.15 : 0.05,
            rainy_period: season === 'spring' ? 0.2 : season === 'fall' ? 0.15 : 0.1,
            dry_spell: season === 'summer' ? 0.25 : season === 'fall' ? 0.1 : 0.05,
            storm_season: season === 'spring' ? 0.15 : season === 'summer' ? 0.1 : 0.05
        };
        
        return baseWeights;
    }

    applyPatternModifiers(weather) {
        const currentPattern = this.weatherPatterns.patterns[this.weatherPatterns.currentPattern];
        const effects = currentPattern.effects;
        
        if (effects.temperature_bonus) {
            weather.temperature += effects.temperature_bonus;
        }
        
        if (effects.temperature_penalty) {
            weather.temperature += effects.temperature_penalty;
        }
        
        if (effects.precipitation_bonus && weather.precipitation !== 'none') {
            weather.precipitationIntensity = Math.min(1.0, weather.precipitationIntensity + effects.precipitation_bonus);
        }
        
        if (effects.precipitation_penalty) {
            weather.precipitationIntensity = Math.max(0, weather.precipitationIntensity + effects.precipitation_penalty);
            if (weather.precipitationIntensity < 0.1) {
                weather.precipitation = 'none';
                weather.precipitationIntensity = 0;
            }
        }
    }

    checkExtremeEvents(weather, season) {
        const extremeEvents = this.climateData.extremeEvents;
        
        Object.entries(extremeEvents).forEach(([eventType, eventData]) => {
            // Check if season is appropriate
            if (eventData.season !== 'any' && !eventData.season.includes(season)) {
                return;
            }
            
            // Check probability
            if (window.FrontierUtils.Random.chance(eventData.chance)) {
                this.triggerExtremeEvent(eventType, weather);
            }
        });
        
        // Check for weather-dependent extreme events
        this.checkConditionalExtremeEvents(weather);
    }

    triggerExtremeEvent(eventType, weather) {
        const event = {
            type: eventType,
            startDate: new Date(this.gameState.date),
            duration: this.getEventDuration(eventType),
            intensity: window.FrontierUtils.Random.float(0.5, 1.0),
            isActive: true
        };
        
        this.activeWeatherEvents.push(event);
        weather.conditions.push(eventType);
        weather.hazards.push(eventType);
        
        this.logWeatherEvent(`EXTREME WEATHER: ${eventType} has begun!`);
        
        // Immediate effects
        this.applyImmediateWeatherEffects(eventType, weather, event.intensity);
        
        // Create chronicle event
        this.createWeatherChronicleEvent(eventType, event.intensity);
    }

    checkConditionalExtremeEvents(weather) {
        // Wildfire conditions
        if (weather.temperature > 30 && weather.precipitation === 'none' && weather.windSpeed > 20) {
            if (window.FrontierUtils.Random.chance(0.05)) {
                this.triggerExtremeEvent('wildfire', weather);
            }
        }
        
        // Flash flood from heavy rain
        if (weather.precipitation === 'heavy_rain' && weather.precipitationIntensity > 0.8) {
            if (window.FrontierUtils.Random.chance(0.15)) {
                this.triggerExtremeEvent('flash_flood', weather);
            }
        }
        
        // Tornado conditions
        if (weather.temperature > 20 && weather.windSpeed > 25 && weather.precipitation === 'thunderstorm') {
            if (window.FrontierUtils.Random.chance(0.02)) {
                this.triggerExtremeEvent('tornado', weather);
            }
        }
        
        // Severe drought progression
        const recentPrecipitation = this.getRecentPrecipitationDays(7);
        if (recentPrecipitation === 0 && weather.temperature > 25) {
            if (window.FrontierUtils.Random.chance(0.08)) {
                this.triggerExtremeEvent('severe_drought', weather);
            }
        }
    }

    getEventDuration(eventType) {
        const durations = {
            tornado: 1,
            wildfire: window.FrontierUtils.Random.int(3, 14),
            earthquake: 1,
            locust_swarm: window.FrontierUtils.Random.int(5, 12),
            severe_drought: window.FrontierUtils.Random.int(21, 60),
            killing_frost: window.FrontierUtils.Random.int(1, 3),
            flash_flood: window.FrontierUtils.Random.int(1, 3),
            hailstorm: 1,
            dust_storm: window.FrontierUtils.Random.int(1, 3)
        };
        
        return durations[eventType] || 1;
    }

    applyImmediateWeatherEffects(eventType, weather, intensity) {
        const effects = this.weatherEffects[eventType];
        if (!effects) return;
        
        // Modify weather conditions
        switch (eventType) {
            case 'tornado':
                weather.windSpeed = Math.max(weather.windSpeed, 60 + (intensity * 40));
                weather.visibility = 0.1;
                weather.precipitation = 'heavy_rain';
                break;
                
            case 'wildfire':
                weather.temperature += 10 * intensity;
                weather.visibility = 0.3;
                weather.conditions.push('smoke', 'ash_fall');
                break;
                
            case 'severe_drought':
                weather.precipitation = 'none';
                weather.humidity = Math.max(0.1, weather.humidity - 0.4);
                weather.temperature += 5 * intensity;
                break;
                
            case 'dust_storm':
                weather.windSpeed = Math.max(weather.windSpeed, 30);
                weather.visibility = 0.2;
                weather.conditions.push('dust', 'sand');
                break;
                
            case 'hailstorm':
                weather.precipitation = 'hail';
                weather.windSpeed += 15;
                weather.temperature -= 5;
                break;
                
            case 'flash_flood':
                weather.precipitation = 'torrential_rain';
                weather.precipitationIntensity = 1.0;
                weather.conditions.push('flooding', 'debris_flow');
                break;
        }
    }

    // Update active weather events
    updateActiveWeatherEvents() {
        this.activeWeatherEvents = this.activeWeatherEvents.filter(event => {
            event.duration--;
            
            if (event.duration <= 0) {
                event.isActive = false;
                this.logWeatherEvent(`${event.type} has ended after ${this.getEventDuration(event.type) - event.duration} days`);
                return false;
            }
            
            // Continue applying effects for multi-day events
            this.applyOngoingWeatherEffects(event);
            return true;
        });
    }

    applyOngoingWeatherEffects(event) {
        const effects = this.weatherEffects[event.type];
        if (!effects.effects) return;
        
        // Apply daily effects during ongoing events
        Object.entries(effects.effects).forEach(([category, categoryEffects]) => {
            this.applyCategoryEffects(category, categoryEffects, event.intensity);
        });
    }

    applyCategoryEffects(category, effects, intensity) {
        switch (category) {
            case 'health':
                this.applyHealthEffects(effects, intensity);
                break;
            case 'resources':
                this.applyResourceEffects(effects, intensity);
                break;
            case 'work':
                this.applyWorkEffects(effects, intensity);
                break;
            case 'crops':
                this.applyCropEffects(effects, intensity);
                break;
            case 'livestock':
                this.applyLivestockEffects(effects, intensity);
                break;
            case 'buildings':
                this.applyBuildingEffects(effects, intensity);
                break;
            case 'movement':
                this.applyMovementEffects(effects, intensity);
                break;
        }
    }

    applyHealthEffects(effects, intensity) {
        this.gameState.characters.forEach(character => {
            // Frostbite from extreme cold
            if (effects.frostbite_chance && window.FrontierUtils.Random.chance(effects.frostbite_chance * intensity)) {
                const bodyPart = window.FrontierUtils.Random.choice(['leftLeg', 'rightLeg', 'leftArm', 'rightArm']);
                if (this.gameState.medicalSystem) {
                    this.gameState.medicalSystem.addInjury(character, 'frostbite', bodyPart, intensity, 'extreme cold');
                }
            }
            
            // Hypothermia
            if (effects.hypothermia_chance && window.FrontierUtils.Random.chance(effects.hypothermia_chance * intensity)) {
                character.stats.health -= 15 * intensity;
                character.stats.energy -= 20 * intensity;
                this.logWeatherEvent(`${character.name} is suffering from hypothermia`);
            }
            
            // Heat stroke
            if (effects.heatstroke_chance && window.FrontierUtils.Random.chance(effects.heatstroke_chance * intensity)) {
                character.stats.health -= 20 * intensity;
                character.stats.mood -= 10 * intensity;
                this.logWeatherEvent(`${character.name} is suffering from heat stroke`);
            }
            
            // Dehydration
            if (effects.dehydration_chance && window.FrontierUtils.Random.chance(effects.dehydration_chance * intensity)) {
                character.stats.health -= 10 * intensity;
                this.gameState.resources.water -= 2; // Emergency water use
            }
            
            // Respiratory issues from dust/smoke
            if (effects.respiratory_disease && window.FrontierUtils.Random.chance(effects.respiratory_disease * intensity)) {
                if (this.gameState.medicalSystem) {
                    this.gameState.medicalSystem.addDisease(character, 'respiratory_illness', 'environmental hazard');
                }
            }
            
            // Disease spread acceleration
            if (effects.disease_spread && character.diseases) {
                character.diseases.forEach(disease => {
                    if (disease.isSymptomPresent) {
                        // Accelerate disease progression
                        disease.durationDaysLeft = Math.max(1, disease.durationDaysLeft - 1);
                    }
                });
            }
        });
    }

    applyResourceEffects(effects, intensity) {
        const resources = this.gameState.resources;
        
        // Wood consumption changes
        if (effects.wood_consumption) {
            const extraConsumption = Math.floor(this.gameState.population.total * effects.wood_consumption * intensity);
            resources.wood = Math.max(0, resources.wood - extraConsumption);
        }
        
        // Water effects
        if (effects.water_consumption) {
            const extraConsumption = Math.floor(this.gameState.population.total * effects.water_consumption * intensity);
            resources.water = Math.max(0, resources.water - extraConsumption);
        }
        
        if (effects.water_gain) {
            resources.water += Math.floor(effects.water_gain * intensity);
        }
        
        if (effects.water_freezing) {
            // Reduce available water due to freezing
            resources.water = Math.max(0, resources.water - Math.floor(resources.water * 0.3 * intensity));
        }
        
        // Food effects
        if (effects.food_spoilage) {
            const spoilage = Math.floor(resources.food * effects.food_spoilage * intensity);
            resources.food = Math.max(0, resources.food - spoilage);
            this.logWeatherEvent(`${spoilage} units of food spoiled due to extreme heat`);
        }
        
        if (effects.food_consumption) {
            const extraConsumption = Math.floor(this.gameState.population.total * effects.food_consumption * intensity);
            resources.food = Math.max(0, resources.food - extraConsumption);
        }
        
        // Equipment damage
        if (effects.equipment_damage && window.FrontierUtils.Random.chance(effects.equipment_damage * intensity)) {
            const toolsLost = Math.floor(resources.tools * 0.1 * intensity);
            resources.tools = Math.max(0, resources.tools - toolsLost);
            this.logWeatherEvent(`${toolsLost} tools damaged by weather`);
        }
    }

    applyWorkEffects(effects, intensity) {
        this.gameState.characters.forEach(character => {
            // Outdoor work penalties
            if (effects.outdoor_penalty) {
                const outdoorActivities = ['farming', 'construction', 'mining', 'hunting', 'ranching'];
                if (outdoorActivities.includes(character.currentActivity)) {
                    character.stats.energy = Math.max(10, character.stats.energy * (1 - effects.outdoor_penalty * intensity));
                }
            }
            
            // Construction impossibility
            if (effects.construction_impossible) {
                if (character.currentActivity === 'construction' || character.currentActivity === 'building') {
                    character.currentActivity = 'taking_shelter';
                }
            }
            
            // All outdoor work stopped
            if (effects.all_outdoor_stopped) {
                const outdoorActivities = ['farming', 'construction', 'mining', 'hunting', 'ranching', 'prospecting'];
                if (outdoorActivities.includes(character.currentActivity)) {
                    character.currentActivity = 'sheltering_indoors';
                    character.stats.mood -= 5; // Cabin fever
                }
            }
            
            // Mining becomes dangerous
            if (effects.mining_dangerous && character.currentActivity === 'mining') {
                if (window.FrontierUtils.Random.chance(0.1 * intensity)) {
                    if (this.gameState.medicalSystem) {
                        this.gameState.medicalSystem.generateRandomInjury(character, 'heat_exhaustion_accident');
                    }
                }
            }
        });
    }

    applyCropEffects(effects, intensity) {
        // Simulate crop damage/benefits
        let cropDamage = 0;
        let cropMessage = '';
        
        if (effects.damage_chance && window.FrontierUtils.Random.chance(effects.damage_chance * intensity)) {
            cropDamage = Math.floor(this.gameState.resources.food * 0.2 * intensity);
            cropMessage = 'Crops damaged by extreme weather';
        }
        
        if (effects.death_chance && window.FrontierUtils.Random.chance(effects.death_chance * intensity)) {
            cropDamage += Math.floor(this.gameState.resources.food * 0.4 * intensity);
            cropMessage = 'Crops killed by extreme weather';
        }
        
        if (effects.destruction_chance && window.FrontierUtils.Random.chance(effects.destruction_chance * intensity)) {
            cropDamage = Math.floor(this.gameState.resources.food * 0.8 * intensity);
            cropMessage = 'Crops destroyed by severe weather';
        }
        
        if (effects.massive_failure && window.FrontierUtils.Random.chance(effects.massive_failure * intensity)) {
            cropDamage = Math.floor(this.gameState.resources.food * 0.9 * intensity);
            cropMessage = 'Massive crop failure due to drought';
        }
        
        if (cropDamage > 0) {
            this.gameState.resources.food = Math.max(0, this.gameState.resources.food - cropDamage);
            this.logWeatherEvent(`${cropMessage}: ${cropDamage} food lost`);
        }
        
        // Growth boost from good conditions
        if (effects.growth_boost) {
            const farmers = this.gameState.characters.filter(c => c.background === 'Farmer').length;
            const bonus = Math.floor(farmers * effects.growth_boost * intensity);
            this.gameState.resources.food += bonus;
            if (bonus > 0) {
                this.logWeatherEvent(`Favorable weather boosted crop growth: +${bonus} food`);
            }
        }
    }

    applyBuildingEffects(effects, intensity) {
        const buildings = this.gameState.infrastructure.buildings;
        
        buildings.forEach(building => {
            let damage = 0;
            
            // Foundation damage from floods
            if (effects.foundation_damage && window.FrontierUtils.Random.chance(effects.foundation_damage * intensity)) {
                damage = Math.floor(30 * intensity);
                this.logWeatherEvent(`${building.name} foundation damaged by flooding`);
            }
            
            // Roof damage from hail/wind
            if (effects.roof_damage && window.FrontierUtils.Random.chance(effects.roof_damage * intensity)) {
                damage = Math.floor(20 * intensity);
                this.logWeatherEvent(`${building.name} roof damaged by severe weather`);
            }
            
            // Roof collapse from snow load
            if (effects.roof_collapse_chance && window.FrontierUtils.Random.chance(effects.roof_collapse_chance * intensity)) {
                damage = Math.floor(60 * intensity);
                this.logWeatherEvent(`${building.name} roof collapsed under snow load!`);
                
                // Potential injuries to occupants
                this.checkBuildingCollapseInjuries(building);
            }
            
            // Total destruction from tornado/fire
            if (effects.total_destruction && window.FrontierUtils.Random.chance(effects.total_destruction * intensity)) {
                damage = 100;
                this.logWeatherEvent(`${building.name} completely destroyed!`);
            }
            
            // Wooden buildings burn in wildfire
            if (effects.wooden_destruction && building.type !== 'stone') {
                if (window.FrontierUtils.Random.chance(effects.wooden_destruction * intensity)) {
                    damage = 90;
                    this.logWeatherEvent(`${building.name} burned down in wildfire`);
                }
            }
            
            // Apply damage
            if (damage > 0) {
                building.condition = Math.max(0, building.condition - damage);
                
                // Remove building if completely destroyed
                if (building.condition <= 0) {
                    this.gameState.infrastructure.buildings = buildings.filter(b => b !== building);
                    this.gameState.morale.overall = Math.max(0, this.gameState.morale.overall - 10);
                }
            }
        });
    }

    checkBuildingCollapseInjuries(building) {
        // Check if anyone was in the building
        const occupants = this.gameState.characters.filter(char => 
            char.currentActivity === 'indoors' || 
            char.currentActivity === 'sheltering_indoors' ||
            window.FrontierUtils.Random.chance(0.3) // Some chance anyone could be inside
        );
        
        occupants.forEach(character => {
            if (window.FrontierUtils.Random.chance(0.4)) { // 40% chance of injury
                const injuryType = window.FrontierUtils.Random.choice(['crush', 'cut', 'fracture']);
                const bodyPart = window.FrontierUtils.Random.choice(['head', 'torso', 'leftArm', 'rightArm']);
                
                if (this.gameState.medicalSystem) {
                    this.gameState.medicalSystem.addInjury(character, injuryType, bodyPart, 1.2, 'building collapse');
                }
            }
        });
    }

    applyLivestockEffects(effects, intensity) {
        // Simulate livestock based on character backgrounds and resources
        const ranchers = this.gameState.characters.filter(c => c.background === 'Rancher').length;
        const farmers = this.gameState.characters.filter(c => c.background === 'Farmer').length;
        const estimatedLivestock = (ranchers * 10) + (farmers * 3); // Rough estimate
        
        if (estimatedLivestock === 0) return;
        
        let livestockLoss = 0;
        let livestockMessage = '';
        
        // Death from extreme weather
        if (effects.death_chance && window.FrontierUtils.Random.chance(effects.death_chance * intensity)) {
            livestockLoss = Math.floor(estimatedLivestock * 0.2 * intensity);
            livestockMessage = 'Livestock died from extreme weather';
        }
        
        // Injury from hail/stampede
        if (effects.injury_chance && window.FrontierUtils.Random.chance(effects.injury_chance * intensity)) {
            livestockLoss = Math.floor(estimatedLivestock * 0.1 * intensity);
            livestockMessage = 'Livestock injured in severe weather';
        }
        
        // Panic stampede
        if (effects.panic_stampede && window.FrontierUtils.Random.chance(effects.panic_stampede * intensity)) {
            livestockLoss = Math.floor(estimatedLivestock * 0.15 * intensity);
            livestockMessage = 'Livestock stampeded in panic';
            
            // Potential injury to ranchers
            const rancher = window.FrontierUtils.Random.choice(this.gameState.characters.filter(c => c.background === 'Rancher'));
            if (rancher && this.gameState.medicalSystem) {
                this.gameState.medicalSystem.generateRandomInjury(rancher, 'animal_attack');
            }
        }
        
        if (livestockLoss > 0) {
            // Reduce food resources as proxy for livestock loss
            const foodLoss = livestockLoss * 2;
            this.gameState.resources.food = Math.max(0, this.gameState.resources.food - foodLoss);
            this.gameState.morale.overall = Math.max(0, this.gameState.morale.overall - 5);
            this.logWeatherEvent(`${livestockMessage}: ${livestockLoss} livestock lost`);
        }
        
        // Reduced production effects
        if (effects.milk_reduction || effects.egg_production_down) {
            const productionLoss = Math.floor(estimatedLivestock * 0.5 * intensity);
            this.gameState.resources.food = Math.max(0, this.gameState.resources.food - productionLoss);
        }
    }

    applyMovementEffects(effects, intensity) {
        // Track movement restrictions
        this.gameState.movementRestrictions = this.gameState.movementRestrictions || {};
        
        if (effects.travel_impossible) {
            this.gameState.movementRestrictions.travel_banned = true;
            this.gameState.movementRestrictions.isolation = true;
        }
        
        if (effects.travel_speed) {
            this.gameState.movementRestrictions.speed_penalty = effects.travel_speed;
        }
        
        if (effects.road_conditions) {
            this.gameState.movementRestrictions.road_condition = effects.road_conditions;
        }
        
        if (effects.travel_dangerous) {
            this.gameState.movementRestrictions.danger_level = 'high';
            
            // Chance of travel accidents
            this.gameState.characters.forEach(character => {
                if (character.currentActivity === 'traveling' || character.currentActivity === 'scouting') {
                    if (window.FrontierUtils.Random.chance(0.15 * intensity)) {
                        if (this.gameState.medicalSystem) {
                            this.gameState.medicalSystem.generateRandomInjury(character, 'travel_accident');
                        }
                    }
                }
            });
        }
    }

    // Daily weather processing
    processDaily() {
        // Generate new weather
        this.generateDailyWeather();
        
        // Update active weather events
        this.updateActiveWeatherEvents();
        
        // Clear movement restrictions unless actively restricted
        if (!this.hasActiveRestrictions()) {
            this.gameState.movementRestrictions = {};
        }
        
        // Apply temperature-based effects
        this.applyTemperatureEffects();
        
        // Apply precipitation effects
        this.applyPrecipitationEffects();
        
        // Check for weather warnings
        this.checkWeatherWarnings();
    }

    applyTemperatureEffects() {
        const temp = this.gameState.weather.temperature;
        
        // Extreme cold effects
        if (temp <= -10) {
            const effects = this.weatherEffects.extreme_cold.effects;
            this.applyCategoryEffects('health', effects.health, 1.0);
            this.applyCategoryEffects('resources', effects.resources, 1.0);
            this.applyCategoryEffects('work', effects.work, 1.0);
        }
        
        // Extreme heat effects
        if (temp >= 35) {
            const effects = this.weatherEffects.extreme_heat.effects;
            this.applyCategoryEffects('health', effects.health, 1.0);
            this.applyCategoryEffects('resources', effects.resources, 1.0);
            this.applyCategoryEffects('work', effects.work, 1.0);
        }
    }

    applyPrecipitationEffects() {
        const precip = this.gameState.weather.precipitation;
        const intensity = this.gameState.weather.precipitationIntensity;
        
        if (precip !== 'none' && this.weatherEffects[precip]) {
            const effects = this.weatherEffects[precip].effects;
            Object.entries(effects).forEach(([category, categoryEffects]) => {
                this.applyCategoryEffects(category, categoryEffects, intensity);
            });
        }
    }

    hasActiveRestrictions() {
        return this.activeWeatherEvents.some(event => 
            ['blizzard', 'tornado', 'dust_storm', 'flash_flood'].includes(event.type)
        );
    }

    checkWeatherWarnings() {
        const weather = this.gameState.weather;
        const warnings = [];
        
        // Temperature warnings
        if (weather.temperature < -5) {
            warnings.push({
                type: 'cold_warning',
                message: 'Dangerous cold temperatures - risk of frostbite',
                severity: 'warning'
            });
        }
        
        if (weather.temperature > 32) {
            warnings.push({
                type: 'heat_warning',
                message: 'Extreme heat - risk of heat exhaustion',
                severity: 'warning'
            });
        }
        
        // Wind warnings
        if (weather.windSpeed > 40) {
            warnings.push({
                type: 'wind_warning',
                message: 'Dangerous winds - avoid outdoor activities',
                severity: 'danger'
            });
        }
        
        // Precipitation warnings
        if (weather.precipitation === 'heavy_rain' && weather.precipitationIntensity > 0.7) {
            warnings.push({
                type: 'flood_warning',
                message: 'Heavy rain may cause flooding',
                severity: 'warning'
            });
        }
        
        // Low visibility warnings
        if (weather.visibility < 0.5) {
            warnings.push({
                type: 'visibility_warning',
                message: 'Poor visibility - travel not recommended',
                severity: 'warning'
            });
        }
        
        // Store warnings
        this.gameState.weatherWarnings = warnings;
        
        // Log severe warnings
        warnings.forEach(warning => {
            if (warning.severity === 'danger') {
                this.logWeatherEvent(`WEATHER WARNING: ${warning.message}`);
            }
        });
    }

    // Utility functions
    getSeasonalTrend(season) {
        const dayOfYear = window.FrontierUtils.DateUtils.getDayOfYear(this.gameState.date);
        
        // Create gradual seasonal transitions
        switch (season) {
            case 'winter':
                return Math.sin((dayOfYear / 365) * Math.PI * 2) * -3;
            case 'spring':
                return Math.sin((dayOfYear / 365) * Math.PI * 2) * 2;
            case 'summer':
                return Math.sin((dayOfYear / 365) * Math.PI * 2) * 4;
            case 'fall':
                return Math.sin((dayOfYear / 365) * Math.PI * 2) * -1;
            default:
                return 0;
        }
    }

    calculateHumidity(temperature, precipitation, season) {
        let baseHumidity = 0.4; // Base 40%
        
        // Season affects base humidity
        const seasonalHumidity = {
            winter: 0.3,
            spring: 0.5,
            summer: 0.3,
            fall: 0.4
        };
        baseHumidity = seasonalHumidity[season];
        
        // Precipitation increases humidity
        if (precipitation !== 'none') {
            baseHumidity += 0.3;
        }
        
        // Temperature affects humidity (inverse relationship)
        if (temperature > 25) {
            baseHumidity -= 0.1;
        } else if (temperature < 0) {
            baseHumidity -= 0.2;
        }
        
        return Math.max(0.1, Math.min(1.0, baseHumidity + window.FrontierUtils.Random.float(-0.1, 0.1)));
    }

    calculatePressure(cloudCover, windSpeed) {
        let pressure = 30.0; // Base pressure in inches of mercury
        
        // Cloud cover lowers pressure
        pressure -= cloudCover * 0.5;
        
        // High wind indicates low pressure
        if (windSpeed > 20) {
            pressure -= 0.3;
        }
        
        return pressure + window.FrontierUtils.Random.float(-0.2, 0.2);
    }

    calculateDewPoint(temperature, humidity) {
        // Simplified dew point calculation
        return temperature - ((1 - humidity) * 25);
    }

    getRecentPrecipitationDays(days) {
        let precipDays = 0;
        const recentWeather = this.weatherHistory.slice(-days);
        
        recentWeather.forEach(record => {
            if (record.weather.precipitation !== 'none') {
                precipDays++;
            }
        });
        
        return precipDays;
    }

    // Weather prediction system
    predictWeather(daysAhead = 3) {
        const predictions = [];
        const currentPattern = this.weatherPatterns.currentPattern;
        const patternDaysLeft = this.weatherPatterns.patternDaysRemaining;
        
        for (let i = 1; i <= daysAhead; i++) {
            const prediction = {
                day: i,
                confidence: Math.max(0.3, 1.0 - (i * 0.2)), // Confidence decreases with time
                expectedTemperature: this.predictTemperature(i),
                precipitationChance: this.predictPrecipitation(i),
                expectedConditions: this.predictConditions(i, currentPattern, patternDaysLeft)
            };
            
            predictions.push(prediction);
        }
        
        return predictions;
    }

    predictTemperature(daysAhead) {
        const currentTemp = this.gameState.weather.temperature;
        const season = this.gameState.season;
        const tempRange = this.climateData.baseTemperature[season];
        
        // Temperature tends to revert to seasonal average
        const seasonalAvg = tempRange.avg;
        const reversion = (seasonalAvg - currentTemp) * 0.3;
        
        return currentTemp + reversion + window.FrontierUtils.Random.int(-5, 5);
    }

    predictPrecipitation(daysAhead) {
        const season = this.gameState.season;
        const baseChance = this.climateData.precipitation[season].chance;
        const recentPrecip = this.getRecentPrecipitationDays(3);
        
        // Adjust based on recent weather
        let adjustedChance = baseChance;
        if (recentPrecip === 0) {
            adjustedChance += 0.2; // Dry streak increases chance
        } else if (recentPrecip >= 2) {
            adjustedChance -= 0.15; // Recent rain decreases chance
        }
        
        return Math.max(0.05, Math.min(0.9, adjustedChance));
    }

    predictConditions(daysAhead, currentPattern, patternDaysLeft) {
        const conditions = [];
        
        // Pattern-based predictions
        if (patternDaysLeft > daysAhead) {
            switch (currentPattern) {
                case 'hot_spell':
                    conditions.push('continued hot weather');
                    break;
                case 'cold_snap':
                    conditions.push('continued cold weather');
                    break;
                case 'rainy_period':
                    conditions.push('continued wet weather');
                    break;
                case 'dry_spell':
                    conditions.push('continued dry weather');
                    break;
                case 'storm_season':
                    conditions.push('stormy conditions likely');
                    break;
            }
        } else {
            conditions.push('weather pattern may change');
        }
        
        return conditions;
    }

    // Generate weather events for the chronicle
    createWeatherChronicleEvent(eventType, intensity) {
        const descriptions = {
            tornado: `A devastating tornado tore through Red Rock Territory, leaving destruction in its wake`,
            wildfire: `Wildfire broke out, threatening the settlement with walls of flame and choking smoke`,
            earthquake: `The earth shook violently as an earthquake struck the territory`,
            locust_swarm: `A massive swarm of locusts descended upon the settlement, devouring crops`,
            severe_drought: `A severe drought has gripped the territory, turning the land into a dusty wasteland`,
            killing_frost: `An unexpected killing frost has struck, damaging crops and threatening lives`,
            flash_flood: `Flash floods surged through the territory, washing away buildings and belongings`,
            hailstorm: `Golf ball-sized hail pummeled the settlement, shattering windows and destroying crops`,
            dust_storm: `A massive dust storm engulfed the territory, turning day to night`
        };
        
        const description = descriptions[eventType] || `Severe weather event: ${eventType}`;
        const severity = Math.floor(5 + (intensity * 5)); // 5-10 severity
        
        // Add to chronicle
        if (this.gameState.chronicle) {
            this.gameState.chronicle.push({
                date: new Date(this.gameState.date),
                type: 'environmental',
                subtype: 'extreme_weather',
                description: description,
                participants: [],
                severity: severity,
                weatherEvent: eventType,
                intensity: intensity
            });
        }
        
        // Major morale impact
        const moraleImpact = Math.floor(intensity * 20);
        this.gameState.morale.overall = Math.max(0, this.gameState.morale.overall - moraleImpact);
        this.gameState.morale.recent_events.push(`${eventType} disaster`);
    }

    // Export weather data for analysis
    exportWeatherData() {
        return {
            currentWeather: this.gameState.weather,
            weatherHistory: this.weatherHistory,
            activeEvents: this.activeWeatherEvents,
            currentPattern: this.weatherPatterns.currentPattern,
            patternDaysRemaining: this.weatherPatterns.patternDaysRemaining,
            climateProfile: this.climateData,
            predictions: this.predictWeather(7),
            warnings: this.gameState.weatherWarnings || []
        };
    }

    // Get weather summary for UI
    getWeatherSummary() {
        const weather = this.gameState.weather;
        const activeEvents = this.activeWeatherEvents.filter(e => e.isActive);
        
        return {
            temperature: weather.temperature,
            temperatureDescription: this.getTemperatureDescription(weather.temperature),
            precipitation: weather.precipitation,
            precipitationDescription: this.getPrecipitationDescription(weather.precipitation, weather.precipitationIntensity),
            windSpeed: weather.windSpeed,
            windDescription: this.getWindDescription(weather.windSpeed),
            conditions: weather.conditions,
            hazards: weather.hazards,
            visibility: weather.visibility,
            visibilityDescription: this.getVisibilityDescription(weather.visibility),
            activeEvents: activeEvents,
            warnings: this.gameState.weatherWarnings || [],
            pattern: this.weatherPatterns.currentPattern,
            patternDaysLeft: this.weatherPatterns.patternDaysRemaining
        };
    }

    getTemperatureDescription(temp) {
        if (temp < -10) return 'Dangerously Cold';
        if (temp < 0) return 'Very Cold';
        if (temp < 10) return 'Cold';
        if (temp < 20) return 'Cool';
        if (temp < 30) return 'Warm';
        if (temp < 35) return 'Hot';
        return 'Dangerously Hot';
    }

    getPrecipitationDescription(precip, intensity) {
        if (precip === 'none') return 'Clear';
        
        const descriptions = {
            light_rain: 'Light Rain',
            heavy_rain: 'Heavy Rain',
            thunderstorm: 'Thunderstorm',
            light_snow: 'Light Snow',
            heavy_snow: 'Heavy Snow',
            blizzard: 'Blizzard',
            hail: 'Hailstorm',
            dust_storm: 'Dust Storm',
            flash_flood: 'Flash Flood',
            torrential_rain: 'Torrential Rain'
        };
        
        let desc = descriptions[precip] || precip;
        
        if (intensity > 0.8) desc = 'Severe ' + desc;
        else if (intensity < 0.3) desc = 'Light ' + desc;
        
        return desc;
    }

    getWindDescription(windSpeed) {
        if (windSpeed < 5) return 'Calm';
        if (windSpeed < 15) return 'Light Breeze';
        if (windSpeed < 25) return 'Moderate Wind';
        if (windSpeed < 40) return 'Strong Wind';
        if (windSpeed < 60) return 'High Wind';
        return 'Hurricane Force';
    }

    getVisibilityDescription(visibility) {
        if (visibility > 0.9) return 'Excellent';
        if (visibility > 0.7) return 'Good';
        if (visibility > 0.5) return 'Fair';
        if (visibility > 0.3) return 'Poor';
        if (visibility > 0.1) return 'Very Poor';
        return 'Near Zero';
    }

    logWeatherEvent(message) {
        const timestamp = window.FrontierUtils.DateUtils.formatDate(this.gameState.date);
        console.log(`🌪️ [${timestamp}] ${message}`);
        
        // Add to weather log
        if (!this.gameState.weatherLog) this.gameState.weatherLog = [];
        this.gameState.weatherLog.push({
            date: new Date(this.gameState.date),
            message: message
        });
        
        // Keep only last 50 entries
        if (this.gameState.weatherLog.length > 50) {
            this.gameState.weatherLog.shift();
        }
    }
}

// Weather event generator for integration with main event system
class WeatherEventGenerator {
    constructor(weatherSystem) {
        this.weatherSystem = weatherSystem;
    }

    generateWeatherEvents() {
        const events = [];
        const weather = this.weatherSystem.gameState.weather;
        const activeEvents = this.weatherSystem.activeWeatherEvents;
        
        // Generate narrative events based on weather conditions
        if (weather.temperature < -5 && window.FrontierUtils.Random.chance(0.1)) {
            events.push(this.createColdWeatherEvent());
        }
        
        if (weather.temperature > 30 && window.FrontierUtils.Random.chance(0.1)) {
            events.push(this.createHotWeatherEvent());
        }
        
        if (weather.precipitation !== 'none' && window.FrontierUtils.Random.chance(0.15)) {
            events.push(this.createPrecipitationEvent());
        }
        
        if (weather.windSpeed > 25 && window.FrontierUtils.Random.chance(0.08)) {
            events.push(this.createWindEvent());
        }
        
        // Events for active extreme weather
        activeEvents.forEach(event => {
            if (window.FrontierUtils.Random.chance(0.2)) {
                events.push(this.createExtremeWeatherEvent(event));
            }
        });
        
        return events;
    }

    createColdWeatherEvent() {
        const characters = this.weatherSystem.gameState.characters;
        const character = window.FrontierUtils.Random.choice(characters);
        
        const coldEvents = [
            `${character.name} struggled to keep warm as the bitter cold seeped through the cabin walls`,
            `${character.name} found their water bucket frozen solid this morning`,
            `${character.name} had to break ice to get water from the well`,
            `The cold forced everyone to huddle around the fire for warmth`
        ];
        
        return {
            type: 'environmental',
            description: window.FrontierUtils.Random.choice(coldEvents),
            participants: [character],
            effects: [{ type: 'mood', character: character.id, modifier: -3 }],
            severity: 4
        };
    }

    createHotWeatherEvent() {
        const characters = this.weatherSystem.gameState.characters;
        const character = window.FrontierUtils.Random.choice(characters);
        
        const hotEvents = [
            `${character.name} sought shade during the scorching midday heat`,
            `The oppressive heat made ${character.name}'s work unbearable`,
            `${character.name} rationed water carefully in the blazing sun`,
            `Heat waves shimmered off the ground as ${character.name} tried to work`
        ];
        
        return {
            type: 'environmental',
            description: window.FrontierUtils.Random.choice(hotEvents),
            participants: [character],
            effects: [{ type: 'energy', character: character.id, modifier: -5 }],
            severity: 3
        };
    }

    createPrecipitationEvent() {
        const weather = this.weatherSystem.gameState.weather;
        const characters = this.weatherSystem.gameState.characters;
        const character = window.FrontierUtils.Random.choice(characters);
        
        const precipEvents = {
            light_rain: [
                `${character.name} welcomed the gentle rain after days of dry weather`,
                `Light rain drummed softly on the roof as ${character.name} worked inside`
            ],
            heavy_rain: [
                `${character.name} was soaked to the bone in the heavy downpour`,
                `The heavy rain turned the settlement paths into muddy streams`
            ],
            thunderstorm: [
                `Lightning illuminated ${character.name}'s face as thunder crashed overhead`,
                `${character.name} took shelter as the thunderstorm raged outside`
            ],
            snow: [
                `${character.name} watched snowflakes drift past the window`,
                `Fresh snow crunched under ${character.name}'s boots`
            ]
        };
        
        const eventList = precipEvents[weather.precipitation] || precipEvents.light_rain;
        
        return {
            type: 'environmental',
            description: window.FrontierUtils.Random.choice(eventList),
            participants: [character],
            effects: [{ type: 'mood', character: character.id, modifier: weather.precipitation === 'light_rain' ? 2 : -1 }],
            severity: 2
        };
    }

    createWindEvent() {
        const characters = this.weatherSystem.gameState.characters;
        const character = window.FrontierUtils.Random.choice(characters);
        
        const windEvents = [
            `Fierce winds howled around the settlement as ${character.name} battened down loose items`,
            `${character.name} struggled against the powerful gusts while trying to secure the livestock`,
            `The wind whipped dust and debris around ${character.name} as they hurried indoors`,
            `Shutters rattled violently in the wind as ${character.name} checked the building security`
        ];
        
        return {
            type: 'environmental',
            description: window.FrontierUtils.Random.choice(windEvents),
            participants: [character],
            effects: [{ type: 'mood', character: character.id, modifier: -2 }],
            severity: 4
        };
    }

    createExtremeWeatherEvent(event) {
        const characters = this.weatherSystem.gameState.characters;
        const character = window.FrontierUtils.Random.choice(characters);
        
        const extremeEvents = {
            tornado: [
                `${character.name} watched in terror as the tornado approached the settlement`,
                `${character.name} helped others take shelter in the storm cellar as the tornado roared overhead`
            ],
            wildfire: [
                `${character.name} fought desperately to create firebreaks as the wildfire approached`,
                `Smoke stung ${character.name}'s eyes as they evacuated with whatever they could carry`
            ],
            severe_drought: [
                `${character.name} stared at the parched earth, worried about the failing crops`,
                `${character.name} carefully rationed the dwindling water supplies`
            ],
            flash_flood: [
                `${character.name} waded through rushing water to reach higher ground`,
                `${character.name} watched helplessly as the flood waters swept away their belongings`
            ]
        };
        
        const eventList = extremeEvents[event.type] || [`${character.name} dealt with the severe weather`];
        
        return {
            type: 'environmental',
            subtype: 'extreme_weather',
            description: window.FrontierUtils.Random.choice(eventList),
            participants: [character],
            effects: [{ type: 'mood', character: character.id, modifier: -8 }],
            severity: 8,
            weatherEvent: event.type
        };
    }
}

// Export for module systems
if (typeof window !== 'undefined') {
    window.AdvancedWeatherSystem = AdvancedWeatherSystem;
    window.WeatherEventGenerator = WeatherEventGenerator;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AdvancedWeatherSystem, WeatherEventGenerator };
}
