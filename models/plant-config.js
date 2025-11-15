const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const plantRanges = new Schema({
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
});

module.exports = mongoose.model("PlantRange", plantRanges);