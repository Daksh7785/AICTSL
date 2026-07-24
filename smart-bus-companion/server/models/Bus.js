const mongoose = require('mongoose');

const busSchema = new mongoose.Schema({
  busNumber: { type: String, required: [true, 'Bus number is required'] },
  routeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Route', required: [true, 'Route ID is required'] },
  frequencyMinutes: { type: Number }, // Denormalized for simulator performance
  isWheelchairAccessible: { type: Boolean }, // Denormalized for simulator performance
  currentPosition: {
    type: { 
      type: String, 
      enum: { values: ['Point'], message: '{VALUE} is not supported' },
      required: [true, 'Location type must be Point'] 
    },
    coordinates: { 
      type: [Number], 
      required: [true, 'Coordinates [lng, lat] are required'] 
    }
  },
  status: { 
    type: String, 
    enum: {
      values: ['running', 'delayed', 'out_of_service'],
      message: '{VALUE} is not a valid status'
    },
    default: 'running' 
  },
  mileageKm: { type: Number, default: 0 },
  lastMaintenanceDate: { type: Date, default: Date.now },
  lastUpdated: { type: Date, default: Date.now }
});

busSchema.index({ currentPosition: '2dsphere' });

busSchema.pre('save', async function(next) {
  if (this.isNew || this.isModified('routeId')) {
    const Route = mongoose.model('Route');
    const route = await Route.findById(this.routeId);
    if (!route || route.deletedAt) {
      return next(new Error(`Validation Error: Route with ID ${this.routeId} does not exist.`));
    }
    this.frequencyMinutes = route.frequencyMinutes;
    this.isWheelchairAccessible = route.isWheelchairAccessible;
  }
  next();
});

module.exports = mongoose.model('Bus', busSchema);

// style updates
