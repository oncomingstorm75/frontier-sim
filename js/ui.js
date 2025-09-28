// js/ui.js - Complete User Interface Controller

class FrontierUI {
    constructor() {
        this.simulation = null;
        this.updateInterval = null;
        this.elements = {};
        this.charts = {};
        this.lastUpdateTime = 0;
        
        this.initializeElements();
        this.setupEventListeners();
        
        console.log('FrontierUI initialized');
    }

    initializeElements() {
        // Control elements
        this.elements.startBtn = document.getElementById('startBtn');
        this.elements.pauseBtn = document.getElementById('pauseBtn');
        this.elements.stopBtn = document.getElementById('stopBtn');
        this.elements.stepBtn = document.getElementById('stepBtn');
        this.elements.speedSlider = document.getElementById('speedSlider');
        this.elements.speedDisplay = document.getElementById('speedDisplay');
        this.elements.resetBtn = document.getElementById('resetBtn');
        this.elements.exportBtn = document.getElementById('exportBtn');
        
        // Date and time elements
        this.elements.currentDate = document.getElementById('currentDate');
        this.elements.currentSeason = document.getElementById('currentSeason');
        this.elements.dayCounter = document.getElementById('dayCounter');
        this.elements.yearProgress = document.getElementById('yearProgress');
        
        // Weather elements
        this.elements.temperature = document.getElementById('temperature');
        this.elements.precipitation = document.getElementById('precipitation');
        this.elements.windSpeed = document.getElementById('windSpeed');
        this.elements.weatherConditions = document.getElementById('weatherConditions');
        
        // Population elements
        this.elements.totalPopulation = document.getElementById('totalPopulation');
        this.elements.adultsCount = document.getElementById('adultsCount');
        this.elements.childrenCount = document.getElementById('childrenCount');
        this.elements.elderlyCount = document.getElementById('elderlyCount');
        this.elements.cultureBreakdown = document.getElementById('cultureBreakdown');
        
        // Morale elements
        this.elements.overallMorale = document.getElementById('overallMorale');
        this.elements.moraleBar = document.getElementById('moraleBar');
        this.elements.moraleFactors = document.getElementById('moraleFactors');
        
        // Resource elements
        this.elements.foodLevel = document.getElementById('foodLevel');
        this.elements.waterLevel = document.getElementById('waterLevel');
        this.elements.woodLevel = document.getElementById('woodLevel');
        this.elements.stoneLevel = document.getElementById('stoneLevel');
        this.elements.metalLevel = document.getElementById('metalLevel');
        this.elements.toolsLevel = document.getElementById('toolsLevel');
        this.elements.medicineLevel = document.getElementById('medicineLevel');
        this.elements.moneyLevel = document.getElementById('moneyLevel');
        
        // Resource bars
        this.elements.foodBar = document.getElementById('foodBar');
        this.elements.waterBar = document.getElementById('waterBar');
        this.elements.woodBar = document.getElementById('woodBar');
        
        // Character elements
        this.elements.characterList = document.getElementById('characterList');
        this.elements.characterCount = document.getElementById('characterCount');
        
        // Events elements
        this.elements.eventLog = document.getElementById('eventLog');
        this.elements.eventCount = document.getElementById('eventCount');
        this.elements.recentEvents = document.getElementById('recentEvents');
        
        // Chronicle elements
        this.elements.chronicleView = document.getElementById('chronicleView');
        this.elements.chronicleCount = document.getElementById('chronicleCount');
        
        // Infrastructure elements
        this.elements.buildingsList = document.getElementById('buildingsList');
        this.elements.defensesLevel = document.getElementById('defensesLevel');
        
        // Economy elements
        this.elements.wealthLevel = document.getElementById('wealthLevel');
        this.elements.tradeRoutes = document.getElementById('tradeRoutes');
        this.elements.marketPrices = document.getElementById('marketPrices');
        
        // Status elements
        this.elements.statusMessage = document.getElementById('statusMessage');
        this.elements.simulationStatus = document.getElementById('simulationStatus');
    }

    setupEventListeners() {
        // Control buttons
        if (this.elements.startBtn) {
            this.elements.startBtn.addEventListener('click', () => this.startSimulation());
        }
        
        if (this.elements.pauseBtn) {
            this.elements.pauseBtn.addEventListener('click', () => this.pauseSimulation());
        }
        
        if (this.elements.stopBtn) {
            this.elements.stopBtn.addEventListener('click', () => this.stopSimulation());
        }
        
        if (this.elements.stepBtn) {
            this.elements.stepBtn.addEventListener('click', () => this.stepSimulation());
        }
        
        if (this.elements.resetBtn) {
            this.elements.resetBtn.addEventListener('click', () => this.resetSimulation());
        }
        
        if (this.elements.exportBtn) {
            this.elements.exportBtn.addEventListener('click', () => this.exportChronicle());
        }
        if (document.getElementById('stepYearBtn')) {
            document.getElementById('stepYearBtn').addEventListener('click', () => {
                if (this.simulation) {
                    this.advanceWithProgress(365, "Advancing 1 year...");
                }
            });
        }

        if (document.getElementById('step5YearBtn')) {
            document.getElementById('step5YearBtn').addEventListener('click', () => {
                if (this.simulation) {
                    this.advanceWithProgress(1825, "Advancing 5 years...");
                }
            });
        }

        if (document.getElementById('step10YearBtn')) {
            document.getElementById('step10YearBtn').addEventListener('click', () => {
                if (this.simulation) {
                    this.advanceWithProgress(3650, "Advancing 10 years...");
                }
            });
        }
        // Speed control
        if (this.elements.speedSlider) {
            this.elements.speedSlider.addEventListener('input', (e) => {
                const speed = parseInt(e.target.value);
                this.updateSimulationSpeed(speed);
            });
        }
        // Add to setupEventListeners() method

        if (document.getElementById('stepWeekBtn')) {
            document.getElementById('stepWeekBtn').addEventListener('click', () => {
                if (this.simulation) {
                    this.simulation.stepDays(7);
                    this.updateDisplay();
                }
            });
        }

        if (document.getElementById('stepMonthBtn')) {
            document.getElementById('stepMonthBtn').addEventListener('click', () => {
                if (this.simulation) {
                    this.simulation.stepDays(30);
                    this.updateDisplay();
                }
            });
        }

        if (document.getElementById('stepSeasonBtn')) {
            document.getElementById('stepSeasonBtn').addEventListener('click', () => {
                if (this.simulation) {
                    const seasons = ['spring', 'summer', 'fall', 'winter'];
                    const currentIndex = seasons.indexOf(this.simulation.gameState.season);
                    const nextSeason = seasons[(currentIndex + 1) % 4];
                    this.simulation.stepToSeason(nextSeason);
                    this.updateDisplay();
                }
            });
        }
        // Character list interactions
        if (this.elements.characterList) {
            this.elements.characterList.addEventListener('click', (e) => {
                const characterCard = e.target.closest('.character-card');
                if (characterCard) {
                    this.selectCharacter(characterCard.dataset.characterId);
                }
            });
        }
        
        // Event log interactions
        if (this.elements.eventLog) {
            this.elements.eventLog.addEventListener('click', (e) => {
                const eventItem = e.target.closest('.event-item');
                if (eventItem) {
                    this.showEventDetails(eventItem.dataset.eventId);
                }
            });
        }

        if (document.getElementById('customAdvanceBtn')) {
            document.getElementById('customAdvanceBtn').addEventListener('click', () => {
                const days = parseInt(document.getElementById('customDays').value);
                if (days && days > 0 && days <= 10000) {
                    this.advanceWithProgress(days, `Advancing ${days} Days...`);
                } else {
                    this.setStatus('Enter a valid number of days (1-10000)', 'warning');
                }
            });
        }

        // Allow Enter key in custom days input
        if (document.getElementById('customDays')) {
            document.getElementById('customDays').addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    document.getElementById('customAdvanceBtn').click();
                }
            });
        }
    }

    // Simulation Control Methods
    initialize(simulation) {
        this.simulation = simulation;
        console.log('UI connected to simulation');
        this.updateDisplay();
        this.startAutoUpdate();
    }

    startSimulation() {
        if (this.simulation && !this.simulation.isRunning) {
            this.simulation.start();
            this.updateControlButtons();
            this.setStatus('Simulation running', 'success');
        }
    }

    pauseSimulation() {
        if (this.simulation && this.simulation.isRunning) {
            this.simulation.stop();
            this.updateControlButtons();
            this.setStatus('Simulation paused', 'warning');
        }
    }

    stopSimulation() {
        if (this.simulation) {
            this.simulation.stop();
            this.updateControlButtons();
            this.setStatus('Simulation stopped', 'info');
        }
    }

    stepSimulation() {
        if (this.simulation) {
            this.simulation.simulationStep();
            this.updateDisplay();
            this.setStatus('Advanced one day', 'info');
        }
    }

    resetSimulation() {
        if (this.simulation) {
            if (confirm('Are you sure you want to reset the simulation? All progress will be lost.')) {
                this.simulation.stop();
                // Reinitialize simulation
                const newSim = new FrontierSimulation();
                this.initialize(newSim);
                this.setStatus('Simulation reset', 'info');
            }
        }
    }

    updateSimulationSpeed(speed) {
        if (this.simulation) {
            this.simulation.setSimulationSpeed(speed);
            if (this.elements.speedDisplay) {
                this.elements.speedDisplay.textContent = `${speed}ms`;
            }
        }
    }

    updateControlButtons() {
        const isRunning = this.simulation && this.simulation.isRunning;
        
        if (this.elements.startBtn) {
            this.elements.startBtn.disabled = isRunning;
        }
        if (this.elements.pauseBtn) {
            this.elements.pauseBtn.disabled = !isRunning;
        }
        if (this.elements.stepBtn) {
            this.elements.stepBtn.disabled = isRunning;
        }
    }
    
    // Display Update Methods
    updateDisplay() {
        if (!this.simulation || !this.simulation.gameState) return;

        const gameState = this.simulation.gameState;
        
        try {
            this.updateDateTime(gameState);
            this.updateWeather(gameState);
            this.updatePopulation(gameState);
            this.updateMorale(gameState);
            this.updateResources(gameState);
            this.updateCharacters(gameState);
            this.updateEvents();
            this.updateInfrastructure(gameState);
            this.updateEconomy(gameState);
            this.updateControlButtons();
        } catch (error) {
            console.error('Error updating display:', error);
        }
    }

    updateDateTime(gameState) {
        if (this.elements.currentDate) {
            this.elements.currentDate.textContent = window.FrontierUtils.DateUtils.formatDate(gameState.date);
        }
        
        if (this.elements.currentSeason) {
            this.elements.currentSeason.textContent = gameState.season || 'Unknown';
        }
        
        if (this.elements.dayCounter) {
            this.elements.dayCounter.textContent = gameState.day || 1;
        }
        
        if (this.elements.yearProgress) {
            const progress = ((gameState.day || 1) / 365) * 100;
            this.elements.yearProgress.style.width = `${Math.min(progress, 100)}%`;
        }
    }

    updateWeather(gameState) {
        const weather = gameState.weather || {};
        
        if (this.elements.temperature) {
            this.elements.temperature.textContent = `${weather.temperature || 0}°F`;
        }
        
        if (this.elements.precipitation) {
            this.elements.precipitation.textContent = weather.precipitation || 'none';
        }
        
        if (this.elements.windSpeed) {
            this.elements.windSpeed.textContent = `${weather.windSpeed || 0} mph`;
        }
        
        if (this.elements.weatherConditions) {
            const conditions = weather.conditions || [];
            this.elements.weatherConditions.textContent = conditions.join(', ') || 'Clear';
        }
    }

    updatePopulation(gameState) {
        const population = gameState.population || { total: 0, demographics: {}, cultural_groups: {} };
        
        if (this.elements.totalPopulation) {
            this.elements.totalPopulation.textContent = population.total;
        }
        
        if (this.elements.adultsCount) {
            this.elements.adultsCount.textContent = population.demographics.adults || 0;
        }
        
        if (this.elements.childrenCount) {
            this.elements.childrenCount.textContent = population.demographics.children || 0;
        }
        
        if (this.elements.elderlyCount) {
            this.elements.elderlyCount.textContent = population.demographics.elderly || 0;
        }
        
        if (this.elements.cultureBreakdown) {
            const cultures = Object.entries(population.cultural_groups)
                .map(([culture, count]) => `${culture}: ${count}`)
                .join(', ');
            this.elements.cultureBreakdown.textContent = cultures || 'No data';
        }
    }

    updateMorale(gameState) {
        const morale = gameState.morale || { overall: 50, factors: [] };
        
        if (this.elements.overallMorale) {
            this.elements.overallMorale.textContent = `${morale.overall}/100`;
        }
        
        if (this.elements.moraleBar) {
            this.elements.moraleBar.style.width = `${morale.overall}%`;
            
            // Color coding for morale
            if (morale.overall > 70) {
                this.elements.moraleBar.className = 'progress-bar bg-success';
            } else if (morale.overall > 40) {
                this.elements.moraleBar.className = 'progress-bar bg-warning';
            } else {
                this.elements.moraleBar.className = 'progress-bar bg-danger';
            }
        }
        
        if (this.elements.moraleFactors) {
            const factors = morale.factors || [];
            this.elements.moraleFactors.innerHTML = factors
                .map(factor => `<span class="badge badge-info">${factor}</span>`)
                .join(' ');
        }
    }

    updateResources(gameState) {
        const resources = gameState.resources || {};
        
        // Update resource values
        Object.entries(resources).forEach(([resource, amount]) => {
            const element = this.elements[`${resource}Level`];
            if (element) {
                element.textContent = Math.floor(amount);
            }
            
            // Update resource bars for key resources
            const barElement = this.elements[`${resource}Bar`];
            if (barElement) {
                const maxAmount = this.getMaxResourceAmount(resource);
                const percentage = Math.min((amount / maxAmount) * 100, 100);
                barElement.style.width = `${percentage}%`;
                
                // Color coding based on resource level
                if (percentage > 70) {
                    barElement.className = 'progress-bar bg-success';
                } else if (percentage > 30) {
                    barElement.className = 'progress-bar bg-warning';
                } else {
                    barElement.className = 'progress-bar bg-danger';
                }
            }
        });
    }

    getMaxResourceAmount(resource) {
        // Define maximum amounts for progress bar calculation
        const maxAmounts = {
            food: 200,
            water: 150,
            wood: 100,
            stone: 80,
            metal: 50,
            tools: 40,
            medicine: 30,
            money: 500
        };
        return maxAmounts[resource] || 100;
    }

    updateCharacters(gameState) {
        const characters = gameState.characters || [];
        
        if (this.elements.characterCount) {
            this.elements.characterCount.textContent = characters.length;
        }
        
        if (this.elements.characterList) {
            this.elements.characterList.innerHTML = '';
            
            characters.forEach(character => {
                const characterCard = this.createCharacterCard(character);
                this.elements.characterList.appendChild(characterCard);
            });
        }
    }

    createCharacterCard(character) {
        const card = document.createElement('div');
        card.className = 'character-card';
        card.dataset.characterId = character.id;
        
        const healthColor = character.stats.health > 70 ? 'success' : 
                          character.stats.health > 40 ? 'warning' : 'danger';
        const moodColor = character.stats.mood > 70 ? 'success' : 
                         character.stats.mood > 40 ? 'warning' : 'danger';
        
        card.innerHTML = `
            <div class="character-header">
                <h5 class="character-name">${character.name}</h5>
                <span class="character-age">${character.age} years</span>
            </div>
            <div class="character-info">
                <p><strong>Background:</strong> ${character.background}</p>
                <p><strong>Culture:</strong> ${character.culture || 'Unknown'}</p>
                <p><strong>Activity:</strong> ${character.currentActivity || 'Resting'}</p>
            </div>
            <div class="character-stats">
                <div class="stat-bar">
                    <label>Health</label>
                    <div class="progress">
                        <div class="progress-bar bg-${healthColor}" style="width: ${character.stats.health}%"></div>
                    </div>
                    <span>${character.stats.health}/100</span>
                </div>
                <div class="stat-bar">
                    <label>Mood</label>
                    <div class="progress">
                        <div class="progress-bar bg-${moodColor}" style="width: ${character.stats.mood}%"></div>
                    </div>
                    <span>${character.stats.mood}/100</span>
                </div>
                <div class="stat-bar">
                    <label>Energy</label>
                    <div class="progress">
                        <div class="progress-bar bg-primary" style="width: ${character.stats.energy}%"></div>
                    </div>
                    <span>${character.stats.energy}/100</span>
                </div>
            </div>
            <div class="character-traits">
                <strong>Traits:</strong> ${character.traits ? character.traits.join(', ') : 'None'}
            </div>
        `;
        
        return card;
    }

    updateEvents() {
        if (!this.simulation) return;
        
        const recentEvents = this.simulation.getChronicle().slice(-10);
        
        if (this.elements.eventCount) {
            this.elements.eventCount.textContent = this.simulation.getChronicle().length;
        }
        
        if (this.elements.eventLog) {
            this.elements.eventLog.innerHTML = '';
            
            recentEvents.reverse().forEach(event => {
                const eventElement = this.createEventElement(event);
                this.elements.eventLog.appendChild(eventElement);
            });
        }
        
        if (this.elements.recentEvents) {
            const lastEvent = recentEvents[recentEvents.length - 1];
            if (lastEvent) {
                this.elements.recentEvents.textContent = lastEvent.description;
            }
        }
    }

    createEventElement(event) {
        const element = document.createElement('div');
        element.className = 'event-item';
        element.dataset.eventId = event.id;
        
        const typeClass = this.getEventTypeClass(event.type);
        
        element.innerHTML = `
            <div class="event-header">
                <span class="event-date">${window.FrontierUtils.DateUtils.formatDateShort(event.date)}</span>
                <span class="event-type badge badge-${typeClass}">${event.type}</span>
            </div>
            <div class="event-description">${event.description}</div>
            ${event.participants ? `<div class="event-participants">Participants: ${event.participants.join(', ')}</div>` : ''}
        `;
        
        return element;
    }

    getEventTypeClass(type) {
        const typeClasses = {
            'social': 'primary',
            'economic': 'success',
            'environmental': 'info',
            'conflict': 'danger',
            'discovery': 'warning',
            'general': 'secondary'
        };
        return typeClasses[type] || 'secondary';
    }

    updateInfrastructure(gameState) {
        const infrastructure = gameState.infrastructure || { buildings: [], defenses: {} };
        
        if (this.elements.buildingsList) {
            this.elements.buildingsList.innerHTML = '';
            
            infrastructure.buildings.forEach(building => {
                const buildingElement = document.createElement('div');
                buildingElement.className = 'building-item';
                buildingElement.innerHTML = `
                    <strong>${building.name}</strong> (${building.type})
                    <span class="building-condition">Condition: ${building.condition}%</span>
                `;
                this.elements.buildingsList.appendChild(buildingElement);
            });
        }
        
        if (this.elements.defensesLevel) {
            const defenses = infrastructure.defenses || {};
            const defenseScore = (defenses.walls ? 20 : 0) + 
                               (defenses.watchtowers * 10) + 
                               (defenses.armed_guards * 5);
            this.elements.defensesLevel.textContent = defenseScore;
        }
    }

    updateEconomy(gameState) {
        const economy = gameState.economy || {};
        
        if (this.elements.wealthLevel) {
            this.elements.wealthLevel.textContent = economy.wealth_distribution || 'Poor';
        }
        
        if (this.elements.tradeRoutes) {
            const routes = economy.trade_routes || [];
            this.elements.tradeRoutes.textContent = routes.length;
        }
        
        if (this.elements.marketPrices && economy.market_prices) {
            this.elements.marketPrices.innerHTML = '';
            
            Object.entries(economy.market_prices).forEach(([item, price]) => {
                const priceElement = document.createElement('div');
                priceElement.className = 'price-item';
                priceElement.innerHTML = `<span>${item}:</span> <span>${price.toFixed(2)}</span>`;
                this.elements.marketPrices.appendChild(priceElement);
            });
        }
    }

    // Utility Methods
    setStatus(message, type = 'info') {
        if (this.elements.statusMessage) {
            this.elements.statusMessage.textContent = message;
            this.elements.statusMessage.className = `status-message ${type}`;
        }
        
        if (this.elements.simulationStatus) {
            this.elements.simulationStatus.textContent = message;
        }
        
        // Auto-clear status after 3 seconds
        setTimeout(() => {
            if (this.elements.statusMessage) {
                this.elements.statusMessage.textContent = '';
            }
        }, 3000);
    }

    startAutoUpdate() {
        this.updateInterval = setInterval(() => {
            this.updateDisplay();
        }, 1000); // Update every second
    }

    stopAutoUpdate() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }

    // Event Handlers
    selectCharacter(characterId) {
        // Highlight selected character
        document.querySelectorAll('.character-card').forEach(card => {
            card.classList.remove('selected');
        });
        
        const selectedCard = document.querySelector(`[data-character-id="${characterId}"]`);
        if (selectedCard) {
            selectedCard.classList.add('selected');
        }
        
        // You could add character detail view here
        console.log('Selected character:', characterId);
    }

    showEventDetails(eventId) {
        if (!this.simulation) return;
        
        const event = this.simulation.getChronicle().find(e => e.id === eventId);
        if (event) {
            // You could show a modal or detailed view here
            console.log('Event details:', event);
            alert(`Event Details:\n\nDate: ${window.FrontierUtils.DateUtils.formatDate(event.date)}\nType: ${event.type}\n\n${event.description}`);
        }
    }

    exportChronicle() {
        if (!this.simulation) return;
        
        try {
            const chronicle = this.simulation.exportChronicle();
            const dataStr = JSON.stringify(chronicle, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            
            const link = document.createElement('a');
            link.href = URL.createObjectURL(dataBlob);
            link.download = `red_rock_territory_chronicle_${new Date().toISOString().split('T')[0]}.json`;
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            this.setStatus('Chronicle exported successfully', 'success');
        } catch (error) {
            console.error('Export failed:', error);
            this.setStatus('Export failed', 'danger');
        }
    }

    // Cleanup
    destroy() {
        this.stopAutoUpdate();
        
        // Remove event listeners
        Object.values(this.elements).forEach(element => {
            if (element && element.removeEventListener) {
                element.removeEventListener('click', () => {});
            }
        });
        
        this.simulation = null;
        this.elements = {};
    }

    // Enhanced showModal method in FrontierUI class
    showModal(title, content, options = {}) {
        const {
            allowClose = true,
            modalId = 'dynamicModal',
            size = 'modal-lg',
            backdrop = true,
            keyboard = true
        } = options;
        
        // Create or get existing modal
        let modal = document.getElementById(modalId);
        if (!modal) {
            modal = document.createElement('div');
            modal.id = modalId;
            modal.className = 'modal fade';
            modal.innerHTML = `
                <div class="modal-dialog ${size}">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="${modalId}Title"></h5>
                            ${allowClose ? '<button type="button" class="btn-close" data-bs-dismiss="modal"></button>' : ''}
                        </div>
                        <div class="modal-body" id="${modalId}Body"></div>
                        <div class="modal-footer" id="${modalId}Footer" style="display: none;">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
        }
        
        // Update modal content
        document.getElementById(`${modalId}Title`).textContent = title;
        document.getElementById(`${modalId}Body`).innerHTML = content;
        
        // Show/hide footer
        const footer = document.getElementById(`${modalId}Footer`);
        if (allowClose) {
            footer.style.display = 'flex';
        } else {
            footer.style.display = 'none';
        }
        
        // Configure modal options
        const bootstrapModal = new bootstrap.Modal(modal, {
            backdrop: backdrop,
            keyboard: keyboard
        });
        
        bootstrapModal.show();
        return bootstrapModal;
    }
}

// Initialize UI when DOM is loaded
window.addEventListener('DOMContentLoaded', () => {
    window.frontierUI = new FrontierUI();
    console.log('FrontierUI created and ready');
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FrontierUI;
}

