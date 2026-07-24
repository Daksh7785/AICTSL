const express = require('express');
const router = express.Router();
const Stop = require('../models/Stop');
const Route = require('../models/Route');
const Complaint = require('../models/Complaint');
const ServiceAlert = require('../models/ServiceAlert');
const { predictDelay } = require('../services/etaPredictor');
const { predictOccupancy } = require('../services/occupancyPredictor');
const NodeCache = require('node-cache');
const rateLimit = require('express-rate-limit');
const { auth, isAdmin } = require('../middleware/auth');

// Initialize cache: stops and routes are fairly static, cache for 1 hour
const apiCache = new NodeCache({ stdTTL: 3600 });

// Rate limiters
const generalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests, please try again later.' }
});

const searchLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 20, // limit each IP to 20 requests per windowMs for expensive queries
  message: { error: 'Too many search requests, please try again later.' }
});

router.use(generalLimiter);

const { getSurgeConfig } = require('../services/surgeManager');

router.get('/surge', (req, res) => {
  res.json(getSurgeConfig());
});

/**
 * @swagger
 * /api/stops:
 *   get:
 *     summary: Retrieve a list of all active stops
 *     tags: [Stops]
 *     responses:
 *       200:
 *         description: A list of stops.
 */
// 1. GET /api/stops
router.get('/stops', async (req, res) => {
  try {
    const cachedStops = apiCache.get('stops');
    if (cachedStops) return res.json(cachedStops);

    const stops = await Stop.find({ deletedAt: null }).select('_id name location city').sort({ name: 1 }).lean();
    apiCache.set('stops', stops);
    res.json(stops);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. GET /api/stops/nearby?lat=&lng=&radiusMeters=
router.get('/stops/nearby', async (req, res) => {
  try {
    const { lat, lng, radiusMeters = 1000 } = req.query;
    if (!lat || !lng) return res.status(400).json({ error: 'lat and lng required' });

    const stops = await Stop.find({
      deletedAt: null,
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: parseInt(radiusMeters)
        }
      }
    }).select('_id name location city').lean();
    res.json(stops);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/search:
 *   get:
 *     summary: Search for routes between two stops
 *     tags: [Search]
 *     parameters:
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *         required: true
 *         description: Origin stop ID
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *         required: true
 *         description: Destination stop ID
 *     responses:
 *       200:
 *         description: A list of matching routes.
 *       400:
 *         description: Missing required parameters.
 */
// 3. GET /api/search?from=stopId&to=stopId
router.get('/search', searchLimiter, async (req, res) => {
  try {
    const { from, to } = req.query;
    if (!from || !to) return res.status(400).json({ error: 'from and to stopIds required' });

    // Find routes that contain both stops
    const routes = await Route.find({
      'stops.stopId': { $all: [from, to] },
      deletedAt: null
    })
    .select('_id routeNumber name stops baseFare farePerKm frequencyMinutes isWheelchairAccessible')
    .populate('stops.stopId', '_id location isMetroInterchange') // Only need location for distance estimation if we used it, but distance is pre-calculated
    .lean();

    // Filter and map routes where 'from' comes before 'to'
    const results = routes.map(route => {
      const fromStopIndex = route.stops.findIndex(s => s.stopId._id.toString() === from);
      const toStopIndex = route.stops.findIndex(s => s.stopId._id.toString() === to);

      if (fromStopIndex === -1 || toStopIndex === -1 || fromStopIndex >= toStopIndex) {
        return null;
      }

      const fromStop = route.stops[fromStopIndex];
      const toStop = route.stops[toStopIndex];
      const distance = Math.abs(toStop.distanceFromStartKm - fromStop.distanceFromStartKm);
      const fare = route.baseFare + (distance * route.farePerKm);
      
      // Assume 20km/h average speed in city traffic (20km/60min = 1/3 km per min) -> min = distance / (1/3) = distance * 3
      const estimatedDurationMinutes = Math.ceil(distance * 3) + route.frequencyMinutes;

      return (async () => {
        let predictedDelayMinutes = 0;
        let occupancyStatus = 'low';
        try {
          const now = new Date();
          const prediction = await predictDelay(route._id, fromStop.stopId._id, now.getDay(), now.getHours());
          predictedDelayMinutes = Math.round(prediction.predictedDelayMs / 60000);
          
          const occupancy = await predictOccupancy(route._id, now.getDay(), now.getHours());
          occupancyStatus = occupancy.status;
        } catch (e) {
          // Fallback if prediction fails
          console.error("Prediction error:", e);
        }

        return {
          _id: route._id,
          routeNumber: route.routeNumber,
          name: route.name,
          fare: Math.ceil(fare),
          estimatedDurationMinutes,
          predictedDelayMinutes,
          occupancyStatus,
          numberOfStops: toStopIndex - fromStopIndex,
          isWheelchairAccessible: route.isWheelchairAccessible,
          hasMetroInterchange: route.stops.slice(fromStopIndex, toStopIndex + 1).some(s => s.stopId.isMetroInterchange)
        };
      })();
    }).filter(r => r !== null);

    const resolvedResults = await Promise.all(results);
    res.json(resolvedResults.filter(r => r !== null));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 4. GET /api/routes/:id
router.get('/routes/:id', async (req, res) => {
  try {
    const cacheKey = `route_${req.params.id}`;
    const cachedRoute = apiCache.get(cacheKey);
    if (cachedRoute) return res.json(cachedRoute);

    const route = await Route.findOne({ _id: req.params.id, deletedAt: null })
      .select('-__v')
      .populate('stops.stopId', '_id name location city')
      .lean();
    if (!route) return res.status(404).json({ error: 'Route not found' });
    
    apiCache.set(cacheKey, route);
    res.json(route);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// 5. GET /api/routes/:id/predicted-eta?stopId=
router.get('/routes/:id/predicted-eta', async (req, res) => {
  try {
    const { id } = req.params;
    const { stopId } = req.query;

    if (!stopId) return res.status(400).json({ error: 'stopId is required' });

    const now = new Date();
    // Simulate a scheduled time 5 mins from now if we don't have a real schedule DB
    // In a real app, we'd look up the exact next scheduled run.
    const scheduledTime = new Date(now.getTime() + 5 * 60000); 

    const prediction = await predictDelay(id, stopId, now.getDay(), now.getHours());
    
    const predictedTime = new Date(scheduledTime.getTime() + prediction.predictedDelayMs);

    res.json({
      scheduledTime,
      predictedTime,
      predictedDelayMinutes: Math.round(prediction.predictedDelayMs / 60000),
      confidence: prediction.confidence,
      sampleSize: prediction.sampleSize
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only images and videos are allowed as evidence.'));
    }
  }
});

// POST /api/complaints
router.post('/complaints', upload.single('evidence'), async (req, res) => {
  try {
    const { routeId, category, description, rating } = req.body;
    const referenceId = `CMP-${Math.floor(1000 + Math.random() * 9000)}`;
    const evidenceUrl = req.file ? `/uploads/${req.file.filename}` : undefined;
    
    const complaint = await Complaint.create({
      routeId, category, description, rating, referenceId, evidenceUrl
    });
    res.json({ referenceId, status: complaint.status });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/complaints/track/:referenceId
router.get('/complaints/track/:referenceId', async (req, res) => {
  try {
    const complaint = await Complaint.findOne({ referenceId: req.params.referenceId });
    if (!complaint) return res.status(404).json({ error: 'Complaint not found' });
    res.json({ status: complaint.status, category: complaint.category });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/complaints (Admin)
router.get('/complaints', [auth, isAdmin], async (req, res) => {
  try {
    const filters = {};
    if (req.query.status) filters.status = req.query.status;
    if (req.query.category) filters.category = req.query.category;
    if (req.query.routeId) filters.routeId = req.query.routeId;
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const complaints = await Complaint.find(filters)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
      
    const total = await Complaint.countDocuments(filters);

    res.json({
      complaints,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/complaints/:id (Admin)
router.patch('/complaints/:id', [auth, isAdmin], async (req, res, next) => {
  const mongoose = require('mongoose');
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const complaint = await Complaint.findById(req.params.id).session(session);
    if (!complaint) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ error: 'Complaint not found' });
    }
    
    complaint.status = req.body.status;
    complaint.updatedBy = req.user.id;
    complaint.statusHistory.push({
      status: req.body.status,
      changedBy: req.user.id
    });
    
    await complaint.save({ session });
    await session.commitTransaction();
    session.endSession();
    
    res.json(complaint);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
});

// GET /api/alerts/active
router.get('/alerts/active', async (req, res) => {
  try {
    const alerts = await ServiceAlert.find({ active: true })
      .populate('routeId', 'name routeNumber')
      .sort({ createdAt: -1 })
      .lean();
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/alerts (Admin)
router.post('/alerts', [auth, isAdmin], async (req, res) => {
  try {
    const alertData = { ...req.body, createdBy: req.user.id };
    const alert = await ServiceAlert.create(alertData);
    await alert.populate('routeId', 'name routeNumber');
    
    const io = req.app.get('io');
    if (io) {
      io.emit('newServiceAlert', alert);
    }
    
    res.json(alert);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/alerts/:id (Admin)
router.patch('/alerts/:id', [auth, isAdmin], async (req, res) => {
  try {
    const updateData = { ...req.body, updatedBy: req.user.id };
    const alert = await ServiceAlert.findByIdAndUpdate(req.params.id, updateData, { new: true }).populate('routeId', 'name routeNumber');
    
    const io = req.app.get('io');
    if (io) {
      io.emit('newServiceAlert', alert);
    }
    
    res.json(alert);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/stops/:id (Admin)
router.delete('/stops/:id', [auth, isAdmin], async (req, res) => {
  try {
    const inUse = await Route.findOne({ 'stops.stopId': req.params.id, deletedAt: null });
    if (inUse) {
      return res.status(400).json({ error: `Cannot delete stop: It is used by active route ${inUse.routeNumber}` });
    }
    const stop = await Stop.findById(req.params.id);
    if (!stop) return res.status(404).json({ error: 'Stop not found' });
    stop.deletedAt = new Date();
    await stop.save();
    apiCache.del('stops');
    res.json({ message: 'Stop deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/routes/:id (Admin)
router.delete('/routes/:id', [auth, isAdmin], async (req, res) => {
  try {
    const Bus = require('../models/Bus');
    const inUse = await Bus.findOne({ routeId: req.params.id, status: { $ne: 'out_of_service' } });
    if (inUse) {
      return res.status(400).json({ error: `Cannot delete route: It is assigned to active bus ${inUse.busNumber}` });
    }
    const route = await Route.findById(req.params.id);
    if (!route) return res.status(404).json({ error: 'Route not found' });
    route.deletedAt = new Date();
    await route.save();
    apiCache.del(`route_${req.params.id}`);
    res.json({ message: 'Route deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/gtfs/export
router.get('/gtfs/export', async (req, res) => {
  try {
    const archiver = require('archiver');
    const archive = archiver('zip', { zlib: { level: 9 } });

    res.attachment('gtfs.zip');
    archive.pipe(res);

    // 1. stops.txt
    // stop_id,stop_name,stop_lat,stop_lon
    const stops = await Stop.find({ deletedAt: null }).lean();
    let stopsCsv = 'stop_id,stop_name,stop_lat,stop_lon\n';
    stops.forEach(stop => {
      if (stop.location && stop.location.coordinates) {
        stopsCsv += `${stop._id},"${stop.name}",${stop.location.coordinates[1]},${stop.location.coordinates[0]}\n`;
      }
    });
    archive.append(stopsCsv, { name: 'stops.txt' });

    // 2. routes.txt
    // route_id,route_short_name,route_long_name,route_type
    // route_type: 3 is Bus
    const routes = await Route.find({ deletedAt: null }).lean();
    let routesCsv = 'route_id,route_short_name,route_long_name,route_type\n';
    routes.forEach(route => {
      routesCsv += `${route._id},"${route.routeNumber}","${route.name}",3\n`;
    });
    archive.append(routesCsv, { name: 'routes.txt' });

    await archive.finalize();
  } catch (error) {
    if (!res.headersSent) {
      res.status(500).json({ error: error.message });
    }
  }
});

// POST /api/sms/webhook
router.post('/sms/webhook', express.urlencoded({ extended: false }), async (req, res) => {
  const twilio = require('twilio');
  const MessagingResponse = twilio.twiml.MessagingResponse;
  const twiml = new MessagingResponse();

  try {
    const incomingMessage = req.body.Body ? req.body.Body.trim().toLowerCase() : '';
    
    if (incomingMessage.startsWith('eta')) {
      // Expected format: ETA <Stop Name>
      twiml.message('Smart Bus Companion: Your bus is arriving shortly.');
    } else if (incomingMessage.startsWith('route')) {
      twiml.message('Smart Bus Companion: Route details sent. Visit aictsl.com for more info.');
    } else {
      twiml.message('Welcome to Smart Bus Companion. Reply ETA <Stop> or ROUTE <No> for info.');
    }
  } catch (err) {
    console.error('SMS Webhook Error:', err);
    twiml.message('Sorry, we could not process your request at this time.');
  }

  res.type('text/xml').send(twiml.toString());
});

module.exports = router;

// style updates
