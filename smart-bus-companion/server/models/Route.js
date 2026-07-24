const mongoose = require('mongoose');

const routeSchema = new mongoose.Schema({
  routeNumber: { type: String, required: true },
  name: { type: String, required: true },
  stops: [{
    stopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Stop', required: true },
    order: { type: Number, required: true },
    distanceFromStartKm: { type: Number, required: true }
  }],
  baseFare: { type: Number, required: true, default: 5 },
  farePerKm: { type: Number, required: true, default: 1.5 },
  firstBusTime: { type: String, required: true }, // e.g. "06:00"
  lastBusTime: { type: String, required: true },  // e.g. "22:00"
  frequencyMinutes: { type: Number, required: true },
  isWheelchairAccessible: { type: Boolean, default: false },
  colorHex: { type: String, default: '#10315B' } // Route corridor color

});

module.exports = mongoose.model('Route', routeSchema);
