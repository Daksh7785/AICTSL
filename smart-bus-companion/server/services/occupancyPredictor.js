/**
 * Occupancy Forecasting Service
 * Predicts whether a bus is likely to be 'low', 'medium', or 'high' occupancy
 * based on the route, day of week, hour of day, and current weather/events (simulated).
 */
async function predictOccupancy(routeId, dayOfWeek, hourOfDay) {
  // In a real system, this would query historical ticketing data, live IoT passenger counts,
  // or a machine learning model. For now, we use a heuristic model.

  let baseScore = 0.5; // medium

  // Morning rush hour (8 AM - 11 AM)
  if (hourOfDay >= 8 && hourOfDay <= 11) {
    baseScore += 0.3;
  }
  
  // Evening rush hour (5 PM - 8 PM)
  if (hourOfDay >= 17 && hourOfDay <= 20) {
    baseScore += 0.4;
  }

  // Weekends have lower baseline but can spike differently
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    baseScore -= 0.2;
    // Weekend evenings
    if (hourOfDay >= 17 && hourOfDay <= 21) {
      baseScore += 0.3;
    }
  }

  // Cap score between 0 and 1
  baseScore = Math.max(0, Math.min(1, baseScore));

  let occupancyStatus = 'low';
  if (baseScore > 0.4) occupancyStatus = 'medium';
  if (baseScore > 0.75) occupancyStatus = 'high';

  return {
    score: baseScore,
    status: occupancyStatus
  };
}

module.exports = { predictOccupancy };
