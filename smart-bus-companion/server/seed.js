const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Stop = require('./models/Stop');
const Route = require('./models/Route');
const Bus = require('./models/Bus');
const Complaint = require('./models/Complaint');
const ServiceAlert = require('./models/ServiceAlert');
const User = require('./models/User');

dotenv.config();

const stopsData = [
  { name: 'Rajwada', location: { type: 'Point', coordinates: [75.8546, 22.7183] } },
  { name: 'Indore Junction Railway Station', location: { type: 'Point', coordinates: [75.8677, 22.7177] } },
  { name: 'Vijay Nagar', location: { type: 'Point', coordinates: [75.8953, 22.7533] } },
  { name: 'Palasia', location: { type: 'Point', coordinates: [75.8821, 22.7231] } },
  { name: 'Bhawarkuan', location: { type: 'Point', coordinates: [75.8682, 22.6888] } },
  { name: 'Rajendra Nagar', location: { type: 'Point', coordinates: [75.8184, 22.6738] } },
  { name: 'MR-10', location: { type: 'Point', coordinates: [75.8833, 22.7667] } },
  { name: 'Sarwate Bus Stand', location: { type: 'Point', coordinates: [75.8653, 22.7153] } }
];

const seedDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is missing in .env");
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected for seeding...');

    // Clear existing data
    await Stop.deleteMany({});
    await Route.deleteMany({});
    await Bus.deleteMany({});
    await Complaint.deleteMany({});
    await ServiceAlert.deleteMany({});
    await User.deleteMany({});
    console.log('Cleared existing data.');

    // Insert Stops
    const insertedStops = await Stop.insertMany(stopsData);
    console.log('Inserted stops.');

    const getStopId = (name) => insertedStops.find(s => s.name === name)._id;

    // Define Routes
    const routesData = [
      {
        routeNumber: '11',
        name: 'Rajwada to Vijay Nagar',
        baseFare: 5,
        farePerKm: 1.5,
        firstBusTime: '06:00',
        lastBusTime: '22:00',
        frequencyMinutes: 15,
        isWheelchairAccessible: true,
        stops: [
          { stopId: getStopId('Rajwada'), order: 1, distanceFromStartKm: 0 },
          { stopId: getStopId('Palasia'), order: 2, distanceFromStartKm: 3 },
          { stopId: getStopId('Vijay Nagar'), order: 3, distanceFromStartKm: 8 }
        ],
        colorHex: '#10315B'
      },
      {
        routeNumber: '15',
        name: 'Indore Junction to Bhawarkuan',
        baseFare: 5,
        farePerKm: 1.5,
        firstBusTime: '06:30',
        lastBusTime: '21:30',
        frequencyMinutes: 20,
        isWheelchairAccessible: false,
        stops: [
          { stopId: getStopId('Indore Junction Railway Station'), order: 1, distanceFromStartKm: 0 },
          { stopId: getStopId('Sarwate Bus Stand'), order: 2, distanceFromStartKm: 0.5 },
          { stopId: getStopId('Bhawarkuan'), order: 3, distanceFromStartKm: 4.5 }
        ],
        colorHex: '#FFB100'
      },
      {
        routeNumber: '7',
        name: 'Rajendra Nagar to Palasia',
        baseFare: 5,
        farePerKm: 1.5,
        firstBusTime: '06:00',
        lastBusTime: '22:00',
        frequencyMinutes: 10,
        isWheelchairAccessible: true,
        stops: [
          { stopId: getStopId('Rajendra Nagar'), order: 1, distanceFromStartKm: 0 },
          { stopId: getStopId('Bhawarkuan'), order: 2, distanceFromStartKm: 5 },
          { stopId: getStopId('Palasia'), order: 3, distanceFromStartKm: 10 }
        ],
        colorHex: '#C6376D'
      },
      {
        routeNumber: '3',
        name: 'Sarwate to MR-10',
        baseFare: 5,
        farePerKm: 1.5,
        firstBusTime: '07:00',
        lastBusTime: '21:00',
        frequencyMinutes: 30,
        isWheelchairAccessible: false,
        stops: [
          { stopId: getStopId('Sarwate Bus Stand'), order: 1, distanceFromStartKm: 0 },
          { stopId: getStopId('Palasia'), order: 2, distanceFromStartKm: 3 },
          { stopId: getStopId('Vijay Nagar'), order: 3, distanceFromStartKm: 8 },
          { stopId: getStopId('MR-10'), order: 4, distanceFromStartKm: 12 }
        ],
        colorHex: '#2E8B57'
      },
      {
        routeNumber: '5',
        name: 'Vijay Nagar to Rajendra Nagar',
        baseFare: 5,
        farePerKm: 1.5,
        firstBusTime: '06:15',
        lastBusTime: '21:45',
        frequencyMinutes: 25,
        isWheelchairAccessible: true,
        stops: [
          { stopId: getStopId('Vijay Nagar'), order: 1, distanceFromStartKm: 0 },
          { stopId: getStopId('Palasia'), order: 2, distanceFromStartKm: 5 },
          { stopId: getStopId('Bhawarkuan'), order: 3, distanceFromStartKm: 10 },
          { stopId: getStopId('Rajendra Nagar'), order: 4, distanceFromStartKm: 15 }
        ],
        colorHex: '#C6376D'
      },
      {
        routeNumber: '9',
        name: 'MR-10 to Indore Junction',
        baseFare: 5,
        farePerKm: 1.5,
        firstBusTime: '06:00',
        lastBusTime: '22:30',
        frequencyMinutes: 12,
        isWheelchairAccessible: false,
        stops: [
          { stopId: getStopId('MR-10'), order: 1, distanceFromStartKm: 0 },
          { stopId: getStopId('Vijay Nagar'), order: 2, distanceFromStartKm: 4 },
          { stopId: getStopId('Palasia'), order: 3, distanceFromStartKm: 9 },
          { stopId: getStopId('Indore Junction Railway Station'), order: 4, distanceFromStartKm: 12 }
        ],
        colorHex: '#2E8B57'
      },
      {
        routeNumber: '12',
        name: 'Bhawarkuan to Rajwada',
        baseFare: 5,
        farePerKm: 1.5,
        firstBusTime: '06:45',
        lastBusTime: '21:15',
        frequencyMinutes: 20,
        isWheelchairAccessible: true,
        stops: [
          { stopId: getStopId('Bhawarkuan'), order: 1, distanceFromStartKm: 0 },
          { stopId: getStopId('Sarwate Bus Stand'), order: 2, distanceFromStartKm: 4 },
          { stopId: getStopId('Rajwada'), order: 3, distanceFromStartKm: 5 }
        ],
        colorHex: '#10315B'
      },
      {
        routeNumber: '21',
        name: 'Rajwada to MR-10',
        baseFare: 5,
        farePerKm: 1.5,
        firstBusTime: '07:30',
        lastBusTime: '20:30',
        frequencyMinutes: 40,
        isWheelchairAccessible: false,
        stops: [
          { stopId: getStopId('Rajwada'), order: 1, distanceFromStartKm: 0 },
          { stopId: getStopId('Indore Junction Railway Station'), order: 2, distanceFromStartKm: 1.5 },
          { stopId: getStopId('Palasia'), order: 3, distanceFromStartKm: 4 },
          { stopId: getStopId('MR-10'), order: 4, distanceFromStartKm: 11 }
        ],
        colorHex: '#FFB100'
      }
    ];

    const insertedRoutes = await Route.insertMany(routesData);
    console.log('Inserted routes.');

    // Create an Admin user
    const adminUser = new User({
      name: 'Admin User',
      email: 'admin@smartbus.com',
      passwordHash: 'hashed_password_placeholder', // To be properly hashed later
      role: 'admin'
    });
    await adminUser.save();
    console.log('Inserted admin user.');

    // Phase 9: Seed historical ArrivalLogs
    const ArrivalLog = require('./models/ArrivalLog');
    await ArrivalLog.deleteMany({});
    
    const logsToInsert = [];
    const now = new Date();
    
    // For every route, generate logs for the last 5 days
    for (const route of insertedRoutes) {
      const bus = await Bus.findOne({ routeId: route._id });
      if (!bus) continue;

      for (let daysAgo = 0; daysAgo < 5; daysAgo++) {
        for (let hour = 6; hour <= 22; hour++) {
          for (const stop of route.stops) {
            // Generate a random delay between -2 and +8 minutes
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
    console.log(`Inserted ${logsToInsert.length} historical arrival logs.`);

    console.log('Seeding complete!');
    process.exit(0);

  } catch (error) {
    console.error('Error seeding DB:', error);
    process.exit(1);
  }
};

seedDB();
