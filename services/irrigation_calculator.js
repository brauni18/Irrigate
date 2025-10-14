// Plant maintenance ranges and coefficients
const PLANT_RANGES = {
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

/**
 * Calculate plant coefficient based on plant type and maintenance level
 * @param {string} plantType - Type of plant
 * @param {number} maintenanceLevel - Maintenance level (1-100)
 * @returns {number} Plant coefficient
 */
const calculatePlantCoefficient = (plantType, maintenanceLevel) => {
  if (!plantType || !PLANT_RANGES[plantType]) {
    return 0;
  }

  const plant = PLANT_RANGES[plantType];
  const normalizedLevel = (maintenanceLevel - 1) / 99; // Convert to 0-1 range
  return plant.minCoeff + (normalizedLevel * (plant.maxCoeff - plant.minCoeff));
};

/**
 * Calculate irrigation requirements
 * @param {Object} params - Calculation parameters
 * @param {string} params.plantType - Type of plant
 * @param {number} params.maintenanceLevel - Maintenance level (1-100)
 * @param {number} params.location - Location coefficient (L/m²/day)
 * @param {number} params.interval - Days between irrigation
 * @param {number} params.areaSize - Area size in m²
 * @param {number} params.dripDistance - Distance between drippers in meters
 * @param {number} params.dripFlow - Flow rate per dripper in L/h
 * @returns {Object} Calculated irrigation values
 */
const calculateIrrigation = (params) => {
  const {
    plantType,
    maintenanceLevel,
    location,
    interval,
    areaSize,
    dripDistance,
    dripFlow
  } = params;

  // Validate inputs
  if (!plantType || !location || !areaSize) {
    throw new Error('Missing required fields: plantType, location, and areaSize are required');
  }

  // Calculate plant coefficient
  const plantCoefficient = calculatePlantCoefficient(plantType, maintenanceLevel);
  
  if (plantCoefficient === 0) {
    throw new Error('Invalid plant type');
  }

  // Calculate irrigation needs
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

  // Calculate water per plant
  const waterPerPlant = totalWaterPerInterval / totalDrippers; // L per plant per interval

  return {
    duration: durationMinutes,
    waterAmount: totalWaterPerInterval,
    frequency: interval,
    totalPlants: totalDrippers,
    pipeLength: pipeLength,
    totalFlowRate: totalFlowRate,
    waterPerPlant: waterPerPlant,
    plantCoefficient: plantCoefficient
  };
};

/**
 * Get plant ranges information
 * @returns {Object} Plant ranges
 */
const getPlantRanges = () => {
  return PLANT_RANGES;
};

module.exports = {
  calculateIrrigation,
  calculatePlantCoefficient,
  getPlantRanges,
  PLANT_RANGES
};
