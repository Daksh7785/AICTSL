const mongoose = require('mongoose');

const stopSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Stop name is required'] },
  city: { type: String, default: 'Indore' },
  location: {
    type: { 
      type: String, 
      enum: { values: ['Point'], message: '{VALUE} is not supported' },
      required: [true, 'Location type must be Point'] 
    },
    coordinates: { 
      type: [Number], 
      required: [true, 'Coordinates [lng, lat] are required'] 
    } // [longitude, latitude]
  },
  deletedAt: { type: Date, default: null },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

stopSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Stop', stopSchema);
