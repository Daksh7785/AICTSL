const mongoose = require('mongoose');

const serviceAlertSchema = new mongoose.Schema({
  routeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Route', default: null }, // null means system-wide
  message: { type: String, required: true },
  severity: { type: String, enum: ['info', 'warning', 'critical'], required: true },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ServiceAlert', serviceAlertSchema);
