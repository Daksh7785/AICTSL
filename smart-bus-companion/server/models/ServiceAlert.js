const mongoose = require('mongoose');

const serviceAlertSchema = new mongoose.Schema({
  routeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Route', default: null }, // null means system-wide
  message: { type: String, required: [true, 'Alert message is required'] },
  severity: { 
    type: String, 
    enum: {
      values: ['info', 'warning', 'critical'],
      message: '{VALUE} is not a valid severity'
    },
    required: [true, 'Severity is required'] 
  },
  active: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

serviceAlertSchema.pre('save', async function(next) {
  if (this.routeId && (this.isNew || this.isModified('routeId'))) {
    const Route = mongoose.model('Route');
    const route = await Route.findById(this.routeId);
    if (!route || route.deletedAt) {
      return next(new Error(`Validation Error: Route with ID ${this.routeId} does not exist.`));
    }
  }
  next();
});

module.exports = mongoose.model('ServiceAlert', serviceAlertSchema);
