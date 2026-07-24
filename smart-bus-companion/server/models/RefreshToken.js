const mongoose = require('mongoose');

const refreshTokenSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: [true, 'User ID is required for refresh token'] 
  },
  token: { type: String, required: [true, 'Token string is required'], unique: true },
  expiresAt: { type: Date, required: [true, 'Expiration date is required'] }
});

// TTL index to automatically remove expired tokens
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('RefreshToken', refreshTokenSchema);
