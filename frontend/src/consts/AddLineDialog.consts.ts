export const ADD_LINE_REQUIRED_NAME_MESSAGE = 'Line name is required';
export const ADD_LINE_DIALOG_TITLE = 'Add Irrigation Line';
export const ADD_LINE_PLACEHOLDER = 'e.g. Rose Garden';

export const PLANT_TYPE_OPTIONS = [
  { value: 'trees',       label: '🌳 Trees',              description: 'Deep-rooted, drought tolerant once established', measurementMode: 'count', areaPerUnitM2: 4, recommendedIntervalDays: 7 },
  { value: 'roses',       label: '🌹 Roses',              description: 'Require consistent moisture and nutrients', measurementMode: 'area' },
  { value: 'grass',       label: '🌱 Grass',              description: 'Water needs vary greatly by maintenance level', measurementMode: 'area' },
  { value: 'bush',        label: '🌿 Bush',               description: 'Moderate water needs, adaptable', measurementMode: 'area' },
  { value: 'small-bush',  label: '🪴 Small Bush',         description: 'Higher water needs due to smaller root system', measurementMode: 'area' },
  { value: 'water-wise',  label: '🌵 Water-wise Plants',  description: 'Drought-adapted, minimal water requirements', measurementMode: 'area' },
];

export const LOCATION_OPTIONS = [
  { value: 'north', label: 'North' },
  { value: 'golan_heights', label: 'Golan Heights & Ahola' },
  { value: 'emek_bit_shean', label: 'Emek Bit Shean' },
  { value: 'center', label: 'Center' },
  { value: 'south', label: 'South' },
  { value: 'negev', label: 'Negev' },
  { value: 'eilat_dead_sea', label: 'Eilat & Dead Sea' },
];

export const DRIP_DISTANCE_OPTIONS = [
  { value: '0.3', label: '0.3 m' },
  { value: '0.5', label: '0.5 m' },
  { value: '1.0', label: '1.0 m' },
 
 
];

export const DRIP_FLOW_OPTIONS = [
  { value: '1.6', label: '1.6 L/h' },
  { value: '2.3', label: '2.3 L/h' },
  { value: '3.5', label: '3.5 L/h' },
];
