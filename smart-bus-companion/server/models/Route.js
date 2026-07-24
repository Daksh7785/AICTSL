const mongoose = require('mongoose');

const routeSchema = new mongoose.Schema({
  routeNumber: { type: String, required: [true, 'Route number is required'] },
  name: { type: String, required: [true, 'Route name is required'] },
  stops: [{
    stopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Stop', required: [true, 'Stop ID is required'] },
    order: { type: Number, required: [true, 'Stop order is required'], min: [0, 'Order must be non-negative'] },
    distanceFromStartKm: { type: Number, required: [true, 'Distance from start is required'], min: [0, 'Distance cannot be negative'] }
  }],
  baseFare: { type: Number, required: [true, 'Base fare is required'], default: 5, min: [0, 'Base fare cannot be negative'] },
  farePerKm: { type: Number, required: [true, 'Fare per km is required'], default: 1.5, min: [0, 'Fare per km cannot be negative'] },
  firstBusTime: { 
    type: String, 
    required: [true, 'First bus time is required'],
    validate: {
      validator: function(v) { return /^([01]\d|2[0-3]):([0-5]\d)$/.test(v); },
      message: props => `${props.value} is not a valid time format (HH:MM)!`
    }
  }, // e.g. "06:00"
  lastBusTime: { 
    type: String, 
    required: [true, 'Last bus time is required'],
    validate: {
      validator: function(v) { return /^([01]\d|2[0-3]):([0-5]\d)$/.test(v); },
      message: props => `${props.value} is not a valid time format (HH:MM)!`
    }
  },  // e.g. "22:00"
  frequencyMinutes: { type: Number, required: [true, 'Frequency is required'], min: [1, 'Frequency must be at least 1 minute'] },
  isWheelchairAccessible: { type: Boolean, default: false },
  colorHex: { type: String, default: '#10315B' }, // Route corridor color
  deletedAt: { type: Date, default: null },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

routeSchema.index({ 'stops.stopId': 1 });
routeSchema.index({ routeNumber: 1 });

routeSchema.pre('save', async function(next) {
  if (this.isModified('stops')) {
    const Stop = mongoose.model('Stop');
    for (const stop of this.stops) {
      const stopExists = await Stop.exists({ _id: stop.stopId, deletedAt: null });
      if (!stopExists) {
        return next(new Error(`Validation Error: Stop with ID ${stop.stopId} does not exist or has been deleted.`));
      }
    }
  }
  next();
});

module.exports = mongoose.model('Route', routeSchema);

// style updates
