const mongoose = require('mongoose');

const stopSchema = new mongoose.Schema({
  name: { type: String, required: true },
  city: { type: String, default: 'Indore' },
  location: {
    type: { type: String, enum: ['Point'], required: true },
    coordinates: { type: [Number], required: true } // [longitude, latitude]
  }
});

stopSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Stop', stopSchema);
