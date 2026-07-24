const mongoose = require('mongoose');

const busSchema = new mongoose.Schema({
  busNumber: { type: String, required: true },
  routeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Route', required: true },
  currentPosition: {
    type: { type: String, enum: ['Point'], required: true },
    coordinates: { type: [Number], required: true }
  },
  status: { type: String, enum: ['running', 'delayed', 'out_of_service'], default: 'running' },
  lastUpdated: { type: Date, default: Date.now }
});

busSchema.index({ currentPosition: '2dsphere' });

module.exports = mongoose.model('Bus', busSchema);
