const mongoose = require('mongoose');

const arrivalLogSchema = new mongoose.Schema({
  busId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bus',
    required: [true, 'Bus ID is required']
  },
  routeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Route',
    required: [true, 'Route ID is required']
  },
  stopId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Stop',
    required: [true, 'Stop ID is required']
  },
  scheduledTime: {
    type: Date,
    required: [true, 'Scheduled time is required']
  },
  actualTime: {
    type: Date,
    required: [true, 'Actual time is required']
  },
  dayOfWeek: {
    type: Number, // 0 = Sunday, 1 = Monday, etc.
    min: [0, 'Day of week must be between 0 and 6'],
    max: [6, 'Day of week must be between 0 and 6'],
    required: [true, 'Day of week is required']
  },
  hourOfDay: {
    type: Number, // 0-23
    min: [0, 'Hour must be between 0 and 23'],
    max: [23, 'Hour must be between 0 and 23'],
    required: [true, 'Hour of day is required']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient querying by ETA predictor
arrivalLogSchema.index({ routeId: 1, stopId: 1, dayOfWeek: 1, hourOfDay: 1 });

module.exports = mongoose.model('ArrivalLog', arrivalLogSchema);
