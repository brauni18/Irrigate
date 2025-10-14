# Irrigation Calculator Backend Migration

## Overview
The irrigation calculation logic has been moved from the frontend (`public/line-controller.js`) to the backend to improve code organization, maintainability, and enable reusability across different parts of the application.

## New Backend Components

### 1. Service Layer: `services/irrigation_calculator.js`
Contains the core calculation logic:
- **`calculateIrrigation(params)`** - Calculates irrigation requirements based on plant type, maintenance level, location, and other parameters
- **`calculatePlantCoefficient(plantType, maintenanceLevel)`** - Calculates the plant coefficient based on maintenance level
- **`getPlantRanges()`** - Returns plant coefficient ranges for all plant types
- **`PLANT_RANGES`** - Constant containing plant type definitions with min/max coefficients

### 2. Controller Layer: `controllers/api_irrigation_calculator.js`
Handles HTTP requests:
- **POST `/api/calculate_irrigation`** - Calculate irrigation requirements
- **GET `/api/calculate_irrigation/plant_ranges`** - Get plant coefficient ranges

### 3. Router Layer: `routers/api_irrigation_calculator.js`
Defines API routes for the irrigation calculator endpoints.

### 4. App Integration: `app.js`
The new router is registered in the main application file.

## API Endpoints

### Calculate Irrigation
**POST** `/api/calculate_irrigation`

**Request Body:**
```json
{
  "plantType": "roses",
  "maintenanceLevel": 50,
  "location": 6.55,
  "interval": 3,
  "areaSize": 100,
  "dripDistance": 0.5,
  "dripFlow": 2.3
}
```

**Response:**
```json
{
  "duration": 74,
  "waterAmount": 1128.39,
  "frequency": 3,
  "totalPlants": 400,
  "pipeLength": 200,
  "totalFlowRate": 920,
  "waterPerPlant": 2.82,
  "plantCoefficient": 0.574
}
```

### Get Plant Ranges
**GET** `/api/calculate_irrigation/plant_ranges`

**Response:**
```json
{
  "trees": {
    "name": "Trees",
    "emoji": "🌳",
    "minCoeff": 0.3,
    "maxCoeff": 0.4,
    "description": "Deep-rooted, drought tolerant once established"
  },
  "roses": {
    "name": "Roses",
    "emoji": "🌹",
    "minCoeff": 0.5,
    "maxCoeff": 0.65,
    "description": "Require consistent moisture and nutrients"
  },
  ...
}
```

## Frontend Changes

### `public/line-controller.js`
- **`calculateIrrigation()`** method now calls the backend API instead of performing calculations locally
- Added async/await for API calls
- Added error handling for API failures
- The plant ranges data is still kept in the frontend for UI display purposes (to avoid additional API calls for real-time coefficient display)

## Benefits

1. **Separation of Concerns**: Business logic is now in the backend where it belongs
2. **Reusability**: The calculation service can be used by other parts of the application
3. **Maintainability**: Easier to update calculation logic in one place
4. **Testability**: Backend logic can be tested independently
5. **Security**: Calculation logic is not exposed in client-side code
6. **Consistency**: All calculations go through the same backend logic

## Calculation Formula

The irrigation calculation follows these steps:

1. Calculate plant coefficient based on plant type and maintenance level:
   ```
   coefficient = minCoeff + (normalizedLevel * (maxCoeff - minCoeff))
   ```

2. Calculate water needs:
   ```
   waterNeed = plantCoefficient * location (L/m²/day)
   totalWaterPerInterval = waterNeed * areaSize * interval
   ```

3. Calculate drippers and duration:
   ```
   drippersPerM² = 1 / (dripDistance²)
   totalDrippers = ceil(drippersPerM² * areaSize)
   totalFlowRate = totalDrippers * dripFlow (L/h)
   duration = (totalWaterPerInterval / totalFlowRate) * 60 (minutes)
   ```

4. Calculate pipe length:
   ```
   pipeLength = totalDrippers * dripDistance (meters)
   ```

## Testing

The service has been tested with various inputs and edge cases:
- Valid calculations with different plant types
- Missing required fields
- Invalid plant types
- Edge cases with extreme values

All tests pass successfully.
