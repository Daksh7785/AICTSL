const mongoose = require('mongoose');

const arrivalLogSchema = new mongoose.Schema({
  busId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bus',
    required: true
  },
  routeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Route',
    required: true
  },
  stopId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Stop',
    required: true
  },
  scheduledTime: {
    type: Date,
    required: true
  },
  actualTime: {
    type: Date,
    required: true
  },
  dayOfWeek: {
    type: Number, // 0 = Sunday, 1 = Monday, etc.
    required: true
  },
  hourOfDay: {
    type: Number, // 0-23
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient querying by ETA predictor
arrivalLogSchema.index({ routeId: 1, stopId: 1, dayOfWeek: 1, hourOfDay: 1 });

module.exports = mongoose.model('ArrivalLog', arrivalLogSchema);
