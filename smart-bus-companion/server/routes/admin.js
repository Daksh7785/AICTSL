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

module.exports = router;
