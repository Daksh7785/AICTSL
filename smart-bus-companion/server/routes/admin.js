const express = require('express');
const router = express.Router();
const { auth, isAdmin } = require('../middleware/auth');
const Bus = require('../models/Bus');
const Route = require('../models/Route');
const Complaint = require('../models/Complaint');
const User = require('../models/User');
const { cacheMiddleware } = require('../utils/logger'); // Assuming cache might be somewhere here or not needed if real-time

// GET /api/admin/stats - Overview metrics
router.get('/stats', [auth, isAdmin], async (req, res, next) => {
  try {
    const [
      totalRoutes,
      activeBuses,
      totalUsers,
      openComplaints,
      resolvedComplaints,
      busesNeedingMaintenance
    ] = await Promise.all([
      Route.countDocuments(),
      Bus.countDocuments({ status: { $in: ['running', 'delayed'] } }), // Example active statuses
      User.countDocuments(),
      Complaint.countDocuments({ status: { $in: ['open', 'in_review'] } }),
      Complaint.countDocuments({ status: 'resolved' }),
      // Maintenance condition: > 50,000 km or last maintenance > 180 days ago
      Bus.countDocuments({
        $or: [
          { mileageKm: { $gt: 50000 } },
          { lastMaintenanceDate: { $lt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000) } }
        ]
      })
    ]);

    res.json({
      totalRoutes,
      activeBuses,
      totalUsers,
      openComplaints,
      resolvedComplaints,
      busesNeedingMaintenance
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/admin/complaints - List paginated complaints
router.get('/complaints', [auth, isAdmin], async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const query = {};
    if (req.query.status) query.status = req.query.status;

    const complaints = await Complaint.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'name email')
      .populate('routeId', 'routeNumber name')
      .lean();

    const total = await Complaint.countDocuments(query);

    res.json({
      complaints,
      total,
      page,
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/admin/complaints/:id/status - Update complaint status
router.patch('/complaints/:id/status', [auth, isAdmin], async (req, res, next) => {
  try {
    const { status, adminNotes } = req.body;
    if (!['open', 'in_review', 'resolved', 'dismissed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { $set: { status, adminNotes, updatedAt: Date.now() } },
      { new: true, runValidators: true }
    );

    if (!complaint) return res.status(404).json({ error: 'Complaint not found' });
    res.json(complaint);
  } catch (error) {
    next(error);
  }
});

const { getSurgeConfig, updateSurgeConfig } = require('../services/surgeManager');

// POST /api/admin/surge - Update Surge Config
router.post('/surge', [auth, isAdmin], (req, res, next) => {
  try {
    const { isActive, message, multiplier } = req.body;
    const newConfig = updateSurgeConfig({
      isActive: isActive !== undefined ? isActive : undefined,
      message: message !== undefined ? message : undefined,
      multiplier: multiplier !== undefined ? multiplier : undefined
    });
    
    // Broadcast surge config update to all connected clients
    req.app.get('io').emit('surgeUpdate', newConfig);

    res.json(newConfig);
  } catch (error) {
    next(error);
  }
});

const Stop = require('../models/Stop');

// ==========================================
// STOPS MANAGEMENT
// ==========================================

// POST /api/admin/stops - Create a new stop
router.post('/stops', [auth, isAdmin], async (req, res, next) => {
  try {
    const stop = new Stop({
      ...req.body,
      createdBy: req.user.id
    });
    await stop.save();
    res.status(201).json(stop);
  } catch (error) {
    next(error);
  }
});

// PUT /api/admin/stops/:id - Update an existing stop
router.put('/stops/:id', [auth, isAdmin], async (req, res, next) => {
  try {
    const stop = await Stop.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedBy: req.user.id },
      { new: true, runValidators: true }
    );
    if (!stop) return res.status(404).json({ error: 'Stop not found' });
    res.json(stop);
  } catch (error) {
    next(error);
  }
});

// ==========================================
// ROUTES MANAGEMENT
// ==========================================

// POST /api/admin/routes - Create a new route
router.post('/routes', [auth, isAdmin], async (req, res, next) => {
  try {
    const route = new Route({
      ...req.body,
      createdBy: req.user.id
    });
    await route.save();
    res.status(201).json(route);
  } catch (error) {
    next(error);
  }
});

// PUT /api/admin/routes/:id - Update an existing route
router.put('/routes/:id', [auth, isAdmin], async (req, res, next) => {
  try {
    const route = await Route.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedBy: req.user.id },
      { new: true, runValidators: true }
    );
    if (!route) return res.status(404).json({ error: 'Route not found' });
    res.json(route);
  } catch (error) {
    next(error);
  }
});

// ==========================================
// BUSES MANAGEMENT
// ==========================================

// GET /api/admin/buses - List all buses
router.get('/buses', [auth, isAdmin], async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const query = {};
    if (req.query.status) query.status = req.query.status;
    if (req.query.routeId) query.routeId = req.query.routeId;

    const buses = await Bus.find(query)
      .sort({ busNumber: 1 })
      .skip(skip)
      .limit(limit)
      .populate('routeId', 'routeNumber name')
      .lean();

    const total = await Bus.countDocuments(query);
    res.json({ buses, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    next(error);
  }
});

// POST /api/admin/buses - Register a new bus
router.post('/buses', [auth, isAdmin], async (req, res, next) => {
  try {
    const bus = new Bus(req.body);
    await bus.save();
    res.status(201).json(bus);
  } catch (error) {
    next(error);
  }
});

// PUT /api/admin/buses/:id - Update bus details
router.put('/buses/:id', [auth, isAdmin], async (req, res, next) => {
  try {
    const bus = await Bus.findByIdAndUpdate(
      req.params.id,
      { ...req.body, lastUpdated: Date.now() },
      { new: true, runValidators: true }
    );
    if (!bus) return res.status(404).json({ error: 'Bus not found' });
    res.json(bus);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/admin/buses/:id - Delete a bus
router.delete('/buses/:id', [auth, isAdmin], async (req, res, next) => {
  try {
    const bus = await Bus.findByIdAndDelete(req.params.id);
    if (!bus) return res.status(404).json({ error: 'Bus not found' });
    res.json({ message: 'Bus deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// ==========================================
// USERS MANAGEMENT
// ==========================================

// GET /api/admin/users - List all registered users
router.get('/users', [auth, isAdmin], async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const query = { deletedAt: null };
    if (req.query.role) query.role = req.query.role;

    const users = await User.find(query)
      .select('-passwordHash -resetPasswordToken')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await User.countDocuments(query);
    res.json({ users, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    next(error);
  }
});

// PUT /api/admin/users/:id/role - Update user role
router.put('/users/:id/role', [auth, isAdmin], async (req, res, next) => {
  try {
    if (!['commuter', 'admin'].includes(req.body.role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role: req.body.role },
      { new: true, runValidators: true }
    ).select('-passwordHash');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/admin/users/:id - Delete a user
router.delete('/users/:id', [auth, isAdmin], async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    if (user._id.toString() === req.user.id) {
      return res.status(403).json({ error: 'Cannot delete yourself' });
    }

    user.deletedAt = new Date();
    await user.save();
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
