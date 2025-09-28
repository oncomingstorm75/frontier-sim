// medical-system.js - Comprehensive Medical System for Frontier Simulation

class MedicalSystem {
    constructor(gameState) {
        this.gameState = gameState;
        this.diseaseOutbreaks = [];
        this.medicalFacilities = [];
        this.activeTreatments = [];
        
        // Initialize medical data
        this.initializeMedicalData();
    }

    initializeMedicalData() {
        this.bodyParts = {
            head: { 
                name: 'Head',
                criticalChance: 0.8, 
                healTime: 30, 
                workPenalty: 0.8, 
                mobilityPenalty: 0.3,
                description: 'Critical for survival'
            },
            torso: { 
                name: 'Torso',
                criticalChance: 0.6, 
                healTime: 20, 
                workPenalty: 0.5, 
                mobilityPenalty: 0.2,
                description: 'Vital organs located here'
            },
            leftArm: { 
                name: 'Left Arm',
                criticalChance: 0.1, 
                healTime: 14, 
                workPenalty: 0.3, 
                mobilityPenalty: 0.0,
                description: 'Affects manual labor'
            },
            rightArm: { 
                name: 'Right Arm',
                criticalChance: 0.1, 
                healTime: 14, 
                workPenalty: 0.4, 
                mobilityPenalty: 0.0,
                description: 'Primary working hand'
            },
            leftLeg: { 
                name: 'Left Leg',
                criticalChance: 0.2, 
                healTime: 21, 
                workPenalty: 0.2, 
                mobilityPenalty: 0.4,
                description: 'Affects movement'
            },
            rightLeg: { 
                name: 'Right Leg',
                criticalChance: 0.2, 
                healTime: 21, 
                workPenalty: 0.2, 
                mobilityPenalty: 0.4,
                description: 'Affects movement'
            }
        };

        this.injuryTypes = {
            cut: { 
                name: 'Cut',
                bleedingRate: 0.1, 
                infectionChance: 0.3, 
                painLevel: 0.3,
                description: 'Clean wound from sharp object',
                causes: ['knife accident', 'broken glass', 'saw mishap', 'metal shard']
            },
            laceration: {
                name: 'Laceration',
                bleedingRate: 0.2,
                infectionChance: 0.5,
                painLevel: 0.4,
                description: 'Jagged, torn wound',
                causes: ['animal attack', 'machinery accident', 'fall on rocks']
            },
            bruise: { 
                name: 'Bruise',
                bleedingRate: 0.0, 
                infectionChance: 0.1, 
                painLevel: 0.2,
                healTime: 7,
                description: 'Blunt force trauma',
                causes: ['fall', 'fight', 'being kicked by livestock']
            },
            fracture: { 
                name: 'Fracture',
                bleedingRate: 0.05, 
                infectionChance: 0.2, 
                painLevel: 0.7,
                immobilization: true, 
                healTime: 42,
                description: 'Broken bone',
                causes: ['fall from height', 'mining accident', 'horse kick', 'heavy object']
            },
            burn: { 
                name: 'Burn',
                bleedingRate: 0.0, 
                infectionChance: 0.6, 
                painLevel: 0.5,
                healTime: 21,
                description: 'Heat or chemical damage',
                causes: ['fire accident', 'hot metal', 'scalding water', 'chemical spill']
            },
            puncture: { 
                name: 'Puncture',
                bleedingRate: 0.3, 
                infectionChance: 0.7, 
                painLevel: 0.4,
                description: 'Deep narrow wound',
                causes: ['nail', 'arrow', 'spike', 'animal bite']
            },
            crush: { 
                name: 'Crush Injury',
                bleedingRate: 0.1, 
                infectionChance: 0.4, 
                painLevel: 0.8,
                permanentDamage: 0.2,
                description: 'Severe compression damage',
                causes: ['cave-in', 'falling tree', 'machinery accident', 'stampede']
            },
            gunshot: {
                name: 'Gunshot Wound',
                bleedingRate: 0.4,
                infectionChance: 0.8,
                painLevel: 0.9,
                description: 'Bullet wound',
                causes: ['gunfight', 'hunting accident', 'negligent discharge']
            }
        };

        this.diseases = {
            cholera: {
                name: 'Cholera',
                transmission: 'waterborne',
                incubationDays: 3,
                duration: 14,
                mortality: 0.6,
                symptoms: ['severe diarrhea', 'dehydration', 'vomiting'],
                spreadRate: 0.3,
                seasonalModifier: { summer: 1.5, fall: 1.2 },
                causes: ['contaminated water', 'poor sanitation', 'infected food']
            },
            influenza: {
                name: 'Influenza',
                transmission: 'airborne',
                incubationDays: 2,
                duration: 10,
                mortality: 0.1,
                symptoms: ['fever', 'cough', 'body aches'],
                spreadRate: 0.4,
                seasonalModifier: { winter: 2.0, spring: 1.2 },
                causes: ['close contact', 'crowded conditions', 'weakened immunity']
            },
            dysentery: {
                name: 'Dysentery',
                transmission: 'foodborne',
                incubationDays: 4,
                duration: 12,
                mortality: 0.3,
                symptoms: ['bloody diarrhea', 'fever', 'abdominal pain'],
                spreadRate: 0.25,
                seasonalModifier: { summer: 1.3 },
                causes: ['contaminated food', 'poor hygiene', 'fly contamination']
            },
            typhoid: {
                name: 'Typhoid Fever',
                transmission: 'waterborne',
                incubationDays: 7,
                duration: 21,
                mortality: 0.4,
                symptoms: ['high fever', 'headache', 'rose spots on chest'],
                spreadRate: 0.2,
                causes: ['contaminated water', 'poor sanitation', 'infected carriers']
            },
            tuberculosis: {
                name: 'Tuberculosis',
                transmission: 'airborne',
                incubationDays: 14,
                duration: 90,
                mortality: 0.5,
                symptoms: ['persistent cough', 'blood in sputum', 'weight loss'],
                spreadRate: 0.15,
                causes: ['close contact', 'poor nutrition', 'overcrowding']
            },
            scurvy: {
                name: 'Scurvy',
                transmission: 'nutritional',
                incubationDays: 30,
                duration: 45,
                mortality: 0.2,
                symptoms: ['bleeding gums', 'joint pain', 'fatigue'],
                spreadRate: 0.0,
                causes: ['vitamin C deficiency', 'poor diet', 'lack of fresh food']
            },
            tetanus: {
                name: 'Tetanus',
                transmission: 'wound_infection',
                incubationDays: 7,
                duration: 21,
                mortality: 0.8,
                symptoms: ['muscle spasms', 'jaw locking', 'difficulty swallowing'],
                spreadRate: 0.0,
                causes: ['dirty wounds', 'puncture injuries', 'poor wound care']
            },
            gangrene: {
                name: 'Gangrene',
                transmission: 'wound_infection',
                incubationDays: 3,
                duration: 14,
                mortality: 0.7,
                symptoms: ['tissue death', 'foul odor', 'black discoloration'],
                spreadRate: 0.0,
                causes: ['untreated wounds', 'poor circulation', 'severe frostbite']
            }
        };

        this.treatments = {
            folkRemedy: {
                name: 'Folk Remedy',
                effectiveness: 0.3,
                availability: 1.0,
                cost: 1,
                requirements: [],
                methods: ['whiskey disinfection', 'herbal poultices', 'prayer', 'home remedies']
            },
            basicMedicalCare: {
                name: 'Basic Medical Care',
                effectiveness: 0.6,
                availability: 0.7,
                cost: 5,
                requirements: ['medical_supplies'],
                methods: ['wound cleaning', 'splinting', 'basic surgery', 'laudanum for pain']
            },
            doctorTreatment: {
                name: 'Doctor Treatment',
                effectiveness: 0.8,
                availability: 0.3,
                cost: 15,
                requirements: ['qualified_doctor', 'medical_supplies'],
                methods: ['proper surgery', 'medical diagnosis', 'prescription medicines', 'amputation if necessary']
            },
            hospitalCare: {
                name: 'Hospital Care',
                effectiveness: 0.9,
                availability: 0.1,
                cost: 30,
                requirements: ['hospital_facility', 'qualified_doctor', 'medical_supplies', 'nurses'],
                methods: ['sterile environment', 'round-the-clock care', 'advanced surgery', 'quarantine capability']
            }
        };
    }

    // Add injury to character
    addInjury(character, injuryType, bodyPart, severity = 1.0, cause = 'unknown') {
        if (!character.injuries) character.injuries = [];
        if (!character.medicalHistory) character.medicalHistory = [];

        const injury = {
            id: `injury_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: injuryType,
            bodyPart: bodyPart,
            severity: severity,
            cause: cause,
            dateOccurred: new Date(this.gameState.date),
            daysOld: 0,
            isInfected: false,
            infectionSeverity: 0,
            isTreated: false,
            treatmentHistory: [],
            bleeding: this.injuryTypes[injuryType].bleedingRate * severity,
            pain: this.injuryTypes[injuryType].painLevel * severity,
            healingProgress: 0
        };

        // Check for immediate infection
        const infectionChance = this.injuryTypes[injuryType].infectionChance * severity;
        if (window.FrontierUtils.Random.chance(infectionChance * 0.1)) { // 10% of infection chance happens immediately
            injury.isInfected = true;
            injury.infectionSeverity = window.FrontierUtils.Random.float(0.1, 0.3);
        }

        character.injuries.push(injury);
        
        // Add to medical history
        character.medicalHistory.push({
            date: new Date(this.gameState.date),
            event: `Sustained ${injuryType} to ${bodyPart}`,
            cause: cause,
            severity: severity
        });

        // Immediate health impact
        const healthLoss = severity * this.bodyParts[bodyPart].criticalChance * 20;
        character.stats.health = Math.max(10, character.stats.health - healthLoss);

        // Mood impact from pain and trauma
        const moodLoss = injury.pain * 15;
        character.stats.mood = Math.max(0, character.stats.mood - moodLoss);

        this.logMedicalEvent(character, `${character.name} sustained a ${injuryType} to their ${bodyPart} (${cause})`);

        return injury;
    }

    // Add disease to character
    addDisease(character, diseaseName, exposureSource = 'unknown') {
        if (!character.diseases) character.diseases = [];
        if (!character.medicalHistory) character.medicalHistory = [];

        const diseaseData = this.diseases[diseaseName];
        if (!diseaseData) return null;

        const disease = {
            id: `disease_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: diseaseName,
            exposureSource: exposureSource,
            dateExposed: new Date(this.gameState.date),
            incubationDaysLeft: diseaseData.incubationDays,
            durationDaysLeft: diseaseData.duration,
            severity: window.FrontierUtils.Random.float(0.5, 1.5),
            isSymptomPresent: false,
            isTreated: false,
            treatmentHistory: [],
            mortality: diseaseData.mortality
        };

        character.diseases.push(disease);
        
        character.medicalHistory.push({
            date: new Date(this.gameState.date),
            event: `Exposed to ${diseaseName}`,
            source: exposureSource,
            severity: disease.severity
        });

        this.logMedicalEvent(character, `${character.name} was exposed to ${diseaseName} (${exposureSource})`);

        return disease;
    }

    // Update all medical conditions daily
    updateMedicalConditions() {
        this.gameState.characters.forEach(character => {
            this.updateInjuries(character);
            this.updateDiseases(character);
            this.updateOverallHealth(character);
            this.checkMedicalCareNeeds(character);
        });

        this.checkDiseaseOutbreaks();
        this.updateMedicalFacilities();
    }

    updateInjuries(character) {
        if (!character.injuries) return;

        character.injuries.forEach((injury, index) => {
            injury.daysOld++;

            // Bleeding effects
            if (injury.bleeding > 0) {
                const bloodLoss = injury.bleeding * injury.severity;
                character.stats.health = Math.max(0, character.stats.health - bloodLoss);
                
                // Bleeding reduces over time if treated
                if (injury.isTreated) {
                    injury.bleeding = Math.max(0, injury.bleeding - 0.02);
                }
            }

            // Infection progression
            if (injury.isInfected) {
                this.progressInfection(character, injury);
            } else {
                // Check for new infection
                const dailyInfectionChance = this.injuryTypes[injury.type].infectionChance * 0.05; // 5% of base chance per day
                if (window.FrontierUtils.Random.chance(dailyInfectionChance) && !injury.isTreated) {
                    injury.isInfected = true;
                    injury.infectionSeverity = 0.1;
                    this.logMedicalEvent(character, `${character.name}'s ${injury.type} has become infected`);
                }
            }

            // Natural healing
            if (!injury.isInfected || injury.isTreated) {
                const healRate = injury.isTreated ? 0.05 : 0.02;
                injury.healingProgress += healRate;
                injury.pain = Math.max(0, injury.pain - 0.01);
            }

            // Remove healed injuries
            if (injury.healingProgress >= 1.0 && !injury.isInfected) {
                character.injuries.splice(index, 1);
                this.logMedicalEvent(character, `${character.name}'s ${injury.type} has healed`);
            }
        });
    }

    progressInfection(character, injury) {
        // Infection worsens over time without treatment
        if (!injury.isTreated) {
            injury.infectionSeverity += window.FrontierUtils.Random.float(0.05, 0.15);
        } else {
            // Treatment reduces infection
            injury.infectionSeverity = Math.max(0, injury.infectionSeverity - 0.1);
            if (injury.infectionSeverity <= 0) {
                injury.isInfected = false;
                this.logMedicalEvent(character, `${character.name}'s infection has been cured`);
            }
        }

        // Severe infection effects
        if (injury.infectionSeverity > 0.5) {
            character.stats.health -= 2; // Sepsis
            character.stats.mood -= 5; // Feeling very ill
            
            // Check for gangrene
            if (injury.infectionSeverity > 0.8 && window.FrontierUtils.Random.chance(0.1)) {
                this.addDisease(character, 'gangrene', 'infected wound');
            }
        }

        // Check for tetanus from puncture wounds
        if (injury.type === 'puncture' && injury.infectionSeverity > 0.3 && window.FrontierUtils.Random.chance(0.05)) {
            this.addDisease(character, 'tetanus', 'infected puncture wound');
        }
    }

    updateDiseases(character) {
        if (!character.diseases) return;

        character.diseases.forEach((disease, index) => {
            const diseaseData = this.diseases[disease.name];

            // Incubation period
            if (disease.incubationDaysLeft > 0) {
                disease.incubationDaysLeft--;
                if (disease.incubationDaysLeft === 0) {
                    disease.isSymptomPresent = true;
                    this.logMedicalEvent(character, `${character.name} is showing symptoms of ${disease.name}`);
                }
            }

            // Active disease effects
            if (disease.isSymptomPresent && disease.durationDaysLeft > 0) {
                disease.durationDaysLeft--;

                // Daily health and mood impact
                const dailyHealthLoss = disease.severity * 3;
                const dailyMoodLoss = disease.severity * 2;
                
                character.stats.health = Math.max(0, character.stats.health - dailyHealthLoss);
                character.stats.mood = Math.max(0, character.stats.mood - dailyMoodLoss);

                // Disease-specific effects
                this.applyDiseaseEffects(character, disease, diseaseData);

                // Check for recovery or death
                if (disease.durationDaysLeft === 0) {
                    if (window.FrontierUtils.Random.chance(diseaseData.mortality * disease.severity)) {
                        // Death from disease
                        this.handleCharacterDeath(character, `died from ${disease.name}`);
                        return;
                    } else {
                        // Recovery
                        character.diseases.splice(index, 1);
                        this.logMedicalEvent(character, `${character.name} has recovered from ${disease.name}`);
                        
                        // Add immunity
                        if (!character.immunities) character.immunities = [];
                        character.immunities.push(disease.name);
                    }
                }

                // Disease transmission
                if (diseaseData.spreadRate > 0 && window.FrontierUtils.Random.chance(diseaseData.spreadRate * 0.1)) {
                    this.attemptDiseaseTransmission(character, disease, diseaseData);
                }
            }
        });
    }

    applyDiseaseEffects(character, disease, diseaseData) {
        switch (disease.name) {
            case 'cholera':
                // Severe dehydration
                if (window.FrontierUtils.Random.chance(0.3)) {
                    character.stats.health -= 5;
                    this.gameState.resources.water -= 2; // Increased water consumption
                }
                break;

            case 'tuberculosis':
                // Persistent cough, spreads more in crowded conditions
                character.stats.energy = Math.max(0, character.stats.energy - 10);
                break;

            case 'scurvy':
                // Affects work capacity
                character.stats.energy = Math.max(0, character.stats.energy - 5);
                break;

            case 'tetanus':
                // Muscle spasms prevent work
                character.currentActivity = 'bedridden';
                character.stats.energy = 0;
                break;

            case 'gangrene':
                // May require amputation
                if (disease.durationDaysLeft < 5 && window.FrontierUtils.Random.chance(0.2)) {
                    this.considerAmputation(character, disease);
                }
                break;
        }
    }

    attemptDiseaseTransmission(infectedCharacter, disease, diseaseData) {
        const potentialVictims = this.gameState.characters.filter(char => 
            char.id !== infectedCharacter.id && 
            !this.hasDisease(char, disease.name) &&
            !this.hasImmunity(char, disease.name)
        );

        if (potentialVictims.length === 0) return;

        // Transmission factors
        let transmissionChance = diseaseData.spreadRate * 0.1;

        // Crowding increases transmission
        if (this.gameState.population.total > 50) {
            transmissionChance *= 1.5;
        }

        // Poor sanitation increases transmission
        const sanitationLevel = this.calculateSanitationLevel();
        transmissionChance *= (2 - sanitationLevel); // Lower sanitation = higher transmission

        // Seasonal modifiers
        const currentSeason = this.gameState.season;
        if (diseaseData.seasonalModifier && diseaseData.seasonalModifier[currentSeason]) {
            transmissionChance *= diseaseData.seasonalModifier[currentSeason];
        }

        if (window.FrontierUtils.Random.chance(transmissionChance)) {
            const victim = window.FrontierUtils.Random.choice(potentialVictims);
            this.addDisease(victim, disease.name, `contact with ${infectedCharacter.name}`);
        }
    }

    // Treat injury or disease
    provideMedicalTreatment(character, medicalConditionId, treatmentType = 'folkRemedy') {
        const treatment = this.treatments[treatmentType];
        if (!treatment) return false;

        // Check requirements
        if (!this.canProvideTreatment(treatmentType)) {
            return false;
        }

        // Find the condition
        let condition = null;
        let conditionType = null;

        if (character.injuries) {
            condition = character.injuries.find(injury => injury.id === medicalConditionId);
            conditionType = 'injury';
        }

        if (!condition && character.diseases) {
            condition = character.diseases.find(disease => disease.id === medicalConditionId);
            conditionType = 'disease';
        }

        if (!condition) return false;

        // Apply treatment
        condition.isTreated = true;
        condition.treatmentHistory.push({
            date: new Date(this.gameState.date),
            type: treatmentType,
            effectiveness: treatment.effectiveness
        });

        // Treatment effects
        if (conditionType === 'injury') {
            condition.bleeding = Math.max(0, condition.bleeding * (1 - treatment.effectiveness));
            condition.pain = Math.max(0, condition.pain * (1 - treatment.effectiveness));
            
            if (condition.isInfected) {
                condition.infectionSeverity = Math.max(0, condition.infectionSeverity * (1 - treatment.effectiveness));
            }
        } else if (conditionType === 'disease') {
            // Reduce disease duration and severity
            condition.durationDaysLeft = Math.max(1, Math.floor(condition.durationDaysLeft * (1 - treatment.effectiveness * 0.3)));
            condition.severity = Math.max(0.1, condition.severity * (1 - treatment.effectiveness * 0.2));
        }

        // Consume resources
        this.gameState.resources.money -= treatment.cost;
        if (treatment.requirements.includes('medical_supplies')) {
            this.gameState.resources.medicine = Math.max(0, this.gameState.resources.medicine - 1);
        }

        // Log treatment
        this.logMedicalEvent(character, `${character.name} received ${treatment.name} for ${condition.type || condition.name}`);

        return true;
    }

    canProvideTreatment(treatmentType) {
        const treatment = this.treatments[treatmentType];
        if (!treatment) return false;

        // Check cost
        if (this.gameState.resources.money < treatment.cost) return false;

        // Check requirements
        for (const requirement of treatment.requirements) {
            switch (requirement) {
                case 'medical_supplies':
                    if (this.gameState.resources.medicine <= 0) return false;
                    break;
                case 'qualified_doctor':
                    if (!this.hasQualifiedDoctor()) return false;
                    break;
                case 'hospital_facility':
                    if (!this.hasHospitalFacility()) return false;
                    break;
                case 'nurses':
                    if (!this.hasNurses()) return false;
                    break;
            }
        }

        return true;
    }

    // Generate random injuries from various causes
    generateRandomInjury(character, cause = 'accident') {
        const injuryProbabilities = {
            'mining_accident': {
                'crush': 0.3, 'cut': 0.2, 'fracture': 0.25, 'puncture': 0.15, 'bruise': 0.1
            },
            'construction_accident': {
                'cut': 0.3, 'fracture': 0.2, 'bruise': 0.25, 'crush': 0.15, 'puncture': 0.1
            },
            'animal_attack': {
                'laceration': 0.4, 'puncture': 0.3, 'bruise': 0.2, 'fracture': 0.1
            },
            'gunfight': {
                'gunshot': 0.8, 'cut': 0.1, 'bruise': 0.1
            },
            'accident': {
                'cut': 0.25, 'bruise': 0.3, 'fracture': 0.15, 'burn': 0.15, 'puncture': 0.15
            }
        };

        const bodyPartProbabilities = {
            'head': 0.1, 'torso': 0.2, 'leftArm': 0.2, 'rightArm': 0.2, 'leftLeg': 0.15, 'rightLeg': 0.15
        };

        const injuryTypes = injuryProbabilities[cause] || injuryProbabilities['accident'];
        const injuryType = window.FrontierUtils.Random.weightedChoice(injuryTypes);
        const bodyPart = window.FrontierUtils.Random.weightedChoice(bodyPartProbabilities);
        const severity = window.FrontierUtils.Random.float(0.5, 1.5);

        return this.addInjury(character, injuryType, bodyPart, severity, cause);
    }

    // Calculate overall health impact on character abilities
    updateOverallHealth(character) {
        if (!character.injuries && !character.diseases) return;
        // In updateOverallHealth() method, add:
        if (character.stats.health <= 0) {
        this.handleCharacterDeath(character, 'health_failure');
        }
        let totalWorkPenalty = 0;
        let totalMobilityPenalty = 0;
        let totalPain = 0;

        // Calculate injury impacts
        if (character.injuries) {
            character.injuries.forEach(injury => {
                const bodyPartData = this.bodyParts[injury.bodyPart];
                totalWorkPenalty += bodyPartData.workPenalty * injury.severity;
                totalMobilityPenalty += bodyPartData.mobilityPenalty * injury.severity;
                totalPain += injury.pain;

                // Infection makes everything worse
                if (injury.isInfected) {
                    totalWorkPenalty += injury.infectionSeverity * 0.5;
                    totalMobilityPenalty += injury.infectionSeverity * 0.3;
                    totalPain += injury.infectionSeverity * 0.5;
                }
            });
        }

        // Calculate disease impacts
        if (character.diseases) {
            character.diseases.forEach(disease => {
                if (disease.isSymptomPresent) {
                    totalWorkPenalty += disease.severity * 0.3;
                    totalMobilityPenalty += disease.severity * 0.2;
                    totalPain += disease.severity * 0.4;
                }
            });
        }

        // Apply penalties (store on character for UI display)
        character.medicalStatus = {
            workEfficiency: Math.max(0.1, 1 - totalWorkPenalty),
            mobilityEfficiency: Math.max(0.1, 1 - totalMobilityPenalty),
            painLevel: Math.min(1.0, totalPain),
            requiresBedrest: totalPain > 0.8 || totalWorkPenalty > 0.8,
            needsMedicalAttention: (character.injuries && character.injuries.some(i => i.isInfected)) ||
                                 (character.diseases && character.diseases.some(d => d.isSymptomPresent))
        };

        // Force bedrest for severe conditions
        if (character.medicalStatus.requiresBedrest) {
            character.currentActivity = 'bedridden';
            character.stats.energy = Math.min(20, character.stats.energy);
        }
    }

    // Check what medical care the settlement needs
    checkMedicalCareNeeds(character) {
        if (!character.medicalStatus || !character.medicalStatus.needsMedicalAttention) return;

        // Try to automatically provide basic care if available
        if (character.injuries) {
            character.injuries.forEach(injury => {
                if ((injury.isInfected || injury.bleeding > 0.1) && !injury.isTreated) {
                    // Try progressively better treatments
                    if (this.canProvideTreatment('doctorTreatment')) {
                        this.provideMedicalTreatment(character, injury.id, 'doctorTreatment');
                    } else if (this.canProvideTreatment('basicMedicalCare')) {
                        this.provideMedicalTreatment(character, injury.id, 'basicMedicalCare');
                    } else if (this.canProvideTreatment('folkRemedy')) {
                        this.provideMedicalTreatment(character, injury.id, 'folkRemedy');
                    }
                }
            });
        }

        if (character.diseases) {
            character.diseases.forEach(disease => {
                if (disease.isSymptomPresent && !disease.isTreated) {
                    // Try treatment based on severity
                    if (disease.severity > 0.8 && this.canProvideTreatment('hospitalCare')) {
                        this.provideMedicalTreatment(character, disease.id, 'hospitalCare');
                    } else if (disease.severity > 0.5 && this.canProvideTreatment('doctorTreatment')) {
                        this.provideMedicalTreatment(character, disease.id, 'doctorTreatment');
                    } else if (this.canProvideTreatment('basicMedicalCare')) {
                        this.provideMedicalTreatment(character, disease.id, 'basicMedicalCare');
                    } else {
                        this.provideMedicalTreatment(character, disease.id, 'folkRemedy');
                    }
                }
            });
        }
    }

    // Utility functions
    hasDisease(character, diseaseName) {
        return character.diseases && character.diseases.some(disease => disease.name === diseaseName);
    }

    hasImmunity(character, diseaseName) {
        return character.immunities && character.immunities.includes(diseaseName);
    }

    hasQualifiedDoctor() {
        return this.gameState.characters.some(char => 
            char.background === 'Doctor' && char.stats.health > 50
        );
    }

    hasHospitalFacility() {
        return this.gameState.infrastructure.buildings.some(building => 
            building.type === 'hospital' && building.condition > 50
        );
    }

    hasNurses() {
        return this.gameState.characters.some(char => 
            (char.background === 'Doctor' || char.background === 'Teacher') && 
            char.stats.health > 30
        );
    }

    calculateSanitationLevel() {
        let sanitation = 0.5; // Base level

        // Population density affects sanitation
        const populationDensity = this.gameState.population.total / 100; // Assuming 100 is ideal capacity
        sanitation -= populationDensity * 0.3;

        // Infrastructure improvements
        const hasWell = this.gameState.infrastructure.buildings.some(b => b.type === 'water');
        const hasOuthouse = this.gameState.infrastructure.buildings.some(b => b.type === 'sanitation');
        const hasWasteManagement = this.gameState.infrastructure.buildings.some(b => b.type === 'waste_management');

        if (hasWell) sanitation += 0.2;
        if (hasOuthouse) sanitation += 0.15;
        if (hasWasteManagement) sanitation += 0.25;

        // Weather affects sanitation
        if (this.gameState.weather.precipitation === 'heavy_rain') {
            sanitation -= 0.1; // Flooding contaminates water
        }

        return Math.max(0.1, Math.min(1.0, sanitation));
    }

    considerAmputation(character, gangreneDisease) {
        // Find the affected body part from related injury
        const relatedInjury = character.injuries.find(injury => injury.isInfected);
        if (!relatedInjury) return;

        const bodyPart = relatedInjury.bodyPart;
        
        // Only amputate non-critical parts
        if (bodyPart === 'head' || bodyPart === 'torso') {
            // Gangrene in critical areas is usually fatal
            this.handleCharacterDeath(character, 'gangrene in vital area');
            return;
        }

        // Amputation success depends on medical care available
        let amputationSuccess = 0.3; // Base success rate
        
        if (this.hasQualifiedDoctor()) amputationSuccess += 0.3;
        if (this.hasHospitalFacility()) amputationSuccess += 0.2;
        if (this.gameState.resources.medicine > 5) amputationSuccess += 0.1;

        if (window.FrontierUtils.Random.chance(amputationSuccess)) {
            // Successful amputation
            character.amputations = character.amputations || [];
            character.amputations.push({
                bodyPart: bodyPart,
                date: new Date(this.gameState.date),
                cause: 'gangrene amputation'
            });

            // Remove gangrene and related injury
            character.diseases = character.diseases.filter(d => d.id !== gangreneDisease.id);
            character.injuries = character.injuries.filter(i => i.bodyPart !== bodyPart);

            // Permanent penalties
            character.stats.health = Math.max(30, character.stats.health - 20);
            character.permanentDisabilities = character.permanentDisabilities || [];
            character.permanentDisabilities.push(`missing ${bodyPart}`);

            this.logMedicalEvent(character, `${character.name} underwent amputation of ${bodyPart} due to gangrene`);
        } else {
            // Failed amputation - usually fatal
            this.handleCharacterDeath(character, 'failed amputation');
        }
    }

    handleCharacterDeath(character, cause) {
        character.isAlive = false;
        character.dateOfDeath = new Date(this.gameState.date);
        character.causeOfDeath = cause;

        // Remove from active population
        this.gameState.population.total = Math.max(0, this.gameState.population.total - 1);

        // Update demographics
        if (character.age < 18) {
            this.gameState.population.demographics.children--;
        } else if (character.age > 60) {
            this.gameState.population.demographics.elderly--;
        } else {
            this.gameState.population.demographics.adults--;
        }

        // Reduce cultural group count
        const culture = character.culture || 'unknown';
        if (this.gameState.population.cultural_groups[culture]) {
            this.gameState.population.cultural_groups[culture]--;
        }

        // Morale impact
        this.gameState.morale.overall = Math.max(0, this.gameState.morale.overall - 15);
        this.gameState.morale.recent_events.push(`Death of ${character.name}`);

        this.logMedicalEvent(character, `${character.name} died from ${cause}`);

        // Create death event for chronicle
        if (this.gameState.chronicle) {
            this.gameState.chronicle.push({
                date: new Date(this.gameState.date),
                type: 'death',
                description: `${character.name} passed away from ${cause}`,
                participants: [character.name],
                severity: 8
            });
        }
    }

    // Check for disease outbreaks
    checkDiseaseOutbreaks() {
        const infectedCounts = {};
        
        // Count infected people by disease
        this.gameState.characters.forEach(character => {
            if (character.diseases) {
                character.diseases.forEach(disease => {
                    if (disease.isSymptomPresent) {
                        infectedCounts[disease.name] = (infectedCounts[disease.name] || 0) + 1;
                    }
                });
            }
        });

        // Check if any disease qualifies as outbreak
        Object.entries(infectedCounts).forEach(([diseaseName, count]) => {
            const outbreakThreshold = Math.max(3, Math.floor(this.gameState.population.total * 0.1)); // 10% of population
            
            if (count >= outbreakThreshold) {
                const existingOutbreak = this.diseaseOutbreaks.find(o => o.disease === diseaseName && o.isActive);
                
                if (!existingOutbreak) {
                    this.declareOutbreak(diseaseName, count);
                }
            }
        });

        // Update existing outbreaks
        this.diseaseOutbreaks.forEach(outbreak => {
            if (outbreak.isActive) {
                const currentCount = infectedCounts[outbreak.disease] || 0;
                outbreak.currentInfected = currentCount;
                outbreak.totalInfected = Math.max(outbreak.totalInfected, currentCount);
                
                // End outbreak if infections drop significantly
                if (currentCount < Math.max(1, outbreak.peakInfected * 0.3)) {
                    outbreak.isActive = false;
                    outbreak.endDate = new Date(this.gameState.date);
                    this.logMedicalEvent(null, `${outbreak.disease} outbreak has ended after ${outbreak.duration} days`);
                }
                
                outbreak.duration++;
            }
        });
    }

    declareOutbreak(diseaseName, initialCount) {
        const outbreak = {
            id: `outbreak_${Date.now()}`,
            disease: diseaseName,
            startDate: new Date(this.gameState.date),
            endDate: null,
            isActive: true,
            initialInfected: initialCount,
            currentInfected: initialCount,
            totalInfected: initialCount,
            peakInfected: initialCount,
            deaths: 0,
            duration: 0,
            controlMeasures: []
        };

        this.diseaseOutbreaks.push(outbreak);

        // Major morale impact
        this.gameState.morale.overall = Math.max(0, this.gameState.morale.overall - 25);
        this.gameState.morale.recent_events.push(`${diseaseName} outbreak declared`);

        this.logMedicalEvent(null, `OUTBREAK: ${diseaseName} outbreak declared with ${initialCount} infected`);

        // Create outbreak event
        if (this.gameState.chronicle) {
            this.gameState.chronicle.push({
                date: new Date(this.gameState.date),
                type: 'outbreak',
                description: `A ${diseaseName} outbreak has begun, affecting ${initialCount} settlers`,
                participants: [],
                severity: 9
            });
        }

        // Automatic quarantine measures if doctor available
        if (this.hasQualifiedDoctor()) {
            this.implementQuarantineMeasures(outbreak);
        }
    }

    implementQuarantineMeasures(outbreak) {
        outbreak.controlMeasures.push({
            type: 'quarantine',
            startDate: new Date(this.gameState.date),
            effectiveness: 0.6
        });

        // Quarantine reduces disease spread but hurts economy
        this.gameState.morale.overall = Math.max(0, this.gameState.morale.overall - 10);
        this.gameState.resources.food -= 10; // Reduced work efficiency
        
        this.logMedicalEvent(null, `Quarantine measures implemented for ${outbreak.disease} outbreak`);
    }

    updateMedicalFacilities() {
        // Check if we need to build medical facilities
        const sickCharacters = this.gameState.characters.filter(char => 
            char.medicalStatus && char.medicalStatus.needsMedicalAttention
        ).length;

        const populationRatio = sickCharacters / this.gameState.population.total;

        // Suggest building medical facilities
        if (populationRatio > 0.2 && !this.hasHospitalFacility()) {
            this.gameState.morale.recent_events.push('Settlement needs medical facility');
        }

        // Medical supplies consumption
        const dailyMedicalConsumption = Math.floor(sickCharacters / 3);
        this.gameState.resources.medicine = Math.max(0, this.gameState.resources.medicine - dailyMedicalConsumption);
    }

    // Get medical status report for the settlement
    getMedicalStatusReport() {
        const totalCharacters = this.gameState.characters.length;
        const healthyCharacters = this.gameState.characters.filter(char => 
            char.stats.health > 70 && 
            (!char.injuries || char.injuries.length === 0) && 
            (!char.diseases || char.diseases.length === 0)
        ).length;

        const injuredCharacters = this.gameState.characters.filter(char => 
            char.injuries && char.injuries.length > 0
        ).length;

        const sickCharacters = this.gameState.characters.filter(char => 
            char.diseases && char.diseases.some(d => d.isSymptomPresent)
        ).length;

        const criticalCharacters = this.gameState.characters.filter(char => 
            char.stats.health < 30 || 
            (char.medicalStatus && char.medicalStatus.requiresBedrest)
        ).length;

        return {
            totalPopulation: totalCharacters,
            healthyCount: healthyCharacters,
            injuredCount: injuredCharacters,
            sickCount: sickCharacters,
            criticalCount: criticalCharacters,
            healthPercentage: Math.round((healthyCharacters / totalCharacters) * 100),
            activeOutbreaks: this.diseaseOutbreaks.filter(o => o.isActive),
            medicalSupplies: this.gameState.resources.medicine,
            sanitationLevel: this.calculateSanitationLevel(),
            hasDoctor: this.hasQualifiedDoctor(),
            hasHospital: this.hasHospitalFacility()
        };
    }

    // Get detailed character medical info
    getCharacterMedicalDetails(character) {
        return {
            name: character.name,
            health: character.stats.health,
            injuries: character.injuries || [],
            diseases: character.diseases || [],
            medicalHistory: character.medicalHistory || [],
            immunities: character.immunities || [],
            amputations: character.amputations || [],
            permanentDisabilities: character.permanentDisabilities || [],
            medicalStatus: character.medicalStatus || {},
            treatmentNeeded: character.medicalStatus && character.medicalStatus.needsMedicalAttention,
            workCapacity: character.medicalStatus ? character.medicalStatus.workEfficiency : 1.0
        };
    }

    logMedicalEvent(character, message) {
        const timestamp = window.FrontierUtils.DateUtils.formatDate(this.gameState.date);
        console.log(`🏥 [${timestamp}] ${message}`);
        
        // Add to medical log if it exists
        if (!this.gameState.medicalLog) this.gameState.medicalLog = [];
        this.gameState.medicalLog.push({
            date: new Date(this.gameState.date),
            character: character ? character.name : 'Settlement',
            message: message
        });
    }

    // Export medical data for external analysis
    exportMedicalData() {
        return {
            outbreaks: this.diseaseOutbreaks,
            medicalLog: this.gameState.medicalLog || [],
            characterMedicalProfiles: this.gameState.characters.map(char => this.getCharacterMedicalDetails(char)),
            medicalFacilities: this.medicalFacilities,
            currentTreatments: this.activeTreatments,
            diseaseDatabase: this.diseases,
            injuryDatabase: this.injuryTypes,
            treatmentDatabase: this.treatments
        };
    }
}

// Integration with main simulation system
class MedicalEventGenerator {
    constructor(medicalSystem) {
        this.medicalSystem = medicalSystem;
    }

    // Generate medical events based on activities and conditions
    generateMedicalEvents(gameState) {
        const events = [];

        gameState.characters.forEach(character => {
            // Activity-based injury risks
            const activityRisk = this.getActivityRisk(character.currentActivity);
            
            if (window.FrontierUtils.Random.chance(activityRisk.injuryChance)) {
                const injury = this.medicalSystem.generateRandomInjury(character, activityRisk.cause);
                if (injury) {
                    events.push({
                        type: 'medical',
                        subtype: 'injury',
                        character: character,
                        description: `${character.name} was injured while ${character.currentActivity}`,
                        injury: injury
                    });
                }
            }

            // Environmental disease exposure
            const environmentRisk = this.getEnvironmentalDiseaseRisk(gameState);
            if (window.FrontierUtils.Random.chance(environmentRisk.exposureChance)) {
                const disease = this.medicalSystem.addDisease(character, environmentRisk.disease, environmentRisk.source);
                if (disease) {
                    events.push({
                        type: 'medical',
                        subtype: 'disease_exposure',
                        character: character,
                        description: `${character.name} was exposed to ${environmentRisk.disease}`,
                        disease: disease
                    });
                }
            }
        });

        return events;
    }

    getActivityRisk(activity) {
        const activityRisks = {
            'mining': { injuryChance: 0.05, cause: 'mining_accident' },
            'construction': { injuryChance: 0.03, cause: 'construction_accident' },
            'woodworking': { injuryChance: 0.02, cause: 'construction_accident' },
            'hunting': { injuryChance: 0.04, cause: 'animal_attack' },
            'farming': { injuryChance: 0.01, cause: 'accident' },
            'blacksmithing': { injuryChance: 0.03, cause: 'accident' },
            'fighting': { injuryChance: 0.15, cause: 'gunfight' },
            'default': { injuryChance: 0.005, cause: 'accident' }
        };

        return activityRisks[activity] || activityRisks['default'];
    }

    getEnvironmentalDiseaseRisk(gameState) {
        const risks = [];

        // Water-related diseases
        const sanitationLevel = this.medicalSystem.calculateSanitationLevel();
        if (sanitationLevel < 0.5) {
            risks.push({ disease: 'cholera', exposureChance: 0.02, source: 'contaminated water' });
            risks.push({ disease: 'dysentery', exposureChance: 0.015, source: 'poor sanitation' });
        }

        // Seasonal diseases
        const season = gameState.season;
        if (season === 'winter') {
            risks.push({ disease: 'influenza', exposureChance: 0.03, source: 'cold weather' });
        }

        // Crowding diseases
        if (gameState.population.total > 50) {
            risks.push({ disease: 'tuberculosis', exposureChance: 0.01, source: 'overcrowding' });
        }

        // Nutrition diseases
        if (gameState.resources.food < gameState.population.total * 2) {
            risks.push({ disease: 'scurvy', exposureChance: 0.02, source: 'poor nutrition' });
        }

        return risks.length > 0 ? window.FrontierUtils.Random.choice(risks) : { exposureChance: 0 };
    }
}

// Export for module systems
if (typeof window !== 'undefined') {
    window.MedicalSystem = MedicalSystem;
    window.MedicalEventGenerator = MedicalEventGenerator;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { MedicalSystem, MedicalEventGenerator };
}
