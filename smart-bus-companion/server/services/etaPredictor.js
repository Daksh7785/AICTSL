const ArrivalLog = require('../models/ArrivalLog');

/**
 * ARCHITECTURE NOTE:
 * This is a lightweight prediction service based on historical arrival logs.
 * For a given route, stop, and time slot, it calculates a weighted average of recent delays.
 * 
 * If we wanted to drop in a real Machine Learning model (e.g. a Python microservice 
 * or a pre-trained regression model) later on, we would only need to change the logic 
 * inside this function to call that model instead of querying the DB directly. 
 * The API contract (inputs: routeId, stopId, day, hour; output: predictedDelayMs) 
 * would remain exactly the same.
 */
async function predictDelay(routeId, stopId, dayOfWeek, hourOfDay) {
  // Query the last N logs for this route/stop/day/hour.
  // We can look at hour +/- 1 for a broader window, but we'll stick to the specific hour for simplicity here.
  const logs = await ArrivalLog.find({
    routeId,
    stopId,
    dayOfWeek,
    // Provide a small window of hours to get more data
    hourOfDay: { $gte: Math.max(0, hourOfDay - 1), $lte: Math.min(23, hourOfDay + 1) }
  }).sort({ createdAt: -1 }).limit(10); // get last 10 samples

  if (logs.length === 0) {
    return { predictedDelayMs: 0, confidence: 'low', sampleSize: 0 };
  }

  let totalWeight = 0;
  let weightedDelaySum = 0;

  // Weight recent entries higher
  logs.forEach((log, index) => {
    // Weight decreases as index increases (older records)
    const weight = 10 - index; 
    const delayMs = log.actualTime.getTime() - log.scheduledTime.getTime();
    
    weightedDelaySum += (delayMs * weight);
    totalWeight += weight;
  });

  const avgDelayMs = weightedDelaySum / totalWeight;

  let confidence = 'low';
  if (logs.length > 5) confidence = 'medium';
  if (logs.length >= 10) confidence = 'high';

  return { predictedDelayMs: avgDelayMs, confidence, sampleSize: logs.length };
}

module.exports = { predictDelay };

// style updates
