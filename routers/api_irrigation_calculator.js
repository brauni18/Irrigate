const express = require('express');
const router = express.Router();
const irrigationCalculatorController = require('../controllers/api_irrigation_calculator');

// POST /api/calculate_irrigation - Calculate irrigation requirements
router.post('/', irrigationCalculatorController.calculateIrrigation);

// GET /api/plant_ranges - Get plant coefficient ranges
router.get('/plant_ranges', irrigationCalculatorController.getPlantRanges);

module.exports = router;
