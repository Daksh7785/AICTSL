const mongoose = require('mongoose');
const Route = require('../models/Route');
const Bus = require('../models/Bus');
const Stop = require('../models/Stop');
const ArrivalLog = require('../models/ArrivalLog');
const logger = require('../utils/logger');

/**
 * ARCHITECTURE NOTE:
 * This simulator generates simulated GPS coordinates by interpolating between route stops.
 * To swap this with a REAL GPS feed in the future:
 * 1. Remove the setInterval loop and interpolation logic below.
 * 2. Connect to the real GPS message broker (e.g., MQTT, Kafka, or a vendor API webhook).
 * 3. On receiving a real GPS update, format it and call io.emit('busPositionUpdate', ...)
 * 4. Update the Bus document in MongoDB with the new location.
 * The Socket.io emission and API contract will NOT need to change.
 */

async function startBusSimulator(io) {
  // We'll keep an in-memory state of active buses for simulation
  const activeBuses = new Map();

  try {
    // 1. Fetch all routes and populate their stops to get coordinates
    const routes = await Route.find({ deletedAt: null }).populate('stops.stopId');
    if (!routes || routes.length === 0) {
      logger.info('No routes found for simulation. Waiting...');
      return;
    }

    // 2. Fetch or create at least one bus for each route
    for (const route of routes) {
      if (route.stops.length < 2) continue; // Need at least 2 stops

      let bus = await Bus.findOne({ routeId: route._id });
      if (!bus) {
        bus = await Bus.create({
          busNumber: `MP09-${Math.floor(1000 + Math.random() * 9000)}`,
          routeId: route._id,
          currentPosition: {
            type: 'Point',
            coordinates: route.stops[0].stopId.location.coordinates
          },
          status: 'running'
        });
      }

      activeBuses.set(bus._id.toString(), {
        bus,
        route,
        currentStopIndex: 0,
        direction: 1, // 1 for forward, -1 for backward
        progress: 0, // 0 to 1 between current stop and next stop
        delayMinutes: Math.floor(Math.random() * 10) - 2 // random delay between -2 and 7 minutes
      });
    }

    // 3. Start the simulation loop (updates every 5 seconds)
    setInterval(() => {
      simulateMovement(activeBuses, io);
    }, 5000);

    logger.info(`Started bus simulation for ${activeBuses.size} buses.`);
  } catch (error) {
    logger.error(error, 'Error starting bus simulator');
  }
}

function simulateMovement(activeBuses, io) {
  // Speed roughly 20 km/h in city traffic, scaled for a 5 second tick
  // We'll just step the progress by a fixed amount for demo purposes
  const STEP = 0.1; 
  const bulkOperations = [];

  activeBuses.forEach(async (state, busId) => {
    const { bus, route, delayMinutes } = state;
    let { currentStopIndex, direction, progress } = state;

    progress += STEP;

    if (progress >= 1) {
      // Reached the next stop
      progress = 0;
      currentStopIndex += direction;

      // Reverse direction at ends
      if (currentStopIndex >= route.stops.length - 1) {
        currentStopIndex = route.stops.length - 1;
        direction = -1;
      } else if (currentStopIndex <= 0) {
        currentStopIndex = 0;
        direction = 1;
      }

      // Phase 9: Log arrival for ETA prediction
      try {
        const stopId = route.stops[currentStopIndex].stopId._id;
        const actualTime = new Date();
        const scheduledTime = new Date(actualTime.getTime() - (delayMinutes * 60000));
        const dayOfWeek = actualTime.getDay();
        const hourOfDay = actualTime.getHours();

        await ArrivalLog.create({
          busId: bus._id,
          routeId: route._id,
          stopId: stopId,
          scheduledTime,
          actualTime,
          dayOfWeek,
          hourOfDay
        });
      } catch (err) {
        logger.error(err, 'Error logging arrival');
      }
    }

// Interpolate position between currentStop and nextStop
    const currentStop = route.stops[currentStopIndex].stopId;
    const nextStopIndex = currentStopIndex + direction;
    
    // Safety check just in case
    if (nextStopIndex >= 0 && nextStopIndex < route.stops.length) {
       const nextStop = route.stops[nextStopIndex].stopId;
       
       const lon1 = currentStop.location.coordinates[0];
       const lat1 = currentStop.location.coordinates[1];
       const lon2 = nextStop.location.coordinates[0];
       const lat2 = nextStop.location.coordinates[1];

       const currentLon = lon1 + (lon2 - lon1) * progress;
       const currentLat = lat1 + (lat2 - lat1) * progress;

       bus.currentPosition.coordinates = [currentLon, currentLat];
       bus.lastUpdated = new Date();

       // We will bulk write all buses later in this function
       bulkOperations.push({
         updateOne: {
           filter: { _id: bus._id },
           update: { $set: { currentPosition: bus.currentPosition, lastUpdated: bus.lastUpdated } }
         }
       });

       // Emit Socket.io event to the specific route room
       io.to(route._id.toString()).emit('busPositionUpdate', {
         busId: bus._id,
         routeId: route._id,
         position: [currentLat, currentLon],
         status: bus.status
       });
    }

    // Save updated state back
    activeBuses.set(busId, { ...state, currentStopIndex, direction, progress });
  });
  
  if (bulkOperations.length > 0) {
    Bus.bulkWrite(bulkOperations).catch(err => {
      logger.error(err, 'Error bulk updating bus positions');
    });
  }
}

module.exports = { startBusSimulator };
