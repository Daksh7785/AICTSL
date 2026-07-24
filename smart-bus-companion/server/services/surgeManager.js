// Simple in-memory config for Phase 11 Surge Mode
let surgeConfig = {
  isActive: false,
  message: 'Navratri Special: Additional buses are running on all major routes!',
  multiplier: 1.5 // 50% more buses
};

function getSurgeConfig() {
  return surgeConfig;
}

function updateSurgeConfig(newConfig) {
  surgeConfig = { ...surgeConfig, ...newConfig };
  return surgeConfig;
}

module.exports = { getSurgeConfig, updateSurgeConfig };
