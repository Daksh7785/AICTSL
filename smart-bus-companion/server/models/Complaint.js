const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  routeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Route', required: true },
  category: { 
    type: String, 
    enum: ['delay', 'cleanliness', 'driver_behavior', 'overcrowding', 'other'], 
    required: true 
  },
  description: { type: String, required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  referenceId: { type: String, required: true, unique: true },
  status: { type: String, enum: ['open', 'in_review', 'resolved'], default: 'open' },
  createdAt: { type: Date, default: Date.now }
});

complaintSchema.index({ referenceId: 1 });
complaintSchema.index({ status: 1, category: 1 });

module.exports = mongoose.model('Complaint', complaintSchema);
