// medical-integration.js - Integration code to add medical system to existing simulation

// Extend the existing FrontierSimulation class with medical capabilities
if (typeof window.FrontierSimulation !== 'undefined') {
    
    // Store original methods
    const originalInitializeGameState = window.FrontierSimulation.prototype.initializeGameState;
    const originalSimulationStep = window.FrontierSimulation.prototype.simulationStep;
    const originalGenerateEvents = window.FrontierSimulation.prototype.generateEvents;

    // Extend initialization
    window.FrontierSimulation.prototype.initializeGameState = function() {
        const gameState = originalInitializeGameState.call(this);
        
        // Initialize medical system
        this.medicalSystem = new MedicalSystem(gameState);
        this.medicalEventGenerator = new MedicalEventGenerator(this.medicalSystem);
        
        // Add medical resources
        gameState.resources.medicine = gameState.resources.medicine || 20;
        gameState.resources.medical_supplies = 10;
        
        // Initialize character medical data
        gameState.characters.forEach(character => {
            character.injuries = [];
            character.diseases = [];
            character.medicalHistory = [];
            character.immunities = [];
            character.medicalStatus = {
                workEfficiency: 1.0,
                mobilityEfficiency: 1.0,
                painLevel: 0.0,
                requiresBedrest: false,
                needsMedicalAttention: false
            };
        });
        
        // Add medical buildings to infrastructure
        if (gameState.population.total > 30) {
            gameState.infrastructure.buildings.push({
                name: 'Doc\'s Office',
                type: 'medical',
                capacity: 10,
                condition: 75
            });
        }
        
        console.log('🏥 Medical system initialized');
        return gameState;
    };

    // Extend simulation step
    window.FrontierSimulation.prototype.simulationStep = function() {
        // Call original simulation step first
        originalSimulationStep.call(this);
        
        // Update medical conditions daily
        if (this.medicalSystem) {
            this.medicalSystem.updateMedicalConditions();
            
            // Generate medical events
            const medicalEvents = this.medicalEventGenerator.generateMedicalEvents(this.gameState);
            this.eventQueue.push(...medicalEvents);
        }
    };

    // Extend event generation to include medical events
    window.FrontierSimulation.prototype.generateEvents = function() {
        const events = originalGenerateEvents.call(this);
        
        // Add medical-specific events
        if (this.medicalSystem) {
            const medicalEvents = this.generateMedicalSpecificEvents();
            events.push(...medicalEvents);
        }
        
        return events;
    };

    // Add new medical event generation method
    window.FrontierSimulation.prototype.generateMedicalSpecificEvents = function() {
        const events = [];
        
        // Epidemic events
        if (window.FrontierUtils.Random.chance(0.02)) {
            const epidemicEvent = this.generateEpidemicEvent();
            if (epidemicEvent) events.push(epidemicEvent);
        }
        
        // Medical discovery events
        if (window.FrontierUtils.Random.chance(0.01)) {
            const discoveryEvent = this.generateMedicalDiscoveryEvent();
            if (discoveryEvent) events.push(discoveryEvent);
        }
        
        // Accident events
        if (window.FrontierUtils.Random.chance(0.05)) {
            const accidentEvent = this.generateAccidentEvent();
            if (accidentEvent) events.push(accidentEvent);
        }
        
        // Medical supply events
        if (window.FrontierUtils.Random.chance(0.03)) {
            const supplyEvent = this.generateMedicalSupplyEvent();
            if (supplyEvent) events.push(supplyEvent);
        }
        
        return events;
    };

    // Generate epidemic outbreak events
    window.FrontierSimulation.prototype.generateEpidemicEvent = function() {
        const diseases = ['cholera', 'influenza', 'dysentery', 'typhoid'];
        const disease = window.FrontierUtils.Random.choice(diseases);
        const exposureSource = window.FrontierUtils.Random.choice([
            'contaminated water supply', 'sick traveler', 'poor sanitation', 'crowded conditions'
        ]);
        
        // Expose multiple characters
        const exposedCount = window.FrontierUtils.Random.int(2, Math.max(3, Math.floor(this.gameState.population.total * 0.2)));
        const exposedCharacters = window.FrontierUtils.Random.choices(this.gameState.characters, exposedCount);
        
        exposedCharacters.forEach(character => {
            this.medicalSystem.addDisease(character, disease, exposureSource);
        });
        
        return {
            id: `epidemic_${Date.now()}`,
            type: 'medical',
            description: `A ${disease} outbreak has begun, affecting ${exposedCount} settlers due to ${exposureSource}`,
            participants: exposedCharacters,
            effects: [
                { type: 'community_mood', value: -20 },
                { type: 'resource_consumption', resource: 'medicine', value: exposedCount * 2 }
            ],
            severity: 8,
            date: new Date(this.gameState.date)
        };
    };

    // Generate medical discovery events
    window.FrontierSimulation.prototype.generateMedicalDiscoveryEvent = function() {
        const discoveries = [
            {
                name: 'herbal remedy discovery',
                description: '{character} discovered that local {herb} helps treat {condition}',
                effect: { type: 'medical_knowledge', value: 10 }
            },
            {
                name: 'medical supply cache',
                description: '{character} found abandoned medical supplies in an old cabin',
                effect: { type: 'resource_gain', resource: 'medicine', value: 15 }
            },
            {
                name: 'healing spring',
                description: '{character} discovered a natural spring with apparent healing properties',
                effect: { type: 'medical_facility', value: 'healing_spring' }
            }
        ];
        
        const supplyEvent = window.FrontierUtils.Random.choice(supplyEvents);
        
        // Process template
        let description = supplyEvent.description
            .replace('{city}', window.FrontierUtils.Random.choice(['San Francisco', 'Denver', 'Santa Fe', 'St. Louis']));
        
        const effects = [];
        
        if (supplyEvent.medicineGain > 0) {
            effects.push({ type: 'resource_gain', resource: 'medicine', value: supplyEvent.medicineGain });
        }
        
        if (supplyEvent.cost > 0) {
            effects.push({ type: 'resource_cost', resource: 'money', value: supplyEvent.cost });
        }
        
        return {
            id: `medical_supply_${Date.now()}`,
            type: 'economic',
            description: description,
            participants: [],
            effects: effects,
            severity: supplyEvent.type === 'supply_shortage' ? 6 : 3,
            date: new Date(this.gameState.date)
        };
    };

    // Add medical status to character display
    window.FrontierSimulation.prototype.getCharacterMedicalSummary = function(character) {
        if (!this.medicalSystem) return null;
        return this.medicalSystem.getCharacterMedicalDetails(character);
    };

    // Add settlement medical report
    window.FrontierSimulation.prototype.getMedicalReport = function() {
        if (!this.medicalSystem) return null;
        return this.medicalSystem.getMedicalStatusReport();
    };

    // Add method to manually treat character
    window.FrontierSimulation.prototype.treatCharacter = function(characterId, conditionId, treatmentType = 'folkRemedy') {
        if (!this.medicalSystem) return false;
        
        const character = this.gameState.characters.find(c => c.id === characterId);
        if (!character) return false;
        
        return this.medicalSystem.provideMedicalTreatment(character, conditionId, treatmentType);
    };

    // Enhanced event processing for medical effects
    const originalApplyEventEffect = window.FrontierSimulation.prototype.applyEventEffect;
    
    window.FrontierSimulation.prototype.applyEventEffect = function(effect, participants) {
        // Call original method first
        if (originalApplyEventEffect) {
            originalApplyEventEffect.call(this, effect, participants);
        }
        
        // Handle new medical effects
        switch (effect.type) {
            case 'character_injury':
                // Injury effect already applied during event generation
                break;
                
            case 'disease_outbreak':
                participants.forEach(character => {
                    if (this.medicalSystem && effect.disease) {
                        this.medicalSystem.addDisease(character, effect.disease, effect.source || 'outbreak');
                    }
                });
                break;
                
            case 'medical_treatment':
                participants.forEach(character => {
                    if (this.medicalSystem && effect.treatmentType) {
                        // Try to treat the most severe condition
                        const conditions = [...(character.injuries || []), ...(character.diseases || [])];
                        if (conditions.length > 0) {
                            const mostSevere = conditions.reduce((prev, curr) => 
                                (curr.severity || curr.infectionSeverity || 0) > (prev.severity || prev.infectionSeverity || 0) ? curr : prev
                            );
                            this.medicalSystem.provideMedicalTreatment(character, mostSevere.id, effect.treatmentType);
                        }
                    }
                });
                break;
                
            case 'medical_knowledge':
                // Improve treatment effectiveness temporarily
                if (this.medicalSystem) {
                    Object.values(this.medicalSystem.treatments).forEach(treatment => {
                        treatment.effectiveness = Math.min(1.0, treatment.effectiveness + (effect.value || 0) / 100);
                    });
                }
                break;
                
            case 'medical_facility':
                // Add new medical building
                if (effect.value === 'healing_spring') {
                    this.gameState.infrastructure.buildings.push({
                        name: 'Healing Spring',
                        type: 'medical',
                        capacity: 5,
                        condition: 100,
                        special: 'natural_healing'
                    });
                }
                break;
        }
    };

    console.log('🏥 Medical system integration complete');
}

// Enhanced UI Integration for Medical System
if (typeof window.FrontierUI !== 'undefined') {
    
    // Store original methods
    const originalUpdateDisplay = window.FrontierUI.prototype.updateDisplay;
    const originalCreateCharacterCard = window.FrontierUI.prototype.createCharacterCard;

    // Extend display update to include medical info
    window.FrontierUI.prototype.updateDisplay = function() {
        // Call original update
        originalUpdateDisplay.call(this);
        
        // Update medical display
        if (this.simulation && this.simulation.medicalSystem) {
            this.updateMedicalDisplay();
        }
    };

    // Add medical display update
    window.FrontierUI.prototype.updateMedicalDisplay = function() {
        const medicalReport = this.simulation.getMedicalReport();
        if (!medicalReport) return;

        // Update population health stats
        const healthElement = document.getElementById('populationHealthStatus');
        if (healthElement) {
            healthElement.innerHTML = `
                <div class="health-overview">
                    <div class="stat-item">
                        <span class="stat-label">Healthy:</span>
                        <span class="stat-value text-success">${medicalReport.healthyCount}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Injured:</span>
                        <span class="stat-value text-warning">${medicalReport.injuredCount}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Sick:</span>
                        <span class="stat-value text-danger">${medicalReport.sickCount}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Critical:</span>
                        <span class="stat-value text-danger">${medicalReport.criticalCount}</span>
                    </div>
                </div>
                <div class="medical-facilities">
                    <small class="text-muted">
                        Doctor: ${medicalReport.hasDoctor ? '✓' : '✗'} | 
                        Hospital: ${medicalReport.hasHospital ? '✓' : '✗'} | 
                        Medicine: ${medicalReport.medicalSupplies}
                    </small>
                </div>
            `;
        }

        // Update outbreak alerts
        this.updateOutbreakAlerts(medicalReport.activeOutbreaks);
    };

    // Enhanced character card with medical info
    window.FrontierUI.prototype.createCharacterCard = function(character) {
        const card = originalCreateCharacterCard.call(this, character);
        
        // Add medical status to character card
        if (this.simulation && this.simulation.medicalSystem) {
            const medicalDetails = this.simulation.getCharacterMedicalSummary(character);
            
            if (medicalDetails && (medicalDetails.injuries.length > 0 || medicalDetails.diseases.length > 0)) {
                const medicalSection = document.createElement('div');
                medicalSection.className = 'character-medical';
                
                let medicalHTML = '<div class="medical-status"><strong>Medical Status:</strong><br>';
                
                // Show injuries
                if (medicalDetails.injuries.length > 0) {
                    medicalHTML += '<small class="text-warning">Injuries: ';
                    medicalHTML += medicalDetails.injuries.map(injury => 
                        `${injury.type} (${injury.bodyPart})`
                    ).join(', ');
                    medicalHTML += '</small><br>';
                }
                
                // Show diseases
                if (medicalDetails.diseases.length > 0) {
                    medicalHTML += '<small class="text-danger">Diseases: ';
                    medicalHTML += medicalDetails.diseases.map(disease => disease.name).join(', ');
                    medicalHTML += '</small><br>';
                }
                
                // Show work capacity
                if (medicalDetails.workCapacity < 1.0) {
                    const capacityPercent = Math.round(medicalDetails.workCapacity * 100);
                    medicalHTML += `<small class="text-info">Work Capacity: ${capacityPercent}%</small>`;
                }
                
                medicalHTML += '</div>';
                medicalSection.innerHTML = medicalHTML;
                
                card.appendChild(medicalSection);
            }
        }
        
        return card;
    };

    // Add outbreak alert system
    window.FrontierUI.prototype.updateOutbreakAlerts = function(activeOutbreaks) {
        let alertsContainer = document.getElementById('outbreakAlerts');
        
        if (!alertsContainer) {
            // Create alerts container if it doesn't exist
            alertsContainer = document.createElement('div');
            alertsContainer.id = 'outbreakAlerts';
            alertsContainer.className = 'outbreak-alerts';
            
            // Insert after the weather info
            const weatherInfo = document.querySelector('.weather-info');
            if (weatherInfo && weatherInfo.parentNode) {
                weatherInfo.parentNode.insertBefore(alertsContainer, weatherInfo.nextSibling);
            }
        }
        
        if (activeOutbreaks.length === 0) {
            alertsContainer.innerHTML = '';
            alertsContainer.style.display = 'none';
            return;
        }
        
        alertsContainer.style.display = 'block';
        alertsContainer.innerHTML = activeOutbreaks.map(outbreak => `
            <div class="alert alert-danger outbreak-alert">
                <strong>⚠️ ${outbreak.disease.toUpperCase()} OUTBREAK</strong><br>
                <small>Infected: ${outbreak.currentInfected} | Duration: ${outbreak.duration} days</small>
            </div>
        `).join('');
    };

    // Add medical panel to sidebar
    window.FrontierUI.prototype.addMedicalPanel = function() {
        const sidebar = document.querySelector('.sidebar');
        if (!sidebar) return;
        
        const medicalPanel = document.createElement('div');
        medicalPanel.className = 'card mb-3';
        medicalPanel.innerHTML = `
            <div class="card-header">
                <h6><i class="fas fa-heartbeat"></i> Medical Status</h6>
            </div>
            <div class="card-body">
                <div id="populationHealthStatus">
                    <div class="text-center text-muted">
                        <i class="fas fa-spinner fa-spin"></i> Loading...
                    </div>
                </div>
                <hr>
                <div class="d-grid gap-2">
                    <button id="medicalReportBtn" class="btn btn-outline-info btn-sm">
                        <i class="fas fa-chart-line"></i> Medical Report
                    </button>
                    <button id="treatAllBtn" class="btn btn-outline-success btn-sm">
                        <i class="fas fa-first-aid"></i> Treat All
                    </button>
                </div>
            </div>
        `;
        
        // Insert medical panel after status panel
        const statusPanel = sidebar.querySelector('.card:nth-child(2)');
        if (statusPanel && statusPanel.nextSibling) {
            sidebar.insertBefore(medicalPanel, statusPanel.nextSibling);
        } else {
            sidebar.appendChild(medicalPanel);
        }
        
        // Add event listeners
        const medicalReportBtn = document.getElementById('medicalReportBtn');
        if (medicalReportBtn) {
            medicalReportBtn.addEventListener('click', () => this.showMedicalReport());
        }
        
        const treatAllBtn = document.getElementById('treatAllBtn');
        if (treatAllBtn) {
            treatAllBtn.addEventListener('click', () => this.treatAllCharacters());
        }
    };

    // Show detailed medical report
    window.FrontierUI.prototype.showMedicalReport = function() {
        if (!this.simulation || !this.simulation.medicalSystem) return;
        
        const report = this.simulation.getMedicalReport();
        const medicalData = this.simulation.medicalSystem.exportMedicalData();
        
        // Create modal content
        const modalContent = `
            <div class="medical-report">
                <h5>Settlement Medical Report</h5>
                
                <div class="row mb-3">
                    <div class="col-6">
                        <div class="stat-card text-center">
                            <h3 class="text-success">${report.healthPercentage}%</h3>
                            <small>Population Healthy</small>
                        </div>
                    </div>
                    <div class="col-6">
                        <div class="stat-card text-center">
                            <h3 class="text-info">${Math.round(report.sanitationLevel * 100)}%</h3>
                            <small>Sanitation Level</small>
                        </div>
                    </div>
                </div>
                
                <div class="medical-breakdown">
                    <h6>Population Health Breakdown:</h6>
                    <div class="progress mb-2">
                        <div class="progress-bar bg-success" style="width: ${(report.healthyCount/report.totalPopulation)*100}%"></div>
                        <div class="progress-bar bg-warning" style="width: ${(report.injuredCount/report.totalPopulation)*100}%"></div>
                        <div class="progress-bar bg-danger" style="width: ${(report.sickCount/report.totalPopulation)*100}%"></div>
                        <div class="progress-bar bg-dark" style="width: ${(report.criticalCount/report.totalPopulation)*100}%"></div>
                    </div>
                    <small class="text-muted">
                        <span class="badge bg-success">Healthy ${report.healthyCount}</span>
                        <span class="badge bg-warning">Injured ${report.injuredCount}</span>
                        <span class="badge bg-danger">Sick ${report.sickCount}</span>
                        <span class="badge bg-dark">Critical ${report.criticalCount}</span>
                    </small>
                </div>
                
                ${report.activeOutbreaks.length > 0 ? `
                    <div class="outbreak-section mt-3">
                        <h6 class="text-danger">Active Outbreaks:</h6>
                        ${report.activeOutbreaks.map(outbreak => `
                            <div class="alert alert-danger">
                                <strong>${outbreak.disease}</strong> - Day ${outbreak.duration}<br>
                                <small>Infected: ${outbreak.currentInfected} | Peak: ${outbreak.peakInfected}</small>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
                
                <div class="medical-facilities mt-3">
                    <h6>Medical Facilities:</h6>
                    <ul class="list-unstyled">
                        <li><i class="fas fa-user-md"></i> Qualified Doctor: ${report.hasDoctor ? '✅' : '❌'}</li>
                        <li><i class="fas fa-hospital"></i> Hospital Facility: ${report.hasHospital ? '✅' : '❌'}</li>
                        <li><i class="fas fa-pills"></i> Medical Supplies: ${report.medicalSupplies}</li>
                    </ul>
                </div>
                
                <div class="recent-medical-events mt-3">
                    <h6>Recent Medical Events:</h6>
                    <div class="medical-log" style="max-height: 200px; overflow-y: auto;">
                        ${medicalData.medicalLog.slice(-10).map(entry => `
                            <div class="log-entry">
                                <small class="text-muted">${window.FrontierUtils.DateUtils.formatDateShort(entry.date)}</small>
                                <span class="log-message">${entry.message}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
        
        // Show in modal
        this.showModal('Settlement Medical Report', modalContent);
    };

    // Treat all characters who need medical attention
    window.FrontierUI.prototype.treatAllCharacters = function() {
        if (!this.simulation || !this.simulation.medicalSystem) return;
        
        let treatedCount = 0;
        let failedCount = 0;
        
        this.simulation.gameState.characters.forEach(character => {
            if (character.medicalStatus && character.medicalStatus.needsMedicalAttention) {
                // Try to treat injuries
                if (character.injuries) {
                    character.injuries.forEach(injury => {
                        if (!injury.isTreated) {
                            const success = this.simulation.treatCharacter(character.id, injury.id, 'basicMedicalCare');
                            if (success) treatedCount++;
                            else failedCount++;
                        }
                    });
                }
                
                // Try to treat diseases
                if (character.diseases) {
                    character.diseases.forEach(disease => {
                        if (!disease.isTreated && disease.isSymptomPresent) {
                            const success = this.simulation.treatCharacter(character.id, disease.id, 'basicMedicalCare');
                            if (success) treatedCount++;
                            else failedCount++;
                        }
                    });
                }
            }
        });
        
        const message = `Treatment completed: ${treatedCount} conditions treated${failedCount > 0 ? `, ${failedCount} failed (insufficient resources)` : ''}`;
        this.setStatus(message, treatedCount > 0 ? 'success' : 'warning');
    };

    // Utility function to show modal
    window.FrontierUI.prototype.showModal = function(title, content) {
        // Create modal if it doesn't exist
        let modal = document.getElementById('medicalModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'medicalModal';
            modal.className = 'modal fade';
            modal.innerHTML = `
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="medicalModalTitle"></h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body" id="medicalModalBody"></div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
        }
        
        // Update modal content
        document.getElementById('medicalModalTitle').textContent = title;
        document.getElementById('medicalModalBody').innerHTML = content;
        
        // Show modal
        const bootstrapModal = new bootstrap.Modal(modal);
        bootstrapModal.show();
    };

    console.log('🏥 Medical UI integration complete');
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Add medical panel to UI when it's ready
    setTimeout(() => {
        if (window.frontierUI && window.frontierUI.addMedicalPanel) {
            window.frontierUI.addMedicalPanel();
        }
    }, 1000);
});

// Add CSS for medical styling
const medicalStyles = `
    <style>
    .medical-status {
        font-size: 0.8rem;
        margin-top: 0.5rem;
        padding-top: 0.5rem;
        border-top: 1px solid #dee2e6;
    }
    
    .health-overview {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 0.5rem;
        margin-bottom: 0.5rem;
    }
    
    .stat-item {
        display: flex;
        justify-content: space-between;
        font-size: 0.8rem;
    }
    
    .outbreak-alerts {
        margin: 0.5rem 0;
    }
    
    .outbreak-alert {
        font-size: 0.8rem;
        padding: 0.5rem;
        margin-bottom: 0.25rem;
    }
    
    .medical-report .stat-card {
        background: #f8f9fa;
        padding: 1rem;
        border-radius: 0.25rem;
        border: 1px solid #dee2e6;
    }
    
    .medical-breakdown .progress {
        height: 1.5rem;
    }
    
    .medical-log .log-entry {
        padding: 0.25rem 0;
        border-bottom: 1px solid #eee;
        font-size: 0.85rem;
    }
    
    .log-message {
        display: block;
        margin-left: 1rem;
    }
    
    .medical-facilities ul li {
        padding: 0.25rem 0;
    }
    </style>
`;

// Inject medical styles
document.head.insertAdjacentHTML('beforeend', medicalStyles);
        const discovery = window.FrontierUtils.Random.choice(discoveries);
        const character = window.FrontierUtils.Random.choice(this.gameState.characters);
        
        // Process template
        let description = discovery.description
            .replace('{character}', character.name)
            .replace('{herb}', window.FrontierUtils.Random.choice(['willow bark', 'echinacea', 'sage', 'mint']))
            .replace('{condition}', window.FrontierUtils.Random.choice(['fever', 'pain', 'infection', 'digestive issues']));
        
        return {
            id: `medical_discovery_${Date.now()}`,
            type: 'discovery',
            description: description,
            participants: [character],
            effects: [discovery.effect],
            severity: 4,
            date: new Date(this.gameState.date)
        };
    };

    // Generate accident events
    window.FrontierSimulation.prototype.generateAccidentEvent = function() {
        const accidents = [
            {
                cause: 'mining_accident',
                description: 'A cave-in at the mine trapped {character}, causing severe injuries',
                injuryTypes: ['crush', 'fracture', 'cut'],
                severity: 1.2
            },
            {
                cause: 'construction_accident',
                description: '{character} fell from scaffolding while building {building}',
                injuryTypes: ['fracture', 'bruise', 'cut'],
                severity: 1.0
            },
            {
                cause: 'animal_attack',
                description: '{character} was attacked by a {animal} while {activity}',
                injuryTypes: ['laceration', 'puncture', 'bruise'],
                severity: 1.1
            },
            {
                cause: 'fire_accident',
                description: 'A fire broke out in {location}, injuring {character}',
                injuryTypes: ['burn', 'cut', 'bruise'],
                severity: 1.3
            }
        ];
        
        const accident = window.FrontierUtils.Random.choice(accidents);
        const character = window.FrontierUtils.Random.choice(this.gameState.characters);
        
        // Generate injury
        const injuryType = window.FrontierUtils.Random.choice(accident.injuryTypes);
        const injury = this.medicalSystem.generateRandomInjury(character, accident.cause);
        
        // Process template
        let description = accident.description
            .replace('{character}', character.name)
            .replace('{building}', window.FrontierUtils.Random.choice(['the church', 'a new house', 'the trading post']))
            .replace('{animal}', window.FrontierUtils.Random.choice(['bear', 'wolf', 'wild boar', 'rattlesnake']))
            .replace('{activity}', window.FrontierUtils.Random.choice(['hunting', 'gathering firewood', 'checking traps']))
            .replace('{location}', window.FrontierUtils.Random.choice(['the blacksmith shop', 'the kitchen', 'the barn']));
        
        return {
            id: `accident_${Date.now()}`,
            type: 'accident',
            description: description,
            participants: [character],
            effects: [
                { type: 'character_injury', character: character.id, injury: injury.id },
                { type: 'community_mood', value: -5 }
            ],
            severity: Math.floor(accident.severity * 5),
            date: new Date(this.gameState.date)
        };
    };

    // Generate medical supply events
    window.FrontierSimulation.prototype.generateMedicalSupplyEvent = function() {
        const supplyEvents = [
            {
                type: 'caravan_arrival',
                description: 'A medicine wagon arrived with supplies from {city}',
                medicineGain: window.FrontierUtils.Random.int(10, 25),
                cost: window.FrontierUtils.Random.int(20, 50)
            },
            {
                type: 'supply_shortage',
                description: 'Medical supplies are running dangerously low in the settlement',
                medicineGain: 0,
                cost: 0
            },
            {
                type: 'snake_oil_salesman',
                description: 'A traveling salesman claims to have miracle cures',
                medicineGain: window.FrontierUtils.Random.int(5, 15),
                cost: window.FrontierUtils.Random.int(30, 60),
                effectiveness: 0.3 // Snake oil is not very effective
            }
        ];
