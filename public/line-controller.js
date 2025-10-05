const API_lineConfigurations_URL = '/api/line_configurations';
class LineController {
  constructor() {
    // Define plant maintenance ranges
    this.plantRanges = {
      'trees': {
        name: 'Trees',
        emoji: '🌳',
        minCoeff: 0.3,
        maxCoeff: 0.4,
        description: 'Deep-rooted, drought tolerant once established'
      },
      'roses': {
        name: 'Roses',
        emoji: '🌹',
        minCoeff: 0.5,
        maxCoeff: 0.65,
        description: 'Require consistent moisture and nutrients'
      },
      'grass': {
        name: 'Grass',
        emoji: '🌱',
        minCoeff: 0.3,
        maxCoeff: 0.6,
        description: 'Water needs vary greatly by maintenance level'
      },
      'bush': {
        name: 'Bush',
        emoji: '🌿',
        minCoeff: 0.25,
        maxCoeff: 0.45,
        description: 'Moderate water needs, adaptable'
      },
      'small-bush': {
        name: 'Small Bush',
        emoji: '🪴',
        minCoeff: 0.5,
        maxCoeff: 0.6,
        description: 'Higher water needs due to smaller root system'
      },
      'water-wise': {
        name: 'Water-wise Plants',
        emoji: '🌵',
        minCoeff: 0.01,
        maxCoeff: 0.2,
        description: 'Drought-adapted, minimal water requirements'
      }
    };
    
    this.init();
  }

  init() {
    this.getLineInfo();
    this.updateLineInfo();
    this.setupEventListeners();
    // this.loadExistingConfiguration();
  }

  setupEventListeners() {
    // Plant type selection
    document.getElementById('plantType').addEventListener('change', (e) => {
      this.updateMaintenanceRange(e.target.value);
    });

    // Maintenance level slider
    const maintenanceSlider = document.getElementById('customRange1');
    const maintenanceValue = document.getElementById('maintenance-value');
    
    maintenanceSlider.addEventListener('input', (e) => {
      const percentage = e.target.value;
      maintenanceValue.textContent = percentage + '%';
      this.updatePlantCoefficient();
    });

    // Calculate button
    document.getElementById('calculate-btn').addEventListener('click', () => {
      e.preventDefault();
      this.calculateIrrigation();
      this.loadExistingConfiguration();
    });
    // Reset button
    document.querySelector('.btn-outline-secondary').addEventListener('click', () => {
      this.resetForm();
    });
  }

  updateMaintenanceRange(plantType) {
    const maintenanceInfo = document.getElementById('maintenance-info');
    const plantRangeInfo = document.getElementById('plant-range-info');
    const minLabel = document.getElementById('min-label');
    const maxLabel = document.getElementById('max-label');
    const calculatedCoeff = document.getElementById('calculated-coefficient');
    
    if (!plantType || !this.plantRanges[plantType]) {
      maintenanceInfo.style.display = 'none';
      calculatedCoeff.style.display = 'none';
      minLabel.textContent = 'Low';
      maxLabel.textContent = 'High';
      return;
    }

    const plant = this.plantRanges[plantType];
    
    // Show maintenance info
    maintenanceInfo.style.display = 'block';
    calculatedCoeff.style.display = 'block';
    
    // Update info text
    plantRangeInfo.innerHTML = `
      ${plant.emoji} ${plant.name}: ${plant.description}<br>
      <strong>Water coefficient range: ${plant.minCoeff} - ${plant.maxCoeff}</strong>
    `;
    
    // Update labels
    minLabel.innerHTML = `Low<br><small class="text-muted">(${plant.minCoeff})</small>`;
    maxLabel.innerHTML = `High<br><small class="text-muted">(${plant.maxCoeff})</small>`;
    
    // Update coefficient calculation
    this.updatePlantCoefficient();
  }

  updatePlantCoefficient() {
    const plantType = document.getElementById('plantType').value;
    const maintenanceLevel = parseInt(document.getElementById('customRange1').value);
    const coefficientValue = document.getElementById('coefficient-value');
    
    if (!plantType || !this.plantRanges[plantType]) {
      coefficientValue.textContent = '--';
      return;
    }

    const plant = this.plantRanges[plantType];
    
    // Calculate coefficient based on maintenance level (1-100)
    const normalizedLevel = (maintenanceLevel - 1) / 99; // Convert to 0-1 range
    const coefficient = plant.minCoeff + (normalizedLevel * (plant.maxCoeff - plant.minCoeff));
    
    coefficientValue.textContent = coefficient.toFixed(3);
    
    // Update coefficient color based on level
    if (maintenanceLevel <= 33) {
      coefficientValue.className = 'text-success fw-bold'; // Green for low
    } else if (maintenanceLevel <= 66) {
      coefficientValue.className = 'text-warning fw-bold'; // Yellow for medium
    } else {
      coefficientValue.className = 'text-danger fw-bold'; // Red for high
    }
  }

  getPlantCoefficient() {
    const plantType = document.getElementById('plantType').value;
    const maintenanceLevel = parseInt(document.getElementById('customRange1').value);
    
    if (!plantType || !this.plantRanges[plantType]) {
      return 0;
    }

    const plant = this.plantRanges[plantType];
    const normalizedLevel = (maintenanceLevel - 1) / 99;
    return plant.minCoeff + (normalizedLevel * (plant.maxCoeff - plant.minCoeff));
  }

  calculateIrrigation() {
    const form = document.getElementById('line-calculation');
    const formData = new FormData(form);
    
    // Get values
    const plantCoefficient = this.getPlantCoefficient(); // Use dynamic coefficient
    const location = parseFloat(formData.get('location')) || 0;
    const interval = parseInt(formData.get('interval')) || 1;
    const areaSize = parseFloat(formData.get('areaSize')) || 0;
    const dripDistance = parseFloat(formData.get('Drip-distance')) || 0.5;
    const dripFlow = parseFloat(formData.get('dripFlow')) || 2.3;
    const maintenanceLevel = parseInt(document.getElementById('customRange1').value) || 50;

    // Validate inputs
    if (!plantCoefficient || !location || !areaSize) {
      alert('Please fill in all required fields');
      return;
    }

    // Calculate irrigation needs - simplified since maintenance is already in coefficient
    const waterNeed = plantCoefficient * location; // L/m²/day
    const totalWaterPerDay = waterNeed * areaSize;
    const totalWaterPerInterval = totalWaterPerDay * interval;
    
    // Calculate drippers and duration
    const drippersPerM2 = 1 / (dripDistance * dripDistance);
    const totalDrippers = Math.ceil(drippersPerM2 * areaSize);
    const totalFlowRate = totalDrippers * dripFlow; // L/h
    const durationHours = totalWaterPerInterval / totalFlowRate;
    const durationMinutes = Math.round(durationHours * 60);

    // Calculate pipe length
    const pipeLength = totalDrippers * dripDistance; // meters

    // Calculate additional metrics
    const waterPerPlant = totalWaterPerInterval / totalDrippers; // L per plant per interval

    // send data to server to save
    this.lastCalculation = {
      duration: durationMinutes,
      waterAmount: totalWaterPerInterval,
      frequency: interval,
      totalPlants: totalDrippers,
      pipeLength: pipeLength,
      totalFlowRate: totalFlowRate,
      waterPerPlant: waterPerPlant,
      plantCoefficient: plantCoefficient
    };

    fetch(`${API_lineConfigurations_URL}/${this.lineId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(this.lastCalculation)
    });

    // Display results
    this.displayResults(this.lastCalculation);
    
  }

  displayResults(calc) {
    // Main results
    document.getElementById('result-duration').textContent = `${calc.duration} min`;
    document.getElementById('result-water').textContent = `${calc.waterAmount.toFixed(1)} L`;
    document.getElementById('result-frequency').textContent = `Every ${calc.frequency} days`;
    document.getElementById('result-plants').textContent = `${calc.totalPlants} plants`;
    document.getElementById('result-pipe-length').textContent = `${calc.pipeLength.toFixed(1)} m`;
    
    // Breakdown information
    document.getElementById('result-flow-rate').textContent = `${calc.totalFlowRate.toFixed(1)} L/h`;
    document.getElementById('result-water-per-plant').textContent = `${calc.waterPerPlant.toFixed(2)} L`;
    
    document.getElementById('results-section').style.display = 'block';
    document.getElementById('results-section').scrollIntoView({ behavior: 'smooth' });
  }

  resetForm() {
    document.getElementById('line-calculation').reset();
    document.getElementById('maintenance-value').textContent = '50%';
    document.getElementById('customRange1').value = 50;
    document.getElementById('results-section').style.display = 'none';
    document.getElementById('maintenance-info').style.display = 'none';
    document.getElementById('calculated-coefficient').style.display = 'none';
    document.getElementById('coefficient-value').textContent = '--';
  }
  getLineInfo() {
    const urlParams = new URLSearchParams(window.location.search);
    this.lineId = urlParams.get('lineId');
    this.lineName = urlParams.get('lineName') || `Line ${this.lineId}`;
  }

  updateLineInfo() {
    if (this.lineId && this.lineName) {
      document.getElementById('line-title').textContent = `${this.lineName} Controller`;
      document.getElementById('breadcrumb-line').textContent = this.lineName;
      document.title = `${this.lineName} - Irrigate`;
    }
  }
    async loadExistingConfiguration() {
      if (!this.lineId) return;
    
      try {
          const response = await fetch(`/api/line-configurations/${this.lineId}`);
          
          if (response.ok) {
              const config = await response.json();
              this.populateFormWithConfig(config);
          }
      } catch (error) {
          console.error('Error loading configuration:', error);
      }
  }

  populateFormWithConfig(config) {
      document.getElementById('plantType').value = config.plantType;
      document.getElementById('location').value = config.location;
      document.getElementById('interval').value = config.interval;
      document.getElementById('areaSize').value = config.areaSize;
      document.getElementById('Drip-distance').value = config.dripperSettings.distance;
      document.getElementById('dripFlow').value = config.dripperSettings.flowRate;
      document.getElementById('customRange1').value = config.maintenanceLevel;
      document.getElementById('maintenance-value').textContent = config.maintenanceLevel + '%';

      // Update plant type info
      this.updateMaintenanceRange(config.plantType);

      // Display previous calculation if available
      if (config.calculatedValues) {
          this.lastCalculation = config.calculatedValues;
          this.displayResults(config.calculatedValues);
      }
  }
}


// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
  new LineController();
});