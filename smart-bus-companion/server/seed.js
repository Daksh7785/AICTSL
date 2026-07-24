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
  { name: 'Niranjanpur Circle', location: { type: 'Point', coordinates: [75.897, 22.775] } },
  { name: 'Aranya Nagar', location: { type: 'Point', coordinates: [75.898, 22.768] } },
  { name: 'IDA Park', location: { type: 'Point', coordinates: [75.896, 22.760] } },
  { name: 'Vijay Nagar Square', location: { type: 'Point', coordinates: [75.8953, 22.7533] } },
  { name: 'Bhamori', location: { type: 'Point', coordinates: [75.893, 22.748] } },
  { name: 'Patni Pura', location: { type: 'Point', coordinates: [75.888, 22.740] } },
  { name: 'Malwa Mill Square', location: { type: 'Point', coordinates: [75.880, 22.730] } },
  { name: 'Rajkumar Bridge', location: { type: 'Point', coordinates: [75.875, 22.722] } },
  { name: 'Juni Indore', location: { type: 'Point', coordinates: [75.870, 22.715] } },
  { name: 'Collectorate Office', location: { type: 'Point', coordinates: [75.865, 22.710] } },
  { name: 'Mhow Naka', location: { type: 'Point', coordinates: [75.860, 22.700] } },
  { name: 'Dusshera Maidan', location: { type: 'Point', coordinates: [75.855, 22.690] } },
  { name: 'Annapurna Temple', location: { type: 'Point', coordinates: [75.850, 22.680] } },
  { name: 'Ring Road', location: { type: 'Point', coordinates: [75.845, 22.675] } },
  { name: 'Rajendra Nagar', location: { type: 'Point', coordinates: [75.8184, 22.6738] } },
  { name: 'Reti Mandi', location: { type: 'Point', coordinates: [75.830, 22.665] } },
  { name: 'IPS Academy', location: { type: 'Point', coordinates: [75.840, 22.650] } },
  { name: 'Shramik Colony', location: { type: 'Point', coordinates: [75.850, 22.645] } },
  { name: 'Rajiv Gandhi Square', location: { type: 'Point', coordinates: [75.860, 22.640] } },
  { name: 'Rajwada', location: { type: 'Point', coordinates: [75.8546, 22.7183] } },
  { name: 'Indore Junction Railway Station', location: { type: 'Point', coordinates: [75.8677, 22.7177] } },
  { name: 'Vijay Nagar', location: { type: 'Point', coordinates: [75.8953, 22.7533] } },
  { name: 'Palasia', location: { type: 'Point', coordinates: [75.8821, 22.7231] } },
  { name: 'Bhawarkuan', location: { type: 'Point', coordinates: [75.8682, 22.6888] } },
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
        routeNumber: 'iBus',
        name: 'Niranjanpur to Rajiv Gandhi Square (BRTS)',
        baseFare: 10,
        farePerKm: 1.0,
        firstBusTime: '07:00',
        lastBusTime: '23:00',
        frequencyMinutes: 5,
        isWheelchairAccessible: true,
        stops: [
          { stopId: getStopId('Niranjanpur Circle'), order: 1, distanceFromStartKm: 0 },
          { stopId: getStopId('Aranya Nagar'), order: 2, distanceFromStartKm: 0.8 },
          { stopId: getStopId('IDA Park'), order: 3, distanceFromStartKm: 1.5 },
          { stopId: getStopId('Vijay Nagar Square'), order: 4, distanceFromStartKm: 2.2 },
          { stopId: getStopId('Bhamori'), order: 5, distanceFromStartKm: 3.0 },
          { stopId: getStopId('Patni Pura'), order: 6, distanceFromStartKm: 4.0 },
          { stopId: getStopId('Malwa Mill Square'), order: 7, distanceFromStartKm: 5.0 },
          { stopId: getStopId('Rajkumar Bridge'), order: 8, distanceFromStartKm: 6.0 },
          { stopId: getStopId('Juni Indore'), order: 9, distanceFromStartKm: 7.0 },
          { stopId: getStopId('Collectorate Office'), order: 10, distanceFromStartKm: 7.5 },
          { stopId: getStopId('Mhow Naka'), order: 11, distanceFromStartKm: 8.5 },
          { stopId: getStopId('Dusshera Maidan'), order: 12, distanceFromStartKm: 9.5 },
          { stopId: getStopId('Annapurna Temple'), order: 13, distanceFromStartKm: 10.5 },
          { stopId: getStopId('Ring Road'), order: 14, distanceFromStartKm: 11.2 },
          { stopId: getStopId('Rajendra Nagar'), order: 15, distanceFromStartKm: 12.0 },
          { stopId: getStopId('Reti Mandi'), order: 16, distanceFromStartKm: 13.0 },
          { stopId: getStopId('IPS Academy'), order: 17, distanceFromStartKm: 14.5 },
          { stopId: getStopId('Shramik Colony'), order: 18, distanceFromStartKm: 15.5 },
          { stopId: getStopId('Rajiv Gandhi Square'), order: 19, distanceFromStartKm: 16.5 }
        ],
        colorHex: '#0055A4'
      },
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

    // Seed Buses
    const busesData = insertedRoutes.map((route, i) => ({
      busNumber: `MP09-BS-${1000 + i}`,
      routeId: route._id,
      frequencyMinutes: route.frequencyMinutes,
      isWheelchairAccessible: route.isWheelchairAccessible,
      currentPosition: { type: 'Point', coordinates: [75.897, 22.775] },
      status: 'running'
    }));
    await Bus.insertMany(busesData);
    console.log('Inserted buses.');

    // Generate Complaints
    const complaintsToInsert = [];
    const complaintCategories = ['delay', 'cleanliness', 'staff_behavior', 'app_issue', 'other'];
    const complaintStatuses = ['open', 'in_progress', 'resolved', 'closed'];
    const now = new Date();

    for (let i = 0; i < 300; i++) {
      const isIBus = Math.random() < 0.6; // 60% of complaints are for iBus
      const route = isIBus ? insertedRoutes[0] : insertedRoutes[Math.floor(Math.random() * (insertedRoutes.length - 1)) + 1];
      
      const referenceId = `CMP-${Math.floor(1000 + Math.random() * 9000)}-${i}`;
      const status = complaintStatuses[Math.floor(Math.random() * complaintStatuses.length)];
      
      complaintsToInsert.push({
        routeId: route._id,
        category: complaintCategories[Math.floor(Math.random() * complaintCategories.length)],
        description: 'Auto-generated complaint for testing',
        rating: Math.floor(Math.random() * 5) + 1,
        referenceId,
        status,
        statusHistory: [{ status: 'open', changedAt: new Date(now.getTime() - 86400000) }]
      });
    }
    await Complaint.insertMany(complaintsToInsert);
    console.log(`Inserted ${complaintsToInsert.length} complaints.`);

    // Phase 9: Seed historical ArrivalLogs
    const ArrivalLog = require('./models/ArrivalLog');
    await ArrivalLog.deleteMany({});
    
    const logsToInsert = [];
    
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
