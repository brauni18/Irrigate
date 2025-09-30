class LineController {
  constructor() {
    this.lineId = null;
    this.lineName = null;
    this.init();
  }

  init() {
    this.getLineInfo();
    this.updateLineInfo();
    this.setupEventListeners();
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

  setupEventListeners() {
    // Maintenance level slider
    const maintenanceSlider = document.getElementById('customRange1');
    const maintenanceValue = document.getElementById('maintenance-value');
    
    maintenanceSlider.addEventListener('input', (e) => {
      maintenanceValue.textContent = e.target.value + '%';
    });

    // Calculate button
    document.getElementById('calculate-btn').addEventListener('click', () => {
      this.calculateIrrigation();
    });

    // Form submission
    document.getElementById('line-calculation').addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveConfiguration();
    });

    // Reset button
    document.querySelector('.btn-outline-secondary').addEventListener('click', () => {
      this.resetForm();
    });
  }

  calculateIrrigation() {
    const form = document.getElementById('line-calculation');
    const formData = new FormData(form);
    
    // Get values
    const plantType = parseFloat(formData.get('plantType')) || 0;
    const location = parseFloat(formData.get('location')) || 0;
    const interval = parseInt(formData.get('interval')) || 1;
    const areaSize = parseFloat(formData.get('areaSize')) || 0;
    const dripDistance = parseFloat(formData.get('Drip-distance')) || 0.5;
    const dripFlow = parseFloat(formData.get('dripFlow')) || 2.3;
    const maintenanceLevel = parseInt(document.getElementById('customRange1').value) || 50;

    // Validate inputs
    if (!plantType || !location || !areaSize) {
      alert('Please fill in all required fields');
      return;
    }

    // Calculate irrigation needs
    const maintenanceFactor = maintenanceLevel / 100;
    const waterNeed = plantType * location * maintenanceFactor; // L/m²/day
    const totalWaterPerDay = waterNeed * areaSize;
    const totalWaterPerInterval = totalWaterPerDay * interval;
    
    // Calculate drippers and duration
    const drippersPerM2 = 1 / (dripDistance * dripDistance);
    const totalDrippers = Math.ceil(drippersPerM2 * areaSize);
    const totalFlowRate = totalDrippers * dripFlow; // L/h
    const durationHours = totalWaterPerInterval / totalFlowRate;
    const durationMinutes = Math.round(durationHours * 60);

    // Display results
    this.displayResults(durationMinutes, totalWaterPerInterval, interval);
  }

  displayResults(duration, waterAmount, frequency) {
    document.getElementById('result-duration').textContent = `${duration} min`;
    document.getElementById('result-water').textContent = `${waterAmount.toFixed(1)} L`;
    document.getElementById('result-frequency').textContent = `Every ${frequency} days`;
    
    document.getElementById('results-section').style.display = 'block';
    document.getElementById('results-section').scrollIntoView({ behavior: 'smooth' });
  }

  saveConfiguration() {
    // Simulate saving configuration
    const configData = {
      lineId: this.lineId,
      plantType: document.getElementById('plantType').value,
      location: document.getElementById('location').value,
      interval: document.getElementById('interval').value,
      areaSize: document.getElementById('areaSize').value,
      dripDistance: document.getElementById('Drip-distance').value,
      dripFlow: document.getElementById('dripFlow').value,
      maintenanceLevel: document.getElementById('customRange1').value
    };

    console.log('Saving configuration:', configData);
    alert('Configuration saved successfully!');
  }

  resetForm() {
    document.getElementById('line-calculation').reset();
    document.getElementById('maintenance-value').textContent = '50%';
    document.getElementById('customRange1').value = 50;
    document.getElementById('results-section').style.display = 'none';
  }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
  new LineController();
});