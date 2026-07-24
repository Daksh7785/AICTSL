const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Stop = require('../models/Stop');
const Route = require('../models/Route');
const Bus = require('../models/Bus');
const ArrivalLog = require('../models/ArrivalLog');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const scaleDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is missing in .env");
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected for scaling data...');

    // We will leave existing data alone and just append more stops and routes.
    
    // Generate 150 dummy stops around Indore (approx 22.7196, 75.8577)
    const newStops = [];
    for (let i = 1; i <= 150; i++) {
      // Random jitter for coordinates
      const latOffset = (Math.random() - 0.5) * 0.1; // ~5km range
      const lngOffset = (Math.random() - 0.5) * 0.1;
      
      newStops.push({
        name: `Generated Stop ${i}`,
        location: {
          type: 'Point',
          coordinates: [75.8577 + lngOffset, 22.7196 + latOffset]
        }
      });
    }

    const insertedStops = await Stop.insertMany(newStops);
    console.log(`Inserted ${insertedStops.length} new stops.`);

    // Generate 35 new routes
    const newRoutes = [];
    for (let i = 1; i <= 35; i++) {
      // Pick 5 to 15 random stops for this route
      const stopCount = Math.floor(Math.random() * 11) + 5;
      const routeStops = [];
      
      // We shuffle and pick
      const shuffledStops = [...insertedStops].sort(() => 0.5 - Math.random());
      let dist = 0;
      
      for (let j = 0; j < stopCount; j++) {
        routeStops.push({
          stopId: shuffledStops[j]._id,
          order: j + 1,
          distanceFromStartKm: dist
        });
        dist += Math.floor(Math.random() * 3) + 1; // 1-3 km between stops
      }

      newRoutes.push({
        routeNumber: `R${i + 100}`,
        name: `Generated Route ${i}`,
        baseFare: 5,
        farePerKm: 1.5,
        firstBusTime: '06:00',
        lastBusTime: '22:00',
        frequencyMinutes: Math.floor(Math.random() * 20) + 10, // 10-30 mins
        isWheelchairAccessible: Math.random() > 0.5,
        stops: routeStops,
        colorHex: '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')
      });
    }

    const insertedRoutes = await Route.insertMany(newRoutes);
    console.log(`Inserted ${insertedRoutes.length} new routes.`);

    // Generate Buses for new routes
    const newBuses = [];
    for (const route of insertedRoutes) {
      // 2 buses per route
      for (let b = 1; b <= 2; b++) {
        newBuses.push({
          busNumber: `MP09GN${Math.floor(Math.random() * 9000) + 1000}`,
          routeId: route._id,
          currentLocation: route.stops[0].stopId,
          capacity: 40,
          occupancy: Math.floor(Math.random() * 41),
          // routeNumber and frequencyMinutes will be populated by pre-save hooks
        });
      }
    }
    
    // insertMany bypasses hooks, but we are just scaling the DB for volume. Let's create manually to trigger hooks
    let busCount = 0;
    for (const bData of newBuses) {
      await Bus.create(bData);
      busCount++;
    }
    console.log(`Inserted ${busCount} new buses.`);
    
    // Generate Arrival Logs for these buses to simulate heavy predictive data
    const logsToInsert = [];
    const now = new Date();
    
    for (const route of insertedRoutes) {
      const bus = await Bus.findOne({ routeId: route._id });
      if (!bus) continue;

      // 3 days of logs, 6am to 10pm
      for (let daysAgo = 0; daysAgo < 3; daysAgo++) {
        for (let hour = 6; hour <= 22; hour++) {
          for (const stop of route.stops) {
            const delayMinutes = Math.floor(Math.random() * 11) - 2; 
            const scheduledTime = new Date(now);
            scheduledTime.setDate(now.getDate() - daysAgo);
            scheduledTime.setHours(hour, Math.floor(Math.random() * 60), 0, 0);

            const actualTime = new Date(scheduledTime.getTime() + delayMinutes * 60000);

            logsToInsert.push({
              busId: bus._id,
              routeId: route._id,
              stopId: stop.stopId,
              scheduledTime,
              actualTime,
              dayOfWeek: scheduledTime.getDay(),
              hourOfDay: scheduledTime.getHours(),
              createdAt: actualTime
            });
          }
        }
      }
    }

    await ArrivalLog.insertMany(logsToInsert);
    console.log(`Inserted ${logsToInsert.length} scale arrival logs.`);

    console.log('Scaling complete!');
    process.exit(0);

  } catch (error) {
    console.error('Error scaling DB:', error);
    process.exit(1);
  }
};

scaleDB();
