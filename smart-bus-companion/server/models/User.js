const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Name is required'] },
  email: { 
    type: String, 
    required: [true, 'Email is required'], 
    unique: true,
    validate: {
      validator: function(v) { return /^\S+@\S+\.\S+$/.test(v); },
      message: props => `${props.value} is not a valid email address!`
    }
  },
  passwordHash: { type: String, required: [true, 'Password is required'] },
  role: { 
    type: String, 
    enum: {
      values: ['commuter', 'admin'],
      message: '{VALUE} is not a valid role'
    },
    default: 'commuter' 
  },
  preferredLanguage: { 
    type: String, 
    enum: {
      values: ['en', 'hi'],
      message: '{VALUE} is not a supported language'
    },
    default: 'en' 
  },
  isVerified: { type: Boolean, default: false },
  verificationToken: String,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  deletedAt: { type: Date, default: null }
});

module.exports = mongoose.model('User', userSchema);

// style updates
