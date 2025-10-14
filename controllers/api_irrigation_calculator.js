const irrigationCalculator = require('../services/irrigation_calculator');

/**
 * Calculate irrigation requirements
 * POST /api/calculate_irrigation
 */
const calculateIrrigation = async (req, res) => {
    try {
        const {
            plantType,
            maintenanceLevel,
            location,
            interval,
            areaSize,
            dripDistance,
            dripFlow
        } = req.body;

        // Validate required fields
        if (!plantType || maintenanceLevel === undefined || !location || !interval || !areaSize) {
            return res.status(400).json({ 
                error: 'Missing required fields: plantType, maintenanceLevel, location, interval, and areaSize are required' 
            });
        }

        // Set defaults for dripper settings if not provided
        const params = {
            plantType,
            maintenanceLevel: parseInt(maintenanceLevel) || 50,
            location: parseFloat(location),
            interval: parseInt(interval),
            areaSize: parseFloat(areaSize),
            dripDistance: parseFloat(dripDistance) || 0.5,
            dripFlow: parseFloat(dripFlow) || 2.3
        };

        const result = irrigationCalculator.calculateIrrigation(params);
        res.status(200).json(result);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

/**
 * Get plant ranges information
 * GET /api/plant_ranges
 */
const getPlantRanges = async (req, res) => {
    try {
        const ranges = irrigationCalculator.getPlantRanges();
        res.status(200).json(ranges);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    calculateIrrigation,
    getPlantRanges
};
