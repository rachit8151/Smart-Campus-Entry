const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  regId: {
    type: Number,
    required: true,
    unique: true
  },
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  phone: {
    type: String
  },
  roleId: {
    type: Number,
    required: true
  },
  status: {
    type: Boolean,
    default: false  // false => must change password on first login
  },
  isActive: {
    type: Boolean,
    default: true   // true = allowed to login
  },
  failedAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: {
    type: Date,
    default: null
  }
}, {
  collection: 'tblRegistration',
  timestamps: true
});

module.exports = mongoose.model('User', UserSchema);
