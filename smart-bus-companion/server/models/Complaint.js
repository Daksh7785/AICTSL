const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  routeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Route', required: [true, 'A complaint must reference a valid route'] },
  routeNumber: { type: String }, // Denormalized for efficient admin views
  routeName: { type: String },   // Denormalized for efficient admin views
  category: { 
    type: String, 
    enum: {
      values: ['delay', 'cleanliness', 'driver_behavior', 'overcrowding', 'other'],
      message: '{VALUE} is not a supported category'
    },
    required: [true, 'Complaint category is required'] 
  },
  description: { type: String, required: [true, 'Complaint description is required'] },
  rating: { type: Number, min: [1, 'Rating must be at least 1'], max: [5, 'Rating cannot exceed 5'], required: [true, 'Rating is required'] },
  referenceId: { type: String, required: [true, 'Reference ID is required'], unique: true },
  status: { 
    type: String, 
    enum: {
      values: ['open', 'in_review', 'resolved'],
      message: '{VALUE} is not a valid status'
    },
    default: 'open' 
  },
  statusHistory: [{
    status: { type: String },
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    changedAt: { type: Date, default: Date.now }
  }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

complaintSchema.index({ referenceId: 1 });
complaintSchema.index({ status: 1, category: 1 });

complaintSchema.pre('save', async function(next) {
  if (this.isNew || this.isModified('routeId')) {
    const Route = mongoose.model('Route');
    const route = await Route.findById(this.routeId);
    if (!route || route.deletedAt) {
      return next(new Error(`Validation Error: Route with ID ${this.routeId} does not exist.`));
    }
    // Denormalize route details
    this.routeNumber = route.routeNumber;
    this.routeName = route.name;
  }
  next();
});

module.exports = mongoose.model('Complaint', complaintSchema);
